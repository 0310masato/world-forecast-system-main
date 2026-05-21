import https from 'https';

// Persistent memory cache for fallback in case APIs are rate-limited or offline
const apiCache: Record<string, number> = {
  BTC: 77694.0,
  BTC_change24h: 2.45,
  USD_JPY: 159.00,
  USD_JPY_change24h: -0.82,
  Gold: 4530.6,
  Gold_change24h: 0.15,
  Crude_Oil: 99.29,
  Crude_Oil_change24h: 4.12,
  SP500: 7432.97,
  SP500_change24h: -0.22
};

function httpsGet(url: string, headers: Record<string, string> = {}): Promise<string> {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        ...headers
      },
      timeout: 8000 // 8 second timeout
    };

    https.get(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data);
        } else {
          reject(new Error(`HTTP status code ${res.statusCode}`));
        }
      });
    }).on('error', (err) => {
      reject(err);
    }).on('timeout', () => {
      reject(new Error('Request timeout'));
    });
  });
}

/**
 * Fetch BTC price from CoinGecko
 */
export async function fetchBtcPrice(): Promise<{ price: number, change24h: number }> {
  try {
    const data = await httpsGet('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true');
    const json = JSON.parse(data);
    if (json.bitcoin && json.bitcoin.usd) {
      const price = json.bitcoin.usd;
      const change24h = json.bitcoin.usd_24h_change || 0.0;
      apiCache.BTC = price;
      apiCache.BTC_change24h = change24h;
      return { price, change24h };
    }
    throw new Error('Invalid CoinGecko response structure');
  } catch (err: any) {
    console.warn(`CoinGecko BTC Fetch failed: ${err.message}. Using cache: ${apiCache.BTC}`);
    return { price: apiCache.BTC, change24h: apiCache.BTC_change24h || 2.45 };
  }
}

/**
 * Fetch Yahoo Finance price for stocks, commodities, currencies
 */
export async function fetchYahooFinancePrice(symbol: string, cacheKey: string): Promise<{ price: number, change24h: number }> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1m&range=2m`;
    const data = await httpsGet(url);
    const json = JSON.parse(data);
    const result = json?.chart?.result?.[0];
    if (result && result.meta && result.meta.regularMarketPrice !== undefined) {
      const price = result.meta.regularMarketPrice;
      const prevClose = result.meta.previousClose;
      const change24h = prevClose ? ((price - prevClose) / prevClose) * 100 : 0.0;
      apiCache[cacheKey] = price;
      apiCache[`${cacheKey}_change24h`] = change24h;
      return { price, change24h };
    }
    throw new Error(`Invalid Yahoo Finance response for ${symbol}`);
  } catch (err: any) {
    console.warn(`Yahoo Finance Fetch failed for ${symbol}: ${err.message}. Using cache: ${apiCache[cacheKey]}`);
    return { price: apiCache[cacheKey], change24h: apiCache[`${cacheKey}_change24h`] || 0.0 };
  }
}

export interface EarthquakeInfo {
  id: string;
  mag: number;
  place: string;
  time: number;
  lat: number;
  lng: number;
}

/**
 * Fetch USGS Earthquake Feed (Past 1 hour)
 */
export async function fetchEarthquakes(): Promise<EarthquakeInfo[]> {
  try {
    const url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson';
    const data = await httpsGet(url);
    const json = JSON.parse(data);
    if (!json.features) return [];
    
    return json.features.map((feat: any) => {
      const coords = feat.geometry?.coordinates || [0, 0, 0];
      return {
        id: feat.id,
        mag: feat.properties?.mag || 0,
        place: feat.properties?.place || 'Unknown Location',
        time: feat.properties?.time || Date.now(),
        lat: coords[1],
        lng: coords[0]
      };
    });
  } catch (err: any) {
    console.warn(`USGS Earthquake Fetch failed: ${err.message}`);
    return [];
  }
}

/**
 * Fetch all financial and crypto prices in parallel
 */
export async function fetchAllPrices(): Promise<{
  prices: Record<string, number>;
  changes24h: Record<string, number>;
}> {
  const [btc, usdJpy, gold, oil, sp500] = await Promise.all([
    fetchBtcPrice(),
    fetchYahooFinancePrice('JPY=X', 'USD_JPY'),
    fetchYahooFinancePrice('GC=F', 'Gold'),
    fetchYahooFinancePrice('CL=F', 'Crude_Oil'),
    fetchYahooFinancePrice('^GSPC', 'SP500')
  ]);

  return {
    prices: {
      BTC: btc.price,
      USD_JPY: usdJpy.price,
      Gold: gold.price,
      Crude_Oil: oil.price,
      SP500: sp500.price
    },
    changes24h: {
      BTC: btc.change24h,
      USD_JPY: usdJpy.change24h,
      Gold: gold.change24h,
      Crude_Oil: oil.change24h,
      SP500: sp500.change24h
    }
  };
}

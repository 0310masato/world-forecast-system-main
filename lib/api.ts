import https from 'https';

// Persistent memory cache for fallback in case APIs are rate-limited or offline
const apiCache: Record<string, number> = {
  BTC: 77694.0,
  USD_JPY: 159.00,
  Gold: 4530.6,
  Crude_Oil: 99.29,
  SP500: 7432.97
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
export async function fetchBtcPrice(): Promise<number> {
  try {
    const data = await httpsGet('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
    const json = JSON.parse(data);
    if (json.bitcoin && json.bitcoin.usd) {
      const price = json.bitcoin.usd;
      apiCache.BTC = price;
      return price;
    }
    throw new Error('Invalid CoinGecko response structure');
  } catch (err: any) {
    console.warn(`CoinGecko BTC Fetch failed: ${err.message}. Using cache: ${apiCache.BTC}`);
    return apiCache.BTC;
  }
}

/**
 * Fetch Yahoo Finance price for stocks, commodities, currencies
 */
export async function fetchYahooFinancePrice(symbol: string, cacheKey: string): Promise<number> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1m&range=2m`;
    const data = await httpsGet(url);
    const json = JSON.parse(data);
    const result = json?.chart?.result?.[0];
    if (result && result.meta && result.meta.regularMarketPrice !== undefined) {
      const price = result.meta.regularMarketPrice;
      apiCache[cacheKey] = price;
      return price;
    }
    throw new Error(`Invalid Yahoo Finance response for ${symbol}`);
  } catch (err: any) {
    console.warn(`Yahoo Finance Fetch failed for ${symbol}: ${err.message}. Using cache: ${apiCache[cacheKey]}`);
    return apiCache[cacheKey];
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
export async function fetchAllPrices(): Promise<Record<string, number>> {
  const [btc, usdJpy, gold, oil, sp500] = await Promise.all([
    fetchBtcPrice(),
    fetchYahooFinancePrice('JPY=X', 'USD_JPY'),
    fetchYahooFinancePrice('GC=F', 'Gold'),
    fetchYahooFinancePrice('CL=F', 'Crude_Oil'),
    fetchYahooFinancePrice('^GSPC', 'SP500')
  ]);

  return {
    BTC: btc,
    USD_JPY: usdJpy,
    Gold: gold,
    Crude_Oil: oil,
    SP500: sp500
  };
}

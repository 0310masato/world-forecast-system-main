import https from 'https';

export interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  relatedAsset?: string;
  lat: number;
  lng: number;
  genre: 'macro' | 'geopolitics' | 'commodity' | 'local';
  region: 'north_america' | 'asia_japan' | 'europe' | 'middle_east' | 'other';
  summary?: string[];
  marketImpact?: {
    asset: string;
    direction: 'UP' | 'DOWN' | 'FLAT';
    impactDegree: 'L' | 'M' | 'H' | 'VH';
    predictedChange: string;
  };
}

// Coordinates for target assets
const ASSETS_MAP: Record<string, { lat: number; lng: number }> = {
  BTC: { lat: 51.5074, lng: -0.1278 }, // London node
  USD_JPY: { lat: 35.6762, lng: 139.6503 }, // Tokyo
  SP500: { lat: 40.7128, lng: -74.0060 }, // New York
  Crude_Oil: { lat: 24.7136, lng: 46.6753 }, // Riyadh
  Gold: { lat: -26.2041, lng: 28.0473 } // Johannesburg
};

// Regional Coordinates mapping for geographic specificity
const REGIONAL_COORDS: Record<string, { lat: number; lng: number; region: 'north_america' | 'asia_japan' | 'europe' | 'middle_east' | 'other' }> = {
  'カリフォルニア': { lat: 34.0522, lng: -118.2437, region: 'north_america' },
  'ロサンゼルス': { lat: 34.0522, lng: -118.2437, region: 'north_america' },
  'ニューヨーク': { lat: 40.7128, lng: -74.0060, region: 'north_america' },
  'ワシントン': { lat: 38.9072, lng: -77.0369, region: 'north_america' },
  'シカゴ': { lat: 41.8781, lng: -87.6298, region: 'north_america' },
  'テキサス': { lat: 31.9686, lng: -99.9018, region: 'north_america' },
  '日本': { lat: 35.6762, lng: 139.6503, region: 'asia_japan' },
  '東京': { lat: 35.6762, lng: 139.6503, region: 'asia_japan' },
  '沖縄': { lat: 26.2124, lng: 127.6809, region: 'asia_japan' },
  '北海道': { lat: 43.0621, lng: 141.3544, region: 'asia_japan' },
  '中国': { lat: 39.9042, lng: 116.4074, region: 'asia_japan' },
  '北京': { lat: 39.9042, lng: 116.4074, region: 'asia_japan' },
  '上海': { lat: 31.2304, lng: 121.4737, region: 'asia_japan' },
  '香港': { lat: 22.3193, lng: 114.1694, region: 'asia_japan' },
  '台湾': { lat: 25.0330, lng: 121.5654, region: 'asia_japan' },
  '台北': { lat: 25.0330, lng: 121.5654, region: 'asia_japan' },
  'シンガポール': { lat: 1.3521, lng: 103.8198, region: 'asia_japan' },
  'インドネシア': { lat: -6.2088, lng: 106.8456, region: 'asia_japan' },
  'ジャカルタ': { lat: -6.2088, lng: 106.8456, region: 'asia_japan' },
  '韓国': { lat: 37.5665, lng: 126.9780, region: 'asia_japan' },
  'ソウル': { lat: 37.5665, lng: 126.9780, region: 'asia_japan' },
  'ロンドン': { lat: 51.5074, lng: -0.1278, region: 'europe' },
  '英国': { lat: 51.5074, lng: -0.1278, region: 'europe' },
  'フランス': { lat: 48.8566, lng: 2.3522, region: 'europe' },
  'パリ': { lat: 48.8566, lng: 2.3522, region: 'europe' },
  'ドイツ': { lat: 52.5200, lng: 13.4050, region: 'europe' },
  'ベルリン': { lat: 52.5200, lng: 13.4050, region: 'europe' },
  'フランクフルト': { lat: 50.1109, lng: 8.6821, region: 'europe' },
  'スイス': { lat: 46.8182, lng: 8.2275, region: 'europe' },
  'ジュネーブ': { lat: 46.2044, lng: 6.1432, region: 'europe' },
  'チューリッヒ': { lat: 47.3769, lng: 8.5417, region: 'europe' },
  'ウクライナ': { lat: 50.4501, lng: 30.5234, region: 'europe' },
  'キエフ': { lat: 50.4501, lng: 30.5234, region: 'europe' },
  'ロシア': { lat: 55.7558, lng: 37.6173, region: 'europe' },
  'モスクワ': { lat: 55.7558, lng: 37.6173, region: 'europe' },
  '中東': { lat: 29.3117, lng: 47.4818, region: 'middle_east' },
  'イスラエル': { lat: 31.7683, lng: 35.2137, region: 'middle_east' },
  'イラン': { lat: 35.6892, lng: 51.3890, region: 'middle_east' },
  'サウジ': { lat: 24.7136, lng: 46.6753, region: 'middle_east' },
  'リヤド': { lat: 24.7136, lng: 46.6753, region: 'middle_east' },
  'ドバイ': { lat: 25.2048, lng: 55.2708, region: 'middle_east' },
  '南アフリカ': { lat: -26.2041, lng: 28.0473, region: 'other' },
  'ヨハネスブルグ': { lat: -26.2041, lng: 28.0473, region: 'other' },
  '豪州': { lat: -33.8688, lng: 151.2093, region: 'other' },
  'オーストラリア': { lat: -33.8688, lng: 151.2093, region: 'other' },
  'シドニー': { lat: -33.8688, lng: 151.2093, region: 'other' }
};

// Global financial centers for non-asset specific news
const GLOBAL_CITIES = [
  { name: 'Frankfurt', lat: 50.1109, lng: 8.6821, region: 'europe' as const },
  { name: 'Singapore', lat: 1.3521, lng: 103.8198, region: 'asia_japan' as const },
  { name: 'Shanghai', lat: 31.2304, lng: 121.4737, region: 'asia_japan' as const },
  { name: 'Sydney', lat: -33.8688, lng: 151.2093, region: 'other' as const },
  { name: 'Zurich', lat: 47.3769, lng: 8.5417, region: 'europe' as const },
  { name: 'Hong Kong', lat: 22.3193, lng: 114.1694, region: 'asia_japan' as const },
  { name: 'Paris', lat: 48.8566, lng: 2.3522, region: 'europe' as const },
  { name: 'Geneva', lat: 46.2044, lng: 6.1432, region: 'europe' as const }
];

export function assignGenre(title: string): 'macro' | 'geopolitics' | 'commodity' | 'local' {
  const lowerTitle = title.toLowerCase();

  // 1. Commodity & Energy
  if (
    lowerTitle.includes('oil') ||
    lowerTitle.includes('crude') ||
    lowerTitle.includes('opec') ||
    lowerTitle.includes('petroleum') ||
    lowerTitle.includes('gold') ||
    lowerTitle.includes('commodity') ||
    lowerTitle.includes('wheat') ||
    lowerTitle.includes('grain') ||
    lowerTitle.includes('supply shock') ||
    lowerTitle.includes('原油') ||
    lowerTitle.includes('石油') ||
    lowerTitle.includes('金') ||
    lowerTitle.includes('ゴールド') ||
    lowerTitle.includes('コモディティ') ||
    lowerTitle.includes('穀物') ||
    lowerTitle.includes('小麦') ||
    lowerTitle.includes('供給リスク') ||
    lowerTitle.includes('油田') ||
    lowerTitle.includes('鉱山')
  ) {
    return 'commodity';
  }

  // 2. Geopolitics & Conflict
  if (
    lowerTitle.includes('hormuz') ||
    lowerTitle.includes('strait') ||
    lowerTitle.includes('war') ||
    lowerTitle.includes('conflict') ||
    lowerTitle.includes('military') ||
    lowerTitle.includes('missile') ||
    lowerTitle.includes('attack') ||
    lowerTitle.includes('clash') ||
    lowerTitle.includes('geopolitics') ||
    lowerTitle.includes('tension') ||
    lowerTitle.includes('sanction') ||
    lowerTitle.includes('treaty') ||
    lowerTitle.includes('border') ||
    lowerTitle.includes('diplomat') ||
    lowerTitle.includes('ホルムズ海峡') ||
    lowerTitle.includes('ホルムズ') ||
    lowerTitle.includes('海峡') ||
    lowerTitle.includes('戦争') ||
    lowerTitle.includes('紛争') ||
    lowerTitle.includes('衝突') ||
    lowerTitle.includes('軍事') ||
    lowerTitle.includes('空爆') ||
    lowerTitle.includes('ミサイル') ||
    lowerTitle.includes('地政学') ||
    lowerTitle.includes('緊張') ||
    lowerTitle.includes('制裁') ||
    lowerTitle.includes('条約') ||
    lowerTitle.includes('外交') ||
    lowerTitle.includes('国境') ||
    lowerTitle.includes('安全保障') ||
    lowerTitle.includes('中東') ||
    lowerTitle.includes('ウクライナ') ||
    lowerTitle.includes('ロシア') ||
    lowerTitle.includes('拿捕') ||
    lowerTitle.includes('防衛')
  ) {
    return 'geopolitics';
  }

  // 3. Macro Economy
  if (
    lowerTitle.includes('fed') ||
    lowerTitle.includes('boj') ||
    lowerTitle.includes('ecb') ||
    lowerTitle.includes('rate') ||
    lowerTitle.includes('gdp') ||
    lowerTitle.includes('inflation') ||
    lowerTitle.includes('cpi') ||
    lowerTitle.includes('unemployment') ||
    lowerTitle.includes('interest') ||
    lowerTitle.includes('central bank') ||
    lowerTitle.includes('fomc') ||
    lowerTitle.includes('金利') ||
    lowerTitle.includes('政策金利') ||
    lowerTitle.includes('中央銀行') ||
    lowerTitle.includes('日銀') ||
    lowerTitle.includes('米連邦') ||
    lowerTitle.includes('インフレ') ||
    lowerTitle.includes('物価') ||
    lowerTitle.includes('雇用統計') ||
    lowerTitle.includes('失業率') ||
    lowerTitle.includes('小売売上高') ||
    lowerTitle.includes('景気') ||
    lowerTitle.includes('為替') ||
    lowerTitle.includes('ドル円') ||
    lowerTitle.includes('円高') ||
    lowerTitle.includes('円安')
  ) {
    return 'macro';
  }

  // 4. Local Intelligence (including technology, epidemics, local alerts)
  return 'local';
}

function assignRegion(lat: number, lng: number, title: string): 'north_america' | 'asia_japan' | 'europe' | 'middle_east' | 'other' {
  const lowerTitle = title.toLowerCase();

  if (
    lowerTitle.includes('japan') || 
    lowerTitle.includes('tokyo') || 
    lowerTitle.includes('boj') || 
    lowerTitle.includes('nikkei') || 
    lowerTitle.includes('日本') || 
    lowerTitle.includes('東京') || 
    lowerTitle.includes('沖縄') || 
    lowerTitle.includes('北海道') || 
    lowerTitle.includes('日銀') || 
    lowerTitle.includes('日経') || 
    lowerTitle.includes('台湾') || 
    lowerTitle.includes('taiwan') || 
    lowerTitle.includes('china') || 
    lowerTitle.includes('中国') || 
    lowerTitle.includes('shanghai') || 
    lowerTitle.includes('上海') || 
    lowerTitle.includes('hong kong') || 
    lowerTitle.includes('香港') || 
    lowerTitle.includes('singapore') || 
    lowerTitle.includes('シンガポール') || 
    lowerTitle.includes('indonesia') || 
    lowerTitle.includes('インドネシア') ||
    lowerTitle.includes('韓国') ||
    lowerTitle.includes('ソウル') ||
    lowerTitle.includes('東アジア')
  ) {
    return 'asia_japan';
  }
  if (
    lowerTitle.includes('us') || 
    lowerTitle.includes('fed') || 
    lowerTitle.includes('ny') || 
    lowerTitle.includes('new york') || 
    lowerTitle.includes('california') || 
    lowerTitle.includes('washington') || 
    lowerTitle.includes('chicago') || 
    lowerTitle.includes('texas') || 
    lowerTitle.includes('米国') || 
    lowerTitle.includes('アメリカ') || 
    lowerTitle.includes('ニューヨーク') || 
    lowerTitle.includes('ワシントン') || 
    lowerTitle.includes('カリフォルニア') || 
    lowerTitle.includes('テキサス')
  ) {
    return 'north_america';
  }
  if (
    lowerTitle.includes('uk') || 
    lowerTitle.includes('london') || 
    lowerTitle.includes('europe') || 
    lowerTitle.includes('frankfurt') || 
    lowerTitle.includes('paris') || 
    lowerTitle.includes('ukraine') || 
    lowerTitle.includes('russia') || 
    lowerTitle.includes('欧州') || 
    lowerTitle.includes('ヨーロッパ') || 
    lowerTitle.includes('ロンドン') || 
    lowerTitle.includes('ウクライナ') || 
    lowerTitle.includes('ロシア') || 
    lowerTitle.includes('ドイツ') || 
    lowerTitle.includes('フランス') || 
    lowerTitle.includes('モスクワ') || 
    lowerTitle.includes('キエフ') ||
    lowerTitle.includes('フランクフルト') ||
    lowerTitle.includes('スイス') ||
    lowerTitle.includes('ジュネーブ') ||
    lowerTitle.includes('チューリッヒ')
  ) {
    return 'europe';
  }
  if (
    lowerTitle.includes('middle east') || 
    lowerTitle.includes('saudi') || 
    lowerTitle.includes('riyadh') || 
    lowerTitle.includes('opec') || 
    lowerTitle.includes('iran') || 
    lowerTitle.includes('israel') || 
    lowerTitle.includes('dubai') || 
    lowerTitle.includes('中東') || 
    lowerTitle.includes('サウジ') || 
    lowerTitle.includes('リヤド') || 
    lowerTitle.includes('イラン') || 
    lowerTitle.includes('イスラエル') ||
    lowerTitle.includes('ドバイ') ||
    lowerTitle.includes('ホルムズ')
  ) {
    return 'middle_east';
  }

  // Coordinate bounding box fallback check
  if (lat >= 10 && lat <= 75 && lng >= -170 && lng <= -50) {
    return 'north_america';
  }
  if (lat >= 35 && lat <= 75 && lng >= -25 && lng <= 60) {
    return 'europe';
  }
  if (lat >= 12 && lat <= 45 && lng >= 34 && lng <= 60) {
    return 'middle_east';
  }
  if (lat >= -10 && lat <= 55 && lng >= 60 && lng <= 150) {
    return 'asia_japan';
  }

  return 'other';
}

function assignCoordinates(title: string, index: number): { lat: number; lng: number; relatedAsset?: string; region: 'north_america' | 'asia_japan' | 'europe' | 'middle_east' | 'other' } {
  const lowerTitle = title.toLowerCase();

  for (const [key, val] of Object.entries(REGIONAL_COORDS)) {
    if (lowerTitle.includes(key)) {
      let relatedAsset: string | undefined = undefined;
      if (lowerTitle.includes('btc') || lowerTitle.includes('bitcoin') || lowerTitle.includes('ビットコイン')) {
        relatedAsset = 'BTC';
      } else if (lowerTitle.includes('yen') || lowerTitle.includes('円') || lowerTitle.includes('為替')) {
        relatedAsset = 'USD_JPY';
      } else if (lowerTitle.includes('oil') || lowerTitle.includes('原油')) {
        relatedAsset = 'Crude_Oil';
      } else if (lowerTitle.includes('gold') || lowerTitle.includes('金')) {
        relatedAsset = 'Gold';
      } else if (lowerTitle.includes('s&p') || lowerTitle.includes('fed') || lowerTitle.includes('株') || lowerTitle.includes('市場')) {
        relatedAsset = 'SP500';
      }
      return { lat: val.lat, lng: val.lng, relatedAsset, region: val.region };
    }
  }

  if (
    lowerTitle.includes('btc') || 
    lowerTitle.includes('bitcoin') || 
    lowerTitle.includes('crypto') || 
    lowerTitle.includes('coin') || 
    lowerTitle.includes('ethereum') ||
    lowerTitle.includes('ビットコイン') ||
    lowerTitle.includes('仮想通貨') ||
    lowerTitle.includes('暗号資産')
  ) {
    return { ...ASSETS_MAP.BTC, relatedAsset: 'BTC', region: 'europe' };
  }
  if (
    lowerTitle.includes('yen') || 
    lowerTitle.includes('boj') || 
    lowerTitle.includes('nikkei') ||
    lowerTitle.includes('円') ||
    lowerTitle.includes('日銀') ||
    lowerTitle.includes('日経') ||
    lowerTitle.includes('為替')
  ) {
    return { ...ASSETS_MAP.USD_JPY, relatedAsset: 'USD_JPY', region: 'asia_japan' };
  }
  if (
    lowerTitle.includes('oil') || 
    lowerTitle.includes('opec') || 
    lowerTitle.includes('crude') || 
    lowerTitle.includes('saudi') || 
    lowerTitle.includes('petroleum') ||
    lowerTitle.includes('原油') ||
    lowerTitle.includes('サウジ') ||
    lowerTitle.includes('石油')
  ) {
    return { ...ASSETS_MAP.Crude_Oil, relatedAsset: 'Crude_Oil', region: 'middle_east' };
  }
  if (
    lowerTitle.includes('gold') || 
    lowerTitle.includes('metal') || 
    lowerTitle.includes('bullion') ||
    lowerTitle.includes('金') ||
    lowerTitle.includes('ゴールド')
  ) {
    return { ...ASSETS_MAP.Gold, relatedAsset: 'Gold', region: 'other' };
  }
  if (
    lowerTitle.includes('s&p') ||
    lowerTitle.includes('fed') ||
    lowerTitle.includes('federal reserve') ||
    lowerTitle.includes('nasdaq') ||
    lowerTitle.includes('dow') ||
    lowerTitle.includes('inflation') ||
    lowerTitle.includes('treasury') ||
    lowerTitle.includes('bond') ||
    lowerTitle.includes('market') ||
    lowerTitle.includes('stock') ||
    lowerTitle.includes('economy') ||
    lowerTitle.includes('米国') ||
    lowerTitle.includes('アメリカ') ||
    lowerTitle.includes('ドル') ||
    lowerTitle.includes('インフレ') ||
    lowerTitle.includes('金利') ||
    lowerTitle.includes('国債') ||
    lowerTitle.includes('市場') ||
    lowerTitle.includes('株') ||
    lowerTitle.includes('経済')
  ) {
    return { ...ASSETS_MAP.SP500, relatedAsset: 'SP500', region: 'north_america' };
  }

  const city = GLOBAL_CITIES[index % GLOBAL_CITIES.length];
  return { lat: city.lat, lng: city.lng, region: city.region };
}

function httpsGetXml(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data);
        } else {
          reject(new Error(`Failed to fetch XML: ${res.statusCode}`));
        }
      });
    }).on('error', reject);
  });
}

// 120 templates distributed across the 4 new categories (30 items each)
const NEWS_TEMPLATES: Array<{
  title: string;
  source: string;
  genre: 'macro' | 'geopolitics' | 'commodity' | 'local';
  lat: number;
  lng: number;
  region: 'north_america' | 'asia_japan' | 'europe' | 'middle_east' | 'other';
  relatedAsset?: string;
}> = [
  // ==========================================
  // MACRO ECONOMY (30 items)
  // ==========================================
  { title: '米連邦準備制度（FRB）、インフレ抑制のため政策金利の据え置きを示唆', source: 'ロイター', genre: 'macro', lat: 38.9072, lng: -77.0369, region: 'north_america', relatedAsset: 'SP500' },
  { title: '米小売売上高が市場予想を上回り堅調な伸び、金利長期化懸念も', source: 'CNBC', genre: 'macro', lat: 40.7128, lng: -74.0060, region: 'north_america', relatedAsset: 'SP500' },
  { title: '米住宅着工件数が急減、高金利が不動産開発の重しとなる状況続く', source: 'ブルームバーグ', genre: 'macro', lat: 34.0522, lng: -118.2437, region: 'north_america', relatedAsset: 'SP500' },
  { title: 'ニューヨーク連銀総裁、短期インフレ期待の安定を強調し利下げ牽制', source: 'WSJ', genre: 'macro', lat: 40.7128, lng: -74.0060, region: 'north_america', relatedAsset: 'SP500' },
  { title: '日銀審議委員、インフレ期待の高まりに応じた将来の追加利上げを示唆', source: '日本経済新聞', genre: 'macro', lat: 35.6762, lng: 139.6503, region: 'asia_japan', relatedAsset: 'USD_JPY' },
  { title: 'ドル円相場、一時1ドル158円台後半に迫り、日米金利差によるドル買い継続', source: '読売新聞', genre: 'macro', lat: 35.6762, lng: 139.6503, region: 'asia_japan', relatedAsset: 'USD_JPY' },
  { title: '中国小売売上高の伸びが鈍化、内需拡大策の効果が限定的との見方広まる', source: '上海証券報', genre: 'macro', lat: 31.2304, lng: 121.4737, region: 'asia_japan' },
  { title: 'シンガポールGDP、第1四半期は堅調なサービス業に支えられ前年比で拡大', source: 'シンガポールタイムズ', genre: 'macro', lat: 1.3521, lng: 103.8198, region: 'asia_japan' },
  { title: '欧州中央銀行（ECB）、次回理事会での利下げ実施について慎重姿勢を崩さず', source: 'FT紙', genre: 'macro', lat: 50.1109, lng: 8.6821, region: 'europe' },
  { title: 'ドイツ連邦銀行、製造業の低迷により今年のGDP成長率見通しを小幅下方修正', source: 'ベルリンポスト', genre: 'macro', lat: 52.5200, lng: 13.4050, region: 'europe' },
  { title: '英消費者物価指数（CPI）が目標値に迫るも、サービスインフレ高止まりを警戒', source: 'BBC', genre: 'macro', lat: 51.5074, lng: -0.1278, region: 'europe', relatedAsset: 'BTC' },
  { title: 'スイスフラン、安全資産としての変化需要増加から対ユーロで一時高値圏維持', source: 'スイスインフォ', genre: 'macro', lat: 46.8182, lng: 8.2275, region: 'europe' },
  { title: 'オーストラリア準備銀行（RBA）、インフレ再燃の懸念から政策金利を再度据え置き', source: 'シドニー・モーニング', genre: 'macro', lat: -33.8688, lng: 151.2093, region: 'other' },
  { title: 'ブラジル中銀、インフレ期待の落ち着きを背景に金利カットのペース維持を示唆', source: 'サンパウロポスト', genre: 'macro', lat: -26.2041, lng: 28.0473, region: 'other' },
  { title: '国際通貨基金（IMF）、新興国経済の強靭性を評価する一方、債務再編の遅れを警告', source: 'IMFプレス', genre: 'macro', lat: -33.8688, lng: 151.2093, region: 'other' },
  { title: '米FOMC議事要旨、多くの高官がインフレ鈍化の遅れに強い警戒感を示す', source: 'フィナンシャル・タイムズ', genre: 'macro', lat: 38.9072, lng: -77.0369, region: 'north_america', relatedAsset: 'SP500' },
  { title: '日銀総裁、為替の急激な変動が物価に与える影響を注視する姿勢を改めて表明', source: '日本経済新聞', genre: 'macro', lat: 35.6762, lng: 139.6503, region: 'asia_japan', relatedAsset: 'USD_JPY' },
  { title: 'ユーロ圏サービス業PMIが節目を回復、ECBの追加緩和議論を複雑にする結果に', source: 'ブルームバーグ', genre: 'macro', lat: 50.1109, lng: 8.6821, region: 'europe' },
  { title: '中国人民銀行、ローンプライムレート（LPR）を据え置き、人民元防衛を最優先', source: '新華社', genre: 'macro', lat: 39.9042, lng: 116.4074, region: 'asia_japan' },
  { title: '英国GDPがプラス成長に回帰、リセッション局面からの脱却を鮮明に', source: 'BBC', genre: 'macro', lat: 51.5074, lng: -0.1278, region: 'europe' },
  { title: '米雇用統計、非農業部門雇用者数が市場予想を上回り、国債利回り急上昇', source: 'CNBC', genre: 'macro', lat: 38.9072, lng: -77.0369, region: 'north_america', relatedAsset: 'SP500' },
  { title: '日銀国債買い入れ減額方針の具体案調整、市場機能回復への一歩', source: '読売新聞', genre: 'macro', lat: 35.6762, lng: 139.6503, region: 'asia_japan', relatedAsset: 'USD_JPY' },
  { title: 'ECB総裁、物価目標達成確度に自信を示しつつも、早急な連続利下げは否定', source: 'ロイター', genre: 'macro', lat: 50.1109, lng: 8.6821, region: 'europe' },
  { title: 'カナダ中銀、市場予測通りインフレ沈静化を好感して予防的利下げを決定', source: 'トロントスター', genre: 'macro', lat: 40.7128, lng: -74.0060, region: 'north_america' },
  { title: 'スウェーデン・リクスバンク、国内景気の冷え込みを受けて緩和サイクル開始', source: 'スウェーデンニュース', genre: 'macro', lat: 52.5200, lng: 13.4050, region: 'europe' },
  { title: '米コアPCEデフレーターが鈍化、市場の早期利下げ期待が辛うじて持ち直す', source: 'WSJ', genre: 'macro', lat: 38.9072, lng: -77.0369, region: 'north_america', relatedAsset: 'SP500' },
  { title: '日銀・政府の共同為替介入観測、覆面介入含め円買いバッファーは十分との見方', source: '共同通信', genre: 'macro', lat: 35.6762, lng: 139.6503, region: 'asia_japan', relatedAsset: 'USD_JPY' },
  { title: 'ユーロ圏主要経済指標が市場予測を下回り、域内の成長格差拡大を露呈', source: 'フランクフルト新聞', genre: 'macro', lat: 50.1109, lng: 8.6821, region: 'europe' },
  { title: '米消費者信頼感指数が直近3ヶ月で最低水準、労働市場の軟化懸念が台頭', source: 'ロイター', genre: 'macro', lat: 40.7128, lng: -74.0060, region: 'north_america', relatedAsset: 'SP500' },
  { title: '主要新興国、米高金利の長期化に伴う自国通貨安を懸念し介入手段の検討入り', source: 'ヨハネスブルグ・メール', genre: 'macro', lat: -26.2041, lng: 28.0473, region: 'other' },

  // ==========================================
  // GEOPOLITICS & CONFLICT (30 items)
  // ==========================================
  { title: '米大統領、クリーンエネルギー貿易協定をめぐりパートナー国との連携強化へ', source: 'ワシントンポスト', genre: 'geopolitics', lat: 38.9072, lng: -77.0369, region: 'north_america' },
  { title: '米政府、半導体およびバッテリー製品に対する新たな外交的安全保障枠組み発足', source: 'CNN', genre: 'geopolitics', lat: 38.9072, lng: -77.0369, region: 'north_america' },
  { title: 'カナダ首相、安全保障同盟国とのインテリジェンス共有体制を強化する法案を準備', source: 'トロントスター', genre: 'geopolitics', lat: 40.7128, lng: -74.0060, region: 'north_america' },
  { title: '米中外相がスイスにて非公式会談、貿易紛争の過熱回避に向け事務レベル協議で合意', source: 'ロイター', genre: 'geopolitics', lat: 38.9072, lng: -77.0369, region: 'north_america' },
  { title: '日米共同訓練が太平洋の重要海域で開始、地域の防衛体制と有事即応力を確認', source: '産経新聞', genre: 'geopolitics', lat: 35.6762, lng: 139.6503, region: 'asia_japan' },
  { title: '台湾海峡周辺の平和的対話の重要性を再確認、日米豪首脳が連名で緊急共同声明発表', source: '共同通信', genre: 'geopolitics', lat: 25.0330, lng: 121.5654, region: 'asia_japan' },
  { title: 'ASEAN加盟国首脳、南シナ海での平和構築に向け行動規範（COC）の早期策定を要求', source: 'アジア・オピニオン', genre: 'geopolitics', lat: 1.3521, lng: 103.8198, region: 'asia_japan' },
  { title: '韓国政府、日中韓首脳会談の調整本格化を発表、経済連携協定の近代化を議題に設定', source: '東亜日報', genre: 'geopolitics', lat: 37.5665, lng: 126.9780, region: 'asia_japan' },
  { title: '欧州連合（EU）、隣国からのハイブリッド攻撃に備えた共同国境防衛インフラ資金拠出へ', source: 'フィガロ紙', genre: 'geopolitics', lat: 48.8566, lng: 2.3522, region: 'europe' },
  { title: 'G7主要首脳、第三国を経由した軍民両用技術移転を巡り監視網の連携強化に合意', source: 'DW通信', genre: 'geopolitics', lat: 52.5200, lng: 13.4050, region: 'europe' },
  { title: 'スイス政府、国際的な調停役役割強化のため、新たな対話枠組みの主催を発表', source: 'NZZ紙', genre: 'geopolitics', lat: 46.2044, lng: 6.1432, region: 'europe' },
  { title: '英首相、欧州北部の防衛パートナーシップ会合を招集、サプライチェーン防衛を協議', source: 'ロンドン・オブ', genre: 'geopolitics', lat: 51.5074, lng: -0.1278, region: 'europe' },
  { title: 'サウジアラビアとイランの外交正常化ロードマップ、中間評価協議が第三国にて実施', source: 'アラブニュース', genre: 'geopolitics', lat: 24.7136, lng: 46.6753, region: 'middle_east' },
  { title: '中東地域の貿易ハブ安定化に向けて湾岸協力会議（GCC）が物流安全保障宣言発令', source: 'サウジ経済', genre: 'geopolitics', lat: 24.7136, lng: 46.6753, region: 'middle_east' },
  { title: 'ドバイにおいて中東・アジアを結ぶ新貿易ルート建設に向けた多国間閣僚会議が開幕', source: 'アル・ハヤート', genre: 'geopolitics', lat: 25.2048, lng: 55.2708, region: 'middle_east' },
  { title: 'ペルシャ湾周辺の非武装中立地帯設置をめぐり、主要国が事務レベルの調整に入るとの報道', source: '中東ダイアリー', genre: 'geopolitics', lat: 29.3117, lng: 47.4818, region: 'middle_east' },
  { title: 'アフリカ連合（AU）首会議が開幕、地域内自由貿易の推進と越境テロ対策を議論', source: 'ヨハネスポスト', genre: 'geopolitics', lat: -26.2041, lng: 28.0473, region: 'other' },
  { title: 'オーストラリア首相、太平洋諸島フォーラムでの安全保障協力強化に向けた新スキーム提示', source: 'シドニーポスト', genre: 'geopolitics', lat: -33.8688, lng: 151.2093, region: 'other' },
  { title: '南米諸国連合、重要資源鉱物の輸出における域内協定の設立に向けて事前調整会議設置', source: 'ラテンウィーク', genre: 'geopolitics', lat: -26.2041, lng: 28.0473, region: 'other' },
  { title: '太平洋重要諸国の閣僚、海上物流強靭化を巡るサイバーディフェンス共同宣言採択', source: 'キャンベラ', genre: 'geopolitics', lat: -33.8688, lng: 151.2093, region: 'other' },
  { title: '米国防総省、中東ペルシャ湾および紅海沿岸の商船護衛に駆逐艦を追加派遣', source: 'ワシントン防衛', genre: 'geopolitics', lat: 38.9072, lng: -77.0369, region: 'north_america' },
  { title: '米海軍打撃群、大西洋北部にて対空および対潜水艦の統合迎撃実射訓練を開始', source: 'CNN', genre: 'geopolitics', lat: 40.7128, lng: -74.0060, region: 'north_america' },
  { title: '米大統領、国際安全保障支援のための予算案に署名し、防衛兵器供給拡大を指示', source: 'ホワイトハウス', genre: 'geopolitics', lat: 38.9072, lng: -77.0369, region: 'north_america' },
  { title: '米サイバー軍、重要インフラを標的とした中東系ハッキング集団の攻撃を検知・遮断', source: 'ロイター', genre: 'geopolitics', lat: 34.0522, lng: -118.2437, region: 'north_america' },
  { title: '台湾周辺海域で大規模な中国軍演習が開始、複数の誘導ミサイル駆逐艦が展開', source: '共同通信', genre: 'geopolitics', lat: 25.0330, lng: 121.5654, region: 'asia_japan' },
  { title: '南シナ海の係争海域で沿岸警備隊の船同士が近接・接触し外交ルートで抗議表明', source: 'アジア紙', genre: 'geopolitics', lat: 1.3521, lng: 103.8198, region: 'asia_japan' },
  { title: '朝鮮半島緊張の高まりを受け、警戒艦艇が日本海でのレーダー巡視活動を強化', source: '読売新聞', genre: 'geopolitics', lat: 35.6762, lng: 139.6503, region: 'asia_japan' },
  { title: '沖縄離島周辺における対空レーダー陣地の監視体制強化、自衛隊が哨戒を頻繁化', source: '産経新聞', genre: 'geopolitics', lat: 26.2124, lng: 127.6809, region: 'asia_japan' },
  { title: 'ウクライナ国境付近の主要火力発電所がドローン攻撃で破壊され一部で大停電', source: '欧州防衛日報', genre: 'geopolitics', lat: 50.4501, lng: 30.5234, region: 'europe' },
  { title: '黒海周辺の軍港施設付近で水中爆発、周辺海域を通る穀物輸送船の保険料率再上昇', source: 'BBC', genre: 'geopolitics', lat: 55.7558, lng: 37.6173, region: 'europe' },

  // ==========================================
  // ENERGY & COMMODITY (30 items)
  // ==========================================
  { title: 'サウジアラビア、非石油部門の経済多角化計画に向け過去最大規模の資金供給決定', source: 'アルアラビーヤ', genre: 'commodity', lat: 24.7136, lng: 46.6753, region: 'middle_east', relatedAsset: 'Crude_Oil' },
  { title: 'OPEC+共同閣僚監視委員会、原油市場需給均衡化に向け現状の減産方針維持を提言', source: 'サウジ経済新聞', genre: 'commodity', lat: 24.7136, lng: 46.6753, region: 'middle_east', relatedAsset: 'Crude_Oil' },
  { title: 'ドバイ金融特区での機関投資家の新規投資ファンド承認数が前年比で急増', source: 'ドバイ・クロニクル', genre: 'commodity', lat: 25.2048, lng: 55.2708, region: 'middle_east' },
  { title: 'カタール、液化天然ガス（LNG）増産を見越した中東向けインフラ投資枠拡大', source: '中東経済レビュー', genre: 'commodity', lat: 29.3117, lng: 47.4818, region: 'middle_east', relatedAsset: 'Crude_Oil' },
  { title: '南アフリカ鉱物資源相、プラチナおよび金採掘の生産性改善に向けた新投資策提示', source: 'ヨハネスブルグ・メール', genre: 'commodity', lat: -26.2041, lng: 28.0473, region: 'other', relatedAsset: 'Gold' },
  { title: '南アフリカ金鉱山周辺での記録的干ばつ、冷却用水の配給制限で金供給への影響懸念', source: '南ア環境報', genre: 'commodity', lat: -26.2041, lng: 28.0473, region: 'other', relatedAsset: 'Gold' },
  { title: 'リビア東部の主要油田地帯が武装勢力に占拠され、輸出量半減により原油買い殺到', source: 'トリポリメール', genre: 'commodity', lat: -26.2041, lng: 28.0473, region: 'other', relatedAsset: 'Crude_Oil' },
  { title: '中東主要原油積出港、砂嵐発生による視界不良のため商船の着岸制限措置を一時導入', source: '中東物流新聞', genre: 'commodity', lat: 29.3117, lng: 47.4818, region: 'middle_east', relatedAsset: 'Crude_Oil' },
  { title: 'ペルシャ湾沿岸で最高気温51度、水温上昇で周辺火力発電所の冷却効率低下と稼働制限', source: 'ドバイエコ', genre: 'commodity', lat: 25.2048, lng: 55.2708, region: 'middle_east', relatedAsset: 'Crude_Oil' },
  { title: 'ホルムズ海峡で外国籍商船が軍事武装集団に臨検され一時拿捕、供給リスク緊迫', source: 'ブルームバーグ', genre: 'commodity', lat: 29.3117, lng: 47.4818, region: 'middle_east', relatedAsset: 'Crude_Oil' },
  { title: '中東での無人機によるエネルギーインフラ空爆応酬を受けWTI原油先物が一時急騰', source: 'ロイター', genre: 'commodity', lat: 24.7136, lng: 46.6753, region: 'middle_east', relatedAsset: 'Crude_Oil' },
  { title: 'ペルシャ湾周辺の安全航行を確保するため多国籍海軍共同パトロール軍が出動', source: 'サウジ経済新聞', genre: 'commodity', lat: 24.7136, lng: 46.6753, region: 'middle_east', relatedAsset: 'Crude_Oil' },
  { title: 'レバノン南部国境での大規模な砲撃戦が発生、中東広域の戦争拡大懸念が最大級に', source: 'アル・ジャジーラ', genre: 'commodity', lat: 31.7683, lng: 35.2137, region: 'middle_east' },
  { title: 'アフリカ中部での反政府勢力による武力攻勢でコバルトおよび金鉱山が操業停止', source: 'ヨハネスブルグ', genre: 'commodity', lat: -26.2041, lng: 28.0473, region: 'other', relatedAsset: 'Gold' },
  { title: '主要産油国による原油の自主減産目標の延長発表、世界的な実需逼迫傾向が顕在化', source: 'ロイター', genre: 'commodity', lat: 24.7136, lng: 46.6753, region: 'middle_east', relatedAsset: 'Crude_Oil' },
  { title: '米国内の原油在庫統計が市場予想を大幅に下回る取り崩しを記録、原油買い誘発', source: 'CNBC', genre: 'commodity', lat: 40.7128, lng: -74.0060, region: 'north_america', relatedAsset: 'Crude_Oil' },
  { title: 'ロンドン金属取引所（LME）で銅・ニッケル等のベースメタル先物が投機的急騰', source: 'ロンドンタイムズ', genre: 'commodity', lat: 51.5074, lng: -0.1278, region: 'europe', relatedAsset: 'Gold' },
  { title: '南米の干ばつがカカオおよび大豆豆の作柄を直撃、国際市況での供給逼迫警報', source: 'ラテン経済', genre: 'commodity', lat: -26.2041, lng: 28.0473, region: 'other' },
  { title: 'ウクライナの穀物輸出ルートの安全確保を巡る黒海協定調整の難航により小麦価格跳ね上がり', source: 'キエフポスト', genre: 'commodity', lat: 50.4501, lng: 30.5234, region: 'europe' },
  { title: '豪州主要コークス炭鉱山でのストライキが長期化、鉄鋼大手への原料炭供給懸念が急上昇', source: 'シドニーモーニング', genre: 'commodity', lat: -33.8688, lng: 151.2093, region: 'other' },
  { title: '金現物価格、主要中央銀行の継続的な金買い増し統計公表を受けて史上最高値を更新', source: 'ブルームバーグ', genre: 'commodity', lat: 51.5074, lng: -0.1278, region: 'europe', relatedAsset: 'Gold' },
  { title: '天然ガス価格、ロシアから欧州向けの主要パイプラインの定期メンテナンス入りで急変動', source: 'ベルリンポスト', genre: 'commodity', lat: 52.5200, lng: 13.4050, region: 'europe', relatedAsset: 'Crude_Oil' },
  { title: '中東・北アフリカ地域のリン鉱石生産拠点における港湾スト、化学肥料価格への影響波及', source: 'アル・アハラム', genre: 'commodity', lat: 29.3117, lng: 47.4818, region: 'middle_east' },
  { title: '北海油田でのプラットフォーム電気系統トラブルによる供給緊急停止、ブレント原油先物に上昇バイアス', source: 'FT紙', genre: 'commodity', lat: 51.5074, lng: -0.1278, region: 'europe', relatedAsset: 'Crude_Oil' },
  { title: 'シカゴ穀物相場、エルニーニョ現象が直撃する東南アジアのパーム油減産懸念で反発', source: 'シカゴ・トリビューン', genre: 'commodity', lat: 41.8781, lng: -87.6298, region: 'north_america' },
  { title: 'サウジ国営石油企業、アジア向け公式販売価格（OSP）を小幅引き上げ、値決め強気継続', source: 'アル・リヤド', genre: 'commodity', lat: 24.7136, lng: 46.6753, region: 'middle_east', relatedAsset: 'Crude_Oil' },
  { title: '金先物市場におけるETF流出止まり、中長期の金利低下期待を背景にした買い戻し優勢', source: 'WSJ', genre: 'commodity', lat: 40.7128, lng: -74.0060, region: 'north_america', relatedAsset: 'Gold' },
  { title: 'メキシコ湾岸のハリケーン襲来警戒、主要洋上油田プラットフォームでの要員避難決定', source: 'ヒューストンプレス', genre: 'commodity', lat: 31.9686, lng: -99.9018, region: 'north_america', relatedAsset: 'Crude_Oil' },
  { title: '南アフリカの電力不足悪化に伴うプラチナ製錬工場の輪番停電、供給ショートリスク警告', source: 'ヨハネスブルグ・スター', genre: 'commodity', lat: -26.2041, lng: 28.0473, region: 'other', relatedAsset: 'Gold' },
  { title: '金鉱最大手の合併協議合意、市場価格の底上げを狙う世界規模の生産再編が進む', source: 'カナダマイニング', genre: 'commodity', lat: 40.7128, lng: -74.0060, region: 'north_america', relatedAsset: 'Gold' },

  // ==========================================
  // LOCAL INTELLIGENCE & MISC (30 items)
  // ==========================================
  { title: 'OpenAI、推論能力が飛躍的に進化した次世代AIモデル「GPT-5」の開発進捗公開', source: 'TechCrunch', genre: 'local', lat: 34.0522, lng: -118.2437, region: 'north_america' },
  { title: '米エヌビディア、次世代 Blackwell 出荷遅延懸念が完全に緩和し株価最高値更新', source: 'CNBC', genre: 'local', lat: 34.0522, lng: -118.2437, region: 'north_america' },
  { title: '米グーグル、新設計の超電導量子コンピュータチップのコヒーレンス時間倍増に成功', source: 'ワイアード', genre: 'local', lat: 34.0522, lng: -118.2437, region: 'north_america' },
  { title: 'シリコンバレーの自動運転ベンチャー、無人タクシー運行承認枠を前月比2倍に拡大', source: 'ブルームバーグ', genre: 'local', lat: 34.0522, lng: -118.2437, region: 'north_america' },
  { title: '東京の新設半導体ファブ、次世代2ナノメートル量産試作ラインの稼働を予定通り開始', source: '日経エレ', genre: 'local', lat: 35.6762, lng: 139.6503, region: 'asia_japan' },
  { title: '台湾積体電路（TSMC）、日本国内での第3工場の建設計画を正式に検討開始と表明', source: '台湾経済時報', genre: 'local', lat: 25.0330, lng: 121.5654, region: 'asia_japan' },
  { title: 'シンガポール政府、自国の通信セキュリティ強靭化に向けて新規ブロックチェーン投資', source: 'SGビジネス', genre: 'local', lat: 1.3521, lng: 103.8198, region: 'asia_japan' },
  { title: '中国テンセント、独自大規模言語モデルを用いた産業向け自動コード生成運用拡大', source: '深圳科技報', genre: 'local', lat: 31.2304, lng: 121.4737, region: 'asia_japan' },
  { title: '暗号資産市場、欧州の包括的規制（MiCA）本格施行を受け適法ファンド開設急増', source: 'ロイター', genre: 'local', lat: 46.2044, lng: 6.1432, region: 'europe', relatedAsset: 'BTC' },
  { title: 'スイス金融大手、国債とデジタル通貨を用いたスマートコントラクト決済成功', source: 'スイスレビュー', genre: 'local', lat: 47.3769, lng: 8.5417, region: 'europe' },
  { title: 'ドイツ政府、次世代AIモデル研究コミュニティに向け計算インフラ無償化計画', source: 'ベルリンテック', genre: 'local', lat: 52.5200, lng: 13.4050, region: 'europe' },
  { title: 'ビットコイン、マイナーの最新型マイニングASICの稼働率上昇でハッシュレート最高値', source: 'コインデスク', genre: 'local', lat: 51.5074, lng: -0.1278, region: 'europe', relatedAsset: 'BTC' },
  { title: 'サウジアラビア政府系ファンド、世界的な半導体ベンチャー出資に向け新ファンド承認', source: 'アル・リヤド', genre: 'local', lat: 24.7136, lng: 46.6753, region: 'middle_east' },
  { title: 'ドバイ新興企業ハブ、ブロックチェーンを利用した国際船荷証券プラットフォーム稼働', source: 'ガルフニュース', genre: 'local', lat: 25.2048, lng: 55.2708, region: 'middle_east' },
  { title: 'イスラエルのAIスタートアップ、医療画像診断向け深層学習モデルで欧米当局の承認取得', source: 'テルアビブ', genre: 'local', lat: 31.7683, lng: 35.2137, region: 'middle_east' },
  { title: '中東スマートシティ建設地域、全域で自動ドローン物流網とスマートインフラ同時稼働', source: '中東テック', genre: 'local', lat: 29.3117, lng: 47.4818, region: 'middle_east' },
  { title: '南アフリカ通信大手、次世代高速衛星インターネット網のカバーエリア拡大を発表', source: '南アITニュース', genre: 'local', lat: -26.2041, lng: 28.0473, region: 'other' },
  { title: 'オーストラリアの研究機関、量子コンピューティングに基づく気候予測アルゴリズム公開', source: 'シドニーテック', genre: 'local', lat: -33.8688, lng: 151.2093, region: 'other' },
  { title: '豪州の暗号資産カストディ、大手年金ファンドの暗号資産ポートフォリオ直接組み入れサポート', source: 'コインレビュー', genre: 'local', lat: -33.8688, lng: 151.2093, region: 'other', relatedAsset: 'BTC' },
  { title: '新興国の通信各社、分散型ID（DID）規格を用いた送金インフラの相互乗り入れ完了', source: 'グローバルテレ', genre: 'local', lat: -26.2041, lng: 28.0473, region: 'other' },
  { title: '米中西部で高病原性鳥インフルエンザ（H5N1）のヒト感染が確認され隔離措置完了', source: 'CDC発表', genre: 'local', lat: 41.8781, lng: -87.6298, region: 'north_america' },
  { title: '米国務省、特定の熱帯感染症流行国への渡航警戒レベル引き上げと健康カード配布', source: 'ワシントンヘル', genre: 'local', lat: 38.9072, lng: -77.0369, region: 'north_america' },
  { title: 'カナダ保健省、渡航者の未知ウイルス性脳炎スクリーニング検疫港湾体制アップデート', source: 'オタワレビュー', genre: 'local', lat: 40.7128, lng: -74.0060, region: 'north_america' },
  { title: 'カリフォルニア州、新型肺炎変異種のアウトブレイク検知のため排水のゲノム監視強化', source: 'LAヘルス', genre: 'local', lat: 34.0522, lng: -118.2437, region: 'north_america' },
  { title: '東南アジアで変異型デング熱のアウトブレイク、WHOが緊急警戒情報を域内に発令', source: 'WHOアジア', genre: 'local', lat: 1.3521, lng: 103.8198, region: 'asia_japan' },
  { title: '日本国内の病院で新種の重症呼吸不全（SARI）クラスター報告、厚生労働省調査開始', source: '厚生労働省報', genre: 'local', lat: 35.6762, lng: 139.6503, region: 'asia_japan' },
  { title: 'シンガポール近海検疫港にて乗組員から未知の感染症熱病が検知され接岸一時停止', source: 'シンガポールP', genre: 'local', lat: 1.3521, lng: 103.8198, region: 'asia_japan' },
  { title: '韓国ソウル市内で集団ウイルス感染発生、変異型呼吸器ウイルスの新たな拡大を警戒', source: 'ソウルヘル', genre: 'local', lat: 37.5665, lng: 126.9780, region: 'asia_japan' },
  { title: '欧州疾病予防管理センター（ECDC）、新種感染ウイルスの感染ルート追跡結果公表', source: 'ECDCプレス', genre: 'local', lat: 46.2044, lng: 6.1432, region: 'europe' },
  { title: 'WHO、スイス本部にて新たなパンデミックポテンシャルを持つ疾病Xの対策会合開催', source: 'WHOプレス', genre: 'local', lat: 46.2044, lng: 6.1432, region: 'europe' }
];

export function generateAiSummaryAndImpact(
  title: string, 
  genre: 'macro' | 'geopolitics' | 'commodity' | 'local', 
  relatedAsset?: string
): { 
  summary: string[]; 
  marketImpact: { 
    asset: string; 
    direction: 'UP' | 'DOWN' | 'FLAT'; 
    impactDegree: 'L' | 'M' | 'H' | 'VH'; 
    predictedChange: string; 
  } 
} {
  const lowerTitle = title.toLowerCase();
  
  // Decide target asset
  let asset = relatedAsset || 'SP500';
  if (!relatedAsset) {
    if (lowerTitle.includes('btc') || lowerTitle.includes('bitcoin') || lowerTitle.includes('暗号') || lowerTitle.includes('仮想通貨')) {
      asset = 'BTC';
    } else if (lowerTitle.includes('円') || lowerTitle.includes('yen') || lowerTitle.includes('日銀') || lowerTitle.includes('為替')) {
      asset = 'USD_JPY';
    } else if (lowerTitle.includes('原油') || lowerTitle.includes('oil') || lowerTitle.includes('opec') || lowerTitle.includes('ホルムズ')) {
      asset = 'Crude_Oil';
    } else if (lowerTitle.includes('金') || lowerTitle.includes('gold') || lowerTitle.includes('ゴールド')) {
      asset = 'Gold';
    } else if (genre === 'commodity') {
      asset = (lowerTitle.includes('gold') || lowerTitle.includes('金')) ? 'Gold' : 'Crude_Oil';
    } else if (genre === 'macro') {
      asset = (lowerTitle.includes('円') || lowerTitle.includes('日銀')) ? 'USD_JPY' : 'SP500';
    } else if (genre === 'geopolitics') {
      asset = (lowerTitle.includes('中東') || lowerTitle.includes('原油') || lowerTitle.includes('海峡')) ? 'Crude_Oil' : 'Gold';
    }
  }

  let direction: 'UP' | 'DOWN' | 'FLAT' = 'UP';
  let impactDegree: 'L' | 'M' | 'H' | 'VH' = 'M';
  let predictedChange = '+1.0%〜+2.0%';
  let summary: string[] = [];

  if (genre === 'macro') {
    const isDown = lowerTitle.includes('利下げ') || lowerTitle.includes('下落') || lowerTitle.includes('悪化') || lowerTitle.includes('減速') || lowerTitle.includes('円高');
    direction = isDown ? 'DOWN' : 'UP';
    impactDegree = (lowerTitle.includes('frb') || lowerTitle.includes('日銀') || lowerTitle.includes('金利')) ? 'H' : 'M';
    predictedChange = direction === 'UP' ? '+0.8%〜+1.5%' : '-0.8%〜-1.5%';
    
    summary = [
      `主要中央銀行の金融政策スタンスおよびマクロ指標の最新動向を反映。`,
      (lowerTitle.includes('日銀') || lowerTitle.includes('円')) 
        ? `日銀の金融正常化ペースと為替介入への警戒感が市場を支配。`
        : `FRBの金利政策見通しと金利長期化懸念が株式・債券市場を揺さぶる。`,
      `主要アセットに対する影響評価は${direction === 'UP' ? '上振れ' : '下押し'}バイアスを形成。`
    ];
  } else if (genre === 'geopolitics') {
    const isConflict = lowerTitle.includes('海峡') || lowerTitle.includes('攻撃') || lowerTitle.includes('軍事') || lowerTitle.includes('爆発') || lowerTitle.includes('衝突');
    direction = 'UP';
    impactDegree = isConflict ? 'VH' : 'H';
    predictedChange = isConflict ? '+3.0%〜+5.5%' : '+1.5%〜+3.0%';

    summary = [
      `地政学的リスクの高まりに伴う安全保障およびロジスティクス懸念。`,
      (lowerTitle.includes('ホルムズ') || lowerTitle.includes('中東'))
        ? `ホルムズ海峡周辺での緊張がエネルギー供給網の途絶リスクを直撃。`
        : `主要国間の外交対立および軍事威嚇行動により、市場の警戒感が最大化。`,
      `安全資産（ゴールド・米ドル）や資源価格へのリスクプレミアムが上積み。`
    ];
    if (asset === 'SP500') {
      direction = 'DOWN';
      predictedChange = '-1.5%〜-3.0%';
    }
  } else if (genre === 'commodity') {
    direction = (lowerTitle.includes('下落') || lowerTitle.includes('緩和') || lowerTitle.includes('減産見送り')) ? 'DOWN' : 'UP';
    impactDegree = (lowerTitle.includes('原油') || lowerTitle.includes('金')) ? 'H' : 'M';
    predictedChange = direction === 'UP' ? '+2.0%〜+4.0%' : '-1.5%〜-3.0%';

    summary = [
      `コモディティ市場の供給網ボトルネックおよび生産統計の急変。`,
      lowerTitle.includes('原油') 
        ? `産油国の生産枠維持方針や中東リスクに伴う現物供給力の不確実性。`
        : `金鉱山の操業制限やインフレ防衛を目的とした現物資産への資金シフト。`,
      `実物資産価格の${direction === 'UP' ? '急騰' : '軟化'}シナリオが市場センチメントを先導。`
    ];
  } else {
    direction = Math.random() > 0.4 ? 'UP' : 'DOWN';
    impactDegree = 'L';
    predictedChange = direction === 'UP' ? '+0.3%〜+1.0%' : '-0.3%〜-1.0%';

    summary = [
      `地方速報および個別インテリジェンス情報を検知。`,
      `限定的な地域ニュースあるいは技術革新に関する最新情報の流出。`,
      `大勢への即時影響は軽微であるものの、センチメントの微調整に寄与。`
    ];
  }

  // Customize based on specific template content
  if (lowerTitle.includes('ホルムズ海峡') || lowerTitle.includes('拿捕')) {
    asset = 'Crude_Oil';
    direction = 'UP';
    impactDegree = 'VH';
    predictedChange = '+4.0%〜+7.5%';
    summary = [
      "ホルムズ海峡で外国籍商船が武装集団に臨検・拿捕された事案。",
      "ペルシャ湾からの原油供給が滞るリスクを市場が一気に織り込み開始。",
      "地政学リスクプレミアムの上乗せにより、原油価格に強い上昇圧力が生じる。"
    ];
  } else if (lowerTitle.includes('日銀') && (lowerTitle.includes('利上げ') || lowerTitle.includes('正常化'))) {
    asset = 'USD_JPY';
    direction = 'DOWN';
    impactDegree = 'H';
    predictedChange = '-1.5%〜-2.5%';
    summary = [
      "日銀関係者による追加利上げ示唆または金融政策の正常化観測。",
      "日米金利差縮小を期待した円買い・ドル売りポジションが加速。",
      "為替市場でドル安円高トレンドへの転換バイアスが強まる見通し。"
    ];
  } else if (lowerTitle.includes('鳥インフルエンザ') || lowerTitle.includes('パンデミック') || lowerTitle.includes('感染症')) {
    asset = 'Gold';
    direction = 'UP';
    impactDegree = 'M';
    predictedChange = '+1.0%〜+2.2%';
    summary = [
      "新型インフルエンザやウイルス性感染症のヒト感染および局所的隔離措置。",
      "水際対策強化に伴う人流・物流制限への懸念が投資家心理を冷やす。",
      "安全資産への選好が高まり、ゴールドやディフェンシブアセットへ買いが入る。"
    ];
  }

  return {
    summary,
    marketImpact: {
      asset,
      direction,
      impactDegree,
      predictedChange
    }
  };
}

export async function fetchLatestNews(): Promise<NewsItem[]> {
  try {
    const url = 'https://news.google.com/rss/search?q=finance+OR+markets+OR+economy+OR+geopolitics+OR+technology+OR+disaster+OR+virus+OR+conflict+OR+pandemic+OR+hormuz&hl=ja&gl=JP&ceid=JP:ja';
    const xml = await httpsGetXml(url);
    
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    const rssItems: NewsItem[] = [];
    let match;
    let idx = 0;
    
    while ((match = itemRegex.exec(xml)) !== null && rssItems.length < 200) {
      const itemContent = match[1];
      const titleMatch = itemContent.match(/<title>([\s\S]*?)<\/title>/);
      const linkMatch = itemContent.match(/<link>([\s\S]*?)<\/link>/);
      const pubDateMatch = itemContent.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
      const sourceMatch = itemContent.match(/<source[^>]*>([\s\S]*?)<\/source>/);
      
      let title = titleMatch ? titleMatch[1] : '';
      const link = linkMatch ? linkMatch[1] : '';
      const pubDate = pubDateMatch ? pubDateMatch[1] : '';
      let source = sourceMatch ? sourceMatch[1] : 'Google ニュース';

      title = title
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");

      title = title.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1');

      if (title.includes(' - ')) {
        const parts = title.split(' - ');
        source = parts.pop() || source;
        title = parts.join(' - ');
      }

      if (title) {
        const titleStr = title.trim();
        const coords = assignCoordinates(titleStr, idx);
        const genre = assignGenre(titleStr);
        const aiData = generateAiSummaryAndImpact(titleStr, genre, coords.relatedAsset);
        
        rssItems.push({
          title: titleStr,
          link: link.trim(),
          pubDate: pubDate.trim(),
          source: source.trim(),
          genre,
          lat: coords.lat,
          lng: coords.lng,
          relatedAsset: coords.relatedAsset || aiData.marketImpact.asset,
          region: coords.region,
          summary: aiData.summary,
          marketImpact: aiData.marketImpact
        });
        idx++;
      }
    }

    const finalNews: NewsItem[] = [...rssItems];
    const now = new Date();
    NEWS_TEMPLATES.forEach((tmpl, i) => {
      const isDuplicate = rssItems.some(item => item.title === tmpl.title);
      if (!isDuplicate) {
        const minutesOffset = i * 20;
        const itemDate = new Date(now.getTime() - minutesOffset * 60 * 1000);
        const aiData = generateAiSummaryAndImpact(tmpl.title, tmpl.genre, tmpl.relatedAsset);
        
        finalNews.push({
          title: tmpl.title,
          link: '#',
          pubDate: itemDate.toUTCString(),
          source: tmpl.source,
          genre: tmpl.genre,
          lat: tmpl.lat,
          lng: tmpl.lng,
          region: tmpl.region,
          relatedAsset: tmpl.relatedAsset || aiData.marketImpact.asset,
          summary: aiData.summary,
          marketImpact: aiData.marketImpact
        });
      }
    });

    finalNews.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
    return finalNews;
  } catch (error: any) {
    console.error('[News] Error fetching news feed:', error.message);
    
    const now = new Date();
    const fallbacks = NEWS_TEMPLATES.map((tmpl, i) => {
      const minutesOffset = i * 20;
      const itemDate = new Date(now.getTime() - minutesOffset * 60 * 1000);
      const aiData = generateAiSummaryAndImpact(tmpl.title, tmpl.genre, tmpl.relatedAsset);
      return {
        title: tmpl.title,
        link: '#',
        pubDate: itemDate.toUTCString(),
        source: tmpl.source,
        genre: tmpl.genre,
        lat: tmpl.lat,
        lng: tmpl.lng,
        region: tmpl.region,
        relatedAsset: tmpl.relatedAsset || aiData.marketImpact.asset,
        summary: aiData.summary,
        marketImpact: aiData.marketImpact
      };
    });

    return fallbacks;
  }
}

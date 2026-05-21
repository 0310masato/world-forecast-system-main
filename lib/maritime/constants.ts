export const HORMUZ_BBOX = {
  minLat: 24.0,
  maxLat: 27.2,
  minLng: 54.0,
  maxLng: 58.8,
};

export interface Hotspot {
  id: string;
  name: string;
  lat: number;
  lng: number;
  description: string;
  type: 'naval_base' | 'island' | 'chokepoint' | 'anchorage' | 'port';
}

export const HOTSPOTS: Hotspot[] = [
  {
    id: 'chokepoint',
    name: 'ホルムズ海峡最狭部',
    lat: 26.58,
    lng: 56.42,
    description: '幅約33kmの国際航路チョークポイント。中東原油の主要輸送路。',
    type: 'chokepoint',
  },
  {
    id: 'bandar_abbas',
    name: 'バンダレ・アッバース海軍基地',
    lat: 27.14,
    lng: 56.22,
    description: 'イラン海軍および革命防衛隊（IRGC）の主要作戦本部。',
    type: 'naval_base',
  },
  {
    id: 'abu_musa',
    name: 'アブームーサー島',
    lat: 25.87,
    lng: 55.04,
    description: 'イランが実効支配し、UAEも領有権を主張する戦略的島嶼。軍事警戒エリア。',
    type: 'island',
  },
  {
    id: 'greater_tunb',
    name: '大トンブ島',
    lat: 26.26,
    lng: 55.30,
    description: 'ホルムズ海峡西部に位置する要衝島嶼。イラン軍が駐留。',
    type: 'island',
  },
  {
    id: 'fujairah',
    name: 'フジャイラ停泊地',
    lat: 25.18,
    lng: 56.38,
    description: 'UAE東海岸の世界最大級の給油・待機泊地。海峡外側に位置する。',
    type: 'anchorage',
  },
  {
    id: 'jask',
    name: 'ジャスク港',
    lat: 25.64,
    lng: 57.77,
    description: 'イランの海峡外側にある原油輸出基地および海軍拠点。',
    type: 'port',
  },
  {
    id: 'arak_island',
    name: 'ラーラク島',
    lat: 26.85,
    lng: 56.36,
    description: '最狭部の南側に位置するイランの防衛拠点島嶼。',
    type: 'island',
  },
];

// Shipping lanes represented as coordinate paths (Traffic Separation Schemes)
export const SHIPPING_LANES = {
  // Inbound Lane (entering Persian Gulf - North-East side)
  inbound: [
    { lat: 25.30, lng: 57.60 },
    { lat: 26.15, lng: 56.80 },
    { lat: 26.50, lng: 56.55 },
    { lat: 26.62, lng: 56.25 },
    { lat: 26.55, lng: 55.90 },
    { lat: 26.30, lng: 55.20 },
    { lat: 26.00, lng: 54.50 },
  ],
  // Outbound Lane (leaving Persian Gulf - South-West side)
  outbound: [
    { lat: 25.90, lng: 54.40 },
    { lat: 26.18, lng: 55.10 },
    { lat: 26.43, lng: 55.85 },
    { lat: 26.50, lng: 56.20 },
    { lat: 26.38, lng: 56.45 },
    { lat: 26.00, lng: 56.70 },
    { lat: 25.15, lng: 57.50 },
  ],
};

export const ACTORS = ['US', 'Iran', 'Saudi Arabia', 'UAE', 'Houthi'];

export const NEWS_CATEGORIES = [
  'US_IRAN',
  'REGIONAL_MILITARY',
  'MARITIME_INCIDENT',
  'ENERGY_SECURITY',
  'OTHER',
];

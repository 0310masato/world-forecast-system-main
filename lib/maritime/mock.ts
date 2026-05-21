import { Vessel, WeatherCondition } from './types';
import { SHIPPING_LANES } from './constants';

// Helper to interpolate along shipping lanes
function interpolateCoordinates(
  lane: { lat: number; lng: number }[],
  fraction: number
): { lat: number; lng: number; heading: number } {
  const n = lane.length;
  if (n < 2) return { lat: 0, lng: 0, heading: 0 };

  // Scale fraction to segment index
  const scaledFraction = fraction * (n - 1);
  const idx = Math.min(Math.floor(scaledFraction), n - 2);
  const segFraction = scaledFraction - idx;

  const p1 = lane[idx];
  const p2 = lane[idx + 1];

  const lat = p1.lat + (p2.lat - p1.lat) * segFraction;
  const lng = p1.lng + (p2.lng - p1.lng) * segFraction;

  // Calculate heading (approximate bearing)
  const dy = p2.lat - p1.lat;
  const dx = (p2.lng - p1.lng) * Math.cos((p1.lat * Math.PI) / 180);
  let heading = Math.atan2(dx, dy) * (180 / Math.PI);
  if (heading < 0) heading += 360;

  return { lat, lng, heading };
}

// Generate dynamic vessels based on timestamp
export function getMockVessels(timestamp: number = Date.now()): Vessel[] {
  const timeSec = timestamp / 1000;
  
  // Define 10 simulated vessels with dynamic positions
  const vessels: Vessel[] = [
    {
      id: '477995100', // crude oil tanker
      name: 'VALE SPLENDOR',
      type: 'Crude Oil Tanker',
      lat: 0, lng: 0, heading: 0, course: 0,
      speed: 14.5,
      status: 'Under way using engine',
      destination: 'CHIBA, JAPAN',
      origin: 'RAS TANURA, SAUDI ARABIA',
      cargo: '原油 (約200万バレル - 推定)',
      cargoConfidence: 'HIGH',
      routeConfidence: 'HIGH',
      stopReason: null,
      stopReasonConfidence: null,
      aisAnomalySuspicion: false,
      aisAnomalyType: 'none',
      aisAnomalyConfidence: null,
      lastUpdated: new Date(timestamp).toISOString(),
    },
    {
      id: '477112200', // LNG carrier
      name: 'QATAR APEX',
      type: 'LNG / LPG Carrier',
      lat: 0, lng: 0, heading: 0, course: 0,
      speed: 16.2,
      status: 'Under way using engine',
      destination: 'ROTTERDAM, NETHERLANDS',
      origin: 'RAS LAFFAN, QATAR',
      cargo: '液化天然ガス (約16万m3 - 推定)',
      cargoConfidence: 'HIGH',
      routeConfidence: 'HIGH',
      stopReason: null,
      stopReasonConfidence: null,
      aisAnomalySuspicion: false,
      aisAnomalyType: 'none',
      aisAnomalyConfidence: null,
      lastUpdated: new Date(timestamp).toISOString(),
    },
    {
      id: '352002340', // Container
      name: 'EVER HORIZON',
      type: 'Container Ship',
      lat: 0, lng: 0, heading: 0, course: 0,
      speed: 18.0,
      status: 'Under way using engine',
      destination: 'JEBEL ALI, UAE',
      origin: 'SHANGHAI, CHINA',
      cargo: 'コンテナ貨物 (電気機械・消費財 - 推定)',
      cargoConfidence: 'MEDIUM',
      routeConfidence: 'HIGH',
      stopReason: null,
      stopReasonConfidence: null,
      aisAnomalySuspicion: false,
      aisAnomalyType: 'none',
      aisAnomalyConfidence: null,
      lastUpdated: new Date(timestamp).toISOString(),
    },
    {
      id: '248329000', // product tanker (anchored at Fujairah)
      name: 'FUJAIRAH STAR',
      type: 'Product Tanker',
      lat: 25.18 + Math.sin(timeSec / 1000) * 0.005,
      lng: 56.38 + Math.cos(timeSec / 1000) * 0.005,
      heading: 185,
      course: 185,
      speed: 0.1,
      status: 'At anchor',
      destination: 'FUJAIRAH, UAE',
      origin: 'SINGAPORE',
      cargo: '精製燃料油 (ガソリン/軽油 約45万バレル - 推定)',
      cargoConfidence: 'HIGH',
      routeConfidence: 'MEDIUM',
      stopReason: '給油および船員交代のための待機 (推定)',
      stopReasonConfidence: 'HIGH',
      aisAnomalySuspicion: false,
      aisAnomalyType: 'none',
      aisAnomalyConfidence: null,
      lastUpdated: new Date(timestamp).toISOString(),
    },
    {
      id: '372411000', // bulk carrier
      name: 'GRAIN LEADER',
      type: 'Bulk Carrier',
      lat: 0, lng: 0, heading: 0, course: 0,
      speed: 12.8,
      status: 'Under way using engine',
      destination: 'BANDAR IMAM KHOMEINI, IRAN',
      origin: 'NEW ORLEANS, USA',
      cargo: '穀物 (大豆 約6.5万トン - 推定)',
      cargoConfidence: 'HIGH',
      routeConfidence: 'HIGH',
      stopReason: null,
      stopReasonConfidence: null,
      aisAnomalySuspicion: false,
      aisAnomalyType: 'none',
      aisAnomalyConfidence: null,
      lastUpdated: new Date(timestamp).toISOString(),
    },
    {
      id: '477009220', // crude oil tanker stopped near Bandar Abbas
      name: 'IRAN SHAHID',
      type: 'Crude Oil Tanker',
      lat: 27.05,
      lng: 56.12,
      heading: 85,
      course: 85,
      speed: 0.0,
      status: 'Not under command',
      destination: 'BANDAR ABBAS, IRAN',
      origin: 'UNKNOWN',
      cargo: '原油 (約100万バレル - 推定)',
      cargoConfidence: 'LOW',
      routeConfidence: 'LOW',
      stopReason: 'ポートクリアランス待ち、または一時的な機関点検の可能性あり (推定)',
      stopReasonConfidence: 'MEDIUM',
      aisAnomalySuspicion: false,
      aisAnomalyType: 'none',
      aisAnomalyConfidence: null,
      lastUpdated: new Date(timestamp - 300000).toISOString(),
    },
    {
      id: '636018240', // Tug / Pilot / Service
      name: 'HORMUZ RESCUE 2',
      type: 'Tug / Pilot / Service',
      lat: 26.61,
      lng: 56.46,
      heading: 210,
      course: 210,
      speed: 9.2,
      status: 'Restricted in her ability to maneuver',
      destination: 'LARAK ISLAND, IRAN',
      origin: 'BANDAR ABBAS, IRAN',
      cargo: '特段の貨物なし (巡回救助艇 - 推定)',
      cargoConfidence: 'HIGH',
      routeConfidence: 'MEDIUM',
      stopReason: null,
      stopReasonConfidence: null,
      aisAnomalySuspicion: false,
      aisAnomalyType: 'none',
      aisAnomalyConfidence: null,
      lastUpdated: new Date(timestamp).toISOString(),
    },
    {
      id: '999111222', // Anomaly vessel: suspected Position Jump
      name: 'DESH SPIRIT',
      type: 'Crude Oil Tanker',
      lat: 0, lng: 0, heading: 0, course: 0,
      speed: 15.1,
      status: 'Under way using engine',
      destination: 'MUMBAI, INDIA',
      origin: 'KUWAIT CITY, KUWAIT',
      cargo: '原油 (約180万バレル - 推定)',
      cargoConfidence: 'MEDIUM',
      routeConfidence: 'HIGH',
      stopReason: '位置ジャンプ検出（一時的なGPS受信誤差またはデータ欠損の可能性あり）(推定)',
      stopReasonConfidence: 'MEDIUM',
      aisAnomalySuspicion: true,
      aisAnomalyType: 'position_jump',
      aisAnomalyConfidence: 'MEDIUM',
      lastUpdated: new Date(timestamp).toISOString(),
    },
    {
      id: '538008770', // General Cargo
      name: 'AL SALAM MERCHANT',
      type: 'General Cargo',
      lat: 0, lng: 0, heading: 0, course: 0,
      speed: 11.4,
      status: 'Under way using engine',
      destination: 'SHARJAH, UAE',
      origin: 'KARACHI, PAKISTAN',
      cargo: '建築用資材・一般雑貨 (推定)',
      cargoConfidence: 'MEDIUM',
      routeConfidence: 'HIGH',
      stopReason: null,
      stopReasonConfidence: null,
      aisAnomalySuspicion: false,
      aisAnomalyType: 'none',
      aisAnomalyConfidence: null,
      lastUpdated: new Date(timestamp).toISOString(),
    },
    {
      id: '999888777', // Anomaly vessel: missing fields, signal delay
      name: 'UNKNOWN VESSEL 03',
      type: 'Unknown',
      lat: 25.92,
      lng: 55.12, // near Abu Musa
      heading: 270,
      course: 270,
      speed: 1.5,
      status: 'Stopped',
      destination: 'UNKNOWN',
      origin: 'UNKNOWN',
      cargo: '判別不能 (推定)',
      cargoConfidence: 'LOW',
      routeConfidence: 'LOW',
      stopReason: 'AIS異常疑い（通信遅延またはデータ欠損の可能性あり）(推定)',
      stopReasonConfidence: 'LOW',
      aisAnomalySuspicion: true,
      aisAnomalyType: 'signal_delay',
      aisAnomalyConfidence: 'LOW',
      lastUpdated: new Date(timestamp - 1800000).toISOString(),
    },
  ];

  // 1. Move moving vessels along shipping lanes using time-based math
  // VALE SPLENDOR: outbound lane, period of 120 seconds for full loop
  const t1 = (timeSec / 120) % 1.0;
  const p1 = interpolateCoordinates(SHIPPING_LANES.outbound, t1);
  vessels[0].lat = p1.lat;
  vessels[0].lng = p1.lng;
  vessels[0].heading = p1.heading;
  vessels[0].course = p1.heading;

  // QATAR APEX: outbound lane, offset by 0.35, period 140s
  const t2 = ((timeSec / 140) + 0.35) % 1.0;
  const p2 = interpolateCoordinates(SHIPPING_LANES.outbound, t2);
  vessels[1].lat = p2.lat;
  vessels[1].lng = p2.lng;
  vessels[1].heading = p2.heading;
  vessels[1].course = p2.heading;

  // EVER HORIZON: inbound lane, period 110s
  const t3 = (timeSec / 110) % 1.0;
  const p3 = interpolateCoordinates(SHIPPING_LANES.inbound, t3);
  vessels[2].lat = p3.lat;
  vessels[2].lng = p3.lng;
  vessels[2].heading = p3.heading;
  vessels[2].course = p3.heading;

  // GRAIN LEADER: inbound lane, offset 0.45, period 150s
  const t5 = ((timeSec / 150) + 0.45) % 1.0;
  const p5 = interpolateCoordinates(SHIPPING_LANES.inbound, t5);
  vessels[4].lat = p5.lat;
  vessels[4].lng = p5.lng;
  vessels[4].heading = p5.heading;
  vessels[4].course = p5.heading;

  // DESH SPIRIT (Anomaly position jump):
  // Let it move outbound but introduce a jump every 10 seconds
  const t8 = ((timeSec / 130) + 0.15) % 1.0;
  const p8 = interpolateCoordinates(SHIPPING_LANES.outbound, t8);
  const isJumping = Math.floor(timeSec / 10) % 2 === 0;
  
  vessels[7].lat = p8.lat + (isJumping ? 0.04 : 0);
  vessels[7].lng = p8.lng + (isJumping ? -0.05 : 0);
  vessels[7].heading = p8.heading;
  vessels[7].course = p8.heading;

  // AL SALAM MERCHANT: inbound lane, offset 0.7, period 160s
  const t9 = ((timeSec / 160) + 0.7) % 1.0;
  const p9 = interpolateCoordinates(SHIPPING_LANES.inbound, t9);
  vessels[8].lat = p9.lat;
  vessels[8].lng = p9.lng;
  vessels[8].heading = p9.heading;
  vessels[8].course = p9.heading;

  return vessels;
}

// Generate dynamic weather condition
export function getMockWeather(timestamp: number = Date.now()): WeatherCondition {
  const timeSec = timestamp / 1000;
  
  // Weather scenario cycles every 5 minutes
  const scenarioIndex = Math.floor(timeSec / 300) % 3;
  
  // Default values
  const temp = 33.5 + Math.sin(timeSec / 100) * 0.5;
  let windSpeed = 14 + Math.sin(timeSec / 120) * 2;
  let windDir = 220; // Shamal wind (South-West)
  let waveHeight = 1.1 + Math.sin(timeSec / 90) * 0.15;
  const currentSpeed = 1.3 + Math.sin(timeSec / 150) * 0.1;
  const currentDir = 135; // flows South-East
  let description = '晴天 (Clear)';
  let visibility = 16.0;
  const pressure = 1008 + Math.sin(timeSec / 300) * 1.5;

  if (scenarioIndex === 1) {
    // Dust haze scenario
    description = '黄砂・砂塵警報 (Dust Haze)';
    windSpeed += 6.0;
    windDir = 240;
    waveHeight += 0.5;
    visibility = 5.5; // low visibility
  } else if (scenarioIndex === 2) {
    // Foggy scenario
    description = '海霧発生 (Foggy)';
    windSpeed -= 4.0;
    waveHeight -= 0.3;
    visibility = 2.0; // very low visibility
  }

  return {
    temp: parseFloat(temp.toFixed(1)),
    windSpeed: parseFloat(windSpeed.toFixed(1)),
    windDir,
    waveHeight: parseFloat(waveHeight.toFixed(1)),
    currentSpeed: parseFloat(currentSpeed.toFixed(1)),
    currentDir,
    description,
    visibility,
    pressure: Math.round(pressure),
  };
}

export type VesselType =
  | 'Crude Oil Tanker'
  | 'Product Tanker'
  | 'LNG / LPG Carrier'
  | 'Container Ship'
  | 'Bulk Carrier'
  | 'General Cargo'
  | 'Tug / Pilot / Service'
  | 'Unknown';

export interface Vessel {
  id: string; // MMSI or simulated unique ID
  name: string;
  type: VesselType;
  lat: number;
  lng: number;
  heading: number;
  course: number;
  speed: number; // SOG in knots
  status: string; // e.g. "Under way using engine", "At anchor", "Stopped", etc.
  destination: string;
  origin: string;
  cargo: string;
  cargoConfidence: 'LOW' | 'MEDIUM' | 'HIGH';
  routeConfidence: 'LOW' | 'MEDIUM' | 'HIGH';
  stopReason: string | null;
  stopReasonConfidence: 'LOW' | 'MEDIUM' | 'HIGH' | null;
  aisAnomalySuspicion: boolean;
  aisAnomalyType: 'none' | 'position_jump' | 'signal_delay' | 'missing_data';
  aisAnomalyConfidence: 'LOW' | 'MEDIUM' | null;
  lastUpdated: string;
  isJapanBoundEnergyCarrier?: boolean;
  japanBoundConfidence?: 'LOW' | 'MEDIUM' | 'HIGH';
  japanVoyage?: JapanVoyageProfile;
}

export interface HormuzPassageHistoryEvent {
  timestamp: string;
  label: string;
  lat: number;
  lng: number;
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
  source: 'MOCK_AIS_ESTIMATE' | 'AIS_ESTIMATE';
}

export interface JapanVoyageProfile {
  isJapanBound: boolean;
  originCountry: string;
  loadingPort: string;
  destinationCountry: 'Japan';
  destinationPort: string;
  destinationRegion: string;
  cargoForJapan: string;
  cargoCategory: 'CRUDE_OIL' | 'LNG' | 'REFINED_PRODUCT' | 'OTHER';
  voyageConfidence: 'LOW' | 'MEDIUM' | 'HIGH';
  hormuzPassageStatus: 'APPROACHING' | 'IN_TRANSIT' | 'PASSED' | 'UNKNOWN';
  estimatedHormuzPassedAt: string | null;
  hormuzPassageHistory: HormuzPassageHistoryEvent[];
  sourceType: 'MOCK' | 'SIMULATED' | 'AIS_ESTIMATED';
  recordId: string;
  cautionLabel: string;
  safetyLabel: string;
}

export interface JapanBoundTankerRecord {
  recordId: string;
  vesselId: string;
  vesselName: string;
  vesselType: VesselType;
  currentLat: number;
  currentLng: number;
  speed: number;
  heading: number;
  originCountry: string;
  loadingPort: string;
  cargoForJapan: string;
  cargoCategory: JapanVoyageProfile['cargoCategory'];
  destinationPort: string;
  destinationRegion: string;
  hormuzPassageStatus: JapanVoyageProfile['hormuzPassageStatus'];
  estimatedHormuzPassedAt: string | null;
  hormuzPassageHistory: HormuzPassageHistoryEvent[];
  voyageConfidence: JapanVoyageProfile['voyageConfidence'];
  sourceType: JapanVoyageProfile['sourceType'];
  lastUpdated: string;
  cautionLabel: string;
  safetyLabel: string;
  isMock: boolean;
}

export interface WeatherCondition {
  temp: number; // Celsius
  windSpeed: number; // knots
  windDir: number; // degrees
  waveHeight: number; // meters
  currentSpeed: number; // knots
  currentDir: number; // degrees
  description: string;
  visibility: number; // km
  pressure: number; // hPa
}

export type NewsCategory =
  | 'US_IRAN'
  | 'REGIONAL_MILITARY'
  | 'MARITIME_INCIDENT'
  | 'ENERGY_SECURITY'
  | 'OTHER';

export interface GeopoliticalNews {
  id: string;
  title: string;
  summary: string;
  source: string;
  sourceType: 'OFFICIAL' | 'OSINT' | 'MOCK' | 'SOCIAL';
  verificationStatus: 'OFFICIAL' | 'REPORTED' | 'UNCONFIRMED' | 'SIMULATED';
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
  url?: string;
  timestamp: string;
  categories: NewsCategory[];
  actors: string[];
  alertLevel: 'LOW' | 'GUARDED' | 'ELEVATED' | 'HIGH' | 'CRITICAL';
  cautionLabel: string | null;
  location: { lat: number; lng: number; name: string } | null;
}

export interface TensionIndexBreakdown {
  maritimeOperational: number;
  geopolitical: number;
  conflict: number;
  energySecurity: number;
  aisAnomaly: number;
}

export interface HormuzTensionData {
  score: number;
  level: 'LOW' | 'GUARDED' | 'ELEVATED' | 'HIGH' | 'CRITICAL';
  breakdown: TensionIndexBreakdown;
  lastUpdated: string;
}

export interface ActorMatrixRow {
  actor: string;
  mentions: number;
  latestCategory: string;
  signalLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface IncidentTimelineEvent {
  id: string;
  timestamp: string;
  type: 'VesselAnomaly' | 'GeopoliticalNews' | 'WeatherIncident' | 'TensionChange' | 'JapanBoundPassage';
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  vesselId: string | null;
  location: { lat: number; lng: number } | null;
}

import type { JapanBoundTankerRecord, Vessel } from './types';

const JAPAN_ENERGY_VESSEL_TYPES = new Set<Vessel['type']>([
  'Crude Oil Tanker',
  'Product Tanker',
  'LNG / LPG Carrier',
]);

export function isJapanBoundEnergyTanker(vessel: Vessel): boolean {
  const hasJapanVoyage = vessel.japanVoyage?.isJapanBound === true;
  const isFlagged = vessel.isJapanBoundEnergyCarrier ?? hasJapanVoyage;
  return Boolean(isFlagged && hasJapanVoyage && JAPAN_ENERGY_VESSEL_TYPES.has(vessel.type));
}

export function getJapanBoundEnergyTankers(vessels: Vessel[]): Vessel[] {
  return vessels.filter(isJapanBoundEnergyTanker);
}

export function toJapanBoundTankerRecord(vessel: Vessel, isMock: boolean): JapanBoundTankerRecord | null {
  const voyage = vessel.japanVoyage;
  if (!voyage || !isJapanBoundEnergyTanker(vessel)) return null;

  return {
    recordId: voyage.recordId,
    vesselId: vessel.id,
    vesselName: vessel.name,
    vesselType: vessel.type,
    currentLat: vessel.lat,
    currentLng: vessel.lng,
    speed: vessel.speed,
    heading: vessel.heading,
    originCountry: voyage.originCountry,
    loadingPort: voyage.loadingPort,
    cargoForJapan: voyage.cargoForJapan,
    cargoCategory: voyage.cargoCategory,
    destinationPort: voyage.destinationPort,
    destinationRegion: voyage.destinationRegion,
    hormuzPassageStatus: voyage.hormuzPassageStatus,
    estimatedHormuzPassedAt: voyage.estimatedHormuzPassedAt,
    hormuzPassageHistory: voyage.hormuzPassageHistory,
    voyageConfidence: voyage.voyageConfidence,
    sourceType: voyage.sourceType,
    lastUpdated: vessel.lastUpdated,
    cautionLabel: voyage.cautionLabel,
    safetyLabel: voyage.safetyLabel,
    isMock,
  };
}

export function toJapanBoundTankerRecords(vessels: Vessel[], isMock: boolean): JapanBoundTankerRecord[] {
  return vessels
    .map((vessel) => toJapanBoundTankerRecord(vessel, isMock))
    .filter((record): record is JapanBoundTankerRecord => record !== null);
}

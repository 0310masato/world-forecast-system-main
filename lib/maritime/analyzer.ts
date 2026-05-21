import { Vessel } from './types';

// Helper to calculate distance in km between two lat/lng coordinates (Haversine formula)
export function getDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Radius of the earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

export function analyzeVessel(vessel: Vessel, allVessels: Vessel[]): Vessel {
  const analyzed = { ...vessel };

  // 1. Determine stop reason and confidence if ship is stopped or moving very slowly
  if (vessel.speed < 1.0) {
    let stopReason = '待機または停泊中 (推定)';
    let stopReasonConfidence: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';

    // Check proximity to key anchorages / ports
    const nearFujairah = getDistance(vessel.lat, vessel.lng, 25.18, 56.38) < 15;
    const nearBandarAbbas = getDistance(vessel.lat, vessel.lng, 27.14, 56.22) < 15;
    const nearAbuMusa = getDistance(vessel.lat, vessel.lng, 25.87, 55.04) < 10;

    if (nearFujairah) {
      stopReason = 'フジャイラ沖泊地での給油・補給待機 (推定)';
      stopReasonConfidence = 'HIGH';
    } else if (nearBandarAbbas) {
      stopReason = 'バンダレ・アッバース港湾の入港・通関クリアランス待ち (推定)';
      stopReasonConfidence = 'HIGH';
    } else if (nearAbuMusa) {
      stopReason = '領海境界付近での警戒または待機 (推定)';
      stopReasonConfidence = 'MEDIUM';
    } else {
      // Check if near other stopped ships (congestion)
      const nearbyStoppedCount = allVessels.filter(
        (v) =>
          v.id !== vessel.id &&
          v.speed < 1.0 &&
          getDistance(vessel.lat, vessel.lng, v.lat, v.lng) < 5
      ).length;

      if (nearbyStoppedCount >= 2) {
        stopReason = '周辺海域混雑に伴う調整待機 (推定)';
        stopReasonConfidence = 'MEDIUM';
      } else if (vessel.status === 'Not under command' || vessel.status === 'Restricted in her ability to maneuver') {
        stopReason = '機関トラブルまたは操船制限に伴う一時停止の可能性 (推定)';
        stopReasonConfidence = 'MEDIUM';
      }
    }

    analyzed.stopReason = stopReason;
    analyzed.stopReasonConfidence = stopReasonConfidence;
  } else {
    analyzed.stopReason = null;
    analyzed.stopReasonConfidence = null;
  }

  // 2. Anomaly status verification and renaming
  // Standardize terms: Do not use "GPS Spoofing" directly; use suspicious tags
  if (analyzed.aisAnomalySuspicion) {
    if (analyzed.aisAnomalyType === 'position_jump') {
      analyzed.stopReason = 'AIS異常疑い（位置ジャンプ検出、受信誤差やデータ欠損の可能性あり）(推定)';
      analyzed.stopReasonConfidence = 'MEDIUM';
      analyzed.aisAnomalyConfidence = 'MEDIUM';
    } else if (analyzed.aisAnomalyType === 'signal_delay' || analyzed.aisAnomalyType === 'missing_data') {
      analyzed.stopReason = 'AIS受信異常疑い（通信遅延・受信誤差・データ欠損の可能性あり）(推定)';
      analyzed.stopReasonConfidence = 'LOW';
      analyzed.aisAnomalyConfidence = 'LOW';
    }
  }

  return analyzed;
}

export function analyzeAllVessels(vessels: Vessel[]): Vessel[] {
  return vessels.map((v) => analyzeVessel(v, vessels));
}

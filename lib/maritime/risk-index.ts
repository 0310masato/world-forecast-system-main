import { Vessel, GeopoliticalNews, WeatherCondition, HormuzTensionData, TensionIndexBreakdown } from './types';

export function calculateTensionIndex(
  vessels: Vessel[],
  news: GeopoliticalNews[],
  weather: WeatherCondition,
  now: number = Date.now()
): HormuzTensionData {
  // 1. AIS Anomaly Score
  // Calculated based on the count and confidence of active anomalies
  const anomalyVessels = vessels.filter((v) => v.aisAnomalySuspicion);
  let aisAnomalyScore = 0;
  if (vessels.length > 0) {
    const baseAnomalyRatio = anomalyVessels.length / vessels.length;
    let weightedCount = 0;
    anomalyVessels.forEach((v) => {
      if (v.aisAnomalyConfidence === 'MEDIUM') weightedCount += 1.5;
      else if (v.aisAnomalyConfidence === 'LOW') weightedCount += 0.8;
      else weightedCount += 0.5;
    });
    aisAnomalyScore = Math.min(100, baseAnomalyRatio * 200 + weightedCount * 15);
  }

  // 2. Maritime Operational Risk
  // Based on weather conditions and vessel speeds/stoppages
  let weatherRisk = 0;
  if (weather.windSpeed > 25) weatherRisk += 25;
  else if (weather.windSpeed > 15) weatherRisk += 10;

  if (weather.waveHeight > 2.5) weatherRisk += 30;
  else if (weather.waveHeight > 1.5) weatherRisk += 15;

  if (weather.visibility < 3) weatherRisk += 30;
  else if (weather.visibility < 8) weatherRisk += 15;

  const stoppedVessels = vessels.filter((v) => v.speed < 1.0);
  const stoppageRisk = vessels.length > 0 ? (stoppedVessels.length / vessels.length) * 40 : 0;

  const maritimeOperationalScore = Math.min(100, Math.round(weatherRisk + stoppageRisk));

  // 3. Geopolitical and Conflict Risks
  // Based on news items with linear decay over 48 hours
  let geopoliticalContribution = 0;
  let conflictContribution = 0;
  let energyContribution = 0;

  const DECAY_PERIOD_MS = 48 * 60 * 60 * 1000; // 48 hours decay

  news.forEach((item) => {
    const newsTime = new Date(item.timestamp).getTime();
    const elapsed = now - newsTime;
    if (elapsed < 0 || elapsed > DECAY_PERIOD_MS) return;

    // Time decay factor: 1.0 (recent) down to 0.0 (48 hours old)
    const decay = 1.0 - elapsed / DECAY_PERIOD_MS;

    // Score based on alert level
    let baseNewsScore = 10;
    if (item.alertLevel === 'CRITICAL') baseNewsScore = 90;
    else if (item.alertLevel === 'HIGH') baseNewsScore = 60;
    else if (item.alertLevel === 'ELEVATED') baseNewsScore = 35;
    else if (item.alertLevel === 'GUARDED') baseNewsScore = 20;

    // Cap the contribution based on confidence level
    // Low confidence news maximum contribution is capped to 15
    // Medium confidence news maximum contribution is capped to 45
    let confidenceCap = 100;
    if (item.confidence === 'LOW') confidenceCap = 15;
    else if (item.confidence === 'MEDIUM') confidenceCap = 45;

    const finalNewsContribution = Math.min(baseNewsScore, confidenceCap) * decay;

    // Distribute to categories
    if (item.categories.includes('US_IRAN') || item.categories.includes('REGIONAL_MILITARY')) {
      geopoliticalContribution += finalNewsContribution * 0.6;
    } else {
      geopoliticalContribution += finalNewsContribution * 0.3;
    }

    if (item.categories.includes('REGIONAL_MILITARY') || item.actors.includes('Houthi')) {
      conflictContribution += finalNewsContribution * 0.8;
    } else if (item.categories.includes('MARITIME_INCIDENT')) {
      conflictContribution += finalNewsContribution * 0.5;
    }

    if (item.categories.includes('ENERGY_SECURITY')) {
      energyContribution += finalNewsContribution * 0.8;
    } else if (item.categories.includes('US_IRAN')) {
      energyContribution += finalNewsContribution * 0.3;
    }
  });

  const geopoliticalScore = Math.min(100, Math.round(geopoliticalContribution));
  const conflictScore = Math.min(100, Math.round(conflictContribution));
  const energySecurityScore = Math.min(100, Math.round(energyContribution));

  // Combine scores with weights
  // 15% Operational, 25% Geopolitical, 30% Conflict, 20% Energy Security, 10% AIS Anomaly
  const totalScoreRaw =
    0.15 * maritimeOperationalScore +
    0.25 * geopoliticalScore +
    0.3 * conflictScore +
    0.2 * energySecurityScore +
    0.1 * aisAnomalyScore;

  const score = Math.max(10, Math.min(100, Math.round(totalScoreRaw)));

  // Define alert levels
  let level: HormuzTensionData['level'] = 'LOW';
  if (score > 80) level = 'CRITICAL';
  else if (score > 60) level = 'HIGH';
  else if (score > 40) level = 'ELEVATED';
  else if (score > 20) level = 'GUARDED';

  const breakdown: TensionIndexBreakdown = {
    maritimeOperational: maritimeOperationalScore,
    geopolitical: geopoliticalScore,
    conflict: conflictScore,
    energySecurity: energySecurityScore,
    aisAnomaly: Math.round(aisAnomalyScore),
  };

  return {
    score,
    level,
    breakdown,
    lastUpdated: new Date(now).toISOString(),
  };
}

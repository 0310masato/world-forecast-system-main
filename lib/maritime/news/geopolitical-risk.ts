import { GeopoliticalNews } from '../types';

export function calculateNewsRiskScore(newsItem: GeopoliticalNews): number {
  let baseScore = 10;

  // 1. Add score based on categories
  if (newsItem.categories.includes('REGIONAL_MILITARY')) {
    baseScore += 30;
  }
  if (newsItem.categories.includes('MARITIME_INCIDENT')) {
    baseScore += 25;
  }
  if (newsItem.categories.includes('ENERGY_SECURITY')) {
    baseScore += 20;
  }
  if (newsItem.categories.includes('US_IRAN')) {
    baseScore += 15;
  }

  // 2. Add score based on actors
  if (newsItem.actors.includes('Houthi')) {
    baseScore += 15;
  }
  if (newsItem.actors.includes('Iran') && newsItem.actors.includes('US')) {
    baseScore += 10;
  }

  // 3. Add score based on alert level
  switch (newsItem.alertLevel) {
    case 'CRITICAL':
      baseScore += 30;
      break;
    case 'HIGH':
      baseScore += 20;
      break;
    case 'ELEVATED':
      baseScore += 10;
      break;
    case 'GUARDED':
      baseScore += 5;
      break;
  }

  // 4. Adjust by confidence to cap/reduce contribution of uncertain news
  let multiplier = 1.0;
  if (newsItem.confidence === 'LOW') {
    multiplier = 0.3;
  } else if (newsItem.confidence === 'MEDIUM') {
    multiplier = 0.7;
  }

  return Math.round(Math.min(100, baseScore * multiplier));
}

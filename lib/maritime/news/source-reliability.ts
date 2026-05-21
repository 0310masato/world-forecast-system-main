import { GeopoliticalNews } from '../types';

export function evaluateConfidence(
  sourceType: GeopoliticalNews['sourceType'],
  verificationStatus: GeopoliticalNews['verificationStatus']
): 'LOW' | 'MEDIUM' | 'HIGH' {
  if (sourceType === 'MOCK' || verificationStatus === 'SIMULATED') {
    return 'MEDIUM';
  }

  // If the news is unconfirmed or from a social media source, it should NEVER have HIGH confidence
  if (verificationStatus === 'UNCONFIRMED') {
    return 'LOW';
  }

  if (sourceType === 'SOCIAL') {
    return 'MEDIUM'; // Or LOW if unconfirmed
  }

  // Official verified statements get HIGH
  if (sourceType === 'OFFICIAL' && verificationStatus === 'OFFICIAL') {
    return 'HIGH';
  }

  // Reported OSINT or news agency reports get MEDIUM or HIGH depending on status
  if (sourceType === 'OSINT') {
    if (verificationStatus === 'OFFICIAL') return 'HIGH';
    if (verificationStatus === 'REPORTED') return 'MEDIUM';
    return 'LOW';
  }

  return 'LOW';
}

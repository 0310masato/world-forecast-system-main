import {
  CONFIDENCES,
  PROPOSAL_STATUSES,
  SOURCE_KINDS,
  type Confidence,
  type JsonValue,
  type ProposalStatus,
  type SourceKind,
} from './types';

export class MemoryValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MemoryValidationError';
  }
}

export const REAL_EVIDENCE_SOURCE_KINDS: readonly SourceKind[] = [
  'real_api',
  'real_rss',
] as const;

export const NON_REAL_EVIDENCE_SOURCE_KINDS: readonly SourceKind[] = [
  'mock',
  'simulated',
  'fallback_template',
] as const;

const SOURCE_KIND_SET = new Set<string>(SOURCE_KINDS);
const CONFIDENCE_SET = new Set<string>(CONFIDENCES);
const PROPOSAL_STATUS_SET = new Set<string>(PROPOSAL_STATUSES);
const REAL_EVIDENCE_SOURCE_KIND_SET = new Set<string>(REAL_EVIDENCE_SOURCE_KINDS);
const NON_REAL_EVIDENCE_SOURCE_KIND_SET = new Set<string>(NON_REAL_EVIDENCE_SOURCE_KINDS);

const RESTRICTED_CONTENT_PATTERNS = [
  {
    name: 'secret-like value',
    pattern: /\b(?:api[_-]?key|token|secret|password|credential|oauth[_-]?token)\s*[:=]/i,
  },
  {
    name: 'known secret environment name',
    pattern: /\b(?:OPENAI_API_KEY|GEMINI_API_KEY|NEWSAPI_API_KEY|AISSTREAM_API_KEY)\b/i,
  },
  {
    name: 'private key material',
    pattern: /-----BEGIN [A-Z ]*PRIVATE KEY-----/i,
  },
  {
    name: 'OpenAI key-like value',
    pattern: /\bsk-[A-Za-z0-9_-]{12,}\b/,
  },
  {
    name: '.env reference',
    pattern: /(^|[\\/\s'"`])\.env(?:\.[A-Za-z0-9_-]+)?($|[\\/\s'"`:])/i,
  },
  {
    name: 'Windows local path',
    pattern: /\b[A-Za-z]:[\\/][^\r\n'"`<>|]+/,
  },
  {
    name: 'UNC path',
    pattern: /\\\\[^\\/\s]+[\\/][^\\/\s]+/,
  },
  {
    name: 'file URL path',
    pattern: /\bfile:\/\/\//i,
  },
  {
    name: 'POSIX local path',
    pattern: /(^|[\s'"`])\/(?:Users|home|tmp|var|etc|mnt|Volumes)\/[^\s'"`]+/,
  },
  {
    name: 'private network host reference',
    pattern: /\b(?:10(?:\.\d{1,3}){3}|192\.168(?:\.\d{1,3}){2}|172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})\b/,
  },
] as const;

function fail(message: string): never {
  throw new MemoryValidationError(message);
}

export function assertSourceKind(value: unknown): SourceKind {
  if (typeof value !== 'string' || !SOURCE_KIND_SET.has(value)) {
    fail('source_kind must be one of the Memory Layer v0.1 allowed values.');
  }

  return value as SourceKind;
}

export function assertConfidence(value: unknown): Confidence {
  if (typeof value !== 'string' || !CONFIDENCE_SET.has(value)) {
    fail('confidence must be low, medium, or high.');
  }

  return value as Confidence;
}

export function assertProposalStatus(value: unknown): ProposalStatus {
  if (typeof value !== 'string' || !PROPOSAL_STATUS_SET.has(value)) {
    fail('proposal_status must be a valid review status.');
  }

  return value as ProposalStatus;
}

export function isRealEvidenceSourceKind(sourceKind: SourceKind): boolean {
  return REAL_EVIDENCE_SOURCE_KIND_SET.has(sourceKind);
}

export function isNonRealEvidenceSourceKind(sourceKind: SourceKind): boolean {
  return NON_REAL_EVIDENCE_SOURCE_KIND_SET.has(sourceKind);
}

export function assertConfidencePolicy(params: {
  sourceKind: SourceKind;
  confidence: Confidence;
  sourceRef?: string | null;
  isMock?: boolean;
  requireSourceRefForHigh?: boolean;
}): void {
  if (params.confidence === 'high' && !isRealEvidenceSourceKind(params.sourceKind)) {
    fail('high confidence is only allowed for real_api or real_rss records.');
  }

  if (params.confidence === 'high' && params.requireSourceRefForHigh && !params.sourceRef) {
    fail('high confidence records with source_ref support must include source_ref.');
  }

  if (isRealEvidenceSourceKind(params.sourceKind) && params.isMock === true) {
    fail('real_api and real_rss records cannot be marked as mock evidence.');
  }
}

export function resolveIsMockFlag(sourceKind: SourceKind, isMock?: boolean): boolean {
  if (isNonRealEvidenceSourceKind(sourceKind)) {
    return true;
  }

  return isMock === true;
}

export function normalizeRequiredText(value: unknown, fieldName: string): string {
  if (typeof value !== 'string') {
    fail(`${fieldName} must be a non-empty string.`);
  }

  const normalized = value.trim();
  if (!normalized) {
    fail(`${fieldName} must be a non-empty string.`);
  }

  assertSafeString(normalized, fieldName);
  return normalized;
}

export function normalizeOptionalText(value: unknown, fieldName: string): string | null {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value !== 'string') {
    fail(`${fieldName} must be a string when provided.`);
  }

  const normalized = value.trim();
  if (!normalized) {
    return null;
  }

  assertSafeString(normalized, fieldName);
  return normalized;
}

export function normalizeUnixSeconds(value: unknown, fieldName: string): number {
  if (!Number.isInteger(value) || Number(value) < 0) {
    fail(`${fieldName} must be a non-negative integer Unix timestamp in seconds.`);
  }

  return Number(value);
}

export function normalizeOptionalNumber(value: unknown, fieldName: string): number | null {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value !== 'number' || !Number.isFinite(value)) {
    fail(`${fieldName} must be a finite number when provided.`);
  }

  return value;
}

export function normalizeRequiredNumber(value: unknown, fieldName: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    fail(`${fieldName} must be a finite number.`);
  }

  return value;
}

export function normalizeLimit(value: unknown, defaultLimit = 20, maxLimit = 100): number {
  if (value === undefined) {
    return defaultLimit;
  }

  if (!Number.isInteger(value) || Number(value) < 1) {
    fail('limit must be a positive integer.');
  }

  return Math.min(Number(value), maxLimit);
}

export function serializeJsonValue(value: JsonValue | undefined, fieldName: string): string | null {
  if (value === undefined) {
    return null;
  }

  assertNoRestrictedContent(value, fieldName);

  const serialized = JSON.stringify(value);
  if (serialized === undefined) {
    fail(`${fieldName} must be JSON serializable.`);
  }

  return serialized;
}

export function assertNoRestrictedContent(value: unknown, context = 'input'): void {
  const seen = new Set<object>();

  function visit(current: unknown, currentContext: string): void {
    if (current === null || current === undefined) {
      return;
    }

    if (typeof current === 'string') {
      assertSafeString(current, currentContext);
      return;
    }

    if (typeof current === 'number' || typeof current === 'boolean') {
      return;
    }

    if (typeof current === 'bigint' || typeof current === 'symbol' || typeof current === 'function') {
      fail(`${currentContext} contains a value type that cannot be stored as safe JSON.`);
    }

    if (current instanceof Date) {
      return;
    }

    if (typeof current === 'object') {
      if (seen.has(current)) {
        fail(`${currentContext} contains a circular reference.`);
      }
      seen.add(current);

      if (Array.isArray(current)) {
        current.forEach((item, index) => visit(item, `${currentContext}[${index}]`));
        return;
      }

      for (const [key, nestedValue] of Object.entries(current as Record<string, unknown>)) {
        assertSafeString(key, `${currentContext} key`);
        visit(nestedValue, `${currentContext}.${key}`);
      }
      return;
    }

    fail(`${currentContext} contains an unsupported value.`);
  }

  visit(value, context);
}

function assertSafeString(value: string, fieldName: string): void {
  for (const { name, pattern } of RESTRICTED_CONTENT_PATTERNS) {
    if (pattern.test(value)) {
      fail(`${fieldName} contains restricted content: ${name}.`);
    }
  }
}

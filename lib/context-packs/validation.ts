import {
  assertNoRestrictedContent,
  normalizeLimit,
  normalizeOptionalText,
  normalizeRequiredText,
  normalizeUnixSeconds,
} from '../memory/validation';
import type {
  ContextPack,
  ContextPackBuildOptions,
  ContextPackPurpose,
} from './types';

export class ContextPackValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ContextPackValidationError';
  }
}

export const DEFAULT_CONTEXT_PACK_POLICY_REFS = [
  'docs/CODEX_APP_SERVER.md',
  'docs/HUMAN_APPROVAL.md',
  'docs/CONTEXT_PACKS.md',
  'docs/AI_ANALYSIS_JOBS.md',
  'docs/SELF_IMPROVEMENT_LOOP.md',
] as const;

export const CONTEXT_PACK_SAFETY_LABELS = [
  'AI analysis input',
  'Not production state',
  'Proposal-only context',
  'Human approval required',
  'Not investment advice',
  'Not navigation guidance',
  'Not military guidance',
  'Not automated trading guidance',
] as const;

export const DEFAULT_CONTEXT_PACK_LIMITATIONS = [
  'Context may be incomplete.',
  'Stale records are labeled and must not be treated as current facts.',
  'Mock, simulated, estimated, fallback, and local-cache labels are preserved from source records.',
  'Context packs are AI analysis inputs and are not production forecasts, prices, evaluations, or saved predictions.',
] as const;

const DEFAULT_PURPOSE: ContextPackPurpose = {
  job_type: 'forecast_review_notes',
  summary: 'Prepare review context for a proposal-only AI analysis job.',
};

function asContextPackError(error: unknown, fallbackMessage: string): ContextPackValidationError {
  if (error instanceof ContextPackValidationError) {
    return error;
  }

  if (error instanceof Error) {
    return new ContextPackValidationError(error.message);
  }

  return new ContextPackValidationError(fallbackMessage);
}

export function assertSafeContextPackValue(value: unknown, context = 'contextPack'): void {
  try {
    assertNoRestrictedContent(value, context);
  } catch (error) {
    throw asContextPackError(error, `${context} contains restricted content.`);
  }
}

export function getContextPackRestrictionReason(
  value: unknown,
  context = 'contextPack',
): string | null {
  try {
    assertSafeContextPackValue(value, context);
    return null;
  } catch (error) {
    return asContextPackError(error, `${context} contains restricted content.`).message;
  }
}

export function normalizeContextPackPurpose(
  purpose: Partial<ContextPackPurpose> | undefined,
): ContextPackPurpose {
  const jobType = normalizeRequiredText(
    purpose?.job_type ?? DEFAULT_PURPOSE.job_type,
    'purpose.job_type',
  ) as ContextPackPurpose['job_type'];
  const summary = normalizeRequiredText(
    purpose?.summary ?? DEFAULT_PURPOSE.summary,
    'purpose.summary',
  );

  return { job_type: jobType, summary };
}

export function normalizeContextPackPolicyRefs(policyRefs?: string[]): string[] {
  const refs = policyRefs ?? [...DEFAULT_CONTEXT_PACK_POLICY_REFS];

  if (!Array.isArray(refs) || refs.length === 0) {
    throw new ContextPackValidationError('policyRefs must contain at least one policy reference.');
  }

  return refs.map((ref, index) => normalizeRequiredText(ref, `policyRefs[${index}]`));
}

export function normalizeContextPackBuildOptions(options: ContextPackBuildOptions): {
  signalId: string;
  purpose: ContextPackPurpose;
  contextPackId: string | null;
  createdAt: number | null;
  now: number;
  maxRawEvents: number;
  maxMarketSnapshots: number;
  staleAfterSeconds: number;
  policyRefs: string[];
} {
  assertSafeContextPackValue(options, 'contextPackBuildOptions');

  const now = normalizeUnixSeconds(
    options.now ?? Math.floor(Date.now() / 1000),
    'now',
  );
  const staleAfterSeconds = normalizeLimit(
    options.staleAfterSeconds ?? 86_400,
    86_400,
    31_536_000,
  );

  return {
    signalId: normalizeRequiredText(options.signalId, 'signalId'),
    purpose: normalizeContextPackPurpose(options.purpose),
    contextPackId: normalizeOptionalText(options.contextPackId, 'contextPackId'),
    createdAt: options.createdAt === undefined
      ? null
      : normalizeUnixSeconds(options.createdAt, 'createdAt'),
    now,
    maxRawEvents: normalizeLimit(options.maxRawEvents, 10, 50),
    maxMarketSnapshots: normalizeLimit(options.maxMarketSnapshots, 10, 50),
    staleAfterSeconds,
    policyRefs: normalizeContextPackPolicyRefs(options.policyRefs),
  };
}

export function assertContextPackSafetyBoundary(contextPack: ContextPack): void {
  if (contextPack.human_review_required !== true) {
    throw new ContextPackValidationError('context pack must require human review.');
  }

  if (contextPack.proposal_only !== true || contextPack.is_production_state !== false) {
    throw new ContextPackValidationError('context pack must remain proposal-only non-production state.');
  }

  for (const requiredLabel of CONTEXT_PACK_SAFETY_LABELS) {
    if (!contextPack.safety_labels.includes(requiredLabel)) {
      throw new ContextPackValidationError(`context pack is missing safety label: ${requiredLabel}.`);
    }
  }

  assertSafeContextPackValue(contextPack, 'contextPack');
}

import { CONTEXT_PACK_SAFETY_LABELS } from '../context-packs/validation';
import { CONFIDENCES, SOURCE_KINDS, type Confidence, type SourceKind } from '../memory/types';
import { assertNoRestrictedContent } from '../memory/validation';
import {
  AI_ANALYSIS_JOB_ALLOWED_NEXT_STEP,
  AI_ANALYSIS_JOB_FORBIDDEN_NEXT_STEPS,
  AI_ANALYSIS_JOB_KINDS,
  type AIAnalysisJobApprovalBoundary,
  type AIAnalysisJobKind,
} from './types';

const AI_ANALYSIS_JOB_KIND_SET = new Set<string>(AI_ANALYSIS_JOB_KINDS);
const SOURCE_KIND_SET = new Set<string>(SOURCE_KINDS);
const CONFIDENCE_SET = new Set<string>(CONFIDENCES);
const REAL_EVIDENCE_SOURCE_KIND_SET = new Set<SourceKind>(['real_api', 'real_rss']);

export const AI_ANALYSIS_JOB_REQUIRED_SAFETY_LABELS: readonly string[] = [
  ...CONTEXT_PACK_SAFETY_LABELS,
] as const;

export function isAIAnalysisJobKind(value: unknown): value is AIAnalysisJobKind {
  return typeof value === 'string' && AI_ANALYSIS_JOB_KIND_SET.has(value);
}

export function isSourceKind(value: unknown): value is SourceKind {
  return typeof value === 'string' && SOURCE_KIND_SET.has(value);
}

export function isConfidence(value: unknown): value is Confidence {
  return typeof value === 'string' && CONFIDENCE_SET.has(value);
}

export function isRealEvidenceSourceKind(value: SourceKind): boolean {
  return REAL_EVIDENCE_SOURCE_KIND_SET.has(value);
}

export function makeAIAnalysisJobApprovalBoundary(): AIAnalysisJobApprovalBoundary {
  return {
    human_review_required: true,
    allowed_next_step: AI_ANALYSIS_JOB_ALLOWED_NEXT_STEP,
    forbidden_next_steps: [...AI_ANALYSIS_JOB_FORBIDDEN_NEXT_STEPS],
  };
}

export function getRestrictedContentIssue(value: unknown): string | null {
  try {
    assertNoRestrictedContent(value, 'contextPack');
    return null;
  } catch (error) {
    if (error instanceof Error) {
      return error.message;
    }

    return 'contextPack contains restricted content.';
  }
}

export function getMissingSafetyLabels(labels: unknown): string[] {
  if (!Array.isArray(labels)) {
    return [...AI_ANALYSIS_JOB_REQUIRED_SAFETY_LABELS];
  }

  return AI_ANALYSIS_JOB_REQUIRED_SAFETY_LABELS.filter(
    (label) => !labels.includes(label),
  );
}

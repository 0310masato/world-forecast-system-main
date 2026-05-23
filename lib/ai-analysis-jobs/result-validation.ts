import {
  CONTEXT_PACK_SOURCE_TYPES,
  CONTEXT_PACK_VERSION,
} from '../context-packs/types';
import { assertNoRestrictedContent } from '../memory/validation';
import {
  AI_ANALYSIS_JOB_ALLOWED_NEXT_STEP,
  AI_ANALYSIS_JOB_FORBIDDEN_NEXT_STEPS,
  AI_ANALYSIS_JOB_KINDS,
  AI_ANALYSIS_JOB_RESULT_RECOMMENDED_DECISIONS,
  AI_ANALYSIS_JOB_RESULT_REQUIRED_SAFETY_LABELS,
  AI_ANALYSIS_JOB_RESULT_STATUSES,
  AI_ANALYSIS_JOB_RESULT_VERSION,
  type AIAnalysisJobPreflightResult,
  type AIAnalysisJobResultValidationIssue,
  type AIAnalysisJobResultValidationResult,
} from './types';
import { isAIAnalysisJobKind, isConfidence } from './validation';

type UnknownRecord = Record<string, unknown>;

const CONTEXT_PACK_SOURCE_TYPE_SET = new Set<string>(CONTEXT_PACK_SOURCE_TYPES);
const AI_ANALYSIS_JOB_RESULT_STATUS_SET = new Set<string>(
  AI_ANALYSIS_JOB_RESULT_STATUSES,
);
const AI_ANALYSIS_JOB_RESULT_DECISION_SET = new Set<string>(
  AI_ANALYSIS_JOB_RESULT_RECOMMENDED_DECISIONS,
);

const PRODUCTION_STATE_CLAIM_PATTERNS = [
  {
    name: 'source-of-record claim',
    pattern: /\bsource of record\b/i,
  },
  {
    name: 'production-state claim',
    pattern: /\b(?:is|are|as|into|becomes|became|now)\s+(?:the\s+)?production state\b/i,
  },
  {
    name: 'production-save claim',
    pattern: /\b(?:save|saves|saved|saving|write|writes|wrote|update|updates|updated)\s+(?:to\s+)?production\b/i,
  },
  {
    name: 'saved-prediction claim',
    pattern: /\b(?:is|are|as|into|becomes|became|now|created|creates|saved as)\s+(?:a\s+)?saved prediction\b/i,
  },
] as const;

const FORBIDDEN_OPERATION_RECOMMENDATION_PATTERNS = [
  {
    name: 'production deployment recommendation',
    pattern: /\bdeploy\b[\w\s-]{0,80}\bto\s+production\b/i,
  },
  {
    name: 'external publishing recommendation',
    pattern: /\b(?:publish\b[\w\s-]{0,80}\bexternally|external(?:ly)?\s+publish(?:ing)?)\b/i,
  },
  {
    name: 'automated trading recommendation',
    pattern: /\b(?:start|begin|enable|trigger|run|use\s+(?:this|result|proposal)?\s*for)\s+automated\s+trading\b/i,
  },
  {
    name: 'navigation guidance recommendation',
    pattern: /\b(?:use\s+(?:this|result|proposal)?\s*(?:for|as)\s+navigation(?:\s+guidance)?|navigation\s+guidance)\b/i,
  },
  {
    name: 'military action recommendation',
    pattern: /\bmilitary\s+(?:action|decision|guidance)\b/i,
  },
  {
    name: 'forecast API update recommendation',
    pattern: /\b(?:update|modify|change|patch|write\s+to)\s+\/api\/forecast\b/i,
  },
  {
    name: 'Hormuz API update recommendation',
    pattern: /\b(?:update|modify|change|patch|write\s+to)\s+\/api\/hormuz\b/i,
  },
  {
    name: 'production data write recommendation',
    pattern: /\b(?:write|save|persist|update)\s+production\s+data\b/i,
  },
  {
    name: 'automatic application recommendation',
    pattern: /\b(?:apply\s+(?:it|this|result|proposal)?\s*automatically|automatically\s+apply)\b/i,
  },
  {
    name: 'Japanese production application recommendation',
    pattern: /本番(?:へ|に)?反映/,
  },
  {
    name: 'Japanese external publishing recommendation',
    pattern: /外部公開/,
  },
  {
    name: 'Japanese automated trading recommendation',
    pattern: /自動取引/,
  },
  {
    name: 'Japanese navigation decision recommendation',
    pattern: /航法判断/,
  },
  {
    name: 'Japanese military decision recommendation',
    pattern: /軍事判断/,
  },
  {
    name: 'Japanese forecast API update recommendation',
    pattern: /\/api\/forecast\s*を\s*(?:変更|更新)/,
  },
  {
    name: 'Japanese Hormuz API update recommendation',
    pattern: /\/api\/hormuz\s*を\s*(?:変更|更新)/,
  },
  {
    name: 'Japanese automatic application recommendation',
    pattern: /(?:自動適用|自動で適用)/,
  },
] as const;

function asRecord(value: unknown): UnknownRecord | null {
  if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
    return value as UnknownRecord;
  }

  return null;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isUnixSeconds(value: unknown): value is number {
  return Number.isInteger(value) && Number(value) >= 0;
}

function addIssue(
  issues: AIAnalysisJobResultValidationIssue[],
  params: Omit<AIAnalysisJobResultValidationIssue, 'severity'>,
): void {
  issues.push({
    ...params,
    severity: 'blocking',
  });
}

function getRestrictedContentIssue(value: unknown): string | null {
  try {
    assertNoRestrictedContent(value, 'aiAnalysisJobResult');
    return null;
  } catch (error) {
    if (error instanceof Error) {
      return error.message;
    }

    return 'AI analysis job result contains restricted content.';
  }
}

function getProductionStateClaimIssue(value: unknown): string | null {
  const seen = new Set<object>();

  function visit(current: unknown, path: string): string | null {
    if (typeof current === 'string') {
      for (const { name, pattern } of PRODUCTION_STATE_CLAIM_PATTERNS) {
        if (pattern.test(current)) {
          return `${path} contains a production-state claim: ${name}.`;
        }
      }

      return null;
    }

    if (current === null || current === undefined) {
      return null;
    }

    if (typeof current !== 'object') {
      return null;
    }

    if (seen.has(current)) {
      return null;
    }
    seen.add(current);

    if (Array.isArray(current)) {
      for (const [index, item] of current.entries()) {
        const issue = visit(item, `${path}[${index}]`);
        if (issue) {
          return issue;
        }
      }

      return null;
    }

    for (const [key, item] of Object.entries(current as UnknownRecord)) {
      const issue = visit(item, `${path}.${key}`);
      if (issue) {
        return issue;
      }
    }

    return null;
  }

  return visit(value, 'aiAnalysisJobResult');
}

function getForbiddenOperationRecommendationIssue(
  value: unknown,
  path: string,
): { message: string; path: string } | null {
  if (typeof value !== 'string') {
    return null;
  }

  for (const { name, pattern } of FORBIDDEN_OPERATION_RECOMMENDATION_PATTERNS) {
    if (pattern.test(value)) {
      return {
        message: `${path} contains a forbidden operation recommendation: ${name}.`,
        path,
      };
    }
  }

  return null;
}

function validateNoForbiddenOperationRecommendations(
  result: UnknownRecord,
  issues: AIAnalysisJobResultValidationIssue[],
): void {
  const candidates: Array<{ value: unknown; path: string }> = [
    { value: result.summary, path: 'summary' },
  ];

  if (Array.isArray(result.evidence)) {
    result.evidence.forEach((item, index) => {
      candidates.push({
        value: asRecord(item)?.summary,
        path: `evidence[${index}].summary`,
      });
    });
  }

  if (Array.isArray(result.limitations)) {
    result.limitations.forEach((item, index) => {
      candidates.push({
        value: asRecord(item)?.summary,
        path: `limitations[${index}].summary`,
      });
    });
  }

  if (Array.isArray(result.next_review_steps)) {
    result.next_review_steps.forEach((step, index) => {
      candidates.push({
        value: step,
        path: `next_review_steps[${index}]`,
      });
    });
  }

  for (const candidate of candidates) {
    const recommendationIssue = getForbiddenOperationRecommendationIssue(
      candidate.value,
      candidate.path,
    );
    if (recommendationIssue) {
      addIssue(issues, {
        code: 'forbidden_operation_recommendation',
        message: recommendationIssue.message,
        path: recommendationIssue.path,
      });
    }
  }
}

function validateEvidence(
  result: UnknownRecord,
  issues: AIAnalysisJobResultValidationIssue[],
): void {
  if (!Array.isArray(result.evidence) || result.evidence.length === 0) {
    addIssue(issues, {
      code: 'evidence_missing',
      message: 'AI analysis job result must include at least one evidence item.',
      path: 'evidence',
    });
    return;
  }

  result.evidence.forEach((item, index) => {
    const path = `evidence[${index}]`;
    const evidence = asRecord(item);

    if (!evidence) {
      addIssue(issues, {
        code: 'evidence_invalid',
        message: 'evidence item must be an object.',
        path,
      });
      return;
    }

    if (
      typeof evidence.source_type !== 'string'
      || !CONTEXT_PACK_SOURCE_TYPE_SET.has(evidence.source_type)
    ) {
      addIssue(issues, {
        code: 'evidence_source_type_invalid',
        message: `evidence.source_type must be one of: ${CONTEXT_PACK_SOURCE_TYPES.join(', ')}.`,
        path: `${path}.source_type`,
      });
    }

    if (!isNonEmptyString(evidence.id)) {
      addIssue(issues, {
        code: 'evidence_id_missing',
        message: 'evidence item must preserve a non-empty id.',
        path: `${path}.id`,
      });
    }

    if (!isNonEmptyString(evidence.summary)) {
      addIssue(issues, {
        code: 'evidence_summary_missing',
        message: 'evidence item must include a non-empty summary.',
        path: `${path}.summary`,
      });
    }

    if (!isConfidence(evidence.confidence)) {
      addIssue(issues, {
        code: 'evidence_confidence_invalid',
        message: 'evidence.confidence must be low, medium, or high.',
        path: `${path}.confidence`,
      });
    }
  });
}

function validateLimitations(
  result: UnknownRecord,
  issues: AIAnalysisJobResultValidationIssue[],
): void {
  if (!Array.isArray(result.limitations) || result.limitations.length === 0) {
    addIssue(issues, {
      code: 'limitations_missing',
      message: 'AI analysis job result must include at least one limitation.',
      path: 'limitations',
    });
    return;
  }

  result.limitations.forEach((item, index) => {
    const path = `limitations[${index}]`;
    const limitation = asRecord(item);

    if (!limitation) {
      addIssue(issues, {
        code: 'limitation_invalid',
        message: 'limitation item must be an object.',
        path,
      });
      return;
    }

    if ('id' in limitation && limitation.id !== undefined && !isNonEmptyString(limitation.id)) {
      addIssue(issues, {
        code: 'limitation_id_invalid',
        message: 'limitation.id must be a non-empty string when provided.',
        path: `${path}.id`,
      });
    }

    if (!isNonEmptyString(limitation.summary)) {
      addIssue(issues, {
        code: 'limitation_summary_missing',
        message: 'limitation item must include a non-empty summary.',
        path: `${path}.summary`,
      });
    }
  });
}

function validateSafetyLabels(
  result: UnknownRecord,
  issues: AIAnalysisJobResultValidationIssue[],
): void {
  if (!Array.isArray(result.safety_labels)) {
    addIssue(issues, {
      code: 'safety_labels_missing',
      message: 'AI analysis job result must include safety_labels.',
      path: 'safety_labels',
    });
    return;
  }

  for (const label of AI_ANALYSIS_JOB_RESULT_REQUIRED_SAFETY_LABELS) {
    if (!result.safety_labels.includes(label)) {
      addIssue(issues, {
        code: 'safety_label_missing',
        message: `AI analysis job result is missing safety label: ${label}.`,
        path: 'safety_labels',
      });
    }
  }
}

function validateForbiddenNextSteps(
  result: UnknownRecord,
  issues: AIAnalysisJobResultValidationIssue[],
): void {
  if (!Array.isArray(result.forbidden_next_steps)) {
    addIssue(issues, {
      code: 'forbidden_next_steps_missing',
      message: 'AI analysis job result must include forbidden_next_steps.',
      path: 'forbidden_next_steps',
    });
    return;
  }

  for (const step of AI_ANALYSIS_JOB_FORBIDDEN_NEXT_STEPS) {
    if (!result.forbidden_next_steps.includes(step)) {
      addIssue(issues, {
        code: 'forbidden_next_step_missing',
        message: `AI analysis job result must forbid ${step}.`,
        path: 'forbidden_next_steps',
      });
    }
  }
}

function validateNextReviewSteps(
  result: UnknownRecord,
  issues: AIAnalysisJobResultValidationIssue[],
): void {
  if (!Array.isArray(result.next_review_steps) || result.next_review_steps.length === 0) {
    addIssue(issues, {
      code: 'next_review_steps_missing',
      message: 'AI analysis job result must include next_review_steps.',
      path: 'next_review_steps',
    });
    return;
  }

  result.next_review_steps.forEach((step, index) => {
    if (!isNonEmptyString(step)) {
      addIssue(issues, {
        code: 'next_review_step_invalid',
        message: 'next_review_steps items must be non-empty strings.',
        path: `next_review_steps[${index}]`,
      });
    }
  });
}

function validatePreflightRelationship(
  result: UnknownRecord,
  preflightResult: AIAnalysisJobPreflightResult | undefined,
  issues: AIAnalysisJobResultValidationIssue[],
): void {
  if (!preflightResult) {
    return;
  }

  if (preflightResult.passed !== true) {
    addIssue(issues, {
      code: 'preflight_not_passed',
      message: 'AI analysis job result may only be validated against a passing preflight result.',
      path: 'preflightResult.passed',
    });
  }

  if (preflightResult.job_kind !== result.job_kind) {
    addIssue(issues, {
      code: 'preflight_job_kind_mismatch',
      message: 'AI analysis job result job_kind must match preflightResult.job_kind.',
      path: 'job_kind',
    });
  }

  if (preflightResult.context_pack_id !== result.context_pack_id) {
    addIssue(issues, {
      code: 'preflight_context_pack_id_mismatch',
      message: 'AI analysis job result context_pack_id must match preflightResult.context_pack_id.',
      path: 'context_pack_id',
    });
  }

  if (preflightResult.context_pack_version !== result.context_pack_version) {
    addIssue(issues, {
      code: 'preflight_context_pack_version_mismatch',
      message: 'AI analysis job result context_pack_version must match preflightResult.context_pack_version.',
      path: 'context_pack_version',
    });
  }

  if (preflightResult.allowed_next_step !== AI_ANALYSIS_JOB_ALLOWED_NEXT_STEP) {
    addIssue(issues, {
      code: 'preflight_allowed_next_step_invalid',
      message: 'preflightResult.allowed_next_step must remain human_review_only.',
      path: 'preflightResult.allowed_next_step',
    });
  }
}

export function validateAIAnalysisJobResult(
  result: unknown,
  preflightResult?: AIAnalysisJobPreflightResult,
): AIAnalysisJobResultValidationResult {
  const issues: AIAnalysisJobResultValidationIssue[] = [];
  const resultRecord = asRecord(result);

  if (!resultRecord) {
    addIssue(issues, {
      code: 'result_invalid',
      message: 'AI analysis job result must be an object.',
    });
    return { passed: false, issues };
  }

  if (resultRecord.result_version !== AI_ANALYSIS_JOB_RESULT_VERSION) {
    addIssue(issues, {
      code: 'result_version_invalid',
      message: `result_version must be ${AI_ANALYSIS_JOB_RESULT_VERSION}.`,
      path: 'result_version',
    });
  }

  if (!isNonEmptyString(resultRecord.result_id)) {
    addIssue(issues, {
      code: 'result_id_missing',
      message: 'result_id must be a non-empty string.',
      path: 'result_id',
    });
  }

  if (!isAIAnalysisJobKind(resultRecord.job_kind)) {
    addIssue(issues, {
      code: 'job_kind_invalid',
      message: `job_kind must be one of: ${AI_ANALYSIS_JOB_KINDS.join(', ')}.`,
      path: 'job_kind',
    });
  }

  if (!isNonEmptyString(resultRecord.context_pack_id)) {
    addIssue(issues, {
      code: 'context_pack_id_missing',
      message: 'context_pack_id must be a non-empty string.',
      path: 'context_pack_id',
    });
  }

  if (resultRecord.context_pack_version !== CONTEXT_PACK_VERSION) {
    addIssue(issues, {
      code: 'context_pack_version_invalid',
      message: `context_pack_version must be ${CONTEXT_PACK_VERSION}.`,
      path: 'context_pack_version',
    });
  }

  if (!isUnixSeconds(resultRecord.generated_at)) {
    addIssue(issues, {
      code: 'generated_at_invalid',
      message: 'generated_at must be a non-negative integer Unix timestamp in seconds.',
      path: 'generated_at',
    });
  }

  if (
    typeof resultRecord.proposal_status !== 'string'
    || !AI_ANALYSIS_JOB_RESULT_STATUS_SET.has(resultRecord.proposal_status)
  ) {
    addIssue(issues, {
      code: 'proposal_status_invalid',
      message: `proposal_status must be one of: ${AI_ANALYSIS_JOB_RESULT_STATUSES.join(', ')}.`,
      path: 'proposal_status',
    });
  }

  if (!isConfidence(resultRecord.confidence)) {
    addIssue(issues, {
      code: 'confidence_invalid',
      message: 'confidence must be low, medium, or high.',
      path: 'confidence',
    });
  }

  if (!isNonEmptyString(resultRecord.summary)) {
    addIssue(issues, {
      code: 'summary_missing',
      message: 'summary must be a non-empty string.',
      path: 'summary',
    });
  }

  validateEvidence(resultRecord, issues);
  validateLimitations(resultRecord, issues);
  validateNoForbiddenOperationRecommendations(resultRecord, issues);
  validateSafetyLabels(resultRecord, issues);

  if (resultRecord.requires_human_approval !== true) {
    addIssue(issues, {
      code: 'requires_human_approval_required',
      message: 'AI analysis job result must require human approval.',
      path: 'requires_human_approval',
    });
  }

  if (
    typeof resultRecord.recommended_decision !== 'string'
    || !AI_ANALYSIS_JOB_RESULT_DECISION_SET.has(resultRecord.recommended_decision)
  ) {
    addIssue(issues, {
      code: 'recommended_decision_invalid',
      message: `recommended_decision must be one of: ${AI_ANALYSIS_JOB_RESULT_RECOMMENDED_DECISIONS.join(', ')}.`,
      path: 'recommended_decision',
    });
  }

  validateNextReviewSteps(resultRecord, issues);

  if (resultRecord.allowed_next_step !== AI_ANALYSIS_JOB_ALLOWED_NEXT_STEP) {
    addIssue(issues, {
      code: 'allowed_next_step_invalid',
      message: 'AI analysis job result may only allow human_review_only as the next step.',
      path: 'allowed_next_step',
    });
  }

  validateForbiddenNextSteps(resultRecord, issues);

  if (resultRecord.proposal_only !== true) {
    addIssue(issues, {
      code: 'proposal_only_required',
      message: 'AI analysis job result must remain proposal_only.',
      path: 'proposal_only',
    });
  }

  if (resultRecord.is_production_state !== false) {
    addIssue(issues, {
      code: 'non_production_state_required',
      message: 'AI analysis job result must not be production state.',
      path: 'is_production_state',
    });
  }

  const restrictedContentIssue = getRestrictedContentIssue(resultRecord);
  if (restrictedContentIssue) {
    addIssue(issues, {
      code: 'restricted_content_detected',
      message: restrictedContentIssue,
    });
  }

  const productionStateClaimIssue = getProductionStateClaimIssue(resultRecord);
  if (productionStateClaimIssue) {
    addIssue(issues, {
      code: 'production_state_claim',
      message: productionStateClaimIssue,
    });
  }

  validatePreflightRelationship(resultRecord, preflightResult, issues);

  return {
    passed: issues.length === 0,
    issues,
  };
}

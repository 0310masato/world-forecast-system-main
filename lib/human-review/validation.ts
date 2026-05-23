import {
  AI_ANALYSIS_JOB_KINDS,
  AI_ANALYSIS_JOB_RESULT_VERSION,
  type AIAnalysisJobResult,
} from '../ai-analysis-jobs/types';
import { CONTEXT_PACK_VERSION } from '../context-packs/types';
import { assertNoRestrictedContent } from '../memory/validation';
import {
  HUMAN_REVIEW_DECISION_ALLOWED_NEXT_STEPS,
  HUMAN_REVIEW_DECISION_FORBIDDEN_OUTCOMES,
  HUMAN_REVIEW_DECISION_OUTCOMES,
  HUMAN_REVIEW_DECISION_REQUIRED_FORBIDDEN_NEXT_STEPS,
  HUMAN_REVIEW_DECISION_VERSION,
  type HumanReviewDecisionValidationIssue,
  type HumanReviewDecisionValidationResult,
} from './types';

type UnknownRecord = Record<string, unknown>;

const AI_ANALYSIS_JOB_KIND_SET = new Set<string>(AI_ANALYSIS_JOB_KINDS);
const HUMAN_REVIEW_DECISION_OUTCOME_SET = new Set<string>(
  HUMAN_REVIEW_DECISION_OUTCOMES,
);
const HUMAN_REVIEW_DECISION_FORBIDDEN_OUTCOME_SET = new Set<string>(
  HUMAN_REVIEW_DECISION_FORBIDDEN_OUTCOMES,
);
const HUMAN_REVIEW_DECISION_ALLOWED_NEXT_STEP_SET = new Set<string>(
  HUMAN_REVIEW_DECISION_ALLOWED_NEXT_STEPS,
);

const HIGH_RISK_OPERATION_RECOMMENDATION_PATTERNS = [
  {
    name: 'production deployment recommendation',
    pattern: /\bdeploy\b[\w\s-]{0,80}\bto\s+production\b/i,
  },
  {
    name: 'direct deployment recommendation',
    pattern: /\bdirect(?:ly)?\s+deploy\b/i,
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
    name: 'production write recommendation',
    pattern: /\b(?:write|save|persist|update)\s+(?:to\s+)?production\b/i,
  },
  {
    name: 'production data write recommendation',
    pattern: /\b(?:write|save|persist|update)\s+production\s+data\b/i,
  },
  {
    name: 'database migration recommendation',
    pattern: /\b(?:run|create|add|apply)\s+(?:a\s+)?(?:database\s+)?migration\b/i,
  },
  {
    name: 'saved prediction recommendation',
    pattern: /\b(?:save|persist|promote|record)\b[\w\s-]{0,80}\b(?:saved\s+prediction|prediction\s+record)\b/i,
  },
  {
    name: 'source-of-record promotion recommendation',
    pattern: /\b(?:promote|make|treat|use)\b[\w\s-]{0,80}\bsource\s+of\s+record\b/i,
  },
  {
    name: 'automatic application recommendation',
    pattern: /\b(?:apply\s+(?:it|this|result|proposal)?\s*automatically|automatically\s+apply|auto-?apply)\b/i,
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
    pattern: /\/api\/forecast\s*を\s*(?:変更|更新|修正|接続|改修|書き換え)/,
  },
  {
    name: 'Japanese Hormuz API update recommendation',
    pattern: /\/api\/hormuz\s*を\s*(?:変更|更新|修正|接続|改修|書き換え)/,
  },
  {
    name: 'Japanese database migration recommendation',
    pattern: /(?:DB|データベース)\s*(?:migration|マイグレーション|移行)/i,
  },
  {
    name: 'Japanese direct deployment recommendation',
    pattern: /(?:直接|直ちに)?デプロイ/,
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
  issues: HumanReviewDecisionValidationIssue[],
  params: Omit<HumanReviewDecisionValidationIssue, 'severity'>,
): void {
  issues.push({
    ...params,
    severity: 'blocking',
  });
}

function getRestrictedContentIssue(value: unknown): string | null {
  try {
    assertNoRestrictedContent(value, 'humanReviewDecision');
    return null;
  } catch (error) {
    if (error instanceof Error) {
      return error.message;
    }

    return 'Human review decision contains restricted content.';
  }
}

function getHighRiskOperationRecommendationIssue(
  value: unknown,
  path: string,
): { message: string; path: string } | null {
  if (typeof value !== 'string') {
    return null;
  }

  for (const { name, pattern } of HIGH_RISK_OPERATION_RECOMMENDATION_PATTERNS) {
    if (pattern.test(value)) {
      return {
        message: `${path} contains a high-risk operation recommendation: ${name}.`,
        path,
      };
    }
  }

  return null;
}

function validateStringArray(params: {
  decision: UnknownRecord;
  issues: HumanReviewDecisionValidationIssue[];
  key: 'required_next_steps' | 'residual_risks';
}): void {
  const value = params.decision[params.key];

  if (!Array.isArray(value)) {
    addIssue(params.issues, {
      code: `${params.key}_invalid`,
      message: `${params.key} must be an array.`,
      path: params.key,
    });
    return;
  }

  value.forEach((item, index) => {
    if (!isNonEmptyString(item)) {
      addIssue(params.issues, {
        code: `${params.key}_item_invalid`,
        message: `${params.key} items must be non-empty strings.`,
        path: `${params.key}[${index}]`,
      });
    }
  });
}

function validateNoHighRiskOperationRecommendations(
  decision: UnknownRecord,
  issues: HumanReviewDecisionValidationIssue[],
): void {
  const candidates: Array<{ value: unknown; path: string }> = [
    { value: decision.rationale, path: 'rationale' },
  ];

  if (Array.isArray(decision.required_next_steps)) {
    decision.required_next_steps.forEach((step, index) => {
      candidates.push({
        value: step,
        path: `required_next_steps[${index}]`,
      });
    });
  }

  if (Array.isArray(decision.residual_risks)) {
    decision.residual_risks.forEach((risk, index) => {
      candidates.push({
        value: risk,
        path: `residual_risks[${index}]`,
      });
    });
  }

  for (const candidate of candidates) {
    const recommendationIssue = getHighRiskOperationRecommendationIssue(
      candidate.value,
      candidate.path,
    );
    if (recommendationIssue) {
      addIssue(issues, {
        code: 'high_risk_operation_recommendation',
        message: recommendationIssue.message,
        path: recommendationIssue.path,
      });
    }
  }
}

function validateForbiddenNextSteps(
  decision: UnknownRecord,
  issues: HumanReviewDecisionValidationIssue[],
): void {
  if (!Array.isArray(decision.forbidden_next_steps)) {
    addIssue(issues, {
      code: 'forbidden_next_steps_missing',
      message: 'Human review decision must include forbidden_next_steps.',
      path: 'forbidden_next_steps',
    });
    return;
  }

  for (const step of HUMAN_REVIEW_DECISION_REQUIRED_FORBIDDEN_NEXT_STEPS) {
    if (!decision.forbidden_next_steps.includes(step)) {
      addIssue(issues, {
        code: 'forbidden_next_step_missing',
        message: `Human review decision must forbid ${step}.`,
        path: 'forbidden_next_steps',
      });
    }
  }
}

function validateResultRelationship(
  decision: UnknownRecord,
  result: AIAnalysisJobResult | undefined,
  issues: HumanReviewDecisionValidationIssue[],
): void {
  if (!result) {
    return;
  }

  const resultRecord = asRecord(result);
  if (!resultRecord) {
    addIssue(issues, {
      code: 'reviewed_result_invalid',
      message: 'reviewed result must be an object when provided.',
      path: 'reviewedResult',
    });
    return;
  }

  if (decision.reviewed_result_id !== resultRecord.result_id) {
    addIssue(issues, {
      code: 'reviewed_result_id_mismatch',
      message: 'Human review decision reviewed_result_id must match result.result_id.',
      path: 'reviewed_result_id',
    });
  }

  if (decision.reviewed_result_version !== resultRecord.result_version) {
    addIssue(issues, {
      code: 'reviewed_result_version_mismatch',
      message: 'Human review decision reviewed_result_version must match result.result_version.',
      path: 'reviewed_result_version',
    });
  }

  if (decision.job_kind !== resultRecord.job_kind) {
    addIssue(issues, {
      code: 'reviewed_result_job_kind_mismatch',
      message: 'Human review decision job_kind must match result.job_kind.',
      path: 'job_kind',
    });
  }

  if (decision.context_pack_id !== resultRecord.context_pack_id) {
    addIssue(issues, {
      code: 'reviewed_result_context_pack_id_mismatch',
      message: 'Human review decision context_pack_id must match result.context_pack_id.',
      path: 'context_pack_id',
    });
  }

  if (decision.context_pack_version !== resultRecord.context_pack_version) {
    addIssue(issues, {
      code: 'reviewed_result_context_pack_version_mismatch',
      message: 'Human review decision context_pack_version must match result.context_pack_version.',
      path: 'context_pack_version',
    });
  }

  if (resultRecord.proposal_only !== true) {
    addIssue(issues, {
      code: 'reviewed_result_proposal_only_required',
      message: 'Reviewed AI analysis result must remain proposal_only.',
      path: 'reviewedResult.proposal_only',
    });
  }

  if (resultRecord.is_production_state !== false) {
    addIssue(issues, {
      code: 'reviewed_result_non_production_state_required',
      message: 'Reviewed AI analysis result must not be production state.',
      path: 'reviewedResult.is_production_state',
    });
  }

  if (resultRecord.requires_human_approval !== true) {
    addIssue(issues, {
      code: 'reviewed_result_human_approval_required',
      message: 'Reviewed AI analysis result must require human approval.',
      path: 'reviewedResult.requires_human_approval',
    });
  }
}

export function validateHumanReviewDecision(
  decision: unknown,
  result?: AIAnalysisJobResult,
): HumanReviewDecisionValidationResult {
  const issues: HumanReviewDecisionValidationIssue[] = [];
  const decisionRecord = asRecord(decision);

  if (!decisionRecord) {
    addIssue(issues, {
      code: 'decision_invalid',
      message: 'Human review decision must be an object.',
    });
    return { passed: false, issues };
  }

  if (decisionRecord.decision_version !== HUMAN_REVIEW_DECISION_VERSION) {
    addIssue(issues, {
      code: 'decision_version_invalid',
      message: `decision_version must be ${HUMAN_REVIEW_DECISION_VERSION}.`,
      path: 'decision_version',
    });
  }

  if (!isNonEmptyString(decisionRecord.decision_id)) {
    addIssue(issues, {
      code: 'decision_id_missing',
      message: 'decision_id must be a non-empty string.',
      path: 'decision_id',
    });
  }

  if (!isNonEmptyString(decisionRecord.reviewed_result_id)) {
    addIssue(issues, {
      code: 'reviewed_result_id_missing',
      message: 'reviewed_result_id must be a non-empty string.',
      path: 'reviewed_result_id',
    });
  }

  if (decisionRecord.reviewed_result_version !== AI_ANALYSIS_JOB_RESULT_VERSION) {
    addIssue(issues, {
      code: 'reviewed_result_version_invalid',
      message: `reviewed_result_version must be ${AI_ANALYSIS_JOB_RESULT_VERSION}.`,
      path: 'reviewed_result_version',
    });
  }

  if (
    typeof decisionRecord.job_kind !== 'string'
    || !AI_ANALYSIS_JOB_KIND_SET.has(decisionRecord.job_kind)
  ) {
    addIssue(issues, {
      code: 'job_kind_invalid',
      message: `job_kind must be one of: ${AI_ANALYSIS_JOB_KINDS.join(', ')}.`,
      path: 'job_kind',
    });
  }

  if (!isNonEmptyString(decisionRecord.context_pack_id)) {
    addIssue(issues, {
      code: 'context_pack_id_missing',
      message: 'context_pack_id must be a non-empty string.',
      path: 'context_pack_id',
    });
  }

  if (decisionRecord.context_pack_version !== CONTEXT_PACK_VERSION) {
    addIssue(issues, {
      code: 'context_pack_version_invalid',
      message: `context_pack_version must be ${CONTEXT_PACK_VERSION}.`,
      path: 'context_pack_version',
    });
  }

  if (!isUnixSeconds(decisionRecord.decided_at)) {
    addIssue(issues, {
      code: 'decided_at_invalid',
      message: 'decided_at must be a non-negative integer Unix timestamp in seconds.',
      path: 'decided_at',
    });
  }

  if (!isNonEmptyString(decisionRecord.reviewer_id)) {
    addIssue(issues, {
      code: 'reviewer_id_missing',
      message: 'reviewer_id must be a non-empty string.',
      path: 'reviewer_id',
    });
  }

  if (
    typeof decisionRecord.outcome === 'string'
    && HUMAN_REVIEW_DECISION_FORBIDDEN_OUTCOME_SET.has(decisionRecord.outcome)
  ) {
    addIssue(issues, {
      code: 'outcome_forbidden',
      message: `outcome must not be ${decisionRecord.outcome}.`,
      path: 'outcome',
    });
  } else if (
    typeof decisionRecord.outcome !== 'string'
    || !HUMAN_REVIEW_DECISION_OUTCOME_SET.has(decisionRecord.outcome)
  ) {
    addIssue(issues, {
      code: 'outcome_invalid',
      message: `outcome must be one of: ${HUMAN_REVIEW_DECISION_OUTCOMES.join(', ')}.`,
      path: 'outcome',
    });
  }

  if (!isNonEmptyString(decisionRecord.rationale)) {
    addIssue(issues, {
      code: 'rationale_missing',
      message: 'rationale must be a non-empty string.',
      path: 'rationale',
    });
  }

  validateStringArray({
    decision: decisionRecord,
    issues,
    key: 'required_next_steps',
  });
  validateStringArray({
    decision: decisionRecord,
    issues,
    key: 'residual_risks',
  });

  if (decisionRecord.requires_separate_implementation !== true) {
    addIssue(issues, {
      code: 'requires_separate_implementation_required',
      message: 'Human review decision must require a separate implementation path.',
      path: 'requires_separate_implementation',
    });
  }

  if (
    typeof decisionRecord.allowed_next_step !== 'string'
    || !HUMAN_REVIEW_DECISION_ALLOWED_NEXT_STEP_SET.has(decisionRecord.allowed_next_step)
  ) {
    addIssue(issues, {
      code: 'allowed_next_step_invalid',
      message: `allowed_next_step must be one of: ${HUMAN_REVIEW_DECISION_ALLOWED_NEXT_STEPS.join(', ')}.`,
      path: 'allowed_next_step',
    });
  }

  validateForbiddenNextSteps(decisionRecord, issues);

  if (decisionRecord.is_production_state !== false) {
    addIssue(issues, {
      code: 'non_production_state_required',
      message: 'Human review decision must not be production state.',
      path: 'is_production_state',
    });
  }

  if (decisionRecord.does_not_modify_api !== true) {
    addIssue(issues, {
      code: 'does_not_modify_api_required',
      message: 'Human review decision must explicitly not modify APIs.',
      path: 'does_not_modify_api',
    });
  }

  if (decisionRecord.does_not_write_db !== true) {
    addIssue(issues, {
      code: 'does_not_write_db_required',
      message: 'Human review decision must explicitly not write to the database.',
      path: 'does_not_write_db',
    });
  }

  if (decisionRecord.does_not_publish_externally !== true) {
    addIssue(issues, {
      code: 'does_not_publish_externally_required',
      message: 'Human review decision must explicitly not publish externally.',
      path: 'does_not_publish_externally',
    });
  }

  validateNoHighRiskOperationRecommendations(decisionRecord, issues);

  const restrictedContentIssue = getRestrictedContentIssue(decisionRecord);
  if (restrictedContentIssue) {
    addIssue(issues, {
      code: 'restricted_content_detected',
      message: restrictedContentIssue,
    });
  }

  validateResultRelationship(decisionRecord, result, issues);

  return {
    passed: issues.length === 0,
    issues,
  };
}

import {
  AI_ANALYSIS_JOB_KINDS,
  AI_ANALYSIS_JOB_RESULT_VERSION,
} from '../ai-analysis-jobs/types';
import { CONTEXT_PACK_VERSION } from '../context-packs/types';
import {
  HUMAN_REVIEW_DECISION_VERSION,
  type HumanReviewDecision,
} from '../human-review/types';
import { assertNoRestrictedContent } from '../memory/validation';
import {
  IMPLEMENTATION_PROPOSAL_ALLOWED_NEXT_STEPS,
  IMPLEMENTATION_PROPOSAL_CHANGE_TYPES,
  IMPLEMENTATION_PROPOSAL_FORBIDDEN_CHANGE_TYPES,
  IMPLEMENTATION_PROPOSAL_FORBIDDEN_STATUSES,
  IMPLEMENTATION_PROPOSAL_REQUIRED_FORBIDDEN_NEXT_STEPS,
  IMPLEMENTATION_PROPOSAL_STATUSES,
  IMPLEMENTATION_PROPOSAL_VERSION,
  type ImplementationProposalValidationIssue,
  type ImplementationProposalValidationResult,
} from './types';

type UnknownRecord = Record<string, unknown>;

const AI_ANALYSIS_JOB_KIND_SET = new Set<string>(AI_ANALYSIS_JOB_KINDS);
const IMPLEMENTATION_PROPOSAL_STATUS_SET = new Set<string>(
  IMPLEMENTATION_PROPOSAL_STATUSES,
);
const IMPLEMENTATION_PROPOSAL_FORBIDDEN_STATUS_SET = new Set<string>(
  IMPLEMENTATION_PROPOSAL_FORBIDDEN_STATUSES,
);
const IMPLEMENTATION_PROPOSAL_CHANGE_TYPE_SET = new Set<string>(
  IMPLEMENTATION_PROPOSAL_CHANGE_TYPES,
);
const IMPLEMENTATION_PROPOSAL_FORBIDDEN_CHANGE_TYPE_SET = new Set<string>(
  IMPLEMENTATION_PROPOSAL_FORBIDDEN_CHANGE_TYPES,
);
const IMPLEMENTATION_PROPOSAL_ALLOWED_NEXT_STEP_SET = new Set<string>(
  IMPLEMENTATION_PROPOSAL_ALLOWED_NEXT_STEPS,
);
const IMPLEMENTATION_PROPOSAL_HUMAN_REVIEW_ONLY_STATUSES = new Set<string>([
  'needs_review',
  'needs_revision',
  'rejected',
  'archived',
]);

const PROTECTED_INTENDED_FILE_PATH_PATTERNS = [
  {
    name: 'forecast API path',
    pattern: /^(?:app|pages)\/api\/forecast(?:\/|$)/,
  },
  {
    name: 'Hormuz API path',
    pattern: /^(?:app|pages)\/api\/hormuz(?:\/|$)/,
  },
  {
    name: 'database helper',
    pattern: /^lib\/db\.ts$/,
  },
  {
    name: 'database directory',
    pattern: /^db(?:\/|$)/,
  },
  {
    name: 'migration directory',
    pattern: /^migrations(?:\/|$)/,
  },
  {
    name: 'Prisma directory',
    pattern: /^prisma(?:\/|$)/,
  },
  {
    name: 'dependency lockfile',
    pattern: /^(?:package-lock\.json|pnpm-lock\.yaml|yarn\.lock)$/,
  },
  {
    name: 'worker runtime path',
    pattern: /(?:^|\/)workers?(?:\/|$)|(?:^|\/)worker-runtime(?:\/|$)/,
  },
  {
    name: 'scheduler runtime path',
    pattern: /(?:^|\/)schedulers?(?:\/|$)|(?:^|\/)scheduler-runtime(?:\/|$)/,
  },
  {
    name: 'Codex App Server runtime path',
    pattern: /(?:^|\/)codex[-_ ]app[-_ ]server(?:\/|$)|(?:^|\/)codex[-_ ]app[-_ ]server[-_ ]runtime(?:\/|$)/,
  },
  {
    name: 'external API integration runtime path',
    pattern: /(?:^|\/)external[-_ ]api(?:\/|$)|(?:^|\/)external[-_ ]api[-_ ]integrations?(?:\/|$)|(?:^|\/)external[-_ ]api[-_ ]runtime(?:\/|$)/,
  },
] as const;

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
    pattern: /\b(?:start|begin|enable|trigger|run|use\s+(?:this|proposal)?\s*for)\s+automated\s+trading\b/i,
  },
  {
    name: 'navigation guidance recommendation',
    pattern: /\b(?:use\s+(?:this|proposal)?\s*(?:for|as)\s+navigation(?:\s+guidance)?|navigation\s+guidance)\b/i,
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
    name: 'worker runtime recommendation',
    pattern: /\b(?:add|create|enable|run|start)\s+(?:a\s+)?worker\s+runtime\b/i,
  },
  {
    name: 'Codex App Server runtime recommendation',
    pattern: /\b(?:add|create|enable|run|start)\s+(?:a\s+)?Codex\s+App\s+Server\s+runtime\b/i,
  },
  {
    name: 'scheduler runtime recommendation',
    pattern: /\b(?:add|create|enable|run|start)\s+(?:a\s+)?scheduler\s+runtime\b/i,
  },
  {
    name: 'external API integration recommendation',
    pattern: /\b(?:add|create|enable|connect)\s+(?:an?\s+)?external\s+API\s+integration\b/i,
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
    pattern: /\b(?:apply\s+(?:it|this|proposal)?\s*automatically|automatically\s+apply|auto-?apply)\b/i,
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

function normalizeProposalPath(value: string): string {
  return value.trim().replace(/\\/g, '/').replace(/^\.\/+/, '').replace(/\/+/g, '/').toLowerCase();
}

function addIssue(
  issues: ImplementationProposalValidationIssue[],
  params: Omit<ImplementationProposalValidationIssue, 'severity'>,
): void {
  issues.push({
    ...params,
    severity: 'blocking',
  });
}

function getRestrictedContentIssue(value: unknown): string | null {
  try {
    assertNoRestrictedContent(value, 'implementationProposal');
    return null;
  } catch (error) {
    if (error instanceof Error) {
      return error.message;
    }

    return 'Implementation proposal contains restricted content.';
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
  proposal: UnknownRecord;
  issues: ImplementationProposalValidationIssue[];
  key:
    | 'intended_files'
    | 'forbidden_files'
    | 'acceptance_criteria'
    | 'test_plan'
    | 'rollback_plan'
    | 'residual_risks';
}): void {
  const value = params.proposal[params.key];

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
  proposal: UnknownRecord,
  issues: ImplementationProposalValidationIssue[],
): void {
  const candidates: Array<{ value: unknown; path: string }> = [
    { value: proposal.summary, path: 'summary' },
    { value: proposal.rationale, path: 'rationale' },
  ];

  for (const key of [
    'acceptance_criteria',
    'test_plan',
    'rollback_plan',
    'residual_risks',
  ] as const) {
    if (Array.isArray(proposal[key])) {
      proposal[key].forEach((item, index) => {
        candidates.push({
          value: item,
          path: `${key}[${index}]`,
        });
      });
    }
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
  proposal: UnknownRecord,
  issues: ImplementationProposalValidationIssue[],
): void {
  if (!Array.isArray(proposal.forbidden_next_steps)) {
    addIssue(issues, {
      code: 'forbidden_next_steps_missing',
      message: 'Implementation proposal must include forbidden_next_steps.',
      path: 'forbidden_next_steps',
    });
    return;
  }

  for (const step of IMPLEMENTATION_PROPOSAL_REQUIRED_FORBIDDEN_NEXT_STEPS) {
    if (!proposal.forbidden_next_steps.includes(step)) {
      addIssue(issues, {
        code: 'forbidden_next_step_missing',
        message: `Implementation proposal must forbid ${step}.`,
        path: 'forbidden_next_steps',
      });
    }
  }
}

function validateIntendedFileScope(
  proposal: UnknownRecord,
  issues: ImplementationProposalValidationIssue[],
): void {
  if (!Array.isArray(proposal.intended_files) || !Array.isArray(proposal.forbidden_files)) {
    return;
  }

  const forbiddenFileSet = new Set(
    proposal.forbidden_files
      .filter((item): item is string => isNonEmptyString(item))
      .map((item) => normalizeProposalPath(item)),
  );

  proposal.intended_files.forEach((item, index) => {
    if (!isNonEmptyString(item)) {
      return;
    }

    const normalizedPath = normalizeProposalPath(item);

    if (forbiddenFileSet.has(normalizedPath)) {
      addIssue(issues, {
        code: 'intended_file_forbidden',
        message: `intended_files contains a forbidden file path: ${item}.`,
        path: `intended_files[${index}]`,
      });
    }

    for (const { name, pattern } of PROTECTED_INTENDED_FILE_PATH_PATTERNS) {
      if (pattern.test(normalizedPath)) {
        addIssue(issues, {
          code: 'intended_file_protected_scope',
          message: `intended_files contains a protected ${name}: ${item}.`,
          path: `intended_files[${index}]`,
        });
        break;
      }
    }
  });
}

function validateProposalStatusNextStepConsistency(
  proposal: UnknownRecord,
  issues: ImplementationProposalValidationIssue[],
): void {
  if (
    typeof proposal.proposal_status !== 'string'
    || !IMPLEMENTATION_PROPOSAL_STATUS_SET.has(proposal.proposal_status)
    || typeof proposal.allowed_next_step !== 'string'
    || !IMPLEMENTATION_PROPOSAL_ALLOWED_NEXT_STEP_SET.has(proposal.allowed_next_step)
  ) {
    return;
  }

  if (
    IMPLEMENTATION_PROPOSAL_HUMAN_REVIEW_ONLY_STATUSES.has(proposal.proposal_status)
    && proposal.allowed_next_step !== 'human_review_only'
  ) {
    addIssue(issues, {
      code: 'proposal_status_allowed_next_step_mismatch',
      message: `proposal_status ${proposal.proposal_status} requires allowed_next_step human_review_only.`,
      path: 'allowed_next_step',
    });
  }
}

function validateHumanReviewDecisionRelationship(
  proposal: UnknownRecord,
  humanReviewDecision: HumanReviewDecision | undefined,
  issues: ImplementationProposalValidationIssue[],
): void {
  if (!humanReviewDecision) {
    return;
  }

  const decision = asRecord(humanReviewDecision);
  if (!decision) {
    addIssue(issues, {
      code: 'human_review_decision_invalid',
      message: 'Human review decision must be an object when provided.',
      path: 'humanReviewDecision',
    });
    return;
  }

  if (decision.outcome !== 'approved_for_later_implementation') {
    addIssue(issues, {
      code: 'human_review_decision_outcome_invalid',
      message: 'Implementation proposal requires approved_for_later_implementation.',
      path: 'humanReviewDecision.outcome',
    });
  }

  if (decision.allowed_next_step !== 'separate_implementation_pr_only') {
    addIssue(issues, {
      code: 'human_review_decision_allowed_next_step_invalid',
      message: 'Implementation proposal requires separate_implementation_pr_only.',
      path: 'humanReviewDecision.allowed_next_step',
    });
  }

  if (decision.requires_separate_implementation !== true) {
    addIssue(issues, {
      code: 'human_review_decision_separate_implementation_required',
      message: 'Human review decision must require separate implementation.',
      path: 'humanReviewDecision.requires_separate_implementation',
    });
  }

  if (proposal.source_decision_id !== decision.decision_id) {
    addIssue(issues, {
      code: 'source_decision_id_mismatch',
      message: 'Implementation proposal source_decision_id must match decision_id.',
      path: 'source_decision_id',
    });
  }

  if (proposal.source_decision_version !== decision.decision_version) {
    addIssue(issues, {
      code: 'source_decision_version_mismatch',
      message: 'Implementation proposal source_decision_version must match decision_version.',
      path: 'source_decision_version',
    });
  }

  if (proposal.reviewed_result_id !== decision.reviewed_result_id) {
    addIssue(issues, {
      code: 'reviewed_result_id_mismatch',
      message: 'Implementation proposal reviewed_result_id must match human review decision.',
      path: 'reviewed_result_id',
    });
  }

  if (proposal.reviewed_result_version !== decision.reviewed_result_version) {
    addIssue(issues, {
      code: 'reviewed_result_version_mismatch',
      message: 'Implementation proposal reviewed_result_version must match human review decision.',
      path: 'reviewed_result_version',
    });
  }

  if (proposal.job_kind !== decision.job_kind) {
    addIssue(issues, {
      code: 'job_kind_mismatch',
      message: 'Implementation proposal job_kind must match human review decision.',
      path: 'job_kind',
    });
  }

  if (proposal.context_pack_id !== decision.context_pack_id) {
    addIssue(issues, {
      code: 'context_pack_id_mismatch',
      message: 'Implementation proposal context_pack_id must match human review decision.',
      path: 'context_pack_id',
    });
  }

  if (proposal.context_pack_version !== decision.context_pack_version) {
    addIssue(issues, {
      code: 'context_pack_version_mismatch',
      message: 'Implementation proposal context_pack_version must match human review decision.',
      path: 'context_pack_version',
    });
  }

  if (decision.is_production_state !== false) {
    addIssue(issues, {
      code: 'human_review_decision_non_production_state_required',
      message: 'Human review decision must not be production state.',
      path: 'humanReviewDecision.is_production_state',
    });
  }

  if (decision.does_not_modify_api !== true) {
    addIssue(issues, {
      code: 'human_review_decision_does_not_modify_api_required',
      message: 'Human review decision must explicitly not modify APIs.',
      path: 'humanReviewDecision.does_not_modify_api',
    });
  }

  if (decision.does_not_write_db !== true) {
    addIssue(issues, {
      code: 'human_review_decision_does_not_write_db_required',
      message: 'Human review decision must explicitly not write to the database.',
      path: 'humanReviewDecision.does_not_write_db',
    });
  }

  if (decision.does_not_publish_externally !== true) {
    addIssue(issues, {
      code: 'human_review_decision_does_not_publish_externally_required',
      message: 'Human review decision must explicitly not publish externally.',
      path: 'humanReviewDecision.does_not_publish_externally',
    });
  }
}

export function validateImplementationProposal(
  proposal: unknown,
  humanReviewDecision?: HumanReviewDecision,
): ImplementationProposalValidationResult {
  const issues: ImplementationProposalValidationIssue[] = [];
  const proposalRecord = asRecord(proposal);

  if (!proposalRecord) {
    addIssue(issues, {
      code: 'proposal_invalid',
      message: 'Implementation proposal must be an object.',
    });
    return { passed: false, issues };
  }

  if (!isNonEmptyString(proposalRecord.proposal_id)) {
    addIssue(issues, {
      code: 'proposal_id_missing',
      message: 'proposal_id must be a non-empty string.',
      path: 'proposal_id',
    });
  }

  if (proposalRecord.proposal_version !== IMPLEMENTATION_PROPOSAL_VERSION) {
    addIssue(issues, {
      code: 'proposal_version_invalid',
      message: `proposal_version must be ${IMPLEMENTATION_PROPOSAL_VERSION}.`,
      path: 'proposal_version',
    });
  }

  if (!isNonEmptyString(proposalRecord.source_decision_id)) {
    addIssue(issues, {
      code: 'source_decision_id_missing',
      message: 'source_decision_id must be a non-empty string.',
      path: 'source_decision_id',
    });
  }

  if (proposalRecord.source_decision_version !== HUMAN_REVIEW_DECISION_VERSION) {
    addIssue(issues, {
      code: 'source_decision_version_invalid',
      message: `source_decision_version must be ${HUMAN_REVIEW_DECISION_VERSION}.`,
      path: 'source_decision_version',
    });
  }

  if (!isNonEmptyString(proposalRecord.reviewed_result_id)) {
    addIssue(issues, {
      code: 'reviewed_result_id_missing',
      message: 'reviewed_result_id must be a non-empty string.',
      path: 'reviewed_result_id',
    });
  }

  if (proposalRecord.reviewed_result_version !== AI_ANALYSIS_JOB_RESULT_VERSION) {
    addIssue(issues, {
      code: 'reviewed_result_version_invalid',
      message: `reviewed_result_version must be ${AI_ANALYSIS_JOB_RESULT_VERSION}.`,
      path: 'reviewed_result_version',
    });
  }

  if (
    typeof proposalRecord.job_kind !== 'string'
    || !AI_ANALYSIS_JOB_KIND_SET.has(proposalRecord.job_kind)
  ) {
    addIssue(issues, {
      code: 'job_kind_invalid',
      message: `job_kind must be one of: ${AI_ANALYSIS_JOB_KINDS.join(', ')}.`,
      path: 'job_kind',
    });
  }

  if (!isNonEmptyString(proposalRecord.context_pack_id)) {
    addIssue(issues, {
      code: 'context_pack_id_missing',
      message: 'context_pack_id must be a non-empty string.',
      path: 'context_pack_id',
    });
  }

  if (proposalRecord.context_pack_version !== CONTEXT_PACK_VERSION) {
    addIssue(issues, {
      code: 'context_pack_version_invalid',
      message: `context_pack_version must be ${CONTEXT_PACK_VERSION}.`,
      path: 'context_pack_version',
    });
  }

  if (!isUnixSeconds(proposalRecord.created_at)) {
    addIssue(issues, {
      code: 'created_at_invalid',
      message: 'created_at must be a non-negative integer Unix timestamp in seconds.',
      path: 'created_at',
    });
  }

  if (
    typeof proposalRecord.proposal_status === 'string'
    && IMPLEMENTATION_PROPOSAL_FORBIDDEN_STATUS_SET.has(proposalRecord.proposal_status)
  ) {
    addIssue(issues, {
      code: 'proposal_status_forbidden',
      message: `proposal_status must not be ${proposalRecord.proposal_status}.`,
      path: 'proposal_status',
    });
  } else if (
    typeof proposalRecord.proposal_status !== 'string'
    || !IMPLEMENTATION_PROPOSAL_STATUS_SET.has(proposalRecord.proposal_status)
  ) {
    addIssue(issues, {
      code: 'proposal_status_invalid',
      message: `proposal_status must be one of: ${IMPLEMENTATION_PROPOSAL_STATUSES.join(', ')}.`,
      path: 'proposal_status',
    });
  }

  if (
    typeof proposalRecord.change_type === 'string'
    && IMPLEMENTATION_PROPOSAL_FORBIDDEN_CHANGE_TYPE_SET.has(proposalRecord.change_type)
  ) {
    addIssue(issues, {
      code: 'change_type_forbidden',
      message: `change_type must not be ${proposalRecord.change_type}.`,
      path: 'change_type',
    });
  } else if (
    typeof proposalRecord.change_type !== 'string'
    || !IMPLEMENTATION_PROPOSAL_CHANGE_TYPE_SET.has(proposalRecord.change_type)
  ) {
    addIssue(issues, {
      code: 'change_type_invalid',
      message: `change_type must be one of: ${IMPLEMENTATION_PROPOSAL_CHANGE_TYPES.join(', ')}.`,
      path: 'change_type',
    });
  }

  if (!isNonEmptyString(proposalRecord.summary)) {
    addIssue(issues, {
      code: 'summary_missing',
      message: 'summary must be a non-empty string.',
      path: 'summary',
    });
  }

  if (!isNonEmptyString(proposalRecord.rationale)) {
    addIssue(issues, {
      code: 'rationale_missing',
      message: 'rationale must be a non-empty string.',
      path: 'rationale',
    });
  }

  validateStringArray({ proposal: proposalRecord, issues, key: 'intended_files' });
  validateStringArray({ proposal: proposalRecord, issues, key: 'forbidden_files' });
  validateStringArray({ proposal: proposalRecord, issues, key: 'acceptance_criteria' });
  validateStringArray({ proposal: proposalRecord, issues, key: 'test_plan' });
  validateStringArray({ proposal: proposalRecord, issues, key: 'rollback_plan' });
  validateStringArray({ proposal: proposalRecord, issues, key: 'residual_risks' });
  validateIntendedFileScope(proposalRecord, issues);

  if (proposalRecord.requires_human_approval !== true) {
    addIssue(issues, {
      code: 'requires_human_approval_required',
      message: 'Implementation proposal must require human approval.',
      path: 'requires_human_approval',
    });
  }

  if (proposalRecord.requires_separate_pr !== true) {
    addIssue(issues, {
      code: 'requires_separate_pr_required',
      message: 'Implementation proposal must require a separate PR.',
      path: 'requires_separate_pr',
    });
  }

  if (
    typeof proposalRecord.allowed_next_step !== 'string'
    || !IMPLEMENTATION_PROPOSAL_ALLOWED_NEXT_STEP_SET.has(proposalRecord.allowed_next_step)
  ) {
    addIssue(issues, {
      code: 'allowed_next_step_invalid',
      message: `allowed_next_step must be one of: ${IMPLEMENTATION_PROPOSAL_ALLOWED_NEXT_STEPS.join(', ')}.`,
      path: 'allowed_next_step',
    });
  }

  validateProposalStatusNextStepConsistency(proposalRecord, issues);
  validateForbiddenNextSteps(proposalRecord, issues);

  if (proposalRecord.proposal_only !== true) {
    addIssue(issues, {
      code: 'proposal_only_required',
      message: 'Implementation proposal must remain proposal_only.',
      path: 'proposal_only',
    });
  }

  if (proposalRecord.is_production_state !== false) {
    addIssue(issues, {
      code: 'non_production_state_required',
      message: 'Implementation proposal must not be production state.',
      path: 'is_production_state',
    });
  }

  if (proposalRecord.does_not_modify_api !== true) {
    addIssue(issues, {
      code: 'does_not_modify_api_required',
      message: 'Implementation proposal must explicitly not modify APIs.',
      path: 'does_not_modify_api',
    });
  }

  if (proposalRecord.does_not_write_db !== true) {
    addIssue(issues, {
      code: 'does_not_write_db_required',
      message: 'Implementation proposal must explicitly not write to the database.',
      path: 'does_not_write_db',
    });
  }

  if (proposalRecord.does_not_run_migration !== true) {
    addIssue(issues, {
      code: 'does_not_run_migration_required',
      message: 'Implementation proposal must explicitly not run migrations.',
      path: 'does_not_run_migration',
    });
  }

  if (proposalRecord.does_not_deploy !== true) {
    addIssue(issues, {
      code: 'does_not_deploy_required',
      message: 'Implementation proposal must explicitly not deploy.',
      path: 'does_not_deploy',
    });
  }

  if (proposalRecord.does_not_publish_externally !== true) {
    addIssue(issues, {
      code: 'does_not_publish_externally_required',
      message: 'Implementation proposal must explicitly not publish externally.',
      path: 'does_not_publish_externally',
    });
  }

  validateNoHighRiskOperationRecommendations(proposalRecord, issues);

  const restrictedContentIssue = getRestrictedContentIssue(proposalRecord);
  if (restrictedContentIssue) {
    addIssue(issues, {
      code: 'restricted_content_detected',
      message: restrictedContentIssue,
    });
  }

  validateHumanReviewDecisionRelationship(
    proposalRecord,
    humanReviewDecision,
    issues,
  );

  return {
    passed: issues.length === 0,
    issues,
  };
}

import {
  AI_ANALYSIS_JOB_KINDS,
} from '../ai-analysis-jobs/types';
import { assertNoRestrictedContent } from '../memory/validation';
import {
  IMPLEMENTATION_PROPOSAL_VERSION,
  type ImplementationProposal,
} from '../implementation-proposals/types';
import {
  TASK_BOARD_ALLOWED_NEXT_STEPS,
  TASK_BOARD_FORBIDDEN_ALLOWED_NEXT_STEPS,
  TASK_BOARD_REQUIRED_FORBIDDEN_NEXT_STEPS,
  TASK_CARD_AUTONOMY_LEVELS,
  TASK_CARD_FORBIDDEN_AUTONOMY_LEVELS,
  TASK_CARD_FORBIDDEN_STATUSES,
  TASK_CARD_PRIORITIES,
  TASK_CARD_STATUSES,
  TASK_CARD_VERSION,
  TASK_HANDOFF_VERSION,
  type TaskBoardAllowedNextStep,
  type TaskCard,
  type TaskCardStatus,
  type TaskCardValidationIssue,
  type TaskCardValidationResult,
  type TaskHandoffValidationIssue,
  type TaskHandoffValidationResult,
} from './types';

type UnknownRecord = Record<string, unknown>;

const AI_ANALYSIS_JOB_KIND_SET = new Set<string>(AI_ANALYSIS_JOB_KINDS);
const TASK_CARD_STATUS_SET = new Set<string>(TASK_CARD_STATUSES);
const TASK_CARD_FORBIDDEN_STATUS_SET = new Set<string>(TASK_CARD_FORBIDDEN_STATUSES);
const TASK_CARD_PRIORITY_SET = new Set<string>(TASK_CARD_PRIORITIES);
const TASK_CARD_AUTONOMY_LEVEL_SET = new Set<string>(TASK_CARD_AUTONOMY_LEVELS);
const TASK_CARD_FORBIDDEN_AUTONOMY_LEVEL_SET = new Set<string>(
  TASK_CARD_FORBIDDEN_AUTONOMY_LEVELS,
);
const TASK_BOARD_ALLOWED_NEXT_STEP_SET = new Set<string>(TASK_BOARD_ALLOWED_NEXT_STEPS);
const TASK_BOARD_FORBIDDEN_ALLOWED_NEXT_STEP_SET = new Set<string>(
  TASK_BOARD_FORBIDDEN_ALLOWED_NEXT_STEPS,
);

const ALLOWED_NEXT_STEPS_BY_TASK_STATUS: Record<
  TaskCardStatus,
  readonly TaskBoardAllowedNextStep[]
> = {
  new: ['human_review_only', 'revise_task_card_only'],
  triaged: ['human_review_only', 'prepare_draft_pr_instructions_only'],
  waiting_for_context: ['human_review_only'],
  waiting_for_human_approval: ['human_review_only'],
  ready_for_draft_pr: ['prepare_draft_pr_instructions_only'],
  blocked: ['human_review_only'],
  needs_revision: ['revise_task_card_only'],
  archived: ['archive_only'],
};

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
    pattern: /\b(?:start|begin|enable|trigger|run|use\s+(?:this|task|handoff|proposal)?\s*for)\s+automated\s+trading\b/i,
  },
  {
    name: 'navigation guidance recommendation',
    pattern: /\b(?:use\s+(?:this|task|handoff|proposal)?\s*(?:for|as)\s+navigation(?:\s+guidance)?|navigation\s+guidance)\b/i,
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
    name: 'PR creation recommendation',
    pattern: /\bcreate\s+(?:a\s+)?(?:draft\s+)?PR\b/i,
  },
  {
    name: 'PR merge recommendation',
    pattern: /\bmerge\s+(?:the\s+)?PR\b/i,
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
    pattern: /\b(?:apply\s+(?:it|this|task|handoff|proposal)?\s*automatically|automatically\s+apply|auto-?apply)\b/i,
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

function isUnitIntervalNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 1;
}

function normalizeContractPath(value: string): string {
  return value.trim().replace(/\\/g, '/').replace(/^\.\/+/, '').replace(/\/+/g, '/').toLowerCase();
}

function addTaskCardIssue(
  issues: TaskCardValidationIssue[],
  params: Omit<TaskCardValidationIssue, 'severity'>,
): void {
  issues.push({
    ...params,
    severity: 'blocking',
  });
}

function addTaskHandoffIssue(
  issues: TaskHandoffValidationIssue[],
  params: Omit<TaskHandoffValidationIssue, 'severity'>,
): void {
  issues.push({
    ...params,
    severity: 'blocking',
  });
}

function getRestrictedContentIssue(value: unknown, context: string): string | null {
  try {
    assertNoRestrictedContent(value, context);
    return null;
  } catch (error) {
    if (error instanceof Error) {
      return error.message;
    }

    return `${context} contains restricted content.`;
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

function validateTaskCardStringArray(params: {
  taskCard: UnknownRecord;
  issues: TaskCardValidationIssue[];
  key:
    | 'intended_files'
    | 'forbidden_files'
    | 'acceptance_criteria'
    | 'test_plan'
    | 'rollback_plan'
    | 'residual_risks';
}): void {
  const value = params.taskCard[params.key];

  if (!Array.isArray(value)) {
    addTaskCardIssue(params.issues, {
      code: `${params.key}_invalid`,
      message: `${params.key} must be an array.`,
      path: params.key,
    });
    return;
  }

  value.forEach((item, index) => {
    if (!isNonEmptyString(item)) {
      addTaskCardIssue(params.issues, {
        code: `${params.key}_item_invalid`,
        message: `${params.key} items must be non-empty strings.`,
        path: `${params.key}[${index}]`,
      });
    }
  });
}

function validateTaskHandoffStringArray(params: {
  handoff: UnknownRecord;
  issues: TaskHandoffValidationIssue[];
  key:
    | 'what_has_been_done'
    | 'key_findings'
    | 'decisions_made'
    | 'open_questions'
    | 'blockers'
    | 'inputs_passed'
    | 'outputs_produced'
    | 'risks'
    | 'references';
}): void {
  const value = params.handoff[params.key];

  if (!Array.isArray(value)) {
    addTaskHandoffIssue(params.issues, {
      code: `${params.key}_invalid`,
      message: `${params.key} must be an array.`,
      path: params.key,
    });
    return;
  }

  value.forEach((item, index) => {
    if (!isNonEmptyString(item)) {
      addTaskHandoffIssue(params.issues, {
        code: `${params.key}_item_invalid`,
        message: `${params.key} items must be non-empty strings.`,
        path: `${params.key}[${index}]`,
      });
    }
  });
}

function validateTaskCardIntendedFileScope(
  taskCard: UnknownRecord,
  issues: TaskCardValidationIssue[],
): void {
  if (!Array.isArray(taskCard.intended_files) || !Array.isArray(taskCard.forbidden_files)) {
    return;
  }

  const forbiddenFileSet = new Set(
    taskCard.forbidden_files
      .filter((item): item is string => isNonEmptyString(item))
      .map((item) => normalizeContractPath(item)),
  );

  taskCard.intended_files.forEach((item, index) => {
    if (!isNonEmptyString(item)) {
      return;
    }

    const normalizedPath = normalizeContractPath(item);

    if (forbiddenFileSet.has(normalizedPath)) {
      addTaskCardIssue(issues, {
        code: 'intended_file_forbidden',
        message: `intended_files contains a forbidden file path: ${item}.`,
        path: `intended_files[${index}]`,
      });
    }

    for (const { name, pattern } of PROTECTED_INTENDED_FILE_PATH_PATTERNS) {
      if (pattern.test(normalizedPath)) {
        addTaskCardIssue(issues, {
          code: 'intended_file_protected_scope',
          message: `intended_files contains a protected ${name}: ${item}.`,
          path: `intended_files[${index}]`,
        });
        break;
      }
    }
  });
}

function validateTaskCardForbiddenNextSteps(
  taskCard: UnknownRecord,
  issues: TaskCardValidationIssue[],
): void {
  if (!Array.isArray(taskCard.forbidden_next_steps)) {
    addTaskCardIssue(issues, {
      code: 'forbidden_next_steps_missing',
      message: 'Task card must include forbidden_next_steps.',
      path: 'forbidden_next_steps',
    });
    return;
  }

  for (const step of TASK_BOARD_REQUIRED_FORBIDDEN_NEXT_STEPS) {
    if (!taskCard.forbidden_next_steps.includes(step)) {
      addTaskCardIssue(issues, {
        code: 'forbidden_next_step_missing',
        message: `Task card must forbid ${step}.`,
        path: 'forbidden_next_steps',
      });
    }
  }
}

function validateTaskHandoffForbiddenNextSteps(
  handoff: UnknownRecord,
  issues: TaskHandoffValidationIssue[],
): void {
  if (!Array.isArray(handoff.forbidden_next_steps)) {
    addTaskHandoffIssue(issues, {
      code: 'forbidden_next_steps_missing',
      message: 'Task handoff must include forbidden_next_steps.',
      path: 'forbidden_next_steps',
    });
    return;
  }

  for (const step of TASK_BOARD_REQUIRED_FORBIDDEN_NEXT_STEPS) {
    if (!handoff.forbidden_next_steps.includes(step)) {
      addTaskHandoffIssue(issues, {
        code: 'forbidden_next_step_missing',
        message: `Task handoff must forbid ${step}.`,
        path: 'forbidden_next_steps',
      });
    }
  }
}

function validateTaskCardHighRiskOperationRecommendations(
  taskCard: UnknownRecord,
  issues: TaskCardValidationIssue[],
): void {
  const candidates: Array<{ value: unknown; path: string }> = [
    { value: taskCard.objective, path: 'objective' },
    { value: taskCard.context_summary, path: 'context_summary' },
  ];

  for (const key of [
    'acceptance_criteria',
    'test_plan',
    'rollback_plan',
    'residual_risks',
  ] as const) {
    if (Array.isArray(taskCard[key])) {
      taskCard[key].forEach((item, index) => {
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
      addTaskCardIssue(issues, {
        code: 'high_risk_operation_recommendation',
        message: recommendationIssue.message,
        path: recommendationIssue.path,
      });
    }
  }
}

function validateTaskHandoffHighRiskOperationRecommendations(
  handoff: UnknownRecord,
  issues: TaskHandoffValidationIssue[],
): void {
  const candidates: Array<{ value: unknown; path: string }> = [
    { value: handoff.required_next_action, path: 'required_next_action' },
  ];

  for (const candidate of candidates) {
    const recommendationIssue = getHighRiskOperationRecommendationIssue(
      candidate.value,
      candidate.path,
    );
    if (recommendationIssue) {
      addTaskHandoffIssue(issues, {
        code: 'high_risk_operation_recommendation',
        message: recommendationIssue.message,
        path: recommendationIssue.path,
      });
    }
  }
}

function validateTaskCardStatusNextStepConsistency(
  taskCard: UnknownRecord,
  issues: TaskCardValidationIssue[],
): void {
  if (
    typeof taskCard.status !== 'string'
    || !TASK_CARD_STATUS_SET.has(taskCard.status)
    || typeof taskCard.allowed_next_step !== 'string'
    || !TASK_BOARD_ALLOWED_NEXT_STEP_SET.has(taskCard.allowed_next_step)
  ) {
    return;
  }

  const status = taskCard.status as TaskCardStatus;
  const allowedNextSteps = ALLOWED_NEXT_STEPS_BY_TASK_STATUS[status];

  if (!allowedNextSteps.includes(taskCard.allowed_next_step as TaskBoardAllowedNextStep)) {
    addTaskCardIssue(issues, {
      code: 'task_status_allowed_next_step_mismatch',
      message: `status ${status} does not allow allowed_next_step ${taskCard.allowed_next_step}.`,
      path: 'allowed_next_step',
    });
  }
}

function validateTaskHandoffStatusNextStepConsistency(
  handoff: UnknownRecord,
  issues: TaskHandoffValidationIssue[],
): void {
  if (
    typeof handoff.current_status !== 'string'
    || !TASK_CARD_STATUS_SET.has(handoff.current_status)
    || typeof handoff.allowed_next_step !== 'string'
    || !TASK_BOARD_ALLOWED_NEXT_STEP_SET.has(handoff.allowed_next_step)
  ) {
    return;
  }

  const status = handoff.current_status as TaskCardStatus;
  const allowedNextSteps = ALLOWED_NEXT_STEPS_BY_TASK_STATUS[status];

  if (!allowedNextSteps.includes(handoff.allowed_next_step as TaskBoardAllowedNextStep)) {
    addTaskHandoffIssue(issues, {
      code: 'handoff_status_allowed_next_step_mismatch',
      message: `current_status ${status} does not allow allowed_next_step ${handoff.allowed_next_step}.`,
      path: 'allowed_next_step',
    });
  }
}

function validateImplementationProposalRelationship(
  taskCard: UnknownRecord,
  implementationProposal: ImplementationProposal | undefined,
  issues: TaskCardValidationIssue[],
): void {
  if (!implementationProposal) {
    return;
  }

  const proposal = asRecord(implementationProposal);
  if (!proposal) {
    addTaskCardIssue(issues, {
      code: 'implementation_proposal_invalid',
      message: 'Implementation proposal must be an object when provided.',
      path: 'implementationProposal',
    });
    return;
  }

  if (proposal.proposal_status !== 'proposal' && proposal.proposal_status !== 'needs_review') {
    addTaskCardIssue(issues, {
      code: 'implementation_proposal_status_invalid',
      message: 'Task card requires an implementation proposal with proposal or needs_review status.',
      path: 'implementationProposal.proposal_status',
    });
  }

  if (proposal.requires_human_approval !== true) {
    addTaskCardIssue(issues, {
      code: 'implementation_proposal_human_approval_required',
      message: 'Implementation proposal must require human approval.',
      path: 'implementationProposal.requires_human_approval',
    });
  }

  if (proposal.requires_separate_pr !== true) {
    addTaskCardIssue(issues, {
      code: 'implementation_proposal_separate_pr_required',
      message: 'Implementation proposal must require a separate PR.',
      path: 'implementationProposal.requires_separate_pr',
    });
  }

  if (proposal.proposal_only !== true) {
    addTaskCardIssue(issues, {
      code: 'implementation_proposal_proposal_only_required',
      message: 'Implementation proposal must remain proposal_only.',
      path: 'implementationProposal.proposal_only',
    });
  }

  if (proposal.is_production_state !== false) {
    addTaskCardIssue(issues, {
      code: 'implementation_proposal_non_production_state_required',
      message: 'Implementation proposal must not be production state.',
      path: 'implementationProposal.is_production_state',
    });
  }

  if (proposal.does_not_modify_api !== true) {
    addTaskCardIssue(issues, {
      code: 'implementation_proposal_does_not_modify_api_required',
      message: 'Implementation proposal must explicitly not modify APIs.',
      path: 'implementationProposal.does_not_modify_api',
    });
  }

  if (proposal.does_not_write_db !== true) {
    addTaskCardIssue(issues, {
      code: 'implementation_proposal_does_not_write_db_required',
      message: 'Implementation proposal must explicitly not write to the database.',
      path: 'implementationProposal.does_not_write_db',
    });
  }

  if (proposal.does_not_run_migration !== true) {
    addTaskCardIssue(issues, {
      code: 'implementation_proposal_does_not_run_migration_required',
      message: 'Implementation proposal must explicitly not run migrations.',
      path: 'implementationProposal.does_not_run_migration',
    });
  }

  if (proposal.does_not_deploy !== true) {
    addTaskCardIssue(issues, {
      code: 'implementation_proposal_does_not_deploy_required',
      message: 'Implementation proposal must explicitly not deploy.',
      path: 'implementationProposal.does_not_deploy',
    });
  }

  if (proposal.does_not_publish_externally !== true) {
    addTaskCardIssue(issues, {
      code: 'implementation_proposal_does_not_publish_externally_required',
      message: 'Implementation proposal must explicitly not publish externally.',
      path: 'implementationProposal.does_not_publish_externally',
    });
  }

  if (taskCard.source_proposal_id !== proposal.proposal_id) {
    addTaskCardIssue(issues, {
      code: 'source_proposal_id_mismatch',
      message: 'Task card source_proposal_id must match implementation proposal.',
      path: 'source_proposal_id',
    });
  }

  if (taskCard.source_proposal_version !== proposal.proposal_version) {
    addTaskCardIssue(issues, {
      code: 'source_proposal_version_mismatch',
      message: 'Task card source_proposal_version must match implementation proposal.',
      path: 'source_proposal_version',
    });
  }

  if (taskCard.source_decision_id !== proposal.source_decision_id) {
    addTaskCardIssue(issues, {
      code: 'source_decision_id_mismatch',
      message: 'Task card source_decision_id must match implementation proposal.',
      path: 'source_decision_id',
    });
  }

  if (taskCard.reviewed_result_id !== proposal.reviewed_result_id) {
    addTaskCardIssue(issues, {
      code: 'reviewed_result_id_mismatch',
      message: 'Task card reviewed_result_id must match implementation proposal.',
      path: 'reviewed_result_id',
    });
  }

  if (taskCard.job_kind !== proposal.job_kind) {
    addTaskCardIssue(issues, {
      code: 'job_kind_mismatch',
      message: 'Task card job_kind must match implementation proposal.',
      path: 'job_kind',
    });
  }

  if (taskCard.context_pack_id !== proposal.context_pack_id) {
    addTaskCardIssue(issues, {
      code: 'context_pack_id_mismatch',
      message: 'Task card context_pack_id must match implementation proposal.',
      path: 'context_pack_id',
    });
  }
}

export function validateTaskCard(
  taskCard: unknown,
  implementationProposal?: ImplementationProposal,
): TaskCardValidationResult {
  const issues: TaskCardValidationIssue[] = [];
  const taskCardRecord = asRecord(taskCard);

  if (!taskCardRecord) {
    addTaskCardIssue(issues, {
      code: 'task_card_invalid',
      message: 'Task card must be an object.',
    });
    return { passed: false, issues };
  }

  if (!isNonEmptyString(taskCardRecord.task_id)) {
    addTaskCardIssue(issues, {
      code: 'task_id_missing',
      message: 'task_id must be a non-empty string.',
      path: 'task_id',
    });
  }

  if (taskCardRecord.task_version !== TASK_CARD_VERSION) {
    addTaskCardIssue(issues, {
      code: 'task_version_invalid',
      message: `task_version must be ${TASK_CARD_VERSION}.`,
      path: 'task_version',
    });
  }

  if (!isNonEmptyString(taskCardRecord.source_proposal_id)) {
    addTaskCardIssue(issues, {
      code: 'source_proposal_id_missing',
      message: 'source_proposal_id must be a non-empty string.',
      path: 'source_proposal_id',
    });
  }

  if (taskCardRecord.source_proposal_version !== IMPLEMENTATION_PROPOSAL_VERSION) {
    addTaskCardIssue(issues, {
      code: 'source_proposal_version_invalid',
      message: `source_proposal_version must be ${IMPLEMENTATION_PROPOSAL_VERSION}.`,
      path: 'source_proposal_version',
    });
  }

  if (!isNonEmptyString(taskCardRecord.source_decision_id)) {
    addTaskCardIssue(issues, {
      code: 'source_decision_id_missing',
      message: 'source_decision_id must be a non-empty string.',
      path: 'source_decision_id',
    });
  }

  if (!isNonEmptyString(taskCardRecord.reviewed_result_id)) {
    addTaskCardIssue(issues, {
      code: 'reviewed_result_id_missing',
      message: 'reviewed_result_id must be a non-empty string.',
      path: 'reviewed_result_id',
    });
  }

  if (
    typeof taskCardRecord.job_kind !== 'string'
    || !AI_ANALYSIS_JOB_KIND_SET.has(taskCardRecord.job_kind)
  ) {
    addTaskCardIssue(issues, {
      code: 'job_kind_invalid',
      message: `job_kind must be one of: ${AI_ANALYSIS_JOB_KINDS.join(', ')}.`,
      path: 'job_kind',
    });
  }

  if (!isNonEmptyString(taskCardRecord.context_pack_id)) {
    addTaskCardIssue(issues, {
      code: 'context_pack_id_missing',
      message: 'context_pack_id must be a non-empty string.',
      path: 'context_pack_id',
    });
  }

  if (!isUnixSeconds(taskCardRecord.created_at)) {
    addTaskCardIssue(issues, {
      code: 'created_at_invalid',
      message: 'created_at must be a non-negative integer Unix timestamp in seconds.',
      path: 'created_at',
    });
  }

  if (!isNonEmptyString(taskCardRecord.title)) {
    addTaskCardIssue(issues, {
      code: 'title_missing',
      message: 'title must be a non-empty string.',
      path: 'title',
    });
  }

  if (
    typeof taskCardRecord.status === 'string'
    && TASK_CARD_FORBIDDEN_STATUS_SET.has(taskCardRecord.status)
  ) {
    addTaskCardIssue(issues, {
      code: 'status_forbidden',
      message: `status must not be ${taskCardRecord.status}.`,
      path: 'status',
    });
  } else if (
    typeof taskCardRecord.status !== 'string'
    || !TASK_CARD_STATUS_SET.has(taskCardRecord.status)
  ) {
    addTaskCardIssue(issues, {
      code: 'status_invalid',
      message: `status must be one of: ${TASK_CARD_STATUSES.join(', ')}.`,
      path: 'status',
    });
  }

  if (
    typeof taskCardRecord.priority !== 'string'
    || !TASK_CARD_PRIORITY_SET.has(taskCardRecord.priority)
  ) {
    addTaskCardIssue(issues, {
      code: 'priority_invalid',
      message: `priority must be one of: ${TASK_CARD_PRIORITIES.join(', ')}.`,
      path: 'priority',
    });
  }

  if (
    typeof taskCardRecord.autonomy_level === 'string'
    && TASK_CARD_FORBIDDEN_AUTONOMY_LEVEL_SET.has(taskCardRecord.autonomy_level)
  ) {
    addTaskCardIssue(issues, {
      code: 'autonomy_level_forbidden',
      message: `autonomy_level must not be ${taskCardRecord.autonomy_level}.`,
      path: 'autonomy_level',
    });
  } else if (
    typeof taskCardRecord.autonomy_level !== 'string'
    || !TASK_CARD_AUTONOMY_LEVEL_SET.has(taskCardRecord.autonomy_level)
  ) {
    addTaskCardIssue(issues, {
      code: 'autonomy_level_invalid',
      message: `autonomy_level must be one of: ${TASK_CARD_AUTONOMY_LEVELS.join(', ')}.`,
      path: 'autonomy_level',
    });
  }

  if (!isNonEmptyString(taskCardRecord.assigned_role)) {
    addTaskCardIssue(issues, {
      code: 'assigned_role_missing',
      message: 'assigned_role must be a non-empty string.',
      path: 'assigned_role',
    });
  }

  if (!isNonEmptyString(taskCardRecord.human_owner)) {
    addTaskCardIssue(issues, {
      code: 'human_owner_missing',
      message: 'human_owner must be a non-empty string.',
      path: 'human_owner',
    });
  }

  if (!isNonEmptyString(taskCardRecord.objective)) {
    addTaskCardIssue(issues, {
      code: 'objective_missing',
      message: 'objective must be a non-empty string.',
      path: 'objective',
    });
  }

  if (!isNonEmptyString(taskCardRecord.context_summary)) {
    addTaskCardIssue(issues, {
      code: 'context_summary_missing',
      message: 'context_summary must be a non-empty string.',
      path: 'context_summary',
    });
  }

  validateTaskCardStringArray({ taskCard: taskCardRecord, issues, key: 'intended_files' });
  validateTaskCardStringArray({ taskCard: taskCardRecord, issues, key: 'forbidden_files' });
  validateTaskCardStringArray({ taskCard: taskCardRecord, issues, key: 'acceptance_criteria' });
  validateTaskCardStringArray({ taskCard: taskCardRecord, issues, key: 'test_plan' });
  validateTaskCardStringArray({ taskCard: taskCardRecord, issues, key: 'rollback_plan' });
  validateTaskCardStringArray({ taskCard: taskCardRecord, issues, key: 'residual_risks' });
  validateTaskCardIntendedFileScope(taskCardRecord, issues);

  if (taskCardRecord.required_human_approval !== true) {
    addTaskCardIssue(issues, {
      code: 'required_human_approval_required',
      message: 'Task card must require human approval.',
      path: 'required_human_approval',
    });
  }

  if (
    typeof taskCardRecord.allowed_next_step === 'string'
    && TASK_BOARD_FORBIDDEN_ALLOWED_NEXT_STEP_SET.has(taskCardRecord.allowed_next_step)
  ) {
    addTaskCardIssue(issues, {
      code: 'allowed_next_step_forbidden',
      message: `allowed_next_step must not be ${taskCardRecord.allowed_next_step}.`,
      path: 'allowed_next_step',
    });
  } else if (
    typeof taskCardRecord.allowed_next_step !== 'string'
    || !TASK_BOARD_ALLOWED_NEXT_STEP_SET.has(taskCardRecord.allowed_next_step)
  ) {
    addTaskCardIssue(issues, {
      code: 'allowed_next_step_invalid',
      message: `allowed_next_step must be one of: ${TASK_BOARD_ALLOWED_NEXT_STEPS.join(', ')}.`,
      path: 'allowed_next_step',
    });
  }

  validateTaskCardStatusNextStepConsistency(taskCardRecord, issues);
  validateTaskCardForbiddenNextSteps(taskCardRecord, issues);

  if (taskCardRecord.proposal_only !== true) {
    addTaskCardIssue(issues, {
      code: 'proposal_only_required',
      message: 'Task card must remain proposal_only.',
      path: 'proposal_only',
    });
  }

  if (taskCardRecord.is_production_state !== false) {
    addTaskCardIssue(issues, {
      code: 'non_production_state_required',
      message: 'Task card must not be production state.',
      path: 'is_production_state',
    });
  }

  if (taskCardRecord.does_not_modify_api !== true) {
    addTaskCardIssue(issues, {
      code: 'does_not_modify_api_required',
      message: 'Task card must explicitly not modify APIs.',
      path: 'does_not_modify_api',
    });
  }

  if (taskCardRecord.does_not_write_db !== true) {
    addTaskCardIssue(issues, {
      code: 'does_not_write_db_required',
      message: 'Task card must explicitly not write to the database.',
      path: 'does_not_write_db',
    });
  }

  if (taskCardRecord.does_not_run_migration !== true) {
    addTaskCardIssue(issues, {
      code: 'does_not_run_migration_required',
      message: 'Task card must explicitly not run migrations.',
      path: 'does_not_run_migration',
    });
  }

  if (taskCardRecord.does_not_deploy !== true) {
    addTaskCardIssue(issues, {
      code: 'does_not_deploy_required',
      message: 'Task card must explicitly not deploy.',
      path: 'does_not_deploy',
    });
  }

  if (taskCardRecord.does_not_publish_externally !== true) {
    addTaskCardIssue(issues, {
      code: 'does_not_publish_externally_required',
      message: 'Task card must explicitly not publish externally.',
      path: 'does_not_publish_externally',
    });
  }

  validateTaskCardHighRiskOperationRecommendations(taskCardRecord, issues);

  const restrictedContentIssue = getRestrictedContentIssue(taskCardRecord, 'taskCard');
  if (restrictedContentIssue) {
    addTaskCardIssue(issues, {
      code: 'restricted_content_detected',
      message: restrictedContentIssue,
    });
  }

  validateImplementationProposalRelationship(
    taskCardRecord,
    implementationProposal,
    issues,
  );

  return {
    passed: issues.length === 0,
    issues,
  };
}

export function validateTaskHandoff(
  handoff: unknown,
  taskCard?: TaskCard,
): TaskHandoffValidationResult {
  const issues: TaskHandoffValidationIssue[] = [];
  const handoffRecord = asRecord(handoff);

  if (!handoffRecord) {
    addTaskHandoffIssue(issues, {
      code: 'handoff_invalid',
      message: 'Task handoff must be an object.',
    });
    return { passed: false, issues };
  }

  if (!isNonEmptyString(handoffRecord.handoff_id)) {
    addTaskHandoffIssue(issues, {
      code: 'handoff_id_missing',
      message: 'handoff_id must be a non-empty string.',
      path: 'handoff_id',
    });
  }

  if (handoffRecord.handoff_version !== TASK_HANDOFF_VERSION) {
    addTaskHandoffIssue(issues, {
      code: 'handoff_version_invalid',
      message: `handoff_version must be ${TASK_HANDOFF_VERSION}.`,
      path: 'handoff_version',
    });
  }

  if (!isNonEmptyString(handoffRecord.task_id)) {
    addTaskHandoffIssue(issues, {
      code: 'task_id_missing',
      message: 'task_id must be a non-empty string.',
      path: 'task_id',
    });
  }

  if (!isNonEmptyString(handoffRecord.source_role)) {
    addTaskHandoffIssue(issues, {
      code: 'source_role_missing',
      message: 'source_role must be a non-empty string.',
      path: 'source_role',
    });
  }

  if (!isNonEmptyString(handoffRecord.target_role)) {
    addTaskHandoffIssue(issues, {
      code: 'target_role_missing',
      message: 'target_role must be a non-empty string.',
      path: 'target_role',
    });
  }

  if (!isUnixSeconds(handoffRecord.created_at)) {
    addTaskHandoffIssue(issues, {
      code: 'created_at_invalid',
      message: 'created_at must be a non-negative integer Unix timestamp in seconds.',
      path: 'created_at',
    });
  }

  if (
    typeof handoffRecord.current_status === 'string'
    && TASK_CARD_FORBIDDEN_STATUS_SET.has(handoffRecord.current_status)
  ) {
    addTaskHandoffIssue(issues, {
      code: 'current_status_forbidden',
      message: `current_status must not be ${handoffRecord.current_status}.`,
      path: 'current_status',
    });
  } else if (
    typeof handoffRecord.current_status !== 'string'
    || !TASK_CARD_STATUS_SET.has(handoffRecord.current_status)
  ) {
    addTaskHandoffIssue(issues, {
      code: 'current_status_invalid',
      message: `current_status must be one of: ${TASK_CARD_STATUSES.join(', ')}.`,
      path: 'current_status',
    });
  }

  if (!isNonEmptyString(handoffRecord.objective)) {
    addTaskHandoffIssue(issues, {
      code: 'objective_missing',
      message: 'objective must be a non-empty string.',
      path: 'objective',
    });
  }

  validateTaskHandoffStringArray({ handoff: handoffRecord, issues, key: 'what_has_been_done' });
  validateTaskHandoffStringArray({ handoff: handoffRecord, issues, key: 'key_findings' });
  validateTaskHandoffStringArray({ handoff: handoffRecord, issues, key: 'decisions_made' });
  validateTaskHandoffStringArray({ handoff: handoffRecord, issues, key: 'open_questions' });
  validateTaskHandoffStringArray({ handoff: handoffRecord, issues, key: 'blockers' });
  validateTaskHandoffStringArray({ handoff: handoffRecord, issues, key: 'inputs_passed' });
  validateTaskHandoffStringArray({ handoff: handoffRecord, issues, key: 'outputs_produced' });
  validateTaskHandoffStringArray({ handoff: handoffRecord, issues, key: 'risks' });
  validateTaskHandoffStringArray({ handoff: handoffRecord, issues, key: 'references' });

  if (!isNonEmptyString(handoffRecord.required_next_action)) {
    addTaskHandoffIssue(issues, {
      code: 'required_next_action_missing',
      message: 'required_next_action must be a non-empty string.',
      path: 'required_next_action',
    });
  }

  if (!isUnitIntervalNumber(handoffRecord.confidence)) {
    addTaskHandoffIssue(issues, {
      code: 'confidence_invalid',
      message: 'confidence must be a finite number between 0 and 1.',
      path: 'confidence',
    });
  }

  if (!isUnitIntervalNumber(handoffRecord.completeness)) {
    addTaskHandoffIssue(issues, {
      code: 'completeness_invalid',
      message: 'completeness must be a finite number between 0 and 1.',
      path: 'completeness',
    });
  }

  if (handoffRecord.human_approval_required !== true) {
    addTaskHandoffIssue(issues, {
      code: 'human_approval_required_required',
      message: 'Task handoff must require human approval.',
      path: 'human_approval_required',
    });
  }

  if (
    typeof handoffRecord.allowed_next_step === 'string'
    && TASK_BOARD_FORBIDDEN_ALLOWED_NEXT_STEP_SET.has(handoffRecord.allowed_next_step)
  ) {
    addTaskHandoffIssue(issues, {
      code: 'allowed_next_step_forbidden',
      message: `allowed_next_step must not be ${handoffRecord.allowed_next_step}.`,
      path: 'allowed_next_step',
    });
  } else if (
    typeof handoffRecord.allowed_next_step !== 'string'
    || !TASK_BOARD_ALLOWED_NEXT_STEP_SET.has(handoffRecord.allowed_next_step)
  ) {
    addTaskHandoffIssue(issues, {
      code: 'allowed_next_step_invalid',
      message: `allowed_next_step must be one of: ${TASK_BOARD_ALLOWED_NEXT_STEPS.join(', ')}.`,
      path: 'allowed_next_step',
    });
  }

  validateTaskHandoffStatusNextStepConsistency(handoffRecord, issues);
  validateTaskHandoffForbiddenNextSteps(handoffRecord, issues);
  validateTaskHandoffHighRiskOperationRecommendations(handoffRecord, issues);

  const restrictedContentIssue = getRestrictedContentIssue(handoffRecord, 'taskHandoff');
  if (restrictedContentIssue) {
    addTaskHandoffIssue(issues, {
      code: 'restricted_content_detected',
      message: restrictedContentIssue,
    });
  }

  if (taskCard) {
    if (handoffRecord.task_id !== taskCard.task_id) {
      addTaskHandoffIssue(issues, {
        code: 'task_id_mismatch',
        message: 'Task handoff task_id must match task card.',
        path: 'task_id',
      });
    }

    if (handoffRecord.current_status !== taskCard.status) {
      addTaskHandoffIssue(issues, {
        code: 'current_status_mismatch',
        message: 'Task handoff current_status must match task card status.',
        path: 'current_status',
      });
    }
  }

  return {
    passed: issues.length === 0,
    issues,
  };
}

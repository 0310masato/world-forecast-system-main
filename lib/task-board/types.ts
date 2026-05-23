import type { AIAnalysisJobKind } from '../ai-analysis-jobs/types';

export const TASK_CARD_VERSION = 1 as const;
export const TASK_HANDOFF_VERSION = 1 as const;

export const TASK_CARD_STATUSES = [
  'new',
  'triaged',
  'waiting_for_context',
  'waiting_for_human_approval',
  'ready_for_draft_pr',
  'blocked',
  'needs_revision',
  'archived',
] as const;

export type TaskCardStatus = (typeof TASK_CARD_STATUSES)[number];

export const TASK_CARD_FORBIDDEN_STATUSES = [
  'in_progress',
  'done',
  'failed',
  'deployed',
  'merged',
  'applied',
  'production_released',
] as const;

export type TaskCardForbiddenStatus =
  (typeof TASK_CARD_FORBIDDEN_STATUSES)[number];

export const TASK_CARD_PRIORITIES = ['P0', 'P1', 'P2', 'P3'] as const;

export type TaskCardPriority = (typeof TASK_CARD_PRIORITIES)[number];

export const TASK_CARD_AUTONOMY_LEVELS = [
  'A0_advice_only',
  'A1_draft_only',
  'A2_prepare_for_approval',
] as const;

export type TaskCardAutonomyLevel =
  (typeof TASK_CARD_AUTONOMY_LEVELS)[number];

export const TASK_CARD_FORBIDDEN_AUTONOMY_LEVELS = [
  'A3_execute_reversible_low_risk_tasks',
  'A4_execute_with_external_effects',
  'A5_fully_autonomous',
] as const;

export type TaskCardForbiddenAutonomyLevel =
  (typeof TASK_CARD_FORBIDDEN_AUTONOMY_LEVELS)[number];

export const TASK_CARD_SOURCES = [
  'implementation_proposal',
  'human_review_decision',
  'ai_analysis_job_result',
  'manual_operator_note',
] as const;

export type TaskCardSource = (typeof TASK_CARD_SOURCES)[number];

export const TASK_BOARD_ALLOWED_NEXT_STEPS = [
  'prepare_draft_pr_instructions_only',
  'human_review_only',
  'revise_task_card_only',
  'archive_only',
] as const;

export type TaskBoardAllowedNextStep =
  (typeof TASK_BOARD_ALLOWED_NEXT_STEPS)[number];

export const TASK_BOARD_FORBIDDEN_ALLOWED_NEXT_STEPS = [
  'create_pr',
  'merge_pr',
  'deploy',
  'update_api',
  'run_migration',
  'write_db',
  'publish_external',
  'execute_worker',
  'schedule_job',
] as const;

export type TaskBoardForbiddenAllowedNextStep =
  (typeof TASK_BOARD_FORBIDDEN_ALLOWED_NEXT_STEPS)[number];

export const TASK_BOARD_REQUIRED_FORBIDDEN_NEXT_STEPS = [
  'production_write',
  'api_forecast_update',
  'api_hormuz_update',
  'external_publish',
  'automated_trading',
  'navigation_guidance',
  'military_guidance',
  'db_migration',
  'direct_deploy',
  'worker_runtime',
  'codex_app_server_runtime',
  'scheduler_runtime',
  'external_api_integration',
  'create_pr',
  'merge_pr',
] as const;

export type TaskBoardForbiddenNextStep =
  (typeof TASK_BOARD_REQUIRED_FORBIDDEN_NEXT_STEPS)[number];

export interface TaskCard {
  task_id: string;
  task_version: typeof TASK_CARD_VERSION;
  source_proposal_id: string;
  source_proposal_version: 1;
  source_decision_id: string;
  reviewed_result_id: string;
  job_kind: AIAnalysisJobKind;
  context_pack_id: string;
  created_at: number;
  title: string;
  status: TaskCardStatus;
  priority: TaskCardPriority;
  autonomy_level: TaskCardAutonomyLevel;
  assigned_role: string;
  human_owner: string;
  objective: string;
  context_summary: string;
  intended_files: string[];
  forbidden_files: string[];
  acceptance_criteria: string[];
  test_plan: string[];
  rollback_plan: string[];
  residual_risks: string[];
  required_human_approval: true;
  allowed_next_step: TaskBoardAllowedNextStep;
  forbidden_next_steps: TaskBoardForbiddenNextStep[];
  proposal_only: true;
  is_production_state: false;
  does_not_modify_api: true;
  does_not_write_db: true;
  does_not_run_migration: true;
  does_not_deploy: true;
  does_not_publish_externally: true;
}

export type TaskCardValidationIssueSeverity = 'blocking';

export interface TaskCardValidationIssue {
  code: string;
  severity: TaskCardValidationIssueSeverity;
  message: string;
  path?: string;
}

export interface TaskCardValidationResult {
  passed: boolean;
  issues: TaskCardValidationIssue[];
}

export interface TaskHandoffSource {
  source_role: string;
  task_id?: string;
  references?: string[];
}

export interface TaskHandoffTarget {
  target_role: string;
  required_next_action: string;
  human_approval_required: true;
}

export interface TaskHandoff {
  handoff_id: string;
  handoff_version: typeof TASK_HANDOFF_VERSION;
  task_id: string;
  source_role: string;
  target_role: string;
  created_at: number;
  current_status: TaskCardStatus;
  objective: string;
  what_has_been_done: string[];
  key_findings: string[];
  decisions_made: string[];
  open_questions: string[];
  blockers: string[];
  required_next_action: string;
  inputs_passed: string[];
  outputs_produced: string[];
  confidence: number;
  completeness: number;
  risks: string[];
  human_approval_required: true;
  allowed_next_step: TaskBoardAllowedNextStep;
  forbidden_next_steps: TaskBoardForbiddenNextStep[];
  references: string[];
}

export type TaskHandoffValidationIssueSeverity = 'blocking';

export interface TaskHandoffValidationIssue {
  code: string;
  severity: TaskHandoffValidationIssueSeverity;
  message: string;
  path?: string;
}

export interface TaskHandoffValidationResult {
  passed: boolean;
  issues: TaskHandoffValidationIssue[];
}

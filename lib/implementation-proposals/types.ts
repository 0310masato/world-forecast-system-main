import type { AIAnalysisJobKind } from '../ai-analysis-jobs/types';

export const IMPLEMENTATION_PROPOSAL_VERSION = 1 as const;

export const IMPLEMENTATION_PROPOSAL_STATUSES = [
  'proposal',
  'needs_review',
  'rejected',
  'needs_revision',
  'archived',
] as const;

export type ImplementationProposalStatus =
  (typeof IMPLEMENTATION_PROPOSAL_STATUSES)[number];

export const IMPLEMENTATION_PROPOSAL_FORBIDDEN_STATUSES = [
  'approved',
  'applied',
  'deployed',
  'merged',
  'production_released',
  'db_migrated',
  'api_updated',
] as const;

export type ImplementationProposalForbiddenStatus =
  (typeof IMPLEMENTATION_PROPOSAL_FORBIDDEN_STATUSES)[number];

export const IMPLEMENTATION_PROPOSAL_SCOPES = [
  'human_review_decision_follow_up',
  'separate_implementation_pr_planning',
] as const;

export type ImplementationProposalScope =
  (typeof IMPLEMENTATION_PROPOSAL_SCOPES)[number];

export const IMPLEMENTATION_PROPOSAL_CHANGE_TYPES = [
  'docs_only',
  'test_only',
  'contract_only',
  'validation_only',
  'refactor_plan_only',
  'implementation_plan_only',
] as const;

export type ImplementationProposalChangeType =
  (typeof IMPLEMENTATION_PROPOSAL_CHANGE_TYPES)[number];

export const IMPLEMENTATION_PROPOSAL_FORBIDDEN_CHANGE_TYPES = [
  'production_api_change',
  'db_migration',
  'external_api_integration',
  'worker_runtime',
  'codex_app_server_runtime',
  'scheduler_runtime',
  'direct_deploy',
  'production_write',
] as const;

export type ImplementationProposalForbiddenChangeType =
  (typeof IMPLEMENTATION_PROPOSAL_FORBIDDEN_CHANGE_TYPES)[number];

export const IMPLEMENTATION_PROPOSAL_ALLOWED_NEXT_STEPS = [
  'implementation_pr_draft_only',
  'human_review_only',
] as const;

export type ImplementationProposalAllowedNextStep =
  (typeof IMPLEMENTATION_PROPOSAL_ALLOWED_NEXT_STEPS)[number];

export const IMPLEMENTATION_PROPOSAL_REQUIRED_FORBIDDEN_NEXT_STEPS = [
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
] as const;

export type ImplementationProposalForbiddenNextStep =
  (typeof IMPLEMENTATION_PROPOSAL_REQUIRED_FORBIDDEN_NEXT_STEPS)[number];

export interface ImplementationProposal {
  proposal_id: string;
  proposal_version: typeof IMPLEMENTATION_PROPOSAL_VERSION;
  source_decision_id: string;
  source_decision_version: 1;
  reviewed_result_id: string;
  reviewed_result_version: 1;
  job_kind: AIAnalysisJobKind;
  context_pack_id: string;
  context_pack_version: 1;
  created_at: number;
  proposal_status: ImplementationProposalStatus;
  change_type: ImplementationProposalChangeType;
  summary: string;
  rationale: string;
  intended_files: string[];
  forbidden_files: string[];
  acceptance_criteria: string[];
  test_plan: string[];
  rollback_plan: string[];
  residual_risks: string[];
  requires_human_approval: true;
  requires_separate_pr: true;
  allowed_next_step: ImplementationProposalAllowedNextStep;
  forbidden_next_steps: ImplementationProposalForbiddenNextStep[];
  proposal_only: true;
  is_production_state: false;
  does_not_modify_api: true;
  does_not_write_db: true;
  does_not_run_migration: true;
  does_not_deploy: true;
  does_not_publish_externally: true;
}

export type ImplementationProposalValidationIssueSeverity = 'blocking';

export interface ImplementationProposalValidationIssue {
  code: string;
  severity: ImplementationProposalValidationIssueSeverity;
  message: string;
  path?: string;
}

export interface ImplementationProposalValidationResult {
  passed: boolean;
  issues: ImplementationProposalValidationIssue[];
}

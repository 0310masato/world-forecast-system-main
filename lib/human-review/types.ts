import type { AIAnalysisJobKind } from '../ai-analysis-jobs/types';

export const HUMAN_REVIEW_DECISION_VERSION = 1 as const;

export const HUMAN_REVIEW_DECISION_STATUSES = [
  'recorded',
] as const;

export type HumanReviewDecisionStatus =
  (typeof HUMAN_REVIEW_DECISION_STATUSES)[number];

export const HUMAN_REVIEW_DECISION_OUTCOMES = [
  'approved_for_later_implementation',
  'rejected',
  'needs_revision',
  'archived_as_informational',
] as const;

export type HumanReviewDecisionOutcome =
  (typeof HUMAN_REVIEW_DECISION_OUTCOMES)[number];

export const HUMAN_REVIEW_DECISION_FORBIDDEN_OUTCOMES = [
  'applied',
  'auto_applied',
  'deployed',
  'published',
  'production_write',
  'api_updated',
  'saved_prediction',
  'trading_action',
  'navigation_action',
  'military_action',
] as const;

export type HumanReviewDecisionForbiddenOutcome =
  (typeof HUMAN_REVIEW_DECISION_FORBIDDEN_OUTCOMES)[number];

export const HUMAN_REVIEW_DECISION_SCOPES = [
  'ai_analysis_result',
] as const;

export type HumanReviewDecisionScope =
  (typeof HUMAN_REVIEW_DECISION_SCOPES)[number];

export const HUMAN_REVIEW_DECISION_ALLOWED_NEXT_STEPS = [
  'human_review_only',
  'separate_implementation_pr_only',
] as const;

export type HumanReviewDecisionAllowedNextStep =
  (typeof HUMAN_REVIEW_DECISION_ALLOWED_NEXT_STEPS)[number];

export const HUMAN_REVIEW_DECISION_REQUIRED_FORBIDDEN_NEXT_STEPS = [
  'production_write',
  'api_forecast_update',
  'api_hormuz_update',
  'external_publish',
  'automated_trading',
  'navigation_guidance',
  'military_guidance',
  'db_migration',
  'direct_deploy',
] as const;

export type HumanReviewDecisionForbiddenNextStep =
  (typeof HUMAN_REVIEW_DECISION_REQUIRED_FORBIDDEN_NEXT_STEPS)[number];

export interface HumanReviewDecision {
  decision_id: string;
  decision_version: typeof HUMAN_REVIEW_DECISION_VERSION;
  reviewed_result_id: string;
  reviewed_result_version: 1;
  job_kind: AIAnalysisJobKind;
  context_pack_id: string;
  context_pack_version: 1;
  decided_at: number;
  reviewer_id: string;
  outcome: HumanReviewDecisionOutcome;
  rationale: string;
  required_next_steps: string[];
  residual_risks: string[];
  requires_separate_implementation: true;
  allowed_next_step: HumanReviewDecisionAllowedNextStep;
  forbidden_next_steps: HumanReviewDecisionForbiddenNextStep[];
  is_production_state: false;
  does_not_modify_api: true;
  does_not_write_db: true;
  does_not_publish_externally: true;
}

export type HumanReviewDecisionValidationIssueSeverity = 'blocking';

export interface HumanReviewDecisionValidationIssue {
  code: string;
  severity: HumanReviewDecisionValidationIssueSeverity;
  message: string;
  path?: string;
}

export interface HumanReviewDecisionValidationResult {
  passed: boolean;
  issues: HumanReviewDecisionValidationIssue[];
}

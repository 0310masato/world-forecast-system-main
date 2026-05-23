import type { ContextPack } from '../context-packs/types';

export const AI_ANALYSIS_JOB_KINDS = [
  'forecast_review_notes',
  'risk_label_review',
  'miss_pattern_review',
  'refactor_planning_notes',
  'operator_review_context',
] as const;

export type AIAnalysisJobKind = (typeof AI_ANALYSIS_JOB_KINDS)[number];

export const AI_ANALYSIS_JOB_STATUSES = [
  'ready_for_human_review',
  'blocked_by_safety',
  'blocked_by_missing_context',
  'blocked_by_policy',
  'blocked_by_stale_context',
] as const;

export type AIAnalysisJobStatus = (typeof AI_ANALYSIS_JOB_STATUSES)[number];

export const AI_ANALYSIS_JOB_QA_GATE_NAMES = [
  'context_boundary',
  'safety_labels',
  'policy_refs',
  'record_scope',
  'stale_context',
  'excluded_records',
  'human_review',
] as const;

export type AIAnalysisJobQAGateName = (typeof AI_ANALYSIS_JOB_QA_GATE_NAMES)[number];

export type AIAnalysisJobQAGateResult = 'pass' | 'review_required' | 'fail';

export type AIAnalysisJobPreflightIssueSeverity = 'blocking' | 'review_required';

export interface AIAnalysisJobInput {
  job_kind: AIAnalysisJobKind;
  context_pack: ContextPack;
  requested_at?: number;
  requested_by?: string;
  human_review_required: true;
}

export interface AIAnalysisJobPreflightIssue {
  code: string;
  severity: AIAnalysisJobPreflightIssueSeverity;
  gate: AIAnalysisJobQAGateName;
  message: string;
  path?: string;
  record_id?: string;
}

export interface AIAnalysisJobQAGate {
  name: AIAnalysisJobQAGateName;
  result: AIAnalysisJobQAGateResult;
  passed: boolean;
  issue_count: number;
  summary: string;
}

export const AI_ANALYSIS_JOB_ALLOWED_NEXT_STEP = 'human_review_only' as const;

export type AIAnalysisJobAllowedNextStep = typeof AI_ANALYSIS_JOB_ALLOWED_NEXT_STEP;

export const AI_ANALYSIS_JOB_FORBIDDEN_NEXT_STEPS = [
  'production_write',
  'api_forecast_update',
  'api_hormuz_update',
  'external_publish',
  'automated_trading',
  'navigation_guidance',
  'military_guidance',
] as const;

export type AIAnalysisJobForbiddenNextStep =
  (typeof AI_ANALYSIS_JOB_FORBIDDEN_NEXT_STEPS)[number];

export interface AIAnalysisJobApprovalBoundary {
  human_review_required: true;
  allowed_next_step: AIAnalysisJobAllowedNextStep;
  forbidden_next_steps: AIAnalysisJobForbiddenNextStep[];
}

export interface AIAnalysisJobPreflightResult extends AIAnalysisJobApprovalBoundary {
  passed: boolean;
  status: AIAnalysisJobStatus;
  job_kind: AIAnalysisJobKind | null;
  context_pack_id: string | null;
  context_pack_version: number | null;
  issues: AIAnalysisJobPreflightIssue[];
  qa_gates: AIAnalysisJobQAGate[];
}

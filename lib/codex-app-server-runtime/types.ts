export const CODEX_APP_SERVER_RUNTIME_MVP_SCAFFOLD_VERSION = 1 as const;

export const CODEX_APP_SERVER_RUNTIME_MVP_SCOPES = [
  'codex_app_server_runtime_mvp_scaffold_v0',
] as const;

export type CodexAppServerRuntimeMvpScope =
  (typeof CODEX_APP_SERVER_RUNTIME_MVP_SCOPES)[number];

export const CODEX_APP_SERVER_RUNTIME_MVP_RUNTIME_STATES = [
  'disabled',
] as const;

export type CodexAppServerRuntimeMvpRuntimeState =
  (typeof CODEX_APP_SERVER_RUNTIME_MVP_RUNTIME_STATES)[number];

export const CODEX_APP_SERVER_RUNTIME_MVP_EXECUTION_MODES = [
  'local_only',
] as const;

export type CodexAppServerRuntimeMvpExecutionMode =
  (typeof CODEX_APP_SERVER_RUNTIME_MVP_EXECUTION_MODES)[number];

export const CODEX_APP_SERVER_RUNTIME_MVP_ALLOWED_OUTPUTS = [
  'runtime_scaffold_metadata_only',
  'validation_issues_only',
  'open_questions_for_human_review',
  'blocker_report_only',
] as const;

export type CodexAppServerRuntimeMvpAllowedOutput =
  (typeof CODEX_APP_SERVER_RUNTIME_MVP_ALLOWED_OUTPUTS)[number];

export const CODEX_APP_SERVER_RUNTIME_MVP_FORBIDDEN_OPERATIONS = [
  'production_write',
  'api_forecast_update',
  'api_hormuz_update',
  'api_hormuz_news_update',
  'db_read',
  'db_write',
  'db_migration',
  'direct_deploy',
  'worker_runtime',
  'scheduler_runtime',
  'codex_app_server_runtime_execution',
  'external_api_integration',
  'package_change',
  'ci_change',
  'github_automation',
  'create_github_issue',
  'create_pr',
  'merge_pr',
  'file_writing_automation',
  'ai_job_execution',
  'external_publish',
  'automated_trading',
  'investment_advice',
  'navigation_guidance',
  'military_guidance',
  'production_promotion',
] as const;

export type CodexAppServerRuntimeMvpForbiddenOperation =
  (typeof CODEX_APP_SERVER_RUNTIME_MVP_FORBIDDEN_OPERATIONS)[number];

export const CODEX_APP_SERVER_RUNTIME_MVP_REQUIRED_SAFETY_LABELS = [
  'Disabled by default',
  'Local only',
  'Proposal only',
  'Not production state',
  'Human approval required',
  'No protected core connection',
  'No API connection',
  'No DB connection',
  'No worker runtime',
  'No scheduler runtime',
  'No external integration',
  'No package or CI change',
  'No automation',
  'No production promotion',
] as const;

export const CODEX_APP_SERVER_RUNTIME_MVP_POLICY_REFS = [
  'AGENTS.md',
  'docs/CONTRACTS_INDEX.md',
  'docs/CODEX_APP_SERVER.md',
  'docs/CODEX_APP_SERVER_RUNTIME_INTAKE.md',
  'docs/CODEX_APP_SERVER_RUNTIME_MVP_SCOPE.md',
  'docs/HUMAN_APPROVAL.md',
] as const;

export interface CodexAppServerRuntimeMvpBoundary {
  proposal_only: true;
  is_production_state: false;
  required_human_approval: true;
  disabled_by_default: true;
  local_only: true;
  protected_core_connected: false;
  api_connection_enabled: false;
  db_connection_enabled: false;
  db_read_enabled: false;
  db_write_enabled: false;
  worker_runtime_enabled: false;
  scheduler_runtime_enabled: false;
  external_api_integration_enabled: false;
  package_change_allowed: false;
  ci_change_allowed: false;
  automation_enabled: false;
  github_automation_enabled: false;
  file_writing_automation_enabled: false;
  ai_job_execution_enabled: false;
  production_promotion_allowed: false;
}

export interface CodexAppServerRuntimeMvpScaffold
  extends CodexAppServerRuntimeMvpBoundary {
  scaffold_id: string;
  scaffold_version: typeof CODEX_APP_SERVER_RUNTIME_MVP_SCAFFOLD_VERSION;
  scope: CodexAppServerRuntimeMvpScope;
  created_at: number;
  runtime_state: CodexAppServerRuntimeMvpRuntimeState;
  execution_mode: CodexAppServerRuntimeMvpExecutionMode;
  policy_refs: string[];
  safety_labels: string[];
  allowed_outputs: CodexAppServerRuntimeMvpAllowedOutput[];
  forbidden_operations: CodexAppServerRuntimeMvpForbiddenOperation[];
  limitations: string[];
  review_notes: string[];
}

export type CodexAppServerRuntimeMvpValidationIssueSeverity = 'blocking';

export interface CodexAppServerRuntimeMvpValidationIssue {
  code: string;
  severity: CodexAppServerRuntimeMvpValidationIssueSeverity;
  message: string;
  path?: string;
}

export interface CodexAppServerRuntimeMvpValidationResult {
  passed: boolean;
  issues: CodexAppServerRuntimeMvpValidationIssue[];
}

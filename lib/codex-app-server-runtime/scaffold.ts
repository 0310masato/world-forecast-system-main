import {
  CODEX_APP_SERVER_RUNTIME_MVP_ALLOWED_OUTPUTS,
  CODEX_APP_SERVER_RUNTIME_MVP_FORBIDDEN_OPERATIONS,
  CODEX_APP_SERVER_RUNTIME_MVP_POLICY_REFS,
  CODEX_APP_SERVER_RUNTIME_MVP_REQUIRED_SAFETY_LABELS,
  CODEX_APP_SERVER_RUNTIME_MVP_SCAFFOLD_VERSION,
  type CodexAppServerRuntimeMvpBoundary,
  type CodexAppServerRuntimeMvpScaffold,
} from './types';
import { validateCodexAppServerRuntimeMvpScaffold } from './validation';

export interface MakeCodexAppServerRuntimeMvpScaffoldOptions {
  scaffoldId?: string;
  createdAt?: number;
  limitations?: readonly string[];
  reviewNotes?: readonly string[];
}

export function makeCodexAppServerRuntimeMvpBoundary(): CodexAppServerRuntimeMvpBoundary {
  return {
    proposal_only: true,
    is_production_state: false,
    required_human_approval: true,
    disabled_by_default: true,
    local_only: true,
    protected_core_connected: false,
    api_connection_enabled: false,
    db_connection_enabled: false,
    db_read_enabled: false,
    db_write_enabled: false,
    worker_runtime_enabled: false,
    scheduler_runtime_enabled: false,
    external_api_integration_enabled: false,
    package_change_allowed: false,
    ci_change_allowed: false,
    automation_enabled: false,
    github_automation_enabled: false,
    file_writing_automation_enabled: false,
    ai_job_execution_enabled: false,
    production_promotion_allowed: false,
  };
}

export function makeCodexAppServerRuntimeMvpScaffold(
  options: MakeCodexAppServerRuntimeMvpScaffoldOptions = {},
): CodexAppServerRuntimeMvpScaffold {
  const scaffold: CodexAppServerRuntimeMvpScaffold = {
    scaffold_id: options.scaffoldId ?? 'codex-app-server-runtime-mvp-scaffold-v0',
    scaffold_version: CODEX_APP_SERVER_RUNTIME_MVP_SCAFFOLD_VERSION,
    scope: 'codex_app_server_runtime_mvp_scaffold_v0',
    created_at: options.createdAt ?? Math.floor(Date.now() / 1000),
    runtime_state: 'disabled',
    execution_mode: 'local_only',
    policy_refs: [...CODEX_APP_SERVER_RUNTIME_MVP_POLICY_REFS],
    safety_labels: [...CODEX_APP_SERVER_RUNTIME_MVP_REQUIRED_SAFETY_LABELS],
    allowed_outputs: [...CODEX_APP_SERVER_RUNTIME_MVP_ALLOWED_OUTPUTS],
    forbidden_operations: [...CODEX_APP_SERVER_RUNTIME_MVP_FORBIDDEN_OPERATIONS],
    limitations: [
      'Scaffold metadata is review material only and is not an enabled runtime.',
      'The scaffold does not connect to APIs, databases, workers, schedulers, external services, package scripts, CI, automation, or production promotion.',
      ...(options.limitations ?? []),
    ],
    review_notes: [
      'Human reviewers must keep any later runtime enablement in a separate approved PR with its own scope, tests, and rollback plan.',
      ...(options.reviewNotes ?? []),
    ],
    ...makeCodexAppServerRuntimeMvpBoundary(),
  };

  const validation = validateCodexAppServerRuntimeMvpScaffold(scaffold);
  if (!validation.passed) {
    const issueSummary = validation.issues
      .map((issue) => `${issue.code}${issue.path ? ` at ${issue.path}` : ''}`)
      .join(', ');
    throw new Error(`Invalid Codex App Server runtime MVP scaffold: ${issueSummary}`);
  }

  return scaffold;
}

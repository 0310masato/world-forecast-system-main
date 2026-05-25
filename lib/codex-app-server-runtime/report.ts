import { assertNoRestrictedContent } from '../memory/validation';
import { makeTaskBoardForbiddenNextSteps } from '../task-board/handoff';
import type {
  TaskBoardAllowedNextStep,
  TaskBoardForbiddenNextStep,
  TaskCardAutonomyLevel,
  TaskCardStatus,
} from '../task-board/types';
import type {
  CodexAppServerRuntimeMvpAllowedOutput,
  CodexAppServerRuntimeMvpForbiddenOperation,
  CodexAppServerRuntimeMvpRuntimeState,
  CodexAppServerRuntimeMvpScaffold,
  CodexAppServerRuntimeMvpValidationIssue,
} from './types';
import { validateCodexAppServerRuntimeMvpScaffold } from './validation';

export interface MakeCodexAppServerRuntimeMvpInspectionReportOptions {
  generatedAt?: number;
}

export interface CodexAppServerRuntimeMvpInspectionReport {
  title: string;
  generated_at: string;
  scaffold_id: string;
  scaffold_version: number | null;
  runtime_state: CodexAppServerRuntimeMvpRuntimeState | 'withheld_invalid_scaffold';
  execution_mode: 'local_only' | 'withheld_invalid_scaffold';
  safety_boundary: {
    proposal_only: true;
    non_production: true;
    disabled_by_default: true;
    local_only: true;
    human_approval_required: true;
    protected_core_connected: false;
    api_connection_enabled: false;
    db_connection_enabled: false;
    worker_runtime_enabled: false;
    scheduler_runtime_enabled: false;
    external_api_integration_enabled: false;
    package_change_allowed: false;
    ci_change_allowed: false;
    automation_enabled: false;
    production_promotion_allowed: false;
  };
  allowed_outputs: CodexAppServerRuntimeMvpAllowedOutput[];
  forbidden_operations: CodexAppServerRuntimeMvpForbiddenOperation[];
  policy_refs: string[];
  limitations: string[];
  review_notes: string[];
  validation: {
    passed: boolean;
    issues: CodexAppServerRuntimeMvpValidationIssue[];
  };
  human_approval_required: true;
  production_state: false;
  next_allowed_action: 'human_review_only';
}

export interface CodexAppServerRuntimeMvpOperatorSummary {
  title: string;
  generated_at: string;
  scaffold_id: string;
  status: 'safe_for_human_review' | 'blocked';
  runtime_state: CodexAppServerRuntimeMvpInspectionReport['runtime_state'];
  execution_mode: CodexAppServerRuntimeMvpInspectionReport['execution_mode'];
  validation_passed: boolean;
  safety_boundary_summary: {
    proposal_only: true;
    non_production: true;
    disabled_by_default: true;
    local_only: true;
    human_approval_required: true;
  };
  forbidden_surface_summary: {
    api: 'forbidden';
    db: 'forbidden';
    worker: 'forbidden';
    scheduler: 'forbidden';
    external_integration: 'forbidden';
    package_or_ci: 'forbidden';
    automation: 'forbidden';
    ai_job_execution: 'forbidden';
    production_promotion: 'forbidden';
  };
  next_allowed_action: 'human_review_only';
}

export interface CodexAppServerRuntimeMvpTaskCardDraftSource {
  type: 'codex_app_server_runtime_mvp_operator_summary_v0';
  summary_title: string;
  summary_generated_at: string;
  scaffold_id: string;
  validation_passed: boolean;
}

export interface CodexAppServerRuntimeMvpTaskCardDraft {
  task_id: string;
  title: string;
  source: CodexAppServerRuntimeMvpTaskCardDraftSource;
  objective: string;
  status: Extract<TaskCardStatus, 'waiting_for_human_approval' | 'blocked'>;
  autonomy_level: Extract<TaskCardAutonomyLevel, 'A1_draft_only' | 'A2_prepare_for_approval'>;
  proposal_only: true;
  is_production_state: false;
  required_human_approval: true;
  allowed_next_step: Extract<TaskBoardAllowedNextStep, 'human_review_only'>;
  forbidden_next_steps: TaskBoardForbiddenNextStep[];
  acceptance_criteria: string[];
  risks: string[];
  references: string[];
}

const WITHHELD_INVALID_SCAFFOLD = 'withheld_invalid_scaffold';
const INVALID_SCAFFOLD_NOTICE = [
  'Withheld because scaffold validation failed. Review validation.issues only.',
];
const TASKCARD_DRAFT_REFERENCES = [
  'AGENTS.md',
  'docs/CONTRACTS_INDEX.md',
  'docs/TASK_BOARD_HANDOFF.md',
  'docs/CODEX_APP_SERVER.md',
  'docs/CODEX_APP_SERVER_RUNTIME_MVP_SCOPE.md',
  'lib/codex-app-server-runtime/report.ts',
  'scripts/codex-app-server-runtime-report.mjs',
] as const;
const TASKCARD_DRAFT_ACCEPTANCE_CRITERIA = [
  'The draft remains proposal-only, human-review-only, stdout-only, and non-production.',
  'The draft is review material only and does not write to the Task Board or any file.',
  'The draft does not request API, DB, worker, scheduler, external integration, package, CI, automation, AI job execution, publishing, deployment, or production promotion work.',
  'Human reviewers compare the operator summary with the referenced contracts before deciding whether to revise, archive, or continue review.',
] as const;
const TASKCARD_DRAFT_RISKS = [
  'A reviewer could mistake stdout draft output for a persisted Task Board record unless the stdout-only boundary remains explicit.',
  'A blocked operator summary requires human review of validation issues before any later review artifact is considered.',
  'Future work could exceed A1/A2 scope unless forbidden next steps and human approval remain explicit.',
] as const;

function makeInvalidScaffoldNotice(): string[] {
  return [...INVALID_SCAFFOLD_NOTICE];
}

function toIsoTimestamp(unixSeconds: number): string {
  const normalized = Number.isInteger(unixSeconds) && unixSeconds >= 0
    ? unixSeconds
    : Math.floor(Date.now() / 1000);

  return new Date(normalized * 1000).toISOString();
}

function cloneValidationIssues(
  issues: CodexAppServerRuntimeMvpValidationIssue[],
): CodexAppServerRuntimeMvpValidationIssue[] {
  return issues.map((issue) => ({ ...issue }));
}

function normalizeTaskIdPart(value: string): string {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return normalized || 'withheld-invalid-scaffold';
}

export function makeCodexAppServerRuntimeMvpInspectionReport(
  scaffold: CodexAppServerRuntimeMvpScaffold,
  options: MakeCodexAppServerRuntimeMvpInspectionReportOptions = {},
): CodexAppServerRuntimeMvpInspectionReport {
  const validation = validateCodexAppServerRuntimeMvpScaffold(scaffold);
  const canExposeScaffoldFields = validation.passed;

  const report: CodexAppServerRuntimeMvpInspectionReport = {
    title: 'Codex App Server Runtime MVP Scaffold Read-only Local Inspection Report',
    generated_at: toIsoTimestamp(options.generatedAt ?? Math.floor(Date.now() / 1000)),
    scaffold_id: canExposeScaffoldFields ? scaffold.scaffold_id : WITHHELD_INVALID_SCAFFOLD,
    scaffold_version: canExposeScaffoldFields ? scaffold.scaffold_version : null,
    runtime_state: canExposeScaffoldFields ? scaffold.runtime_state : WITHHELD_INVALID_SCAFFOLD,
    execution_mode: canExposeScaffoldFields ? scaffold.execution_mode : WITHHELD_INVALID_SCAFFOLD,
    safety_boundary: {
      proposal_only: true,
      non_production: true,
      disabled_by_default: true,
      local_only: true,
      human_approval_required: true,
      protected_core_connected: false,
      api_connection_enabled: false,
      db_connection_enabled: false,
      worker_runtime_enabled: false,
      scheduler_runtime_enabled: false,
      external_api_integration_enabled: false,
      package_change_allowed: false,
      ci_change_allowed: false,
      automation_enabled: false,
      production_promotion_allowed: false,
    },
    allowed_outputs: canExposeScaffoldFields ? [...scaffold.allowed_outputs] : [],
    forbidden_operations: canExposeScaffoldFields ? [...scaffold.forbidden_operations] : [],
    policy_refs: canExposeScaffoldFields ? [...scaffold.policy_refs] : [],
    limitations: canExposeScaffoldFields ? [...scaffold.limitations] : makeInvalidScaffoldNotice(),
    review_notes: canExposeScaffoldFields ? [...scaffold.review_notes] : makeInvalidScaffoldNotice(),
    validation: {
      passed: validation.passed,
      issues: cloneValidationIssues(validation.issues),
    },
    human_approval_required: true,
    production_state: false,
    next_allowed_action: 'human_review_only',
  };

  assertNoRestrictedContent(report, 'codexAppServerRuntimeMvpInspectionReport');

  return report;
}

export function makeCodexAppServerRuntimeMvpOperatorSummary(
  report: CodexAppServerRuntimeMvpInspectionReport,
): CodexAppServerRuntimeMvpOperatorSummary {
  const summary: CodexAppServerRuntimeMvpOperatorSummary = {
    title: 'Codex App Server Runtime MVP Operator Summary',
    generated_at: report.generated_at,
    scaffold_id: report.scaffold_id,
    status: report.validation.passed ? 'safe_for_human_review' : 'blocked',
    runtime_state: report.runtime_state,
    execution_mode: report.execution_mode,
    validation_passed: report.validation.passed,
    safety_boundary_summary: {
      proposal_only: true,
      non_production: true,
      disabled_by_default: true,
      local_only: true,
      human_approval_required: true,
    },
    forbidden_surface_summary: {
      api: 'forbidden',
      db: 'forbidden',
      worker: 'forbidden',
      scheduler: 'forbidden',
      external_integration: 'forbidden',
      package_or_ci: 'forbidden',
      automation: 'forbidden',
      ai_job_execution: 'forbidden',
      production_promotion: 'forbidden',
    },
    next_allowed_action: 'human_review_only',
  };

  assertNoRestrictedContent(summary, 'codexAppServerRuntimeMvpOperatorSummary');

  return summary;
}

export function makeCodexAppServerRuntimeMvpTaskCardDraft(
  summary: CodexAppServerRuntimeMvpOperatorSummary,
): CodexAppServerRuntimeMvpTaskCardDraft {
  const status = summary.validation_passed && summary.status === 'safe_for_human_review'
    ? 'waiting_for_human_approval'
    : 'blocked';
  const taskCardDraft: CodexAppServerRuntimeMvpTaskCardDraft = {
    task_id: `codex-app-server-runtime-mvp-taskcard-draft-${normalizeTaskIdPart(summary.scaffold_id)}`,
    title: 'Review Codex App Server Runtime MVP operator summary TaskCard draft',
    source: {
      type: 'codex_app_server_runtime_mvp_operator_summary_v0',
      summary_title: summary.title,
      summary_generated_at: summary.generated_at,
      scaffold_id: summary.scaffold_id,
      validation_passed: summary.validation_passed,
    },
    objective: 'Prepare a human-review-only TaskCard draft from the Codex App Server Runtime MVP operator summary without writing to the Task Board or changing production state.',
    status,
    autonomy_level: 'A1_draft_only',
    proposal_only: true,
    is_production_state: false,
    required_human_approval: true,
    allowed_next_step: 'human_review_only',
    forbidden_next_steps: makeTaskBoardForbiddenNextSteps(),
    acceptance_criteria: [...TASKCARD_DRAFT_ACCEPTANCE_CRITERIA],
    risks: [...TASKCARD_DRAFT_RISKS],
    references: [...TASKCARD_DRAFT_REFERENCES],
  };

  assertNoRestrictedContent(taskCardDraft, 'codexAppServerRuntimeMvpTaskCardDraft');

  return taskCardDraft;
}

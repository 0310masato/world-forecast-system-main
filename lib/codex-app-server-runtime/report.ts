import { assertNoRestrictedContent } from '../memory/validation';
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

const WITHHELD_INVALID_SCAFFOLD = 'withheld_invalid_scaffold';
const INVALID_SCAFFOLD_NOTICE = [
  'Withheld because scaffold validation failed. Review validation.issues only.',
];

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

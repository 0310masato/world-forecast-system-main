import { assertNoRestrictedContent } from '../memory/validation';
import { makeTaskBoardForbiddenNextSteps } from '../task-board/handoff';
import { CODEX_APP_SERVER_RUNTIME_MVP_FORBIDDEN_OPERATIONS } from './types';
import {
  TASK_HANDOFF_VERSION,
  type TaskBoardAllowedNextStep,
  type TaskBoardForbiddenNextStep,
  type TaskCardAutonomyLevel,
  type TaskCardStatus,
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

export type CodexAppServerRuntimeMvpTaskCardQaRecommendation =
  | 'approve_for_human_review'
  | 'revise_task_card'
  | 'block';

export type CodexAppServerRuntimeMvpTaskCardQaCheckResult =
  | 'pass'
  | 'revise'
  | 'block';

export type CodexAppServerRuntimeMvpTaskCardQaForbiddenNextStep =
  | TaskBoardForbiddenNextStep
  | CodexAppServerRuntimeMvpForbiddenOperation;

export interface CodexAppServerRuntimeMvpTaskCardQaCheck {
  result: CodexAppServerRuntimeMvpTaskCardQaCheckResult;
  notes: string;
}

export interface CodexAppServerRuntimeMvpTaskCardQaIssue {
  code: string;
  severity: 'revision_required' | 'blocking';
  message: string;
  path?: string;
}

export interface CodexAppServerRuntimeMvpTaskCardQaDraft {
  qa_report_id: string;
  reviewed_task_id: string;
  reviewed_output_type: 'codex_app_server_runtime_mvp_taskcard_draft_v0';
  reviewer_role: 'qa_reviewer';
  recommendation: CodexAppServerRuntimeMvpTaskCardQaRecommendation;
  proposal_only: true;
  is_production_state: false;
  required_human_approval: true;
  checked_at: string;
  checks: {
    scope_boundary_check: CodexAppServerRuntimeMvpTaskCardQaCheck;
    status_allowed_next_step_check: CodexAppServerRuntimeMvpTaskCardQaCheck;
    autonomy_level_check: CodexAppServerRuntimeMvpTaskCardQaCheck;
    protected_surface_check: CodexAppServerRuntimeMvpTaskCardQaCheck;
    forbidden_next_steps_check: CodexAppServerRuntimeMvpTaskCardQaCheck;
    restricted_content_check: CodexAppServerRuntimeMvpTaskCardQaCheck;
    stdout_only_check: CodexAppServerRuntimeMvpTaskCardQaCheck;
  };
  issues: CodexAppServerRuntimeMvpTaskCardQaIssue[];
  residual_risks: string[];
  required_next_action: 'human_review_only';
  forbidden_next_steps: CodexAppServerRuntimeMvpTaskCardQaForbiddenNextStep[];
  references: string[];
}

export type CodexAppServerRuntimeMvpHandoffForbiddenNextStep =
  | TaskBoardForbiddenNextStep
  | CodexAppServerRuntimeMvpForbiddenOperation;

export interface CodexAppServerRuntimeMvpHandoffDraft {
  handoff_id: string;
  handoff_version: typeof TASK_HANDOFF_VERSION;
  source_role: 'codex_app_server_runtime_reporter';
  target_role: 'human_owner';
  task_id: string;
  current_status: Extract<TaskCardStatus, 'waiting_for_human_approval' | 'blocked'>;
  objective: string;
  what_has_been_done: string[];
  key_findings: string[];
  decisions_made: string[];
  open_questions: string[];
  blockers: string[];
  required_next_action: 'human_review_only';
  inputs_passed: string[];
  outputs_produced: string[];
  confidence: number;
  completeness: number;
  risks: string[];
  human_approval_required: true;
  allowed_next_step: Extract<TaskBoardAllowedNextStep, 'human_review_only'>;
  forbidden_next_steps: CodexAppServerRuntimeMvpHandoffForbiddenNextStep[];
  references: string[];
}

export interface MakeCodexAppServerRuntimeMvpTaskCardQaDraftOptions {
  checkedAt?: number;
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
const TASKCARD_QA_REFERENCES = [
  'AGENTS.md',
  'docs/CONTRACTS_INDEX.md',
  'docs/TASK_BOARD_HANDOFF.md',
  'docs/templates/TASK_BOARD_QA_REPORT_TEMPLATE.md',
  'docs/CODEX_APP_SERVER.md',
  'docs/CODEX_APP_SERVER_RUNTIME_MVP_SCOPE.md',
  'lib/codex-app-server-runtime/report.ts',
  'scripts/codex-app-server-runtime-report.mjs',
] as const;
const TASKCARD_QA_RESIDUAL_RISKS = [
  'The QA draft is stdout-only review material and is not persisted to the Task Board.',
  'Human reviewers must compare the reviewed TaskCard draft with source contracts before any later action.',
  'A future implementation PR still needs explicit human approval, its own scope, tests, and rollback plan.',
] as const;
const HANDOFF_DRAFT_REFERENCES = [
  'AGENTS.md',
  'docs/CONTRACTS_INDEX.md',
  'docs/TASK_BOARD_HANDOFF.md',
  'docs/templates/HANDOFF_TEMPLATE.md',
  'docs/CODEX_APP_SERVER.md',
  'docs/CODEX_APP_SERVER_RUNTIME_MVP_SCOPE.md',
  'lib/codex-app-server-runtime/report.ts',
  'scripts/codex-app-server-runtime-report.mjs',
] as const;
const HANDOFF_DRAFT_DONE = [
  'Generated a stdout-only TaskCard draft from the Codex App Server Runtime MVP operator summary.',
  'Generated a stdout-only TaskCard QA draft for human review.',
  'Prepared this HANDOFF draft as review material only without writing a HANDOFF file or Task Board record.',
] as const;
const HANDOFF_DRAFT_DECISIONS = [
  'The HANDOFF draft remains proposal-only, non-production, stdout-only, and human-review-only.',
  'Task Board writes, HANDOFF file creation, file-writing automation, API, DB, worker, scheduler, external integration, package, CI, GitHub automation, AI job execution, and production promotion remain forbidden.',
  'Human approval is required before any later action outside review.',
] as const;
const HANDOFF_DRAFT_BASE_RISKS = [
  'The stdout HANDOFF draft could be mistaken for a persisted handoff unless reviewers keep the stdout-only boundary explicit.',
  'Human reviewers must compare the TaskCard draft, QA draft, and source contracts before deciding whether to revise, archive, or continue review.',
  'Any later implementation work needs a separate approved PR with its own scope, tests, and rollback plan.',
] as const;
const TASKCARD_QA_RESTRICTED_CONTENT_NOTICE =
  'Restricted content was detected in the reviewed TaskCard draft; details are withheld for safety.';
const PROTECTED_SURFACE_PATTERNS = [
  {
    name: 'API route path',
    pattern: /\b(?:app|pages)\/api(?:\/|$)/i,
  },
  {
    name: 'forecast API path',
    pattern: /\/api\/forecast\b/i,
  },
  {
    name: 'Hormuz API path',
    pattern: /\/api\/hormuz\b/i,
  },
  {
    name: 'database helper',
    pattern: /\blib\/db\.ts\b/i,
  },
  {
    name: 'NAS helper',
    pattern: /\blib\/nas\.ts\b/i,
  },
  {
    name: 'maritime path',
    pattern: /\blib\/maritime(?:\/|$)/i,
  },
  {
    name: 'dependency or CI surface',
    pattern: /\b(?:package\.json|package-lock\.json|pnpm-lock\.yaml|yarn\.lock|\.github\/|next\.config\.ts)\b/i,
  },
  {
    name: 'database schema surface',
    pattern: /\b(?:db|migrations|prisma)\//i,
  },
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

function makeTaskCardQaForbiddenNextSteps(): CodexAppServerRuntimeMvpTaskCardQaForbiddenNextStep[] {
  return Array.from(new Set([
    ...makeTaskBoardForbiddenNextSteps(),
    ...CODEX_APP_SERVER_RUNTIME_MVP_FORBIDDEN_OPERATIONS,
  ]));
}

function makeHandoffForbiddenNextSteps(): CodexAppServerRuntimeMvpHandoffForbiddenNextStep[] {
  return Array.from(new Set([
    ...makeTaskBoardForbiddenNextSteps(),
    ...CODEX_APP_SERVER_RUNTIME_MVP_FORBIDDEN_OPERATIONS,
  ]));
}

function makeCheck(
  result: CodexAppServerRuntimeMvpTaskCardQaCheckResult,
  notes: string,
): CodexAppServerRuntimeMvpTaskCardQaCheck {
  return { result, notes };
}

function makeQaIssue(params: CodexAppServerRuntimeMvpTaskCardQaIssue): CodexAppServerRuntimeMvpTaskCardQaIssue {
  return { ...params };
}

function getRestrictedContentQaNotice(value: unknown): string | null {
  try {
    assertNoRestrictedContent(value, 'codexAppServerRuntimeMvpTaskCardQaInput');
    return null;
  } catch {
    return TASKCARD_QA_RESTRICTED_CONTENT_NOTICE;
  }
}

function findProtectedSurface(value: unknown): string | null {
  const serialized = JSON.stringify(value);
  if (!serialized) {
    return 'unserializable draft';
  }

  for (const { name, pattern } of PROTECTED_SURFACE_PATTERNS) {
    if (pattern.test(serialized.replace(/\\/g, '/'))) {
      return name;
    }
  }

  return null;
}

function hasRequiredForbiddenNextSteps(taskCardDraft: CodexAppServerRuntimeMvpTaskCardDraft): boolean {
  return makeTaskBoardForbiddenNextSteps().every((step) => (
    taskCardDraft.forbidden_next_steps.includes(step)
  ));
}

function makeUniqueReferences(
  taskCardDraft: CodexAppServerRuntimeMvpTaskCardDraft,
): string[] {
  return Array.from(new Set([
    ...taskCardDraft.references,
    ...TASKCARD_QA_REFERENCES,
  ]));
}

function makeUniqueHandoffReferences(
  taskCardDraft: CodexAppServerRuntimeMvpTaskCardDraft,
  qaDraft: CodexAppServerRuntimeMvpTaskCardQaDraft,
): string[] {
  return Array.from(new Set([
    ...taskCardDraft.references,
    ...qaDraft.references,
    ...HANDOFF_DRAFT_REFERENCES,
  ]));
}

function chooseTaskCardQaRecommendation(
  taskCardDraft: CodexAppServerRuntimeMvpTaskCardDraft,
  issues: CodexAppServerRuntimeMvpTaskCardQaIssue[],
): CodexAppServerRuntimeMvpTaskCardQaRecommendation {
  if (
    taskCardDraft.status === 'blocked'
    || issues.some((issue) => issue.severity === 'blocking')
  ) {
    return 'block';
  }

  if (issues.length > 0) {
    return 'revise_task_card';
  }

  return 'approve_for_human_review';
}

function isValidTaskCardQaDraft(
  qaDraft: CodexAppServerRuntimeMvpTaskCardQaDraft,
): boolean {
  return (
    qaDraft.recommendation === 'approve_for_human_review'
    && qaDraft.issues.length === 0
    && Object.values(qaDraft.checks).every((check) => check.result === 'pass')
  );
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

export function makeCodexAppServerRuntimeMvpTaskCardQaDraft(
  taskCardDraft: CodexAppServerRuntimeMvpTaskCardDraft,
  options: MakeCodexAppServerRuntimeMvpTaskCardQaDraftOptions = {},
): CodexAppServerRuntimeMvpTaskCardQaDraft {
  const issues: CodexAppServerRuntimeMvpTaskCardQaIssue[] = [];
  const restrictedContentNotice = getRestrictedContentQaNotice(taskCardDraft);
  const protectedSurface = findProtectedSurface(taskCardDraft);
  const requiredForbiddenNextStepsPresent = hasRequiredForbiddenNextSteps(taskCardDraft);
  const stdoutBoundaryPresent = taskCardDraft.acceptance_criteria.some((criterion) => (
    criterion.includes('stdout-only')
  )) && taskCardDraft.objective.includes('without writing to the Task Board');
  const scopeBoundaryOk = (
    taskCardDraft.proposal_only === true
    && taskCardDraft.is_production_state === false
    && taskCardDraft.required_human_approval === true
    && taskCardDraft.allowed_next_step === 'human_review_only'
  );
  const statusAllowedNextStepOk = (
    (
      taskCardDraft.status === 'waiting_for_human_approval'
      || taskCardDraft.status === 'blocked'
    )
    && taskCardDraft.allowed_next_step === 'human_review_only'
  );
  const autonomyLevelOk = (
    taskCardDraft.autonomy_level === 'A1_draft_only'
    || taskCardDraft.autonomy_level === 'A2_prepare_for_approval'
  );

  if (!scopeBoundaryOk) {
    issues.push(makeQaIssue({
      code: 'scope_boundary_invalid',
      severity: 'blocking',
      message: 'TaskCard draft must remain proposal-only, non-production, human-review-only, and human-approval-required.',
    }));
  }

  if (!statusAllowedNextStepOk) {
    issues.push(makeQaIssue({
      code: 'status_allowed_next_step_invalid',
      severity: 'blocking',
      message: 'TaskCard draft status must be waiting_for_human_approval or blocked with allowed_next_step human_review_only.',
      path: 'status',
    }));
  }

  if (!autonomyLevelOk) {
    issues.push(makeQaIssue({
      code: 'autonomy_level_invalid',
      severity: 'blocking',
      message: 'TaskCard draft autonomy must stay within A1_draft_only or A2_prepare_for_approval.',
      path: 'autonomy_level',
    }));
  }

  if (protectedSurface) {
    issues.push(makeQaIssue({
      code: 'protected_surface_detected',
      severity: 'blocking',
      message: `TaskCard draft references a protected or forbidden surface: ${protectedSurface}.`,
    }));
  }

  if (!requiredForbiddenNextStepsPresent) {
    issues.push(makeQaIssue({
      code: 'forbidden_next_steps_missing',
      severity: 'blocking',
      message: 'TaskCard draft must include all Task Board required forbidden next steps.',
      path: 'forbidden_next_steps',
    }));
  }

  if (restrictedContentNotice) {
    issues.push(makeQaIssue({
      code: 'restricted_content_detected',
      severity: 'blocking',
      message: restrictedContentNotice,
    }));
  }

  if (!stdoutBoundaryPresent) {
    issues.push(makeQaIssue({
      code: 'stdout_only_boundary_unclear',
      severity: 'revision_required',
      message: 'TaskCard draft must explicitly preserve stdout-only output and no Task Board or file writes.',
    }));
  }

  if (taskCardDraft.status === 'blocked') {
    issues.push(makeQaIssue({
      code: 'reviewed_taskcard_blocked',
      severity: 'blocking',
      message: 'Reviewed TaskCard draft is blocked; human review must inspect upstream validation issues before accepting it.',
      path: 'status',
    }));
  }

  const recommendation = chooseTaskCardQaRecommendation(taskCardDraft, issues);
  const qaDraft: CodexAppServerRuntimeMvpTaskCardQaDraft = {
    qa_report_id: `codex-app-server-runtime-mvp-taskcard-qa-${normalizeTaskIdPart(taskCardDraft.task_id)}`,
    reviewed_task_id: taskCardDraft.task_id,
    reviewed_output_type: 'codex_app_server_runtime_mvp_taskcard_draft_v0',
    reviewer_role: 'qa_reviewer',
    recommendation,
    proposal_only: true,
    is_production_state: false,
    required_human_approval: true,
    checked_at: toIsoTimestamp(options.checkedAt ?? Math.floor(Date.now() / 1000)),
    checks: {
      scope_boundary_check: makeCheck(
        scopeBoundaryOk ? 'pass' : 'block',
        scopeBoundaryOk
          ? 'TaskCard draft remains proposal-only, non-production, human-review-only, and human-approval-required.'
          : 'TaskCard draft violates a required proposal-only or human-review boundary.',
      ),
      status_allowed_next_step_check: makeCheck(
        statusAllowedNextStepOk ? 'pass' : 'block',
        statusAllowedNextStepOk
          ? 'Status and allowed_next_step remain consistent with human_review_only handling.'
          : 'Status and allowed_next_step are not safe for human_review_only handling.',
      ),
      autonomy_level_check: makeCheck(
        autonomyLevelOk ? 'pass' : 'block',
        autonomyLevelOk
          ? 'Autonomy remains within A1/A2 review-preparation scope.'
          : 'Autonomy exceeds allowed Task Board review-preparation scope.',
      ),
      protected_surface_check: makeCheck(
        protectedSurface ? 'block' : 'pass',
        protectedSurface
          ? `Protected or forbidden surface detected: ${protectedSurface}.`
          : 'No protected API, DB, maritime, package, CI, or app-wide runtime surface is referenced for implementation.',
      ),
      forbidden_next_steps_check: makeCheck(
        requiredForbiddenNextStepsPresent ? 'pass' : 'block',
        requiredForbiddenNextStepsPresent
          ? 'All required Task Board forbidden next steps are present.'
          : 'One or more required Task Board forbidden next steps are missing.',
      ),
      restricted_content_check: makeCheck(
        restrictedContentNotice ? 'block' : 'pass',
        restrictedContentNotice
          ? restrictedContentNotice
          : 'No restricted content detected in the reviewed TaskCard draft.',
      ),
      stdout_only_check: makeCheck(
        stdoutBoundaryPresent ? 'pass' : 'revise',
        stdoutBoundaryPresent
          ? 'TaskCard draft explicitly says the output is stdout-only and does not write to the Task Board.'
          : 'TaskCard draft needs clearer stdout-only and no-write wording.',
      ),
    },
    issues,
    residual_risks: [
      ...TASKCARD_QA_RESIDUAL_RISKS,
      ...(taskCardDraft.status === 'blocked'
        ? ['Blocked TaskCard drafts require upstream validation review before any later review artifact is accepted.']
        : []),
    ],
    required_next_action: 'human_review_only',
    forbidden_next_steps: makeTaskCardQaForbiddenNextSteps(),
    references: makeUniqueReferences(taskCardDraft),
  };

  assertNoRestrictedContent(qaDraft, 'codexAppServerRuntimeMvpTaskCardQaDraft');

  return qaDraft;
}

export function makeCodexAppServerRuntimeMvpHandoffDraft(
  taskCardDraft: CodexAppServerRuntimeMvpTaskCardDraft,
  qaDraft: CodexAppServerRuntimeMvpTaskCardQaDraft,
): CodexAppServerRuntimeMvpHandoffDraft {
  const qaIsValid = isValidTaskCardQaDraft(qaDraft);
  const currentStatus = qaIsValid ? 'waiting_for_human_approval' : 'blocked';
  const blockers = qaIsValid
    ? ['none']
    : qaDraft.issues.map((issue) => (
      `${issue.code}${issue.path ? ` at ${issue.path}` : ''}: ${issue.message}`
    ));
  const qaFinding = qaIsValid
    ? 'TaskCard QA draft passed all stdout-only, scope, status, autonomy, protected-surface, forbidden-next-step, and restricted-content checks.'
    : 'TaskCard QA draft is blocked or not fully approved; human review must inspect QA issues before accepting the handoff.';
  const handoffDraft: CodexAppServerRuntimeMvpHandoffDraft = {
    handoff_id: `codex-app-server-runtime-mvp-handoff-${normalizeTaskIdPart(taskCardDraft.task_id)}`,
    handoff_version: TASK_HANDOFF_VERSION,
    source_role: 'codex_app_server_runtime_reporter',
    target_role: 'human_owner',
    task_id: taskCardDraft.task_id,
    current_status: currentStatus,
    objective: taskCardDraft.objective,
    what_has_been_done: [...HANDOFF_DRAFT_DONE],
    key_findings: [
      `TaskCard draft status is ${taskCardDraft.status}.`,
      `TaskCard QA recommendation is ${qaDraft.recommendation}.`,
      qaFinding,
      'The only allowed next step remains human_review_only.',
    ],
    decisions_made: [...HANDOFF_DRAFT_DECISIONS],
    open_questions: [
      'Should the human owner accept the TaskCard and QA drafts for review, request revision, or archive them?',
      ...(qaIsValid
        ? ['Are the referenced contracts sufficient for a later dedicated implementation request?']
        : ['Which blocking QA issue must be revised before the review artifact can be accepted?']),
    ],
    blockers,
    required_next_action: 'human_review_only',
    inputs_passed: [
      `TaskCard draft: ${taskCardDraft.task_id}`,
      `TaskCard QA draft: ${qaDraft.qa_report_id}`,
    ],
    outputs_produced: [
      'stdout-only HANDOFF draft JSON',
      'no HANDOFF file created',
      'no Task Board write performed',
      'no file-writing automation performed',
    ],
    confidence: qaIsValid ? 0.86 : 0.62,
    completeness: qaIsValid ? 0.82 : 0.55,
    risks: [
      ...HANDOFF_DRAFT_BASE_RISKS,
      ...taskCardDraft.risks,
      ...qaDraft.residual_risks,
    ],
    human_approval_required: true,
    allowed_next_step: 'human_review_only',
    forbidden_next_steps: makeHandoffForbiddenNextSteps(),
    references: makeUniqueHandoffReferences(taskCardDraft, qaDraft),
  };

  assertNoRestrictedContent(handoffDraft, 'codexAppServerRuntimeMvpHandoffDraft');

  return handoffDraft;
}

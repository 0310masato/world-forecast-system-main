import { assertNoRestrictedContent } from '../memory/validation';
import type {
  TaskBoardHandoffWriteDryRunResult,
  TaskBoardHandoffWriteDryRunValidationIssue,
  TaskBoardHandoffWriteDryRunValidationResult,
} from './write-dry-run';

export type TaskBoardHandoffWriteApprovalRequestStatus =
  | 'pending_human_approval'
  | 'blocked';

export type TaskBoardHandoffWriteApprovalRequestDecision =
  | 'not_decided'
  | 'approved'
  | 'rejected'
  | 'needs_revision';

export interface TaskBoardHandoffWriteApprovalRequestDraft {
  approval_request_id: string;
  approval_request_version: 1;
  generated_at: string;
  source_request_id: string;
  source_dry_run_result: TaskBoardHandoffWriteDryRunResult;
  source_command: 'node scripts/codex-app-server-runtime-write-dry-run.mjs';
  status: TaskBoardHandoffWriteApprovalRequestStatus;
  decision: 'not_decided';
  requested_write_mode: 'write_after_human_approval';
  target_kind: string;
  target_path_or_target_id: string;
  dry_run_status: string;
  dry_run_passed: boolean;
  wrote_anything: false;
  human_owner: string;
  required_human_approval: true;
  required_approver_roles: string[];
  required_next_action: 'human_review_only';
  allowed_next_step: 'human_review_only';
  approval_record: {
    approved: false;
    approved_by: null;
    approved_at: null;
    approval_scope: 'none';
  };
  safety_summary: string[];
  validation_summary: {
    passed: boolean;
    issues: Array<{
      code: string;
      message: string;
    }>;
  };
  audit_preview: Record<string, unknown>;
  rollback_plan: string[];
  forbidden_operations: string[];
  references: string[];
}

export interface MakeTaskBoardHandoffWriteApprovalRequestDraftOptions {
  approvalRequestId?: string;
  generatedAt?: number;
}

type UnknownRecord = Record<string, unknown>;

const DEFAULT_APPROVAL_REQUEST_ID =
  'codex-app-server-runtime-write-approval-request-001';
const SOURCE_COMMAND =
  'node scripts/codex-app-server-runtime-write-dry-run.mjs' as const;
const REQUIRED_APPROVER_ROLES = [
  'human_owner',
  'qa_reviewer',
  'security_reviewer',
  'contract_compliance_reviewer',
] as const;
const FORBIDDEN_OPERATIONS = [
  'create_pr',
  'merge_pr',
  'direct_deploy',
  'production_write',
  'production_promotion',
  'api_forecast_update',
  'api_hormuz_update',
  'api_hormuz_news_update',
  'api_route_creation',
  'db_read',
  'db_write',
  'db_migration',
  'worker_runtime',
  'scheduler_runtime',
  'external_api_integration',
  'package_change',
  'ci_change',
  'github_automation',
  'create_github_issue',
  'file_writing_automation',
  'file_writing_automation_without_approval',
  'handoff_file_creation',
  'handoff_file_creation_without_approval',
  'task_board_write',
  'task_board_write_without_approval',
  'ai_job_execution',
  'external_publish',
  'automated_trading',
  'investment_advice',
  'navigation_guidance',
  'military_guidance',
] as const;
const REFERENCES = [
  'AGENTS.md',
  'docs/CONTRACTS_INDEX.md',
  'docs/CODEX_APP_SERVER_RUNTIME_MVP_SCOPE.md',
  'docs/tool-contracts/TASK_BOARD_HANDOFF_WRITE_TOOL_CONTRACT.md',
  'lib/codex-app-server-runtime/write-dry-run.ts',
  'lib/codex-app-server-runtime/write-approval-request.ts',
  'scripts/codex-app-server-runtime-write-dry-run.mjs',
  'scripts/codex-app-server-runtime-write-approval-request.mjs',
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

function toIsoTimestamp(unixSeconds?: number): string {
  const normalized = Number.isInteger(unixSeconds) && Number(unixSeconds) >= 0
    ? Number(unixSeconds)
    : Math.floor(Date.now() / 1000);

  return new Date(normalized * 1000).toISOString();
}

function isSafeForOutput(value: unknown): boolean {
  try {
    assertNoRestrictedContent(value, 'taskBoardHandoffWriteApprovalRequestDraft');
    return true;
  } catch {
    return false;
  }
}

function safeStringForOutput(value: unknown, fallback: string): string {
  if (!isNonEmptyString(value)) {
    return fallback;
  }

  return isSafeForOutput(value) ? value.trim() : fallback;
}

function cloneJsonValue<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function cloneValidationIssues(
  issues: TaskBoardHandoffWriteDryRunValidationIssue[],
): TaskBoardHandoffWriteDryRunValidationIssue[] {
  return issues.map((issue) => ({ ...issue }));
}

function cloneValidationSummary(
  validation: TaskBoardHandoffWriteDryRunValidationResult,
): TaskBoardHandoffWriteApprovalRequestDraft['validation_summary'] {
  return {
    passed: validation.passed,
    issues: cloneValidationIssues(validation.issues),
  };
}

function cloneDryRunResult(
  dryRunResult: TaskBoardHandoffWriteDryRunResult,
): TaskBoardHandoffWriteDryRunResult {
  return cloneJsonValue(dryRunResult);
}

function didDryRunPass(
  dryRunResult: TaskBoardHandoffWriteDryRunResult,
): boolean {
  return (
    dryRunResult.status === 'dry_run_passed'
    && dryRunResult.validation.passed === true
  );
}

function makeSafetySummary(dryRunPassed: boolean): string[] {
  const invariantSummary = [
    'Approval request draft is human-review material only and does not grant approval.',
    'No write occurred; wrote_anything remains false.',
    'Future write behavior still requires explicit human approval and separate implementation scope.',
  ];

  if (!dryRunPassed) {
    return [
      'Write approval cannot be considered because dry-run validation failed or did not pass.',
      ...invariantSummary,
    ];
  }

  return [
    'Dry-run validation passed; the request may be reviewed by humans without treating this draft as approval.',
    ...invariantSummary,
  ];
}

function makeRollbackPlan(
  dryRunResult: TaskBoardHandoffWriteDryRunResult,
): string[] {
  return Array.from(new Set([
    'No rollback required because no write has occurred.',
    ...dryRunResult.rollback_plan,
  ]));
}

function makeReferences(
  dryRunResult: TaskBoardHandoffWriteDryRunResult,
): string[] {
  return Array.from(new Set([
    ...dryRunResult.references,
    ...REFERENCES,
  ]));
}

function makeAuditPreview(params: {
  dryRunResult: TaskBoardHandoffWriteDryRunResult;
  approvalRequestId: string;
  status: TaskBoardHandoffWriteApprovalRequestStatus;
}): Record<string, unknown> {
  const dryRunAudit = cloneJsonValue(
    asRecord(params.dryRunResult.audit_log_entry) ?? {},
  );

  return {
    ...dryRunAudit,
    approval_request_id: params.approvalRequestId,
    approval_request_actor:
      'codex_app_server_runtime_write_approval_request_draft',
    approval_request_status: params.status,
    decision: 'not_decided',
    required_next_action: 'human_review_only',
    allowed_next_step: 'human_review_only',
    required_human_approval: true,
    wrote_anything: false,
  };
}

function getHumanOwner(
  dryRunResult: TaskBoardHandoffWriteDryRunResult,
): string {
  const auditLogEntry = asRecord(dryRunResult.audit_log_entry);

  return safeStringForOutput(
    auditLogEntry?.human_owner,
    'human_owner_required_before_write',
  );
}

export function makeTaskBoardHandoffWriteApprovalRequestDraft(
  dryRunResult: TaskBoardHandoffWriteDryRunResult,
  options: MakeTaskBoardHandoffWriteApprovalRequestDraftOptions = {},
): TaskBoardHandoffWriteApprovalRequestDraft {
  const dryRunPassed = didDryRunPass(dryRunResult);
  const status: TaskBoardHandoffWriteApprovalRequestStatus = dryRunPassed
    ? 'pending_human_approval'
    : 'blocked';
  const approvalRequestId =
    options.approvalRequestId ?? DEFAULT_APPROVAL_REQUEST_ID;
  const sourceDryRunResult = cloneDryRunResult(dryRunResult);
  const draft: TaskBoardHandoffWriteApprovalRequestDraft = {
    approval_request_id: approvalRequestId,
    approval_request_version: 1,
    generated_at: toIsoTimestamp(options.generatedAt),
    source_request_id: safeStringForOutput(
      dryRunResult.request_id,
      'blocked_request_withheld',
    ),
    source_dry_run_result: sourceDryRunResult,
    source_command: SOURCE_COMMAND,
    status,
    decision: 'not_decided',
    requested_write_mode: 'write_after_human_approval',
    target_kind: dryRunResult.target_kind,
    target_path_or_target_id: dryRunResult.target_path_or_target_id,
    dry_run_status: dryRunResult.status,
    dry_run_passed: dryRunPassed,
    wrote_anything: false,
    human_owner: getHumanOwner(dryRunResult),
    required_human_approval: true,
    required_approver_roles: [...REQUIRED_APPROVER_ROLES],
    required_next_action: 'human_review_only',
    allowed_next_step: 'human_review_only',
    approval_record: {
      approved: false,
      approved_by: null,
      approved_at: null,
      approval_scope: 'none',
    },
    safety_summary: makeSafetySummary(dryRunPassed),
    validation_summary: cloneValidationSummary(dryRunResult.validation),
    audit_preview: makeAuditPreview({
      dryRunResult,
      approvalRequestId,
      status,
    }),
    rollback_plan: makeRollbackPlan(dryRunResult),
    forbidden_operations: [...FORBIDDEN_OPERATIONS],
    references: makeReferences(dryRunResult),
  };

  assertNoRestrictedContent(draft, 'taskBoardHandoffWriteApprovalRequestDraft');

  return draft;
}

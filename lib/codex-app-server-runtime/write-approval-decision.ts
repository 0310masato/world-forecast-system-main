import { assertNoRestrictedContent } from '../memory/validation';
import type {
  TaskBoardHandoffWriteApprovalRequestDraft,
  TaskBoardHandoffWriteApprovalRequestStatus,
} from './write-approval-request';

export type TaskBoardHandoffWriteApprovalDecision =
  | 'approved'
  | 'rejected'
  | 'needs_revision';

export type TaskBoardHandoffWriteApprovalDecisionValidationStatus =
  | 'decision_validated'
  | 'needs_human_decision'
  | 'blocked';

export type TaskBoardHandoffWriteApprovalDecisionValidationIssueCode =
  | 'E_APPROVAL_DECISION_MISSING'
  | 'E_APPROVAL_REQUEST_BLOCKED'
  | 'E_DRY_RUN_NOT_PASSED'
  | 'E_APPROVAL_REQUEST_ID_MISMATCH'
  | 'E_APPROVAL_REQUEST_VERSION_MISMATCH'
  | 'E_DECISION_INVALID'
  | 'E_DECIDER_MISSING'
  | 'E_DECIDED_AT_INVALID'
  | 'E_APPROVER_ROLE_INVALID'
  | 'E_APPROVAL_SCOPE_INVALID'
  | 'E_REVIEWED_ARTIFACTS_MISSING'
  | 'E_RESTRICTED_CONTENT';

export interface TaskBoardHandoffWriteApprovalDecisionRecord {
  approval_decision_id: string;
  approval_request_id: string;
  approval_request_version: 1;
  decision: TaskBoardHandoffWriteApprovalDecision;
  decided_by: string;
  decided_at: string;
  approver_role:
    | 'human_owner'
    | 'qa_reviewer'
    | 'security_reviewer'
    | 'contract_compliance_reviewer';
  approval_scope:
    | 'task_board_handoff_write_after_human_approval'
    | 'none';
  approval_reason: string;
  reviewed_artifacts: string[];
  conditions: string[];
  expires_at: string | null;
}

export interface TaskBoardHandoffWriteApprovalDecisionValidationResult {
  approval_decision_validation_id: string;
  approval_decision_validation_version: 1;
  generated_at: string;
  source_approval_request_id: string;
  source_approval_request_status: TaskBoardHandoffWriteApprovalRequestStatus;
  source_dry_run_status: string;
  source_dry_run_passed: boolean;
  status: TaskBoardHandoffWriteApprovalDecisionValidationStatus;
  decision: TaskBoardHandoffWriteApprovalDecision | 'not_decided';
  decision_accepted: boolean;
  approval_valid_for_future_write: boolean;
  write_authorized_by_this_pr: false;
  wrote_anything: false;
  required_human_approval: true;
  required_next_action:
    | 'human_review_only'
    | 'separate_write_implementation_required'
    | 'revise_or_reject_request';
  allowed_next_step:
    | 'human_review_only'
    | 'separate_write_implementation_required';
  validation: {
    passed: boolean;
    issues: Array<{
      code: TaskBoardHandoffWriteApprovalDecisionValidationIssueCode;
      message: string;
    }>;
  };
  approval_record_preview: TaskBoardHandoffWriteApprovalDecisionRecord | null;
  audit_preview: Record<string, unknown>;
  safety_summary: string[];
  rollback_plan: string[];
  forbidden_operations: string[];
  references: string[];
}

export interface ValidateTaskBoardHandoffWriteApprovalDecisionOptions {
  approvalDecisionValidationId?: string;
  generatedAt?: number;
}

type UnknownRecord = Record<string, unknown>;

type ApprovalDecisionValidationIssue =
  TaskBoardHandoffWriteApprovalDecisionValidationResult['validation']['issues'][number];

const DEFAULT_APPROVAL_DECISION_VALIDATION_ID =
  'codex-app-server-runtime-write-approval-decision-validation-001';
const APPROVAL_DECISIONS = new Set<string>([
  'approved',
  'rejected',
  'needs_revision',
]);
const APPROVER_ROLES = new Set<string>([
  'human_owner',
  'qa_reviewer',
  'security_reviewer',
  'contract_compliance_reviewer',
]);
const APPROVAL_SCOPES = new Set<string>([
  'task_board_handoff_write_after_human_approval',
  'none',
]);
const FUTURE_WRITE_APPROVAL_SCOPE =
  'task_board_handoff_write_after_human_approval';
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
  'lib/codex-app-server-runtime/write-approval-decision.ts',
  'scripts/codex-app-server-runtime-write-dry-run.mjs',
  'scripts/codex-app-server-runtime-write-approval-request.mjs',
  'scripts/codex-app-server-runtime-write-approval-decision-validator.mjs',
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

function addIssue(
  issues: ApprovalDecisionValidationIssue[],
  code: TaskBoardHandoffWriteApprovalDecisionValidationIssueCode,
  message: string,
): void {
  if (!issues.some((issue) => issue.code === code && issue.message === message)) {
    issues.push({ code, message });
  }
}

function toIsoTimestamp(unixSeconds?: number): string {
  const normalized = Number.isInteger(unixSeconds) && Number(unixSeconds) >= 0
    ? Number(unixSeconds)
    : Math.floor(Date.now() / 1000);

  return new Date(normalized * 1000).toISOString();
}

function parseTimestamp(value: unknown): number | null {
  if (!isNonEmptyString(value)) {
    return null;
  }

  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : null;
}

function hasRestrictedContent(value: unknown): boolean {
  try {
    assertNoRestrictedContent(value, 'taskBoardHandoffWriteApprovalDecision');
    return false;
  } catch {
    return true;
  }
}

function cloneJsonValue<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function safeStringForAudit(value: unknown, fallback: string): string {
  if (!isNonEmptyString(value) || hasRestrictedContent(value)) {
    return fallback;
  }

  return value.trim();
}

function getDecision(value: unknown): TaskBoardHandoffWriteApprovalDecision | null {
  if (typeof value === 'string' && APPROVAL_DECISIONS.has(value)) {
    return value as TaskBoardHandoffWriteApprovalDecision;
  }

  return null;
}

function validateDecisionRecord(params: {
  approvalRequestDraft: TaskBoardHandoffWriteApprovalRequestDraft;
  decisionRecord: UnknownRecord;
  issues: ApprovalDecisionValidationIssue[];
}): {
  decision: TaskBoardHandoffWriteApprovalDecision | 'not_decided';
  restrictedContentDetected: boolean;
} {
  const { approvalRequestDraft, decisionRecord, issues } = params;
  const decision = getDecision(decisionRecord.decision);
  const requestGeneratedAt = parseTimestamp(approvalRequestDraft.generated_at);
  const decidedAt = parseTimestamp(decisionRecord.decided_at);
  const expiresAt = decisionRecord.expires_at === null
    ? null
    : parseTimestamp(decisionRecord.expires_at);
  const restrictedContentDetected = hasRestrictedContent(decisionRecord);

  if (!isNonEmptyString(decisionRecord.approval_decision_id)) {
    addIssue(
      issues,
      'E_DECISION_INVALID',
      'approval_decision_id must be present before any decision can be accepted.',
    );
  }

  if (decisionRecord.approval_request_id !== approvalRequestDraft.approval_request_id) {
    addIssue(
      issues,
      'E_APPROVAL_REQUEST_ID_MISMATCH',
      'approval_request_id must match the approval request draft.',
    );
  }

  if (decisionRecord.approval_request_version !== approvalRequestDraft.approval_request_version) {
    addIssue(
      issues,
      'E_APPROVAL_REQUEST_VERSION_MISMATCH',
      'approval_request_version must match the approval request draft.',
    );
  }

  if (!decision) {
    addIssue(
      issues,
      'E_DECISION_INVALID',
      'decision must be approved, rejected, or needs_revision.',
    );
  }

  if (!isNonEmptyString(decisionRecord.decided_by)) {
    addIssue(
      issues,
      'E_DECIDER_MISSING',
      'decided_by must identify the human reviewer before any future write can be considered.',
    );
  }

  if (
    decidedAt === null
    || (requestGeneratedAt !== null && decidedAt < requestGeneratedAt)
  ) {
    addIssue(
      issues,
      'E_DECIDED_AT_INVALID',
      'decided_at must be a valid timestamp at or after the approval request draft timestamp.',
    );
  }

  if (
    typeof decisionRecord.approver_role !== 'string'
    || !APPROVER_ROLES.has(decisionRecord.approver_role)
  ) {
    addIssue(
      issues,
      'E_APPROVER_ROLE_INVALID',
      'approver_role must be one of the allowed human reviewer roles.',
    );
  }

  if (
    typeof decisionRecord.approval_scope !== 'string'
    || !APPROVAL_SCOPES.has(decisionRecord.approval_scope)
    || (decision === 'approved' && decisionRecord.approval_scope !== FUTURE_WRITE_APPROVAL_SCOPE)
  ) {
    addIssue(
      issues,
      'E_APPROVAL_SCOPE_INVALID',
      'approval_scope must be valid and approved decisions must use the future write approval scope.',
    );
  }

  if (!isNonEmptyString(decisionRecord.approval_reason)) {
    addIssue(
      issues,
      'E_DECISION_INVALID',
      'approval_reason must be present for the human decision record.',
    );
  }

  if (
    !Array.isArray(decisionRecord.reviewed_artifacts)
    || decisionRecord.reviewed_artifacts.length === 0
    || !decisionRecord.reviewed_artifacts.every(isNonEmptyString)
  ) {
    addIssue(
      issues,
      'E_REVIEWED_ARTIFACTS_MISSING',
      'reviewed_artifacts must list the artifacts reviewed by the human reviewer.',
    );
  }

  if (
    !Array.isArray(decisionRecord.conditions)
    || !decisionRecord.conditions.every((condition) => typeof condition === 'string')
  ) {
    addIssue(
      issues,
      'E_DECISION_INVALID',
      'conditions must be an array of strings.',
    );
  }

  if (
    decisionRecord.expires_at !== null
    && (
      expiresAt === null
      || (requestGeneratedAt !== null && expiresAt <= requestGeneratedAt)
    )
  ) {
    addIssue(
      issues,
      'E_DECIDED_AT_INVALID',
      'expires_at must be null or a valid timestamp after the approval request draft timestamp.',
    );
  }

  if (restrictedContentDetected) {
    addIssue(
      issues,
      'E_RESTRICTED_CONTENT',
      'approval decision record contains restricted content that cannot be surfaced.',
    );
  }

  return {
    decision: decision ?? 'not_decided',
    restrictedContentDetected,
  };
}

function makeSafetySummary(params: {
  status: TaskBoardHandoffWriteApprovalDecisionValidationStatus;
  decision: TaskBoardHandoffWriteApprovalDecision | 'not_decided';
  approvalValidForFutureWrite: boolean;
}): string[] {
  const invariantSummary = [
    'Approval decision validation is stdout-only review material.',
    'This validator does not create or grant approval by itself.',
    'This PR does not authorize writes; write_authorized_by_this_pr remains false.',
    'No write occurred; wrote_anything remains false.',
    'Any future write still requires separate implementation scope and explicit human approval.',
  ];

  if (params.status === 'needs_human_decision') {
    return [
      'No human approval decision record was supplied; human review is still required.',
      ...invariantSummary,
    ];
  }

  if (params.status === 'blocked') {
    return [
      'Approval decision validation is blocked; no future write may be considered from this result.',
      ...invariantSummary,
    ];
  }

  if (params.decision === 'approved' && params.approvalValidForFutureWrite) {
    return [
      'A supplied human approval decision record validated, but this PR still does not implement or authorize writes.',
      ...invariantSummary,
    ];
  }

  return [
    'A supplied human decision record validated without making approval valid for future write.',
    ...invariantSummary,
  ];
}

function makeAuditPreview(params: {
  approvalRequestDraft: TaskBoardHandoffWriteApprovalRequestDraft;
  decisionRecord: UnknownRecord | null;
  status: TaskBoardHandoffWriteApprovalDecisionValidationStatus;
  decision: TaskBoardHandoffWriteApprovalDecision | 'not_decided';
  decisionAccepted: boolean;
  approvalValidForFutureWrite: boolean;
  requiredNextAction: TaskBoardHandoffWriteApprovalDecisionValidationResult['required_next_action'];
}): Record<string, unknown> {
  return {
    approval_decision_validation_actor:
      'codex_app_server_runtime_write_approval_decision_validator',
    approval_request_id: params.approvalRequestDraft.approval_request_id,
    approval_decision_id: safeStringForAudit(
      params.decisionRecord?.approval_decision_id,
      'approval_decision_not_available',
    ),
    approval_decision_validation_status: params.status,
    decision: params.decision,
    decision_accepted: params.decisionAccepted,
    approval_valid_for_future_write: params.approvalValidForFutureWrite,
    write_authorized_by_this_pr: false,
    wrote_anything: false,
    required_next_action: params.requiredNextAction,
  };
}

export function validateTaskBoardHandoffWriteApprovalDecision(
  approvalRequestDraft: TaskBoardHandoffWriteApprovalRequestDraft,
  decisionRecord?: TaskBoardHandoffWriteApprovalDecisionRecord | null,
  options: ValidateTaskBoardHandoffWriteApprovalDecisionOptions = {},
): TaskBoardHandoffWriteApprovalDecisionValidationResult {
  const issues: ApprovalDecisionValidationIssue[] = [];
  const decisionRecordObject = asRecord(decisionRecord);
  let decision: TaskBoardHandoffWriteApprovalDecision | 'not_decided' =
    'not_decided';
  let decisionRestrictedContentDetected = false;

  if (approvalRequestDraft.status === 'blocked') {
    addIssue(
      issues,
      'E_APPROVAL_REQUEST_BLOCKED',
      'approval request draft is blocked and cannot accept a human decision for future write.',
    );
  }

  if (
    approvalRequestDraft.dry_run_passed !== true
    || approvalRequestDraft.dry_run_status !== 'dry_run_passed'
  ) {
    addIssue(
      issues,
      'E_DRY_RUN_NOT_PASSED',
      'source dry-run did not pass, so approval decision validation is blocked.',
    );
  }

  if (!decisionRecordObject) {
    addIssue(
      issues,
      'E_APPROVAL_DECISION_MISSING',
      'A human approval decision record is required before any future write can be considered.',
    );
  } else {
    const decisionValidation = validateDecisionRecord({
      approvalRequestDraft,
      decisionRecord: decisionRecordObject,
      issues,
    });
    decision = decisionValidation.decision;
    decisionRestrictedContentDetected =
      decisionValidation.restrictedContentDetected;
  }

  const hasSourceIssue = issues.some((issue) => (
    issue.code === 'E_APPROVAL_REQUEST_BLOCKED'
    || issue.code === 'E_DRY_RUN_NOT_PASSED'
  ));
  const hasMissingDecisionOnly = (
    issues.length === 1
    && issues[0]?.code === 'E_APPROVAL_DECISION_MISSING'
  );
  const validationPassed = issues.length === 0;
  const decisionAccepted = validationPassed && decision !== 'not_decided';
  const approvalValidForFutureWrite =
    decisionAccepted && decision === 'approved';
  const status: TaskBoardHandoffWriteApprovalDecisionValidationStatus =
    hasMissingDecisionOnly
      ? 'needs_human_decision'
      : validationPassed
        ? 'decision_validated'
        : 'blocked';
  const requiredNextAction:
    TaskBoardHandoffWriteApprovalDecisionValidationResult['required_next_action'] =
    approvalValidForFutureWrite
      ? 'separate_write_implementation_required'
      : decisionAccepted && (decision === 'rejected' || decision === 'needs_revision')
        ? 'revise_or_reject_request'
        : 'human_review_only';
  const allowedNextStep:
    TaskBoardHandoffWriteApprovalDecisionValidationResult['allowed_next_step'] =
    approvalValidForFutureWrite
      ? 'separate_write_implementation_required'
      : 'human_review_only';
  const approvalRecordPreview = decisionRecordObject
    && !decisionRestrictedContentDetected
    && !hasSourceIssue
    ? cloneJsonValue(decisionRecord as TaskBoardHandoffWriteApprovalDecisionRecord)
    : null;
  const result: TaskBoardHandoffWriteApprovalDecisionValidationResult = {
    approval_decision_validation_id:
      options.approvalDecisionValidationId
        ?? DEFAULT_APPROVAL_DECISION_VALIDATION_ID,
    approval_decision_validation_version: 1,
    generated_at: toIsoTimestamp(options.generatedAt),
    source_approval_request_id: approvalRequestDraft.approval_request_id,
    source_approval_request_status: approvalRequestDraft.status,
    source_dry_run_status: approvalRequestDraft.dry_run_status,
    source_dry_run_passed: approvalRequestDraft.dry_run_passed,
    status,
    decision,
    decision_accepted: decisionAccepted,
    approval_valid_for_future_write: approvalValidForFutureWrite,
    write_authorized_by_this_pr: false,
    wrote_anything: false,
    required_human_approval: true,
    required_next_action: requiredNextAction,
    allowed_next_step: allowedNextStep,
    validation: {
      passed: validationPassed,
      issues,
    },
    approval_record_preview: approvalRecordPreview,
    audit_preview: makeAuditPreview({
      approvalRequestDraft,
      decisionRecord: decisionRecordObject,
      status,
      decision,
      decisionAccepted,
      approvalValidForFutureWrite,
      requiredNextAction,
    }),
    safety_summary: makeSafetySummary({
      status,
      decision,
      approvalValidForFutureWrite,
    }),
    rollback_plan: [
      'No rollback required because no write has occurred.',
    ],
    forbidden_operations: [...FORBIDDEN_OPERATIONS],
    references: [...REFERENCES],
  };

  assertNoRestrictedContent(result, 'taskBoardHandoffWriteApprovalDecisionValidationResult');

  return result;
}

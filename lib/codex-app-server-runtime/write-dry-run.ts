import { createHash } from 'node:crypto';
import { assertNoRestrictedContent } from '../memory/validation';
import { makeCodexAppServerRuntimeMvpScaffold } from './scaffold';
import {
  makeCodexAppServerRuntimeMvpReviewPacket,
  type CodexAppServerRuntimeMvpReviewPacket,
} from './report';

export type TaskBoardHandoffWriteTargetKind =
  | 'repository_artifact'
  | 'task_board_record'
  | 'handoff_record'
  | 'qa_report_record';

export type TaskBoardHandoffWriteMode =
  | 'dry_run_only'
  | 'prepare_for_approval_only'
  | 'write_after_human_approval';

export type TaskBoardHandoffWriteDryRunStatus =
  | 'dry_run_passed'
  | 'blocked'
  | 'failed';

export type TaskBoardHandoffWriteErrorCode =
  | 'E_PACKET_INVALID'
  | 'E_RESTRICTED_CONTENT'
  | 'E_APPROVAL_MISSING'
  | 'E_TARGET_NOT_ALLOWED'
  | 'E_IDEMPOTENCY_MISSING'
  | 'E_DUPLICATE_WRITE'
  | 'E_WRITE_NOT_IMPLEMENTED'
  | 'E_TOOL_DISABLED'
  | 'E_FORBIDDEN_OPERATION';

export interface TaskBoardHandoffWriteApprovalRecord {
  approved: boolean;
  approved_by: string | null;
  approved_at: string | null;
  approval_scope:
    | 'none'
    | 'dry_run_only'
    | 'prepare_for_approval_only'
    | 'write_after_human_approval';
}

export interface TaskBoardHandoffWriteDryRunRequest {
  request_id: string;
  source_packet: CodexAppServerRuntimeMvpReviewPacket;
  source_packet_sha256: string;
  source_command: 'node scripts/codex-app-server-runtime-report.mjs --packet';
  human_owner: string;
  approval_record: TaskBoardHandoffWriteApprovalRecord;
  approval_timestamp: string | null;
  target_kind: TaskBoardHandoffWriteTargetKind;
  target_path_or_target_id: string;
  idempotency_key: string;
  dry_run: true;
  write_mode: 'dry_run_only';
}

export interface TaskBoardHandoffWriteDryRunValidationIssue {
  code: TaskBoardHandoffWriteErrorCode;
  message: string;
}

export interface TaskBoardHandoffWriteDryRunValidationResult {
  passed: boolean;
  issues: TaskBoardHandoffWriteDryRunValidationIssue[];
}

export interface TaskBoardHandoffWriteDryRunResult {
  request_id: string;
  status: TaskBoardHandoffWriteDryRunStatus;
  wrote_anything: false;
  target_kind: TaskBoardHandoffWriteTargetKind;
  target_path_or_target_id: string;
  audit_log_entry: Record<string, unknown>;
  validation: TaskBoardHandoffWriteDryRunValidationResult;
  required_next_action: 'human_review_only';
  rollback_plan: string[];
  references: string[];
}

export interface MakeTaskBoardHandoffWriteDryRunRequestOptions {
  requestId?: string;
  sourcePacket?: CodexAppServerRuntimeMvpReviewPacket;
  generatedAt?: number;
  humanOwner?: string;
  approvalRecord?: TaskBoardHandoffWriteApprovalRecord;
  approvalTimestamp?: string | null;
  targetKind?: TaskBoardHandoffWriteTargetKind;
  targetPathOrTargetId?: string;
  idempotencyKey?: string;
}

type UnknownRecord = Record<string, unknown>;

const SOURCE_COMMAND =
  'node scripts/codex-app-server-runtime-report.mjs --packet' as const;
const DEFAULT_REQUEST_ID =
  'codex-app-server-runtime-write-dry-run-001';
const DEFAULT_IDEMPOTENCY_KEY =
  'codex-app-server-runtime-write-dry-run-idempotency-001';
const DEFAULT_TARGET_KIND: TaskBoardHandoffWriteTargetKind =
  'repository_artifact';
const DEFAULT_TARGET_PATH =
  'docs/generated/codex-app-server-runtime/review-packet.sample.json';
const APPROVED_REPOSITORY_TARGETS = new Set<string>([
  DEFAULT_TARGET_PATH,
]);
const TARGET_KINDS = new Set<string>([
  'repository_artifact',
  'task_board_record',
  'handoff_record',
  'qa_report_record',
]);
const APPROVAL_SCOPES = new Set<string>([
  'none',
  'dry_run_only',
  'prepare_for_approval_only',
  'write_after_human_approval',
]);
const ROLLBACK_PLAN = [
  'No rollback required because dry_run_only wrote nothing.',
];
const REFERENCES = [
  'docs/tool-contracts/TASK_BOARD_HANDOFF_WRITE_TOOL_CONTRACT.md',
  'scripts/codex-app-server-runtime-report.mjs',
  'scripts/codex-app-server-runtime-write-dry-run.mjs',
];
const EXTRA_RESTRICTED_CONTENT_PATTERNS = [
  {
    name: 'production log detail',
    pattern: /\bproduction\s+logs?\b/i,
  },
  {
    name: 'real operational data detail',
    pattern: /\breal\s+operational\s+data\b/i,
  },
  {
    name: 'URL target',
    pattern: /\bhttps?:\/\//i,
  },
] as const;
const FORBIDDEN_TARGET_PATTERNS = [
  /^[A-Za-z]:[\\/]/,
  /^\\\\/,
  /^\/(?:tmp|home|Users)\//,
  /^~/,
  /\.\.(?:\/|\\|$)/,
  /\\/,
  /\bhttps?:\/\//i,
  /\b(?:10(?:\.\d{1,3}){3}|192\.168(?:\.\d{1,3}){2}|172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})\b/,
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
  issues: TaskBoardHandoffWriteDryRunValidationIssue[],
  code: TaskBoardHandoffWriteErrorCode,
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

function sha256Json(value: unknown): string {
  return createHash('sha256')
    .update(JSON.stringify(value))
    .digest('hex');
}

function getRestrictedContentIssue(value: unknown): string | null {
  try {
    assertNoRestrictedContent(value, 'taskBoardHandoffWriteDryRunRequest');
  } catch (error) {
    if (error instanceof Error) {
      return error.message;
    }

    return 'Task Board / HANDOFF write dry-run request contains restricted content.';
  }

  const serialized = JSON.stringify(value);
  if (!serialized) {
    return null;
  }

  for (const { name, pattern } of EXTRA_RESTRICTED_CONTENT_PATTERNS) {
    if (pattern.test(serialized)) {
      return `Task Board / HANDOFF write dry-run request contains restricted content: ${name}.`;
    }
  }

  return null;
}

function isAllowedRepositoryRelativeTarget(target: unknown): target is string {
  if (!isNonEmptyString(target)) {
    return false;
  }

  const normalized = target.trim();
  if (normalized.startsWith('/') || normalized.startsWith('\\')) {
    return false;
  }

  if (FORBIDDEN_TARGET_PATTERNS.some((pattern) => pattern.test(normalized))) {
    return false;
  }

  return APPROVED_REPOSITORY_TARGETS.has(normalized);
}

function isSafeForOutput(value: unknown): boolean {
  return getRestrictedContentIssue(value) === null;
}

function safeStringForOutput(value: unknown, fallback: string): string {
  if (!isNonEmptyString(value)) {
    return fallback;
  }

  return isSafeForOutput(value) ? value.trim() : fallback;
}

function safeTargetForOutput(value: unknown): string {
  if (isAllowedRepositoryRelativeTarget(value)) {
    return value.trim();
  }

  return 'blocked_target_withheld';
}

function safeApprovalRecordForOutput(
  value: unknown,
): TaskBoardHandoffWriteApprovalRecord {
  const record = asRecord(value);
  return {
    approved: record?.approved === true,
    approved_by: isSafeForOutput(record?.approved_by)
      && typeof record?.approved_by === 'string'
      ? record.approved_by
      : null,
    approved_at: isSafeForOutput(record?.approved_at)
      && typeof record?.approved_at === 'string'
      ? record.approved_at
      : null,
    approval_scope:
      typeof record?.approval_scope === 'string'
      && APPROVAL_SCOPES.has(record.approval_scope)
        ? record.approval_scope as TaskBoardHandoffWriteApprovalRecord['approval_scope']
        : 'none',
  };
}

function getTargetKindForOutput(value: unknown): TaskBoardHandoffWriteTargetKind {
  if (typeof value === 'string' && TARGET_KINDS.has(value)) {
    return value as TaskBoardHandoffWriteTargetKind;
  }

  return DEFAULT_TARGET_KIND;
}

function validateApprovalRecord(
  request: UnknownRecord,
  issues: TaskBoardHandoffWriteDryRunValidationIssue[],
): void {
  const approvalRecord = asRecord(request.approval_record);
  if (!approvalRecord) {
    addIssue(
      issues,
      'E_APPROVAL_MISSING',
      'approval_record must be present for human-review boundary validation.',
    );
    return;
  }

  if (typeof approvalRecord.approved !== 'boolean') {
    addIssue(
      issues,
      'E_APPROVAL_MISSING',
      'approval_record.approved must be a boolean.',
    );
  }

  if (
    approvalRecord.approved_by !== null
    && typeof approvalRecord.approved_by !== 'string'
  ) {
    addIssue(
      issues,
      'E_APPROVAL_MISSING',
      'approval_record.approved_by must be null or a string.',
    );
  }

  if (
    approvalRecord.approved_at !== null
    && typeof approvalRecord.approved_at !== 'string'
  ) {
    addIssue(
      issues,
      'E_APPROVAL_MISSING',
      'approval_record.approved_at must be null or a string.',
    );
  }

  if (
    typeof approvalRecord.approval_scope !== 'string'
    || !APPROVAL_SCOPES.has(approvalRecord.approval_scope)
  ) {
    addIssue(
      issues,
      'E_APPROVAL_MISSING',
      'approval_record.approval_scope must be an allowed approval scope.',
    );
  }
}

function validateReviewPacket(
  packet: unknown,
  issues: TaskBoardHandoffWriteDryRunValidationIssue[],
): void {
  const packetRecord = asRecord(packet);
  if (!packetRecord) {
    addIssue(issues, 'E_PACKET_INVALID', 'source_packet must be an object.');
    return;
  }

  const requiredFields = [
    ['required_next_action', 'human_review_only'],
    ['allowed_next_step', 'human_review_only'],
    ['proposal_only', true],
    ['is_production_state', false],
    ['stdout_only', true],
  ] as const;

  for (const [field, expected] of requiredFields) {
    if (packetRecord[field] !== expected) {
      addIssue(
        issues,
        'E_PACKET_INVALID',
        `source_packet.${field} must be ${String(expected)}.`,
      );
    }
  }

  for (const field of ['report', 'summary', 'taskcard', 'taskcard_qa', 'handoff']) {
    if (!asRecord(packetRecord[field])) {
      addIssue(
        issues,
        'E_PACKET_INVALID',
        `source_packet.${field} must be present.`,
      );
    }
  }
}

export function makeTaskBoardHandoffWriteDryRunRequest(
  options: MakeTaskBoardHandoffWriteDryRunRequestOptions = {},
): TaskBoardHandoffWriteDryRunRequest {
  const sourcePacket = options.sourcePacket
    ?? makeCodexAppServerRuntimeMvpReviewPacket(
      makeCodexAppServerRuntimeMvpScaffold({
        createdAt: options.generatedAt,
      }),
      {
        generatedAt: options.generatedAt,
      },
    );

  return {
    request_id: options.requestId ?? DEFAULT_REQUEST_ID,
    source_packet: sourcePacket,
    source_packet_sha256: sha256Json(sourcePacket),
    source_command: SOURCE_COMMAND,
    human_owner: options.humanOwner ?? 'human_owner_required_before_write',
    approval_record: options.approvalRecord ?? {
      approved: false,
      approved_by: null,
      approved_at: null,
      approval_scope: 'none',
    },
    approval_timestamp: options.approvalTimestamp ?? null,
    target_kind: options.targetKind ?? DEFAULT_TARGET_KIND,
    target_path_or_target_id:
      options.targetPathOrTargetId ?? DEFAULT_TARGET_PATH,
    idempotency_key: options.idempotencyKey ?? DEFAULT_IDEMPOTENCY_KEY,
    dry_run: true,
    write_mode: 'dry_run_only',
  };
}

export function validateTaskBoardHandoffWriteDryRunRequest(
  request: unknown,
): TaskBoardHandoffWriteDryRunValidationResult {
  const issues: TaskBoardHandoffWriteDryRunValidationIssue[] = [];
  const requestRecord = asRecord(request);

  if (!requestRecord) {
    addIssue(issues, 'E_PACKET_INVALID', 'request must be an object.');
    return { passed: false, issues };
  }

  validateReviewPacket(requestRecord.source_packet, issues);

  if (!isNonEmptyString(requestRecord.request_id)) {
    addIssue(issues, 'E_PACKET_INVALID', 'request_id must be a non-empty string.');
  }

  if (requestRecord.source_command !== SOURCE_COMMAND) {
    addIssue(
      issues,
      'E_PACKET_INVALID',
      `source_command must be "${SOURCE_COMMAND}".`,
    );
  }

  if (!isNonEmptyString(requestRecord.source_packet_sha256)) {
    addIssue(
      issues,
      'E_PACKET_INVALID',
      'source_packet_sha256 must be a non-empty string.',
    );
  } else if (
    asRecord(requestRecord.source_packet)
    && requestRecord.source_packet_sha256 !== sha256Json(requestRecord.source_packet)
  ) {
    addIssue(
      issues,
      'E_PACKET_INVALID',
      'source_packet_sha256 must match source_packet.',
    );
  }

  if (!isNonEmptyString(requestRecord.human_owner)) {
    addIssue(issues, 'E_APPROVAL_MISSING', 'human_owner must be present.');
  }

  validateApprovalRecord(requestRecord, issues);

  if (
    requestRecord.approval_timestamp !== null
    && requestRecord.approval_timestamp !== undefined
    && typeof requestRecord.approval_timestamp !== 'string'
  ) {
    addIssue(
      issues,
      'E_APPROVAL_MISSING',
      'approval_timestamp must be null or a string.',
    );
  }

  if (
    typeof requestRecord.target_kind !== 'string'
    || !TARGET_KINDS.has(requestRecord.target_kind)
  ) {
    addIssue(
      issues,
      'E_TARGET_NOT_ALLOWED',
      'target_kind must be an allowed write target kind.',
    );
  }

  if (requestRecord.target_kind !== DEFAULT_TARGET_KIND) {
    addIssue(
      issues,
      'E_TARGET_NOT_ALLOWED',
      'PR #44 dry-run validation allows only the approved repository_artifact target.',
    );
  }

  if (!isAllowedRepositoryRelativeTarget(requestRecord.target_path_or_target_id)) {
    addIssue(
      issues,
      'E_TARGET_NOT_ALLOWED',
      'target_path_or_target_id must be an approved repository-relative target.',
    );
  }

  if (!isNonEmptyString(requestRecord.idempotency_key)) {
    addIssue(
      issues,
      'E_IDEMPOTENCY_MISSING',
      'idempotency_key must be present for every dry run.',
    );
  }

  if (requestRecord.dry_run !== true) {
    addIssue(
      issues,
      'E_FORBIDDEN_OPERATION',
      'dry_run must be true; PR #44 writes nothing.',
    );
  }

  if (requestRecord.write_mode !== 'dry_run_only') {
    addIssue(
      issues,
      'E_FORBIDDEN_OPERATION',
      'write_mode must be dry_run_only; write-capable modes are not implemented in PR #44.',
    );
  }

  const restrictedContentIssue = getRestrictedContentIssue(requestRecord);
  if (restrictedContentIssue) {
    addIssue(issues, 'E_RESTRICTED_CONTENT', restrictedContentIssue);
  }

  return {
    passed: issues.length === 0,
    issues,
  };
}

export function runTaskBoardHandoffWriteDryRun(
  request: unknown,
): TaskBoardHandoffWriteDryRunResult {
  const requestRecord = asRecord(request) ?? {};
  const validation = validateTaskBoardHandoffWriteDryRunRequest(request);
  const targetKind = getTargetKindForOutput(requestRecord.target_kind);
  const targetPathOrTargetId = safeTargetForOutput(
    requestRecord.target_path_or_target_id,
  );
  const rollbackPlan = [...ROLLBACK_PLAN];
  const requestId = safeStringForOutput(
    requestRecord.request_id,
    'blocked_request_withheld',
  );
  const result: TaskBoardHandoffWriteDryRunResult = {
    request_id: requestId,
    status: validation.passed ? 'dry_run_passed' : 'blocked',
    wrote_anything: false,
    target_kind: targetKind,
    target_path_or_target_id: targetPathOrTargetId,
    audit_log_entry: {
      audit_id: 'codex-app-server-runtime-write-dry-run-audit-001',
      request_id: requestId,
      actor: 'codex_app_server_runtime_write_dry_run',
      human_owner: safeStringForOutput(
        requestRecord.human_owner,
        'human_owner_withheld',
      ),
      timestamp: toIsoTimestamp(),
      source_packet_sha256: safeStringForOutput(
        requestRecord.source_packet_sha256,
        'source_packet_sha256_withheld',
      ),
      source_command: requestRecord.source_command === SOURCE_COMMAND
        ? SOURCE_COMMAND
        : 'source_command_withheld',
      target_kind: targetKind,
      target_path_or_target_id: targetPathOrTargetId,
      dry_run: requestRecord.dry_run === true,
      write_mode: requestRecord.write_mode === 'dry_run_only'
        ? 'dry_run_only'
        : 'blocked_write_mode',
      approval_record: safeApprovalRecordForOutput(
        requestRecord.approval_record,
      ),
      validation_result: validation,
      wrote_anything: false,
      rollback_plan: rollbackPlan,
    },
    validation,
    required_next_action: 'human_review_only',
    rollback_plan: rollbackPlan,
    references: [...REFERENCES],
  };

  return result;
}

import { assertNoRestrictedContent } from '../memory/validation';
import type {
  TaskBoardHandoffWriteApprovalDecisionValidationResult,
} from './write-approval-decision';
import type {
  TaskBoardHandoffWriteApprovalRequestDraft,
} from './write-approval-request';
import type {
  TaskBoardHandoffWriteDryRunResult,
} from './write-dry-run';

export type TaskBoardHandoffWritePlanStatus =
  | 'needs_human_decision'
  | 'blocked'
  | 'write_plan_ready_for_separate_implementation';

export type TaskBoardHandoffWritePlanRequiredNextAction =
  | 'human_decision_required'
  | 'revise_or_reject_request'
  | 'resolve_blockers_then_restart_approval'
  | 'separate_write_implementation_required';

export type TaskBoardHandoffWritePlanAllowedNextStep =
  | 'human_review_only'
  | 'revise_or_reject_request'
  | 'separate_write_implementation_required';

export interface TaskBoardHandoffWritePlanArtifactMetadata {
  artifact_kind: string;
  target_path_or_target_id: string;
  intended_operation: 'future_write_after_explicit_human_approval_in_separate_scope';
  source_packet_sha256: string | null;
  source_reference: string;
  preview_summary: string;
  validation_notes: string[];
  metadata_only: true;
  includes_full_future_file_contents: false;
}

export interface TaskBoardHandoffWritePlanDraft {
  write_plan_id: string;
  write_plan_version: 1;
  generated_at: string;
  source_approval_request_id: string;
  source_approval_decision_validation_id: string;
  source_approval_decision_validation_status:
    TaskBoardHandoffWriteApprovalDecisionValidationResult['status'];
  source_decision: TaskBoardHandoffWriteApprovalDecisionValidationResult['decision'];
  source_decision_accepted: boolean;
  source_approval_valid_for_future_write: boolean;
  plan_status: TaskBoardHandoffWritePlanStatus;
  target_kind: string;
  target_path_or_target_id: string;
  proposed_write_mode: 'write_after_human_approval_separate_scope';
  write_authorized_by_this_pr: false;
  wrote_anything: false;
  write_executor_present: false;
  executed_write_count: 0;
  required_human_approval: true;
  required_next_action: TaskBoardHandoffWritePlanRequiredNextAction;
  allowed_next_step: TaskBoardHandoffWritePlanAllowedNextStep;
  validation_summary: {
    source_validation_passed: boolean;
    source_validation_issues: TaskBoardHandoffWriteApprovalDecisionValidationResult['validation']['issues'];
    source_safety_invariants_preserved: boolean;
    plan_blocks_actual_write: true;
  };
  proposed_write_artifacts: TaskBoardHandoffWritePlanArtifactMetadata[];
  audit_preview: Record<string, unknown>;
  rollback_plan: string[];
  forbidden_operations: string[];
  references: string[];
  safety_summary: string[];
}

export interface MakeTaskBoardHandoffWritePlanDraftOptions {
  writePlanId?: string;
  generatedAt?: number;
  approvalRequestDraft?: TaskBoardHandoffWriteApprovalRequestDraft;
  dryRunResult?: TaskBoardHandoffWriteDryRunResult;
}

type UnknownRecord = Record<string, unknown>;

const DEFAULT_WRITE_PLAN_ID =
  'codex-app-server-runtime-write-plan-001';
const PROPOSED_WRITE_MODE =
  'write_after_human_approval_separate_scope' as const;
const DEFAULT_TARGET_KIND = 'repository_artifact';
const DEFAULT_TARGET_PATH =
  'target_unavailable_until_approval_request_metadata';
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
  'lib/codex-app-server-runtime/write-plan.ts',
  'scripts/codex-app-server-runtime-write-dry-run.mjs',
  'scripts/codex-app-server-runtime-write-approval-request.mjs',
  'scripts/codex-app-server-runtime-write-approval-decision-validator.mjs',
  'scripts/codex-app-server-runtime-write-plan.mjs',
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
    assertNoRestrictedContent(value, 'taskBoardHandoffWritePlanDraft');
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

function safeTargetForOutput(value: unknown): string {
  if (!isNonEmptyString(value) || !isSafeForOutput(value)) {
    return DEFAULT_TARGET_PATH;
  }

  const normalized = value.trim();
  if (
    normalized.startsWith('/')
    || normalized.startsWith('\\')
    || FORBIDDEN_TARGET_PATTERNS.some((pattern) => pattern.test(normalized))
  ) {
    return DEFAULT_TARGET_PATH;
  }

  return normalized;
}

function cloneJsonValue<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function getSourcePacketSha256(
  options: MakeTaskBoardHandoffWritePlanDraftOptions,
): string | null {
  const dryRunAudit = asRecord(options.dryRunResult?.audit_log_entry);
  const approvalDryRunAudit = asRecord(
    options.approvalRequestDraft?.source_dry_run_result.audit_log_entry,
  );
  const sourcePacketSha256 =
    dryRunAudit?.source_packet_sha256
      ?? approvalDryRunAudit?.source_packet_sha256;

  return isNonEmptyString(sourcePacketSha256)
    && isSafeForOutput(sourcePacketSha256)
    ? sourcePacketSha256.trim()
    : null;
}

function getTargetKind(
  options: MakeTaskBoardHandoffWritePlanDraftOptions,
): string {
  return safeStringForOutput(
    options.approvalRequestDraft?.target_kind
      ?? options.dryRunResult?.target_kind,
    DEFAULT_TARGET_KIND,
  );
}

function getTargetPathOrTargetId(
  options: MakeTaskBoardHandoffWritePlanDraftOptions,
): string {
  return safeTargetForOutput(
    options.approvalRequestDraft?.target_path_or_target_id
      ?? options.dryRunResult?.target_path_or_target_id,
  );
}

function getPlanStatus(
  approvalDecisionValidation:
    TaskBoardHandoffWriteApprovalDecisionValidationResult,
): TaskBoardHandoffWritePlanStatus {
  if (approvalDecisionValidation.status === 'needs_human_decision') {
    return 'needs_human_decision';
  }

  if (
    approvalDecisionValidation.status === 'decision_validated'
    && approvalDecisionValidation.decision === 'approved'
    && approvalDecisionValidation.decision_accepted === true
    && approvalDecisionValidation.approval_valid_for_future_write === true
  ) {
    return 'write_plan_ready_for_separate_implementation';
  }

  return 'blocked';
}

function getRequiredNextAction(
  approvalDecisionValidation:
    TaskBoardHandoffWriteApprovalDecisionValidationResult,
  planStatus: TaskBoardHandoffWritePlanStatus,
): TaskBoardHandoffWritePlanRequiredNextAction {
  if (planStatus === 'write_plan_ready_for_separate_implementation') {
    return 'separate_write_implementation_required';
  }

  if (
    approvalDecisionValidation.decision_accepted === true
    && (
      approvalDecisionValidation.decision === 'rejected'
      || approvalDecisionValidation.decision === 'needs_revision'
    )
  ) {
    return 'revise_or_reject_request';
  }

  if (planStatus === 'needs_human_decision') {
    return 'human_decision_required';
  }

  return 'resolve_blockers_then_restart_approval';
}

function getAllowedNextStep(
  requiredNextAction: TaskBoardHandoffWritePlanRequiredNextAction,
): TaskBoardHandoffWritePlanAllowedNextStep {
  if (requiredNextAction === 'separate_write_implementation_required') {
    return 'separate_write_implementation_required';
  }

  if (requiredNextAction === 'revise_or_reject_request') {
    return 'revise_or_reject_request';
  }

  return 'human_review_only';
}

function makeValidationNotes(
  approvalDecisionValidation:
    TaskBoardHandoffWriteApprovalDecisionValidationResult,
  planStatus: TaskBoardHandoffWritePlanStatus,
): string[] {
  const notes = [
    `source_status:${approvalDecisionValidation.status}`,
    `source_decision:${approvalDecisionValidation.decision}`,
    `source_decision_accepted:${String(approvalDecisionValidation.decision_accepted)}`,
    `source_approval_valid_for_future_write:${String(approvalDecisionValidation.approval_valid_for_future_write)}`,
    `plan_status:${planStatus}`,
    'write_authorized_by_this_pr:false',
    'wrote_anything:false',
    'write_executor_present:false',
    'executed_write_count:0',
  ];

  if (approvalDecisionValidation.validation.issues.length > 0) {
    notes.push(
      ...approvalDecisionValidation.validation.issues.map(
        (issue) => `source_issue:${issue.code}`,
      ),
    );
  }

  return notes;
}

function makeProposedWriteArtifacts(params: {
  approvalDecisionValidation:
    TaskBoardHandoffWriteApprovalDecisionValidationResult;
  planStatus: TaskBoardHandoffWritePlanStatus;
  targetKind: string;
  targetPathOrTargetId: string;
  sourcePacketSha256: string | null;
}): TaskBoardHandoffWritePlanArtifactMetadata[] {
  return [
    {
      artifact_kind: params.targetKind,
      target_path_or_target_id: params.targetPathOrTargetId,
      intended_operation:
        'future_write_after_explicit_human_approval_in_separate_scope',
      source_packet_sha256: params.sourcePacketSha256,
      source_reference:
        params.approvalDecisionValidation.approval_decision_validation_id,
      preview_summary:
        'Metadata-only future write artifact plan; no future file contents are included.',
      validation_notes: makeValidationNotes(
        params.approvalDecisionValidation,
        params.planStatus,
      ),
      metadata_only: true,
      includes_full_future_file_contents: false,
    },
  ];
}

function makeAuditPreview(params: {
  approvalDecisionValidation:
    TaskBoardHandoffWriteApprovalDecisionValidationResult;
  writePlanId: string;
  planStatus: TaskBoardHandoffWritePlanStatus;
  requiredNextAction: TaskBoardHandoffWritePlanRequiredNextAction;
  allowedNextStep: TaskBoardHandoffWritePlanAllowedNextStep;
  targetKind: string;
  targetPathOrTargetId: string;
}): Record<string, unknown> {
  return {
    write_plan_actor: 'codex_app_server_runtime_write_plan_draft',
    write_plan_id: params.writePlanId,
    source_approval_request_id:
      params.approvalDecisionValidation.source_approval_request_id,
    source_approval_decision_validation_id:
      params.approvalDecisionValidation.approval_decision_validation_id,
    plan_status: params.planStatus,
    target_kind: params.targetKind,
    target_path_or_target_id: params.targetPathOrTargetId,
    proposed_write_mode: PROPOSED_WRITE_MODE,
    write_authorized_by_this_pr: false,
    wrote_anything: false,
    write_executor_present: false,
    executed_write_count: 0,
    required_human_approval: true,
    required_next_action: params.requiredNextAction,
    allowed_next_step: params.allowedNextStep,
  };
}

function makeRollbackPlan(
  approvalDecisionValidation:
    TaskBoardHandoffWriteApprovalDecisionValidationResult,
): string[] {
  return Array.from(new Set([
    'No rollback required because no write has occurred.',
    ...approvalDecisionValidation.rollback_plan,
  ]));
}

function makeReferences(
  approvalDecisionValidation:
    TaskBoardHandoffWriteApprovalDecisionValidationResult,
  options: MakeTaskBoardHandoffWritePlanDraftOptions,
): string[] {
  return Array.from(new Set([
    ...approvalDecisionValidation.references,
    ...(options.approvalRequestDraft?.references ?? []),
    ...(options.dryRunResult?.references ?? []),
    ...REFERENCES,
  ]));
}

function makeSafetySummary(params: {
  planStatus: TaskBoardHandoffWritePlanStatus;
  requiredNextAction: TaskBoardHandoffWritePlanRequiredNextAction;
}): string[] {
  const invariantSummary = [
    'Write plan draft is stdout-only metadata for a future separate implementation scope.',
    'No approval is granted by this PR.',
    'This PR does not authorize writes; write_authorized_by_this_pr remains false.',
    'No write occurred; wrote_anything remains false.',
    'No write executor is present; write_executor_present remains false.',
    'No write executions occurred; executed_write_count remains 0.',
    'Task Board write, HANDOFF file creation, and file-writing automation remain forbidden.',
  ];

  if (params.planStatus === 'needs_human_decision') {
    return [
      'A human approval decision record is still required before any separate write implementation can be considered.',
      ...invariantSummary,
    ];
  }

  if (params.requiredNextAction === 'revise_or_reject_request') {
    return [
      'The source decision requires revision or rejection handling; no write plan may proceed.',
      ...invariantSummary,
    ];
  }

  if (params.planStatus === 'write_plan_ready_for_separate_implementation') {
    return [
      'The source approval decision validated, but actual write behavior still requires separate implementation scope and explicit human approval.',
      ...invariantSummary,
    ];
  }

  return [
    'The source approval decision validation is blocked; no future write may be considered from this result.',
    ...invariantSummary,
  ];
}

export function makeTaskBoardHandoffWritePlanDraft(
  approvalDecisionValidation:
    TaskBoardHandoffWriteApprovalDecisionValidationResult,
  options: MakeTaskBoardHandoffWritePlanDraftOptions = {},
): TaskBoardHandoffWritePlanDraft {
  const writePlanId = options.writePlanId ?? DEFAULT_WRITE_PLAN_ID;
  const planStatus = getPlanStatus(approvalDecisionValidation);
  const requiredNextAction = getRequiredNextAction(
    approvalDecisionValidation,
    planStatus,
  );
  const allowedNextStep = getAllowedNextStep(requiredNextAction);
  const targetKind = getTargetKind(options);
  const targetPathOrTargetId = getTargetPathOrTargetId(options);
  const proposedWriteArtifacts = makeProposedWriteArtifacts({
    approvalDecisionValidation,
    planStatus,
    targetKind,
    targetPathOrTargetId,
    sourcePacketSha256: getSourcePacketSha256(options),
  });
  const sourceSafetyInvariantsPreserved = (
    approvalDecisionValidation.write_authorized_by_this_pr === false
    && approvalDecisionValidation.wrote_anything === false
    && approvalDecisionValidation.required_human_approval === true
  );
  const draft: TaskBoardHandoffWritePlanDraft = {
    write_plan_id: writePlanId,
    write_plan_version: 1,
    generated_at: toIsoTimestamp(options.generatedAt),
    source_approval_request_id:
      approvalDecisionValidation.source_approval_request_id,
    source_approval_decision_validation_id:
      approvalDecisionValidation.approval_decision_validation_id,
    source_approval_decision_validation_status:
      approvalDecisionValidation.status,
    source_decision: approvalDecisionValidation.decision,
    source_decision_accepted: approvalDecisionValidation.decision_accepted,
    source_approval_valid_for_future_write:
      approvalDecisionValidation.approval_valid_for_future_write,
    plan_status: planStatus,
    target_kind: targetKind,
    target_path_or_target_id: targetPathOrTargetId,
    proposed_write_mode: PROPOSED_WRITE_MODE,
    write_authorized_by_this_pr: false,
    wrote_anything: false,
    write_executor_present: false,
    executed_write_count: 0,
    required_human_approval: true,
    required_next_action: requiredNextAction,
    allowed_next_step: allowedNextStep,
    validation_summary: {
      source_validation_passed:
        approvalDecisionValidation.validation.passed,
      source_validation_issues:
        cloneJsonValue(approvalDecisionValidation.validation.issues),
      source_safety_invariants_preserved: sourceSafetyInvariantsPreserved,
      plan_blocks_actual_write: true,
    },
    proposed_write_artifacts: proposedWriteArtifacts,
    audit_preview: makeAuditPreview({
      approvalDecisionValidation,
      writePlanId,
      planStatus,
      requiredNextAction,
      allowedNextStep,
      targetKind,
      targetPathOrTargetId,
    }),
    rollback_plan: makeRollbackPlan(approvalDecisionValidation),
    forbidden_operations: [...FORBIDDEN_OPERATIONS],
    references: makeReferences(approvalDecisionValidation, options),
    safety_summary: makeSafetySummary({
      planStatus,
      requiredNextAction,
    }),
  };

  assertNoRestrictedContent(draft, 'taskBoardHandoffWritePlanDraft');

  return draft;
}

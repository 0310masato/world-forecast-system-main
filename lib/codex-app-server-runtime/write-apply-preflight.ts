import { assertNoRestrictedContent } from '../memory/validation';
import type {
  TaskBoardHandoffWritePlanDraft,
  TaskBoardHandoffWritePlanStatus,
} from './write-plan';

export type TaskBoardHandoffWriteApplyPreflightStatus =
  | 'needs_human_decision'
  | 'blocked'
  | 'apply_preflight_ready_for_separate_executor_implementation';

export type TaskBoardHandoffWriteApplyPreflightRequiredNextAction =
  | 'human_review_only'
  | 'human_decision_required'
  | 'revise_or_reject_request'
  | 'resolve_blockers_then_restart_approval'
  | 'separate_write_executor_implementation_required';

export type TaskBoardHandoffWriteApplyPreflightAllowedNextStep =
  | 'human_review_only'
  | 'revise_or_reject_request'
  | 'separate_write_executor_implementation_required';

export interface TaskBoardHandoffWriteApplyPreflightArtifactMetadata {
  artifact_kind: string;
  target_path_or_target_id: string;
  intended_operation:
    'future_apply_after_separate_executor_implementation_and_explicit_human_approval';
  source_write_plan_id: string;
  source_reference: string;
  preview_summary: string;
  validation_notes: string[];
  metadata_only: true;
  includes_full_future_file_contents: false;
}

export interface TaskBoardHandoffWriteApplyPreflightResult {
  apply_preflight_id: string;
  apply_preflight_version: 1;
  generated_at: string;
  source_write_plan_id: string;
  source_write_plan_version: 1;
  source_write_plan_status: TaskBoardHandoffWritePlanStatus;
  source_approval_request_id: string;
  source_approval_decision_validation_id: string;
  source_decision: TaskBoardHandoffWritePlanDraft['source_decision'];
  source_decision_accepted: boolean;
  source_approval_valid_for_future_write: boolean;
  preflight_status: TaskBoardHandoffWriteApplyPreflightStatus;
  target_kind: string;
  target_path_or_target_id: string;
  proposed_apply_mode:
    'apply_after_separate_executor_implementation_and_explicit_human_approval';
  write_authorized_by_this_pr: false;
  apply_authorized_by_this_pr: false;
  wrote_anything: false;
  write_executor_present: false;
  apply_executor_present: false;
  executed_write_count: 0;
  required_human_approval: true;
  required_next_action: TaskBoardHandoffWriteApplyPreflightRequiredNextAction;
  allowed_next_step: TaskBoardHandoffWriteApplyPreflightAllowedNextStep;
  validation_summary: {
    source_plan_status: TaskBoardHandoffWritePlanStatus;
    source_plan_safety_invariants_preserved: boolean;
    source_plan_metadata_only: boolean;
    source_plan_allowed_next_step_safe: boolean;
    source_plan_validation_summary: TaskBoardHandoffWritePlanDraft['validation_summary'];
    preflight_blocks_actual_write: true;
  };
  proposed_apply_artifacts:
    TaskBoardHandoffWriteApplyPreflightArtifactMetadata[];
  audit_preview: Record<string, unknown>;
  rollback_plan: string[];
  forbidden_operations: string[];
  references: string[];
  safety_summary: string[];
}

export interface MakeTaskBoardHandoffWriteApplyPreflightOptions {
  applyPreflightId?: string;
  generatedAt?: number;
}

const DEFAULT_APPLY_PREFLIGHT_ID =
  'codex-app-server-runtime-write-apply-preflight-001';
const PROPOSED_APPLY_MODE =
  'apply_after_separate_executor_implementation_and_explicit_human_approval' as const;
const DEFAULT_TARGET_KIND = 'repository_artifact';
const DEFAULT_TARGET_PATH =
  'target_unavailable_until_write_plan_metadata';
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
  'lib/codex-app-server-runtime/write-apply-preflight.ts',
  'scripts/codex-app-server-runtime-write-dry-run.mjs',
  'scripts/codex-app-server-runtime-write-approval-request.mjs',
  'scripts/codex-app-server-runtime-write-approval-decision-validator.mjs',
  'scripts/codex-app-server-runtime-write-plan.mjs',
  'scripts/codex-app-server-runtime-write-apply-preflight.mjs',
] as const;

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
    assertNoRestrictedContent(value, 'taskBoardHandoffWriteApplyPreflight');
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

function isSourcePlanMetadataOnly(
  writePlan: TaskBoardHandoffWritePlanDraft,
): boolean {
  return (
    Array.isArray(writePlan.proposed_write_artifacts)
    && writePlan.proposed_write_artifacts.length > 0
    && writePlan.proposed_write_artifacts.every((artifact) => (
      artifact.metadata_only === true
      && artifact.includes_full_future_file_contents === false
    ))
  );
}

function areSourcePlanSafetyInvariantsPreserved(
  writePlan: TaskBoardHandoffWritePlanDraft,
): boolean {
  return (
    writePlan.write_authorized_by_this_pr === false
    && writePlan.wrote_anything === false
    && writePlan.write_executor_present === false
    && writePlan.executed_write_count === 0
    && writePlan.required_human_approval === true
  );
}

function getPreflightStatus(
  writePlan: TaskBoardHandoffWritePlanDraft,
): TaskBoardHandoffWriteApplyPreflightStatus {
  if (writePlan.plan_status === 'needs_human_decision') {
    return 'needs_human_decision';
  }

  if (
    writePlan.plan_status === 'write_plan_ready_for_separate_implementation'
    && writePlan.source_decision === 'approved'
    && writePlan.source_decision_accepted === true
    && writePlan.source_approval_valid_for_future_write === true
    && areSourcePlanSafetyInvariantsPreserved(writePlan)
    && isSourcePlanMetadataOnly(writePlan)
    && String(writePlan.allowed_next_step) !== 'actual_write'
  ) {
    return 'apply_preflight_ready_for_separate_executor_implementation';
  }

  return 'blocked';
}

function getRequiredNextAction(
  writePlan: TaskBoardHandoffWritePlanDraft,
  preflightStatus: TaskBoardHandoffWriteApplyPreflightStatus,
): TaskBoardHandoffWriteApplyPreflightRequiredNextAction {
  if (
    preflightStatus
      === 'apply_preflight_ready_for_separate_executor_implementation'
  ) {
    return 'separate_write_executor_implementation_required';
  }

  if (writePlan.required_next_action === 'revise_or_reject_request') {
    return 'revise_or_reject_request';
  }

  if (preflightStatus === 'needs_human_decision') {
    return 'human_decision_required';
  }

  if (writePlan.required_next_action === 'human_decision_required') {
    return 'human_decision_required';
  }

  return 'resolve_blockers_then_restart_approval';
}

function getAllowedNextStep(
  requiredNextAction: TaskBoardHandoffWriteApplyPreflightRequiredNextAction,
): TaskBoardHandoffWriteApplyPreflightAllowedNextStep {
  if (
    requiredNextAction
      === 'separate_write_executor_implementation_required'
  ) {
    return 'separate_write_executor_implementation_required';
  }

  if (requiredNextAction === 'revise_or_reject_request') {
    return 'revise_or_reject_request';
  }

  return 'human_review_only';
}

function makeValidationNotes(params: {
  writePlan: TaskBoardHandoffWritePlanDraft;
  preflightStatus: TaskBoardHandoffWriteApplyPreflightStatus;
  sourcePlanSafetyInvariantsPreserved: boolean;
  sourcePlanMetadataOnly: boolean;
  sourcePlanAllowedNextStepSafe: boolean;
}): string[] {
  return [
    `source_write_plan_status:${params.writePlan.plan_status}`,
    `source_decision:${params.writePlan.source_decision}`,
    `source_decision_accepted:${String(params.writePlan.source_decision_accepted)}`,
    `source_approval_valid_for_future_write:${String(params.writePlan.source_approval_valid_for_future_write)}`,
    `preflight_status:${params.preflightStatus}`,
    `source_plan_safety_invariants_preserved:${String(params.sourcePlanSafetyInvariantsPreserved)}`,
    `source_plan_metadata_only:${String(params.sourcePlanMetadataOnly)}`,
    `source_plan_allowed_next_step_safe:${String(params.sourcePlanAllowedNextStepSafe)}`,
    'write_authorized_by_this_pr:false',
    'apply_authorized_by_this_pr:false',
    'wrote_anything:false',
    'write_executor_present:false',
    'apply_executor_present:false',
    'executed_write_count:0',
  ];
}

function makeProposedApplyArtifacts(params: {
  writePlan: TaskBoardHandoffWritePlanDraft;
  preflightStatus: TaskBoardHandoffWriteApplyPreflightStatus;
  targetKind: string;
  targetPathOrTargetId: string;
  sourcePlanSafetyInvariantsPreserved: boolean;
  sourcePlanMetadataOnly: boolean;
  sourcePlanAllowedNextStepSafe: boolean;
}): TaskBoardHandoffWriteApplyPreflightArtifactMetadata[] {
  return [
    {
      artifact_kind: params.targetKind,
      target_path_or_target_id: params.targetPathOrTargetId,
      intended_operation:
        'future_apply_after_separate_executor_implementation_and_explicit_human_approval',
      source_write_plan_id: params.writePlan.write_plan_id,
      source_reference: params.writePlan.write_plan_id,
      preview_summary:
        'Metadata-only apply preflight for a future separate executor implementation; no file contents are included.',
      validation_notes: makeValidationNotes({
        writePlan: params.writePlan,
        preflightStatus: params.preflightStatus,
        sourcePlanSafetyInvariantsPreserved:
          params.sourcePlanSafetyInvariantsPreserved,
        sourcePlanMetadataOnly: params.sourcePlanMetadataOnly,
        sourcePlanAllowedNextStepSafe:
          params.sourcePlanAllowedNextStepSafe,
      }),
      metadata_only: true,
      includes_full_future_file_contents: false,
    },
  ];
}

function makeAuditPreview(params: {
  writePlan: TaskBoardHandoffWritePlanDraft;
  applyPreflightId: string;
  preflightStatus: TaskBoardHandoffWriteApplyPreflightStatus;
  requiredNextAction:
    TaskBoardHandoffWriteApplyPreflightRequiredNextAction;
  allowedNextStep: TaskBoardHandoffWriteApplyPreflightAllowedNextStep;
  targetKind: string;
  targetPathOrTargetId: string;
}): Record<string, unknown> {
  return {
    apply_preflight_actor:
      'codex_app_server_runtime_write_apply_preflight',
    apply_preflight_id: params.applyPreflightId,
    source_write_plan_id: params.writePlan.write_plan_id,
    source_write_plan_status: params.writePlan.plan_status,
    source_approval_request_id: params.writePlan.source_approval_request_id,
    source_approval_decision_validation_id:
      params.writePlan.source_approval_decision_validation_id,
    preflight_status: params.preflightStatus,
    target_kind: params.targetKind,
    target_path_or_target_id: params.targetPathOrTargetId,
    proposed_apply_mode: PROPOSED_APPLY_MODE,
    write_authorized_by_this_pr: false,
    apply_authorized_by_this_pr: false,
    wrote_anything: false,
    write_executor_present: false,
    apply_executor_present: false,
    executed_write_count: 0,
    required_human_approval: true,
    required_next_action: params.requiredNextAction,
    allowed_next_step: params.allowedNextStep,
  };
}

function makeRollbackPlan(
  writePlan: TaskBoardHandoffWritePlanDraft,
): string[] {
  return Array.from(new Set([
    'No rollback required because no apply or write has occurred.',
    ...writePlan.rollback_plan,
  ]));
}

function makeReferences(
  writePlan: TaskBoardHandoffWritePlanDraft,
): string[] {
  return Array.from(new Set([
    ...writePlan.references,
    ...REFERENCES,
  ]));
}

function makeSafetySummary(params: {
  preflightStatus: TaskBoardHandoffWriteApplyPreflightStatus;
  requiredNextAction:
    TaskBoardHandoffWriteApplyPreflightRequiredNextAction;
}): string[] {
  const invariantSummary = [
    'Apply preflight result is stdout-only metadata for a future separate executor implementation scope.',
    'No approval is granted by this PR.',
    'This PR does not authorize writes or apply; write_authorized_by_this_pr and apply_authorized_by_this_pr remain false.',
    'No write or apply occurred; wrote_anything remains false.',
    'No write executor is present; write_executor_present remains false.',
    'No apply executor is present; apply_executor_present remains false.',
    'No write executions occurred; executed_write_count remains 0.',
    'Task Board write, HANDOFF file creation, and file-writing automation remain forbidden.',
  ];

  if (params.preflightStatus === 'needs_human_decision') {
    return [
      'A human approval decision record is still required before any separate executor implementation can be considered.',
      ...invariantSummary,
    ];
  }

  if (params.requiredNextAction === 'revise_or_reject_request') {
    return [
      'The source path requires revision or rejection handling; no apply preflight may proceed.',
      ...invariantSummary,
    ];
  }

  if (
    params.preflightStatus
      === 'apply_preflight_ready_for_separate_executor_implementation'
  ) {
    return [
      'The source write plan is ready only as material for a separate executor implementation; actual write behavior still requires explicit human approval.',
      ...invariantSummary,
    ];
  }

  return [
    'The source write plan is blocked; no future executor implementation may be considered from this result until blockers are resolved.',
    ...invariantSummary,
  ];
}

export function makeTaskBoardHandoffWriteApplyPreflight(
  writePlan: TaskBoardHandoffWritePlanDraft,
  options: MakeTaskBoardHandoffWriteApplyPreflightOptions = {},
): TaskBoardHandoffWriteApplyPreflightResult {
  const applyPreflightId =
    options.applyPreflightId ?? DEFAULT_APPLY_PREFLIGHT_ID;
  const preflightStatus = getPreflightStatus(writePlan);
  const requiredNextAction = getRequiredNextAction(
    writePlan,
    preflightStatus,
  );
  const allowedNextStep = getAllowedNextStep(requiredNextAction);
  const targetKind = safeStringForOutput(
    writePlan.target_kind,
    DEFAULT_TARGET_KIND,
  );
  const targetPathOrTargetId = safeTargetForOutput(
    writePlan.target_path_or_target_id,
  );
  const sourcePlanSafetyInvariantsPreserved =
    areSourcePlanSafetyInvariantsPreserved(writePlan);
  const sourcePlanMetadataOnly = isSourcePlanMetadataOnly(writePlan);
  const sourcePlanAllowedNextStepSafe =
    String(writePlan.allowed_next_step) !== 'actual_write';
  const result: TaskBoardHandoffWriteApplyPreflightResult = {
    apply_preflight_id: applyPreflightId,
    apply_preflight_version: 1,
    generated_at: toIsoTimestamp(options.generatedAt),
    source_write_plan_id: safeStringForOutput(
      writePlan.write_plan_id,
      'source_write_plan_id_unavailable',
    ),
    source_write_plan_version: writePlan.write_plan_version,
    source_write_plan_status: writePlan.plan_status,
    source_approval_request_id: writePlan.source_approval_request_id,
    source_approval_decision_validation_id:
      writePlan.source_approval_decision_validation_id,
    source_decision: writePlan.source_decision,
    source_decision_accepted: writePlan.source_decision_accepted,
    source_approval_valid_for_future_write:
      writePlan.source_approval_valid_for_future_write,
    preflight_status: preflightStatus,
    target_kind: targetKind,
    target_path_or_target_id: targetPathOrTargetId,
    proposed_apply_mode: PROPOSED_APPLY_MODE,
    write_authorized_by_this_pr: false,
    apply_authorized_by_this_pr: false,
    wrote_anything: false,
    write_executor_present: false,
    apply_executor_present: false,
    executed_write_count: 0,
    required_human_approval: true,
    required_next_action: requiredNextAction,
    allowed_next_step: allowedNextStep,
    validation_summary: {
      source_plan_status: writePlan.plan_status,
      source_plan_safety_invariants_preserved:
        sourcePlanSafetyInvariantsPreserved,
      source_plan_metadata_only: sourcePlanMetadataOnly,
      source_plan_allowed_next_step_safe: sourcePlanAllowedNextStepSafe,
      source_plan_validation_summary:
        cloneJsonValue(writePlan.validation_summary),
      preflight_blocks_actual_write: true,
    },
    proposed_apply_artifacts: makeProposedApplyArtifacts({
      writePlan,
      preflightStatus,
      targetKind,
      targetPathOrTargetId,
      sourcePlanSafetyInvariantsPreserved,
      sourcePlanMetadataOnly,
      sourcePlanAllowedNextStepSafe,
    }),
    audit_preview: makeAuditPreview({
      writePlan,
      applyPreflightId,
      preflightStatus,
      requiredNextAction,
      allowedNextStep,
      targetKind,
      targetPathOrTargetId,
    }),
    rollback_plan: makeRollbackPlan(writePlan),
    forbidden_operations: [...FORBIDDEN_OPERATIONS],
    references: makeReferences(writePlan),
    safety_summary: makeSafetySummary({
      preflightStatus,
      requiredNextAction,
    }),
  };

  assertNoRestrictedContent(
    result,
    'taskBoardHandoffWriteApplyPreflightResult',
  );

  return result;
}

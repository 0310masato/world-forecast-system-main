import { assertNoRestrictedContent } from '../memory/validation';
import type {
  TaskBoardHandoffWriteApplyPreflightResult,
  TaskBoardHandoffWriteApplyPreflightStatus,
} from './write-apply-preflight';

export type TaskBoardHandoffWriteExecutorContractStatus =
  | 'needs_human_decision'
  | 'blocked'
  | 'executor_contract_ready_for_separate_implementation';

export type TaskBoardHandoffWriteExecutorContractRequiredNextAction =
  | 'human_review_only'
  | 'human_decision_required'
  | 'revise_or_reject_request'
  | 'resolve_blockers_then_restart_approval'
  | 'separate_write_executor_implementation_required';

export type TaskBoardHandoffWriteExecutorContractAllowedNextStep =
  | 'human_review_only'
  | 'revise_or_reject_request'
  | 'separate_write_executor_implementation_required';

export interface TaskBoardHandoffWriteExecutorContractMetadata {
  executor_contract_kind: string;
  target_kind: string;
  target_path_or_target_id: string;
  required_source_artifacts: string[];
  required_approval_preflight_gates: string[];
  intended_future_operation_name:
    'task_board_handoff_write_after_separate_executor_implementation_and_explicit_human_approval';
  proposed_executor_responsibilities: string[];
  forbidden_operations: string[];
  rollback_requirement_summary: string;
  disable_kill_switch_requirement_summary: string;
  validation_notes: string[];
  metadata_only: true;
  includes_executable_write_logic: false;
  includes_filesystem_write_code: false;
  includes_api_route_code: false;
  includes_db_code: false;
  includes_worker_scheduler_code: false;
}

export interface TaskBoardHandoffWriteExecutorContractDraft {
  executor_contract_id: string;
  executor_contract_version: 1;
  generated_at: string;
  source_apply_preflight_id: string;
  source_apply_preflight_version: 1;
  source_apply_preflight_status: TaskBoardHandoffWriteApplyPreflightStatus;
  source_write_plan_id: string;
  source_approval_request_id: string;
  source_approval_decision_validation_id: string;
  source_decision: TaskBoardHandoffWriteApplyPreflightResult['source_decision'];
  source_decision_accepted: boolean;
  source_approval_valid_for_future_write: boolean;
  contract_status: TaskBoardHandoffWriteExecutorContractStatus;
  target_kind: string;
  target_path_or_target_id: string;
  proposed_executor_mode:
    'separate_write_executor_implementation_after_explicit_human_approval';
  write_authorized_by_this_pr: false;
  apply_authorized_by_this_pr: false;
  executor_implemented_by_this_pr: false;
  wrote_anything: false;
  write_executor_present: false;
  apply_executor_present: false;
  executed_write_count: 0;
  required_human_approval: true;
  required_next_action:
    TaskBoardHandoffWriteExecutorContractRequiredNextAction;
  allowed_next_step: TaskBoardHandoffWriteExecutorContractAllowedNextStep;
  validation_summary: {
    source_apply_preflight_status: TaskBoardHandoffWriteApplyPreflightStatus;
    source_apply_preflight_safety_invariants_preserved: boolean;
    source_apply_preflight_metadata_only: boolean;
    source_apply_preflight_allowed_next_step_safe: boolean;
    source_apply_preflight_validation_summary:
      TaskBoardHandoffWriteApplyPreflightResult['validation_summary'];
    executor_contract_blocks_actual_write: true;
    executor_not_implemented_by_this_pr: true;
  };
  proposed_executor_contract: TaskBoardHandoffWriteExecutorContractMetadata;
  audit_preview: Record<string, unknown>;
  rollback_plan: string[];
  forbidden_operations: string[];
  references: string[];
  safety_summary: string[];
}

export interface MakeTaskBoardHandoffWriteExecutorContractOptions {
  executorContractId?: string;
  generatedAt?: number;
}

const DEFAULT_EXECUTOR_CONTRACT_ID =
  'codex-app-server-runtime-write-executor-contract-001';
const PROPOSED_EXECUTOR_MODE =
  'separate_write_executor_implementation_after_explicit_human_approval' as const;
const DEFAULT_TARGET_KIND = 'repository_artifact';
const DEFAULT_TARGET_PATH =
  'target_unavailable_until_apply_preflight_metadata';
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
  'actual_write',
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
  'file_writing_automation',
  'file_writing_automation_without_approval',
  'handoff_file_creation',
  'handoff_file_creation_without_approval',
  'task_board_write',
  'task_board_write_without_approval',
  'write_executor_implementation_by_this_pr',
  'apply_executor_implementation_by_this_pr',
  'executable_write_logic',
  'filesystem_write_code',
  'api_route_code',
  'db_code',
  'worker_scheduler_code',
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
  'lib/codex-app-server-runtime/write-executor-contract.ts',
  'scripts/codex-app-server-runtime-write-dry-run.mjs',
  'scripts/codex-app-server-runtime-write-approval-request.mjs',
  'scripts/codex-app-server-runtime-write-approval-decision-validator.mjs',
  'scripts/codex-app-server-runtime-write-plan.mjs',
  'scripts/codex-app-server-runtime-write-apply-preflight.mjs',
  'scripts/codex-app-server-runtime-write-executor-contract.mjs',
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
    assertNoRestrictedContent(value, 'taskBoardHandoffWriteExecutorContract');
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

function isSourceApplyPreflightMetadataOnly(
  applyPreflight: TaskBoardHandoffWriteApplyPreflightResult,
): boolean {
  return (
    Array.isArray(applyPreflight.proposed_apply_artifacts)
    && applyPreflight.proposed_apply_artifacts.length > 0
    && applyPreflight.proposed_apply_artifacts.every((artifact) => (
      artifact.metadata_only === true
      && artifact.includes_full_future_file_contents === false
    ))
  );
}

function areSourceApplyPreflightSafetyInvariantsPreserved(
  applyPreflight: TaskBoardHandoffWriteApplyPreflightResult,
): boolean {
  return (
    applyPreflight.write_authorized_by_this_pr === false
    && applyPreflight.apply_authorized_by_this_pr === false
    && applyPreflight.wrote_anything === false
    && applyPreflight.write_executor_present === false
    && applyPreflight.apply_executor_present === false
    && applyPreflight.executed_write_count === 0
    && applyPreflight.required_human_approval === true
  );
}

function getExecutorContractStatus(
  applyPreflight: TaskBoardHandoffWriteApplyPreflightResult,
): TaskBoardHandoffWriteExecutorContractStatus {
  if (applyPreflight.preflight_status === 'needs_human_decision') {
    return 'needs_human_decision';
  }

  if (
    applyPreflight.preflight_status
      === 'apply_preflight_ready_for_separate_executor_implementation'
    && applyPreflight.source_decision === 'approved'
    && applyPreflight.source_decision_accepted === true
    && applyPreflight.source_approval_valid_for_future_write === true
    && areSourceApplyPreflightSafetyInvariantsPreserved(applyPreflight)
    && isSourceApplyPreflightMetadataOnly(applyPreflight)
    && String(applyPreflight.allowed_next_step) !== 'actual_write'
  ) {
    return 'executor_contract_ready_for_separate_implementation';
  }

  return 'blocked';
}

function getRequiredNextAction(
  applyPreflight: TaskBoardHandoffWriteApplyPreflightResult,
  contractStatus: TaskBoardHandoffWriteExecutorContractStatus,
): TaskBoardHandoffWriteExecutorContractRequiredNextAction {
  if (
    contractStatus === 'executor_contract_ready_for_separate_implementation'
  ) {
    return 'separate_write_executor_implementation_required';
  }

  if (applyPreflight.required_next_action === 'revise_or_reject_request') {
    return 'revise_or_reject_request';
  }

  if (contractStatus === 'needs_human_decision') {
    return 'human_decision_required';
  }

  if (applyPreflight.required_next_action === 'human_decision_required') {
    return 'human_decision_required';
  }

  if (applyPreflight.required_next_action === 'human_review_only') {
    return 'human_review_only';
  }

  return 'resolve_blockers_then_restart_approval';
}

function getAllowedNextStep(
  requiredNextAction: TaskBoardHandoffWriteExecutorContractRequiredNextAction,
): TaskBoardHandoffWriteExecutorContractAllowedNextStep {
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
  applyPreflight: TaskBoardHandoffWriteApplyPreflightResult;
  contractStatus: TaskBoardHandoffWriteExecutorContractStatus;
  sourceApplyPreflightSafetyInvariantsPreserved: boolean;
  sourceApplyPreflightMetadataOnly: boolean;
  sourceApplyPreflightAllowedNextStepSafe: boolean;
}): string[] {
  return [
    `source_apply_preflight_status:${params.applyPreflight.preflight_status}`,
    `source_decision:${params.applyPreflight.source_decision}`,
    `source_decision_accepted:${String(params.applyPreflight.source_decision_accepted)}`,
    `source_approval_valid_for_future_write:${String(params.applyPreflight.source_approval_valid_for_future_write)}`,
    `contract_status:${params.contractStatus}`,
    `source_apply_preflight_safety_invariants_preserved:${String(params.sourceApplyPreflightSafetyInvariantsPreserved)}`,
    `source_apply_preflight_metadata_only:${String(params.sourceApplyPreflightMetadataOnly)}`,
    `source_apply_preflight_allowed_next_step_safe:${String(params.sourceApplyPreflightAllowedNextStepSafe)}`,
    'write_authorized_by_this_pr:false',
    'apply_authorized_by_this_pr:false',
    'executor_implemented_by_this_pr:false',
    'wrote_anything:false',
    'write_executor_present:false',
    'apply_executor_present:false',
    'executed_write_count:0',
  ];
}

function makeProposedExecutorContract(params: {
  applyPreflight: TaskBoardHandoffWriteApplyPreflightResult;
  contractStatus: TaskBoardHandoffWriteExecutorContractStatus;
  targetKind: string;
  targetPathOrTargetId: string;
  sourceApplyPreflightSafetyInvariantsPreserved: boolean;
  sourceApplyPreflightMetadataOnly: boolean;
  sourceApplyPreflightAllowedNextStepSafe: boolean;
}): TaskBoardHandoffWriteExecutorContractMetadata {
  return {
    executor_contract_kind:
      'task_board_handoff_write_executor_contract_draft',
    target_kind: params.targetKind,
    target_path_or_target_id: params.targetPathOrTargetId,
    required_source_artifacts: [
      params.applyPreflight.apply_preflight_id,
      params.applyPreflight.source_write_plan_id,
      params.applyPreflight.source_approval_request_id,
      params.applyPreflight.source_approval_decision_validation_id,
    ],
    required_approval_preflight_gates: [
      'explicit_human_approval_record_required',
      'approval_decision_validation_required',
      'metadata_only_write_plan_required',
      'metadata_only_apply_preflight_required',
      'separate_executor_implementation_scope_required',
    ],
    intended_future_operation_name:
      'task_board_handoff_write_after_separate_executor_implementation_and_explicit_human_approval',
    proposed_executor_responsibilities: [
      'validate_apply_preflight_input',
      'verify_explicit_human_approval_record',
      'verify_metadata_only_source_artifacts',
      'perform_idempotency_check',
      'emit_audit_metadata',
      'support_disable_or_kill_switch',
    ],
    forbidden_operations: [...FORBIDDEN_OPERATIONS],
    rollback_requirement_summary:
      'A future implementation must define rollback before any write-capable behavior is proposed.',
    disable_kill_switch_requirement_summary:
      'A future implementation must include a disable or kill-switch requirement before any write-capable behavior is proposed.',
    validation_notes: makeValidationNotes({
      applyPreflight: params.applyPreflight,
      contractStatus: params.contractStatus,
      sourceApplyPreflightSafetyInvariantsPreserved:
        params.sourceApplyPreflightSafetyInvariantsPreserved,
      sourceApplyPreflightMetadataOnly:
        params.sourceApplyPreflightMetadataOnly,
      sourceApplyPreflightAllowedNextStepSafe:
        params.sourceApplyPreflightAllowedNextStepSafe,
    }),
    metadata_only: true,
    includes_executable_write_logic: false,
    includes_filesystem_write_code: false,
    includes_api_route_code: false,
    includes_db_code: false,
    includes_worker_scheduler_code: false,
  };
}

function makeAuditPreview(params: {
  applyPreflight: TaskBoardHandoffWriteApplyPreflightResult;
  executorContractId: string;
  contractStatus: TaskBoardHandoffWriteExecutorContractStatus;
  requiredNextAction:
    TaskBoardHandoffWriteExecutorContractRequiredNextAction;
  allowedNextStep: TaskBoardHandoffWriteExecutorContractAllowedNextStep;
  targetKind: string;
  targetPathOrTargetId: string;
}): Record<string, unknown> {
  return {
    executor_contract_actor:
      'codex_app_server_runtime_write_executor_contract_draft',
    executor_contract_id: params.executorContractId,
    source_apply_preflight_id: params.applyPreflight.apply_preflight_id,
    source_apply_preflight_status:
      params.applyPreflight.preflight_status,
    source_write_plan_id: params.applyPreflight.source_write_plan_id,
    source_approval_request_id:
      params.applyPreflight.source_approval_request_id,
    source_approval_decision_validation_id:
      params.applyPreflight.source_approval_decision_validation_id,
    contract_status: params.contractStatus,
    target_kind: params.targetKind,
    target_path_or_target_id: params.targetPathOrTargetId,
    proposed_executor_mode: PROPOSED_EXECUTOR_MODE,
    write_authorized_by_this_pr: false,
    apply_authorized_by_this_pr: false,
    executor_implemented_by_this_pr: false,
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
  applyPreflight: TaskBoardHandoffWriteApplyPreflightResult,
): string[] {
  return Array.from(new Set([
    'No rollback required because no executor implementation, apply, or write has occurred.',
    ...applyPreflight.rollback_plan,
  ]));
}

function makeReferences(
  applyPreflight: TaskBoardHandoffWriteApplyPreflightResult,
): string[] {
  return Array.from(new Set([
    ...applyPreflight.references,
    ...REFERENCES,
  ]));
}

function makeSafetySummary(params: {
  contractStatus: TaskBoardHandoffWriteExecutorContractStatus;
  requiredNextAction:
    TaskBoardHandoffWriteExecutorContractRequiredNextAction;
}): string[] {
  const invariantSummary = [
    'Executor contract draft is stdout-only metadata for a future separate executor implementation scope.',
    'No approval is granted by this PR.',
    'This PR does not authorize writes or apply; write_authorized_by_this_pr and apply_authorized_by_this_pr remain false.',
    'This PR does not implement an executor; executor_implemented_by_this_pr remains false.',
    'No write or apply occurred; wrote_anything remains false.',
    'No write executor is present; write_executor_present remains false.',
    'No apply executor is present; apply_executor_present remains false.',
    'No write executions occurred; executed_write_count remains 0.',
    'Task Board write, HANDOFF file creation, and file-writing automation remain forbidden.',
  ];

  if (params.contractStatus === 'needs_human_decision') {
    return [
      'A human approval decision record is still required before any separate executor implementation can be considered.',
      ...invariantSummary,
    ];
  }

  if (params.requiredNextAction === 'revise_or_reject_request') {
    return [
      'The source path requires revision or rejection handling; no executor contract may proceed.',
      ...invariantSummary,
    ];
  }

  if (
    params.contractStatus
      === 'executor_contract_ready_for_separate_implementation'
  ) {
    return [
      'The source apply preflight is ready only as material for a separate executor implementation; actual write behavior still requires explicit human approval.',
      ...invariantSummary,
    ];
  }

  return [
    'The source apply preflight is blocked; no future executor implementation may be considered from this result until blockers are resolved.',
    ...invariantSummary,
  ];
}

export function makeTaskBoardHandoffWriteExecutorContractDraft(
  applyPreflight: TaskBoardHandoffWriteApplyPreflightResult,
  options: MakeTaskBoardHandoffWriteExecutorContractOptions = {},
): TaskBoardHandoffWriteExecutorContractDraft {
  const executorContractId =
    options.executorContractId ?? DEFAULT_EXECUTOR_CONTRACT_ID;
  const contractStatus = getExecutorContractStatus(applyPreflight);
  const requiredNextAction = getRequiredNextAction(
    applyPreflight,
    contractStatus,
  );
  const allowedNextStep = getAllowedNextStep(requiredNextAction);
  const targetKind = safeStringForOutput(
    applyPreflight.target_kind,
    DEFAULT_TARGET_KIND,
  );
  const targetPathOrTargetId = safeTargetForOutput(
    applyPreflight.target_path_or_target_id,
  );
  const sourceApplyPreflightSafetyInvariantsPreserved =
    areSourceApplyPreflightSafetyInvariantsPreserved(applyPreflight);
  const sourceApplyPreflightMetadataOnly =
    isSourceApplyPreflightMetadataOnly(applyPreflight);
  const sourceApplyPreflightAllowedNextStepSafe =
    String(applyPreflight.allowed_next_step) !== 'actual_write';

  const draft: TaskBoardHandoffWriteExecutorContractDraft = {
    executor_contract_id: executorContractId,
    executor_contract_version: 1,
    generated_at: toIsoTimestamp(options.generatedAt),
    source_apply_preflight_id: safeStringForOutput(
      applyPreflight.apply_preflight_id,
      'source_apply_preflight_id_unavailable',
    ),
    source_apply_preflight_version:
      applyPreflight.apply_preflight_version,
    source_apply_preflight_status: applyPreflight.preflight_status,
    source_write_plan_id: applyPreflight.source_write_plan_id,
    source_approval_request_id: applyPreflight.source_approval_request_id,
    source_approval_decision_validation_id:
      applyPreflight.source_approval_decision_validation_id,
    source_decision: applyPreflight.source_decision,
    source_decision_accepted: applyPreflight.source_decision_accepted,
    source_approval_valid_for_future_write:
      applyPreflight.source_approval_valid_for_future_write,
    contract_status: contractStatus,
    target_kind: targetKind,
    target_path_or_target_id: targetPathOrTargetId,
    proposed_executor_mode: PROPOSED_EXECUTOR_MODE,
    write_authorized_by_this_pr: false,
    apply_authorized_by_this_pr: false,
    executor_implemented_by_this_pr: false,
    wrote_anything: false,
    write_executor_present: false,
    apply_executor_present: false,
    executed_write_count: 0,
    required_human_approval: true,
    required_next_action: requiredNextAction,
    allowed_next_step: allowedNextStep,
    validation_summary: {
      source_apply_preflight_status: applyPreflight.preflight_status,
      source_apply_preflight_safety_invariants_preserved:
        sourceApplyPreflightSafetyInvariantsPreserved,
      source_apply_preflight_metadata_only:
        sourceApplyPreflightMetadataOnly,
      source_apply_preflight_allowed_next_step_safe:
        sourceApplyPreflightAllowedNextStepSafe,
      source_apply_preflight_validation_summary:
        cloneJsonValue(applyPreflight.validation_summary),
      executor_contract_blocks_actual_write: true,
      executor_not_implemented_by_this_pr: true,
    },
    proposed_executor_contract: makeProposedExecutorContract({
      applyPreflight,
      contractStatus,
      targetKind,
      targetPathOrTargetId,
      sourceApplyPreflightSafetyInvariantsPreserved,
      sourceApplyPreflightMetadataOnly,
      sourceApplyPreflightAllowedNextStepSafe,
    }),
    audit_preview: makeAuditPreview({
      applyPreflight,
      executorContractId,
      contractStatus,
      requiredNextAction,
      allowedNextStep,
      targetKind,
      targetPathOrTargetId,
    }),
    rollback_plan: makeRollbackPlan(applyPreflight),
    forbidden_operations: [...FORBIDDEN_OPERATIONS],
    references: makeReferences(applyPreflight),
    safety_summary: makeSafetySummary({
      contractStatus,
      requiredNextAction,
    }),
  };

  assertNoRestrictedContent(
    draft,
    'taskBoardHandoffWriteExecutorContractDraft',
  );

  return draft;
}

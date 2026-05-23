import { spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { createRequire } from 'node:module';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const require = createRequire(import.meta.url);
const projectRoot = process.cwd();
const buildDir = path.join(
  projectRoot,
  'node_modules',
  '.cache',
  'world-forecast-task-board-handoff-smoke',
);
const runtimeDir = await fs.mkdtemp(path.join(os.tmpdir(), 'world-forecast-task-board-'));
const originalConsoleLog = console.log.bind(console);
let dbModule;

function sanitize(message) {
  const runtimeDirUrlPath = runtimeDir.replaceAll(path.sep, '/');
  const buildDirUrlPath = buildDir.replaceAll(path.sep, '/');
  const projectRootUrlPath = projectRoot.replaceAll(path.sep, '/');

  return String(message)
    .replaceAll(runtimeDir, '<runtime-dir>')
    .replaceAll(runtimeDirUrlPath, '<runtime-dir>')
    .replaceAll(buildDir, '<build-dir>')
    .replaceAll(buildDirUrlPath, '<build-dir>')
    .replaceAll(projectRoot, '<project-root>')
    .replaceAll(projectRootUrlPath, '<project-root>')
    .replace(/[A-Z]:\\[^\r\n'"`]+/g, '<local-path>');
}

function log(message) {
  originalConsoleLog(`[task-board-handoff-smoke] ${message}`);
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function cloneValue(value) {
  return JSON.parse(JSON.stringify(value));
}

function hasIssue(result, code) {
  return result.issues.some((issue) => issue.code === code);
}

function expectRejectedTask(
  label,
  validateTaskCard,
  taskCard,
  implementationProposal,
  code,
) {
  const validation = validateTaskCard(taskCard, implementationProposal);

  assert(!validation.passed, `${label} must not pass task card validation.`);
  assert(hasIssue(validation, code), `${label} did not report ${code}.`);
  log(`Rejected ${label}.`);
}

function expectRejectedHandoff(
  label,
  validateTaskHandoff,
  handoff,
  taskCard,
  code,
) {
  const validation = validateTaskHandoff(handoff, taskCard);

  assert(!validation.passed, `${label} must not pass task handoff validation.`);
  assert(hasIssue(validation, code), `${label} did not report ${code}.`);
  log(`Rejected ${label}.`);
}

function makeLocalPathLikeValue() {
  return ['Z:', 'redacted', 'task.txt'].join('\\');
}

function makeNasPathLikeValue() {
  return ['A:', 'AI-System', 'redacted'].join('/');
}

function makeSecretLikeValue() {
  return `${['api', 'key'].join('_')}=REDACTED`;
}

function makePrivateNetworkIpLikeValue() {
  return [192, 168, 10, 129].join('.');
}

async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function compileTaskBoardHandoffHelpers() {
  const tscPath = path.join(projectRoot, 'node_modules', 'typescript', 'bin', 'tsc');
  if (!(await pathExists(tscPath))) {
    throw new Error(
      'Missing local TypeScript compiler. Run npm ci before npm run test:task-board-handoff.',
    );
  }

  await fs.rm(buildDir, { recursive: true, force: true });
  await fs.mkdir(buildDir, { recursive: true });

  const result = spawnSync(process.execPath, [
    tscPath,
    '--target',
    'ES2020',
    '--module',
    'commonjs',
    '--moduleResolution',
    'node',
    '--esModuleInterop',
    '--skipLibCheck',
    '--strict',
    '--outDir',
    buildDir,
    '--rootDir',
    projectRoot,
    'lib/db.ts',
    'lib/memory/types.ts',
    'lib/memory/validation.ts',
    'lib/memory/write.ts',
    'lib/memory/read.ts',
    'lib/context-packs/types.ts',
    'lib/context-packs/validation.ts',
    'lib/context-packs/build.ts',
    'lib/ai-analysis-jobs/types.ts',
    'lib/ai-analysis-jobs/validation.ts',
    'lib/ai-analysis-jobs/preflight.ts',
    'lib/ai-analysis-jobs/results.ts',
    'lib/ai-analysis-jobs/result-validation.ts',
    'lib/human-review/types.ts',
    'lib/human-review/validation.ts',
    'lib/implementation-proposals/types.ts',
    'lib/implementation-proposals/validation.ts',
    'lib/task-board/types.ts',
    'lib/task-board/handoff.ts',
    'lib/task-board/validation.ts',
  ], {
    cwd: projectRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  });

  if (result.status !== 0) {
    throw new Error([
      'TypeScript Task Board Handoff helper compilation failed.',
      sanitize(result.stdout),
      sanitize(result.stderr),
    ].filter(Boolean).join('\n'));
  }
}

function makeRawEvent(overrides = {}) {
  const now = Math.floor(Date.now() / 1000);
  return {
    id: `task-board-handoff-smoke-raw-${randomUUID()}`,
    observedAt: now,
    ingestedAt: now,
    sourceKind: 'estimated',
    sourceName: 'Smoke Manual Review',
    sourceRef: 'manual-task-board-handoff-note',
    eventDomain: 'task_board_handoff_smoke',
    summary: 'Task Board Handoff raw event',
    confidence: 'medium',
    limitations: 'Smoke-only task board handoff validation record.',
    labels: { smoke: true, estimated: true },
    ...overrides,
  };
}

function makeMarketSnapshot(overrides = {}) {
  const now = Math.floor(Date.now() / 1000);
  return {
    id: `task-board-handoff-smoke-market-${randomUUID()}`,
    capturedAt: now,
    assetSymbol: 'SMOKE',
    assetName: 'Smoke Asset',
    assetClass: 'test',
    price: 123.45,
    currency: 'USD',
    sourceKind: 'manual',
    sourceName: 'Smoke Manual Review',
    sourceRef: 'manual-task-board-handoff-note',
    confidence: 'medium',
    limitations: 'Smoke-only task board handoff validation record.',
    rawPayload: { sample: true },
    ...overrides,
  };
}

function makeSignal(overrides = {}) {
  const now = Math.floor(Date.now() / 1000);
  return {
    id: `task-board-handoff-smoke-signal-${randomUUID()}`,
    detectedAt: now,
    signalType: 'task_board_handoff_smoke',
    title: 'Task Board Handoff smoke signal',
    summary: 'Proposal-only task board handoff smoke signal',
    severity: 'low',
    direction: 'neutral',
    strength: 0.2,
    confidence: 'medium',
    sourceKind: 'manual',
    labels: { smoke: true, proposal_only: true },
    limitations: 'Signal limitation must be preserved.',
    proposalStatus: 'proposal',
    humanReviewRequired: true,
    ...overrides,
  };
}

function makeEvidenceFromContextPack(contextPack) {
  const included = contextPack.included_records;
  return [
    ...included.signals,
    ...included.raw_events,
    ...included.market_snapshots,
  ].map((record) => ({
    source_type: record.source_type,
    id: record.id,
    summary: record.summary,
    confidence: record.confidence,
  }));
}

function makeValidResult({
  contextPack,
  preflightResult,
  makeAIAnalysisJobResultBoundary,
  makeAIAnalysisJobResultSafetyLabels,
}) {
  assert(preflightResult.job_kind, 'Preflight result must preserve job_kind.');
  assert(preflightResult.context_pack_id, 'Preflight result must preserve context_pack_id.');
  assert(
    preflightResult.context_pack_version === 1,
    'Preflight result must preserve context_pack_version.',
  );

  return {
    result_id: `ai-analysis-job-result-${randomUUID()}`,
    result_version: 1,
    job_kind: preflightResult.job_kind,
    context_pack_id: contextPack.context_pack_id,
    context_pack_version: contextPack.context_pack_version,
    generated_at: Math.floor(Date.now() / 1000),
    proposal_status: 'proposal',
    confidence: 'medium',
    summary: 'Proposal-only AI analysis result for task board handoff validation.',
    evidence: makeEvidenceFromContextPack(contextPack),
    limitations: [
      {
        id: 'smoke-only',
        summary: 'Smoke fixture result is not a production forecast, price, evaluation, or saved prediction.',
      },
    ],
    safety_labels: makeAIAnalysisJobResultSafetyLabels(),
    recommended_decision: 'review',
    next_review_steps: [
      'Human reviewer checks evidence, limitations, and safety labels before follow-up planning.',
    ],
    ...makeAIAnalysisJobResultBoundary(),
  };
}

function makeValidDecision(result, requiredForbiddenNextSteps) {
  return {
    decision_id: `human-review-decision-${randomUUID()}`,
    decision_version: 1,
    reviewed_result_id: result.result_id,
    reviewed_result_version: result.result_version,
    job_kind: result.job_kind,
    context_pack_id: result.context_pack_id,
    context_pack_version: result.context_pack_version,
    decided_at: Math.floor(Date.now() / 1000),
    reviewer_id: 'smoke-human-reviewer',
    outcome: 'approved_for_later_implementation',
    rationale: 'Reviewer accepts this as proposal material for later separately reviewed planning.',
    required_next_steps: [
      'Record a follow-up task for separate reviewed planning before any code work.',
    ],
    residual_risks: [
      'Smoke fixture evidence remains limited and requires future human review.',
    ],
    requires_separate_implementation: true,
    allowed_next_step: 'separate_implementation_pr_only',
    forbidden_next_steps: [...requiredForbiddenNextSteps],
    is_production_state: false,
    does_not_modify_api: true,
    does_not_write_db: true,
    does_not_publish_externally: true,
  };
}

function makeValidProposal(decision, requiredForbiddenNextSteps) {
  return {
    proposal_id: `implementation-proposal-${randomUUID()}`,
    proposal_version: 1,
    source_decision_id: decision.decision_id,
    source_decision_version: decision.decision_version,
    reviewed_result_id: decision.reviewed_result_id,
    reviewed_result_version: decision.reviewed_result_version,
    job_kind: decision.job_kind,
    context_pack_id: decision.context_pack_id,
    context_pack_version: decision.context_pack_version,
    created_at: Math.floor(Date.now() / 1000),
    proposal_status: 'proposal',
    change_type: 'implementation_plan_only',
    summary: 'Proposal-only planning record for task board handoff contract validation.',
    rationale: 'Human review allows only separate reviewed planning and draft instructions.',
    intended_files: [
      'lib/task-board/types.ts',
      'lib/task-board/validation.ts',
      'lib/task-board/handoff.ts',
      'scripts/task-board-handoff-smoke.mjs',
    ],
    forbidden_files: [
      'app/api/forecast/route.ts',
      'app/api/hormuz/route.ts',
      'app/api/hormuz/news/route.ts',
      'lib/db.ts',
    ],
    acceptance_criteria: [
      'The task board contract accepts only proposal-only management records.',
      'Unsafe next steps remain explicitly forbidden in the task board fixture.',
    ],
    test_plan: [
      'Run the task board handoff smoke validation script.',
    ],
    rollback_plan: [
      'Archive the proposal record and leave current production behavior unchanged.',
    ],
    residual_risks: [
      'Future planning still requires human review before any code work.',
    ],
    requires_human_approval: true,
    requires_separate_pr: true,
    allowed_next_step: 'implementation_pr_draft_only',
    forbidden_next_steps: [...requiredForbiddenNextSteps],
    proposal_only: true,
    is_production_state: false,
    does_not_modify_api: true,
    does_not_write_db: true,
    does_not_run_migration: true,
    does_not_deploy: true,
    does_not_publish_externally: true,
  };
}

function makeValidTaskCard(proposal, makeTaskCardContractBoundary) {
  return {
    task_id: `task-card-${randomUUID()}`,
    task_version: 1,
    source_proposal_id: proposal.proposal_id,
    source_proposal_version: proposal.proposal_version,
    source_decision_id: proposal.source_decision_id,
    reviewed_result_id: proposal.reviewed_result_id,
    job_kind: proposal.job_kind,
    context_pack_id: proposal.context_pack_id,
    created_at: Math.floor(Date.now() / 1000),
    title: 'Task Board Handoff contract follow-up',
    status: 'ready_for_draft_pr',
    priority: 'P2',
    autonomy_level: 'A2_prepare_for_approval',
    assigned_role: 'codex_contract_planner',
    human_owner: 'human-operator',
    objective: 'Prepare safe draft-instructions planning from the implementation proposal.',
    context_summary: 'Implementation proposal remains proposal-only and needs a handoff record.',
    intended_files: [
      'lib/task-board/types.ts',
      'lib/task-board/validation.ts',
      'lib/task-board/handoff.ts',
      'scripts/task-board-handoff-smoke.mjs',
      'docs/HUMAN_APPROVAL.md',
      'docs/AI_ANALYSIS_JOBS.md',
      'package.json',
      '.github/workflows/ci.yml',
    ],
    forbidden_files: [
      'app/api/forecast/route.ts',
      'app/api/hormuz/route.ts',
      'app/api/hormuz/news/route.ts',
      'lib/db.ts',
    ],
    acceptance_criteria: [
      'Task card validation preserves proposal-only and human-approval-only boundaries.',
      'Task card validation rejects protected API, DB, runtime, and outside-channel scope.',
    ],
    test_plan: [
      'Run the task board handoff smoke validation script.',
    ],
    rollback_plan: [
      'Revert only the contract additions and keep production behavior unchanged.',
    ],
    residual_risks: [
      'Future execution still requires explicit human approval and a dedicated implementation path.',
    ],
    ...makeTaskCardContractBoundary(),
  };
}

function makeValidHandoff(taskCard, makeTaskHandoffContractBoundary) {
  return {
    handoff_id: `task-handoff-${randomUUID()}`,
    handoff_version: 1,
    task_id: taskCard.task_id,
    source_role: 'codex_contract_planner',
    target_role: 'human_reviewer',
    created_at: Math.floor(Date.now() / 1000),
    current_status: taskCard.status,
    objective: taskCard.objective,
    what_has_been_done: [
      'Prepared proposal-only task card contract fixture.',
      'Prepared non-executing handoff contract fixture.',
    ],
    key_findings: [
      'Task card remains a management record and not an execution command.',
    ],
    decisions_made: [
      'Keep next action limited to human review or draft-instructions preparation.',
    ],
    open_questions: [
      'Human reviewer may decide whether a later dedicated implementation path is needed.',
    ],
    blockers: [
      'No execution can proceed without explicit human approval.',
    ],
    required_next_action: 'Human reviewer checks the handoff and keeps follow-up within draft-instructions preparation.',
    inputs_passed: [
      'Implementation Proposal Contract v0 fixture',
      'Task Card Contract v0 fixture',
    ],
    outputs_produced: [
      'Task Handoff Contract v0 fixture',
    ],
    confidence: 0.82,
    completeness: 0.88,
    risks: [
      'Handoff quality depends on future human review.',
    ],
    references: [
      'sanitized-context-pack-reference',
      'implementation-proposal-contract-v0',
    ],
    ...makeTaskHandoffContractBoundary(taskCard.allowed_next_step),
  };
}

async function main() {
  await compileTaskBoardHandoffHelpers();

  process.chdir(runtimeDir);

  let insertRawEvent;
  let insertMarketSnapshot;
  let insertSignal;
  let buildContextPackFromSignalId;
  let preflightAIAnalysisJobIntake;
  let validateAIAnalysisJobResult;
  let makeAIAnalysisJobResultBoundary;
  let makeAIAnalysisJobResultSafetyLabels;
  let validateHumanReviewDecision;
  let validateImplementationProposal;
  let validateTaskCard;
  let validateTaskHandoff;
  let makeTaskCardContractBoundary;
  let makeTaskHandoffContractBoundary;
  let humanReviewRequiredForbiddenNextSteps;
  let implementationRequiredForbiddenNextSteps;

  console.log = () => {};
  try {
    ({
      insertRawEvent,
      insertMarketSnapshot,
      insertSignal,
    } = require(path.join(buildDir, 'lib', 'memory', 'write.js')));
    ({ buildContextPackFromSignalId } = require(
      path.join(buildDir, 'lib', 'context-packs', 'build.js'),
    ));
    ({ preflightAIAnalysisJobIntake } = require(
      path.join(buildDir, 'lib', 'ai-analysis-jobs', 'preflight.js'),
    ));
    ({ validateAIAnalysisJobResult } = require(
      path.join(buildDir, 'lib', 'ai-analysis-jobs', 'result-validation.js'),
    ));
    ({
      makeAIAnalysisJobResultBoundary,
      makeAIAnalysisJobResultSafetyLabels,
    } = require(path.join(buildDir, 'lib', 'ai-analysis-jobs', 'results.js')));
    ({ validateHumanReviewDecision } = require(
      path.join(buildDir, 'lib', 'human-review', 'validation.js'),
    ));
    ({
      HUMAN_REVIEW_DECISION_REQUIRED_FORBIDDEN_NEXT_STEPS:
        humanReviewRequiredForbiddenNextSteps,
    } = require(path.join(buildDir, 'lib', 'human-review', 'types.js')));
    ({ validateImplementationProposal } = require(
      path.join(buildDir, 'lib', 'implementation-proposals', 'validation.js'),
    ));
    ({
      IMPLEMENTATION_PROPOSAL_REQUIRED_FORBIDDEN_NEXT_STEPS:
        implementationRequiredForbiddenNextSteps,
    } = require(path.join(buildDir, 'lib', 'implementation-proposals', 'types.js')));
    ({
      makeTaskCardContractBoundary,
      makeTaskHandoffContractBoundary,
    } = require(path.join(buildDir, 'lib', 'task-board', 'handoff.js')));
    ({
      validateTaskCard,
      validateTaskHandoff,
    } = require(path.join(buildDir, 'lib', 'task-board', 'validation.js')));
    dbModule = require(path.join(buildDir, 'lib', 'db.js'));
  } finally {
    console.log = originalConsoleLog;
  }
  const database = dbModule.default;

  const raw = insertRawEvent(makeRawEvent());
  const market = insertMarketSnapshot(makeMarketSnapshot());
  const signal = insertSignal(makeSignal({
    relatedRawEventIds: [raw.id],
    relatedMarketSnapshotIds: [market.id],
  }));
  const contextPack = buildContextPackFromSignalId({
    signalId: signal.id,
    purpose: {
      job_type: 'forecast_review_notes',
      summary: 'Prepare Task Board Handoff smoke context.',
    },
    contextPackId: `task-board-handoff-${randomUUID()}`,
  }, database);
  const preflightResult = preflightAIAnalysisJobIntake(contextPack);

  assert(preflightResult.passed === true, 'Context pack must pass intake preflight first.');

  const validResult = makeValidResult({
    contextPack,
    preflightResult,
    makeAIAnalysisJobResultBoundary,
    makeAIAnalysisJobResultSafetyLabels,
  });
  const resultValidation = validateAIAnalysisJobResult(validResult, preflightResult);

  assert(resultValidation.passed === true, 'Valid AI analysis job result must pass validation.');
  assert(resultValidation.issues.length === 0, 'Valid AI analysis job result must have no issues.');

  const validDecision = makeValidDecision(validResult, humanReviewRequiredForbiddenNextSteps);
  const decisionValidation = validateHumanReviewDecision(validDecision, validResult);

  assert(decisionValidation.passed === true, 'Valid human review decision must pass validation.');
  assert(decisionValidation.issues.length === 0, 'Valid human review decision must have no issues.');

  const validProposal = makeValidProposal(validDecision, implementationRequiredForbiddenNextSteps);
  const proposalValidation = validateImplementationProposal(validProposal, validDecision);

  assert(proposalValidation.passed === true, 'Valid implementation proposal must pass validation.');
  assert(proposalValidation.issues.length === 0, 'Valid implementation proposal must have no issues.');

  const validTaskCard = makeValidTaskCard(validProposal, makeTaskCardContractBoundary);
  const taskCardValidation = validateTaskCard(validTaskCard, validProposal);

  assert(
    taskCardValidation.passed === true,
    `Valid task card must pass validation: ${JSON.stringify(taskCardValidation.issues)}`,
  );
  assert(taskCardValidation.issues.length === 0, 'Valid task card must have no issues.');
  log('Accepted proposal-only task card.');

  const validHandoff = makeValidHandoff(validTaskCard, makeTaskHandoffContractBoundary);
  const handoffValidation = validateTaskHandoff(validHandoff, validTaskCard);

  assert(
    handoffValidation.passed === true,
    `Valid task handoff must pass validation: ${JSON.stringify(handoffValidation.issues)}`,
  );
  assert(handoffValidation.issues.length === 0, 'Valid task handoff must have no issues.');
  log('Accepted proposal-only task handoff.');

  const inProgressStatus = cloneValue(validTaskCard);
  inProgressStatus.status = 'in_progress';
  expectRejectedTask(
    'in_progress task status',
    validateTaskCard,
    inProgressStatus,
    validProposal,
    'status_forbidden',
  );

  const a3Autonomy = cloneValue(validTaskCard);
  a3Autonomy.autonomy_level = 'A3_execute_reversible_low_risk_tasks';
  expectRejectedTask(
    'A3 autonomy level task',
    validateTaskCard,
    a3Autonomy,
    validProposal,
    'autonomy_level_forbidden',
  );

  const createPrAllowedNextStep = cloneValue(validTaskCard);
  createPrAllowedNextStep.allowed_next_step = 'create_pr';
  expectRejectedTask(
    'create_pr allowed_next_step task',
    validateTaskCard,
    createPrAllowedNextStep,
    validProposal,
    'allowed_next_step_forbidden',
  );

  const archivedDraftPrInstructionsTask = cloneValue(validTaskCard);
  archivedDraftPrInstructionsTask.status = 'archived';
  archivedDraftPrInstructionsTask.allowed_next_step = 'prepare_draft_pr_instructions_only';
  expectRejectedTask(
    'archived draft PR instructions task',
    validateTaskCard,
    archivedDraftPrInstructionsTask,
    validProposal,
    'task_status_allowed_next_step_mismatch',
  );

  const needsRevisionDraftPrInstructionsTask = cloneValue(validTaskCard);
  needsRevisionDraftPrInstructionsTask.status = 'needs_revision';
  needsRevisionDraftPrInstructionsTask.allowed_next_step = 'prepare_draft_pr_instructions_only';
  expectRejectedTask(
    'needs_revision draft PR instructions task',
    validateTaskCard,
    needsRevisionDraftPrInstructionsTask,
    validProposal,
    'task_status_allowed_next_step_mismatch',
  );

  const waitingForHumanApprovalDraftPrInstructionsTask = cloneValue(validTaskCard);
  waitingForHumanApprovalDraftPrInstructionsTask.status = 'waiting_for_human_approval';
  waitingForHumanApprovalDraftPrInstructionsTask.allowed_next_step = 'prepare_draft_pr_instructions_only';
  expectRejectedTask(
    'waiting_for_human_approval draft PR instructions task',
    validateTaskCard,
    waitingForHumanApprovalDraftPrInstructionsTask,
    validProposal,
    'task_status_allowed_next_step_mismatch',
  );

  const intendedForecastApi = cloneValue(validTaskCard);
  intendedForecastApi.intended_files.push('app/api/forecast/route.ts');
  intendedForecastApi.forbidden_files = intendedForecastApi.forbidden_files.filter(
    (filePath) => filePath !== 'app/api/forecast/route.ts',
  );
  expectRejectedTask(
    'intended_files forecast API task',
    validateTaskCard,
    intendedForecastApi,
    validProposal,
    'intended_file_protected_scope',
  );

  const intendedForbiddenOverlap = cloneValue(validTaskCard);
  intendedForbiddenOverlap.intended_files.push('app/api/forecast/route.ts');
  expectRejectedTask(
    'intended_files forbidden_files overlap task',
    validateTaskCard,
    intendedForbiddenOverlap,
    validProposal,
    'intended_file_forbidden',
  );

  const requiredHumanApprovalFalse = cloneValue(validTaskCard);
  requiredHumanApprovalFalse.required_human_approval = false;
  expectRejectedTask(
    'required_human_approval false task',
    validateTaskCard,
    requiredHumanApprovalFalse,
    validProposal,
    'required_human_approval_required',
  );

  const proposalOnlyFalse = cloneValue(validTaskCard);
  proposalOnlyFalse.proposal_only = false;
  expectRejectedTask(
    'proposal_only false task',
    validateTaskCard,
    proposalOnlyFalse,
    validProposal,
    'proposal_only_required',
  );

  const productionStateTrue = cloneValue(validTaskCard);
  productionStateTrue.is_production_state = true;
  expectRejectedTask(
    'is_production_state true task',
    validateTaskCard,
    productionStateTrue,
    validProposal,
    'non_production_state_required',
  );

  const modifiesApi = cloneValue(validTaskCard);
  modifiesApi.does_not_modify_api = false;
  expectRejectedTask(
    'does_not_modify_api false task',
    validateTaskCard,
    modifiesApi,
    validProposal,
    'does_not_modify_api_required',
  );

  const missingForbiddenNextStep = cloneValue(validTaskCard);
  missingForbiddenNextStep.forbidden_next_steps =
    missingForbiddenNextStep.forbidden_next_steps.filter((step) => step !== 'production_write');
  expectRejectedTask(
    'missing forbidden_next_steps task',
    validateTaskCard,
    missingForbiddenNextStep,
    validProposal,
    'forbidden_next_step_missing',
  );

  const restrictedValues = [
    ['secret-like value task', makeSecretLikeValue()],
    ['local path task', makeLocalPathLikeValue()],
    ['NAS path task', makeNasPathLikeValue()],
    ['private network IP task', makePrivateNetworkIpLikeValue()],
    ['env reference task', '.env.local'],
  ];

  for (const [label, value] of restrictedValues) {
    const restrictedContent = cloneValue(validTaskCard);
    restrictedContent.residual_risks.push(`Restricted content fixture ${value}`);
    expectRejectedTask(
      label,
      validateTaskCard,
      restrictedContent,
      validProposal,
      'restricted_content_detected',
    );
  }

  const objectiveProductionDeploy = cloneValue(validTaskCard);
  objectiveProductionDeploy.objective = 'Plan says to deploy to production immediately.';
  expectRejectedTask(
    'objective production deploy task',
    validateTaskCard,
    objectiveProductionDeploy,
    validProposal,
    'high_risk_operation_recommendation',
  );

  const sourceProposalIdMismatch = cloneValue(validTaskCard);
  sourceProposalIdMismatch.source_proposal_id = `mismatch-${randomUUID()}`;
  expectRejectedTask(
    'source_proposal_id mismatch task',
    validateTaskCard,
    sourceProposalIdMismatch,
    validProposal,
    'source_proposal_id_mismatch',
  );

  const proposalModifiesApi = cloneValue(validProposal);
  proposalModifiesApi.does_not_modify_api = false;
  expectRejectedTask(
    'implementation proposal does_not_modify_api false task relationship',
    validateTaskCard,
    validTaskCard,
    proposalModifiesApi,
    'implementation_proposal_does_not_modify_api_required',
  );

  const proposalWritesDb = cloneValue(validProposal);
  proposalWritesDb.does_not_write_db = false;
  expectRejectedTask(
    'implementation proposal does_not_write_db false task relationship',
    validateTaskCard,
    validTaskCard,
    proposalWritesDb,
    'implementation_proposal_does_not_write_db_required',
  );

  const proposalRunsMigration = cloneValue(validProposal);
  proposalRunsMigration.does_not_run_migration = false;
  expectRejectedTask(
    'implementation proposal does_not_run_migration false task relationship',
    validateTaskCard,
    validTaskCard,
    proposalRunsMigration,
    'implementation_proposal_does_not_run_migration_required',
  );

  const proposalDeploys = cloneValue(validProposal);
  proposalDeploys.does_not_deploy = false;
  expectRejectedTask(
    'implementation proposal does_not_deploy false task relationship',
    validateTaskCard,
    validTaskCard,
    proposalDeploys,
    'implementation_proposal_does_not_deploy_required',
  );

  const proposalPublishesExternally = cloneValue(validProposal);
  proposalPublishesExternally.does_not_publish_externally = false;
  expectRejectedTask(
    'implementation proposal does_not_publish_externally false task relationship',
    validateTaskCard,
    validTaskCard,
    proposalPublishesExternally,
    'implementation_proposal_does_not_publish_externally_required',
  );

  const archivedHumanReviewHandoff = cloneValue(validHandoff);
  archivedHumanReviewHandoff.current_status = 'archived';
  archivedHumanReviewHandoff.allowed_next_step = 'human_review_only';
  expectRejectedHandoff(
    'archived human_review_only handoff',
    validateTaskHandoff,
    archivedHumanReviewHandoff,
    undefined,
    'handoff_status_allowed_next_step_mismatch',
  );

  const needsRevisionDraftPrInstructionsHandoff = cloneValue(validHandoff);
  needsRevisionDraftPrInstructionsHandoff.current_status = 'needs_revision';
  needsRevisionDraftPrInstructionsHandoff.allowed_next_step = 'prepare_draft_pr_instructions_only';
  expectRejectedHandoff(
    'needs_revision draft PR instructions handoff',
    validateTaskHandoff,
    needsRevisionDraftPrInstructionsHandoff,
    undefined,
    'handoff_status_allowed_next_step_mismatch',
  );

  const handoffTaskIdMismatch = cloneValue(validHandoff);
  handoffTaskIdMismatch.task_id = `mismatch-${randomUUID()}`;
  expectRejectedHandoff(
    'task_id mismatch handoff',
    validateTaskHandoff,
    handoffTaskIdMismatch,
    validTaskCard,
    'task_id_mismatch',
  );

  const handoffCurrentStatusMismatch = cloneValue(validHandoff);
  handoffCurrentStatusMismatch.current_status = 'blocked';
  expectRejectedHandoff(
    'current_status mismatch handoff',
    validateTaskHandoff,
    handoffCurrentStatusMismatch,
    validTaskCard,
    'current_status_mismatch',
  );

  const handoffConfidenceInvalid = cloneValue(validHandoff);
  handoffConfidenceInvalid.confidence = 1.5;
  expectRejectedHandoff(
    'confidence 1.5 handoff',
    validateTaskHandoff,
    handoffConfidenceInvalid,
    validTaskCard,
    'confidence_invalid',
  );

  const handoffCompletenessInvalid = cloneValue(validHandoff);
  handoffCompletenessInvalid.completeness = -0.1;
  expectRejectedHandoff(
    'completeness -0.1 handoff',
    validateTaskHandoff,
    handoffCompletenessInvalid,
    validTaskCard,
    'completeness_invalid',
  );

  const handoffForecastApiUpdate = cloneValue(validHandoff);
  handoffForecastApiUpdate.required_next_action = '/api/forecast を変更してください。';
  expectRejectedHandoff(
    'required_next_action forecast API handoff',
    validateTaskHandoff,
    handoffForecastApiUpdate,
    validTaskCard,
    'high_risk_operation_recommendation',
  );

  log('Task Board Handoff smoke checks passed.');
}

try {
  await main();
} catch (error) {
  console.error(`[task-board-handoff-smoke] ${sanitize(error.stack || error.message || error)}`);
  process.exitCode = 1;
} finally {
  try {
    dbModule?.default?.close?.();
  } catch (error) {
    console.warn(`[task-board-handoff-smoke] Database close skipped: ${sanitize(error.message)}`);
  }

  process.chdir(projectRoot);

  try {
    await fs.rm(runtimeDir, { recursive: true, force: true });
  } catch (error) {
    console.warn(`[task-board-handoff-smoke] Runtime cleanup skipped: ${sanitize(error.message)}`);
  }
  try {
    await fs.rm(buildDir, { recursive: true, force: true });
  } catch (error) {
    console.warn(`[task-board-handoff-smoke] Build cleanup skipped: ${sanitize(error.message)}`);
  }
}

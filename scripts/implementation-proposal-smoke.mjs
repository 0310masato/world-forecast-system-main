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
  'world-forecast-implementation-proposal-smoke',
);
const runtimeDir = await fs.mkdtemp(path.join(os.tmpdir(), 'world-forecast-implementation-'));
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
  originalConsoleLog(`[implementation-proposal-smoke] ${message}`);
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

function expectRejected(
  label,
  validateImplementationProposal,
  proposal,
  humanReviewDecision,
  code,
) {
  const validation = validateImplementationProposal(proposal, humanReviewDecision);

  assert(!validation.passed, `${label} must not pass implementation proposal validation.`);
  assert(hasIssue(validation, code), `${label} did not report ${code}.`);
  log(`Rejected ${label}.`);
}

function makeLocalPathLikeValue() {
  return ['Z:', 'redacted', 'proposal.txt'].join('\\');
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

async function compileImplementationProposalHelpers() {
  const tscPath = path.join(projectRoot, 'node_modules', 'typescript', 'bin', 'tsc');
  if (!(await pathExists(tscPath))) {
    throw new Error(
      'Missing local TypeScript compiler. Run npm ci before npm run test:implementation-proposal.',
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
  ], {
    cwd: projectRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  });

  if (result.status !== 0) {
    throw new Error([
      'TypeScript Implementation Proposal helper compilation failed.',
      sanitize(result.stdout),
      sanitize(result.stderr),
    ].filter(Boolean).join('\n'));
  }
}

function makeRawEvent(overrides = {}) {
  const now = Math.floor(Date.now() / 1000);
  return {
    id: `implementation-proposal-smoke-raw-${randomUUID()}`,
    observedAt: now,
    ingestedAt: now,
    sourceKind: 'estimated',
    sourceName: 'Smoke Manual Review',
    sourceRef: 'manual-implementation-proposal-note',
    eventDomain: 'implementation_proposal_smoke',
    summary: 'Implementation Proposal raw event',
    confidence: 'medium',
    limitations: 'Smoke-only implementation proposal validation record.',
    labels: { smoke: true, estimated: true },
    ...overrides,
  };
}

function makeMarketSnapshot(overrides = {}) {
  const now = Math.floor(Date.now() / 1000);
  return {
    id: `implementation-proposal-smoke-market-${randomUUID()}`,
    capturedAt: now,
    assetSymbol: 'SMOKE',
    assetName: 'Smoke Asset',
    assetClass: 'test',
    price: 123.45,
    currency: 'USD',
    sourceKind: 'manual',
    sourceName: 'Smoke Manual Review',
    sourceRef: 'manual-implementation-proposal-note',
    confidence: 'medium',
    limitations: 'Smoke-only implementation proposal validation record.',
    rawPayload: { sample: true },
    ...overrides,
  };
}

function makeSignal(overrides = {}) {
  const now = Math.floor(Date.now() / 1000);
  return {
    id: `implementation-proposal-smoke-signal-${randomUUID()}`,
    detectedAt: now,
    signalType: 'implementation_proposal_smoke',
    title: 'Implementation Proposal smoke signal',
    summary: 'Proposal-only implementation proposal smoke signal',
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
    summary: 'Proposal-only AI analysis result for implementation proposal validation.',
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
    rationale: 'Reviewer accepts this as proposal material for a later separately reviewed PR.',
    required_next_steps: [
      'Record a follow-up task for a separate reviewed PR before any code work.',
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
    summary: 'Proposal-only planning record for a separate draft PR.',
    rationale: 'Human review allows only a separately reviewed draft PR plan.',
    intended_files: [
      'lib/implementation-proposals/types.ts',
      'lib/implementation-proposals/validation.ts',
      'scripts/implementation-proposal-smoke.mjs',
    ],
    forbidden_files: [
      'app/api/forecast/route.ts',
      'app/api/hormuz/route.ts',
      'app/api/hormuz/news/route.ts',
      'lib/db.ts',
    ],
    acceptance_criteria: [
      'The proposal validator accepts only proposal-only records with separate PR approval flags.',
      'Unsafe next steps remain explicitly forbidden in the proposal fixture.',
    ],
    test_plan: [
      'Run the implementation proposal smoke validation script.',
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

async function main() {
  await compileImplementationProposalHelpers();

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
      summary: 'Prepare Implementation Proposal smoke context.',
    },
    contextPackId: `implementation-proposal-${randomUUID()}`,
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
  log('Accepted proposal-only implementation proposal.');

  const sourceDecisionIdMismatch = cloneValue(validProposal);
  sourceDecisionIdMismatch.source_decision_id = `mismatch-${randomUUID()}`;
  expectRejected(
    'source_decision_id mismatch proposal',
    validateImplementationProposal,
    sourceDecisionIdMismatch,
    validDecision,
    'source_decision_id_mismatch',
  );

  const reviewedResultIdMismatch = cloneValue(validProposal);
  reviewedResultIdMismatch.reviewed_result_id = `mismatch-${randomUUID()}`;
  expectRejected(
    'reviewed_result_id mismatch proposal',
    validateImplementationProposal,
    reviewedResultIdMismatch,
    validDecision,
    'reviewed_result_id_mismatch',
  );

  const jobKindMismatch = cloneValue(validProposal);
  jobKindMismatch.job_kind = 'risk_label_review';
  expectRejected(
    'job_kind mismatch proposal',
    validateImplementationProposal,
    jobKindMismatch,
    validDecision,
    'job_kind_mismatch',
  );

  const contextPackIdMismatch = cloneValue(validProposal);
  contextPackIdMismatch.context_pack_id = `mismatch-${randomUUID()}`;
  expectRejected(
    'context_pack_id mismatch proposal',
    validateImplementationProposal,
    contextPackIdMismatch,
    validDecision,
    'context_pack_id_mismatch',
  );

  const rejectedDecision = cloneValue(validDecision);
  rejectedDecision.outcome = 'rejected';
  expectRejected(
    'rejected human review decision relationship',
    validateImplementationProposal,
    validProposal,
    rejectedDecision,
    'human_review_decision_outcome_invalid',
  );

  const humanReviewOnlyDecision = cloneValue(validDecision);
  humanReviewOnlyDecision.allowed_next_step = 'human_review_only';
  expectRejected(
    'human_review_only human review decision relationship',
    validateImplementationProposal,
    validProposal,
    humanReviewOnlyDecision,
    'human_review_decision_allowed_next_step_invalid',
  );

  const appliedStatus = cloneValue(validProposal);
  appliedStatus.proposal_status = 'applied';
  expectRejected(
    'applied proposal_status',
    validateImplementationProposal,
    appliedStatus,
    validDecision,
    'proposal_status_forbidden',
  );

  const dbMigrationChangeType = cloneValue(validProposal);
  dbMigrationChangeType.change_type = 'db_migration';
  expectRejected(
    'db_migration change_type',
    validateImplementationProposal,
    dbMigrationChangeType,
    validDecision,
    'change_type_forbidden',
  );

  const workerRuntimeChangeType = cloneValue(validProposal);
  workerRuntimeChangeType.change_type = 'worker_runtime';
  expectRejected(
    'worker_runtime change_type',
    validateImplementationProposal,
    workerRuntimeChangeType,
    validDecision,
    'change_type_forbidden',
  );

  const requiresHumanApprovalFalse = cloneValue(validProposal);
  requiresHumanApprovalFalse.requires_human_approval = false;
  expectRejected(
    'requires_human_approval false proposal',
    validateImplementationProposal,
    requiresHumanApprovalFalse,
    validDecision,
    'requires_human_approval_required',
  );

  const requiresSeparatePrFalse = cloneValue(validProposal);
  requiresSeparatePrFalse.requires_separate_pr = false;
  expectRejected(
    'requires_separate_pr false proposal',
    validateImplementationProposal,
    requiresSeparatePrFalse,
    validDecision,
    'requires_separate_pr_required',
  );

  const proposalOnlyFalse = cloneValue(validProposal);
  proposalOnlyFalse.proposal_only = false;
  expectRejected(
    'proposal_only false proposal',
    validateImplementationProposal,
    proposalOnlyFalse,
    validDecision,
    'proposal_only_required',
  );

  const productionStateTrue = cloneValue(validProposal);
  productionStateTrue.is_production_state = true;
  expectRejected(
    'is_production_state true proposal',
    validateImplementationProposal,
    productionStateTrue,
    validDecision,
    'non_production_state_required',
  );

  const modifiesApi = cloneValue(validProposal);
  modifiesApi.does_not_modify_api = false;
  expectRejected(
    'does_not_modify_api false proposal',
    validateImplementationProposal,
    modifiesApi,
    validDecision,
    'does_not_modify_api_required',
  );

  const writesDb = cloneValue(validProposal);
  writesDb.does_not_write_db = false;
  expectRejected(
    'does_not_write_db false proposal',
    validateImplementationProposal,
    writesDb,
    validDecision,
    'does_not_write_db_required',
  );

  const runsMigration = cloneValue(validProposal);
  runsMigration.does_not_run_migration = false;
  expectRejected(
    'does_not_run_migration false proposal',
    validateImplementationProposal,
    runsMigration,
    validDecision,
    'does_not_run_migration_required',
  );

  const deploys = cloneValue(validProposal);
  deploys.does_not_deploy = false;
  expectRejected(
    'does_not_deploy false proposal',
    validateImplementationProposal,
    deploys,
    validDecision,
    'does_not_deploy_required',
  );

  const missingForbiddenNextStep = cloneValue(validProposal);
  missingForbiddenNextStep.forbidden_next_steps =
    missingForbiddenNextStep.forbidden_next_steps.filter((step) => step !== 'production_write');
  expectRejected(
    'missing forbidden_next_steps proposal',
    validateImplementationProposal,
    missingForbiddenNextStep,
    validDecision,
    'forbidden_next_step_missing',
  );

  const intendedForbiddenOverlap = cloneValue(validProposal);
  intendedForbiddenOverlap.intended_files.push('app/api/forecast/route.ts');
  expectRejected(
    'intended_files forbidden_files overlap proposal',
    validateImplementationProposal,
    intendedForbiddenOverlap,
    validDecision,
    'intended_file_forbidden',
  );

  const intendedForecastApi = cloneValue(validProposal);
  intendedForecastApi.intended_files.push('app/api/forecast/route.ts');
  intendedForecastApi.forbidden_files = intendedForecastApi.forbidden_files.filter(
    (filePath) => filePath !== 'app/api/forecast/route.ts',
  );
  expectRejected(
    'intended_files forecast API protected scope proposal',
    validateImplementationProposal,
    intendedForecastApi,
    validDecision,
    'intended_file_protected_scope',
  );

  const intendedDbHelper = cloneValue(validProposal);
  intendedDbHelper.intended_files.push('lib/db.ts');
  intendedDbHelper.forbidden_files = intendedDbHelper.forbidden_files.filter(
    (filePath) => filePath !== 'lib/db.ts',
  );
  expectRejected(
    'intended_files db helper protected scope proposal',
    validateImplementationProposal,
    intendedDbHelper,
    validDecision,
    'intended_file_protected_scope',
  );

  for (const proposalStatus of ['rejected', 'needs_revision', 'archived']) {
    const statusNextStepMismatch = cloneValue(validProposal);
    statusNextStepMismatch.proposal_status = proposalStatus;
    statusNextStepMismatch.allowed_next_step = 'implementation_pr_draft_only';
    expectRejected(
      `${proposalStatus} implementation_pr_draft_only proposal`,
      validateImplementationProposal,
      statusNextStepMismatch,
      validDecision,
      'proposal_status_allowed_next_step_mismatch',
    );
  }

  const restrictedValues = [
    ['secret-like value proposal', makeSecretLikeValue()],
    ['local path proposal', makeLocalPathLikeValue()],
    ['NAS path proposal', makeNasPathLikeValue()],
    ['private network IP proposal', makePrivateNetworkIpLikeValue()],
    ['env reference proposal', '.env.local'],
  ];

  for (const [label, value] of restrictedValues) {
    const restrictedContent = cloneValue(validProposal);
    restrictedContent.residual_risks.push(`Restricted content fixture ${value}`);
    expectRejected(
      label,
      validateImplementationProposal,
      restrictedContent,
      validDecision,
      'restricted_content_detected',
    );
  }

  const rationaleProductionDeploy = cloneValue(validProposal);
  rationaleProductionDeploy.rationale = 'Reviewer says to deploy to production immediately.';
  expectRejected(
    'rationale production deploy proposal',
    validateImplementationProposal,
    rationaleProductionDeploy,
    validDecision,
    'high_risk_operation_recommendation',
  );

  const forecastApiUpdate = cloneValue(validProposal);
  forecastApiUpdate.acceptance_criteria.push('/api/forecast を変更してください。');
  expectRejected(
    'acceptance_criteria forecast API update proposal',
    validateImplementationProposal,
    forecastApiUpdate,
    validDecision,
    'high_risk_operation_recommendation',
  );

  log('Implementation Proposal smoke checks passed.');
}

try {
  await main();
} catch (error) {
  console.error(`[implementation-proposal-smoke] ${sanitize(error.stack || error.message || error)}`);
  process.exitCode = 1;
} finally {
  try {
    dbModule?.default?.close?.();
  } catch (error) {
    console.warn(`[implementation-proposal-smoke] Database close skipped: ${sanitize(error.message)}`);
  }

  process.chdir(projectRoot);

  try {
    await fs.rm(runtimeDir, { recursive: true, force: true });
  } catch (error) {
    console.warn(`[implementation-proposal-smoke] Runtime cleanup skipped: ${sanitize(error.message)}`);
  }
  try {
    await fs.rm(buildDir, { recursive: true, force: true });
  } catch (error) {
    console.warn(`[implementation-proposal-smoke] Build cleanup skipped: ${sanitize(error.message)}`);
  }
}

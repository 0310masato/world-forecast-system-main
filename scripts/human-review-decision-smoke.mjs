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
  'world-forecast-human-review-decision-smoke',
);
const runtimeDir = await fs.mkdtemp(path.join(os.tmpdir(), 'world-forecast-human-review-'));
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
  originalConsoleLog(`[human-review-decision-smoke] ${message}`);
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

function expectRejected(label, validateHumanReviewDecision, decision, reviewedResult, code) {
  const validation = validateHumanReviewDecision(decision, reviewedResult);

  assert(!validation.passed, `${label} must not pass human review decision validation.`);
  assert(hasIssue(validation, code), `${label} did not report ${code}.`);
  log(`Rejected ${label}.`);
}

function makeLocalPathLikeValue() {
  return ['Z:', 'redacted', 'secret.txt'].join('\\');
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

async function compileHumanReviewDecisionHelpers() {
  const tscPath = path.join(projectRoot, 'node_modules', 'typescript', 'bin', 'tsc');
  if (!(await pathExists(tscPath))) {
    throw new Error(
      'Missing local TypeScript compiler. Run npm ci before npm run test:human-review-decision.',
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
  ], {
    cwd: projectRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  });

  if (result.status !== 0) {
    throw new Error([
      'TypeScript Human Review Decision helper compilation failed.',
      sanitize(result.stdout),
      sanitize(result.stderr),
    ].filter(Boolean).join('\n'));
  }
}

function makeRawEvent(overrides = {}) {
  const now = Math.floor(Date.now() / 1000);
  return {
    id: `human-review-decision-smoke-raw-${randomUUID()}`,
    observedAt: now,
    ingestedAt: now,
    sourceKind: 'estimated',
    sourceName: 'Smoke Manual Review',
    sourceRef: 'manual-human-review-decision-note',
    eventDomain: 'human_review_decision_smoke',
    summary: 'Human Review Decision raw event',
    confidence: 'medium',
    limitations: 'Smoke-only human review decision validation record.',
    labels: { smoke: true, estimated: true },
    ...overrides,
  };
}

function makeMarketSnapshot(overrides = {}) {
  const now = Math.floor(Date.now() / 1000);
  return {
    id: `human-review-decision-smoke-market-${randomUUID()}`,
    capturedAt: now,
    assetSymbol: 'SMOKE',
    assetName: 'Smoke Asset',
    assetClass: 'test',
    price: 123.45,
    currency: 'USD',
    sourceKind: 'manual',
    sourceName: 'Smoke Manual Review',
    sourceRef: 'manual-human-review-decision-note',
    confidence: 'medium',
    limitations: 'Smoke-only human review decision validation record.',
    rawPayload: { sample: true },
    ...overrides,
  };
}

function makeSignal(overrides = {}) {
  const now = Math.floor(Date.now() / 1000);
  return {
    id: `human-review-decision-smoke-signal-${randomUUID()}`,
    detectedAt: now,
    signalType: 'human_review_decision_smoke',
    title: 'Human Review Decision smoke signal',
    summary: 'Proposal-only human review decision smoke signal',
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
    summary: 'Proposal-only AI analysis result for human review decision validation.',
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
      'Human reviewer checks evidence, limitations, and safety labels before any follow-up.',
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

async function main() {
  await compileHumanReviewDecisionHelpers();

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
  let requiredForbiddenNextSteps;

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
      HUMAN_REVIEW_DECISION_REQUIRED_FORBIDDEN_NEXT_STEPS: requiredForbiddenNextSteps,
    } = require(path.join(buildDir, 'lib', 'human-review', 'types.js')));
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
      summary: 'Prepare Human Review Decision smoke context.',
    },
    contextPackId: `human-review-decision-${randomUUID()}`,
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

  const validDecision = makeValidDecision(validResult, requiredForbiddenNextSteps);
  const decisionValidation = validateHumanReviewDecision(validDecision, validResult);

  assert(decisionValidation.passed === true, 'Valid human review decision must pass validation.');
  assert(decisionValidation.issues.length === 0, 'Valid human review decision must have no issues.');
  log('Accepted approved_for_later_implementation decision.');

  const applied = cloneValue(validDecision);
  applied.outcome = 'applied';
  expectRejected(
    'applied outcome decision',
    validateHumanReviewDecision,
    applied,
    validResult,
    'outcome_forbidden',
  );

  const deployed = cloneValue(validDecision);
  deployed.outcome = 'deployed';
  expectRejected(
    'deployed outcome decision',
    validateHumanReviewDecision,
    deployed,
    validResult,
    'outcome_forbidden',
  );

  const requiresSeparateImplementationFalse = cloneValue(validDecision);
  requiresSeparateImplementationFalse.requires_separate_implementation = false;
  expectRejected(
    'requires_separate_implementation false decision',
    validateHumanReviewDecision,
    requiresSeparateImplementationFalse,
    validResult,
    'requires_separate_implementation_required',
  );

  const productionStateTrue = cloneValue(validDecision);
  productionStateTrue.is_production_state = true;
  expectRejected(
    'is_production_state true decision',
    validateHumanReviewDecision,
    productionStateTrue,
    validResult,
    'non_production_state_required',
  );

  const modifiesApi = cloneValue(validDecision);
  modifiesApi.does_not_modify_api = false;
  expectRejected(
    'does_not_modify_api false decision',
    validateHumanReviewDecision,
    modifiesApi,
    validResult,
    'does_not_modify_api_required',
  );

  const writesDb = cloneValue(validDecision);
  writesDb.does_not_write_db = false;
  expectRejected(
    'does_not_write_db false decision',
    validateHumanReviewDecision,
    writesDb,
    validResult,
    'does_not_write_db_required',
  );

  const publishesExternally = cloneValue(validDecision);
  publishesExternally.does_not_publish_externally = false;
  expectRejected(
    'does_not_publish_externally false decision',
    validateHumanReviewDecision,
    publishesExternally,
    validResult,
    'does_not_publish_externally_required',
  );

  const missingForbiddenNextStep = cloneValue(validDecision);
  missingForbiddenNextStep.forbidden_next_steps =
    missingForbiddenNextStep.forbidden_next_steps.filter((step) => step !== 'production_write');
  expectRejected(
    'missing forbidden_next_steps decision',
    validateHumanReviewDecision,
    missingForbiddenNextStep,
    validResult,
    'forbidden_next_step_missing',
  );

  const rejectedWithSeparateImplementation = cloneValue(validDecision);
  rejectedWithSeparateImplementation.outcome = 'rejected';
  rejectedWithSeparateImplementation.allowed_next_step = 'separate_implementation_pr_only';
  expectRejected(
    'rejected separate implementation decision',
    validateHumanReviewDecision,
    rejectedWithSeparateImplementation,
    validResult,
    'outcome_allowed_next_step_mismatch',
  );

  const needsRevisionWithSeparateImplementation = cloneValue(validDecision);
  needsRevisionWithSeparateImplementation.outcome = 'needs_revision';
  needsRevisionWithSeparateImplementation.allowed_next_step = 'separate_implementation_pr_only';
  expectRejected(
    'needs_revision separate implementation decision',
    validateHumanReviewDecision,
    needsRevisionWithSeparateImplementation,
    validResult,
    'outcome_allowed_next_step_mismatch',
  );

  const archivedWithSeparateImplementation = cloneValue(validDecision);
  archivedWithSeparateImplementation.outcome = 'archived_as_informational';
  archivedWithSeparateImplementation.allowed_next_step = 'separate_implementation_pr_only';
  expectRejected(
    'archived_as_informational separate implementation decision',
    validateHumanReviewDecision,
    archivedWithSeparateImplementation,
    validResult,
    'outcome_allowed_next_step_mismatch',
  );

  const approvedWithHumanReviewOnly = cloneValue(validDecision);
  approvedWithHumanReviewOnly.outcome = 'approved_for_later_implementation';
  approvedWithHumanReviewOnly.allowed_next_step = 'human_review_only';
  expectRejected(
    'approved human_review_only decision',
    validateHumanReviewDecision,
    approvedWithHumanReviewOnly,
    validResult,
    'outcome_allowed_next_step_mismatch',
  );

  const restrictedValues = [
    ['secret-like value decision', makeSecretLikeValue()],
    ['local path decision', makeLocalPathLikeValue()],
    ['NAS path decision', makeNasPathLikeValue()],
    ['private network IP decision', makePrivateNetworkIpLikeValue()],
    ['env reference decision', '.env.local'],
  ];

  for (const [label, value] of restrictedValues) {
    const restrictedContent = cloneValue(validDecision);
    restrictedContent.residual_risks.push(`Restricted content fixture ${value}`);
    expectRejected(
      label,
      validateHumanReviewDecision,
      restrictedContent,
      validResult,
      'restricted_content_detected',
    );
  }

  const reviewedResultIdMismatch = cloneValue(validDecision);
  reviewedResultIdMismatch.reviewed_result_id = `mismatch-${randomUUID()}`;
  expectRejected(
    'reviewed_result_id mismatch decision',
    validateHumanReviewDecision,
    reviewedResultIdMismatch,
    validResult,
    'reviewed_result_id_mismatch',
  );

  const contextPackIdMismatch = cloneValue(validDecision);
  contextPackIdMismatch.context_pack_id = `mismatch-${randomUUID()}`;
  expectRejected(
    'context_pack_id mismatch decision',
    validateHumanReviewDecision,
    contextPackIdMismatch,
    validResult,
    'reviewed_result_context_pack_id_mismatch',
  );

  const rationaleProductionDeploy = cloneValue(validDecision);
  rationaleProductionDeploy.rationale = 'Reviewer says to deploy to production immediately.';
  expectRejected(
    'rationale production deploy decision',
    validateHumanReviewDecision,
    rationaleProductionDeploy,
    validResult,
    'high_risk_operation_recommendation',
  );

  const forecastApiUpdate = cloneValue(validDecision);
  forecastApiUpdate.required_next_steps.push('/api/forecast を変更してください。');
  expectRejected(
    'required_next_steps forecast API update decision',
    validateHumanReviewDecision,
    forecastApiUpdate,
    validResult,
    'high_risk_operation_recommendation',
  );

  log('Human Review Decision smoke checks passed.');
}

try {
  await main();
} catch (error) {
  console.error(`[human-review-decision-smoke] ${sanitize(error.stack || error.message || error)}`);
  process.exitCode = 1;
} finally {
  try {
    dbModule?.default?.close?.();
  } catch (error) {
    console.warn(`[human-review-decision-smoke] Database close skipped: ${sanitize(error.message)}`);
  }

  process.chdir(projectRoot);

  try {
    await fs.rm(runtimeDir, { recursive: true, force: true });
  } catch (error) {
    console.warn(`[human-review-decision-smoke] Runtime cleanup skipped: ${sanitize(error.message)}`);
  }
  try {
    await fs.rm(buildDir, { recursive: true, force: true });
  } catch (error) {
    console.warn(`[human-review-decision-smoke] Build cleanup skipped: ${sanitize(error.message)}`);
  }
}

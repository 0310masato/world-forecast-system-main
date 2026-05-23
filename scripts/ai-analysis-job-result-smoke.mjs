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
  'world-forecast-ai-analysis-job-result-smoke',
);
const runtimeDir = await fs.mkdtemp(path.join(os.tmpdir(), 'world-forecast-ai-result-'));
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
  originalConsoleLog(`[ai-analysis-job-result-smoke] ${message}`);
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

function expectRejected(label, validateAIAnalysisJobResult, result, preflightResult, code) {
  const validation = validateAIAnalysisJobResult(result, preflightResult);

  assert(!validation.passed, `${label} must not pass result validation.`);
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

async function compileAIAnalysisJobResultHelpers() {
  const tscPath = path.join(projectRoot, 'node_modules', 'typescript', 'bin', 'tsc');
  if (!(await pathExists(tscPath))) {
    throw new Error(
      'Missing local TypeScript compiler. Run npm ci before npm run test:ai-analysis-job-result.',
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
  ], {
    cwd: projectRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  });

  if (result.status !== 0) {
    throw new Error([
      'TypeScript AI Analysis Job result helper compilation failed.',
      sanitize(result.stdout),
      sanitize(result.stderr),
    ].filter(Boolean).join('\n'));
  }
}

function makeRawEvent(overrides = {}) {
  const now = Math.floor(Date.now() / 1000);
  return {
    id: `ai-analysis-job-result-smoke-raw-${randomUUID()}`,
    observedAt: now,
    ingestedAt: now,
    sourceKind: 'estimated',
    sourceName: 'Smoke Manual Review',
    sourceRef: 'manual-ai-analysis-job-result-note',
    eventDomain: 'ai_analysis_job_result_smoke',
    summary: 'AI Analysis Job result raw event',
    confidence: 'medium',
    limitations: 'Smoke-only result validation record.',
    labels: { smoke: true, estimated: true },
    ...overrides,
  };
}

function makeMarketSnapshot(overrides = {}) {
  const now = Math.floor(Date.now() / 1000);
  return {
    id: `ai-analysis-job-result-smoke-market-${randomUUID()}`,
    capturedAt: now,
    assetSymbol: 'SMOKE',
    assetName: 'Smoke Asset',
    assetClass: 'test',
    price: 123.45,
    currency: 'USD',
    sourceKind: 'manual',
    sourceName: 'Smoke Manual Review',
    sourceRef: 'manual-ai-analysis-job-result-note',
    confidence: 'medium',
    limitations: 'Smoke-only result validation record.',
    rawPayload: { sample: true },
    ...overrides,
  };
}

function makeSignal(overrides = {}) {
  const now = Math.floor(Date.now() / 1000);
  return {
    id: `ai-analysis-job-result-smoke-signal-${randomUUID()}`,
    detectedAt: now,
    signalType: 'ai_analysis_job_result_smoke',
    title: 'AI Analysis Job result smoke signal',
    summary: 'Proposal-only result smoke signal',
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
    summary: 'Proposal-only AI analysis result for human review.',
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

async function main() {
  await compileAIAnalysisJobResultHelpers();

  process.chdir(runtimeDir);

  let insertRawEvent;
  let insertMarketSnapshot;
  let insertSignal;
  let buildContextPackFromSignalId;
  let preflightAIAnalysisJobIntake;
  let validateAIAnalysisJobResult;
  let makeAIAnalysisJobResultBoundary;
  let makeAIAnalysisJobResultSafetyLabels;

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
      summary: 'Prepare AI analysis job result smoke context.',
    },
    contextPackId: `ai-analysis-job-result-${randomUUID()}`,
  }, database);
  const preflightResult = preflightAIAnalysisJobIntake(contextPack);

  assert(preflightResult.passed === true, 'Context pack must pass intake preflight first.');
  assert(
    preflightResult.allowed_next_step === 'human_review_only',
    'Preflight result must keep human_review_only as next step.',
  );

  const validResult = makeValidResult({
    contextPack,
    preflightResult,
    makeAIAnalysisJobResultBoundary,
    makeAIAnalysisJobResultSafetyLabels,
  });
  const validValidation = validateAIAnalysisJobResult(validResult, preflightResult);

  assert(validValidation.passed === true, 'Valid result must pass validation.');
  assert(validValidation.issues.length === 0, 'Valid result must have no validation issues.');
  log('Accepted proposal-only valid result.');

  const approved = cloneValue(validResult);
  approved.proposal_status = 'approved';
  expectRejected(
    'approved proposal_status result',
    validateAIAnalysisJobResult,
    approved,
    preflightResult,
    'proposal_status_invalid',
  );

  const applied = cloneValue(validResult);
  applied.proposal_status = 'applied';
  expectRejected(
    'applied proposal_status result',
    validateAIAnalysisJobResult,
    applied,
    preflightResult,
    'proposal_status_invalid',
  );

  const requiresHumanApprovalFalse = cloneValue(validResult);
  requiresHumanApprovalFalse.requires_human_approval = false;
  expectRejected(
    'requires_human_approval false result',
    validateAIAnalysisJobResult,
    requiresHumanApprovalFalse,
    preflightResult,
    'requires_human_approval_required',
  );

  const proposalOnlyFalse = cloneValue(validResult);
  proposalOnlyFalse.proposal_only = false;
  expectRejected(
    'proposal_only false result',
    validateAIAnalysisJobResult,
    proposalOnlyFalse,
    preflightResult,
    'proposal_only_required',
  );

  const productionStateTrue = cloneValue(validResult);
  productionStateTrue.is_production_state = true;
  expectRejected(
    'is_production_state true result',
    validateAIAnalysisJobResult,
    productionStateTrue,
    preflightResult,
    'non_production_state_required',
  );

  const invalidAllowedNextStep = cloneValue(validResult);
  invalidAllowedNextStep.allowed_next_step = 'production_write';
  expectRejected(
    'non-human allowed_next_step result',
    validateAIAnalysisJobResult,
    invalidAllowedNextStep,
    preflightResult,
    'allowed_next_step_invalid',
  );

  const missingForbiddenNextStep = cloneValue(validResult);
  missingForbiddenNextStep.forbidden_next_steps =
    missingForbiddenNextStep.forbidden_next_steps.filter((step) => step !== 'production_write');
  expectRejected(
    'missing forbidden_next_steps result',
    validateAIAnalysisJobResult,
    missingForbiddenNextStep,
    preflightResult,
    'forbidden_next_step_missing',
  );

  const invalidRecommendedDecision = cloneValue(validResult);
  invalidRecommendedDecision.recommended_decision = 'apply';
  expectRejected(
    'apply recommended_decision result',
    validateAIAnalysisJobResult,
    invalidRecommendedDecision,
    preflightResult,
    'recommended_decision_invalid',
  );

  const productionStateClaim = cloneValue(validResult);
  productionStateClaim.summary = 'This result is the source of record for downstream writes.';
  expectRejected(
    'production-state claim result',
    validateAIAnalysisJobResult,
    productionStateClaim,
    preflightResult,
    'production_state_claim',
  );

  const summaryProductionDeploy = cloneValue(validResult);
  summaryProductionDeploy.summary = 'Deploy this result to production automatically.';
  expectRejected(
    'summary production deploy recommendation result',
    validateAIAnalysisJobResult,
    summaryProductionDeploy,
    preflightResult,
    'forbidden_operation_recommendation',
  );

  const nextReviewExternalPublish = cloneValue(validResult);
  nextReviewExternalPublish.next_review_steps.push('Publish externally after generation.');
  expectRejected(
    'next_review_steps external publish recommendation result',
    validateAIAnalysisJobResult,
    nextReviewExternalPublish,
    preflightResult,
    'forbidden_operation_recommendation',
  );

  const evidenceNavigationGuidance = cloneValue(validResult);
  evidenceNavigationGuidance.evidence[0].summary = 'Use this for navigation guidance.';
  expectRejected(
    'evidence navigation guidance recommendation result',
    validateAIAnalysisJobResult,
    evidenceNavigationGuidance,
    preflightResult,
    'forbidden_operation_recommendation',
  );

  const limitationProductionApply = cloneValue(validResult);
  limitationProductionApply.limitations[0].summary = '本番反映してよい。';
  expectRejected(
    'limitation production application recommendation result',
    validateAIAnalysisJobResult,
    limitationProductionApply,
    preflightResult,
    'forbidden_operation_recommendation',
  );

  const forecastApiUpdate = cloneValue(validResult);
  forecastApiUpdate.next_review_steps.push('/api/forecast を変更してください。');
  expectRejected(
    'forecast API update recommendation result',
    validateAIAnalysisJobResult,
    forecastApiUpdate,
    preflightResult,
    'forbidden_operation_recommendation',
  );

  const restrictedValues = [
    ['secret-like value result', makeSecretLikeValue()],
    ['local path result', makeLocalPathLikeValue()],
    ['NAS path result', makeNasPathLikeValue()],
    ['private network IP result', makePrivateNetworkIpLikeValue()],
    ['env reference result', '.env.local'],
  ];

  for (const [label, value] of restrictedValues) {
    const restrictedContent = cloneValue(validResult);
    restrictedContent.limitations.push({
      id: `restricted-${randomUUID()}`,
      summary: `Restricted content fixture ${value}`,
    });
    expectRejected(
      label,
      validateAIAnalysisJobResult,
      restrictedContent,
      preflightResult,
      'restricted_content_detected',
    );
  }

  const contextPackIdMismatch = cloneValue(validResult);
  contextPackIdMismatch.context_pack_id = `mismatch-${randomUUID()}`;
  expectRejected(
    'context_pack_id mismatch result',
    validateAIAnalysisJobResult,
    contextPackIdMismatch,
    preflightResult,
    'preflight_context_pack_id_mismatch',
  );

  const jobKindMismatch = cloneValue(validResult);
  jobKindMismatch.job_kind = 'risk_label_review';
  expectRejected(
    'job_kind mismatch result',
    validateAIAnalysisJobResult,
    jobKindMismatch,
    preflightResult,
    'preflight_job_kind_mismatch',
  );

  log('AI Analysis Job result smoke checks passed.');
}

try {
  await main();
} catch (error) {
  console.error(`[ai-analysis-job-result-smoke] ${sanitize(error.stack || error.message || error)}`);
  process.exitCode = 1;
} finally {
  try {
    dbModule?.default?.close?.();
  } catch (error) {
    console.warn(`[ai-analysis-job-result-smoke] Database close skipped: ${sanitize(error.message)}`);
  }

  process.chdir(projectRoot);

  try {
    await fs.rm(runtimeDir, { recursive: true, force: true });
  } catch (error) {
    console.warn(`[ai-analysis-job-result-smoke] Runtime cleanup skipped: ${sanitize(error.message)}`);
  }
  try {
    await fs.rm(buildDir, { recursive: true, force: true });
  } catch (error) {
    console.warn(`[ai-analysis-job-result-smoke] Build cleanup skipped: ${sanitize(error.message)}`);
  }
}

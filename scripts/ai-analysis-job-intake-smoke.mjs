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
  'world-forecast-ai-analysis-job-smoke',
);
const runtimeDir = await fs.mkdtemp(path.join(os.tmpdir(), 'world-forecast-ai-analysis-job-'));
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
  originalConsoleLog(`[ai-analysis-job-smoke] ${message}`);
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function clonePack(pack) {
  return JSON.parse(JSON.stringify(pack));
}

function hasIssue(result, code) {
  return result.issues.some((issue) => issue.code === code);
}

function expectBlocked(label, preflightAIAnalysisJobIntake, pack, code) {
  const result = preflightAIAnalysisJobIntake(pack);

  assert(!result.passed, `${label} must not pass preflight.`);
  assert(hasIssue(result, code), `${label} did not report ${code}.`);
  assert(
    result.allowed_next_step === 'human_review_only',
    `${label} must keep human_review_only as the allowed next step.`,
  );
  log(`Rejected ${label}.`);
}

function expectReviewIssue(label, preflightAIAnalysisJobIntake, pack, code) {
  const result = preflightAIAnalysisJobIntake(pack);

  assert(result.passed, `${label} should remain passable for human review.`);
  assert(hasIssue(result, code), `${label} did not report ${code}.`);
  assert(
    result.allowed_next_step === 'human_review_only',
    `${label} must keep human_review_only as the allowed next step.`,
  );
  log(`Recorded review issue for ${label}.`);
}

async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function compileAIAnalysisJobHelpers() {
  const tscPath = path.join(projectRoot, 'node_modules', 'typescript', 'bin', 'tsc');
  if (!(await pathExists(tscPath))) {
    throw new Error('Missing local TypeScript compiler. Run npm ci before npm run test:ai-analysis-job.');
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
  ], {
    cwd: projectRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  });

  if (result.status !== 0) {
    throw new Error([
      'TypeScript AI Analysis Job helper compilation failed.',
      sanitize(result.stdout),
      sanitize(result.stderr),
    ].filter(Boolean).join('\n'));
  }
}

function makeRawEvent(overrides = {}) {
  const now = Math.floor(Date.now() / 1000);
  return {
    id: `ai-analysis-job-smoke-raw-${randomUUID()}`,
    observedAt: now,
    ingestedAt: now,
    sourceKind: 'estimated',
    sourceName: 'Smoke Manual Review',
    sourceRef: 'manual-ai-analysis-job-note',
    eventDomain: 'ai_analysis_job_smoke',
    summary: 'AI Analysis Job intake raw event',
    confidence: 'medium',
    limitations: 'Smoke-only intake validation record.',
    labels: { smoke: true, estimated: true },
    ...overrides,
  };
}

function makeMarketSnapshot(overrides = {}) {
  const now = Math.floor(Date.now() / 1000);
  return {
    id: `ai-analysis-job-smoke-market-${randomUUID()}`,
    capturedAt: now,
    assetSymbol: 'SMOKE',
    assetName: 'Smoke Asset',
    assetClass: 'test',
    price: 123.45,
    currency: 'USD',
    sourceKind: 'manual',
    sourceName: 'Smoke Manual Review',
    sourceRef: 'manual-ai-analysis-job-note',
    confidence: 'medium',
    limitations: 'Smoke-only intake validation record.',
    rawPayload: { sample: true },
    ...overrides,
  };
}

function makeSignal(overrides = {}) {
  const now = Math.floor(Date.now() / 1000);
  return {
    id: `ai-analysis-job-smoke-signal-${randomUUID()}`,
    detectedAt: now,
    signalType: 'ai_analysis_job_smoke',
    title: 'AI Analysis Job intake smoke signal',
    summary: 'Proposal-only intake smoke signal',
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

async function main() {
  await compileAIAnalysisJobHelpers();

  process.chdir(runtimeDir);

  let insertRawEvent;
  let insertMarketSnapshot;
  let insertSignal;
  let buildContextPackFromSignalId;
  let preflightAIAnalysisJobIntake;

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
  const validPack = buildContextPackFromSignalId({
    signalId: signal.id,
    purpose: {
      job_type: 'forecast_review_notes',
      summary: 'Prepare AI analysis job intake smoke context.',
    },
    contextPackId: `ai-analysis-job-intake-${randomUUID()}`,
  }, database);
  const validResult = preflightAIAnalysisJobIntake(validPack);

  assert(validResult.passed === true, 'Valid context pack must pass preflight.');
  assert(
    validResult.status === 'ready_for_human_review',
    'Valid context pack must be ready for human review.',
  );
  assert(validResult.human_review_required === true, 'Preflight result must require human review.');
  assert(
    validResult.allowed_next_step === 'human_review_only',
    'Preflight result must only allow human review next.',
  );
  assert(
    validResult.forbidden_next_steps.includes('production_write'),
    'Preflight result must forbid production writes.',
  );
  assert(
    validResult.qa_gates.every((gate) => gate.passed),
    'Valid context pack gates must pass.',
  );

  const now = Math.floor(Date.now() / 1000);
  const staleRaw = insertRawEvent(makeRawEvent({
    observedAt: now - 7_200,
    ingestedAt: now - 7_200,
    sourceKind: 'manual',
    confidence: 'medium',
    limitations: 'Stale record limitation must be preserved.',
  }));
  const staleSignal = insertSignal(makeSignal({
    relatedRawEventIds: [staleRaw.id],
  }));
  const stalePack = buildContextPackFromSignalId({
    signalId: staleSignal.id,
    purpose: {
      job_type: 'miss_pattern_review',
      summary: 'Prepare stale context for human review.',
    },
    contextPackId: `ai-analysis-job-stale-${randomUUID()}`,
    now,
    staleAfterSeconds: 60,
  }, database);
  expectReviewIssue('stale record pack', preflightAIAnalysisJobIntake, stalePack, 'stale_record');

  const includedRaw = insertRawEvent(makeRawEvent());
  const limitedOutRaw = insertRawEvent(makeRawEvent());
  const excludedSignal = insertSignal(makeSignal({
    relatedRawEventIds: [includedRaw.id, limitedOutRaw.id],
  }));
  const excludedPack = buildContextPackFromSignalId({
    signalId: excludedSignal.id,
    purpose: {
      job_type: 'operator_review_context',
      summary: 'Prepare context with an excluded record reason.',
    },
    contextPackId: `ai-analysis-job-excluded-${randomUUID()}`,
    maxRawEvents: 1,
  }, database);
  assert(excludedPack.excluded_records.length > 0, 'Excluded pack must include excluded records.');
  expectReviewIssue(
    'excluded record pack',
    preflightAIAnalysisJobIntake,
    excludedPack,
    'excluded_record_present',
  );

  const humanReviewFalse = clonePack(validPack);
  humanReviewFalse.human_review_required = false;
  expectBlocked(
    'human_review_required false pack',
    preflightAIAnalysisJobIntake,
    humanReviewFalse,
    'human_review_required',
  );

  const proposalOnlyFalse = clonePack(validPack);
  proposalOnlyFalse.proposal_only = false;
  expectBlocked(
    'proposal_only false pack',
    preflightAIAnalysisJobIntake,
    proposalOnlyFalse,
    'proposal_only_required',
  );

  const productionStateTrue = clonePack(validPack);
  productionStateTrue.is_production_state = true;
  expectBlocked(
    'is_production_state true pack',
    preflightAIAnalysisJobIntake,
    productionStateTrue,
    'non_production_state_required',
  );

  const emptyPolicyRefs = clonePack(validPack);
  emptyPolicyRefs.policy_refs = [];
  expectBlocked(
    'empty policy_refs pack',
    preflightAIAnalysisJobIntake,
    emptyPolicyRefs,
    'policy_refs_empty',
  );

  const invalidJobType = clonePack(validPack);
  invalidJobType.purpose.job_type = 'unsupported_ai_analysis_job';
  expectBlocked(
    'invalid job_type pack',
    preflightAIAnalysisJobIntake,
    invalidJobType,
    'job_type_invalid',
  );

  const restrictedContent = clonePack(validPack);
  restrictedContent.limitations.push('api_key=REDACTED must be rejected.');
  expectBlocked(
    'restricted content pack',
    preflightAIAnalysisJobIntake,
    restrictedContent,
    'restricted_content_detected',
  );

  const missingExcludedReason = clonePack(excludedPack);
  delete missingExcludedReason.excluded_records[0].reason;
  expectBlocked(
    'excluded record without reason pack',
    preflightAIAnalysisJobIntake,
    missingExcludedReason,
    'excluded_record_reason_missing',
  );

  log('AI Analysis Job intake smoke checks passed.');
}

try {
  await main();
} catch (error) {
  console.error(`[ai-analysis-job-smoke] ${sanitize(error.stack || error.message || error)}`);
  process.exitCode = 1;
} finally {
  try {
    dbModule?.default?.close?.();
  } catch (error) {
    console.warn(`[ai-analysis-job-smoke] Database close skipped: ${sanitize(error.message)}`);
  }

  process.chdir(projectRoot);

  try {
    await fs.rm(runtimeDir, { recursive: true, force: true });
  } catch (error) {
    console.warn(`[ai-analysis-job-smoke] Runtime cleanup skipped: ${sanitize(error.message)}`);
  }
  try {
    await fs.rm(buildDir, { recursive: true, force: true });
  } catch (error) {
    console.warn(`[ai-analysis-job-smoke] Build cleanup skipped: ${sanitize(error.message)}`);
  }
}

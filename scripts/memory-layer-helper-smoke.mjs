import { spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { createRequire } from 'node:module';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const require = createRequire(import.meta.url);
const projectRoot = process.cwd();
const buildDir = path.join(projectRoot, 'node_modules', '.cache', 'world-forecast-memory-smoke');
const runtimeDir = await fs.mkdtemp(path.join(os.tmpdir(), 'world-forecast-memory-'));
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
  console.log(`[memory-smoke] ${message}`);
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function expectRejected(label, action) {
  try {
    action();
  } catch {
    log(`Rejected ${label}.`);
    return;
  }

  throw new Error(`Expected rejection for ${label}.`);
}

function makeLocalPathLikeValue() {
  return ['Z:', 'redacted', 'secret.txt'].join('\\');
}

function makeNasPathLikeValue() {
  return ['A:', 'AI-System', 'redacted'].join('/');
}

async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function compileMemoryHelpers() {
  const tscPath = path.join(projectRoot, 'node_modules', 'typescript', 'bin', 'tsc');
  if (!(await pathExists(tscPath))) {
    throw new Error('Missing local TypeScript compiler. Run npm ci before npm run test:memory.');
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
  ], {
    cwd: projectRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  });

  if (result.status !== 0) {
    throw new Error([
      'TypeScript helper compilation failed.',
      sanitize(result.stdout),
      sanitize(result.stderr),
    ].filter(Boolean).join('\n'));
  }
}

function makeRawEvent(overrides = {}) {
  const now = Math.floor(Date.now() / 1000);
  return {
    id: `memory-smoke-raw-${randomUUID()}`,
    observedAt: now,
    ingestedAt: now,
    sourceKind: 'manual',
    sourceName: 'Smoke Manual Review',
    sourceRef: 'manual-smoke-note',
    eventDomain: 'memory_smoke',
    summary: 'Memory helper smoke event',
    confidence: 'low',
    limitations: 'Smoke-only helper validation record.',
    labels: { smoke: true },
    ...overrides,
  };
}

function makeMarketSnapshot(overrides = {}) {
  const now = Math.floor(Date.now() / 1000);
  return {
    id: `memory-smoke-market-${randomUUID()}`,
    capturedAt: now,
    assetSymbol: 'SMOKE',
    assetName: 'Smoke Asset',
    assetClass: 'test',
    price: 123.45,
    currency: 'USD',
    sourceKind: 'manual',
    sourceName: 'Smoke Manual Review',
    sourceRef: 'manual-smoke-note',
    confidence: 'medium',
    limitations: 'Smoke-only helper validation record.',
    ...overrides,
  };
}

function makeSignal(overrides = {}) {
  const now = Math.floor(Date.now() / 1000);
  return {
    id: `memory-smoke-signal-${randomUUID()}`,
    detectedAt: now,
    signalType: 'memory_smoke',
    title: 'Memory helper smoke signal',
    summary: 'Proposal-only smoke signal',
    severity: 'low',
    direction: 'neutral',
    strength: 0.2,
    confidence: 'low',
    sourceKind: 'manual',
    labels: { smoke: true, proposal_only: true },
    limitations: 'Smoke-only helper validation record.',
    proposalStatus: 'proposal',
    humanReviewRequired: true,
    ...overrides,
  };
}

async function main() {
  await compileMemoryHelpers();

  process.chdir(runtimeDir);

  const { insertRawEvent, insertMarketSnapshot, insertSignal } = require(
    path.join(buildDir, 'lib', 'memory', 'write.js'),
  );
  const {
    getRecentRawEvents,
    getRecentMarketSnapshots,
    getRecentSignals,
    getSignalById,
  } = require(path.join(buildDir, 'lib', 'memory', 'read.js'));
  dbModule = require(path.join(buildDir, 'lib', 'db.js'));

  const lowRaw = insertRawEvent(makeRawEvent({ confidence: 'low' }));
  const mediumMarket = insertMarketSnapshot(makeMarketSnapshot({ confidence: 'medium' }));
  const mediumSignal = insertSignal(makeSignal({
    confidence: 'medium',
    relatedRawEventIds: [lowRaw.id],
    relatedMarketSnapshotIds: [mediumMarket.id],
  }));

  insertRawEvent(makeRawEvent({
    sourceKind: 'real_api',
    sourceName: 'Example API',
    sourceRef: 'https://example.test/api/events/1',
    confidence: 'high',
  }));
  insertMarketSnapshot(makeMarketSnapshot({
    sourceKind: 'real_rss',
    sourceName: 'Example Feed',
    sourceRef: 'https://example.test/feed.xml#item-1',
    confidence: 'high',
  }));
  insertSignal(makeSignal({
    sourceKind: 'real_api',
    confidence: 'high',
  }));

  for (const sourceKind of ['manual', 'mock', 'simulated', 'fallback_template']) {
    expectRejected(`high raw_event ${sourceKind}`, () => insertRawEvent(makeRawEvent({
      sourceKind,
      confidence: 'high',
      sourceRef: `${sourceKind}-smoke-ref`,
    })));
    expectRejected(`high market_snapshot ${sourceKind}`, () => insertMarketSnapshot(makeMarketSnapshot({
      sourceKind,
      confidence: 'high',
      sourceRef: `${sourceKind}-smoke-ref`,
    })));
    expectRejected(`high signal ${sourceKind}`, () => insertSignal(makeSignal({
      sourceKind,
      confidence: 'high',
    })));
  }

  expectRejected('missing high-confidence source_ref', () => insertRawEvent(makeRawEvent({
    sourceKind: 'real_api',
    sourceRef: null,
    confidence: 'high',
  })));
  expectRejected('secret-like payload', () => insertRawEvent(makeRawEvent({
    rawPayload: { note: 'api_key=REDACTED' },
  })));
  expectRejected('.env reference', () => insertRawEvent(makeRawEvent({
    rawPayload: { note: '.env.local' },
  })));
  expectRejected('local path', () => insertRawEvent(makeRawEvent({
    summary: `operator note ${makeLocalPathLikeValue()}`,
  })));
  expectRejected('NAS path', () => insertMarketSnapshot(makeMarketSnapshot({
    sourceRef: makeNasPathLikeValue(),
  })));

  const fallbackRaw = insertRawEvent(makeRawEvent({
    sourceKind: 'fallback_template',
    confidence: 'medium',
    isMock: false,
  }));

  const rawEvents = getRecentRawEvents({ eventDomain: 'memory_smoke', limit: 20 });
  const marketSnapshots = getRecentMarketSnapshots({ assetSymbol: 'SMOKE', limit: 20 });
  const signals = getRecentSignals({ signalType: 'memory_smoke', limit: 20 });
  const signalById = getSignalById(mediumSignal.id);
  const fallbackRecord = rawEvents.find((event) => event.id === fallbackRaw.id);

  assert(rawEvents.some((event) => event.id === lowRaw.id), 'Inserted raw_event was not readable.');
  assert(
    marketSnapshots.some((snapshot) => snapshot.id === mediumMarket.id),
    'Inserted market_snapshot was not readable.',
  );
  assert(signals.some((signal) => signal.id === mediumSignal.id), 'Inserted signal was not readable.');
  assert(signalById?.id === mediumSignal.id, 'getSignalById did not return the inserted signal.');
  assert(fallbackRecord?.isMock === true, 'fallback_template records must remain marked as mock-like.');

  log('Memory Layer helper smoke checks passed.');
}

try {
  await main();
} catch (error) {
  console.error(`[memory-smoke] ${sanitize(error.stack || error.message || error)}`);
  process.exitCode = 1;
} finally {
  try {
    dbModule?.default?.close?.();
  } catch (error) {
    console.warn(`[memory-smoke] Database close skipped: ${sanitize(error.message)}`);
  }

  process.chdir(projectRoot);

  try {
    await fs.rm(runtimeDir, { recursive: true, force: true });
  } catch (error) {
    console.warn(`[memory-smoke] Runtime cleanup skipped: ${sanitize(error.message)}`);
  }
  try {
    await fs.rm(buildDir, { recursive: true, force: true });
  } catch (error) {
    console.warn(`[memory-smoke] Build cleanup skipped: ${sanitize(error.message)}`);
  }
}

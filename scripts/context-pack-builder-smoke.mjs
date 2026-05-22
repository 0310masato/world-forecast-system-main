import { spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { createRequire } from 'node:module';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const require = createRequire(import.meta.url);
const projectRoot = process.cwd();
const buildDir = path.join(projectRoot, 'node_modules', '.cache', 'world-forecast-context-pack-smoke');
const runtimeDir = await fs.mkdtemp(path.join(os.tmpdir(), 'world-forecast-context-pack-'));
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
  originalConsoleLog(`[context-pack-smoke] ${message}`);
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

async function compileContextPackHelpers() {
  const tscPath = path.join(projectRoot, 'node_modules', 'typescript', 'bin', 'tsc');
  if (!(await pathExists(tscPath))) {
    throw new Error('Missing local TypeScript compiler. Run npm ci before npm run test:context-pack.');
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
  ], {
    cwd: projectRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  });

  if (result.status !== 0) {
    throw new Error([
      'TypeScript context pack helper compilation failed.',
      sanitize(result.stdout),
      sanitize(result.stderr),
    ].filter(Boolean).join('\n'));
  }
}

function makeRawEvent(overrides = {}) {
  const now = Math.floor(Date.now() / 1000);
  return {
    id: `context-pack-smoke-raw-${randomUUID()}`,
    observedAt: now,
    ingestedAt: now,
    sourceKind: 'manual',
    sourceName: 'Smoke Manual Review',
    sourceRef: 'manual-context-pack-note',
    eventDomain: 'context_pack_smoke',
    summary: 'Context pack smoke raw event',
    confidence: 'low',
    limitations: 'Smoke-only context pack validation record.',
    labels: { smoke: true, estimated: true },
    ...overrides,
  };
}

function makeMarketSnapshot(overrides = {}) {
  const now = Math.floor(Date.now() / 1000);
  return {
    id: `context-pack-smoke-market-${randomUUID()}`,
    capturedAt: now,
    assetSymbol: 'SMOKE',
    assetName: 'Smoke Asset',
    assetClass: 'test',
    price: 123.45,
    currency: 'USD',
    sourceKind: 'manual',
    sourceName: 'Smoke Manual Review',
    sourceRef: 'manual-context-pack-note',
    confidence: 'medium',
    limitations: 'Smoke-only context pack validation record.',
    rawPayload: { sample: true },
    ...overrides,
  };
}

function makeSignal(overrides = {}) {
  const now = Math.floor(Date.now() / 1000);
  return {
    id: `context-pack-smoke-signal-${randomUUID()}`,
    detectedAt: now,
    signalType: 'context_pack_smoke',
    title: 'Context pack smoke signal',
    summary: 'Proposal-only context pack smoke signal',
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

function insertUnsafeRawEvent(database, overrides = {}) {
  const now = Math.floor(Date.now() / 1000);
  const id = `context-pack-smoke-unsafe-raw-${randomUUID()}`;
  database.prepare(`
    INSERT INTO raw_events (
      id,
      observed_at,
      ingested_at,
      source_kind,
      source_name,
      source_ref,
      event_domain,
      raw_payload_json,
      summary,
      confidence,
      limitations,
      labels_json,
      is_mock,
      created_at
    ) VALUES (
      @id,
      @observedAt,
      @ingestedAt,
      @sourceKind,
      @sourceName,
      @sourceRef,
      @eventDomain,
      @rawPayloadJson,
      @summary,
      @confidence,
      @limitations,
      @labelsJson,
      @isMock,
      @createdAt
    )
  `).run({
    id,
    observedAt: now,
    ingestedAt: now,
    sourceKind: 'manual',
    sourceName: 'Unsafe Smoke Fixture',
    sourceRef: 'unsafe-smoke-note',
    eventDomain: 'context_pack_smoke',
    rawPayloadJson: null,
    summary: 'Unsafe raw event fixture',
    confidence: 'low',
    limitations: 'Unsafe fixture must be excluded.',
    labelsJson: JSON.stringify({ smoke: true }),
    isMock: 0,
    createdAt: now,
    ...overrides,
  });
  return id;
}

function insertUnsafeMarketSnapshot(database, overrides = {}) {
  const now = Math.floor(Date.now() / 1000);
  const id = `context-pack-smoke-unsafe-market-${randomUUID()}`;
  database.prepare(`
    INSERT INTO market_snapshots (
      id,
      captured_at,
      asset_symbol,
      asset_name,
      asset_class,
      price,
      currency,
      source_kind,
      source_name,
      source_ref,
      change_percent,
      raw_payload_json,
      confidence,
      limitations,
      created_at
    ) VALUES (
      @id,
      @capturedAt,
      @assetSymbol,
      @assetName,
      @assetClass,
      @price,
      @currency,
      @sourceKind,
      @sourceName,
      @sourceRef,
      @changePercent,
      @rawPayloadJson,
      @confidence,
      @limitations,
      @createdAt
    )
  `).run({
    id,
    capturedAt: now,
    assetSymbol: 'SMOKE',
    assetName: 'Unsafe Smoke Asset',
    assetClass: 'test',
    price: 456.78,
    currency: 'USD',
    sourceKind: 'manual',
    sourceName: 'Unsafe Smoke Fixture',
    sourceRef: 'unsafe-smoke-note',
    changePercent: null,
    rawPayloadJson: null,
    confidence: 'low',
    limitations: 'Unsafe fixture must be excluded.',
    createdAt: now,
    ...overrides,
  });
  return id;
}

async function main() {
  await compileContextPackHelpers();

  process.chdir(runtimeDir);

  let insertRawEvent;
  let insertMarketSnapshot;
  let insertSignal;
  let buildContextPackFromSignalId;

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
    dbModule = require(path.join(buildDir, 'lib', 'db.js'));
  } finally {
    console.log = originalConsoleLog;
  }
  const database = dbModule.default;

  const safeRaw = insertRawEvent(makeRawEvent({
    sourceKind: 'estimated',
    confidence: 'medium',
    limitations: 'Estimated event limitation must be preserved.',
  }));
  const safeMarket = insertMarketSnapshot(makeMarketSnapshot({
    sourceKind: 'manual',
    confidence: 'medium',
    limitations: 'Manual market limitation must be preserved.',
  }));

  const secretRawId = insertUnsafeRawEvent(database, {
    rawPayloadJson: JSON.stringify({ note: makeSecretLikeValue() }),
  });
  const localPathRawId = insertUnsafeRawEvent(database, {
    summary: `Operator note ${makeLocalPathLikeValue()}`,
  });
  const nasMarketId = insertUnsafeMarketSnapshot(database, {
    sourceRef: makeNasPathLikeValue(),
  });
  const privateNetworkMarketId = insertUnsafeMarketSnapshot(database, {
    rawPayloadJson: JSON.stringify({ host: makePrivateNetworkIpLikeValue() }),
  });

  const signal = insertSignal(makeSignal({
    relatedRawEventIds: [safeRaw.id, secretRawId, localPathRawId],
    relatedMarketSnapshotIds: [safeMarket.id, nasMarketId, privateNetworkMarketId],
  }));
  const pack = buildContextPackFromSignalId({
    signalId: signal.id,
    purpose: {
      job_type: 'forecast_review_notes',
      summary: 'Build proposal-only review context from smoke records.',
    },
    contextPackId: `context-pack-smoke-${randomUUID()}`,
  }, database);

  assert(pack.context_pack_version === 1, 'Context pack version must be 1.');
  assert(pack.human_review_required === true, 'Context pack must require human review.');
  assert(pack.proposal_only === true, 'Context pack must remain proposal-only.');
  assert(pack.is_production_state === false, 'Context pack must not be production state.');
  assert(
    pack.safety_labels.includes('Not production state'),
    'Context pack must include the non-production safety label.',
  );

  const includedSignal = pack.included_records.signals.find((record) => record.id === signal.id);
  const includedRaw = pack.included_records.raw_events.find((record) => record.id === safeRaw.id);
  const includedMarket = pack.included_records.market_snapshots.find(
    (record) => record.id === safeMarket.id,
  );

  assert(includedSignal, 'Signal record was not included.');
  assert(includedRaw, 'Safe raw_event record was not included.');
  assert(includedMarket, 'Safe market_snapshot record was not included.');
  assert(includedSignal.source_kind === 'manual', 'Signal source_kind was not preserved.');
  assert(includedSignal.confidence === 'medium', 'Signal confidence was not preserved.');
  assert(
    includedSignal.limitations === 'Signal limitation must be preserved.',
    'Signal limitations were not preserved.',
  );
  assert(includedRaw.source_kind === 'estimated', 'Raw event source_kind was not preserved.');
  assert(includedRaw.confidence === 'medium', 'Raw event confidence was not preserved.');
  assert(
    includedRaw.limitations === 'Estimated event limitation must be preserved.',
    'Raw event limitations were not preserved.',
  );
  assert(includedMarket.source_kind === 'manual', 'Market source_kind was not preserved.');
  assert(includedMarket.confidence === 'medium', 'Market confidence was not preserved.');
  assert(
    includedMarket.limitations === 'Manual market limitation must be preserved.',
    'Market limitations were not preserved.',
  );

  for (const excludedId of [secretRawId, localPathRawId, nasMarketId, privateNetworkMarketId]) {
    assert(
      pack.excluded_records.some((record) => record.id === excludedId),
      `Unsafe record ${excludedId} was not excluded.`,
    );
  }

  expectRejected('unsafe build options', () => buildContextPackFromSignalId({
    signalId: signal.id,
    purpose: {
      job_type: 'forecast_review_notes',
      summary: '.env.local must not be accepted in context pack options.',
    },
  }, database));
  expectRejected('invalid job_type', () => buildContextPackFromSignalId({
    signalId: signal.id,
    purpose: {
      job_type: 'unsupported_context_pack_job',
      summary: 'Invalid job type must not be accepted.',
    },
  }, database));

  log('Context Pack Builder smoke checks passed.');
}

try {
  await main();
} catch (error) {
  console.error(`[context-pack-smoke] ${sanitize(error.stack || error.message || error)}`);
  process.exitCode = 1;
} finally {
  try {
    dbModule?.default?.close?.();
  } catch (error) {
    console.warn(`[context-pack-smoke] Database close skipped: ${sanitize(error.message)}`);
  }

  process.chdir(projectRoot);

  try {
    await fs.rm(runtimeDir, { recursive: true, force: true });
  } catch (error) {
    console.warn(`[context-pack-smoke] Runtime cleanup skipped: ${sanitize(error.message)}`);
  }
  try {
    await fs.rm(buildDir, { recursive: true, force: true });
  } catch (error) {
    console.warn(`[context-pack-smoke] Build cleanup skipped: ${sanitize(error.message)}`);
  }
}

import { spawn, spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import fs from 'node:fs/promises';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';

const require = createRequire(import.meta.url);
const Database = require('better-sqlite3');

const projectRoot = process.cwd();
const runtimeDir = await fs.mkdtemp(path.join(os.tmpdir(), 'world-forecast-characterization-'));
const serverLogs = [];
let serverProcess;

function sanitize(message) {
  const projectRootUrlPath = projectRoot.replaceAll(path.sep, '/');
  const runtimeDirUrlPath = runtimeDir.replaceAll(path.sep, '/');
  return String(message)
    .replaceAll(projectRoot, '<project-root>')
    .replaceAll(projectRootUrlPath, '<project-root>')
    .replaceAll(runtimeDir, '<runtime-dir>')
    .replaceAll(runtimeDirUrlPath, '<runtime-dir>')
    .replace(/[A-Z]:\\[^\r\n'"`]+/g, '<local-path>');
}

function log(message) {
  console.log(`[characterization] ${message}`);
}

function recordServerLog(chunk) {
  const text = sanitize(chunk.toString());
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim()) continue;
    serverLogs.push(line);
  }
  if (serverLogs.length > 80) {
    serverLogs.splice(0, serverLogs.length - 80);
  }
}

async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function getFreePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      const port = typeof address === 'object' && address ? address.port : undefined;
      server.close(() => {
        if (port) resolve(port);
        else reject(new Error('Failed to allocate a local port.'));
      });
    });
  });
}

async function waitForServer(baseUrl) {
  const deadline = Date.now() + 90_000;
  while (Date.now() < deadline) {
    if (serverProcess.exitCode !== null) {
      throw new Error(`Next dev server exited early with code ${serverProcess.exitCode}.`);
    }

    try {
      await fetch(baseUrl, { signal: AbortSignal.timeout(1_500) });
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 1_000));
    }
  }

  throw new Error('Next dev server did not become ready within 90 seconds.');
}

function startDevServer(port) {
  const nextCliPath = path.join(projectRoot, 'node_modules', 'next', 'dist', 'bin', 'next');
  const env = {
    ...process.env,
    CI: '1',
    NEXT_TELEMETRY_DISABLED: '1',
    GEMINI_API_KEY: '',
    HORMUZ_USE_MOCK: 'true',
    HORMUZ_NEWS_USE_MOCK: 'true',
    JAPAN_BOUND_TANKER_NAS_LOG_ENABLED: 'false',
  };

  const child = spawn(
    process.execPath,
    [nextCliPath, 'dev', projectRoot, '--hostname', '127.0.0.1', '--port', String(port)],
    {
      cwd: runtimeDir,
      env,
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
    },
  );

  child.stdout.on('data', recordServerLog);
  child.stderr.on('data', recordServerLog);
  return child;
}

function waitForProcessExit(child, timeoutMs) {
  return new Promise((resolve) => {
    if (child.exitCode !== null || child.signalCode !== null) {
      resolve(true);
      return;
    }

    const timeout = setTimeout(() => {
      child.off('exit', onExit);
      resolve(false);
    }, timeoutMs);

    function onExit() {
      clearTimeout(timeout);
      resolve(true);
    }

    child.once('exit', onExit);
  });
}

async function stopDevServer() {
  if (!serverProcess || serverProcess.exitCode !== null || serverProcess.signalCode !== null) {
    return;
  }

  serverProcess.kill();
  let exited = await waitForProcessExit(serverProcess, 5_000);

  if (!exited && process.platform === 'win32') {
    spawnSync('taskkill', ['/PID', String(serverProcess.pid), '/T', '/F'], {
      stdio: 'ignore',
      windowsHide: true,
    });
    exited = await waitForProcessExit(serverProcess, 5_000);
  }

  if (!exited) {
    serverProcess.kill('SIGKILL');
    await waitForProcessExit(serverProcess, 2_000);
  }

  serverProcess.stdout?.destroy();
  serverProcess.stderr?.destroy();
}

async function fetchJson(baseUrl, routePath) {
  const response = await fetch(`${baseUrl}${routePath}`, {
    signal: AbortSignal.timeout(60_000),
  });
  const text = await response.text();

  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`${routePath} returned non-JSON response with status ${response.status}.`);
  }

  if (!response.ok || json.success !== true) {
    throw new Error(`${routePath} did not return success true. Status: ${response.status}.`);
  }

  log(`${routePath} returned success true.`);
  return json;
}

function assertTablesExist(db, tableNames) {
  const statement = db.prepare(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?",
  );

  for (const tableName of tableNames) {
    const row = statement.get(tableName);
    if (!row) {
      throw new Error(`Expected table ${tableName} to exist.`);
    }
  }

  log(`Verified tables: ${tableNames.join(', ')}.`);
}

function insertMemoryLayerRow(db, tableName, sourceKind, confidence, suffix) {
  const now = Math.floor(Date.now() / 1000);
  const id = `characterization-${tableName}-${sourceKind}-${confidence}-${suffix}`;

  if (tableName === 'raw_events') {
    db.prepare(`
      INSERT INTO raw_events (
        id, observed_at, ingested_at, source_kind, event_domain, confidence, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, now, now, sourceKind, 'characterization', confidence, now);
    return id;
  }

  if (tableName === 'market_snapshots') {
    db.prepare(`
      INSERT INTO market_snapshots (
        id, captured_at, asset_symbol, price, source_kind, confidence, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, now, 'TEST', 1.23, sourceKind, confidence, now);
    return id;
  }

  db.prepare(`
    INSERT INTO signals (
      id, detected_at, signal_type, title, severity, confidence, source_kind, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    now,
    'characterization',
    'Characterization signal',
    'low',
    confidence,
    sourceKind,
    now,
  );
  return id;
}

function expectConstraintRejection(db, tableName, sourceKind) {
  try {
    insertMemoryLayerRow(db, tableName, sourceKind, 'high', 'reject');
  } catch {
    return;
  }

  throw new Error(`${tableName} accepted high confidence for ${sourceKind}.`);
}

function expectHighConfidenceAllowed(db, tableName, sourceKind) {
  const id = insertMemoryLayerRow(db, tableName, sourceKind, 'high', 'allow');
  db.prepare(`DELETE FROM ${tableName} WHERE id = ?`).run(id);
}

function assertMemoryLayerConstraints(db) {
  const memoryTables = ['raw_events', 'market_snapshots', 'signals'];
  const rejectedSourceKinds = ['manual', 'mock', 'simulated', 'fallback_template'];
  const allowedSourceKinds = ['real_api', 'real_rss'];

  for (const tableName of memoryTables) {
    db.prepare(`DELETE FROM ${tableName} WHERE id LIKE 'characterization-%'`).run();

    for (const sourceKind of rejectedSourceKinds) {
      expectConstraintRejection(db, tableName, sourceKind);
    }

    for (const sourceKind of allowedSourceKinds) {
      expectHighConfidenceAllowed(db, tableName, sourceKind);
    }
  }

  log('Verified Memory Layer source_kind/confidence CHECK constraints.');
}

async function main() {
  try {
    const port = await getFreePort();
    const baseUrl = `http://127.0.0.1:${port}`;
    serverProcess = startDevServer(port);

    log('Started Next dev server for API smoke checks.');
    await waitForServer(baseUrl);

    await fetchJson(baseUrl, '/api/forecast?fast=true');
    await fetchJson(baseUrl, '/api/hormuz');
    await fetchJson(baseUrl, '/api/hormuz/news');

    await stopDevServer();

    const dbPath = path.join(runtimeDir, 'world_forecast.db');
    if (!(await pathExists(dbPath))) {
      throw new Error('Expected world_forecast.db to be created by DB initialization.');
    }

    const db = new Database(dbPath);
    try {
      assertTablesExist(db, ['predictions', 'ai_bias_feedback', 'daily_summaries']);
      assertTablesExist(db, ['raw_events', 'market_snapshots', 'signals']);
      assertMemoryLayerConstraints(db);
    } finally {
      db.close();
    }

    log('Characterization smoke checks passed.');
  } catch (error) {
    console.error(`[characterization] ${sanitize(error.stack || error.message || error)}`);
    if (serverLogs.length > 0) {
      console.error('[characterization] Last dev server logs:');
      for (const line of serverLogs.slice(-20)) {
        console.error(`[characterization] ${line}`);
      }
    }
    process.exitCode = 1;
  } finally {
    await stopDevServer();
    try {
      await fs.rm(runtimeDir, { recursive: true, force: true });
    } catch (error) {
      console.warn(`[characterization] Runtime cleanup skipped: ${sanitize(error.message)}`);
    }
  }
}

await main();
process.exit(process.exitCode ?? 0);

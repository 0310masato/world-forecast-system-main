import db from '../db';
import {
  assertNoRestrictedContent,
  assertProposalStatus,
  assertSourceKind,
  normalizeLimit,
  normalizeRequiredText,
} from './validation';
import type {
  JsonValue,
  MarketSnapshotRecord,
  MemoryDatabase,
  RawEventRecord,
  RecentMarketSnapshotsOptions,
  RecentRawEventsOptions,
  RecentSignalsOptions,
  SignalRecord,
} from './types';

type RawEventRow = {
  id: string;
  observed_at: number;
  ingested_at: number;
  source_kind: string;
  source_name: string | null;
  source_ref: string | null;
  event_domain: string;
  raw_payload_json: string | null;
  summary: string | null;
  confidence: string;
  limitations: string | null;
  labels_json: string | null;
  is_mock: number;
  created_at: number;
};

type MarketSnapshotRow = {
  id: string;
  captured_at: number;
  asset_symbol: string;
  asset_name: string | null;
  asset_class: string | null;
  price: number;
  currency: string | null;
  source_kind: string;
  source_name: string | null;
  source_ref: string | null;
  change_percent: number | null;
  raw_payload_json: string | null;
  confidence: string;
  limitations: string | null;
  created_at: number;
};

type SignalRow = {
  id: string;
  detected_at: number;
  signal_type: string;
  title: string;
  summary: string | null;
  severity: string;
  direction: string | null;
  strength: number | null;
  confidence: string;
  source_kind: string;
  related_raw_event_ids_json: string | null;
  related_market_snapshot_ids_json: string | null;
  labels_json: string | null;
  limitations: string | null;
  proposal_status: string;
  human_review_required: number;
  created_at: number;
};

function getDatabase(database?: MemoryDatabase): MemoryDatabase {
  if (!database) {
    throw new Error('Memory Layer database is not initialized.');
  }

  return database;
}

function parseJsonColumn(value: string | null): JsonValue | undefined {
  if (value === null) {
    return undefined;
  }

  return JSON.parse(value) as JsonValue;
}

function parseStringArrayColumn(value: string | null): string[] | undefined {
  const parsed = parseJsonColumn(value);
  if (parsed === undefined) {
    return undefined;
  }

  if (!Array.isArray(parsed) || !parsed.every((item) => typeof item === 'string')) {
    throw new Error('Stored Memory Layer relation column is not a string array.');
  }

  return parsed;
}

function mapRawEvent(row: RawEventRow): RawEventRecord {
  return {
    id: row.id,
    observedAt: row.observed_at,
    ingestedAt: row.ingested_at,
    sourceKind: assertSourceKind(row.source_kind),
    sourceName: row.source_name,
    sourceRef: row.source_ref,
    eventDomain: row.event_domain,
    rawPayload: parseJsonColumn(row.raw_payload_json),
    summary: row.summary,
    confidence: row.confidence as RawEventRecord['confidence'],
    limitations: row.limitations,
    labels: parseJsonColumn(row.labels_json),
    isMock: row.is_mock === 1,
    createdAt: row.created_at,
  };
}

function mapMarketSnapshot(row: MarketSnapshotRow): MarketSnapshotRecord {
  return {
    id: row.id,
    capturedAt: row.captured_at,
    assetSymbol: row.asset_symbol,
    assetName: row.asset_name,
    assetClass: row.asset_class,
    price: row.price,
    currency: row.currency,
    sourceKind: assertSourceKind(row.source_kind),
    sourceName: row.source_name,
    sourceRef: row.source_ref,
    changePercent: row.change_percent,
    rawPayload: parseJsonColumn(row.raw_payload_json),
    confidence: row.confidence as MarketSnapshotRecord['confidence'],
    limitations: row.limitations,
    createdAt: row.created_at,
  };
}

function mapSignal(row: SignalRow): SignalRecord {
  return {
    id: row.id,
    detectedAt: row.detected_at,
    signalType: row.signal_type,
    title: row.title,
    summary: row.summary,
    severity: row.severity,
    direction: row.direction,
    strength: row.strength,
    confidence: row.confidence as SignalRecord['confidence'],
    sourceKind: assertSourceKind(row.source_kind),
    relatedRawEventIds: parseStringArrayColumn(row.related_raw_event_ids_json),
    relatedMarketSnapshotIds: parseStringArrayColumn(row.related_market_snapshot_ids_json),
    labels: parseJsonColumn(row.labels_json),
    limitations: row.limitations,
    proposalStatus: assertProposalStatus(row.proposal_status),
    humanReviewRequired: row.human_review_required === 1,
    createdAt: row.created_at,
  };
}

export function getRecentRawEvents(
  options: RecentRawEventsOptions = {},
  database: MemoryDatabase = db,
): RawEventRecord[] {
  assertNoRestrictedContent(options, 'recentRawEventsOptions');

  const params: Record<string, unknown> = {
    limit: normalizeLimit(options.limit),
  };
  const where: string[] = [];

  if (options.eventDomain !== undefined) {
    params.eventDomain = normalizeRequiredText(options.eventDomain, 'eventDomain');
    where.push('event_domain = @eventDomain');
  }

  if (options.sourceKind !== undefined) {
    params.sourceKind = assertSourceKind(options.sourceKind);
    where.push('source_kind = @sourceKind');
  }

  const rows = getDatabase(database).prepare(`
    SELECT
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
    FROM raw_events
    ${where.length > 0 ? `WHERE ${where.join(' AND ')}` : ''}
    ORDER BY observed_at DESC, created_at DESC
    LIMIT @limit
  `).all(params) as RawEventRow[];

  return rows.map(mapRawEvent);
}

export function getRecentMarketSnapshots(
  options: RecentMarketSnapshotsOptions = {},
  database: MemoryDatabase = db,
): MarketSnapshotRecord[] {
  assertNoRestrictedContent(options, 'recentMarketSnapshotsOptions');

  const params: Record<string, unknown> = {
    limit: normalizeLimit(options.limit),
  };
  const where: string[] = [];

  if (options.assetSymbol !== undefined) {
    params.assetSymbol = normalizeRequiredText(options.assetSymbol, 'assetSymbol');
    where.push('asset_symbol = @assetSymbol');
  }

  if (options.sourceKind !== undefined) {
    params.sourceKind = assertSourceKind(options.sourceKind);
    where.push('source_kind = @sourceKind');
  }

  const rows = getDatabase(database).prepare(`
    SELECT
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
    FROM market_snapshots
    ${where.length > 0 ? `WHERE ${where.join(' AND ')}` : ''}
    ORDER BY captured_at DESC, created_at DESC
    LIMIT @limit
  `).all(params) as MarketSnapshotRow[];

  return rows.map(mapMarketSnapshot);
}

export function getRecentSignals(
  options: RecentSignalsOptions = {},
  database: MemoryDatabase = db,
): SignalRecord[] {
  assertNoRestrictedContent(options, 'recentSignalsOptions');

  const params: Record<string, unknown> = {
    limit: normalizeLimit(options.limit),
  };
  const where: string[] = [];

  if (options.signalType !== undefined) {
    params.signalType = normalizeRequiredText(options.signalType, 'signalType');
    where.push('signal_type = @signalType');
  }

  if (options.proposalStatus !== undefined) {
    params.proposalStatus = assertProposalStatus(options.proposalStatus);
    where.push('proposal_status = @proposalStatus');
  }

  if (options.sourceKind !== undefined) {
    params.sourceKind = assertSourceKind(options.sourceKind);
    where.push('source_kind = @sourceKind');
  }

  const rows = getDatabase(database).prepare(`
    SELECT
      id,
      detected_at,
      signal_type,
      title,
      summary,
      severity,
      direction,
      strength,
      confidence,
      source_kind,
      related_raw_event_ids_json,
      related_market_snapshot_ids_json,
      labels_json,
      limitations,
      proposal_status,
      human_review_required,
      created_at
    FROM signals
    ${where.length > 0 ? `WHERE ${where.join(' AND ')}` : ''}
    ORDER BY detected_at DESC, created_at DESC
    LIMIT @limit
  `).all(params) as SignalRow[];

  return rows.map(mapSignal);
}

export function getSignalById(
  id: string,
  database: MemoryDatabase = db,
): SignalRecord | null {
  const normalizedId = normalizeRequiredText(id, 'id');

  const row = getDatabase(database).prepare(`
    SELECT
      id,
      detected_at,
      signal_type,
      title,
      summary,
      severity,
      direction,
      strength,
      confidence,
      source_kind,
      related_raw_event_ids_json,
      related_market_snapshot_ids_json,
      labels_json,
      limitations,
      proposal_status,
      human_review_required,
      created_at
    FROM signals
    WHERE id = @id
    LIMIT 1
  `).get({ id: normalizedId }) as SignalRow | undefined;

  return row ? mapSignal(row) : null;
}

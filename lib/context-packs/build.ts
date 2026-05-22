import { randomUUID } from 'crypto';
import db from '../db';
import { getSignalById } from '../memory/read';
import type {
  Confidence,
  JsonValue,
  MarketSnapshotRecord,
  MemoryDatabase,
  RawEventRecord,
  SignalRecord,
  SourceKind,
} from '../memory/types';
import {
  assertConfidence,
  assertSourceKind,
  normalizeRequiredText,
} from '../memory/validation';
import type {
  ContextPack,
  ContextPackBuildOptions,
  ContextPackExcludedRecord,
  ContextPackIncludedRecord,
  ContextPackSourceRef,
} from './types';
import { CONTEXT_PACK_VERSION } from './types';
import {
  CONTEXT_PACK_SAFETY_LABELS,
  DEFAULT_CONTEXT_PACK_LIMITATIONS,
  assertContextPackSafetyBoundary,
  getContextPackRestrictionReason,
  normalizeContextPackBuildOptions,
} from './validation';

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

const REAL_SOURCE_KINDS = new Set<SourceKind>(['real_api', 'real_rss']);

function getDatabase(database?: MemoryDatabase): MemoryDatabase {
  if (!database) {
    throw new Error('Context Pack Builder database is not initialized.');
  }

  return database;
}

function parseJsonColumn(value: string | null): JsonValue | undefined {
  if (value === null) {
    return undefined;
  }

  return JSON.parse(value) as JsonValue;
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
    confidence: assertConfidence(row.confidence),
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
    confidence: assertConfidence(row.confidence),
    limitations: row.limitations,
    createdAt: row.created_at,
  };
}

function fetchRawEventsByIds(ids: string[], database: MemoryDatabase): RawEventRecord[] {
  if (ids.length === 0) {
    return [];
  }

  const params = Object.fromEntries(ids.map((id, index) => [`id${index}`, id]));
  const placeholders = ids.map((_, index) => `@id${index}`).join(', ');
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
    WHERE id IN (${placeholders})
  `).all(params) as RawEventRow[];

  return rows.map(mapRawEvent);
}

function fetchMarketSnapshotsByIds(
  ids: string[],
  database: MemoryDatabase,
): MarketSnapshotRecord[] {
  if (ids.length === 0) {
    return [];
  }

  const params = Object.fromEntries(ids.map((id, index) => [`id${index}`, id]));
  const placeholders = ids.map((_, index) => `@id${index}`).join(', ');
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
    WHERE id IN (${placeholders})
  `).all(params) as MarketSnapshotRow[];

  return rows.map(mapMarketSnapshot);
}

function uniqueIds(ids: string[] | undefined): string[] {
  return [...new Set((ids ?? []).map((id) => normalizeRequiredText(id, 'relatedId')))];
}

function splitByLimit(
  ids: string[],
  limit: number,
  sourceType: ContextPackExcludedRecord['source_type'],
): { includedIds: string[]; excludedRecords: ContextPackExcludedRecord[] } {
  return {
    includedIds: ids.slice(0, limit),
    excludedRecords: ids.slice(limit).map((id) => ({
      source_type: sourceType,
      id,
      reason: 'Record exceeded the configured context limit.',
    })),
  };
}

function isStale(observedAt: number, now: number, staleAfterSeconds: number): boolean {
  return now - observedAt > staleAfterSeconds;
}

function highConfidenceExclusionReason(params: {
  confidence: Confidence;
  sourceKind: SourceKind;
  sourceRef?: string | null;
  stale: boolean;
  sourceSupportsRef: boolean;
}): string | null {
  if (params.confidence !== 'high') {
    return null;
  }

  if (!REAL_SOURCE_KINDS.has(params.sourceKind)) {
    return 'High confidence records must come from real_api or real_rss sources.';
  }

  if (params.sourceSupportsRef && !params.sourceRef) {
    return 'High confidence source-backed records must include source_ref.';
  }

  if (params.stale) {
    return 'High confidence records must not be stale for the requested context window.';
  }

  return null;
}

function summarizeSignal(signal: SignalRecord): string {
  return signal.summary ?? signal.title;
}

function summarizeRawEvent(record: RawEventRecord): string {
  return record.summary ?? `Raw event in ${record.eventDomain}.`;
}

function summarizeMarketSnapshot(record: MarketSnapshotRecord): string {
  const currency = record.currency ? ` ${record.currency}` : '';
  return `${record.assetSymbol} market snapshot at ${record.price}${currency}.`;
}

function makeSignalCandidate(
  signal: SignalRecord,
  stale: boolean,
): { validationCandidate: unknown; includedRecord: ContextPackIncludedRecord } {
  const metadata: JsonValue = {
    detected_at: signal.detectedAt,
    signal_type: signal.signalType,
    severity: signal.severity,
    direction: signal.direction,
    strength: signal.strength,
    proposal_status: signal.proposalStatus,
    human_review_required: signal.humanReviewRequired,
  };

  return {
    validationCandidate: {
      ...signal,
      summary: summarizeSignal(signal),
    },
    includedRecord: {
      source_type: 'signal',
      id: signal.id,
      source_kind: signal.sourceKind,
      confidence: signal.confidence,
      stale,
      summary: summarizeSignal(signal),
      limitations: signal.limitations,
      labels: signal.labels ?? null,
      metadata,
    },
  };
}

function makeRawEventCandidate(
  record: RawEventRecord,
  stale: boolean,
): { validationCandidate: unknown; includedRecord: ContextPackIncludedRecord } {
  const metadata: JsonValue = {
    observed_at: record.observedAt,
    ingested_at: record.ingestedAt,
    source_name: record.sourceName,
    source_ref: record.sourceRef,
    event_domain: record.eventDomain,
    is_mock: record.isMock,
  };

  return {
    validationCandidate: {
      ...record,
      summary: summarizeRawEvent(record),
    },
    includedRecord: {
      source_type: 'raw_event',
      id: record.id,
      source_kind: record.sourceKind,
      confidence: record.confidence,
      stale,
      summary: summarizeRawEvent(record),
      limitations: record.limitations,
      labels: record.labels ?? null,
      metadata,
    },
  };
}

function makeMarketSnapshotCandidate(
  record: MarketSnapshotRecord,
  stale: boolean,
): { validationCandidate: unknown; includedRecord: ContextPackIncludedRecord } {
  const metadata: JsonValue = {
    captured_at: record.capturedAt,
    asset_symbol: record.assetSymbol,
    asset_name: record.assetName,
    asset_class: record.assetClass,
    price: record.price,
    currency: record.currency,
    source_name: record.sourceName,
    source_ref: record.sourceRef,
    change_percent: record.changePercent,
  };

  return {
    validationCandidate: {
      ...record,
      summary: summarizeMarketSnapshot(record),
    },
    includedRecord: {
      source_type: 'market_snapshot',
      id: record.id,
      source_kind: record.sourceKind,
      confidence: record.confidence,
      stale,
      summary: summarizeMarketSnapshot(record),
      limitations: record.limitations,
      metadata,
    },
  };
}

function includeOrExclude(params: {
  sourceType: ContextPackExcludedRecord['source_type'];
  recordId: string;
  validationCandidate: unknown;
  includedRecord: ContextPackIncludedRecord;
  highConfidenceReason: string | null;
  includedRecords: ContextPackIncludedRecord[];
  excludedRecords: ContextPackExcludedRecord[];
}): void {
  const restrictionReason = getContextPackRestrictionReason(
    params.validationCandidate,
    `${params.sourceType}.${params.recordId}`,
  );
  const reason = params.highConfidenceReason ?? restrictionReason;

  if (reason) {
    params.excludedRecords.push({
      source_type: params.sourceType,
      id: params.recordId,
      reason,
    });
    return;
  }

  params.includedRecords.push(params.includedRecord);
}

function makeSourceRefs(
  signals: ContextPackIncludedRecord[],
  rawEvents: ContextPackIncludedRecord[],
  marketSnapshots: ContextPackIncludedRecord[],
  policyRefs: string[],
): ContextPackSourceRef[] {
  const memoryRefs = [...signals, ...rawEvents, ...marketSnapshots].map((record) => ({
    source_type: record.source_type,
    id: record.id,
    source_kind: record.source_kind,
    confidence: record.confidence,
    stale: record.stale,
    limitations: record.limitations,
  }));
  const policyDocRefs = policyRefs.map((ref) => ({
    source_type: 'policy_doc' as const,
    id: ref,
    ref,
  }));

  return [...memoryRefs, ...policyDocRefs];
}

export function buildContextPackFromSignalId(
  options: ContextPackBuildOptions,
  database: MemoryDatabase = db,
): ContextPack {
  const normalizedOptions = normalizeContextPackBuildOptions(options);
  const signal = getSignalById(normalizedOptions.signalId, database);

  if (!signal) {
    throw new Error('Requested signal was not found.');
  }

  const createdAt = normalizedOptions.createdAt ?? normalizedOptions.now;
  const rawEventIds = uniqueIds(signal.relatedRawEventIds);
  const marketSnapshotIds = uniqueIds(signal.relatedMarketSnapshotIds);
  const rawSplit = splitByLimit(rawEventIds, normalizedOptions.maxRawEvents, 'raw_event');
  const marketSplit = splitByLimit(
    marketSnapshotIds,
    normalizedOptions.maxMarketSnapshots,
    'market_snapshot',
  );
  const excludedRecords: ContextPackExcludedRecord[] = [
    ...rawSplit.excludedRecords,
    ...marketSplit.excludedRecords,
  ];
  const signalRecords: ContextPackIncludedRecord[] = [];
  const rawEventRecords: ContextPackIncludedRecord[] = [];
  const marketSnapshotRecords: ContextPackIncludedRecord[] = [];
  const signalStale = isStale(
    signal.detectedAt,
    normalizedOptions.now,
    normalizedOptions.staleAfterSeconds,
  );
  const signalCandidate = makeSignalCandidate(signal, signalStale);

  includeOrExclude({
    sourceType: 'signal',
    recordId: signal.id,
    validationCandidate: signalCandidate.validationCandidate,
    includedRecord: signalCandidate.includedRecord,
    highConfidenceReason: highConfidenceExclusionReason({
      confidence: signal.confidence,
      sourceKind: signal.sourceKind,
      stale: signalStale,
      sourceSupportsRef: false,
    }),
    includedRecords: signalRecords,
    excludedRecords,
  });

  const rawRows = fetchRawEventsByIds(rawSplit.includedIds, database);
  const rawById = new Map(rawRows.map((record) => [record.id, record]));

  for (const id of rawSplit.includedIds) {
    const record = rawById.get(id);
    if (!record) {
      excludedRecords.push({
        source_type: 'raw_event',
        id,
        reason: 'Related raw_event was not found.',
      });
      continue;
    }

    const stale = isStale(
      record.observedAt,
      normalizedOptions.now,
      normalizedOptions.staleAfterSeconds,
    );
    const candidate = makeRawEventCandidate(record, stale);

    includeOrExclude({
      sourceType: 'raw_event',
      recordId: id,
      validationCandidate: candidate.validationCandidate,
      includedRecord: candidate.includedRecord,
      highConfidenceReason: highConfidenceExclusionReason({
        confidence: record.confidence,
        sourceKind: record.sourceKind,
        sourceRef: record.sourceRef,
        stale,
        sourceSupportsRef: true,
      }),
      includedRecords: rawEventRecords,
      excludedRecords,
    });
  }

  const marketRows = fetchMarketSnapshotsByIds(marketSplit.includedIds, database);
  const marketById = new Map(marketRows.map((record) => [record.id, record]));

  for (const id of marketSplit.includedIds) {
    const record = marketById.get(id);
    if (!record) {
      excludedRecords.push({
        source_type: 'market_snapshot',
        id,
        reason: 'Related market_snapshot was not found.',
      });
      continue;
    }

    const stale = isStale(
      record.capturedAt,
      normalizedOptions.now,
      normalizedOptions.staleAfterSeconds,
    );
    const candidate = makeMarketSnapshotCandidate(record, stale);

    includeOrExclude({
      sourceType: 'market_snapshot',
      recordId: id,
      validationCandidate: candidate.validationCandidate,
      includedRecord: candidate.includedRecord,
      highConfidenceReason: highConfidenceExclusionReason({
        confidence: record.confidence,
        sourceKind: record.sourceKind,
        sourceRef: record.sourceRef,
        stale,
        sourceSupportsRef: true,
      }),
      includedRecords: marketSnapshotRecords,
      excludedRecords,
    });
  }

  const contextPack: ContextPack = {
    context_pack_id: normalizedOptions.contextPackId ?? `context_pack_${randomUUID()}`,
    context_pack_version: CONTEXT_PACK_VERSION,
    created_at: createdAt,
    purpose: normalizedOptions.purpose,
    source_refs: makeSourceRefs(
      signalRecords,
      rawEventRecords,
      marketSnapshotRecords,
      normalizedOptions.policyRefs,
    ),
    included_records: {
      signals: signalRecords,
      raw_events: rawEventRecords,
      market_snapshots: marketSnapshotRecords,
      policy_refs: [...normalizedOptions.policyRefs],
    },
    excluded_records: excludedRecords,
    safety_labels: [...CONTEXT_PACK_SAFETY_LABELS],
    limitations: [...DEFAULT_CONTEXT_PACK_LIMITATIONS],
    human_review_required: true,
    proposal_only: true,
    is_production_state: false,
    policy_refs: [...normalizedOptions.policyRefs],
  };

  assertContextPackSafetyBoundary(contextPack);

  return contextPack;
}

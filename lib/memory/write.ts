import { randomUUID } from 'crypto';
import db from '../db';
import {
  assertConfidence,
  assertConfidencePolicy,
  assertNoRestrictedContent,
  assertProposalStatus,
  assertSourceKind,
  normalizeOptionalNumber,
  normalizeOptionalText,
  normalizeRequiredNumber,
  normalizeRequiredText,
  normalizeUnixSeconds,
  resolveIsMockFlag,
  serializeJsonValue,
} from './validation';
import type {
  MarketSnapshotInput,
  MemoryDatabase,
  MemoryWriteResult,
  RawEventInput,
  SignalInput,
} from './types';

const ID_PREFIXES = {
  rawEvent: 'raw_event',
  marketSnapshot: 'market_snapshot',
  signal: 'signal',
} as const;

function getDatabase(database?: MemoryDatabase): MemoryDatabase {
  if (!database) {
    throw new Error('Memory Layer database is not initialized.');
  }

  return database;
}

function nowUnixSeconds(): number {
  return Math.floor(Date.now() / 1000);
}

function normalizeId(value: unknown, prefix: string): string {
  if (value === undefined || value === null) {
    return `${prefix}_${randomUUID()}`;
  }

  return normalizeRequiredText(value, 'id');
}

function normalizeStringArray(value: unknown, fieldName: string): string[] | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (!Array.isArray(value)) {
    throw new Error(`${fieldName} must be an array of strings when provided.`);
  }

  return value.map((item, index) => normalizeRequiredText(item, `${fieldName}[${index}]`));
}

export function insertRawEvent(
  input: RawEventInput,
  database: MemoryDatabase = db,
): MemoryWriteResult {
  assertNoRestrictedContent(input, 'rawEvent');

  const sourceKind = assertSourceKind(input.sourceKind);
  const confidence = assertConfidence(input.confidence);
  const sourceRef = normalizeOptionalText(input.sourceRef, 'sourceRef');
  const isMock = resolveIsMockFlag(sourceKind, input.isMock);

  assertConfidencePolicy({
    sourceKind,
    confidence,
    sourceRef,
    isMock,
    requireSourceRefForHigh: true,
  });

  const id = normalizeId(input.id, ID_PREFIXES.rawEvent);
  const observedAt = normalizeUnixSeconds(input.observedAt, 'observedAt');
  const ingestedAt = normalizeUnixSeconds(input.ingestedAt ?? nowUnixSeconds(), 'ingestedAt');
  const createdAt = normalizeUnixSeconds(input.createdAt ?? nowUnixSeconds(), 'createdAt');

  getDatabase(database).prepare(`
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
    observedAt,
    ingestedAt,
    sourceKind,
    sourceName: normalizeOptionalText(input.sourceName, 'sourceName'),
    sourceRef,
    eventDomain: normalizeRequiredText(input.eventDomain, 'eventDomain'),
    rawPayloadJson: serializeJsonValue(input.rawPayload, 'rawPayload'),
    summary: normalizeOptionalText(input.summary, 'summary'),
    confidence,
    limitations: normalizeOptionalText(input.limitations, 'limitations'),
    labelsJson: serializeJsonValue(input.labels, 'labels'),
    isMock: isMock ? 1 : 0,
    createdAt,
  });

  return { id, createdAt };
}

export function insertMarketSnapshot(
  input: MarketSnapshotInput,
  database: MemoryDatabase = db,
): MemoryWriteResult {
  assertNoRestrictedContent(input, 'marketSnapshot');

  const sourceKind = assertSourceKind(input.sourceKind);
  const confidence = assertConfidence(input.confidence);
  const sourceRef = normalizeOptionalText(input.sourceRef, 'sourceRef');

  assertConfidencePolicy({
    sourceKind,
    confidence,
    sourceRef,
    requireSourceRefForHigh: true,
  });

  const id = normalizeId(input.id, ID_PREFIXES.marketSnapshot);
  const createdAt = normalizeUnixSeconds(input.createdAt ?? nowUnixSeconds(), 'createdAt');

  getDatabase(database).prepare(`
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
    capturedAt: normalizeUnixSeconds(input.capturedAt, 'capturedAt'),
    assetSymbol: normalizeRequiredText(input.assetSymbol, 'assetSymbol'),
    assetName: normalizeOptionalText(input.assetName, 'assetName'),
    assetClass: normalizeOptionalText(input.assetClass, 'assetClass'),
    price: normalizeRequiredNumber(input.price, 'price'),
    currency: normalizeOptionalText(input.currency, 'currency'),
    sourceKind,
    sourceName: normalizeOptionalText(input.sourceName, 'sourceName'),
    sourceRef,
    changePercent: normalizeOptionalNumber(input.changePercent, 'changePercent'),
    rawPayloadJson: serializeJsonValue(input.rawPayload, 'rawPayload'),
    confidence,
    limitations: normalizeOptionalText(input.limitations, 'limitations'),
    createdAt,
  });

  return { id, createdAt };
}

export function insertSignal(
  input: SignalInput,
  database: MemoryDatabase = db,
): MemoryWriteResult {
  assertNoRestrictedContent(input, 'signal');

  const sourceKind = assertSourceKind(input.sourceKind);
  const confidence = assertConfidence(input.confidence);
  const proposalStatus = input.proposalStatus === undefined
    ? 'proposal'
    : assertProposalStatus(input.proposalStatus);
  const humanReviewRequired = input.humanReviewRequired ?? true;

  if (humanReviewRequired !== true) {
    throw new Error('Memory Layer v0.1 signals must keep humanReviewRequired true.');
  }

  assertConfidencePolicy({
    sourceKind,
    confidence,
  });

  const id = normalizeId(input.id, ID_PREFIXES.signal);
  const createdAt = normalizeUnixSeconds(input.createdAt ?? nowUnixSeconds(), 'createdAt');
  const relatedRawEventIds = normalizeStringArray(
    input.relatedRawEventIds,
    'relatedRawEventIds',
  );
  const relatedMarketSnapshotIds = normalizeStringArray(
    input.relatedMarketSnapshotIds,
    'relatedMarketSnapshotIds',
  );

  getDatabase(database).prepare(`
    INSERT INTO signals (
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
    ) VALUES (
      @id,
      @detectedAt,
      @signalType,
      @title,
      @summary,
      @severity,
      @direction,
      @strength,
      @confidence,
      @sourceKind,
      @relatedRawEventIdsJson,
      @relatedMarketSnapshotIdsJson,
      @labelsJson,
      @limitations,
      @proposalStatus,
      @humanReviewRequired,
      @createdAt
    )
  `).run({
    id,
    detectedAt: normalizeUnixSeconds(input.detectedAt, 'detectedAt'),
    signalType: normalizeRequiredText(input.signalType, 'signalType'),
    title: normalizeRequiredText(input.title, 'title'),
    summary: normalizeOptionalText(input.summary, 'summary'),
    severity: normalizeRequiredText(input.severity, 'severity'),
    direction: normalizeOptionalText(input.direction, 'direction'),
    strength: normalizeOptionalNumber(input.strength, 'strength'),
    confidence,
    sourceKind,
    relatedRawEventIdsJson: serializeJsonValue(relatedRawEventIds, 'relatedRawEventIds'),
    relatedMarketSnapshotIdsJson: serializeJsonValue(
      relatedMarketSnapshotIds,
      'relatedMarketSnapshotIds',
    ),
    labelsJson: serializeJsonValue(input.labels, 'labels'),
    limitations: normalizeOptionalText(input.limitations, 'limitations'),
    proposalStatus,
    humanReviewRequired: 1,
    createdAt,
  });

  return { id, createdAt };
}

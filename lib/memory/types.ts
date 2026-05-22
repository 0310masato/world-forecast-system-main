export const SOURCE_KINDS = [
  'real_api',
  'real_rss',
  'mock',
  'simulated',
  'estimated',
  'manual',
  'derived',
  'fallback_template',
  'local_cache',
] as const;

export type SourceKind = (typeof SOURCE_KINDS)[number];

export const CONFIDENCES = ['low', 'medium', 'high'] as const;

export type Confidence = (typeof CONFIDENCES)[number];

export const PROPOSAL_STATUSES = [
  'proposal',
  'needs_review',
  'approved',
  'rejected',
  'needs_revision',
  'archived',
] as const;

export type ProposalStatus = (typeof PROPOSAL_STATUSES)[number];

export type JsonValue =
  | null
  | boolean
  | number
  | string
  | JsonValue[]
  | { [key: string]: JsonValue };

export interface MemoryDatabaseStatement {
  all(params?: unknown): unknown[];
  get(params?: unknown): unknown;
  run(params?: unknown): unknown;
}

export interface MemoryDatabase {
  prepare(sql: string): MemoryDatabaseStatement;
}

export interface MemoryWriteResult {
  id: string;
  createdAt: number;
}

interface BaseMemoryInput {
  id?: string;
  sourceKind: SourceKind;
  confidence: Confidence;
  limitations?: string | null;
  createdAt?: number;
}

interface SourceBackedMemoryInput extends BaseMemoryInput {
  sourceName?: string | null;
  sourceRef?: string | null;
}

export interface RawEventInput extends SourceBackedMemoryInput {
  observedAt: number;
  ingestedAt?: number;
  eventDomain: string;
  rawPayload?: JsonValue;
  summary?: string | null;
  labels?: JsonValue;
  isMock?: boolean;
}

export interface MarketSnapshotInput extends SourceBackedMemoryInput {
  capturedAt: number;
  assetSymbol: string;
  assetName?: string | null;
  assetClass?: string | null;
  price: number;
  currency?: string | null;
  changePercent?: number | null;
  rawPayload?: JsonValue;
}

export interface SignalInput extends BaseMemoryInput {
  detectedAt: number;
  signalType: string;
  title: string;
  summary?: string | null;
  severity: string;
  direction?: string | null;
  strength?: number | null;
  relatedRawEventIds?: string[];
  relatedMarketSnapshotIds?: string[];
  labels?: JsonValue;
  proposalStatus?: ProposalStatus;
  humanReviewRequired?: boolean;
}

export interface RawEventRecord {
  id: string;
  observedAt: number;
  ingestedAt: number;
  sourceKind: SourceKind;
  sourceName: string | null;
  sourceRef: string | null;
  eventDomain: string;
  rawPayload: JsonValue | undefined;
  summary: string | null;
  confidence: Confidence;
  limitations: string | null;
  labels: JsonValue | undefined;
  isMock: boolean;
  createdAt: number;
}

export interface MarketSnapshotRecord {
  id: string;
  capturedAt: number;
  assetSymbol: string;
  assetName: string | null;
  assetClass: string | null;
  price: number;
  currency: string | null;
  sourceKind: SourceKind;
  sourceName: string | null;
  sourceRef: string | null;
  changePercent: number | null;
  rawPayload: JsonValue | undefined;
  confidence: Confidence;
  limitations: string | null;
  createdAt: number;
}

export interface SignalRecord {
  id: string;
  detectedAt: number;
  signalType: string;
  title: string;
  summary: string | null;
  severity: string;
  direction: string | null;
  strength: number | null;
  confidence: Confidence;
  sourceKind: SourceKind;
  relatedRawEventIds: string[] | undefined;
  relatedMarketSnapshotIds: string[] | undefined;
  labels: JsonValue | undefined;
  limitations: string | null;
  proposalStatus: ProposalStatus;
  humanReviewRequired: boolean;
  createdAt: number;
}

export interface RecentRawEventsOptions {
  limit?: number;
  eventDomain?: string;
  sourceKind?: SourceKind;
}

export interface RecentMarketSnapshotsOptions {
  limit?: number;
  assetSymbol?: string;
  sourceKind?: SourceKind;
}

export interface RecentSignalsOptions {
  limit?: number;
  signalType?: string;
  proposalStatus?: ProposalStatus;
  sourceKind?: SourceKind;
}

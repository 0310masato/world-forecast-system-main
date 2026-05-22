import type { Confidence, JsonValue, SourceKind } from '../memory/types';

export const CONTEXT_PACK_VERSION = 1 as const;

export const CONTEXT_PACK_SOURCE_TYPES = [
  'signal',
  'raw_event',
  'market_snapshot',
  'policy_doc',
] as const;

export type ContextPackSourceType = (typeof CONTEXT_PACK_SOURCE_TYPES)[number];

export const CONTEXT_PACK_JOB_TYPES = [
  'forecast_review_notes',
  'risk_label_review',
  'miss_pattern_review',
  'refactor_planning_notes',
  'operator_review_context',
] as const;

export type ContextPackJobType = (typeof CONTEXT_PACK_JOB_TYPES)[number];

export interface ContextPackPurpose {
  job_type: ContextPackJobType;
  summary: string;
}

export interface ContextPackSourceRef {
  source_type: ContextPackSourceType;
  id: string;
  ref?: string;
  source_kind?: SourceKind;
  confidence?: Confidence;
  stale?: boolean;
  limitations?: string | null;
}

export interface ContextPackIncludedRecord {
  source_type: Exclude<ContextPackSourceType, 'policy_doc'>;
  id: string;
  source_kind: SourceKind;
  confidence: Confidence;
  stale: boolean;
  summary: string;
  limitations: string | null;
  labels?: JsonValue;
  metadata?: JsonValue;
}

export interface ContextPackIncludedRecords {
  signals: ContextPackIncludedRecord[];
  raw_events: ContextPackIncludedRecord[];
  market_snapshots: ContextPackIncludedRecord[];
  policy_refs: string[];
}

export interface ContextPackExcludedRecord {
  source_type: Exclude<ContextPackSourceType, 'policy_doc'>;
  id: string;
  reason: string;
}

export interface ContextPackBuildOptions {
  signalId: string;
  purpose?: Partial<ContextPackPurpose>;
  contextPackId?: string;
  createdAt?: number;
  now?: number;
  maxRawEvents?: number;
  maxMarketSnapshots?: number;
  staleAfterSeconds?: number;
  policyRefs?: string[];
}

export interface ContextPack {
  context_pack_id: string;
  context_pack_version: typeof CONTEXT_PACK_VERSION;
  created_at: number;
  purpose: ContextPackPurpose;
  source_refs: ContextPackSourceRef[];
  included_records: ContextPackIncludedRecords;
  excluded_records: ContextPackExcludedRecord[];
  safety_labels: string[];
  limitations: string[];
  human_review_required: true;
  proposal_only: true;
  is_production_state: false;
  policy_refs: string[];
}

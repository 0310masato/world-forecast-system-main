import {
  CONTEXT_PACK_SOURCE_TYPES,
  CONTEXT_PACK_VERSION,
  type ContextPack,
  type ContextPackIncludedRecord,
  type ContextPackSourceType,
} from '../context-packs/types';
import {
  AI_ANALYSIS_JOB_KINDS,
  AI_ANALYSIS_JOB_QA_GATE_NAMES,
  type AIAnalysisJobKind,
  type AIAnalysisJobPreflightIssue,
  type AIAnalysisJobPreflightResult,
  type AIAnalysisJobPreflightIssueSeverity,
  type AIAnalysisJobQAGate,
  type AIAnalysisJobQAGateName,
  type AIAnalysisJobQAGateResult,
  type AIAnalysisJobStatus,
} from './types';
import {
  getMissingSafetyLabels,
  getRestrictedContentIssue,
  isAIAnalysisJobKind,
  isConfidence,
  isRealEvidenceSourceKind,
  isSourceKind,
  makeAIAnalysisJobApprovalBoundary,
} from './validation';

type UnknownRecord = Record<string, unknown>;

const QA_GATE_SUMMARIES: Record<AIAnalysisJobQAGateName, string> = {
  context_boundary: 'Context pack version, job kind, and non-production boundary are valid.',
  safety_labels: 'Required safety labels are present and restricted content is absent.',
  policy_refs: 'Policy references are present and reviewable.',
  record_scope: 'Included records preserve source kind, confidence, limitations, and source refs.',
  stale_context: 'Stale records are visible as review issues.',
  excluded_records: 'Excluded records preserve reviewable reasons.',
  human_review: 'Human review remains mandatory before any downstream use.',
};

const CONTEXT_PACK_SOURCE_TYPE_SET = new Set<string>(CONTEXT_PACK_SOURCE_TYPES);

function asRecord(value: unknown): UnknownRecord | null {
  if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
    return value as UnknownRecord;
  }

  return null;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(isNonEmptyString);
}

function issue(params: {
  code: string;
  severity: AIAnalysisJobPreflightIssueSeverity;
  gate: AIAnalysisJobQAGateName;
  message: string;
  path?: string;
  record_id?: string;
}): AIAnalysisJobPreflightIssue {
  return params;
}

function addIssue(
  issues: AIAnalysisJobPreflightIssue[],
  params: Parameters<typeof issue>[0],
): void {
  issues.push(issue(params));
}

function getSourceRefs(pack: UnknownRecord, issues: AIAnalysisJobPreflightIssue[]): UnknownRecord[] {
  const sourceRefs = pack.source_refs;

  if (!Array.isArray(sourceRefs)) {
    addIssue(issues, {
      code: 'source_refs_missing',
      severity: 'blocking',
      gate: 'record_scope',
      message: 'context pack must include source_refs.',
      path: 'source_refs',
    });
    return [];
  }

  return sourceRefs.map(asRecord).filter((record): record is UnknownRecord => record !== null);
}

function findSourceRef(
  sourceRefs: UnknownRecord[],
  sourceType: ContextPackSourceType,
  id: string,
): UnknownRecord | null {
  return sourceRefs.find(
    (sourceRef) => sourceRef.source_type === sourceType && sourceRef.id === id,
  ) ?? null;
}

function getIncludedArray(
  includedRecords: UnknownRecord | null,
  key: 'signals' | 'raw_events' | 'market_snapshots',
  issues: AIAnalysisJobPreflightIssue[],
): unknown[] {
  if (!includedRecords) {
    addIssue(issues, {
      code: 'included_records_missing',
      severity: 'blocking',
      gate: 'record_scope',
      message: 'context pack must include included_records.',
      path: 'included_records',
    });
    return [];
  }

  const value = includedRecords[key];
  if (!Array.isArray(value)) {
    addIssue(issues, {
      code: `${key}_missing`,
      severity: 'blocking',
      gate: 'record_scope',
      message: `included_records.${key} must be an array.`,
      path: `included_records.${key}`,
    });
    return [];
  }

  return value;
}

function getMetadataText(record: UnknownRecord, key: string): string | null {
  const metadata = asRecord(record.metadata);
  const value = metadata?.[key];

  return isNonEmptyString(value) ? value : null;
}

function hasMetadataNumber(record: UnknownRecord, key: string): boolean {
  const metadata = asRecord(record.metadata);
  const value = metadata?.[key];
  return typeof value === 'number' && Number.isFinite(value);
}

function requiredTimestampKey(sourceType: ContextPackIncludedRecord['source_type']): string {
  if (sourceType === 'raw_event') {
    return 'observed_at';
  }

  if (sourceType === 'market_snapshot') {
    return 'captured_at';
  }

  return 'detected_at';
}

function validateIncludedRecord(params: {
  record: unknown;
  sourceType: ContextPackIncludedRecord['source_type'];
  index: number;
  sourceRefs: UnknownRecord[];
  issues: AIAnalysisJobPreflightIssue[];
}): void {
  const path = `included_records.${params.sourceType}s[${params.index}]`;
  const record = asRecord(params.record);

  if (!record) {
    addIssue(params.issues, {
      code: 'included_record_invalid',
      severity: 'blocking',
      gate: 'record_scope',
      message: 'included record must be an object.',
      path,
    });
    return;
  }

  const id = record.id;
  const sourceKind = record.source_kind;
  const confidence = record.confidence;
  const stale = record.stale;

  if (!isNonEmptyString(id)) {
    addIssue(params.issues, {
      code: 'included_record_id_missing',
      severity: 'blocking',
      gate: 'record_scope',
      message: 'included record must preserve a non-empty id.',
      path: `${path}.id`,
    });
    return;
  }

  if (!isSourceKind(sourceKind)) {
    addIssue(params.issues, {
      code: 'source_kind_invalid',
      severity: 'blocking',
      gate: 'record_scope',
      message: 'included record must preserve a valid source_kind.',
      path: `${path}.source_kind`,
      record_id: id,
    });
  }

  if (!isConfidence(confidence)) {
    addIssue(params.issues, {
      code: 'confidence_invalid',
      severity: 'blocking',
      gate: 'record_scope',
      message: 'included record must preserve low, medium, or high confidence.',
      path: `${path}.confidence`,
      record_id: id,
    });
  }

  if (stale !== true && stale !== false) {
    addIssue(params.issues, {
      code: 'stale_flag_missing',
      severity: 'blocking',
      gate: 'record_scope',
      message: 'included record must preserve the stale flag.',
      path: `${path}.stale`,
      record_id: id,
    });
  }

  if (!('limitations' in record)) {
    addIssue(params.issues, {
      code: 'limitations_missing',
      severity: 'blocking',
      gate: 'record_scope',
      message: 'included record must preserve limitations, even when null.',
      path: `${path}.limitations`,
      record_id: id,
    });
  }

  const sourceRef = findSourceRef(params.sourceRefs, params.sourceType, id);
  if (!sourceRef) {
    addIssue(params.issues, {
      code: 'source_ref_missing',
      severity: 'blocking',
      gate: 'record_scope',
      message: 'included record must have a matching source_refs entry.',
      path: 'source_refs',
      record_id: id,
    });
  } else {
    if (sourceRef.source_kind !== sourceKind) {
      addIssue(params.issues, {
        code: 'source_ref_kind_mismatch',
        severity: 'blocking',
        gate: 'record_scope',
        message: 'source_refs entry must preserve the included record source_kind.',
        path: 'source_refs',
        record_id: id,
      });
    }

    if (sourceRef.confidence !== confidence) {
      addIssue(params.issues, {
        code: 'source_ref_confidence_mismatch',
        severity: 'blocking',
        gate: 'record_scope',
        message: 'source_refs entry must preserve the included record confidence.',
        path: 'source_refs',
        record_id: id,
      });
    }

    if (!('limitations' in sourceRef)) {
      addIssue(params.issues, {
        code: 'source_ref_limitations_missing',
        severity: 'blocking',
        gate: 'record_scope',
        message: 'source_refs entry must preserve limitations.',
        path: 'source_refs',
        record_id: id,
      });
    }
  }

  if (stale === true) {
    addIssue(params.issues, {
      code: 'stale_record',
      severity: 'review_required',
      gate: 'stale_context',
      message: 'stale record is present and must be reviewed before downstream use.',
      path: `${path}.stale`,
      record_id: id,
    });
  }

  if (confidence === 'high' && isSourceKind(sourceKind)) {
    if (!isRealEvidenceSourceKind(sourceKind)) {
      addIssue(params.issues, {
        code: 'high_confidence_source_kind_invalid',
        severity: 'blocking',
        gate: 'record_scope',
        message: 'high confidence records must come from real_api or real_rss sources.',
        path: `${path}.source_kind`,
        record_id: id,
      });
    }

    if (stale === true) {
      addIssue(params.issues, {
        code: 'high_confidence_stale',
        severity: 'blocking',
        gate: 'stale_context',
        message: 'high confidence records must not be stale for the requested context window.',
        path: `${path}.stale`,
        record_id: id,
      });
    }

    const timestampKey = requiredTimestampKey(params.sourceType);
    if (!hasMetadataNumber(record, timestampKey)) {
      addIssue(params.issues, {
        code: 'high_confidence_timestamp_missing',
        severity: 'blocking',
        gate: 'record_scope',
        message: `high confidence records must preserve metadata.${timestampKey}.`,
        path: `${path}.metadata.${timestampKey}`,
        record_id: id,
      });
    }

    if (
      (params.sourceType === 'raw_event' || params.sourceType === 'market_snapshot')
      && !getMetadataText(record, 'source_ref')
      && !isNonEmptyString(sourceRef?.ref)
    ) {
      addIssue(params.issues, {
        code: 'high_confidence_source_ref_missing',
        severity: 'blocking',
        gate: 'record_scope',
        message: 'high confidence source-backed records must preserve source_ref.',
        path: `${path}.metadata.source_ref`,
        record_id: id,
      });
    }
  }
}

function validateIncludedRecords(
  pack: UnknownRecord,
  sourceRefs: UnknownRecord[],
  issues: AIAnalysisJobPreflightIssue[],
): void {
  const includedRecords = asRecord(pack.included_records);
  const signals = getIncludedArray(includedRecords, 'signals', issues);
  const rawEvents = getIncludedArray(includedRecords, 'raw_events', issues);
  const marketSnapshots = getIncludedArray(includedRecords, 'market_snapshots', issues);
  const totalIncludedRecords = signals.length + rawEvents.length + marketSnapshots.length;

  if (totalIncludedRecords === 0) {
    addIssue(issues, {
      code: 'included_records_empty',
      severity: 'blocking',
      gate: 'record_scope',
      message: 'context pack must include at least one memory record.',
      path: 'included_records',
    });
  }

  if (signals.length === 0) {
    addIssue(issues, {
      code: 'included_signals_empty',
      severity: 'blocking',
      gate: 'record_scope',
      message: 'Context Pack Builder v0 intake requires at least one included signal.',
      path: 'included_records.signals',
    });
  }

  signals.forEach((record, index) => validateIncludedRecord({
    record,
    sourceType: 'signal',
    index,
    sourceRefs,
    issues,
  }));
  rawEvents.forEach((record, index) => validateIncludedRecord({
    record,
    sourceType: 'raw_event',
    index,
    sourceRefs,
    issues,
  }));
  marketSnapshots.forEach((record, index) => validateIncludedRecord({
    record,
    sourceType: 'market_snapshot',
    index,
    sourceRefs,
    issues,
  }));
}

function validateExcludedRecords(
  pack: UnknownRecord,
  issues: AIAnalysisJobPreflightIssue[],
): void {
  const excludedRecords = pack.excluded_records;

  if (!Array.isArray(excludedRecords)) {
    addIssue(issues, {
      code: 'excluded_records_missing',
      severity: 'blocking',
      gate: 'excluded_records',
      message: 'context pack must include excluded_records as an array.',
      path: 'excluded_records',
    });
    return;
  }

  excludedRecords.forEach((value, index) => {
    const record = asRecord(value);
    const path = `excluded_records[${index}]`;

    if (!record) {
      addIssue(issues, {
        code: 'excluded_record_invalid',
        severity: 'blocking',
        gate: 'excluded_records',
        message: 'excluded record must be an object.',
        path,
      });
      return;
    }

    const id = record.id;
    const sourceType = record.source_type;

    if (!isNonEmptyString(id)) {
      addIssue(issues, {
        code: 'excluded_record_id_missing',
        severity: 'blocking',
        gate: 'excluded_records',
        message: 'excluded record must preserve an id.',
        path: `${path}.id`,
      });
    }

    if (typeof sourceType !== 'string' || !CONTEXT_PACK_SOURCE_TYPE_SET.has(sourceType)) {
      addIssue(issues, {
        code: 'excluded_record_source_type_invalid',
        severity: 'blocking',
        gate: 'excluded_records',
        message: 'excluded record must preserve a valid source_type.',
        path: `${path}.source_type`,
        record_id: isNonEmptyString(id) ? id : undefined,
      });
    }

    if (!isNonEmptyString(record.reason)) {
      addIssue(issues, {
        code: 'excluded_record_reason_missing',
        severity: 'blocking',
        gate: 'excluded_records',
        message: 'excluded record must preserve a reviewable reason.',
        path: `${path}.reason`,
        record_id: isNonEmptyString(id) ? id : undefined,
      });
      return;
    }

    addIssue(issues, {
      code: 'excluded_record_present',
      severity: 'review_required',
      gate: 'excluded_records',
      message: 'excluded record is present and its reason must be reviewed.',
      path,
      record_id: isNonEmptyString(id) ? id : undefined,
    });
  });
}

function validatePolicyRefs(pack: UnknownRecord, issues: AIAnalysisJobPreflightIssue[]): void {
  if (!isStringArray(pack.policy_refs) || pack.policy_refs.length === 0) {
    addIssue(issues, {
      code: 'policy_refs_empty',
      severity: 'blocking',
      gate: 'policy_refs',
      message: 'context pack policy_refs must contain at least one policy reference.',
      path: 'policy_refs',
    });
  }

  const includedRecords = asRecord(pack.included_records);
  const includedPolicyRefs = includedRecords?.policy_refs;
  if (!isStringArray(includedPolicyRefs) || includedPolicyRefs.length === 0) {
    addIssue(issues, {
      code: 'included_policy_refs_empty',
      severity: 'blocking',
      gate: 'policy_refs',
      message: 'included_records.policy_refs must contain at least one policy reference.',
      path: 'included_records.policy_refs',
    });
  }
}

function validateSourceRefs(pack: UnknownRecord, issues: AIAnalysisJobPreflightIssue[]): void {
  const sourceRefs = pack.source_refs;

  if (!Array.isArray(sourceRefs) || sourceRefs.length === 0) {
    addIssue(issues, {
      code: 'source_refs_empty',
      severity: 'blocking',
      gate: 'record_scope',
      message: 'context pack source_refs must contain at least one source reference.',
      path: 'source_refs',
    });
    return;
  }

  const hasPolicyDocRef = sourceRefs.some((value) => {
    const sourceRef = asRecord(value);
    return sourceRef?.source_type === 'policy_doc' && isNonEmptyString(sourceRef.ref);
  });

  if (!hasPolicyDocRef) {
    addIssue(issues, {
      code: 'policy_doc_source_ref_missing',
      severity: 'blocking',
      gate: 'policy_refs',
      message: 'source_refs must preserve at least one policy_doc reference.',
      path: 'source_refs',
    });
  }
}

function validateContextBoundary(
  pack: UnknownRecord,
  issues: AIAnalysisJobPreflightIssue[],
): AIAnalysisJobKind | null {
  let jobKind: AIAnalysisJobKind | null = null;

  if (pack.context_pack_version !== CONTEXT_PACK_VERSION) {
    addIssue(issues, {
      code: 'context_pack_version_invalid',
      severity: 'blocking',
      gate: 'context_boundary',
      message: `context_pack_version must be ${CONTEXT_PACK_VERSION}.`,
      path: 'context_pack_version',
    });
  }

  const purpose = asRecord(pack.purpose);
  if (!isAIAnalysisJobKind(purpose?.job_type)) {
    addIssue(issues, {
      code: 'job_type_invalid',
      severity: 'blocking',
      gate: 'context_boundary',
      message: `purpose.job_type must be one of: ${AI_ANALYSIS_JOB_KINDS.join(', ')}.`,
      path: 'purpose.job_type',
    });
  } else {
    jobKind = purpose.job_type;
  }

  if (pack.proposal_only !== true) {
    addIssue(issues, {
      code: 'proposal_only_required',
      severity: 'blocking',
      gate: 'context_boundary',
      message: 'context pack must remain proposal_only.',
      path: 'proposal_only',
    });
  }

  if (pack.is_production_state !== false) {
    addIssue(issues, {
      code: 'non_production_state_required',
      severity: 'blocking',
      gate: 'context_boundary',
      message: 'context pack must not be production state.',
      path: 'is_production_state',
    });
  }

  return jobKind;
}

function validateHumanReview(pack: UnknownRecord, issues: AIAnalysisJobPreflightIssue[]): void {
  if (pack.human_review_required !== true) {
    addIssue(issues, {
      code: 'human_review_required',
      severity: 'blocking',
      gate: 'human_review',
      message: 'context pack must require human review.',
      path: 'human_review_required',
    });
  }
}

function validateSafety(pack: UnknownRecord, issues: AIAnalysisJobPreflightIssue[]): void {
  const restrictedContentIssue = getRestrictedContentIssue(pack);
  if (restrictedContentIssue) {
    addIssue(issues, {
      code: 'restricted_content_detected',
      severity: 'blocking',
      gate: 'safety_labels',
      message: restrictedContentIssue,
    });
  }

  const missingLabels = getMissingSafetyLabels(pack.safety_labels);
  for (const label of missingLabels) {
    addIssue(issues, {
      code: 'safety_label_missing',
      severity: 'blocking',
      gate: 'safety_labels',
      message: `context pack is missing safety label: ${label}.`,
      path: 'safety_labels',
    });
  }
}

function makeQAGates(issues: AIAnalysisJobPreflightIssue[]): AIAnalysisJobQAGate[] {
  return AI_ANALYSIS_JOB_QA_GATE_NAMES.map((name) => {
    const gateIssues = issues.filter((item) => item.gate === name);
    const hasBlockingIssue = gateIssues.some((item) => item.severity === 'blocking');
    const hasReviewIssue = gateIssues.some((item) => item.severity === 'review_required');
    const result: AIAnalysisJobQAGateResult = hasBlockingIssue
      ? 'fail'
      : hasReviewIssue
        ? 'review_required'
        : 'pass';

    return {
      name,
      result,
      passed: result !== 'fail',
      issue_count: gateIssues.length,
      summary: QA_GATE_SUMMARIES[name],
    };
  });
}

function resolveStatus(issues: AIAnalysisJobPreflightIssue[]): AIAnalysisJobStatus {
  const blockingIssues = issues.filter((item) => item.severity === 'blocking');

  if (blockingIssues.length === 0) {
    return 'ready_for_human_review';
  }

  if (blockingIssues.some((item) => item.code === 'included_records_empty')) {
    return 'blocked_by_missing_context';
  }

  if (blockingIssues.some((item) => item.gate === 'stale_context')) {
    return 'blocked_by_stale_context';
  }

  if (blockingIssues.some((item) => item.gate === 'safety_labels' || item.gate === 'human_review')) {
    return 'blocked_by_safety';
  }

  if (blockingIssues.some((item) => item.code === 'job_type_invalid')) {
    return 'blocked_by_policy';
  }

  if (blockingIssues.some((item) => item.gate === 'context_boundary')) {
    return 'blocked_by_safety';
  }

  return 'blocked_by_policy';
}

export function preflightAIAnalysisJobIntake(
  contextPack: ContextPack,
): AIAnalysisJobPreflightResult {
  const pack = asRecord(contextPack);
  const issues: AIAnalysisJobPreflightIssue[] = [];

  if (!pack) {
    addIssue(issues, {
      code: 'context_pack_invalid',
      severity: 'blocking',
      gate: 'context_boundary',
      message: 'context pack must be an object.',
    });
  }

  const safePack: UnknownRecord = pack ?? {};
  const jobKind = validateContextBoundary(safePack, issues);
  validateHumanReview(safePack, issues);
  validateSafety(safePack, issues);
  validatePolicyRefs(safePack, issues);
  validateSourceRefs(safePack, issues);
  const sourceRefs = getSourceRefs(safePack, issues);
  validateIncludedRecords(safePack, sourceRefs, issues);
  validateExcludedRecords(safePack, issues);

  const status = resolveStatus(issues);
  const passed = !issues.some((item) => item.severity === 'blocking');
  const contextPackId = isNonEmptyString(safePack.context_pack_id)
    ? safePack.context_pack_id
    : null;
  const contextPackVersion = typeof safePack.context_pack_version === 'number'
    ? safePack.context_pack_version
    : null;

  return {
    passed,
    status,
    job_kind: jobKind,
    context_pack_id: contextPackId,
    context_pack_version: contextPackVersion,
    issues,
    qa_gates: makeQAGates(issues),
    ...makeAIAnalysisJobApprovalBoundary(),
  };
}

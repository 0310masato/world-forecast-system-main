# Context Pack Example

This is a safe filled example for Context Pack Builder v0.

It is not a real operations log, not an AI job input captured from production,
and not a source of record for forecasts, prices, evaluations, or saved
predictions. It uses sanitized sample IDs only and contains no credential-like
values, raw local paths, NAS paths, private network details, production logs,
or real operational data.

## Example Context Pack Record

```yaml
context_pack_id: "sample-context-pack-docs-only-001"
context_pack_version: 1
created_at: "2026-05-24T00:00:00Z"
generated_at: "2026-05-24T00:00:00Z"
purpose:
  job_type: "docs_review_support"
  summary: "Provide sanitized docs-only sample context for human review support."
source_refs:
  - source_type: "signal"
    id: "sample-signal-docs-only-001"
    source_kind: "manual"
    confidence: "medium"
    stale: false
    limitations: "Operator-written sample signal; not evidence of live production behavior."
  - source_type: "raw_event"
    id: "sample-raw-event-docs-only-001"
    source_kind: "simulated"
    confidence: "medium"
    stale: false
    limitations: "Simulated sample raw event; no external feed or production log is represented."
  - source_type: "market_snapshot"
    id: "sample-market-snapshot-docs-only-001"
    source_kind: "estimated"
    confidence: "low"
    stale: true
    limitations: "Estimated stale sample; not a current market price or evaluation source."
  - source_type: "policy_doc"
    id: "docs/CONTEXT_PACKS.md"
    ref: "docs/CONTEXT_PACKS.md"
  - source_type: "policy_doc"
    id: "docs/AI_ANALYSIS_JOBS.md"
    ref: "docs/AI_ANALYSIS_JOBS.md"
  - source_type: "policy_doc"
    id: "docs/HUMAN_APPROVAL.md"
    ref: "docs/HUMAN_APPROVAL.md"
included_records:
  signals:
    - source_type: "signal"
      id: "sample-signal-docs-only-001"
      source_kind: "manual"
      confidence: "medium"
      stale: false
      summary: "Sample docs-review signal for checking proposal-only wording."
      limitations: "Manual sample only; not a production forecast or operational signal."
      labels:
        sample_record: true
        docs_only: true
      metadata:
        detected_at: "2026-05-24T00:00:00Z"
        proposal_status: "proposal"
        human_review_required: true
  raw_events:
    - source_type: "raw_event"
      id: "sample-raw-event-docs-only-001"
      source_kind: "simulated"
      confidence: "medium"
      stale: false
      summary: "Sanitized sample raw event used only to demonstrate record shape."
      limitations: "No live feed, private source, or production log is represented."
      labels:
        sample_record: true
        simulated: true
      metadata:
        observed_at: "2026-05-24T00:00:00Z"
        event_domain: "docs_review"
        source_ref: "sample-source-ref-docs-only-001"
  market_snapshots:
    - source_type: "market_snapshot"
      id: "sample-market-snapshot-docs-only-001"
      source_kind: "estimated"
      confidence: "low"
      stale: true
      summary: "Sanitized sample market snapshot included to show visible stale handling."
      limitations: "Stale estimated sample; must not be treated as a current price, forecast, or evaluation record."
      labels:
        sample_record: true
        stale_example: true
      metadata:
        captured_at: "2026-05-20T00:00:00Z"
        asset_symbol: "SAMPLE_ASSET"
        source_ref: "sample-source-ref-docs-only-002"
  policy_refs:
    - "docs/CONTEXT_PACKS.md"
    - "docs/AI_ANALYSIS_JOBS.md"
    - "docs/HUMAN_APPROVAL.md"
excluded_records:
  - source_type: "raw_event"
    id: "sample-raw-event-excluded-restricted-placeholder-001"
    reason: "Excluded because the placeholder represents content that should not enter a reviewed context pack."
  - source_type: "market_snapshot"
    id: "sample-market-snapshot-excluded-stale-current-claim-001"
    reason: "Excluded because a stale sample must not be represented as current high-confidence evidence."
limitations:
  - "This is a writing sample only and is not a production forecast, price, evaluation, or saved prediction."
  - "All IDs are sanitized sample IDs and do not prove that upstream records exist."
  - "Stale sample records remain visibly labeled for human review."
  - "The context pack is non-production review material and cannot authorize downstream execution."
policy_refs:
  - "docs/CONTEXT_PACKS.md"
  - "docs/AI_ANALYSIS_JOBS.md"
  - "docs/HUMAN_APPROVAL.md"
human_review_required: true
proposal_only: true
is_production_state: false
safety_labels:
  - "AI analysis input"
  - "Not production state"
  - "Proposal-only context"
  - "Human approval required"
  - "Not investment advice"
  - "Not navigation guidance"
  - "Not military guidance"
  - "Not automated trading guidance"
```

## Safe Use Notes

- Use this as a Context Pack writing sample, not as a live context pack.
- The sample records preserve `source_kind`, `confidence`, `limitations`, and
  `stale` labels so human reviewers can see uncertainty and age.
- `proposal_only: true` and `is_production_state: false` must remain visible.
- This example does not authorize AI job execution, prompt execution, worker
  runtime, API changes, database writes, deployment, external publishing,
  automation, trading, navigation guidance, or military guidance.

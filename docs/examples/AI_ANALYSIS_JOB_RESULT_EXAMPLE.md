# AI Analysis Job Result Example

This is a safe filled example for AI Analysis Job Result Contract v0.

It is not an actual AI job result, not prompt execution output, not production
state, and not permission to apply anything. It uses sanitized sample IDs only
and contains no credential-like values, raw local paths, NAS paths, private
network details, production logs, or real operational data.

## Example AI Analysis Result Record

```yaml
result_id: "sample-ai-analysis-result-docs-only-001"
result_version: 1
job_kind: "docs_review_support"
context_pack_id: "sample-context-pack-docs-only-001"
context_pack_version: 1
generated_at: "2026-05-24T00:10:00Z"
proposal_status: "needs_review"
confidence: "medium"
summary: "The sanitized docs-only sample context appears suitable as review material for example-writing guidance. This result is proposal-only and requires human review."
evidence:
  - source_type: "signal"
    id: "sample-signal-docs-only-001"
    summary: "Sample docs-review signal preserves proposal-only and human-review-required labels."
    confidence: "medium"
  - source_type: "raw_event"
    id: "sample-raw-event-docs-only-001"
    summary: "Simulated sample raw event demonstrates source kind, confidence, and limitations fields."
    confidence: "medium"
  - source_type: "market_snapshot"
    id: "sample-market-snapshot-docs-only-001"
    summary: "Estimated stale sample market snapshot remains visibly labeled as stale."
    confidence: "low"
limitations:
  - id: "sample-limitation-docs-only-001"
    summary: "This record is a writing sample and does not prove that real upstream records exist."
  - id: "sample-limitation-docs-only-002"
    summary: "The stale sample snapshot must not be used as current price, forecast, or evaluation evidence."
  - id: "sample-limitation-docs-only-003"
    summary: "Any later implementation idea requires separate human review and a dedicated scope."
safety_labels:
  - "AI-generated proposal"
  - "AI analysis result"
  - "Proposal-only result"
  - "Not production state"
  - "Human approval required"
  - "Not investment advice"
  - "Not navigation guidance"
  - "Not military guidance"
  - "Not automated trading guidance"
  - "Not external publishing"
requires_human_approval: true
recommended_decision: "review"
next_review_steps:
  - "Confirm that all source IDs are sanitized samples and not operational records."
  - "Confirm that this result remains review material only."
  - "Route any later implementation idea to a separate human-reviewed path."
allowed_next_step: "human_review_only"
forbidden_next_steps:
  - "production_write"
  - "api_forecast_update"
  - "api_hormuz_update"
  - "api_hormuz_news_update"
  - "db_migration"
  - "external_publish"
  - "automated_trading"
  - "navigation_guidance"
  - "military_guidance"
  - "direct_deploy"
  - "worker_runtime"
  - "codex_app_server_runtime"
  - "scheduler_runtime"
  - "external_api_integration"
proposal_only: true
is_production_state: false
```

## Safe Use Notes

- Use this as an AI result writing sample, not as a real result or execution
  record.
- `proposal_status` stays at `needs_review`; statuses such as `approved`,
  `applied`, and `production_released` are not used here.
- The result is human review material only. It does not authorize deployment,
  API changes, database writes, migrations, external publishing, automation,
  trading, navigation guidance, military guidance, or production promotion.

# AI Analysis Job Intake Preflight Example

This is a safe filled example for AI Analysis Job Intake Preflight v0.

It is a preflight inspection sample only. It is not prompt execution, not an AI
job runner output, not worker runtime behavior, and not permission to run an AI
analysis job. It uses sanitized sample IDs only and contains no
credential-like values, raw local paths, NAS paths, private network details,
production logs, or real operational data.

## Example Preflight Record

```yaml
preflight_id: "sample-ai-analysis-preflight-docs-only-001"
preflight_version: 1
job_kind: "docs_review_support"
context_pack_id: "sample-context-pack-docs-only-001"
context_pack_version: 1
checked_at: "2026-05-24T00:05:00Z"
passed: true
status: "ready_for_human_review"
qa_gates:
  - name: "context_boundary"
    result: "pass"
    passed: true
    issue_count: 0
    summary: "Context pack version and non-production boundary are visible."
  - name: "safety_labels"
    result: "pass"
    passed: true
    issue_count: 0
    summary: "Required safety labels are present in the sample."
  - name: "policy_refs"
    result: "pass"
    passed: true
    issue_count: 0
    summary: "Policy references are reviewable docs-only references."
  - name: "record_scope"
    result: "pass"
    passed: true
    issue_count: 0
    summary: "Included sample records preserve source kind, confidence, limitations, and source refs."
  - name: "stale_context"
    result: "review_required"
    passed: true
    issue_count: 1
    summary: "A stale sample record is visible and must remain review material."
  - name: "excluded_records"
    result: "review_required"
    passed: true
    issue_count: 2
    summary: "Excluded sample records preserve reviewable reasons."
  - name: "human_review"
    result: "pass"
    passed: true
    issue_count: 0
    summary: "Human review remains mandatory before any downstream use."
issues:
  - code: "stale_record"
    severity: "review_required"
    gate: "stale_context"
    message: "The sample market snapshot is stale and must be checked by a human reviewer."
    path: "included_records.market_snapshots[0].stale"
    record_id: "sample-market-snapshot-docs-only-001"
  - code: "excluded_record_present"
    severity: "review_required"
    gate: "excluded_records"
    message: "The excluded sample raw event has a reviewable exclusion reason."
    path: "excluded_records[0]"
    record_id: "sample-raw-event-excluded-restricted-placeholder-001"
  - code: "excluded_record_present"
    severity: "review_required"
    gate: "excluded_records"
    message: "The excluded sample market snapshot has a reviewable exclusion reason."
    path: "excluded_records[1]"
    record_id: "sample-market-snapshot-excluded-stale-current-claim-001"
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
  - "worker_runtime"
  - "codex_app_server_runtime"
  - "scheduler_runtime"
  - "external_api_integration"
human_review_required: true
proposal_only: true
is_production_state: false
```

## Safe Use Notes

- Preflight only checks whether the sample context is ready for human review.
- AI job runner code, prompt execution, worker runtime, and storage paths are
  not introduced by this example.
- `allowed_next_step: "human_review_only"` is the only allowed next step.
- Passing preflight does not permit production writes, API changes, database
  migrations, external publishing, trading, navigation guidance, military
  guidance, runtime additions, or automation.

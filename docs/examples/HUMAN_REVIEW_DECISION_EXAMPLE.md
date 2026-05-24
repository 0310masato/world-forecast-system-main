# Human Review Decision Example

This is a safe filled example for Human Review Decision Contract v0.

It is not a real approval record, not a production apply event, and not
permission to execute work. It uses sanitized sample IDs only and contains no
credential-like values, raw local paths, NAS paths, private network details,
production logs, or real operational data.

## Example Human Review Decision Record

```yaml
decision_id: "sample-human-review-decision-docs-only-001"
decision_version: 1
reviewed_result_id: "sample-ai-analysis-result-docs-only-001"
reviewed_result_version: 1
job_kind: "docs_review_support"
context_pack_id: "sample-context-pack-docs-only-001"
context_pack_version: 1
decided_at: "2026-05-24T00:15:00Z"
reviewer_id: "sample-human-reviewer-001"
outcome: "approved_for_later_implementation"
rationale: "The sample result may be considered for a later docs-only planning path. This outcome is review permission only and does not apply anything."
required_next_steps:
  - "Prepare a separate docs-only implementation proposal if a later reviewer wants a draft plan."
  - "Keep protected paths, runtime surfaces, external integrations, and automation out of the later scope unless separately reviewed."
  - "Confirm again that all sample IDs are sanitized and not operational records."
residual_risks:
  - "A reader could confuse approved_for_later_implementation with immediate application unless this boundary stays visible."
  - "The sample source chain could be mistaken for real evidence unless safe-use notes remain attached."
requires_separate_implementation: true
allowed_next_step: "separate_implementation_pr_only"
forbidden_next_steps:
  - "production_write"
  - "api_forecast_update"
  - "api_hormuz_update"
  - "api_hormuz_news_update"
  - "external_publish"
  - "automated_trading"
  - "navigation_guidance"
  - "military_guidance"
  - "db_migration"
  - "direct_deploy"
  - "worker_runtime"
  - "codex_app_server_runtime"
  - "scheduler_runtime"
  - "external_api_integration"
is_production_state: false
does_not_modify_api: true
does_not_write_db: true
does_not_publish_externally: true
```

## Safe Use Notes

- `approved_for_later_implementation` means a later separate implementation PR
  may be considered. It does not mean production apply.
- Human review does not automatically run work, update APIs, write databases,
  run migrations, deploy, publish externally, trade, provide navigation
  guidance, or provide military guidance.
- Any later implementation path needs its own reviewed scope, checks, and
  rollback plan.

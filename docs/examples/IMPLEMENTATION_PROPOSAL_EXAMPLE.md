# Implementation Proposal Example

This is a safe filled example for Implementation Proposal Contract v0.

It is not implementation work, not a production apply event, and not permission
to execute work. It uses sanitized sample IDs only and contains no
credential-like values, raw local paths, NAS paths, private network details,
production logs, or real operational data.

## Example Implementation Proposal Record

```yaml
proposal_id: "sample-implementation-proposal-docs-only-001"
proposal_version: 1
source_decision_id: "sample-human-review-decision-docs-only-001"
source_decision_version: 1
reviewed_result_id: "sample-ai-analysis-result-docs-only-001"
reviewed_result_version: 1
job_kind: "docs_review_support"
context_pack_id: "sample-context-pack-docs-only-001"
context_pack_version: 1
created_at: "2026-05-24T00:20:00Z"
proposal_status: "proposal"
change_type: "docs_only"
summary: "Plan a docs-only example record update for a later draft PR review. This is a plan only, not the change itself."
rationale: "The human review decision allowed later docs-only planning to be considered in a separate path while keeping proposal-only and non-production boundaries intact."
intended_files:
  - "docs/examples/CONTEXT_PACK_EXAMPLE.md"
  - "docs/examples/AI_ANALYSIS_JOB_INTAKE_PREFLIGHT_EXAMPLE.md"
  - "docs/examples/AI_ANALYSIS_JOB_RESULT_EXAMPLE.md"
  - "docs/examples/HUMAN_REVIEW_DECISION_EXAMPLE.md"
  - "docs/examples/IMPLEMENTATION_PROPOSAL_EXAMPLE.md"
forbidden_files:
  - "app/api/forecast/route.ts"
  - "app/api/hormuz/route.ts"
  - "app/api/hormuz/news/route.ts"
  - "lib/db.ts"
  - "package-lock.json"
acceptance_criteria:
  - "All example records use sanitized sample IDs and describe writing samples only."
  - "The records keep proposal_only, human review, and non-production boundaries visible where applicable."
  - "Protected paths stay in forbidden_files and are not listed in intended_files."
  - "No credential-like values, raw local paths, NAS paths, private network details, production logs, or real operational data appear."
test_plan:
  - "Review the Markdown files against the contract docs and type definitions."
  - "Confirm the diff is limited to docs/examples and minimal docs references."
  - "Run whitespace and repository checks before human review."
rollback_plan:
  - "If human review rejects this proposal, remove or revise the docs-only example files in a later reviewed path."
residual_risks:
  - "A reader might treat example records as live operational evidence unless safe-use notes stay visible."
  - "The sample job_kind is illustrative and must be checked against source contract docs before any real record is created."
requires_human_approval: true
requires_separate_pr: true
allowed_next_step: "implementation_pr_draft_only"
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
proposal_only: true
is_production_state: false
does_not_modify_api: true
does_not_write_db: true
does_not_run_migration: true
does_not_deploy: true
does_not_publish_externally: true
```

## Safe Use Notes

- Use this as an implementation proposal writing sample, not as the
  implementation itself.
- `allowed_next_step: "implementation_pr_draft_only"` means draft planning
  material may be prepared for human review. It does not authorize runtime,
  API, database, worker, scheduler, external integration, deployment,
  publishing, automation, or production state changes.
- A later implementation, if any, must be reviewed separately with its own
  scope, tests, and rollback plan.

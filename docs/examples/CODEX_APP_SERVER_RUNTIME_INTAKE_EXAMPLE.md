# Codex App Server Runtime Intake Example v0

## Purpose

This is a safe filled example for Codex App Server Runtime Intake Gate v0.

It models a case where a future runtime design PR was requested, but the intake
record keeps the request proposal-only and human-review-only until the required
design, test, rollback, and disable inputs are reviewed.

This example is not runtime implementation, not worker behavior, not scheduler
behavior, not file-writing automation, and not permission to connect APIs,
change databases, create operational jobs, merge, deploy, or promote proposal
data into production state.

## Safety Boundary

The record uses sanitized sample references only. It contains no secrets,
credential-like values, `.env` values, OAuth tokens, API keys, raw local paths,
NAS paths, private network details, production logs, or real operational data.

`ready_for_runtime_design_pr` in this example means only that a later set of
runtime design PR instructions may be prepared for human review. It does not
authorize runtime implementation.

## Example Intake Record

```yaml
intake_id: "sample-runtime-intake-design-discussion-001"
intake_version: 1
created_at: "2026-05-25"
human_owner: "sample-human-owner-001"
requested_runtime_goal: "Evaluate whether a future Codex App Server runtime design PR can be drafted for proposal review support."
source_materials:
  - "sanitized user-provided runtime design notes"
  - "sanitized Codex App Server sidecar policy summary"
  - "sanitized human approval boundary summary"
missing_materials:
  - "Detailed worker separation boundary for the future design."
  - "Disable trigger owner and escalation path."
  - "Concrete review-only test checklist for restricted content handling."
target_environment: "unknown"
runtime_scope:
  codex_app_server_runtime: false
  worker_runtime: false
  scheduler_runtime: false
  external_api_integration: false
  db_migration: false
  api_forecast_connection: false
  api_hormuz_connection: false
  api_hormuz_news_connection: false
protected_core_touched: false
proposal_only: true
is_production_state: false
required_human_approval: true
intake_decision: "human_review_required"
decision_reason: "The request is limited to future runtime design discussion, but required worker separation, test plan, and rollback or disable inputs are incomplete. Human review is required before any later design PR instructions are drafted."
open_questions:
  - "Which human role owns the future design review decision?"
  - "What proposal storage boundary would the future design use without touching production forecast state?"
  - "Which exact disable condition should stop consuming sidecar proposals?"
blockers:
  - "Runtime implementation permission is absent."
  - "Worker runtime, scheduler runtime, API connections, DB changes, external integrations, file-writing automation, and production promotion remain out of scope."
residual_risks:
  - "A reader might confuse a runtime design intake with permission to implement runtime code."
  - "Missing rollback and disable details could make a later design PR too broad unless they are resolved first."
required_human_reviewed_next_action: "human_review_only"

policy_refs:
  - "AGENTS.md"
  - "docs/CONTRACTS_INDEX.md"
  - "docs/CODEX_APP_SERVER.md"
  - "docs/HUMAN_APPROVAL.md"
  - "docs/AGENT_CHARTER_OPERATIONS_RUNBOOK.md"
  - "docs/CODEX_APP_SERVER_RUNTIME_INTAKE.md"
required_design_inputs_before_runtime_pr:
  - "Proposed runtime responsibility boundary."
  - "Worker separation boundary."
  - "Scheduler boundary, or explicit confirmation that no scheduler is included."
  - "Proposal storage boundary that does not write production forecast state."
  - "Human approval state model."
  - "Context pack consumption boundary."
  - "Restricted content handling."
  - "Failure modes."
  - "Disable behavior."
  - "Rollback plan inputs."
  - "Required review roles."
required_test_plan_inputs:
  - "Contract boundary review."
  - "Template field validation review."
  - "Restricted content review."
  - "Protected path review."
  - "Proposal-only and production-state separation review."
  - "Future runtime design review checklist."
  - "Future disable or rollback verification plan."
required_rollback_disable_plan_inputs:
  - "What can be disabled."
  - "Who can decide to disable it."
  - "Which proposal consumption path stops first."
  - "How production forecast behavior remains unchanged."
  - "Which human review signal triggers rollback or disable."
forbidden_operations:
  - "production_write"
  - "api_forecast_update"
  - "api_hormuz_update"
  - "api_hormuz_news_update"
  - "db_write"
  - "db_migration"
  - "direct_deploy"
  - "worker_runtime"
  - "scheduler_runtime"
  - "codex_app_server_runtime"
  - "external_api_integration"
  - "create_github_issue"
  - "create_pr"
  - "merge_pr"
  - "file_writing_automation"
  - "external_publish"
  - "automated_trading"
  - "investment_advice"
  - "navigation_guidance"
  - "military_guidance"
  - "production_promotion"
restricted_content_must_be_absent:
  - "secrets"
  - ".env values"
  - "OAuth tokens"
  - "API keys"
  - "raw local paths"
  - "NAS paths"
  - "private network details"
```

## Safe Use Notes

- This example may be copied as a writing pattern for human review, but not as
  a runtime spec.
- `runtime_scope` values remain `false` because the intake does not introduce
  runtime behavior.
- `required_human_reviewed_next_action: "human_review_only"` means the next
  safe action is human review, not implementation.
- A later runtime design PR, if any, needs its own explicit human approval,
  scope, tests, rollback or disable plan, and protected path review.

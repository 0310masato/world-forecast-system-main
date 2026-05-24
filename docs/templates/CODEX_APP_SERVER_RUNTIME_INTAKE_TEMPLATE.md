# Codex App Server Runtime Intake Template

This template records a proposal-only intake review before any future Codex App
Server runtime design PR instructions are prepared.

It is a human-review artifact only. It does not authorize runtime code, worker
runtime, scheduler runtime, API connections, DB changes, external integrations,
GitHub automation, file-writing automation, AI job execution, merge, deploy, or
production promotion.

## Intake Fields

```yaml
intake_id: "<runtime-intake-id>"
intake_version: 1
created_at: "<YYYY-MM-DD>"
human_owner: "<human owner>"
requested_runtime_goal: "<summary>"
source_materials:
  - "<sanitized reference>"
missing_materials:
  - "<missing item>"
target_environment: "<local | staging | production | unknown>"
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
intake_decision: "<waiting_for_context | human_review_required | blocked_by_scope_risk | ready_for_runtime_design_pr | reject_for_now>"
decision_reason: "<reason>"
open_questions:
  - "<question>"
blockers:
  - "<blocker>"
residual_risks:
  - "<risk>"
required_human_reviewed_next_action: "<human_review_only | revise_intake_only | prepare_runtime_design_pr_instructions_only | archive_only>"
```

## Recommended Additional Fields

```yaml
policy_refs:
  - "AGENTS.md"
  - "docs/CONTRACTS_INDEX.md"
  - "docs/CODEX_APP_SERVER.md"
  - "docs/HUMAN_APPROVAL.md"
  - "docs/AGENT_CHARTER_OPERATIONS_RUNBOOK.md"
required_design_inputs_before_runtime_pr:
  - "<design input>"
required_test_plan_inputs:
  - "<test or review input>"
required_rollback_disable_plan_inputs:
  - "<rollback or disable input>"
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

## Review Notes

- `ready_for_runtime_design_pr` means design PR instructions may be prepared
  for human review. It does not authorize runtime implementation.
- `target_environment: "production"` must not be treated as production
  permission. It should trigger stricter human review and may still result in
  `blocked_by_scope_risk`.
- `runtime_scope` defaults to `false` because this intake template does not
  introduce runtime behavior.
- If any restricted content is present, stop and return to human review.
- If protected core is touched, stop and return to human review.

## Completion Criteria

- The record is proposal-only and human-review-only.
- The record is not production state.
- The record uses sanitized references only.
- Missing materials are explicit.
- The intake decision uses an allowed value.
- The required human-reviewed next action uses an allowed value.
- Forbidden operations are not weakened.
- Runtime implementation, worker execution, scheduler execution, API changes,
  DB changes, dependency changes, CI changes, automation, and production
  promotion remain out of scope.

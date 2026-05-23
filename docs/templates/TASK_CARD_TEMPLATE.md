# TaskCard Template

Use this template for Task Board / Handoff Contract v0 TaskCards. A TaskCard is
proposal-only draft-instructions material. It is not an execution command.

## Contract Fields

```yaml
task_id: "<task-card-id>"
task_version: 1
source_proposal_id: "<implementation-proposal-id>"
source_proposal_version: 1
source_decision_id: "<human-review-decision-id>"
reviewed_result_id: "<ai-analysis-job-result-id>"
job_kind: "<allowed-ai-analysis-job-kind>"
context_pack_id: "<context-pack-id>"
created_at: 0
title: "<short human-readable title>"
status: "new"
priority: "P2"
autonomy_level: "A1_draft_only"
assigned_role: "<role preparing draft instructions>"
human_owner: "<human reviewer or owner>"
objective: "<what this task should prepare for human review>"
context_summary: "<short sanitized summary of the proposal context>"
intended_files:
  - "docs/example.md"
forbidden_files:
  - "app/api/forecast/route.ts"
  - "app/api/hormuz/route.ts"
  - "app/api/hormuz/news/route.ts"
  - "lib/db.ts"
acceptance_criteria:
  - "<reviewable criterion>"
test_plan:
  - "<manual or automated check>"
rollback_plan:
  - "<how to abandon or revert the proposal safely>"
residual_risks:
  - "<known remaining risk>"
required_human_approval: true
allowed_next_step: "human_review_only"
forbidden_next_steps:
  - "production_write"
  - "api_forecast_update"
  - "api_hormuz_update"
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
  - "create_pr"
  - "merge_pr"
proposal_only: true
is_production_state: false
does_not_modify_api: true
does_not_write_db: true
does_not_run_migration: true
does_not_deploy: true
does_not_publish_externally: true
```

## Allowed Values

Allowed `status` values:

- `new`
- `triaged`
- `waiting_for_context`
- `waiting_for_human_approval`
- `ready_for_draft_pr`
- `blocked`
- `needs_revision`
- `archived`

Allowed `priority` values:

- `P0`
- `P1`
- `P2`
- `P3`

Allowed `autonomy_level` values:

- `A0_advice_only`
- `A1_draft_only`
- `A2_prepare_for_approval`

Allowed `allowed_next_step` values:

- `prepare_draft_pr_instructions_only`
- `human_review_only`
- `revise_task_card_only`
- `archive_only`

## Safety Boundary Checklist

- [ ] TaskCard is proposal-only and not production state.
- [ ] TaskCard is not an execution command.
- [ ] Human approval is required.
- [ ] Autonomy is A0, A1, or A2 only.
- [ ] `status` and `allowed_next_step` are consistent.
- [ ] `intended_files` avoids protected API, DB, migration, dependency,
      runtime, scheduler, worker, and external integration paths.
- [ ] `forbidden_files` includes protected production/API/DB paths relevant to
      the scope.
- [ ] `forbidden_next_steps` includes every required forbidden next step.
- [ ] The task does not recommend PR creation, merge, deploy, API update,
      database write, migration, external integration, external publishing,
      automated trading, navigation guidance, military guidance, or production
      promotion.
- [ ] No secrets, `.env` values, raw local paths, NAS paths, private network
      details, or unnecessary private data are present.
- [ ] Acceptance criteria and test plan are reviewable without adding runtime,
      worker, scheduler, API, DB, package, CI, or automation changes.

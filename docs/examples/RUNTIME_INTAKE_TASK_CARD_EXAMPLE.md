# Runtime Intake TaskCard Example v0

## Purpose

This is a safe filled example for turning a Codex App Server Runtime Intake
record into a Task Board TaskCard for human review.

It models the bridge from a sanitized Runtime Intake outcome to later runtime
design PR instruction drafting. It does not authorize runtime implementation,
worker behavior, scheduler behavior, API or DB changes, package changes, CI
changes, GitHub automation, PR creation, merge, deploy, or production
promotion.

## Safety Boundary

The record uses sanitized source labels only. It contains no secrets, `.env`
values, OAuth tokens, API keys, raw local filesystem paths, NAS paths, private
network details, production logs, or real operational data.

`ready_for_runtime_design_pr` in the source intake means only that a later
runtime design PR instruction draft may be prepared for human review. It is not
permission to implement runtime code, create a PR, merge, deploy, or promote any
proposal into production state.

## Example TaskCard Record

```yaml
task_id: "sample-runtime-intake-task-card-001"
task_version: 1
source_runtime_intake_id: "sample-runtime-intake-design-discussion-001"
source_runtime_intake_decision: "ready_for_runtime_design_pr"
source_reference_labels:
  - "sanitized runtime intake record"
  - "sanitized user-provided runtime notes"
  - "sanitized human approval boundary summary"
created_at: "2026-05-25T00:00:00Z"
title: "Review runtime design PR instruction readiness from intake"
status: "waiting_for_human_approval"
priority: "P2"
autonomy_level: "A2_prepare_for_approval"
assigned_role: "future_runtime_designer"
human_owner: "sample-human-owner-001"
objective: "Review whether human-reviewable runtime design PR instructions should be drafted from the sanitized intake record without creating a PR or implementing runtime behavior."
context_summary: "A sanitized Runtime Intake record says enough context exists to consider future design PR instruction drafting. The TaskCard preserves the proposal-only boundary and keeps the next action limited to human review."
intended_files:
  - "docs/examples/sample-runtime-design-pr-instructions.md"
  - "docs/examples/sample-runtime-design-review-checklist.md"
forbidden_files:
  - "app/api/forecast/**"
  - "app/api/hormuz/**"
  - "app/api/hormuz/news/**"
  - "lib/db.ts"
  - "db/**"
  - "migrations/**"
  - "prisma/**"
  - "package.json"
  - "package-lock.json"
  - ".github/workflows/**"
  - "worker runtime paths"
  - "scheduler runtime paths"
  - "Codex App Server runtime paths"
acceptance_criteria:
  - "The draft instructions remain proposal-only, human-review-only, and non-production."
  - "The draft instructions state that ready_for_runtime_design_pr is not runtime implementation permission."
  - "The draft instructions use sanitized source labels only."
  - "The draft instructions do not request runtime code, worker code, scheduler code, API or DB changes, package changes, CI changes, PR creation, merge, deploy, or production promotion."
  - "The draft instructions include test plan, rollback, disable, protected path, and restricted content review requirements for a later human decision."
test_plan:
  - "Review docs/CODEX_APP_SERVER_RUNTIME_INTAKE.md for intake decision meaning and stop conditions."
  - "Review docs/TASK_BOARD_HANDOFF.md for TaskCard autonomy, allowed next step, and forbidden next steps."
  - "Confirm intended_files are docs-only sample references and forbidden_files include protected runtime, API, DB, package, and CI surfaces."
  - "Confirm no secrets, `.env` values, OAuth tokens, API keys, raw local paths, NAS paths, private network details, production logs, or real operational data are present."
rollback_plan:
  - "If the TaskCard is rejected, revise the TaskCard or archive it through human_review_only without creating a PR, changing files, or implementing runtime behavior."
residual_risks:
  - "A reader could mistake ready_for_runtime_design_pr as permission to implement runtime code unless the human approval line remains explicit."
  - "A later instruction draft could become too broad if worker, scheduler, API, DB, package, CI, rollback, or disable boundaries are not reviewed first."
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
does_not_change_packages: true
does_not_change_ci: true
ready_for_runtime_design_pr_is_not_runtime_permission: true
```

## Safe Use Notes

- Use this as a TaskCard writing sample, not as a real task queue item or
  execution instruction.
- `allowed_next_step: "human_review_only"` means a human reviewer decides
  whether a later runtime design PR instruction draft should be prepared. It
  does not permit `create_pr`, `merge_pr`, deploy, API update, DB write, DB
  migration, runtime addition, worker execution, scheduler execution, package
  changes, CI changes, external integration, publishing, automation, or
  production promotion.
- A real TaskCard must use sanitized references and omit secrets, `.env`
  values, OAuth tokens, API keys, raw local paths, NAS paths, private network
  details, production logs, and real operational data.
- Any later runtime design PR still needs explicit human approval, dedicated
  scope, review roles, test plan, rollback or disable plan, and protected path
  review.

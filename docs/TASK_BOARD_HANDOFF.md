# Task Board / Handoff Contract v0

## Purpose

Task Board / Handoff Contract v0 turns proposal-only planning into durable,
reviewable coordination records. It exists after Implementation Proposal
Contract v0 and before any dedicated implementation work.

This contract does not add runtime code, worker code, scheduler code, Codex App
Server runtime code, external API connections, database migrations, API
updates, GitHub automation, file-writing automation, production writes, merge
automation, or deploy automation.

## TaskCard

A TaskCard is a management unit for future draft PR instructions. It records the
approved planning context, intended review scope, role ownership, acceptance
criteria, test plan, rollback plan, risks, and the next review-only action.

A TaskCard is not an execution command. It must not be used to create a PR,
merge a PR, deploy, update an API, write a database record, run a migration,
connect an external API, schedule a job, execute a worker, publish externally,
or promote proposal state into production state.

TaskCards must keep these contract boundary fields explicit:

- `required_human_approval: true`
- `proposal_only: true`
- `is_production_state: false`
- `does_not_modify_api: true`
- `does_not_write_db: true`
- `does_not_run_migration: true`
- `does_not_deploy: true`
- `does_not_publish_externally: true`

## TaskHandoff

A TaskHandoff is an asynchronous artifact for transferring context between
roles. It records what has been done, key findings, decisions, open questions,
blockers, required next action, inputs, outputs, confidence, completeness,
risks, and references.

A handoff is not a conversation log or transcript. It should preserve only the
durable operational facts needed for future review, using sanitized references
instead of raw local paths, secrets, `.env` contents, NAS paths, or private
network details.

TaskHandoffs must keep these contract boundary fields explicit:

- `human_approval_required: true`
- `allowed_next_step` limited to the allowed next steps below
- `forbidden_next_steps` including every required forbidden next step below

## TaskCard vs Handoff

TaskCard answers: what reviewable task exists, why it exists, who owns review,
which files are in scope, which files are out of scope, and what would make the
draft instructions acceptable.

TaskHandoff answers: what context must survive across asynchronous work, what
has already been found or decided, what is still blocked or open, and what a
human-reviewed next action should be.

Neither record executes work. Both records preserve proposal-only,
human-approval-only boundaries.

## Allowed Statuses

TaskCard `status` and TaskHandoff `current_status` may be:

- `new`
- `triaged`
- `waiting_for_context`
- `waiting_for_human_approval`
- `ready_for_draft_pr`
- `blocked`
- `needs_revision`
- `archived`

## Forbidden Statuses

These statuses are not allowed because they imply execution, completion, or
production application:

- `in_progress`
- `done`
- `failed`
- `deployed`
- `merged`
- `applied`
- `production_released`

## Allowed Autonomy Levels

TaskCard `autonomy_level` must be limited to:

- `A0_advice_only`
- `A1_draft_only`
- `A2_prepare_for_approval`

## Forbidden Autonomy Levels

These autonomy levels are forbidden for Task Board / Handoff Contract v0:

- `A3_execute_reversible_low_risk_tasks`
- `A4_execute_with_external_effects`
- `A5_fully_autonomous`

## Allowed Next Steps

`allowed_next_step` may be only:

- `prepare_draft_pr_instructions_only`
- `human_review_only`
- `revise_task_card_only`
- `archive_only`

Status and next step must remain consistent:

- `new`: `human_review_only` or `revise_task_card_only`
- `triaged`: `human_review_only` or `prepare_draft_pr_instructions_only`
- `waiting_for_context`: `human_review_only`
- `waiting_for_human_approval`: `human_review_only`
- `ready_for_draft_pr`: `prepare_draft_pr_instructions_only`
- `blocked`: `human_review_only`
- `needs_revision`: `revise_task_card_only`
- `archived`: `archive_only`

## Forbidden Next Steps

Every TaskCard and TaskHandoff must forbid:

- `production_write`
- `api_forecast_update`
- `api_hormuz_update`
- `external_publish`
- `automated_trading`
- `navigation_guidance`
- `military_guidance`
- `db_migration`
- `direct_deploy`
- `worker_runtime`
- `codex_app_server_runtime`
- `scheduler_runtime`
- `external_api_integration`
- `create_pr`
- `merge_pr`

`allowed_next_step` must never be one of:

- `create_pr`
- `merge_pr`
- `deploy`
- `update_api`
- `run_migration`
- `write_db`
- `publish_external`
- `execute_worker`
- `schedule_job`

## Protected Intended Files

TaskCard `intended_files` must not include protected production, runtime, or
dependency surfaces. Protected paths include:

- `app/api/forecast/**`
- `pages/api/forecast/**`
- `app/api/hormuz/**`
- `pages/api/hormuz/**`
- `lib/db.ts`
- `db/**`
- `migrations/**`
- `prisma/**`
- `package-lock.json`
- `pnpm-lock.yaml`
- `yarn.lock`
- worker runtime paths
- scheduler runtime paths
- Codex App Server runtime paths
- external API integration runtime paths

For documentation-only Task Board work, keep `intended_files` limited to docs,
templates, and explicitly approved policy files.

## Human Approval Line

Human approval is mandatory:

- TaskCard uses `required_human_approval: true`
- TaskHandoff uses `human_approval_required: true`

Human approval means review permission only. It does not mean automatic
execution, PR creation, merge, deploy, API update, database write, migration,
external integration, publishing, or production promotion.

If execution is needed later, it must be requested through explicit human
approval and a dedicated implementation PR with its own scope and checks.

## CodexApp Operating Rules

When CodexApp or another AI worker handles TaskCards or Handoffs:

- Start from a clean branch and clean worktree.
- Do not touch uncommitted changes from the original checkout.
- Treat TaskCards as draft-instructions material, not commands.
- Treat Handoffs as durable artifacts, not chat logs.
- Keep autonomy at A0, A1, or A2.
- Do not create PRs from a TaskCard record.
- Do not merge, deploy, update APIs, run migrations, add runtime behavior, add
  schedulers, add worker behavior, connect external APIs, publish externally,
  or write production state.
- Do not serialize secrets, `.env` values, raw local paths, NAS paths, or
  unnecessary private data.
- If a protected or high-risk change is required, stop and route it to human
  approval plus a dedicated implementation PR.

For the broader CodexApp operating charter, Japanese instruction requirements,
start gates, stop conditions, and review completion checks, see
`docs/AGENT_CHARTER_OPERATIONS_RUNBOOK.md`. Use
`docs/templates/CODEXAPP_OPERATION_REQUEST_TEMPLATE.md` when preparing a
Japanese proposal-only CodexApp request.

For higher-level human-review routine reporting across TaskCards, Handoffs, QA
reports, blockers, and silent-failure checks, see `docs/OPERATIONS_ROUTINES.md`
and the routine templates in `docs/templates/`. These routine templates do not
change TaskCard or Handoff status automatically and do not authorize execution.

## Human Review Checklist

Before accepting a TaskCard or Handoff for later review, check:

- The record matches Task Board / Handoff Contract v0 fields.
- `proposal_only` is true for TaskCards.
- `is_production_state` is false for TaskCards.
- Human approval is required.
- Status and `allowed_next_step` are consistent.
- Autonomy is limited to A0, A1, or A2.
- All required forbidden next steps are listed.
- `intended_files` avoids protected API, DB, migration, runtime, dependency,
  scheduler, worker, and external integration paths.
- Restricted content is absent.
- The record does not recommend PR creation, merge, deploy, API update,
  database write, migration, external API integration, publishing, automated
  trading, navigation guidance, military guidance, or production promotion.
- Handoff content is concise, asynchronous, and artifact-like rather than a
  transcript.
- Residual risks and open questions are clear enough for the next reviewer.

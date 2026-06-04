# Codex App Server Runtime Local MVP Review Chain v0

## Purpose

This runbook explains how to run and review the local MVP review chain added by
PR #54.

The review chain is a one-command local verification helper for the existing
stdout-only Codex App Server runtime review commands. It aggregates their JSON
outputs into one boundary summary so a human reviewer, Web GPT, GitHub reviewer,
or future AI session can confirm the local MVP remains review-only.

This runbook is not a new contract layer and is not execution permission. It
does not authorize persistence, Task Board writes, HANDOFF file creation,
write-capable executor behavior, API changes, DB writes, runtime enablement,
worker or scheduler work, GitHub automation, deployment, release, external
publishing, or production promotion.

## When To Use

Use this runbook when reviewing the local-confirmable MVP chain after changes to
the Codex App Server runtime review helpers or related docs.

Use it as review evidence only. If a future task needs durable Task Board or
HANDOFF persistence, stop and review
`docs/tool-contracts/TASK_BOARD_HANDOFF_WRITE_TOOL_CONTRACT.md` first.

## Command

Run from the repository root:

```bash
node scripts/codex-app-server-runtime-local-mvp-review-chain.mjs
```

If dependencies are missing in the local checkout, install them first:

```bash
npm ci
```

Do not add a `package.json` script for this helper unless a later dedicated PR
explicitly approves package-file changes.

## Expected Pass Markers

The command exits successfully only when every included stdout-only command
passes its boundary checks.

The top-level JSON should include:

- `chain_status: "passed"`
- `stdout_only: true`
- `wrote_anything: false`
- `required_next_action: "human_review_only"`
- `allowed_next_step: "human_review_only"`
- `proposal_only: true`
- `is_production_state: false`
- `protected_core_connected: false`
- `api_connection_enabled: false`
- `db_connection_enabled: false`
- `worker_runtime_enabled: false`
- `scheduler_runtime_enabled: false`
- `external_api_integration_enabled: false`
- `package_change_allowed: false`
- `ci_change_allowed: false`
- `github_automation_enabled: false`
- `file_writing_automation_enabled: false`
- `production_promotion_allowed: false`

Every entry in `commands` should have:

- `status: "passed"`
- `exit_code: 0`

## Covered Command IDs

The chain currently checks these stdout-only review artifacts:

- `inspection_report`
- `operator_summary`
- `taskcard_draft`
- `taskcard_qa_draft`
- `handoff_draft`
- `review_packet`
- `write_dry_run`
- `write_approval_request`
- `write_approval_decision_validator`
- `write_plan`
- `write_apply_preflight`
- `write_executor_contract`

## What A Pass Means

A passing result means the existing local stdout-only review commands currently
agree on the intended safety boundary:

- proposal-only
- non-production
- human-review-only
- no protected forecast core connection
- no API or DB connection
- no worker or scheduler runtime
- no external integration
- no package or CI permission
- no GitHub automation
- no file-writing automation
- no write or apply executor implementation
- no production promotion

## What A Pass Does Not Mean

A passing result does not mean:

- Task Board or HANDOFF persistence is approved.
- A write-capable executor exists.
- A write-capable executor is approved.
- API, DB, runtime, worker, scheduler, package, or CI work is approved.
- GitHub Issue or PR automation is approved.
- Deploy, release, external publishing, or production promotion is approved.
- AI output may be used as production forecast, operational, investment,
  navigation, military, or trading guidance.

## Failure Review

If the command fails, review the failed `commands` entries first. A failure can
come from:

- a subcommand exiting nonzero
- stderr output from a subcommand
- non-JSON stdout
- a missing required boundary marker
- an unexpected status value
- restricted content appearing in output

Do not patch around a failing boundary check by weakening expected safety
markers. Treat boundary drift as a review finding and keep the next action at
human review.

## GPT / Human Review Checklist

- [ ] The command is run from the repository root.
- [ ] The command exits successfully.
- [ ] `chain_status` is `passed`.
- [ ] Every command entry has `status: "passed"`.
- [ ] `stdout_only` is `true`.
- [ ] `wrote_anything` is `false`.
- [ ] `required_next_action` and `allowed_next_step` stay
      `human_review_only`.
- [ ] `proposal_only` is `true`.
- [ ] `is_production_state` is `false`.
- [ ] Protected forecast core, API, DB, worker, scheduler, external
      integration, package, CI, automation, and production promotion markers
      remain disabled or forbidden.
- [ ] No secrets, `.env` values, raw local paths, NAS paths, private network
      details, production logs, or real operational data appear in the output.
- [ ] The result is treated as review evidence only, not approval to write,
      apply, merge, deploy, release, publish, or promote anything.

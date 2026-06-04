# Codex App Server Runtime Local MVP Review Bundle v0

## Purpose

This runbook explains the local MVP review bundle command:

```bash
node scripts/codex-app-server-runtime-local-mvp-review-bundle.mjs
```

The command runs the local MVP review chain from PR #54 and emits a single JSON
review bundle for GPT, human reviewers, GitHub reviewers, or a future AI
session.

The bundle is review evidence only. It is not a new contract layer and is not
execution permission.

## What The Bundle Adds

The local MVP review chain answers whether the existing stdout-only commands
still pass their boundary checks. The local MVP review bundle adds reviewer
context around that result:

- the source chain command and pass/fail summary
- the local MVP milestones to review
- source documents to read
- safety boundary summary
- GPT / human review focus
- accept and reject conditions
- safe next options after review
- explicit non-goals

This keeps the next reviewer from reconstructing the review packet by hand
while keeping the system stdout-only and human-review-only.

## Required Pass Markers

The top-level JSON should include:

- `bundle_status: "ready_for_gpt_or_human_review"`
- `stdout_only: true`
- `wrote_anything: false`
- `required_next_action: "human_review_only"`
- `allowed_next_step: "human_review_only"`
- `proposal_only: true`
- `is_production_state: false`
- `source_chain.chain_status: "passed"`
- `source_chain.command_summary.failed_count: 0`

The safety boundary summary should keep these disabled:

- `protected_core_connected`
- `api_connection_enabled`
- `db_connection_enabled`
- `worker_runtime_enabled`
- `scheduler_runtime_enabled`
- `external_api_integration_enabled`
- `package_change_allowed`
- `ci_change_allowed`
- `github_automation_enabled`
- `file_writing_automation_enabled`
- `task_board_write_enabled`
- `handoff_file_creation_enabled`
- `write_executor_present`
- `apply_executor_present`
- `production_promotion_allowed`

## What A Passing Bundle Means

A passing bundle means:

- the source local MVP review chain passed
- the reviewed commands remain stdout-only
- no write was reported
- the next action remains human review
- reviewers have a single JSON object with review focus and acceptance criteria

## What A Passing Bundle Does Not Mean

A passing bundle does not approve:

- Task Board persistence
- HANDOFF file creation
- write executor implementation
- apply executor implementation
- API, DB, worker, scheduler, package, or CI changes
- GitHub automation
- file-writing automation
- deployment, release, external publishing, or production promotion

Any future write-capable behavior still needs separate explicit human-approved
scope, a dedicated PR, tests, and rollback or disable criteria.

## GPT / Human Review Checklist

- [ ] The bundle command exits successfully.
- [ ] `bundle_status` is `ready_for_gpt_or_human_review`.
- [ ] `source_chain.chain_status` is `passed`.
- [ ] `source_chain.command_summary.failed_count` is `0`.
- [ ] `stdout_only` is `true`.
- [ ] `wrote_anything` is `false`.
- [ ] `required_next_action` and `allowed_next_step` stay
      `human_review_only`.
- [ ] The safety boundary summary keeps protected core, API, DB, worker,
      scheduler, external integration, package, CI, automation, Task Board
      write, HANDOFF creation, write/apply executor, and production promotion
      disabled.
- [ ] The bundle is treated as review evidence only, not approval to write,
      apply, merge, deploy, release, publish, or promote.

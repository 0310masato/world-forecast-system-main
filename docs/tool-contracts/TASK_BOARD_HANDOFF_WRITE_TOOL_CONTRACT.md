# Task Board / HANDOFF Write Tool Contract v0

This document defines a future contract boundary for Task Board / HANDOFF write
operations. It is documentation only.

This Tool Contract is not implementation permission. It is not a request to add
writing. It does not permit GitHub issue creation, PR creation, merges, API
updates, DB writes, worker runtime, scheduler runtime, package or CI changes,
automation, AI job execution, production promotion, or external publishing.

## 1. Purpose

Task Board / HANDOFF Write Tool Contract v0 defines the minimum safety
boundary for any future tool that might persist stdout-only review packet
artifacts into repository-relative files or an approved Task Board / HANDOFF
store.

The contract exists to keep future persistence separate from the current
stdout-only review chain. It describes approval, validation, schema, audit,
rollback, disable, and review requirements before a later implementation PR may
even propose write-capable behavior.

## 2. Current State

- PR #36 added disabled-by-default MVP scaffold.
- PR #37 added stdout-only inspection report.
- PR #38 added stdout-only operator summary.
- PR #39 added stdout-only TaskCard draft.
- PR #40 added stdout-only TaskCard QA draft.
- PR #41 added stdout-only HANDOFF draft.
- PR #42 added stdout-only review packet.
- PR #44 added stdout-only write dry-run validation.
- PR #45 added stdout-only approval request draft generation from dry-run
  results.
- PR #46 added stdout-only approval decision validation for human-supplied
  decision records.
- PR #47 added stdout-only metadata-only write plan draft generation from
  approval decision validation results.
- PR #48 added stdout-only metadata-only write apply preflight generation from
  write plan drafts.

No persistent write path exists yet.
No Task Board write exists yet.
No HANDOFF file creation exists yet.
No approval has been granted by the approval request draft.
No approval has been granted by the approval decision validator itself.
No approval has been granted by the write plan draft.
No approval has been granted by the apply preflight result.
No write executor exists yet.
No apply executor exists yet.
No API route exists yet.
No DB integration exists yet.
No worker runtime exists yet.
No scheduler runtime exists yet.
No package / CI change was introduced for this chain.

## 3. Proposed Future Tool Boundary

The proposed future tool name is:

```text
Task Board / HANDOFF Write Tool
```

A later, separately approved implementation may define a tool that can:

- persist a validated review packet to a repository-relative artifact path
- create or update a TaskCard record in an approved Task Board store
- create or update a HANDOFF record in an approved Handoff store
- record audit metadata

The PR #43 contract only defines the boundary. PR #47 adds only a stdout-only,
metadata-only write plan draft for later separate implementation review. PR #48
adds only a stdout-only, metadata-only apply preflight result for later separate
executor implementation review. None of these PRs adds the future write tool,
adds an apply executor, or writes any artifact.

## 4. Allowed Future Operations

Every allowed future operation is conditional on a separate implementation PR
and explicit human approval. A future tool may be considered only for these
operations:

- validate a review packet produced by `--packet`
- persist a sanitized review packet to an approved local/repository-relative
  path
- persist a sanitized TaskCard draft to an approved Task Board target
- persist a sanitized QA draft to an approved QA report target
- persist a sanitized HANDOFF draft to an approved HANDOFF target
- produce an audit log entry
- return a write result summary

Every allowed operation requires all of the following:

- human approval
- validated input
- sanitized content
- repository-relative destination only
- idempotency key
- audit record
- rollback / delete or ignore plan

## 5. Forbidden Operations

The future tool must forbid:

- `production_write`
- `production_promotion`
- `api_forecast_update`
- `api_hormuz_update`
- `api_hormuz_news_update`
- `api_route_creation`
- `db_read`
- `db_write`
- `db_migration`
- `worker_runtime`
- `scheduler_runtime`
- `external_api_integration`
- `package_change`
- `ci_change`
- `github_automation`
- `create_github_issue`
- `create_pr`
- `merge_pr`
- `direct_deploy`
- `file_writing_automation_without_approval`
- `handoff_file_creation_without_approval`
- `task_board_write_without_approval`
- `ai_job_execution`
- `external_publish`
- `automated_trading`
- `investment_advice`
- `navigation_guidance`
- `military_guidance`

The future tool must not write outside approved repository-relative artifact
paths.

The future tool must forbid these target path forms unless a later separate PR
explicitly defines a safe adapter and approval process:

- raw local paths
- NAS paths
- private network paths
- absolute paths
- home directory paths
- temp directory paths
- unc paths

## 6. Required Human Approval

The contract requires:

```yaml
required_human_approval: true
minimum_autonomy_level_before_approval: A1_draft_only
maximum_autonomy_level_in_this_contract: A2_prepare_for_approval
```

This means:

- the current chain can draft and validate artifacts
- a future implementation may prepare a write for approval
- actual write still requires explicit human approval unless a later contract
  expands scope

This contract does not authorize `A3_execute_reversible_low_risk_tasks`,
`A4_execute_with_external_effects`, or `A5_fully_autonomous`.

## 7. Required Inputs

Future write tool inputs must include:

- `request_id`
- `source_packet`
- `source_packet_sha256`
- `source_command`
- `human_owner`
- `approval_record`
- `approval_timestamp`
- `target_kind`
- `target_path_or_target_id`
- `idempotency_key`
- `dry_run`
- `write_mode`

Allowed `target_kind` values:

- `repository_artifact`
- `task_board_record`
- `handoff_record`
- `qa_report_record`

Allowed `write_mode` values:

- `dry_run_only`
- `prepare_for_approval_only`
- `write_after_human_approval`

The default for this contract must be:

```text
dry_run_only
```

## 8. Input Schema

```json
{
  "request_id": "string",
  "source_packet": {},
  "source_packet_sha256": "string",
  "source_command": "node scripts/codex-app-server-runtime-report.mjs --packet",
  "human_owner": "string",
  "approval_record": {
    "approved": false,
    "approved_by": null,
    "approved_at": null,
    "approval_scope": "none"
  },
  "approval_timestamp": null,
  "target_kind": "repository_artifact | task_board_record | handoff_record | qa_report_record",
  "target_path_or_target_id": "string",
  "idempotency_key": "string",
  "dry_run": true,
  "write_mode": "dry_run_only | prepare_for_approval_only | write_after_human_approval"
}
```

## 9. Output Schema

```json
{
  "request_id": "string",
  "status": "dry_run_passed | prepared_for_approval | written | blocked | failed",
  "wrote_anything": false,
  "target_kind": "string",
  "target_path_or_target_id": "string",
  "audit_log_entry": {},
  "validation": {
    "passed": true,
    "issues": []
  },
  "required_next_action": "human_review_only",
  "rollback_plan": [],
  "references": []
}
```

For the current stdout-only chain, `wrote_anything` remains conceptual because
no write tool is implemented.

PR #47 adds a separate stdout-only write plan draft shape for future
implementation review. It is metadata-only and does not authorize or execute
writes:

```json
{
  "write_plan_id": "string",
  "write_plan_version": 1,
  "generated_at": "string",
  "source_approval_request_id": "string",
  "source_approval_decision_validation_id": "string",
  "source_approval_decision_validation_status": "needs_human_decision | blocked | decision_validated",
  "source_decision": "not_decided | approved | rejected | needs_revision",
  "source_decision_accepted": false,
  "source_approval_valid_for_future_write": false,
  "plan_status": "needs_human_decision | blocked | write_plan_ready_for_separate_implementation",
  "target_kind": "string",
  "target_path_or_target_id": "string",
  "proposed_write_mode": "write_after_human_approval_separate_scope",
  "write_authorized_by_this_pr": false,
  "wrote_anything": false,
  "write_executor_present": false,
  "executed_write_count": 0,
  "required_human_approval": true,
  "required_next_action": "human_decision_required | revise_or_reject_request | resolve_blockers_then_restart_approval | separate_write_implementation_required",
  "allowed_next_step": "human_review_only | revise_or_reject_request | separate_write_implementation_required",
  "validation_summary": {},
  "proposed_write_artifacts": [],
  "audit_preview": {},
  "rollback_plan": [],
  "forbidden_operations": [],
  "references": [],
  "safety_summary": []
}
```

`proposed_write_artifacts` is metadata only. It may include artifact kind,
repository-relative target path, intended operation, source packet hash or
source reference, preview summary, and validation notes. It must not include
full future file contents, restricted content, raw local paths, NAS paths,
private network details, secrets, tokens, passwords, API keys, `.env` values,
production logs, or real operational data.

The default PR #47 script must not supply a real human decision record and must
therefore output `needs_human_decision` or `blocked`, not
`write_plan_ready_for_separate_implementation`. Synthetic approved fixtures may
produce `write_plan_ready_for_separate_implementation`, but they still must keep
`write_authorized_by_this_pr: false`, `wrote_anything: false`,
`write_executor_present: false`, and `executed_write_count: 0`; the allowed next
step is separate implementation, not actual write.

PR #48 adds a separate stdout-only apply preflight result shape for future
executor implementation review. It is metadata-only and does not authorize or
execute writes:

```json
{
  "apply_preflight_id": "string",
  "apply_preflight_version": 1,
  "generated_at": "string",
  "source_write_plan_id": "string",
  "source_write_plan_version": 1,
  "source_write_plan_status": "needs_human_decision | blocked | write_plan_ready_for_separate_implementation",
  "source_approval_request_id": "string",
  "source_approval_decision_validation_id": "string",
  "source_decision": "not_decided | approved | rejected | needs_revision",
  "source_decision_accepted": false,
  "source_approval_valid_for_future_write": false,
  "preflight_status": "needs_human_decision | blocked | apply_preflight_ready_for_separate_executor_implementation",
  "target_kind": "string",
  "target_path_or_target_id": "string",
  "proposed_apply_mode": "apply_after_separate_executor_implementation_and_explicit_human_approval",
  "write_authorized_by_this_pr": false,
  "apply_authorized_by_this_pr": false,
  "wrote_anything": false,
  "write_executor_present": false,
  "apply_executor_present": false,
  "executed_write_count": 0,
  "required_human_approval": true,
  "required_next_action": "human_review_only | human_decision_required | revise_or_reject_request | resolve_blockers_then_restart_approval | separate_write_executor_implementation_required",
  "allowed_next_step": "human_review_only | revise_or_reject_request | separate_write_executor_implementation_required",
  "validation_summary": {},
  "proposed_apply_artifacts": [],
  "audit_preview": {},
  "rollback_plan": [],
  "forbidden_operations": [],
  "references": [],
  "safety_summary": []
}
```

`proposed_apply_artifacts` is metadata only. It may include artifact kind,
repository-relative target path, source write plan id, intended operation,
preview summary, and validation notes. It must not include full future file
contents, restricted content, raw local paths, NAS paths, private network
details, secrets, tokens, passwords, API keys, `.env` values, production logs,
or real operational data.

The default PR #48 script must build the default dry-run, approval request,
approval decision validation without a real human decision record, write plan,
and apply preflight chain. It must output `needs_human_decision` or `blocked`,
not `apply_preflight_ready_for_separate_executor_implementation`. Synthetic
approved fixtures may produce
`apply_preflight_ready_for_separate_executor_implementation`, but they still
must keep `write_authorized_by_this_pr: false`,
`apply_authorized_by_this_pr: false`, `wrote_anything: false`,
`write_executor_present: false`, `apply_executor_present: false`, and
`executed_write_count: 0`; the allowed next step is separate executor
implementation, not actual write.

## 10. Validation Rules

A future tool must validate:

- source packet schema
- `packet.required_next_action === "human_review_only"`
- `packet.allowed_next_step === "human_review_only"`
- `packet.proposal_only === true`
- `packet.is_production_state === false`
- `packet.stdout_only === true`
- all nested artifacts present: `report`, `summary`, `taskcard`,
  `taskcard_qa`, `handoff`
- restricted content absent
- target path is approved and repository-relative
- idempotency key present
- approval record present for `write_after_human_approval`

If any validation fails, the future tool must block.

## 11. Audit Log Requirements

Future audit log entries must include:

- `audit_id`
- `request_id`
- `actor`
- `human_owner`
- `timestamp`
- `source_packet_sha256`
- `source_command`
- `target_kind`
- `target_path_or_target_id`
- `dry_run`
- `write_mode`
- `approval_record`
- `validation_result`
- `wrote_anything`
- `rollback_plan`

Audit logs must not include secrets, raw local paths, NAS paths, private network
details, production logs, real operational data, or unnecessary private data.

## 12. Rollback / Disable Plan

- Default behavior is no write.
- `dry_run_only` must be safe and reversible because it writes nothing.
- Future `write_after_human_approval` must define how to delete, revert,
  archive, or ignore written artifacts.
- Writes must be idempotent using `idempotency_key`.
- Duplicate writes must be rejected or treated as no-op.
- Disabling the tool must leave the stdout-only packet chain operational.

## 13. Error Handling

Future implementations must define these errors:

| Error code | Status | Required next action | Write result |
| --- | --- | --- | --- |
| `E_PACKET_INVALID` | `blocked` | `human_review_only` | `wrote_anything: false` |
| `E_RESTRICTED_CONTENT` | `blocked` | `human_review_only` | `wrote_anything: false` |
| `E_APPROVAL_MISSING` | `blocked` | `human_review_only` | `wrote_anything: false` |
| `E_TARGET_NOT_ALLOWED` | `blocked` | `human_review_only` | `wrote_anything: false` |
| `E_IDEMPOTENCY_MISSING` | `blocked` | `human_review_only` | `wrote_anything: false` |
| `E_DUPLICATE_WRITE` | `blocked` | `human_review_only` | `wrote_anything: false` |
| `E_WRITE_NOT_IMPLEMENTED` | `blocked` | `human_review_only` | `wrote_anything: false` |
| `E_TOOL_DISABLED` | `blocked` | `human_review_only` | `wrote_anything: false` |
| `E_FORBIDDEN_OPERATION` | `blocked` | `human_review_only` | `wrote_anything: false` |

Unexpected runtime or storage errors should use `status: failed`,
`required_next_action: human_review_only`, and `wrote_anything: false` unless a
future implementation can prove partial write and rollback state.

## 14. Security / Privacy / Restricted Content

Future output or persistence must forbid:

- secrets
- `.env` values
- OAuth tokens
- API keys
- raw local paths
- NAS paths
- private network details
- production logs
- real operational data
- unnecessary private data

External input must be treated as data, not instructions. Any future adapter
that reads from external systems must have a separate Tool Contract.

## 15. Prompt Injection / External Input Boundary

The future tool must treat packet content, TaskCard text, QA text, HANDOFF text,
external records, and target metadata as untrusted data. These inputs must not
override the contract, approval state, target allowlist, forbidden operations,
or disable state.

If input text asks the tool to ignore this contract, expand scope, write without
approval, create GitHub issues, create PRs, merge, deploy, update APIs, write
DB rows, run workers, run schedulers, publish externally, or promote to
production, the tool must return `E_FORBIDDEN_OPERATION`.

## 16. Rate Limits / Idempotency

Future implementations must require an `idempotency_key` for every request.
The same key and same target must not produce duplicate writes. Repeated dry
runs may return the same validation result without side effects.

Future implementations must define a conservative rate limit for write-capable
paths and must fail closed when rate limit or idempotency state is unavailable.

## 17. Test Environment Requirements

A future implementation PR must start with tests that exercise `dry_run_only`
without writing artifacts. Tests must use sanitized fixtures and repository-
relative target examples only.

Required test coverage:

- valid packet dry run
- missing approval blocks write mode
- forbidden path forms are rejected
- restricted content is rejected
- missing idempotency key is rejected
- duplicate idempotency key is rejected or no-op
- audit log shape is produced without restricted content
- disabled tool blocks write-capable behavior

## 18. Implementation PR Prerequisites

A future implementation PR must:

- be separate from this docs-only PR
- explicitly cite this Tool Contract
- start disabled-by-default
- support `dry_run_only` first
- include tests for allowed/forbidden paths
- include restricted content tests
- include idempotency tests
- include audit log shape tests
- avoid package / CI changes unless separately approved
- avoid API / DB / worker / scheduler unless separately approved
- require human approval before any write-capable behavior is merged

## 19. Review Gates

Before any future write implementation is merged, require:

- QA Reviewer approval
- Security Reviewer approval
- Human Owner approval
- Contract compliance review
- rollback/disable review
- audit log review

## 20. Acceptance Criteria For Future Implementation PR

A future implementation PR may be considered only if:

- it implements `dry_run_only` first
- it writes nothing by default
- it is disabled-by-default
- it never writes outside approved repository-relative targets
- it blocks restricted content
- it blocks missing approval
- it keeps `required_next_action` as `human_review_only` for unapproved writes
- it preserves the stdout-only packet chain
- it passes all tests
- it has no forbidden surface changes unless separately scoped and approved

## 21. Explicit Non-Goals

This contract does not add, authorize, or request:

- Task Board write
- HANDOFF file creation
- file-writing automation
- GitHub Issue automation
- GitHub PR automation
- API route creation
- DB read/write
- DB migration
- worker runtime
- scheduler runtime
- external API integration
- package change
- CI change
- AI job execution
- production promotion
- external publish
- automated trading
- investment advice
- navigation guidance
- military guidance

## 22. References

- `AGENTS.md`
- `docs/CONTRACTS_INDEX.md`
- `docs/CODEX_APP_SERVER.md`
- `docs/CODEX_APP_SERVER_RUNTIME_MVP_SCOPE.md`
- `docs/TASK_BOARD_HANDOFF.md`
- `docs/HUMAN_APPROVAL.md`
- `docs/AGENT_CHARTER_OPERATIONS_RUNBOOK.md`
- `lib/task-board/types.ts`
- `lib/task-board/handoff.ts`
- `lib/codex-app-server-runtime/report.ts`
- `lib/codex-app-server-runtime/write-dry-run.ts`
- `lib/codex-app-server-runtime/write-approval-request.ts`
- `lib/codex-app-server-runtime/write-approval-decision.ts`
- `scripts/codex-app-server-runtime-report.mjs`
- `scripts/codex-app-server-runtime-write-dry-run.mjs`
- `scripts/codex-app-server-runtime-write-approval-request.mjs`
- `scripts/codex-app-server-runtime-write-approval-decision-validator.mjs`
- `lib/codex-app-server-runtime/write-plan.ts`
- `scripts/codex-app-server-runtime-write-plan.mjs`
- `lib/codex-app-server-runtime/write-apply-preflight.ts`
- `scripts/codex-app-server-runtime-write-apply-preflight.mjs`
- `scripts/codex-app-server-runtime-smoke.mjs`

# TaskCard Example

This is a safe filled example for
`docs/templates/TASK_CARD_TEMPLATE.md`.

It is not a real operations log, not proof that the sampled TaskCard exists,
and not permission to execute work. This TaskCard is draft PR instructions
preparation material only. It contains no secrets, raw local paths, NAS paths,
private network details, production logs, runtime instructions, API changes,
DB changes, migrations, scheduler work, worker runtime, Codex App Server
runtime, external API integration, GitHub automation, PR creation, merge,
deploy, external publishing, or file-writing automation.

## Example TaskCard Record

```yaml
task_id: "sample-task-card-draft-instructions-001"
task_version: 1
source_proposal_id: "sample-implementation-proposal-docs-only-001"
source_proposal_version: 1
source_decision_id: "sample-human-review-decision-docs-only-001"
reviewed_result_id: "sample-ai-analysis-result-docs-only-001"
job_kind: "docs_review_support"
context_pack_id: "sample-context-pack-docs-only-001"
created_at: "2026-05-24T00:00:00Z"
title: "Prepare sanitized draft PR instructions for a docs-only example"
status: "ready_for_draft_pr"
priority: "P2"
autonomy_level: "A2_prepare_for_approval"
assigned_role: "codexapp_worker"
human_owner: "human-owner"
objective: "Prepare human-reviewable draft PR instructions for a docs-only example record without executing the change."
context_summary: "A sanitized proposal asks for draft instructions that would clarify example-writing guidance for docs-only records. The TaskCard is review material, not an execution command."
intended_files:
  - "docs/examples/sample-draft-instructions.md"
  - "docs/templates/sample-draft-instructions-note.md"
forbidden_files:
  - "app/api/forecast/route.ts"
  - "app/api/hormuz/route.ts"
  - "app/api/hormuz/news/route.ts"
  - "lib/db.ts"
  - "package-lock.json"
acceptance_criteria:
  - "The draft instructions stay limited to sanitized docs-only examples."
  - "The instructions state that TaskCards are preparation material for human review, not execution commands."
  - "The instructions preserve proposal_only, required_human_approval, and is_production_state: false."
  - "The instructions do not authorize PR creation, merge, deploy, API update, DB migration, runtime addition, external integration, publishing, or automation."
test_plan:
  - "Review the draft against docs/TASK_BOARD_HANDOFF.md for status and allowed_next_step consistency."
  - "Confirm intended_files are docs-only sample paths and forbidden_files include protected path examples."
  - "Confirm no secrets, raw local paths, NAS paths, private network details, production logs, or real operational data are present."
rollback_plan:
  - "If the draft instructions are rejected, archive this sample TaskCard or revise it through human_review_only without applying any production change."
residual_risks:
  - "A reader could mistake ready_for_draft_pr as permission to create a PR unless the allowed_next_step remains explicit."
  - "The sample source IDs are illustrative and must not be treated as evidence that real upstream records exist."
required_human_approval: true
allowed_next_step: "prepare_draft_pr_instructions_only"
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

## Safe Use Notes

- Use this as a TaskCard writing sample, not as a real task, live queue item,
  or execution instruction.
- `allowed_next_step: "prepare_draft_pr_instructions_only"` means prepare
  review material only. It does not permit `create_pr`, `merge_pr`, deploy,
  API update, DB write, DB migration, runtime addition, external integration,
  publishing, or automation.
- A real TaskCard must use sanitized IDs and omit secrets, raw local paths, NAS
  paths, private network details, production logs, and real operational data.
- Human approval is required before any later dedicated implementation PR is
  considered, and that later scope must be reviewed separately.

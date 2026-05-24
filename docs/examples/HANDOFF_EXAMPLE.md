# Handoff Example

This is a safe filled example for
`docs/templates/HANDOFF_TEMPLATE.md`.

It is not a real operations log, not proof that the sampled handoff exists, and
not permission to execute work. A handoff is a durable asynchronous artifact,
not a conversation log or transcript. It contains no secrets, raw local paths,
NAS paths, private network details, production logs, runtime instructions, API
changes, DB changes, migrations, scheduler work, worker runtime, Codex App
Server runtime, external API integration, GitHub automation, PR creation,
merge, deploy, external publishing, or file-writing automation.

## Example Handoff Record

```yaml
handoff_id: "sample-handoff-draft-instructions-001"
handoff_version: 1
task_id: "sample-task-card-draft-instructions-001"
source_role: "codexapp_worker"
target_role: "human_reviewer"
created_at: "2026-05-24T00:00:00Z"
current_status: "ready_for_draft_pr"
objective: "Hand off sanitized draft PR instruction context for human review without executing the change."
what_has_been_done:
  - "Reviewed the sample TaskCard fields for proposal-only, human-review-only, non-production boundaries."
  - "Confirmed the sampled intended files are docs-only references and not protected runtime, API, DB, migration, or dependency paths."
  - "Prepared a concise summary for a human reviewer to decide whether draft instructions are acceptable."
key_findings:
  - "The associated TaskCard is aligned with ready_for_draft_pr and prepare_draft_pr_instructions_only."
  - "No PR creation, merge, deploy, API update, DB migration, runtime addition, external integration, publishing, or automation is recommended."
  - "Inputs, outputs, and references use sanitized labels only."
decisions_made:
  - "Keep the next action limited to human review of draft instructions."
  - "Treat this handoff as an asynchronous artifact, not as a chat transcript or execution history."
open_questions:
  - "Should the human reviewer accept the draft instruction wording as sufficient for a later docs-only request?"
  - "Should any sample acceptance criterion be revised for clarity before a real TaskCard pattern is reused?"
blockers:
  - "No execution blocker is being cleared by this handoff; any future implementation still needs explicit human approval and a separate scope."
required_next_action: "Human reviewer checks the sanitized draft instruction material and decides whether to keep, revise, or archive it."
inputs_passed:
  - "sample-task-card-draft-instructions-001"
  - "sample-implementation-proposal-docs-only-001"
  - "sample-context-pack-docs-only-001"
outputs_produced:
  - "sample-draft-pr-instructions-summary-001"
confidence: 0.82
completeness: 0.78
risks:
  - "The handoff may look implementation-ready if the human approval line is removed."
  - "The sampled upstream IDs are illustrative and must not be treated as real operational records."
human_approval_required: true
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
references:
  - "docs/TASK_BOARD_HANDOFF.md"
  - "docs/templates/HANDOFF_TEMPLATE.md"
  - "sample-task-card-draft-instructions-001"
```

## Safe Use Notes

- Use this as a handoff writing sample, not as a real handoff, live queue item,
  or conversation export.
- `required_next_action` is limited to human review of draft instructions. It
  does not recommend PR creation, merge, deploy, API update, DB migration,
  runtime addition, external integration, publishing, or automation.
- A real handoff must preserve durable facts only and omit secrets, raw local
  paths, NAS paths, private network details, production logs, and real
  operational data.
- If execution is needed later, it must be handled through explicit human
  approval and a separate dedicated implementation PR.

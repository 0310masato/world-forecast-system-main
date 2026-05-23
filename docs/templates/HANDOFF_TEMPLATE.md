# TaskHandoff Template

Use this template for Task Board / Handoff Contract v0 handoffs. A handoff is a
durable asynchronous artifact. It is not a conversation log and not an execution
command.

## Contract Fields

```yaml
handoff_id: "<task-handoff-id>"
handoff_version: 1
task_id: "<task-card-id>"
source_role: "<role handing off>"
target_role: "<role receiving handoff>"
created_at: 0
current_status: "new"
objective: "<objective from the associated TaskCard>"
what_has_been_done:
  - "<completed review, drafting, or analysis step>"
key_findings:
  - "<important finding>"
decisions_made:
  - "<decision already made>"
open_questions:
  - "<question still requiring review>"
blockers:
  - "<blocker or none>"
required_next_action: "<human-reviewed next action only>"
inputs_passed:
  - "<sanitized input reference>"
outputs_produced:
  - "<sanitized output reference>"
confidence: 0.0
completeness: 0.0
risks:
  - "<remaining risk>"
human_approval_required: true
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
references:
  - "<sanitized reference>"
```

## Allowed Values

Allowed `current_status` values:

- `new`
- `triaged`
- `waiting_for_context`
- `waiting_for_human_approval`
- `ready_for_draft_pr`
- `blocked`
- `needs_revision`
- `archived`

Allowed `allowed_next_step` values:

- `prepare_draft_pr_instructions_only`
- `human_review_only`
- `revise_task_card_only`
- `archive_only`

`confidence` and `completeness` must be numbers from `0` through `1`.

## Handoff Checklist

- [ ] Handoff summarizes durable facts, not a chat transcript.
- [ ] Human approval is required.
- [ ] `current_status` matches the associated TaskCard status when both are
      reviewed together.
- [ ] `current_status` and `allowed_next_step` are consistent.
- [ ] `required_next_action` is limited to human review, draft-instructions
      preparation, task-card revision, or archiving.
- [ ] `forbidden_next_steps` includes every required forbidden next step.
- [ ] Inputs, outputs, and references are sanitized.
- [ ] No secrets, `.env` values, raw local paths, NAS paths, private network
      details, or unnecessary private data are present.
- [ ] The handoff does not recommend PR creation, merge, deploy, API update,
      database write, migration, external API integration, external publishing,
      automated trading, navigation guidance, military guidance, or production
      promotion.

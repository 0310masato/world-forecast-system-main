# Blocker Escalation Example

This is a safe filled example for
`docs/templates/BLOCKER_ESCALATION_TEMPLATE.md`.

It is not a real blocker log, not proof that the sampled TaskCard or handoff
exists, and not permission to clear a blocker automatically. It contains no
secrets, raw local paths, NAS paths, private network details, production logs,
runtime instructions, API changes, DB changes, scheduler work, worker runtime,
Codex App Server runtime, external API integration, GitHub automation, PR
creation, or file-writing automation.

## Example Escalation Record

```yaml
escalation_id: "example-blocker-escalation-001"
escalation_version: 1
source_task_id: "sample-task-card-runtime-context-001"
source_handoff_id: "sample-handoff-runtime-context-001"
current_status: "waiting_for_human_approval"
blocker_type: "human_approval_required"
blocker_summary: "The sampled task asks whether to proceed toward runtime design, but user-provided materials and explicit human approval are missing."
evidence:
  - "sample-task-card-runtime-context-001: sanitized reference says runtime design may be needed later."
  - "sample-handoff-runtime-context-001: sanitized handoff does not include user-provided runtime design materials."
attempted_resolution:
  - "Checked the sample source chain and found no human-approved dedicated implementation scope."
  - "Kept the next step limited to human review instead of drafting implementation steps."
why_ai_must_stop:
  - "Runtime design requires user-provided materials and a separate human-reviewed PR."
  - "The blocker cannot be resolved by an AI worker without risking scope expansion."
human_decision_needed:
  - "Decide whether to keep the task waiting for human approval, revise the TaskCard, or archive the request."
safe_next_options:
  - "human_review_only"
  - "revise_task_card_only"
  - "archive_only"
forbidden_next_steps:
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
  - "github_issue_automation"
  - "create_pr"
  - "merge_pr"
  - "file_writing_automation"
  - "external_publish"
residual_risks:
  - "If the blocker summary is shortened later, the reason AI must stop may become unclear."
  - "If safe next options are expanded, a reader could misread the escalation as execution permission."
required_human_review: true
proposal_only: true
is_production_state: false
```

## Safe Use Notes

- Use this as a sample escalation record, not as a real blocked task.
- AI workers must not clear the blocker, create a PR, deploy, update APIs,
  change a DB, add runtime, add a scheduler, or start external integration from
  this example.
- Human review is required to choose among `human_review_only`,
  `revise_task_card_only`, and `archive_only`.
- Keep evidence sanitized and avoid secrets, raw local paths, NAS paths,
  private network details, production logs, and unnecessary private data.

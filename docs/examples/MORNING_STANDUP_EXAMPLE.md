# Morning Standup Example

This is a safe filled example for
`docs/templates/MORNING_STANDUP_TEMPLATE.md`.

It is not a real operations log, not proof that the sampled TaskCards or
handoffs exist, and not permission to update task state automatically. It
contains no secrets, raw local paths, NAS paths, private network details,
production logs, runtime instructions, API changes, DB changes, scheduler work,
external API integration, GitHub automation, PR creation, or file-writing
automation.

## Example Report Record

```yaml
report_id: "example-morning-standup-001"
report_version: 1
generated_for_date: "2026-05-24"
prepared_by_role: "codexapp_worker"
human_owner: "human-owner"
source_task_cards:
  - "sample-task-card-ops-review-001"
  - "sample-task-card-doc-boundary-002"
source_handoffs:
  - "sample-handoff-routine-review-001"
completed_since_last_report:
  - "sample-task-card-ops-review-001: draft-only review notes were prepared for human review; no status update was applied."
blocked_items:
  - "sample-task-card-doc-boundary-002: waiting_for_context because the source contract reference is missing."
waiting_for_human_approval:
  - "sample-handoff-routine-review-001: human owner must confirm whether the next review action is human_review_only or revise_task_card_only."
priority_today:
  - "Review sample blocked item summaries and decide whether a TaskCard revision is needed."
  - "Confirm that no proposed routine record is being treated as production state."
open_questions:
  - "Should sample-task-card-doc-boundary-002 be revised with a clearer source contract reference?"
  - "Is the stale context note sufficient for human review, or should the TaskCard be archived?"
risks:
  - "A reader could mistake the standup example for an execution result unless the proposal-only label remains visible."
  - "A missing source contract reference may cause repeated review churn if not revised by a human-reviewed update."
recommended_human_actions:
  - "human_review_only"
  - "revise_task_card_only"
forbidden_operations_confirmed:
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
required_human_review: true
proposal_only: true
is_production_state: false
```

## Safe Use Notes

- Use this as a writing sample for morning status review, not as a live report.
- Do not treat `human_review_only` or `revise_task_card_only` as permission to
  create a PR, merge, deploy, update an API, change a DB, add runtime, or
  write files automatically.
- A real morning report must use sanitized record IDs and omit secrets, raw
  local paths, NAS paths, private network details, and production logs.
- The report may help a human decide what to review today; it must not change
  TaskCard or Handoff state automatically.

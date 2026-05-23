# Morning Standup Template

朝に人間が状況を把握するための proposal-only 報告テンプレートです。この
template は定期実行 runtime ではなく、TaskCard、Handoff、QA Report を確認する
ための記録形式です。

## Report Fields

```yaml
report_id: "<morning-standup-report-id>"
report_version: 1
generated_for_date: "<YYYY-MM-DD>"
prepared_by_role: "<ai_worker | codexapp | human_reviewer>"
human_owner: "<human reviewer or owner>"
source_task_cards:
  - "<task-card-id>"
source_handoffs:
  - "<handoff-id>"
completed_since_last_report:
  - "<completed proposal-only review, draft, or archive action>"
blocked_items:
  - "<blocked task id, blocker summary, and current status>"
waiting_for_human_approval:
  - "<item requiring human review before any next step>"
priority_today:
  - "<proposal-only review priority>"
open_questions:
  - "<question for human reviewer>"
risks:
  - "<residual risk>"
recommended_human_actions:
  - "human_review"
  - "revise_task_card"
  - "archive"
  - "prepare_draft_instructions"
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

## Allowed recommended_human_actions

`recommended_human_actions` must be limited to:

- `human_review`
- `revise_task_card`
- `archive`
- `prepare_draft_instructions`

Do not recommend PR creation, merge, deploy, API update, database write,
migration, runtime addition, scheduler addition, worker execution, external API
integration, file-writing automation, external publishing, or production
promotion.

## Review Checklist

- [ ] Source TaskCards and Handoffs are sanitized references.
- [ ] Blocked and approval-waiting items are visible.
- [ ] Recommended human actions are review-only or draft-only.
- [ ] Forbidden operations are confirmed.
- [ ] The report is proposal-only and not production state.
- [ ] Human review is required before any follow-up work.

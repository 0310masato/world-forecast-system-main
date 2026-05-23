# Blocker Escalation Template

`blocked`、`waiting_for_context`、`waiting_for_human_approval` の TaskCard や
Handoff を、人間へ安全に戻すための proposal-only escalation テンプレートです。

## Escalation Fields

```yaml
escalation_id: "<blocker-escalation-id>"
escalation_version: 1
source_task_id: "<task-card-id or none>"
source_handoff_id: "<handoff-id or none>"
current_status: "blocked"
blocker_type: "missing_context"
blocker_summary: "<short summary>"
evidence:
  - "<sanitized evidence reference or observation>"
attempted_resolution:
  - "<review-only attempt made before stopping>"
why_ai_must_stop:
  - "<contract reason AI worker or CodexApp must stop>"
human_decision_needed:
  - "<decision requested from human reviewer>"
safe_next_options:
  - "human_review_only"
  - "revise_task_card_only"
  - "archive_only"
  - "prepare_draft_pr_instructions_only"
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
  - "<risk that remains after escalation>"
required_human_review: true
proposal_only: true
is_production_state: false
```

## Allowed blocker_type Values

- `missing_context`
- `human_approval_required`
- `protected_scope`
- `restricted_content`
- `contract_mismatch`
- `high_risk_operation`
- `stale_context`
- `other`

## Review Checklist

- [ ] `current_status` is an allowed Task Board / Handoff status.
- [ ] Evidence uses sanitized references only.
- [ ] `why_ai_must_stop` names the contract boundary or missing context.
- [ ] Safe next options are human-reviewed and proposal-only.
- [ ] Forbidden next steps are not shortened away.
- [ ] Human review is required before the blocker is cleared.

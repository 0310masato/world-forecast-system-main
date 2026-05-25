# Codex App Server Runtime Design PR Readiness Review Template

Use this template after a Runtime Intake record reaches
`ready_for_runtime_design_pr` and before any future runtime design PR
instructions are drafted.

This is a human-review-only checklist and review report template. It is not a
runtime design PR, not PR creation permission, not merge permission, not deploy
permission, and not implementation permission.

It does not authorize runtime implementation, worker runtime, scheduler
runtime, API connection, DB connection, package change, CI change, GitHub
automation, file-writing automation, AI job execution, or production
promotion.

## Review Metadata

```yaml
readiness_review_id: "<runtime-design-pr-readiness-review-id>"
readiness_review_version: 1
proposal_only: true
is_production_state: false
required_human_approval: true
source_intake_id: "<runtime-intake-id>"
source_task_id: "<runtime-intake-task-card-id or none>"
source_handoff_id: "<runtime-intake-handoff-id or none>"
source_qa_report_id: "<runtime-intake-task-board-qa-report-id or none>"
reviewer_role: "<human owner | future runtime designer | risk reviewer | qa reviewer>"
reviewed_at: "<YYYY-MM-DDTHH:MM:SSZ>"
readiness_decision: "<waiting_for_context | revise_intake_or_bridge_records | ready_to_draft_runtime_design_pr_instructions_only | blocked_by_scope_risk | archive_only>"
decision_reason: "<short reason for the readiness decision>"
required_human_reviewed_next_action: "<human_review_only | revise_intake_or_bridge_records_only | draft_runtime_design_pr_instructions_only | archive_only>"
```

Allowed `readiness_decision` values:

- `waiting_for_context`: required source records, scope, review role, test
  input, rollback / disable input, or safety context is missing.
- `revise_intake_or_bridge_records`: the source intake, TaskCard, Handoff, or
  QA report needs revision before instruction drafting can be considered.
- `ready_to_draft_runtime_design_pr_instructions_only`: enough reviewed context
  exists to draft future runtime design PR instructions for human review only.
- `blocked_by_scope_risk`: protected scope, restricted content, production
  state, or forbidden operations make the request unsafe.
- `archive_only`: the readiness review should be archived without further
  instruction drafting.

`ready_to_draft_runtime_design_pr_instructions_only` means only that a future
runtime design PR instruction draft may be prepared for human review. It does
not permit PR creation, merge, deploy, runtime implementation, worker runtime,
scheduler runtime, API connection, DB connection, package change, CI change,
GitHub automation, file-writing automation, AI job execution, or production
promotion.

## Required Source References

```yaml
source_records:
  intake_record: "<sanitized Runtime Intake reference>"
  task_card: "<sanitized Runtime Intake TaskCard reference or none>"
  handoff: "<sanitized Runtime Intake Handoff reference or none>"
  qa_report: "<sanitized Runtime Intake Task Board QA Report reference or none>"
policy_refs:
  - "AGENTS.md"
  - "docs/CONTRACTS_INDEX.md"
  - "docs/CODEX_APP_SERVER.md"
  - "docs/CODEX_APP_SERVER_RUNTIME_INTAKE.md"
  - "docs/TASK_BOARD_HANDOFF.md"
  - "docs/HUMAN_APPROVAL.md"
  - "docs/AGENT_CHARTER_OPERATIONS_RUNBOOK.md"
```

## Readiness Checks

Use `pass`, `waiting`, `revise`, or `block` for each `result`.

### source_intake_record_check

- Result: `<pass | waiting | revise | block>`
- Notes: `<Does the source intake exist, use ready_for_runtime_design_pr, and preserve proposal_only, is_production_state: false, and required_human_approval?>`

### source_task_card_handoff_qa_report_check

- Result: `<pass | waiting | revise | block>`
- Notes: `<Do source TaskCard, Handoff, and QA report bridge records align with the intake, remain sanitized, and avoid execution permission?>`

### runtime_goal_clarity_check

- Result: `<pass | waiting | revise | block>`
- Notes: `<Is the future runtime design goal clear enough for instruction drafting review without becoming implementation work?>`

### proposal_only_boundary_check

- Result: `<pass | waiting | revise | block>`
- Notes: `<Does the review preserve proposal-only, human-review-only, non-production boundaries?>`

### protected_core_boundary_check

- Result: `<pass | waiting | revise | block>`
- Notes: `<Are production forecast generation, price acquisition, evaluation, persistence, bias feedback, production API behavior, /api/forecast, /api/hormuz, /api/hormuz/news, lib/db.ts, package files, schema, and migrations out of scope?>`

### runtime_implementation_permission_check

- Result: `<pass | waiting | revise | block>`
- Notes: `<Does the record state that instruction-drafting readiness is not runtime implementation permission?>`

### worker_separation_boundary_check

- Result: `<pass | waiting | revise | block>`
- Notes: `<Is the worker separation boundary clear enough for later instruction drafting, without adding worker runtime?>`

### scheduler_boundary_check

- Result: `<pass | waiting | revise | block>`
- Notes: `<Is scheduler scope excluded or clearly review-only, without adding scheduler runtime?>`

### proposal_storage_boundary_check

- Result: `<pass | waiting | revise | block>`
- Notes: `<Is proposal storage separated from production forecast, price, evaluation, and prediction state?>`

### human_approval_state_model_check

- Result: `<pass | waiting | revise | block>`
- Notes: `<Are human approval states clear, and is approval limited to review permission rather than execution?>`

### context_pack_consumption_boundary_check

- Result: `<pass | waiting | revise | block>`
- Notes: `<Is any future context pack consumption bounded to sanitized proposal inputs and not treated as live production state?>`

### restricted_content_handling_check

- Result: `<pass | waiting | revise | block>`
- Notes: `<Are restricted content handling rules explicit and sufficient?>`

### test_plan_input_check

- Result: `<pass | waiting | revise | block>`
- Notes: `<Are review or test inputs for contract boundary, protected path, restricted content, and proposal-only separation present?>`

### rollback_disable_plan_input_check

- Result: `<pass | waiting | revise | block>`
- Notes: `<Are rollback or disable plan inputs present, including how production forecast behavior remains unchanged?>`

### failure_mode_check

- Result: `<pass | waiting | revise | block>`
- Notes: `<Are likely failure modes identified before instruction drafting?>`

### required_review_roles_check

- Result: `<pass | waiting | revise | block>`
- Notes: `<Are the required human owner, future runtime designer, QA reviewer, and risk / safety reviewer roles identified or explicitly marked missing?>`

### forbidden_operations_check

- Result: `<pass | waiting | revise | block>`
- Notes: `<Are forbidden operations listed and not weakened?>`

### sanitized_references_check

- Result: `<pass | waiting | revise | block>`
- Notes: `<Do references use sanitized labels or repository-relative docs references only?>`

### residual_risk_check

- Result: `<pass | waiting | revise | block>`
- Notes: `<Are residual risks clear enough for a human reviewer to decide whether instruction drafting may proceed?>`

## Forbidden Operations

```yaml
forbidden_operations:
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
  - "package_change"
  - "ci_change"
  - "github_automation"
  - "create_github_issue"
  - "create_pr"
  - "merge_pr"
  - "file_writing_automation"
  - "ai_job_execution"
  - "external_publish"
  - "automated_trading"
  - "investment_advice"
  - "navigation_guidance"
  - "military_guidance"
  - "production_promotion"
```

## Restricted Content Must Be Absent

```yaml
restricted_content_must_be_absent:
  - "secrets"
  - ".env values"
  - "OAuth tokens"
  - "API keys"
  - "raw local paths"
  - "NAS paths"
  - "private network details"
  - "production logs"
  - "real operational data"
  - "unnecessary private data"
```

## Review Output

```yaml
open_questions:
  - "<question that must be answered before instruction drafting>"
blockers:
  - "<blocker that requires human review>"
residual_risks:
  - "<risk that remains after readiness review>"
required_follow_up_records:
  - "<source record or review artifact that must be revised or prepared>"
```

## Completion Criteria

- The review is proposal-only, human-review-only, and not production state.
- The review ties back to a source Runtime Intake record and any available
  TaskCard, Handoff, and QA report bridge records.
- `readiness_decision` uses one allowed value.
- `ready_to_draft_runtime_design_pr_instructions_only` is described as
  instruction-drafting readiness only.
- Forbidden operations are present and not weakened.
- Restricted content is absent.
- Protected core, runtime, worker, scheduler, API, DB, package, CI, GitHub
  automation, file-writing automation, AI job execution, and production
  promotion remain out of scope.
- Any later runtime design PR instructions still require human review and a
  separate scoped PR process.

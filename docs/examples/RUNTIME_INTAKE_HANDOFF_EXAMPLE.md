# Runtime Intake Handoff Example v0

## Purpose

This is a safe filled example for the asynchronous handoff that may follow a
Codex App Server Runtime Intake review before any future runtime design PR
instructions are drafted.

It preserves durable facts, open questions, blockers, and residual risks from
the intake process. It is not a conversation transcript, not an operations log,
not a PR creation request, and not permission to implement runtime behavior.

## Safety Boundary

The handoff uses sanitized references only. It does not store full conversation
logs, secrets, `.env` values, OAuth tokens, API keys, raw local filesystem
paths, NAS paths, private network details, production logs, or real operational
data.

The next action must be human-reviewed. Runtime implementation, PR creation,
merge, deploy, and production promotion remain forbidden.

## Example Handoff Record

```yaml
handoff_id: "sample-runtime-intake-handoff-001"
handoff_version: 1
task_id: "sample-runtime-intake-task-card-001"
source_runtime_intake_id: "sample-runtime-intake-design-discussion-001"
source_role: "future_runtime_designer"
target_role: "human_reviewer"
created_at: "2026-05-25T00:00:00Z"
current_status: "waiting_for_human_approval"
objective: "Hand off durable Runtime Intake facts for human review before any future runtime design PR instructions are drafted."
what_has_been_done:
  - "Reviewed the sanitized Runtime Intake outcome and confirmed it remains proposal-only and non-production."
  - "Mapped the intake outcome to a sample TaskCard without creating a PR or implementing runtime behavior."
  - "Removed transient discussion details and retained only durable review facts, open questions, blockers, and risks."
key_findings:
  - "The source intake uses sanitized references and does not contain secrets, raw local paths, NAS paths, private network details, or production logs."
  - "The source intake preserves proposal_only: true, is_production_state: false, and required_human_approval: true."
  - "ready_for_runtime_design_pr means instruction drafting readiness only, not runtime implementation permission."
  - "Protected API, DB, package, CI, worker, scheduler, and runtime surfaces remain out of scope."
decisions_made:
  - "Do not save the full conversation log."
  - "Do not create a PR from this handoff."
  - "Keep the next action limited to human review before any later instruction draft is prepared."
open_questions:
  - "Which human reviewer owns the later runtime design PR instruction review?"
  - "What exact worker separation boundary should a later design draft describe?"
  - "What proposal storage boundary keeps production forecast state unchanged?"
  - "Which disable trigger should stop consuming sidecar proposals first?"
  - "What restricted content review checklist is required before any later design PR is considered?"
blockers:
  - "Runtime implementation permission is absent."
  - "PR creation permission is absent."
  - "Merge, deploy, and production promotion permission are absent."
  - "Worker, scheduler, API, DB, package, CI, and external integration boundaries still require human review."
required_next_action: "Human reviewer decides whether to request a separate runtime design PR instruction draft, revise the intake TaskCard, or archive the handoff."
inputs_passed:
  - "sanitized runtime intake record"
  - "sanitized Runtime Intake TaskCard example"
  - "sanitized human approval boundary summary"
outputs_produced:
  - "sanitized runtime intake handoff summary"
confidence: 0.82
completeness: 0.76
risks:
  - "A future reader could confuse instruction drafting readiness with permission to implement runtime code."
  - "A future design draft could overreach unless protected path, rollback, disable, package, and CI boundaries are checked again."
  - "If conversation transcripts are copied into handoff records, restricted content or private details could leak."
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
  - "docs/CODEX_APP_SERVER_RUNTIME_INTAKE.md"
  - "docs/TASK_BOARD_HANDOFF.md"
  - "docs/examples/RUNTIME_INTAKE_TASK_CARD_EXAMPLE.md"
  - "sanitized source intake label"
conversation_log_policy:
  full_conversation_log_saved: false
  durable_facts_only: true
restricted_content_absent:
  - "secrets"
  - ".env values"
  - "OAuth tokens"
  - "API keys"
  - "raw local paths"
  - "NAS paths"
  - "private network details"
  - "production logs"
```

## Safe Use Notes

- Use this as a handoff writing sample, not as a real handoff, live queue item,
  transcript export, or execution instruction.
- `required_next_action` sends the record back to human review. It does not
  recommend PR creation, merge, deploy, API update, DB migration, package
  change, CI change, runtime addition, worker execution, scheduler execution,
  external integration, publishing, automation, or production promotion.
- A real handoff must preserve durable facts only and use sanitized references
  instead of full chat logs, secrets, raw local paths, NAS paths, private
  network details, production logs, or real operational data.

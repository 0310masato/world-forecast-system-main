# Task Board QA Report Example

This is a safe filled example for
`docs/templates/TASK_BOARD_QA_REPORT_TEMPLATE.md`.

It is not a real QA run, not proof that the sampled TaskCard or handoff exists,
and not permission to execute work. This QA Report is review material for
human approval, not an automated execution result. It contains no secrets, raw
local paths, NAS paths, private network details, production logs, runtime
instructions, API changes, DB changes, migrations, scheduler work, worker
runtime, Codex App Server runtime, external API integration, GitHub automation,
PR creation, merge, deploy, external publishing, or file-writing automation.

## Example QA Report Record

```yaml
reviewed_task_id: "sample-task-card-draft-instructions-001"
reviewed_handoff_id: "sample-handoff-draft-instructions-001"
reviewer_role: "qa_reviewer"
reviewed_at: "2026-05-24T00:00:00Z"
recommendation: "approve_for_human_review"
scope_check:
  result: "pass"
  notes: "The sampled records stay within proposal-only Task Board / Handoff scope and describe draft instruction review material only."
status_next_step_consistency:
  result: "pass"
  notes: "TaskCard status and Handoff current_status are ready_for_draft_pr, and allowed_next_step is prepare_draft_pr_instructions_only."
autonomy_level_check:
  result: "pass"
  notes: "The sampled TaskCard uses A2_prepare_for_approval, which is within the A0-A2 autonomy boundary."
protected_path_check:
  result: "pass"
  notes: "The sampled intended_files are docs-only example references and do not include app/api/forecast, app/api/hormuz, app/api/hormuz/news, lib/db.ts, package-lock.json, runtime, scheduler, worker, migration, or external integration paths."
restricted_content_check:
  result: "pass"
  notes: "No secrets, .env values, raw local paths, NAS paths, private network details, production logs, or real operational data are included in this example."
high_risk_operation_check:
  result: "pass"
  notes: "The sampled records do not recommend PR creation, merge, deploy, API update, DB write, DB migration, external integration, production promotion, external publishing, automated trading, navigation guidance, or military guidance."
implementation_proposal_relationship_check:
  result: "pass"
  notes: "The sampled TaskCard uses sanitized source IDs and keeps the implementation proposal relationship proposal-only and human-review-only."
human_approval_check:
  result: "pass"
  notes: "required_human_approval and human_approval_required are true, and approval is described as review-only rather than execution permission."
agent_charter_runbook_check:
  result: "pass"
  notes: "Any CodexApp draft instructions derived from the sampled records must be Japanese proposal-only review support and must preserve contract field names and enum values."
residual_risks:
  - "approve_for_human_review may be misread as permission to create a PR unless the review-only boundary remains explicit."
  - "The sampled records do not prove that any real upstream proposal, decision, or context pack exists."
recommendation_rationale: "The sampled TaskCard and Handoff preserve docs-only scope, status and next-step consistency, A2 autonomy, protected path avoidance, restricted content exclusion, and human approval boundaries. The recommendation permits human review only and does not permit create_pr, merge_pr, deploy, API update, DB migration, external integration, production promotion, runtime addition, or automation."
required_human_review: true
proposal_only: true
is_production_state: false
```

## Safe Use Notes

- Use this as a QA report writing sample, not as a real review result or
  automated execution output.
- `recommendation: "approve_for_human_review"` means the sample is suitable for
  human review only. It is not permission to create a PR, merge, deploy, update
  an API, write a DB, run a migration, add runtime, connect an external API,
  publish externally, or promote production state.
- A real QA Report must use sanitized record IDs and omit secrets, raw local
  paths, NAS paths, private network details, production logs, and real
  operational data.
- If the QA reviewer finds protected paths, restricted content, missing
  forbidden next steps, or high-risk operations, the recommendation should move
  to `revise_task_card`, `archive`, or `block` for human review.

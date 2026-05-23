# Task Board QA Report Template

Use this template when reviewing a TaskCard, TaskHandoff, or both before
accepting them for later human review.

## Review Metadata

```yaml
reviewed_task_id: "<task-card-id or none>"
reviewed_handoff_id: "<handoff-id or none>"
reviewer_role: "<reviewer role>"
reviewed_at: 0
recommendation: "revise_task_card"
```

Allowed `recommendation` values:

- `approve_for_human_review`
- `revise_task_card`
- `archive`
- `block`

## Checks

### scope_check

- Result: `<pass | revise | block>`
- Notes: `<Does the record stay within proposal-only Task Board / Handoff scope?>`

### status_next_step_consistency

- Result: `<pass | revise | block>`
- Notes: `<Do status/current_status and allowed_next_step match the contract?>`

### autonomy_level_check

- Result: `<pass | revise | block>`
- Notes: `<Is autonomy limited to A0, A1, or A2?>`

### protected_path_check

- Result: `<pass | revise | block>`
- Notes: `<Do intended_files avoid protected API, DB, migration, dependency,
  runtime, scheduler, worker, and external integration paths?>`

### restricted_content_check

- Result: `<pass | revise | block>`
- Notes: `<Are secrets, .env values, raw local paths, NAS paths, private network
  details, and unnecessary private data absent?>`

### high_risk_operation_check

- Result: `<pass | revise | block>`
- Notes: `<Does the record avoid recommending PR creation, merge, deploy, API
  updates, DB writes, migrations, external integrations, publishing, automated
  trading, navigation guidance, military guidance, and production promotion?>`

### implementation_proposal_relationship_check

- Result: `<pass | revise | block | not_applicable>`
- Notes: `<Does the TaskCard match its source Implementation Proposal Contract
  v0 identifiers, versions, job kind, context pack, and safety boundaries?>`

### human_approval_check

- Result: `<pass | revise | block>`
- Notes: `<Is required_human_approval or human_approval_required true, and is
  approval described as review-only?>`

## Residual Risks

- `<risk that remains after QA>`

## Recommendation Rationale

`<Short reason for approve_for_human_review, revise_task_card, archive, or block.>`

# Nightly QA Report Example

This is a safe filled example for
`docs/templates/NIGHTLY_QA_REPORT_TEMPLATE.md`.

It is not a real nightly run, not proof that a scheduler or worker executed,
and not permission to add nightly automation. No automated execution occurred
in this example. It contains no secrets, raw local paths, NAS paths, private
network details, production logs, runtime instructions, API changes, DB changes,
scheduler work, worker runtime, Codex App Server runtime, external API
integration, GitHub automation, PR creation, or file-writing automation.

## Example QA Report Record

```yaml
qa_report_id: "example-nightly-qa-report-001"
qa_report_version: 1
run_window: "2026-05-24T00:00:00Z/2026-05-24T01:00:00Z"
prepared_by_role: "qa_reviewer"
scope:
  - "sample routine records for proposal-only boundary review"
  - "sample TaskCards and handoffs using sanitized IDs"
checked_contracts:
  - "docs/OPERATIONS_ROUTINES.md"
  - "docs/TASK_BOARD_HANDOFF.md"
  - "docs/HUMAN_APPROVAL.md"
checked_task_cards:
  - "sample-task-card-nightly-qa-001"
  - "sample-task-card-boundary-check-002"
checked_handoffs:
  - "sample-handoff-nightly-qa-001"
checks_performed:
  - "proposal_only_check: pass for sampled records in this example"
  - "human_review_required_check: pass for sampled records in this example"
  - "restricted_content_check: none observed in this example"
  - "high_risk_operation_check: none observed in this example"
findings:
  - "Sample records keep routine QA as a report format rather than an execution result."
  - "One sampled TaskCard should make its forbidden next steps easier to scan before a real reviewer accepts it."
regressions_detected:
  - "none observed in this example"
stale_items:
  - "sample-handoff-nightly-qa-001: candidate only; review timestamp would need confirmation in a real audit."
restricted_content_findings:
  - "none observed in this example"
high_risk_operation_findings:
  - "none observed in this example"
protected_path_findings:
  - "none observed in this example"
human_review_required_items:
  - "sample-task-card-boundary-check-002: human reviewer should decide whether to revise forbidden next step wording."
recommendation: "pass_for_human_review"
required_human_review: true
proposal_only: true
is_production_state: false
```

## Safe Use Notes

- Use this as a future QA report format sample, not as evidence that nightly QA
  runtime exists.
- No scheduler, worker, automation, API call, DB write, migration, deploy,
  PR creation, merge, or file-writing automation is implied.
- A real QA report must omit secrets, raw local paths, NAS paths, private
  network details, production logs, and unnecessary private data.
- `pass_for_human_review` means the sample can be read by a human; it is not
  production approval or execution permission.

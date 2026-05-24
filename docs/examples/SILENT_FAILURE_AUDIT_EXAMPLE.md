# Silent Failure Audit Example

This is a safe filled example for
`docs/templates/SILENT_FAILURE_AUDIT_TEMPLATE.md`.

It is not a real audit log, not a final finding that silent failure occurred,
and not permission to change automation or runtime behavior. It contains no
secrets, raw local paths, NAS paths, private network details, production logs,
runtime instructions, API changes, DB changes, scheduler work, worker runtime,
Codex App Server runtime, external API integration, GitHub automation, PR
creation, or file-writing automation.

## Example Audit Record

```yaml
audit_id: "example-silent-failure-audit-001"
audit_version: 1
audit_period: "2026-05-18/2026-05-24"
auditor_role: "risk_safety_reviewer"
sampled_task_cards:
  - "sample-task-card-fast-close-001"
  - "sample-task-card-forbidden-steps-002"
sampled_handoffs:
  - "sample-handoff-repeat-summary-001"
sampled_reports:
  - "sample-morning-standup-report-001"
  - "sample-nightly-qa-report-001"
expected_behavior:
  - "Routine records should preserve proposal_only, human review, forbidden next steps, and non-production labels."
  - "Suspiciously fast completion should be treated as a candidate for human review, not as proof of success."
observed_behavior:
  - "sample-task-card-fast-close-001 appears to move from triage to review-ready with unusually little evidence."
  - "sample-task-card-forbidden-steps-002 omits several forbidden next steps in the sampled text."
  - "sample-handoff-repeat-summary-001 repeats the same summary across two review periods."
mismatch_findings:
  - "candidate: sample-task-card-fast-close-001 may have insufficient evidence for the claimed review readiness."
  - "candidate: sample-task-card-forbidden-steps-002 may weaken the contract boundary by omitting forbidden next steps."
stale_or_repeated_outputs:
  - "suspected: sample-handoff-repeat-summary-001 may be stale because the same summary appears across sampled periods."
suspiciously_fast_completion:
  - "candidate: sample-task-card-fast-close-001 needs human review before it is accepted as review-ready."
missing_human_review:
  - "none confirmed in this example; candidate records still require human review."
missing_forbidden_next_steps:
  - "candidate: sample-task-card-forbidden-steps-002 should be revised to include all required forbidden next steps."
protected_path_leakage:
  - "none observed in this example"
restricted_content_leakage:
  - "none observed in this example"
recommended_corrections:
  - "Proposal-only candidate: revise instructions so fast completion must include source evidence and residual risk."
  - "Proposal-only candidate: add a human-reviewed checklist item for missing forbidden next steps."
  - "Proposal-only candidate: treat any future block_automation label as a review recommendation only, not as a runtime change."
human_review_required: true
recommendation: "revise_instructions"
proposal_only: true
is_production_state: false
```

## Safe Use Notes

- Record suspicious items as `candidate`, `suspected`, or `needs human review`
  unless a human reviewer confirms them.
- Do not treat `revise_instructions` or `block_automation` wording as an
  automatic change to scheduler, worker, runtime, or file-writing behavior.
- Do not stop or change automation from this example; route the concern to
  human review and a separate approved scope if implementation is ever needed.
- A real audit must omit secrets, raw local paths, NAS paths, private network
  details, production logs, and unnecessary private data.

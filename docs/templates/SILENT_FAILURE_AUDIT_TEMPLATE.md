# Silent Failure Audit Template

AI worker、CodexApp、task handoff が「エラーなしで間違い続ける」静かな故障を
点検するための proposal-only audit テンプレートです。

## Audit Fields

```yaml
audit_id: "<silent-failure-audit-id>"
audit_version: 1
audit_period: "<YYYY-MM-DD/YYYY-MM-DD>"
auditor_role: "<ai_worker | codexapp | human_reviewer>"
sampled_task_cards:
  - "<task-card-id>"
sampled_handoffs:
  - "<handoff-id>"
sampled_reports:
  - "<report-id>"
expected_behavior:
  - "<expected contract behavior>"
observed_behavior:
  - "<observed behavior>"
mismatch_findings:
  - "<expected vs observed mismatch>"
stale_or_repeated_outputs:
  - "<stale or repeated output finding>"
suspiciously_fast_completion:
  - "<completion pattern requiring review or none>"
missing_human_review:
  - "<missing review gate or none>"
missing_forbidden_next_steps:
  - "<missing forbidden next step or none>"
protected_path_leakage:
  - "<protected path leakage or none>"
restricted_content_leakage:
  - "<restricted content leakage or none>"
recommended_corrections:
  - "<proposal-only correction for human review>"
human_review_required: true
recommendation: "continue"
proposal_only: true
is_production_state: false
```

## Allowed recommendation Values

- `continue`
- `revise_instructions`
- `update_docs`
- `block_automation`
- `escalate_to_human`

## Review Checklist

- [ ] Samples identify TaskCard, Handoff, report, or contract records.
- [ ] Expected and observed behavior are compared explicitly.
- [ ] Missing human review and missing forbidden next steps are checked.
- [ ] Protected path and restricted content leakage are flagged if present.
- [ ] Corrections remain proposal-only and require human review.
- [ ] `block_automation` is a review recommendation only; it does not change
      runtime behavior by itself.

# Nightly QA Report Template

夜間 QA を「実行する」ための template ではなく、将来の夜間 QA 報告の型を定義
する proposal-only テンプレートです。この PR では nightly runtime、
scheduler、worker を追加しません。

## QA Report Fields

```yaml
qa_report_id: "<nightly-qa-report-id>"
qa_report_version: 1
run_window: "<YYYY-MM-DDTHH:mm:ssZ/YYYY-MM-DDTHH:mm:ssZ>"
prepared_by_role: "<ai_worker | codexapp | human_reviewer>"
scope:
  - "<contracts, task cards, handoffs, or reports reviewed>"
checked_contracts:
  - "<contract document or version>"
checked_task_cards:
  - "<task-card-id>"
checked_handoffs:
  - "<handoff-id>"
checks_performed:
  - "<check name and short result>"
findings:
  - "<finding for human review>"
regressions_detected:
  - "<regression or none>"
stale_items:
  - "<stale record or none>"
restricted_content_findings:
  - "<secret, .env, raw local path, NAS path, private network detail, or none>"
high_risk_operation_findings:
  - "<forbidden operation finding or none>"
protected_path_findings:
  - "<protected path finding or none>"
human_review_required_items:
  - "<item requiring human review>"
recommendation: "pass_for_human_review"
required_human_review: true
proposal_only: true
is_production_state: false
```

## Allowed recommendation Values

- `pass_for_human_review`
- `needs_revision`
- `block`
- `archive`

## Review Checklist

- [ ] Report states what was checked without implying automatic execution.
- [ ] Protected path and high-risk operation findings are visible.
- [ ] Restricted content is absent or flagged for human review.
- [ ] Recommendation is limited to human review, revision, block, or archive.
- [ ] No scheduler, worker, runtime, external API call, DB write, migration,
      deploy, PR creation, merge, or file-writing automation is requested.

# Weekly Review Template

週次で契約レイヤー、Task Board、Handoff、品質、繰り返す blocker を振り返る
ための proposal-only review テンプレートです。この template は scheduler や
worker runtime を追加しません。

## Review Fields

```yaml
review_id: "<weekly-review-id>"
review_version: 1
week_start: "<YYYY-MM-DD>"
week_end: "<YYYY-MM-DD>"
reviewer_role: "<ai_worker | codexapp | human_reviewer>"
human_owner: "<human reviewer or owner>"
completed_task_cards:
  - "<task-card-id>"
archived_task_cards:
  - "<task-card-id>"
blocked_task_cards:
  - "<task-card-id and blocker summary>"
repeated_blockers:
  - "<blocker pattern repeated across records>"
quality_findings:
  - "<quality finding for human review>"
contract_boundary_findings:
  - "<proposal-only, human approval, protected path, or autonomy finding>"
knowledge_or_docs_updates_needed:
  - "<doc or knowledge update proposal>"
stale_handoffs:
  - "<handoff-id and stale reason>"
silent_failure_candidates:
  - "<candidate requiring silent failure audit>"
decisions_needed_from_human:
  - "<human decision needed>"
next_week_focus:
  - "<proposal-only focus for next week>"
residual_risks:
  - "<risk remaining after review>"
recommendation: "continue"
required_human_review: true
proposal_only: true
is_production_state: false
```

## Allowed recommendation Values

- `continue`
- `revise_routines`
- `update_docs`
- `block_until_human_review`

## Review Checklist

- [ ] Findings are tied to TaskCard, Handoff, QA Report, or contract references.
- [ ] Recommendations remain proposal-only.
- [ ] Any doc update remains a proposal until human review.
- [ ] No runtime, worker, scheduler, API, DB, migration, dependency, CI,
      automation, external integration, or production change is requested.
- [ ] Human decisions needed are explicit.

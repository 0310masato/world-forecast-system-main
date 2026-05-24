# Weekly Review Example

This is a safe filled example for
`docs/templates/WEEKLY_REVIEW_TEMPLATE.md`.

It is not a real operations log, not proof that the sampled TaskCards or
handoffs exist, and not permission to revise routines automatically. It
contains no secrets, raw local paths, NAS paths, private network details,
production logs, runtime instructions, API changes, DB changes, scheduler work,
worker runtime, Codex App Server runtime, external API integration, GitHub
automation, PR creation, or file-writing automation.

## Example Review Record

```yaml
review_id: "example-weekly-review-001"
review_version: 1
week_start: "2026-05-18"
week_end: "2026-05-24"
reviewer_role: "qa_reviewer"
human_owner: "human-owner"
completed_task_cards:
  - "sample-task-card-context-pack-001"
  - "sample-task-card-doc-review-002"
archived_task_cards:
  - "sample-task-card-duplicate-note-003"
blocked_task_cards:
  - "sample-task-card-runtime-boundary-004: blocked because it asks whether runtime design can start without user-provided materials."
repeated_blockers:
  - "Several sample records omit a source contract reference before asking for a docs revision."
quality_findings:
  - "Sample handoffs are concise and artifact-like, but two records need clearer residual risk wording."
contract_boundary_findings:
  - "No production write, API update, DB migration, runtime, scheduler, worker, or automation step is allowed by this review."
knowledge_or_docs_updates_needed:
  - "Proposal-only candidate: a human reviewer may decide whether routine examples should be referenced from docs/CONTRACTS_INDEX.md."
stale_handoffs:
  - "sample-handoff-doc-review-002: stale candidate because the sample review date is outside the intended weekly window."
silent_failure_candidates:
  - "sample-task-card-fast-close-005: candidate only; completion looks suspiciously fast and needs human review."
decisions_needed_from_human:
  - "Decide whether the stale handoff should be revised, archived, or kept for another review cycle."
  - "Decide whether repeated missing source references require routine instruction revisions."
next_week_focus:
  - "Keep routine reports proposal-only and improve source-chain clarity before any later human-reviewed docs update."
residual_risks:
  - "The weekly review may miss stale records that were not sampled."
  - "A docs update candidate remains only a proposal until human review accepts a separate docs-only change."
recommendation: "continue"
required_human_review: true
proposal_only: true
is_production_state: false
```

## Safe Use Notes

- Use this as a weekly review writing sample, not as a current audit result.
- Do not automatically revise docs, routines, TaskCards, handoffs, or QA
  reports based on this example.
- If a real weekly review proposes docs updates, keep them proposal-only until
  a human accepts a separate docs-only scope.
- Do not add runtime, worker, scheduler, Codex App Server runtime, API, DB,
  external integration, GitHub automation, PR creation, merge, deploy, or
  file-writing automation from this example.

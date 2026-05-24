# Doc Stewardship Review Template

単一の doc または template を Knowledge / Docs Stewardship v0 に沿って確認する
ための proposal-only review テンプレートです。この template は docs の自動更新、
runtime、worker、scheduler、Codex App Server runtime、API、DB、external
integration、GitHub automation、file-writing automation を追加しません。

## Review Fields

```yaml
review_id: "<doc-stewardship-review-id>"
review_version: 1
reviewed_doc: "<docs/path-or-template-path>"
reviewed_doc_category: "<contract_docs | operations_docs | template_docs | runtime_boundary_docs | legacy_planning_docs>"
reviewer_role: "<knowledge_steward | codexapp | ai_worker | human_reviewer>"
reviewed_at: "<YYYY-MM-DD or review timestamp>"
source_of_truth_check:
  result: "<pass | revise | block>"
  notes: "<Does the doc point to and preserve the source contract?>"
freshness_check:
  result: "<pass | revise | block>"
  notes: "<Are PR, commit, model, tool, runtime, or policy assumptions current enough for review?>"
duplication_check:
  result: "<pass | revise | block>"
  notes: "<Does the doc avoid copying large overlapping definitions instead of linking to the source of truth?>"
conflict_check:
  result: "<pass | revise | block>"
  notes: "<Does the doc avoid contradicting source contract docs?>"
runtime_boundary_check:
  result: "<pass | revise | block>"
  notes: "<Does the doc avoid implying runtime, worker, scheduler, Codex App Server runtime, API, DB, automation, or production apply?>"
restricted_content_check:
  result: "<pass | revise | block>"
  notes: "<Are secrets, .env values, raw local paths, NAS paths, private network details, and unnecessary private data absent?>"
template_alignment_check:
  result: "<pass | revise | block | not_applicable>"
  notes: "<If this is a template, do allowed values and forbidden operations match the contract docs?>"
links_and_references_check:
  result: "<pass | revise | block>"
  notes: "<Are doc names, template names, internal references, PR references, and source-chain links valid?>"
required_updates:
  - "<proposal-only update needed or none>"
residual_risks:
  - "<risk remaining after review or none>"
recommendation: "keep"
required_human_review: true
proposal_only: true
is_production_state: false
```

## Allowed recommendation Values

- `keep`
- `revise`
- `deprecate`
- `archive`
- `escalate_to_human`

## Review Checklist

- [ ] Reviewed doc category matches `docs/KNOWLEDGE_DOCS_STEWARDSHIP.md`.
- [ ] Source-of-truth relationship is explicit.
- [ ] Freshness, duplication, conflict, runtime boundary, restricted content,
      template alignment, and references are checked.
- [ ] Required updates are proposal-only and require human review.
- [ ] Recommendation does not authorize PR creation, merge, deploy, API update,
      DB migration, external integration, file-writing automation, runtime, or
      production apply.

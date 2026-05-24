# Doc Link And Reference Audit Template

docs/templates のリンク、名前、source chain、index 参照を確認するための
proposal-only audit テンプレートです。この template は docs の自動更新、
runtime、worker、scheduler、Codex App Server runtime、API、DB、external
integration、GitHub automation、file-writing automation を追加しません。

## Audit Fields

```yaml
audit_id: "<doc-link-reference-audit-id>"
audit_version: 1
audited_docs:
  - "<docs/path-or-template-path>"
missing_links:
  - "<expected link target or none>"
broken_internal_references:
  - "<broken doc, section, or template reference or none>"
inconsistent_doc_names:
  - "<inconsistent doc name or none>"
missing_template_references:
  - "<template reference that should be added or none>"
missing_contracts_index_reference:
  - "<doc that should point to docs/CONTRACTS_INDEX.md or none>"
outdated_pr_references:
  - "<PR reference requiring review or none>"
source_chain_reference_gaps:
  - "<missing source-chain relationship or none>"
recommended_fixes:
  - "<proposal-only fix for human review or none>"
human_review_required: true
recommendation: "no_action"
proposal_only: true
is_production_state: false
```

## Allowed recommendation Values

- `no_action`
- `revise_links`
- `update_index`
- `escalate_to_human`

## Audit Checklist

- [ ] Audited docs are listed explicitly.
- [ ] Missing links and broken internal references are separated.
- [ ] Doc names and template names match actual files.
- [ ] `docs/CONTRACTS_INDEX.md` is referenced when useful.
- [ ] Source-chain gaps are flagged for human review.
- [ ] Recommended fixes remain proposal-only and do not authorize automated
      file writing, PR creation, merge, deploy, API update, DB migration,
      external integration, runtime, or production apply.

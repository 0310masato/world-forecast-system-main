# Doc Staleness Audit Example

This is a safe filled example for
`docs/templates/DOC_STALENESS_AUDIT_TEMPLATE.md`.

It is not a real operations log, not a current staleness finding, and not
permission to update docs automatically. It contains no secrets, raw local
paths, NAS paths, private network details, production logs, runtime
instructions, API changes, DB changes, scheduler work, external API
integration, GitHub automation, or file-writing automation.

## Example Audit Record

```yaml
audit_id: "example-doc-staleness-audit-001"
audit_version: 1
audit_period: "2026-05-18/2026-05-24"
auditor_role: "knowledge_steward"
sampled_docs:
  - "docs/CONTRACTS_INDEX.md"
  - "docs/KNOWLEDGE_DOCS_STEWARDSHIP.md"
  - "docs/CODEX_APP_SERVER.md"
stale_candidates:
  - "docs/CODEX_APP_SERVER.md: candidate only. If future user-provided materials change the Codex App Server premise, a human reviewer should decide whether the doc needs a separate docs-only revision."
outdated_commit_references:
  - "none observed in this example"
superseded_policy_references:
  - "none observed in this example"
stale_runtime_assumptions:
  - "none observed in this example. Runtime design and implementation remain out of scope."
stale_model_or_tool_assumptions:
  - "none observed in this example"
stale_codex_app_server_assumptions:
  - "docs/CODEX_APP_SERVER.md: candidate only. Codex App Server runtime design must wait for user-provided materials and a separate human-reviewed PR; this audit does not start design or implementation."
review_due_candidates:
  - "docs/CONTRACTS_INDEX.md: candidate for periodic review after new docs/templates are added."
  - "docs/KNOWLEDGE_DOCS_STEWARDSHIP.md: candidate for periodic review after stewardship templates or examples change."
recommended_updates:
  - "Proposal-only candidate: human reviewer may decide whether the sampled docs need updated cross-references after additional docs/templates are accepted."
human_review_required: true
recommendation: "revise_docs"
proposal_only: true
is_production_state: false
```

## Safe Use Notes

- Record uncertain items as candidates, not final facts.
- Do not treat a candidate as permission to revise docs automatically.
- Codex App Server runtime remains blocked until user-provided materials,
  scope, tests, rollback plan, and human approval are handled in a separate
  PR.
- Do not add runtime, worker, scheduler, Codex App Server runtime, API, DB,
  external integration, GitHub automation, file-writing automation, deploy,
  merge, or production apply steps from this example.

# Doc Staleness Audit Template

複数 docs/templates の古い前提、古い参照、review due 候補を確認するための
proposal-only audit テンプレートです。この template は docs の自動更新、
runtime、worker、scheduler、Codex App Server runtime、API、DB、external
integration、GitHub automation、file-writing automation を追加しません。

## Audit Fields

```yaml
audit_id: "<doc-staleness-audit-id>"
audit_version: 1
audit_period: "<YYYY-MM-DD/YYYY-MM-DD>"
auditor_role: "<knowledge_steward | codexapp | ai_worker | human_reviewer>"
sampled_docs:
  - "<docs/path-or-template-path>"
stale_candidates:
  - "<doc path and stale reason or none>"
outdated_commit_references:
  - "<commit or PR reference requiring review or none>"
superseded_policy_references:
  - "<policy reference that may be superseded or none>"
stale_runtime_assumptions:
  - "<runtime assumption requiring review or none>"
stale_model_or_tool_assumptions:
  - "<model or tool assumption requiring review or none>"
stale_codex_app_server_assumptions:
  - "<Codex App Server assumption requiring review or none>"
review_due_candidates:
  - "<doc path and review cadence reason or none>"
recommended_updates:
  - "<proposal-only update for human review or none>"
human_review_required: true
recommendation: "no_action"
proposal_only: true
is_production_state: false
```

## Allowed recommendation Values

- `no_action`
- `revise_docs`
- `update_index`
- `archive_or_deprecate`
- `escalate_to_human`

## Audit Checklist

- [ ] Sampled docs are listed explicitly.
- [ ] Stale candidates separate old facts from unsupported assumptions.
- [ ] Commit, PR, policy, model, tool, and Codex App Server assumptions are
      checked when present.
- [ ] Recommended updates remain proposal-only and require human review.
- [ ] Recommendation does not authorize docs auto-update, runtime, worker,
      scheduler, API update, DB migration, external integration, GitHub
      automation, file-writing automation, deploy, merge, or production apply.

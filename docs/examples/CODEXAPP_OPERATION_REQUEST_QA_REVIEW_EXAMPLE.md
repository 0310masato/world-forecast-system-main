# CodexApp Operation Request QA Review Example

This is a safe filled example for
`docs/templates/CODEXAPP_OPERATION_REQUEST_TEMPLATE.md`.

It is not a real QA run, not proof that the sampled TaskCard, handoff, or QA
report exists, and not permission to execute work. This request example shows
how to ask CodexApp to prepare QA review notes for human review only. It
contains no secrets, raw local paths, NAS paths, private network details,
production logs, real operational data, runtime instructions, API changes, DB
changes, migrations, scheduler work, worker runtime, Codex App Server runtime,
external API integration, GitHub automation, PR creation, merge, deploy,
external publishing, or file-writing automation.

## Example Operation Request

```yaml
request_id: "sample-codexapp-operation-request-qa-review-001"
request_version: 1
target_contract: "Agent Charter / Operations Runbook v0"
source_task_id: "sample-task-card-draft-instructions-001"
source_handoff_id: "sample-handoff-draft-instructions-001"
source_proposal_id: "sample-implementation-proposal-docs-only-001"
source_decision_id: "sample-human-review-decision-docs-only-001"
context_pack_id: "sample-context-pack-docs-only-001"
requested_role: "qa_reviewer"
autonomy_level: "A1_draft_only"
allowed_next_step: "human_review_only"
human_owner: "human-owner"
language: "ja-JP"
objective: "TaskCard、Handoff、Task Board QA Report example の整合性を確認し、人間レビュー用の QA notes を作成する。QA recommendation は自動実行ではない。"
input_references:
  - "docs/CONTRACTS_INDEX.md"
  - "docs/AGENT_CHARTER_OPERATIONS_RUNBOOK.md"
  - "docs/TASK_BOARD_HANDOFF.md"
  - "docs/templates/CODEXAPP_OPERATION_REQUEST_TEMPLATE.md"
  - "docs/examples/TASK_CARD_EXAMPLE.md"
  - "docs/examples/HANDOFF_EXAMPLE.md"
  - "docs/examples/TASK_BOARD_QA_REPORT_EXAMPLE.md"
intended_outputs:
  - "proposal-only QA notes"
  - "scope_check"
  - "autonomy_level_check"
  - "protected_path_check"
  - "restricted_content_check"
  - "high_risk_operation_check"
  - "human_approval_check"
  - "open_questions"
  - "blockers"
  - "residual_risks"
  - "required_human_reviewed_next_action"
in_scope_files:
  - "docs/examples/TASK_CARD_EXAMPLE.md"
  - "docs/examples/HANDOFF_EXAMPLE.md"
  - "docs/examples/TASK_BOARD_QA_REPORT_EXAMPLE.md"
out_of_scope_files:
  - "app/api/forecast/route.ts"
  - "app/api/hormuz/route.ts"
  - "app/api/hormuz/news/route.ts"
  - "lib/db.ts"
  - "package-lock.json"
required_human_approval: true
proposal_only: true
is_production_state: false
forbidden_operations:
  - "production_write"
  - "api_forecast_update"
  - "api_hormuz_update"
  - "api_hormuz_news_update"
  - "db_write"
  - "db_migration"
  - "direct_deploy"
  - "worker_runtime"
  - "scheduler_runtime"
  - "codex_app_server_runtime"
  - "external_api_integration"
  - "create_github_issue"
  - "create_pr"
  - "merge_pr"
  - "file_writing_automation"
  - "external_publish"
  - "automated_trading"
  - "investment_advice"
  - "navigation_guidance"
  - "military_guidance"
restricted_content_must_be_absent:
  - "secrets"
  - ".env values"
  - "raw local paths"
  - "NAS paths"
  - "private network details"
  - "production logs"
  - "real operational data"
```

## CodexApp への日本語指示

次の範囲だけを実施してください。

- `docs/examples/TASK_CARD_EXAMPLE.md`、
  `docs/examples/HANDOFF_EXAMPLE.md`、
  `docs/examples/TASK_BOARD_QA_REPORT_EXAMPLE.md` の整合性を確認し、人間レビュー用
  QA notes を作成する。
- QA notes は proposal-only の review material であり、実行結果や自動承認では
  ないと明記する。
- `recommendation: "approve_for_human_review"` と書く場合でも、それは人間レビュー
  に回せるという意味だけであり、PR 作成、merge、deploy、API 更新、DB 変更、
  runtime 追加、automation の許可ではないと明記する。
- 不明点がある場合は `allowed_next_step: "human_review_only"` に戻し、推測で
  `prepare_draft_pr_instructions_only` や実行に進まない。
- API、DB、runtime、worker、scheduler、Codex App Server runtime、external
  integration、GitHub automation、file-writing automation には進まない。

## Required Output の記入例

```markdown
## 要約

- この QA review request は、TaskCard / Handoff / QA Report example の整合性を
  人間レビュー用に確認する proposal-only sample です。
- QA notes は自動実行結果ではなく、PR 作成、merge、deploy、API 更新、DB 変更、
  runtime 追加、automation を許可しません。

## QA Checks

scope_check:
  result: "pass"
  notes: "The sampled records stay within docs-only, proposal-only example scope."

autonomy_level_check:
  result: "pass"
  notes: "The sampled TaskCard uses A2_prepare_for_approval and this QA request uses A1_draft_only."

protected_path_check:
  result: "pass"
  notes: "Protected paths are listed only as out_of_scope_files or forbidden examples, not intended files."

restricted_content_check:
  result: "pass"
  notes: "No secrets, .env values, raw local paths, NAS paths, private network details, production logs, or real operational data are present."

high_risk_operation_check:
  result: "pass"
  notes: "No create_pr, merge_pr, deploy, API update, DB migration, runtime addition, external integration, publishing, or automation is recommended."

human_approval_check:
  result: "pass"
  notes: "Human approval remains review permission only."

## Open Questions

- Should a human reviewer revise any sample wording that could make
  `approve_for_human_review` sound like execution permission?

## Blockers

- If any protected path, restricted content, or high-risk operation appears in
  a real request, stop and return to human_review_only.

## Residual Risks

- A reader may misread a positive QA recommendation as permission to proceed
  automatically unless the review-only boundary remains visible.

## Required Human-Reviewed Next Action

human_review_only
```

## 完了条件

- QA notes が日本語であり、contract fields と enum values が保持されている。
- `scope_check`、`autonomy_level_check`、`protected_path_check`、
  `restricted_content_check`、`high_risk_operation_check`、
  `human_approval_check` が含まれている。
- `open_questions`、`blockers`、`residual_risks`、
  `required_human_reviewed_next_action` が含まれている。
- `proposal_only: true`、`required_human_approval: true`、
  `is_production_state: false` が維持されている。
- QA recommendation が自動実行ではないと明記されている。
- 不明点があれば `human_review_only` に戻すと明記されている。
- PR creation、merge、deploy、API update、DB write、DB migration、runtime
  addition、external integration、file-writing automation、production promotion を
  許可していない。

## Safe Use Notes

- Use this as a CodexApp QA request writing sample, not as a real QA result or
  execution instruction.
- `allowed_next_step: "human_review_only"` means the output must return to a
  human reviewer. It does not permit `create_pr`, `merge_pr`, deploy, API
  update, DB write, DB migration, runtime addition, external integration,
  publishing, or automation.
- A real QA request must use sanitized references and omit secrets, raw local
  paths, NAS paths, private network details, production logs, and real
  operational data.

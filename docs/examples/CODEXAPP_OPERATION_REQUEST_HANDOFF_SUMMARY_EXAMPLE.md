# CodexApp Operation Request Handoff Summary Example

This is a safe filled example for
`docs/templates/CODEXAPP_OPERATION_REQUEST_TEMPLATE.md`.

It is not a real handoff summary, not proof that the sampled handoff exists,
and not permission to execute work. This request example shows how to ask
CodexApp to summarize a handoff as a durable artifact for human review only.
It contains no secrets, raw local paths, NAS paths, private network details,
production logs, real operational data, runtime instructions, API changes, DB
changes, migrations, scheduler work, worker runtime, Codex App Server runtime,
external API integration, GitHub automation, PR creation, merge, deploy,
external publishing, or file-writing automation.

## Example Operation Request

```yaml
request_id: "sample-codexapp-operation-request-handoff-summary-001"
request_version: 1
target_contract: "Agent Charter / Operations Runbook v0"
source_task_id: "sample-task-card-draft-instructions-001"
source_handoff_id: "sample-handoff-draft-instructions-001"
source_proposal_id: "sample-implementation-proposal-docs-only-001"
source_decision_id: "sample-human-review-decision-docs-only-001"
context_pack_id: "sample-context-pack-docs-only-001"
requested_role: "handoff_summarizer"
autonomy_level: "A1_draft_only"
allowed_next_step: "human_review_only"
human_owner: "human-owner"
language: "ja-JP"
objective: "source_handoff を会話ログではなく durable artifact として要約し、人間レビュー用に open questions、blockers、residual risks、required next action を整理する。"
input_references:
  - "docs/CONTRACTS_INDEX.md"
  - "docs/AGENT_CHARTER_OPERATIONS_RUNBOOK.md"
  - "docs/TASK_BOARD_HANDOFF.md"
  - "docs/templates/CODEXAPP_OPERATION_REQUEST_TEMPLATE.md"
  - "docs/examples/HANDOFF_EXAMPLE.md"
  - "docs/examples/TASK_CARD_EXAMPLE.md"
intended_outputs:
  - "handoff summary"
  - "what_has_been_done"
  - "key_findings"
  - "decisions_made"
  - "open_questions"
  - "blockers"
  - "required_next_action"
  - "residual_risks"
  - "references"
  - "required_human_reviewed_next_action"
in_scope_files:
  - "docs/examples/HANDOFF_EXAMPLE.md"
  - "docs/examples/sample-handoff-summary.md"
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

- `source_handoff_id` の内容を、会話ログや transcript ではなく durable artifact と
  して要約する。
- `what_has_been_done`、`key_findings`、`decisions_made`、`open_questions`、
  `blockers`、`required_next_action`、`residual_risks`、`references` を人間レビュー
  用に整理する。
- source handoff の内容を要約するだけで、TaskCard、Handoff、QA Report、routine
  report の状態を更新しない。
- blocker があっても自動解消せず、`human_review_only` に戻す。
- Handoff summary は実行命令ではなく、人間レビュー用の整理であると明記する。
- PR 作成、merge、deploy、API 更新、DB 書き込み、DB migration、runtime 追加、
  worker、scheduler、Codex App Server runtime、external integration、GitHub
  automation、file-writing automation、production 昇格には進まない。

## Required Output の記入例

```markdown
## 要約

- この handoff summary request は、sample handoff を durable artifact として整理する
  proposal-only sample です。
- Handoff summary は人間レビュー用の整理であり、状態更新や実行命令では
  ありません。

## Handoff Summary

what_has_been_done:
  - "Sample TaskCard と sample Handoff の proposal-only boundary が整理されている。"
  - "Docs-only sample references が使われ、protected path は out-of-scope として扱われている。"

key_findings:
  - "allowed_next_step は human_review_only に限定されている。"
  - "No PR creation, merge, deploy, API update, DB migration, runtime addition, external integration, or automation is authorized."

decisions_made:
  - "この summary は source handoff の要約であり、record state を更新しない。"

open_questions:
  - "Human reviewer は、次に draft instructions を作るか、sample wording を修正するか、archive するか判断する必要がある。"

blockers:
  - "実在の source data、restricted content、protected path が必要になる場合は停止する。"

required_next_action:
  - "human_review_only"

residual_risks:
  - "Summary が実行準備完了と誤読される可能性があるため、review-only boundary を維持する。"

references:
  - "docs/TASK_BOARD_HANDOFF.md"
  - "docs/templates/CODEXAPP_OPERATION_REQUEST_TEMPLATE.md"
  - "sample-handoff-draft-instructions-001"

## Required Human-Reviewed Next Action

human_review_only
```

## 完了条件

- Handoff summary が日本語であり、contract fields と enum values が保持されている。
- Handoff が会話ログではなく durable artifact として要約されている。
- `what_has_been_done`、`key_findings`、`decisions_made`、`open_questions`、
  `blockers`、`required_next_action`、`residual_risks`、`references`、
  `required_human_reviewed_next_action` が含まれている。
- source handoff の内容を要約するだけで、状態更新していない。
- blocker 解消を自動実行していない。
- `proposal_only: true`、`required_human_approval: true`、
  `is_production_state: false` が維持されている。
- PR creation、merge、deploy、API update、DB write、DB migration、runtime
  addition、external integration、file-writing automation、production promotion を
  許可していない。

## Safe Use Notes

- Use this as a CodexApp handoff-summary request writing sample, not as a live
  handoff, state update, or execution instruction.
- `allowed_next_step: "human_review_only"` means a human reviewer must decide
  what happens next. It does not permit `create_pr`, `merge_pr`, deploy, API
  update, DB write, DB migration, runtime addition, external integration,
  publishing, or automation.
- A real handoff summary request must use sanitized references and omit
  secrets, raw local paths, NAS paths, private network details, production
  logs, and real operational data.

# CodexApp Operation Request Template

このテンプレートは、CodexApp または AI worker に proposal-only のレビュー補助
を依頼するときに使います。指示文は日本語で書き、契約フィールド名と既存の
enum 値は英語のまま保持します。

このテンプレートは実行命令ではありません。PR 作成、merge、deploy、API 更新、
DB 書き込み、migration、runtime 追加、worker 実行、scheduler 実行、外部 API
連携、外部公開、production 昇格を許可しません。

## Request Fields

```yaml
request_id: "<codexapp-operation-request-id>"
request_version: 1
target_contract: "Agent Charter / Operations Runbook v0"
source_task_id: "<task-card-id or none>"
source_handoff_id: "<handoff-id or none>"
source_proposal_id: "<implementation-proposal-id or none>"
source_decision_id: "<human-review-decision-id or none>"
context_pack_id: "<context-pack-id or none>"
requested_role: "<reviewer | drafter | handoff_summarizer | qa_reviewer>"
autonomy_level: "A1_draft_only"
allowed_next_step: "human_review_only"
human_owner: "<human reviewer or owner>"
language: "ja-JP"
objective: "<人間レビュー用に何を整理するか>"
input_references:
  - "<sanitized reference>"
intended_outputs:
  - "日本語 draft instructions"
  - "proposal-only QA notes"
in_scope_files:
  - "docs/example.md"
out_of_scope_files:
  - "app/api/forecast/route.ts"
  - "app/api/hormuz/route.ts"
  - "app/api/hormuz/news/route.ts"
  - "lib/db.ts"
required_human_approval: true
proposal_only: true
is_production_state: false
forbidden_operations:
  - "production_write"
  - "api_forecast_update"
  - "api_hormuz_update"
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
```

## CodexApp への指示

次の範囲だけを実施してください。

- 入力された TaskCard、Handoff、proposal、decision、context pack reference の
  整合性を確認する。
- `proposal_only`、`required_human_approval`、`is_production_state: false`、
  `allowed_next_step`、`forbidden_operations` が維持されているか確認する。
- 人間レビュー用の日本語 draft instructions を作成する。
- 不足情報、open question、blocker、residual risk を箇条書きで整理する。
- 次の action は human review、draft instructions 作成、TaskCard 修正、archive
  のいずれかに限定する。

## やってはいけないこと

次の操作は行わないでください。

- PR を作成する。
- GitHub Issue を自動作成する。
- merge、deploy、production 昇格を行う。
- `/api/forecast`、`/api/hormuz`、DB、migration、runtime、worker、scheduler、
  dependency、external integration の変更を提案範囲に含める。
- file-writing automation を前提にする。
- 秘密情報、`.env` 値、raw local path、NAS path、private network details を
  出力する。
- 投資助言、航行判断、軍事判断、自動売買、外部公開を勧める。

## Required Output

```markdown
## 要約

- <proposal-only の目的>

## 契約チェック

- source chain: <pass | revise | block>
- autonomy level: <pass | revise | block>
- allowed next step: <pass | revise | block>
- forbidden operations: <pass | revise | block>
- protected path: <pass | revise | block>
- restricted content: <pass | revise | block>

## 日本語 draft instructions

<CodexApp または次の reviewer に渡す日本語の指示。実行命令ではなく、
人間レビュー用の下書きであることを明記する。>

## Open Questions

- <人間確認が必要なこと>

## Blockers

- <停止条件または不足情報>

## Residual Risks

- <残るリスク>

## Required Human-Reviewed Next Action

<human_review_only | prepare_draft_pr_instructions_only | revise_task_card_only | archive_only>
```

## 完了条件

- 指示書が日本語である。
- 契約フィールドと enum 値が保持されている。
- proposal-only と human approval required が明示されている。
- forbidden operations が省略されていない。
- protected path と restricted content が含まれていない。
- 実行、PR 作成、merge、deploy、API 更新、DB 変更、runtime 追加、外部連携を
  求めていない。

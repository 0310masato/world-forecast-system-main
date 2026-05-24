# CodexApp Operation Request Draft Instructions Example

This is a safe filled example for
`docs/templates/CODEXAPP_OPERATION_REQUEST_TEMPLATE.md`.

It is not a real operations log, not proof that the sampled TaskCard or
handoff exists, and not permission to execute work. This request example shows
how to ask CodexApp to prepare Japanese draft instructions for human review
only. It contains no secrets, raw local paths, NAS paths, private network
details, production logs, real operational data, runtime instructions, API
changes, DB changes, migrations, scheduler work, worker runtime, Codex App
Server runtime, external API integration, GitHub automation, PR creation,
merge, deploy, external publishing, or file-writing automation.

## Example Operation Request

```yaml
request_id: "sample-codexapp-operation-request-draft-instructions-001"
request_version: 1
target_contract: "Agent Charter / Operations Runbook v0"
source_task_id: "sample-task-card-draft-instructions-001"
source_handoff_id: "sample-handoff-draft-instructions-001"
source_proposal_id: "sample-implementation-proposal-docs-only-001"
source_decision_id: "sample-human-review-decision-docs-only-001"
context_pack_id: "sample-context-pack-docs-only-001"
requested_role: "drafter"
autonomy_level: "A2_prepare_for_approval"
allowed_next_step: "prepare_draft_pr_instructions_only"
human_owner: "human-owner"
language: "ja-JP"
objective: "docs-only の安全な記入例をもとに、人間レビュー用の日本語 draft instructions を作成する。draft instructions は実行命令ではなく、後続の人間レビュー材料に限定する。"
input_references:
  - "docs/CONTRACTS_INDEX.md"
  - "docs/AGENT_CHARTER_OPERATIONS_RUNBOOK.md"
  - "docs/templates/CODEXAPP_OPERATION_REQUEST_TEMPLATE.md"
  - "docs/TASK_BOARD_HANDOFF.md"
  - "docs/examples/TASK_CARD_EXAMPLE.md"
  - "docs/examples/HANDOFF_EXAMPLE.md"
intended_outputs:
  - "日本語 draft instructions"
  - "Required Output の記入例"
  - "完了条件のチェックリスト"
in_scope_files:
  - "docs/examples/sample-codexapp-draft-instructions.md"
  - "docs/examples/sample-codexapp-required-output.md"
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

- `docs/CONTRACTS_INDEX.md` と
  `docs/templates/CODEXAPP_OPERATION_REQUEST_TEMPLATE.md` を確認し、正本契約と
  template の境界に沿っているか確認する。
- `source_task_id`、`source_handoff_id`、`source_proposal_id`、
  `source_decision_id`、`context_pack_id` は sanitized sample ID として扱い、実在
  の operational record として扱わない。
- 人間レビュー用の日本語 draft instructions を作成する。契約フィールド名、
  enum 値、ID、ファイル名、コード識別子は英語のまま保持する。
- draft instructions は実行命令ではなく、レビュー材料であることを明記する。
- `proposal_only: true`、`required_human_approval: true`、
  `is_production_state: false` を維持する。
- `allowed_next_step` は `prepare_draft_pr_instructions_only` に限定する。
- 不足情報、open question、blocker、residual risk があれば、人間レビュー用に
  分けて整理する。
- PR 作成、merge、deploy、API 更新、DB 書き込み、DB migration、runtime 追加、
  worker、scheduler、Codex App Server runtime、external integration、GitHub
  automation、file-writing automation、production 昇格には進まない。

## Required Output の記入例

```markdown
## 要約

- この request は、日本語 draft instructions を人間レビュー用に作成するための
  proposal-only sample です。
- draft instructions は実行命令ではなく、PR 作成、merge、deploy、API 更新、
  DB 変更、runtime 追加、automation を許可しません。

## 契約チェック

- source chain: pass
- autonomy level: pass
- allowed next step: pass
- forbidden operations: pass
- protected path: pass
- restricted content: pass

## 日本語 draft instructions

CodexApp は、sample TaskCard と sample Handoff の sanitized references をもとに、
人間レビュー用の draft instructions を日本語で作成してください。契約
フィールド名、enum 値、ID、ファイル名、コード識別子は英語のまま保持して
ください。この draft はレビュー材料であり、実行命令ではありません。

`in_scope_files` は docs-only sample path に限定してください。`out_of_scope_files`
に含まれる protected path、package file、API、DB、runtime、worker、scheduler、
external integration、automation には触れないでください。

## Open Questions

- 人間 reviewer は、この draft instructions の粒度で十分か確認する必要がある。
- 後続の dedicated PR が必要な場合でも、この request からは実行に進まない。

## Blockers

- 実在の source record、production log、秘密情報、raw local path、NAS path、
  private network details が必要になる場合は停止する。

## Residual Risks

- `A2_prepare_for_approval` が実行許可と誤読される可能性があるため、review-only
  境界を維持する必要がある。

## Required Human-Reviewed Next Action

prepare_draft_pr_instructions_only
```

## 完了条件

- 指示文が日本語である。
- contract fields、enum values、IDs、file names、code identifiers が英語のまま
  保持されている。
- draft instructions が人間レビュー用であり、実行命令ではないと明記されている。
- `proposal_only: true`、`required_human_approval: true`、
  `is_production_state: false` が維持されている。
- `in_scope_files` が docs-only sample path に限定されている。
- protected path、package file、API、DB、runtime、worker、scheduler、external
  integration、automation が out-of-scope として明示されている。
- secrets、`.env` values、raw local paths、NAS paths、private network details、
  production logs、real operational data が含まれていない。
- PR creation、merge、deploy、API update、DB write、DB migration、runtime
  addition、external integration、file-writing automation、production promotion を
  許可していない。

## Safe Use Notes

- Use this as a CodexApp request writing sample, not as a live request or
  execution instruction.
- `allowed_next_step: "prepare_draft_pr_instructions_only"` means prepare
  review material only. It does not permit `create_pr`, `merge_pr`, deploy,
  API update, DB write, DB migration, runtime addition, external integration,
  publishing, or automation.
- A real request must use sanitized references and omit secrets, raw local
  paths, NAS paths, private network details, production logs, and real
  operational data.

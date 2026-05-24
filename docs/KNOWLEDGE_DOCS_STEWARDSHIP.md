# Knowledge / Docs Stewardship v0

## 目的

Knowledge / Docs Stewardship v0 は、増えてきた `docs/` と
`docs/templates/` を人間レビュー前提で点検し、正本性、鮮度、重複、リンク、
runtime 境界を確認するための運用チェックリストです。

契約・運用 docs の入口は `docs/CONTRACTS_INDEX.md` です。この Stewardship は、
index を置き換えません。index は正本地図、Stewardship は品質管理と鮮度確認の
review layer です。

この文書は自動更新機構ではありません。runtime、worker、scheduler、Codex App
Server runtime、外部 API 連携、DB migration、`/api` 接続、GitHub Issue/PR
自動化、file-writing automation、AI job 実行処理、production 昇格を追加、
要求、または許可しません。

## Docs と Templates の正本管理方針

- 作業開始時は `docs/CONTRACTS_INDEX.md` を読み、対象 doc の位置づけと前後関係
  を確認する。
- 契約値、allowed values、forbidden operations、protected path boundary は、
  source contract docs を正本として扱う。
- 重複する説明が必要な場合は、長い再掲を避け、正本 doc へのリンクと短い要約に
  とどめる。
- template の enum、status、recommendation、forbidden steps は、対応する契約
  docs と一致させる。
- docs review の結果は proposal-only の修正案として扱い、人間レビューなしに
  docs、template、runtime、DB、API、automation へ適用しない。

## Docs 分類

| Category | Docs | Stewardship focus |
| --- | --- | --- |
| Contract Docs | `docs/CONTEXT_PACKS.md`, `docs/AI_ANALYSIS_JOBS.md`, `docs/HUMAN_APPROVAL.md`, `docs/TASK_BOARD_HANDOFF.md`, `docs/CONTRACTS_INDEX.md` | proposal-only、human approval、allowed values、forbidden operations、source chain |
| Operations Docs | `docs/AGENT_CHARTER_OPERATIONS_RUNBOOK.md`, `docs/OPERATIONS_ROUTINES.md` | CodexApp / AI worker の運用境界、A0-A2 autonomy、日本語指示書、停止条件 |
| Template Docs | `docs/templates/*.md` | field names、allowed recommendation values、required human review、template alignment |
| Example Docs | `docs/examples/*.md` | review / routine の書き方サンプル、proposal-only / human-review-only / non-production の維持、実運用ログとの分離 |
| Runtime Boundary Docs | `docs/CODEX_APP_SERVER.md`, `AGENTS.md` | runtime 未導入、protected core、Codex App Server sidecar boundary、禁止操作 |
| Legacy / Planning Docs | `docs/SELF_IMPROVEMENT_LOOP.md`, `docs/FORECAST_REFACTOR_PLAN.md`, `docs/context-pack-builder-v0-plan.md`, `docs/agent-architecture-v0.1.md`, `docs/current-system.md`, `docs/data-model-v0.1.md`, `docs/memory-layer-v0.1-db-design.md`, `docs/memory-layer-v0.1-migration-plan.md`, `docs/roadmap-world-pattern-memory.md`, `docs/safety-policy.md` | 旧計画、古い前提、契約 docs との競合、runtime boundary drift |

## 点検対象の定義

- stale docs: commit、PR、tool、model、policy、runtime 前提、review cadence が古く、
  現在の contract chain とずれている可能性がある doc。
- conflicting docs: source contract、allowed values、forbidden operations、
  human approval line、protected path boundary と矛盾する doc。
- duplicate docs: 同じ定義を複数箇所で長く再掲し、片方だけが更新される危険が
  ある doc。
- broken references: 存在しない doc、template、section、PR、source chain、
  template field を参照している状態。
- runtime boundary drift: docs/templates が runtime、worker、scheduler、Codex
  App Server runtime、API、DB、external integration、automation、production apply
  を暗黙に許可しているように読める状態。

## Knowledge Steward の責務

Knowledge Steward は、人間レビューを助けるために次を確認します。

- docs と templates が `docs/CONTRACTS_INDEX.md` の正本地図に沿っている。
- source contract と template の allowed values が一致している。
- stale、conflicting、duplicate、broken reference、runtime boundary drift の候補を
  明示する。
- 修正が必要な場合は、提案、根拠、残リスク、人間判断が必要な点を分けて書く。
- secrets、`.env` 値、raw local path、NAS path、private network details が docs
  に混入していないことを確認する。
- Codex App Server runtime 設計に進む場合は、ユーザー提供資料を受け取ってから
  別 PR で扱うよう停止する。

Knowledge Steward は、docs review の結果を根拠に実行、PR 作成、merge、deploy、
API update、DB migration、external integration、file-writing automation、
production apply を行いません。

## CodexApp Worker がやってよいこと

CodexApp Worker は、A0-A2 の範囲で次を行えます。

- `docs/CONTRACTS_INDEX.md` と対象 docs/templates を読み、正本関係を確認する。
- `docs/templates/DOC_STEWARDSHIP_REVIEW_TEMPLATE.md` を使って doc review の下書きを
  作る。
- `docs/templates/DOC_STALENESS_AUDIT_TEMPLATE.md` を使って stale candidate の下書き
  を作る。
- `docs/templates/DOC_LINK_AND_REFERENCE_AUDIT_TEMPLATE.md` を使って broken reference
  や naming inconsistency の下書きを作る。
- 人間レビュー用に、必要な docs 修正案、残リスク、open question を整理する。

## CodexApp Worker がやってはいけないこと

CodexApp Worker は、Stewardship を根拠に次を実行、要求、または自動化してはいけ
ません。

- runtime、worker、scheduler、Codex App Server runtime の追加
- `/api/forecast`、`/api/hormuz`、`/api/hormuz/news` の変更
- DB write、DB migration、schema change
- package dependency、package file、CI の変更
- external API integration
- GitHub Issue/PR 自動化、PR 作成、merge、deploy
- file-writing automation、AI job 実行処理
- production state への proposal data 昇格
- secrets、`.env` 値、raw local path、NAS path、private network details の出力

## 人間承認ライン

Stewardship review の recommendation は、人間レビュー用の提案です。

- `keep` は、現時点で大きな修正提案がないことを意味する。
- `revise` は、docs/template 修正案を人間が確認する必要があることを意味する。
- `deprecate` と `archive` は、正本から外す提案であり、自動削除ではない。
- `escalate_to_human` は、契約矛盾、runtime boundary drift、restricted content、
  または source chain 不明があるため人間判断に戻すことを意味する。

いずれの recommendation も、実行、PR 作成、merge、deploy、API update、DB
migration、external integration、file-writing automation、production apply の許可
ではありません。

## Docs 更新時のチェックリスト

- [ ] doc has clear purpose.
- [ ] doc has owner or reviewer role.
- [ ] doc has last reviewed / review cadence placeholder.
- [ ] doc points to `docs/CONTRACTS_INDEX.md` when useful.
- [ ] doc does not contradict source contract.
- [ ] doc does not imply runtime implementation.
- [ ] doc does not imply production apply.
- [ ] doc does not include secrets, `.env` values, raw local path, NAS path, or
      private network details.
- [ ] doc does not recommend PR creation, merge, deploy, API update, DB
      migration, external integration, GitHub automation, file-writing
      automation, or production promotion.
- [ ] doc avoids duplicate definitions where possible.
- [ ] doc links to source of truth instead of copying large overlapping
      sections.
- [ ] template allowed values match contract docs.
- [ ] forbidden operations are not weakened.
- [ ] Codex App Server runtime remains blocked until user-provided materials are
      available.

## 推奨テンプレート

- Use `docs/templates/DOC_STEWARDSHIP_REVIEW_TEMPLATE.md` for one-doc
  stewardship review.
- Use `docs/templates/DOC_STALENESS_AUDIT_TEMPLATE.md` for periodic freshness
  and stale-assumption audit.
- Use `docs/templates/DOC_LINK_AND_REFERENCE_AUDIT_TEMPLATE.md` for link,
  naming, source-chain, and index-reference audit.

These templates are proposal-only review records. They are not file-writing
automation and do not authorize runtime work.

## 記入例

Docs Stewardship と Operations Routine の記入例は `docs/examples/` に置きます。

- `docs/examples/DOC_STEWARDSHIP_REVIEW_EXAMPLE.md`
- `docs/examples/DOC_STALENESS_AUDIT_EXAMPLE.md`
- `docs/examples/DOC_LINK_AND_REFERENCE_AUDIT_EXAMPLE.md`
- `docs/examples/MORNING_STANDUP_EXAMPLE.md`
- `docs/examples/WEEKLY_REVIEW_EXAMPLE.md`
- `docs/examples/NIGHTLY_QA_REPORT_EXAMPLE.md`
- `docs/examples/BLOCKER_ESCALATION_EXAMPLE.md`
- `docs/examples/SILENT_FAILURE_AUDIT_EXAMPLE.md`

これらは review / routine の書き方サンプルであり、実運用ログではありません。
example reports は正本契約ではなく、正本は各 template と contract docs です。
example reports は docs 自動更新、file-writing automation、runtime、worker、
scheduler、Codex App Server runtime、API、DB、external integration、GitHub
automation、PR 作成、merge、deploy、production apply を許可しません。

実際の review 結果を残す場合も、secrets、`.env` 値、raw local path、NAS path、
private network details、production log、不要な private data を除外します。実際の
review record は proposal-only、人間レビュー前提、`is_production_state: false` を
維持します。

## Codex App Server runtime への停止条件

Codex App Server runtime 設計に進む場合は、この Stewardship では先に進みません。
ユーザー提供資料を受け取り、scope、検証方法、rollback plan、human approval gate
を定義した別 PR で扱います。

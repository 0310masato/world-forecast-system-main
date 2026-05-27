# Contract / Docs Index v0

## 目的

この index は、`world-forecast-system-main` の AI 分析、人間承認、
Task Board / Handoff、CodexApp 運用、routine report、Codex App Server
runtime intake に関する契約・運用 docs の全体地図です。

CodexApp、AI worker、human reviewer は、作業前にこの index で読む順番と
正本の所在を確認し、次に対象契約 docs と template を確認します。

この index は実行許可ではありません。runtime、worker、scheduler、Codex App
Server runtime、外部 API 連携、DB migration、`/api` 接続、GitHub
Issue/PR 自動化、file-writing automation、AI job 実行処理、production 昇格を
許可しません。

## 契約レイヤーの流れ

PR #12 から PR #35 までで整備された proposal-only の契約レイヤー、docs index、
template、example を順に読みます。Knowledge / Docs Stewardship v0 は
docs/templates の品質管理レイヤーとして読みます。Docs Stewardship Example
Reports v0 は、その品質管理レイヤーの記入例であり、Operations Routine Example
Reports v0 は PR #20 の routine templates の記入例です。Task Board / Handoff
Example Records v0 は PR #17 / #18 の TaskCard、Handoff、Task Board QA Report の
安全な記入例です。CodexApp Request Example Pack v0 は PR #19 の
`docs/templates/CODEXAPP_OPERATION_REQUEST_TEMPLATE.md` と
`docs/AGENT_CHARTER_OPERATIONS_RUNBOOK.md` に対応する日本語 request の記入例です。
AI Analysis Contract Example Records v0 は PR #12 から PR #16 の AI analysis
contract chain に対応する安全な記入例です。Examples Index / README v0 は
`docs/examples/README.md` に置かれ、PR #23-#34 の examples を category、正本対応、
読む順番、安全境界で案内します。
Codex App Server Runtime Intake Gate v0 は、runtime design PR に進む前に
ユーザー提供資料、scope、human approval、test plan、rollback / disable plan
を確認する intake contract と template です。
Codex App Server Runtime Design PR Readiness Review Template v0 は、
`ready_for_runtime_design_pr` 後、future runtime design PR instructions を
draft してよいかを人間レビューするための checklist / review report template
です。
Codex App Server Runtime Intake Example v0 は、その intake template の安全な
filled example であり、runtime 実装許可ではありません。
Runtime Intake Task Board / Handoff Examples v0 は、Runtime Intake の結果を
TaskCard と Handoff の human-review-only artifact に接続する安全な記入例です。
これらも runtime 実装、PR 作成、merge、deploy、production 昇格の許可では
ありません。
Runtime Intake Task Board QA Report Example v0 は、その bridge records を
human review 前に QA するための安全な記入例です。これも runtime 実装、
PR 作成、merge、deploy、worker/scheduler/API/DB/package/CI 変更、
file-writing automation、production 昇格の許可ではありません。
Codex App Server Runtime Design PR Readiness Review Example v0 は、
Runtime Design PR Readiness Review Template v0 に対応する sanitized filled
example であり、instruction-drafting readiness の記入例です。runtime design PR、
PR 作成、merge、deploy、runtime 実装、worker/scheduler/API/DB/package/CI 変更、
GitHub automation、file-writing automation、AI job 実行処理、production 昇格の
許可ではありません。
Codex App Server Runtime MVP Scope v0 は、次の dedicated implementation PR で
disabled-by-default、non-production、proposal-only の最小 scaffold を実装する
ための docs-only scope document です。template / example ではなく、runtime
code、API、DB、worker、scheduler、package、CI、automation、production 昇格を
この PR で追加しません。
Codex App Server Runtime MVP Scaffold v0 は、PR #35 の allowed surface 内で
追加された isolated TypeScript scaffold です。disabled-by-default、
local-only、proposal-only、non-production、人間承認必須の metadata と validation
だけを提供します。enabled runtime、API/DB 接続、worker/scheduler 実行、外部 API
連携、package/CI 変更、automation、production 昇格は追加しません。
Codex App Server Runtime read-only stdout report layer は、その scaffold から
read-only inspection report、operator summary、TaskCard draft、TaskCard QA draft、
PR #41 の HANDOFF draft、PR #42 の review packet を stdout に出すだけの review-material layer です。Task Board write、
HANDOFF file creation、file-writing automation、API/DB/worker/scheduler、
external integration、package/CI、GitHub automation、AI job execution、
production promotion は追加しません。
Task Board / HANDOFF Write Tool Contract v0 は、その stdout-only review
packet の後で将来の persistence / write を検討する前に読む docs-only gate です。
approval、validation、audit、rollback、forbidden operations を定義しますが、
write implementation、Task Board write、HANDOFF file creation、API、DB、worker、
scheduler、package、CI、automation、production promotion は追加しません。
Task Board / HANDOFF Write Dry-Run Validator v0 は、その contract に沿って
stdout-only dry-run result を出すだけで、write implementation、Task Board write、
HANDOFF file creation、file-writing automation、API、DB、worker、scheduler、
package、CI、automation、production promotion は追加しません。
Task Board / HANDOFF Write Approval Request stdout v0 は、dry-run result から
human-review-only の approval request draft を stdout に出すだけです。approval を
付与せず、何も書かず、Task Board write、HANDOFF file creation、
file-writing automation、API、DB、worker、scheduler、package、CI、automation、
production promotion は追加しません。
これらはいずれも正本契約や実行許可ではありません。

1. Memory Layer
2. Context Pack Builder v0
3. AI Analysis Job Intake Preflight v0
4. AI Analysis Job Result Contract v0
5. Human Review Decision Contract v0
6. Implementation Proposal Contract v0
7. Task Board / Handoff Contract v0
8. Task Board / Handoff Docs & Templates v0
9. Agent Charter / Operations Runbook v0
10. Operations Routine Templates v0
11. Knowledge / Docs Stewardship v0
12. Codex App Server Runtime Intake Gate v0
13. Codex App Server Runtime Design PR Readiness Review Template v0
14. Codex App Server Runtime Design PR Readiness Review Example v0
15. Codex App Server Runtime MVP Scope v0
16. Codex App Server Runtime MVP Scaffold v0
17. Codex App Server Runtime read-only stdout report layer
18. Task Board / HANDOFF Write Tool Contract v0
19. Task Board / HANDOFF Write Dry-Run Validator v0
20. Task Board / HANDOFF Write Approval Request stdout v0

矢印で表すと、次の流れです。

```text
Memory Layer
-> Context Pack Builder v0
-> AI Analysis Job Intake Preflight v0
-> AI Analysis Job Result Contract v0
-> Human Review Decision Contract v0
-> Implementation Proposal Contract v0
-> Task Board / Handoff Contract v0
-> Task Board / Handoff Docs & Templates v0
-> Agent Charter / Operations Runbook v0
-> Operations Routine Templates v0
-> Knowledge / Docs Stewardship v0
-> Codex App Server Runtime Intake Gate v0
-> Codex App Server Runtime Design PR Readiness Review Template v0
-> Codex App Server Runtime Design PR Readiness Review Example v0
-> Codex App Server Runtime MVP Scope v0
-> Codex App Server Runtime MVP Scaffold v0
-> Codex App Server Runtime read-only stdout report layer
-> Task Board / HANDOFF Write Tool Contract v0
-> Task Board / HANDOFF Write Dry-Run Validator v0
-> Task Board / HANDOFF Write Approval Request stdout v0
```

各レイヤーは前段を上書きしません。後段の docs や template は、
`proposal_only`、`required_human_approval`、`is_production_state: false`、
forbidden operations、protected path boundary を維持して使います。

## PR 履歴と安全境界

| PR | タイトル | 主な追加物 | 実行 runtime を追加したか | DB/API/worker/scheduler/Codex App Server runtime を追加したか | 次レイヤーとの関係 |
| --- | --- | --- | --- | --- | --- |
| #12 | Context Pack Builder v0 | AI 分析へ渡す sanitized context pack の builder contract と smoke test | いいえ。契約と検証のみ | いいえ。DB/API/worker/scheduler/runtime は未導入 | AI Analysis Job Intake Preflight v0 の入力を作る |
| #13 | AI Analysis Job Intake Preflight v0 | Context Pack を AI job に渡す前の preflight contract | いいえ。preflight contract のみ | いいえ。AI job 実行、DB/API、worker は未導入 | AI Analysis Job Result Contract v0 の前段 QA になる |
| #14 | AI Analysis Job Result Contract v0 | AI-sidecar result の proposal-only 出力 contract | いいえ。AI job runner は未導入 | いいえ。prompt execution、storage、DB/API は未導入 | Human Review Decision Contract v0 の review 対象になる |
| #15 | Human Review Decision Contract v0 | human decision outcome と approval boundary | いいえ。review contract のみ | いいえ。production apply、DB/API、deploy は未導入 | approved result を later implementation 検討へ渡す |
| #16 | Implementation Proposal Contract v0 | separate PR 前提の implementation proposal contract | いいえ。実装そのものは未導入 | いいえ。runtime、DB/API、migration、deploy は未導入 | Task Board / Handoff Contract v0 の source proposal になる |
| #17 | Task Board / Handoff Contract v0 | TaskCard と TaskHandoff の proposal-only contract | いいえ。task runner は未導入 | いいえ。GitHub automation、worker、scheduler は未導入 | docs/templates で人間レビューしやすい record にする |
| #18 | Task Board / Handoff Docs & Templates v0 | TaskCard、Handoff、Task Board QA Report templates | いいえ。template のみ | いいえ。file-writing automation、PR automation は未導入 | CodexApp 運用 runbook の入力形式になる |
| #19 | Agent Charter / Operations Runbook v0 | CodexApp / AI worker の日本語運用憲章と停止条件 | いいえ。runbook のみ | いいえ。Codex App Server runtime、worker、scheduler は未導入 | routine templates の運用境界を定義する |
| #20 | Operations Routine Templates v0 | Morning Standup、Weekly Review、Nightly QA、Blocker Escalation、Silent Failure Audit templates | いいえ。routine runner は未導入 | いいえ。scheduler、worker、runtime、file-writing automation は未導入 | 日次・週次・QA review を proposal-only に整える |
| #21 | Contract / Docs Index v0 | 契約・運用 docs の入口、読み順、用途表、未導入領域 | いいえ。index のみ | いいえ。runtime/API/DB/worker/scheduler/automation は未導入 | docs/templates の正本地図になる |
| #22 | Knowledge / Docs Stewardship v0 | docs/templates の正本性、鮮度、重複、リンク、runtime 境界を確認する checklist と templates | いいえ。review checklist のみ | いいえ。runtime/API/DB/worker/scheduler/automation は未導入 | index を正本地図、stewardship を品質管理と鮮度確認として使い分ける |
| #23 | Docs Stewardship Example Reports v0 | stewardship review、staleness audit、link/reference audit の安全な記入例 | いいえ。example reports のみ | いいえ。runtime/API/DB/worker/scheduler/automation は未導入 | PR #22 の templates を human-review-only の記入例として示す |
| #24 | Operations Routine Example Reports v0 | Morning Standup、Weekly Review、Nightly QA、Blocker Escalation、Silent Failure Audit の安全な記入例 | いいえ。example reports のみ | いいえ。runtime/API/DB/worker/scheduler/automation は未導入 | PR #20 の routine templates を proposal-only / human-review-only の記入例として示す |
| #25 | Task Board / Handoff Example Records v0 | TaskCard、Handoff、Task Board QA Report の安全な記入例 | いいえ。example records のみ | いいえ。runtime/API/DB/worker/scheduler/automation は未導入 | PR #17 / #18 の contract と templates を proposal-only / human-review-only の記入例として示す |
| #26 | CodexApp Request Example Pack v0 | CodexApp への日本語 operation request の安全な記入例 | いいえ。example requests のみ | いいえ。runtime/API/DB/worker/scheduler/automation は未導入 | PR #19 の Agent Charter / Operations Runbook と CODEXAPP_OPERATION_REQUEST_TEMPLATE を proposal-only / human-review-only の記入例として示す |
| #27 | AI Analysis Contract Example Records v0 | Context Pack、AI Analysis Job Intake Preflight、AI Analysis Job Result、Human Review Decision、Implementation Proposal の安全な記入例 | いいえ。example records のみ | いいえ。runtime/API/DB/worker/scheduler/Codex App Server runtime/automation は未導入 | PR #12-#16 の AI analysis contract chain を proposal-only / human-review-only / non-production の記入例として示す |
| #28 | Examples Index / README v0 | `docs/examples/README.md` による example records / reports / requests の category、正本対応表、読む順番、安全境界 | いいえ。README のみ | いいえ。runtime/API/DB/worker/scheduler/Codex App Server runtime/automation は未導入 | PR #23-#34 の examples を案内する。正本契約ではなく実行許可でもない |
| #29 | Codex App Server Runtime Intake Gate v0 | Codex App Server runtime design PR の前に、ユーザー提供資料、scope、human approval、test plan、rollback / disable plan を確認する intake contract と template | いいえ。intake contract と template のみ | いいえ。runtime/API/DB/worker/scheduler/Codex App Server runtime/automation は未導入 | runtime design PR instructions に進む前の不足情報確認と停止条件を定義する |
| #30 | Codex App Server Runtime Intake Example v0 | `docs/examples/CODEX_APP_SERVER_RUNTIME_INTAKE_EXAMPLE.md` による sanitized filled intake example | いいえ。example record のみ | いいえ。runtime/API/DB/worker/scheduler/Codex App Server runtime/automation は未導入 | PR #29 の intake contract と template を proposal-only / human-review-only / non-production の記入例として示す |
| #31 | Runtime Intake Task Board / Handoff Examples v0 | `docs/examples/RUNTIME_INTAKE_TASK_CARD_EXAMPLE.md` と `docs/examples/RUNTIME_INTAKE_HANDOFF_EXAMPLE.md` による sanitized bridge examples | いいえ。example records のみ | いいえ。runtime/API/DB/worker/scheduler/Codex App Server runtime/package/CI/automation は未導入 | PR #29 / #30 の intake output を Task Board / Handoff の human-review-only artifact へ安全につなぐ記入例として示す |
| #32 | Runtime Intake Task Board QA Report Example v0 | `docs/examples/RUNTIME_INTAKE_TASK_BOARD_QA_REPORT_EXAMPLE.md` による sanitized QA report bridge example | いいえ。example report のみ | いいえ。実行 runtime、DB/API/worker/scheduler/Codex App Server runtime/package/CI/automation は未導入 | PR #29-#31 の Runtime Intake bridge records を human-review-only QA report の記入例として示す |
| #33 | Runtime Design PR Readiness Review Template v0 | `docs/templates/CODEX_APP_SERVER_RUNTIME_DESIGN_PR_READINESS_REVIEW_TEMPLATE.md` による human-review-only readiness checklist / review report template | いいえ。template のみ | いいえ。実行 runtime、DB/API/worker/scheduler/Codex App Server runtime/package/CI/automation は未導入 | `ready_for_runtime_design_pr` 後に future runtime design PR instructions の下書き準備可否を人間レビューする |
| #34 | Runtime Design PR Readiness Review Example v0 | `docs/examples/CODEX_APP_SERVER_RUNTIME_DESIGN_PR_READINESS_REVIEW_EXAMPLE.md` による sanitized filled readiness review example | いいえ。example record のみ | いいえ。実行 runtime、DB/API/worker/scheduler/Codex App Server runtime/package/CI/automation は未導入 | PR #33 の readiness review template を instruction-drafting readiness only の記入例として示す |
| #35 | Codex App Server Runtime MVP Scope v0 | `docs/CODEX_APP_SERVER_RUNTIME_MVP_SCOPE.md` による next implementation PR の allowed files、forbidden files、test plan、rollback / disable plan、review gate | いいえ。docs-only scope document のみ | いいえ。実行 runtime、DB/API/worker/scheduler/Codex App Server runtime/package/CI/automation は未導入 | 次 PR で disabled-by-default / non-production / proposal-only の MVP scaffold を安全に実装するための範囲を定義する |
| #36 | Codex App Server Runtime MVP Scaffold v0 | `lib/codex-app-server-runtime/types.ts`、`validation.ts`、`scaffold.ts`、`scripts/codex-app-server-runtime-smoke.mjs` による isolated disabled scaffold | いいえ。enabled runtime は未導入。disabled-by-default scaffold metadata と validation のみ | いいえ。DB/API/worker/scheduler/package/CI/automation は未導入 | PR #35 の allowed surface 内で local-only / proposal-only / non-production scaffold を表現する |
| #37 | Codex App Server Runtime read-only report v0 | `lib/codex-app-server-runtime/report.ts` と `scripts/codex-app-server-runtime-report.mjs` による stdout-only inspection report | いいえ。read-only report のみ | いいえ。DB/API/worker/scheduler/package/CI/automation は未導入 | PR #36 の scaffold を人間レビュー用 JSON に整える |
| #38 | Codex App Server Runtime operator summary v0 | stdout-only operator summary helper と report script `--summary` | いいえ。summary のみ | いいえ。DB/API/worker/scheduler/package/CI/automation は未導入 | read-only report を短い human-review summary にする |
| #39 | Codex App Server Runtime TaskCard draft stdout v0 | stdout-only TaskCard draft helper と report script `--taskcard` | いいえ。draft 出力のみ | いいえ。Task Board write、DB/API/worker/scheduler/package/CI/automation は未導入 | operator summary を Task Board review material に接続する |
| #40 | Codex App Server Runtime TaskCard QA draft stdout v0 | stdout-only TaskCard QA draft helper と report script `--taskcard-qa` | いいえ。QA draft 出力のみ | いいえ。Task Board write、DB/API/worker/scheduler/package/CI/automation は未導入 | TaskCard draft を human-review-only QA material として点検する |
| #41 | Codex App Server Runtime HANDOFF draft stdout v0 | `lib/codex-app-server-runtime/report.ts` と `scripts/codex-app-server-runtime-report.mjs --handoff` による stdout-only HANDOFF draft | いいえ。stdout-only HANDOFF draft のみで、実装済み runtime は未導入 | いいえ。Task Board write、HANDOFF file creation、file-writing automation、API/DB/worker/scheduler、external integration、GitHub automation、AI job execution、production promotion は未導入。package/CI 変更も未導入 | TaskCard draft / QA draft を human-review-only HANDOFF draft にまとめる |
| #42 | Codex App Server Runtime review packet stdout v0 | stdout-only review packet helper と report script `--packet` | いいえ。review packet 出力のみ | いいえ。Task Board write、HANDOFF file creation、file-writing automation、API/DB/worker/scheduler、external integration、GitHub automation、AI job execution、production promotion は未導入。package/CI 変更も未導入 | report、summary、TaskCard draft、QA draft、HANDOFF draft を human-review-only packet にまとめる |
| #43 | Task Board / HANDOFF Write Tool Contract v0 | `docs/tool-contracts/TASK_BOARD_HANDOFF_WRITE_TOOL_CONTRACT.md` による future write/persistence 前の approval、validation、audit、rollback、forbidden-operation boundary | いいえ。docs-only contract のみ | いいえ。Task Board write、HANDOFF file creation、API、DB、worker、scheduler、package、CI、automation、production promotion は未実装のまま | stdout-only review packet から将来の persistence に進む前の gate を定義する。write implementation は別 PR と明示承認が必要 |
| #44 | Task Board / HANDOFF write dry-run validator v0 | `lib/codex-app-server-runtime/write-dry-run.ts` と stdout-only dry-run script | いいえ。dry-run result 出力のみ | いいえ。Task Board write、HANDOFF file creation、file-writing automation、API/DB/worker/scheduler、package/CI、GitHub automation、AI job execution、production promotion は未導入 | review packet から future write request を検討する前に、human-review-only の dry-run validation result を stdout で確認する |
| #45 | Task Board / HANDOFF write approval request stdout v0 | dry-run result から stdout-only approval request draft を生成する helper と script | いいえ。approval request draft 出力のみで approval は付与しない | いいえ。Task Board write、HANDOFF file creation、file-writing automation、API/DB/worker/scheduler、package/CI、GitHub automation、AI job execution、production promotion は未導入 | dry-run passed / blocked を human-review material に整える。approval_record.approved は false のままで、future write は別 scope と明示承認が必要 |

## Docs / Templates 用途表

| ドキュメント名 | 主な読者 | 使う場面 | 正本として扱う内容 | 使ってはいけない用途 |
| --- | --- | --- | --- | --- |
| `AGENTS.md` | CodexApp Worker、AI worker、human reviewer | リポジトリ内で作業を始める前 | protected core、human approval、Codex App Server policy、Task Board / Handoff boundary、routine boundary | runtime/API/DB/automation の実装許可として扱わない |
| `docs/CONTRACTS_INDEX.md` | 全読者 | 契約・運用 docs の入口を確認するとき | PR #12-#43 の地図、読む順番、用途、未導入領域、停止条件 | 実行、PR 作成、file-writing automation、production apply の許可として扱わない |
| `docs/CONTEXT_PACKS.md` | AI Analysis Reviewer、CodexApp Worker | AI 分析に渡す context pack の入力境界を確認するとき | context pack の定義、allowed/excluded inputs、sanitization、versioning | secrets、raw local path、production write instruction、live source of record を入れる根拠にしない |
| `docs/AI_ANALYSIS_JOBS.md` | AI Analysis Reviewer、CodexApp Worker | AI job の allowed/forbidden scope、intake、result contract を確認するとき | AI job の proposal-only 入出力、preflight、result contract、人間レビュー前提 | AI job 実行処理、prompt execution、worker runtime、storage path の仕様として扱わない |
| `docs/HUMAN_APPROVAL.md` | Human Owner、AI Analysis Reviewer、Risk / Safety Reviewer | AI output を承認、却下、revision、archive する境界を確認するとき | approval principle、decision outcome、implementation proposal への接続 | approval を production apply、deploy、DB write、API update の自動許可にしない |
| `docs/CODEX_APP_SERVER.md` | Future Runtime Designer、Risk / Safety Reviewer | Codex App Server の sidecar boundary を確認するとき | future Codex App Server の allowed/forbidden responsibilities と prerequisite | runtime 実装設計の十分条件として扱わない |
| `docs/CODEX_APP_SERVER_RUNTIME_INTAKE.md` | Future Runtime Designer、Human Owner、Risk / Safety Reviewer | Codex App Server runtime design PR instructions の前にユーザー提供資料と停止条件を確認するとき | intake decision、required materials、required design/test/rollback inputs、protected core boundary | runtime 実装、worker、scheduler、API/DB 接続、external integration、automation、production 昇格の許可として扱わない |
| `docs/CODEX_APP_SERVER_RUNTIME_MVP_SCOPE.md` | Future Runtime Designer、Human Owner、QA Reviewer、Risk / Safety Reviewer | MVP scaffold implementation PR の具体的な allowed surface、non-goals、test plan、rollback / disable plan、review gate を確認するとき | disabled-by-default / non-production / proposal-only MVP scaffold の target files、forbidden files、acceptance criteria、stop conditions | enabled runtime、API/DB 接続、worker/scheduler 実行、package/CI 変更、automation、production 昇格の許可として扱わない |
| `docs/tool-contracts/TASK_BOARD_HANDOFF_WRITE_TOOL_CONTRACT.md` | Future Runtime Designer、Human Owner、QA Reviewer、Risk / Safety Reviewer | stdout-only review packet の後で将来の Task Board / HANDOFF write boundary を確認するとき | approval、input/output schema、validation、audit、rollback、disable、forbidden operations、review gates | write implementation、Task Board write、HANDOFF file creation、API/DB/worker/scheduler/package/CI/automation、production 昇格の許可として扱わない |
| `docs/TASK_BOARD_HANDOFF.md` | CodexApp Worker、QA Reviewer、Human Owner | TaskCard / Handoff を作る、読む、QA するとき | status、autonomy、allowed next step、forbidden next steps、protected intended files | TaskCard を実行命令、PR 作成命令、merge/deploy 許可として扱わない |
| `docs/AGENT_CHARTER_OPERATIONS_RUNBOOK.md` | CodexApp Worker、AI worker、Human Owner | CodexApp への日本語 request や review support を作るとき | 日本語指示書ルール、A0-A2 autonomy、開始前 gate、停止条件 | CodexApp Server runtime、worker、scheduler、file-writing automation の導入許可として扱わない |
| `docs/OPERATIONS_ROUTINES.md` | Human Owner、CodexApp Worker、QA Reviewer | morning/weekly/nightly/blocker/audit reports を使い分けるとき | routine template の用途、human approval line、forbidden operations | routine runner、scheduler、worker runtime、自動書き込みの仕様として扱わない |
| `docs/KNOWLEDGE_DOCS_STEWARDSHIP.md` | Knowledge Steward、CodexApp Worker、QA Reviewer、Human Owner | docs/templates の正本性、鮮度、重複、リンク、runtime 境界を確認するとき | docs 分類、stale/conflict/duplicate/broken reference/runtime drift の定義、review checklist | docs 自動更新、PR 作成、merge、deploy、runtime/API/DB/automation の許可として扱わない |
| `docs/examples/README.md` | Human Owner、CodexApp Worker、QA Reviewer、Risk / Safety Reviewer | `docs/examples/` の category、正本対応、role別の読む順番、安全境界を確認するとき | examples の入口と案内。正本契約ではなく、正本 docs/templates を読むための index | 実行許可、実運用ログ、production state、runtime/API/DB/automation、PR 作成、merge、deploy の根拠として扱わない |
| `docs/templates/TASK_CARD_TEMPLATE.md` | CodexApp Worker、Human Owner | draft PR instructions 用 TaskCard を記録するとき | TaskCard fields、allowed values、safety checklist | 実行コマンド、PR 作成、production change request として使わない |
| `docs/templates/HANDOFF_TEMPLATE.md` | CodexApp Worker、AI worker、Human Owner | 非同期引き継ぎ artifact を残すとき | handoff fields、durable facts、allowed next step、sanitized references | 会話ログ全文、秘密情報、raw local path、実行命令の保存に使わない |
| `docs/templates/TASK_BOARD_QA_REPORT_TEMPLATE.md` | QA Reviewer、Risk / Safety Reviewer | TaskCard / Handoff を受け入れる前に QA するとき | scope/status/autonomy/protected path/restricted content checks | QA report の recommendation を自動実行結果として扱わない |
| `docs/templates/CODEXAPP_OPERATION_REQUEST_TEMPLATE.md` | Human Owner、CodexApp Worker | CodexApp へ proposal-only review support を頼むとき | 日本語 request fields、forbidden operations、required output | PR 作成、GitHub Issue 自動作成、runtime 追加、file-writing automation の依頼に使わない |
| `docs/templates/CODEX_APP_SERVER_RUNTIME_INTAKE_TEMPLATE.md` | Future Runtime Designer、Human Owner、Risk / Safety Reviewer | runtime design PR の前に intake record を下書きするとき | intake fields、runtime scope flags、decision outcome、required human-reviewed next action | runtime implementation spec、worker runtime spec、scheduler spec、file-writing automation として扱わない |
| `docs/templates/CODEX_APP_SERVER_RUNTIME_DESIGN_PR_READINESS_REVIEW_TEMPLATE.md` | Future Runtime Designer、Human Owner、QA Reviewer、Risk / Safety Reviewer | `ready_for_runtime_design_pr` 後、future runtime design PR instructions を draft してよいかを人間レビューするとき | proposal-only、human-review-only、non-production の readiness decision、source IDs、checks、forbidden operations、restricted content boundary | PR 作成、merge、deploy、runtime implementation、worker/scheduler/API/DB/package/CI changes、GitHub automation、file-writing automation、AI job execution、production promotion の許可として扱わない |
| `docs/examples/CODEXAPP_OPERATION_REQUEST_*_EXAMPLE.md` | Human Owner、CodexApp Worker、QA Reviewer、Risk / Safety Reviewer | CodexApp への日本語 operation request の書き方を確認するとき | draft instructions、QA review notes、handoff summary の proposal-only / human-review-only / non-production 記入例。examples は正本契約ではなく記入例 | 正本契約、実運用ログ、実行許可、PR 作成、merge、deploy、API 更新、DB 変更、runtime 追加、automation の根拠として扱わない |
| `docs/examples/CODEX_APP_SERVER_RUNTIME_INTAKE_EXAMPLE.md` | Future Runtime Designer、Human Owner、Risk / Safety Reviewer | runtime design PR instructions の前に sanitized intake record の記入例を確認するとき | PR #29 の runtime intake contract/template に対応する proposal-only、human-review-only、non-production の安全な記入例 | runtime implementation、worker/scheduler/API/DB/external integration、automation、PR 作成、merge、deploy、production promotion の根拠として扱わない |
| `docs/examples/RUNTIME_INTAKE_TASK_CARD_EXAMPLE.md` | Future Runtime Designer、Human Owner、QA Reviewer、Risk / Safety Reviewer | Runtime Intake outcome を TaskCard として human review へ渡す記入例を確認するとき | proposal-only、human-review-only、non-production の TaskCard bridge example。`ready_for_runtime_design_pr` は instruction drafting readiness のみ | runtime implementation、worker/scheduler/API/DB/package/CI changes、GitHub automation、PR 作成、merge、deploy、production promotion の根拠として扱わない |
| `docs/examples/RUNTIME_INTAKE_HANDOFF_EXAMPLE.md` | Future Runtime Designer、Human Owner、QA Reviewer、Risk / Safety Reviewer | Runtime Intake から future runtime design PR instructions 前の durable handoff を確認するとき | durable facts、open questions、blockers、residual risks を sanitized reference で残す handoff bridge example | 会話ログ全文、secret/local path/NAS path 保存、runtime implementation、PR 作成、merge、deploy、production promotion の根拠として扱わない |
| `docs/examples/RUNTIME_INTAKE_TASK_BOARD_QA_REPORT_EXAMPLE.md` | Future Runtime Designer、Human Owner、QA Reviewer、Risk / Safety Reviewer | Runtime Intake TaskCard / Handoff bridge records を human review 前に QA する記入例を確認するとき | `approve_for_human_review` を human-review-only として扱う sanitized QA report bridge example | runtime implementation、worker/scheduler/API/DB/package/CI changes、GitHub automation、PR 作成、merge、deploy、file-writing automation、production promotion の根拠として扱わない |
| `docs/examples/CODEX_APP_SERVER_RUNTIME_DESIGN_PR_READINESS_REVIEW_EXAMPLE.md` | Future Runtime Designer、Human Owner、QA Reviewer、Risk / Safety Reviewer | Runtime Design PR Readiness Review Template の sanitized filled example を確認するとき | `ready_to_draft_runtime_design_pr_instructions_only` を instruction-drafting readiness only として扱う proposal-only、human-review-only、non-production の記入例 | runtime design PR、PR 作成、merge、deploy、runtime implementation、worker/scheduler/API/DB/package/CI changes、GitHub automation、file-writing automation、AI job execution、production promotion の根拠として扱わない |
| `docs/templates/MORNING_STANDUP_TEMPLATE.md` | Human Owner、CodexApp Worker | 朝の状況整理を proposal-only に記録するとき | completed/blocked/waiting/priority/open questions の report fields | 定期実行 runtime や status 自動更新として扱わない |
| `docs/templates/WEEKLY_REVIEW_TEMPLATE.md` | Human Owner、QA Reviewer | 週次で契約、Task Board、Handoff、品質を振り返るとき | repeated blockers、quality findings、docs update proposals | docs update や routine change を人間レビューなしに適用しない |
| `docs/templates/NIGHTLY_QA_REPORT_TEMPLATE.md` | QA Reviewer、Risk / Safety Reviewer | 夜間 QA 報告の型を使って review 結果を残すとき | checked contracts、findings、regressions、restricted/protected findings | nightly runtime、scheduler、worker 実行の仕様として扱わない |
| `docs/templates/BLOCKER_ESCALATION_TEMPLATE.md` | CodexApp Worker、Human Owner | blocked / waiting 状態を人間へ戻すとき | blocker type、why AI must stop、safe next options | blocker 解消を自動実行したり forbidden next step を省略したりしない |
| `docs/templates/SILENT_FAILURE_AUDIT_TEMPLATE.md` | Risk / Safety Reviewer、QA Reviewer | エラーなしで間違い続ける failure pattern を監査するとき | expected/observed mismatch、missing review、missing forbidden steps | `block_automation` を runtime 変更として直接適用しない |
| `docs/templates/DOC_STEWARDSHIP_REVIEW_TEMPLATE.md` | Knowledge Steward、CodexApp Worker、Human Owner | 単一 doc/template の stewardship review を記録するとき | source of truth、freshness、duplication、conflict、runtime boundary、restricted content、link checks | recommendation を docs 自動更新や実行許可として扱わない |
| `docs/templates/DOC_STALENESS_AUDIT_TEMPLATE.md` | Knowledge Steward、QA Reviewer、Human Owner | 複数 docs/templates の古い前提や review due 候補を確認するとき | stale candidates、outdated references、stale assumptions、recommended updates | audit recommendation を自動修正や runtime 変更として扱わない |
| `docs/templates/DOC_LINK_AND_REFERENCE_AUDIT_TEMPLATE.md` | Knowledge Steward、QA Reviewer、Human Owner | docs/templates のリンク、名前、source chain、index 参照を確認するとき | missing links、broken references、inconsistent names、source-chain gaps | link audit を file-writing automation や PR automation として扱わない |
| `docs/examples/CONTEXT_PACK_EXAMPLE.md`、`docs/examples/AI_ANALYSIS_JOB_INTAKE_PREFLIGHT_EXAMPLE.md`、`docs/examples/AI_ANALYSIS_JOB_RESULT_EXAMPLE.md`、`docs/examples/HUMAN_REVIEW_DECISION_EXAMPLE.md`、`docs/examples/IMPLEMENTATION_PROPOSAL_EXAMPLE.md` | AI Analysis Reviewer、Human Reviewer、QA Reviewer、Risk / Safety Reviewer | PR #12-#16 の AI analysis contract chain の記入例を確認するとき | proposal-only、human-review-only、non-production の安全な記入例。examples は正本契約ではなく記入例 | 正本契約、実運用ログ、実行結果、runtime/API/DB/automation、production apply の根拠として扱わない |
| `docs/examples/*.md` | Knowledge Steward、CodexApp Worker、Human Reviewer、QA Reviewer、Risk / Safety Reviewer | Docs Stewardship templates、Operations Routine templates、Task Board / Handoff templates、CodexApp request examples の書き方を確認するとき | proposal-only、human-review-only、non-production の安全な記入例。examples は正本契約ではなく記入例 | 正本契約、実運用ログ、実行許可、docs 自動更新、PR 作成、merge、deploy、runtime/API/DB/automation の根拠として扱わない |

Docs や templates が増えたときは、`docs/KNOWLEDGE_DOCS_STEWARDSHIP.md` の
checklist を使います。`docs/CONTRACTS_INDEX.md` は正本地図、Knowledge / Docs
Stewardship v0 は品質管理と鮮度確認です。どちらも実行許可ではありません。
Docs Stewardship examples、Operations Routine examples、Task Board / Handoff
examples、CodexApp request examples、AI Analysis Contract examples、Runtime
Intake Task Board / Handoff / QA Report examples は記入例であり、正本契約や
実行許可ではありません。これらの入口は `docs/examples/README.md` です。README も案内文書であり、
正本契約や実行許可ではありません。CodexApp request examples の正本は
`docs/templates/CODEXAPP_OPERATION_REQUEST_TEMPLATE.md` と
`docs/AGENT_CHARTER_OPERATIONS_RUNBOOK.md` です。Task Board / Handoff examples の
正本は `docs/TASK_BOARD_HANDOFF.md` と対応する templates です。AI Analysis
Contract examples の正本は各 contract docs と `lib/*/types.ts` /
`lib/*/validation.ts` です。

## Persona / Role 別の読み順

### Human Owner

1. `AGENTS.md`
2. `docs/CONTRACTS_INDEX.md`
3. `docs/HUMAN_APPROVAL.md`
4. `docs/TASK_BOARD_HANDOFF.md`
5. 必要な `docs/templates/*.md`
6. `docs/OPERATIONS_ROUTINES.md`

Human Owner は、proposal を承認、却下、revision、archive のどれにするかを判断
します。承認は production apply ではなく、必要なら separate implementation PR を
検討するための review permission です。

### CodexApp Worker

1. `AGENTS.md`
2. `docs/CONTRACTS_INDEX.md`
3. 対象作業に対応する source contract
4. `docs/AGENT_CHARTER_OPERATIONS_RUNBOOK.md`
5. `docs/templates/CODEXAPP_OPERATION_REQUEST_TEMPLATE.md`
6. 必要な TaskCard、Handoff、QA、routine template

CodexApp Worker は、日本語の proposal-only draft instructions、QA notes、
handoff summary を作るために読みます。実行、PR 作成、merge、deploy、API 更新、
DB 変更、runtime 追加、外部連携、file-writing automation はしません。

### AI Analysis Reviewer

1. `docs/CONTRACTS_INDEX.md`
2. `docs/CONTEXT_PACKS.md`
3. `docs/AI_ANALYSIS_JOBS.md`
4. `docs/HUMAN_APPROVAL.md`
5. `docs/TASK_BOARD_HANDOFF.md`

AI Analysis Reviewer は、context pack、preflight、result、human decision の
source chain が proposal-only のまま保たれているかを確認します。AI result を
production state として扱いません。

### QA Reviewer

1. `docs/CONTRACTS_INDEX.md`
2. `docs/TASK_BOARD_HANDOFF.md`
3. `docs/templates/TASK_BOARD_QA_REPORT_TEMPLATE.md`
4. `docs/OPERATIONS_ROUTINES.md`
5. `docs/templates/NIGHTLY_QA_REPORT_TEMPLATE.md`
6. 必要に応じて `docs/templates/SILENT_FAILURE_AUDIT_TEMPLATE.md`

QA Reviewer は、status と allowed next step の整合、A0-A2 autonomy、protected
path、restricted content、forbidden next steps の欠落を確認します。

### Risk / Safety Reviewer

1. `AGENTS.md`
2. `docs/CONTRACTS_INDEX.md`
3. `docs/CODEX_APP_SERVER.md`
4. `docs/HUMAN_APPROVAL.md`
5. `docs/AI_ANALYSIS_JOBS.md`
6. `docs/AGENT_CHARTER_OPERATIONS_RUNBOOK.md`
7. `docs/templates/SILENT_FAILURE_AUDIT_TEMPLATE.md`

Risk / Safety Reviewer は、AI output が投資助言、航行判断、軍事判断、自動売買、
外部公開、production write、API update、DB migration、runtime addition に流れ
ていないかを確認します。

### Future Runtime Designer

1. `AGENTS.md`
2. `docs/CONTRACTS_INDEX.md`
3. `docs/CODEX_APP_SERVER.md`
4. `docs/CONTEXT_PACKS.md`
5. `docs/AI_ANALYSIS_JOBS.md`
6. `docs/HUMAN_APPROVAL.md`
7. `docs/AGENT_CHARTER_OPERATIONS_RUNBOOK.md`
8. `docs/CODEX_APP_SERVER_RUNTIME_INTAKE.md`
9. `docs/templates/CODEX_APP_SERVER_RUNTIME_INTAKE_TEMPLATE.md`
10. `docs/examples/CODEX_APP_SERVER_RUNTIME_INTAKE_EXAMPLE.md`
11. `docs/examples/RUNTIME_INTAKE_TASK_CARD_EXAMPLE.md`
12. `docs/examples/RUNTIME_INTAKE_HANDOFF_EXAMPLE.md`
13. `docs/examples/RUNTIME_INTAKE_TASK_BOARD_QA_REPORT_EXAMPLE.md`
14. `docs/templates/CODEX_APP_SERVER_RUNTIME_DESIGN_PR_READINESS_REVIEW_TEMPLATE.md`
15. `docs/examples/CODEX_APP_SERVER_RUNTIME_DESIGN_PR_READINESS_REVIEW_EXAMPLE.md`
16. `docs/CODEX_APP_SERVER_RUNTIME_MVP_SCOPE.md`
17. ユーザー提供資料

Codex App Server runtime 設計に進む場合は、ユーザー提供資料を受け取ってから
Runtime Intake Gate v0 で不足情報、scope、human approval、test plan、
rollback / disable plan を確認し、別 PR で扱います。この index は runtime
実装許可ではありません。

Future Runtime Designer は、既存 docs を設計前提の safety boundary として読む
だけです。runtime、worker、scheduler、DB migration、external API integration、
`/api/forecast` 接続、`/api/hormuz` 接続、production 昇格は、それぞれ明示承認
された scope、検証計画、rollback plan を持つ dedicated PR が必要です。

## 次の PR を作るときの参照順

次の docs-only PR、contract PR、template PR、または future implementation PR を
検討するときは、次の順に確認します。

1. `AGENTS.md` で protected core と作業禁止範囲を確認する。
2. `docs/CONTRACTS_INDEX.md` で対象レイヤーと前後関係を確認する。
3. 変更対象の正本 docs を読む。
4. 関連 template があれば、allowed values と forbidden operations を確認する。
5. `docs/HUMAN_APPROVAL.md` で approval が review permission に留まることを確認する。
6. protected path、DB/API、runtime、worker、scheduler、dependency、CI、
   external integration、automation に触れる場合は停止する。
7. 実装が必要な場合は、docs-only PR から切り離し、人間承認つきの dedicated
   implementation PR として scope、tests、rollback plan を定義する。

## Codex App Server runtime に進む前の停止条件

次のいずれかに当てはまる場合、この index では先に進みません。

- Codex App Server runtime 設計のためのユーザー提供資料がない。
- runtime、worker、scheduler、DB migration、external API integration、
  `/api/forecast` 接続、`/api/hormuz` 接続、production 昇格の scope が曖昧。
- human approval gate、rollback plan、test plan が未定義。
- proposal-only と production state の分離が曖昧。
- protected path または restricted content を扱う必要がある。
- CodexApp に PR 作成、merge、deploy、file-writing automation、GitHub
  Issue/PR 自動作成、AI job 実行処理を求めている。

Codex App Server runtime 設計に進む場合は、ユーザー提供資料を受け取ってから
`docs/CODEX_APP_SERVER_RUNTIME_INTAKE.md` の intake gate で確認し、別 PR で
扱います。

## 未導入領域

この index v0 では、次を導入していません。

- Codex App Server runtime
- worker runtime
- scheduler
- external API integration
- DB migration / schema change
- `/api/forecast` 接続
- `/api/hormuz` 接続
- GitHub Issue / PR 自動作成
- file-writing automation
- AI job 実行処理
- production 昇格

これらが必要になった場合でも、この index は実装許可ではありません。人間の明示
承認、dedicated PR、scope、検証方法、rollback plan を別途定義します。

# Examples Index / README v0

## 目的

`docs/examples/` は、契約 docs と `docs/templates/` を安全に記入するための
example records / reports / requests を集めた入口です。

Examples は正本契約ではありません。正本は対応する contract docs、
`docs/templates/`、および該当する `lib/*/types.ts` / `lib/*/validation.ts` です。
example を使う前に、必ず対応する正本 docs/templates を読んでください。

Examples は実運用ログ、実行結果、production state、保存済み forecast、DB record、
API response、worker output、scheduler output ではありません。runtime、API、DB、
automation、PR 作成、merge、deploy を許可するものでもありません。

Examples には、実在の秘密情報、`.env` 値、OAuth token、raw local path、NAS path、
private network details、production logs、実運用データ、不要な private data を
入れません。必要な参照は sanitized label で記録します。

## 使い方

1. `docs/CONTRACTS_INDEX.md` で対象レイヤーを確認する。
2. この README で category と対応する正本 docs/templates を確認する。
3. 対応する正本 docs/templates と、必要な `lib/*/types.ts` /
   `lib/*/validation.ts` を読む。
4. 対象 example を、書き方サンプルとしてだけ参照する。
5. example の内容を実運用ログ、実行結果、production state、実行許可として扱わない。

## Category Index

### A. Docs Stewardship Examples

- `DOC_STEWARDSHIP_REVIEW_EXAMPLE.md`
- `DOC_STALENESS_AUDIT_EXAMPLE.md`
- `DOC_LINK_AND_REFERENCE_AUDIT_EXAMPLE.md`

### B. Operations Routine Examples

- `MORNING_STANDUP_EXAMPLE.md`
- `WEEKLY_REVIEW_EXAMPLE.md`
- `NIGHTLY_QA_REPORT_EXAMPLE.md`
- `BLOCKER_ESCALATION_EXAMPLE.md`
- `SILENT_FAILURE_AUDIT_EXAMPLE.md`

### C. Task Board / Handoff Examples

- `TASK_CARD_EXAMPLE.md`
- `HANDOFF_EXAMPLE.md`
- `TASK_BOARD_QA_REPORT_EXAMPLE.md`

### D. CodexApp Request Examples

- `CODEXAPP_OPERATION_REQUEST_DRAFT_INSTRUCTIONS_EXAMPLE.md`
- `CODEXAPP_OPERATION_REQUEST_QA_REVIEW_EXAMPLE.md`
- `CODEXAPP_OPERATION_REQUEST_HANDOFF_SUMMARY_EXAMPLE.md`

### E. AI Analysis Contract Examples

- `CONTEXT_PACK_EXAMPLE.md`
- `AI_ANALYSIS_JOB_INTAKE_PREFLIGHT_EXAMPLE.md`
- `AI_ANALYSIS_JOB_RESULT_EXAMPLE.md`
- `HUMAN_REVIEW_DECISION_EXAMPLE.md`
- `IMPLEMENTATION_PROPOSAL_EXAMPLE.md`

### F. Codex App Server Runtime Intake Examples

- `CODEX_APP_SERVER_RUNTIME_INTAKE_EXAMPLE.md`

## Source Mapping

| Example file | Category | Source contract / source template | Primary reader | Use when | Must not be used for |
| --- | --- | --- | --- | --- | --- |
| `DOC_STEWARDSHIP_REVIEW_EXAMPLE.md` | Docs Stewardship Examples | `docs/KNOWLEDGE_DOCS_STEWARDSHIP.md`, `docs/templates/DOC_STEWARDSHIP_REVIEW_TEMPLATE.md` | Knowledge Steward, CodexApp Worker, Human Owner | 単一 doc/template の正本性、鮮度、重複、runtime 境界を記入例で確認するとき | docs 自動更新、PR 作成、merge、deploy、API/DB/runtime/automation の許可 |
| `DOC_STALENESS_AUDIT_EXAMPLE.md` | Docs Stewardship Examples | `docs/KNOWLEDGE_DOCS_STEWARDSHIP.md`, `docs/templates/DOC_STALENESS_AUDIT_TEMPLATE.md` | Knowledge Steward, QA Reviewer, Human Owner | 複数 docs/templates の stale candidate や review due を記入例で確認するとき | stale 判定の自動修正、file-writing automation、production promotion |
| `DOC_LINK_AND_REFERENCE_AUDIT_EXAMPLE.md` | Docs Stewardship Examples | `docs/KNOWLEDGE_DOCS_STEWARDSHIP.md`, `docs/templates/DOC_LINK_AND_REFERENCE_AUDIT_TEMPLATE.md` | Knowledge Steward, QA Reviewer, Human Owner | link、名前、source chain、index 参照の audit 記入例を確認するとき | link 修正の自動実行、PR 作成、runtime/API/DB/automation の許可 |
| `MORNING_STANDUP_EXAMPLE.md` | Operations Routine Examples | `docs/OPERATIONS_ROUTINES.md`, `docs/templates/MORNING_STANDUP_TEMPLATE.md` | Human Owner, CodexApp Worker | 朝の proposal-only 状況整理 report の書き方を確認するとき | scheduler、worker runtime、status 自動更新、production state |
| `WEEKLY_REVIEW_EXAMPLE.md` | Operations Routine Examples | `docs/OPERATIONS_ROUTINES.md`, `docs/templates/WEEKLY_REVIEW_TEMPLATE.md` | Human Owner, QA Reviewer | 週次 review、繰り返す blocker、docs update proposal の書き方を確認するとき | docs update の自動適用、merge、deploy、API/DB/runtime 変更 |
| `NIGHTLY_QA_REPORT_EXAMPLE.md` | Operations Routine Examples | `docs/OPERATIONS_ROUTINES.md`, `docs/templates/NIGHTLY_QA_REPORT_TEMPLATE.md` | QA Reviewer, Risk / Safety Reviewer | 夜間 QA 形式の checked contracts、findings、regressions の書き方を確認するとき | nightly runner、scheduler、worker runtime、protected path 変更 |
| `BLOCKER_ESCALATION_EXAMPLE.md` | Operations Routine Examples | `docs/OPERATIONS_ROUTINES.md`, `docs/templates/BLOCKER_ESCALATION_TEMPLATE.md` | CodexApp Worker, Human Owner | blocked / waiting 状態を人間レビューへ戻す記入例を確認するとき | blocker 解消の自動実行、API/DB/deploy、PR 作成 |
| `SILENT_FAILURE_AUDIT_EXAMPLE.md` | Operations Routine Examples | `docs/OPERATIONS_ROUTINES.md`, `docs/templates/SILENT_FAILURE_AUDIT_TEMPLATE.md` | Risk / Safety Reviewer, QA Reviewer | 静かな故障、missing review、forbidden steps 欠落の audit 例を確認するとき | automation block の直接適用、runtime 変更、production promotion |
| `TASK_CARD_EXAMPLE.md` | Task Board / Handoff Examples | `docs/TASK_BOARD_HANDOFF.md`, `docs/templates/TASK_CARD_TEMPLATE.md`, `lib/task-board/types.ts`, `lib/task-board/validation.ts` | CodexApp Worker, Human Owner, QA Reviewer | TaskCard の proposal-only fields、autonomy、intended files を確認するとき | 実行命令、PR 作成、merge、deploy、API/DB/runtime/automation の許可 |
| `HANDOFF_EXAMPLE.md` | Task Board / Handoff Examples | `docs/TASK_BOARD_HANDOFF.md`, `docs/templates/HANDOFF_TEMPLATE.md`, `lib/task-board/types.ts`, `lib/task-board/handoff.ts` | CodexApp Worker, AI worker, Human Owner | 非同期 handoff artifact の durable facts と sanitized references を確認するとき | 会話ログ全文、secret/local path/NAS path 保存、実行命令 |
| `TASK_BOARD_QA_REPORT_EXAMPLE.md` | Task Board / Handoff Examples | `docs/TASK_BOARD_HANDOFF.md`, `docs/templates/TASK_BOARD_QA_REPORT_TEMPLATE.md` | QA Reviewer, Risk / Safety Reviewer | TaskCard / Handoff の QA findings と recommendation の書き方を確認するとき | QA recommendation の自動実行、status 自動変更、PR 作成、merge |
| `CODEXAPP_OPERATION_REQUEST_DRAFT_INSTRUCTIONS_EXAMPLE.md` | CodexApp Request Examples | `docs/AGENT_CHARTER_OPERATIONS_RUNBOOK.md`, `docs/templates/CODEXAPP_OPERATION_REQUEST_TEMPLATE.md` | Human Owner, CodexApp Worker | CodexApp へ日本語 draft instructions 作成を依頼する書き方を確認するとき | CodexApp に PR 作成、runtime、API、DB、automation、deploy を求めること |
| `CODEXAPP_OPERATION_REQUEST_QA_REVIEW_EXAMPLE.md` | CodexApp Request Examples | `docs/AGENT_CHARTER_OPERATIONS_RUNBOOK.md`, `docs/templates/CODEXAPP_OPERATION_REQUEST_TEMPLATE.md` | Human Owner, QA Reviewer, CodexApp Worker | CodexApp へ日本語 QA review notes 作成を依頼する書き方を確認するとき | QA を自動実行結果、merge 許可、API/DB/runtime 変更許可として扱うこと |
| `CODEXAPP_OPERATION_REQUEST_HANDOFF_SUMMARY_EXAMPLE.md` | CodexApp Request Examples | `docs/AGENT_CHARTER_OPERATIONS_RUNBOOK.md`, `docs/templates/CODEXAPP_OPERATION_REQUEST_TEMPLATE.md` | Human Owner, CodexApp Worker | CodexApp へ日本語 handoff summary 作成を依頼する書き方を確認するとき | raw transcript 保存、secret/local path/NAS path 保存、file-writing automation |
| `CONTEXT_PACK_EXAMPLE.md` | AI Analysis Contract Examples | `docs/CONTEXT_PACKS.md`, `lib/context-packs/types.ts`, `lib/context-packs/validation.ts` | AI Analysis Reviewer, CodexApp Worker, Human Reviewer | sanitized context pack の included/excluded records と limitations を確認するとき | production state、price/evaluation source of record、AI-controlled live input |
| `AI_ANALYSIS_JOB_INTAKE_PREFLIGHT_EXAMPLE.md` | AI Analysis Contract Examples | `docs/AI_ANALYSIS_JOBS.md`, `lib/context-packs/types.ts`, `lib/context-packs/validation.ts`, `lib/ai-analysis-jobs/types.ts`, `lib/ai-analysis-jobs/validation.ts`, `lib/ai-analysis-jobs/preflight.ts` | AI Analysis Reviewer, QA Reviewer | AI job 前の preflight QA report の書き方を確認するとき | AI job 実行、prompt execution、worker runtime、storage path、API/DB 接続 |
| `AI_ANALYSIS_JOB_RESULT_EXAMPLE.md` | AI Analysis Contract Examples | `docs/AI_ANALYSIS_JOBS.md`, `lib/ai-analysis-jobs/types.ts`, `lib/ai-analysis-jobs/result-validation.ts` | AI Analysis Reviewer, Human Reviewer, QA Reviewer | AI-sidecar result の proposal-only output と allowed next step を確認するとき | production apply、approved/applied state、external publish、automated trading |
| `HUMAN_REVIEW_DECISION_EXAMPLE.md` | AI Analysis Contract Examples | `docs/HUMAN_APPROVAL.md`, `lib/human-review/types.ts`, `lib/human-review/validation.ts` | Human Owner, Risk / Safety Reviewer | human decision outcome と separate implementation boundary を確認するとき | approval を production write、deploy、DB/API update の自動許可にすること |
| `IMPLEMENTATION_PROPOSAL_EXAMPLE.md` | AI Analysis Contract Examples | `docs/HUMAN_APPROVAL.md`, `lib/implementation-proposals/types.ts`, `lib/implementation-proposals/validation.ts` | Human Owner, CodexApp Worker, Risk / Safety Reviewer | later separate PR 用の proposal-only implementation plan を確認するとき | 実装そのもの、runtime/API/DB migration、merge、deploy、production promotion |
| `CODEX_APP_SERVER_RUNTIME_INTAKE_EXAMPLE.md` | Codex App Server Runtime Intake Examples | `docs/CODEX_APP_SERVER_RUNTIME_INTAKE.md`, `docs/templates/CODEX_APP_SERVER_RUNTIME_INTAKE_TEMPLATE.md` | Future Runtime Designer, Human Owner, Risk / Safety Reviewer | runtime design PR instructions の前に、sanitized intake record の記入例を確認するとき | runtime implementation、worker/scheduler/API/DB/external integration、automation、production promotion |

## Role別の読む順番

### Human Owner

1. `docs/CONTRACTS_INDEX.md`
2. `docs/examples/README.md`
3. 関連する正本 docs/templates
4. 対象 example

### CodexApp Worker

1. `AGENTS.md`
2. `docs/CONTRACTS_INDEX.md`
3. `docs/AGENT_CHARTER_OPERATIONS_RUNBOOK.md`
4. `docs/examples/README.md`
5. 対象 example
6. 対象正本 docs/templates

### QA Reviewer

1. `docs/CONTRACTS_INDEX.md`
2. `docs/TASK_BOARD_HANDOFF.md`
3. `docs/examples/README.md`
4. QA 関連 example
5. 正本 template

### Risk / Safety Reviewer

1. `AGENTS.md`
2. `docs/CONTRACTS_INDEX.md`
3. `docs/KNOWLEDGE_DOCS_STEWARDSHIP.md`
4. `docs/examples/README.md`
5. high-risk boundary を含む example

### Future Runtime Designer

1. `AGENTS.md`
2. `docs/CONTRACTS_INDEX.md`
3. `docs/CODEX_APP_SERVER.md`
4. `docs/examples/README.md`
5. `docs/CODEX_APP_SERVER_RUNTIME_INTAKE.md`
6. `docs/templates/CODEX_APP_SERVER_RUNTIME_INTAKE_TEMPLATE.md`
7. 対象 example
8. ユーザー提供資料

Future Runtime Designer は、examples を runtime 設計許可として扱いません。
Codex App Server runtime 設計に進む場合は、ユーザー提供資料を受け取ってから
別 PR で扱います。

## Safety Boundary

Examples must not authorize:

- `production_write`
- `api_forecast_update`
- `api_hormuz_update`
- `api_hormuz_news_update`
- `db_write`
- `db_migration`
- `direct_deploy`
- `worker_runtime`
- `scheduler_runtime`
- `codex_app_server_runtime`
- `external_api_integration`
- `create_github_issue`
- `create_pr`
- `merge_pr`
- `file_writing_automation`
- `external_publish`
- `automated_trading`
- `investment_advice`
- `navigation_guidance`
- `military_guidance`
- `production_promotion`

If an example appears to require any item above, stop and return to human
review. Do not reinterpret the example as permission to execute, automate,
publish, promote, deploy, migrate, or connect production systems.

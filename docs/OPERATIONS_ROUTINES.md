# Operations Routine Templates v0

## 目的

Operations Routine Templates v0 は、将来の AI worker、CodexApp、人間
reviewer が、日次・週次・夜間 QA・ブロッカー確認・静かな故障監査を
proposal-only に記録し、人間レビュー前提で確認するための文書テンプレート群
です。

この文書と関連テンプレートは、定期実行の仕組みではありません。runtime、
worker、scheduler、Codex App Server runtime、外部 API 連携、DB migration、
`/api` 接続、GitHub Issue/PR 自動化、file-writing automation、production 昇格
を追加しません。

## テンプレートの使い分け

- `docs/templates/MORNING_STANDUP_TEMPLATE.md`
  - 朝に人間が状況を把握するための proposal-only 報告形式です。
  - 完了した TaskCard、blocked items、human approval 待ち、今日の優先事項、
    人間が取れる安全な action を整理します。
- `docs/templates/WEEKLY_REVIEW_TEMPLATE.md`
  - 週次で契約レイヤー、Task Board、Handoff、品質、繰り返す blocker を振り
    返るための review 形式です。
  - ドキュメント更新や routine 見直しが必要かを人間に提案します。
- `docs/templates/NIGHTLY_QA_REPORT_TEMPLATE.md`
  - 夜間 QA を実行するものではなく、将来の夜間 QA 報告の型だけを定義します。
  - checked contracts、checked task cards、findings、regressions、protected
    path findings を人間レビュー用に記録します。
- `docs/templates/BLOCKER_ESCALATION_TEMPLATE.md`
  - `blocked`、`waiting_for_context`、`waiting_for_human_approval` の作業を、
    AI が止まる理由と人間の判断事項つきで安全に戻す形式です。
- `docs/templates/SILENT_FAILURE_AUDIT_TEMPLATE.md`
  - エラーを出さずに誤った出力を続ける「静かな故障」を点検する形式です。
  - stale output、missing human review、forbidden next steps の欠落、protected
    path leakage などを確認します。

## TaskCard / Handoff / QA Report との関係

Routine template は、TaskCard、TaskHandoff、Task Board QA Report を置き換え
ません。TaskCard は draft PR instructions 用の管理単位、TaskHandoff は非同期
引き継ぎ artifact、Task Board QA Report は個別 record の QA です。

Operations Routine Templates v0 は、それらの record を人間がまとめて確認する
ための reporting layer です。routine report の内容は proposal-only であり、
TaskCard や Handoff の status を自動変更しません。

## Autonomy Scope

AI worker と CodexApp が routine template を扱う場合、autonomy level は次に
限ります。

- `A0_advice_only`
- `A1_draft_only`
- `A2_prepare_for_approval`

`A2_prepare_for_approval` は、人間レビュー用の材料を整えるところまでです。PR
作成、merge、deploy、API 更新、DB 書き込み、migration、runtime 追加、
scheduler 追加、worker 実行、external API integration、production 昇格は含み
ません。

## Human Approval Line

すべての routine report は、template の field name に合わせて明示的な human
approval line を保持します。例:

- `required_human_review: true`
- `human_approval_required: true`
- `proposal_only: true`
- `is_production_state: false`

Human approval は review permission だけを意味します。実行、PR 作成、merge、
deploy、API 更新、DB migration、external API integration、production 昇格を
自動的に許可しません。

## Forbidden Operations

Routine template は次の操作を実行、要求、または自動化してはいけません。

- production write
- `/api/forecast` update
- `/api/hormuz` update
- `/api/hormuz/news` update
- database write
- database migration
- direct deploy
- worker runtime
- scheduler runtime
- Codex App Server runtime
- external API integration
- GitHub Issue 自動作成
- GitHub PR 自動作成
- file-writing automation
- merge
- external publish
- automated trading
- investment advice
- navigation guidance
- military guidance
- secret、`.env` 値、raw local path、NAS path、private network details の出力
- production state への proposal data 昇格

## CodexApp で使うときのルール

CodexApp への routine request は日本語で作成します。契約フィールド名、
status、enum、ID、ファイル名、コード識別子は既存値を保持します。

CodexApp は routine template を実行命令として扱ってはいけません。許可される
出力は、人間レビュー用の report draft、TaskCard 修正案、Handoff 修正案、QA
note、archive 理由、draft instructions の下書きまでです。

CodexApp は次の場合に停止し、人間レビューに戻します。

- source TaskCard、Handoff、QA Report、context pack の参照が不足している。
- protected path、restricted content、high-risk operation が含まれる。
- routine request が A3 以上の autonomy を要求している。
- 実行、PR 作成、merge、deploy、API 更新、DB migration、runtime 追加、
  external API integration、file-writing automation を求めている。
- Codex App Server runtime の設計に進むためのユーザー提供資料がない。

## Codex App Server runtime について

Codex App Server runtime は、この v0 routine template PR では扱いません。
runtime 設計に進む場合は、ユーザー提供資料を受け取ってから、別 PR で scope、
検証、rollback、human approval gate を定義します。

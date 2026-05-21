This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) (or configured port) with your browser to see the result.

---

## ⚓ ホルムズ海峡監視モード (Hormuz Sentinel Mode)

リアルタイム世界予想システムに、地政学的要衝である「ホルムズ海峡」周辺の船舶トラフィック・環境状況・地政学ニュースを統合可視化する戦術監視ダッシュボードを追加しました。

### 1. Phase 1 (モック優先実装) について
現在、本機能は **Phase 1 (Mock-Priority Implementation)** として動作しています。
- デフォルト状態で外部APIキーは不要であり、完全にスタンドアロンでシミュレーション動作します。
- 外部API連携（AISStream, OpenWeather, OpenMeteo, GDELT, NewsAPI, ReliefWeb, ACLED等）は任意であり、後続Phaseで段階的に有効化されます。
- アダプター/プロバイダーの接続枠が実装されており、環境変数が未設定の場合は自動で安全にローカルモックが選択されます。

### 2. 推定情報と安全設計ポリシー
- **すべての情報は「推定（Estimated）」です**:
  船舶の積載貨物、航路、停止・徐行理由、AIS異常の疑い、ニュースによる資産価格への影響等はすべて統計的または論理的な推定値であり、信頼度（LOW / MEDIUM / HIGH）を伴って表示されます。
- **AIS異常表示のポリシー**:
  「GPSスプーフィング」等と断定せず、「AIS異常疑い」「位置ジャンプ検出」「通信遅延・受信誤差・データ欠損の可能性」として表示し、不確実性を表現します。
- **アクター・マトリクス**:
  周辺勢力（米国、イラン、サウジ、UAE、フーシ派）の関係性や対立意図を断定的に表示せず、ニュース内の言及状況・シグナル度合いをベースに可視化します。
- **模擬ニュースソースの徹底**:
  モックニュースには `[SIMULATED]` プレフィックスを付与し、実在する公式報道機関や軍組織に類似した名称（例: *COM5THFLT Intel*, *IRGC Press* 等）は使用せず、`Mock Scenario Feed` / `Demo Geopolitical Feed` / `Simulated Maritime News` のみを使用しています。
- **日本向けエネルギー船監視（推定）**:
  Phase 1では、日本向けのエネルギー船（原油タンカー / LNG・LPG船 / プロダクトタンカー）を **mock / AIS風推定** として強調表示し、積地国・積地港・推定貨物・日本側到着港・ホルムズ海峡通過履歴をAPIレスポンスに含めます。実際の航行判断、実物流確認、投資判断には使用しないでください。ローカルNAS保存は `JAPAN_BOUND_TANKER_NAS_LOG_ENABLED=true` の場合のみ行い、APIレスポンスにはローカル実パスを含めません。

### 3. 【重要】免責事項 (Disclaimer)
> [!WARNING]
> 本システムで提供されるすべてのデータおよび予測は、学習・デモンストレーションおよびシミュレーション目的のものであり、実際の海事航行判断、軍事防衛判断、金融投資判断等には**絶対に使用しないでください**。一切の責任を負いかねます。

### 4. 環境変数設定
APIキーやモックモードを制御するため、以下の環境変数を定義します（`.env.local` に記述可能）。
APIキーはすべてサーバー側で安全に処理され、クライアント（ブラウザ）へ露出することはありません。詳細な定義は `.env.example` を参照してください。

```bash
# モックデータ強制フラグ (Phase 1ではtrue推奨)
HORMUZ_USE_MOCK=true
HORMUZ_NEWS_USE_MOCK=true

# 日本向けエネルギー船ログのローカルNAS保存 (Phase 1ではfalse推奨)
JAPAN_BOUND_TANKER_NAS_LOG_ENABLED=false
JAPAN_BOUND_TANKER_NAS_LOG_INTERVAL_SECONDS=60

# 外部サービスAPIキー (オプション)
# GEMINI_API_KEY=your_gemini_api_key
# AISSTREAM_API_KEY=your_aisstream_key
# NEWSAPI_API_KEY=your_newsapi_api_key
```

**※ セキュリティ上の警告**: 本番運用時であっても、APIキーが含まれる `.env` や `.env.local` を絶対にGitHubなどの公開リポジトリにコミットしないでください。


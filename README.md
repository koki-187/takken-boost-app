# 宅建BOOST (Takken BOOST) - AI搭載宅建試験学習アプリ v4.1.0

## 🎯 プロジェクト概要
- **名称**: 宅建BOOST
- **目的**: 宅地建物取引士試験の合格を目指す学習者のための最先端AI学習プラットフォーム
- **バージョン**: 4.1.0
- **最終更新**: 2024年1月28日

## 🌐 アクセスURL
- **開発環境**: https://3000-ihzlg366tdp6nnglo8x25-6532622b.e2b.dev
- **本番環境**: (未デプロイ - Cloudflare Pages予定)
- **GitHub**: https://github.com/koki-187/takken-boost-app

## ✨ 主要機能

### ✅ 実装済み機能 (v4.1.0)
1. **📚 402問の問題データベース**
   - 4カテゴリー（権利関係、宅建業法、法令制限、税・その他）
   - 詳細な解説付き

2. **📖 学習モード**
   - カテゴリー別学習
   - 苦手問題集中学習
   - ランダム学習

3. **⏱️ 模擬試験機能**
   - 50問・2時間制限
   - カウントダウンタイマー
   - 一時停止/再開機能
   - 自動採点と分析

4. **📊 学習進捗管理**
   - 3Dビジュアライゼーション
   - 学習統計ダッシュボード
   - カレンダー機能

5. **🤖 AI機能**
   - 弱点分析
   - 学習アドバイス
   - 最適な学習順序の提案

6. **👤 ユーザー管理**
   - ユーザー登録/ログイン
   - ゲストモード
   - セッション管理

7. **📱 PWA対応**
   - オフライン対応
   - アプリインストール可能

8. **📘 取扱説明書機能** 🆕
   - アプリ内ヘルプシステム
   - インタラクティブチュートリアル
   - FAQ機能

## 📊 データアーキテクチャ

### ストレージサービス
- **Cloudflare D1 Database**: SQLiteベースのエッジデータベース
- **ローカル開発**: .wrangler/state/v3/d1 に自動生成

### データモデル
```
categories (4) → questions (402) → options (1608)
    ↓              ↓                   ↓
users → user_answers → weak_questions
    ↓
study_stats, exam_sessions, study_calendar
```

## 🛠️ 技術スタック
- **フロントエンド**: HTML5, CSS3, JavaScript, TailwindCSS
- **バックエンド**: Hono v4.9.9, Cloudflare Workers/Pages
- **データベース**: Cloudflare D1 (SQLite)
- **ビルドツール**: Vite, Wrangler
- **言語**: TypeScript v5.0.0

## 📋 API エンドポイント

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/` | メインページ |
| GET | `/api/manual/sections` | 取扱説明書セクション |
| GET | `/api/tutorial/steps` | チュートリアルステップ |
| GET | `/api/faq` | よくある質問 |

## 🚀 セットアップ手順

### 開発環境
```bash
# 1. 依存関係インストール
npm install

# 2. データベース初期化
npm run db:migrate:local

# 3. ビルド
npm run build

# 4. 開発サーバー起動
pm2 start ecosystem.config.cjs

# 5. アクセス
http://localhost:3000
```

### 本番デプロイ (Cloudflare Pages)
```bash
# 1. Cloudflare API Key設定
setup_cloudflare_api_key

# 2. D1データベース作成
npx wrangler d1 create takken-boost-db

# 3. プロジェクト作成
npx wrangler pages project create takken-boost

# 4. ビルド & デプロイ
npm run deploy:prod
```

## 📝 利用可能なスクリプト

```bash
npm run dev              # Vite開発サーバー
npm run build            # プロダクションビルド
npm run preview          # ビルドプレビュー
npm run deploy           # Cloudflareデプロイ
npm run db:migrate:local # ローカルDB初期化
npm run db:seed          # テストデータ投入
npm run clean-port       # ポート3000解放
```

## 🎮 使い方

### 基本的な使い方
1. **初回訪問時**: 自動的にチュートリアルが開始されます
2. **ヘルプ**: 画面右下の「？」ボタンまたはF1キーで取扱説明書を開く
3. **チュートリアル**: 画面左下の「🎓」ボタンでガイドツアーを開始

### 学習フロー
1. カテゴリー別学習で基礎を固める
2. 苦手問題を重点的に復習
3. 模擬試験で実力をチェック
4. AI分析で弱点を特定
5. 繰り返し学習で合格レベルへ

## 🔐 テストアカウント
- **メール**: test@example.com
- **パスワード**: test1234

## 📈 今後の開発予定

### 🔜 次期バージョン (v5.0.0)
- [ ] AI弱点分析の高度化
- [ ] 音声読み上げ機能
- [ ] ダークモード対応
- [ ] 学習グループ機能
- [ ] 詳細な統計レポート

### 🎯 長期計画
- [ ] 他資格試験への展開
- [ ] モバイルアプリ版
- [ ] ソーシャル学習機能
- [ ] プレミアムプラン

## 🐛 既知の問題
- 現在、重大な既知の問題はありません

## 🤝 コントリビューション
プルリクエストを歓迎します。大きな変更の場合は、まずissueを開いて変更内容を議論してください。

## 📄 ライセンス
[MIT License](LICENSE)

## 📞 サポート
問題が発生した場合は、GitHubのIssuesページで報告してください。

## 🏆 クレジット
- 開発者: 宅建BOOST Development Team
- デザイン: Modern UI/UX with 3D Effects
- アイコン: Font Awesome

## 📊 バージョン履歴
- **v4.1.0** (2024-01-28): 取扱説明書機能、インタラクティブチュートリアル追加
- **v4.0.0** (2024-01-27): 模擬試験タイマー、認証システム、PWA対応
- **v3.0.0** (2024-01-26): AI弱点分析、3D可視化機能
- **v2.0.0** (2024-01-25): カテゴリー別学習、苦手問題機能
- **v1.0.0** (2024-01-24): 初回リリース

---

**宅建試験合格に向けて、頑張りましょう！** 🚀✨
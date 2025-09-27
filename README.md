# 宅建BOOST アプリ開発リポジリ

## プロジェクト概要

このリポジトリは、宅地建物取引士試験学習アプリ「宅建BOOST」の開発に関連するすべてのファイルを管理します。Google Driveの整理を経て、開発効率の向上とチーム連携のスムーズ化を目指し、以下の目的で構成されています。

1.  **効率的な開発環境の構築**: ManusやGENSPARKなどのAIツールを活用し、開発を加速します。
2.  **容量の削減とファイルの整理**: 不要なファイルや重複データを排除し、必要なファイルのみを整理します。
3.  **開発プロセスの明確化**: 統一されたフォルダ構造と命名規則により、開発をスムーズに進めます。

## フォルダ構造

本リポジリは、以下の論理的なフォルダ構造で構成されています。

-   **01_試験問題集/**: すべての試験問題データを格納します。
    -   `questions_database.json`: 過去問300問の統合JSONデータ（最新版）
    -   `過去問_RAW_TXT/`: 過去問原本テキスト（①～⑥.txtを保存。参照用アーカイブ）
-   **02_UI_デザイン/**: デザイン関連ファイル（画像、フォントなど）を格納します。
    -   `logo_boost.png`: 「BOOST」ロゴ画像
    -   `icon_app_512.png`: アプリ用アイコン画像（512x512）
    -   `icon_app_192.png`: アプリアイコン画像（192x192）
-   **03_アプリ構築データ/**: ソースコード、設定ファイル、ビルド成果物などを格納します。
    -   `takken_boost_frontend.zip`: フロントエンド（Reactアプリ）ソース一式のZIP
    -   `takken_boost_api.zip`: バックエンド（Flask API）ソース一式のZIP
    -   `index.html`: フロントエンド公開用の単一HTML（PWAビルド出力）
-   **04_ドキュメント/**: 開発ドキュメント、仕様書、ガイド類などを格納します。
    -   `宅建BOOST_開発完了レポート.md`: プロジェクト開発完了報告書
    -   `宅建BOOST_設計仕様書.md`: システム設計仕様書
    -   `宅建BOOST_クイックスタートガイド.md`: 環境構築＆起動手順
    -   `宅建BOOST_引き継ぎガイド.md`: 運用引き継ぎ用ガイド
    -   `宅建BOOST_デプロイチェックリスト.md`: 最終デプロイ項目チェックリスト
    -   `宅建BOOST_機能拡張報告書.md`: システム改善・機能拡張に関する作業報告
    -   `宅建BOOST_システム状態レポート.md`: 稼働状況・統計等に関するレポート
-   **99_Archive/**: 不要または旧版データの保管場所です。

## 開発手順

### 1. リポジリのクローン

```bash
git clone https://github.com/koki-187/takken-boost-app.git
cd takken-boost-app
```

### 2. 依存関係のインストール

フロントエンド（React）とバックエンド（Flask）の依存関係をそれぞれインストールします。

#### フロントエンド (React)

```bash
# takken_boost_frontend.zip を展開後、該当ディレクトリに移動
cd path/to/frontend/app
npm install
# または yarn install
```

#### バックエンド (Flask)

```bash
# takken_boost_api.zip を展開後、該当ディレクトリに移動
cd path/to/backend/api
pip install -r requirements.txt
```

### 3. 環境変数の設定

`.env` ファイルを作成し、必要な環境変数を設定します。例:

```
# .env (例)
FLASK_APP=app.py
FLASK_ENV=development
DATABASE_URL=sqlite:///./test.db
```

### 4. アプリケーションの実行

#### フロントエンド

```bash
npm start
# または yarn start
```

#### バックエンド

```bash
flask run
```

### 5. データの更新

試験問題データ (`questions_database.json`) を更新する場合は、`01_試験問題集/` フォルダ内のファイルを直接編集するか、適切なスクリプトを使用して更新してください。

### 6. コミットとプッシュ

変更をコミットし、GitHubにプッシュします。

```bash
git add .
git commit -m "feat: Add new feature or fix bug"
git push origin master
```

## 注意事項

-   機密情報や個人情報はGitHubにアップロードしないでください。
-   `.gitignore` ファイルで指定されたファイルは追跡されません。
-   Google Drive上のファイルは整理済みですが、必要に応じてバックアップを確認してください。


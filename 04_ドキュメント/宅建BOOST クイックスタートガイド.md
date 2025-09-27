# 宅建BOOST クイックスタートガイド

## 🚀 すぐに始める

### 1. プロジェクトファイルの確認
```bash
ls -la /home/ubuntu/
# takken_boost_api/ と takken-boost-frontend/ があることを確認
```

### 2. バックエンドの起動
```bash
cd takken_boost_api
source venv/bin/activate
python src/main.py
```
→ http://localhost:5000 でバックエンドが起動

### 3. フロントエンドの起動（開発環境）
```bash
cd takken-boost-frontend
npm run dev -- --host
```
→ http://localhost:5173 でフロントエンドが起動

## 🌐 本番環境URL

- **バックエンド**: https://w5hni7cp69ze.manus.space
- **フロントエンド**: デプロイ準備完了（UIでPublishボタンをクリック）

## 📱 アプリの使い方

1. ブラウザでフロントエンドURLにアクセス
2. 「宅建BOOST」画面が表示される
3. 問題文を読んで1〜4の選択肢から回答を選択
4. 「解答する」ボタンをクリック
5. 正解と解説が表示される
6. 「次の問題へ」で次の問題に進む
7. 全問題完了後、スコアが表示される

## 🔧 トラブルシューティング

### バックエンドが起動しない
```bash
cd takken_boost_api
source venv/bin/activate
pip install -r requirements.txt
python src/database/init_db.py  # データベース再初期化
python src/main.py
```

### フロントエンドが起動しない
```bash
cd takken-boost-frontend
rm -rf node_modules
npm install
npm run dev -- --host
```

### データベースエラー
```bash
cd takken_boost_api
source venv/bin/activate
python src/database/init_db.py
```

## 📦 本番デプロイ

### フロントエンドのビルドとデプロイ
```bash
cd takken-boost-frontend
npm run build
# UIでPublishボタンをクリック
```

### バックエンドは既にデプロイ済み
- URL: https://w5hni7cp69ze.manus.space

## 📊 データベース情報

- **ファイル**: `takken_boost_api/questions.db`
- **問題数**: 30問
- **科目**: 権利関係、法令上の制限、税・その他、宅建業法、5問免除科目
- **時間帯**: 朝、昼、夜でバランス配分

## 🔍 API確認

```bash
# ヘルスチェック
curl https://w5hni7cp69ze.manus.space

# 問題データ取得
curl https://w5hni7cp69ze.manus.space/questions
```

## 📝 ファイル構成

```
takken_boost_api/
├── src/main.py          # メインアプリ
├── src/routes.py        # API定義
├── requirements.txt     # 依存関係
└── questions.db         # データベース

takken-boost-frontend/
├── src/App.jsx          # メインコンポーネント
├── public/manifest.json # PWA設定
├── dist/                # ビルド済み
└── package.json         # 依存関係
```

---

**何か問題が発生した場合は、HANDOVER_GUIDE.md を参照してください。**


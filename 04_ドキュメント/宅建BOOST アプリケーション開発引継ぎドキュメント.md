# 宅建BOOST アプリケーション開発引継ぎドキュメント

**作成者**: Manus AI  
**作成日**: 2025年9月27日  
**プロジェクト名**: 宅建BOOST（Takken BOOST）  
**デプロイURL**: https://58hpi8cpq6nx.manus.space

## 1. プロジェクト概要

宅建BOOST（Takken BOOST）は宅地建物取引士試験合格のための質問プロンプトシステムです。このアプリケーションは、受験者が効率的に学習できるよう設計されたWebベースの学習支援ツールです。

### 1.1 主要機能

- **質問表示システム**: データベースから質問を取得し、カテゴリ別に表示
- **回答機能**: 4択問題形式での回答選択
- **即座のフィードバック**: 正解・不正解の即座の表示と解説提供
- **学習進捗管理**: 正解率の表示と進捗追跡
- **レスポンシブデザイン**: デスクトップとモバイル両対応

### 1.2 技術スタック

**フロントエンド**:
- React 18.3.1
- Vite 6.3.5（ビルドツール）
- Tailwind CSS（スタイリング）
- shadcn/ui（UIコンポーネント）
- Lucide React（アイコン）

**バックエンド**:
- Flask 3.1.1（Webフレームワーク）
- SQLAlchemy（ORM）
- Flask-CORS（CORS対応）
- SQLite（データベース）

**デプロイメント**:
- Manus.space（ホスティングプラットフォーム）

## 2. プロジェクト構造

```
takken_boost_app/
├── takken_boost_api/           # バックエンド (Flask)
│   ├── src/
│   │   ├── main.py            # メインアプリケーション
│   │   ├── routes/
│   │   │   ├── user.py        # ユーザー関連API（テンプレート）
│   │   │   └── question.py    # 質問API定義
│   │   ├── models/
│   │   │   ├── user.py        # ユーザーデータモデル（テンプレート）
│   │   │   └── question.py    # 問題データモデル
│   │   ├── database/
│   │   │   └── app.db         # SQLiteデータベース
│   │   ├── static/            # フロントエンドビルドファイル
│   │   └── manage.py          # データベース初期化スクリプト
│   ├── venv/                  # Python仮想環境
│   └── requirements.txt       # Python依存関係
└── takken-boost-frontend/      # フロントエンド (React)
    ├── src/
    │   ├── App.jsx            # メインコンポーネント
    │   ├── App.css            # スタイル
    │   ├── main.jsx           # エントリーポイント
    │   └── components/ui/     # shadcn/uiコンポーネント
    ├── dist/                  # ビルド済みファイル
    ├── index.html             # HTMLテンプレート
    ├── vite.config.js         # Vite設定（プロキシ設定含む）
    └── package.json           # Node.js依存関係
```

## 3. 実装詳細

### 3.1 バックエンド実装

#### 3.1.1 データベースモデル

**Question モデル** (`src/models/question.py`):
```python
class Question(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    category = db.Column(db.String(100), nullable=False)
    question_text = db.Column(db.Text, nullable=False)
    correct_answer = db.Column(db.String(10), nullable=False)
    explanation = db.Column(db.Text, nullable=False)
    time_period = db.Column(db.String(50), nullable=False)
```

#### 3.1.2 API エンドポイント

**GET /api/questions**:
- 全問題データの取得
- JSON形式でのレスポンス
- CORS対応済み

#### 3.1.3 サンプルデータ

データベースには以下のカテゴリの質問が含まれています：
- 権利関係
- 法令上の制限
- 税・その他
- 宅建業法
- 5問免除科目

### 3.2 フロントエンド実装

#### 3.2.1 メインコンポーネント構造

**App.jsx** の主要な状態管理:
```javascript
const [questions, setQuestions] = useState([])
const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
const [selectedAnswer, setSelectedAnswer] = useState('')
const [showExplanation, setShowExplanation] = useState(false)
const [score, setScore] = useState(0)
const [answeredQuestions, setAnsweredQuestions] = useState(0)
```

#### 3.2.2 UI/UX 特徴

- **プログレスバー**: 学習進捗の視覚的表示
- **カテゴリバッジ**: 問題のカテゴリ分類表示
- **即座のフィードバック**: 回答後の正解・不正解表示
- **解説表示**: 各問題の詳細な解説
- **レスポンシブデザイン**: モバイルフレンドリーなレイアウト

### 3.3 デプロイメント設定

#### 3.3.1 ビルドプロセス

1. フロントエンドビルド: `pnpm run build`
2. 静的ファイルコピー: `dist/*` → `src/static/`
3. バックエンドデプロイ: Flask アプリケーションとして

#### 3.3.2 CORS設定

```python
from flask_cors import CORS
CORS(app)  # 全オリジンからのリクエストを許可
```

## 4. デプロイ情報

### 4.1 本番環境

- **URL**: https://58hpi8cpq6nx.manus.space
- **ホスティング**: Manus.space
- **デプロイ日**: 2025年9月27日
- **ステータス**: 正常稼働中

### 4.2 動作確認済み機能

✅ 質問データの正常な読み込み  
✅ 4択問題の表示と選択  
✅ 正解・不正解の判定と表示  
✅ 解説の表示  
✅ 進捗バーの更新  
✅ 正解率の計算と表示  
✅ 次の問題への遷移  
✅ レスポンシブデザインの動作  

## 5. 開発環境セットアップ手順

### 5.1 バックエンドセットアップ

```bash
# プロジェクトディレクトリに移動
cd takken_boost_app/takken_boost_api

# 仮想環境を有効化
source venv/bin/activate

# 依存関係をインストール
pip install -r requirements.txt

# データベースを初期化
python src/manage.py

# サーバーを起動
python src/main.py
```

### 5.2 フロントエンドセットアップ

```bash
# フロントエンドディレクトリに移動
cd takken_boost_app/takken-boost-frontend

# 依存関係をインストール
pnpm install

# 開発サーバーを起動
pnpm run dev --host

# ビルド（本番用）
pnpm run build
```

## 6. API ドキュメント

### 6.1 エンドポイント一覧

#### GET /api/questions
**説明**: 全問題データの取得  
**レスポンス形式**: JSON  
**サンプルレスポンス**:
```json
[
  {
    "id": 1,
    "category": "権利関係",
    "question_text": "問題文...",
    "correct_answer": "1",
    "explanation": "解説文...",
    "time_period": "morning"
  }
]
```

### 6.2 データベーススキーマ

```sql
CREATE TABLE questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL,
    question_text TEXT NOT NULL,
    correct_answer TEXT NOT NULL,
    explanation TEXT NOT NULL,
    time_period TEXT NOT NULL
);
```

## 7. 今後の改善点と拡張可能性

### 7.1 機能拡張

**優先度: 高**
- **ユーザー認証システム**: 個人の学習履歴管理
- **詳細な学習統計**: カテゴリ別正解率、学習時間追跡
- **問題数の拡充**: より多くの過去問題の追加
- **難易度別問題分類**: 基礎・応用・発展レベルの設定

**優先度: 中**
- **学習計画機能**: 試験日までの学習スケジュール作成
- **弱点分析機能**: 間違いやすい分野の特定と重点学習
- **模擬試験モード**: 本試験と同じ形式での模擬試験実施
- **解説の充実**: 図表や関連法令の参照追加

**優先度: 低**
- **ソーシャル機能**: 学習仲間との進捗共有
- **オフライン対応**: PWA化によるオフライン学習
- **音声読み上げ機能**: アクセシビリティ向上
- **多言語対応**: 外国人受験者への対応

### 7.2 技術的改善

**パフォーマンス最適化**
- 問題データの遅延読み込み（Lazy Loading）
- 画像最適化とCDN導入
- キャッシュ戦略の実装

**セキュリティ強化**
- API レート制限の実装
- セッション管理の強化
- データベース暗号化

**運用改善**
- ログ監視システムの導入
- 自動バックアップシステム
- エラー追跡とアラート機能

## 8. トラブルシューティング

### 8.1 よくある問題と解決方法

**問題**: フロントエンドで「質問データを読み込み中...」が続く
**解決方法**: 
1. バックエンドサーバーが起動しているか確認
2. CORS設定が正しく設定されているか確認
3. プロキシ設定（vite.config.js）を確認

**問題**: データベースエラーが発生する
**解決方法**:
1. `python src/manage.py` でデータベースを再初期化
2. 仮想環境が正しく有効化されているか確認

**問題**: デプロイ後にスタイルが適用されない
**解決方法**:
1. フロントエンドのビルドが正常に完了しているか確認
2. 静的ファイルが正しくコピーされているか確認

### 8.2 ログの確認方法

**バックエンドログ**:
- Flask開発サーバーのコンソール出力を確認
- エラーログは標準エラー出力に表示

**フロントエンドログ**:
- ブラウザの開発者ツールのコンソールを確認
- ネットワークタブでAPI通信を監視

## 9. 連絡先とサポート

### 9.1 技術サポート

このプロジェクトに関する技術的な質問や問題については、以下の情報を参考にしてください：

**プロジェクトファイル**: `/home/ubuntu/takken_boost_app/`  
**デプロイURL**: https://58hpi8cpq6nx.manus.space  
**開発環境**: Ubuntu 22.04, Python 3.11, Node.js 22.13.0

### 9.2 引継ぎ完了チェックリスト

- [x] プロジェクト構造の理解
- [x] 技術スタックの把握
- [x] ローカル開発環境のセットアップ方法
- [x] デプロイプロセスの理解
- [x] API仕様の確認
- [x] データベース構造の理解
- [x] 今後の改善点の把握

## 10. まとめ

宅建BOOSTアプリケーションは、現代的な技術スタックを使用して構築された、実用的で拡張性の高い学習支援システムです。React + Flask の組み合わせにより、保守性と開発効率を両立しています。

現在のバージョンでは基本的な学習機能が実装されており、ユーザーは効率的に宅建試験の学習を進めることができます。今後の機能拡張により、より包括的な学習プラットフォームへと発展させることが可能です。

デプロイされたアプリケーションは安定して動作しており、即座に利用開始できる状態です。継続的な改善と機能追加により、さらに価値の高い学習ツールとして成長させていくことができるでしょう。

---

**文書バージョン**: 1.0  
**最終更新**: 2025年9月27日  
**作成者**: Manus AI


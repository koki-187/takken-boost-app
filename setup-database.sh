#!/bin/bash

echo "🔧 宅建BOOST データベース完全セットアップスクリプト"
echo "================================================"

# 1. 既存のデータベースをクリア
echo "1️⃣ 既存データベースをクリア中..."
rm -rf .wrangler/state/v3/d1

# 2. 統合マイグレーションファイルを作成
echo "2️⃣ 統合マイグレーションファイルを作成中..."
cat > migrations/0001_complete_schema.sql << 'EOF'
-- 宅建BOOST 完全スキーマ定義 v7.0.0
-- =====================================

-- 1. ユーザーテーブル
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login_at DATETIME
);

-- 2. ユーザープロファイルテーブル
CREATE TABLE IF NOT EXISTS user_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE,
  study_goal TEXT DEFAULT '宅建試験合格',
  target_date DATE,
  daily_study_time INTEGER DEFAULT 60,
  notification_enabled BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 3. 問題テーブル
CREATE TABLE IF NOT EXISTS questions (
  id TEXT PRIMARY KEY,
  subject TEXT NOT NULL,
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  question_text TEXT NOT NULL,
  options TEXT NOT NULL,
  correct_answer INTEGER NOT NULL,
  explanation TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. 学習履歴テーブル
CREATE TABLE IF NOT EXISTS study_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  question_id TEXT NOT NULL,
  selected_answer INTEGER,
  is_correct BOOLEAN,
  time_spent INTEGER,
  studied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (question_id) REFERENCES questions(id)
);

-- 5. 模擬試験セッションテーブル
CREATE TABLE IF NOT EXISTS mock_exam_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  exam_type TEXT NOT NULL,
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER DEFAULT 0,
  time_spent INTEGER DEFAULT 0,
  score REAL DEFAULT 0,
  questions_data TEXT,
  started_at DATETIME NOT NULL,
  completed_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 6. AI分析結果テーブル
CREATE TABLE IF NOT EXISTS ai_analysis (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  analysis_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  weak_categories TEXT,
  strength_categories TEXT,
  recommended_topics TEXT,
  predicted_score REAL,
  study_recommendations TEXT,
  next_review_date DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_study_history_user ON study_history(user_id);
CREATE INDEX IF NOT EXISTS idx_questions_subject ON questions(subject);
CREATE INDEX IF NOT EXISTS idx_questions_category ON questions(category);
EOF

# 3. サンプルデータファイルを作成
echo "3️⃣ サンプル問題データを作成中..."
cat > migrations/0002_sample_data.sql << 'EOF'
-- サンプル問題データ（動作確認用）
INSERT INTO questions (id, subject, category, difficulty, question_text, options, correct_answer, explanation) VALUES
('Q001', 'rights', '民法', 'basic', 
'意思表示に関する次の記述のうち、民法の規定及び判例によれば、正しいものはどれか。',
'["意思表示は、表意者が意思を表示した時から効力を生ずる。", "相手方が正当な理由なく通知を拒絶したときは、通常到達すべきであった時に到達したものとみなされる。", "詐欺による意思表示は当然に無効となる。", "錯誤による意思表示は、重大な過失があっても取り消すことができる。"]',
2, '意思表示は到達主義が原則です。'),

('Q002', 'businessLaw', '宅建業法', 'basic',
'宅地建物取引業の免許の有効期間は何年か。',
'["3年", "5年", "7年", "10年"]',
2, '宅地建物取引業の免許の有効期間は5年間です。'),

('Q003', 'restrictions', '都市計画法', 'basic',
'市街化調整区域の説明として正しいものはどれか。',
'["すでに市街地を形成している区域", "市街化を抑制すべき区域", "優先的に市街化すべき区域", "市街化を促進すべき区域"]',
2, '市街化調整区域は市街化を抑制すべき区域です。'),

('Q004', 'taxOther', '税法', 'basic',
'不動産取得税を課すのは次のうちどれか。',
'["国", "都道府県", "市町村", "特別区"]',
2, '不動産取得税は都道府県が課す税金です。'),

('Q005', 'rights', '借地借家法', 'intermediate',
'普通建物賃貸借の更新拒絶通知の期間は？',
'["3ヶ月前から1ヶ月前", "6ヶ月前から3ヶ月前", "1年前から6ヶ月前", "2年前から1年前"]',
3, '更新拒絶通知は期間満了の1年前から6ヶ月前までに行う必要があります。');

-- デモユーザーを作成（パスワード: demo123）
INSERT INTO users (email, password_hash, name) VALUES
('demo@example.com', '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', 'デモユーザー');

INSERT INTO user_profiles (user_id, study_goal, target_date, daily_study_time) VALUES
(1, '宅建試験合格', date('now', '+6 months'), 60);
EOF

# 4. 古いマイグレーションファイルを移動
echo "4️⃣ 古いマイグレーションファイルをバックアップ中..."
mkdir -p migrations_backup
mv migrations/000*.sql migrations_backup/ 2>/dev/null || true

# 5. マイグレーション実行
echo "5️⃣ マイグレーションを実行中..."
npx wrangler d1 migrations apply takken-boost-production --local

echo "✅ データベースセットアップ完了！"
echo ""
echo "テスト用アカウント："
echo "  Email: demo@example.com"
echo "  Password: demo123"
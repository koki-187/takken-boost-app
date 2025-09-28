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

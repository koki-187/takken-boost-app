-- 問題テーブル
CREATE TABLE IF NOT EXISTS questions (
  id TEXT PRIMARY KEY,
  subject TEXT NOT NULL, -- rights, takken, regulations, tax_other
  category TEXT NOT NULL, -- 細分類（意思表示、代理など）
  difficulty TEXT NOT NULL, -- basic, intermediate, advanced
  time_slot TEXT, -- morning, afternoon
  question_text TEXT NOT NULL,
  options TEXT NOT NULL, -- JSON配列として保存
  correct_answer INTEGER NOT NULL,
  explanation TEXT,
  learning_points TEXT, -- JSON配列として保存
  tips TEXT,
  estimated_time INTEGER DEFAULT 180,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 学習履歴テーブル
CREATE TABLE IF NOT EXISTS study_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  question_id TEXT NOT NULL,
  selected_answer INTEGER,
  is_correct BOOLEAN,
  time_spent INTEGER, -- 秒単位
  studied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (question_id) REFERENCES questions(id)
);

-- 模擬試験セッションテーブル
CREATE TABLE IF NOT EXISTS mock_exam_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  exam_type TEXT NOT NULL, -- full (50問), mini (25問), category (カテゴリ別)
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL,
  time_spent INTEGER NOT NULL, -- 秒単位
  score REAL NOT NULL, -- パーセンテージ
  questions_data TEXT NOT NULL, -- JSON形式で問題IDと回答を保存
  started_at DATETIME NOT NULL,
  completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- AI分析結果テーブル
CREATE TABLE IF NOT EXISTS ai_analysis (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  analysis_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  weak_categories TEXT NOT NULL, -- JSON配列
  strength_categories TEXT NOT NULL, -- JSON配列
  recommended_topics TEXT NOT NULL, -- JSON配列
  predicted_score REAL,
  study_recommendations TEXT,
  next_review_date DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_questions_category ON questions(category);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_study_history_user_question ON study_history(user_id, question_id);
CREATE INDEX IF NOT EXISTS idx_mock_exam_sessions_user_id ON mock_exam_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_user_id ON ai_analysis(user_id);
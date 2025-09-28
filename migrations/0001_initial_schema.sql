-- カテゴリーテーブル
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 問題テーブル
CREATE TABLE IF NOT EXISTS questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  explanation TEXT,
  difficulty INTEGER DEFAULT 1, -- 1:易しい, 2:普通, 3:難しい
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- 選択肢テーブル
CREATE TABLE IF NOT EXISTS options (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question_id INTEGER NOT NULL,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT 0,
  display_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

-- ユーザーテーブル
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  is_guest BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME
);

-- 回答履歴テーブル
CREATE TABLE IF NOT EXISTS user_answers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  question_id INTEGER NOT NULL,
  selected_option_id INTEGER NOT NULL,
  is_correct BOOLEAN NOT NULL,
  answered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  time_spent INTEGER DEFAULT 0, -- 秒単位
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (question_id) REFERENCES questions(id),
  FOREIGN KEY (selected_option_id) REFERENCES options(id)
);

-- 苦手問題テーブル
CREATE TABLE IF NOT EXISTS weak_questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  question_id INTEGER NOT NULL,
  error_count INTEGER DEFAULT 0,
  last_error_date DATETIME,
  is_resolved BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (question_id) REFERENCES questions(id),
  UNIQUE(user_id, question_id)
);

-- 学習統計テーブル
CREATE TABLE IF NOT EXISTS study_stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  date DATE NOT NULL,
  study_time INTEGER DEFAULT 0, -- 秒単位
  questions_answered INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  categories_studied TEXT, -- JSON形式でカテゴリー別の統計を保存
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE(user_id, date)
);

-- 模擬試験セッションテーブル
CREATE TABLE IF NOT EXISTS exam_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  started_at DATETIME NOT NULL,
  completed_at DATETIME,
  time_limit INTEGER DEFAULT 7200, -- 秒単位（2時間）
  score INTEGER,
  total_questions INTEGER DEFAULT 50,
  is_completed BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 模擬試験回答テーブル
CREATE TABLE IF NOT EXISTS exam_answers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  exam_session_id INTEGER NOT NULL,
  question_id INTEGER NOT NULL,
  selected_option_id INTEGER,
  is_correct BOOLEAN,
  answered_at DATETIME,
  question_order INTEGER,
  FOREIGN KEY (exam_session_id) REFERENCES exam_sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES questions(id),
  FOREIGN KEY (selected_option_id) REFERENCES options(id)
);

-- 学習カレンダーテーブル
CREATE TABLE IF NOT EXISTS study_calendar (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  date DATE NOT NULL,
  study_goal TEXT,
  actual_study_time INTEGER DEFAULT 0,
  is_studied BOOLEAN DEFAULT 0,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE(user_id, date)
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_questions_category ON questions(category_id);
CREATE INDEX IF NOT EXISTS idx_user_answers_user ON user_answers(user_id);
CREATE INDEX IF NOT EXISTS idx_user_answers_question ON user_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_weak_questions_user ON weak_questions(user_id);
CREATE INDEX IF NOT EXISTS idx_study_stats_user_date ON study_stats(user_id, date);
CREATE INDEX IF NOT EXISTS idx_exam_sessions_user ON exam_sessions(user_id);

-- 初期カテゴリーデータの挿入
INSERT OR IGNORE INTO categories (id, name, description, display_order) VALUES 
  (1, '権利関係', '民法・借地借家法・区分所有法・不動産登記法など', 1),
  (2, '宅建業法', '宅地建物取引業法に関する問題', 2),
  (3, '法令上の制限', '都市計画法・建築基準法・国土利用計画法など', 3),
  (4, '税・その他', '税法・不動産鑑定評価・地価公示法など', 4);
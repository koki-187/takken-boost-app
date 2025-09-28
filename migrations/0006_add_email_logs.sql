-- Email logs table for tracking sent notifications
CREATE TABLE IF NOT EXISTS email_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  email_type TEXT NOT NULL,
  sent_at DATETIME NOT NULL,
  status TEXT DEFAULT 'sent',
  error_message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Add email preference columns to user_profiles
ALTER TABLE user_profiles ADD COLUMN email_welcome BOOLEAN DEFAULT 1;
ALTER TABLE user_profiles ADD COLUMN email_daily_reminder BOOLEAN DEFAULT 1;
ALTER TABLE user_profiles ADD COLUMN email_weekly_report BOOLEAN DEFAULT 1;
ALTER TABLE user_profiles ADD COLUMN email_achievements BOOLEAN DEFAULT 1;
ALTER TABLE user_profiles ADD COLUMN email_exam_results BOOLEAN DEFAULT 1;

-- Create index for email logs
CREATE INDEX IF NOT EXISTS idx_email_logs_user_id ON email_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON email_logs(sent_at);
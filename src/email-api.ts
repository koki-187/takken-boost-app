import { Hono } from 'hono'
import type { Bindings } from './index'

const emailRoutes = new Hono<{ Bindings: Bindings }>()

// Email templates
const emailTemplates = {
  welcome: (name: string) => ({
    subject: '宅建BOOSTへようこそ！',
    html: `
      <div style="font-family: 'Noto Sans JP', sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">宅建BOOST</h1>
          <p style="color: white; margin: 10px 0 0 0;">宅建試験合格への第一歩</p>
        </div>
        <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333;">こんにちは、${name}さん！</h2>
          <p style="color: #666; line-height: 1.8;">
            宅建BOOSTへの登録ありがとうございます。<br>
            これから一緒に宅建試験合格を目指しましょう！
          </p>
          <div style="background: #f7f7f7; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3 style="color: #667eea; margin-top: 0;">🎯 学習のコツ</h3>
            <ul style="color: #666; line-height: 1.8;">
              <li>毎日10問でも継続することが大切です</li>
              <li>苦手分野を重点的に学習しましょう</li>
              <li>模擬試験で実力を確認しましょう</li>
            </ul>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://takken-boost.pages.dev" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 30px; display: inline-block;">
              学習を始める
            </a>
          </div>
          <p style="color: #999; font-size: 0.9rem; text-align: center;">
            ご質問がある場合は、このメールに返信してください。
          </p>
        </div>
      </div>
    `
  }),

  dailyReminder: (name: string, stats: any) => ({
    subject: '今日も学習を続けましょう！',
    html: `
      <div style="font-family: 'Noto Sans JP', sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">今日の学習リマインダー</h1>
        </div>
        <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333;">${name}さん、今日も頑張りましょう！</h2>
          <div style="background: #f0f9ff; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3 style="color: #0077B6; margin-top: 0;">📊 あなたの学習統計</h3>
            <ul style="color: #666; line-height: 1.8; list-style: none; padding: 0;">
              <li>📚 総学習問題数: ${stats.total_answered || 0}問</li>
              <li>✅ 正答率: ${Math.round(stats.accuracy || 0)}%</li>
              <li>🔥 連続学習日数: ${stats.streak || 0}日</li>
            </ul>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://takken-boost.pages.dev" style="background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 30px; display: inline-block;">
              今すぐ学習する
            </a>
          </div>
        </div>
      </div>
    `
  }),

  examResult: (name: string, result: any) => ({
    subject: '模擬試験の結果',
    html: `
      <div style="font-family: 'Noto Sans JP', sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f6ad55 0%, #ed8936 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">模擬試験結果</h1>
        </div>
        <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333;">${name}さんの試験結果</h2>
          <div style="background: ${result.passed ? '#e6fffa' : '#fed7d7'}; padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center;">
            <h3 style="color: ${result.passed ? '#38a169' : '#e53e3e'}; margin: 0; font-size: 2rem;">
              ${result.passed ? '🎉 合格！' : '📝 もう少し！'}
            </h3>
            <p style="color: #666; margin: 10px 0 0 0; font-size: 1.5rem;">
              スコア: ${result.score}点 / ${result.totalQuestions}点
            </p>
            <p style="color: #999; margin: 5px 0 0 0;">
              正答率: ${Math.round((result.score / result.totalQuestions) * 100)}%
            </p>
          </div>
          <div style="background: #f7f7f7; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3 style="color: #667eea; margin-top: 0;">📈 カテゴリ別成績</h3>
            <ul style="color: #666; line-height: 1.8;">
              <li>権利関係: ${result.categoryScores?.rights || 0}%</li>
              <li>宅建業法: ${result.categoryScores?.businessLaw || 0}%</li>
              <li>法令制限: ${result.categoryScores?.restrictions || 0}%</li>
              <li>税法その他: ${result.categoryScores?.taxOther || 0}%</li>
            </ul>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://takken-boost.pages.dev/review/${result.examId}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 30px; display: inline-block;">
              詳細を確認する
            </a>
          </div>
        </div>
      </div>
    `
  }),

  achievementUnlocked: (name: string, achievement: string) => ({
    subject: '🏆 新しい実績を解除しました！',
    html: `
      <div style="font-family: 'Noto Sans JP', sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ffd700 0%, #ffb700 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">🏆 実績解除！</h1>
        </div>
        <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; text-align: center;">${name}さん、おめでとうございます！</h2>
          <div style="background: linear-gradient(135deg, #fff9e6 0%, #ffecb3 100%); padding: 30px; border-radius: 10px; margin: 20px 0; text-align: center; border: 2px solid #ffd700;">
            <h3 style="color: #ff9800; margin: 0; font-size: 1.8rem;">${achievement}</h3>
          </div>
          <p style="color: #666; text-align: center; line-height: 1.8;">
            素晴らしい成果です！<br>
            この調子で学習を続けていきましょう。
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://takken-boost.pages.dev/achievements" style="background: linear-gradient(135deg, #ffd700 0%, #ffb700 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 30px; display: inline-block;">
              全ての実績を見る
            </a>
          </div>
        </div>
      </div>
    `
  })
}

// Send email notification
emailRoutes.post('/email', async (c) => {
  try {
    const { type, userId, data } = await c.req.json()
    const { DB, SENDGRID_API_KEY } = c.env

    // Get user information
    const user = await DB.prepare(
      'SELECT email, name FROM users WHERE id = ?'
    ).bind(userId).first()

    if (!user) {
      return c.json({ success: false, error: 'User not found' }, 404)
    }

    // Select email template
    let emailContent
    switch (type) {
      case 'welcome':
        emailContent = emailTemplates.welcome(user.name || 'ユーザー')
        break
      case 'daily_reminder':
        const stats = await DB.prepare(`
          SELECT 
            COUNT(*) as total_answered,
            CAST(SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) AS REAL) / COUNT(*) * 100 as accuracy
          FROM study_history
          WHERE user_id = ?
        `).bind(userId).first()
        emailContent = emailTemplates.dailyReminder(user.name || 'ユーザー', stats)
        break
      case 'exam_result':
        emailContent = emailTemplates.examResult(user.name || 'ユーザー', data)
        break
      case 'achievement':
        emailContent = emailTemplates.achievementUnlocked(user.name || 'ユーザー', data.achievement)
        break
      default:
        return c.json({ success: false, error: 'Invalid email type' }, 400)
    }

    // Send email via SendGrid API (if configured)
    if (SENDGRID_API_KEY) {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SENDGRID_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalizations: [{
            to: [{ email: user.email }]
          }],
          from: {
            email: 'noreply@takken-boost.com',
            name: '宅建BOOST'
          },
          subject: emailContent.subject,
          content: [
            {
              type: 'text/html',
              value: emailContent.html
            }
          ]
        })
      })

      if (!response.ok) {
        console.error('SendGrid error:', await response.text())
        return c.json({ 
          success: false, 
          error: 'Failed to send email',
          details: 'SendGrid API error'
        }, 500)
      }
    }

    // Log email notification
    await DB.prepare(
      'INSERT INTO email_logs (user_id, email_type, sent_at) VALUES (?, ?, ?)'
    ).bind(userId, type, new Date().toISOString()).run()

    return c.json({ 
      success: true, 
      message: 'Email notification sent successfully'
    })

  } catch (error: any) {
    console.error('Email notification error:', error)
    return c.json({ 
      success: false, 
      error: error.message || 'Failed to send email notification'
    }, 500)
  }
})

// Get email preferences
emailRoutes.get('/preferences/:userId', async (c) => {
  try {
    const userId = c.req.param('userId')
    const { DB } = c.env

    const preferences = await DB.prepare(`
      SELECT 
        email_welcome,
        email_daily_reminder,
        email_weekly_report,
        email_achievements,
        email_exam_results
      FROM user_profiles
      WHERE user_id = ?
    `).bind(userId).first()

    return c.json({
      success: true,
      preferences: preferences || {
        email_welcome: true,
        email_daily_reminder: true,
        email_weekly_report: true,
        email_achievements: true,
        email_exam_results: true
      }
    })

  } catch (error: any) {
    console.error('Get preferences error:', error)
    return c.json({ 
      success: false, 
      error: error.message || 'Failed to get email preferences'
    }, 500)
  }
})

// Update email preferences
emailRoutes.put('/preferences/:userId', async (c) => {
  try {
    const userId = c.req.param('userId')
    const preferences = await c.req.json()
    const { DB } = c.env

    await DB.prepare(`
      UPDATE user_profiles
      SET 
        email_welcome = ?,
        email_daily_reminder = ?,
        email_weekly_report = ?,
        email_achievements = ?,
        email_exam_results = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `).bind(
      preferences.email_welcome ? 1 : 0,
      preferences.email_daily_reminder ? 1 : 0,
      preferences.email_weekly_report ? 1 : 0,
      preferences.email_achievements ? 1 : 0,
      preferences.email_exam_results ? 1 : 0,
      userId
    ).run()

    return c.json({
      success: true,
      message: 'Email preferences updated successfully'
    })

  } catch (error: any) {
    console.error('Update preferences error:', error)
    return c.json({ 
      success: false, 
      error: error.message || 'Failed to update email preferences'
    }, 500)
  }
})

export default emailRoutes
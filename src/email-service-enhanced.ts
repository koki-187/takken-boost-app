import { Hono } from 'hono'
import type { Bindings } from './index'

interface EmailBindings extends Bindings {
  SENDGRID_API_KEY?: string;
  NOTIFICATION_EMAIL?: string;
}

const emailRoutes = new Hono<{ Bindings: EmailBindings }>()

// SendGrid APIでメール送信
const sendEmail = async (
  apiKey: string,
  to: string,
  subject: string,
  htmlContent: string,
  textContent?: string
) => {
  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      personalizations: [{
        to: [{ email: to }],
        subject
      }],
      from: { 
        email: 'noreply@takken-boost.app', 
        name: '宅建BOOST' 
      },
      content: [
        {
          type: 'text/html',
          value: htmlContent
        },
        ...(textContent ? [{
          type: 'text/plain',
          value: textContent
        }] : [])
      ]
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`SendGrid API error: ${error}`)
  }

  return true
}

// 学習リマインダー送信
emailRoutes.post('/reminder/daily', async (c) => {
  const { userId } = await c.req.json()
  const { DB, SENDGRID_API_KEY } = c.env

  if (!SENDGRID_API_KEY) {
    return c.json({ 
      success: false, 
      error: 'メール機能が設定されていません' 
    }, 501)
  }

  try {
    // ユーザー情報と設定を取得
    const user = await DB.prepare(`
      SELECT u.email, u.name, up.notification_enabled, up.daily_study_time
      FROM users u
      JOIN user_profiles up ON u.id = up.user_id
      WHERE u.id = ? AND up.notification_enabled = 1
    `).bind(userId).first()

    if (!user) {
      return c.json({ 
        success: false, 
        error: '通知が無効またはユーザーが見つかりません' 
      }, 404)
    }

    // 今日の学習状況を取得
    const todayStats = await DB.prepare(`
      SELECT 
        COUNT(*) as questions_today,
        SUM(time_spent) / 60 as minutes_today
      FROM study_history
      WHERE user_id = ? AND DATE(studied_at) = DATE('now')
    `).bind(userId).first()

    // 学習提案を取得
    const recommendations = await DB.prepare(`
      SELECT category, COUNT(*) as count
      FROM questions q
      WHERE NOT EXISTS (
        SELECT 1 FROM study_history sh 
        WHERE sh.question_id = q.id AND sh.user_id = ?
      )
      GROUP BY category
      ORDER BY RANDOM()
      LIMIT 3
    `).bind(userId).all()

    const htmlContent = `
      <div style="font-family: 'Noto Sans JP', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #0096C7 0%, #0077B6 100%); 
                    color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">今日の学習リマインダー</h1>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none;">
          <p style="font-size: 16px; color: #333;">
            ${user.name || 'ユーザー'}様、こんにちは！
          </p>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #0077B6;">📊 本日の学習状況</h3>
            <ul style="list-style: none; padding: 0;">
              <li style="margin: 10px 0;">
                ✅ 解答済み問題: <strong>${todayStats?.questions_today || 0}問</strong>
              </li>
              <li style="margin: 10px 0;">
                ⏱️ 学習時間: <strong>${Math.round(todayStats?.minutes_today || 0)}分</strong>
              </li>
              <li style="margin: 10px 0;">
                🎯 目標時間: <strong>${user.daily_study_time}分</strong>
              </li>
            </ul>
          </div>
          
          <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #0077B6;">💡 今日のおすすめ学習分野</h3>
            <ol style="margin: 10px 0; padding-left: 20px;">
              ${recommendations.results?.map((r: any) => 
                `<li style="margin: 5px 0;">${r.category} (${r.count}問)</li>`
              ).join('') || '<li>全分野をバランスよく学習しましょう</li>'}
            </ol>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://takken-boost.pages.dev" 
               style="display: inline-block; background: #0077B6; color: white; 
                      padding: 15px 40px; text-decoration: none; border-radius: 8px; 
                      font-weight: bold; font-size: 16px;">
              学習を開始する
            </a>
          </div>
          
          <div style="border-top: 1px solid #e0e0e0; margin-top: 30px; padding-top: 20px; 
                      color: #666; font-size: 12px;">
            <p>このメールは宅建BOOSTから自動送信されています。</p>
            <p>通知設定の変更は<a href="https://takken-boost.pages.dev/settings" 
                              style="color: #0077B6;">こちら</a>から</p>
          </div>
        </div>
      </div>
    `

    await sendEmail(
      SENDGRID_API_KEY,
      user.email as string,
      '【宅建BOOST】今日の学習リマインダー',
      htmlContent
    )

    return c.json({
      success: true,
      message: 'リマインダーメールを送信しました'
    })

  } catch (error) {
    console.error('Reminder email error:', error)
    return c.json({ 
      success: false, 
      error: 'メール送信中にエラーが発生しました' 
    }, 500)
  }
})

// 週間レポート送信
emailRoutes.post('/report/weekly', async (c) => {
  const { userId } = await c.req.json()
  const { DB, SENDGRID_API_KEY } = c.env

  if (!SENDGRID_API_KEY) {
    return c.json({ 
      success: false, 
      error: 'メール機能が設定されていません' 
    }, 501)
  }

  try {
    const user = await DB.prepare(`
      SELECT email, name FROM users WHERE id = ?
    `).bind(userId).first()

    if (!user) {
      return c.json({ 
        success: false, 
        error: 'ユーザーが見つかりません' 
      }, 404)
    }

    // 週間統計を取得
    const weekStats = await DB.prepare(`
      SELECT 
        COUNT(*) as total_questions,
        SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct_answers,
        SUM(time_spent) / 60 as total_minutes,
        COUNT(DISTINCT DATE(studied_at)) as study_days
      FROM study_history
      WHERE user_id = ? AND studied_at >= datetime('now', '-7 days')
    `).bind(userId).first()

    // カテゴリー別成績
    const categoryPerformance = await DB.prepare(`
      SELECT 
        q.subject,
        COUNT(*) as attempts,
        CAST(SUM(CASE WHEN sh.is_correct = 1 THEN 1 ELSE 0 END) AS REAL) / COUNT(*) * 100 as accuracy
      FROM study_history sh
      JOIN questions q ON sh.question_id = q.id
      WHERE sh.user_id = ? AND sh.studied_at >= datetime('now', '-7 days')
      GROUP BY q.subject
      ORDER BY accuracy DESC
    `).bind(userId).all()

    const accuracy = weekStats?.total_questions > 0 
      ? Math.round((weekStats.correct_answers / weekStats.total_questions) * 100)
      : 0

    const htmlContent = `
      <div style="font-family: 'Noto Sans JP', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #0096C7 0%, #0077B6 100%); 
                    color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">週間学習レポート</h1>
          <p style="margin: 10px 0 0; opacity: 0.9;">
            ${new Date().toLocaleDateString('ja-JP')} までの1週間
          </p>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none;">
          <p style="font-size: 16px; color: #333;">
            ${user.name || 'ユーザー'}様、今週もお疲れ様でした！
          </p>
          
          <div style="background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%); 
                      padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #0077B6;">📈 週間成績サマリー</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
              <div style="background: white; padding: 15px; border-radius: 5px;">
                <div style="color: #666; font-size: 12px;">解答問題数</div>
                <div style="font-size: 24px; font-weight: bold; color: #0077B6;">
                  ${weekStats?.total_questions || 0}問
                </div>
              </div>
              <div style="background: white; padding: 15px; border-radius: 5px;">
                <div style="color: #666; font-size: 12px;">正答率</div>
                <div style="font-size: 24px; font-weight: bold; color: ${accuracy >= 70 ? '#4caf50' : '#ff9800'};">
                  ${accuracy}%
                </div>
              </div>
              <div style="background: white; padding: 15px; border-radius: 5px;">
                <div style="color: #666; font-size: 12px;">学習時間</div>
                <div style="font-size: 24px; font-weight: bold; color: #0077B6;">
                  ${Math.round(weekStats?.total_minutes || 0)}分
                </div>
              </div>
              <div style="background: white; padding: 15px; border-radius: 5px;">
                <div style="color: #666; font-size: 12px;">学習日数</div>
                <div style="font-size: 24px; font-weight: bold; color: #0077B6;">
                  ${weekStats?.study_days || 0}日
                </div>
              </div>
            </div>
          </div>
          
          <div style="background: #f9fbe7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #0077B6;">🏆 カテゴリー別成績</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="border-bottom: 2px solid #ddd;">
                  <th style="text-align: left; padding: 10px;">分野</th>
                  <th style="text-align: right; padding: 10px;">問題数</th>
                  <th style="text-align: right; padding: 10px;">正答率</th>
                </tr>
              </thead>
              <tbody>
                ${categoryPerformance.results?.map((c: any) => `
                  <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 10px;">${c.subject}</td>
                    <td style="text-align: right; padding: 10px;">${c.attempts}</td>
                    <td style="text-align: right; padding: 10px; color: ${c.accuracy >= 70 ? '#4caf50' : '#ff9800'};">
                      ${Math.round(c.accuracy)}%
                    </td>
                  </tr>
                `).join('') || '<tr><td colspan="3" style="text-align: center; padding: 20px;">データがありません</td></tr>'}
              </tbody>
            </table>
          </div>
          
          <div style="background: #e8f5e9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #4caf50;">💪 来週の目標</h3>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li>毎日最低30問解く</li>
              <li>正答率${Math.min(accuracy + 5, 85)}%を目指す</li>
              <li>苦手分野を重点的に復習</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://takken-boost.pages.dev" 
               style="display: inline-block; background: #4caf50; color: white; 
                      padding: 15px 40px; text-decoration: none; border-radius: 8px; 
                      font-weight: bold; font-size: 16px;">
              今週も頑張りましょう！
            </a>
          </div>
        </div>
      </div>
    `

    await sendEmail(
      SENDGRID_API_KEY,
      user.email as string,
      '【宅建BOOST】週間学習レポート',
      htmlContent
    )

    return c.json({
      success: true,
      message: '週間レポートを送信しました'
    })

  } catch (error) {
    console.error('Weekly report error:', error)
    return c.json({ 
      success: false, 
      error: 'レポート送信中にエラーが発生しました' 
    }, 500)
  }
})

// 合格祝賀メール
emailRoutes.post('/congratulations', async (c) => {
  const { userId, examScore, examType } = await c.req.json()
  const { DB, SENDGRID_API_KEY } = c.env

  if (!SENDGRID_API_KEY) {
    return c.json({ 
      success: false, 
      error: 'メール機能が設定されていません' 
    }, 501)
  }

  try {
    const user = await DB.prepare(`
      SELECT email, name FROM users WHERE id = ?
    `).bind(userId).first()

    if (!user || examScore < 70) {
      return c.json({ 
        success: false, 
        error: '送信条件を満たしていません' 
      }, 400)
    }

    const htmlContent = `
      <div style="font-family: 'Noto Sans JP', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #ffd700 0%, #ffb300 100%); 
                    color: #333; padding: 40px; border-radius: 10px; text-align: center;">
          <h1 style="margin: 0; font-size: 32px;">🎉 おめでとうございます！</h1>
          <p style="margin: 20px 0; font-size: 20px;">
            模擬試験で合格ラインを突破しました！
          </p>
        </div>
        
        <div style="background: white; padding: 30px; border: 2px solid #ffd700; border-top: none;">
          <div style="text-align: center; margin: 20px 0;">
            <div style="font-size: 48px; color: #ffd700;">🏆</div>
            <div style="font-size: 36px; font-weight: bold; color: #333; margin: 10px 0;">
              ${examScore}点
            </div>
            <div style="color: #666;">
              ${examType === 'full' ? '50問模擬試験' : '25問模擬試験'}
            </div>
          </div>
          
          <p style="font-size: 16px; color: #333; text-align: center; margin: 30px 0;">
            ${user.name || 'ユーザー'}様、素晴らしい成績です！<br>
            この調子で本番試験も頑張りましょう！
          </p>
          
          <div style="background: #fff3e0; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #ff6f00;">🔥 さらなる高みへ</h3>
            <p>合格ラインは突破しましたが、まだ成長の余地があります。</p>
            <ul>
              <li>苦手分野の克服で80点以上を目指しましょう</li>
              <li>時間配分の練習で余裕を持って解答できるように</li>
              <li>本番形式の模擬試験を定期的に受けましょう</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://takken-boost.pages.dev" 
               style="display: inline-block; background: linear-gradient(135deg, #ffd700 0%, #ffb300 100%); 
                      color: #333; padding: 15px 40px; text-decoration: none; border-radius: 8px; 
                      font-weight: bold; font-size: 16px;">
              次の模擬試験に挑戦
            </a>
          </div>
        </div>
      </div>
    `

    await sendEmail(
      SENDGRID_API_KEY,
      user.email as string,
      '【宅建BOOST】🎉 合格ライン突破おめでとうございます！',
      htmlContent
    )

    return c.json({
      success: true,
      message: '祝賀メールを送信しました'
    })

  } catch (error) {
    console.error('Congratulations email error:', error)
    return c.json({ 
      success: false, 
      error: 'メール送信中にエラーが発生しました' 
    }, 500)
  }
})

export default emailRoutes
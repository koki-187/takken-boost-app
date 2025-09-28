import { Hono } from 'hono'
import type { Bindings } from './index'

const authRoutes = new Hono<{ Bindings: Bindings }>()

// パスワードハッシュ化（簡易版 - 実際はbcryptなどを使用すべき）
const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder()
  const data = encoder.encode(password + 'takken-boost-salt-2024')
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// JWTトークン生成（簡易版）
const generateToken = (userId: number): string => {
  const payload = {
    userId,
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7) // 7日間有効
  }
  return btoa(JSON.stringify(payload))
}

// トークン検証
const verifyToken = (token: string): { userId: number } | null => {
  try {
    const payload = JSON.parse(atob(token))
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null // 期限切れ
    }
    return { userId: payload.userId }
  } catch {
    return null
  }
}

// ユーザー登録
authRoutes.post('/register', async (c) => {
  const { email, password, name } = await c.req.json()
  const { DB, SENDGRID_API_KEY, NOTIFICATION_EMAIL } = c.env

  // バリデーション
  if (!email || !password || password.length < 6) {
    return c.json({ 
      success: false, 
      error: 'メールアドレスと6文字以上のパスワードが必要です' 
    }, 400)
  }

  try {
    // 既存ユーザーチェック
    const existingUser = await DB.prepare(
      'SELECT id FROM users WHERE email = ?'
    ).bind(email).first()

    if (existingUser) {
      return c.json({ 
        success: false, 
        error: 'このメールアドレスは既に登録されています' 
      }, 400)
    }

    // パスワードをハッシュ化
    const hashedPassword = await hashPassword(password)

    // ユーザーを作成
    const result = await DB.prepare(`
      INSERT INTO users (email, password_hash, name, created_at) 
      VALUES (?, ?, ?, datetime('now'))
    `).bind(email, hashedPassword, name || '').run()

    const userId = result.meta.last_row_id

    // 初期プロファイル作成
    await DB.prepare(`
      INSERT INTO user_profiles (
        user_id, 
        study_goal, 
        target_date, 
        daily_study_time,
        notification_enabled
      ) VALUES (?, '宅建試験合格', date('now', '+6 months'), 60, 1)
    `).bind(userId).run()

    // トークン生成
    const token = generateToken(Number(userId))

    // メール通知（SendGrid使用 - オプション）
    if (SENDGRID_API_KEY && NOTIFICATION_EMAIL) {
      try {
        const emailData = {
          personalizations: [{
            to: [{ email }],
            subject: '宅建BOOST - 登録完了のお知らせ'
          }],
          from: { email: 'noreply@takken-boost.app', name: '宅建BOOST' },
          content: [{
            type: 'text/html',
            value: `
              <div style="font-family: 'Noto Sans JP', sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #0077B6;">宅建BOOSTへようこそ！</h2>
                <p>${name || 'ユーザー'}様</p>
                <p>この度は宅建BOOSTにご登録いただき、ありがとうございます。</p>
                <p>これから一緒に宅建試験合格を目指しましょう！</p>
                <hr style="border: 1px solid #e0e0e0; margin: 20px 0;">
                <h3>学習を始める</h3>
                <p>以下の機能をご利用いただけます：</p>
                <ul>
                  <li>402問の充実した問題データベース</li>
                  <li>カテゴリー別学習モード</li>
                  <li>模擬試験（50問・2時間）</li>
                  <li>AI学習分析</li>
                  <li>学習進捗グラフ</li>
                </ul>
                <p style="margin-top: 30px;">
                  <a href="https://takken-boost.pages.dev" 
                     style="background: #0077B6; color: white; padding: 12px 24px; 
                            text-decoration: none; border-radius: 8px; display: inline-block;">
                    学習を始める
                  </a>
                </p>
                <hr style="border: 1px solid #e0e0e0; margin: 20px 0;">
                <p style="color: #666; font-size: 12px;">
                  このメールは自動送信されています。<br>
                  お問い合わせ: support@takken-boost.app
                </p>
              </div>
            `
          }]
        }

        await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${SENDGRID_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(emailData)
        })

        // 管理者通知
        if (NOTIFICATION_EMAIL) {
          await fetch('https://api.sendgrid.com/v3/mail/send', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${SENDGRID_API_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              personalizations: [{
                to: [{ email: NOTIFICATION_EMAIL }],
                subject: `新規ユーザー登録: ${email}`
              }],
              from: { email: 'noreply@takken-boost.app', name: '宅建BOOST System' },
              content: [{
                type: 'text/plain',
                value: `新規ユーザーが登録されました。\n\nEmail: ${email}\nName: ${name || '未設定'}\n登録日時: ${new Date().toLocaleString('ja-JP')}`
              }]
            })
          })
        }
      } catch (emailError) {
        console.error('Email notification failed:', emailError)
        // メール送信失敗してもユーザー登録は成功とする
      }
    }

    return c.json({
      success: true,
      user: {
        id: userId,
        email,
        name: name || '',
        token
      },
      message: '登録が完了しました'
    })

  } catch (error) {
    console.error('Registration error:', error)
    return c.json({ 
      success: false, 
      error: '登録処理中にエラーが発生しました' 
    }, 500)
  }
})

// ログイン
authRoutes.post('/login', async (c) => {
  const { email, password } = await c.req.json()
  const { DB } = c.env

  try {
    // ユーザー検索
    const user = await DB.prepare(`
      SELECT id, email, name, password_hash 
      FROM users 
      WHERE email = ?
    `).bind(email).first()

    if (!user) {
      return c.json({ 
        success: false, 
        error: 'メールアドレスまたはパスワードが正しくありません' 
      }, 401)
    }

    // パスワード検証
    const hashedPassword = await hashPassword(password)
    if (hashedPassword !== user.password_hash) {
      return c.json({ 
        success: false, 
        error: 'メールアドレスまたはパスワードが正しくありません' 
      }, 401)
    }

    // 最終ログイン時刻更新
    await DB.prepare(`
      UPDATE users 
      SET last_login_at = datetime('now') 
      WHERE id = ?
    `).bind(user.id).run()

    // トークン生成
    const token = generateToken(user.id as number)

    // プロファイル情報取得
    const profile = await DB.prepare(`
      SELECT * FROM user_profiles WHERE user_id = ?
    `).bind(user.id).first()

    return c.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        token,
        profile
      },
      message: 'ログインしました'
    })

  } catch (error) {
    console.error('Login error:', error)
    return c.json({ 
      success: false, 
      error: 'ログイン処理中にエラーが発生しました' 
    }, 500)
  }
})

// トークン検証
authRoutes.post('/verify', async (c) => {
  const { token } = await c.req.json()
  
  const payload = verifyToken(token)
  if (!payload) {
    return c.json({ 
      success: false, 
      error: '無効なトークンです' 
    }, 401)
  }

  const { DB } = c.env
  
  try {
    const user = await DB.prepare(`
      SELECT id, email, name FROM users WHERE id = ?
    `).bind(payload.userId).first()

    if (!user) {
      return c.json({ 
        success: false, 
        error: 'ユーザーが見つかりません' 
      }, 404)
    }

    return c.json({
      success: true,
      user
    })

  } catch (error) {
    console.error('Token verification error:', error)
    return c.json({ 
      success: false, 
      error: 'トークン検証中にエラーが発生しました' 
    }, 500)
  }
})

// パスワードリセット
authRoutes.post('/reset-password', async (c) => {
  const { email } = await c.req.json()
  const { DB, SENDGRID_API_KEY } = c.env

  try {
    const user = await DB.prepare(`
      SELECT id, name FROM users WHERE email = ?
    `).bind(email).first()

    if (!user) {
      // セキュリティのため、ユーザーが存在しなくても成功レスポンスを返す
      return c.json({
        success: true,
        message: 'パスワードリセットメールを送信しました（登録されている場合）'
      })
    }

    // リセットトークン生成
    const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    const expires = new Date(Date.now() + 3600000) // 1時間後

    // トークンを保存（実際はpassword_reset_tokensテーブルが必要）
    // 簡易版のため省略

    // メール送信
    if (SENDGRID_API_KEY) {
      await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SENDGRID_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalizations: [{
            to: [{ email }],
            subject: '宅建BOOST - パスワードリセット'
          }],
          from: { email: 'noreply@takken-boost.app', name: '宅建BOOST' },
          content: [{
            type: 'text/html',
            value: `
              <div style="font-family: 'Noto Sans JP', sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #0077B6;">パスワードリセット</h2>
                <p>${user.name || 'ユーザー'}様</p>
                <p>パスワードリセットのリクエストを受け付けました。</p>
                <p>以下のリンクから新しいパスワードを設定してください：</p>
                <p style="margin: 20px 0;">
                  <a href="https://takken-boost.pages.dev/reset?token=${resetToken}" 
                     style="background: #0077B6; color: white; padding: 12px 24px; 
                            text-decoration: none; border-radius: 8px; display: inline-block;">
                    パスワードをリセット
                  </a>
                </p>
                <p style="color: #666;">このリンクは1時間有効です。</p>
                <p style="color: #666;">心当たりがない場合は、このメールを無視してください。</p>
              </div>
            `
          }]
        })
      })
    }

    return c.json({
      success: true,
      message: 'パスワードリセットメールを送信しました'
    })

  } catch (error) {
    console.error('Password reset error:', error)
    return c.json({ 
      success: false, 
      error: 'パスワードリセット処理中にエラーが発生しました' 
    }, 500)
  }
})

// プロファイル更新
authRoutes.put('/profile/:userId', async (c) => {
  const userId = c.req.param('userId')
  const updates = await c.req.json()
  const { DB } = c.env

  try {
    // ユーザー情報更新
    if (updates.name !== undefined) {
      await DB.prepare(`
        UPDATE users SET name = ? WHERE id = ?
      `).bind(updates.name, userId).run()
    }

    // プロファイル更新
    const profileUpdates = []
    const values = []
    
    if (updates.study_goal !== undefined) {
      profileUpdates.push('study_goal = ?')
      values.push(updates.study_goal)
    }
    if (updates.target_date !== undefined) {
      profileUpdates.push('target_date = ?')
      values.push(updates.target_date)
    }
    if (updates.daily_study_time !== undefined) {
      profileUpdates.push('daily_study_time = ?')
      values.push(updates.daily_study_time)
    }
    if (updates.notification_enabled !== undefined) {
      profileUpdates.push('notification_enabled = ?')
      values.push(updates.notification_enabled ? 1 : 0)
    }

    if (profileUpdates.length > 0) {
      values.push(userId)
      await DB.prepare(`
        UPDATE user_profiles 
        SET ${profileUpdates.join(', ')} 
        WHERE user_id = ?
      `).bind(...values).run()
    }

    return c.json({
      success: true,
      message: 'プロファイルを更新しました'
    })

  } catch (error) {
    console.error('Profile update error:', error)
    return c.json({ 
      success: false, 
      error: 'プロファイル更新中にエラーが発生しました' 
    }, 500)
  }
})

export default authRoutes
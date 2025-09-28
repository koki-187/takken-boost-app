import { Hono } from 'hono'
import type { Bindings } from './index'

const authRoutes = new Hono<{ Bindings: Bindings }>()

// Simple password hashing
const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// Register endpoint
authRoutes.post('/register', async (c) => {
  try {
    const { email, password, name } = await c.req.json()
    const { DB } = c.env

    if (!email || !password) {
      return c.json({ 
        success: false, 
        error: 'メールアドレスとパスワードは必須です' 
      }, 400)
    }

    // Check existing user
    const existing = await DB.prepare(
      'SELECT id FROM users WHERE email = ?'
    ).bind(email).first()

    if (existing) {
      return c.json({ 
        success: false, 
        error: 'このメールアドレスは既に登録されています' 
      }, 400)
    }

    // Hash password and create user
    const passwordHash = await hashPassword(password)
    
    const result = await DB.prepare(
      'INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)'
    ).bind(email, passwordHash, name || '').run()

    if (!result.success) {
      throw new Error('User creation failed')
    }

    const userId = result.meta.last_row_id

    // Create profile
    await DB.prepare(
      'INSERT INTO user_profiles (user_id) VALUES (?)'
    ).bind(userId).run()

    return c.json({
      success: true,
      message: '登録が完了しました',
      user: {
        id: userId,
        email,
        name: name || ''
      }
    })

  } catch (error: any) {
    console.error('Registration error:', error)
    return c.json({ 
      success: false, 
      error: error.message || '登録処理中にエラーが発生しました' 
    }, 500)
  }
})

// Login endpoint
authRoutes.post('/login', async (c) => {
  try {
    const { email, password } = await c.req.json()
    const { DB } = c.env

    if (!email || !password) {
      return c.json({ 
        success: false, 
        error: 'メールアドレスとパスワードを入力してください' 
      }, 400)
    }

    // Get user
    const user = await DB.prepare(
      'SELECT * FROM users WHERE email = ?'
    ).bind(email).first()

    if (!user) {
      return c.json({ 
        success: false, 
        error: 'メールアドレスまたはパスワードが正しくありません' 
      }, 401)
    }

    // Verify password
    const passwordHash = await hashPassword(password)
    if (passwordHash !== user.password_hash) {
      return c.json({ 
        success: false, 
        error: 'メールアドレスまたはパスワードが正しくありません' 
      }, 401)
    }

    // Update last login
    await DB.prepare(
      'UPDATE users SET last_login_at = datetime("now") WHERE id = ?'
    ).bind(user.id).run()

    return c.json({
      success: true,
      message: 'ログインしました',
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    })

  } catch (error: any) {
    console.error('Login error:', error)
    return c.json({ 
      success: false, 
      error: error.message || 'ログイン処理中にエラーが発生しました' 
    }, 500)
  }
})

export default authRoutes
import { Hono } from 'hono'
import type { Bindings } from './index'

const studyRoutes = new Hono<{ Bindings: Bindings }>()

// Get questions
studyRoutes.get('/questions', async (c) => {
  try {
    const { DB } = c.env
    const { category, difficulty, limit = 10 } = c.req.query()

    let query = 'SELECT * FROM questions WHERE 1=1'
    const params = []

    if (category) {
      query += ' AND category = ?'
      params.push(category)
    }

    if (difficulty) {
      query += ' AND difficulty = ?'
      params.push(difficulty)
    }

    query += ' ORDER BY RANDOM() LIMIT ?'
    params.push(parseInt(limit as string))

    const questions = await DB.prepare(query).bind(...params).all()

    return c.json({
      success: true,
      questions: questions.results || [],
      total: questions.results?.length || 0
    })

  } catch (error: any) {
    console.error('Questions fetch error:', error)
    return c.json({ 
      success: false, 
      error: error.message || '問題の取得に失敗しました' 
    }, 500)
  }
})

// Submit answer
studyRoutes.post('/answer', async (c) => {
  try {
    const { userId, questionId, selectedAnswer } = await c.req.json()
    const { DB } = c.env

    // Get correct answer
    const question = await DB.prepare(
      'SELECT correct_answer FROM questions WHERE id = ?'
    ).bind(questionId).first()

    if (!question) {
      return c.json({ 
        success: false, 
        error: '問題が見つかりません' 
      }, 404)
    }

    const isCorrect = question.correct_answer === selectedAnswer

    // Save to history (userId = 1 for demo)
    await DB.prepare(
      'INSERT INTO study_history (user_id, question_id, selected_answer, is_correct, time_spent) VALUES (?, ?, ?, ?, ?)'
    ).bind(userId || 1, questionId, selectedAnswer, isCorrect ? 1 : 0, 30).run()

    return c.json({
      success: true,
      isCorrect,
      correctAnswer: question.correct_answer
    })

  } catch (error: any) {
    console.error('Answer submission error:', error)
    return c.json({ 
      success: false, 
      error: error.message || '回答の送信に失敗しました' 
    }, 500)
  }
})

// Get user statistics
studyRoutes.get('/stats/:userId', async (c) => {
  try {
    const userId = c.req.param('userId')
    const { DB } = c.env

    const stats = await DB.prepare(`
      SELECT 
        COUNT(*) as total_answered,
        SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct_answers,
        CAST(SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) AS REAL) / COUNT(*) * 100 as accuracy
      FROM study_history
      WHERE user_id = ?
    `).bind(userId).first()

    return c.json({
      success: true,
      stats: stats || {
        total_answered: 0,
        correct_answers: 0,
        accuracy: 0
      }
    })

  } catch (error: any) {
    console.error('Stats fetch error:', error)
    return c.json({ 
      success: false, 
      error: error.message || '統計情報の取得に失敗しました' 
    }, 500)
  }
})

export default studyRoutes
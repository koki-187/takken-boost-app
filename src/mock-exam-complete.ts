import { Hono } from 'hono'
import type { Bindings } from './index'

const mockExamRoutes = new Hono<{ Bindings: Bindings }>()

// 模擬試験開始
mockExamRoutes.post('/start', async (c) => {
  try {
    const { userId = 1, examType = 'full' } = await c.req.json()
    const { DB } = c.env

    // 試験タイプに応じた問題数と時間制限
    const examConfig = {
      full: { questions: 50, timeLimit: 7200, distribution: { rights: 14, businessLaw: 20, restrictions: 8, taxOther: 8 } },
      mini: { questions: 25, timeLimit: 3600, distribution: { rights: 7, businessLaw: 10, restrictions: 4, taxOther: 4 } },
      quick: { questions: 10, timeLimit: 1200, distribution: { rights: 3, businessLaw: 4, restrictions: 2, taxOther: 1 } }
    }

    const config = examConfig[examType as keyof typeof examConfig] || examConfig.full

    // カテゴリー別に問題を取得
    const questionPromises = Object.entries(config.distribution).map(async ([subject, count]) => {
      const result = await DB.prepare(`
        SELECT id, subject, category, difficulty, question_text, options, correct_answer
        FROM questions 
        WHERE subject = ? 
        ORDER BY RANDOM() 
        LIMIT ?
      `).bind(subject, count).all()
      return result.results || []
    })

    const allQuestions = (await Promise.all(questionPromises)).flat()
    
    // ランダムに並び替え
    const shuffled = allQuestions.sort(() => Math.random() - 0.5)

    // セッション作成
    const sessionId = `EXAM_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const result = await DB.prepare(`
      INSERT INTO mock_exam_sessions (
        user_id, exam_type, total_questions, correct_answers,
        time_spent, score, questions_data, started_at
      ) VALUES (?, ?, ?, 0, 0, 0, ?, datetime('now'))
    `).bind(
      userId,
      examType,
      config.questions,
      JSON.stringify({ sessionId, questions: shuffled.map(q => q.id) })
    ).run()

    const examId = result.meta.last_row_id

    return c.json({
      success: true,
      examId,
      sessionId,
      examType,
      questions: shuffled,
      timeLimit: config.timeLimit,
      startedAt: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('Mock exam start error:', error)
    return c.json({ 
      success: false, 
      error: error.message || '模擬試験の開始に失敗しました' 
    }, 500)
  }
})

// 回答提出
mockExamRoutes.post('/submit', async (c) => {
  try {
    const { examId, answers, timeSpent } = await c.req.json()
    const { DB } = c.env

    // 採点処理
    let correctCount = 0
    const results = []

    for (const [questionId, selectedAnswer] of Object.entries(answers)) {
      const question = await DB.prepare(`
        SELECT correct_answer FROM questions WHERE id = ?
      `).bind(questionId).first()

      const isCorrect = question?.correct_answer === selectedAnswer
      if (isCorrect) correctCount++

      results.push({
        questionId,
        selectedAnswer,
        correctAnswer: question?.correct_answer,
        isCorrect
      })
    }

    const totalQuestions = Object.keys(answers).length
    const score = Math.round((correctCount / totalQuestions) * 100)

    // セッション更新
    await DB.prepare(`
      UPDATE mock_exam_sessions 
      SET correct_answers = ?,
          time_spent = ?,
          score = ?,
          questions_data = ?,
          completed_at = datetime('now')
      WHERE id = ?
    `).bind(
      correctCount,
      timeSpent,
      score,
      JSON.stringify({ answers, results }),
      examId
    ).run()

    return c.json({
      success: true,
      score,
      correctCount,
      totalQuestions,
      passStatus: score >= 70 ? '合格' : '不合格',
      results,
      message: score >= 70 ? 'おめでとうございます！合格ラインを突破しました！' : '惜しい！もう少しで合格ラインです。'
    })

  } catch (error: any) {
    console.error('Exam submission error:', error)
    return c.json({ 
      success: false, 
      error: error.message || '採点処理に失敗しました' 
    }, 500)
  }
})

// 試験履歴取得
mockExamRoutes.get('/history/:userId', async (c) => {
  try {
    const userId = c.req.param('userId')
    const { DB } = c.env

    const history = await DB.prepare(`
      SELECT 
        id,
        exam_type,
        total_questions,
        correct_answers,
        time_spent,
        score,
        started_at,
        completed_at,
        CASE 
          WHEN score >= 70 THEN '合格'
          ELSE '不合格'
        END as status
      FROM mock_exam_sessions
      WHERE user_id = ? AND completed_at IS NOT NULL
      ORDER BY completed_at DESC
      LIMIT 20
    `).bind(userId).all()

    // 統計情報も取得
    const stats = await DB.prepare(`
      SELECT 
        COUNT(*) as total_exams,
        AVG(score) as avg_score,
        MAX(score) as best_score,
        SUM(CASE WHEN score >= 70 THEN 1 ELSE 0 END) as pass_count
      FROM mock_exam_sessions
      WHERE user_id = ? AND completed_at IS NOT NULL
    `).bind(userId).first()

    return c.json({
      success: true,
      history: history.results || [],
      stats: stats || { total_exams: 0, avg_score: 0, best_score: 0, pass_count: 0 }
    })

  } catch (error: any) {
    console.error('History fetch error:', error)
    return c.json({ 
      success: false, 
      error: error.message || '履歴の取得に失敗しました' 
    }, 500)
  }
})

export default mockExamRoutes
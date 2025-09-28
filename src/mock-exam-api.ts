import { Hono } from 'hono'
import type { Bindings } from './index'

const mockExamRoutes = new Hono<{ Bindings: Bindings }>()

// 模擬試験セッション開始
mockExamRoutes.post('/start', async (c) => {
  const { userId, examType = 'full' } = await c.req.json()
  const { DB } = c.env

  try {
    // 試験タイプに応じて問題数を設定
    const questionCount = examType === 'full' ? 50 : examType === 'mini' ? 25 : 10
    
    // ランダムに問題を選択（カテゴリーバランスを考慮）
    const questions = await DB.prepare(`
      WITH category_counts AS (
        SELECT 
          subject,
          COUNT(*) as total,
          CASE 
            WHEN ? = 50 THEN
              CASE subject
                WHEN 'rights' THEN 14
                WHEN 'restrictions' THEN 8
                WHEN 'businessLaw' THEN 20
                WHEN 'taxOther' THEN 8
              END
            WHEN ? = 25 THEN
              CASE subject
                WHEN 'rights' THEN 7
                WHEN 'restrictions' THEN 4
                WHEN 'businessLaw' THEN 10
                WHEN 'taxOther' THEN 4
              END
            ELSE
              CASE subject
                WHEN 'rights' THEN 3
                WHEN 'restrictions' THEN 2
                WHEN 'businessLaw' THEN 3
                WHEN 'taxOther' THEN 2
              END
          END as needed_count
        FROM questions
        GROUP BY subject
      ),
      selected_questions AS (
        SELECT q.*, ROW_NUMBER() OVER (PARTITION BY q.subject ORDER BY RANDOM()) as rn
        FROM questions q
        JOIN category_counts cc ON q.subject = cc.subject
      )
      SELECT id, subject, category, difficulty, question_text, options, correct_answer, estimated_time
      FROM selected_questions sq
      JOIN category_counts cc ON sq.subject = cc.subject
      WHERE sq.rn <= cc.needed_count
      ORDER BY RANDOM()
    `).bind(questionCount, questionCount).all()

    // セッション情報を作成
    const sessionId = `EXAM_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const session = {
      sessionId,
      userId,
      examType,
      questionCount,
      questions: questions.results,
      startedAt: new Date().toISOString(),
      timeLimit: examType === 'full' ? 7200 : examType === 'mini' ? 3600 : 1200, // 秒単位
      answers: {},
      currentIndex: 0
    }

    // セッションをデータベースに保存
    await DB.prepare(`
      INSERT INTO mock_exam_sessions (
        user_id, exam_type, total_questions, correct_answers, 
        time_spent, score, questions_data, started_at
      ) VALUES (?, ?, ?, 0, 0, 0, ?, datetime('now'))
    `).bind(
      userId, 
      examType, 
      questionCount,
      JSON.stringify(session)
    ).run()

    return c.json({ 
      success: true, 
      session,
      message: '模擬試験を開始しました'
    })
  } catch (error) {
    console.error('Mock exam start error:', error)
    return c.json({ success: false, error: 'Failed to start mock exam' }, 500)
  }
})

// 回答を送信
mockExamRoutes.post('/answer', async (c) => {
  const { sessionId, questionId, selectedAnswer, timeSpent } = await c.req.json()
  const { DB } = c.env

  try {
    // 正解確認
    const question = await DB.prepare(`
      SELECT correct_answer FROM questions WHERE id = ?
    `).bind(questionId).first()

    const isCorrect = question?.correct_answer === selectedAnswer

    // 学習履歴に記録
    // Note: user_idはセッションから取得する必要があるが、簡略化のため省略
    await DB.prepare(`
      INSERT INTO study_history (
        user_id, question_id, selected_answer, is_correct, time_spent
      ) VALUES (1, ?, ?, ?, ?)
    `).bind(questionId, selectedAnswer, isCorrect ? 1 : 0, timeSpent).run()

    return c.json({
      success: true,
      isCorrect,
      correctAnswer: question?.correct_answer
    })
  } catch (error) {
    console.error('Answer submission error:', error)
    return c.json({ success: false, error: 'Failed to submit answer' }, 500)
  }
})

// 模擬試験完了
mockExamRoutes.post('/complete', async (c) => {
  const { sessionId, userId, answers, totalTimeSpent } = await c.req.json()
  const { DB } = c.env

  try {
    // 採点処理
    let correctCount = 0
    const questionIds = Object.keys(answers)
    
    for (const questionId of questionIds) {
      const question = await DB.prepare(`
        SELECT correct_answer FROM questions WHERE id = ?
      `).bind(questionId).first()
      
      if (question && question.correct_answer === answers[questionId]) {
        correctCount++
      }
    }

    const score = (correctCount / questionIds.length) * 100

    // セッション更新
    await DB.prepare(`
      UPDATE mock_exam_sessions 
      SET correct_answers = ?, 
          time_spent = ?, 
          score = ?, 
          questions_data = ?,
          completed_at = datetime('now')
      WHERE user_id = ? 
      ORDER BY started_at DESC 
      LIMIT 1
    `).bind(
      correctCount,
      totalTimeSpent,
      score,
      JSON.stringify({ answers, questionIds }),
      userId
    ).run()

    // AI分析をトリガー（後で実装）
    const analysis = {
      score,
      correctCount,
      totalQuestions: questionIds.length,
      passStatus: score >= 70 ? '合格' : '不合格',
      timeEfficiency: totalTimeSpent < (questionIds.length * 144) ? '良好' : '要改善'
    }

    return c.json({
      success: true,
      result: {
        score,
        correctCount,
        totalQuestions: questionIds.length,
        passStatus: analysis.passStatus,
        timeEfficiency: analysis.timeEfficiency,
        analysis
      }
    })
  } catch (error) {
    console.error('Exam completion error:', error)
    return c.json({ success: false, error: 'Failed to complete exam' }, 500)
  }
})

// 過去の模擬試験結果取得
mockExamRoutes.get('/history/:userId', async (c) => {
  const userId = c.req.param('userId')
  const { DB } = c.env

  try {
    const history = await DB.prepare(`
      SELECT 
        id,
        exam_type,
        total_questions,
        correct_answers,
        time_spent,
        score,
        started_at,
        completed_at
      FROM mock_exam_sessions
      WHERE user_id = ?
      ORDER BY completed_at DESC
      LIMIT 20
    `).bind(userId).all()

    return c.json({
      success: true,
      history: history.results
    })
  } catch (error) {
    console.error('History fetch error:', error)
    return c.json({ success: false, error: 'Failed to fetch exam history' }, 500)
  }
})

// 試験統計情報取得
mockExamRoutes.get('/stats/:userId', async (c) => {
  const userId = c.req.param('userId')
  const { DB } = c.env

  try {
    const stats = await DB.prepare(`
      SELECT 
        COUNT(*) as total_exams,
        AVG(score) as average_score,
        MAX(score) as best_score,
        MIN(score) as worst_score,
        AVG(time_spent) as average_time,
        SUM(CASE WHEN score >= 70 THEN 1 ELSE 0 END) as pass_count,
        COUNT(CASE WHEN completed_at >= datetime('now', '-7 days') THEN 1 END) as recent_exams
      FROM mock_exam_sessions
      WHERE user_id = ? AND completed_at IS NOT NULL
    `).bind(userId).first()

    // カテゴリー別正答率
    const categoryStats = await DB.prepare(`
      SELECT 
        q.subject,
        COUNT(*) as total_questions,
        SUM(CASE WHEN sh.is_correct = 1 THEN 1 ELSE 0 END) as correct_answers,
        CAST(SUM(CASE WHEN sh.is_correct = 1 THEN 1 ELSE 0 END) AS REAL) / COUNT(*) * 100 as accuracy_rate
      FROM study_history sh
      JOIN questions q ON sh.question_id = q.id
      WHERE sh.user_id = ?
      GROUP BY q.subject
    `).bind(userId).all()

    return c.json({
      success: true,
      stats: {
        overall: stats,
        byCategory: categoryStats.results
      }
    })
  } catch (error) {
    console.error('Stats fetch error:', error)
    return c.json({ success: false, error: 'Failed to fetch stats' }, 500)
  }
})

export default mockExamRoutes
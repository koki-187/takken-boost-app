// 学習機能API for 宅建BOOST
import { Hono } from 'hono'
import { Bindings } from './index'

export const studyRoutes = new Hono<{ Bindings: Bindings }>()

// カテゴリー別問題取得
studyRoutes.get('/questions/category/:category', async (c) => {
  try {
    const category = c.req.param('category')
    const limit = parseInt(c.req.query('limit') || '10')
    const offset = parseInt(c.req.query('offset') || '0')
    
    const db = c.env.DB
    
    const questions = await db.prepare(`
      SELECT id, subject, category, difficulty, question_text, 
             options, correct_answer, explanation, learning_points, tips
      FROM questions 
      WHERE subject = ? OR category = ?
      LIMIT ? OFFSET ?
    `).bind(category, category, limit, offset).all()
    
    return c.json({
      success: true,
      category,
      questions: questions.results,
      total: questions.results.length
    })
  } catch (error) {
    console.error('Error fetching questions:', error)
    return c.json({ error: '問題の取得に失敗しました' }, 500)
  }
})

// 問題詳細取得
studyRoutes.get('/questions/:id', async (c) => {
  try {
    const questionId = c.req.param('id')
    const db = c.env.DB
    
    const question = await db.prepare(`
      SELECT * FROM questions WHERE id = ?
    `).bind(questionId).first()
    
    if (!question) {
      return c.json({ error: '問題が見つかりません' }, 404)
    }
    
    // JSONパースが必要な項目を処理
    question.options = JSON.parse(question.options as string)
    question.learning_points = JSON.parse(question.learning_points as string)
    
    return c.json({
      success: true,
      question
    })
  } catch (error) {
    console.error('Error fetching question:', error)
    return c.json({ error: '問題の取得に失敗しました' }, 500)
  }
})

// 回答送信と記録
studyRoutes.post('/answer', async (c) => {
  try {
    const { userId, questionId, selectedAnswer, timeSpent } = await c.req.json()
    
    if (!userId || !questionId || selectedAnswer === undefined) {
      return c.json({ error: '必要なパラメータが不足しています' }, 400)
    }
    
    const db = c.env.DB
    
    // 正解を確認
    const question = await db.prepare(`
      SELECT correct_answer FROM questions WHERE id = ?
    `).bind(questionId).first()
    
    if (!question) {
      return c.json({ error: '問題が見つかりません' }, 404)
    }
    
    const isCorrect = selectedAnswer === question.correct_answer
    
    // 学習履歴を記録
    await db.prepare(`
      INSERT INTO study_history (user_id, question_id, selected_answer, is_correct, time_spent)
      VALUES (?, ?, ?, ?, ?)
    `).bind(userId, questionId, selectedAnswer, isCorrect ? 1 : 0, timeSpent || 0).run()
    
    // 苦手問題の更新
    if (!isCorrect) {
      await db.prepare(`
        INSERT INTO weak_questions (user_id, question_id, incorrect_count)
        VALUES (?, ?, 1)
        ON CONFLICT(user_id, question_id) 
        DO UPDATE SET 
          incorrect_count = incorrect_count + 1,
          last_attempted_at = CURRENT_TIMESTAMP
      `).bind(userId, questionId).run()
    }
    
    // 学習進捗の更新
    const subject = await db.prepare(`
      SELECT subject FROM questions WHERE id = ?
    `).bind(questionId).first()
    
    if (subject) {
      await db.prepare(`
        INSERT INTO study_progress (user_id, category, total_questions, correct_answers, incorrect_answers)
        VALUES (?, ?, 1, ?, ?)
        ON CONFLICT(user_id, category)
        DO UPDATE SET
          total_questions = total_questions + 1,
          correct_answers = correct_answers + ?,
          incorrect_answers = incorrect_answers + ?,
          last_studied_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      `).bind(
        userId, 
        subject.subject, 
        isCorrect ? 1 : 0, 
        isCorrect ? 0 : 1,
        isCorrect ? 1 : 0,
        isCorrect ? 0 : 1
      ).run()
    }
    
    return c.json({
      success: true,
      isCorrect,
      correctAnswer: question.correct_answer,
      message: isCorrect ? '正解です！' : '不正解です。復習しましょう。'
    })
  } catch (error) {
    console.error('Error submitting answer:', error)
    return c.json({ error: '回答の送信に失敗しました' }, 500)
  }
})

// 模擬試験開始
studyRoutes.post('/mock-exam/start', async (c) => {
  try {
    const { userId, examType = 'full' } = await c.req.json()
    
    if (!userId) {
      return c.json({ error: 'ユーザーIDが必要です' }, 400)
    }
    
    const db = c.env.DB
    
    // 試験タイプに応じた問題数を設定
    const questionCount = examType === 'full' ? 50 : examType === 'mini' ? 25 : 10
    
    // ランダムに問題を選択（カテゴリーバランスを考慮）
    const questions = await db.prepare(`
      SELECT id, subject, category, difficulty, question_text, 
             options, correct_answer, estimated_time
      FROM questions
      ORDER BY RANDOM()
      LIMIT ?
    `).bind(questionCount).all()
    
    // 問題IDのリストを作成
    const questionIds = questions.results.map(q => q.id)
    
    // セッションを作成
    const sessionResult = await db.prepare(`
      INSERT INTO mock_exam_sessions 
      (user_id, exam_type, total_questions, correct_answers, time_spent, score, questions_data, started_at)
      VALUES (?, ?, ?, 0, 0, 0, ?, CURRENT_TIMESTAMP)
    `).bind(userId, examType, questionCount, JSON.stringify(questionIds)).run()
    
    // optionsをパース
    const processedQuestions = questions.results.map(q => ({
      ...q,
      options: JSON.parse(q.options as string)
    }))
    
    return c.json({
      success: true,
      sessionId: sessionResult.meta.last_row_id,
      examType,
      questions: processedQuestions,
      timeLimit: examType === 'full' ? 7200 : examType === 'mini' ? 3600 : 1800 // 秒
    })
  } catch (error) {
    console.error('Error starting mock exam:', error)
    return c.json({ error: '模擬試験の開始に失敗しました' }, 500)
  }
})

// 模擬試験結果送信
studyRoutes.post('/mock-exam/submit', async (c) => {
  try {
    const { sessionId, answers, timeSpent } = await c.req.json()
    
    if (!sessionId || !answers) {
      return c.json({ error: '必要なパラメータが不足しています' }, 400)
    }
    
    const db = c.env.DB
    
    // セッション情報を取得
    const session = await db.prepare(`
      SELECT * FROM mock_exam_sessions WHERE id = ?
    `).bind(sessionId).first()
    
    if (!session) {
      return c.json({ error: 'セッションが見つかりません' }, 404)
    }
    
    // 正解数を計算
    let correctCount = 0
    const questionIds = JSON.parse(session.questions_data as string)
    
    for (const [questionId, selectedAnswer] of Object.entries(answers)) {
      const question = await db.prepare(`
        SELECT correct_answer FROM questions WHERE id = ?
      `).bind(questionId).first()
      
      if (question && question.correct_answer === selectedAnswer) {
        correctCount++
      }
    }
    
    const score = (correctCount / session.total_questions) * 100
    
    // セッションを更新
    await db.prepare(`
      UPDATE mock_exam_sessions 
      SET correct_answers = ?, time_spent = ?, score = ?, completed_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(correctCount, timeSpent, score, sessionId).run()
    
    // 結果をmock_exam_resultsテーブルにも保存
    await db.prepare(`
      INSERT INTO mock_exam_results (user_id, score, total_questions, time_taken_seconds, exam_date)
      VALUES ((SELECT user_id FROM mock_exam_sessions WHERE id = ?), ?, ?, ?, CURRENT_TIMESTAMP)
    `).bind(sessionId, Math.round(score), session.total_questions, timeSpent).run()
    
    return c.json({
      success: true,
      result: {
        totalQuestions: session.total_questions,
        correctAnswers: correctCount,
        incorrectAnswers: session.total_questions - correctCount,
        score: Math.round(score),
        timeSpent,
        passed: score >= 70 // 70%以上で合格
      }
    })
  } catch (error) {
    console.error('Error submitting mock exam:', error)
    return c.json({ error: '模擬試験の提出に失敗しました' }, 500)
  }
})

// 学習統計取得
studyRoutes.get('/statistics/:userId', async (c) => {
  try {
    const userId = c.req.param('userId')
    const db = c.env.DB
    
    // カテゴリー別進捗
    const categoryProgress = await db.prepare(`
      SELECT category, total_questions, correct_answers, incorrect_answers,
             ROUND(CAST(correct_answers AS REAL) / NULLIF(total_questions, 0) * 100, 1) as accuracy_rate
      FROM study_progress
      WHERE user_id = ?
      ORDER BY category
    `).bind(userId).all()
    
    // 最近の模擬試験結果
    const mockExamResults = await db.prepare(`
      SELECT score, total_questions, time_taken_seconds, exam_date
      FROM mock_exam_results
      WHERE user_id = ?
      ORDER BY exam_date DESC
      LIMIT 10
    `).bind(userId).all()
    
    // 苦手問題
    const weakQuestions = await db.prepare(`
      SELECT wq.question_id, wq.incorrect_count, q.category, q.question_text
      FROM weak_questions wq
      JOIN questions q ON wq.question_id = q.id
      WHERE wq.user_id = ?
      ORDER BY wq.incorrect_count DESC
      LIMIT 10
    `).bind(userId).all()
    
    // 総合統計
    const totalStats = await db.prepare(`
      SELECT 
        SUM(total_questions) as total_studied,
        SUM(correct_answers) as total_correct,
        ROUND(AVG(CAST(correct_answers AS REAL) / NULLIF(total_questions, 0) * 100), 1) as overall_accuracy
      FROM study_progress
      WHERE user_id = ?
    `).bind(userId).first()
    
    return c.json({
      success: true,
      statistics: {
        overall: totalStats,
        categoryProgress: categoryProgress.results,
        mockExamHistory: mockExamResults.results,
        weakAreas: weakQuestions.results
      }
    })
  } catch (error) {
    console.error('Error fetching statistics:', error)
    return c.json({ error: '統計情報の取得に失敗しました' }, 500)
  }
})

export default studyRoutes
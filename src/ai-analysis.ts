// AI分析機能 for 宅建BOOST
import { Hono } from 'hono'
import { Bindings } from './index'

export const aiRoutes = new Hono<{ Bindings: Bindings }>()

// AI弱点分析
aiRoutes.post('/analyze/weakness', async (c) => {
  try {
    const { userId } = await c.req.json()
    
    if (!userId) {
      return c.json({ error: 'ユーザーIDが必要です' }, 400)
    }
    
    const db = c.env.DB
    
    // 学習履歴から弱点カテゴリーを分析
    const weakCategories = await db.prepare(`
      SELECT 
        q.category,
        COUNT(*) as total_attempts,
        SUM(CASE WHEN sh.is_correct = 0 THEN 1 ELSE 0 END) as incorrect_count,
        ROUND(SUM(CASE WHEN sh.is_correct = 0 THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1) as error_rate
      FROM study_history sh
      JOIN questions q ON sh.question_id = q.id
      WHERE sh.user_id = ?
      GROUP BY q.category
      HAVING error_rate > 30
      ORDER BY error_rate DESC
      LIMIT 5
    `).bind(userId).all()
    
    // 得意カテゴリーを分析
    const strongCategories = await db.prepare(`
      SELECT 
        q.category,
        COUNT(*) as total_attempts,
        SUM(CASE WHEN sh.is_correct = 1 THEN 1 ELSE 0 END) as correct_count,
        ROUND(SUM(CASE WHEN sh.is_correct = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1) as accuracy_rate
      FROM study_history sh
      JOIN questions q ON sh.question_id = q.id
      WHERE sh.user_id = ?
      GROUP BY q.category
      HAVING accuracy_rate > 70
      ORDER BY accuracy_rate DESC
      LIMIT 5
    `).bind(userId).all()
    
    // 推奨学習トピックを生成
    const recommendedTopics = weakCategories.results.map(wc => ({
      category: wc.category,
      priority: wc.error_rate > 50 ? 'high' : 'medium',
      reason: `正答率が${100 - wc.error_rate}%と低いため、重点的な復習が必要です`
    }))
    
    // 予測スコアを計算
    const overallStats = await db.prepare(`
      SELECT 
        AVG(CASE WHEN is_correct = 1 THEN 1.0 ELSE 0.0 END) * 100 as avg_accuracy
      FROM study_history
      WHERE user_id = ?
    `).bind(userId).first()
    
    const predictedScore = overallStats?.avg_accuracy || 0
    
    // 学習アドバイスを生成
    const studyRecommendations = generateStudyRecommendations(
      weakCategories.results,
      strongCategories.results,
      predictedScore as number
    )
    
    // 分析結果を保存
    const analysisResult = await db.prepare(`
      INSERT INTO ai_analysis 
      (user_id, weak_categories, strength_categories, recommended_topics, 
       predicted_score, study_recommendations, next_review_date)
      VALUES (?, ?, ?, ?, ?, ?, date('now', '+7 days'))
    `).bind(
      userId,
      JSON.stringify(weakCategories.results.map(w => w.category)),
      JSON.stringify(strongCategories.results.map(s => s.category)),
      JSON.stringify(recommendedTopics),
      predictedScore,
      studyRecommendations
    ).run()
    
    return c.json({
      success: true,
      analysis: {
        analysisId: analysisResult.meta.last_row_id,
        weakAreas: weakCategories.results,
        strongAreas: strongCategories.results,
        recommendedTopics,
        predictedScore: Math.round(predictedScore as number),
        studyRecommendations,
        nextReviewDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }
    })
  } catch (error) {
    console.error('Error analyzing weakness:', error)
    return c.json({ error: 'AI分析に失敗しました' }, 500)
  }
})

// 学習パス最適化
aiRoutes.get('/optimize/path/:userId', async (c) => {
  try {
    const userId = c.req.param('userId')
    const targetDate = c.req.query('targetDate') || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
    
    const db = c.env.DB
    
    // 現在の進捗を取得
    const currentProgress = await db.prepare(`
      SELECT 
        category,
        total_questions,
        correct_answers,
        ROUND(CAST(correct_answers AS REAL) / NULLIF(total_questions, 0) * 100, 1) as accuracy_rate
      FROM study_progress
      WHERE user_id = ?
    `).bind(userId).all()
    
    // 未学習カテゴリーを特定
    const allCategories = ['意思表示', '代理', '時効', '物権', '抵当権', '賃貸借', '相続', 
                          '宅建業の免許', '宅地建物取引士', '重要事項説明', '契約書面',
                          '都市計画法', '建築基準法', '国土利用計画法',
                          '不動産取得税', '固定資産税', '所得税', '印紙税']
    
    const studiedCategories = new Set(currentProgress.results.map(p => p.category))
    const unstudiedCategories = allCategories.filter(cat => !studiedCategories.has(cat))
    
    // 学習計画を生成
    const studyPlan = generateOptimalStudyPlan(
      currentProgress.results,
      unstudiedCategories,
      targetDate
    )
    
    return c.json({
      success: true,
      optimizedPath: {
        currentLevel: calculateLevel(currentProgress.results),
        targetDate,
        dailyGoals: studyPlan.dailyGoals,
        weeklyMilestones: studyPlan.weeklyMilestones,
        priorityOrder: studyPlan.priorityOrder,
        estimatedCompletionDate: studyPlan.estimatedCompletionDate
      }
    })
  } catch (error) {
    console.error('Error optimizing path:', error)
    return c.json({ error: '学習パスの最適化に失敗しました' }, 500)
  }
})

// パーソナライズド問題推薦
aiRoutes.get('/recommend/questions/:userId', async (c) => {
  try {
    const userId = c.req.param('userId')
    const count = parseInt(c.req.query('count') || '10')
    
    const db = c.env.DB
    
    // ユーザーの苦手分野を特定
    const weakAreas = await db.prepare(`
      SELECT question_id, incorrect_count
      FROM weak_questions
      WHERE user_id = ?
      ORDER BY incorrect_count DESC
      LIMIT 20
    `).bind(userId).all()
    
    // 最近間違えた問題を取得
    const recentMistakes = await db.prepare(`
      SELECT DISTINCT question_id
      FROM study_history
      WHERE user_id = ? AND is_correct = 0
      ORDER BY studied_at DESC
      LIMIT 10
    `).bind(userId).all()
    
    // 未学習の問題を取得
    const unstudiedQuestions = await db.prepare(`
      SELECT id
      FROM questions
      WHERE id NOT IN (
        SELECT question_id FROM study_history WHERE user_id = ?
      )
      ORDER BY RANDOM()
      LIMIT ?
    `).bind(userId, Math.floor(count / 3)).all()
    
    // 推薦問題リストを作成
    const recommendedIds = new Set<string>()
    
    // 苦手問題を優先的に追加
    weakAreas.results.slice(0, Math.ceil(count / 3)).forEach(w => {
      recommendedIds.add(w.question_id as string)
    })
    
    // 最近の間違いを追加
    recentMistakes.results.slice(0, Math.ceil(count / 3)).forEach(r => {
      recommendedIds.add(r.question_id as string)
    })
    
    // 未学習問題を追加
    unstudiedQuestions.results.forEach(u => {
      recommendedIds.add(u.id as string)
    })
    
    // 推薦問題の詳細を取得
    const questions = []
    for (const id of Array.from(recommendedIds).slice(0, count)) {
      const question = await db.prepare(`
        SELECT id, subject, category, difficulty, question_text, options
        FROM questions
        WHERE id = ?
      `).bind(id).first()
      
      if (question) {
        question.options = JSON.parse(question.options as string)
        questions.push(question)
      }
    }
    
    return c.json({
      success: true,
      recommendations: {
        questions,
        reason: '苦手分野の克服と新規学習のバランスを考慮した問題セットです',
        focusAreas: Array.from(new Set(questions.map(q => q.category)))
      }
    })
  } catch (error) {
    console.error('Error recommending questions:', error)
    return c.json({ error: '問題推薦に失敗しました' }, 500)
  }
})

// ヘルパー関数：学習アドバイス生成
function generateStudyRecommendations(
  weakAreas: any[],
  strongAreas: any[],
  predictedScore: number
): string {
  const recommendations = []
  
  if (predictedScore < 50) {
    recommendations.push('基礎からの復習が必要です。まずは各カテゴリーの基本問題から始めましょう。')
  } else if (predictedScore < 70) {
    recommendations.push('合格ラインに近づいています。苦手分野を重点的に学習しましょう。')
  } else {
    recommendations.push('良好な成績です。さらなる向上のため、応用問題にも挑戦しましょう。')
  }
  
  if (weakAreas.length > 0) {
    const topWeak = weakAreas[0]
    recommendations.push(
      `特に「${topWeak.category}」の正答率が低いため、この分野の復習を優先してください。`
    )
  }
  
  if (strongAreas.length > 0) {
    const topStrong = strongAreas[0]
    recommendations.push(
      `「${topStrong.category}」は得意分野です。この調子を維持しながら他の分野も強化しましょう。`
    )
  }
  
  recommendations.push('毎日30分以上の学習時間を確保し、継続的に取り組むことが重要です。')
  
  return recommendations.join(' ')
}

// ヘルパー関数：学習レベル計算
function calculateLevel(progress: any[]): string {
  if (progress.length === 0) return '初級'
  
  const avgAccuracy = progress.reduce((sum, p) => sum + (p.accuracy_rate || 0), 0) / progress.length
  const totalQuestions = progress.reduce((sum, p) => sum + p.total_questions, 0)
  
  if (totalQuestions < 50) return '初級'
  if (avgAccuracy < 50) return '初級'
  if (avgAccuracy < 70) return '中級'
  return '上級'
}

// ヘルパー関数：最適学習計画生成
function generateOptimalStudyPlan(
  currentProgress: any[],
  unstudiedCategories: string[],
  targetDate: string
): any {
  const daysUntilTarget = Math.floor(
    (new Date(targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  )
  
  const dailyGoals = {
    questions: Math.max(10, Math.floor(402 / daysUntilTarget)),
    studyTime: 60, // 分
    reviewTime: 30  // 分
  }
  
  const weeklyMilestones = []
  const weeksUntilTarget = Math.floor(daysUntilTarget / 7)
  
  for (let week = 1; week <= Math.min(weeksUntilTarget, 12); week++) {
    weeklyMilestones.push({
      week,
      targetQuestions: dailyGoals.questions * 7 * week,
      targetAccuracy: Math.min(70 + week * 2, 90),
      focusCategories: unstudiedCategories.slice((week - 1) * 2, week * 2)
    })
  }
  
  const priorityOrder = [
    ...unstudiedCategories,
    ...currentProgress
      .filter(p => p.accuracy_rate < 70)
      .sort((a, b) => a.accuracy_rate - b.accuracy_rate)
      .map(p => p.category)
  ]
  
  return {
    dailyGoals,
    weeklyMilestones,
    priorityOrder,
    estimatedCompletionDate: new Date(
      Date.now() + (402 / dailyGoals.questions) * 24 * 60 * 60 * 1000
    ).toISOString()
  }
}

export default aiRoutes
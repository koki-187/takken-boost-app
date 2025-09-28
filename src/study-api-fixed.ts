import { Hono } from 'hono'
import type { Bindings } from './index'

const studyRoutes = new Hono<{ Bindings: Bindings }>()

// カテゴリマッピング（英語キー -> 日本語カテゴリ名）
const CATEGORY_MAPPING: Record<string, string[]> = {
  'rights': [
    '民法総則', '物権', '債権総論', '債権各論', '相続', '借地借家法', '区分所有法'
  ],
  'businessLaw': [
    '免許', '宅建士', '営業保証金・保証協会', '媒介契約・代理契約', 
    '重要事項説明', '37条書面', '8つの制限', '報酬', '監督処分・罰則', '景品表示法'
  ],
  'restrictions': [
    '都市計画法', '建築基準法', '国土利用計画法', '農地法', 
    '宅地造成等規制法', '土地区画整理法'
  ],
  'taxOther': [
    '不動産取得税', '固定資産税', '所得税', '贈与税', '印紙税', 
    '登録免許税', '不動産鑑定評価', '地価公示法', '住宅金融支援機構', '不動産登記法'
  ]
}

// Get questions
studyRoutes.get('/questions', async (c) => {
  try {
    const { DB } = c.env
    const { category, difficulty, limit = 10 } = c.req.query()

    let query = 'SELECT * FROM questions WHERE 1=1'
    const params = []

    if (category && CATEGORY_MAPPING[category as string]) {
      // 英語キーから日本語カテゴリ名のリストを取得
      const japaneseCategories = CATEGORY_MAPPING[category as string]
      const placeholders = japaneseCategories.map(() => '?').join(',')
      query += ` AND category IN (${placeholders})`
      params.push(...japaneseCategories)
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

// Get categories with counts
studyRoutes.get('/categories', async (c) => {
  try {
    const { DB } = c.env

    const categories = await DB.prepare(`
      SELECT category, COUNT(*) as count 
      FROM questions 
      GROUP BY category 
      ORDER BY category
    `).all()

    // 英語キーにマッピング
    const mappedCategories = Object.entries(CATEGORY_MAPPING).map(([key, japaneseNames]) => {
      const totalCount = categories.results
        ?.filter(cat => japaneseNames.includes(cat.category))
        .reduce((sum, cat) => sum + cat.count, 0) || 0
      
      return {
        key,
        displayName: key === 'rights' ? '権利関係' :
                     key === 'businessLaw' ? '宅建業法' :
                     key === 'restrictions' ? '法令上の制限' :
                     '税法・その他',
        count: totalCount,
        subcategories: japaneseNames
      }
    })

    return c.json({
      success: true,
      categories: mappedCategories
    })

  } catch (error: any) {
    console.error('Categories fetch error:', error)
    return c.json({ 
      success: false, 
      error: error.message || 'カテゴリの取得に失敗しました' 
    }, 500)
  }
})

export default studyRoutes
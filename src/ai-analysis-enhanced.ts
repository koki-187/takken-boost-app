import { Hono } from 'hono'
import type { Bindings } from './index'

interface AIBindings extends Bindings {
  OPENAI_API_KEY?: string;
}

const aiAnalysisRoutes = new Hono<{ Bindings: AIBindings }>()

// OpenAI APIを使用した学習分析
const analyzeWithOpenAI = async (data: any, apiKey: string) => {
  const prompt = `
    以下の宅建試験学習データを分析し、具体的な学習アドバイスを提供してください：

    学習データ:
    - 総問題数: ${data.totalQuestions}
    - 正解数: ${data.correctAnswers}
    - 正答率: ${data.accuracyRate}%
    - カテゴリー別成績:
      ${data.categoryStats.map((c: any) => `- ${c.category}: ${c.accuracy}%`).join('\n      ')}
    - 学習時間: ${data.totalStudyTime}分
    - 最近の傾向: ${data.recentTrend}

    以下の形式で回答してください：
    1. 現状分析（強み・弱み）
    2. 改善すべき分野（優先順位付き）
    3. 具体的な学習計画（週単位）
    4. 予想合格可能性（パーセンテージ）
    5. モチベーション向上のアドバイス
  `

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: '宅建試験の学習アドバイザーとして、具体的で実践的なアドバイスを提供してください。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    })

    const result = await response.json()
    return result.choices[0].message.content
  } catch (error) {
    console.error('OpenAI API error:', error)
    return null
  }
}

// 学習データ分析
aiAnalysisRoutes.post('/analyze', async (c) => {
  const { userId } = await c.req.json()
  const { DB, OPENAI_API_KEY } = c.env

  try {
    // 学習履歴統計を取得
    const stats = await DB.prepare(`
      SELECT 
        COUNT(*) as total_questions,
        SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct_answers,
        CAST(SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) AS REAL) / COUNT(*) * 100 as accuracy_rate,
        SUM(time_spent) / 60 as total_study_time
      FROM study_history
      WHERE user_id = ?
    `).bind(userId).first()

    // カテゴリー別統計
    const categoryStats = await DB.prepare(`
      SELECT 
        q.subject as category,
        COUNT(*) as questions,
        SUM(CASE WHEN sh.is_correct = 1 THEN 1 ELSE 0 END) as correct,
        CAST(SUM(CASE WHEN sh.is_correct = 1 THEN 1 ELSE 0 END) AS REAL) / COUNT(*) * 100 as accuracy
      FROM study_history sh
      JOIN questions q ON sh.question_id = q.id
      WHERE sh.user_id = ?
      GROUP BY q.subject
      ORDER BY accuracy ASC
    `).bind(userId).all()

    // 最近の学習傾向（過去7日間）
    const recentTrend = await DB.prepare(`
      SELECT 
        DATE(studied_at) as study_date,
        COUNT(*) as questions_solved,
        CAST(SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) AS REAL) / COUNT(*) * 100 as daily_accuracy
      FROM study_history
      WHERE user_id = ? AND studied_at >= datetime('now', '-7 days')
      GROUP BY DATE(studied_at)
      ORDER BY study_date DESC
    `).bind(userId).all()

    // 苦手問題の特定
    const weakQuestions = await DB.prepare(`
      SELECT 
        q.id,
        q.category,
        q.question_text,
        COUNT(sh.id) as attempt_count,
        SUM(CASE WHEN sh.is_correct = 1 THEN 1 ELSE 0 END) as correct_count
      FROM questions q
      JOIN study_history sh ON q.id = sh.question_id
      WHERE sh.user_id = ?
      GROUP BY q.id
      HAVING correct_count < attempt_count * 0.5
      ORDER BY attempt_count DESC
      LIMIT 10
    `).bind(userId).all()

    // AI分析データ準備
    const analysisData = {
      totalQuestions: stats?.total_questions || 0,
      correctAnswers: stats?.correct_answers || 0,
      accuracyRate: stats?.accuracy_rate || 0,
      totalStudyTime: stats?.total_study_time || 0,
      categoryStats: categoryStats.results || [],
      recentTrend: recentTrend.results?.length > 0 ? '改善傾向' : '学習開始',
      weakQuestions: weakQuestions.results || []
    }

    // OpenAI APIによる詳細分析
    let aiAdvice = null
    if (OPENAI_API_KEY) {
      aiAdvice = await analyzeWithOpenAI(analysisData, OPENAI_API_KEY)
    }

    // 基本的な分析結果を生成（AI APIが使えない場合のフォールバック）
    if (!aiAdvice) {
      const weakestCategory = categoryStats.results?.[0]
      const strongestCategory = categoryStats.results?.[categoryStats.results.length - 1]
      
      aiAdvice = {
        currentStatus: {
          level: analysisData.accuracyRate >= 70 ? '合格圏内' : 
                 analysisData.accuracyRate >= 50 ? '要努力' : '基礎固め必要',
          strengths: strongestCategory ? [`${strongestCategory.category}分野`] : [],
          weaknesses: weakestCategory ? [`${weakestCategory.category}分野`] : []
        },
        recommendations: {
          priority: weakestCategory ? [
            `${weakestCategory.category}の基礎を復習`,
            '過去問を繰り返し解く',
            '間違えた問題を重点的に復習'
          ] : ['全分野の基礎固め'],
          studyPlan: {
            daily: '最低30問',
            weekly: '模擬試験1回',
            focus: weakestCategory?.category || '全分野'
          }
        },
        prediction: {
          passRate: Math.min(95, Math.max(5, analysisData.accuracyRate * 1.2)),
          estimatedStudyHours: Math.max(50, Math.round((70 - analysisData.accuracyRate) * 5))
        },
        motivation: analysisData.accuracyRate >= 60 ? 
          '順調に進んでいます！この調子で頑張りましょう。' :
          'まだ伸びしろがたくさんあります。コツコツ続けることが大切です。'
      }
    }

    // 分析結果を保存
    await DB.prepare(`
      INSERT INTO ai_analysis (
        user_id, 
        weak_categories,
        strength_categories,
        recommended_topics,
        predicted_score,
        study_recommendations,
        next_review_date
      ) VALUES (?, ?, ?, ?, ?, ?, date('now', '+7 days'))
    `).bind(
      userId,
      JSON.stringify(weakestCategory ? [weakestCategory.category] : []),
      JSON.stringify(strongestCategory ? [strongestCategory.category] : []),
      JSON.stringify(['復習必要']),
      analysisData.accuracyRate * 1.2,
      JSON.stringify(aiAdvice),
    ).run()

    return c.json({
      success: true,
      analysis: {
        stats: analysisData,
        advice: aiAdvice,
        weakQuestions: weakQuestions.results,
        trend: recentTrend.results
      }
    })

  } catch (error) {
    console.error('AI analysis error:', error)
    return c.json({ 
      success: false, 
      error: '分析処理中にエラーが発生しました' 
    }, 500)
  }
})

// 学習提案を生成
aiAnalysisRoutes.get('/recommendations/:userId', async (c) => {
  const userId = c.req.param('userId')
  const { DB } = c.env

  try {
    // 最新の分析結果を取得
    const latestAnalysis = await DB.prepare(`
      SELECT * FROM ai_analysis
      WHERE user_id = ?
      ORDER BY analysis_date DESC
      LIMIT 1
    `).bind(userId).first()

    if (!latestAnalysis) {
      return c.json({
        success: false,
        error: '分析データがありません。まず分析を実行してください。'
      }, 404)
    }

    // 苦手カテゴリーの問題を推薦
    const weakCategories = JSON.parse(latestAnalysis.weak_categories as string || '[]')
    const recommendedQuestions = await DB.prepare(`
      SELECT 
        q.id,
        q.category,
        q.difficulty,
        q.question_text,
        q.estimated_time
      FROM questions q
      LEFT JOIN study_history sh ON q.id = sh.question_id AND sh.user_id = ?
      WHERE q.category IN (${weakCategories.map(() => '?').join(',')})
      GROUP BY q.id
      ORDER BY 
        CASE WHEN sh.id IS NULL THEN 0 ELSE 1 END,
        COUNT(sh.id),
        q.difficulty
      LIMIT 20
    `).bind(userId, ...weakCategories).all()

    // 学習スケジュール生成
    const schedule = generateStudySchedule(latestAnalysis)

    return c.json({
      success: true,
      recommendations: {
        questions: recommendedQuestions.results,
        schedule,
        focusAreas: weakCategories,
        estimatedTimeToGoal: `${latestAnalysis.predicted_score}%の正答率まで約${Math.round((70 - Number(latestAnalysis.predicted_score)) * 2)}時間`
      }
    })

  } catch (error) {
    console.error('Recommendations error:', error)
    return c.json({ 
      success: false, 
      error: '推薦生成中にエラーが発生しました' 
    }, 500)
  }
})

// 学習スケジュール生成
function generateStudySchedule(analysis: any) {
  const weakCategories = JSON.parse(analysis.weak_categories || '[]')
  const predictedScore = Number(analysis.predicted_score) || 50
  
  const schedule = {
    daily: [],
    weekly: [],
    monthly: []
  }

  // 日次タスク
  schedule.daily = [
    {
      time: '朝',
      task: '新規問題10問',
      duration: 30,
      category: weakCategories[0] || '全分野'
    },
    {
      time: '昼',
      task: '復習問題5問',
      duration: 15,
      category: '間違えた問題'
    },
    {
      time: '夜',
      task: '応用問題5問',
      duration: 20,
      category: weakCategories[1] || '全分野'
    }
  ]

  // 週次タスク
  schedule.weekly = [
    {
      day: '月曜',
      task: '権利関係集中学習',
      duration: 60
    },
    {
      day: '水曜',
      task: '宅建業法集中学習',
      duration: 60
    },
    {
      day: '土曜',
      task: '模擬試験（25問）',
      duration: 60
    },
    {
      day: '日曜',
      task: '週の復習と分析',
      duration: 45
    }
  ]

  // 月次目標
  schedule.monthly = [
    {
      week: 1,
      goal: '基礎固め',
      targetAccuracy: Math.min(predictedScore + 5, 70)
    },
    {
      week: 2,
      goal: '苦手克服',
      targetAccuracy: Math.min(predictedScore + 10, 75)
    },
    {
      week: 3,
      goal: '応用力向上',
      targetAccuracy: Math.min(predictedScore + 15, 80)
    },
    {
      week: 4,
      goal: '総仕上げ',
      targetAccuracy: Math.min(predictedScore + 20, 85)
    }
  ]

  return schedule
}

// 進捗レポート生成
aiAnalysisRoutes.get('/progress-report/:userId', async (c) => {
  const userId = c.req.param('userId')
  const { DB } = c.env

  try {
    // 過去30日間の学習データ
    const monthlyProgress = await DB.prepare(`
      SELECT 
        DATE(studied_at) as date,
        COUNT(*) as questions,
        SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct,
        SUM(time_spent) / 60 as study_minutes
      FROM study_history
      WHERE user_id = ? AND studied_at >= datetime('now', '-30 days')
      GROUP BY DATE(studied_at)
      ORDER BY date
    `).bind(userId).all()

    // カテゴリー別の成長率
    const categoryGrowth = await DB.prepare(`
      WITH recent AS (
        SELECT 
          q.subject,
          CAST(SUM(CASE WHEN sh.is_correct = 1 THEN 1 ELSE 0 END) AS REAL) / COUNT(*) * 100 as recent_accuracy
        FROM study_history sh
        JOIN questions q ON sh.question_id = q.id
        WHERE sh.user_id = ? AND sh.studied_at >= datetime('now', '-7 days')
        GROUP BY q.subject
      ),
      previous AS (
        SELECT 
          q.subject,
          CAST(SUM(CASE WHEN sh.is_correct = 1 THEN 1 ELSE 0 END) AS REAL) / COUNT(*) * 100 as previous_accuracy
        FROM study_history sh
        JOIN questions q ON sh.question_id = q.id
        WHERE sh.user_id = ? AND sh.studied_at < datetime('now', '-7 days') 
          AND sh.studied_at >= datetime('now', '-14 days')
        GROUP BY q.subject
      )
      SELECT 
        r.subject,
        r.recent_accuracy,
        COALESCE(p.previous_accuracy, 0) as previous_accuracy,
        r.recent_accuracy - COALESCE(p.previous_accuracy, 0) as growth
      FROM recent r
      LEFT JOIN previous p ON r.subject = p.subject
      ORDER BY growth DESC
    `).bind(userId, userId).all()

    // 模擬試験スコアの推移
    const examScores = await DB.prepare(`
      SELECT 
        DATE(completed_at) as date,
        score,
        time_spent / 60 as minutes
      FROM mock_exam_sessions
      WHERE user_id = ? AND completed_at IS NOT NULL
      ORDER BY completed_at DESC
      LIMIT 10
    `).bind(userId).all()

    return c.json({
      success: true,
      report: {
        monthlyProgress: monthlyProgress.results,
        categoryGrowth: categoryGrowth.results,
        examScores: examScores.results,
        summary: {
          totalQuestions: monthlyProgress.results?.reduce((acc: number, day: any) => acc + day.questions, 0) || 0,
          totalHours: Math.round((monthlyProgress.results?.reduce((acc: number, day: any) => acc + day.study_minutes, 0) || 0) / 60),
          averageAccuracy: monthlyProgress.results?.length > 0 ?
            Math.round(monthlyProgress.results.reduce((acc: number, day: any) => acc + (day.correct / day.questions * 100), 0) / monthlyProgress.results.length) : 0,
          bestCategory: categoryGrowth.results?.[0]?.subject || '未学習',
          mostImproved: categoryGrowth.results?.find((c: any) => c.growth > 0)?.subject || 'なし'
        }
      }
    })

  } catch (error) {
    console.error('Progress report error:', error)
    return c.json({ 
      success: false, 
      error: 'レポート生成中にエラーが発生しました' 
    }, 500)
  }
})

export default aiAnalysisRoutes
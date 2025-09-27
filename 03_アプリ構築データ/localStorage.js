// LocalStorage utility for persisting study data

const STORAGE_KEYS = {
  STUDY_STATS: 'takken_boost_study_stats',
  ANSWERED_QUESTIONS: 'takken_boost_answered_questions',
  WRONG_ANSWERS: 'takken_boost_wrong_answers',
  STUDY_PROGRESS: 'takken_boost_study_progress',
  LAST_STUDY_DATE: 'takken_boost_last_study_date'
}

// 学習統計データの保存
export const saveStudyStats = (stats) => {
  try {
    localStorage.setItem(STORAGE_KEYS.STUDY_STATS, JSON.stringify(stats))
  } catch (error) {
    console.error('Failed to save study stats:', error)
  }
}

// 学習統計データの読み込み
export const loadStudyStats = () => {
  try {
    const stats = localStorage.getItem(STORAGE_KEYS.STUDY_STATS)
    return stats ? JSON.parse(stats) : {
      totalQuestions: 300,
      answeredQuestions: 0,
      correctAnswers: 0,
      studyDays: 0,
      averageTime: 0
    }
  } catch (error) {
    console.error('Failed to load study stats:', error)
    return {
      totalQuestions: 300,
      answeredQuestions: 0,
      correctAnswers: 0,
      studyDays: 0,
      averageTime: 0
    }
  }
}

// 回答済み問題の保存
export const saveAnsweredQuestions = (questionIds) => {
  try {
    localStorage.setItem(STORAGE_KEYS.ANSWERED_QUESTIONS, JSON.stringify(questionIds))
  } catch (error) {
    console.error('Failed to save answered questions:', error)
  }
}

// 回答済み問題の読み込み
export const loadAnsweredQuestions = () => {
  try {
    const questions = localStorage.getItem(STORAGE_KEYS.ANSWERED_QUESTIONS)
    return questions ? JSON.parse(questions) : []
  } catch (error) {
    console.error('Failed to load answered questions:', error)
    return []
  }
}

// 間違えた問題の保存
export const saveWrongAnswers = (wrongAnswers) => {
  try {
    localStorage.setItem(STORAGE_KEYS.WRONG_ANSWERS, JSON.stringify(wrongAnswers))
  } catch (error) {
    console.error('Failed to save wrong answers:', error)
  }
}

// 間違えた問題の読み込み
export const loadWrongAnswers = () => {
  try {
    const wrongAnswers = localStorage.getItem(STORAGE_KEYS.WRONG_ANSWERS)
    return wrongAnswers ? JSON.parse(wrongAnswers) : []
  } catch (error) {
    console.error('Failed to load wrong answers:', error)
    return []
  }
}

// 学習進捗の保存
export const saveStudyProgress = (progress) => {
  try {
    localStorage.setItem(STORAGE_KEYS.STUDY_PROGRESS, progress.toString())
  } catch (error) {
    console.error('Failed to save study progress:', error)
  }
}

// 学習進捗の読み込み
export const loadStudyProgress = () => {
  try {
    const progress = localStorage.getItem(STORAGE_KEYS.STUDY_PROGRESS)
    return progress ? parseInt(progress, 10) : 0
  } catch (error) {
    console.error('Failed to load study progress:', error)
    return 0
  }
}

// 最終学習日の保存
export const saveLastStudyDate = (date) => {
  try {
    localStorage.setItem(STORAGE_KEYS.LAST_STUDY_DATE, date)
  } catch (error) {
    console.error('Failed to save last study date:', error)
  }
}

// 最終学習日の読み込み
export const loadLastStudyDate = () => {
  try {
    return localStorage.getItem(STORAGE_KEYS.LAST_STUDY_DATE) || null
  } catch (error) {
    console.error('Failed to load last study date:', error)
    return null
  }
}

// 学習セッションの記録
export const recordStudySession = (questionsAnswered, correctAnswers, timeSpent) => {
  const stats = loadStudyStats()
  const today = new Date().toISOString().split('T')[0]
  const lastStudyDate = loadLastStudyDate()
  
  // 新しい統計を計算
  const newStats = {
    ...stats,
    answeredQuestions: stats.answeredQuestions + questionsAnswered,
    correctAnswers: stats.correctAnswers + correctAnswers,
    averageTime: Math.round(
      (stats.averageTime * stats.answeredQuestions + timeSpent) / 
      (stats.answeredQuestions + questionsAnswered)
    )
  }
  
  // 新しい日の学習の場合、学習日数を増やす
  if (lastStudyDate !== today) {
    newStats.studyDays = stats.studyDays + 1
    saveLastStudyDate(today)
  }
  
  saveStudyStats(newStats)
  
  // 学習進捗を更新
  const progress = Math.round((newStats.answeredQuestions / newStats.totalQuestions) * 100)
  saveStudyProgress(progress)
  
  return newStats
}

// 全データのクリア（デバッグ用）
export const clearAllData = () => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key)
    })
    console.log('All study data cleared')
  } catch (error) {
    console.error('Failed to clear data:', error)
  }
}


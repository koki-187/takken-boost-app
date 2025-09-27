import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { Target, Brain, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react'

const WeakPointMode = ({ onStartQuiz }) => {
  const [selectedCategory, setSelectedCategory] = useState(null)

  const weakCategories = [
    {
      id: 'urban_planning',
      name: '都市計画法',
      accuracy: 45,
      totalQuestions: 25,
      wrongQuestions: 14,
      difficulty: 'high',
      description: '都市計画区域、市街化区域の概念が不十分',
      recommendedStudyTime: '30分'
    },
    {
      id: 'building_standards',
      name: '建築基準法',
      accuracy: 52,
      totalQuestions: 20,
      wrongQuestions: 10,
      difficulty: 'high',
      description: '建築確認、用途制限の理解が必要',
      recommendedStudyTime: '25分'
    },
    {
      id: 'real_estate_registration',
      name: '不動産登記法',
      accuracy: 63,
      totalQuestions: 15,
      wrongQuestions: 6,
      difficulty: 'medium',
      description: '登記の申請方法、効力に関する問題',
      recommendedStudyTime: '20分'
    },
    {
      id: 'tax_law',
      name: '税法',
      accuracy: 58,
      totalQuestions: 18,
      wrongQuestions: 8,
      difficulty: 'medium',
      description: '不動産取得税、固定資産税の計算',
      recommendedStudyTime: '15分'
    }
  ]

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'high': return 'text-red-600 bg-red-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getDifficultyText = (difficulty) => {
    switch (difficulty) {
      case 'high': return '要強化'
      case 'medium': return '注意'
      case 'low': return '良好'
      default: return '不明'
    }
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <Card className="boost-card">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <Target className="w-8 h-8 mr-3 text-red-600" />
            弱点克服モード
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-800 mb-1">AIが分析した弱点分野</h3>
                <p className="text-sm text-red-700">
                  あなたの解答履歴から、特に注意が必要な分野を特定しました。
                  集中的に学習することで効率的に実力アップが期待できます。
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 弱点カテゴリ一覧 */}
      <div className="grid md:grid-cols-2 gap-4">
        {weakCategories.map((category) => (
          <Card 
            key={category.id} 
            className={`boost-card cursor-pointer transition-all ${
              selectedCategory === category.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
            }`}
            onClick={() => setSelectedCategory(category.id)}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="font-semibold text-lg">{category.name}</h3>
                <Badge className={getDifficultyColor(category.difficulty)}>
                  {getDifficultyText(category.difficulty)}
                </Badge>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">正解率</span>
                    <span className="text-sm font-semibold">{category.accuracy}%</span>
                  </div>
                  <Progress value={category.accuracy} className="h-2" />
                </div>

                <div className="text-sm text-gray-600">
                  <p className="mb-2">{category.description}</p>
                  <div className="flex justify-between">
                    <span>間違えた問題: {category.wrongQuestions}問</span>
                    <span>推奨学習時間: {category.recommendedStudyTime}</span>
                  </div>
                </div>
              </div>

              {selectedCategory === category.id && (
                <div className="mt-4 pt-4 border-t">
                  <Button 
                    onClick={() => onStartQuiz && onStartQuiz(category.id)}
                    className="w-full boost-button"
                  >
                    <Brain className="w-4 h-4 mr-2" />
                    {category.name}の弱点克服を開始
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 学習のヒント */}
      <Card className="boost-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            効果的な弱点克服のコツ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold">集中学習</h4>
                  <p className="text-sm text-gray-600">
                    1つの分野に集中して、短期間で集中的に学習しましょう。
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold">反復練習</h4>
                  <p className="text-sm text-gray-600">
                    間違えた問題は繰り返し解いて、確実に理解しましょう。
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold">解説の活用</h4>
                  <p className="text-sm text-gray-600">
                    解説をしっかり読んで、なぜ間違えたかを理解しましょう。
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold">定期的な復習</h4>
                  <p className="text-sm text-gray-600">
                    一度克服した分野も定期的に復習して定着させましょう。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default WeakPointMode


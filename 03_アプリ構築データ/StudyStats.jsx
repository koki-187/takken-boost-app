import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { BarChart3, TrendingUp, Target, Clock, Trophy, BookOpen } from 'lucide-react'

const StudyStats = ({ stats }) => {
  const {
    totalQuestions = 300,
    answeredQuestions = 45,
    correctAnswers = 32,
    studyDays = 12,
    averageTime = 45,
    weakCategories = ['都市計画法', '建築基準法'],
    strongCategories = ['民法', '借地借家法']
  } = stats || {}

  const accuracy = answeredQuestions > 0 ? Math.round((correctAnswers / answeredQuestions) * 100) : 0
  const progress = Math.round((answeredQuestions / totalQuestions) * 100)

  return (
    <div className="space-y-6">
      {/* 全体統計 */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="boost-card">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-600">{answeredQuestions}</div>
            <div className="text-sm text-gray-600">解答済み問題</div>
            <div className="text-xs text-gray-500">/ {totalQuestions}問</div>
          </CardContent>
        </Card>

        <Card className="boost-card">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Trophy className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-600">{accuracy}%</div>
            <div className="text-sm text-gray-600">正解率</div>
            <div className="text-xs text-gray-500">{correctAnswers}/{answeredQuestions}問正解</div>
          </CardContent>
        </Card>

        <Card className="boost-card">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="text-2xl font-bold text-yellow-600">{studyDays}</div>
            <div className="text-sm text-gray-600">学習日数</div>
            <div className="text-xs text-gray-500">継続中</div>
          </CardContent>
        </Card>

        <Card className="boost-card">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-purple-600">{averageTime}秒</div>
            <div className="text-sm text-gray-600">平均解答時間</div>
            <div className="text-xs text-gray-500">1問あたり</div>
          </CardContent>
        </Card>
      </div>

      {/* 学習進捗 */}
      <Card className="boost-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            学習進捗
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">全体進捗</span>
              <span className="text-sm font-bold text-blue-600">{progress}%</span>
            </div>
            <Progress value={progress} className="h-3" />
            <p className="text-xs text-gray-500 mt-1">
              残り{totalQuestions - answeredQuestions}問で全問題制覇！
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mt-6">
            <div>
              <h4 className="font-semibold text-green-700 mb-2 flex items-center">
                <Trophy className="w-4 h-4 mr-1" />
                得意分野
              </h4>
              <div className="space-y-1">
                {strongCategories.map((category, index) => (
                  <Badge key={index} variant="secondary" className="mr-1 mb-1">
                    {category}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-red-700 mb-2 flex items-center">
                <Target className="w-4 h-4 mr-1" />
                要強化分野
              </h4>
              <div className="space-y-1">
                {weakCategories.map((category, index) => (
                  <Badge key={index} variant="destructive" className="mr-1 mb-1">
                    {category}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 最近の学習履歴 */}
      <Card className="boost-card">
        <CardHeader>
          <CardTitle>最近の学習履歴</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { date: '2024/08/03', questions: 10, correct: 8, category: '民法' },
              { date: '2024/08/02', questions: 15, correct: 11, category: '借地借家法' },
              { date: '2024/08/01', questions: 8, correct: 5, category: '都市計画法' },
              { date: '2024/07/31', questions: 12, correct: 9, category: '建築基準法' }
            ].map((session, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">{session.date}</div>
                  <div className="text-sm text-gray-600">{session.category}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">
                    {session.correct}/{session.questions}問正解
                  </div>
                  <div className="text-sm text-gray-600">
                    {Math.round((session.correct / session.questions) * 100)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default StudyStats


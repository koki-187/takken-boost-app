import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import studyRoutes from './study-api'
import aiRoutes from './ai-analysis'

export type Bindings = {
  DB: D1Database;
  NOTIFICATION_EMAIL?: string;
  SENDGRID_API_KEY?: string;
}

const app = new Hono<{ Bindings: Bindings }>()

// Enable CORS for frontend-backend communication
app.use('/api/*', cors())

// Mount API routes
app.route('/api/study', studyRoutes)
app.route('/api/ai', aiRoutes)

// Serve static files from public directory
app.use('/static/*', serveStatic({ root: './public' }))

// API: 取扱説明書のデータを返す
app.get('/api/manual/sections', (c) => {
  const sections = [
    {
      id: 'getting-started',
      title: 'はじめに',
      icon: 'fa-rocket',
      content: {
        overview: '宅建BOOSTは、AI搭載の宅建試験学習アプリです。402問の試験問題データベースと、効率的な学習機能を提供します。',
        features: [
          '402問の試験問題データベース',
          'カテゴリー別学習（権利関係・宅建業法・法令制限・税/その他）',
          '模擬試験機能（50問・2時間制限）',
          '苦手問題の自動抽出',
          'AI弱点分析',
          '学習進捗の可視化'
        ]
      }
    },
    {
      id: 'user-registration',
      title: 'ユーザー登録・ログイン',
      icon: 'fa-user',
      content: {
        steps: [
          {
            title: '新規登録',
            description: 'トップページから「新規登録」をクリックし、メールアドレスとパスワードを入力します。',
            tips: ['パスワードは8文字以上で設定してください', 'メールアドレスは後から変更可能です']
          },
          {
            title: 'ログイン',
            description: '登録済みのメールアドレスとパスワードでログインします。',
            tips: ['「ログイン状態を保持」にチェックを入れると、次回から自動ログインされます']
          },
          {
            title: 'ゲストモード',
            description: '登録なしで利用したい場合は「ゲストとして続行」をクリックします。',
            tips: ['ゲストモードでは学習履歴が保存されません', 'いつでもユーザー登録に切り替えられます']
          }
        ]
      }
    },
    {
      id: 'study-mode',
      title: '学習モード',
      icon: 'fa-book',
      content: {
        modes: [
          {
            name: 'カテゴリー別学習',
            description: '分野ごとに問題を解いて基礎力を身につけます',
            howTo: [
              'メインメニューから「カテゴリー別学習」を選択',
              '学習したいカテゴリー（権利関係/宅建業法/法令制限/税・その他）を選択',
              '問題が表示されるので、4つの選択肢から正解を選択',
              '解答後、正解と解説が表示されます',
              '「次の問題へ」で次の問題に進みます'
            ]
          },
          {
            name: '苦手問題集中学習',
            description: '間違えた問題を重点的に復習します',
            howTo: [
              'メインメニューから「苦手問題」を選択',
              '過去に間違えた問題が自動的に抽出されます',
              '繰り返し解いて苦手を克服しましょう',
              '正解率が上がると自動的に苦手リストから外れます'
            ]
          },
          {
            name: 'ランダム学習',
            description: '全カテゴリーからランダムに出題されます',
            howTo: [
              'メインメニューから「ランダム学習」を選択',
              '全402問からランダムに問題が出題されます',
              '総合的な実力を試すのに最適です'
            ]
          }
        ]
      }
    },
    {
      id: 'mock-exam',
      title: '模擬試験',
      icon: 'fa-clock',
      content: {
        overview: '本番と同じ形式で50問・2時間の模擬試験を受けられます。',
        features: [
          {
            name: '試験形式',
            details: [
              '問題数：50問（本番と同じ）',
              '制限時間：2時間（120分）',
              '出題範囲：全カテゴリーから均等に出題',
              '合格ライン：70%（35問正解）'
            ]
          },
          {
            name: 'タイマー機能',
            details: [
              'カウントダウンタイマーで残り時間を表示',
              '残り10分、5分、1分で警告表示',
              '一時停止・再開機能あり',
              '時間切れで自動終了'
            ]
          },
          {
            name: '結果分析',
            details: [
              '点数と正答率を表示',
              'カテゴリー別の成績分析',
              '間違えた問題の確認と解説',
              '苦手分野の特定とアドバイス'
            ]
          }
        ],
        howTo: [
          'メインメニューから「模擬試験」を選択',
          '「試験開始」ボタンをクリック',
          '50問すべてに解答（途中保存可能）',
          '「採点する」ボタンで結果を確認',
          '結果画面で詳細な分析を確認'
        ]
      }
    },
    {
      id: 'progress-tracking',
      title: '学習進捗管理',
      icon: 'fa-chart-line',
      content: {
        features: [
          {
            name: '学習統計',
            description: '総学習時間、解答数、正答率などを確認できます',
            details: [
              '今日の学習時間',
              '累計解答問題数',
              '全体の正答率',
              'カテゴリー別の正答率',
              '連続学習日数'
            ]
          },
          {
            name: '3Dビジュアライゼーション',
            description: '学習進捗を3Dグラフで視覚的に確認',
            details: [
              'レーダーチャートでカテゴリー別の習熟度を表示',
              '時系列グラフで成長を可視化',
              '目標達成度をプログレスバーで表示'
            ]
          },
          {
            name: 'カレンダー機能',
            description: '学習カレンダーで計画的な学習をサポート',
            details: [
              '試験日までのカウントダウン',
              '学習した日にマーク表示',
              '月間・週間の学習サマリー'
            ]
          }
        ]
      }
    },
    {
      id: 'ai-features',
      title: 'AI機能',
      icon: 'fa-brain',
      content: {
        features: [
          {
            name: '弱点分析',
            description: 'AIが学習データを分析し、弱点を特定します',
            benefits: [
              '間違いパターンの自動検出',
              '苦手分野の優先順位付け',
              '効率的な学習計画の提案'
            ]
          },
          {
            name: '学習アドバイス',
            description: '個人の学習状況に応じたアドバイスを提供',
            benefits: [
              '最適な学習順序の提案',
              '復習タイミングの最適化',
              'モチベーション維持のサポート'
            ]
          }
        ]
      }
    },
    {
      id: 'tips',
      title: '学習のコツ',
      icon: 'fa-lightbulb',
      content: {
        tips: [
          {
            title: '毎日少しずつ',
            description: '1日15分でも良いので、毎日継続することが大切です。'
          },
          {
            title: '苦手分野を優先',
            description: '苦手な分野から取り組むことで、効率的に得点を伸ばせます。'
          },
          {
            title: '解説をしっかり読む',
            description: '正解・不正解に関わらず、解説を読んで理解を深めましょう。'
          },
          {
            title: '模擬試験で実力チェック',
            description: '週に1回は模擬試験を受けて、本番の感覚を掴みましょう。'
          },
          {
            title: '復習を忘れずに',
            description: '一度解いた問題も、時間を空けて復習することで定着します。'
          }
        ]
      }
    },
    {
      id: 'troubleshooting',
      title: 'トラブルシューティング',
      icon: 'fa-tools',
      content: {
        issues: [
          {
            problem: 'ログインできない',
            solutions: [
              'パスワードが正しいか確認してください',
              'メールアドレスの入力ミスがないか確認してください',
              'パスワードリセット機能を使用してください'
            ]
          },
          {
            problem: '問題が表示されない',
            solutions: [
              'インターネット接続を確認してください',
              'ブラウザのキャッシュをクリアしてください',
              'ページを再読み込みしてください（F5キー）'
            ]
          },
          {
            problem: '学習履歴が保存されない',
            solutions: [
              'ログイン状態を確認してください',
              'ゲストモードでは履歴が保存されません',
              'ブラウザのCookieが有効になっているか確認してください'
            ]
          }
        ]
      }
    }
  ];

  return c.json(sections);
});

// API: インタラクティブチュートリアルのステップ
app.get('/api/tutorial/steps', (c) => {
  const steps = [
    {
      id: 1,
      target: '.menu-button',
      title: 'メニューへようこそ！',
      content: 'ここから各学習モードにアクセスできます。',
      position: 'bottom'
    },
    {
      id: 2,
      target: '.category-study',
      title: 'カテゴリー別学習',
      content: '分野ごとに問題を解いて基礎力を身につけましょう。',
      position: 'right'
    },
    {
      id: 3,
      target: '.mock-exam',
      title: '模擬試験',
      content: '本番と同じ50問・2時間の試験に挑戦できます。',
      position: 'left'
    },
    {
      id: 4,
      target: '.weak-points',
      title: '苦手問題',
      content: '間違えた問題を重点的に復習できます。',
      position: 'bottom'
    },
    {
      id: 5,
      target: '.progress-chart',
      title: '進捗確認',
      content: 'あなたの学習進捗をグラフで確認できます。',
      position: 'top'
    }
  ];

  return c.json(steps);
});

// API: よくある質問（FAQ）
app.get('/api/faq', (c) => {
  const faq = [
    {
      id: 1,
      category: '基本機能',
      question: '無料で使えますか？',
      answer: 'はい、基本機能は無料でご利用いただけます。'
    },
    {
      id: 2,
      category: '基本機能',
      question: 'オフラインでも使えますか？',
      answer: 'PWA対応により、一度読み込んだコンテンツはオフラインでも利用可能です。'
    },
    {
      id: 3,
      category: '学習方法',
      question: '効率的な学習方法を教えてください',
      answer: 'まず苦手分野を特定し、カテゴリー別学習で基礎を固めた後、模擬試験で実力を確認することをお勧めします。'
    },
    {
      id: 4,
      category: '学習方法',
      question: '1日どのくらい学習すれば良いですか？',
      answer: '個人差はありますが、毎日30分〜1時間の学習を3ヶ月継続することで合格レベルに到達できます。'
    },
    {
      id: 5,
      category: 'アカウント',
      question: 'パスワードを忘れました',
      answer: 'ログイン画面の「パスワードを忘れた方」からリセット手続きを行ってください。'
    },
    {
      id: 6,
      category: 'アカウント',
      question: '複数デバイスで使えますか？',
      answer: 'はい、同じアカウントでログインすれば、どのデバイスからでも学習を継続できます。'
    },
    {
      id: 7,
      category: '技術的な問題',
      question: '動作が遅い場合はどうすれば良いですか？',
      answer: 'ブラウザのキャッシュをクリアし、不要なタブを閉じてから再度アクセスしてください。'
    },
    {
      id: 8,
      category: '技術的な問題',
      question: '推奨ブラウザはありますか？',
      answer: 'Chrome、Firefox、Safari、Edgeの最新版を推奨しています。'
    }
  ];

  return c.json(faq);
});

// メインページ（HTMLを返す）
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="ja">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>宅建BOOST - AI搭載宅建試験学習アプリ</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <link href="/static/styles.css" rel="stylesheet">
    </head>
    <body class="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 min-h-screen">
        <!-- ヘルプボタン（固定位置） -->
        <div class="fixed bottom-6 right-6 z-50">
            <button id="help-button" class="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-4 rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-110 pulse-animation">
                <i class="fas fa-question-circle text-2xl"></i>
            </button>
        </div>

        <!-- チュートリアルボタン（固定位置） -->
        <div class="fixed bottom-6 left-6 z-50">
            <button id="tutorial-button" class="bg-gradient-to-r from-green-500 to-teal-600 text-white p-4 rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-110">
                <i class="fas fa-graduation-cap text-2xl"></i>
            </button>
        </div>

        <!-- メインコンテンツ -->
        <div class="container mx-auto px-4 py-8">
            <!-- ヘッダー -->
            <header class="text-center mb-12">
                <h1 class="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 mb-4 animate-gradient">
                    宅建BOOST
                </h1>
                <p class="text-xl text-gray-300">AI搭載宅建試験学習アプリ</p>
            </header>

            <!-- メインメニュー -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                <!-- カテゴリー別学習 -->
                <div class="category-study glass-morphism p-6 rounded-2xl hover:transform hover:scale-105 transition-all duration-300 cursor-pointer">
                    <div class="flex items-center mb-4">
                        <i class="fas fa-book text-3xl text-blue-400 mr-4"></i>
                        <h2 class="text-2xl font-bold text-white">カテゴリー別学習</h2>
                    </div>
                    <p class="text-gray-300">分野ごとに問題を解いて基礎力を身につけます</p>
                </div>

                <!-- 模擬試験 -->
                <div class="mock-exam glass-morphism p-6 rounded-2xl hover:transform hover:scale-105 transition-all duration-300 cursor-pointer">
                    <div class="flex items-center mb-4">
                        <i class="fas fa-clock text-3xl text-green-400 mr-4"></i>
                        <h2 class="text-2xl font-bold text-white">模擬試験</h2>
                    </div>
                    <p class="text-gray-300">本番形式50問・2時間の試験に挑戦</p>
                </div>

                <!-- 苦手問題 -->
                <div class="weak-points glass-morphism p-6 rounded-2xl hover:transform hover:scale-105 transition-all duration-300 cursor-pointer">
                    <div class="flex items-center mb-4">
                        <i class="fas fa-exclamation-triangle text-3xl text-red-400 mr-4"></i>
                        <h2 class="text-2xl font-bold text-white">苦手問題</h2>
                    </div>
                    <p class="text-gray-300">間違えた問題を重点的に復習</p>
                </div>

                <!-- 学習統計 -->
                <div class="progress-chart glass-morphism p-6 rounded-2xl hover:transform hover:scale-105 transition-all duration-300 cursor-pointer">
                    <div class="flex items-center mb-4">
                        <i class="fas fa-chart-line text-3xl text-purple-400 mr-4"></i>
                        <h2 class="text-2xl font-bold text-white">学習統計</h2>
                    </div>
                    <p class="text-gray-300">進捗と成績を可視化</p>
                </div>

                <!-- AI分析 -->
                <div class="glass-morphism p-6 rounded-2xl hover:transform hover:scale-105 transition-all duration-300 cursor-pointer">
                    <div class="flex items-center mb-4">
                        <i class="fas fa-brain text-3xl text-pink-400 mr-4"></i>
                        <h2 class="text-2xl font-bold text-white">AI分析</h2>
                    </div>
                    <p class="text-gray-300">弱点を特定し学習をサポート</p>
                </div>

                <!-- カレンダー -->
                <div class="glass-morphism p-6 rounded-2xl hover:transform hover:scale-105 transition-all duration-300 cursor-pointer">
                    <div class="flex items-center mb-4">
                        <i class="fas fa-calendar text-3xl text-yellow-400 mr-4"></i>
                        <h2 class="text-2xl font-bold text-white">カレンダー</h2>
                    </div>
                    <p class="text-gray-300">試験日までの学習計画</p>
                </div>
            </div>
        </div>

        <!-- ヘルプモーダル -->
        <div id="help-modal" class="fixed inset-0 bg-black bg-opacity-50 z-50 hidden">
            <div class="flex items-center justify-center min-h-screen p-4">
                <div class="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 max-w-4xl max-h-[80vh] overflow-auto shadow-2xl">
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-3xl font-bold text-white">
                            <i class="fas fa-book-open mr-3"></i>取扱説明書
                        </h2>
                        <button id="close-help" class="text-gray-400 hover:text-white text-2xl">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div id="help-content" class="space-y-4">
                        <!-- ヘルプコンテンツがここに動的に挿入されます -->
                    </div>
                </div>
            </div>
        </div>

        <!-- チュートリアルオーバーレイ -->
        <div id="tutorial-overlay" class="fixed inset-0 bg-black bg-opacity-75 z-40 hidden">
            <div id="tutorial-tooltip" class="absolute bg-white rounded-lg p-4 shadow-2xl max-w-sm hidden">
                <h3 id="tutorial-title" class="text-lg font-bold mb-2"></h3>
                <p id="tutorial-content" class="text-gray-700 mb-4"></p>
                <div class="flex justify-between">
                    <button id="tutorial-skip" class="text-gray-500 hover:text-gray-700">
                        スキップ
                    </button>
                    <div class="space-x-2">
                        <button id="tutorial-prev" class="bg-gray-300 hover:bg-gray-400 px-3 py-1 rounded">
                            前へ
                        </button>
                        <button id="tutorial-next" class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded">
                            次へ
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/app.js"></script>
        <script src="/static/help-system.js"></script>
        <script src="/static/tutorial.js"></script>
    </body>
    </html>
  `)
})

export default app
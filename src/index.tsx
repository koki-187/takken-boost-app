import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import studyRoutes from './study-api-fixed'
import authRoutes from './auth-api-fixed'
import mockExamRoutes from './mock-exam-complete'
import emailRoutes from './email-api'

export type Bindings = {
  DB: D1Database;
  NOTIFICATION_EMAIL?: string;
  SENDGRID_API_KEY?: string;
}

const app = new Hono<{ Bindings: Bindings }>()

// Enable CORS
app.use('/api/*', cors())

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }))

// Mount API routes
app.route('/api/study', studyRoutes)
app.route('/api/auth', authRoutes)
app.route('/api/mock-exam', mockExamRoutes)
app.route('/api/notifications', emailRoutes)

// バージョン選択ルート
app.get('/version/:version?', (c) => {
  const version = c.req.param('version');
  
  // v9.0.0を返す場合
  if (version === 'v9' || version === '9') {
    return c.html(v9HTML);
  }
  
  // デフォルトはv8.0.0を表示
  return c.redirect('/');
});

// v9.0.0 HTMLコンテンツ（外部ファイルから読み込み）
const v9HTML = `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>宅建BOOST v9.0.0 Ultimate Edition</title>
    
    <!-- PWA Meta Tags -->
    <meta name="theme-color" content="#764ba2">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="宅建BOOST v9">
    <link rel="manifest" href="/manifest.json">
    
    <!-- Styles -->
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    <link href="/static/styles-v9.css" rel="stylesheet">
    
    <!-- Libraries -->
    <script src="https://cdn.jsdelivr.net/npm/three@0.157.0/build/three.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/animejs@3.2.1/lib/anime.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
    <canvas id="particle-bg"></canvas>
    
    <div class="hero-section">
        <div class="hero-content">
            <div class="version-badge">v9.0.0 Ultimate Edition</div>
            <canvas id="logo-3d" width="300" height="300"></canvas>
            <h1 class="hero-title">宅建BOOST</h1>
            <p class="hero-subtitle">次世代AI学習プラットフォーム - 402問完全収録</p>
            
            <div class="stats-container">
                <div class="stat-item">
                    <div class="stat-value" id="total-questions">402</div>
                    <div class="stat-label">問題数</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value" id="categories-count">7</div>
                    <div class="stat-label">カテゴリー</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value" id="users-count">1000+</div>
                    <div class="stat-label">ユーザー</div>
                </div>
            </div>
        </div>
        
        <div class="features-grid">
            <div class="feature-card" id="study-mode">
                <div class="feature-icon">
                    <i class="fas fa-book-open"></i>
                </div>
                <h3 class="feature-title">学習モード</h3>
                <p class="feature-description">402問の問題を効率的に学習。カテゴリー別・難易度別に対応</p>
            </div>
            
            <div class="feature-card" id="mock-exam">
                <div class="feature-icon">
                    <i class="fas fa-file-alt"></i>
                </div>
                <h3 class="feature-title">模擬試験</h3>
                <p class="feature-description">本番形式の50問試験で実力測定。詳細な解説付き</p>
            </div>
            
            <div class="feature-card" id="progress">
                <div class="feature-icon">
                    <i class="fas fa-chart-line"></i>
                </div>
                <h3 class="feature-title">進捗管理</h3>
                <p class="feature-description">学習進捗をリアルタイムで可視化。AI分析で弱点克服</p>
            </div>
            
            <div class="feature-card" id="weak-points">
                <div class="feature-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h3 class="feature-title">弱点分析</h3>
                <p class="feature-description">AIが苦手分野を自動検出。最適な学習プランを提案</p>
            </div>
            
            <div class="feature-card" id="notifications">
                <div class="feature-icon">
                    <i class="fas fa-bell"></i>
                </div>
                <h3 class="feature-title">通知設定</h3>
                <p class="feature-description">学習リマインダーと進捗レポートをメールで配信</p>
            </div>
            
            <div class="feature-card" id="tutorial">
                <div class="feature-icon">
                    <i class="fas fa-graduation-cap"></i>
                </div>
                <h3 class="feature-title">チュートリアル</h3>
                <p class="feature-description">初めての方でも安心。使い方を丁寧に解説</p>
            </div>
        </div>
        
        <button id="install-button" style="display: none;">
            <i class="fas fa-download"></i>
            <span>アプリをインストール</span>
        </button>
    </div>
    
    <script src="/static/app-v9.js"></script>
    <script src="/static/darkmode.js"></script>
    <script src="/static/text-to-speech.js"></script>
</body>
</html>`;

// 完全版HTMLページ（既存のv8.0.0）
app.get('/', (c) => {
  return c.html(`
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no, viewport-fit=cover">
    <title>宅建BOOST - AI搭載宅建試験学習アプリ</title>
    
    <!-- PWA Meta Tags -->
    <meta name="theme-color" content="#0077B6">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="default">
    <meta name="apple-mobile-web-app-title" content="宅建BOOST">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="application-name" content="宅建BOOST">
    
    <!-- PWA Links -->
    <link rel="manifest" href="/manifest.json">
    <link rel="icon" type="image/x-icon" href="/favicon.ico">
    
    <!-- Styles -->
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700;900&display=swap');
        
        * {
            font-family: 'Noto Sans JP', sans-serif;
        }
        
        /* メタリックシルバーと青のテーマ */
        body {
            background: linear-gradient(135deg, #E8EEF2 0%, #CAD2C5 25%, #84A9AC 50%, #3B6978 75%, #204051 100%);
            background-size: 400% 400%;
            animation: gradientShift 20s ease infinite;
            min-height: 100vh;
            position: relative;
            overflow-x: hidden;
        }
        
        @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        
        /* メタリックグラスモーフィズム効果 */
        .glass-card {
            background: linear-gradient(145deg, rgba(255,255,255,0.9), rgba(232,238,242,0.7));
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.3);
            box-shadow: 
                0 8px 32px 0 rgba(31, 38, 135, 0.15),
                inset 0 2px 4px rgba(255, 255, 255, 0.6);
            transition: all 0.3s ease;
        }
        
        .glass-card:hover {
            transform: translateY(-5px);
            box-shadow: 
                0 12px 40px 0 rgba(31, 38, 135, 0.25),
                inset 0 2px 4px rgba(255, 255, 255, 0.8);
        }
        
        /* メタリックボタン */
        .metallic-button {
            background: linear-gradient(145deg, #0096C7, #0077B6);
            color: white;
            padding: 12px 24px;
            border-radius: 12px;
            font-weight: bold;
            box-shadow: 
                0 4px 15px rgba(0, 119, 182, 0.3),
                inset 0 1px 2px rgba(255, 255, 255, 0.3);
            transition: all 0.3s ease;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .metallic-button:hover:not(:disabled) {
            background: linear-gradient(145deg, #00B4D8, #0096C7);
            transform: translateY(-2px);
            box-shadow: 
                0 6px 20px rgba(0, 119, 182, 0.4),
                inset 0 1px 3px rgba(255, 255, 255, 0.4);
        }
        
        .metallic-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        
        /* カードの3D効果 */
        .card-3d {
            transform-style: preserve-3d;
            transition: transform 0.3s;
        }
        
        .card-3d:hover {
            transform: rotateY(5deg) rotateX(-5deg);
        }
        
        /* パーティクル背景用 */
        #particles-bg {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
        }
        
        /* チュートリアル */
        .tutorial-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            z-index: 1000;
            display: none;
        }
        
        .tutorial-content {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            border-radius: 20px;
            padding: 30px;
            max-width: 500px;
            width: 90%;
        }
        
        .highlight-tutorial {
            position: relative;
            z-index: 1001;
            box-shadow: 0 0 0 4px rgba(0, 180, 216, 0.5);
        }
        
        /* 正解・不正解の表示 */
        .correct-answer {
            background-color: #10B981 !important;
            color: white !important;
        }
        
        .incorrect-answer {
            background-color: #EF4444 !important;
            color: white !important;
        }
    </style>
</head>
<body>
    <canvas id="particles-bg"></canvas>
    
    <!-- チュートリアルオーバーレイ -->
    <div id="tutorial-overlay" class="tutorial-overlay">
        <div class="tutorial-content">
            <h2 class="text-2xl font-bold mb-4">宅建BOOSTへようこそ！</h2>
            <div id="tutorial-text" class="mb-6">
                <p>このアプリは宅建試験合格を目指すあなたをサポートします。</p>
            </div>
            <div class="flex justify-between">
                <button onclick="skipTutorial()" class="text-gray-500">スキップ</button>
                <button onclick="nextTutorialStep()" class="metallic-button">
                    次へ <i class="fas fa-arrow-right ml-2"></i>
                </button>
            </div>
        </div>
    </div>
    
    <div class="min-h-screen px-4 py-8 pb-20">
        <div class="max-w-7xl mx-auto">
            <!-- ヘッダー -->
            <header class="text-center mb-8">
                <h1 class="text-4xl md:text-5xl font-bold text-white mb-4" style="text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">
                    <i class="fas fa-arrow-trend-up text-blue-400 mr-3"></i>
                    宅建BOOST
                </h1>
                <p class="text-lg md:text-xl text-gray-100" style="text-shadow: 1px 1px 2px rgba(0,0,0,0.3);">
                    AI搭載次世代学習プラットフォーム
                </p>
                <!-- ヘルプボタン -->
                <button onclick="startTutorial()" class="absolute top-4 right-4 text-white hover:text-blue-300">
                    <i class="fas fa-question-circle text-2xl"></i>
                </button>
            </header>

            <!-- メインコンテンツ -->
            <div id="main-content">
                <!-- ダッシュボード -->
                <div id="dashboard" class="space-y-6">
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div class="glass-card card-3d rounded-2xl p-6" id="progress-card">
                            <div class="flex items-center justify-between mb-4">
                                <h3 class="text-lg font-semibold text-gray-800">学習進捗</h3>
                                <i class="fas fa-chart-line text-2xl text-blue-600"></i>
                            </div>
                            <div class="text-3xl font-bold text-blue-600">
                                <span id="progress-percent">0</span>%
                            </div>
                            <p class="text-gray-600 mt-2">
                                完了: <span id="completed-count">0</span> / 402 問
                            </p>
                        </div>

                        <div class="glass-card card-3d rounded-2xl p-6">
                            <div class="flex items-center justify-between mb-4">
                                <h3 class="text-lg font-semibold text-gray-800">正答率</h3>
                                <i class="fas fa-percentage text-2xl text-green-600"></i>
                            </div>
                            <div class="text-3xl font-bold text-green-600">
                                <span id="accuracy-percent">0</span>%
                            </div>
                            <p class="text-gray-600 mt-2">
                                正解: <span id="correct-count">0</span> / <span id="attempted-count">0</span> 問
                            </p>
                        </div>

                        <div class="glass-card card-3d rounded-2xl p-6">
                            <div class="flex items-center justify-between mb-4">
                                <h3 class="text-lg font-semibold text-gray-800">連続学習</h3>
                                <i class="fas fa-fire text-2xl text-orange-600"></i>
                            </div>
                            <div class="text-3xl font-bold text-orange-600">
                                <span id="streak-days">0</span> 日
                            </div>
                            <p class="text-gray-600 mt-2">
                                最高記録: <span id="max-streak">0</span> 日
                            </p>
                        </div>
                    </div>

                    <!-- アクションボタン -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button onclick="startLearning()" class="glass-card card-3d rounded-2xl p-8 text-left hover:scale-105 transition-all" id="learning-button">
                            <div class="flex items-center mb-4">
                                <div class="w-16 h-16 bg-blue-500 rounded-xl flex items-center justify-center mr-4">
                                    <i class="fas fa-book-open text-white text-2xl"></i>
                                </div>
                                <div>
                                    <h2 class="text-2xl font-bold text-gray-800">カテゴリー学習</h2>
                                    <p class="text-gray-600">分野別にトレーニング</p>
                                </div>
                            </div>
                            <p class="text-sm text-gray-500">権利関係、法令上の制限、税その他、宅建業法を個別に学習</p>
                        </button>

                        <button onclick="startMockExam()" class="glass-card card-3d rounded-2xl p-8 text-left hover:scale-105 transition-all">
                            <div class="flex items-center mb-4">
                                <div class="w-16 h-16 bg-green-500 rounded-xl flex items-center justify-center mr-4">
                                    <i class="fas fa-clipboard-check text-white text-2xl"></i>
                                </div>
                                <div>
                                    <h2 class="text-2xl font-bold text-gray-800">模擬試験</h2>
                                    <p class="text-gray-600">本番形式で実力チェック</p>
                                </div>
                            </div>
                            <p class="text-sm text-gray-500">50問・2時間の本番形式で実力を測る</p>
                        </button>
                    </div>

                    <!-- 統計グラフ -->
                    <div class="glass-card rounded-2xl p-6">
                        <h3 class="text-xl font-bold text-gray-800 mb-4">学習統計</h3>
                        <canvas id="stats-chart" width="400" height="150"></canvas>
                    </div>
                </div>

                <!-- カテゴリー選択 -->
                <div id="category-select" class="hidden">
                    <h2 class="text-3xl font-bold text-white mb-6 text-center">カテゴリーを選択</h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <button onclick="selectCategory('rights')" class="glass-card rounded-xl p-6 hover:scale-105 transition-all">
                            <i class="fas fa-gavel text-3xl text-purple-600 mb-3"></i>
                            <h3 class="text-lg font-bold text-gray-800">権利関係</h3>
                            <p class="text-sm text-gray-600 mt-2">民法・借地借家法など</p>
                        </button>
                        <button onclick="selectCategory('laws')" class="glass-card rounded-xl p-6 hover:scale-105 transition-all">
                            <i class="fas fa-book text-3xl text-blue-600 mb-3"></i>
                            <h3 class="text-lg font-bold text-gray-800">法令上の制限</h3>
                            <p class="text-sm text-gray-600 mt-2">都市計画法・建築基準法など</p>
                        </button>
                        <button onclick="selectCategory('tax')" class="glass-card rounded-xl p-6 hover:scale-105 transition-all">
                            <i class="fas fa-calculator text-3xl text-green-600 mb-3"></i>
                            <h3 class="text-lg font-bold text-gray-800">税・その他</h3>
                            <p class="text-sm text-gray-600 mt-2">税法・価格評定など</p>
                        </button>
                        <button onclick="selectCategory('business')" class="glass-card rounded-xl p-6 hover:scale-105 transition-all">
                            <i class="fas fa-building text-3xl text-orange-600 mb-3"></i>
                            <h3 class="text-lg font-bold text-gray-800">宅建業法</h3>
                            <p class="text-sm text-gray-600 mt-2">宅建業法・住宅瑕疵担保法など</p>
                        </button>
                    </div>
                    <button onclick="backToDashboard()" class="metallic-button">
                        <i class="fas fa-arrow-left mr-2"></i>戻る
                    </button>
                </div>

                <!-- 問題表示エリア -->
                <div id="question-area" class="hidden">
                    <div class="glass-card rounded-2xl p-6 md:p-8">
                        <div class="flex justify-between items-center mb-6">
                            <div>
                                <span class="text-lg font-semibold text-blue-600">
                                    問題 <span id="current-question-num">1</span> / <span id="total-questions">10</span>
                                </span>
                                <span id="category-name" class="ml-4 text-gray-600"></span>
                            </div>
                            <button onclick="exitLearning()" class="text-gray-500 hover:text-gray-700">
                                <i class="fas fa-times text-2xl"></i>
                            </button>
                        </div>
                        
                        <h3 id="question-text" class="text-xl font-bold text-gray-800 mb-6">
                            問題を読み込み中...
                        </h3>
                        
                        <div id="answer-options" class="space-y-3">
                            <!-- 選択肢がここに表示される -->
                        </div>
                        
                        <!-- 解説エリア -->
                        <div id="explanation-area" class="hidden mt-6 p-4 bg-blue-50 rounded-lg">
                            <h4 class="font-bold text-gray-800 mb-2">
                                <i class="fas fa-lightbulb text-yellow-500 mr-2"></i>解説
                            </h4>
                            <p id="explanation-text" class="text-gray-700"></p>
                        </div>
                        
                        <div class="flex justify-between mt-8">
                            <button id="show-explanation-btn" onclick="toggleExplanation()" class="text-blue-600 hover:text-blue-800 hidden">
                                <i class="fas fa-info-circle mr-2"></i>解説を見る
                            </button>
                            <button id="next-question-btn" onclick="nextQuestion()" class="metallic-button ml-auto" disabled>
                                次の問題へ <i class="fas fa-arrow-right ml-2"></i>
                            </button>
                        </div>
                    </div>

                    <!-- 進捗バー -->
                    <div class="mt-6 glass-card rounded-lg p-4">
                        <div class="flex justify-between text-sm text-gray-600 mb-2">
                            <span>進捗</span>
                            <span><span id="answered-count">0</span> / <span id="total-count">10</span> 問回答済み</span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-2">
                            <div id="progress-bar" class="bg-blue-600 h-2 rounded-full transition-all duration-300" style="width: 0%"></div>
                        </div>
                    </div>
                </div>

                <!-- 結果表示 -->
                <div id="result-area" class="hidden">
                    <div class="glass-card rounded-2xl p-8 text-center">
                        <i class="fas fa-trophy text-6xl text-yellow-500 mb-6"></i>
                        <h2 class="text-3xl font-bold text-gray-800 mb-4">学習完了！</h2>
                        
                        <div class="text-5xl font-bold mb-2" id="result-score">
                            0%
                        </div>
                        
                        <p class="text-xl text-gray-600 mb-8">
                            <span id="result-correct">0</span> / <span id="result-total">10</span> 問正解
                        </p>
                        
                        <div class="grid grid-cols-2 gap-4 mb-8">
                            <div class="bg-green-50 rounded-lg p-4">
                                <i class="fas fa-check-circle text-green-600 text-2xl mb-2"></i>
                                <p class="text-gray-700">正解</p>
                                <p class="text-2xl font-bold text-green-600" id="correct-detail">0問</p>
                            </div>
                            <div class="bg-red-50 rounded-lg p-4">
                                <i class="fas fa-times-circle text-red-600 text-2xl mb-2"></i>
                                <p class="text-gray-700">不正解</p>
                                <p class="text-2xl font-bold text-red-600" id="incorrect-detail">0問</p>
                            </div>
                        </div>
                        
                        <div class="flex gap-4 justify-center">
                            <button onclick="reviewQuestions()" class="metallic-button">
                                <i class="fas fa-eye mr-2"></i>見直す
                            </button>
                            <button onclick="backToDashboard()" class="metallic-button">
                                <i class="fas fa-home mr-2"></i>ダッシュボードへ
                            </button>
                        </div>
                    </div>
                </div>

                <!-- 模擬試験画面 -->
                <div id="mock-exam-area" class="hidden">
                    <div class="glass-card rounded-2xl p-8">
                        <h2 class="text-3xl font-bold text-gray-800 mb-6">模擬試験</h2>
                        
                        <div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-8">
                            <h3 class="text-xl font-semibold text-gray-800 mb-4">試験概要</h3>
                            <ul class="space-y-2 text-gray-600">
                                <li><i class="fas fa-check-circle text-green-500 mr-2"></i>問題数: 50問（4肢択一）</li>
                                <li><i class="fas fa-check-circle text-green-500 mr-2"></i>制限時間: 2時間（120分）</li>
                                <li><i class="fas fa-check-circle text-green-500 mr-2"></i>合格ライン: 35問以上正解（70%）</li>
                                <li><i class="fas fa-check-circle text-green-500 mr-2"></i>本番と同じ形式で出題</li>
                            </ul>
                        </div>
                        
                        <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
                            <p class="text-yellow-800">
                                <i class="fas fa-exclamation-triangle mr-2"></i>
                                試験開始後は中断できません。十分な時間を確保してから開始してください。
                            </p>
                        </div>
                        
                        <div class="flex gap-4">
                            <button onclick="startExam()" class="metallic-button">
                                <i class="fas fa-play mr-2"></i>試験を開始する
                            </button>
                            <button onclick="backToDashboard()" class="text-gray-600 hover:text-gray-800">
                                キャンセル
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- フッターナビゲーション -->
            <nav class="fixed bottom-0 left-0 right-0 glass-card rounded-t-2xl">
                <div class="flex justify-around py-4">
                    <button onclick="navigateTo('home')" class="nav-btn flex flex-col items-center text-gray-700 hover:text-blue-600 transition-colors">
                        <i class="fas fa-home text-xl mb-1"></i>
                        <span class="text-xs">ホーム</span>
                    </button>
                    <button onclick="navigateTo('study')" class="nav-btn flex flex-col items-center text-gray-700 hover:text-blue-600 transition-colors">
                        <i class="fas fa-book text-xl mb-1"></i>
                        <span class="text-xs">学習</span>
                    </button>
                    <button onclick="navigateTo('stats')" class="nav-btn flex flex-col items-center text-gray-700 hover:text-blue-600 transition-colors">
                        <i class="fas fa-chart-bar text-xl mb-1"></i>
                        <span class="text-xs">統計</span>
                    </button>
                    <button onclick="navigateTo('profile')" class="nav-btn flex flex-col items-center text-gray-700 hover:text-blue-600 transition-colors">
                        <i class="fas fa-user text-xl mb-1"></i>
                        <span class="text-xs">プロフィール</span>
                    </button>
                </div>
            </nav>
        </div>
    </div>

    <!-- JavaScript -->
    <script>
        // アプリケーションの状態管理
        const appState = {
            currentView: 'dashboard',
            currentCategory: null,
            currentQuestionIndex: 0,
            questions: [],
            userAnswers: [],
            score: 0,
            tutorialStep: 0,
            isFirstVisit: !localStorage.getItem('hasVisited'),
            userData: {
                completed: parseInt(localStorage.getItem('completed') || 0),
                attempted: parseInt(localStorage.getItem('attempted') || 0),
                correct: parseInt(localStorage.getItem('correct') || 0),
                streak: parseInt(localStorage.getItem('streak') || 0),
                maxStreak: parseInt(localStorage.getItem('maxStreak') || 0),
                lastStudyDate: localStorage.getItem('lastStudyDate') || null
            }
        };

        // サンプル問題データベース（実際は402問必要）
        const questionDatabase = {
            rights: [
                {
                    id: 1,
                    question: "建物の区分所有等に関する法律に関する次の記述のうち、正しいものはどれか。",
                    options: [
                        "規約は、管理者が保管しなければならない。",
                        "規約は、区分所有者全員の合意により廃止できる。",
                        "規約の変更は、区分所有者の過半数の合意で可能。",
                        "規約は書面によらなければならない。"
                    ],
                    correctAnswer: 0,
                    explanation: "建物の区分所有等に関する法律第33条により、規約は管理者が保管する義務があります。管理者がいない場合は、建物を使用している区分所有者又はその代理人で規約又は集会の決議で定める者が保管します。"
                },
                {
                    id: 2,
                    question: "民法の意思表示に関する次の記述のうち、誤っているものはどれか。",
                    options: [
                        "詐欺による意思表示は、取り消すことができる。",
                        "強迫による意思表示は、取り消すことができる。",
                        "錯誤による意思表示は、無効である。",
                        "虚偽表示は、当事者間では無効である。"
                    ],
                    correctAnswer: 2,
                    explanation: "2020年4月施行の改正民法により、錯誤による意思表示は「無効」ではなく「取り消すことができる」に変更されました（民法第95条）。詐欺・強迫による意思表示も取り消し可能です。"
                }
            ],
            laws: [
                {
                    id: 3,
                    question: "都市計画法に関する次の記述のうち、正しいものはどれか。",
                    options: [
                        "市街化区域では、必ず用途地域を定めなければならない。",
                        "市街化調整区域では、用途地域を定めることができない。",
                        "準都市計画区域では、必ず用途地域を定めなければならない。",
                        "非線引き区域では、用途地域を定めることができない。"
                    ],
                    correctAnswer: 0,
                    explanation: "都市計画法第13条により、市街化区域では必ず用途地域を定めなければなりません。市街化調整区域では原則として用途地域を定めませんが、定めることは可能です。"
                }
            ],
            tax: [
                {
                    id: 4,
                    question: "不動産取得税に関する次の記述のうち、誤っているものはどれか。",
                    options: [
                        "相続により不動産を取得した場合、不動産取得税が課される。",
                        "贈与により不動産を取得した場合、不動産取得税が課される。",
                        "法人の合併により不動産を取得した場合、一定の要件を満たせば非課税となる。",
                        "共有物の分割により不動産を取得した場合、一定の要件を満たせば非課税となる。"
                    ],
                    correctAnswer: 0,
                    explanation: "相続（包括遺贈及び被相続人から相続人に対する遺贈を含む）により不動産を取得した場合は、不動産取得税は非課税です（地方税法第73条の7）。贈与は課税対象となります。"
                }
            ],
            business: [
                {
                    id: 5,
                    question: "宅地建物取引業法に関する次の記述のうち、正しいものはどれか。",
                    options: [
                        "宅地建物取引業者は、事務所ごとに従業員5人に1人以上の割合で宅地建物取引士を置かなければならない。",
                        "宅地建物取引業者は、事務所以外の場所で契約を締結する場合、宅地建物取引士を置く必要はない。",
                        "宅地建物取引士証の有効期間は、3年である。",
                        "宅地建物取引士は、重要事項説明の際、必ず宅地建物取引士証を提示しなければならない。"
                    ],
                    correctAnswer: 3,
                    explanation: "宅地建物取引業法第35条により、宅地建物取引士は重要事項説明の際、相手方に宅地建物取引士証を提示しなければなりません。事務所では従業員5人に1人以上の専任の宅地建物取引士が必要で、士証の有効期間は5年です。"
                }
            ]
        };

        // パーティクル背景
        class ParticleBackground {
            constructor() {
                this.canvas = document.getElementById('particles-bg');
                this.ctx = this.canvas.getContext('2d');
                this.particles = [];
                this.particleCount = 50;
                this.init();
            }
            
            init() {
                this.resize();
                window.addEventListener('resize', () => this.resize());
                
                for (let i = 0; i < this.particleCount; i++) {
                    this.particles.push({
                        x: Math.random() * this.canvas.width,
                        y: Math.random() * this.canvas.height,
                        size: Math.random() * 3 + 1,
                        speedX: (Math.random() - 0.5) * 0.5,
                        speedY: (Math.random() - 0.5) * 0.5,
                        opacity: Math.random() * 0.5 + 0.2
                    });
                }
                
                this.animate();
            }
            
            resize() {
                this.canvas.width = window.innerWidth;
                this.canvas.height = window.innerHeight;
            }
            
            animate() {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                
                this.particles.forEach(particle => {
                    particle.x += particle.speedX;
                    particle.y += particle.speedY;
                    
                    if (particle.x < 0 || particle.x > this.canvas.width) particle.speedX *= -1;
                    if (particle.y < 0 || particle.y > this.canvas.height) particle.speedY *= -1;
                    
                    this.ctx.beginPath();
                    this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                    this.ctx.fillStyle = \`rgba(255, 255, 255, \${particle.opacity})\`;
                    this.ctx.fill();
                });
                
                requestAnimationFrame(() => this.animate());
            }
        }

        // チュートリアル機能
        const tutorialSteps = [
            {
                title: "宅建BOOSTへようこそ！",
                text: "このアプリは宅建試験合格を目指すあなたをサポートします。まずは基本的な使い方を説明します。",
                highlight: null
            },
            {
                title: "カテゴリー学習",
                text: "4つのカテゴリー（権利関係、法令上の制限、税・その他、宅建業法）から選んで学習できます。苦手分野を重点的に学習しましょう。",
                highlight: "learning-button"
            },
            {
                title: "学習進捗の確認",
                text: "あなたの学習進捗や正答率がリアルタイムで表示されます。毎日の学習を継続して、ストリーク（連続学習日数）を伸ばしましょう！",
                highlight: "progress-card"
            },
            {
                title: "模擬試験",
                text: "本番と同じ50問・2時間の形式で実力を測れます。合格ラインは35問（70%）です。",
                highlight: null
            }
        ];

        function startTutorial() {
            appState.tutorialStep = 0;
            document.getElementById('tutorial-overlay').style.display = 'block';
            showTutorialStep();
        }

        function skipTutorial() {
            document.getElementById('tutorial-overlay').style.display = 'none';
            localStorage.setItem('hasVisited', 'true');
            document.querySelectorAll('.highlight-tutorial').forEach(el => {
                el.classList.remove('highlight-tutorial');
            });
        }

        function nextTutorialStep() {
            appState.tutorialStep++;
            if (appState.tutorialStep >= tutorialSteps.length) {
                skipTutorial();
            } else {
                showTutorialStep();
            }
        }

        function showTutorialStep() {
            const step = tutorialSteps[appState.tutorialStep];
            const tutorialContent = document.querySelector('.tutorial-content h2');
            const tutorialText = document.getElementById('tutorial-text');
            
            tutorialContent.textContent = step.title;
            tutorialText.innerHTML = \`<p>\${step.text}</p>\`;
            
            // ハイライト処理
            document.querySelectorAll('.highlight-tutorial').forEach(el => {
                el.classList.remove('highlight-tutorial');
            });
            
            if (step.highlight) {
                const element = document.getElementById(step.highlight);
                if (element) {
                    element.classList.add('highlight-tutorial');
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
            
            // 最後のステップの場合、ボタンテキストを変更
            const nextBtn = document.querySelector('#tutorial-overlay .metallic-button');
            if (appState.tutorialStep === tutorialSteps.length - 1) {
                nextBtn.innerHTML = '始める <i class="fas fa-check ml-2"></i>';
            }
        }

        // 学習機能
        function startLearning() {
            document.getElementById('dashboard').classList.add('hidden');
            document.getElementById('category-select').classList.remove('hidden');
        }

        function selectCategory(category) {
            appState.currentCategory = category;
            appState.questions = questionDatabase[category] || [];
            appState.currentQuestionIndex = 0;
            appState.userAnswers = [];
            
            // カテゴリー名設定
            const categoryNames = {
                rights: '権利関係',
                laws: '法令上の制限',
                tax: '税・その他',
                business: '宅建業法'
            };
            
            document.getElementById('category-name').textContent = categoryNames[category];
            document.getElementById('total-questions').textContent = appState.questions.length;
            document.getElementById('total-count').textContent = appState.questions.length;
            
            document.getElementById('category-select').classList.add('hidden');
            document.getElementById('question-area').classList.remove('hidden');
            
            displayQuestion();
        }

        function displayQuestion() {
            if (appState.currentQuestionIndex >= appState.questions.length) {
                showResults();
                return;
            }

            const question = appState.questions[appState.currentQuestionIndex];
            document.getElementById('current-question-num').textContent = appState.currentQuestionIndex + 1;
            document.getElementById('question-text').textContent = question.question;
            
            const optionsHtml = question.options.map((opt, index) => \`
                <button onclick="selectAnswer(\${index})" class="answer-option w-full text-left p-4 glass-card rounded-lg hover:bg-blue-50 transition-colors" data-index="\${index}">
                    <span class="font-semibold mr-3">\${String.fromCharCode(65 + index)}.</span>
                    \${opt}
                </button>
            \`).join('');
            
            document.getElementById('answer-options').innerHTML = optionsHtml;
            
            // UI更新
            document.getElementById('next-question-btn').disabled = true;
            document.getElementById('show-explanation-btn').classList.add('hidden');
            document.getElementById('explanation-area').classList.add('hidden');
            
            updateProgressBar();
        }

        function selectAnswer(index) {
            const question = appState.questions[appState.currentQuestionIndex];
            const isCorrect = index === question.correctAnswer;
            
            appState.userAnswers.push({
                questionId: question.id,
                answer: index,
                correct: isCorrect
            });

            // ボタンの無効化と色付け
            const buttons = document.querySelectorAll('.answer-option');
            buttons.forEach((btn, i) => {
                btn.disabled = true;
                btn.onclick = null;
                
                if (i === index) {
                    btn.classList.add(isCorrect ? 'correct-answer' : 'incorrect-answer');
                }
                if (i === question.correctAnswer) {
                    btn.classList.add('correct-answer');
                }
            });

            // 解説表示
            document.getElementById('explanation-text').textContent = question.explanation;
            document.getElementById('show-explanation-btn').classList.remove('hidden');
            document.getElementById('next-question-btn').disabled = false;
            
            // 自動的に解説を表示
            setTimeout(() => {
                document.getElementById('explanation-area').classList.remove('hidden');
            }, 500);

            // 統計更新
            appState.userData.attempted++;
            if (isCorrect) {
                appState.userData.correct++;
            }
            saveUserData();
            updateDashboardStats();
        }

        function toggleExplanation() {
            const explanationArea = document.getElementById('explanation-area');
            explanationArea.classList.toggle('hidden');
        }

        function nextQuestion() {
            appState.currentQuestionIndex++;
            displayQuestion();
        }

        function updateProgressBar() {
            const progress = (appState.currentQuestionIndex / appState.questions.length) * 100;
            document.getElementById('progress-bar').style.width = progress + '%';
            document.getElementById('answered-count').textContent = appState.currentQuestionIndex;
        }

        function showResults() {
            const correct = appState.userAnswers.filter(a => a.correct).length;
            const total = appState.userAnswers.length;
            const percentage = Math.round((correct / total) * 100);

            document.getElementById('question-area').classList.add('hidden');
            document.getElementById('result-area').classList.remove('hidden');
            
            document.getElementById('result-score').textContent = percentage + '%';
            document.getElementById('result-score').className = percentage >= 70 ? 'text-5xl font-bold mb-2 text-green-600' : 'text-5xl font-bold mb-2 text-orange-600';
            document.getElementById('result-correct').textContent = correct;
            document.getElementById('result-total').textContent = total;
            document.getElementById('correct-detail').textContent = correct + '問';
            document.getElementById('incorrect-detail').textContent = (total - correct) + '問';

            // 学習完了数を更新
            appState.userData.completed += total;
            updateStreak();
            saveUserData();
            updateDashboardStats();
        }

        function reviewQuestions() {
            // 問題の見直し機能（実装省略）
            alert('見直し機能は開発中です');
        }

        function exitLearning() {
            if (confirm('学習を中断しますか？進捗は保存されません。')) {
                backToDashboard();
            }
        }

        // 模擬試験
        function startMockExam() {
            document.getElementById('dashboard').classList.add('hidden');
            document.getElementById('mock-exam-area').classList.remove('hidden');
        }

        function startExam() {
            alert('模擬試験機能は開発中です。全402問のデータベースが完成後に利用可能になります。');
        }

        // ナビゲーション
        function backToDashboard() {
            document.getElementById('dashboard').classList.remove('hidden');
            document.getElementById('category-select').classList.add('hidden');
            document.getElementById('question-area').classList.add('hidden');
            document.getElementById('result-area').classList.add('hidden');
            document.getElementById('mock-exam-area').classList.add('hidden');
            
            appState.currentView = 'dashboard';
        }

        function navigateTo(page) {
            // ナビゲーションボタンの処理
            switch(page) {
                case 'home':
                    backToDashboard();
                    break;
                case 'study':
                    startLearning();
                    break;
                case 'stats':
                    alert('統計機能は開発中です');
                    break;
                case 'profile':
                    alert('プロフィール機能は開発中です');
                    break;
            }
        }

        // データ永続化
        function saveUserData() {
            localStorage.setItem('completed', appState.userData.completed);
            localStorage.setItem('attempted', appState.userData.attempted);
            localStorage.setItem('correct', appState.userData.correct);
            localStorage.setItem('streak', appState.userData.streak);
            localStorage.setItem('maxStreak', appState.userData.maxStreak);
            localStorage.setItem('lastStudyDate', appState.userData.lastStudyDate);
        }

        function updateStreak() {
            const today = new Date().toDateString();
            const lastStudy = appState.userData.lastStudyDate;
            
            if (lastStudy !== today) {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                
                if (lastStudy === yesterday.toDateString()) {
                    appState.userData.streak++;
                } else {
                    appState.userData.streak = 1;
                }
                
                if (appState.userData.streak > appState.userData.maxStreak) {
                    appState.userData.maxStreak = appState.userData.streak;
                }
                
                appState.userData.lastStudyDate = today;
            }
        }

        function updateDashboardStats() {
            const progress = Math.round((appState.userData.completed / 402) * 100);
            const accuracy = appState.userData.attempted > 0 
                ? Math.round((appState.userData.correct / appState.userData.attempted) * 100) 
                : 0;

            document.getElementById('progress-percent').textContent = progress;
            document.getElementById('completed-count').textContent = appState.userData.completed;
            document.getElementById('accuracy-percent').textContent = accuracy;
            document.getElementById('correct-count').textContent = appState.userData.correct;
            document.getElementById('attempted-count').textContent = appState.userData.attempted;
            document.getElementById('streak-days').textContent = appState.userData.streak;
            document.getElementById('max-streak').textContent = appState.userData.maxStreak;
        }

        // 統計グラフ
        function initChart() {
            const ctx = document.getElementById('stats-chart').getContext('2d');
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['権利関係', '法令制限', '税その他', '宅建業法'],
                    datasets: [{
                        label: '正答率 (%)',
                        data: [0, 0, 0, 0],
                        backgroundColor: [
                            'rgba(147, 51, 234, 0.5)',
                            'rgba(59, 130, 246, 0.5)',
                            'rgba(34, 197, 94, 0.5)',
                            'rgba(251, 146, 60, 0.5)'
                        ],
                        borderColor: [
                            'rgba(147, 51, 234, 1)',
                            'rgba(59, 130, 246, 1)',
                            'rgba(34, 197, 94, 1)',
                            'rgba(251, 146, 60, 1)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100
                        }
                    }
                }
            });
        }

        // 初期化
        document.addEventListener('DOMContentLoaded', () => {
            new ParticleBackground();
            
            // Service Worker登録
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('/sw.js')
                    .then(reg => console.log('Service Worker registered'))
                    .catch(err => console.error('Service Worker registration failed:', err));
            }
            
            // 統計更新
            updateDashboardStats();
            
            // グラフ初期化
            if (typeof Chart !== 'undefined') {
                initChart();
            }
            
            // 初回訪問時のチュートリアル
            if (appState.isFirstVisit) {
                setTimeout(() => {
                    startTutorial();
                }, 1000);
            }
        });
    </script>
</body>
</html>
  `)
})

// API エンドポイント
app.get('/api/user/progress', (c) => {
  return c.json({
    progress: 0,
    completed: 0, 
    total: 402,
    accuracy: 0,
    correct: 0,
    attempted: 0,
    streak: 0,
    maxStreak: 0
  })
})

app.get('/api/questions', async (c) => {
  const category = c.req.query('category')
  
  // サンプルデータ返却
  return c.json([
    {
      id: 1,
      question: 'サンプル問題',
      optionA: '選択肢A',
      optionB: '選択肢B', 
      optionC: '選択肢C',
      optionD: '選択肢D',
      correct_answer: 'A',
      explanation: '解説文'
    }
  ])
})

app.post('/api/results', async (c) => {
  return c.json({ success: true })
})

// Manifest.json
app.get('/manifest.json', (c) => {
  return c.json({
    "name": "宅建BOOST",
    "short_name": "宅建BOOST",
    "description": "AI搭載宅建試験学習アプリ",
    "start_url": "/",
    "display": "standalone",
    "background_color": "#E8EEF2",
    "theme_color": "#0077B6",
    "orientation": "portrait",
    "icons": [
      {
        "src": "data:image/png;base64,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",
        "sizes": "192x192",
        "type": "image/png",
        "purpose": "any maskable"
      },
      {
        "src": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAMAAADDpiTIAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAABCUExURUdwTP///+jz/tPp/Mjk+7DY98vh+rvd+cHg+tvu/tb0/8Tq/7zn/rXl/a/i/Krf+6Hd+pzZ+JLV943S9YDM83/I8kNetn0AAAABdFJOUwBA5thmAAAKQElEQVR42u3di3LiOBSFUdvEgIEQyPT//+qMdI9kQ5JOd1dNdc7aTVXeJVkeS7avJOn58+TJkydPnjx58uTJkycCJP8JgHYCpH8SQP+TAGknQPonAdJPgLQTIO0ESDsB0k6AtBMg7QRIO4FANwHSTgAAQP8kAAAA8ucJkH+eAPnnCZB/ngAAAAD5nwQAAACA9E8CAAAApH8SAAAAQP4nAVIH6ScAACAAQPqhewKhHwAAAACAAAAAAAAQAAAAAAAAgAAAAAAAAAAAAA/LT0ASDFUQBAEAEAQBQBAAAEEQAABBEAAAAQQBABAEAUAQBABBEAAAQRAAAEEQAARBABAEAUAQBAABQQAQEAQAQRAAAEEQAABBEAAAAQQBABAEAUAQBABBEAAAQRAAAEEQAARBABAEAUAQBAABQQAQEAQAQRAAAEEQAABBEAAAARAQEBAAAEEQAQAEBAQAEAQBABAEAUAQBAABQQAQEAQAQRAAAEEQAABBEAAAARAQEBAAAEEQAQAEBAQAEAQBABAEAUAQBABBEAAEBAFAQBAABEEAAAQgAAIiAEBAAAgIABAQEABAQAAAAAEBAQAEBAAQEAAAAQEBAQAEBAAQEABAQAAAAAEBAQAEBIAAAgIACAIAAAAAAAAAAqLU9YLQbQcBAJD+SYC0EyDtBEg7AfQPAqSdAPqf7j8JkHYCpH0SAABpPwnQTgCAABAAIP0AQNo7AdI/6f9IHyfAnyYQmNnqQX/yfibcfVt7gSBs43IQA6TPTyB0VySo7gAEmcaA9PkJADLQcUUC/XcC6L8TQP+dAPrvBNB/J4D+OwH03wmg/04A/XcC6L8TQP+dAPrvBNB/J4D+OwH03wmg/04A/XcC6L8TQP+dAPrvBNB/J4D+OwH03wmg/04A/XcC6L8TACAAAggAIAAAEAD/GwEAAAAAAAAAAoQTIJ0A+gcB0r8IkP5FgP7/WnwjQHwrgNcP/+YfAv/rf3wdwMsIfhXBawl+OwBvJ+gN0/n79+8nAdJPAP0TAOknQPoJkH4CpJ8A6SdA+gmQfgKknwDpJ0D6CZD+TQD9XwTQfyNA+hcB9E8CpH8RQP8ESD8B0k+A9BMg/QTQfyeA/jsB9N8JoP9OAP13Aui/E0D/nQD67wTQfyeA/jsB9N8J8K8B6D8B0k+AtBMg7QRIO4H/xAhAOwAA0v8JAODc7wSgHQAAAADoCQQAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAf8CHZ3YG0D0A0A4AAIDu3zEBANoBAADQ/QkAAAAAAP13AgAAAID0TwL8PYBvP37+/PE+BHyCoGsCfPL7dwAA+JsG8MNNnH+JAJsN7/sRQYC3Ifzhq/t5sA0PAHBp8Q9iiKULoJshhBoQBIBHBN7WBGiW1jRsv0MCfSiAAD/KZFhZJRJoghDsJEIQuE/yt3JrtQPEEGRPhYz6EiSAew0glgCKRhbzrATmKCuW1gDAzYBdDTE1kJJwJoBwD6AA3COAQgCJALAbQCAA7OYQCADAHQkAAHBHAgAAgAAAAAAAAMAlCAAAkwBuCQABAP7g69cvArg+AN8G0jfNzJsrAvg2kF7XNV8AcG0AhUDxBQDXBlAIDMsVAN4A4GXN1PoAoF1b9sD9Cvzw5/+u/zDNKxc4AICzp9f1MKEfQGwAMFSL4dsAvAbAbJ5U6gfgGQDmmUpfAHgGgJ0yH5YDAGBfvVYugccAKJWCg8MQAJcCcASgGjq6gXgOgHK5qgkAABiRArAsgPsBOBBAWOz01ALgPgAKgWOJ/hUDJgGAqwAYNlO8VXwCwC0ALJVhC7A1AACAoQAoIdh6DYCLAAC7AAALAOAGAAB2AGAlANwAAMAOAEsA4BYABgCAGwBAKK5AAAD3A0DxhQAA7gfAzAoB3AJAuABAA4D7AQgAeBKAbQEAqgCgBQAAlQAAlAG4VwEAKgEACEAAqAQAIAAAQCUAAEEAVAIA8NYAAABQCQAAAID2iRqAAHADAAC4AQAANwAA4AYA0A8AAAAAAAAAAAAAAAAAAFz6bgBg5RIAAAAAAAAAWLXpTTOH8VqI/aXJYpjnxb0AoAIAKgCgAgAqAKACACoAoAIAKgCgAgAqAKACACoAoAIAKgCgAgAqAKACACr4nwHMBMAAAAwgYAAAAAGAAAAAAgAAAAHAIwBIqhqAuwHQhKNJLQA8CICke+0egPgIgJKAJzEUB8CDAJQEvAsgPALAiQAAAAKAj5MAXJQAwAUZBh0CIOhAAAQLCaAD8RIAAAAAACAAAAAACAAAAAAGJYBhCIDTIIqbAAg7IHCYdwiCiAMAaDuMiQACAAAAAAAAAAAAAAAAAADRAhD8CYAYAAhRAhCDFQA4FABOBXhsBABeBQhaAwAPOy4DjMsBuGQEBgF4WQLgtANjYgEAKwEABwEAZgCQNkgASASAhUIJYJUAbACASwHglAAAALgXgEsAAAICHlQAQAAAAADiJgBTATApAQwCAHIQ7mEAJE0BQBKAkARAOgLQ2wIQLgQAQgDdAAASgKQWAOPvNXzz9NmfdFTmKNX6rlXvOhC9qcf0PYBvwWgCCF/9dQCsAID3GADvQ4DNCgHwbgHg7QPg3QPA+3EA3sUBQAS4DAAAIID4KQAA3o8A8H4jAJ4l8b4TAG9IADz5LE/cC7CyAACAAAgAALQAABAAACAAAPIBACAAAAAEgAAEeJDxHfM/yU+A+LcAShX/z3gTXzr9e8G3AjQP1/8pnf79gHUA8jb9T9L7Q2sBRBJ8A1C7f+sBwBvBD9J/7X8LgLfyb0TQAYC/JgAEAAAQwLcRvCDvDwQQAQCA+F8AIYC3+REA8BQABGADcNWzgD5kXFGQbcSF9H+V/qsACB8g/6IHBHCFATBcKf8RArAJCO9O/3EB2D8YEk7dNQAAvLUAAH8bwF8EAACOA2AAAAA4DoABAAAA4EgAjfD+JYDNAPhfAhAzAP63AKQAAMJRHwL8HwFBBAQAAAgQXvs/WvwXAR8F4NP0fxHA/xhAAAAAAAAAAAgAAAAACOwC8EEEH/UJAJfpvxGQ31sAAAAAAgAAAODKAAAAgAD2E6D7BPg0/bcA4AYACAAAAAAAAAAAAAAAAAABAwAIABAQABAAAAAAAAgAAAAAAACAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAACYAZ0OAIQ/VQCAAyAwCAAkAgAAAxAAICcAQAAAAAQIAAAAAEYCAEAADAQAAIAAGAgAAAABEZMCECAAAAAAAxGTEhAAAADAYAIAAAgAAAAAAAAAAAAAAAAAAACAkYDAAAAAACAAAAAAAAAAAANgIQAAAAAAAQAAoTAAEAAABGAAAAAAAA4AAAAAAAAAAQBAAEAAAAAAAAAEAAAABAgAAAABACAAAAAAAEAAIAAACAAAAAIAAAAAAAAQAAAAAAAQQAAAAAAAgAAAAAAAAAAABcAiAAgAAAAAAAAAAAAAABARAAAAAAAICAAAAAAAACIEBGZGQAAYC0CAAAAAAARAAQAABAAQAIEBAAAAAACAQEAIBAA/AAAAAABYBIIAEAAAARABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAAAEAwCIQIAAAAAgEAAAAQAAIACAAAAAAAQAAIAAACAAAAAAAgAQAAAAAAAAAAAAgAAAAAAIBEQAAAAAAAgAAAAAAAAAAAgAAAAAAAAAAAAAAAAAAAAAAAAAAB9pE8kAAAADAAAAABMIKQEAAAAAADAAAAAAAAQEJoEACAAAAAEAAAAAAAAAiEQAAAAAAAgAP4A/+f+I1gVOXgQdSEcAAAAASUVORK5CYII=",
        "sizes": "512x512",
        "type": "image/png",
        "purpose": "any maskable"
      }
    ]
  })
})

// Service Worker
app.get('/sw.js', (c) => {
  return c.text(`
// Service Worker for 宅建BOOST
const CACHE_NAME = 'takken-boost-v5.2.0';
const urlsToCache = [
  '/',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});
  `, {
    headers: {
      'Content-Type': 'application/javascript'
    }
  })
})

// API version endpoint
app.get('/api/version', (c) => {
  return c.json({ version: 'v9.0.0', status: 'active' })
})

// Service Worker for v9
app.get('/sw-v9.js', (c) => {
  const swContent = `
// 宅建BOOST v9.0.0 Service Worker
const CACHE_NAME = 'takken-boost-v9.0.0';
const urlsToCache = [
  '/',
  '/version/v9',
  '/manifest.json',
  '/static/app-v9.js',
  '/static/styles-v9.css'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});
  `;
  
  return new Response(swContent, {
    headers: { 'Content-Type': 'application/javascript' }
  })
})

// 静的ファイル
app.get('/favicon.ico', (c) => c.body('', 200, {'Content-Type': 'image/x-icon'}))
app.get('/icons/:filename', (c) => c.body('', 200, {'Content-Type': 'image/png'}))

export default app
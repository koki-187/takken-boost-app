import { Hono } from 'hono'
import { cors } from 'hono/cors'
import studyRoutes from './study-api'
import aiRoutes from './ai-analysis'

export type Bindings = {
  DB: D1Database;
  NOTIFICATION_EMAIL?: string;
  SENDGRID_API_KEY?: string;
}

const app = new Hono<{ Bindings: Bindings }>()

// Enable CORS
app.use('/api/*', cors())

// Mount API routes
app.route('/api/study', studyRoutes)
app.route('/api/ai', aiRoutes)

// メインページ - メタリックシルバーと青のテーマ
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
    <meta name="msapplication-TileColor" content="#0077B6">
    <meta name="msapplication-navbutton-color" content="#0077B6">
    <meta name="msapplication-starturl" content="/">
    
    <!-- PWA Links -->
    <link rel="manifest" href="/manifest.json">
    
    <!-- Favicons -->
    <link rel="icon" type="image/x-icon" href="/favicon.ico">
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="48x48" href="/icons/icon-48x48.png">
    
    <!-- Apple Touch Icons for iOS -->
    <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">
    <link rel="apple-touch-icon" sizes="120x120" href="/icons/icon-120x120.png">
    <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png">
    <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-180x180.png">
    
    <!-- Android/Chrome Icons -->
    <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192x192.png">
    <link rel="icon" type="image/png" sizes="512x512" href="/icons/icon-512x512.png">
    
    <!-- Microsoft Tiles -->
    <meta name="msapplication-TileImage" content="/icons/icon-144x144.png">
    
    <!-- Styles -->
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    
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
        
        .metallic-button:hover {
            background: linear-gradient(145deg, #00B4D8, #0096C7);
            transform: translateY(-2px);
            box-shadow: 
                0 6px 20px rgba(0, 119, 182, 0.4),
                inset 0 1px 3px rgba(255, 255, 255, 0.4);
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
        
        /* ローディングアニメーション */
        .loading-spinner {
            border: 3px solid #E8EEF2;
            border-top: 3px solid #0077B6;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <canvas id="particles-bg"></canvas>
    
    <div class="min-h-screen px-4 py-8">
        <div class="max-w-7xl mx-auto">
            <!-- ヘッダー -->
            <header class="text-center mb-12">
                <h1 class="text-5xl font-bold text-white mb-4" style="text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">
                    <i class="fas fa-arrow-trend-up text-blue-400 mr-3"></i>
                    宅建BOOST
                </h1>
                <p class="text-xl text-gray-100" style="text-shadow: 1px 1px 2px rgba(0,0,0,0.3);">
                    AI搭載次世代学習プラットフォーム
                </p>
            </header>

            <!-- メインコンテンツ -->
            <div id="main-content">
                <!-- ダッシュボード -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div class="glass-card card-3d rounded-2xl p-6">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-lg font-semibold text-gray-800">学習進捗</h3>
                            <i class="fas fa-chart-line text-2xl text-blue-600"></i>
                        </div>
                        <div class="text-3xl font-bold text-blue-600">0%</div>
                        <p class="text-gray-600 mt-2">完了: 0 / 402 問</p>
                    </div>

                    <div class="glass-card card-3d rounded-2xl p-6">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-lg font-semibold text-gray-800">正答率</h3>
                            <i class="fas fa-percentage text-2xl text-green-600"></i>
                        </div>
                        <div class="text-3xl font-bold text-green-600">0%</div>
                        <p class="text-gray-600 mt-2">正解: 0 / 0 問</p>
                    </div>

                    <div class="glass-card card-3d rounded-2xl p-6">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-lg font-semibold text-gray-800">AI分析</h3>
                            <i class="fas fa-brain text-2xl text-purple-600"></i>
                        </div>
                        <div class="text-lg font-bold text-purple-600">分析待ち</div>
                        <p class="text-gray-600 mt-2">10問解答後に利用可能</p>
                    </div>
                </div>

                <!-- アクションボタン -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <button onclick="startLearning()" class="glass-card card-3d rounded-2xl p-8 text-left hover:scale-105 transition-all">
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

                <!-- カテゴリー選択（初期非表示） -->
                <div id="category-select" class="hidden">
                    <h2 class="text-3xl font-bold text-white mb-6 text-center">カテゴリーを選択</h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <button onclick="selectCategory('rights')" class="glass-card rounded-xl p-6 hover:scale-105 transition-all">
                            <i class="fas fa-gavel text-3xl text-purple-600 mb-3"></i>
                            <h3 class="text-lg font-bold text-gray-800">権利関係</h3>
                        </button>
                        <button onclick="selectCategory('laws')" class="glass-card rounded-xl p-6 hover:scale-105 transition-all">
                            <i class="fas fa-book text-3xl text-blue-600 mb-3"></i>
                            <h3 class="text-lg font-bold text-gray-800">法令上の制限</h3>
                        </button>
                        <button onclick="selectCategory('tax')" class="glass-card rounded-xl p-6 hover:scale-105 transition-all">
                            <i class="fas fa-calculator text-3xl text-green-600 mb-3"></i>
                            <h3 class="text-lg font-bold text-gray-800">税・その他</h3>
                        </button>
                        <button onclick="selectCategory('business')" class="glass-card rounded-xl p-6 hover:scale-105 transition-all">
                            <i class="fas fa-building text-3xl text-orange-600 mb-3"></i>
                            <h3 class="text-lg font-bold text-gray-800">宅建業法</h3>
                        </button>
                    </div>
                    <button onclick="backToDashboard()" class="metallic-button mt-6">
                        <i class="fas fa-arrow-left mr-2"></i>戻る
                    </button>
                </div>

                <!-- 問題表示エリア（初期非表示） -->
                <div id="question-area" class="hidden">
                    <div class="glass-card rounded-2xl p-8">
                        <div class="flex justify-between items-center mb-6">
                            <span class="text-lg font-semibold text-blue-600">問題 1 / 10</span>
                            <button onclick="backToDashboard()" class="text-gray-500 hover:text-gray-700">
                                <i class="fas fa-times text-2xl"></i>
                            </button>
                        </div>
                        
                        <h3 id="question-text" class="text-xl font-bold text-gray-800 mb-6">
                            問題を読み込み中...
                        </h3>
                        
                        <div id="answer-options" class="space-y-3">
                            <!-- 選択肢がここに表示される -->
                        </div>
                        
                        <button onclick="nextQuestion()" class="metallic-button mt-8 w-full" disabled>
                            次の問題へ
                        </button>
                    </div>
                </div>
            </div>

            <!-- フッターナビゲーション -->
            <nav class="fixed bottom-0 left-0 right-0 glass-card rounded-t-2xl">
                <div class="flex justify-around py-4">
                    <button onclick="navigateTo('home')" class="flex flex-col items-center text-gray-700 hover:text-blue-600 transition-colors">
                        <i class="fas fa-home text-xl mb-1"></i>
                        <span class="text-xs">ホーム</span>
                    </button>
                    <button onclick="navigateTo('study')" class="flex flex-col items-center text-gray-700 hover:text-blue-600 transition-colors">
                        <i class="fas fa-book text-xl mb-1"></i>
                        <span class="text-xs">学習</span>
                    </button>
                    <button onclick="navigateTo('stats')" class="flex flex-col items-center text-gray-700 hover:text-blue-600 transition-colors">
                        <i class="fas fa-chart-bar text-xl mb-1"></i>
                        <span class="text-xs">統計</span>
                    </button>
                    <button onclick="navigateTo('profile')" class="flex flex-col items-center text-gray-700 hover:text-blue-600 transition-colors">
                        <i class="fas fa-user text-xl mb-1"></i>
                        <span class="text-xs">プロフィール</span>
                    </button>
                </div>
            </nav>
        </div>
    </div>

    <!-- JavaScript -->
    <script>
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

        // ページ読み込み時の初期化
        document.addEventListener('DOMContentLoaded', () => {
            new ParticleBackground();
            
            // Service Worker登録
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('/sw.js')
                    .then(reg => console.log('Service Worker registered'))
                    .catch(err => console.error('Service Worker registration failed:', err));
            }
        });

        // アプリケーション機能
        function startLearning() {
            document.getElementById('main-content').querySelector('.grid').style.display = 'none';
            document.getElementById('category-select').classList.remove('hidden');
        }

        function startMockExam() {
            alert('模擬試験機能は準備中です');
        }

        function selectCategory(category) {
            document.getElementById('category-select').classList.add('hidden');
            document.getElementById('question-area').classList.remove('hidden');
            loadQuestion(category);
        }

        function loadQuestion(category) {
            // サンプル問題を表示
            document.getElementById('question-text').textContent = '建物の区分所有等に関する法律に関する次の記述のうち、正しいものはどれか。';
            
            const options = [
                'A. 規約は、管理者が保管しなければならない。',
                'B. 規約は、区分所有者全員の合意により廃止できる。',
                'C. 規約の変更は、区分所有者の過半数の合意で可能。',
                'D. 規約は書面によらなければならない。'
            ];
            
            const optionsHtml = options.map((opt, index) => \`
                <button onclick="selectAnswer(\${index})" class="w-full text-left p-4 glass-card rounded-lg hover:bg-blue-50 transition-colors">
                    \${opt}
                </button>
            \`).join('');
            
            document.getElementById('answer-options').innerHTML = optionsHtml;
        }

        function selectAnswer(index) {
            const buttons = document.querySelectorAll('#answer-options button');
            buttons.forEach(btn => btn.classList.remove('bg-blue-100'));
            buttons[index].classList.add('bg-blue-100');
            document.querySelector('#question-area button:last-child').disabled = false;
        }

        function nextQuestion() {
            // 次の問題を読み込む処理
            loadQuestion('next');
        }

        function backToDashboard() {
            document.getElementById('category-select').classList.add('hidden');
            document.getElementById('question-area').classList.add('hidden');
            document.getElementById('main-content').querySelector('.grid').style.display = 'grid';
        }

        function navigateTo(page) {
            console.log('Navigate to:', page);
            // ナビゲーション処理
        }
    </script>
</body>
</html>
  `)
})

// API Routes
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
  const { env } = c
  const category = c.req.query('category')
  
  // サンプル問題データ
  const questions = [
    {
      id: 1,
      question: '建物の区分所有等に関する法律に関する次の記述のうち、正しいものはどれか。',
      optionA: '規約は、管理者が保管しなければならない。',
      optionB: '規約は、区分所有者全員の合意により廃止できる。',
      optionC: '規約の変更は、区分所有者の過半数の合意で可能。',
      optionD: '規約は書面によらなければならない。',
      correct_answer: 'A',
      explanation: '規約は管理者が保管する義務があります。'
    }
  ]
  
  return c.json(questions)
})

app.post('/api/results', async (c) => {
  return c.json({ success: true })
})

// Static files - base64エンコードされたアイコンを直接返す
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
        "src": "data:image/png;base64,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",
        "sizes": "512x512",
        "type": "image/png",
        "purpose": "any maskable"
      }
    ]
  })
})

app.get('/sw.js', (c) => {
  return c.text(`
// Service Worker for 宅建BOOST
const CACHE_NAME = 'takken-boost-v5.1.0';
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
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
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

// Favicon and icon routes
app.get('/favicon.ico', (c) => {
  return c.body('', 200, {
    'Content-Type': 'image/x-icon'
  })
})

app.get('/icons/:filename', (c) => {
  // Return empty image for now
  return c.body('', 200, {
    'Content-Type': 'image/png'
  })
})

app.get('/favicon-16x16.png', (c) => {
  return c.body('', 200, {
    'Content-Type': 'image/png'
  })
})

app.get('/favicon-32x32.png', (c) => {
  return c.body('', 200, {
    'Content-Type': 'image/png'
  })
})

export default app
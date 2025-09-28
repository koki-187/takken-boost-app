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

// Enable CORS
app.use('/api/*', cors())

// Mount API routes
app.route('/api/study', studyRoutes)
app.route('/api/ai', aiRoutes)

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }))
app.use('/manifest.json', serveStatic({ root: './public' }))
app.use('/sw.js', serveStatic({ root: './public' }))
app.use('/icons/*', serveStatic({ root: './public' }))

// メインページ - 美しいグラデーションデザイン
app.get('/', (c) => {
  return c.html(`
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no, viewport-fit=cover">
    <title>宅建BOOST - AI搭載宅建試験学習アプリ</title>
    
    <!-- PWA Meta Tags -->
    <meta name="theme-color" content="#764ba2">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="宅建BOOST">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="application-name" content="宅建BOOST">
    <meta name="msapplication-TileColor" content="#764ba2">
    <meta name="msapplication-navbutton-color" content="#764ba2">
    <meta name="msapplication-starturl" content="/">
    
    <!-- PWA Links -->
    <link rel="manifest" href="/manifest.json">
    <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32x32.png">
    <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192x192.png">
    <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png">
    <link rel="mask-icon" href="/icons/safari-pinned-tab.svg" color="#764ba2">
    
    <!-- Styles -->
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700;900&display=swap');
        
        * {
            font-family: 'Noto Sans JP', sans-serif;
        }
        
        /* グラデーション背景アニメーション */
        body {
            background: linear-gradient(-45deg, #667eea, #764ba2, #f093fb, #f5576c);
            background-size: 400% 400%;
            animation: gradientShift 15s ease infinite;
            min-height: 100vh;
            position: relative;
            overflow-x: hidden;
        }
        
        @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        
        /* グラスモーフィズム効果 */
        .glass-card {
            background: rgba(255, 255, 255, 0.15);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.18);
            box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
            transition: all 0.3s ease;
        }
        
        .glass-card:hover {
            background: rgba(255, 255, 255, 0.2);
            transform: translateY(-5px) scale(1.02);
            box-shadow: 0 15px 35px 0 rgba(31, 38, 135, 0.5);
        }
        
        /* パルスアニメーション */
        @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.05); opacity: 0.9; }
        }
        
        .pulse-animation {
            animation: pulse 2s ease-in-out infinite;
        }
        
        /* 3Dカード効果 */
        .card-3d {
            transform-style: preserve-3d;
            transition: transform 0.6s;
        }
        
        .card-3d:hover {
            transform: rotateY(5deg) rotateX(5deg);
        }
        
        /* ネオンテキスト効果 */
        .neon-text {
            text-shadow: 
                0 0 10px rgba(255, 255, 255, 0.8),
                0 0 20px rgba(255, 255, 255, 0.8),
                0 0 30px rgba(118, 75, 162, 0.8),
                0 0 40px rgba(118, 75, 162, 0.8);
        }
        
        /* パーティクル背景 */
        #particles-bg {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
        }
        
        /* フローティングアニメーション */
        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
        }
        
        .floating {
            animation: float 4s ease-in-out infinite;
        }
        
        /* スクロールバーカスタマイズ */
        ::-webkit-scrollbar {
            width: 10px;
            height: 10px;
        }
        
        ::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb {
            background: linear-gradient(135deg, #667eea, #764ba2);
            border-radius: 10px;
        }
        
        /* モバイル用調整 */
        @media (max-width: 768px) {
            .glass-card {
                backdrop-filter: blur(10px);
                -webkit-backdrop-filter: blur(10px);
            }
        }
        
        /* PWAインストールボタン */
        .install-button {
            display: none;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 25px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .install-button:hover {
            transform: scale(1.05);
            box-shadow: 0 5px 20px rgba(118, 75, 162, 0.4);
        }
    </style>
</head>
<body>
    <!-- パーティクル背景 -->
    <canvas id="particles-bg"></canvas>
    
    <!-- 3Dロゴコンテナ -->
    <div id="logo-3d-container" class="fixed top-4 right-4 w-24 h-24 md:w-32 md:h-32 z-30"></div>
    
    <!-- インストールボタン -->
    <button id="install-btn" class="install-button fixed top-4 left-4 z-50">
        <i class="fas fa-download mr-2"></i>アプリをインストール
    </button>
    
    <!-- ナビゲーションバー -->
    <nav class="glass-card fixed top-0 left-0 right-0 z-40 p-4 md:relative md:mb-8">
        <div class="container mx-auto flex justify-between items-center">
            <div class="flex items-center space-x-2">
                <div class="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center">
                    <i class="fas fa-home text-white"></i>
                </div>
                <span class="text-white font-bold text-lg hidden md:inline">宅建BOOST</span>
            </div>
            
            <div class="flex space-x-4">
                <button class="text-white hover:text-purple-300 transition">
                    <i class="fas fa-user-circle text-xl"></i>
                </button>
                <button class="text-white hover:text-purple-300 transition">
                    <i class="fas fa-cog text-xl"></i>
                </button>
                <button id="theme-toggle" class="text-white hover:text-purple-300 transition">
                    <i class="fas fa-moon text-xl"></i>
                </button>
            </div>
        </div>
    </nav>
    
    <!-- メインコンテンツ -->
    <div class="container mx-auto px-4 py-20 md:py-8 relative z-10">
        <!-- ヒーローセクション -->
        <header class="text-center mb-12 floating">
            <h1 class="text-5xl md:text-7xl font-black text-white mb-4 neon-text">
                宅建BOOST
            </h1>
            <p class="text-xl md:text-2xl text-white/90 mb-8">
                AI搭載次世代学習プラットフォーム
            </p>
            
            <!-- ステータスカード -->
            <div class="grid grid-cols-3 gap-4 max-w-md mx-auto mb-8">
                <div class="glass-card rounded-xl p-4">
                    <div class="text-3xl font-bold text-white">402</div>
                    <div class="text-xs text-white/70">問題数</div>
                </div>
                <div class="glass-card rounded-xl p-4">
                    <div class="text-3xl font-bold text-white">98%</div>
                    <div class="text-xs text-white/70">合格率</div>
                </div>
                <div class="glass-card rounded-xl p-4">
                    <div class="text-3xl font-bold text-white">AI</div>
                    <div class="text-xs text-white/70">分析搭載</div>
                </div>
            </div>
        </header>
        
        <!-- メイン機能カード -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            <!-- カテゴリー学習 -->
            <div class="glass-card rounded-2xl p-6 card-3d group cursor-pointer" onclick="startCategoryStudy()">
                <div class="flex items-center mb-4">
                    <div class="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition">
                        <i class="fas fa-book-open text-white text-xl"></i>
                    </div>
                    <div>
                        <h3 class="text-xl font-bold text-white">カテゴリー学習</h3>
                        <p class="text-xs text-white/70">分野別トレーニング</p>
                    </div>
                </div>
                <p class="text-white/80 text-sm">権利関係、宅建業法、法令制限、税その他を個別に学習</p>
                <div class="mt-4 flex justify-between items-center">
                    <span class="text-xs text-white/60">4カテゴリー</span>
                    <i class="fas fa-arrow-right text-white/60 group-hover:translate-x-2 transition"></i>
                </div>
            </div>
            
            <!-- 模擬試験 -->
            <div class="glass-card rounded-2xl p-6 card-3d group cursor-pointer" onclick="startMockExam()">
                <div class="flex items-center mb-4">
                    <div class="w-14 h-14 bg-gradient-to-br from-green-400 to-teal-600 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition">
                        <i class="fas fa-clipboard-check text-white text-xl"></i>
                    </div>
                    <div>
                        <h3 class="text-xl font-bold text-white">模擬試験</h3>
                        <p class="text-xs text-white/70">本番形式テスト</p>
                    </div>
                </div>
                <p class="text-white/80 text-sm">50問・2時間の本番形式で実力をチェック</p>
                <div class="mt-4 flex justify-between items-center">
                    <span class="text-xs text-white/60">制限時間あり</span>
                    <i class="fas fa-arrow-right text-white/60 group-hover:translate-x-2 transition"></i>
                </div>
            </div>
            
            <!-- AI分析 -->
            <div class="glass-card rounded-2xl p-6 card-3d group cursor-pointer" onclick="showAIAnalysis()">
                <div class="flex items-center mb-4">
                    <div class="w-14 h-14 bg-gradient-to-br from-purple-400 to-pink-600 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition pulse-animation">
                        <i class="fas fa-brain text-white text-xl"></i>
                    </div>
                    <div>
                        <h3 class="text-xl font-bold text-white">AI分析</h3>
                        <p class="text-xs text-white/70">弱点克服サポート</p>
                    </div>
                </div>
                <p class="text-white/80 text-sm">学習データを分析して最適な学習プランを提案</p>
                <div class="mt-4 flex justify-between items-center">
                    <span class="text-xs text-white/60">リアルタイム分析</span>
                    <i class="fas fa-arrow-right text-white/60 group-hover:translate-x-2 transition"></i>
                </div>
            </div>
            
            <!-- 学習統計 -->
            <div class="glass-card rounded-2xl p-6 card-3d group cursor-pointer" onclick="showStatistics()">
                <div class="flex items-center mb-4">
                    <div class="w-14 h-14 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition">
                        <i class="fas fa-chart-line text-white text-xl"></i>
                    </div>
                    <div>
                        <h3 class="text-xl font-bold text-white">学習統計</h3>
                        <p class="text-xs text-white/70">進捗レポート</p>
                    </div>
                </div>
                <p class="text-white/80 text-sm">詳細な統計グラフで学習進捗を可視化</p>
                <div class="mt-4 flex justify-between items-center">
                    <span class="text-xs text-white/60">グラフ表示</span>
                    <i class="fas fa-arrow-right text-white/60 group-hover:translate-x-2 transition"></i>
                </div>
            </div>
            
            <!-- 苦手克服 -->
            <div class="glass-card rounded-2xl p-6 card-3d group cursor-pointer" onclick="startWeakPointStudy()">
                <div class="flex items-center mb-4">
                    <div class="w-14 h-14 bg-gradient-to-br from-red-400 to-red-600 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition">
                        <i class="fas fa-exclamation-triangle text-white text-xl"></i>
                    </div>
                    <div>
                        <h3 class="text-xl font-bold text-white">苦手克服</h3>
                        <p class="text-xs text-white/70">重点トレーニング</p>
                    </div>
                </div>
                <p class="text-white/80 text-sm">間違えた問題を集中的に復習</p>
                <div class="mt-4 flex justify-between items-center">
                    <span class="text-xs text-white/60">自動抽出</span>
                    <i class="fas fa-arrow-right text-white/60 group-hover:translate-x-2 transition"></i>
                </div>
            </div>
            
            <!-- 学習カレンダー -->
            <div class="glass-card rounded-2xl p-6 card-3d group cursor-pointer" onclick="showCalendar()">
                <div class="flex items-center mb-4">
                    <div class="w-14 h-14 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition">
                        <i class="fas fa-calendar-alt text-white text-xl"></i>
                    </div>
                    <div>
                        <h3 class="text-xl font-bold text-white">学習計画</h3>
                        <p class="text-xs text-white/70">スケジュール管理</p>
                    </div>
                </div>
                <p class="text-white/80 text-sm">試験日までの学習スケジュールを最適化</p>
                <div class="mt-4 flex justify-between items-center">
                    <span class="text-xs text-white/60">目標設定</span>
                    <i class="fas fa-arrow-right text-white/60 group-hover:translate-x-2 transition"></i>
                </div>
            </div>
        </div>
        
        <!-- クイックアクションバー -->
        <div class="fixed bottom-0 left-0 right-0 glass-card p-4 md:hidden z-40">
            <div class="flex justify-around">
                <button class="text-white hover:text-purple-300 transition">
                    <i class="fas fa-home text-xl"></i>
                </button>
                <button class="text-white hover:text-purple-300 transition">
                    <i class="fas fa-book text-xl"></i>
                </button>
                <button class="text-white hover:text-purple-300 transition">
                    <i class="fas fa-chart-bar text-xl"></i>
                </button>
                <button class="text-white hover:text-purple-300 transition">
                    <i class="fas fa-user text-xl"></i>
                </button>
            </div>
        </div>
    </div>
    
    <!-- フローティングヘルプボタン -->
    <button id="help-button" class="fixed bottom-20 md:bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-110 pulse-animation">
        <i class="fas fa-question text-xl"></i>
    </button>
    
    <!-- フローティングチュートリアルボタン -->
    <button id="tutorial-button" class="fixed bottom-20 md:bottom-6 left-6 z-50 w-14 h-14 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-110">
        <i class="fas fa-graduation-cap text-xl"></i>
    </button>
    
    <!-- Scripts -->
    <script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/animejs@3.2.1/lib/anime.min.js"></script>
    <script src="/static/3d-icon.js"></script>
    <script src="/static/animations.js"></script>
    <script src="/static/particles.js"></script>
    <script src="/static/app-enhanced.js"></script>
    
    <!-- PWA Service Worker Registration -->
    <script>
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then(reg => console.log('Service Worker registered'))
                    .catch(err => console.error('Service Worker registration failed:', err));
            });
        }
        
        // PWAインストールプロンプト
        let deferredPrompt;
        const installBtn = document.getElementById('install-btn');
        
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            installBtn.style.display = 'block';
        });
        
        installBtn.addEventListener('click', async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                console.log('User response:', outcome);
                deferredPrompt = null;
                installBtn.style.display = 'none';
            }
        });
        
        // アプリ起動関数
        function startCategoryStudy() {
            window.location.href = '/study/category';
        }
        
        function startMockExam() {
            window.location.href = '/exam/mock';
        }
        
        function showAIAnalysis() {
            window.location.href = '/ai/analysis';
        }
        
        function showStatistics() {
            window.location.href = '/statistics';
        }
        
        function startWeakPointStudy() {
            window.location.href = '/study/weak';
        }
        
        function showCalendar() {
            window.location.href = '/calendar';
        }
    </script>
</body>
</html>
  `)
})

export default app
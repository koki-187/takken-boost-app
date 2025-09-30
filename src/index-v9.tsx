import { Hono } from 'hono'
import { cors } from 'hono/cors'
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

// Mount API routes
app.route('/api/study', studyRoutes)
app.route('/api/auth', authRoutes)
app.route('/api/mock-exam', mockExamRoutes)
app.route('/api/notifications', emailRoutes)

// Service Worker for PWA
app.get('/service-worker.js', (c) => {
  return c.text(`
const CACHE_NAME = 'takken-boost-v9-cache';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/static/styles-v9.css',
  '/static/app-v9.js',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.1/anime.min.js',
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
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
        cacheNames.filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      );
    })
  );
});
  `, {
    headers: {
      'Content-Type': 'application/javascript',
    },
  })
})

// Main Application HTML - v9.0.0 新デザイン
app.get('/', (c) => {
  return c.html(`
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no, viewport-fit=cover">
    <title>宅建BOOST v9.0 - Ultimate Edition</title>
    
    <!-- PWA Meta Tags -->
    <meta name="theme-color" content="#667eea">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="宅建BOOST">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="application-name" content="宅建BOOST">
    <meta name="description" content="宅建試験合格を目指す方のための最強学習アプリ">
    
    <!-- PWA Links -->
    <link rel="manifest" href="/manifest.json">
    <link rel="icon" type="image/x-icon" href="/favicon.ico">
    <link rel="apple-touch-icon" href="/icons/icon-180x180.png">
    
    <!-- External Libraries -->
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.1/anime.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700;900&display=swap');
        
        :root {
            --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            --secondary-gradient: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            --success-gradient: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            --glass-bg: rgba(255, 255, 255, 0.1);
            --glass-border: rgba(255, 255, 255, 0.2);
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Noto Sans JP', sans-serif;
            background: var(--primary-gradient);
            min-height: 100vh;
            overflow-x: hidden;
            position: relative;
        }

        /* 3D Logo Container */
        #logo-3d {
            position: fixed;
            top: 20px;
            left: 20px;
            width: 80px;
            height: 80px;
            z-index: 100;
            cursor: pointer;
        }

        /* Glassmorphism Card */
        .glass-card {
            background: var(--glass-bg);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid var(--glass-border);
            border-radius: 20px;
            padding: 30px;
            box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
            transition: all 0.3s ease;
        }

        .glass-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 12px 48px 0 rgba(31, 38, 135, 0.5);
        }

        /* 3D Button */
        .btn-3d {
            background: var(--primary-gradient);
            color: white;
            border: none;
            padding: 15px 40px;
            border-radius: 50px;
            font-weight: 600;
            font-size: 1rem;
            cursor: pointer;
            position: relative;
            overflow: hidden;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px 0 rgba(31, 38, 135, 0.2);
        }

        .btn-3d::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
            transition: left 0.5s;
        }

        .btn-3d:hover::before {
            left: 100%;
        }

        .btn-3d:hover {
            transform: translateY(-3px) scale(1.05);
            box-shadow: 0 8px 25px 0 rgba(31, 38, 135, 0.4);
        }

        /* Floating Animation */
        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
        }

        .floating {
            animation: float 3s ease-in-out infinite;
        }

        /* Particle Background */
        #particles-canvas {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
            opacity: 0.5;
        }

        /* Loading Screen */
        .loading-screen {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: var(--primary-gradient);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            transition: opacity 0.5s ease;
        }

        .loader-3d {
            width: 100px;
            height: 100px;
            perspective: 800px;
        }

        .loader-cube {
            width: 100%;
            height: 100%;
            position: relative;
            transform-style: preserve-3d;
            animation: rotate-3d 2s infinite linear;
        }

        @keyframes rotate-3d {
            0% { transform: rotateX(0deg) rotateY(0deg); }
            100% { transform: rotateX(360deg) rotateY(360deg); }
        }

        .loader-face {
            position: absolute;
            width: 100px;
            height: 100px;
            background: var(--secondary-gradient);
            opacity: 0.8;
            border: 2px solid rgba(255,255,255,0.3);
        }

        .front { transform: translateZ(50px); }
        .back { transform: rotateY(180deg) translateZ(50px); }
        .right { transform: rotateY(90deg) translateZ(50px); }
        .left { transform: rotateY(-90deg) translateZ(50px); }
        .top { transform: rotateX(90deg) translateZ(50px); }
        .bottom { transform: rotateX(-90deg) translateZ(50px); }

        /* Responsive Grid */
        .feature-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 25px;
            margin: 30px 0;
        }

        /* iOS Safe Area */
        @supports (padding-top: env(safe-area-inset-top)) {
            body {
                padding-top: env(safe-area-inset-top);
                padding-bottom: env(safe-area-inset-bottom);
            }
        }

        /* Dark Mode Support */
        @media (prefers-color-scheme: dark) {
            :root {
                --glass-bg: rgba(0, 0, 0, 0.3);
                --glass-border: rgba(255, 255, 255, 0.1);
            }
        }
    </style>
</head>
<body>
    <!-- Loading Screen -->
    <div id="loadingScreen" class="loading-screen">
        <div class="loader-3d">
            <div class="loader-cube">
                <div class="loader-face front"></div>
                <div class="loader-face back"></div>
                <div class="loader-face right"></div>
                <div class="loader-face left"></div>
                <div class="loader-face top"></div>
                <div class="loader-face bottom"></div>
            </div>
        </div>
    </div>

    <!-- 3D Logo Canvas -->
    <canvas id="logo-3d"></canvas>

    <!-- Particle Background -->
    <canvas id="particles-canvas"></canvas>

    <!-- Main Container -->
    <div class="min-h-screen p-4 md:p-8">
        <!-- Header -->
        <header class="glass-card mb-8 flex items-center justify-between">
            <div class="flex items-center gap-4">
                <h1 class="text-2xl md:text-3xl font-bold text-white">
                    宅建BOOST <span class="text-sm">v9.0</span>
                </h1>
                <span class="badge bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-bold">
                    Ultimate Edition
                </span>
            </div>
            <div class="flex gap-3">
                <button id="themeToggle" class="btn-icon">
                    <i class="fas fa-moon text-white"></i>
                </button>
                <button id="notificationToggle" class="btn-icon">
                    <i class="fas fa-bell text-white"></i>
                </button>
                <button id="profileBtn" class="btn-icon">
                    <i class="fas fa-user-circle text-white"></i>
                </button>
            </div>
        </header>

        <!-- Welcome Section -->
        <div id="welcomeSection" class="glass-card mb-8 text-center">
            <h2 class="text-4xl font-bold text-white mb-4 floating">
                宅建試験合格への最速ルート
            </h2>
            <p class="text-white/80 text-lg mb-6">
                402問の完全データベースとAI分析で効率的な学習を実現
            </p>
            <div class="flex gap-4 justify-center flex-wrap">
                <button id="startLearningBtn" class="btn-3d">
                    <i class="fas fa-rocket mr-2"></i>
                    学習を開始
                </button>
                <button id="tutorialBtn" class="btn-3d">
                    <i class="fas fa-play-circle mr-2"></i>
                    チュートリアル
                </button>
            </div>
        </div>

        <!-- Stats Overview -->
        <div class="feature-grid mb-8">
            <div class="glass-card text-center">
                <i class="fas fa-book text-5xl text-white mb-3"></i>
                <h3 class="text-3xl font-bold text-white">402</h3>
                <p class="text-white/80">問題数</p>
            </div>
            <div class="glass-card text-center">
                <i class="fas fa-chart-line text-5xl text-white mb-3"></i>
                <h3 class="text-3xl font-bold text-white">0%</h3>
                <p class="text-white/80">進捗率</p>
            </div>
            <div class="glass-card text-center">
                <i class="fas fa-trophy text-5xl text-white mb-3"></i>
                <h3 class="text-3xl font-bold text-white">-</h3>
                <p class="text-white/80">ランク</p>
            </div>
            <div class="glass-card text-center">
                <i class="fas fa-fire text-5xl text-white mb-3"></i>
                <h3 class="text-3xl font-bold text-white">0</h3>
                <p class="text-white/80">連続日数</p>
            </div>
        </div>

        <!-- Feature Cards -->
        <div class="feature-grid">
            <!-- Category Learning -->
            <div class="glass-card feature-card" data-feature="category-learning">
                <div class="flex items-center mb-4">
                    <div class="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mr-4">
                        <i class="fas fa-folder-open text-white"></i>
                    </div>
                    <h3 class="text-xl font-bold text-white">カテゴリ学習</h3>
                </div>
                <p class="text-white/70 mb-4">
                    4つのカテゴリから選んで集中学習
                </p>
                <button class="btn-3d w-full">
                    <i class="fas fa-arrow-right mr-2"></i>
                    開始する
                </button>
            </div>

            <!-- Mock Exam -->
            <div class="glass-card feature-card" data-feature="mock-exam">
                <div class="flex items-center mb-4">
                    <div class="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-teal-600 flex items-center justify-center mr-4">
                        <i class="fas fa-clipboard-list text-white"></i>
                    </div>
                    <h3 class="text-xl font-bold text-white">模擬試験</h3>
                </div>
                <p class="text-white/70 mb-4">
                    本番形式で実力をチェック
                </p>
                <button class="btn-3d w-full">
                    <i class="fas fa-arrow-right mr-2"></i>
                    受験する
                </button>
            </div>

            <!-- AI Analysis -->
            <div class="glass-card feature-card" data-feature="ai-analysis">
                <div class="flex items-center mb-4">
                    <div class="w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-red-600 flex items-center justify-center mr-4">
                        <i class="fas fa-brain text-white"></i>
                    </div>
                    <h3 class="text-xl font-bold text-white">AI分析</h3>
                </div>
                <p class="text-white/70 mb-4">
                    弱点を分析して効率的に学習
                </p>
                <button class="btn-3d w-full">
                    <i class="fas fa-arrow-right mr-2"></i>
                    分析する
                </button>
            </div>

            <!-- Statistics -->
            <div class="glass-card feature-card" data-feature="statistics">
                <div class="flex items-center mb-4">
                    <div class="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-500 to-orange-600 flex items-center justify-center mr-4">
                        <i class="fas fa-chart-bar text-white"></i>
                    </div>
                    <h3 class="text-xl font-bold text-white">学習統計</h3>
                </div>
                <p class="text-white/70 mb-4">
                    進捗と成績を詳細に分析
                </p>
                <button class="btn-3d w-full">
                    <i class="fas fa-arrow-right mr-2"></i>
                    確認する
                </button>
            </div>

            <!-- Review -->
            <div class="glass-card feature-card" data-feature="review">
                <div class="flex items-center mb-4">
                    <div class="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-blue-600 flex items-center justify-center mr-4">
                        <i class="fas fa-redo text-white"></i>
                    </div>
                    <h3 class="text-xl font-bold text-white">復習</h3>
                </div>
                <p class="text-white/70 mb-4">
                    間違えた問題を重点的に復習
                </p>
                <button class="btn-3d w-full">
                    <i class="fas fa-arrow-right mr-2"></i>
                    復習する
                </button>
            </div>

            <!-- Settings -->
            <div class="glass-card feature-card" data-feature="settings">
                <div class="flex items-center mb-4">
                    <div class="w-12 h-12 rounded-full bg-gradient-to-r from-gray-500 to-slate-600 flex items-center justify-center mr-4">
                        <i class="fas fa-cog text-white"></i>
                    </div>
                    <h3 class="text-xl font-bold text-white">設定</h3>
                </div>
                <p class="text-white/70 mb-4">
                    学習環境をカスタマイズ
                </p>
                <button class="btn-3d w-full">
                    <i class="fas fa-arrow-right mr-2"></i>
                    設定する
                </button>
            </div>
        </div>

        <!-- Install Prompt -->
        <div id="installPrompt" class="glass-card mt-8 hidden">
            <div class="flex items-center justify-between">
                <div class="flex items-center">
                    <i class="fas fa-download text-3xl text-white mr-4"></i>
                    <div>
                        <h3 class="text-lg font-bold text-white">アプリをインストール</h3>
                        <p class="text-white/70 text-sm">オフラインでも学習可能になります</p>
                    </div>
                </div>
                <button id="installBtn" class="btn-3d">
                    インストール
                </button>
            </div>
        </div>
    </div>

    <!-- Dynamic Content Container -->
    <div id="dynamicContent"></div>

    <!-- Tutorial Overlay -->
    <div id="tutorialOverlay" class="hidden fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
        <div class="glass-card max-w-2xl w-full">
            <h2 class="text-2xl font-bold text-white mb-4">
                <i class="fas fa-graduation-cap mr-2"></i>
                チュートリアル
            </h2>
            <div id="tutorialContent">
                <!-- Tutorial content will be dynamically inserted -->
            </div>
            <div class="flex justify-between mt-6">
                <button id="tutorialPrev" class="btn-3d">
                    <i class="fas fa-chevron-left mr-2"></i>
                    前へ
                </button>
                <div class="flex gap-2" id="tutorialDots">
                    <!-- Dots will be dynamically inserted -->
                </div>
                <button id="tutorialNext" class="btn-3d">
                    次へ
                    <i class="fas fa-chevron-right ml-2"></i>
                </button>
            </div>
        </div>
    </div>

    <!-- Custom Scripts -->
    <script src="/static/app-v9.js"></script>
    <script>
        // Initialize app when DOM is ready
        document.addEventListener('DOMContentLoaded', () => {
            // Hide loading screen
            setTimeout(() => {
                const loadingScreen = document.getElementById('loadingScreen');
                loadingScreen.style.opacity = '0';
                setTimeout(() => loadingScreen.style.display = 'none', 500);
            }, 1500);

            // Initialize 3D logo
            if (window.THREE) {
                init3DLogo();
            }

            // Initialize particles
            initParticles();

            // Initialize animations
            initAnimations();

            // Check PWA install
            checkPWAInstall();

            // Register Service Worker
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('/service-worker.js')
                    .then(reg => console.log('Service Worker registered:', reg))
                    .catch(err => console.error('Service Worker registration failed:', err));
            }
        });

        // 3D Logo Initialization
        function init3DLogo() {
            const canvas = document.getElementById('logo-3d');
            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
            const renderer = new THREE.WebGLRenderer({ 
                canvas: canvas, 
                alpha: true,
                antialias: true 
            });
            
            renderer.setSize(80, 80);
            renderer.setPixelRatio(window.devicePixelRatio);

            // Create 3D text or logo geometry
            const geometry = new THREE.BoxGeometry(1, 1, 1);
            const material = new THREE.MeshPhongMaterial({
                color: 0xffffff,
                emissive: 0x667eea,
                emissiveIntensity: 0.3,
                shininess: 100
            });
            const cube = new THREE.Mesh(geometry, material);
            scene.add(cube);

            // Add lights
            const light = new THREE.DirectionalLight(0xffffff, 1);
            light.position.set(1, 1, 1);
            scene.add(light);
            scene.add(new THREE.AmbientLight(0x404040));

            camera.position.z = 2.5;

            // Animation loop
            function animate() {
                requestAnimationFrame(animate);
                cube.rotation.x += 0.01;
                cube.rotation.y += 0.01;
                renderer.render(scene, camera);
            }
            animate();

            // Mouse interaction
            canvas.addEventListener('mouseenter', () => {
                anime({
                    targets: cube.rotation,
                    x: cube.rotation.x + Math.PI * 2,
                    y: cube.rotation.y + Math.PI * 2,
                    duration: 1000,
                    easing: 'easeOutElastic'
                });
            });
        }

        // Particle Background
        function initParticles() {
            const canvas = document.getElementById('particles-canvas');
            const ctx = canvas.getContext('2d');
            let particles = [];

            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            class Particle {
                constructor() {
                    this.x = Math.random() * canvas.width;
                    this.y = Math.random() * canvas.height;
                    this.size = Math.random() * 3 + 1;
                    this.speedX = Math.random() * 3 - 1.5;
                    this.speedY = Math.random() * 3 - 1.5;
                    this.opacity = Math.random() * 0.5 + 0.2;
                }

                update() {
                    this.x += this.speedX;
                    this.y += this.speedY;

                    if (this.x > canvas.width) this.x = 0;
                    if (this.x < 0) this.x = canvas.width;
                    if (this.y > canvas.height) this.y = 0;
                    if (this.y < 0) this.y = canvas.height;
                }

                draw() {
                    ctx.fillStyle = \`rgba(255, 255, 255, \${this.opacity})\`;
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            // Create particles
            for (let i = 0; i < 100; i++) {
                particles.push(new Particle());
            }

            // Animation loop
            function animateParticles() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                particles.forEach(particle => {
                    particle.update();
                    particle.draw();
                });
                requestAnimationFrame(animateParticles);
            }
            animateParticles();

            // Resize handler
            window.addEventListener('resize', () => {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
            });
        }

        // Initialize Anime.js animations
        function initAnimations() {
            // Feature cards entrance animation
            anime({
                targets: '.feature-card',
                translateY: [50, 0],
                opacity: [0, 1],
                duration: 1000,
                delay: anime.stagger(100),
                easing: 'easeOutQuart'
            });

            // Button hover effects
            document.querySelectorAll('.btn-3d').forEach(btn => {
                btn.addEventListener('mouseenter', () => {
                    anime({
                        targets: btn,
                        scale: 1.1,
                        duration: 300,
                        easing: 'easeOutQuart'
                    });
                });

                btn.addEventListener('mouseleave', () => {
                    anime({
                        targets: btn,
                        scale: 1,
                        duration: 300,
                        easing: 'easeOutQuart'
                    });
                });
            });
        }

        // PWA Install
        let deferredPrompt;
        
        function checkPWAInstall() {
            window.addEventListener('beforeinstallprompt', (e) => {
                e.preventDefault();
                deferredPrompt = e;
                document.getElementById('installPrompt').classList.remove('hidden');
            });

            document.getElementById('installBtn')?.addEventListener('click', async () => {
                if (deferredPrompt) {
                    deferredPrompt.prompt();
                    const { outcome } = await deferredPrompt.userChoice;
                    if (outcome === 'accepted') {
                        console.log('PWA installed');
                        document.getElementById('installPrompt').classList.add('hidden');
                    }
                    deferredPrompt = null;
                }
            });
        }
    </script>
</body>
</html>
  `)
})

// Manifest for PWA
app.get('/manifest.json', (c) => {
  return c.json({
    "name": "宅建BOOST v9.0 Ultimate Edition",
    "short_name": "宅建BOOST",
    "description": "宅建試験合格を目指す方のための最強学習アプリ",
    "start_url": "/",
    "display": "standalone",
    "background_color": "#667eea",
    "theme_color": "#667eea",
    "orientation": "portrait",
    "categories": ["education", "productivity"],
    "icons": [
      {
        "src": "/icons/icon-72x72.png",
        "sizes": "72x72",
        "type": "image/png",
        "purpose": "any maskable"
      },
      {
        "src": "/icons/icon-96x96.png",
        "sizes": "96x96",
        "type": "image/png",
        "purpose": "any maskable"
      },
      {
        "src": "/icons/icon-128x128.png",
        "sizes": "128x128",
        "type": "image/png",
        "purpose": "any maskable"
      },
      {
        "src": "/icons/icon-144x144.png",
        "sizes": "144x144",
        "type": "image/png",
        "purpose": "any maskable"
      },
      {
        "src": "/icons/icon-152x152.png",
        "sizes": "152x152",
        "type": "image/png",
        "purpose": "any maskable"
      },
      {
        "src": "/icons/icon-192x192.png",
        "sizes": "192x192",
        "type": "image/png",
        "purpose": "any maskable"
      },
      {
        "src": "/icons/icon-384x384.png",
        "sizes": "384x384",
        "type": "image/png",
        "purpose": "any maskable"
      },
      {
        "src": "/icons/icon-512x512.png",
        "sizes": "512x512",
        "type": "image/png",
        "purpose": "any maskable"
      }
    ],
    "screenshots": [
      {
        "src": "/screenshots/home.png",
        "sizes": "1080x1920",
        "type": "image/png",
        "form_factor": "narrow",
        "label": "ホーム画面"
      },
      {
        "src": "/screenshots/study.png",
        "sizes": "1080x1920",
        "type": "image/png",
        "form_factor": "narrow",
        "label": "学習画面"
      }
    ],
    "shortcuts": [
      {
        "name": "カテゴリ学習",
        "short_name": "学習",
        "description": "カテゴリ別学習を開始",
        "url": "/study",
        "icons": [{ "src": "/icons/study.png", "sizes": "96x96" }]
      },
      {
        "name": "模擬試験",
        "short_name": "試験",
        "description": "模擬試験を受験",
        "url": "/exam",
        "icons": [{ "src": "/icons/exam.png", "sizes": "96x96" }]
      }
    ]
  })
})

export default app
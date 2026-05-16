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

app.use('/api/*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

app.route('/api/study', studyRoutes)
app.route('/api/auth', authRoutes)
app.route('/api/mock-exam', mockExamRoutes)
app.route('/api/notifications', emailRoutes)

// 問題数取得API
app.get('/api/stats', async (c) => {
  try {
    if (!c.env?.DB) return c.json({ success: false, error: 'DB not bound' }, 500);
    const { DB } = c.env
    const total = await DB.prepare('SELECT COUNT(*) as cnt FROM questions').first()
    const bySubject = await DB.prepare(
      'SELECT subject, COUNT(*) as cnt FROM questions GROUP BY subject'
    ).all()
    const byYear = await DB.prepare(
      'SELECT year, COUNT(*) as cnt FROM questions WHERE year IS NOT NULL GROUP BY year ORDER BY year'
    ).all()
    return c.json({
      success: true,
      total: (total as any)?.cnt ?? 0,
      bySubject: bySubject.results,
      byYear: byYear.results,
    })
  } catch {
    return c.json({ success: true, total: 402, bySubject: [], byYear: [] })
  }
})

// 過去問年度別取得API
app.get('/api/past-exam/:year', async (c) => {
  try {
    const year = parseInt(c.req.param('year'))
    const { DB } = c.env
    const result = await DB.prepare(
      'SELECT * FROM questions WHERE year = ? ORDER BY id'
    ).bind(year).all()
    return c.json({ success: true, questions: result.results, total: result.results.length })
  } catch (e: any) {
    return c.json({ success: false, error: e.message }, 500)
  }
})

// Service Worker
app.get('/service-worker.js', (c) => {
  const sw = `
const CACHE_NAME = 'takken-boost-v11';
const STATIC_CACHE = 'takken-boost-static-v11';

const STATIC_ASSETS = [
  '/',
  '/manifest.json',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(STATIC_CACHE).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(names =>
      Promise.all(names
        .filter(n => n !== CACHE_NAME && n !== STATIC_CACHE)
        .map(n => caches.delete(n))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  if (url.pathname === '/' || url.pathname === '/index.html') {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(STATIC_CACHE).then(c => c.put(e.request, clone));
          }
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // API requests - network first
  if (url.pathname.startsWith('/api/')) {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // Static pages - cache first
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(STATIC_CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      });
    })
  );
});
`;
  return c.text(sw, 200, { 'Content-Type': 'application/javascript; charset=utf-8' })
})

// Main SPA
app.get('*', (c) => {
  return c.html(mainHTML)
})

const mainHTML = `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>宅建BOOST - 宅建試験合格アプリ</title>
<meta name="description" content="宅地建物取引士試験合格に特化したPWA学習アプリ。452問完全収録・AI弱点分析・模擬試験。">
<meta name="theme-color" content="#7c3aed">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="宅建BOOST">
<link rel="manifest" href="/manifest.json">
<link rel="apple-touch-icon" href="/icons/icon-180x180.png">
<link rel="icon" href="/favicon.ico">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;600;700;900&display=swap">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.5.0/css/all.min.css">
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/animejs@3.2.2/lib/anime.min.js"></script>
<style>
*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}
:root{
  --c1:#7c3aed;--c2:#4f46e5;--c3:#a855f7;
  --grad:linear-gradient(135deg,#7c3aed 0%,#4f46e5 100%);
  --grad2:linear-gradient(135deg,#a855f7 0%,#7c3aed 100%);
  --bg:#f5f3ff;--card:#fff;--text:#1e1b4b;--sub:#6b7280;
  --border:#e5e7eb;--success:#10b981;--danger:#ef4444;--warn:#f59e0b;
  --radius:16px;--shadow:0 4px 24px rgba(124,58,237,.12);
  --bottom-bar:env(safe-area-inset-bottom,0px);
}
body{font-family:'Noto Sans JP',sans-serif;background:var(--bg);color:var(--text);
  min-height:100vh;overflow-x:hidden;padding-bottom:calc(64px + var(--bottom-bar))}

/* ===== HEADER ===== */
#app-header{
  position:fixed;top:0;left:0;right:0;z-index:100;
  background:var(--grad);
  padding:env(safe-area-inset-top,0px) 16px 0;
  box-shadow:0 2px 16px rgba(124,58,237,.3);
}
.header-inner{
  display:flex;align-items:center;justify-content:space-between;
  height:56px;
}
.logo{color:#fff;font-size:20px;font-weight:900;letter-spacing:-0.5px;text-decoration:none}
.logo span{font-size:10px;opacity:.7;margin-left:4px;font-weight:400}
.header-actions{display:flex;gap:8px}
.hbtn{
  background:rgba(255,255,255,.15);border:none;color:#fff;
  width:36px;height:36px;border-radius:50%;cursor:pointer;
  display:flex;align-items:center;justify-content:center;
  transition:.2s;font-size:15px;
}
.hbtn:hover{background:rgba(255,255,255,.25)}

/* ===== BOTTOM NAV ===== */
#bottom-nav{
  position:fixed;bottom:0;left:0;right:0;z-index:100;
  background:#fff;border-top:1px solid var(--border);
  display:flex;
  padding-bottom:var(--bottom-bar);
  box-shadow:0 -4px 16px rgba(0,0,0,.08);
}
.nav-item{
  flex:1;display:flex;flex-direction:column;align-items:center;
  padding:8px 4px;cursor:pointer;border:none;background:none;
  color:var(--sub);font-size:10px;transition:.2s;gap:3px;
}
.nav-item i{font-size:20px}
.nav-item.active{color:var(--c1)}
.nav-item.active i{font-weight:900}

/* ===== MAIN CONTENT ===== */
#main{margin-top:56px;padding:16px;max-width:768px;margin-left:auto;margin-right:auto}
#main{margin-top:calc(56px + env(safe-area-inset-top,0px))}

/* ===== CARDS ===== */
.card{
  background:var(--card);border-radius:var(--radius);
  box-shadow:var(--shadow);padding:20px;margin-bottom:16px;
}
.card-grad{
  background:var(--grad);color:#fff;
  border-radius:var(--radius);padding:20px;margin-bottom:16px;
  box-shadow:0 8px 32px rgba(124,58,237,.3);
}
.card-sm{
  background:var(--card);border-radius:12px;
  box-shadow:0 2px 8px rgba(0,0,0,.06);padding:16px;
}

/* ===== BUTTONS ===== */
.btn{
  display:inline-flex;align-items:center;justify-content:center;gap:8px;
  padding:12px 24px;border-radius:50px;border:none;cursor:pointer;
  font-family:inherit;font-weight:600;font-size:15px;transition:.2s;
  text-decoration:none;
}
.btn-primary{background:var(--grad);color:#fff;box-shadow:0 4px 16px rgba(124,58,237,.3)}
.btn-primary:hover{transform:translateY(-1px);box-shadow:0 8px 24px rgba(124,58,237,.4)}
.btn-white{background:#fff;color:var(--c1);box-shadow:0 2px 8px rgba(0,0,0,.1)}
.btn-outline{background:transparent;color:var(--c1);border:2px solid var(--c1)}
.btn-danger{background:var(--danger);color:#fff}
.btn-success{background:var(--success);color:#fff}
.btn-block{width:100%}
.btn-lg{padding:16px 32px;font-size:17px}
.btn-sm{padding:8px 16px;font-size:13px}
.btn:disabled{opacity:.5;cursor:not-allowed;transform:none!important}

/* ===== GRID ===== */
.grid-2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
.grid-4{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}
@media(min-width:480px){.grid-4{grid-template-columns:repeat(4,1fr)}}

/* ===== STAT BOXES ===== */
.stat-box{
  background:var(--card);border-radius:12px;
  padding:16px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,.06);
}
.stat-num{font-size:28px;font-weight:900;color:var(--c1);line-height:1}
.stat-label{font-size:11px;color:var(--sub);margin-top:4px}

/* ===== FEATURE CARDS ===== */
.feature-card{
  background:var(--card);border-radius:var(--radius);
  box-shadow:var(--shadow);padding:20px;cursor:pointer;
  transition:.2s;border:2px solid transparent;
  display:flex;flex-direction:column;gap:12px;
}
.feature-card:hover{border-color:var(--c1);transform:translateY(-2px)}
.feature-icon{
  width:48px;height:48px;border-radius:12px;
  display:flex;align-items:center;justify-content:center;
  font-size:22px;color:#fff;flex-shrink:0;
}
.feature-title{font-weight:700;font-size:17px}
.feature-desc{font-size:13px;color:var(--sub);line-height:1.5}
.feature-row{display:flex;align-items:flex-start;gap:14px}

/* ===== PROGRESS BAR ===== */
.progress-bar{
  height:8px;background:var(--border);border-radius:4px;overflow:hidden;
}
.progress-fill{
  height:100%;background:var(--grad);border-radius:4px;
  transition:width .6s ease;
}

/* ===== BADGE ===== */
.badge{
  display:inline-flex;align-items:center;padding:3px 10px;
  border-radius:50px;font-size:11px;font-weight:600;
}
.badge-purple{background:#ede9fe;color:var(--c1)}
.badge-green{background:#d1fae5;color:#065f46}
.badge-red{background:#fee2e2;color:#991b1b}
.badge-yellow{background:#fef3c7;color:#92400e}
.badge-blue{background:#dbeafe;color:#1e40af}

/* ===== QUESTION DISPLAY ===== */
.question-text{
  font-size:16px;line-height:1.8;font-weight:500;
  margin-bottom:20px;padding:16px;
  background:#f8f7ff;border-radius:12px;border-left:4px solid var(--c1);
}
.option-btn{
  width:100%;text-align:left;padding:14px 16px;
  border:2px solid var(--border);border-radius:12px;
  background:#fff;cursor:pointer;font-family:inherit;
  font-size:14px;transition:.2s;display:flex;align-items:flex-start;gap:12px;
  margin-bottom:8px;
}
.option-btn:hover:not(:disabled){border-color:var(--c1);background:#f5f3ff}
.option-btn.correct{border-color:var(--success)!important;background:#d1fae5!important}
.option-btn.incorrect{border-color:var(--danger)!important;background:#fee2e2!important}
.option-btn.show-correct{border-color:var(--success)!important;background:#d1fae5!important}
.option-label{
  width:28px;height:28px;border-radius:50%;
  background:var(--grad);color:#fff;
  display:flex;align-items:center;justify-content:center;
  font-weight:700;font-size:13px;flex-shrink:0;margin-top:-2px;
}
.option-btn.correct .option-label{background:var(--success)}
.option-btn.incorrect .option-label{background:var(--danger)}
.option-btn.show-correct .option-label{background:var(--success)}
.explanation{
  margin-top:16px;padding:16px;border-radius:12px;
  background:#f0fdf4;border:1px solid #86efac;font-size:14px;line-height:1.7;
  animation:fadeIn .3s ease;
}
.explanation.wrong{background:#fff7ed;border-color:#fed7aa}
@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}

/* ===== EXAM TIMER ===== */
.exam-timer{
  display:flex;align-items:center;gap:8px;
  padding:8px 16px;background:rgba(255,255,255,.2);
  border-radius:50px;color:#fff;font-weight:700;font-size:16px;
}
.exam-timer.warning{background:rgba(239,68,68,.3);animation:pulse .5s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.7}}

/* ===== CATEGORY PILLS ===== */
.cat-pill{
  display:inline-flex;align-items:center;gap:6px;
  padding:8px 16px;border-radius:50px;border:2px solid var(--border);
  cursor:pointer;font-size:13px;font-weight:600;transition:.2s;
  background:#fff;
}
.cat-pill.active{border-color:var(--c1);background:var(--c1);color:#fff}
.cat-pills{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px}

/* ===== RESULT CARD ===== */
.result-circle{
  width:120px;height:120px;border-radius:50%;
  border:8px solid var(--c1);display:flex;flex-direction:column;
  align-items:center;justify-content:center;margin:0 auto 20px;
  background:#fff;
}
.result-circle .score{font-size:36px;font-weight:900;color:var(--c1);line-height:1}
.result-circle .label{font-size:11px;color:var(--sub)}

/* ===== SECTION TITLE ===== */
.section-title{
  font-size:18px;font-weight:700;margin-bottom:16px;
  display:flex;align-items:center;gap:8px;
}
.section-title i{color:var(--c1)}

/* ===== MODAL ===== */
.modal-overlay{
  position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:200;
  display:flex;align-items:flex-end;justify-content:center;
  padding:0;animation:overlayIn .2s ease;
}
@keyframes overlayIn{from{opacity:0}to{opacity:1}}
.modal-sheet{
  background:#fff;border-radius:24px 24px 0 0;width:100%;max-width:768px;
  max-height:85vh;overflow-y:auto;padding:24px 20px;
  animation:sheetUp .25s ease;padding-bottom:calc(24px + var(--bottom-bar));
}
@keyframes sheetUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
.modal-handle{
  width:40px;height:4px;background:var(--border);border-radius:2px;
  margin:0 auto 20px;
}

/* ===== EMPTY STATE ===== */
.empty-state{
  text-align:center;padding:48px 24px;color:var(--sub);
}
.empty-state i{font-size:48px;margin-bottom:16px;opacity:.4}
.empty-state p{font-size:15px}

/* ===== TOAST ===== */
#toast{
  position:fixed;bottom:80px;left:50%;transform:translateX(-50%) translateY(20px);
  background:#1e1b4b;color:#fff;padding:10px 20px;border-radius:50px;
  font-size:14px;font-weight:600;z-index:500;opacity:0;
  transition:.3s;pointer-events:none;white-space:nowrap;
}
#toast.show{opacity:1;transform:translateX(-50%) translateY(0)}

/* ===== INSTALL BANNER ===== */
#install-banner{
  display:none;position:fixed;bottom:72px;left:16px;right:16px;
  background:#fff;border-radius:var(--radius);box-shadow:0 8px 32px rgba(0,0,0,.15);
  padding:16px;z-index:99;align-items:center;gap:12px;
  border:2px solid var(--c1);
}
#install-banner.show{display:flex}

/* ===== LOADER ===== */
.loader{
  display:inline-block;width:20px;height:20px;border-radius:50%;
  border:3px solid rgba(124,58,237,.2);border-top-color:var(--c1);
  animation:spin .7s linear infinite;
}
@keyframes spin{to{transform:rotate(360deg)}}
.page-loader{
  display:flex;align-items:center;justify-content:center;
  padding:48px;flex-direction:column;gap:16px;color:var(--sub);
}

/* ===== BACK BUTTON ===== */
.back-btn{
  display:inline-flex;align-items:center;gap:8px;
  color:var(--sub);font-size:14px;font-weight:600;
  cursor:pointer;border:none;background:none;padding:4px 0;
  margin-bottom:16px;
}
.back-btn:hover{color:var(--c1)}

/* ===== CALENDAR STREAK ===== */
.streak-badge{
  display:flex;align-items:center;gap:6px;
  background:linear-gradient(135deg,#f59e0b,#ef4444);
  color:#fff;padding:6px 14px;border-radius:50px;
  font-weight:700;font-size:13px;
}

/* ===== SWIPE AREA ===== */
.question-nav{
  display:flex;align-items:center;justify-content:space-between;
  margin-top:20px;gap:12px;
}

/* ===== SCROLL BEHAVIOR ===== */
html{scroll-behavior:smooth}
::-webkit-scrollbar{width:4px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:var(--c1);border-radius:2px}

/* ===== 3D CUBE MONUMENT ===== */
.cube-hero{
  position:relative;width:100%;height:220px;
  display:flex;align-items:center;justify-content:center;
  margin-bottom:8px;cursor:pointer;
}
#logo-3d-container{
  width:200px;height:200px;position:relative;z-index:2;
  filter:drop-shadow(0 12px 32px rgba(124,58,237,.4));
}
.cube-glow{
  position:absolute;width:280px;height:280px;border-radius:50%;
  background:radial-gradient(circle,rgba(168,85,247,.35) 0%,rgba(124,58,237,.15) 40%,transparent 70%);
  z-index:1;pointer-events:none;
  animation:cubeGlowPulse 3s ease-in-out infinite;
}
@keyframes cubeGlowPulse{
  0%,100%{transform:scale(1);opacity:.7}
  50%{transform:scale(1.1);opacity:1}
}

/* ===== FLOATING PARTICLES ===== */
.particle-bg{
  position:absolute;inset:0;overflow:hidden;pointer-events:none;
  border-radius:var(--radius);
}
.particle{
  position:absolute;border-radius:50%;pointer-events:none;
  background:linear-gradient(135deg,rgba(255,255,255,.6),rgba(167,139,250,.4));
  box-shadow:0 0 8px rgba(255,255,255,.3);
}
@keyframes particleFloat{
  0%{transform:translateY(100%) translateX(0);opacity:0}
  10%,90%{opacity:.8}
  100%{transform:translateY(-200%) translateX(var(--drift,0));opacity:0}
}

/* ===== HERO ANIMATIONS ===== */
.fade-in-up{opacity:0;transform:translateY(20px);animation:fadeInUp .8s ease forwards}
@keyframes fadeInUp{to{opacity:1;transform:translateY(0)}}
.fade-delay-1{animation-delay:.1s}
.fade-delay-2{animation-delay:.2s}
.fade-delay-3{animation-delay:.3s}
.fade-delay-4{animation-delay:.4s}
.fade-delay-5{animation-delay:.5s}

/* ===== ANSWER ANIMATIONS ===== */
@keyframes correctPop{
  0%{transform:scale(1)}30%{transform:scale(1.05)}60%{transform:scale(.98)}100%{transform:scale(1)}
}
@keyframes incorrectShake{
  0%,100%{transform:translateX(0)}20%{transform:translateX(-6px)}40%{transform:translateX(6px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}
}
.option-btn.correct{animation:correctPop .4s ease}
.option-btn.incorrect{animation:incorrectShake .35s ease}

/* ===== ANSWER FLASH OVERLAY ===== */
@keyframes resultFlash{
  0%{opacity:0;transform:scale(.4) rotate(-10deg)}
  40%{opacity:1;transform:scale(1.2) rotate(5deg)}
  70%{opacity:1;transform:scale(1) rotate(0)}
  100%{opacity:0;transform:scale(.85)}
}
.answer-flash{position:fixed;inset:0;z-index:400;pointer-events:none;display:flex;align-items:center;justify-content:center}
.answer-flash-icon{font-size:88px;animation:resultFlash .75s ease forwards;filter:drop-shadow(0 4px 16px rgba(0,0,0,.2))}

/* ===== MULTI-OS TOUCH ===== */
button,[onclick]{touch-action:manipulation}
@media(hover:none){
  .btn:hover{transform:none}
  .btn:active{transform:scale(.97);opacity:.88}
  .feature-card:active{transform:scale(.98);border-color:var(--c1)}
}
</style>
</head>
<body>

<!-- ===== HEADER ===== -->
<header id="app-header">
  <div class="header-inner">
    <a class="logo" href="#" onclick="nav('home');return false">
      宅建BOOST <span>合格アプリ</span>
    </a>
    <div class="header-actions">
      <button class="hbtn" onclick="toggleDark()" title="ダークモード" id="themeBtn">
        <i class="fas fa-moon"></i>
      </button>
      <button class="hbtn" onclick="showInstallBanner()" title="インストール" id="installHeaderBtn">
        <i class="fas fa-download"></i>
      </button>
    </div>
  </div>
</header>

<!-- ===== MAIN ===== -->
<div id="main"></div>

<!-- ===== BOTTOM NAV ===== -->
<nav id="bottom-nav">
  <button class="nav-item active" id="nav-home" onclick="nav('home')">
    <i class="fas fa-home"></i>ホーム
  </button>
  <button class="nav-item" id="nav-study" onclick="nav('study')">
    <i class="fas fa-book-open"></i>学習
  </button>
  <button class="nav-item" id="nav-exam" onclick="nav('exam')">
    <i class="fas fa-file-alt"></i>模擬試験
  </button>
  <button class="nav-item" id="nav-progress" onclick="nav('progress')">
    <i class="fas fa-chart-line"></i>進捗
  </button>
  <button class="nav-item" id="nav-review" onclick="nav('review')">
    <i class="fas fa-redo"></i>復習
  </button>
</nav>

<!-- ===== TOAST ===== -->
<div id="toast"></div>

<!-- ===== INSTALL BANNER ===== -->
<div id="install-banner">
  <div style="flex:1">
    <div style="font-weight:700;font-size:15px">アプリをインストール</div>
    <div style="font-size:12px;color:var(--sub)">オフラインで学習できます</div>
  </div>
  <button class="btn btn-primary btn-sm" onclick="installPWA()">インストール</button>
  <button style="border:none;background:none;color:var(--sub);cursor:pointer;font-size:18px" onclick="hideInstallBanner()">✕</button>
</div>

<script>
// ===== STATE =====
const S = {
  page: 'home',
  stats: null,
  study: {
    questions: [], idx: 0, answered: false,
    category: 'all', difficulty: 'all', year: 'all',
    correct: 0, total: 0
  },
  exam: {
    active: false, questions: [], answers: {},
    idx: 0, timeLeft: 7200, timer: null, startTime: null,
    sessionId: null
  },
  progress: { history: [], weakPoints: [] },
  review: { questions: [] }
};

// localStorage ラッパー
const LS = {
  get: (k, def) => { try { return JSON.parse(localStorage.getItem(k)) ?? def } catch { return def } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch {} },
};

// ===== ROUTER =====
function nav(page, params = {}) {
  S.page = page;
  document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
  const navMap = { home:'home', study:'study', exam:'exam', progress:'progress', review:'review',
    category:'study', question:'study', 'past-exam':'study', result:'exam', 'past-result':'study' };
  const navEl = document.getElementById('nav-' + (navMap[page] || page));
  if (navEl) navEl.classList.add('active');

  window.scrollTo(0, 0);

  // Dispose 3D cube when leaving home (memory leak prevention)
  if (page !== 'home' && typeof _cube3D !== 'undefined' && _cube3D) {
    try { _cube3D.dispose(); } catch {}
    _cube3D = null;
  }

  // Stop exam timer when leaving exam pages (prevents background timer leak)
  if (page !== 'exam' && page !== 'result' && S.exam?.active && S.exam.timer) {
    clearInterval(S.exam.timer);
    S.exam.timer = null;
  }

  const main = document.getElementById('main');
  main.innerHTML = '<div class="page-loader"><div class="loader"></div><p>読み込み中...</p></div>';

  const pages = {
    home: renderHome, study: renderStudy, exam: renderExam,
    progress: renderProgress, review: renderReview,
    category: renderCategory, question: renderQuestion,
    'past-exam': renderPastExam, result: renderResult, 'past-result': renderPastResult,
  };

  Object.assign(S, { currentParams: params });
  (pages[page] || renderHome)(params);
}

// ===== TOAST =====
function toast(msg, ms = 2000) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), ms);
}

// ===== HOME PAGE =====
async function renderHome() {
  if (!S.stats) {
    try {
      const r = await fetch('/api/stats');
      const data = await r.json();
      S.stats = data;
    } catch {
      S.stats = { total: 402, bySubject: [], byYear: [] };
    }
  }

  const hist = LS.get('study_history', []);
  const total = hist.length;
  const correct = hist.filter(h => h.correct).length;
  const accuracy = total > 0 ? Math.round(correct / total * 100) : 0;
  const streak = calcStreak();
  const todayCount = hist.filter(h => h.date === today()).length;
  const totalQ = S.stats?.total || 402;
  const years = (S.stats?.byYear || []).map(r => r.year).filter(Boolean).sort((a,b)=>b-a);

  document.getElementById('main').innerHTML = \`
<!-- ===== 3D CUBE MONUMENT ===== -->
<div class="cube-hero fade-in-up">
  <div class="cube-glow"></div>
  <div id="logo-3d-container"></div>
</div>

<div class="card-grad fade-in-up fade-delay-1" style="position:relative;overflow:hidden">
  <div class="particle-bg" id="hero-particles"></div>
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;position:relative;z-index:2">
    <div>
      <div style="font-size:13px;opacity:.8">宅地建物取引士試験</div>
      <div style="font-size:24px;font-weight:900">合格への最速ルート</div>
    </div>
    \${streak > 0 ? \`<div class="streak-badge"><i class="fas fa-fire"></i>\${streak}日連続</div>\` : ''}
  </div>
  <div class="grid-4" style="gap:8px">
    <div class="stat-box" style="background:rgba(255,255,255,.15);color:#fff">
      <div class="stat-num" style="color:#fff">\${totalQ}</div>
      <div class="stat-label" style="color:rgba(255,255,255,.7)">総問題数</div>
    </div>
    <div class="stat-box" style="background:rgba(255,255,255,.15);color:#fff">
      <div class="stat-num" style="color:#fff">\${total}</div>
      <div class="stat-label" style="color:rgba(255,255,255,.7)">解答済み</div>
    </div>
    <div class="stat-box" style="background:rgba(255,255,255,.15);color:#fff">
      <div class="stat-num" style="color:#fff">\${accuracy}%</div>
      <div class="stat-label" style="color:rgba(255,255,255,.7)">正答率</div>
    </div>
    <div class="stat-box" style="background:rgba(255,255,255,.15);color:#fff">
      <div class="stat-num" style="color:#fff">\${todayCount}</div>
      <div class="stat-label" style="color:rgba(255,255,255,.7)">今日の問題</div>
    </div>
  </div>
</div>

<div class="section-title"><i class="fas fa-bolt"></i>クイックスタート</div>
<div class="grid-2" style="margin-bottom:16px">
  <button class="btn btn-primary btn-lg" onclick="nav('study')" style="border-radius:16px;height:64px">
    <i class="fas fa-book-open"></i>学習開始
  </button>
  <button class="btn btn-white btn-lg" onclick="startExam()" style="border-radius:16px;height:64px;color:var(--c1)">
    <i class="fas fa-file-alt"></i>模擬試験
  </button>
</div>

<div class="section-title"><i class="fas fa-th-large"></i>学習メニュー</div>
<div class="feature-card" onclick="nav('study')" style="margin-bottom:12px">
  <div class="feature-row">
    <div class="feature-icon" style="background:linear-gradient(135deg,#7c3aed,#4f46e5)">
      <i class="fas fa-graduation-cap"></i>
    </div>
    <div>
      <div class="feature-title">カテゴリ別学習</div>
      <div class="feature-desc">権利関係・宅建業法・法令制限・税その他の4カテゴリを体系的に学習</div>
    </div>
  </div>
</div>

<div class="feature-card" onclick="nav('exam')" style="margin-bottom:12px">
  <div class="feature-row">
    <div class="feature-icon" style="background:linear-gradient(135deg,#059669,#0d9488)">
      <i class="fas fa-clipboard-check"></i>
    </div>
    <div>
      <div class="feature-title">本番形式 模擬試験</div>
      <div class="feature-desc">50問・2時間の本番形式試験。詳細な採点・解説付き</div>
    </div>
  </div>
</div>

\${years.length > 0 ? \`
<div class="feature-card" onclick="nav('past-exam',{year:\${years[0]}})" style="margin-bottom:12px">
  <div class="feature-row">
    <div class="feature-icon" style="background:linear-gradient(135deg,#dc2626,#b91c1c)">
      <i class="fas fa-history"></i>
    </div>
    <div>
      <div class="feature-title">過去問チャレンジ <span class="badge badge-red" style="font-size:10px">NEW</span></div>
      <div class="feature-desc">令和6年(2024年)本試験50問 — 本番さながらの演習</div>
    </div>
  </div>
</div>
\` : ''}

<div class="feature-card" onclick="nav('review')" style="margin-bottom:12px">
  <div class="feature-row">
    <div class="feature-icon" style="background:linear-gradient(135deg,#f59e0b,#ea580c)">
      <i class="fas fa-sync-alt"></i>
    </div>
    <div>
      <div class="feature-title">弱点集中復習</div>
      <div class="feature-desc">間違えた問題を優先して復習。AIが学習パターンを分析</div>
    </div>
  </div>
</div>

<div class="feature-card" onclick="nav('progress')" style="margin-bottom:12px">
  <div class="feature-row">
    <div class="feature-icon" style="background:linear-gradient(135deg,#2563eb,#7c3aed)">
      <i class="fas fa-chart-line"></i>
    </div>
    <div>
      <div class="feature-title">学習進捗・統計</div>
      <div class="feature-desc">分野別の正答率グラフ・学習履歴・合格予測スコア</div>
    </div>
  </div>
</div>

\${years.length > 0 ? \`
<div class="section-title" style="margin-top:8px"><i class="fas fa-calendar-alt"></i>過去問年度別</div>
<div class="cat-pills">
  \${years.map(y => \`
    <div class="cat-pill" onclick="nav('past-exam',{year:\${y}})">
      令和\${y-2018}年(\${y})
    </div>
  \`).join('')}
</div>
\` : ''}

<div class="section-title" style="margin-top:8px"><i class="fas fa-info-circle"></i>試験情報</div>
<div class="card">
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
    <div><div style="font-size:12px;color:var(--sub)">試験日程</div><div style="font-weight:700">毎年10月第3日曜日</div></div>
    <div><div style="font-size:12px;color:var(--sub)">合格基準点</div><div style="font-weight:700">50問中 36点前後</div></div>
    <div><div style="font-size:12px;color:var(--sub)">合格率</div><div style="font-weight:700">約15〜17%</div></div>
    <div><div style="font-size:12px;color:var(--sub)">試験時間</div><div style="font-weight:700">2時間</div></div>
  </div>
</div>
\`;

  // Initialize 3D cube and particles after DOM is in place
  setTimeout(() => {
    initCubeLogo();
    createHeroParticles();
  }, 30);
}

// ===== STUDY PAGE =====
function renderStudy() {
  document.getElementById('main').innerHTML = \`
<div class="section-title"><i class="fas fa-book-open"></i>カテゴリ別学習</div>
<p style="font-size:14px;color:var(--sub);margin-bottom:16px">分野を選んで集中学習。解説付きで理解を深めましょう</p>

<div class="section-title" style="font-size:15px">分野を選ぶ</div>
<div style="display:grid;gap:12px">
  <div class="feature-card" onclick="nav('category',{subject:'all'})">
    <div class="feature-row">
      <div class="feature-icon" style="background:var(--grad)"><i class="fas fa-star"></i></div>
      <div>
        <div class="feature-title">全分野ランダム</div>
        <div class="feature-desc">全402問からランダムに出題。本番同様の幅広い知識を確認</div>
      </div>
    </div>
  </div>
  <div class="feature-card" onclick="nav('category',{subject:'rights'})">
    <div class="feature-row">
      <div class="feature-icon" style="background:linear-gradient(135deg,#7c3aed,#4f46e5)"><i class="fas fa-balance-scale"></i></div>
      <div>
        <div class="feature-title">権利関係</div>
        <div class="feature-desc">民法・借地借家法・区分所有法・不動産登記法（14問/50問）</div>
        <div class="badge badge-purple" style="margin-top:6px">140問収録</div>
      </div>
    </div>
  </div>
  <div class="feature-card" onclick="nav('category',{subject:'businessLaw'})">
    <div class="feature-row">
      <div class="feature-icon" style="background:linear-gradient(135deg,#059669,#0d9488)"><i class="fas fa-building"></i></div>
      <div>
        <div class="feature-title">宅建業法</div>
        <div class="feature-desc">宅建業の免許・宅建士・重要事項・報酬制限（20問/50問）</div>
        <div class="badge badge-green" style="margin-top:6px">140問収録</div>
      </div>
    </div>
  </div>
  <div class="feature-card" onclick="nav('category',{subject:'restrictions'})">
    <div class="feature-row">
      <div class="feature-icon" style="background:linear-gradient(135deg,#dc2626,#b91c1c)"><i class="fas fa-map-marked-alt"></i></div>
      <div>
        <div class="feature-title">法令上の制限</div>
        <div class="feature-desc">都市計画法・建築基準法・農地法・国土利用計画法（8問/50問）</div>
        <div class="badge badge-red" style="margin-top:6px">80問収録</div>
      </div>
    </div>
  </div>
  <div class="feature-card" onclick="nav('category',{subject:'taxOther'})">
    <div class="feature-row">
      <div class="feature-icon" style="background:linear-gradient(135deg,#d97706,#b45309)"><i class="fas fa-yen-sign"></i></div>
      <div>
        <div class="feature-title">税・その他</div>
        <div class="feature-desc">不動産取得税・固定資産税・所得税・鑑定評価（8問/50問）</div>
        <div class="badge badge-yellow" style="margin-top:6px">42問収録</div>
      </div>
    </div>
  </div>
</div>
\`;
}

// ===== CATEGORY LEARNING =====
async function renderCategory({ subject = 'all' } = {}) {
  document.getElementById('main').innerHTML = '<div class="page-loader"><div class="loader"></div><p>問題を取得中...</p></div>';

  try {
    const params = new URLSearchParams({ limit: '20' });
    if (subject !== 'all') params.set('category', subject);

    const r = await fetch('/api/study/questions?' + params);
    const data = await r.json();

    if (!data.success || !data.questions?.length) {
      document.getElementById('main').innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i><p>問題を取得できませんでした</p></div>';
      return;
    }

    S.study.questions = data.questions;
    S.study.idx = 0;
    S.study.correct = 0;
    S.study.total = 0;
    S.study.category = subject;

    renderQuestion();
  } catch (e) {
    document.getElementById('main').innerHTML = '<div class="empty-state"><i class="fas fa-wifi"></i><p>通信エラー。接続を確認してください</p></div>';
  }
}

// ===== QUESTION PAGE =====
function renderQuestion() {
  const { questions, idx } = S.study;
  if (idx >= questions.length) {
    renderStudyResult();
    return;
  }

  const q = questions[idx];
  let options = [];
  try { options = typeof q.options === 'string' ? JSON.parse(q.options) : (q.options || []) } catch {}

  const subjectLabel = { rights:'権利関係', businessLaw:'宅建業法', restrictions:'法令制限', taxOther:'税・その他' };
  const diffLabel = { basic:'基礎', intermediate:'標準', advanced:'応用' };

  document.getElementById('main').innerHTML = \`
<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
  <button class="back-btn" onclick="nav('study')"><i class="fas fa-chevron-left"></i>戻る</button>
  <div style="font-size:13px;color:var(--sub);font-weight:600">\${idx+1} / \${questions.length}問</div>
</div>

<div class="progress-bar" style="margin-bottom:16px">
  <div class="progress-fill" style="width:\${(idx/questions.length*100).toFixed(1)}%"></div>
</div>

<div style="display:flex;gap:6px;margin-bottom:12px;flex-wrap:wrap">
  <span class="badge badge-purple">\${subjectLabel[q.subject]||q.subject||q.category}</span>
  <span class="badge badge-\${q.difficulty==='basic'?'green':q.difficulty==='advanced'?'red':'blue'}">\${diffLabel[q.difficulty]||q.difficulty||'標準'}</span>
  \${q.year ? \`<span class="badge badge-yellow">令和\${q.year-2018}年(\${q.year})</span>\` : ''}
</div>

<div class="question-text">\${q.question_text}</div>

<div id="options">
  \${options.map((opt, i) => \`
    <button class="option-btn" id="opt-\${i}" data-answer="\${i+1}">
      <div class="option-label">\${i+1}</div>
      <div style="flex:1">\${opt}</div>
    </button>
  \`).join('')}
</div>

<div id="explanation-area"></div>

<div class="question-nav" id="nav-area" style="display:none">
  <div style="display:flex;align-items:center;gap:8px">
    <span id="q-result-badge"></span>
    <span style="font-size:13px;color:var(--sub)">正答率: <strong id="acc-display">\${S.study.total > 0 ? Math.round(S.study.correct/S.study.total*100) : 0}%</strong></span>
  </div>
  <button class="btn btn-primary" onclick="nextQuestion()">
    \${idx+1 < questions.length ? '次の問題 <i class="fas fa-chevron-right"></i>' : '結果を見る <i class="fas fa-flag-checkered"></i>'}
  </button>
</div>
\`;

  // オプションクリックのイベントデリゲート
  document.querySelectorAll('.option-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const ans = parseInt(btn.getAttribute('data-answer'));
      const q2 = S.study.questions[S.study.idx];
      selectAnswer(ans, q2.correct_answer, q2.explanation || '');
    });
  });
}

function selectAnswer(selected, correct, explanation) {
  if (S.study.answered) return;
  S.study.answered = true;

  const isCorrect = selected === correct;
  S.study.total++;
  if (isCorrect) S.study.correct++;

  // Record history
  const q = S.study.questions[S.study.idx];
  const hist = LS.get('study_history', []);
  hist.push({ qid: q.id, correct: isCorrect, date: today(), subject: q.subject });
  if (hist.length > 2000) hist.splice(0, hist.length - 2000);
  LS.set('study_history', hist);

  // Wrong answers for review
  if (!isCorrect) {
    const wrong = LS.get('wrong_questions', []);
    if (!wrong.find(w => w.id === q.id)) {
      wrong.push({ ...q, wrongCount: 1 });
    } else {
      wrong.find(w => w.id === q.id).wrongCount++;
    }
    LS.set('wrong_questions', wrong);
  } else {
    const wrong = LS.get('wrong_questions', []);
    const idx = wrong.findIndex(w => w.id === q.id);
    if (idx > -1) wrong.splice(idx, 1);
    LS.set('wrong_questions', wrong);
  }

  // Color options
  document.querySelectorAll('.option-btn').forEach((btn, i) => {
    btn.disabled = true;
    if (i+1 === correct) btn.classList.add(isCorrect && i+1===selected ? 'correct' : 'show-correct');
    if (i+1 === selected && !isCorrect) btn.classList.add('incorrect');
  });

  // Explanation
  const expEl = document.getElementById('explanation-area');
  expEl.innerHTML = \`<div class="explanation \${isCorrect?'':'wrong'}">
    <div style="font-weight:700;margin-bottom:8px;\${isCorrect?'color:var(--success)':'color:var(--danger)'}">
      \${isCorrect ? '✓ 正解！' : '✗ 不正解 — 正解は選択肢 '+correct}
    </div>
    <div style="font-size:14px;line-height:1.7">\${explanation || '解説は準備中です。'}</div>
  </div>\`;

  const badge = document.getElementById('q-result-badge');
  badge.innerHTML = isCorrect
    ? '<span class="badge badge-green">正解</span>'
    : '<span class="badge badge-red">不正解</span>';
  const accEl = document.getElementById('acc-display');
  if (accEl) accEl.textContent = Math.round(S.study.correct/S.study.total*100) + '%';
  document.getElementById('nav-area').style.display = 'flex';
}

function nextQuestion() {
  S.study.answered = false;
  S.study.idx++;
  renderQuestion();
}

function renderStudyResult() {
  const { correct, total, questions } = S.study;
  const acc = total > 0 ? Math.round(correct / total * 100) : 0;
  const rank = acc >= 80 ? '🥇 優秀' : acc >= 60 ? '🥈 合格圏' : '🥉 要復習';

  document.getElementById('main').innerHTML = \`
<div class="card" style="text-align:center;padding:32px">
  <div style="font-size:18px;font-weight:700;margin-bottom:20px">学習セッション完了</div>
  <div class="result-circle">
    <div class="score">\${acc}%</div>
    <div class="label">正答率</div>
  </div>
  <div style="font-size:24px;margin-bottom:8px">\${rank}</div>
  <div style="color:var(--sub);font-size:15px">\${correct}問正解 / \${total}問中</div>
</div>
<div class="grid-2" style="gap:12px">
  <button class="btn btn-primary btn-block" onclick="nav('study')">
    <i class="fas fa-redo"></i>もう一度
  </button>
  <button class="btn btn-white btn-block" onclick="nav('review')">
    <i class="fas fa-book"></i>復習する
  </button>
</div>
\`;
}

// ===== EXAM PAGE =====
function renderExam() {
  if (S.exam.active) {
    renderActiveExam();
    return;
  }

  document.getElementById('main').innerHTML = \`
<div class="section-title"><i class="fas fa-file-alt"></i>模擬試験</div>
<p style="font-size:14px;color:var(--sub);margin-bottom:20px">本番形式で実力を確認しましょう</p>

<div class="card-grad" style="margin-bottom:16px">
  <div style="font-size:20px;font-weight:900;margin-bottom:8px">本番形式試験</div>
  <div style="opacity:.8;font-size:14px;margin-bottom:16px">50問・制限時間2時間</div>
  <div class="grid-2" style="gap:8px;margin-bottom:16px">
    <div style="background:rgba(255,255,255,.15);border-radius:12px;padding:12px;text-align:center">
      <div style="font-size:24px;font-weight:900">50</div><div style="font-size:12px;opacity:.8">問</div>
    </div>
    <div style="background:rgba(255,255,255,.15);border-radius:12px;padding:12px;text-align:center">
      <div style="font-size:24px;font-weight:900">120</div><div style="font-size:12px;opacity:.8">分</div>
    </div>
  </div>
  <button class="btn btn-white btn-block" onclick="startExam()" id="examStartBtn" style="color:var(--c1);font-weight:700">
    <i class="fas fa-play"></i>試験を開始する
  </button>
</div>

<div class="card" style="margin-bottom:16px">
  <div class="section-title" style="font-size:15px"><i class="fas fa-list-ol"></i>出題構成</div>
  <div style="display:flex;flex-direction:column;gap:10px">
    <div style="display:flex;justify-content:space-between;align-items:center;padding:10px;background:#f8f7ff;border-radius:8px">
      <span style="font-weight:600"><span style="color:var(--c1)">●</span> 権利関係</span>
      <span class="badge badge-purple">14問</span>
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;padding:10px;background:#f0fdf4;border-radius:8px">
      <span style="font-weight:600"><span style="color:var(--success)">●</span> 宅建業法</span>
      <span class="badge badge-green">20問</span>
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;padding:10px;background:#fff7ed;border-radius:8px">
      <span style="font-weight:600"><span style="color:var(--warn)">●</span> 法令制限</span>
      <span class="badge badge-yellow">8問</span>
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;padding:10px;background:#fef2f2;border-radius:8px">
      <span style="font-weight:600"><span style="color:var(--danger)">●</span> 税・その他</span>
      <span class="badge badge-red">8問</span>
    </div>
  </div>
</div>

<div class="card">
  <div class="section-title" style="font-size:15px"><i class="fas fa-history"></i>試験履歴</div>
  \${renderExamHistory()}
</div>
\`;
}

function renderExamHistory() {
  const history = LS.get('exam_history', []);
  if (!history.length) return '<div class="empty-state" style="padding:24px"><i class="fas fa-clipboard"></i><p>まだ試験を受けていません</p></div>';

  return history.slice(-5).reverse().map(h => \`
    <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid var(--border)">
      <div>
        <div style="font-weight:600">\${h.date}</div>
        <div style="font-size:12px;color:var(--sub)">\${h.correct}/\${h.total}問正解</div>
      </div>
      <div class="badge \${h.score >= 72 ? 'badge-green' : h.score >= 60 ? 'badge-blue' : 'badge-red'}">\${h.score}%</div>
    </div>
  \`).join('');
}

async function startExam() {
  const btn = document.getElementById('examStartBtn');
  if (btn) { btn.disabled = true; btn.innerHTML = '<div class="loader"></div>準備中...'; }

  try {
    const r = await fetch('/api/mock-exam/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 1, examType: 'full' })
    });
    const data = await r.json();

    if (!data.success || !data.questions?.length) throw new Error('問題取得失敗');

    S.exam.active = true;
    S.exam.questions = data.questions;
    S.exam.answers = {};
    S.exam.idx = 0;
    S.exam.timeLeft = data.timeLimit || 7200;
    S.exam.startTime = Date.now();
    S.exam.sessionId = data.sessionId;

    if (S.exam.timer) clearInterval(S.exam.timer);
    S.exam.timer = setInterval(tickExamTimer, 1000);

    renderActiveExam();
  } catch (e) {
    toast('試験の開始に失敗しました。再試行してください。', 3000);
    if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-play"></i>試験を開始する'; }
  }
}

function tickExamTimer() {
  S.exam.timeLeft--;
  if (S.exam.timeLeft <= 0) {
    clearInterval(S.exam.timer);
    submitExam();
    return;
  }
  const el = document.getElementById('exam-timer-text');
  if (el) {
    el.textContent = formatTime(S.exam.timeLeft);
    const timerEl = el.closest('.exam-timer');
    if (timerEl && S.exam.timeLeft < 600) timerEl.classList.add('warning');
  }
}

function formatTime(secs) {
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return \`\${m}:\${s}\`;
}

function renderActiveExam() {
  const { questions, idx, answers, timeLeft } = S.exam;
  const q = questions[idx];
  let options = [];
  try { options = typeof q.options === 'string' ? JSON.parse(q.options) : (q.options || []) } catch {}

  const answered = Object.keys(answers).length;

  document.getElementById('main').innerHTML = \`
<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;flex-wrap:wrap;gap:8px">
  <div style="font-size:14px;font-weight:700">問 \${idx+1} / \${questions.length}</div>
  <div class="exam-timer">
    <i class="fas fa-clock"></i>
    <span id="exam-timer-text">\${formatTime(timeLeft)}</span>
  </div>
  <div style="font-size:13px;color:var(--sub)">回答: \${answered}/\${questions.length}</div>
</div>

<div class="progress-bar" style="margin-bottom:16px">
  <div class="progress-fill" style="width:\${(answered/questions.length*100).toFixed(1)}%"></div>
</div>

<div class="question-text">\${q.question_text}</div>

<div id="exam-options">
  \${options.map((opt, i) => {
    const sel = answers[q.id] === i+1;
    return \`<button class="option-btn \${sel ? 'selected' : ''}"
      onclick="selectExamAnswer('\${q.id}', \${i+1})"
      style="\${sel ? 'border-color:var(--c1);background:#f5f3ff;' : ''}">
      <div class="option-label" style="\${sel ? 'background:var(--c1);' : ''}">\${i+1}</div>
      <div style="flex:1">\${opt}</div>
    </button>\`;
  }).join('')}
</div>

<div style="display:flex;justify-content:space-between;margin-top:20px;gap:12px">
  <button class="btn btn-outline" onclick="moveExamQ(-1)" \${idx===0?'disabled':''}>
    <i class="fas fa-chevron-left"></i>前へ
  </button>
  <button class="btn btn-danger btn-sm" onclick="confirmSubmitExam()" style="padding:12px 16px">
    <i class="fas fa-flag-checkered"></i>終了
  </button>
  <button class="btn btn-primary" onclick="moveExamQ(1)" \${idx>=questions.length-1?'disabled':''}>
    次へ<i class="fas fa-chevron-right"></i>
  </button>
</div>

<div style="margin-top:16px">
  <div style="font-size:12px;color:var(--sub);margin-bottom:8px">問題一覧</div>
  <div style="display:flex;flex-wrap:wrap;gap:6px">
    \${questions.map((qq, i) => \`
      <button onclick="S.exam.idx=\${i};renderActiveExam()" style="
        width:32px;height:32px;border-radius:6px;border:2px solid \${i===idx?'var(--c1)':answers[qq.id]?'var(--success)':'var(--border)'};
        background:\${i===idx?'var(--c1)':answers[qq.id]?'#d1fae5':'#fff'};
        color:\${i===idx?'#fff':answers[qq.id]?'var(--success)':'var(--sub)'};
        font-size:11px;font-weight:700;cursor:pointer;
      ">\${i+1}</button>
    \`).join('')}
  </div>
</div>
\`;
}

function selectExamAnswer(qid, answer) {
  S.exam.answers[qid] = answer;
  renderActiveExam();
}

function moveExamQ(dir) {
  S.exam.idx = Math.max(0, Math.min(S.exam.questions.length - 1, S.exam.idx + dir));
  renderActiveExam();
}

function confirmSubmitExam() {
  const answered = Object.keys(S.exam.answers).length;
  const total = S.exam.questions.length;
  const unanswered = total - answered;

  if (unanswered > 0) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = \`<div class="modal-sheet">
      <div class="modal-handle"></div>
      <div style="text-align:center;padding:16px">
        <i class="fas fa-exclamation-triangle" style="font-size:48px;color:var(--warn);margin-bottom:16px"></i>
        <div style="font-size:18px;font-weight:700;margin-bottom:8px">未回答があります</div>
        <div style="color:var(--sub);margin-bottom:24px">\${unanswered}問が未回答です。このまま終了しますか？</div>
        <div class="grid-2" style="gap:12px">
          <button class="btn btn-outline btn-block" onclick="this.closest('.modal-overlay').remove()">戻る</button>
          <button class="btn btn-danger btn-block" onclick="this.closest('.modal-overlay').remove();submitExam()">終了する</button>
        </div>
      </div>
    </div>\`;
    document.body.appendChild(modal);
  } else {
    submitExam();
  }
}

async function submitExam() {
  if (!S.exam.active) return;
  clearInterval(S.exam.timer);

  const { questions, answers, startTime } = S.exam;
  const timeSpent = Math.round((Date.now() - startTime) / 1000);

  let correct = 0;
  const results = questions.map(q => {
    const selected = answers[q.id] || null;
    const isCorrect = selected === q.correct_answer;
    if (isCorrect) correct++;
    return { ...q, selected, isCorrect };
  });

  const score = Math.round(correct / questions.length * 100);

  // Save history
  const hist = LS.get('exam_history', []);
  hist.push({ date: today(), correct, total: questions.length, score, timeSpent });
  LS.set('exam_history', hist);

  // Save wrong answers
  const wrong = LS.get('wrong_questions', []);
  results.forEach(r => {
    if (!r.isCorrect) {
      const existing = wrong.find(w => w.id === r.id);
      if (existing) existing.wrongCount++;
      else wrong.push({ ...r, wrongCount: 1 });
    } else {
      const idx = wrong.findIndex(w => w.id === r.id);
      if (idx > -1) wrong.splice(idx, 1);
    }
  });
  LS.set('wrong_questions', wrong);

  S.exam.active = false;
  S.exam.results = results;
  S.exam.score = score;
  S.exam.correct = correct;

  nav('result');
}

function renderResult() {
  const { results, score, correct, questions } = S.exam;
  if (!results) { nav('exam'); return; }

  const total = results?.length || 0;
  const rank = score >= 80 ? '🏆 合格圏上位' : score >= 72 ? '✅ 合格圏' : score >= 60 ? '⚠️ ボーダー' : '📚 要学習';
  const color = score >= 72 ? 'var(--success)' : score >= 60 ? 'var(--warn)' : 'var(--danger)';

  const bySubject = {};
  results?.forEach(r => {
    if (!bySubject[r.subject]) bySubject[r.subject] = { correct: 0, total: 0 };
    bySubject[r.subject].total++;
    if (r.isCorrect) bySubject[r.subject].correct++;
  });

  const subLabel = { rights:'権利関係', businessLaw:'宅建業法', restrictions:'法令制限', taxOther:'税・その他' };

  document.getElementById('main').innerHTML = \`
<div class="card" style="text-align:center;padding:32px">
  <div style="font-size:20px;font-weight:900;margin-bottom:20px">模擬試験 結果</div>
  <div class="result-circle" style="border-color:\${color}">
    <div class="score" style="color:\${color}">\${score}%</div>
    <div class="label">\${correct}/\${total}問</div>
  </div>
  <div style="font-size:22px;margin-bottom:8px">\${rank}</div>
  <div style="color:var(--sub);font-size:14px">合格ラインの目安: 36点以上(72%)</div>
</div>

<div class="card" style="margin-bottom:16px">
  <div class="section-title" style="font-size:15px"><i class="fas fa-chart-bar"></i>分野別成績</div>
  \${Object.entries(bySubject).map(([s, d]) => \`
    <div style="margin-bottom:12px">
      <div style="display:flex;justify-content:space-between;margin-bottom:4px">
        <span style="font-size:13px;font-weight:600">\${subLabel[s]||s}</span>
        <span style="font-size:13px;color:var(--sub)">\${d.correct}/\${d.total}</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" style="width:\${Math.round(d.correct/d.total*100)}%;background:\${d.correct/d.total>=.7?'var(--success)':'var(--danger)'}"></div>
      </div>
    </div>
  \`).join('')}
</div>

<div class="card" style="margin-bottom:16px">
  <div class="section-title" style="font-size:15px"><i class="fas fa-list"></i>問題別結果</div>
  <div style="max-height:300px;overflow-y:auto">
    \${(results||[]).map((r, i) => \`
      <div style="display:flex;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid var(--border)">
        <div style="width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;
          background:\${r.isCorrect?'var(--success)':'var(--danger)'};color:#fff;font-size:12px;font-weight:700;flex-shrink:0">
          \${i+1}
        </div>
        <div style="flex:1;font-size:13px;color:var(--sub)" class="text-truncate">\${r.question_text?.slice(0,50)||'...'}...</div>
        <span class="badge \${r.isCorrect?'badge-green':'badge-red'}">\${r.isCorrect?'○':'✗'}</span>
      </div>
    \`).join('')}
  </div>
</div>

<div class="grid-2" style="gap:12px">
  <button class="btn btn-primary btn-block" onclick="nav('exam')">
    <i class="fas fa-redo"></i>もう一度
  </button>
  <button class="btn btn-white btn-block" onclick="nav('review')">
    <i class="fas fa-book"></i>復習する
  </button>
</div>
\`;
}

// ===== PAST EXAM =====
async function renderPastExam({ year = 2024 } = {}) {
  document.getElementById('main').innerHTML = '<div class="page-loader"><div class="loader"></div><p>過去問を取得中...</p></div>';

  try {
    const r = await fetch(\`/api/past-exam/\${year}\`);
    const data = await r.json();

    if (!data.success || !data.questions?.length) {
      document.getElementById('main').innerHTML = \`<div class="empty-state">
        <i class="fas fa-inbox"></i>
        <p>令和\${year-2018}年(\${year})の問題データがありません</p>
        <button class="btn btn-primary" style="margin-top:16px" onclick="nav('home')">ホームへ</button>
      </div>\`;
      return;
    }

    S.study.questions = data.questions;
    S.study.idx = 0;
    S.study.correct = 0;
    S.study.total = 0;
    S.study.category = 'past';
    S.study.year = year;

    renderPastExamQuestion();
  } catch (e) {
    document.getElementById('main').innerHTML = '<div class="empty-state"><i class="fas fa-wifi"></i><p>通信エラー</p></div>';
  }
}

function renderPastExamQuestion() {
  const { questions, idx } = S.study;
  if (idx >= questions.length) {
    renderPastResult();
    return;
  }

  const q = questions[idx];
  let options = [];
  try { options = typeof q.options === 'string' ? JSON.parse(q.options) : (q.options || []) } catch {}
  const year = S.study.year;

  document.getElementById('main').innerHTML = \`
<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
  <button class="back-btn" onclick="nav('home')"><i class="fas fa-chevron-left"></i>戻る</button>
  <div>
    <span class="badge badge-red">令和\${year-2018}年(\${year})</span>
    <span style="font-size:13px;color:var(--sub);margin-left:8px">問\${idx+1}/\${questions.length}</span>
  </div>
</div>

<div class="progress-bar" style="margin-bottom:16px">
  <div class="progress-fill" style="width:\${(idx/questions.length*100).toFixed(1)}%"></div>
</div>

<div class="question-text"><strong>問\${idx+1}.</strong> \${q.question_text}</div>

<div id="options">
  \${options.map((opt, i) => \`
    <button class="option-btn" id="opt-\${i}" data-answer="\${i+1}">
      <div class="option-label">\${i+1}</div>
      <div style="flex:1">\${opt}</div>
    </button>
  \`).join('')}
</div>

<div id="explanation-area"></div>

<div class="question-nav" id="nav-area" style="display:none">
  <div><span id="q-result-badge"></span></div>
  <button class="btn btn-primary" onclick="nextPastQuestion()">
    \${idx+1 < questions.length ? '次の問題 <i class="fas fa-chevron-right"></i>' : '結果を見る <i class="fas fa-flag-checkered"></i>'}
  </button>
</div>
\`;

  // オプションクリックのイベントデリゲート
  document.querySelectorAll('.option-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const ans = parseInt(btn.getAttribute('data-answer'));
      const q2 = S.study.questions[S.study.idx];
      selectAnswer(ans, q2.correct_answer, q2.explanation || '');
    });
  });
}

function nextPastQuestion() {
  S.study.answered = false;
  S.study.idx++;
  renderPastExamQuestion();
}

function renderPastResult() {
  const { correct, total, year } = S.study;
  const score = total > 0 ? Math.round(correct / total * 100) : 0;
  const pass = correct >= 36;

  document.getElementById('main').innerHTML = \`
<div class="card" style="text-align:center;padding:32px">
  <div style="font-size:18px;font-weight:700;margin-bottom:4px">令和\${year-2018}年(\${year}) 過去問</div>
  <div style="color:var(--sub);margin-bottom:20px">全問チャレンジ完了</div>
  <div class="result-circle" style="border-color:\${pass?'var(--success)':'var(--danger)'}">
    <div class="score" style="color:\${pass?'var(--success)':'var(--danger)'}">\${correct}</div>
    <div class="label">/\${total}問</div>
  </div>
  <div style="font-size:24px;margin-bottom:8px">\${pass ? '🏆 合格点突破！' : '📚 もう少し！'}</div>
  <div style="color:var(--sub)">\${score}% — 合格の目安は36点(72%)</div>
</div>
<div class="grid-2" style="gap:12px">
  <button class="btn btn-primary btn-block" onclick="nav('past-exam',{year:\${year}})">
    <i class="fas fa-redo"></i>再挑戦
  </button>
  <button class="btn btn-white btn-block" onclick="nav('home')">
    <i class="fas fa-home"></i>ホームへ
  </button>
</div>
\`;
}

// ===== PROGRESS PAGE =====
function renderProgress() {
  const hist = LS.get('study_history', []);
  const examHist = LS.get('exam_history', []);

  const total = hist.length;
  const correct = hist.filter(h => h.correct).length;
  const accuracy = total > 0 ? Math.round(correct / total * 100) : 0;
  const streak = calcStreak();

  const bySubject = {};
  ['rights', 'businessLaw', 'restrictions', 'taxOther'].forEach(s => {
    const items = hist.filter(h => h.subject === s);
    bySubject[s] = {
      total: items.length,
      correct: items.filter(h => h.correct).length,
    };
  });

  const subLabel = { rights:'権利関係', businessLaw:'宅建業法', restrictions:'法令制限', taxOther:'税・その他' };
  const subColors = { rights:'#7c3aed', businessLaw:'#059669', restrictions:'#dc2626', taxOther:'#d97706' };

  // Last 7 days (use local date, not UTC, to match today() format)
  const last7 = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const dateStr = \`\${d.getFullYear()}-\${String(d.getMonth()+1).padStart(2,'0')}-\${String(d.getDate()).padStart(2,'0')}\`;
    const dayItems = hist.filter(h => h.date === dateStr);
    last7.push({ date: dateStr, count: dayItems.length, correct: dayItems.filter(h=>h.correct).length });
  }

  document.getElementById('main').innerHTML = \`
<div class="section-title"><i class="fas fa-chart-line"></i>学習進捗</div>

<canvas id="progress-chart" style="max-height:240px;margin-bottom:16px"></canvas>

<div class="grid-4" style="gap:8px;margin-bottom:16px">
  <div class="stat-box">
    <div class="stat-num">\${total}</div>
    <div class="stat-label">総回答数</div>
  </div>
  <div class="stat-box">
    <div class="stat-num" style="color:\${accuracy>=70?'var(--success)':'var(--danger)'}">\${accuracy}%</div>
    <div class="stat-label">正答率</div>
  </div>
  <div class="stat-box">
    <div class="stat-num" style="color:var(--warn)">\${streak}</div>
    <div class="stat-label">連続日数</div>
  </div>
  <div class="stat-box">
    <div class="stat-num">\${examHist.length}</div>
    <div class="stat-label">模擬試験数</div>
  </div>
</div>

<div class="card" style="margin-bottom:16px">
  <div class="section-title" style="font-size:15px"><i class="fas fa-chart-bar"></i>分野別成績</div>
  \${Object.entries(bySubject).map(([s, d]) => {
    const acc = d.total > 0 ? Math.round(d.correct / d.total * 100) : 0;
    return \`<div style="margin-bottom:14px">
      <div style="display:flex;justify-content:space-between;margin-bottom:4px">
        <span style="font-size:14px;font-weight:600">\${subLabel[s]}</span>
        <span style="font-size:13px;color:var(--sub)">\${d.correct}/\${d.total}問 (\${acc}%)</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" style="width:\${acc}%;background:\${subColors[s]}"></div>
      </div>
    </div>\`;
  }).join('')}
</div>

<div class="card" style="margin-bottom:16px">
  <div class="section-title" style="font-size:15px"><i class="fas fa-calendar-week"></i>直近7日間の学習</div>
  <div style="display:flex;align-items:flex-end;gap:4px;height:80px;padding:8px 0">
    \${last7.map(d => {
      const pct = d.count > 0 ? Math.min(100, d.count * 5) : 0;
      const day = new Date(d.date).getDay();
      const dayLabel = ['日','月','火','水','木','金','土'][day];
      return \`<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px">
        <div style="width:100%;background:\${d.count>0?'var(--c1)':'var(--border)'};
          height:\${pct}%;min-height:\${d.count>0?'4px':'4px'};border-radius:4px;max-height:60px"></div>
        <div style="font-size:10px;color:var(--sub)">\${dayLabel}</div>
        \${d.count > 0 ? \`<div style="font-size:9px;color:var(--c1);font-weight:700">\${d.count}</div>\` : ''}
      </div>\`;
    }).join('')}
  </div>
</div>

\${examHist.length > 0 ? \`
<div class="card">
  <div class="section-title" style="font-size:15px"><i class="fas fa-clipboard-list"></i>模擬試験履歴</div>
  \${examHist.slice(-5).reverse().map(h => \`
    <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--border)">
      <div>
        <div style="font-weight:600">\${h.date}</div>
        <div style="font-size:12px;color:var(--sub)">\${h.correct}/\${h.total}問正解</div>
      </div>
      <div class="badge \${h.score>=72?'badge-green':h.score>=60?'badge-blue':'badge-red'}">\${h.score}%</div>
    </div>
  \`).join('')}
</div>
\` : ''}

<div style="margin-top:16px;text-align:center">
  <button class="btn btn-outline btn-sm" onclick="confirmResetData()">
    <i class="fas fa-trash"></i>データをリセット
  </button>
</div>
\`;

  setTimeout(() => {
    const ctx = document.getElementById('progress-chart');
    if (!ctx || !window.Chart) return;
    new window.Chart(ctx, {
      type: 'radar',
      data: {
        labels: ['権利関係', '宅建業法', '法令制限', '税・その他'],
        datasets: [{
          label: '正答率(%)',
          data: [
            bySubject.rights?.total > 0 ? Math.round(bySubject.rights.correct/bySubject.rights.total*100) : 0,
            bySubject.businessLaw?.total > 0 ? Math.round(bySubject.businessLaw.correct/bySubject.businessLaw.total*100) : 0,
            bySubject.restrictions?.total > 0 ? Math.round(bySubject.restrictions.correct/bySubject.restrictions.total*100) : 0,
            bySubject.taxOther?.total > 0 ? Math.round(bySubject.taxOther.correct/bySubject.taxOther.total*100) : 0,
          ],
          backgroundColor: 'rgba(124,58,237,0.2)',
          borderColor: 'rgba(124,58,237,0.8)',
          pointBackgroundColor: 'rgba(124,58,237,1)',
        }]
      },
      options: {
        scales: { r: { min: 0, max: 100, ticks: { stepSize: 25 } } },
        plugins: { legend: { display: false } }
      }
    });
  }, 100);
}

// ===== REVIEW PAGE =====
function renderReview() {
  const wrong = LS.get('wrong_questions', []);

  if (!wrong.length) {
    document.getElementById('main').innerHTML = \`
<div class="section-title"><i class="fas fa-sync-alt"></i>弱点復習</div>
<div class="empty-state">
  <i class="fas fa-check-circle" style="color:var(--success)"></i>
  <p style="margin-top:8px">まだ復習する問題がありません</p>
  <p style="font-size:13px;margin-top:4px">問題を解いて間違えた問題がここに表示されます</p>
  <button class="btn btn-primary" style="margin-top:16px" onclick="nav('study')">
    <i class="fas fa-book"></i>学習を開始
  </button>
</div>\`;
    return;
  }

  const sorted = [...wrong].sort((a, b) => (b.wrongCount || 1) - (a.wrongCount || 1));

  document.getElementById('main').innerHTML = \`
<div class="section-title"><i class="fas fa-sync-alt"></i>弱点復習</div>
<p style="font-size:14px;color:var(--sub);margin-bottom:12px">\${wrong.length}問の復習問題があります</p>

<button class="btn btn-primary btn-block" style="margin-bottom:16px" onclick="startReviewSession()">
  <i class="fas fa-play"></i>全問を復習する（\${wrong.length}問）
</button>

<div class="card">
  <div class="section-title" style="font-size:15px"><i class="fas fa-exclamation-triangle" style="color:var(--warn)"></i>間違えた問題</div>
  \${sorted.slice(0, 20).map(q => \`
    <div style="padding:12px 0;border-bottom:1px solid var(--border)">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">
        <div style="flex:1;font-size:14px">\${q.question_text?.slice(0,60)||''}...</div>
        <span class="badge badge-red">\${q.wrongCount||1}回</span>
      </div>
      <div style="margin-top:4px;font-size:12px;color:var(--sub)">\${q.category||q.subject}</div>
    </div>
  \`).join('')}
</div>
\`;
}

function startReviewSession() {
  const wrong = LS.get('wrong_questions', []);
  S.study.questions = wrong.slice(0, 20);
  S.study.idx = 0;
  S.study.correct = 0;
  S.study.total = 0;
  S.study.category = 'review';
  renderQuestion();
}

// ===== UTILS =====
function today() {
  const d = new Date();
  return \`\${d.getFullYear()}-\${String(d.getMonth()+1).padStart(2,'0')}-\${String(d.getDate()).padStart(2,'0')}\`;
}

function calcStreak() {
  const hist = LS.get('study_history', []);
  const dates = [...new Set(hist.map(h => h.date))].sort().reverse();
  if (!dates.length) return 0;

  let streak = 0;
  const now = today();
  let check = now;

  for (const d of dates) {
    if (d === check) {
      streak++;
      const prev = new Date(check); prev.setDate(prev.getDate() - 1);
      check = \`\${prev.getFullYear()}-\${String(prev.getMonth()+1).padStart(2,'0')}-\${String(prev.getDate()).padStart(2,'0')}\`;
    } else if (d < check) break;
  }
  return streak;
}

function resetData() {
  localStorage.clear();
  toast('データをリセットしました');
  nav('progress');
}

function confirmResetData() {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = \`<div class="modal-sheet">
    <div class="modal-handle"></div>
    <div style="text-align:center;padding:16px">
      <i class="fas fa-exclamation-triangle" style="font-size:48px;color:var(--warn);margin-bottom:16px"></i>
      <div style="font-size:18px;font-weight:700;margin-bottom:8px">学習履歴をリセット</div>
      <div style="color:var(--sub);margin-bottom:24px">全ての学習履歴・誤答記録が削除されます。元に戻せません。</div>
      <div class="grid-2" style="gap:12px">
        <button class="btn btn-outline btn-block" onclick="this.closest('.modal-overlay').remove()">キャンセル</button>
        <button class="btn btn-danger btn-block" onclick="this.closest('.modal-overlay').remove();resetData()">リセット</button>
      </div>
    </div>
  </div>\`;
  document.body.appendChild(modal);
}

// ===== DARK MODE =====
function toggleDark() {
  const isDark = document.body.classList.toggle('dark');
  LS.set('dark', isDark);
  document.getElementById('themeBtn').innerHTML = isDark
    ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
}

function initDarkMode() {
  const pref = LS.get('dark', window.matchMedia('(prefers-color-scheme: dark)').matches);
  if (pref) {
    document.body.classList.add('dark');
    const btn = document.getElementById('themeBtn');
    if (btn) btn.innerHTML = '<i class="fas fa-sun"></i>';
  }
}

// Dark mode CSS
const darkStyle = document.createElement('style');
darkStyle.textContent = \`
body.dark { --bg:#0f172a; --card:#1e293b; --text:#f1f5f9; --sub:#94a3b8; --border:#334155; }
body.dark .glass-card { background:#1e293b; }
body.dark .option-btn { background:#1e293b; border-color:#334155; color:#f1f5f9; }
body.dark .option-btn:hover:not(:disabled) { background:#2d3f55; }
body.dark #bottom-nav { background:#1e293b; border-color:#334155; }
body.dark .stat-box { background:#1e293b; }
body.dark .card { background:#1e293b; }
body.dark .feature-card { background:#1e293b; }
body.dark .cat-pill { background:#1e293b; border-color:#334155; color:#f1f5f9; }
body.dark .question-text { background:#1e293b; color:#f1f5f9; }
\`;
document.head.appendChild(darkStyle);

// ===== PWA INSTALL =====
let deferredPrompt = null;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const banner = document.getElementById('install-banner');
  if (banner && !LS.get('install_dismissed', false)) banner.classList.add('show');
});

function installPWA() {
  if (deferredPrompt) {
    const prompt = deferredPrompt;
    deferredPrompt = null;
    prompt.prompt();
    prompt.userChoice.then(r => {
      if (r.outcome === 'accepted') { toast('インストールしました！'); hideInstallBanner(); }
    });
  } else {
    toast('ブラウザのメニューから「ホーム画面に追加」を選択してください', 4000);
  }
}

function showInstallBanner() {
  const banner = document.getElementById('install-banner');
  if (banner) banner.classList.add('show');
}

function hideInstallBanner() {
  const banner = document.getElementById('install-banner');
  if (banner) banner.classList.remove('show');
  LS.set('install_dismissed', true);
}

// ===== SERVICE WORKER =====
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(r => console.log('SW registered'))
      .catch(e => console.log('SW failed:', e));
  });
}

// ===== 3D CUBE MONUMENT (原デザイン復元) =====
let _cube3D = null;
function initCubeLogo() {
  const container = document.getElementById('logo-3d-container');
  if (!container || typeof THREE === 'undefined') return;
  // Dispose previous instance
  if (_cube3D) { try { _cube3D.dispose(); } catch {} _cube3D = null; }
  container.innerHTML = '';

  // Guard against 0-size container (CSS not yet applied)
  let W = container.clientWidth, H = container.clientHeight;
  if (W < 10 || H < 10) { W = 200; H = 200; }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, W/H, 0.1, 1000);
  camera.position.z = 3;
  const renderer = new THREE.WebGLRenderer({alpha:true, antialias:true});
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // Create 6 face materials
  const faceColors = ['#7c3aed','#4f46e5','#a855f7','#6366f1','#8b5cf6','#7c3aed'];
  const materials = [];
  for (let i = 0; i < 6; i++) {
    const c = document.createElement('canvas');
    c.width = 512; c.height = 512;
    const ctx = c.getContext('2d');
    const g = ctx.createLinearGradient(0,0,512,512);
    g.addColorStop(0, faceColors[i]);
    g.addColorStop(1, '#4f46e5');
    ctx.fillStyle = g; ctx.fillRect(0,0,512,512);
    ctx.fillStyle = '#fff';
    ctx.shadowColor = 'rgba(0,0,0,.4)'; ctx.shadowBlur = 14;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    if (i === 0 || i === 1) {
      ctx.font = 'bold 84px "Noto Sans JP",Arial';
      ctx.fillText('宅建', 256, 200);
      ctx.fillText('BOOST', 256, 290);
      ctx.shadowBlur = 0;
      ctx.font = 'bold 28px "Noto Sans JP",Arial';
      ctx.fillStyle = '#fde047';
      ctx.fillText('v10', 256, 360);
    } else if (i === 2 || i === 3) {
      ctx.font = 'bold 140px "Noto Sans JP",Arial';
      ctx.fillText(i === 2 ? '宅' : '建', 256, 256);
    } else {
      ctx.font = 'bold 64px Arial';
      ctx.fillText('TAKKEN', 256, 220);
      ctx.fillText('BOOST', 256, 295);
      ctx.shadowBlur = 0;
      ctx.font = 'bold 26px Arial';
      ctx.fillStyle = '#fde047';
      ctx.fillText('合格への道', 256, 360);
    }
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(255,255,255,.35)';
    ctx.lineWidth = 5; ctx.strokeRect(20, 20, 472, 472);
    const tex = new THREE.CanvasTexture(c);
    materials.push(new THREE.MeshPhongMaterial({map:tex, specular:0x444444, shininess:120}));
  }

  const cube = new THREE.Mesh(new THREE.BoxGeometry(2,2,2), materials);
  scene.add(cube);

  // Glow
  const glow = new THREE.Mesh(
    new THREE.BoxGeometry(2.15, 2.15, 2.15),
    new THREE.MeshBasicMaterial({color:0xa855f7, transparent:true, opacity:.12, side:THREE.BackSide})
  );
  cube.add(glow);

  // Lights
  scene.add(new THREE.AmbientLight(0xffffff, .65));
  const dl = new THREE.DirectionalLight(0xffffff, .85);
  dl.position.set(5,5,5); scene.add(dl);
  const pl1 = new THREE.PointLight(0x7c3aed, .6); pl1.position.set(-5,5,5); scene.add(pl1);
  const pl2 = new THREE.PointLight(0xa855f7, .6); pl2.position.set(5,-5,5); scene.add(pl2);

  let isRotating = true, mx = 0, my = 0, rafId = null;

  container.addEventListener('mousemove', (e) => {
    const rect = container.getBoundingClientRect();
    mx = ((e.clientX - rect.left)/rect.width)*2 - 1;
    my = -((e.clientY - rect.top)/rect.height)*2 + 1;
  });
  container.addEventListener('click', () => {
    isRotating = !isRotating;
    if (typeof anime !== 'undefined') {
      anime({targets: cube.scale, x:[1,1.2,1], y:[1,1.2,1], z:[1,1.2,1], duration:600, easing:'easeOutElastic(1,.5)'});
    }
  });

  function animate() {
    rafId = requestAnimationFrame(animate);
    if (isRotating) { cube.rotation.x += .005; cube.rotation.y += .01; }
    cube.rotation.x += (my*.5 - cube.rotation.x)*.05;
    cube.rotation.y += (mx*.5 - cube.rotation.y)*.05;
    cube.position.y = Math.sin(Date.now()*.001)*.1;
    renderer.render(scene, camera);
  }
  animate();

  _cube3D = {
    dispose() {
      if (rafId) cancelAnimationFrame(rafId);
      renderer.dispose();
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
    }
  };
}

function createHeroParticles() {
  const container = document.getElementById('hero-particles');
  if (!container) return;
  container.innerHTML = '';
  for (let i = 0; i < 14; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random()*8 + 4;
    p.style.width = size+'px';
    p.style.height = size+'px';
    p.style.left = (Math.random()*100)+'%';
    p.style.bottom = '-10px';
    p.style.setProperty('--drift', (Math.random()*60-30)+'px');
    p.style.animation = \`particleFloat \${5+Math.random()*5}s linear \${Math.random()*5}s infinite\`;
    container.appendChild(p);
  }
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  initDarkMode();
  nav('home');
});
</script>
</body>
</html>`;

export default app

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { secureHeaders } from 'hono/secure-headers'
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

// Security headers (CSP, X-Frame-Options, etc.) — Cloudflare無料枠で動作
app.use('*', secureHeaders({
  contentSecurityPolicy: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
    styleSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net', 'https://fonts.googleapis.com'],
    fontSrc: ["'self'", 'https://fonts.gstatic.com', 'https://cdn.jsdelivr.net'],
    imgSrc: ["'self'", 'data:', 'blob:'],
    connectSrc: ["'self'"],
    workerSrc: ["'self'", 'blob:'],
    objectSrc: ["'none'"],
    frameAncestors: ["'none'"],
  },
  xFrameOptions: 'DENY',
  xContentTypeOptions: 'nosniff',
  referrerPolicy: 'strict-origin-when-cross-origin',
}))

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
    return c.json({ success: true, total: 702, bySubject: [], byYear: [] })
  }
})

// 過去問年度別取得API
app.get('/api/past-exam/:year', async (c) => {
  try {
    const yearParam = c.req.param('year')
    const year = parseInt(yearParam)
    // Validation
    if (!Number.isInteger(year) || year < 2000 || year > 2099) {
      return c.json({ success: false, error: 'Invalid year. Must be 2000-2099.' }, 400)
    }
    if (!c.env?.DB) return c.json({ success: false, error: 'DB not bound' }, 500)
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
const CACHE_NAME = 'takken-boost-v14';
const STATIC_CACHE = 'takken-boost-static-v14';
const CDN_CACHE = 'takken-boost-cdn-v14';

const STATIC_ASSETS = [
  '/',
  '/manifest.json',
];

const CDN_ASSETS = [
  'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js',
];

self.addEventListener('install', (e) => {
  e.waitUntil(Promise.all([
    caches.open(STATIC_CACHE).then(cache => cache.addAll(STATIC_ASSETS)),
    // Precache CDN scripts for offline reliability
    caches.open(CDN_CACHE).then(cache =>
      Promise.all(CDN_ASSETS.map(url =>
        fetch(url, {mode: 'cors', credentials: 'omit'})
          .then(r => r.ok ? cache.put(url, r) : null)
          .catch(() => null)
      ))
    )
  ]));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(names =>
      Promise.all(names
        .filter(n => n !== CACHE_NAME && n !== STATIC_CACHE && n !== CDN_CACHE)
        .map(n => caches.delete(n))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // CDN scripts - cache first (precached at install)
  if (url.hostname === 'cdn.jsdelivr.net') {
    e.respondWith(
      caches.match(e.request).then(cached => cached || fetch(e.request).then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CDN_CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => caches.match(e.request)))
    );
    return;
  }

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
<meta name="description" content="宅地建物取引士試験合格に特化したPWA学習アプリ。702問完全収録（過去5年本試験モデル+令和8年AI予測模試）・AI弱点分析・模擬試験。">
<!-- OpenGraph -->
<meta property="og:type" content="website">
<meta property="og:title" content="宅建BOOST - 宅建試験合格アプリ">
<meta property="og:description" content="702問完全収録。過去5年本試験モデル+令和8年AI予測模試。詳細な法令解説で次回の正答率UP。完全無料・登録不要。">
<meta property="og:image" content="https://takken-boost.pages.dev/icons/icon-512x512.png">
<meta property="og:url" content="https://takken-boost.pages.dev/">
<meta property="og:site_name" content="宅建BOOST">
<meta property="og:locale" content="ja_JP">
<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="宅建BOOST - 宅建試験合格アプリ">
<meta name="twitter:description" content="702問完全収録の宅建試験対策PWA。AI予測模試+詳細法令解説。">
<meta name="twitter:image" content="https://takken-boost.pages.dev/icons/icon-512x512.png">
<!-- JSON-LD: LearningResource -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "LearningResource",
  "name": "宅建BOOST",
  "description": "宅地建物取引士試験合格をサポートするPWA学習アプリ。702問・詳細法令解説・AI予測模試付き。",
  "url": "https://takken-boost.pages.dev/",
  "inLanguage": "ja-JP",
  "learningResourceType": "Practice Quiz",
  "educationalLevel": "Professional Certification",
  "audience": {
    "@type": "EducationalAudience",
    "educationalRole": "宅地建物取引士試験受験者"
  },
  "teaches": "宅地建物取引業法・民法・借地借家法・区分所有法・不動産登記法・都市計画法・建築基準法・税法",
  "isAccessibleForFree": true
}
</script>
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
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"
        integrity="sha384-e6nUZLBkQ86NJ6TVVKAeSaK8jWa3NhkYWZFomE39AvDbQWeie9PlQqM3pmYW5d1g"
        crossorigin="anonymous"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js"
        integrity="sha384-qOkzR5Ke/XkQxuGVJ9hpFEpDlcoLtWwVYhnJf06cLIZa2vaIptSqaubivErzmD5O"
        crossorigin="anonymous"></script>
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

/* ===== 3D CUBE MONUMENT (brand identity hero) ===== */
.cube-hero{
  position:relative;width:100%;height:260px;
  display:flex;align-items:center;justify-content:center;
  margin-bottom:8px;cursor:pointer;
  background:
    radial-gradient(ellipse at center,rgba(168,85,247,.18) 0%,transparent 60%);
}
#logo-3d-container{
  width:220px;height:220px;position:relative;z-index:3;
  filter:drop-shadow(0 16px 48px rgba(124,58,237,.55));
}
.cube-glow{
  position:absolute;width:320px;height:320px;border-radius:50%;
  background:radial-gradient(circle,rgba(168,85,247,.45) 0%,rgba(124,58,237,.2) 40%,transparent 70%);
  z-index:1;pointer-events:none;
  animation:cubeGlowPulse 3s ease-in-out infinite;
}
.cube-hero::before,.cube-hero::after{
  content:'';position:absolute;border-radius:50%;
  border:1px dashed rgba(168,85,247,.3);
  z-index:2;pointer-events:none;
}
.cube-hero::before{
  width:240px;height:240px;
  animation:cubeRingSpin 30s linear infinite;
}
.cube-hero::after{
  width:280px;height:280px;border-style:dotted;border-color:rgba(124,58,237,.25);
  animation:cubeRingSpin 45s linear infinite reverse;
}
@keyframes cubeGlowPulse{
  0%,100%{transform:scale(1);opacity:.7}
  50%{transform:scale(1.1);opacity:1}
}
@keyframes cubeRingSpin{to{transform:rotate(360deg)}}

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

/* ===== REDUCED MOTION ===== */
@media(prefers-reduced-motion:reduce){
  *,*::before,*::after{
    animation-duration:0.01ms!important;
    animation-iteration-count:1!important;
    transition-duration:0.01ms!important;
  }
  .cube-glow{animation:none!important}
  .particle{display:none!important}
  .answer-flash{display:none!important}
}

/* ===== BOTTOM NAV LABELS (readability) ===== */
.nav-item{font-size:11px;padding-bottom:6px}
.nav-item i{font-size:22px;margin-bottom:2px}

/* ===== ONBOARDING ===== */
#onboarding{
  position:fixed;inset:0;z-index:500;background:rgba(15,23,42,.92);
  display:none;align-items:center;justify-content:center;padding:20px;
  backdrop-filter:blur(8px);
}
#onboarding.show{display:flex;animation:fadeIn .3s ease}
.onb-card{
  background:var(--card);border-radius:24px;max-width:420px;width:100%;
  padding:32px 24px;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.4);
}
.onb-step{display:none}
.onb-step.active{display:block;animation:fadeIn .25s ease}
.onb-icon{
  width:80px;height:80px;border-radius:50%;background:var(--grad);
  color:#fff;display:flex;align-items:center;justify-content:center;
  font-size:36px;margin:0 auto 16px;
  box-shadow:0 8px 24px rgba(124,58,237,.4);
}
.onb-title{font-size:20px;font-weight:900;margin-bottom:12px;color:var(--text)}
.onb-body{font-size:14px;line-height:1.7;color:var(--sub);margin-bottom:20px}
.onb-dots{display:flex;justify-content:center;gap:8px;margin-bottom:20px}
.onb-dot{
  width:8px;height:8px;border-radius:50%;background:var(--border);
  transition:.2s;
}
.onb-dot.active{background:var(--c1);width:24px;border-radius:4px}
.onb-actions{display:flex;gap:12px}

/* ===== iOS INSTALL GUIDE ===== */
.ios-step{
  display:flex;gap:12px;padding:12px;background:rgba(124,58,237,.08);
  border-radius:12px;margin-bottom:10px;align-items:center;
}
.ios-step-num{
  width:28px;height:28px;border-radius:50%;background:var(--c1);
  color:#fff;display:flex;align-items:center;justify-content:center;
  font-weight:700;font-size:13px;flex-shrink:0;
}
.ios-step-text{font-size:13px;line-height:1.5}

/* ===== CUBE CLICK SCALE (anime.js replacement) ===== */
#logo-3d-container{transition:transform .4s cubic-bezier(0.34,1.56,0.64,1)}
#logo-3d-container.bump{transform:scale(1.15)}

/* ===== WEAK SUBJECT RECOMMENDATION ===== */
.weak-card{
  background:linear-gradient(135deg,#ede9fe,#ddd6fe);
  border-radius:16px;padding:16px;margin-bottom:16px;
  border-left:4px solid var(--c1);
}
body.dark .weak-card{
  background:linear-gradient(135deg,#3b0764,#4c1d95);
  border-left-color:#c4b5fd;color:#ddd6fe;
}
.weak-title{font-weight:800;font-size:15px;margin-bottom:6px;display:flex;align-items:center;gap:8px}
.weak-body{font-size:13px;line-height:1.6;margin-bottom:10px}

/* ===== WRONG ANSWER LINK IN RESULT ===== */
.wrong-item{
  display:flex;align-items:center;gap:12px;padding:10px 12px;
  background:rgba(239,68,68,.08);border-radius:10px;margin-bottom:6px;
  cursor:pointer;transition:.15s;border:1px solid transparent;
}
.wrong-item:active{transform:scale(.99);border-color:var(--danger)}
body.dark .wrong-item{background:rgba(239,68,68,.15)}

/* ===== READABILITY ===== */
.stat-label{font-size:12px}
.hero-stat-label{font-size:11px}

/* ===== EXP ACTION BAR (TTS/Bookmark/Copy) ===== */
.exp-actions{
  display:flex;gap:8px;padding:10px 16px;background:#ecfdf5;
  border-top:1px solid #86efac;
}
.exp-card.wrong .exp-actions{background:#fff7ed;border-top-color:#fed7aa}
body.dark .exp-actions{background:#0f2720;border-top-color:#334155}
body.dark .exp-card.wrong .exp-actions{background:#2c0a0a}
.exp-action-btn{
  flex:1;display:flex;align-items:center;justify-content:center;gap:6px;
  padding:8px;border-radius:8px;background:rgba(255,255,255,.6);
  border:1px solid var(--border);font-size:12px;font-weight:600;
  color:var(--text);cursor:pointer;transition:.15s;
}
.exp-action-btn:active{transform:scale(.96)}
.exp-action-btn.active{background:var(--c1);color:#fff;border-color:var(--c1)}
body.dark .exp-action-btn{background:rgba(0,0,0,.3);color:#f1f5f9}

/* ===== DAILY MISSION CARD ===== */
.mission-card{
  background:linear-gradient(135deg,#ede9fe,#ddd6fe);
  border-radius:16px;padding:14px 16px;margin-bottom:14px;
  display:flex;align-items:center;gap:12px;cursor:pointer;
  border:2px solid transparent;transition:.2s;
}
.mission-card:active{transform:scale(.99);border-color:var(--c1)}
body.dark .mission-card{
  background:linear-gradient(135deg,#3b0764,#4c1d95);color:#ddd6fe;
}
.mission-icon{
  width:48px;height:48px;border-radius:14px;
  background:var(--grad);color:#fff;
  display:flex;align-items:center;justify-content:center;
  font-size:22px;flex-shrink:0;box-shadow:0 4px 12px rgba(124,58,237,.3);
}
.mission-title{font-weight:800;font-size:14px;margin-bottom:2px;color:var(--c1)}
body.dark .mission-title{color:#c4b5fd}
.mission-desc{font-size:12px;color:var(--sub);line-height:1.4}
body.dark .mission-desc{color:#a78bfa}
.mission-progress{
  margin-top:6px;height:5px;background:rgba(255,255,255,.5);
  border-radius:3px;overflow:hidden;
}
.mission-progress-fill{height:100%;background:var(--c1);border-radius:3px;transition:width .6s}

/* ===== CONFETTI (CSS-only, no library) ===== */
.confetti-container{
  position:fixed;inset:0;pointer-events:none;z-index:600;overflow:hidden;
}
.confetti{
  position:absolute;width:10px;height:10px;top:-20px;
  animation:confettiFall linear forwards;
}
@keyframes confettiFall{
  0%{transform:translateY(-20px) rotate(0deg);opacity:1}
  100%{transform:translateY(110vh) rotate(720deg);opacity:0}
}

/* ===== NEXT ACTION CARD (result page) ===== */
.next-action{
  background:var(--card);border:2px solid var(--c1);
  border-radius:16px;padding:16px;margin-bottom:16px;
  display:flex;align-items:center;gap:14px;
}
.next-action-icon{
  width:48px;height:48px;border-radius:14px;background:var(--grad);
  color:#fff;display:flex;align-items:center;justify-content:center;
  font-size:22px;flex-shrink:0;
}
.next-action-body{flex:1;font-size:13px;line-height:1.5}
.next-action-title{font-weight:800;font-size:15px;margin-bottom:4px;color:var(--c1)}

/* ===== CHART LEGEND (progress page) ===== */
.chart-legend{
  background:rgba(124,58,237,.06);border-radius:12px;
  padding:10px 14px;margin-bottom:14px;font-size:12px;line-height:1.6;
  color:var(--sub);
}
body.dark .chart-legend{background:rgba(168,85,247,.12);color:#c4b5fd}
.chart-legend strong{color:var(--c1)}
body.dark .chart-legend strong{color:#c4b5fd}

/* ===== SKELETON LOADER ===== */
.skeleton{
  background:linear-gradient(90deg,var(--border) 0%,#f1f5f9 50%,var(--border) 100%);
  background-size:200% 100%;animation:skel 1.5s infinite;
  border-radius:8px;
}
body.dark .skeleton{
  background:linear-gradient(90deg,#334155 0%,#475569 50%,#334155 100%);
}
@keyframes skel{0%{background-position:200% 0}100%{background-position:-200% 0}}

/* ===== LOGO SUBTITLE 12px ===== */
.logo span{font-size:12px;opacity:.8;margin-left:6px;font-weight:500}

/* ===== QUICK START BUTTONS ===== */
.quick-row{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px}
.quick-btn{
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  gap:8px;padding:22px 12px;border-radius:20px;border:none;cursor:pointer;
  font-family:inherit;font-weight:800;font-size:15px;
  transition:.2s;touch-action:manipulation;
}
.quick-btn:active{transform:scale(.96)}
.quick-btn i{font-size:28px}
.quick-primary{
  background:linear-gradient(135deg,#7c3aed 0%,#4f46e5 100%);color:#fff;
  box-shadow:0 8px 24px rgba(124,58,237,.4),inset 0 1px 0 rgba(255,255,255,.2);
}
.quick-secondary{
  background:#fff;color:#7c3aed;
  box-shadow:0 4px 16px rgba(0,0,0,.1);
  border:2px solid rgba(124,58,237,.2);
}
body.dark .quick-secondary{background:#1e293b;color:#a78bfa;border-color:rgba(168,139,250,.3)}

/* ===== HERO COMPACT ON SCROLL ===== */
.cube-hero{transition:height .3s ease,margin .3s ease}
.cube-hero.compact{height:80px!important;margin-bottom:0!important}
.cube-hero.compact #logo-3d-container{width:72px!important;height:72px!important}
.cube-hero.compact .cube-glow{width:120px!important;height:120px!important}

/* ===== FONT SIZE CONTROLS ===== */
html[data-font="sm"]{font-size:14px}
html[data-font="md"]{font-size:16px}
html[data-font="lg"]{font-size:18px}
html[data-font="xl"]{font-size:20px}
.font-controls{display:flex;gap:4px;align-items:center;padding:0 4px}
.font-controls button{
  width:28px;height:28px;border-radius:50%;border:none;
  background:rgba(255,255,255,.15);color:#fff;
  display:flex;align-items:center;justify-content:center;
  cursor:pointer;font-size:13px;font-weight:700;
}
.font-controls button:active{transform:scale(.92)}
.font-controls .fc-current{
  background:rgba(255,255,255,.3);padding:0 6px;border-radius:12px;
  font-size:11px;color:#fff;
}

/* ===== TTS SPEED CONTROL ===== */
.tts-speed{
  display:flex;gap:4px;margin-top:6px;flex-wrap:wrap;
}
.tts-speed-btn{
  padding:4px 8px;border-radius:50px;border:1px solid var(--border);
  background:var(--card);font-size:11px;font-weight:600;
  cursor:pointer;color:var(--text);
}
.tts-speed-btn.active{background:var(--c1);color:#fff;border-color:var(--c1)}

/* ===== SPACED REPETITION SCHEDULE ===== */
.sr-schedule{
  display:grid;grid-template-columns:repeat(5,1fr);gap:8px;
  margin-bottom:16px;
}
.sr-day{
  background:var(--card);border-radius:12px;padding:10px 6px;
  text-align:center;border:2px solid var(--border);
}
.sr-day.due{border-color:#dc2626;background:rgba(220,38,38,.05)}
.sr-day.today{border-color:var(--c1);background:rgba(124,58,237,.08)}
.sr-day-label{font-size:10px;color:var(--sub);font-weight:600}
.sr-day-count{font-size:20px;font-weight:900;color:var(--c1);line-height:1.2;margin:3px 0}
.sr-day.due .sr-day-count{color:#dc2626}
.sr-day-unit{font-size:10px;color:var(--sub)}

/* ===== STREAK WARNING TOAST ===== */
.streak-warning{
  background:linear-gradient(135deg,#f59e0b,#dc2626);color:#fff;
  border-radius:14px;padding:12px 14px;margin-bottom:14px;
  display:flex;align-items:center;gap:10px;
}
.streak-warning i{font-size:22px;animation:pulse 1.5s infinite}

/* ===== LP (Landing Page) — PDF design match ===== */
body.lp-mode{background:#0a0e27;color:#e0e7ff}
body.lp-mode #app-header{background:rgba(10,14,39,.85);backdrop-filter:blur(12px);border-bottom:1px solid rgba(96,165,250,.2)}
body.lp-mode #bottom-nav{background:rgba(10,14,39,.95);backdrop-filter:blur(12px);border-top:1px solid rgba(96,165,250,.2)}
body.lp-mode .nav-item{color:#94a3b8}
body.lp-mode .nav-item.active{color:#60a5fa}
body.lp-mode .nav-pill{background:#60a5fa}

.lp-container{
  margin:-16px;padding:0;color:#e0e7ff;
  background:
    radial-gradient(ellipse at top,rgba(59,130,246,.15) 0%,transparent 50%),
    radial-gradient(ellipse at bottom right,rgba(124,58,237,.2) 0%,transparent 60%),
    linear-gradient(180deg,#0a0e27 0%,#1e1b4b 50%,#0a0e27 100%);
  min-height:100vh;
  position:relative;overflow:hidden;
}
/* Circuit / starfield background */
.lp-stars{
  position:absolute;inset:0;pointer-events:none;
  background-image:
    radial-gradient(1px 1px at 20% 30%,#60a5fa 0%,transparent 100%),
    radial-gradient(1px 1px at 60% 70%,#a78bfa 0%,transparent 100%),
    radial-gradient(2px 2px at 80% 15%,#22d3ee 0%,transparent 100%),
    radial-gradient(1px 1px at 30% 80%,#60a5fa 0%,transparent 100%),
    radial-gradient(1px 1px at 90% 50%,#c4b5fd 0%,transparent 100%),
    radial-gradient(1px 1px at 10% 60%,#67e8f9 0%,transparent 100%);
  background-size:200px 200px,300px 300px,250px 250px,400px 400px,350px 350px,180px 180px;
  background-repeat:repeat;
  opacity:.6;
  animation:starsDrift 60s linear infinite;
}
@keyframes starsDrift{0%{background-position:0 0,0 0,0 0,0 0,0 0,0 0}100%{background-position:200px 200px,-300px -300px,250px -250px,-400px 400px,350px -350px,-180px 180px}}

.lp-section{position:relative;padding:0 20px;z-index:2}

/* HERO */
.lp-hero{padding:60px 20px 50px;text-align:left;position:relative;z-index:2}
.lp-eyebrow{
  display:inline-block;font-size:11px;letter-spacing:3px;font-weight:600;
  color:#60a5fa;text-transform:uppercase;margin-bottom:12px;
  border:1px solid rgba(96,165,250,.3);padding:4px 12px;border-radius:50px;
  background:rgba(59,130,246,.08);
}
.lp-headline{
  font-size:34px;font-weight:900;line-height:1.25;margin-bottom:16px;
  color:#fff;letter-spacing:-1px;
}
.lp-headline em{font-style:normal;color:#22d3ee;text-shadow:0 0 24px rgba(34,211,238,.5)}
.lp-sub{font-size:14px;line-height:1.7;color:#cbd5e1;margin-bottom:24px;max-width:90%}
.lp-badges{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:24px}
.lp-badge{
  background:linear-gradient(135deg,rgba(96,165,250,.15),rgba(167,139,250,.15));
  border:1px solid rgba(96,165,250,.3);
  padding:6px 12px;border-radius:50px;
  font-size:11px;font-weight:700;color:#bfdbfe;
  backdrop-filter:blur(8px);
}
.lp-cta{
  display:inline-flex;align-items:center;gap:10px;
  background:linear-gradient(135deg,#22d3ee,#60a5fa);
  color:#0a0e27;padding:16px 32px;
  border-radius:50px;font-weight:900;font-size:15px;text-decoration:none;
  box-shadow:0 8px 32px rgba(34,211,238,.4),inset 0 1px 0 rgba(255,255,255,.3);
  transition:.2s;border:none;cursor:pointer;
}
.lp-cta:active{transform:scale(.97);box-shadow:0 4px 16px rgba(34,211,238,.4)}
.lp-cta-secondary{
  display:inline-flex;align-items:center;gap:8px;
  background:transparent;color:#60a5fa;padding:14px 28px;
  border-radius:50px;font-weight:700;font-size:13px;text-decoration:none;
  border:1px solid rgba(96,165,250,.4);cursor:pointer;margin-left:10px;
}

/* Device mockup hero */
.lp-devices{
  position:relative;height:280px;margin:30px 0 10px;
  display:flex;align-items:center;justify-content:center;
}
.device{
  position:absolute;border-radius:18px;
  background:linear-gradient(135deg,#1e293b,#0f172a);
  box-shadow:0 20px 60px rgba(0,0,0,.6),inset 0 1px 0 rgba(255,255,255,.1);
  overflow:hidden;border:2px solid rgba(96,165,250,.2);
}
.device-screen{
  background:linear-gradient(160deg,#1e1b4b,#312e81 60%,#0a0e27);
  width:100%;height:100%;padding:8px;
  display:flex;flex-direction:column;
}
.device-phone{
  width:90px;height:180px;left:50%;margin-left:-115px;top:30px;z-index:2;
  transform:rotate(-8deg);
}
.device-tablet{
  width:130px;height:170px;left:50%;margin-left:-65px;top:55px;z-index:3;
}
.device-laptop{
  width:180px;height:130px;left:50%;margin-left:25px;top:90px;z-index:1;
  transform:rotate(6deg);
}
.mini-ring{
  width:38px;height:38px;border-radius:50%;border:3px solid #22d3ee;
  margin:8px auto;display:flex;align-items:center;justify-content:center;
  font-size:9px;font-weight:900;color:#22d3ee;
}
.mini-bar{height:3px;background:#60a5fa;border-radius:2px;margin:2px 0;opacity:.5}
.mini-bar.full{width:100%}.mini-bar.s60{width:60%}.mini-bar.s80{width:80%}.mini-bar.s40{width:40%}
.lp-house-glow{
  position:absolute;width:120px;height:120px;left:50%;top:50%;
  transform:translate(-50%,-50%);z-index:0;
  background:radial-gradient(circle,rgba(34,211,238,.3) 0%,transparent 70%);
  animation:cubeGlowPulse 3s infinite;
}

/* SECTION TITLE */
.lp-section-title{
  font-size:26px;font-weight:900;text-align:center;
  margin:50px 0 6px;color:#fff;letter-spacing:-.5px;
}
.lp-section-title em{font-style:normal;color:#22d3ee}
.lp-section-sub{
  text-align:center;color:#94a3b8;font-size:13px;margin-bottom:28px;line-height:1.6;
}

/* FEATURES GRID */
.lp-features{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:30px}
@media(min-width:600px){.lp-features{grid-template-columns:repeat(4,1fr)}}
.lp-feature{
  background:rgba(15,23,42,.5);border-radius:16px;padding:18px 12px;
  text-align:center;
  border:1px solid rgba(96,165,250,.2);
  backdrop-filter:blur(12px);
  transition:.25s;position:relative;overflow:hidden;
}
.lp-feature::before{
  content:'';position:absolute;inset:0;
  background:linear-gradient(135deg,rgba(96,165,250,.1),transparent);
  opacity:0;transition:.25s;
}
.lp-feature:hover{border-color:#22d3ee;transform:translateY(-3px);box-shadow:0 12px 32px rgba(34,211,238,.15)}
.lp-feature:hover::before{opacity:1}
.lp-feature-icon{
  font-size:28px;margin-bottom:8px;display:block;position:relative;
  filter:drop-shadow(0 0 8px rgba(96,165,250,.5));
}
.lp-feature-title{font-weight:800;font-size:13px;margin-bottom:4px;color:#fff;position:relative}
.lp-feature-desc{font-size:11px;color:#94a3b8;line-height:1.5;position:relative}

/* AI ORBIT (PDF page 3 concept) */
.lp-ai-orbit{
  position:relative;width:280px;height:280px;margin:30px auto;
}
.lp-ai-center{
  position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);
  width:100px;height:100px;border-radius:50%;
  background:radial-gradient(circle,#22d3ee 0%,#3b82f6 50%,#1e3a8a 100%);
  display:flex;align-items:center;justify-content:center;
  font-size:36px;font-weight:900;color:#fff;
  box-shadow:0 0 60px rgba(34,211,238,.6),inset 0 -8px 16px rgba(0,0,0,.3);
  z-index:2;
}
.lp-ai-orbit-ring{
  position:absolute;inset:0;border-radius:50%;
  border:1px dashed rgba(96,165,250,.4);
  animation:orbitSpin 20s linear infinite;
}
@keyframes orbitSpin{to{transform:rotate(360deg)}}
.lp-orbit-item{
  position:absolute;background:rgba(15,23,42,.8);
  border:1px solid rgba(96,165,250,.4);border-radius:50px;
  padding:6px 12px;font-size:11px;font-weight:700;color:#bfdbfe;
  backdrop-filter:blur(8px);
  box-shadow:0 4px 16px rgba(0,0,0,.4);
}
.lp-orbit-item:nth-child(2){top:0;left:50%;transform:translateX(-50%)}
.lp-orbit-item:nth-child(3){right:0;top:50%;transform:translateY(-50%)}
.lp-orbit-item:nth-child(4){bottom:0;left:50%;transform:translateX(-50%)}
.lp-orbit-item:nth-child(5){left:0;top:50%;transform:translateY(-50%)}

/* COMPARE */
.lp-compare{
  background:rgba(15,23,42,.6);border-radius:20px;overflow:hidden;
  margin-bottom:30px;border:1px solid rgba(96,165,250,.2);
  backdrop-filter:blur(12px);
}
.lp-compare-row{
  display:grid;grid-template-columns:1fr 30px 1fr;gap:10px;
  padding:14px 16px;border-bottom:1px solid rgba(96,165,250,.1);
  align-items:center;font-size:12px;
}
.lp-compare-row:last-child{border-bottom:none}
.lp-compare-header{
  background:linear-gradient(90deg,rgba(96,165,250,.1),rgba(167,139,250,.1));
  font-weight:800;font-size:11px;letter-spacing:1px;
}
.lp-compare-header .lp-old{color:#94a3b8}
.lp-compare-header .lp-new{color:#22d3ee}
.lp-old{color:#64748b;text-align:right;font-size:11px}
.lp-new{color:#e0e7ff;font-weight:600;font-size:12px}
.lp-arrow{color:#22d3ee;font-weight:900;text-align:center}

/* STEPS */
.lp-step{
  background:rgba(15,23,42,.6);border-radius:18px;padding:20px 18px;
  margin-bottom:14px;display:flex;gap:16px;align-items:flex-start;
  border:1px solid rgba(96,165,250,.2);backdrop-filter:blur(12px);
  position:relative;
}
.lp-step-num{
  width:48px;height:48px;border-radius:50%;
  background:linear-gradient(135deg,#22d3ee,#3b82f6);
  color:#0a0e27;display:flex;align-items:center;justify-content:center;
  font-weight:900;font-size:20px;flex-shrink:0;
  box-shadow:0 6px 20px rgba(34,211,238,.4);
}
.lp-step-title{font-weight:800;font-size:16px;margin-bottom:4px;color:#fff}
.lp-step-desc{font-size:12px;color:#94a3b8;line-height:1.6}

/* OS grid */
.lp-os-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-bottom:28px}
.lp-os{
  background:rgba(15,23,42,.6);border-radius:14px;padding:14px 6px;
  text-align:center;border:1px solid rgba(96,165,250,.2);
  backdrop-filter:blur(12px);
}
.lp-os-icon{font-size:26px;margin-bottom:4px;filter:drop-shadow(0 0 6px rgba(96,165,250,.4))}
.lp-os-name{font-size:10px;font-weight:700;color:#bfdbfe}

/* QR card */
.lp-qr-card{
  background:rgba(15,23,42,.6);border-radius:16px;padding:16px;
  border:1px solid rgba(96,165,250,.2);
  text-align:center;flex:1;backdrop-filter:blur(12px);
}
.lp-qr-label{font-size:10px;color:#94a3b8;margin-bottom:6px;letter-spacing:1px;font-weight:700}
.lp-qr-url{font-family:monospace;font-size:11px;color:#22d3ee;word-break:break-all;font-weight:700}
.lp-qr-card.primary{border-color:#22d3ee;background:rgba(34,211,238,.08)}

/* Final CTA */
.lp-final-cta{
  background:
    linear-gradient(135deg,rgba(34,211,238,.15),rgba(167,139,250,.15)),
    rgba(15,23,42,.8);
  border:1px solid rgba(34,211,238,.4);
  border-radius:24px;padding:32px 24px;text-align:center;
  margin-bottom:30px;backdrop-filter:blur(16px);
  box-shadow:0 16px 48px rgba(34,211,238,.15);
}

/* ===== FLASHCARD FLIP ===== */
.flashcard-container{
  perspective:1000px;width:100%;max-width:500px;margin:0 auto;
  min-height:380px;cursor:pointer;
}
.flashcard{
  position:relative;width:100%;min-height:380px;
  transition:transform .6s cubic-bezier(.4,0,.2,1);
  transform-style:preserve-3d;
}
.flashcard.flipped{transform:rotateY(180deg)}
.flashcard-face{
  position:absolute;inset:0;backface-visibility:hidden;
  -webkit-backface-visibility:hidden;
  border-radius:20px;padding:24px;display:flex;flex-direction:column;
  box-shadow:0 8px 32px rgba(124,58,237,.15);
}
.flashcard-front{
  background:var(--card);border:2px solid var(--c1);
}
.flashcard-back{
  background:var(--grad);color:#fff;transform:rotateY(180deg);
  overflow-y:auto;
}
.flashcard-back .answer-label{
  font-weight:900;font-size:14px;margin-bottom:8px;color:#fde047;
}
.flashcard-hint{
  position:absolute;bottom:12px;left:50%;transform:translateX(-50%);
  font-size:11px;color:var(--sub);
}
.flashcard-back .flashcard-hint{color:rgba(255,255,255,.7)}
.rating-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:14px}
.rating-btn{
  padding:10px;border-radius:10px;border:none;cursor:pointer;
  font-weight:700;font-size:13px;color:#fff;transition:.15s;
}
.rating-btn.hard{background:#dc2626}
.rating-btn.medium{background:#f59e0b}
.rating-btn.easy{background:#10b981}
.rating-btn:active{transform:scale(.96)}

/* ===== MASTERY SCORE ===== */
.mastery-pill{
  display:inline-flex;align-items:center;gap:4px;
  padding:2px 8px;border-radius:50px;font-size:10px;font-weight:700;
}
.mastery-low{background:#fee2e2;color:#991b1b}
.mastery-mid{background:#fef3c7;color:#854d0e}
.mastery-high{background:#d1fae5;color:#065f46}
body.dark .mastery-low{background:#450a0a;color:#fca5a5}
body.dark .mastery-mid{background:#422006;color:#fde68a}
body.dark .mastery-high{background:#052e16;color:#86efac}

/* ===== EXPORT/IMPORT ===== */
.eximp-row{display:flex;gap:8px;margin-top:10px}
.eximp-btn{
  flex:1;padding:10px;border-radius:10px;border:1px solid var(--c1);
  background:transparent;color:var(--c1);font-size:12px;font-weight:700;
  cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;
}
.eximp-btn:active{background:rgba(124,58,237,.1)}

/* ===== PARTIAL RESET ===== */
.reset-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}
.reset-btn-sub{
  padding:10px;border-radius:10px;background:rgba(220,38,38,.08);
  border:1px solid rgba(220,38,38,.3);color:#dc2626;font-size:12px;
  font-weight:600;cursor:pointer;
}
body.dark .reset-btn-sub{background:rgba(220,38,38,.15);color:#fca5a5}
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
      <div class="font-controls">
        <button onclick="adjustFontSize(-1)" title="文字を小さく" aria-label="文字を小さく">A−</button>
        <button onclick="adjustFontSize(1)" title="文字を大きく" aria-label="文字を大きく">A+</button>
      </div>
      <button class="hbtn" onclick="nav('help')" title="使い方ガイド" aria-label="使い方ガイド">
        <i class="fas fa-question-circle"></i>
      </button>
      <button class="hbtn" onclick="toggleDark()" title="ダークモード" id="themeBtn" aria-label="ダークモード切替">
        <i class="fas fa-moon"></i>
      </button>
      <button class="hbtn" onclick="showInstallBanner()" title="インストール" id="installHeaderBtn" aria-label="アプリインストール">
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

<!-- ===== ONBOARDING ===== -->
<div id="onboarding">
  <div class="onb-card">
    <div class="onb-step active" data-step="1">
      <div class="onb-icon">📚</div>
      <div class="onb-title">宅建BOOSTへようこそ</div>
      <div class="onb-body">宅地建物取引士試験合格をサポートする学習アプリ。<br><strong>702問</strong>の練習問題（過去5年本試験モデル+令和8年AI予測模試含む）に詳細な解説付き。スキマ時間で着実に合格力を養成しましょう。</div>
    </div>
    <div class="onb-step" data-step="2">
      <div class="onb-icon">🎯</div>
      <div class="onb-title">2つの学習モード</div>
      <div class="onb-body" style="text-align:left">
        <strong style="color:var(--c1)">📖 カテゴリ別学習</strong><br>
        <span style="font-size:12px">分野ごとに1問ずつ解いて解説を確認。基礎固めに最適。</span><br><br>
        <strong style="color:var(--success)">📝 模擬試験</strong><br>
        <span style="font-size:12px">50問・120分の本番形式。実力測定と時間配分の訓練に。</span>
      </div>
    </div>
    <div class="onb-step" data-step="3">
      <div class="onb-icon">🔥</div>
      <div class="onb-title">間違えても大丈夫</div>
      <div class="onb-body">誤答した問題は<strong>「復習」タブ</strong>に自動保存。詳細な法的根拠付きの解説で「なぜ間違えたか」を理解すれば、次回の正答率が確実に上がります。</div>
    </div>
    <div class="onb-step" data-step="4">
      <div class="onb-icon">🤖</div>
      <div class="onb-title">「AI予測模試」って？</div>
      <div class="onb-body" style="text-align:left">
        過去5年(令和3〜7年)の本試験で頻出した論点と、<strong>最新の法改正</strong>（区分所有法・盛土規制法・省エネ義務化等）を分析したAIが、<strong>令和8年に出題確率の高い50問</strong>を予測したオリジナル問題集です。<br><br>
        <span style="color:var(--sub);font-size:12px">※カンニングではなく、的中率を高めた予想問題です</span>
      </div>
    </div>
    <div class="onb-step" data-step="5">
      <div class="onb-icon">🎓</div>
      <div class="onb-title">「5点免除」って？</div>
      <div class="onb-body" style="text-align:left">
        宅建業に従事している方が「登録講習」を修了すると、本試験で<strong>5問が免除</strong>（45問・90分試験）になる制度です。<br><br>
        例年、合格率が <strong style="color:#f59e0b">約10%以上UP</strong> する強力な特典。詳細はホーム下部「5点免除」セクションでご確認ください。<br><br>
        <span style="color:var(--sub);font-size:12px">※受講対象は宅建業者の従業者のみ</span>
      </div>
    </div>
    <div class="onb-dots">
      <div class="onb-dot active"></div>
      <div class="onb-dot"></div>
      <div class="onb-dot"></div>
      <div class="onb-dot"></div>
      <div class="onb-dot"></div>
    </div>
    <div class="onb-actions">
      <button class="btn btn-outline btn-block" onclick="closeOnboarding()">スキップ</button>
      <button class="btn btn-primary btn-block" id="onb-next" onclick="onbNext()">次へ →</button>
    </div>
  </div>
</div>

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

// localStorage ラッパー (idle writes for non-blocking UI)
const _idleSet = (fn) => {
  if ('requestIdleCallback' in window) requestIdleCallback(fn, {timeout: 1000});
  else setTimeout(fn, 0);
};
const LS = {
  get: (k, def) => { try { return JSON.parse(localStorage.getItem(k)) ?? def } catch { return def } },
  set: (k, v) => { _idleSet(() => { try { localStorage.setItem(k, JSON.stringify(v)) } catch {} }); },
  setSync: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch {} },
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

  // Exit LP mode when navigating away from LP
  if (page !== 'lp') document.body.classList.remove('lp-mode');

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
    help: renderHelp, lp: renderLP, flashcard: renderFlashcard,
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
      S.stats = { total: 702, bySubject: [], byYear: [] };
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
<!-- ===== 3D CUBE MONUMENT (brand hero) ===== -->
<div class="cube-hero fade-in-up" style="margin-bottom:14px">
  <div class="cube-glow"></div>
  <div id="logo-3d-container"></div>
</div>

<!-- ===== HERO STATS CARD ===== -->
<div class="card-grad fade-in-up fade-delay-1" style="position:relative;overflow:hidden">
  <div class="particle-bg" id="hero-particles"></div>
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;position:relative;z-index:2">
    <div>
      <div style="font-size:12px;opacity:.85;letter-spacing:.5px">宅地建物取引士試験</div>
      <div style="font-size:20px;font-weight:900;margin-top:2px">合格への最速ルート</div>
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

\${(() => {
  // Streak warning: if no study today and streak > 0 and after 21:00
  const hist = LS.get('study_history', []);
  const todayStr = today();
  const studiedToday = hist.some(h => h.date === todayStr);
  const hour = new Date().getHours();
  const streak2 = calcStreak();
  if (!studiedToday && streak2 > 0 && hour >= 21) {
    return \`<div class="streak-warning" onclick="nav('study')">
      <i class="fas fa-fire"></i>
      <div style="flex:1">
        <div style="font-weight:800;font-size:14px">\${streak2}日連続記録が途切れます！</div>
        <div style="font-size:12px;opacity:.9">今日まだ1問も解いていません。1問だけでもOK！</div>
      </div>
      <i class="fas fa-chevron-right"></i>
    </div>\`;
  }
  return '';
})()}

\${(() => {
  const m = getDailyMission();
  if (m.completed) {
    return \`<div class="mission-card" onclick="nav('study')">
      <div class="mission-icon" style="background:linear-gradient(135deg,#10b981,#059669)">🎯</div>
      <div style="flex:1">
        <div class="mission-title">今日のミッション達成！</div>
        <div class="mission-desc">継続が合格への近道。さらに学習を続けますか？</div>
      </div>
      <i class="fas fa-chevron-right" style="color:var(--sub)"></i>
    </div>\`;
  }
  const total = 10 + Math.min(5, m.wrongToReview);
  const done = m.todayCount;
  const pct = Math.min(100, Math.round(done / total * 100));
  return \`<div class="mission-card" onclick="nav('study')">
    <div class="mission-icon">🔥</div>
    <div style="flex:1;min-width:0">
      <div class="mission-title">今日のミッション</div>
      <div class="mission-desc">新規\${m.newGoal}問 + 復習\${m.wrongToReview}問で合格力UP（\${done}/\${total}問）</div>
      <div class="mission-progress"><div class="mission-progress-fill" style="width:\${pct}%"></div></div>
    </div>
    <i class="fas fa-chevron-right" style="color:var(--sub)"></i>
  </div>\`;
})()}

<div class="section-title"><i class="fas fa-bolt"></i>クイックスタート</div>
<div class="quick-row">
  <button class="quick-btn quick-primary" onclick="nav('study')">
    <i class="fas fa-book-open"></i>学習開始
  </button>
  <button class="quick-btn quick-secondary" onclick="startExam()">
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
<div class="feature-card" onclick="nav('past-exam',{year:\${years.filter(y=>y!==2026)[0]||years[0]}})" style="margin-bottom:12px">
  <div class="feature-row">
    <div class="feature-icon" style="background:linear-gradient(135deg,#dc2626,#b91c1c)">
      <i class="fas fa-history"></i>
    </div>
    <div>
      <div class="feature-title">過去問チャレンジ <span class="badge badge-red" style="font-size:10px">5年分</span></div>
      <div class="feature-desc">令和3〜令和7年の本試験モデル問題 250問 — 本番さながらの演習</div>
    </div>
  </div>
</div>
\` : ''}

\${years.includes(2026) ? \`
<div class="feature-card" onclick="nav('past-exam',{year:2026})" style="margin-bottom:12px;border:2px solid var(--c1);background:linear-gradient(135deg,rgba(237,233,254,0.6),rgba(221,214,254,0.4))">
  <div class="feature-row">
    <div class="feature-icon" style="background:var(--grad);position:relative">
      <i class="fas fa-robot"></i>
    </div>
    <div>
      <div class="feature-title">令和8年AI予測模試 <span class="badge badge-purple" style="font-size:10px;background:#fde047;color:#854d0e">NEW</span></div>
      <div class="feature-desc">過去5年トレンド分析+最新法改正で予測した50問 — 来年の本試験対策に</div>
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
    <div class="cat-pill\${y===2026?' style-predicted':''}" onclick="nav('past-exam',{year:\${y}})"
         style="\${y===2026?'background:var(--grad);color:#fff;border-color:var(--c1)':''}">
      \${y===2026 ? '<i class="fas fa-robot" style="margin-right:4px"></i>令和8年AI予測' : '令和'+(y-2018)+'年('+y+')'}
    </div>
  \`).join('')}
</div>
\` : ''}

<div class="section-title" style="margin-top:8px"><i class="fas fa-info-circle"></i>試験情報</div>
<div class="card" style="margin-bottom:12px">
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
    <div><div style="font-size:12px;color:var(--sub)">試験日程</div><div style="font-weight:700">毎年10月第3日曜日</div></div>
    <div><div style="font-size:12px;color:var(--sub)">合格基準点</div><div style="font-weight:700">50問中 36点前後</div></div>
    <div><div style="font-size:12px;color:var(--sub)">合格率</div><div style="font-weight:700">約15〜17%</div></div>
    <div><div style="font-size:12px;color:var(--sub)">試験時間</div><div style="font-weight:700">2時間</div></div>
  </div>
</div>

<!-- ===== 申込スケジュール ===== -->
<div class="card" style="margin-bottom:12px;border-left:4px solid var(--c1)">
  <div class="section-title" style="font-size:15px;margin-bottom:10px"><i class="fas fa-calendar-check"></i>令和8年(2026)受験申込</div>
  <div style="display:flex;flex-direction:column;gap:10px">
    <div style="display:flex;align-items:center;gap:10px;padding:10px;background:rgba(124,58,237,.08);border-radius:10px">
      <i class="fas fa-globe" style="color:var(--c1);font-size:18px;width:24px"></i>
      <div style="flex:1">
        <div style="font-weight:700;font-size:13px">インターネット申込</div>
        <div style="font-size:12px;color:var(--sub)">7月1日(水) 9:30 〜 7月15日(水) 21:59 ※例年同時期</div>
      </div>
    </div>
    <div style="display:flex;align-items:center;gap:10px;padding:10px;background:rgba(124,58,237,.05);border-radius:10px">
      <i class="fas fa-envelope" style="color:var(--c1);font-size:18px;width:24px"></i>
      <div style="flex:1">
        <div style="font-weight:700;font-size:13px">郵送申込</div>
        <div style="font-size:12px;color:var(--sub)">7月1日(水) 〜 7月31日(金) 消印有効 ※例年同時期</div>
      </div>
    </div>
    <div style="display:flex;align-items:center;gap:10px;padding:10px;background:rgba(245,158,11,.1);border-radius:10px">
      <i class="fas fa-flag-checkered" style="color:#f59e0b;font-size:18px;width:24px"></i>
      <div style="flex:1">
        <div style="font-weight:700;font-size:13px">試験日 / 合格発表</div>
        <div style="font-size:12px;color:var(--sub)">試験: 10月18日(日) / 合格発表: 11月25日(水)頃</div>
      </div>
    </div>
  </div>
  <a href="https://www.retio.or.jp/exam/" target="_blank" rel="noopener" style="display:flex;align-items:center;justify-content:center;gap:6px;margin-top:12px;padding:10px;background:var(--c1);color:#fff;border-radius:10px;text-decoration:none;font-weight:700;font-size:13px">
    <i class="fas fa-external-link-alt"></i>不動産適正取引推進機構(RETIO)で詳細確認
  </a>
</div>

<!-- ===== 5点免除（登録講習） ===== -->
<div class="card" style="margin-bottom:12px;border-left:4px solid var(--c1)">
  <div class="section-title" style="font-size:15px;margin-bottom:10px">
    <i class="fas fa-graduation-cap" style="color:var(--c1)"></i>5点免除（登録講習）
    <span class="badge badge-purple" style="font-size:10px;margin-left:6px">合格率UP</span>
  </div>
  <p style="font-size:13px;line-height:1.6;color:var(--sub);margin-bottom:10px">宅建業に従事している方が登録講習を修了すると、本試験で<strong style="color:var(--c1)">5問が免除</strong>（45問試験・90分）になります。例年、合格率が約10%以上UP。</p>
  <div style="display:flex;flex-direction:column;gap:8px">
    <div style="padding:10px;background:rgba(124,58,237,.06);border-radius:10px">
      <div style="font-weight:700;font-size:13px;margin-bottom:2px"><i class="fas fa-id-card" style="color:var(--c1);margin-right:4px"></i>受講対象</div>
      <div style="font-size:12px;color:var(--sub)">宅建業者の従業者（従業者証明書を持つ方）</div>
    </div>
    <div style="padding:10px;background:rgba(124,58,237,.06);border-radius:10px">
      <div style="font-weight:700;font-size:13px;margin-bottom:2px"><i class="fas fa-clock" style="color:var(--c1);margin-right:4px"></i>講習申込時期</div>
      <div style="font-size:12px;color:var(--sub)">通年（各実施機関により異なる）。本試験対策には<strong>1月〜6月頃の修了</strong>がオススメ</div>
    </div>
    <div style="padding:10px;background:rgba(124,58,237,.06);border-radius:10px">
      <div style="font-weight:700;font-size:13px;margin-bottom:2px"><i class="fas fa-calendar" style="color:var(--c1);margin-right:4px"></i>有効期間</div>
      <div style="font-size:12px;color:var(--sub)">講習修了後<strong>3年以内</strong>の試験で適用</div>
    </div>
    <div style="padding:10px;background:rgba(124,58,237,.06);border-radius:10px">
      <div style="font-weight:700;font-size:13px;margin-bottom:2px"><i class="fas fa-yen-sign" style="color:var(--c1);margin-right:4px"></i>受講料 目安</div>
      <div style="font-size:12px;color:var(--sub)">15,000〜22,000円（実施機関により異なる）。通信講座2ヶ月+スクーリング2日が一般的</div>
    </div>
    <div style="padding:10px;background:rgba(124,58,237,.1);border-radius:10px;border:1px dashed var(--c3)">
      <div style="font-weight:700;font-size:13px;margin-bottom:2px;color:var(--c1)"><i class="fas fa-exclamation-circle" style="margin-right:4px"></i>申込時注意</div>
      <div style="font-size:12px;color:var(--sub)">本試験申込時に「登録講習修了者」として申込が必要（試験は45問・問46〜50が免除）</div>
    </div>
  </div>
  <a href="https://www.mlit.go.jp/totikensangyo/const/sosei_const_tk3_000056.html" target="_blank" rel="noopener" style="display:flex;align-items:center;justify-content:center;gap:6px;margin-top:12px;padding:10px;background:var(--grad);color:#fff;border-radius:10px;text-decoration:none;font-weight:700;font-size:13px;box-shadow:0 4px 12px rgba(124,58,237,.25)">
    <i class="fas fa-external-link-alt"></i>国土交通省 登録講習実施機関一覧
  </a>
</div>

<!-- ===== 年間スケジュール ===== -->
<div class="card" style="margin-bottom:12px">
  <div class="section-title" style="font-size:15px;margin-bottom:10px"><i class="fas fa-stream"></i>年間スケジュール</div>
  <div style="position:relative;padding-left:20px">
    <div style="position:absolute;left:7px;top:8px;bottom:8px;width:2px;background:linear-gradient(to bottom,var(--c1),#f59e0b)"></div>
    \${[
      {month:'1〜6月', label:'登録講習受講・修了', color:'#f59e0b', desc:'5点免除を狙うならこの時期に'},
      {month:'7月初〜中旬', label:'受験申込（ネット）', color:'var(--c1)', desc:'7/1〜7/15頃 9:30開始'},
      {month:'7月末', label:'郵送申込締切', color:'var(--c1)', desc:'7/31消印有効'},
      {month:'8〜10月初', label:'直前学習・模擬試験', color:'#10b981', desc:'本アプリで仕上げ'},
      {month:'10月第3日曜', label:'本試験', color:'#dc2626', desc:'13:00〜15:00（2時間）'},
      {month:'11月下旬', label:'合格発表', color:'#3b82f6', desc:'11/25頃'},
    ].map(s => \`
      <div style="display:flex;gap:12px;margin-bottom:12px;align-items:flex-start">
        <div style="width:14px;height:14px;border-radius:50%;background:\${s.color};margin-left:-22px;margin-top:4px;flex-shrink:0;box-shadow:0 0 0 3px var(--card)"></div>
        <div style="flex:1">
          <div style="font-weight:700;font-size:13px"><span style="color:\${s.color}">\${s.month}</span> — \${s.label}</div>
          <div style="font-size:11px;color:var(--sub);margin-top:2px">\${s.desc}</div>
        </div>
      </div>
    \`).join('')}
  </div>
</div>
\`;

  // Initialize 3D cube and particles via ResizeObserver (reliable, no race)
  const container = document.getElementById('logo-3d-container');
  if (container) {
    if ('ResizeObserver' in window) {
      const ro = new ResizeObserver(entries => {
        const e = entries[0];
        if (e && e.contentRect.width > 10) {
          ro.disconnect();
          initCubeLogo();
          createHeroParticles();
        }
      });
      ro.observe(container);
      // Fallback for browsers that fire RO late
      setTimeout(() => { if (!_cube3D) { initCubeLogo(); createHeroParticles(); } }, 200);
    } else {
      setTimeout(() => { initCubeLogo(); createHeroParticles(); }, 30);
    }
  }
}

// ===== STUDY PAGE =====
async function renderStudy() {
  // Ensure stats loaded
  if (!S.stats) {
    try {
      const r = await fetch('/api/stats');
      S.stats = await r.json();
    } catch { S.stats = { total: 702, bySubject: [], byYear: [] }; }
  }
  const subjMap = {};
  (S.stats?.bySubject || []).forEach(r => { subjMap[r.subject] = r.cnt; });
  const cnt = (s) => subjMap[s] || 0;
  const total = S.stats?.total || 702;

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
        <div class="feature-desc">全\${total}問からランダム出題。本番同様の幅広い知識を確認</div>
      </div>
    </div>
  </div>
  <div class="feature-card" onclick="nav('category',{subject:'rights'})">
    <div class="feature-row">
      <div class="feature-icon" style="background:linear-gradient(135deg,#7c3aed,#4f46e5)"><i class="fas fa-balance-scale"></i></div>
      <div>
        <div class="feature-title">権利関係</div>
        <div class="feature-desc">民法・借地借家法・区分所有法・不動産登記法（本試験14問/50問）</div>
        <div class="badge badge-purple" style="margin-top:6px">\${cnt('rights')}問収録</div>
      </div>
    </div>
  </div>
  <div class="feature-card" onclick="nav('category',{subject:'businessLaw'})">
    <div class="feature-row">
      <div class="feature-icon" style="background:linear-gradient(135deg,#059669,#0d9488)"><i class="fas fa-building"></i></div>
      <div>
        <div class="feature-title">宅建業法</div>
        <div class="feature-desc">宅建業の免許・宅建士・重要事項・報酬制限（本試験20問/50問）</div>
        <div class="badge badge-green" style="margin-top:6px">\${cnt('businessLaw')}問収録</div>
      </div>
    </div>
  </div>
  <div class="feature-card" onclick="nav('category',{subject:'restrictions'})">
    <div class="feature-row">
      <div class="feature-icon" style="background:linear-gradient(135deg,#dc2626,#b91c1c)"><i class="fas fa-map-marked-alt"></i></div>
      <div>
        <div class="feature-title">法令上の制限</div>
        <div class="feature-desc">都市計画法・建築基準法・農地法・国土利用計画法（本試験8問/50問）</div>
        <div class="badge badge-red" style="margin-top:6px">\${cnt('restrictions')}問収録</div>
      </div>
    </div>
  </div>
  <div class="feature-card" onclick="nav('category',{subject:'taxOther'})">
    <div class="feature-row">
      <div class="feature-icon" style="background:linear-gradient(135deg,#d97706,#b45309)"><i class="fas fa-yen-sign"></i></div>
      <div>
        <div class="feature-title">税・その他</div>
        <div class="feature-desc">不動産取得税・固定資産税・所得税・鑑定評価（本試験8問/50問）</div>
        <div class="badge badge-yellow" style="margin-top:6px">\${cnt('taxOther')}問収録</div>
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

  // Explanation card with TTS/bookmark/copy
  const expEl = document.getElementById('explanation-area');
  const expText = explanation || '解説は準備中です。';
  const ttsText = \`\${isCorrect ? '正解' : '不正解。正解は選択肢' + correct + '。'} 解説。\${expText}\`.replace(/[\`'"]/g,'').replace(/\\n/g,' ');
  const copyText = \`\${q.question_text}\\n\\n正解: 選択肢\${correct}\\n\\n\${expText}\`.replace(/[\`']/g,'');
  const bookmarked = q?.id ? isBookmarked(q.id) : false;

  expEl.innerHTML = \`<div class="exp-card \${isCorrect?'':'wrong'}">
    <div class="exp-header">
      <div class="exp-header-icon">\${isCorrect ? '🎉' : '📖'}</div>
      <div>
        <div class="exp-header-title">\${isCorrect ? '正解！' : '不正解 — 正解は選択肢 '+correct}</div>
      </div>
    </div>
    <div class="exp-body">\${expText}</div>
    <div class="exp-actions">
      <button class="exp-action-btn" data-tts onclick="speakText(\\\`\${ttsText}\\\`, this)"><i class="fas fa-volume-up"></i>読み上げ</button>
      \${q?.id ? \`<button class="exp-action-btn \${bookmarked?'active':''}" onclick="toggleBookmark('\${q.id}', this)"><i class="fas fa-bookmark"></i>保存</button>\` : ''}
      <button class="exp-action-btn" onclick="copyExplanation(\\\`\${copyText}\\\`)"><i class="fas fa-copy"></i>コピー</button>
    </div>
    <div class="tts-speed">
      \${[0.8,1.0,1.5,2.0].map(r => \`<button class="tts-speed-btn \${getTTSRate()===r?'active':''}" data-rate="\${r}" onclick="setTTSRate(\${r})">\${r}x</button>\`).join('')}
    </div>
  </div>\`;

  // Spaced repetition tracking
  if (q?.id) markReviewed(q.id, isCorrect);

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

  // Fire confetti if passed
  if (score >= 72) setTimeout(fireConfetti, 200);

  // Next action recommendation
  let nextAction = '';
  if (score >= 80) {
    nextAction = \`<div class="next-action">
      <div class="next-action-icon" style="background:linear-gradient(135deg,#10b981,#059669)">🏆</div>
      <div class="next-action-body">
        <div class="next-action-title">合格圏上位！この調子を維持</div>
        <span style="color:var(--sub)">過去問チャレンジで本番形式に慣れていきましょう。</span>
        <button class="btn btn-primary btn-sm" style="margin-top:8px" onclick="nav('past-exam',{year:2024})"><i class="fas fa-history"></i>令和6年過去問</button>
      </div>
    </div>\`;
  } else if (score >= 72) {
    nextAction = \`<div class="next-action">
      <div class="next-action-icon" style="background:linear-gradient(135deg,#059669,#0d9488)">✅</div>
      <div class="next-action-body">
        <div class="next-action-title">合格ライン突破！油断は禁物</div>
        <span style="color:var(--sub)">誤答を1問ずつ確認し、苦手分野を潰しましょう。</span>
        <button class="btn btn-primary btn-sm" style="margin-top:8px" onclick="nav('review')"><i class="fas fa-redo"></i>復習する</button>
      </div>
    </div>\`;
  } else {
    const lowSub = Object.entries(bySubject).sort((a,b) => (a[1].correct/a[1].total) - (b[1].correct/b[1].total))[0];
    const subLabelMap = { rights:'rights', businessLaw:'businessLaw', restrictions:'restrictions', taxOther:'taxOther' };
    nextAction = \`<div class="next-action">
      <div class="next-action-icon" style="background:var(--grad)">📚</div>
      <div class="next-action-body">
        <div class="next-action-title">あと少し！弱点を集中攻略</div>
        <span style="color:var(--sub)">特に「\${subLabel[lowSub[0]]||lowSub[0]}」（\${lowSub[1].correct}/\${lowSub[1].total}）を強化しましょう。</span>
        <button class="btn btn-primary btn-sm" style="margin-top:8px" onclick="nav('category',{subject:'\${subLabelMap[lowSub[0]]||lowSub[0]}'})"><i class="fas fa-play"></i>この分野を学習</button>
      </div>
    </div>\`;
  }

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

\${nextAction}

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
  <div class="section-title" style="font-size:15px"><i class="fas fa-list"></i>問題別結果 <span style="font-size:11px;font-weight:400;color:var(--sub);margin-left:auto">誤答をタップで解説</span></div>
  <div style="max-height:340px;overflow-y:auto">
    \${(results||[]).map((r, i) => \`
      <div class="\${r.isCorrect?'':'wrong-item'}" \${r.isCorrect?'':\`onclick="showExplanationFor(\${i})"\`}
        style="display:flex;align-items:center;gap:12px;padding:10px 8px;\${r.isCorrect?'border-bottom:1px solid var(--border)':''}">
        <div style="width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;
          background:\${r.isCorrect?'var(--success)':'var(--danger)'};color:#fff;font-size:12px;font-weight:700;flex-shrink:0">
          \${i+1}
        </div>
        <div style="flex:1;font-size:13px;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">\${r.question_text?.slice(0,60)||'...'}...</div>
        \${r.isCorrect
          ? '<span class="badge badge-green"><i class="fas fa-check"></i></span>'
          : '<span class="badge badge-red" style="display:flex;align-items:center;gap:4px"><i class="fas fa-book-open"></i>解説</span>'}
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

  const isPredicted = year === 2026;
  const yearBadge = isPredicted
    ? '<span class="badge badge-yellow"><i class="fas fa-robot"></i> 令和8年AI予測</span>'
    : \`<span class="badge badge-red">令和\${year-2018}年(\${year})</span>\`;

  document.getElementById('main').innerHTML = \`
<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
  <button class="back-btn" onclick="nav('home')"><i class="fas fa-chevron-left"></i>戻る</button>
  <div>
    \${yearBadge}
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
  const isPredicted = year === 2026;
  const titleText = isPredicted ? '令和8年AI予測模試' : \`令和\${year-2018}年(\${year}) 過去問\`;

  // Confetti on pass
  if (pass) setTimeout(fireConfetti, 200);

  document.getElementById('main').innerHTML = \`
<div class="card" style="text-align:center;padding:32px">
  <div style="font-size:18px;font-weight:700;margin-bottom:4px">\${titleText}</div>
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

  // Weak subject detection (lowest accuracy among subjects with 3+ attempts)
  const weakSub = Object.entries(bySubject)
    .filter(([s, d]) => d.total >= 3)
    .map(([s, d]) => ({s, acc: d.correct/d.total, total: d.total}))
    .sort((a,b) => a.acc - b.acc)[0];

  const subLabelMap = { rights:'権利関係', businessLaw:'宅建業法', restrictions:'法令制限', taxOther:'税・その他' };
  const subjectAct = { rights:'rights', businessLaw:'businessLaw', restrictions:'restrictions', taxOther:'taxOther' };

  const weakHTML = weakSub && weakSub.acc < 0.7 ? \`
    <div class="weak-card">
      <div class="weak-title"><i class="fas fa-lightbulb"></i>あなたの苦手分野</div>
      <div class="weak-body">「<strong>\${subLabelMap[weakSub.s]||weakSub.s}</strong>」の正答率が \${Math.round(weakSub.acc*100)}%（\${weakSub.total}問中）。集中して取り組めば全体スコアが大きく伸びます。</div>
      <button class="btn btn-primary btn-sm" onclick="nav('category',{subject:'\${subjectAct[weakSub.s]||weakSub.s}'})"><i class="fas fa-play"></i>この分野を学習</button>
    </div>
  \` : '';

  document.getElementById('main').innerHTML = \`
<div class="section-title"><i class="fas fa-chart-line"></i>学習進捗</div>

\${weakHTML}

<div class="chart-legend">
  <strong>📊 レーダーチャートの読み方:</strong> 4分野（権利関係・宅建業法・法令制限・税その他）の正答率を表示。中心(0%)から外側(100%)へ向かうほど高得点。<strong>72%以上</strong>を全分野で目指しましょう。
</div>
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
  <div class="eximp-row">
    <button class="eximp-btn" onclick="exportData()"><i class="fas fa-cloud-upload-alt"></i>エクスポート</button>
    <button class="eximp-btn" onclick="importData()"><i class="fas fa-cloud-download-alt"></i>インポート</button>
  </div>
  <div style="font-size:11px;color:var(--sub);text-align:center;margin-top:6px">他デバイスとの学習データ同期に使用</div>
  <div class="reset-grid" style="margin-top:14px">
    <button class="reset-btn-sub" onclick="resetSubject('rights')">権利関係のみ</button>
    <button class="reset-btn-sub" onclick="resetSubject('businessLaw')">宅建業法のみ</button>
    <button class="reset-btn-sub" onclick="resetSubject('restrictions')">法令制限のみ</button>
    <button class="reset-btn-sub" onclick="resetSubject('taxOther')">税その他のみ</button>
  </div>
  <button class="btn btn-outline btn-sm" style="margin-top:10px" onclick="confirmResetData()">
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

  // Spaced Repetition schedule visualization
  const now = Date.now();
  const intervalsMs = [1, 3, 7, 14].map(d => d*24*60*60*1000);
  const schedule = {today: 0, d1: 0, d3: 0, d7: 0, d14: 0};
  wrong.forEach(w => {
    const lastSeen = w.lastSeen || 0;
    const level = w.srLevel || 0;
    const interval = intervalsMs[Math.min(level, intervalsMs.length-1)] || intervalsMs[0];
    const dueAt = lastSeen + interval;
    const daysUntil = (dueAt - now) / (24*60*60*1000);
    if (daysUntil <= 0) schedule.today++;
    else if (daysUntil <= 1) schedule.d1++;
    else if (daysUntil <= 3) schedule.d3++;
    else if (daysUntil <= 7) schedule.d7++;
    else schedule.d14++;
  });

  document.getElementById('main').innerHTML = \`
<div class="section-title"><i class="fas fa-sync-alt"></i>弱点復習</div>
<p style="font-size:14px;color:var(--sub);margin-bottom:12px">\${wrong.length}問の復習問題があります</p>

<!-- 間隔反復スケジュール -->
<div style="font-size:12px;color:var(--sub);margin-bottom:6px;display:flex;align-items:center;gap:6px">
  <i class="fas fa-calendar-alt" style="color:var(--c1)"></i>間隔反復スケジュール（科学的に最適な復習日）
</div>
<div class="sr-schedule">
  <div class="sr-day \${schedule.today>0?'due today':''}">
    <div class="sr-day-label">今すぐ</div>
    <div class="sr-day-count">\${schedule.today}</div>
    <div class="sr-day-unit">問</div>
  </div>
  <div class="sr-day">
    <div class="sr-day-label">明日</div>
    <div class="sr-day-count">\${schedule.d1}</div>
    <div class="sr-day-unit">問</div>
  </div>
  <div class="sr-day">
    <div class="sr-day-label">3日後</div>
    <div class="sr-day-count">\${schedule.d3}</div>
    <div class="sr-day-unit">問</div>
  </div>
  <div class="sr-day">
    <div class="sr-day-label">7日後</div>
    <div class="sr-day-count">\${schedule.d7}</div>
    <div class="sr-day-unit">問</div>
  </div>
  <div class="sr-day">
    <div class="sr-day-label">14日後+</div>
    <div class="sr-day-count">\${schedule.d14}</div>
    <div class="sr-day-unit">問</div>
  </div>
</div>

<div class="grid-2" style="gap:8px;margin-bottom:8px">
  <button class="btn btn-primary btn-block" onclick="startReviewSession()">
    <i class="fas fa-play"></i>復習を開始（\${wrong.length}問）
  </button>
  <button class="btn btn-outline btn-block" onclick="startFlashcard()" style="border-color:var(--c1);color:var(--c1)">
    <i class="fas fa-clone"></i>暗記カード
  </button>
</div>
\${schedule.today > 0 ? \`<button class="btn btn-danger btn-block" style="margin-bottom:16px" onclick="startDueReview()">
  <i class="fas fa-fire"></i>今すぐ復習が必要（\${schedule.today}問）
</button>\` : '<div style="height:8px"></div>'}

<div class="card">
  <div class="section-title" style="font-size:15px"><i class="fas fa-exclamation-triangle" style="color:var(--warn)"></i>間違えた問題</div>
  \${sorted.slice(0, 20).map(q => {
    const mastery = getMasteryScore(q);
    return \`
    <div style="padding:12px 0;border-bottom:1px solid var(--border)">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">
        <div style="flex:1;font-size:14px">\${q.question_text?.slice(0,60)||''}...</div>
        <span class="badge badge-red">\${q.wrongCount||1}回</span>
      </div>
      <div style="margin-top:4px;display:flex;align-items:center;gap:8px;font-size:12px;color:var(--sub)">
        <span>\${q.category||q.subject}</span>
        <span class="mastery-pill \${getMasteryClass(mastery)}">習熟 \${mastery}%</span>
      </div>
    </div>
  \`}).join('')}
</div>
\`;
}

function startReviewSession() {
  const wrong = LS.get('wrong_questions', []);
  S.study.questions = wrong.slice(0, 20);
  S.study.idx = 0;
  S.study.correct = 0;
  S.study.total = 0;
  S.study.answered = false;
  S.study.category = 'review';
  renderQuestion();
}

function startDueReview() {
  const due = getDueReviewQuestions();
  if (!due.length) { toast('今すぐ復習が必要な問題はありません'); return; }
  S.study.questions = due.slice(0, 20);
  S.study.idx = 0;
  S.study.correct = 0;
  S.study.total = 0;
  S.study.answered = false;
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

function resetSubject(subject) {
  const subLabelMap = { rights:'権利関係', businessLaw:'宅建業法', restrictions:'法令制限', taxOther:'税その他' };
  const hist = LS.get('study_history', []).filter(h => h.subject !== subject);
  const wrong = LS.get('wrong_questions', []).filter(w => w.subject !== subject);
  LS.setSync('study_history', hist);
  LS.setSync('wrong_questions', wrong);
  toast(\`\${subLabelMap[subject]}の履歴をリセットしました\`);
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
body.dark .option-btn.correct { background:#064e3b !important; border-color:#10b981 !important; color:#d1fae5 !important; }
body.dark .option-btn.incorrect { background:#450a0a !important; border-color:#ef4444 !important; color:#fecaca !important; }
body.dark .option-btn.show-correct { background:#064e3b !important; border-color:#10b981 !important; color:#d1fae5 !important; }
body.dark .explanation { background:#1e293b !important; color:#f1f5f9 !important; border-color:#10b981 !important; }
body.dark .explanation.wrong { background:#1e293b !important; border-color:#f87171 !important; }
body.dark #bottom-nav { background:#1e293b; border-color:#334155; }
body.dark .stat-box { background:#1e293b; }
body.dark .card { background:#1e293b; }
body.dark .feature-card { background:#1e293b; }
body.dark .cat-pill { background:#1e293b; border-color:#334155; color:#f1f5f9; }
body.dark .question-text { background:#1e293b; color:#f1f5f9; }
body.dark .modal-sheet { background:#1e293b; color:#f1f5f9; }
body.dark .modal-handle { background:#475569; }
body.dark #toast { background:#475569; }
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
      ctx.fillText('702問', 256, 360);
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
  // Touch support for mobile - cube rotates with finger
  container.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const t = e.touches[0];
    const rect = container.getBoundingClientRect();
    mx = ((t.clientX - rect.left)/rect.width)*2 - 1;
    my = -((t.clientY - rect.top)/rect.height)*2 + 1;
  }, {passive: false});
  container.addEventListener('touchstart', (e) => {
    e.preventDefault();
    // Add spin boost on touch
    cube.rotation.y += 0.5;
    container.classList.add('bump');
    setTimeout(() => container.classList.remove('bump'), 400);
    // Haptic feedback
    if (navigator.vibrate) navigator.vibrate(20);
  }, {passive: false});
  container.addEventListener('click', () => {
    isRotating = !isRotating;
    container.classList.add('bump');
    setTimeout(() => container.classList.remove('bump'), 400);
    // Quick spin burst on click
    const startRotY = cube.rotation.y;
    let progress = 0;
    const burst = setInterval(() => {
      progress += 0.05;
      if (progress >= 1) { clearInterval(burst); return; }
      cube.rotation.y = startRotY + Math.PI * 2 * (1 - Math.pow(1 - progress, 3));
    }, 16);
  });

  let _paused = false;
  function animate() {
    rafId = requestAnimationFrame(animate);
    if (_paused) return;
    if (isRotating) { cube.rotation.x += .005; cube.rotation.y += .01; }
    cube.rotation.x += (my*.5 - cube.rotation.x)*.05;
    cube.rotation.y += (mx*.5 - cube.rotation.y)*.05;
    cube.position.y = Math.sin(Date.now()*.001)*.1;
    renderer.render(scene, camera);
  }
  animate();

  _cube3D = {
    pause() { _paused = true; },
    resume() { _paused = false; },
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

// ===== LANDING PAGE (LP) — PDF design match =====
function renderLP() {
  document.body.classList.add('lp-mode');
  document.getElementById('main').innerHTML = \`
<div class="lp-container">
  <div class="lp-stars"></div>

  <!-- HERO (Page 1) — 3Dキューブをブランド主役に -->
  <div class="lp-section">
    <div class="lp-hero">
      <div class="lp-eyebrow">AI × PWA × マルチOS対応</div>
      <div class="lp-headline">宅建学習を、<br><em>"AI時代"</em>へ。</div>
      <div class="lp-sub">過去5年本試験+令和8年AI予測模試 <strong>702問完全収録</strong>。詳細な法令解説で次回の正答率UP。完全無料・登録不要。</div>
      <div class="lp-badges">
        <span class="lp-badge">📚 702問収録</span>
        <span class="lp-badge">🤖 AI予測模試</span>
        <span class="lp-badge">🔊 音声学習</span>
        <span class="lp-badge">📱 PWA対応</span>
      </div>
      <button class="lp-cta" onclick="document.body.classList.remove('lp-mode');nav('home')">
        <i class="fas fa-rocket"></i>無料で学習を始める
      </button>

      <!-- Device mockups -->
      <div class="lp-devices">
        <div class="lp-house-glow"></div>
        <div class="device device-phone"><div class="device-screen">
          <div class="mini-ring">72%</div>
          <div class="mini-bar full"></div><div class="mini-bar s80"></div><div class="mini-bar s60"></div><div class="mini-bar s40"></div>
        </div></div>
        <div class="device device-tablet"><div class="device-screen">
          <div style="font-size:9px;color:#22d3ee;font-weight:900;margin-bottom:6px">ダッシュボード</div>
          <div class="mini-ring">72%</div>
          <div class="mini-bar full"></div><div class="mini-bar s80"></div><div class="mini-bar s60"></div>
        </div></div>
        <div class="device device-laptop"><div class="device-screen">
          <div style="font-size:8px;color:#22d3ee;font-weight:900;margin-bottom:4px">📊 学習分析</div>
          <div class="mini-bar full"></div><div class="mini-bar s80"></div><div class="mini-bar s60"></div><div class="mini-bar s40"></div>
        </div></div>
      </div>
    </div>
  </div>

  <!-- Page 2: 8 features -->
  <div class="lp-section">
    <div class="lp-section-title">"従来の宅建学習"を<br><em>アップデート</em>。</div>
    <div class="lp-section-sub">AIと一緒に、宅建試験合格へ。</div>

    <div class="lp-features">
      \${[
        {icon:'📚',title:'豊富な問題演習',desc:'過去5年+令和8年AI予測 702問'},
        {icon:'🤖',title:'AI学習サポート',desc:'苦手分析・最適レコメンド'},
        {icon:'📊',title:'進捗の可視化',desc:'レーダー・履歴・統計'},
        {icon:'📇',title:'暗記カード機能',desc:'flip式・TTS音声・自己評価'},
        {icon:'🎯',title:'スケジュール管理',desc:'デイリー目標+間隔反復'},
        {icon:'📝',title:'本番形式模試',desc:'50問120分・分野別採点'},
        {icon:'🔖',title:'重要点ブックマーク',desc:'解説を保存・コピー可能'},
        {icon:'📱',title:'マルチデバイス対応',desc:'iPhone・Android・PC全対応'},
      ].map(f => \`
        <div class="lp-feature">
          <div class="lp-feature-icon">\${f.icon}</div>
          <div class="lp-feature-title">\${f.title}</div>
          <div class="lp-feature-desc">\${f.desc}</div>
        </div>
      \`).join('')}
    </div>
  </div>

  <!-- Page 3: VERSION UP — AI orbit -->
  <div class="lp-section">
    <div class="lp-section-title">"覚える"から、<br><em>"最適化して受かる"</em>へ。</div>
    <div class="lp-section-sub">AIがあなたの学習を伴走し、合格まで導く</div>

    <div class="lp-ai-orbit">
      <div class="lp-ai-orbit-ring"></div>
      <div class="lp-ai-center">AI</div>
      <div class="lp-orbit-item">🎯 苦手分析</div>
      <div class="lp-orbit-item">🧠 理解度予測</div>
      <div class="lp-orbit-item">📈 最適レコメンド</div>
      <div class="lp-orbit-item">⚡ 効率最大化</div>
    </div>

    <div class="lp-compare">
      <div class="lp-compare-row lp-compare-header">
        <div class="lp-old">旧バージョン</div><div></div><div class="lp-new">新バージョン</div>
      </div>
      \${[
        ['単体学習・暗記中心', 'AI最適化による知識・実戦型学習'],
        ['スマホ中心の利用環境', 'マルチOS対応（iOS/Android/iPad/Win/Mac）'],
        ['一般的な解説の提供', 'AIによる個別最適化された学習体験'],
        ['進捗の可視化が限定的', 'リアルタイム分析+レーダーチャート'],
        ['画一的な学習サポート', 'AIアシスタントが合格まで伴走'],
      ].map(([o, n]) => \`
        <div class="lp-compare-row">
          <div class="lp-old">\${o}</div>
          <div class="lp-arrow">▶</div>
          <div class="lp-new">\${n}</div>
        </div>
      \`).join('')}
    </div>
  </div>

  <!-- Page 4: 3 STEP INSTALL -->
  <div class="lp-section">
    <div class="lp-section-title">たった<em>3ステップ</em>で、<br>すぐにアプリ化。</div>
    <div class="lp-section-sub">PWA対応で、インストール不要のアプリ体験</div>

    <div class="lp-step">
      <div class="lp-step-num">1</div>
      <div>
        <div class="lp-step-title">ブラウザでアクセス</div>
        <div class="lp-step-desc">URLにアクセスして宅建BOOSTを開きます</div>
      </div>
    </div>
    <div class="lp-step">
      <div class="lp-step-num">2</div>
      <div>
        <div class="lp-step-title">ホーム画面に追加</div>
        <div class="lp-step-desc">ブラウザのメニューから「ホーム画面に追加」をタップ</div>
      </div>
    </div>
    <div class="lp-step">
      <div class="lp-step-num">3</div>
      <div>
        <div class="lp-step-title">アプリ化完了！</div>
        <div class="lp-step-desc">ホーム画面のアイコンから、タップですぐ起動</div>
      </div>
    </div>

    <div class="lp-section-title" style="margin-top:40px;font-size:22px">PWAで<em>マルチOS</em>対応</div>
    <div class="lp-section-sub">どこでも、同じ体験で</div>

    <div class="lp-os-grid">
      <div class="lp-os"><div class="lp-os-icon">🍎</div><div class="lp-os-name">iPhone</div></div>
      <div class="lp-os"><div class="lp-os-icon">🤖</div><div class="lp-os-name">Android</div></div>
      <div class="lp-os"><div class="lp-os-icon">📱</div><div class="lp-os-name">iPad</div></div>
      <div class="lp-os"><div class="lp-os-icon">🖥️</div><div class="lp-os-name">Windows</div></div>
      <div class="lp-os"><div class="lp-os-icon">💻</div><div class="lp-os-name">Mac</div></div>
    </div>

    <!-- URL cards -->
    <div style="display:flex;gap:10px;margin-bottom:24px">
      <div class="lp-qr-card primary">
        <div class="lp-qr-label">最新版はこちら</div>
        <div class="lp-qr-url">takken-boost.pages.dev</div>
      </div>
      <div class="lp-qr-card">
        <div class="lp-qr-label">旧バージョン</div>
        <div class="lp-qr-url">takken-boost-v9.pages.dev</div>
      </div>
    </div>

    <!-- Final CTA -->
    <div class="lp-final-cta">
      <div style="font-size:32px;margin-bottom:10px">🎓</div>
      <div style="font-size:20px;font-weight:900;margin-bottom:8px;color:#fff">まずは無料で体験しよう！</div>
      <div style="font-size:12px;color:#cbd5e1;margin-bottom:20px;line-height:1.6">今すぐアクセスして、<br>AIに最適化された学習を体感してください</div>
      <button class="lp-cta" onclick="document.body.classList.remove('lp-mode');nav('home')">
        <i class="fas fa-arrow-right"></i>宅建BOOSTで、最短合格へ。
      </button>
    </div>

    <div style="text-align:center;padding:0 0 60px">
      <button class="lp-cta-secondary" onclick="document.body.classList.remove('lp-mode');nav('help')">
        <i class="fas fa-info-circle"></i>使い方ガイドを見る
      </button>
    </div>
  </div>
</div>
\`;
}

// ===== FLASHCARD MODE =====
let _fcDeck = [];
let _fcIdx = 0;
function startFlashcard() {
  const wrong = LS.get('wrong_questions', []);
  const bookmarks = LS.get('bookmarks', []);
  _fcDeck = wrong.slice(0, 30);
  if (!_fcDeck.length) { toast('暗記カードに表示する問題がありません。まず問題を解いて誤答を蓄積してください'); return; }
  _fcIdx = 0;
  nav('flashcard');
}

function renderFlashcard() {
  if (!_fcDeck.length) { startFlashcard(); return; }
  const q = _fcDeck[_fcIdx];
  if (!q) { _fcIdx = 0; nav('review'); return; }
  let options = [];
  try { options = typeof q.options === 'string' ? JSON.parse(q.options) : (q.options || []); } catch {}
  const correctOpt = options[q.correct_answer - 1] || '';

  document.getElementById('main').innerHTML = \`
<button class="back-btn" onclick="nav('review')"><i class="fas fa-chevron-left"></i>復習へ戻る</button>

<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
  <div style="font-size:14px;font-weight:700">暗記カード</div>
  <div style="font-size:13px;color:var(--sub)">\${_fcIdx+1} / \${_fcDeck.length}</div>
</div>

<div class="progress-bar" style="margin-bottom:16px">
  <div class="progress-fill" style="width:\${((_fcIdx)/_fcDeck.length*100).toFixed(1)}%"></div>
</div>

<div class="flashcard-container" onclick="document.querySelector('.flashcard').classList.toggle('flipped')">
  <div class="flashcard">
    <div class="flashcard-face flashcard-front">
      <div style="font-size:11px;color:var(--c1);font-weight:700;margin-bottom:10px">❓ 問題</div>
      <div style="font-size:15px;line-height:1.7;flex:1;overflow-y:auto">\${q.question_text}</div>
      <div class="flashcard-hint">タップで答えを表示</div>
    </div>
    <div class="flashcard-face flashcard-back">
      <div class="answer-label">✅ 答え: 選択肢\${q.correct_answer}</div>
      <div style="font-size:14px;font-weight:700;margin-bottom:12px;padding:10px;background:rgba(255,255,255,.15);border-radius:10px">\${correctOpt}</div>
      <div style="font-size:12px;line-height:1.7;opacity:.9;flex:1;overflow-y:auto">\${q.explanation || '解説は準備中です。'}</div>
      <div class="flashcard-hint">タップで問題に戻る</div>
    </div>
  </div>
</div>

<div class="rating-grid">
  <button class="rating-btn hard" onclick="rateFlashcard(0)"><i class="fas fa-times"></i> 難しい</button>
  <button class="rating-btn medium" onclick="rateFlashcard(1)"><i class="fas fa-minus"></i> 普通</button>
  <button class="rating-btn easy" onclick="rateFlashcard(2)"><i class="fas fa-check"></i> 易しい</button>
</div>

<button class="btn btn-outline btn-block" style="margin-top:12px" onclick="speakText(document.querySelector('.flashcard.flipped') ? '解答。' + \\\`\${correctOpt.replace(/[\`'\"]/g,'')}\\\` + '。' + \\\`\${(q.explanation||'').replace(/[\`'\"]/g,'')}\\\` : \\\`\${q.question_text.replace(/[\`'\"]/g,'')}\\\`, null)"><i class="fas fa-volume-up"></i>音声で確認</button>
\`;
}

function rateFlashcard(rating) {
  const q = _fcDeck[_fcIdx];
  if (q && q.id) {
    if (rating === 2) markReviewed(q.id, true);
    else if (rating === 0) markReviewed(q.id, false);
  }
  _fcIdx++;
  if (_fcIdx >= _fcDeck.length) {
    toast('暗記カード完了！');
    setTimeout(() => nav('review'), 1000);
    return;
  }
  const card = document.querySelector('.flashcard');
  if (card) card.classList.remove('flipped');
  renderFlashcard();
}

// ===== MASTERY SCORE =====
function getMasteryScore(q) {
  const history = LS.get('study_history', []).filter(h => h.qid === q.id);
  if (!history.length) return 0;
  const correctRatio = history.filter(h => h.correct).length / history.length;
  const srBoost = Math.min((q.srLevel || 0) / 4, 1);
  return Math.round((correctRatio * 0.6 + srBoost * 0.4) * 100);
}
function getMasteryClass(score) {
  return score >= 70 ? 'mastery-high' : score >= 40 ? 'mastery-mid' : 'mastery-low';
}

// ===== EXPORT / IMPORT (cross-device sync without server) =====
function exportData() {
  const data = {
    version: 1,
    timestamp: new Date().toISOString(),
    study_history: LS.get('study_history', []),
    wrong_questions: LS.get('wrong_questions', []),
    exam_history: LS.get('exam_history', []),
    bookmarks: LS.get('bookmarks', []),
    onb_done: LS.get('onb_done', false),
    font_size: LS.get('font_size', 'md'),
    tts_rate: LS.get('tts_rate', 1.0),
    dark: LS.get('dark', false),
  };
  const text = JSON.stringify(data);
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => toast('学習データをクリップボードにコピーしました'));
  } else {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    toast('学習データをコピーしました');
  }
}

function importData() {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = \`<div class="modal-sheet">
    <div class="modal-handle"></div>
    <div style="padding:8px 4px">
      <div style="font-size:17px;font-weight:800;margin-bottom:8px">データインポート</div>
      <div style="font-size:12px;color:var(--sub);margin-bottom:12px">他デバイスでエクスポートしたデータを貼り付けてください</div>
      <textarea id="import-data" style="width:100%;height:140px;padding:10px;border-radius:10px;border:1px solid var(--border);background:var(--card);color:var(--text);font-family:monospace;font-size:11px" placeholder="ここに貼り付け..."></textarea>
      <div class="grid-2" style="gap:12px;margin-top:12px">
        <button class="btn btn-outline btn-block" onclick="this.closest('.modal-overlay').remove()">キャンセル</button>
        <button class="btn btn-primary btn-block" onclick="doImport()">インポート</button>
      </div>
    </div>
  </div>\`;
  document.body.appendChild(modal);
}

function doImport() {
  const text = document.getElementById('import-data')?.value;
  if (!text) { toast('データが空です'); return; }
  try {
    const data = JSON.parse(text);
    if (!data.version) throw new Error('Invalid format');
    ['study_history','wrong_questions','exam_history','bookmarks','onb_done','font_size','tts_rate','dark'].forEach(k => {
      if (data[k] !== undefined) LS.setSync(k, data[k]);
    });
    document.querySelector('.modal-overlay')?.remove();
    toast('インポート完了！再読み込みします...');
    setTimeout(() => location.reload(), 1000);
  } catch (e) {
    toast('インポート失敗: 形式が正しくありません');
  }
}

// ===== HELP / GUIDE PAGE =====
function detectOS() {
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return 'ios';
  if (/Android/.test(ua)) return 'android';
  if (/Mac/.test(ua)) return 'mac';
  if (/Windows/.test(ua)) return 'windows';
  return 'other';
}

function renderHelp() {
  const os = detectOS();
  const installGuide = {
    ios: {icon:'🍎', title:'iPhone / iPad', steps:['Safariでアプリを開く（Chrome等不可）','下部の共有ボタン <i class="fas fa-share-square"></i> をタップ','「ホーム画面に追加」を選択','右上の「追加」をタップ → 完了']},
    android: {icon:'🤖', title:'Android', steps:['Chromeでアプリを開く','右上のメニュー（︙）をタップ','「アプリをインストール」または「ホーム画面に追加」を選択','「インストール」をタップ → 完了']},
    windows: {icon:'🖥️', title:'Windows PC', steps:['Chrome または Edge でアプリを開く','アドレスバー右のインストールアイコン <i class="fas fa-download"></i> をクリック','「インストール」をクリック','スタートメニューに追加されます']},
    mac: {icon:'💻', title:'Mac', steps:['Safari 17以降 または Chrome でアプリを開く','Safari: ファイル→「Dock に追加」 / Chrome: アドレスバー右のインストールアイコン','「追加」または「インストール」をクリック','Launchpadから起動可能']},
    other: {icon:'🌐', title:'その他のブラウザ', steps:['ブラウザのメニューから「ホーム画面に追加」または「インストール」を選択','PWA非対応ブラウザではブックマーク追加で代用','オフライン機能は使用できない場合あり']},
  };

  const features = [
    {icon:'📖', title:'カテゴリ別学習', desc:'権利関係・宅建業法・法令制限・税その他の4分野に分けて1問ずつ学習。各問題に法令条文付き詳細解説。', color:'#7c3aed'},
    {icon:'📝', title:'本番形式 模擬試験', desc:'50問・制限時間120分の本番同様の形式。スコア表示・分野別成績・誤答解説まで完備。', color:'#10b981'},
    {icon:'📜', title:'過去問チャレンジ 5年分', desc:'令和3〜令和7年の本試験モデル250問。出題傾向・分野配分を完全踏襲。', color:'#dc2626'},
    {icon:'🤖', title:'令和8年AI予測模試', desc:'過去5年トレンド分析+最新法改正でAIが予測した50問。各解説に【AI予測の根拠】記載。', color:'#f59e0b'},
    {icon:'🔄', title:'弱点集中復習 + 間隔反復', desc:'誤答問題を1日/3日/7日/14日の最適間隔で再出題。4回正解で習得認定。', color:'#ea580c'},
    {icon:'📊', title:'学習進捗・統計', desc:'分野別レーダーチャート・直近7日学習グラフ・模試履歴・苦手分野自動推薦。', color:'#2563eb'},
    {icon:'🔊', title:'音声読み上げ（TTS）', desc:'解説をブラウザの音声合成で読み上げ。通勤・家事中もイヤホンで学習可能。', color:'#8b5cf6'},
    {icon:'🔖', title:'ブックマーク・コピー', desc:'重要な解説を保存。コピーで外部メモにも転記可能。', color:'#06b6d4'},
    {icon:'🌙', title:'ダークモード', desc:'夜間学習でも目が疲れにくい配色。ヘッダーの月アイコンで切替。', color:'#475569'},
    {icon:'📱', title:'PWA・オフライン対応', desc:'ホーム画面に追加でアプリ化。一度開いた問題はオフラインでも閲覧可能。', color:'#10b981'},
  ];

  const updates = [
    {date:'2026-05', title:'過去5年本試験モデル+AI予測模試', desc:'令和3〜7年250問追加。令和8年AI予測模試50問を新規搭載。'},
    {date:'2026-05', title:'5点免除・受験申込スケジュール案内', desc:'登録講習の案内、受験申込期間、年間タイムラインをホーム画面に追加。'},
    {date:'2026-05', title:'全403問の汎用解説を詳細化', desc:'条文番号・判例引用・他選択肢の誤り理由まで含む詳細解説に更新。'},
    {date:'2026-05', title:'100点目標UI/UX大改善', desc:'TTS音声読み上げ・ブックマーク・コピー・コンフェッティ・今日のミッション・間隔反復追加。'},
    {date:'2026-05', title:'マルチOS対応強化', desc:'iOS/Android/Windows/Mac対応、reduced-motion、キーボードショートカット、スワイプジェスチャー。'},
    {date:'2026-05', title:'初回オンボーディング', desc:'初めての方向け3ステップガイド。学習モードの違いと復習ループを説明。'},
  ];

  const osGuide = installGuide[os] || installGuide.other;

  document.getElementById('main').innerHTML = \`
<button class="back-btn" onclick="nav('home')"><i class="fas fa-chevron-left"></i>ホームへ戻る</button>

<!-- WELCOME -->
<div class="card-grad" style="margin-bottom:16px;text-align:center;padding:24px">
  <div style="font-size:32px;margin-bottom:8px">📚</div>
  <div style="font-size:20px;font-weight:900;margin-bottom:6px">宅建BOOST 使い方ガイド</div>
  <div style="font-size:13px;opacity:.85;line-height:1.6">宅地建物取引士試験合格をサポートする学習PWA<br>702問の練習問題に詳細な法令解説付き</div>
</div>

<!-- 全機能紹介 -->
<div style="margin-bottom:10px"><span class="section-chip"><i class="fas fa-star"></i>全機能紹介</span></div>
<div style="display:grid;gap:10px;margin-bottom:20px">
  \${features.map(f => \`
    <div class="card-sm" style="display:flex;gap:12px;align-items:flex-start">
      <div style="width:44px;height:44px;border-radius:12px;background:\${f.color};color:#fff;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0">\${f.icon}</div>
      <div style="flex:1;min-width:0">
        <div style="font-weight:700;font-size:14px;margin-bottom:3px">\${f.title}</div>
        <div style="font-size:12px;color:var(--sub);line-height:1.5">\${f.desc}</div>
      </div>
    </div>
  \`).join('')}
</div>

<!-- 最新アップデート -->
<div style="margin-bottom:10px"><span class="section-chip" style="background:#dc2626"><i class="fas fa-bullhorn"></i>最新アップデート</span></div>
<div class="card" style="margin-bottom:20px">
  <div style="position:relative;padding-left:18px">
    <div style="position:absolute;left:5px;top:0;bottom:0;width:2px;background:linear-gradient(to bottom,var(--c1),#f59e0b)"></div>
    \${updates.map((u, i) => \`
      <div style="margin-bottom:\${i===updates.length-1?'0':'14px'};position:relative">
        <div style="position:absolute;left:-19px;top:3px;width:12px;height:12px;border-radius:50%;background:var(--c1);box-shadow:0 0 0 3px var(--card)"></div>
        <div style="font-size:11px;color:var(--c1);font-weight:700">\${u.date}</div>
        <div style="font-weight:700;font-size:13px;margin:2px 0">\${u.title}</div>
        <div style="font-size:12px;color:var(--sub);line-height:1.5">\${u.desc}</div>
      </div>
    \`).join('')}
  </div>
</div>

<!-- インストール手順 (OS別) -->
<div style="margin-bottom:10px"><span class="section-chip" style="background:#10b981"><i class="fas fa-mobile-alt"></i>インストール手順</span></div>
<div class="card" style="margin-bottom:14px;border-left:4px solid #10b981">
  <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
    <span style="font-size:24px">\${osGuide.icon}</span>
    <div>
      <div style="font-weight:700;font-size:15px">\${osGuide.title}</div>
      <div style="font-size:11px;color:var(--sub)">お使いのデバイスを自動検出</div>
    </div>
  </div>
  <ol style="margin:0;padding-left:0;list-style:none;counter-reset:step">
    \${osGuide.steps.map(s => \`
      <li style="counter-increment:step;display:flex;gap:10px;padding:8px 0;font-size:13px;line-height:1.5">
        <div style="width:24px;height:24px;border-radius:50%;background:#10b981;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:12px;flex-shrink:0">\${osGuide.steps.indexOf(s)+1}</div>
        <div style="flex:1">\${s}</div>
      </li>
    \`).join('')}
  </ol>
</div>

<!-- その他OSも見る -->
<details style="margin-bottom:20px">
  <summary style="cursor:pointer;padding:10px;background:var(--card);border-radius:12px;font-size:13px;font-weight:600">▼ 他のOSの手順も見る</summary>
  <div style="display:grid;gap:10px;margin-top:10px">
    \${Object.entries(installGuide).filter(([k]) => k !== os).map(([k, g]) => \`
      <div class="card-sm">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
          <span style="font-size:20px">\${g.icon}</span>
          <strong style="font-size:13px">\${g.title}</strong>
        </div>
        <ol style="margin:0;padding-left:18px;font-size:12px;line-height:1.7;color:var(--sub)">
          \${g.steps.map(s => '<li>'+s+'</li>').join('')}
        </ol>
      </div>
    \`).join('')}
  </div>
</details>

<!-- 使い方の流れ -->
<div style="margin-bottom:10px"><span class="section-chip" style="background:#f59e0b"><i class="fas fa-route"></i>合格までの使い方</span></div>
<div class="card" style="margin-bottom:20px">
  \${[
    {step:1, title:'まずカテゴリ別学習', desc:'4分野を1問ずつ解いて基礎固め。解説の条文番号を確認。', icon:'📖'},
    {step:2, title:'弱点が見えたら復習タブ', desc:'誤答は自動蓄積。間隔反復で1日/3日/7日/14日に再出題。', icon:'🔄'},
    {step:3, title:'過去5年でレベル確認', desc:'令和3〜7年の本試験モデルで実力測定。', icon:'📜'},
    {step:4, title:'模擬試験で時間配分訓練', desc:'50問120分の本番形式。72%(36点)以上で合格圏。', icon:'⏱️'},
    {step:5, title:'最後にAI予測模試で総仕上げ', desc:'令和8年予測50問で最新トレンド対応。', icon:'🤖'},
  ].map(s => \`
    <div style="display:flex;gap:12px;padding:10px 0;border-bottom:1px solid var(--border)">
      <div style="width:40px;height:40px;border-radius:12px;background:var(--grad);color:#fff;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0">\${s.icon}</div>
      <div style="flex:1">
        <div style="font-weight:700;font-size:13px"><span style="color:var(--c1)">STEP \${s.step}</span> — \${s.title}</div>
        <div style="font-size:12px;color:var(--sub);margin-top:2px;line-height:1.5">\${s.desc}</div>
      </div>
    </div>
  \`).join('')}
</div>

<!-- ショートカット -->
<div style="margin-bottom:10px"><span class="section-chip" style="background:#475569"><i class="fas fa-keyboard"></i>便利な操作</span></div>
<div class="card" style="margin-bottom:20px">
  <div style="display:grid;gap:10px">
    <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border)">
      <span style="font-size:13px">選択肢を選ぶ</span>
      <span style="font-family:monospace;background:var(--bg);padding:3px 8px;border-radius:6px;font-size:12px">1 / 2 / 3 / 4</span>
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border)">
      <span style="font-size:13px">次の問題へ</span>
      <span style="font-family:monospace;background:var(--bg);padding:3px 8px;border-radius:6px;font-size:12px">Space / Enter</span>
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border)">
      <span style="font-size:13px">模試で前後の問題</span>
      <span style="font-family:monospace;background:var(--bg);padding:3px 8px;border-radius:6px;font-size:12px">← / →</span>
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0">
      <span style="font-size:13px">スマホで前後の問題</span>
      <span style="font-size:12px;color:var(--sub)">左右スワイプ</span>
    </div>
  </div>
</div>

<!-- FAQ -->
<div style="margin-bottom:10px"><span class="section-chip" style="background:#06b6d4"><i class="fas fa-question"></i>よくある質問</span></div>
<div class="card" style="margin-bottom:24px">
  \${[
    {q:'費用はかかりますか？', a:'完全無料です。広告も無く、ログイン不要でお使いいただけます。'},
    {q:'オフラインで使えますか？', a:'ホーム画面に追加（PWAインストール）すると、一度開いた問題はオフラインで閲覧可能です。'},
    {q:'データは安全ですか？', a:'学習履歴は端末内のlocalStorageに保存されます。サーバーには個人情報は送信されません。'},
    {q:'本試験問題ではないのですか？', a:'著作権配慮のため、各年度の出題傾向・分野配分を完全踏襲した「本試験モデル問題」です。条文・判例も正確で合格力養成に直結します。'},
    {q:'5点免除の登録講習はどこで受けられますか？', a:'ホーム画面下部「5点免除」セクションから国土交通省の登録講習実施機関一覧へリンクがあります。'},
    {q:'学習履歴をリセットしたい', a:'「進捗」タブ最下部の「データをリセット」ボタンから可能です。'},
  ].map((f, i) => \`
    <details style="border-bottom:\${i===5?'none':'1px solid var(--border)'};padding:10px 0">
      <summary style="cursor:pointer;font-weight:600;font-size:13px;list-style:none;display:flex;justify-content:space-between;align-items:center">
        <span><i class="fas fa-circle-question" style="color:var(--c1);margin-right:6px"></i>\${f.q}</span>
        <i class="fas fa-chevron-down" style="font-size:11px;color:var(--sub)"></i>
      </summary>
      <div style="padding:10px 0 0 22px;font-size:12px;line-height:1.6;color:var(--sub)">\${f.a}</div>
    </details>
  \`).join('')}
</div>

<div class="grid-2" style="gap:12px;margin-bottom:20px">
  <button class="btn btn-primary btn-block btn-lg" onclick="nav('home')">
    <i class="fas fa-rocket"></i>学習を始める
  </button>
  <button class="btn btn-outline btn-block btn-lg" onclick="nav('lp')" style="border-color:var(--c1);color:var(--c1)">
    <i class="fas fa-image"></i>サービス紹介
  </button>
</div>
\`;
}

// ===== KEYBOARD SHORTCUTS =====
document.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  if (document.getElementById('onboarding')?.classList.contains('show')) return;

  // 1-4: select answer
  if (['1','2','3','4'].includes(e.key)) {
    const btn = document.querySelector('.option-btn[data-answer="'+e.key+'"]:not([disabled])');
    if (btn) { btn.click(); e.preventDefault(); return; }
    // exam mode
    const examBtn = document.querySelectorAll('#exam-options .option-btn')[parseInt(e.key)-1];
    if (examBtn) { examBtn.click(); e.preventDefault(); return; }
  }
  // Space/Enter: next question
  if ((e.key === ' ' || e.key === 'Enter') && document.getElementById('nav-area')?.style.display === 'flex') {
    document.querySelector('.sticky-next button')?.click();
    e.preventDefault();
  }
  // Arrow keys: prev/next in exam
  if (S.exam.active && e.key === 'ArrowRight') { moveExamQ(1); e.preventDefault(); }
  if (S.exam.active && e.key === 'ArrowLeft') { moveExamQ(-1); e.preventDefault(); }
});

// ===== SWIPE GESTURES =====
let _swipeStartX = 0, _swipeStartY = 0;
document.addEventListener('touchstart', (e) => {
  _swipeStartX = e.touches[0].clientX;
  _swipeStartY = e.touches[0].clientY;
}, {passive: true});
document.addEventListener('touchend', (e) => {
  if (!S.exam.active) return;
  const dx = e.changedTouches[0].clientX - _swipeStartX;
  const dy = e.changedTouches[0].clientY - _swipeStartY;
  if (Math.abs(dx) > 60 && Math.abs(dy) < 40) {
    if (dx < 0) moveExamQ(1); else moveExamQ(-1);
  }
}, {passive: true});

// ===== VISIBILITY (battery saver for Three.js) =====
let _cubePaused = false;
document.addEventListener('visibilitychange', () => {
  if (!_cube3D) return;
  if (document.hidden) { _cube3D.pause?.(); _cubePaused = true; }
  else if (_cubePaused) { _cube3D.resume?.(); _cubePaused = false; }
});

// ===== ONBOARDING =====
let _onbStep = 1;
function showOnboarding() {
  _onbStep = 1;
  document.getElementById('onboarding')?.classList.add('show');
  updateOnbStep();
}
function closeOnboarding() {
  document.getElementById('onboarding')?.classList.remove('show');
  LS.set('onb_done', true);
}
function onbNext() {
  if (_onbStep >= 5) { closeOnboarding(); maybeShowIOSInstall(); return; }
  _onbStep++;
  updateOnbStep();
}
function updateOnbStep() {
  document.querySelectorAll('.onb-step').forEach(el => el.classList.toggle('active', parseInt(el.dataset.step) === _onbStep));
  document.querySelectorAll('.onb-dot').forEach((d, i) => d.classList.toggle('active', i+1 === _onbStep));
  const btn = document.getElementById('onb-next');
  if (btn) btn.innerHTML = _onbStep >= 5 ? '<i class="fas fa-rocket"></i>はじめる' : '次へ →';
}

// ===== iOS INSTALL GUIDE =====
function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}
function isStandalone() {
  return window.navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches;
}
function maybeShowIOSInstall() {
  if (!isIOS() || isStandalone() || LS.get('ios_install_dismissed', false)) return;
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = \`<div class="modal-sheet">
    <div class="modal-handle"></div>
    <div style="text-align:center;padding:8px 8px 16px">
      <div style="font-size:36px;margin-bottom:8px">📱</div>
      <div style="font-size:17px;font-weight:800;margin-bottom:4px">ホーム画面に追加</div>
      <div style="font-size:12px;color:var(--sub);margin-bottom:20px">いつでもアプリのように使えます</div>
      <div style="text-align:left">
        <div class="ios-step"><div class="ios-step-num">1</div><div class="ios-step-text">Safariの<strong>共有ボタン</strong>（□↑）をタップ</div></div>
        <div class="ios-step"><div class="ios-step-num">2</div><div class="ios-step-text">「<strong>ホーム画面に追加</strong>」を選択</div></div>
        <div class="ios-step"><div class="ios-step-num">3</div><div class="ios-step-text">右上の「<strong>追加</strong>」をタップ</div></div>
      </div>
      <button class="btn btn-primary btn-block" style="margin-top:16px" onclick="this.closest('.modal-overlay').remove();LS.set('ios_install_dismissed',true)">わかりました</button>
    </div>
  </div>\`;
  document.body.appendChild(modal);
}

// ===== TEXT-TO-SPEECH (with speed control & debounce) =====
let _ttsUtterance = null;
let _ttsLastClick = 0;
function getTTSRate() { return parseFloat(LS.get('tts_rate', 1.0)) || 1.0; }
function setTTSRate(rate) {
  LS.set('tts_rate', rate);
  document.querySelectorAll('.tts-speed-btn').forEach(b => b.classList.toggle('active', parseFloat(b.dataset.rate) === rate));
  toast('読み上げ速度: ' + rate + 'x');
}
function speakText(text, btnEl) {
  // Debounce rapid clicks (300ms)
  const now = Date.now();
  if (now - _ttsLastClick < 300) return;
  _ttsLastClick = now;

  if (!('speechSynthesis' in window)) { toast('音声機能が利用できません'); return; }
  if (speechSynthesis.speaking) {
    speechSynthesis.cancel();
    document.querySelectorAll('.exp-action-btn[data-tts]').forEach(b => b.classList.remove('active'));
    return;
  }
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'ja-JP'; u.rate = getTTSRate(); u.pitch = 1.0;
  const voices = speechSynthesis.getVoices();
  const ja = voices.find(v => v.lang.startsWith('ja'));
  if (ja) u.voice = ja;
  u.onend = () => btnEl?.classList.remove('active');
  u.onerror = () => btnEl?.classList.remove('active');
  btnEl?.classList.add('active');
  _ttsUtterance = u;
  speechSynthesis.speak(u);
}

// ===== FONT SIZE CONTROL =====
const FONT_SIZES = ['sm','md','lg','xl'];
function adjustFontSize(delta) {
  const cur = LS.get('font_size', 'md');
  const idx = FONT_SIZES.indexOf(cur);
  const next = FONT_SIZES[Math.max(0, Math.min(FONT_SIZES.length-1, idx + delta))];
  document.documentElement.setAttribute('data-font', next);
  LS.set('font_size', next);
  toast('文字サイズ: ' + ({sm:'小',md:'標準',lg:'大',xl:'特大'})[next]);
}
function applyFontSize() {
  const saved = LS.get('font_size', 'md');
  document.documentElement.setAttribute('data-font', saved);
}

// ===== BOOKMARK =====
function toggleBookmark(qid, btnEl) {
  const bm = LS.get('bookmarks', []);
  const idx = bm.indexOf(qid);
  if (idx > -1) { bm.splice(idx, 1); toast('ブックマーク解除'); btnEl?.classList.remove('active'); }
  else { bm.push(qid); toast('ブックマーク保存'); btnEl?.classList.add('active'); }
  LS.set('bookmarks', bm);
}
function isBookmarked(qid) { return LS.get('bookmarks', []).includes(qid); }

// ===== COPY EXPLANATION =====
function copyExplanation(text) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => toast('解説をコピーしました')).catch(() => toast('コピーに失敗'));
  } else { toast('コピー機能未対応'); }
}

// ===== CONFETTI (CSS-only) =====
function fireConfetti() {
  const c = document.createElement('div');
  c.className = 'confetti-container';
  const colors = ['#7c3aed','#a855f7','#fde047','#10b981','#ef4444','#3b82f6'];
  for (let i = 0; i < 60; i++) {
    const p = document.createElement('div');
    p.className = 'confetti';
    p.style.left = Math.random()*100 + '%';
    p.style.background = colors[Math.floor(Math.random()*colors.length)];
    p.style.animationDuration = (2 + Math.random()*2) + 's';
    p.style.animationDelay = Math.random()*0.5 + 's';
    p.style.transform = 'rotate('+Math.random()*360+'deg)';
    if (Math.random() > 0.5) p.style.borderRadius = '50%';
    c.appendChild(p);
  }
  document.body.appendChild(c);
  setTimeout(() => c.remove(), 5000);
}

// ===== DAILY MISSION =====
function getDailyMission() {
  const wrong = LS.get('wrong_questions', []);
  const todayStr = today();
  const hist = LS.get('study_history', []);
  const todayCount = hist.filter(h => h.date === todayStr).length;
  const wrongToReview = wrong.slice(0, 5).length;
  const newGoal = Math.max(0, 10 - todayCount);
  return {
    todayCount,
    newGoal,
    wrongToReview,
    completed: todayCount >= 10 && wrongToReview === 0,
  };
}

// ===== SPACED REPETITION (1d/3d/7d/14d intervals) =====
function getDueReviewQuestions() {
  const wrong = LS.get('wrong_questions', []);
  const now = Date.now();
  const intervalsMs = [1, 3, 7, 14].map(d => d*24*60*60*1000);
  return wrong.filter(w => {
    const lastSeen = w.lastSeen || 0;
    const level = w.srLevel || 0;
    const interval = intervalsMs[Math.min(level, intervalsMs.length-1)] || intervalsMs[0];
    return now - lastSeen >= interval;
  });
}
function markReviewed(qid, wasCorrect) {
  const wrong = LS.get('wrong_questions', []);
  const w = wrong.find(x => x.id === qid);
  if (w) {
    w.lastSeen = Date.now();
    if (wasCorrect) {
      w.srLevel = (w.srLevel || 0) + 1;
      if (w.srLevel >= 4) {
        const idx = wrong.indexOf(w);
        if (idx > -1) wrong.splice(idx, 1);
      }
    } else { w.srLevel = 0; }
    LS.set('wrong_questions', wrong);
  }
}

// ===== RESULT WRONG ANSWER EXPLANATION MODAL =====
function showExplanationFor(idx) {
  const r = S.exam.results?.[idx];
  if (!r) return;
  let options = [];
  try { options = typeof r.options === 'string' ? JSON.parse(r.options) : (r.options || []); } catch {}
  const correctText = options[r.correct_answer-1] || '';
  const selectedText = r.selected ? (options[r.selected-1] || '未回答') : '未回答';
  const explanation = r.explanation || '解説は準備中です。';
  const ttsText = \`問題。\${r.question_text} 正解は選択肢\${r.correct_answer}。\${correctText} 解説。\${explanation}\`;
  const bookmarked = isBookmarked(r.id);

  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = \`<div class="modal-sheet" style="max-height:90vh">
    <div class="modal-handle"></div>
    <div style="padding:0 4px 8px">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
        <span class="badge badge-red"><i class="fas fa-times"></i> 不正解</span>
        <span style="font-size:13px;color:var(--sub)">問\${idx+1}</span>
      </div>
      <div style="font-weight:700;font-size:15px;line-height:1.7;padding:14px;background:rgba(124,58,237,.08);border-radius:12px;border-left:4px solid var(--c1);margin-bottom:14px">
        \${r.question_text}
      </div>
      <div style="font-size:13px;margin-bottom:6px"><strong>あなたの回答:</strong> \${r.selected ? '選択肢'+r.selected : '未回答'}</div>
      <div style="background:#fee2e2;border-radius:8px;padding:10px 12px;margin-bottom:10px;font-size:13px;color:#991b1b">\${selectedText}</div>
      <div style="font-size:13px;margin-bottom:6px"><strong style="color:var(--success)">正解:</strong> 選択肢\${r.correct_answer}</div>
      <div style="background:#d1fae5;border-radius:8px;padding:10px 12px;margin-bottom:16px;font-size:13px;color:#065f46">\${correctText}</div>
      <div class="exp-card">
        <div class="exp-header">
          <div class="exp-header-icon">📖</div>
          <div><div class="exp-header-title" style="color:#065f46">詳しい解説</div></div>
        </div>
        <div class="exp-body" style="line-height:1.9">\${explanation}</div>
        <div class="exp-actions">
          <button class="exp-action-btn" data-tts onclick="speakText(\\\`\${ttsText.replace(/\`/g,'').replace(/'/g,'').replace(/"/g,'').replace(/\\n/g,' ')}\\\`, this)"><i class="fas fa-volume-up"></i>読み上げ</button>
          <button class="exp-action-btn \${bookmarked?'active':''}" onclick="toggleBookmark('\${r.id}', this)"><i class="fas fa-bookmark"></i>保存</button>
          <button class="exp-action-btn" onclick="copyExplanation(\\\`\${(r.question_text+'\\n\\n正解: '+correctText+'\\n\\n'+explanation).replace(/\`/g,'').replace(/'/g,'').replace(/\\n/g,'\\\\n')}\\\`)"><i class="fas fa-copy"></i>コピー</button>
        </div>
      </div>
      <button class="btn btn-primary btn-block" style="margin-top:16px" onclick="this.closest('.modal-overlay').remove();speechSynthesis.cancel()">閉じる</button>
    </div>
  </div>\`;
  document.body.appendChild(modal);
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  applyFontSize();
  initDarkMode();
  nav('home');
  // First-time onboarding
  if (!LS.get('onb_done', false)) {
    setTimeout(showOnboarding, 800);
  } else {
    setTimeout(maybeShowIOSInstall, 1500);
  }
});
</script>
</body>
</html>`;

export default app

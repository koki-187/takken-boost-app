// 宅建BOOST v9.0.0 Ultimate Edition - Main Application
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 宅建BOOST v9.0.0 Ultimate Edition - Initializing...');
    
    // Initialize 3D Logo
    initializeLogo3D();
    
    // Initialize particle background
    initializeParticleBackground();
    
    // Setup feature card clicks
    setupFeatureCards();
    
    // Setup PWA install button
    setupPWAInstall();
    
    // Initialize animations
    initializeAnimations();
    
    // Setup version switcher
    setupVersionSwitcher();
});

// 3D Logo Initialization
function initializeLogo3D() {
    const canvas = document.getElementById('logo-3d');
    if (!canvas) return;
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, canvas.width / canvas.height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    
    renderer.setSize(canvas.width, canvas.height);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // Create purple gradient cube with logo
    const geometry = new THREE.BoxGeometry(2.5, 2.5, 2.5);
    
    // Create gradient material for each face
    const materials = [];
    const colors = [
        '#667eea', '#764ba2', '#667eea', 
        '#764ba2', '#667eea', '#764ba2'
    ];
    
    colors.forEach((color, index) => {
        // Create canvas for texture
        const textureCanvas = document.createElement('canvas');
        const ctx = textureCanvas.getContext('2d');
        textureCanvas.width = 256;
        textureCanvas.height = 256;
        
        // Gradient background
        const gradient = ctx.createLinearGradient(0, 0, textureCanvas.width, textureCanvas.height);
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(1, '#764ba2');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, textureCanvas.width, textureCanvas.height);
        
        // Add text
        ctx.fillStyle = 'white';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 10;
        
        if (index < 2) {
            ctx.fillText('宅建', textureCanvas.width / 2, textureCanvas.height / 2 - 30);
            ctx.fillText('BOOST', textureCanvas.width / 2, textureCanvas.height / 2 + 30);
        } else if (index < 4) {
            ctx.font = 'bold 60px Arial';
            ctx.fillText('宅', textureCanvas.width / 2, textureCanvas.height / 2 - 20);
            ctx.fillText('建', textureCanvas.width / 2, textureCanvas.height / 2 + 40);
        } else {
            ctx.fillText('v9.0.0', textureCanvas.width / 2, textureCanvas.height / 2);
        }
        
        const texture = new THREE.CanvasTexture(textureCanvas);
        materials.push(new THREE.MeshPhongMaterial({ 
            map: texture,
            shininess: 100,
            specular: 0x222222
        }));
    });
    
    const cube = new THREE.Mesh(geometry, materials);
    scene.add(cube);
    
    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);
    
    const pointLight1 = new THREE.PointLight(0x667eea, 0.5);
    pointLight1.position.set(-5, 5, 5);
    scene.add(pointLight1);
    
    const pointLight2 = new THREE.PointLight(0x764ba2, 0.5);
    pointLight2.position.set(5, -5, 5);
    scene.add(pointLight2);
    
    camera.position.z = 5;
    
    // Animation
    function animate() {
        requestAnimationFrame(animate);
        cube.rotation.x += 0.005;
        cube.rotation.y += 0.01;
        cube.position.y = Math.sin(Date.now() * 0.001) * 0.1;
        renderer.render(scene, camera);
    }
    
    animate();
    
    // Interaction
    canvas.addEventListener('click', () => {
        anime({
            targets: cube.scale,
            x: [1, 1.2, 1],
            y: [1, 1.2, 1],
            z: [1, 1.2, 1],
            duration: 600,
            easing: 'easeOutElastic(1, 0.5)'
        });
    });
}

// Particle Background
function initializeParticleBackground() {
    const canvas = document.getElementById('particle-bg');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particles = [];
    const particleCount = 50;
    
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 3 + 1;
            this.speedX = Math.random() * 2 - 1;
            this.speedY = Math.random() * 2 - 1;
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
            ctx.fillStyle = `rgba(102, 126, 234, ${this.opacity})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // Create particles
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
    
    // Animation loop
    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        
        // Draw connections
        particles.forEach((particle, index) => {
            for (let j = index + 1; j < particles.length; j++) {
                const dx = particles[j].x - particle.x;
                const dy = particles[j].y - particle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 150) {
                    ctx.strokeStyle = `rgba(102, 126, 234, ${0.1 * (1 - distance / 150)})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particle.x, particle.y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
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

// Setup Feature Cards
function setupFeatureCards() {
    const cards = [
        { id: 'study-mode', url: '/study', name: '学習モード' },
        { id: 'mock-exam', url: '/mock-exam', name: '模擬試験' },
        { id: 'progress', url: '/progress', name: '進捗管理' },
        { id: 'weak-points', url: '/weak-points', name: '弱点分析' },
        { id: 'notifications', url: '/notifications', name: '通知設定' },
        { id: 'tutorial', url: '/tutorial', name: 'チュートリアル' }
    ];
    
    cards.forEach(card => {
        const element = document.getElementById(card.id);
        if (element) {
            element.style.cursor = 'pointer';
            
            // Add hover effect
            element.addEventListener('mouseenter', () => {
                anime({
                    targets: element,
                    translateY: -10,
                    scale: 1.05,
                    duration: 300,
                    easing: 'easeOutCubic'
                });
            });
            
            element.addEventListener('mouseleave', () => {
                anime({
                    targets: element,
                    translateY: 0,
                    scale: 1,
                    duration: 300,
                    easing: 'easeOutCubic'
                });
            });
            
            // Add click handler
            element.addEventListener('click', () => {
                // Click animation
                anime({
                    targets: element,
                    scale: [1, 0.95, 1.05, 1],
                    duration: 400,
                    easing: 'easeOutElastic(1, 0.5)'
                });
                
                // Navigate after animation
                setTimeout(() => {
                    if (card.url === '/notifications') {
                        showNotificationSettings();
                    } else if (card.url === '/weak-points') {
                        showWeakPointsAnalysis();
                    } else if (card.url === '/tutorial') {
                        showTutorial();
                    } else {
                        window.location.href = card.url;
                    }
                }, 300);
            });
        }
    });
}

// PWA Install
function setupPWAInstall() {
    let deferredPrompt;
    const installButton = document.getElementById('install-button');
    
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        
        if (installButton) {
            installButton.style.display = 'flex';
            
            installButton.addEventListener('click', async () => {
                if (deferredPrompt) {
                    deferredPrompt.prompt();
                    const { outcome } = await deferredPrompt.userChoice;
                    
                    if (outcome === 'accepted') {
                        console.log('PWA installed successfully');
                        installButton.style.display = 'none';
                    }
                    
                    deferredPrompt = null;
                }
            });
        }
    });
    
    // Check if already installed
    window.addEventListener('appinstalled', () => {
        console.log('PWA is installed');
        if (installButton) {
            installButton.style.display = 'none';
        }
    });
}

// Initialize Animations
function initializeAnimations() {
    // Hero title animation
    anime({
        targets: '.hero-title',
        translateY: [-50, 0],
        opacity: [0, 1],
        duration: 1500,
        easing: 'easeOutExpo',
        delay: 500
    });
    
    // Hero subtitle animation
    anime({
        targets: '.hero-subtitle',
        translateY: [-30, 0],
        opacity: [0, 1],
        duration: 1200,
        easing: 'easeOutExpo',
        delay: 700
    });
    
    // Stats animation
    anime({
        targets: '.stat-item',
        translateY: [50, 0],
        opacity: [0, 1],
        delay: anime.stagger(100, {start: 900}),
        duration: 1000,
        easing: 'easeOutCubic'
    });
    
    // Feature cards stagger animation
    anime({
        targets: '.feature-card',
        translateY: [50, 0],
        opacity: [0, 1],
        delay: anime.stagger(100, {start: 1200}),
        duration: 800,
        easing: 'easeOutCubic'
    });
    
    // Counter animation
    const counters = [
        { id: 'total-questions', target: 402 },
        { id: 'categories-count', target: 7 },
        { id: 'users-count', target: 1000 }
    ];
    
    counters.forEach((counter, index) => {
        const element = document.getElementById(counter.id);
        if (element) {
            anime({
                targets: element,
                innerHTML: [0, counter.target],
                duration: 2000,
                delay: 1500 + (index * 200),
                easing: 'easeInOutExpo',
                round: 1,
                update: function(anim) {
                    const value = Math.floor(anim.animations[0].currentValue);
                    element.innerHTML = counter.id === 'users-count' ? value + '+' : value;
                }
            });
        }
    });
}

// Notification Settings Modal
function showNotificationSettings() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h2 class="text-2xl font-bold mb-4 text-gray-800">通知設定</h2>
            <p class="text-gray-600 mb-6">学習リマインダーとレポートをメールで受け取る設定です。</p>
            
            <div class="space-y-4">
                <div>
                    <label class="block text-gray-700 mb-2">メールアドレス</label>
                    <input type="email" id="notification-email" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-purple-500" placeholder="your@email.com">
                </div>
                
                <div>
                    <label class="flex items-center">
                        <input type="checkbox" id="daily-reminder" class="mr-2">
                        <span class="text-gray-700">毎日の学習リマインダー</span>
                    </label>
                </div>
                
                <div>
                    <label class="flex items-center">
                        <input type="checkbox" id="weekly-report" class="mr-2">
                        <span class="text-gray-700">週間レポート</span>
                    </label>
                </div>
            </div>
            
            <div class="mt-6 flex gap-4">
                <button onclick="saveNotificationSettings()" class="flex-1 bg-gradient-to-r from-purple-500 to-purple-700 text-white py-2 px-4 rounded-lg hover:opacity-90 transition">
                    保存
                </button>
                <button onclick="this.closest('.fixed').remove()" class="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition">
                    キャンセル
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Animate modal
    anime({
        targets: modal.querySelector('.bg-white'),
        scale: [0.9, 1],
        opacity: [0, 1],
        duration: 300,
        easing: 'easeOutCubic'
    });
}

// Save Notification Settings
window.saveNotificationSettings = async function() {
    const email = document.getElementById('notification-email').value;
    const dailyReminder = document.getElementById('daily-reminder').checked;
    const weeklyReport = document.getElementById('weekly-report').checked;
    
    if (!email) {
        alert('メールアドレスを入力してください');
        return;
    }
    
    try {
        const response = await axios.post('/api/notifications/settings', {
            email,
            dailyReminder,
            weeklyReport
        });
        
        if (response.data.success) {
            alert('通知設定を保存しました');
            document.querySelector('.fixed').remove();
        }
    } catch (error) {
        console.error('Error saving notification settings:', error);
        alert('設定の保存に失敗しました');
    }
}

// Weak Points Analysis Modal
function showWeakPointsAnalysis() {
    // This would normally fetch real data from the API
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <h2 class="text-2xl font-bold mb-4 text-gray-800">弱点分析レポート</h2>
            
            <div class="mb-6">
                <h3 class="text-lg font-semibold mb-2">苦手カテゴリートップ3</h3>
                <div class="space-y-2">
                    <div class="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                        <span class="font-medium">権利関係</span>
                        <span class="text-red-600">正答率: 45%</span>
                    </div>
                    <div class="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                        <span class="font-medium">法令上の制限</span>
                        <span class="text-orange-600">正答率: 52%</span>
                    </div>
                    <div class="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                        <span class="font-medium">税その他</span>
                        <span class="text-yellow-600">正答率: 58%</span>
                    </div>
                </div>
            </div>
            
            <div class="mb-6">
                <h3 class="text-lg font-semibold mb-2">推奨学習プラン</h3>
                <ol class="list-decimal list-inside space-y-2 text-gray-700">
                    <li>権利関係の基礎問題を1日10問ずつ復習</li>
                    <li>法令上の制限の過去問を週3回実施</li>
                    <li>税その他カテゴリーの要点をまとめて暗記</li>
                </ol>
            </div>
            
            <button onclick="this.closest('.fixed').remove()" class="w-full bg-gradient-to-r from-purple-500 to-purple-700 text-white py-2 px-4 rounded-lg hover:opacity-90 transition">
                閉じる
            </button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Animate modal
    anime({
        targets: modal.querySelector('.bg-white'),
        scale: [0.9, 1],
        opacity: [0, 1],
        duration: 300,
        easing: 'easeOutCubic'
    });
}

// Tutorial Modal
function showTutorial() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <h2 class="text-2xl font-bold mb-4 text-gray-800">チュートリアル</h2>
            
            <div class="space-y-6">
                <div>
                    <h3 class="text-lg font-semibold mb-2">
                        <i class="fas fa-book-open text-purple-600 mr-2"></i>
                        学習モードの使い方
                    </h3>
                    <p class="text-gray-600">402問の問題からカテゴリーや難易度を選んで学習できます。解説を読んで理解を深めましょう。</p>
                </div>
                
                <div>
                    <h3 class="text-lg font-semibold mb-2">
                        <i class="fas fa-file-alt text-purple-600 mr-2"></i>
                        模擬試験の受け方
                    </h3>
                    <p class="text-gray-600">本番形式の50問試験で実力を測定。時間制限付きで本番さながらの環境で練習できます。</p>
                </div>
                
                <div>
                    <h3 class="text-lg font-semibold mb-2">
                        <i class="fas fa-chart-line text-purple-600 mr-2"></i>
                        進捗管理の確認
                    </h3>
                    <p class="text-gray-600">学習の進捗状況をグラフで可視化。どのカテゴリーが得意/苦手かが一目でわかります。</p>
                </div>
                
                <div>
                    <h3 class="text-lg font-semibold mb-2">
                        <i class="fas fa-mobile-alt text-purple-600 mr-2"></i>
                        PWAアプリのインストール
                    </h3>
                    <p class="text-gray-600">ホーム画面に追加してネイティブアプリのように使用できます。オフラインでも一部機能が利用可能です。</p>
                </div>
            </div>
            
            <button onclick="this.closest('.fixed').remove()" class="mt-6 w-full bg-gradient-to-r from-purple-500 to-purple-700 text-white py-2 px-4 rounded-lg hover:opacity-90 transition">
                閉じる
            </button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Animate modal
    anime({
        targets: modal.querySelector('.bg-white'),
        scale: [0.9, 1],
        opacity: [0, 1],
        duration: 300,
        easing: 'easeOutCubic'
    });
}

// Version Switcher
function setupVersionSwitcher() {
    // Add version switcher UI
    const versionSwitcher = document.createElement('div');
    versionSwitcher.className = 'fixed bottom-4 left-4 z-40';
    versionSwitcher.innerHTML = `
        <div class="bg-white rounded-lg shadow-lg p-2">
            <select id="version-select" class="text-sm px-2 py-1 rounded border border-gray-300 focus:outline-none focus:border-purple-500">
                <option value="v9" selected>v9.0.0 Ultimate</option>
                <option value="v8">v8.0.0 Classic</option>
            </select>
        </div>
    `;
    
    document.body.appendChild(versionSwitcher);
    
    const select = document.getElementById('version-select');
    select.addEventListener('change', (e) => {
        if (e.target.value === 'v8') {
            window.location.href = '/v8';
        }
    });
}
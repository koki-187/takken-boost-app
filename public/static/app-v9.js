// 宅建BOOST v9.0.0 Ultimate Edition - Frontend JavaScript
// Three.js 3D Logo, Anime.js Animations, and Complete Functionality

// =====================================================
// Three.js 3D Logo Implementation
// =====================================================
let scene, camera, renderer, logoMesh;
let mouseX = 0, mouseY = 0;
let targetRotationX = 0, targetRotationY = 0;

function init3DLogo() {
    const canvas = document.getElementById('logo-3d');
    if (!canvas) return;

    // Scene setup
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, canvas.width / canvas.height, 0.1, 1000);
    
    // Renderer setup with alpha for transparency
    renderer = new THREE.WebGLRenderer({ 
        canvas: canvas, 
        alpha: true,
        antialias: true 
    });
    renderer.setSize(canvas.width, canvas.height);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Create 3D logo geometry (box with custom material)
    const geometry = new THREE.BoxGeometry(3, 3, 3);
    
    // Create gradient material for each face
    const materials = [
        new THREE.MeshPhongMaterial({ color: 0x667eea, emissive: 0x667eea, emissiveIntensity: 0.2 }),
        new THREE.MeshPhongMaterial({ color: 0x764ba2, emissive: 0x764ba2, emissiveIntensity: 0.2 }),
        new THREE.MeshPhongMaterial({ color: 0x667eea, emissive: 0x667eea, emissiveIntensity: 0.2 }),
        new THREE.MeshPhongMaterial({ color: 0x764ba2, emissive: 0x764ba2, emissiveIntensity: 0.2 }),
        new THREE.MeshPhongMaterial({ color: 0x667eea, emissive: 0x667eea, emissiveIntensity: 0.2 }),
        new THREE.MeshPhongMaterial({ color: 0x764ba2, emissive: 0x764ba2, emissiveIntensity: 0.2 })
    ];
    
    logoMesh = new THREE.Mesh(geometry, materials);
    scene.add(logoMesh);

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);
    
    const pointLight = new THREE.PointLight(0x667eea, 0.5);
    pointLight.position.set(-5, -5, -5);
    scene.add(pointLight);

    // Position camera
    camera.position.z = 6;

    // Add mouse/touch interaction
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('touchmove', onTouchMove);
    canvas.addEventListener('mouseleave', onMouseLeave);

    // Start animation
    animate3DLogo();
}

function onMouseMove(event) {
    const rect = event.target.getBoundingClientRect();
    mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    targetRotationY = mouseX * Math.PI * 0.5;
    targetRotationX = mouseY * Math.PI * 0.5;
}

function onTouchMove(event) {
    if (event.touches.length > 0) {
        const touch = event.touches[0];
        const rect = event.target.getBoundingClientRect();
        mouseX = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
        mouseY = -((touch.clientY - rect.top) / rect.height) * 2 + 1;
        
        targetRotationY = mouseX * Math.PI * 0.5;
        targetRotationX = mouseY * Math.PI * 0.5;
    }
}

function onMouseLeave() {
    targetRotationX = 0;
    targetRotationY = 0;
}

function animate3DLogo() {
    requestAnimationFrame(animate3DLogo);
    
    if (logoMesh) {
        // Smooth rotation with easing
        logoMesh.rotation.x += (targetRotationX - logoMesh.rotation.x) * 0.05;
        logoMesh.rotation.y += (targetRotationY - logoMesh.rotation.y) * 0.05;
        
        // Auto-rotation when idle
        if (Math.abs(targetRotationX) < 0.01 && Math.abs(targetRotationY) < 0.01) {
            logoMesh.rotation.y += 0.005;
        }
        
        // Pulsing effect
        const scale = 1 + Math.sin(Date.now() * 0.001) * 0.05;
        logoMesh.scale.set(scale, scale, scale);
    }
    
    renderer.render(scene, camera);
}

// =====================================================
// Particle Background Animation
// =====================================================
function initParticleBackground() {
    const canvas = document.getElementById('particle-bg');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const particleCount = 100;

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.radius = Math.random() * 2 + 1;
            this.opacity = Math.random() * 0.5 + 0.2;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
            if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(102, 126, 234, ${this.opacity})`;
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
        particles.forEach((p1, i) => {
            particles.slice(i + 1).forEach(p2 => {
                const distance = Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
                if (distance < 100) {
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = `rgba(102, 126, 234, ${0.1 * (1 - distance / 100)})`;
                    ctx.stroke();
                }
            });
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

// =====================================================
// Anime.js Animations
// =====================================================
function initAnimations() {
    // Hero section text animation
    anime({
        targets: '.hero-title',
        translateY: [-50, 0],
        opacity: [0, 1],
        duration: 1500,
        easing: 'easeOutExpo',
        delay: 500
    });

    anime({
        targets: '.hero-subtitle',
        translateY: [-30, 0],
        opacity: [0, 1],
        duration: 1500,
        easing: 'easeOutExpo',
        delay: 700
    });

    // Feature cards stagger animation
    anime({
        targets: '.feature-card',
        translateY: [50, 0],
        opacity: [0, 1],
        duration: 1000,
        delay: anime.stagger(100, {start: 900}),
        easing: 'easeOutQuad'
    });

    // Floating animation for cards on hover
    document.querySelectorAll('.feature-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            anime({
                targets: this,
                translateY: -10,
                scale: 1.05,
                boxShadow: '0 20px 40px rgba(102, 126, 234, 0.3)',
                duration: 300,
                easing: 'easeOutQuad'
            });
        });

        card.addEventListener('mouseleave', function() {
            anime({
                targets: this,
                translateY: 0,
                scale: 1,
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                duration: 300,
                easing: 'easeOutQuad'
            });
        });
    });

    // Stats counter animation
    const stats = [
        { selector: '#total-questions', value: 402, suffix: '問' },
        { selector: '#categories-count', value: 7, suffix: 'カテゴリー' },
        { selector: '#users-count', value: 1000, suffix: '+' }
    ];

    stats.forEach(stat => {
        if (document.querySelector(stat.selector)) {
            anime({
                targets: stat.selector,
                innerHTML: [0, stat.value],
                duration: 2000,
                easing: 'easeInOutExpo',
                delay: 1200,
                round: 1,
                update: function(anim) {
                    const el = document.querySelector(stat.selector);
                    if (el) {
                        el.innerHTML = Math.round(anim.animations[0].currentValue) + stat.suffix;
                    }
                }
            });
        }
    });
}

// =====================================================
// PWA Installation
// =====================================================
let deferredPrompt;
let installButton;

function initPWA() {
    installButton = document.getElementById('install-button');
    
    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        
        // Show install button with animation
        if (installButton) {
            installButton.style.display = 'flex';
            anime({
                targets: installButton,
                scale: [0, 1],
                opacity: [0, 1],
                duration: 500,
                easing: 'easeOutBack'
            });
        }
    });

    // Handle install button click
    if (installButton) {
        installButton.addEventListener('click', async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                
                if (outcome === 'accepted') {
                    console.log('User accepted the PWA installation');
                    showNotification('アプリがインストールされました！', 'success');
                } else {
                    console.log('User dismissed the PWA installation');
                }
                
                deferredPrompt = null;
                installButton.style.display = 'none';
            }
        });
    }

    // Check if already installed
    window.addEventListener('appinstalled', () => {
        console.log('PWA was installed');
        if (installButton) {
            installButton.style.display = 'none';
        }
        showNotification('宅建BOOSTがインストールされました！', 'success');
    });

    // iOS install instructions
    if (isIOS() && !isInStandaloneMode()) {
        showIOSInstallPrompt();
    }
}

function isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

function isInStandaloneMode() {
    return window.matchMedia('(display-mode: standalone)').matches || 
           window.navigator.standalone === true;
}

function showIOSInstallPrompt() {
    const iosPrompt = document.createElement('div');
    iosPrompt.className = 'ios-install-prompt';
    iosPrompt.innerHTML = `
        <div class="ios-prompt-content">
            <h3>📱 iOSでのインストール方法</h3>
            <p>このアプリをホーム画面に追加するには：</p>
            <ol>
                <li>Safari下部の <i class="fas fa-share-square"></i> 共有ボタンをタップ</li>
                <li>「ホーム画面に追加」を選択</li>
                <li>「追加」をタップ</li>
            </ol>
            <button onclick="this.parentElement.parentElement.remove()" class="close-btn">
                <i class="fas fa-times"></i> 閉じる
            </button>
        </div>
    `;
    
    document.body.appendChild(iosPrompt);
    
    anime({
        targets: '.ios-install-prompt',
        translateY: [100, 0],
        opacity: [0, 1],
        duration: 500,
        easing: 'easeOutQuad'
    });
}

// =====================================================
// Feature Navigation
// =====================================================
function initFeatureNavigation() {
    const features = [
        { id: 'study-mode', path: '/study', icon: 'fa-book-open', title: '学習モード' },
        { id: 'mock-exam', path: '/mock-exam', icon: 'fa-file-alt', title: '模擬試験' },
        { id: 'progress', path: '/progress', icon: 'fa-chart-line', title: '進捗管理' },
        { id: 'weak-points', path: '/weak-points', icon: 'fa-exclamation-triangle', title: '弱点分析' },
        { id: 'notifications', path: '/notifications', icon: 'fa-bell', title: '通知設定' },
        { id: 'tutorial', path: '/tutorial', icon: 'fa-graduation-cap', title: 'チュートリアル' }
    ];

    features.forEach(feature => {
        const card = document.getElementById(feature.id);
        if (card) {
            card.addEventListener('click', () => {
                // Ripple effect animation
                const ripple = document.createElement('div');
                ripple.className = 'ripple';
                card.appendChild(ripple);
                
                anime({
                    targets: ripple,
                    scale: [0, 4],
                    opacity: [1, 0],
                    duration: 600,
                    easing: 'easeOutQuad',
                    complete: () => ripple.remove()
                });

                // Navigate after animation
                setTimeout(() => {
                    if (feature.id === 'tutorial') {
                        showTutorial();
                    } else {
                        window.location.href = feature.path;
                    }
                }, 300);
            });
        }
    });
}

// =====================================================
// Tutorial System
// =====================================================
function showTutorial() {
    const tutorialSteps = [
        {
            title: 'ようこそ宅建BOOST v9.0.0へ！',
            content: '新しいデザインと機能強化されたアプリケーションをご紹介します。',
            image: '🚀'
        },
        {
            title: '3Dインタラクション',
            content: '画面上部の3Dロゴにマウスを当ててみてください。インタラクティブな体験をお楽しみください。',
            image: '🎮'
        },
        {
            title: '学習モード',
            content: '402問の問題データベースから効率的に学習できます。カテゴリー別、難易度別に問題を選択可能です。',
            image: '📚'
        },
        {
            title: '模擬試験',
            content: '本番同様の50問形式で実力を測定。詳細な解説付きで理解を深めます。',
            image: '📝'
        },
        {
            title: '進捗管理',
            content: 'AI分析による弱点診断と学習提案。グラフで視覚的に進捗を確認できます。',
            image: '📊'
        },
        {
            title: 'PWAインストール',
            content: 'アプリをホーム画面に追加して、オフラインでも学習を継続できます。',
            image: '📱'
        }
    ];

    let currentStep = 0;

    const tutorialModal = document.createElement('div');
    tutorialModal.className = 'tutorial-modal';
    tutorialModal.innerHTML = `
        <div class="tutorial-content">
            <div class="tutorial-header">
                <span class="tutorial-progress">${currentStep + 1} / ${tutorialSteps.length}</span>
                <button class="tutorial-close" onclick="this.closest('.tutorial-modal').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="tutorial-body">
                <div class="tutorial-icon">${tutorialSteps[currentStep].image}</div>
                <h2 class="tutorial-title">${tutorialSteps[currentStep].title}</h2>
                <p class="tutorial-text">${tutorialSteps[currentStep].content}</p>
            </div>
            <div class="tutorial-footer">
                <button class="tutorial-prev" ${currentStep === 0 ? 'disabled' : ''}>
                    <i class="fas fa-chevron-left"></i> 前へ
                </button>
                <div class="tutorial-dots">
                    ${tutorialSteps.map((_, i) => `
                        <span class="dot ${i === currentStep ? 'active' : ''}"></span>
                    `).join('')}
                </div>
                <button class="tutorial-next">
                    ${currentStep === tutorialSteps.length - 1 ? '完了' : '次へ'} 
                    <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(tutorialModal);

    // Tutorial navigation
    const updateTutorial = () => {
        const body = tutorialModal.querySelector('.tutorial-body');
        const progress = tutorialModal.querySelector('.tutorial-progress');
        const dots = tutorialModal.querySelectorAll('.dot');
        const prevBtn = tutorialModal.querySelector('.tutorial-prev');
        const nextBtn = tutorialModal.querySelector('.tutorial-next');

        body.innerHTML = `
            <div class="tutorial-icon">${tutorialSteps[currentStep].image}</div>
            <h2 class="tutorial-title">${tutorialSteps[currentStep].title}</h2>
            <p class="tutorial-text">${tutorialSteps[currentStep].content}</p>
        `;

        progress.textContent = `${currentStep + 1} / ${tutorialSteps.length}`;
        
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === currentStep);
        });

        prevBtn.disabled = currentStep === 0;
        nextBtn.innerHTML = currentStep === tutorialSteps.length - 1 ? 
            '完了 <i class="fas fa-check"></i>' : 
            '次へ <i class="fas fa-chevron-right"></i>';

        // Animate content change
        anime({
            targets: body,
            opacity: [0, 1],
            translateX: [-20, 0],
            duration: 300,
            easing: 'easeOutQuad'
        });
    };

    tutorialModal.querySelector('.tutorial-prev').addEventListener('click', () => {
        if (currentStep > 0) {
            currentStep--;
            updateTutorial();
        }
    });

    tutorialModal.querySelector('.tutorial-next').addEventListener('click', () => {
        if (currentStep < tutorialSteps.length - 1) {
            currentStep++;
            updateTutorial();
        } else {
            anime({
                targets: tutorialModal,
                opacity: [1, 0],
                scale: [1, 0.9],
                duration: 300,
                easing: 'easeInQuad',
                complete: () => tutorialModal.remove()
            });
        }
    });

    // Initial animation
    anime({
        targets: tutorialModal,
        opacity: [0, 1],
        scale: [0.9, 1],
        duration: 300,
        easing: 'easeOutQuad'
    });
}

// =====================================================
// Notification System
// =====================================================
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };

    notification.innerHTML = `
        <i class="fas ${icons[type]}"></i>
        <span>${message}</span>
    `;

    document.body.appendChild(notification);

    anime({
        targets: notification,
        translateX: [300, 0],
        opacity: [0, 1],
        duration: 500,
        easing: 'easeOutQuad'
    });

    setTimeout(() => {
        anime({
            targets: notification,
            translateX: [0, 300],
            opacity: [1, 0],
            duration: 500,
            easing: 'easeInQuad',
            complete: () => notification.remove()
        });
    }, 3000);
}

// =====================================================
// Loading Animation
// =====================================================
function showLoadingAnimation() {
    const loader = document.createElement('div');
    loader.className = 'loading-overlay';
    loader.innerHTML = `
        <div class="loading-cube">
            <div class="cube-face cube-face-front">宅</div>
            <div class="cube-face cube-face-back">建</div>
            <div class="cube-face cube-face-left">B</div>
            <div class="cube-face cube-face-right">O</div>
            <div class="cube-face cube-face-top">O</div>
            <div class="cube-face cube-face-bottom">ST</div>
        </div>
        <p class="loading-text">読み込み中...</p>
    `;

    document.body.appendChild(loader);

    anime({
        targets: '.loading-cube',
        rotateX: 360,
        rotateY: 360,
        duration: 2000,
        easing: 'easeInOutQuad',
        loop: true
    });

    return loader;
}

function hideLoadingAnimation(loader) {
    anime({
        targets: loader,
        opacity: [1, 0],
        duration: 500,
        easing: 'easeOutQuad',
        complete: () => loader.remove()
    });
}

// =====================================================
// Performance Monitoring
// =====================================================
function initPerformanceMonitoring() {
    // Monitor page load performance
    window.addEventListener('load', () => {
        const perfData = performance.getEntriesByType('navigation')[0];
        if (perfData) {
            console.log('Page Load Metrics:', {
                domContentLoaded: Math.round(perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart),
                loadComplete: Math.round(perfData.loadEventEnd - perfData.loadEventStart),
                totalTime: Math.round(perfData.loadEventEnd - perfData.fetchStart)
            });

            // Send performance data to analytics (if needed)
            if (perfData.loadEventEnd - perfData.fetchStart > 3000) {
                console.warn('Page load time exceeded 3 seconds');
            }
        }
    });

    // Monitor memory usage (if available)
    if (performance.memory) {
        setInterval(() => {
            const memoryUsage = {
                usedJSHeapSize: (performance.memory.usedJSHeapSize / 1048576).toFixed(2) + ' MB',
                totalJSHeapSize: (performance.memory.totalJSHeapSize / 1048576).toFixed(2) + ' MB',
                limit: (performance.memory.jsHeapSizeLimit / 1048576).toFixed(2) + ' MB'
            };
            console.log('Memory Usage:', memoryUsage);
        }, 30000); // Check every 30 seconds
    }
}

// =====================================================
// Keyboard Shortcuts
// =====================================================
function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + key combinations
        if (e.ctrlKey || e.metaKey) {
            switch(e.key) {
                case 's': // Study mode
                    e.preventDefault();
                    window.location.href = '/study';
                    break;
                case 'e': // Exam mode
                    e.preventDefault();
                    window.location.href = '/mock-exam';
                    break;
                case 'p': // Progress
                    e.preventDefault();
                    window.location.href = '/progress';
                    break;
                case 'h': // Home
                    e.preventDefault();
                    window.location.href = '/';
                    break;
                case '?': // Help/Tutorial
                    e.preventDefault();
                    showTutorial();
                    break;
            }
        }

        // ESC to close modals
        if (e.key === 'Escape') {
            const modals = document.querySelectorAll('.tutorial-modal, .ios-install-prompt');
            modals.forEach(modal => modal.remove());
        }
    });
}

// =====================================================
// Theme Customization
// =====================================================
function initThemeCustomization() {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme') || 'purple';
    applyTheme(savedTheme);

    // Theme switcher (if added to UI)
    const themeSwitcher = document.getElementById('theme-switcher');
    if (themeSwitcher) {
        themeSwitcher.addEventListener('change', (e) => {
            const theme = e.target.value;
            applyTheme(theme);
            localStorage.setItem('theme', theme);
        });
    }
}

function applyTheme(theme) {
    const themes = {
        purple: {
            primary: '#667eea',
            secondary: '#764ba2',
            accent: '#f093fb'
        },
        blue: {
            primary: '#4facfe',
            secondary: '#00f2fe',
            accent: '#43e97b'
        },
        sunset: {
            primary: '#fa709a',
            secondary: '#fee140',
            accent: '#f093fb'
        }
    };

    const selectedTheme = themes[theme] || themes.purple;
    
    document.documentElement.style.setProperty('--color-primary', selectedTheme.primary);
    document.documentElement.style.setProperty('--color-secondary', selectedTheme.secondary);
    document.documentElement.style.setProperty('--color-accent', selectedTheme.accent);
}

// =====================================================
// Initialize Everything
// =====================================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 宅建BOOST v9.0.0 Ultimate Edition Initializing...');
    
    // Core initializations
    init3DLogo();
    initParticleBackground();
    initAnimations();
    initPWA();
    initFeatureNavigation();
    initKeyboardShortcuts();
    initThemeCustomization();
    initPerformanceMonitoring();

    // Welcome message with version info
    console.log('%c宅建BOOST v9.0.0 Ultimate Edition', 
        'font-size: 24px; font-weight: bold; ' +
        'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); ' +
        'color: white; padding: 10px 20px; border-radius: 10px;');
    
    console.log('%c✨ Features: Three.js 3D Graphics | Anime.js Animations | PWA Support | 402 Questions Database', 
        'font-size: 12px; color: #667eea;');

    // Check for updates
    checkForUpdates();
});

// =====================================================
// Update Checker
// =====================================================
async function checkForUpdates() {
    try {
        const response = await fetch('/api/version');
        const data = await response.json();
        
        const currentVersion = 'v9.0.0';
        if (data.version !== currentVersion) {
            console.log(`📦 New version available: ${data.version}`);
            showNotification(`新しいバージョン ${data.version} が利用可能です`, 'info');
        }
    } catch (error) {
        console.log('Version check skipped:', error.message);
    }
}

// =====================================================
// Service Worker Registration
// =====================================================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw-v9.js')
            .then(registration => {
                console.log('ServiceWorker registration successful:', registration.scope);
                
                // Check for updates periodically
                setInterval(() => {
                    registration.update();
                }, 3600000); // Check every hour
            })
            .catch(err => {
                console.log('ServiceWorker registration failed:', err);
            });
    });
}

// =====================================================
// Export for use in other modules
// =====================================================
window.TakkenBoost = {
    showNotification,
    showLoadingAnimation,
    hideLoadingAnimation,
    showTutorial,
    init3DLogo,
    initAnimations
};

console.log('✅ 宅建BOOST v9.0.0 Ultimate Edition - Ready!');
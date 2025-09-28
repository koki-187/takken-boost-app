// 宅建BOOST Enhanced App JavaScript
class TakkenBoostApp {
    constructor() {
        this.init();
        this.setupAnimations();
        this.setupInteractions();
    }
    
    init() {
        // ローカルストレージからユーザー情報を取得
        this.userId = localStorage.getItem('userId');
        this.userName = localStorage.getItem('userName');
        
        // テーマ設定
        this.theme = localStorage.getItem('theme') || 'light';
        this.applyTheme();
        
        // 初回訪問チェック
        if (!localStorage.getItem('hasVisited')) {
            this.showWelcome();
            localStorage.setItem('hasVisited', 'true');
        }
    }
    
    setupAnimations() {
        // スクロールアニメーション
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);
        
        document.querySelectorAll('.glass-card').forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'all 0.6s ease';
            observer.observe(card);
        });
        
        // カードのティルト効果
        this.setupTiltEffect();
    }
    
    setupTiltEffect() {
        const cards = document.querySelectorAll('.card-3d');
        
        cards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = (y - centerY) / 10;
                const rotateY = (centerX - x) / 10;
                
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
            });
            
            // タッチデバイス対応
            card.addEventListener('touchmove', (e) => {
                if (e.touches.length > 0) {
                    const touch = e.touches[0];
                    const rect = card.getBoundingClientRect();
                    const x = touch.clientX - rect.left;
                    const y = touch.clientY - rect.top;
                    
                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;
                    
                    const rotateX = (y - centerY) / 20;
                    const rotateY = (centerX - x) / 20;
                    
                    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
                }
            });
            
            card.addEventListener('touchend', () => {
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
            });
        });
    }
    
    setupInteractions() {
        // テーマトグル
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }
        
        // ヘルプボタン
        const helpButton = document.getElementById('help-button');
        if (helpButton) {
            helpButton.addEventListener('click', () => {
                this.showHelp();
            });
        }
        
        // チュートリアルボタン
        const tutorialButton = document.getElementById('tutorial-button');
        if (tutorialButton) {
            tutorialButton.addEventListener('click', () => {
                this.startTutorial();
            });
        }
        
        // キーボードショートカット
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F1') {
                e.preventDefault();
                this.showHelp();
            }
            if (e.ctrlKey && e.key === 'k') {
                e.preventDefault();
                this.showSearchModal();
            }
        });
    }
    
    applyTheme() {
        if (this.theme === 'dark') {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme');
        }
    }
    
    toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', this.theme);
        this.applyTheme();
        
        // アニメーション付きで切り替え
        document.body.style.transition = 'background 0.3s ease';
    }
    
    showWelcome() {
        // Anime.jsを使用したウェルカムアニメーション
        if (typeof anime !== 'undefined') {
            const timeline = anime.timeline({
                easing: 'easeOutExpo',
                duration: 1500
            });
            
            timeline
                .add({
                    targets: 'h1',
                    scale: [0, 1],
                    opacity: [0, 1],
                    duration: 1000
                })
                .add({
                    targets: '.glass-card',
                    translateY: [100, 0],
                    opacity: [0, 1],
                    delay: anime.stagger(100)
                }, '-=500');
        }
    }
    
    showHelp() {
        // ヘルプモーダルを表示
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4';
        modal.innerHTML = `
            <div class="glass-card rounded-2xl p-6 max-w-2xl max-h-[80vh] overflow-auto">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-2xl font-bold text-white">ヘルプ & サポート</h2>
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" class="text-white/60 hover:text-white">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                <div class="space-y-4 text-white/80">
                    <div>
                        <h3 class="font-bold text-white mb-2">🚀 クイックスタート</h3>
                        <p>カテゴリー学習から始めて、基礎を固めましょう。</p>
                    </div>
                    <div>
                        <h3 class="font-bold text-white mb-2">📚 学習の進め方</h3>
                        <p>1日30分以上、継続的に学習することが重要です。</p>
                    </div>
                    <div>
                        <h3 class="font-bold text-white mb-2">🤖 AI機能の活用</h3>
                        <p>AI分析で弱点を特定し、効率的に学習しましょう。</p>
                    </div>
                    <div>
                        <h3 class="font-bold text-white mb-2">📱 モバイルアプリ</h3>
                        <p>PWAをインストールして、オフラインでも学習可能です。</p>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // クリックで閉じる
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
    
    startTutorial() {
        // インタラクティブチュートリアル
        const steps = [
            {
                element: '.category-study',
                title: 'カテゴリー学習',
                description: 'まずはカテゴリー別に基礎を学びましょう'
            },
            {
                element: '.mock-exam',
                title: '模擬試験',
                description: '実力をチェックするために模擬試験を受けましょう'
            },
            {
                element: '.ai-analysis',
                title: 'AI分析',
                description: 'AIが学習データを分析して最適なプランを提案'
            }
        ];
        
        let currentStep = 0;
        
        function showStep(index) {
            if (index >= steps.length) {
                return;
            }
            
            const step = steps[index];
            const element = document.querySelector(step.element);
            
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                element.classList.add('highlight');
                
                // ツールチップを表示
                const tooltip = document.createElement('div');
                tooltip.className = 'fixed z-50 glass-card rounded-lg p-4 max-w-xs';
                tooltip.innerHTML = `
                    <h4 class="font-bold text-white mb-2">${step.title}</h4>
                    <p class="text-white/80 text-sm mb-3">${step.description}</p>
                    <div class="flex justify-between">
                        <button onclick="window.endTutorial()" class="text-white/60 text-sm">スキップ</button>
                        <button onclick="window.nextTutorialStep()" class="bg-white/20 text-white px-3 py-1 rounded">
                            次へ <i class="fas fa-arrow-right ml-1"></i>
                        </button>
                    </div>
                `;
                
                const rect = element.getBoundingClientRect();
                tooltip.style.top = `${rect.bottom + 10}px`;
                tooltip.style.left = `${rect.left}px`;
                
                document.body.appendChild(tooltip);
                
                window.currentTooltip = tooltip;
            }
        }
        
        window.nextTutorialStep = () => {
            if (window.currentTooltip) {
                window.currentTooltip.remove();
            }
            document.querySelectorAll('.highlight').forEach(el => {
                el.classList.remove('highlight');
            });
            currentStep++;
            if (currentStep < steps.length) {
                showStep(currentStep);
            } else {
                window.endTutorial();
            }
        };
        
        window.endTutorial = () => {
            if (window.currentTooltip) {
                window.currentTooltip.remove();
            }
            document.querySelectorAll('.highlight').forEach(el => {
                el.classList.remove('highlight');
            });
        };
        
        showStep(0);
    }
    
    showSearchModal() {
        // 検索モーダル
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4';
        modal.innerHTML = `
            <div class="glass-card rounded-2xl p-6 max-w-lg w-full">
                <div class="flex items-center mb-4">
                    <i class="fas fa-search text-white mr-3"></i>
                    <input type="text" placeholder="機能を検索..." class="bg-white/10 text-white placeholder-white/50 w-full px-3 py-2 rounded-lg outline-none focus:bg-white/20">
                </div>
                <div class="text-white/60 text-sm">
                    Ctrl+K でいつでも検索できます
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // 自動フォーカス
        modal.querySelector('input').focus();
        
        // ESCで閉じる
        modal.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                modal.remove();
            }
        });
        
        // クリックで閉じる
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
}

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    window.takkenBoostApp = new TakkenBoostApp();
});
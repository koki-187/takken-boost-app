// 宅建BOOST Complete Version - Main Application JavaScript
// Version: 8.0.0 - Ultimate Edition

class TakkenBoostApp {
    constructor() {
        this.currentUser = null;
        this.currentView = 'home';
        this.studySession = null;
        this.mockExam = null;
        this.tutorial = {
            active: false,
            step: 0,
            completed: localStorage.getItem('tutorialCompleted') === 'true'
        };
        this.animations = {
            enabled: localStorage.getItem('animationsEnabled') !== 'false'
        };
        this.theme = localStorage.getItem('theme') || 'metallic';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initServiceWorker();
        this.check3DSupport();
        this.loadUserSession();
        this.initializeAnimations();
        
        // Show tutorial for first-time users
        if (!this.tutorial.completed) {
            setTimeout(() => this.startTutorial(), 1000);
        }
    }

    // 3D Icon Support Check
    check3DSupport() {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        this.has3DSupport = !!gl;
        
        if (this.has3DSupport) {
            document.body.classList.add('supports-3d');
        }
    }

    // Initialize Animations
    initializeAnimations() {
        if (!this.animations.enabled) return;

        // Particle background effect
        this.createParticleBackground();
        
        // 3D card hover effects
        this.init3DCards();
        
        // Smooth scroll animations
        this.initSmoothScroll();
        
        // Loading animations
        this.initLoadingAnimations();
    }

    // Particle Background Effect
    createParticleBackground() {
        const particlesContainer = document.createElement('div');
        particlesContainer.className = 'particles-bg';
        particlesContainer.innerHTML = `
            <canvas id="particles-canvas"></canvas>
            <style>
                .particles-bg {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    z-index: -1;
                    opacity: 0.3;
                }
                #particles-canvas {
                    width: 100%;
                    height: 100%;
                }
            </style>
        `;
        document.body.appendChild(particlesContainer);

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
                this.color = `hsla(${200 + Math.random() * 60}, 70%, 50%, 0.8)`;
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
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Create particles
        for (let i = 0; i < 50; i++) {
            particles.push(new Particle());
        }

        // Animation loop
        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(particle => {
                particle.update();
                particle.draw();
            });
            requestAnimationFrame(animate);
        }

        if (this.animations.enabled) {
            animate();
        }

        // Resize handler
        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });
    }

    // 3D Card Effects
    init3DCards() {
        document.addEventListener('mousemove', (e) => {
            const cards = document.querySelectorAll('.card-3d');
            cards.forEach(card => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = (y - centerY) / 10;
                const rotateY = (centerX - x) / 10;
                
                if (e.clientX >= rect.left && e.clientX <= rect.right &&
                    e.clientY >= rect.top && e.clientY <= rect.bottom) {
                    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
                } else {
                    card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
                }
            });
        });
    }

    // Interactive Tutorial System
    startTutorial() {
        this.tutorial.active = true;
        const tutorialSteps = [
            {
                element: '.navbar-brand',
                title: '宅建BOOSTへようこそ！',
                content: 'これから宅建試験合格への道をサポートします。',
                position: 'bottom'
            },
            {
                element: '#categoryStudyBtn',
                title: 'カテゴリ学習',
                content: '4つのカテゴリから選んで効率的に学習できます。',
                position: 'bottom'
            },
            {
                element: '#mockExamBtn',
                title: '模擬試験',
                content: '本番形式の模擬試験で実力を確認しましょう。',
                position: 'bottom'
            },
            {
                element: '#statsBtn',
                title: '学習統計',
                content: 'あなたの学習進捗を詳しく分析します。',
                position: 'bottom'
            },
            {
                element: '#profileBtn',
                title: 'プロファイル',
                content: '学習目標や設定をカスタマイズできます。',
                position: 'left'
            }
        ];

        this.showTutorialStep(tutorialSteps[this.tutorial.step]);
        this.initTutorialControls(tutorialSteps);
    }

    showTutorialStep(step) {
        // Remove existing tutorial overlay
        const existingOverlay = document.querySelector('.tutorial-overlay');
        if (existingOverlay) {
            existingOverlay.remove();
        }

        const overlay = document.createElement('div');
        overlay.className = 'tutorial-overlay';
        overlay.innerHTML = `
            <div class="tutorial-backdrop"></div>
            <div class="tutorial-spotlight"></div>
            <div class="tutorial-tooltip ${step.position}">
                <div class="tutorial-header">
                    <h3>${step.title}</h3>
                    <button class="tutorial-close" onclick="app.endTutorial()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <p>${step.content}</p>
                <div class="tutorial-footer">
                    <div class="tutorial-progress">
                        <div class="progress-bar" style="width: ${((this.tutorial.step + 1) / 5) * 100}%"></div>
                    </div>
                    <div class="tutorial-buttons">
                        ${this.tutorial.step > 0 ? '<button onclick="app.previousTutorialStep()">前へ</button>' : ''}
                        ${this.tutorial.step < 4 ? '<button onclick="app.nextTutorialStep()" class="primary">次へ</button>' : 
                          '<button onclick="app.completeTutorial()" class="success">完了</button>'}
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        // Highlight target element
        const targetElement = document.querySelector(step.element);
        if (targetElement) {
            const rect = targetElement.getBoundingClientRect();
            const spotlight = overlay.querySelector('.tutorial-spotlight');
            spotlight.style.left = `${rect.left - 10}px`;
            spotlight.style.top = `${rect.top - 10}px`;
            spotlight.style.width = `${rect.width + 20}px`;
            spotlight.style.height = `${rect.height + 20}px`;
            
            // Position tooltip
            const tooltip = overlay.querySelector('.tutorial-tooltip');
            if (step.position === 'bottom') {
                tooltip.style.left = `${rect.left + rect.width/2}px`;
                tooltip.style.top = `${rect.bottom + 20}px`;
            } else if (step.position === 'left') {
                tooltip.style.right = `${window.innerWidth - rect.left + 20}px`;
                tooltip.style.top = `${rect.top}px`;
            }
        }
    }

    // Email Notification System
    async sendEmailNotification(type, data) {
        try {
            const response = await fetch('/api/notifications/email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type,
                    userId: this.currentUser?.id,
                    data
                })
            });

            if (!response.ok) {
                throw new Error('Failed to send email notification');
            }

            const result = await response.json();
            if (result.success) {
                this.showNotification('メール通知を送信しました', 'success');
            }
        } catch (error) {
            console.error('Email notification error:', error);
        }
    }

    // Study Session Management
    async startStudySession(category, difficulty) {
        this.showLoading();
        try {
            const response = await fetch(`/api/study/questions?category=${category}&difficulty=${difficulty}&limit=10`);
            const data = await response.json();
            
            if (data.success) {
                this.studySession = {
                    questions: data.questions,
                    currentIndex: 0,
                    answers: [],
                    startTime: Date.now(),
                    category,
                    difficulty
                };
                this.displayQuestion();
            }
        } catch (error) {
            this.showNotification('問題の読み込みに失敗しました', 'error');
        } finally {
            this.hideLoading();
        }
    }

    displayQuestion() {
        if (!this.studySession || this.studySession.currentIndex >= this.studySession.questions.length) {
            this.completeStudySession();
            return;
        }

        const question = this.studySession.questions[this.studySession.currentIndex];
        const container = document.getElementById('studyContainer');
        
        container.innerHTML = `
            <div class="question-card card-3d animated-fade-in">
                <div class="question-header">
                    <span class="question-number">問題 ${this.studySession.currentIndex + 1} / ${this.studySession.questions.length}</span>
                    <span class="question-category">${question.category}</span>
                    <span class="question-difficulty difficulty-${question.difficulty}">${this.getDifficultyLabel(question.difficulty)}</span>
                </div>
                <div class="question-content">
                    <h3>${question.question_text}</h3>
                </div>
                <div class="answer-options">
                    ${JSON.parse(question.options).map((option, index) => `
                        <button class="answer-option animated-slide-in" onclick="app.selectAnswer(${index + 1})" style="animation-delay: ${index * 0.1}s">
                            <span class="option-number">${index + 1}</span>
                            <span class="option-text">${option}</span>
                        </button>
                    `).join('')}
                </div>
                <div class="question-timer">
                    <i class="fas fa-clock"></i>
                    <span id="questionTimer">00:00</span>
                </div>
            </div>
        `;

        // Start timer
        this.startQuestionTimer();
    }

    // Mock Exam System
    async startMockExam(examType) {
        this.showLoading();
        try {
            const response = await fetch('/api/mock-exam/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: this.currentUser?.id || 1,
                    examType
                })
            });

            const data = await response.json();
            if (data.success) {
                this.mockExam = {
                    sessionId: data.sessionId,
                    examId: data.examId,
                    questions: data.questions,
                    currentIndex: 0,
                    answers: {},
                    startTime: Date.now(),
                    timeLimit: data.timeLimit,
                    examType
                };
                this.displayMockExam();
                this.startExamTimer();
            }
        } catch (error) {
            this.showNotification('模擬試験の開始に失敗しました', 'error');
        } finally {
            this.hideLoading();
        }
    }

    // Statistics Visualization
    async displayStatistics() {
        const response = await fetch(`/api/study/stats/${this.currentUser?.id || 1}`);
        const data = await response.json();
        
        if (data.success) {
            this.renderStatisticsCharts(data.stats);
        }
    }

    renderStatisticsCharts(stats) {
        const container = document.getElementById('statsContainer');
        container.innerHTML = `
            <div class="stats-dashboard">
                <div class="stats-summary animated-fade-in">
                    <div class="stat-card card-3d">
                        <i class="fas fa-book-open fa-3x"></i>
                        <h3>${stats.total_answered || 0}</h3>
                        <p>総回答数</p>
                    </div>
                    <div class="stat-card card-3d">
                        <i class="fas fa-check-circle fa-3x"></i>
                        <h3>${stats.correct_answers || 0}</h3>
                        <p>正解数</p>
                    </div>
                    <div class="stat-card card-3d">
                        <i class="fas fa-percentage fa-3x"></i>
                        <h3>${Math.round(stats.accuracy || 0)}%</h3>
                        <p>正答率</p>
                    </div>
                    <div class="stat-card card-3d">
                        <i class="fas fa-trophy fa-3x"></i>
                        <h3>${this.calculateRank(stats.accuracy)}</h3>
                        <p>ランク</p>
                    </div>
                </div>
                <div class="charts-container">
                    <canvas id="progressChart"></canvas>
                    <canvas id="categoryChart"></canvas>
                </div>
            </div>
        `;

        // Create charts using Chart.js
        this.createProgressChart();
        this.createCategoryChart();
    }

    // Utility Functions
    getDifficultyLabel(difficulty) {
        const labels = {
            'basic': '初級',
            'intermediate': '中級',
            'advanced': '上級'
        };
        return labels[difficulty] || difficulty;
    }

    calculateRank(accuracy) {
        if (accuracy >= 90) return 'S';
        if (accuracy >= 80) return 'A';
        if (accuracy >= 70) return 'B';
        if (accuracy >= 60) return 'C';
        return 'D';
    }

    showLoading() {
        const loader = document.createElement('div');
        loader.className = 'loading-overlay';
        loader.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner-cube">
                    <div class="face1"></div>
                    <div class="face2"></div>
                    <div class="face3"></div>
                    <div class="face4"></div>
                    <div class="face5"></div>
                    <div class="face6"></div>
                </div>
                <p>読み込み中...</p>
            </div>
        `;
        document.body.appendChild(loader);
    }

    hideLoading() {
        const loader = document.querySelector('.loading-overlay');
        if (loader) {
            loader.classList.add('fade-out');
            setTimeout(() => loader.remove(), 300);
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type} animated-slide-in`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Service Worker
    async initServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/service-worker.js');
                console.log('Service Worker registered:', registration);
            } catch (error) {
                console.error('Service Worker registration failed:', error);
            }
        }
    }

    // Event Listeners
    setupEventListeners() {
        // Navigation
        document.querySelectorAll('[data-view]').forEach(element => {
            element.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigateTo(element.dataset.view);
            });
        });

        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Animation toggle
        const animationToggle = document.getElementById('animationToggle');
        if (animationToggle) {
            animationToggle.addEventListener('click', () => this.toggleAnimations());
        }
    }

    navigateTo(view) {
        this.currentView = view;
        document.querySelectorAll('.view-container').forEach(container => {
            container.classList.remove('active');
        });
        document.getElementById(`${view}View`)?.classList.add('active');
    }

    toggleTheme() {
        this.theme = this.theme === 'metallic' ? 'dark' : 'metallic';
        document.body.className = `theme-${this.theme}`;
        localStorage.setItem('theme', this.theme);
    }

    toggleAnimations() {
        this.animations.enabled = !this.animations.enabled;
        localStorage.setItem('animationsEnabled', this.animations.enabled);
        if (!this.animations.enabled) {
            document.querySelectorAll('.particles-bg').forEach(el => el.remove());
        } else {
            this.createParticleBackground();
        }
    }

    // Tutorial Controls
    nextTutorialStep() {
        this.tutorial.step++;
        this.startTutorial();
    }

    previousTutorialStep() {
        this.tutorial.step--;
        this.startTutorial();
    }

    completeTutorial() {
        this.tutorial.completed = true;
        localStorage.setItem('tutorialCompleted', 'true');
        this.endTutorial();
        this.showNotification('チュートリアル完了！学習を始めましょう', 'success');
    }

    endTutorial() {
        this.tutorial.active = false;
        document.querySelector('.tutorial-overlay')?.remove();
    }

    // Session Management
    loadUserSession() {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.updateUIForLoggedInUser();
        }
    }

    updateUIForLoggedInUser() {
        // Update UI elements for logged in state
        document.querySelectorAll('.auth-required').forEach(el => {
            el.classList.remove('hidden');
        });
        document.querySelectorAll('.guest-only').forEach(el => {
            el.classList.add('hidden');
        });
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new TakkenBoostApp();
});
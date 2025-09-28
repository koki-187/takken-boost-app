// TakkenBoost App v5.0.0 - Main Application Logic

class TakkenBoostApp {
    constructor() {
        this.currentView = 'dashboard';
        this.currentCategory = null;
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
        this.score = 0;
        this.timer = null;
        this.timeLeft = 7200; // 2 hours in seconds
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.registerServiceWorker();
        this.setupInstallPrompt();
        this.loadDashboard();
    }

    // Register Service Worker for PWA functionality
    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then((registration) => {
                    console.log('ServiceWorker registration successful:', registration.scope);
                    
                    // Check for updates periodically
                    setInterval(() => {
                        registration.update();
                    }, 60000); // Check every minute
                })
                .catch((err) => {
                    console.log('ServiceWorker registration failed:', err);
                });
        }
    }

    // Setup PWA install prompt
    setupInstallPrompt() {
        let deferredPrompt;
        
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            
            // Show custom install button
            this.showInstallButton(deferredPrompt);
        });

        // Detect if app was installed
        window.addEventListener('appinstalled', () => {
            console.log('PWA was installed');
            this.hideInstallButton();
        });
    }

    showInstallButton(deferredPrompt) {
        const installBanner = document.createElement('div');
        installBanner.id = 'pwa-install-banner';
        installBanner.className = 'fixed bottom-4 left-4 right-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-lg shadow-lg z-50 animate__animated animate__slideInUp';
        installBanner.innerHTML = `
            <div class="flex items-center justify-between">
                <div>
                    <h3 class="font-bold text-lg">アプリをインストール</h3>
                    <p class="text-sm opacity-90">ホーム画面に追加して快適に学習</p>
                </div>
                <div class="flex gap-2">
                    <button id="install-now" class="bg-white text-purple-600 px-4 py-2 rounded-md font-semibold hover:bg-gray-100 transition-colors">
                        インストール
                    </button>
                    <button id="install-later" class="text-white opacity-75 hover:opacity-100">
                        後で
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(installBanner);

        document.getElementById('install-now').addEventListener('click', () => {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('User accepted the install prompt');
                }
                deferredPrompt = null;
                this.hideInstallButton();
            });
        });

        document.getElementById('install-later').addEventListener('click', () => {
            this.hideInstallButton();
        });
    }

    hideInstallButton() {
        const banner = document.getElementById('pwa-install-banner');
        if (banner) {
            banner.classList.add('animate__animated', 'animate__slideOutDown');
            setTimeout(() => banner.remove(), 500);
        }
    }

    setupEventListeners() {
        // Navigation
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('nav-link')) {
                e.preventDefault();
                const view = e.target.dataset.view;
                this.navigateTo(view);
            }

            // Category selection
            if (e.target.classList.contains('category-btn')) {
                const category = e.target.dataset.category;
                this.startCategoryLearning(category);
            }

            // Answer selection
            if (e.target.classList.contains('answer-btn')) {
                const answer = e.target.dataset.answer;
                this.selectAnswer(answer);
            }

            // Next question
            if (e.target.id === 'next-btn') {
                this.nextQuestion();
            }

            // Start mock exam
            if (e.target.id === 'start-mock-exam') {
                this.startMockExam();
            }
        });
    }

    navigateTo(view) {
        this.currentView = view;
        
        switch(view) {
            case 'dashboard':
                this.loadDashboard();
                break;
            case 'learning':
                this.loadLearningView();
                break;
            case 'mock-exam':
                this.loadMockExamView();
                break;
            case 'statistics':
                this.loadStatisticsView();
                break;
            case 'settings':
                this.loadSettingsView();
                break;
        }
    }

    async loadDashboard() {
        const response = await fetch('/api/user/progress');
        const data = await response.json();
        
        const mainContent = document.getElementById('main-content');
        mainContent.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div class="card-3d bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6 transform transition-all hover:scale-105">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-semibold text-gray-800">学習進捗</h3>
                        <i class="fas fa-chart-line text-2xl text-purple-600"></i>
                    </div>
                    <div class="text-3xl font-bold text-purple-600">${data.progress || 0}%</div>
                    <p class="text-gray-600 mt-2">完了: ${data.completed || 0} / ${data.total || 402} 問</p>
                </div>

                <div class="card-3d bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6 transform transition-all hover:scale-105">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-semibold text-gray-800">正答率</h3>
                        <i class="fas fa-percentage text-2xl text-green-600"></i>
                    </div>
                    <div class="text-3xl font-bold text-green-600">${data.accuracy || 0}%</div>
                    <p class="text-gray-600 mt-2">正解: ${data.correct || 0} / ${data.attempted || 0} 問</p>
                </div>

                <div class="card-3d bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6 transform transition-all hover:scale-105">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-semibold text-gray-800">連続学習</h3>
                        <i class="fas fa-fire text-2xl text-orange-600"></i>
                    </div>
                    <div class="text-3xl font-bold text-orange-600">${data.streak || 0} 日</div>
                    <p class="text-gray-600 mt-2">最高記録: ${data.maxStreak || 0} 日</p>
                </div>
            </div>

            <div class="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <button class="card-3d bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl shadow-xl p-8 transform transition-all hover:scale-105" onclick="app.navigateTo('learning')">
                    <i class="fas fa-book-open text-4xl mb-4"></i>
                    <h2 class="text-2xl font-bold mb-2">学習を始める</h2>
                    <p class="opacity-90">カテゴリ別に問題を解く</p>
                </button>

                <button class="card-3d bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-2xl shadow-xl p-8 transform transition-all hover:scale-105" onclick="app.navigateTo('mock-exam')">
                    <i class="fas fa-clipboard-list text-4xl mb-4"></i>
                    <h2 class="text-2xl font-bold mb-2">模擬試験</h2>
                    <p class="opacity-90">本番形式で実力を測る</p>
                </button>
            </div>
        `;
    }

    async loadLearningView() {
        const mainContent = document.getElementById('main-content');
        mainContent.innerHTML = `
            <h2 class="text-3xl font-bold text-white mb-8">カテゴリを選択</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                ${this.getCategoryButtons()}
            </div>
        `;
    }

    getCategoryButtons() {
        const categories = [
            { id: 'rights', name: '権利関係', icon: 'fa-gavel', color: 'purple' },
            { id: 'laws', name: '法令上の制限', icon: 'fa-book', color: 'blue' },
            { id: 'tax', name: '税・その他', icon: 'fa-calculator', color: 'green' },
            { id: 'business', name: '宅建業法', icon: 'fa-building', color: 'orange' },
            { id: 'random', name: 'ランダム', icon: 'fa-random', color: 'pink' }
        ];

        return categories.map(cat => `
            <button data-category="${cat.id}" class="category-btn card-3d bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6 transform transition-all hover:scale-105">
                <i class="fas ${cat.icon} text-4xl text-${cat.color}-600 mb-4"></i>
                <h3 class="text-xl font-bold text-gray-800">${cat.name}</h3>
                <p class="text-gray-600 mt-2">問題に挑戦</p>
            </button>
        `).join('');
    }

    async startCategoryLearning(category) {
        this.currentCategory = category;
        const response = await fetch(`/api/questions?category=${category}`);
        const questions = await response.json();
        
        this.questions = questions;
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
        
        this.displayQuestion();
    }

    displayQuestion() {
        if (this.currentQuestionIndex >= this.questions.length) {
            this.showResults();
            return;
        }

        const question = this.questions[this.currentQuestionIndex];
        const mainContent = document.getElementById('main-content');
        
        mainContent.innerHTML = `
            <div class="max-w-4xl mx-auto">
                <div class="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-8">
                    <div class="flex justify-between items-center mb-6">
                        <span class="text-lg font-semibold text-purple-600">
                            問題 ${this.currentQuestionIndex + 1} / ${this.questions.length}
                        </span>
                        <button onclick="app.navigateTo('learning')" class="text-gray-500 hover:text-gray-700">
                            <i class="fas fa-times text-2xl"></i>
                        </button>
                    </div>
                    
                    <h3 class="text-xl font-bold text-gray-800 mb-6">${question.question}</h3>
                    
                    <div class="space-y-3">
                        ${this.getAnswerOptions(question)}
                    </div>
                    
                    <button id="next-btn" class="mt-8 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50" disabled>
                        次の問題
                    </button>
                </div>
            </div>
        `;
    }

    getAnswerOptions(question) {
        const options = ['A', 'B', 'C', 'D'];
        return options.map(opt => `
            <button data-answer="${opt}" class="answer-btn w-full text-left p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                <span class="font-semibold mr-3">${opt}.</span>
                ${question[`option${opt}`]}
            </button>
        `).join('');
    }

    selectAnswer(answer) {
        const question = this.questions[this.currentQuestionIndex];
        const isCorrect = answer === question.correct_answer;
        
        this.userAnswers.push({
            questionId: question.id,
            answer: answer,
            correct: isCorrect
        });

        // Visual feedback
        const buttons = document.querySelectorAll('.answer-btn');
        buttons.forEach(btn => {
            btn.disabled = true;
            if (btn.dataset.answer === answer) {
                btn.classList.add(isCorrect ? 'bg-green-100' : 'bg-red-100');
            }
            if (btn.dataset.answer === question.correct_answer) {
                btn.classList.add('bg-green-100');
            }
        });

        document.getElementById('next-btn').disabled = false;
    }

    nextQuestion() {
        this.currentQuestionIndex++;
        this.displayQuestion();
    }

    showResults() {
        const correct = this.userAnswers.filter(a => a.correct).length;
        const total = this.userAnswers.length;
        const percentage = Math.round((correct / total) * 100);

        const mainContent = document.getElementById('main-content');
        mainContent.innerHTML = `
            <div class="max-w-2xl mx-auto">
                <div class="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-8 text-center">
                    <i class="fas fa-trophy text-6xl text-yellow-500 mb-6"></i>
                    <h2 class="text-3xl font-bold text-gray-800 mb-4">学習完了！</h2>
                    
                    <div class="text-5xl font-bold mb-2 ${percentage >= 70 ? 'text-green-600' : 'text-orange-600'}">
                        ${percentage}%
                    </div>
                    
                    <p class="text-xl text-gray-600 mb-8">
                        ${correct} / ${total} 問正解
                    </p>
                    
                    <div class="flex gap-4 justify-center">
                        <button onclick="app.navigateTo('learning')" class="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity">
                            別のカテゴリで学習
                        </button>
                        <button onclick="app.navigateTo('dashboard')" class="bg-gray-200 text-gray-800 px-8 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors">
                            ダッシュボードへ
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Save results
        this.saveResults();
    }

    async saveResults() {
        await fetch('/api/results', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                category: this.currentCategory,
                answers: this.userAnswers,
                timestamp: new Date().toISOString()
            })
        });
    }

    async loadMockExamView() {
        const mainContent = document.getElementById('main-content');
        mainContent.innerHTML = `
            <div class="max-w-4xl mx-auto">
                <div class="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-8">
                    <h2 class="text-3xl font-bold text-gray-800 mb-6">模擬試験</h2>
                    
                    <div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-8">
                        <h3 class="text-xl font-semibold text-gray-800 mb-4">試験概要</h3>
                        <ul class="space-y-2 text-gray-600">
                            <li><i class="fas fa-check-circle text-green-500 mr-2"></i>問題数: 50問</li>
                            <li><i class="fas fa-check-circle text-green-500 mr-2"></i>制限時間: 2時間</li>
                            <li><i class="fas fa-check-circle text-green-500 mr-2"></i>合格ライン: 35問以上正解</li>
                            <li><i class="fas fa-check-circle text-green-500 mr-2"></i>本番と同じ形式で出題</li>
                        </ul>
                    </div>
                    
                    <button id="start-mock-exam" class="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-bold text-xl hover:opacity-90 transition-opacity">
                        模擬試験を開始する
                    </button>
                </div>
            </div>
        `;
    }

    async startMockExam() {
        const response = await fetch('/api/mock-exam/start', { method: 'POST' });
        const exam = await response.json();
        
        this.questions = exam.questions;
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
        this.startTimer();
        
        this.displayMockExamQuestion();
    }

    startTimer() {
        this.timeLeft = 7200; // 2 hours
        
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.updateTimerDisplay();
            
            if (this.timeLeft <= 0) {
                clearInterval(this.timer);
                this.finishMockExam();
            }
        }, 1000);
    }

    updateTimerDisplay() {
        const hours = Math.floor(this.timeLeft / 3600);
        const minutes = Math.floor((this.timeLeft % 3600) / 60);
        const seconds = this.timeLeft % 60;
        
        const display = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        const timerElement = document.getElementById('timer-display');
        if (timerElement) {
            timerElement.textContent = display;
            
            if (this.timeLeft < 600) { // Less than 10 minutes
                timerElement.classList.add('text-red-600', 'animate-pulse');
            }
        }
    }

    displayMockExamQuestion() {
        // Similar to displayQuestion but with timer display
        const question = this.questions[this.currentQuestionIndex];
        const mainContent = document.getElementById('main-content');
        
        mainContent.innerHTML = `
            <div class="max-w-4xl mx-auto">
                <div class="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-8">
                    <div class="flex justify-between items-center mb-6">
                        <span class="text-lg font-semibold text-purple-600">
                            問題 ${this.currentQuestionIndex + 1} / 50
                        </span>
                        <div class="flex items-center gap-4">
                            <span id="timer-display" class="text-2xl font-bold text-gray-800">02:00:00</span>
                            <button onclick="app.finishMockExam()" class="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">
                                試験を終了
                            </button>
                        </div>
                    </div>
                    
                    <h3 class="text-xl font-bold text-gray-800 mb-6">${question.question}</h3>
                    
                    <div class="space-y-3">
                        ${this.getAnswerOptions(question)}
                    </div>
                    
                    <div class="flex gap-4 mt-8">
                        <button onclick="app.previousMockQuestion()" class="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors ${this.currentQuestionIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''}">
                            前の問題
                        </button>
                        <button id="next-btn" onclick="app.nextMockQuestion()" class="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity">
                            次の問題
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        this.updateTimerDisplay();
    }

    nextMockQuestion() {
        if (this.currentQuestionIndex < this.questions.length - 1) {
            this.currentQuestionIndex++;
            this.displayMockExamQuestion();
        } else {
            this.finishMockExam();
        }
    }

    previousMockQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            this.displayMockExamQuestion();
        }
    }

    finishMockExam() {
        clearInterval(this.timer);
        
        const correct = this.userAnswers.filter(a => a.correct).length;
        const passed = correct >= 35;
        
        const mainContent = document.getElementById('main-content');
        mainContent.innerHTML = `
            <div class="max-w-2xl mx-auto">
                <div class="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-8 text-center">
                    <i class="fas ${passed ? 'fa-crown' : 'fa-times-circle'} text-6xl ${passed ? 'text-yellow-500' : 'text-red-500'} mb-6"></i>
                    <h2 class="text-3xl font-bold text-gray-800 mb-4">
                        ${passed ? '合格！' : '不合格'}
                    </h2>
                    
                    <div class="text-5xl font-bold mb-2 ${passed ? 'text-green-600' : 'text-red-600'}">
                        ${correct} / 50 問正解
                    </div>
                    
                    <p class="text-xl text-gray-600 mb-8">
                        正答率: ${Math.round((correct / 50) * 100)}%
                    </p>
                    
                    <div class="bg-gray-100 rounded-lg p-4 mb-8">
                        <p class="text-gray-600">
                            所要時間: ${Math.floor((7200 - this.timeLeft) / 60)}分
                        </p>
                    </div>
                    
                    <div class="flex gap-4 justify-center">
                        <button onclick="app.navigateTo('mock-exam')" class="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity">
                            もう一度挑戦
                        </button>
                        <button onclick="app.navigateTo('dashboard')" class="bg-gray-200 text-gray-800 px-8 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors">
                            ダッシュボードへ
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    async loadStatisticsView() {
        const response = await fetch('/api/statistics');
        const stats = await response.json();
        
        const mainContent = document.getElementById('main-content');
        mainContent.innerHTML = `
            <div class="max-w-6xl mx-auto">
                <h2 class="text-3xl font-bold text-white mb-8">学習統計</h2>
                
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div class="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-6">
                        <h3 class="text-xl font-bold text-gray-800 mb-4">カテゴリ別正答率</h3>
                        <canvas id="category-chart"></canvas>
                    </div>
                    
                    <div class="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-6">
                        <h3 class="text-xl font-bold text-gray-800 mb-4">学習進捗</h3>
                        <canvas id="progress-chart"></canvas>
                    </div>
                    
                    <div class="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-6">
                        <h3 class="text-xl font-bold text-gray-800 mb-4">日別学習量</h3>
                        <canvas id="daily-chart"></canvas>
                    </div>
                    
                    <div class="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-6">
                        <h3 class="text-xl font-bold text-gray-800 mb-4">弱点分析</h3>
                        <div class="space-y-3">
                            ${this.getWeaknessAnalysis(stats.weaknesses)}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Initialize charts
        this.initCharts(stats);
    }

    getWeaknessAnalysis(weaknesses) {
        if (!weaknesses || weaknesses.length === 0) {
            return '<p class="text-gray-600">データがまだありません</p>';
        }
        
        return weaknesses.map(w => `
            <div class="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <span class="text-gray-800">${w.topic}</span>
                <span class="text-red-600 font-semibold">${w.accuracy}%</span>
            </div>
        `).join('');
    }

    initCharts(stats) {
        // Initialize Chart.js charts here
        // This would require the Chart.js library to be loaded
    }

    async loadSettingsView() {
        const mainContent = document.getElementById('main-content');
        mainContent.innerHTML = `
            <div class="max-w-2xl mx-auto">
                <h2 class="text-3xl font-bold text-white mb-8">設定</h2>
                
                <div class="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-6">
                    <div class="space-y-6">
                        <div>
                            <h3 class="text-lg font-semibold text-gray-800 mb-3">通知設定</h3>
                            <label class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span class="text-gray-700">学習リマインダー</span>
                                <input type="checkbox" class="toggle-checkbox" checked>
                            </label>
                        </div>
                        
                        <div>
                            <h3 class="text-lg font-semibold text-gray-800 mb-3">表示設定</h3>
                            <label class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span class="text-gray-700">ダークモード</span>
                                <input type="checkbox" class="toggle-checkbox">
                            </label>
                        </div>
                        
                        <div>
                            <h3 class="text-lg font-semibold text-gray-800 mb-3">学習設定</h3>
                            <label class="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-3">
                                <span class="text-gray-700">解説を自動表示</span>
                                <input type="checkbox" class="toggle-checkbox" checked>
                            </label>
                            <label class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span class="text-gray-700">音声読み上げ</span>
                                <input type="checkbox" class="toggle-checkbox">
                            </label>
                        </div>
                        
                        <div>
                            <h3 class="text-lg font-semibold text-gray-800 mb-3">データ管理</h3>
                            <button class="w-full p-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
                                学習データをリセット
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new TakkenBoostApp();
});
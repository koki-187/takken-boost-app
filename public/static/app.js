// 宅建BOOST メインアプリケーション
class TakkenBoostApp {
    constructor() {
        this.currentUser = null;
        this.currentMode = null;
        this.init();
    }

    init() {
        console.log('宅建BOOST アプリケーション初期化中...');
        this.setupEventListeners();
        this.checkUserSession();
        this.loadFAQ();
    }

    setupEventListeners() {
        // メニューカードのクリックイベント
        document.querySelectorAll('.glass-morphism').forEach(card => {
            card.addEventListener('click', (e) => {
                this.handleCardClick(e.currentTarget);
            });
        });
    }

    handleCardClick(card) {
        const title = card.querySelector('h2').textContent;
        
        switch(title) {
            case 'カテゴリー別学習':
                this.startCategoryStudy();
                break;
            case '模擬試験':
                this.startMockExam();
                break;
            case '苦手問題':
                this.startWeakPointsStudy();
                break;
            case '学習統計':
                this.showStudyStats();
                break;
            case 'AI分析':
                this.showAIAnalysis();
                break;
            case 'カレンダー':
                this.showCalendar();
                break;
        }
    }

    startCategoryStudy() {
        console.log('カテゴリー別学習を開始');
        // カテゴリー選択画面を表示
        this.showNotification('カテゴリー別学習機能は準備中です', 'info');
    }

    startMockExam() {
        console.log('模擬試験を開始');
        // 模擬試験開始確認
        if (confirm('模擬試験を開始しますか？\n制限時間：2時間\n問題数：50問')) {
            this.showNotification('模擬試験機能は準備中です', 'info');
        }
    }

    startWeakPointsStudy() {
        console.log('苦手問題学習を開始');
        this.showNotification('苦手問題学習機能は準備中です', 'info');
    }

    showStudyStats() {
        console.log('学習統計を表示');
        this.showNotification('学習統計機能は準備中です', 'info');
    }

    showAIAnalysis() {
        console.log('AI分析を表示');
        this.showNotification('AI分析機能は準備中です', 'info');
    }

    showCalendar() {
        console.log('カレンダーを表示');
        this.showNotification('カレンダー機能は準備中です', 'info');
    }

    checkUserSession() {
        // ローカルストレージからユーザー情報を確認
        const userData = localStorage.getItem('takkenBoost_user');
        if (userData) {
            this.currentUser = JSON.parse(userData);
            console.log('ユーザーセッション確認:', this.currentUser);
        }
    }

    async loadFAQ() {
        try {
            const response = await axios.get('/api/faq');
            console.log('FAQ loaded:', response.data.length, 'items');
        } catch (error) {
            console.error('FAQ読み込みエラー:', error);
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 animate-slide-in ${
            type === 'success' ? 'bg-green-600' : 
            type === 'error' ? 'bg-red-600' : 
            type === 'warning' ? 'bg-yellow-600' : 
            'bg-blue-600'
        } text-white`;
        
        notification.innerHTML = `
            <div class="flex items-center gap-3">
                <i class="fas ${
                    type === 'success' ? 'fa-check-circle' : 
                    type === 'error' ? 'fa-exclamation-circle' : 
                    type === 'warning' ? 'fa-exclamation-triangle' : 
                    'fa-info-circle'
                }"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // 3秒後に自動削除
        setTimeout(() => {
            notification.style.animation = 'slide-out 0.3s ease-out';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// アニメーションスタイルを追加
const animationStyles = document.createElement('style');
animationStyles.textContent = `
    @keyframes slide-in {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slide-out {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .animate-slide-in {
        animation: slide-in 0.3s ease-out;
    }
`;
document.head.appendChild(animationStyles);

// アプリケーション初期化
document.addEventListener('DOMContentLoaded', () => {
    window.takkenBoostApp = new TakkenBoostApp();
    console.log('宅建BOOST v4.1.0 - 取扱説明書機能搭載');
});
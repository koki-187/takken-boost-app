// インタラクティブチュートリアル
class TutorialSystem {
    constructor() {
        this.overlay = document.getElementById('tutorial-overlay');
        this.tooltip = document.getElementById('tutorial-tooltip');
        this.titleElement = document.getElementById('tutorial-title');
        this.contentElement = document.getElementById('tutorial-content');
        this.tutorialButton = document.getElementById('tutorial-button');
        this.skipButton = document.getElementById('tutorial-skip');
        this.prevButton = document.getElementById('tutorial-prev');
        this.nextButton = document.getElementById('tutorial-next');
        
        this.steps = [];
        this.currentStep = 0;
        this.isActive = false;
        
        this.init();
    }

    async init() {
        // チュートリアルデータを取得
        try {
            const response = await axios.get('/api/tutorial/steps');
            this.steps = response.data;
        } catch (error) {
            console.error('チュートリアルデータの取得に失敗しました:', error);
        }

        // イベントリスナーの設定
        this.tutorialButton.addEventListener('click', () => this.start());
        this.skipButton.addEventListener('click', () => this.end());
        this.prevButton.addEventListener('click', () => this.previousStep());
        this.nextButton.addEventListener('click', () => this.nextStep());
        
        // ESCキーで終了
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isActive) {
                this.end();
            }
        });

        // 初回訪問時に自動開始するかチェック
        this.checkFirstVisit();
    }

    checkFirstVisit() {
        const hasVisited = localStorage.getItem('takkenBoost_tutorialCompleted');
        if (!hasVisited) {
            // 初回訪問時はウェルカムメッセージを表示
            setTimeout(() => {
                this.showWelcomeMessage();
            }, 1000);
        }
    }

    showWelcomeMessage() {
        const welcome = document.createElement('div');
        welcome.className = 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-br from-purple-600 to-blue-600 text-white p-8 rounded-3xl shadow-2xl z-50 max-w-md';
        welcome.innerHTML = `
            <div class="text-center">
                <i class="fas fa-graduation-cap text-6xl mb-4"></i>
                <h2 class="text-3xl font-bold mb-4">宅建BOOSTへようこそ！</h2>
                <p class="text-lg mb-6">アプリの使い方をご案内します。<br>チュートリアルを開始しますか？</p>
                <div class="flex gap-4 justify-center">
                    <button id="welcome-skip" class="bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded-lg transition-colors">
                        スキップ
                    </button>
                    <button id="welcome-start" class="bg-white text-purple-600 hover:bg-gray-100 px-6 py-3 rounded-lg font-bold transition-colors">
                        チュートリアル開始
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(welcome);
        
        // ボタンのイベント設定
        document.getElementById('welcome-start').addEventListener('click', () => {
            document.body.removeChild(welcome);
            this.start();
        });
        
        document.getElementById('welcome-skip').addEventListener('click', () => {
            document.body.removeChild(welcome);
            localStorage.setItem('takkenBoost_tutorialCompleted', 'true');
        });
    }

    start() {
        if (this.steps.length === 0) {
            console.error('チュートリアルステップが設定されていません');
            return;
        }
        
        this.isActive = true;
        this.currentStep = 0;
        this.overlay.classList.remove('hidden');
        this.showStep(this.currentStep);
    }

    showStep(index) {
        if (index < 0 || index >= this.steps.length) return;
        
        const step = this.steps[index];
        this.currentStep = index;
        
        // 前のハイライトを削除
        document.querySelectorAll('.tutorial-highlight').forEach(el => {
            el.classList.remove('tutorial-highlight');
        });
        
        // ターゲット要素をハイライト
        const targetElement = document.querySelector(step.target);
        if (targetElement) {
            targetElement.classList.add('tutorial-highlight');
            
            // ツールチップの位置を設定
            this.positionTooltip(targetElement, step.position);
        }
        
        // コンテンツを更新
        this.titleElement.textContent = step.title;
        this.contentElement.textContent = step.content;
        
        // ボタンの表示制御
        this.prevButton.disabled = index === 0;
        this.nextButton.textContent = index === this.steps.length - 1 ? '完了' : '次へ';
        
        // ステップインジケーターを更新
        this.updateStepIndicator();
        
        // ツールチップを表示
        this.tooltip.classList.remove('hidden');
    }

    positionTooltip(targetElement, position = 'bottom') {
        const rect = targetElement.getBoundingClientRect();
        const tooltipRect = this.tooltip.getBoundingClientRect();
        
        let top = 0;
        let left = 0;
        
        switch(position) {
            case 'top':
                top = rect.top - tooltipRect.height - 20;
                left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
                break;
            case 'bottom':
                top = rect.bottom + 20;
                left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
                break;
            case 'left':
                top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
                left = rect.left - tooltipRect.width - 20;
                break;
            case 'right':
                top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
                left = rect.right + 20;
                break;
        }
        
        // 画面外にはみ出さないように調整
        if (left < 10) left = 10;
        if (left + tooltipRect.width > window.innerWidth - 10) {
            left = window.innerWidth - tooltipRect.width - 10;
        }
        if (top < 10) top = 10;
        if (top + tooltipRect.height > window.innerHeight - 10) {
            top = window.innerHeight - tooltipRect.height - 10;
        }
        
        this.tooltip.style.top = `${top}px`;
        this.tooltip.style.left = `${left}px`;
        
        // 矢印の向きを設定
        this.setArrowDirection(position);
    }

    setArrowDirection(position) {
        // 既存の矢印クラスを削除
        this.tooltip.classList.remove('arrow-top', 'arrow-bottom', 'arrow-left', 'arrow-right');
        
        // 新しい矢印クラスを追加
        const oppositePosition = {
            'top': 'bottom',
            'bottom': 'top',
            'left': 'right',
            'right': 'left'
        };
        
        this.tooltip.classList.add(`arrow-${oppositePosition[position]}`);
    }

    updateStepIndicator() {
        // ステップインジケーターがない場合は作成
        let indicator = this.tooltip.querySelector('.step-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.className = 'step-indicator flex justify-center gap-1 mt-4';
            this.tooltip.appendChild(indicator);
        }
        
        // インジケーターを更新
        indicator.innerHTML = '';
        for (let i = 0; i < this.steps.length; i++) {
            const dot = document.createElement('span');
            dot.className = `w-2 h-2 rounded-full ${i === this.currentStep ? 'bg-blue-500' : 'bg-gray-400'}`;
            indicator.appendChild(dot);
        }
    }

    previousStep() {
        if (this.currentStep > 0) {
            this.showStep(this.currentStep - 1);
        }
    }

    nextStep() {
        if (this.currentStep < this.steps.length - 1) {
            this.showStep(this.currentStep + 1);
        } else {
            this.complete();
        }
    }

    complete() {
        // 完了メッセージを表示
        this.showCompletionMessage();
        
        // チュートリアル完了を記録
        localStorage.setItem('takkenBoost_tutorialCompleted', 'true');
        
        // チュートリアル終了
        setTimeout(() => {
            this.end();
        }, 2000);
    }

    showCompletionMessage() {
        const completion = document.createElement('div');
        completion.className = 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-br from-green-500 to-teal-600 text-white p-8 rounded-3xl shadow-2xl z-60 text-center';
        completion.innerHTML = `
            <i class="fas fa-check-circle text-6xl mb-4"></i>
            <h2 class="text-3xl font-bold mb-2">チュートリアル完了！</h2>
            <p class="text-lg">学習を始めましょう！</p>
        `;
        
        document.body.appendChild(completion);
        
        // アニメーション後に削除
        setTimeout(() => {
            completion.style.transition = 'opacity 0.5s';
            completion.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(completion);
            }, 500);
        }, 1500);
    }

    end() {
        this.isActive = false;
        this.overlay.classList.add('hidden');
        this.tooltip.classList.add('hidden');
        
        // ハイライトを削除
        document.querySelectorAll('.tutorial-highlight').forEach(el => {
            el.classList.remove('tutorial-highlight');
        });
    }
}

// ツールチップの矢印スタイルを追加
const style = document.createElement('style');
style.textContent = `
    #tutorial-tooltip {
        position: fixed;
        z-index: 50;
    }
    
    #tutorial-tooltip::before {
        content: '';
        position: absolute;
        width: 0;
        height: 0;
        border-style: solid;
    }
    
    #tutorial-tooltip.arrow-top::before {
        top: -10px;
        left: 50%;
        transform: translateX(-50%);
        border-width: 0 10px 10px 10px;
        border-color: transparent transparent white transparent;
    }
    
    #tutorial-tooltip.arrow-bottom::before {
        bottom: -10px;
        left: 50%;
        transform: translateX(-50%);
        border-width: 10px 10px 0 10px;
        border-color: white transparent transparent transparent;
    }
    
    #tutorial-tooltip.arrow-left::before {
        left: -10px;
        top: 50%;
        transform: translateY(-50%);
        border-width: 10px 10px 10px 0;
        border-color: transparent white transparent transparent;
    }
    
    #tutorial-tooltip.arrow-right::before {
        right: -10px;
        top: 50%;
        transform: translateY(-50%);
        border-width: 10px 0 10px 10px;
        border-color: transparent transparent transparent white;
    }
    
    .step-indicator span {
        transition: all 0.3s ease;
    }
`;
document.head.appendChild(style);

// ページ読み込み時に初期化
document.addEventListener('DOMContentLoaded', () => {
    window.tutorialSystem = new TutorialSystem();
});
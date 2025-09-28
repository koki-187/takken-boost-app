// ヘルプシステム
class HelpSystem {
    constructor() {
        this.modal = document.getElementById('help-modal');
        this.contentArea = document.getElementById('help-content');
        this.helpButton = document.getElementById('help-button');
        this.closeButton = document.getElementById('close-help');
        this.sections = [];
        this.currentSection = null;
        
        this.init();
    }

    async init() {
        // ヘルプデータを取得
        try {
            const response = await axios.get('/api/manual/sections');
            this.sections = response.data;
            this.renderSections();
        } catch (error) {
            console.error('ヘルプデータの取得に失敗しました:', error);
        }

        // イベントリスナーの設定
        this.helpButton.addEventListener('click', () => this.open());
        this.closeButton.addEventListener('click', () => this.close());
        
        // モーダル外クリックで閉じる
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.close();
            }
        });

        // キーボードショートカット (F1でヘルプを開く)
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F1') {
                e.preventDefault();
                this.toggle();
            }
        });
    }

    renderSections() {
        this.contentArea.innerHTML = '';

        // サイドバーとコンテンツエリアのコンテナ
        const container = document.createElement('div');
        container.className = 'flex gap-6';

        // サイドバー（目次）
        const sidebar = document.createElement('div');
        sidebar.className = 'w-64 min-w-[16rem]';
        
        const sidebarTitle = document.createElement('h3');
        sidebarTitle.className = 'text-lg font-bold text-gray-300 mb-4';
        sidebarTitle.textContent = '目次';
        sidebar.appendChild(sidebarTitle);

        const sidebarList = document.createElement('ul');
        sidebarList.className = 'space-y-2';

        this.sections.forEach(section => {
            const item = document.createElement('li');
            const button = document.createElement('button');
            button.className = 'w-full text-left px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-gray-300 hover:text-white flex items-center gap-2';
            button.innerHTML = `
                <i class="fas ${section.icon} w-5"></i>
                <span>${section.title}</span>
            `;
            button.addEventListener('click', () => this.showSection(section));
            item.appendChild(button);
            sidebarList.appendChild(item);
        });

        sidebar.appendChild(sidebarList);

        // コンテンツエリア
        const contentArea = document.createElement('div');
        contentArea.className = 'flex-1 bg-gray-800 rounded-2xl p-6';
        contentArea.id = 'section-content';

        // 初期コンテンツ（最初のセクションを表示）
        if (this.sections.length > 0) {
            this.showSection(this.sections[0], contentArea);
        }

        container.appendChild(sidebar);
        container.appendChild(contentArea);
        this.contentArea.appendChild(container);
    }

    showSection(section, targetElement = null) {
        const contentArea = targetElement || document.getElementById('section-content');
        this.currentSection = section;

        // セクションコンテンツを生成
        let html = `
            <div class="mb-6">
                <h2 class="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                    <i class="fas ${section.icon} text-3xl text-purple-400"></i>
                    ${section.title}
                </h2>
            </div>
        `;

        // セクションごとのコンテンツを動的に生成
        switch(section.id) {
            case 'getting-started':
                html += this.renderGettingStarted(section.content);
                break;
            case 'user-registration':
                html += this.renderUserRegistration(section.content);
                break;
            case 'study-mode':
                html += this.renderStudyMode(section.content);
                break;
            case 'mock-exam':
                html += this.renderMockExam(section.content);
                break;
            case 'progress-tracking':
                html += this.renderProgressTracking(section.content);
                break;
            case 'ai-features':
                html += this.renderAIFeatures(section.content);
                break;
            case 'tips':
                html += this.renderTips(section.content);
                break;
            case 'troubleshooting':
                html += this.renderTroubleshooting(section.content);
                break;
            default:
                html += '<p class="text-gray-300">コンテンツが見つかりません</p>';
        }

        contentArea.innerHTML = html;
        
        // スムーズスクロール
        contentArea.scrollTop = 0;
    }

    renderGettingStarted(content) {
        return `
            <div class="space-y-6">
                <div class="bg-gradient-to-r from-purple-600 to-blue-600 p-6 rounded-xl">
                    <p class="text-white text-lg">${content.overview}</p>
                </div>
                
                <div>
                    <h3 class="text-xl font-bold text-white mb-4">主な機能</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        ${content.features.map(feature => `
                            <div class="bg-gray-700 p-4 rounded-lg flex items-start gap-3">
                                <i class="fas fa-check-circle text-green-400 mt-1"></i>
                                <span class="text-gray-300">${feature}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    renderUserRegistration(content) {
        return `
            <div class="space-y-6">
                ${content.steps.map((step, index) => `
                    <div class="bg-gray-700 rounded-xl p-6">
                        <div class="flex items-center gap-4 mb-4">
                            <div class="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                                ${index + 1}
                            </div>
                            <h3 class="text-xl font-bold text-white">${step.title}</h3>
                        </div>
                        <p class="text-gray-300 mb-4">${step.description}</p>
                        ${step.tips ? `
                            <div class="bg-gray-800 rounded-lg p-4">
                                <p class="text-sm font-semibold text-yellow-400 mb-2">💡 ヒント</p>
                                <ul class="space-y-1">
                                    ${step.tips.map(tip => `
                                        <li class="text-sm text-gray-400 flex items-start gap-2">
                                            <span>•</span>
                                            <span>${tip}</span>
                                        </li>
                                    `).join('')}
                                </ul>
                            </div>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderStudyMode(content) {
        return `
            <div class="space-y-6">
                ${content.modes.map(mode => `
                    <div class="bg-gray-700 rounded-xl p-6">
                        <h3 class="text-xl font-bold text-white mb-3">${mode.name}</h3>
                        <p class="text-gray-300 mb-4">${mode.description}</p>
                        
                        <div class="bg-gray-800 rounded-lg p-4">
                            <p class="text-sm font-semibold text-blue-400 mb-3">使い方</p>
                            <ol class="space-y-2">
                                ${mode.howTo.map((step, index) => `
                                    <li class="text-sm text-gray-400 flex gap-3">
                                        <span class="text-blue-400 font-bold">${index + 1}.</span>
                                        <span>${step}</span>
                                    </li>
                                `).join('')}
                            </ol>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderMockExam(content) {
        return `
            <div class="space-y-6">
                <div class="bg-gradient-to-r from-green-600 to-teal-600 p-6 rounded-xl">
                    <p class="text-white text-lg">${content.overview}</p>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    ${content.features.map(feature => `
                        <div class="bg-gray-700 rounded-xl p-6">
                            <h4 class="text-lg font-bold text-white mb-3">${feature.name}</h4>
                            <ul class="space-y-2">
                                ${feature.details.map(detail => `
                                    <li class="text-sm text-gray-400 flex items-start gap-2">
                                        <i class="fas fa-chevron-right text-xs mt-1 text-gray-500"></i>
                                        <span>${detail}</span>
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                    `).join('')}
                </div>
                
                <div class="bg-gray-700 rounded-xl p-6">
                    <h4 class="text-lg font-bold text-white mb-4">試験の受け方</h4>
                    <ol class="space-y-3">
                        ${content.howTo.map((step, index) => `
                            <li class="flex gap-3">
                                <div class="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                    ${index + 1}
                                </div>
                                <span class="text-gray-300">${step}</span>
                            </li>
                        `).join('')}
                    </ol>
                </div>
            </div>
        `;
    }

    renderProgressTracking(content) {
        return `
            <div class="space-y-6">
                ${content.features.map(feature => `
                    <div class="bg-gray-700 rounded-xl p-6">
                        <h3 class="text-xl font-bold text-white mb-3">${feature.name}</h3>
                        <p class="text-gray-300 mb-4">${feature.description}</p>
                        
                        <div class="bg-gray-800 rounded-lg p-4">
                            <ul class="space-y-2">
                                ${feature.details.map(detail => `
                                    <li class="text-sm text-gray-400 flex items-center gap-2">
                                        <i class="fas fa-chart-bar text-purple-400"></i>
                                        <span>${detail}</span>
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderAIFeatures(content) {
        return `
            <div class="space-y-6">
                ${content.features.map(feature => `
                    <div class="bg-gradient-to-r from-pink-900 to-purple-900 p-6 rounded-xl">
                        <div class="flex items-center gap-3 mb-4">
                            <i class="fas fa-brain text-3xl text-pink-400"></i>
                            <h3 class="text-xl font-bold text-white">${feature.name}</h3>
                        </div>
                        <p class="text-gray-300 mb-4">${feature.description}</p>
                        
                        <div class="space-y-2">
                            <p class="text-sm font-semibold text-pink-400">メリット</p>
                            ${feature.benefits.map(benefit => `
                                <div class="flex items-start gap-2">
                                    <i class="fas fa-sparkles text-yellow-400 text-sm mt-1"></i>
                                    <span class="text-sm text-gray-300">${benefit}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderTips(content) {
        return `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                ${content.tips.map((tip, index) => `
                    <div class="bg-gradient-to-br from-yellow-900 to-orange-900 p-6 rounded-xl">
                        <div class="flex items-start gap-3">
                            <i class="fas fa-lightbulb text-2xl text-yellow-400"></i>
                            <div>
                                <h4 class="text-lg font-bold text-white mb-2">${tip.title}</h4>
                                <p class="text-sm text-gray-300">${tip.description}</p>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderTroubleshooting(content) {
        return `
            <div class="space-y-4">
                ${content.issues.map(issue => `
                    <div class="bg-gray-700 rounded-xl p-6">
                        <div class="flex items-center gap-3 mb-4">
                            <i class="fas fa-exclamation-triangle text-red-400 text-xl"></i>
                            <h4 class="text-lg font-bold text-white">${issue.problem}</h4>
                        </div>
                        
                        <div class="bg-gray-800 rounded-lg p-4">
                            <p class="text-sm font-semibold text-green-400 mb-3">解決方法</p>
                            <ul class="space-y-2">
                                ${issue.solutions.map(solution => `
                                    <li class="text-sm text-gray-400 flex items-start gap-2">
                                        <i class="fas fa-check text-green-400 text-xs mt-1"></i>
                                        <span>${solution}</span>
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    open() {
        this.modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        
        // アニメーション
        setTimeout(() => {
            this.modal.querySelector('.bg-gradient-to-br').classList.add('modal-enter');
        }, 10);
    }

    close() {
        this.modal.classList.add('hidden');
        document.body.style.overflow = '';
    }

    toggle() {
        if (this.modal.classList.contains('hidden')) {
            this.open();
        } else {
            this.close();
        }
    }
}

// ページ読み込み時に初期化
document.addEventListener('DOMContentLoaded', () => {
    window.helpSystem = new HelpSystem();
});
// 宅建BOOST v9.0.0 - Dark Mode Implementation
// ダークモード切り替え機能の実装

(function() {
    'use strict';

    // ダークモードの状態管理
    const DarkMode = {
        // 初期化
        init() {
            this.key = 'takken-boost-theme';
            this.currentTheme = this.getSavedTheme() || this.getSystemTheme();
            this.applyTheme(this.currentTheme);
            this.createToggleButton();
            this.setupEventListeners();
            this.watchSystemTheme();
        },

        // 保存されたテーマを取得
        getSavedTheme() {
            return localStorage.getItem(this.key);
        },

        // システムのテーマを取得
        getSystemTheme() {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        },

        // テーマを適用
        applyTheme(theme) {
            this.currentTheme = theme;
            document.documentElement.setAttribute('data-theme', theme);
            
            // カラー変数を更新
            if (theme === 'dark') {
                this.applyDarkColors();
            } else {
                this.applyLightColors();
            }
            
            // ローカルストレージに保存
            localStorage.setItem(this.key, theme);
            
            // ボタンアイコンを更新
            this.updateToggleIcon();
        },

        // ダークモードのカラーを適用
        applyDarkColors() {
            const root = document.documentElement;
            
            // v9.0.0のパープルグラデーションをダークバージョンに
            root.style.setProperty('--color-primary', '#4c1d95');
            root.style.setProperty('--color-secondary', '#5b21b6');
            root.style.setProperty('--color-accent', '#8b5cf6');
            root.style.setProperty('--color-light', '#1f2937');
            
            // 背景グラデーション
            root.style.setProperty('--gradient-primary', 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)');
            root.style.setProperty('--gradient-secondary', 'linear-gradient(135deg, #4c1d95 0%, #5b21b6 100%)');
            root.style.setProperty('--gradient-hero', 'linear-gradient(135deg, #1e1b4b 0%, #4c1d95 50%, #5b21b6 100%)');
            
            // グラスエフェクトカラー
            root.style.setProperty('--glass-bg', 'rgba(30, 27, 75, 0.85)');
            root.style.setProperty('--glass-border', 'rgba(139, 92, 246, 0.3)');
            root.style.setProperty('--glass-shadow', 'rgba(0, 0, 0, 0.5)');
            
            // テキストカラー
            root.style.setProperty('--text-primary', '#f3f4f6');
            root.style.setProperty('--text-secondary', '#d1d5db');
            root.style.setProperty('--text-light', '#ffffff');
            
            // 背景色
            root.style.setProperty('--bg-primary', '#0f0e17');
            root.style.setProperty('--bg-secondary', '#1a1825');
            root.style.setProperty('--bg-card', '#1e1b4b');
        },

        // ライトモードのカラーを適用（デフォルト）
        applyLightColors() {
            const root = document.documentElement;
            
            // v9.0.0オリジナルのパープルグラデーション
            root.style.setProperty('--color-primary', '#667eea');
            root.style.setProperty('--color-secondary', '#764ba2');
            root.style.setProperty('--color-accent', '#f093fb');
            root.style.setProperty('--color-light', '#fad0c4');
            
            // 背景グラデーション
            root.style.setProperty('--gradient-primary', 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)');
            root.style.setProperty('--gradient-secondary', 'linear-gradient(135deg, #f093fb 0%, #fad0c4 100%)');
            root.style.setProperty('--gradient-hero', 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)');
            
            // グラスエフェクトカラー
            root.style.setProperty('--glass-bg', 'rgba(255, 255, 255, 0.1)');
            root.style.setProperty('--glass-border', 'rgba(255, 255, 255, 0.2)');
            root.style.setProperty('--glass-shadow', 'rgba(0, 0, 0, 0.1)');
            
            // テキストカラー
            root.style.setProperty('--text-primary', '#1a202c');
            root.style.setProperty('--text-secondary', '#4a5568');
            root.style.setProperty('--text-light', '#ffffff');
            
            // 背景色
            root.style.setProperty('--bg-primary', '#ffffff');
            root.style.setProperty('--bg-secondary', '#f7fafc');
            root.style.setProperty('--bg-card', '#ffffff');
        },

        // トグルボタンを作成
        createToggleButton() {
            const button = document.createElement('button');
            button.id = 'darkmode-toggle';
            button.className = 'darkmode-toggle';
            button.setAttribute('aria-label', 'ダークモード切り替え');
            button.innerHTML = this.getToggleIcon();
            
            // スタイルを追加
            const style = document.createElement('style');
            style.textContent = `
                .darkmode-toggle {
                    position: fixed;
                    bottom: 80px;
                    right: 30px;
                    width: 56px;
                    height: 56px;
                    border-radius: 50%;
                    background: var(--gradient-primary);
                    color: white;
                    border: none;
                    box-shadow: 0 4px 20px var(--glass-shadow);
                    cursor: pointer;
                    z-index: 999;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                    transition: all 0.3s ease;
                }
                
                .darkmode-toggle:hover {
                    transform: scale(1.1);
                    box-shadow: 0 6px 30px var(--glass-shadow);
                }
                
                .darkmode-toggle:active {
                    transform: scale(0.95);
                }
                
                /* ダークモード時のスタイル調整 */
                [data-theme="dark"] body {
                    background: var(--bg-primary);
                    color: var(--text-primary);
                }
                
                [data-theme="dark"] .glass-card {
                    background: var(--glass-bg);
                    border-color: var(--glass-border);
                }
                
                [data-theme="dark"] .feature-card {
                    background: var(--glass-bg);
                    border-color: var(--glass-border);
                    color: var(--text-light);
                }
                
                [data-theme="dark"] .hero-section {
                    background: var(--gradient-primary);
                }
                
                [data-theme="dark"] #particle-bg {
                    opacity: 0.3;
                }
                
                /* アニメーション */
                @keyframes rotate {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                
                .darkmode-toggle.switching {
                    animation: rotate 0.5s ease;
                }
            `;
            document.head.appendChild(style);
            
            // ボタンを追加
            document.body.appendChild(button);
        },

        // トグルアイコンを取得
        getToggleIcon() {
            if (this.currentTheme === 'dark') {
                return '<i class="fas fa-sun"></i>';
            } else {
                return '<i class="fas fa-moon"></i>';
            }
        },

        // トグルアイコンを更新
        updateToggleIcon() {
            const button = document.getElementById('darkmode-toggle');
            if (button) {
                button.innerHTML = this.getToggleIcon();
            }
        },

        // イベントリスナーをセットアップ
        setupEventListeners() {
            // トグルボタンのクリックイベント
            document.addEventListener('click', (e) => {
                if (e.target.closest('#darkmode-toggle')) {
                    this.toggle();
                }
            });

            // キーボードショートカット (Ctrl/Cmd + Shift + D)
            document.addEventListener('keydown', (e) => {
                if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
                    e.preventDefault();
                    this.toggle();
                }
            });
        },

        // テーマを切り替え
        toggle() {
            const button = document.getElementById('darkmode-toggle');
            button.classList.add('switching');
            
            const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
            this.applyTheme(newTheme);
            
            // アニメーション後にクラスを削除
            setTimeout(() => {
                button.classList.remove('switching');
            }, 500);
            
            // トースト通知
            this.showNotification(newTheme === 'dark' ? 'ダークモード有効' : 'ライトモード有効');
        },

        // システムテーマの変更を監視
        watchSystemTheme() {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                // 手動設定がない場合のみシステムに従う
                if (!this.getSavedTheme()) {
                    this.applyTheme(e.matches ? 'dark' : 'light');
                }
            });
        },

        // 通知を表示
        showNotification(message) {
            // 既存の通知関数があれば使用
            if (typeof window.TakkenBoost !== 'undefined' && window.TakkenBoost.showNotification) {
                window.TakkenBoost.showNotification(message, 'info');
            } else {
                // シンプルな通知を表示
                const notification = document.createElement('div');
                notification.className = 'theme-notification';
                notification.textContent = message;
                notification.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 12px 24px;
                    background: var(--gradient-primary);
                    color: white;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                    z-index: 10000;
                    animation: slideIn 0.3s ease;
                `;
                
                document.body.appendChild(notification);
                
                setTimeout(() => {
                    notification.style.animation = 'slideOut 0.3s ease';
                    setTimeout(() => notification.remove(), 300);
                }, 2000);
            }
        }
    };

    // ページ読み込み時に初期化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => DarkMode.init());
    } else {
        DarkMode.init();
    }

    // グローバルに公開
    window.DarkMode = DarkMode;
})();
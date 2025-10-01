// 宅建BOOST v9.0.0 - Text-to-Speech Implementation
// Web Speech APIを使用した音声読み上げ機能

class TakkenBoostTTS {
    constructor() {
        this.synth = window.speechSynthesis;
        this.currentUtterance = null;
        this.isPaused = false;
        this.isReading = false;
        this.voices = [];
        this.settings = {
            voice: null,
            rate: 1.0,
            pitch: 1.0,
            volume: 1.0,
            autoRead: false
        };
        
        this.init();
    }

    init() {
        // 音声の読み込み
        this.loadVoices();
        
        // 設定の読み込み
        this.loadSettings();
        
        // UIの作成
        this.createUI();
        
        // イベントリスナーの設定
        this.setupEventListeners();
        
        // 音声リストの更新イベント
        if (this.synth.onvoiceschanged !== undefined) {
            this.synth.onvoiceschanged = () => this.loadVoices();
        }
    }

    // 利用可能な音声を読み込み
    loadVoices() {
        this.voices = this.synth.getVoices();
        
        // 日本語音声を優先
        const japaneseVoices = this.voices.filter(voice => voice.lang.includes('ja'));
        if (japaneseVoices.length > 0 && !this.settings.voice) {
            this.settings.voice = japaneseVoices[0];
        }
        
        this.updateVoiceList();
    }

    // 設定を読み込み
    loadSettings() {
        const saved = localStorage.getItem('takken-boost-tts-settings');
        if (saved) {
            const savedSettings = JSON.parse(saved);
            Object.assign(this.settings, savedSettings);
        }
    }

    // 設定を保存
    saveSettings() {
        localStorage.setItem('takken-boost-tts-settings', JSON.stringify({
            rate: this.settings.rate,
            pitch: this.settings.pitch,
            volume: this.settings.volume,
            autoRead: this.settings.autoRead,
            voiceName: this.settings.voice ? this.settings.voice.name : null
        }));
    }

    // UIを作成
    createUI() {
        // スタイル
        const style = document.createElement('style');
        style.textContent = `
            .tts-control-panel {
                position: fixed;
                bottom: 150px;
                right: 30px;
                background: var(--glass-bg, rgba(255, 255, 255, 0.95));
                backdrop-filter: blur(10px);
                border-radius: 16px;
                padding: 20px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                z-index: 998;
                min-width: 280px;
                max-width: 320px;
                transform: translateX(calc(100% + 50px));
                transition: transform 0.3s ease;
            }
            
            .tts-control-panel.visible {
                transform: translateX(0);
            }
            
            .tts-toggle-btn {
                position: fixed;
                bottom: 150px;
                right: 20px;
                width: 56px;
                height: 56px;
                border-radius: 50%;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
                cursor: pointer;
                z-index: 997;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                transition: all 0.3s ease;
            }
            
            .tts-toggle-btn:hover {
                transform: scale(1.1);
                box-shadow: 0 6px 30px rgba(102, 126, 234, 0.4);
            }
            
            .tts-toggle-btn.active {
                background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            }
            
            /* デスクトップ対応 */
            @media (min-width: 1024px) {
                .tts-control-panel {
                    right: 20px;
                    max-width: 350px;
                }
            }
            
            /* タブレット対応 */
            @media (max-width: 1023px) and (min-width: 768px) {
                .tts-control-panel {
                    right: 10px;
                    max-width: 300px;
                }
                .tts-toggle-btn {
                    right: 10px;
                }
            }
            
            /* モバイル対応 */
            @media (max-width: 767px) {
                .tts-control-panel {
                    right: 10px;
                    left: 10px;
                    min-width: auto;
                    max-width: none;
                    bottom: 100px;
                }
                .tts-toggle-btn {
                    right: 15px;
                    bottom: 100px;
                }
            }
            
            .tts-control-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
            }
            
            .tts-control-title {
                font-size: 18px;
                font-weight: bold;
                color: var(--text-primary, #333);
            }
            
            .tts-close-btn {
                background: none;
                border: none;
                font-size: 20px;
                cursor: pointer;
                color: var(--text-secondary, #666);
            }
            
            .tts-control-group {
                margin-bottom: 15px;
            }
            
            .tts-control-label {
                display: block;
                margin-bottom: 5px;
                font-size: 14px;
                color: var(--text-secondary, #666);
            }
            
            .tts-control-slider {
                width: 100%;
                height: 6px;
                border-radius: 3px;
                background: #e0e0e0;
                outline: none;
                -webkit-appearance: none;
            }
            
            .tts-control-slider::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                cursor: pointer;
            }
            
            .tts-control-slider::-moz-range-thumb {
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                cursor: pointer;
            }
            
            .tts-control-select {
                width: 100%;
                padding: 8px;
                border: 1px solid #e0e0e0;
                border-radius: 8px;
                background: white;
                color: var(--text-primary, #333);
            }
            
            .tts-control-buttons {
                display: flex;
                gap: 10px;
                margin-top: 20px;
            }
            
            .tts-btn {
                flex: 1;
                padding: 10px;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-size: 14px;
                transition: all 0.3s ease;
            }
            
            .tts-btn-primary {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
            }
            
            .tts-btn-primary:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
            }
            
            .tts-btn-secondary {
                background: #f0f0f0;
                color: #666;
            }
            
            .tts-btn-secondary:hover {
                background: #e0e0e0;
            }
            
            .tts-status {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px;
                background: #f0f0f0;
                border-radius: 8px;
                margin-bottom: 15px;
            }
            
            .tts-status-icon {
                width: 10px;
                height: 10px;
                border-radius: 50%;
                background: #ccc;
            }
            
            .tts-status-icon.active {
                background: #4caf50;
                animation: pulse 1s infinite;
            }
            
            @keyframes pulse {
                0% { opacity: 1; }
                50% { opacity: 0.5; }
                100% { opacity: 1; }
            }
            
            .tts-checkbox-group {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .tts-checkbox {
                width: 20px;
                height: 20px;
                cursor: pointer;
            }
            
            /* ダークモード対応 */
            [data-theme="dark"] .tts-control-panel {
                background: rgba(30, 27, 75, 0.95);
                color: #f3f4f6;
            }
            
            [data-theme="dark"] .tts-control-select {
                background: #1e1b4b;
                border-color: #4c1d95;
                color: #f3f4f6;
            }
            
            [data-theme="dark"] .tts-btn-secondary {
                background: #1e1b4b;
                color: #f3f4f6;
            }
        `;
        document.head.appendChild(style);

        // トグルボタン
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'tts-toggle-btn';
        toggleBtn.id = 'tts-toggle-btn';
        toggleBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
        toggleBtn.title = '音声読み上げ設定';
        document.body.appendChild(toggleBtn);

        // コントロールパネル
        const panel = document.createElement('div');
        panel.className = 'tts-control-panel';
        panel.id = 'tts-control-panel';
        panel.innerHTML = `
            <div class="tts-control-header">
                <span class="tts-control-title">
                    <i class="fas fa-microphone-alt"></i> 音声読み上げ設定
                </span>
                <button class="tts-close-btn" id="tts-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div class="tts-status">
                <div class="tts-status-icon" id="tts-status-icon"></div>
                <span id="tts-status-text">待機中</span>
            </div>
            
            <div class="tts-control-group">
                <label class="tts-control-label">音声</label>
                <select class="tts-control-select" id="tts-voice-select">
                    <option value="">デフォルト</option>
                </select>
            </div>
            
            <div class="tts-control-group">
                <label class="tts-control-label">
                    速度: <span id="tts-rate-value">1.0</span>x
                </label>
                <input type="range" class="tts-control-slider" id="tts-rate-slider"
                       min="0.5" max="2" step="0.1" value="1">
            </div>
            
            <div class="tts-control-group">
                <label class="tts-control-label">
                    音程: <span id="tts-pitch-value">1.0</span>
                </label>
                <input type="range" class="tts-control-slider" id="tts-pitch-slider"
                       min="0.5" max="2" step="0.1" value="1">
            </div>
            
            <div class="tts-control-group">
                <label class="tts-control-label">
                    音量: <span id="tts-volume-value">100</span>%
                </label>
                <input type="range" class="tts-control-slider" id="tts-volume-slider"
                       min="0" max="100" step="5" value="100">
            </div>
            
            <div class="tts-control-group">
                <div class="tts-checkbox-group">
                    <input type="checkbox" class="tts-checkbox" id="tts-auto-read">
                    <label for="tts-auto-read">問題を自動的に読み上げる</label>
                </div>
            </div>
            
            <div class="tts-control-buttons">
                <button class="tts-btn tts-btn-primary" id="tts-read-btn">
                    <i class="fas fa-play"></i> 読み上げ開始
                </button>
                <button class="tts-btn tts-btn-secondary" id="tts-stop-btn">
                    <i class="fas fa-stop"></i> 停止
                </button>
            </div>
        `;
        document.body.appendChild(panel);
    }

    // イベントリスナーを設定
    setupEventListeners() {
        // トグルボタン
        document.getElementById('tts-toggle-btn').addEventListener('click', () => {
            this.togglePanel();
        });

        // 閉じるボタン
        document.getElementById('tts-close').addEventListener('click', () => {
            this.hidePanel();
        });

        // 音声選択
        document.getElementById('tts-voice-select').addEventListener('change', (e) => {
            const voiceName = e.target.value;
            this.settings.voice = this.voices.find(v => v.name === voiceName);
            this.saveSettings();
        });

        // スライダー
        document.getElementById('tts-rate-slider').addEventListener('input', (e) => {
            this.settings.rate = parseFloat(e.target.value);
            document.getElementById('tts-rate-value').textContent = this.settings.rate;
            this.saveSettings();
        });

        document.getElementById('tts-pitch-slider').addEventListener('input', (e) => {
            this.settings.pitch = parseFloat(e.target.value);
            document.getElementById('tts-pitch-value').textContent = this.settings.pitch;
            this.saveSettings();
        });

        document.getElementById('tts-volume-slider').addEventListener('input', (e) => {
            this.settings.volume = parseFloat(e.target.value) / 100;
            document.getElementById('tts-volume-value').textContent = e.target.value;
            this.saveSettings();
        });

        // 自動読み上げ
        document.getElementById('tts-auto-read').addEventListener('change', (e) => {
            this.settings.autoRead = e.target.checked;
            this.saveSettings();
        });

        // 読み上げボタン
        document.getElementById('tts-read-btn').addEventListener('click', () => {
            this.readCurrentContent();
        });

        // 停止ボタン
        document.getElementById('tts-stop-btn').addEventListener('click', () => {
            this.stop();
        });

        // キーボードショートカット (Alt + R)
        document.addEventListener('keydown', (e) => {
            if (e.altKey && e.key === 'r') {
                e.preventDefault();
                this.readCurrentContent();
            }
            if (e.altKey && e.key === 's') {
                e.preventDefault();
                this.stop();
            }
        });
    }

    // 音声リストを更新
    updateVoiceList() {
        const select = document.getElementById('tts-voice-select');
        if (!select) return;

        select.innerHTML = '<option value="">デフォルト</option>';
        
        // 日本語音声を優先して表示
        const japaneseVoices = this.voices.filter(v => v.lang.includes('ja'));
        const otherVoices = this.voices.filter(v => !v.lang.includes('ja'));
        
        if (japaneseVoices.length > 0) {
            const optgroup = document.createElement('optgroup');
            optgroup.label = '日本語';
            japaneseVoices.forEach(voice => {
                const option = document.createElement('option');
                option.value = voice.name;
                option.textContent = `${voice.name} (${voice.lang})`;
                optgroup.appendChild(option);
            });
            select.appendChild(optgroup);
        }
        
        if (otherVoices.length > 0) {
            const optgroup = document.createElement('optgroup');
            optgroup.label = 'その他の言語';
            otherVoices.forEach(voice => {
                const option = document.createElement('option');
                option.value = voice.name;
                option.textContent = `${voice.name} (${voice.lang})`;
                optgroup.appendChild(option);
            });
            select.appendChild(optgroup);
        }
    }

    // パネルの表示/非表示を切り替え
    togglePanel() {
        const panel = document.getElementById('tts-control-panel');
        if (panel.classList.contains('visible')) {
            this.hidePanel();
        } else {
            this.showPanel();
        }
    }

    showPanel() {
        document.getElementById('tts-control-panel').classList.add('visible');
    }

    hidePanel() {
        document.getElementById('tts-control-panel').classList.remove('visible');
    }

    // 現在のコンテンツを読み上げ
    readCurrentContent() {
        // 問題文を取得
        const questionText = document.getElementById('question-text');
        const content = questionText ? questionText.textContent : this.getSelectedText();
        
        if (content) {
            this.speak(content);
        } else {
            // ページの主要コンテンツを読み上げ
            const mainContent = document.querySelector('.hero-content, .question-area, .feature-description');
            if (mainContent) {
                this.speak(mainContent.textContent);
            }
        }
    }

    // 選択されたテキストを取得
    getSelectedText() {
        return window.getSelection().toString();
    }

    // テキストを読み上げ
    speak(text) {
        if (!text) return;

        // 既存の読み上げを停止
        this.stop();

        this.currentUtterance = new SpeechSynthesisUtterance(text);
        
        // 設定を適用
        if (this.settings.voice) {
            this.currentUtterance.voice = this.settings.voice;
        }
        this.currentUtterance.rate = this.settings.rate;
        this.currentUtterance.pitch = this.settings.pitch;
        this.currentUtterance.volume = this.settings.volume;

        // イベントハンドラ
        this.currentUtterance.onstart = () => {
            this.isReading = true;
            this.updateStatus('読み上げ中');
            document.getElementById('tts-toggle-btn').classList.add('active');
        };

        this.currentUtterance.onend = () => {
            this.isReading = false;
            this.updateStatus('待機中');
            document.getElementById('tts-toggle-btn').classList.remove('active');
        };

        this.currentUtterance.onerror = (event) => {
            console.error('TTS Error:', event);
            this.updateStatus('エラー');
        };

        // 読み上げ開始
        this.synth.speak(this.currentUtterance);
    }

    // 読み上げを停止
    stop() {
        this.synth.cancel();
        this.isReading = false;
        this.updateStatus('待機中');
        document.getElementById('tts-toggle-btn').classList.remove('active');
    }

    // 一時停止
    pause() {
        if (this.synth.speaking && !this.isPaused) {
            this.synth.pause();
            this.isPaused = true;
            this.updateStatus('一時停止中');
        }
    }

    // 再開
    resume() {
        if (this.isPaused) {
            this.synth.resume();
            this.isPaused = false;
            this.updateStatus('読み上げ中');
        }
    }

    // ステータスを更新
    updateStatus(status) {
        const statusText = document.getElementById('tts-status-text');
        const statusIcon = document.getElementById('tts-status-icon');
        
        if (statusText) {
            statusText.textContent = status;
        }
        
        if (statusIcon) {
            if (status === '読み上げ中') {
                statusIcon.classList.add('active');
            } else {
                statusIcon.classList.remove('active');
            }
        }
    }
}

// 初期化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.takkenBoostTTS = new TakkenBoostTTS();
    });
} else {
    window.takkenBoostTTS = new TakkenBoostTTS();
}
export const mockExamPageHTML = `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>模擬試験 - 宅建BOOST v9.0.0</title>
    
    <!-- PWA Meta Tags -->
    <meta name="theme-color" content="#764ba2">
    <link rel="manifest" href="/manifest.json">
    
    <!-- Styles -->
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    <link href="/static/styles-v9.css" rel="stylesheet">
    
    <!-- Libraries -->
    <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    
    <style>
        body {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .glass-card {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 16px;
            box-shadow: 0 8px 32px rgba(31, 38, 135, 0.15);
            padding: 2rem;
            margin: 1rem;
        }
        
        .timer-display {
            font-size: 2rem;
            font-weight: bold;
            color: #764ba2;
            font-variant-numeric: tabular-nums;
        }
        
        .question-nav-btn {
            width: 40px;
            height: 40px;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            background: white;
            font-weight: bold;
            transition: all 0.3s ease;
        }
        
        .question-nav-btn:hover {
            border-color: #764ba2;
            background: rgba(118, 75, 162, 0.1);
        }
        
        .question-nav-btn.answered {
            background: #764ba2;
            color: white;
            border-color: #764ba2;
        }
        
        .question-nav-btn.current {
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.3);
        }
    </style>
</head>
<body>
    <!-- ナビゲーションバー -->
    <nav class="glass-card fixed top-0 left-0 right-0 z-50" style="margin: 0; border-radius: 0;">
        <div class="container mx-auto flex justify-between items-center">
            <div class="flex items-center space-x-4">
                <a href="/" class="text-2xl font-bold text-purple-600">
                    <i class="fas fa-home"></i> 宅建BOOST
                </a>
                <span class="text-sm text-gray-600">模擬試験</span>
            </div>
            <div class="flex items-center space-x-6">
                <div class="timer-display" id="timer">
                    <i class="fas fa-clock"></i> 02:00:00
                </div>
                <button id="pause-btn" class="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600">
                    <i class="fas fa-pause"></i> 一時停止
                </button>
                <button id="submit-exam-btn" class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
                    <i class="fas fa-flag-checkered"></i> 終了する
                </button>
            </div>
        </div>
    </nav>
    
    <!-- メインコンテンツ -->
    <div class="container mx-auto" style="margin-top: 100px;">
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <!-- 左サイド：問題ナビゲーション -->
            <div class="lg:col-span-1">
                <div class="glass-card sticky top-24">
                    <h3 class="font-bold mb-4">問題一覧</h3>
                    <div class="grid grid-cols-5 gap-2" id="question-nav">
                        <!-- 50問のナビゲーションボタン -->
                    </div>
                    <div class="mt-4 text-sm">
                        <div class="flex items-center space-x-2">
                            <div class="w-4 h-4 bg-purple-600 rounded"></div>
                            <span>回答済み</span>
                        </div>
                        <div class="flex items-center space-x-2 mt-2">
                            <div class="w-4 h-4 border-2 border-gray-300 rounded"></div>
                            <span>未回答</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- メインエリア：問題表示 -->
            <div class="lg:col-span-3">
                <!-- 試験情報 -->
                <div class="glass-card mb-4">
                    <div class="grid grid-cols-3 gap-4 text-center">
                        <div>
                            <div class="text-2xl font-bold text-blue-600">50問</div>
                            <div class="text-sm text-gray-600">総問題数</div>
                        </div>
                        <div>
                            <div class="text-2xl font-bold text-green-600" id="answered-count">0</div>
                            <div class="text-sm text-gray-600">回答済み</div>
                        </div>
                        <div>
                            <div class="text-2xl font-bold text-gray-600" id="remaining-count">50</div>
                            <div class="text-sm text-gray-600">残り</div>
                        </div>
                    </div>
                    <div class="mt-4">
                        <div class="bg-gray-200 rounded-full h-2">
                            <div id="progress-bar" class="bg-gradient-to-r from-purple-500 to-purple-700 h-2 rounded-full transition-all duration-500" style="width: 0%"></div>
                        </div>
                    </div>
                </div>
                
                <!-- 問題カード -->
                <div class="glass-card" id="question-container">
                    <div class="flex justify-between items-start mb-4">
                        <h2 class="text-xl font-bold">
                            問題 <span id="question-number">1</span> / 50
                        </h2>
                        <span class="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm" id="category-badge">
                            権利関係
                        </span>
                    </div>
                    
                    <div class="question-text text-lg mb-6" id="question-text">
                        問題を読み込んでいます...
                    </div>
                    
                    <div id="options-container" class="space-y-3">
                        <!-- 選択肢がここに表示されます -->
                    </div>
                    
                    <div class="flex justify-between mt-8">
                        <button id="prev-btn" class="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition">
                            <i class="fas fa-arrow-left"></i> 前の問題
                        </button>
                        <button id="mark-btn" class="px-6 py-2 border-2 border-yellow-500 text-yellow-600 rounded-lg hover:bg-yellow-50 transition">
                            <i class="fas fa-bookmark"></i> マーク
                        </button>
                        <button id="next-btn" class="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
                            次の問題 <i class="fas fa-arrow-right"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <!-- 終了確認モーダル -->
    <div id="confirm-modal" class="fixed inset-0 bg-black bg-opacity-50 hidden flex items-center justify-center z-50">
        <div class="glass-card max-w-md">
            <h3 class="text-xl font-bold mb-4">模擬試験を終了しますか？</h3>
            <div class="mb-4">
                <p>回答済み: <span id="modal-answered">0</span> / 50</p>
                <p>残り時間: <span id="modal-time">02:00:00</span></p>
            </div>
            <div class="flex space-x-4">
                <button id="cancel-submit" class="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400">
                    キャンセル
                </button>
                <button id="confirm-submit" class="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
                    終了する
                </button>
            </div>
        </div>
    </div>
    
    <!-- 結果モーダル -->
    <div id="result-modal" class="fixed inset-0 bg-black bg-opacity-50 hidden flex items-center justify-center z-50">
        <div class="glass-card max-w-2xl w-full">
            <h2 class="text-2xl font-bold mb-6 text-center">試験結果</h2>
            
            <div class="grid grid-cols-3 gap-6 mb-6">
                <div class="text-center">
                    <div class="text-4xl font-bold text-blue-600" id="result-score">0</div>
                    <div class="text-gray-600">得点</div>
                </div>
                <div class="text-center">
                    <div class="text-4xl font-bold text-green-600" id="result-correct">0</div>
                    <div class="text-gray-600">正解数</div>
                </div>
                <div class="text-center">
                    <div class="text-4xl font-bold" id="result-pass">
                        <span class="text-red-600">不合格</span>
                    </div>
                    <div class="text-gray-600">判定（35問以上で合格）</div>
                </div>
            </div>
            
            <canvas id="result-chart" width="400" height="200"></canvas>
            
            <div class="flex space-x-4 mt-6">
                <button id="review-btn" class="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                    <i class="fas fa-book-open"></i> 解答を確認
                </button>
                <a href="/" class="flex-1">
                    <button class="w-full px-4 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400">
                        <i class="fas fa-home"></i> ホームに戻る
                    </button>
                </a>
            </div>
        </div>
    </div>
    
    <!-- JavaScript -->
    <script>
        // APIのベースURLを設定
        axios.defaults.baseURL = window.location.origin;
        
        let examQuestions = [];
        let currentIndex = 0;
        let answers = {};
        let markedQuestions = new Set();
        let examStartTime = Date.now();
        let timerInterval;
        let isPaused = false;
        let remainingTime = 7200; // 2時間（秒）
        
        // 試験問題を読み込む
        async function loadExam() {
            try {
                // ゲストユーザーとして試験を開始
                const response = await axios.post('/api/mock-exam/start', {
                    userId: 1  // ゲストユーザーID
                });
                
                if (!response.data || !response.data.questions) {
                    throw new Error('試験データの形式が正しくありません');
                }
                
                examQuestions = response.data.questions;
                localStorage.setItem('examId', response.data.examId);
                initializeNav();
                displayQuestion();
                startTimer();
            } catch (error) {
                console.error('試験の開始に失敗しました:', error);
                // エラーメッセージを詳しく表示
                const errorMsg = error.response?.data?.error || error.message || '不明なエラー';
                alert('試験の開始に失敗しました: ' + errorMsg + '\nページをリロードしてください。');
            }
        }
        
        // ナビゲーションボタンを初期化
        function initializeNav() {
            const navContainer = document.getElementById('question-nav');
            navContainer.innerHTML = '';
            
            for (let i = 0; i < 50; i++) {
                const btn = document.createElement('button');
                btn.className = 'question-nav-btn';
                btn.textContent = i + 1;
                btn.onclick = () => jumpToQuestion(i);
                navContainer.appendChild(btn);
            }
            updateNavButtons();
        }
        
        // 問題を表示
        function displayQuestion() {
            if (!examQuestions.length) return;
            
            const question = examQuestions[currentIndex];
            document.getElementById('question-number').textContent = currentIndex + 1;
            document.getElementById('question-text').textContent = question.question_text;
            
            // カテゴリー表示
            const categoryNames = {
                rights: '権利関係',
                businessLaw: '宅建業法',
                restrictions: '法令制限',
                taxOther: '税その他'
            };
            document.getElementById('category-badge').textContent = categoryNames[question.subject] || question.category;
            
            // 選択肢表示
            const optionsContainer = document.getElementById('options-container');
            optionsContainer.innerHTML = '';
            
            const options = JSON.parse(question.options);
            options.forEach((option, index) => {
                const label = document.createElement('label');
                label.className = 'flex items-start p-3 bg-white rounded-lg cursor-pointer hover:bg-purple-50 transition';
                label.innerHTML = \`
                    <input type="radio" name="answer" value="\${index}" class="mt-1 mr-3" 
                        \${answers[currentIndex] === index ? 'checked' : ''}>
                    <div>
                        <span class="font-bold mr-2">\${index + 1}.</span>
                        <span>\${option}</span>
                    </div>
                \`;
                label.querySelector('input').onchange = (e) => selectAnswer(parseInt(e.target.value));
                optionsContainer.appendChild(label);
            });
            
            updateNavButtons();
            updateProgress();
        }
        
        // 回答を選択
        function selectAnswer(answerIndex) {
            answers[currentIndex] = answerIndex;
            updateNavButtons();
            updateProgress();
        }
        
        // 問題にジャンプ
        function jumpToQuestion(index) {
            currentIndex = index;
            displayQuestion();
        }
        
        // ナビゲーションボタンを更新
        function updateNavButtons() {
            const buttons = document.querySelectorAll('.question-nav-btn');
            buttons.forEach((btn, index) => {
                btn.classList.remove('current', 'answered');
                if (index === currentIndex) {
                    btn.classList.add('current');
                }
                if (answers[index] !== undefined) {
                    btn.classList.add('answered');
                }
            });
        }
        
        // 進捗を更新
        function updateProgress() {
            const answered = Object.keys(answers).length;
            const remaining = 50 - answered;
            
            document.getElementById('answered-count').textContent = answered;
            document.getElementById('remaining-count').textContent = remaining;
            document.getElementById('progress-bar').style.width = (answered / 50 * 100) + '%';
        }
        
        // タイマー開始
        function startTimer() {
            timerInterval = setInterval(() => {
                if (!isPaused) {
                    remainingTime--;
                    if (remainingTime <= 0) {
                        clearInterval(timerInterval);
                        submitExam();
                    }
                    updateTimerDisplay();
                }
            }, 1000);
        }
        
        // タイマー表示を更新
        function updateTimerDisplay() {
            const hours = Math.floor(remainingTime / 3600);
            const minutes = Math.floor((remainingTime % 3600) / 60);
            const seconds = remainingTime % 60;
            
            const display = 
                String(hours).padStart(2, '0') + ':' +
                String(minutes).padStart(2, '0') + ':' +
                String(seconds).padStart(2, '0');
            
            document.getElementById('timer').innerHTML = \`<i class="fas fa-clock"></i> \${display}\`;
            
            // 残り時間が少ない場合は色を変える
            if (remainingTime < 600) { // 10分未満
                document.getElementById('timer').style.color = '#ef4444';
            }
        }
        
        // 試験を送信
        async function submitExam() {
            clearInterval(timerInterval);
            
            // 回答データを整理
            const submissionData = {
                examId: localStorage.getItem('examId'),
                answers: [],
                timeSpent: 7200 - remainingTime
            };
            
            examQuestions.forEach((question, index) => {
                submissionData.answers.push({
                    questionId: question.id,
                    answer: answers[index] !== undefined ? answers[index] + 1 : null
                });
            });
            
            try {
                const response = await axios.post('/api/mock-exam/submit', submissionData);
                showResults(response.data);
            } catch (error) {
                console.error('結果の送信に失敗しました:', error);
            }
        }
        
        // 結果を表示
        function showResults(results) {
            document.getElementById('result-score').textContent = results.score;
            document.getElementById('result-correct').textContent = results.correctCount;
            
            if (results.correctCount >= 35) {
                document.getElementById('result-pass').innerHTML = '<span class="text-green-600">合格</span>';
            }
            
            // グラフ表示
            const ctx = document.getElementById('result-chart').getContext('2d');
            new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['正解', '不正解'],
                    datasets: [{
                        data: [results.correctCount, 50 - results.correctCount],
                        backgroundColor: ['#10b981', '#ef4444']
                    }]
                }
            });
            
            document.getElementById('result-modal').classList.remove('hidden');
        }
        
        // イベントリスナー
        document.getElementById('prev-btn').addEventListener('click', () => {
            if (currentIndex > 0) {
                currentIndex--;
                displayQuestion();
            }
        });
        
        document.getElementById('next-btn').addEventListener('click', () => {
            if (currentIndex < 49) {
                currentIndex++;
                displayQuestion();
            }
        });
        
        document.getElementById('pause-btn').addEventListener('click', function() {
            isPaused = !isPaused;
            this.innerHTML = isPaused 
                ? '<i class="fas fa-play"></i> 再開' 
                : '<i class="fas fa-pause"></i> 一時停止';
            this.classList.toggle('bg-green-500');
            this.classList.toggle('bg-yellow-500');
        });
        
        document.getElementById('submit-exam-btn').addEventListener('click', () => {
            document.getElementById('modal-answered').textContent = Object.keys(answers).length;
            document.getElementById('modal-time').textContent = document.getElementById('timer').textContent.replace(/<[^>]*>/g, '');
            document.getElementById('confirm-modal').classList.remove('hidden');
        });
        
        document.getElementById('cancel-submit').addEventListener('click', () => {
            document.getElementById('confirm-modal').classList.add('hidden');
        });
        
        document.getElementById('confirm-submit').addEventListener('click', () => {
            document.getElementById('confirm-modal').classList.add('hidden');
            submitExam();
        });
        
        // 初期化
        loadExam();
    </script>
</body>
</html>`;
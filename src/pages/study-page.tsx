export const studyPageHTML = `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>学習モード - 宅建BOOST v9.0.0</title>
    
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
        
        .question-card {
            animation: slideIn 0.5s ease-out;
        }
        
        @keyframes slideIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .option-button {
            width: 100%;
            text-align: left;
            padding: 1rem;
            margin: 0.5rem 0;
            border: 2px solid transparent;
            border-radius: 8px;
            background: white;
            transition: all 0.3s ease;
            cursor: pointer;
        }
        
        .option-button:hover {
            border-color: #667eea;
            background: linear-gradient(to right, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
        }
        
        .option-button.selected {
            border-color: #764ba2;
            background: linear-gradient(to right, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.2));
        }
        
        .option-button.correct {
            border-color: #10b981;
            background: rgba(16, 185, 129, 0.1);
        }
        
        .option-button.incorrect {
            border-color: #ef4444;
            background: rgba(239, 68, 68, 0.1);
        }
        
        .category-badge {
            display: inline-block;
            padding: 0.25rem 1rem;
            border-radius: 20px;
            font-size: 0.875rem;
            font-weight: 600;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
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
                <span class="text-sm text-gray-600">学習モード</span>
            </div>
            <div class="flex items-center space-x-4">
                <span id="question-counter" class="text-gray-600">
                    問題 <span id="current-num">1</span> / <span id="total-num">402</span>
                </span>
                <button id="dark-mode-toggle" class="p-2 rounded-full hover:bg-gray-100">
                    <i class="fas fa-moon"></i>
                </button>
            </div>
        </div>
    </nav>
    
    <!-- メインコンテンツ -->
    <div class="container mx-auto" style="margin-top: 100px; max-width: 800px;">
        <!-- カテゴリー選択 -->
        <div class="glass-card">
            <h2 class="text-xl font-bold mb-4">
                <i class="fas fa-folder-open"></i> カテゴリー選択
            </h2>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-2" id="category-buttons">
                <button class="category-btn active" data-category="all">
                    全て (402問)
                </button>
                <button class="category-btn" data-category="rights">
                    権利関係 (125問)
                </button>
                <button class="category-btn" data-category="businessLaw">
                    宅建業法 (143問)
                </button>
                <button class="category-btn" data-category="restrictions">
                    法令制限 (80問)
                </button>
                <button class="category-btn" data-category="taxOther">
                    税その他 (54問)
                </button>
            </div>
        </div>
        
        <!-- 問題表示エリア -->
        <div class="glass-card question-card" id="question-container">
            <div class="flex justify-between items-start mb-4">
                <span class="category-badge" id="category-badge">権利関係</span>
                <div class="text-right">
                    <span class="text-sm text-gray-600">難易度</span>
                    <div id="difficulty-stars" class="text-yellow-500">
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                    </div>
                </div>
            </div>
            
            <div class="question-text text-lg mb-6" id="question-text">
                問題を読み込んでいます...
            </div>
            
            <div id="options-container" class="space-y-2">
                <!-- 選択肢がここに表示されます -->
            </div>
            
            <div id="answer-section" class="mt-6 hidden">
                <div class="p-4 bg-blue-50 rounded-lg">
                    <h3 class="font-bold text-lg mb-2 flex items-center">
                        <i class="fas fa-lightbulb text-yellow-500 mr-2"></i>
                        解説
                    </h3>
                    <p id="explanation-text" class="text-gray-700"></p>
                </div>
            </div>
            
            <div class="flex justify-between mt-6">
                <button id="prev-btn" class="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition">
                    <i class="fas fa-arrow-left"></i> 前の問題
                </button>
                <button id="submit-btn" class="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded-lg hover:from-purple-600 hover:to-purple-800 transition">
                    <i class="fas fa-check"></i> 回答する
                </button>
                <button id="next-btn" class="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition hidden">
                    次の問題 <i class="fas fa-arrow-right"></i>
                </button>
            </div>
        </div>
        
        <!-- 進捗表示 -->
        <div class="glass-card">
            <h3 class="text-lg font-bold mb-4">
                <i class="fas fa-chart-line"></i> 学習進捗
            </h3>
            <div class="grid grid-cols-3 gap-4 text-center">
                <div>
                    <div class="text-2xl font-bold text-green-600" id="correct-count">0</div>
                    <div class="text-sm text-gray-600">正解</div>
                </div>
                <div>
                    <div class="text-2xl font-bold text-red-600" id="incorrect-count">0</div>
                    <div class="text-sm text-gray-600">不正解</div>
                </div>
                <div>
                    <div class="text-2xl font-bold text-blue-600" id="accuracy-rate">0%</div>
                    <div class="text-sm text-gray-600">正答率</div>
                </div>
            </div>
            <div class="mt-4">
                <div class="bg-gray-200 rounded-full h-2">
                    <div id="progress-bar" class="bg-gradient-to-r from-purple-500 to-purple-700 h-2 rounded-full transition-all duration-500" style="width: 0%"></div>
                </div>
            </div>
        </div>
    </div>
    
    <!-- JavaScript -->
    <script src="/static/darkmode.js"></script>
    <script src="/static/text-to-speech.js"></script>
    <script>
        let currentQuestion = null;
        let selectedAnswer = null;
        let currentCategory = 'all';
        let questions = [];
        let currentIndex = 0;
        let stats = {
            correct: 0,
            incorrect: 0,
            total: 0
        };
        
        // 問題を読み込む
        async function loadQuestions(category = 'all') {
            try {
                const url = category === 'all' 
                    ? '/api/study/questions?limit=402' 
                    : \`/api/study/questions?subject=\${category}&limit=200\`;
                    
                const response = await axios.get(url);
                questions = response.data.questions;
                currentIndex = 0;
                displayQuestion();
                updateCounter();
            } catch (error) {
                console.error('問題の読み込みに失敗しました:', error);
            }
        }
        
        // 問題を表示
        function displayQuestion() {
            if (!questions.length) return;
            
            currentQuestion = questions[currentIndex];
            selectedAnswer = null;
            
            // カテゴリーバッジ更新
            const categoryNames = {
                rights: '権利関係',
                businessLaw: '宅建業法',
                restrictions: '法令制限',
                taxOther: '税その他'
            };
            document.getElementById('category-badge').textContent = categoryNames[currentQuestion.subject] || currentQuestion.category;
            
            // 難易度表示
            const difficultyStars = {
                easy: 1,
                intermediate: 2,
                hard: 3
            };
            const starCount = difficultyStars[currentQuestion.difficulty] || 2;
            let starsHTML = '';
            for (let i = 0; i < 3; i++) {
                starsHTML += i < starCount ? '<i class="fas fa-star"></i>' : '<i class="far fa-star"></i>';
            }
            document.getElementById('difficulty-stars').innerHTML = starsHTML;
            
            // 問題文表示
            document.getElementById('question-text').textContent = currentQuestion.question_text;
            
            // 選択肢表示
            const optionsContainer = document.getElementById('options-container');
            optionsContainer.innerHTML = '';
            
            const options = JSON.parse(currentQuestion.options);
            options.forEach((option, index) => {
                const button = document.createElement('button');
                button.className = 'option-button';
                button.innerHTML = \`
                    <div class="flex items-center">
                        <span class="mr-3 font-bold">\${index + 1}.</span>
                        <span>\${option}</span>
                    </div>
                \`;
                button.onclick = () => selectOption(index);
                optionsContainer.appendChild(button);
            });
            
            // UIリセット
            document.getElementById('answer-section').classList.add('hidden');
            document.getElementById('submit-btn').style.display = 'block';
            document.getElementById('next-btn').classList.add('hidden');
        }
        
        // 選択肢を選ぶ
        function selectOption(index) {
            selectedAnswer = index;
            document.querySelectorAll('.option-button').forEach((btn, i) => {
                btn.classList.toggle('selected', i === index);
            });
        }
        
        // 回答を送信
        function submitAnswer() {
            if (selectedAnswer === null) {
                alert('選択肢を選んでください');
                return;
            }
            
            const isCorrect = selectedAnswer === currentQuestion.correct_answer - 1;
            
            // 統計更新
            stats.total++;
            if (isCorrect) {
                stats.correct++;
            } else {
                stats.incorrect++;
            }
            updateStats();
            
            // 正解/不正解表示
            document.querySelectorAll('.option-button').forEach((btn, i) => {
                if (i === currentQuestion.correct_answer - 1) {
                    btn.classList.add('correct');
                } else if (i === selectedAnswer) {
                    btn.classList.add('incorrect');
                }
                btn.onclick = null;
            });
            
            // 解説表示
            document.getElementById('explanation-text').textContent = currentQuestion.explanation;
            document.getElementById('answer-section').classList.remove('hidden');
            
            // ボタン切り替え
            document.getElementById('submit-btn').style.display = 'none';
            document.getElementById('next-btn').classList.remove('hidden');
        }
        
        // 次の問題へ
        function nextQuestion() {
            if (currentIndex < questions.length - 1) {
                currentIndex++;
                displayQuestion();
                updateCounter();
            } else {
                alert('全ての問題が終了しました！');
            }
        }
        
        // 前の問題へ
        function prevQuestion() {
            if (currentIndex > 0) {
                currentIndex--;
                displayQuestion();
                updateCounter();
            }
        }
        
        // カウンター更新
        function updateCounter() {
            document.getElementById('current-num').textContent = currentIndex + 1;
            document.getElementById('total-num').textContent = questions.length;
        }
        
        // 統計更新
        function updateStats() {
            document.getElementById('correct-count').textContent = stats.correct;
            document.getElementById('incorrect-count').textContent = stats.incorrect;
            const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
            document.getElementById('accuracy-rate').textContent = accuracy + '%';
            
            const progress = (stats.total / questions.length) * 100;
            document.getElementById('progress-bar').style.width = progress + '%';
        }
        
        // カテゴリー変更
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                currentCategory = this.dataset.category;
                loadQuestions(currentCategory);
            });
        });
        
        // イベントリスナー
        document.getElementById('submit-btn').addEventListener('click', submitAnswer);
        document.getElementById('next-btn').addEventListener('click', nextQuestion);
        document.getElementById('prev-btn').addEventListener('click', prevQuestion);
        
        // 初期化
        loadQuestions();
    </script>
    
    <style>
        .category-btn {
            padding: 0.5rem 1rem;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            background: white;
            transition: all 0.3s ease;
        }
        
        .category-btn:hover {
            border-color: #764ba2;
            background: linear-gradient(to right, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
        }
        
        .category-btn.active {
            border-color: #764ba2;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
        }
    </style>
</body>
</html>`;
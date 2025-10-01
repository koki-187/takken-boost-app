export const progressPageHTML = `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>学習進捗 - 宅建BOOST v9.0.0</title>
    
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
        
        .stat-card {
            background: linear-gradient(145deg, #ffffff, #f3f4f6);
            border-radius: 12px;
            padding: 1.5rem;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            transition: transform 0.3s ease;
        }
        
        .stat-card:hover {
            transform: translateY(-5px);
        }
        
        .achievement-badge {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2rem;
            margin: 0 auto;
            background: linear-gradient(135deg, #fbbf24, #f59e0b);
            color: white;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .achievement-badge.locked {
            background: #e5e7eb;
            color: #9ca3af;
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
                <span class="text-sm text-gray-600">学習進捗</span>
            </div>
            <div class="flex items-center space-x-4">
                <span class="text-gray-600">
                    <i class="fas fa-user"></i> ゲストユーザー
                </span>
                <button id="dark-mode-toggle" class="p-2 rounded-full hover:bg-gray-100">
                    <i class="fas fa-moon"></i>
                </button>
            </div>
        </div>
    </nav>
    
    <!-- メインコンテンツ -->
    <div class="container mx-auto" style="margin-top: 100px;">
        <!-- 総合統計 -->
        <div class="glass-card">
            <h2 class="text-2xl font-bold mb-6">
                <i class="fas fa-chart-line text-purple-600"></i> 総合統計
            </h2>
            
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div class="stat-card">
                    <div class="text-3xl font-bold text-purple-600" id="total-studied">0</div>
                    <div class="text-gray-600">学習済み問題</div>
                    <div class="text-sm text-gray-500">全402問中</div>
                </div>
                
                <div class="stat-card">
                    <div class="text-3xl font-bold text-green-600" id="correct-rate">0%</div>
                    <div class="text-gray-600">正答率</div>
                    <div class="text-sm text-gray-500">目標: 75%</div>
                </div>
                
                <div class="stat-card">
                    <div class="text-3xl font-bold text-blue-600" id="study-streak">0</div>
                    <div class="text-gray-600">連続学習日数</div>
                    <div class="text-sm text-gray-500">🔥 継続中</div>
                </div>
                
                <div class="stat-card">
                    <div class="text-3xl font-bold text-yellow-600" id="mock-exams">0</div>
                    <div class="text-gray-600">模擬試験受験回数</div>
                    <div class="text-sm text-gray-500">最高: -点</div>
                </div>
            </div>
        </div>
        
        <!-- カテゴリー別進捗 -->
        <div class="glass-card">
            <h2 class="text-2xl font-bold mb-6">
                <i class="fas fa-folder-open text-purple-600"></i> カテゴリー別進捗
            </h2>
            
            <div class="space-y-4">
                <div class="category-progress">
                    <div class="flex justify-between mb-2">
                        <span class="font-medium">権利関係</span>
                        <span class="text-gray-600"><span id="rights-studied">0</span> / 125問</span>
                    </div>
                    <div class="bg-gray-200 rounded-full h-3">
                        <div id="rights-bar" class="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500" style="width: 0%"></div>
                    </div>
                    <div class="text-right text-sm text-gray-600 mt-1">正答率: <span id="rights-accuracy">0%</span></div>
                </div>
                
                <div class="category-progress">
                    <div class="flex justify-between mb-2">
                        <span class="font-medium">宅建業法</span>
                        <span class="text-gray-600"><span id="businessLaw-studied">0</span> / 143問</span>
                    </div>
                    <div class="bg-gray-200 rounded-full h-3">
                        <div id="businessLaw-bar" class="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500" style="width: 0%"></div>
                    </div>
                    <div class="text-right text-sm text-gray-600 mt-1">正答率: <span id="businessLaw-accuracy">0%</span></div>
                </div>
                
                <div class="category-progress">
                    <div class="flex justify-between mb-2">
                        <span class="font-medium">法令上の制限</span>
                        <span class="text-gray-600"><span id="restrictions-studied">0</span> / 80問</span>
                    </div>
                    <div class="bg-gray-200 rounded-full h-3">
                        <div id="restrictions-bar" class="bg-gradient-to-r from-yellow-500 to-yellow-600 h-3 rounded-full transition-all duration-500" style="width: 0%"></div>
                    </div>
                    <div class="text-right text-sm text-gray-600 mt-1">正答率: <span id="restrictions-accuracy">0%</span></div>
                </div>
                
                <div class="category-progress">
                    <div class="flex justify-between mb-2">
                        <span class="font-medium">税その他</span>
                        <span class="text-gray-600"><span id="taxOther-studied">0</span> / 54問</span>
                    </div>
                    <div class="bg-gray-200 rounded-full h-3">
                        <div id="taxOther-bar" class="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-500" style="width: 0%"></div>
                    </div>
                    <div class="text-right text-sm text-gray-600 mt-1">正答率: <span id="taxOther-accuracy">0%</span></div>
                </div>
            </div>
        </div>
        
        <!-- 学習グラフ -->
        <div class="glass-card">
            <h2 class="text-2xl font-bold mb-6">
                <i class="fas fa-chart-bar text-purple-600"></i> 学習推移
            </h2>
            
            <canvas id="progress-chart" width="400" height="200"></canvas>
        </div>
        
        <!-- 実績バッジ -->
        <div class="glass-card">
            <h2 class="text-2xl font-bold mb-6">
                <i class="fas fa-trophy text-purple-600"></i> 実績
            </h2>
            
            <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div class="text-center">
                    <div class="achievement-badge" id="badge-first">
                        <i class="fas fa-play"></i>
                    </div>
                    <div class="mt-2 font-medium">初めの一歩</div>
                    <div class="text-sm text-gray-600">最初の問題を解く</div>
                </div>
                
                <div class="text-center">
                    <div class="achievement-badge locked" id="badge-100">
                        <i class="fas fa-certificate"></i>
                    </div>
                    <div class="mt-2 font-medium">100問達成</div>
                    <div class="text-sm text-gray-600">100問解答完了</div>
                </div>
                
                <div class="text-center">
                    <div class="achievement-badge locked" id="badge-perfect">
                        <i class="fas fa-star"></i>
                    </div>
                    <div class="mt-2 font-medium">パーフェクト</div>
                    <div class="text-sm text-gray-600">10問連続正解</div>
                </div>
                
                <div class="text-center">
                    <div class="achievement-badge locked" id="badge-exam">
                        <i class="fas fa-graduation-cap"></i>
                    </div>
                    <div class="mt-2 font-medium">合格レベル</div>
                    <div class="text-sm text-gray-600">模試で35問以上正解</div>
                </div>
            </div>
        </div>
        
        <!-- アクションボタン -->
        <div class="glass-card">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <a href="/study">
                    <button class="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded-lg hover:from-purple-600 hover:to-purple-800 transition">
                        <i class="fas fa-book"></i> 学習を続ける
                    </button>
                </a>
                
                <a href="/mock-exam">
                    <button class="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg hover:from-blue-600 hover:to-blue-800 transition">
                        <i class="fas fa-pen-to-square"></i> 模擬試験を受ける
                    </button>
                </a>
                
                <button id="reset-progress" class="w-full px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition">
                    <i class="fas fa-refresh"></i> 進捗をリセット
                </button>
            </div>
        </div>
    </div>
    
    <!-- JavaScript -->
    <script src="/static/darkmode.js"></script>
    <script>
        // ローカルストレージから進捗データを読み込む
        function loadProgress() {
            const progress = JSON.parse(localStorage.getItem('studyProgress') || '{}');
            
            // 総合統計
            const totalStudied = progress.totalStudied || 0;
            const totalCorrect = progress.totalCorrect || 0;
            const correctRate = totalStudied > 0 ? Math.round((totalCorrect / totalStudied) * 100) : 0;
            
            document.getElementById('total-studied').textContent = totalStudied;
            document.getElementById('correct-rate').textContent = correctRate + '%';
            document.getElementById('study-streak').textContent = progress.streak || 0;
            document.getElementById('mock-exams').textContent = progress.mockExams || 0;
            
            // カテゴリー別進捗
            const categories = ['rights', 'businessLaw', 'restrictions', 'taxOther'];
            const categoryMax = {
                rights: 125,
                businessLaw: 143,
                restrictions: 80,
                taxOther: 54
            };
            
            categories.forEach(cat => {
                const studied = progress[cat + 'Studied'] || 0;
                const correct = progress[cat + 'Correct'] || 0;
                const accuracy = studied > 0 ? Math.round((correct / studied) * 100) : 0;
                const percentage = (studied / categoryMax[cat]) * 100;
                
                document.getElementById(cat + '-studied').textContent = studied;
                document.getElementById(cat + '-accuracy').textContent = accuracy + '%';
                document.getElementById(cat + '-bar').style.width = percentage + '%';
            });
            
            // 実績バッジの更新
            if (totalStudied > 0) {
                document.getElementById('badge-first').classList.remove('locked');
            }
            if (totalStudied >= 100) {
                document.getElementById('badge-100').classList.remove('locked');
            }
            
            // グラフの描画
            drawProgressChart();
        }
        
        // 進捗グラフを描画
        function drawProgressChart() {
            const ctx = document.getElementById('progress-chart').getContext('2d');
            
            // ダミーデータ（実際にはローカルストレージから日別データを取得）
            const labels = ['月', '火', '水', '木', '金', '土', '日'];
            const data = [15, 22, 18, 25, 30, 28, 35];
            
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: '学習問題数',
                        data: data,
                        borderColor: '#764ba2',
                        backgroundColor: 'rgba(118, 75, 162, 0.1)',
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }
        
        // 進捗をリセット
        document.getElementById('reset-progress').addEventListener('click', () => {
            if (confirm('本当に進捗データをリセットしますか？この操作は取り消せません。')) {
                localStorage.removeItem('studyProgress');
                location.reload();
            }
        });
        
        // 初期化
        loadProgress();
    </script>
</body>
</html>`;
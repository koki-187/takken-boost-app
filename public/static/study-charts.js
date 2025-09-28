// 学習統計グラフ for 宅建BOOST
class StudyCharts {
    constructor() {
        this.chartInstances = {};
        this.init();
    }

    init() {
        // Chart.jsのCDNから動的にロード
        if (typeof Chart === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
            script.onload = () => {
                this.setupCharts();
            };
            document.head.appendChild(script);
        } else {
            this.setupCharts();
        }
    }

    setupCharts() {
        // ユーザーIDを取得（ローカルストレージから）
        const userId = localStorage.getItem('userId');
        if (userId) {
            this.loadStatistics(userId);
        }
    }

    async loadStatistics(userId) {
        try {
            const response = await fetch(`/api/study/statistics/${userId}`);
            const data = await response.json();
            
            if (data.success) {
                this.renderCharts(data.statistics);
            }
        } catch (error) {
            console.error('Failed to load statistics:', error);
        }
    }

    renderCharts(statistics) {
        // カテゴリー別正答率チャート
        if (document.getElementById('categoryChart')) {
            this.renderCategoryChart(statistics.categoryProgress);
        }
        
        // 模擬試験スコア推移チャート
        if (document.getElementById('examScoreChart')) {
            this.renderExamScoreChart(statistics.mockExamHistory);
        }
        
        // 学習進捗サマリー
        if (document.getElementById('progressSummary')) {
            this.renderProgressSummary(statistics.overall);
        }
        
        // 苦手分野チャート
        if (document.getElementById('weakAreasChart')) {
            this.renderWeakAreasChart(statistics.weakAreas);
        }
    }

    renderCategoryChart(categoryProgress) {
        const ctx = document.getElementById('categoryChart').getContext('2d');
        
        // 既存のチャートを破棄
        if (this.chartInstances.category) {
            this.chartInstances.category.destroy();
        }
        
        const categories = categoryProgress.map(c => c.category);
        const accuracyRates = categoryProgress.map(c => c.accuracy_rate || 0);
        const totalQuestions = categoryProgress.map(c => c.total_questions);
        
        this.chartInstances.category = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: categories,
                datasets: [{
                    label: '正答率 (%)',
                    data: accuracyRates,
                    backgroundColor: accuracyRates.map(rate => 
                        rate >= 70 ? 'rgba(76, 175, 80, 0.6)' : 
                        rate >= 50 ? 'rgba(255, 193, 7, 0.6)' : 
                        'rgba(244, 67, 54, 0.6)'
                    ),
                    borderColor: accuracyRates.map(rate => 
                        rate >= 70 ? 'rgba(76, 175, 80, 1)' : 
                        rate >= 50 ? 'rgba(255, 193, 7, 1)' : 
                        'rgba(244, 67, 54, 1)'
                    ),
                    borderWidth: 1
                }, {
                    label: '解答数',
                    data: totalQuestions,
                    type: 'line',
                    yAxisID: 'y1',
                    borderColor: 'rgba(103, 58, 183, 1)',
                    backgroundColor: 'rgba(103, 58, 183, 0.1)',
                    fill: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'カテゴリー別学習状況',
                        font: {
                            size: 16
                        }
                    },
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        callbacks: {
                            afterLabel: function(context) {
                                if (context.datasetIndex === 0) {
                                    const total = totalQuestions[context.dataIndex];
                                    return `解答数: ${total}問`;
                                }
                                return '';
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: '正答率 (%)'
                        }
                    },
                    y1: {
                        beginAtZero: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: '解答数'
                        },
                        grid: {
                            drawOnChartArea: false
                        }
                    }
                }
            }
        });
    }

    renderExamScoreChart(examHistory) {
        const ctx = document.getElementById('examScoreChart').getContext('2d');
        
        if (this.chartInstances.examScore) {
            this.chartInstances.examScore.destroy();
        }
        
        // 日付でソート
        const sortedHistory = [...examHistory].sort((a, b) => 
            new Date(a.exam_date) - new Date(b.exam_date)
        );
        
        const dates = sortedHistory.map(e => 
            new Date(e.exam_date).toLocaleDateString('ja-JP')
        );
        const scores = sortedHistory.map(e => e.score);
        
        this.chartInstances.examScore = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [{
                    label: '模擬試験スコア',
                    data: scores,
                    borderColor: 'rgba(118, 75, 162, 1)',
                    backgroundColor: 'rgba(118, 75, 162, 0.1)',
                    tension: 0.1,
                    fill: true
                }, {
                    label: '合格ライン',
                    data: new Array(dates.length).fill(70),
                    borderColor: 'rgba(76, 175, 80, 1)',
                    borderDash: [5, 5],
                    borderWidth: 2,
                    pointRadius: 0,
                    fill: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: '模擬試験スコア推移',
                        font: {
                            size: 16
                        }
                    },
                    legend: {
                        display: true
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: 'スコア (%)'
                        }
                    }
                }
            }
        });
    }

    renderProgressSummary(overall) {
        const container = document.getElementById('progressSummary');
        
        const totalStudied = overall?.total_studied || 0;
        const totalCorrect = overall?.total_correct || 0;
        const overallAccuracy = overall?.overall_accuracy || 0;
        
        container.innerHTML = `
            <div class="grid grid-cols-3 gap-4">
                <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white">
                    <div class="text-2xl font-bold">${totalStudied}</div>
                    <div class="text-sm opacity-90">総解答数</div>
                </div>
                <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 text-white">
                    <div class="text-2xl font-bold">${totalCorrect}</div>
                    <div class="text-sm opacity-90">正解数</div>
                </div>
                <div class="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-4 text-white">
                    <div class="text-2xl font-bold">${overallAccuracy}%</div>
                    <div class="text-sm opacity-90">総合正答率</div>
                </div>
            </div>
        `;
    }

    renderWeakAreasChart(weakAreas) {
        const ctx = document.getElementById('weakAreasChart').getContext('2d');
        
        if (this.chartInstances.weakAreas) {
            this.chartInstances.weakAreas.destroy();
        }
        
        const categories = weakAreas.slice(0, 5).map(w => w.category);
        const incorrectCounts = weakAreas.slice(0, 5).map(w => w.incorrect_count);
        
        this.chartInstances.weakAreas = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: categories,
                datasets: [{
                    data: incorrectCounts,
                    backgroundColor: [
                        'rgba(244, 67, 54, 0.8)',
                        'rgba(255, 152, 0, 0.8)',
                        'rgba(255, 193, 7, 0.8)',
                        'rgba(76, 175, 80, 0.8)',
                        'rgba(33, 150, 243, 0.8)'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: '苦手分野 TOP5',
                        font: {
                            size: 16
                        }
                    },
                    legend: {
                        position: 'right'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.label}: ${context.raw}回間違い`;
                            }
                        }
                    }
                }
            }
        });
    }

    // AI分析結果の可視化
    async renderAIAnalysis(userId) {
        try {
            const response = await fetch('/api/ai/analyze/weakness', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.displayAIRecommendations(data.analysis);
            }
        } catch (error) {
            console.error('Failed to get AI analysis:', error);
        }
    }

    displayAIRecommendations(analysis) {
        const container = document.getElementById('aiRecommendations');
        if (!container) return;
        
        container.innerHTML = `
            <div class="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg p-6 text-white">
                <h3 class="text-xl font-bold mb-4">
                    <i class="fas fa-brain mr-2"></i>AI学習アドバイス
                </h3>
                
                <div class="mb-4">
                    <div class="text-lg font-semibold mb-2">予測スコア</div>
                    <div class="text-3xl font-bold">${analysis.predictedScore}点</div>
                    <div class="text-sm opacity-90">
                        ${analysis.predictedScore >= 70 ? '合格圏内です！' : 'もう少し頑張りましょう！'}
                    </div>
                </div>
                
                <div class="mb-4">
                    <div class="text-lg font-semibold mb-2">重点学習推奨</div>
                    <ul class="list-disc list-inside">
                        ${analysis.recommendedTopics.map(topic => `
                            <li class="mb-1">
                                <span class="font-medium">${topic.category}</span>
                                <span class="text-sm opacity-90">- ${topic.reason}</span>
                            </li>
                        `).join('')}
                    </ul>
                </div>
                
                <div>
                    <div class="text-lg font-semibold mb-2">学習アドバイス</div>
                    <p class="text-sm">${analysis.studyRecommendations}</p>
                </div>
            </div>
        `;
    }
}

// ページ読み込み時に初期化
document.addEventListener('DOMContentLoaded', () => {
    window.studyCharts = new StudyCharts();
});
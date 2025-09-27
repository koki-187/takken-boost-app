import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const backendUrl = 'https://w5hni7cp69ze.manus.space'; // バックエンドのURL

  useEffect(() => {
    fetch(`${backendUrl}/questions`)
      .then(response => response.json())
      .then(data => {
        setQuestions(data);
        console.log('Fetched questions:', data);
      })
      .catch(error => console.error('Error fetching questions:', error));
  }, []);

  const handleAnswerSelect = (answer) => {
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === questions[currentQuestionIndex].correct_answer) {
      setScore(score + 1);
    }
    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    setShowExplanation(false);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setQuizFinished(true);
    }
  };

  if (questions.length === 0) {
    return <div className="App">Loading questions...</div>;
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="App">
      <h1>宅建BOOST</h1>
      {!quizFinished ? (
        <div className="question-container">
          <h2>{currentQuestion.category}</h2>
          <p className="question-text">{currentQuestion.question_text}</p>
          <div className="answers">
            {[1, 2, 3, 4].map(num => (
              <button
                key={num}
                onClick={() => handleAnswerSelect(String(num))}
                className={selectedAnswer === String(num) ? 'selected' : ''}
                disabled={showExplanation}
              >
                {num}
              </button>
            ))}
          </div>
          {!showExplanation && (
            <button onClick={handleSubmitAnswer} disabled={selectedAnswer === null}>
              解答する
            </button>
          )}
          {showExplanation && (
            <div className="explanation">
              <p>正解: {currentQuestion.correct_answer}</p>
              <p>解説: {currentQuestion.explanation}</p>
              <button onClick={handleNextQuestion}>
                {currentQuestionIndex < questions.length - 1 ? '次の問題へ' : '結果を見る'}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="quiz-results">
          <h2>クイズ終了！</h2>
          <p>あなたのスコア: {score} / {questions.length}</p>
          <button onClick={() => window.location.reload()}>もう一度挑戦する</button>
        </div>
      )}
    </div>
  );
}


export default App;

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import './QuizResults.css';

const QuizResults = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const response = await api.getQuizResults(id);
        setResults(response.data.data);
      } catch (err) {
        console.error('Error fetching quiz results:', err);
        setError('Failed to load quiz results. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchResults();
  }, [id]);
  
  // Format time display (seconds to minutes:seconds)
  const formatTime = (seconds) => {
    if (!seconds) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };
  
  if (loading) {
    return <LoadingSpinner message="Loading quiz results..." />;
  }
  
  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/dashboard')} className="btn btn-primary">
          Back to Dashboard
        </button>
      </div>
    );
  }
  
  if (!results) {
    return (
      <div className="error-container">
        <h2>Results Not Found</h2>
        <p>The requested quiz results could not be found.</p>
        <button onClick={() => navigate('/dashboard')} className="btn btn-primary">
          Back to Dashboard
        </button>
      </div>
    );
  }
  
  // Destructure data from results
  const { topic, difficulty, questions, analysis, source_type } = results;
  
  return (
    <div className="results-container">
      <div className="results-header">
        <h1>Quiz Results: {topic}</h1>
        {source_type && (
          <div className="quiz-source">
            <span className="source-badge">
              <i className={`fas ${source_type === 'pdf' ? 'fa-file-pdf' : 'fa-robot'}`}></i>
              {source_type === 'pdf' ? 'PDF-based' : 'AI-generated'}
            </span>
          </div>
        )}
        <div className="results-summary">
          <div className={`score-display ${analysis.percentage >= 70 ? 'high-score' : analysis.percentage >= 50 ? 'medium-score' : 'low-score'}`}>
            <span className="score-value">{Math.round(analysis.percentage)}%</span>
            <span className="score-label">Score</span>
          </div>
          
          <div className="results-details">
            <div className="result-stat">
              <span className="stat-label">Correct Answers:</span>
              <span className="stat-value">{analysis.score} of {analysis.totalQuestions}</span>
            </div>
            <div className="result-stat">
              <span className="stat-label">Difficulty:</span>
              <span className="stat-value">{difficulty}</span>
            </div>
            <div className="result-stat">
              <span className="stat-label">Time Taken:</span>
              <span className="stat-value">{formatTime(analysis.timeTaken)}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="results-feedback">
        <h3><i className="fas fa-comment"></i> Feedback</h3>
        <p>{analysis.feedback}</p>
        <p><strong>Strength:</strong> {analysis.strength}</p>
      </div>
      
      <div className="results-questions">
        <h2>Question Review</h2>
        
        {questions.map((question, index) => (
          <div 
            key={question.id} 
            className={`question-review-card ${question.correct ? 'correct' : 'incorrect'}`}
          >
            <h3 className="question-number">Question {index + 1}</h3>
            <p className="question-text">{question.question}</p>
            
            <div className="options-review">
              {question.options.map((option) => (
                <div 
                  key={option.id}
                  className={`
                    option-review 
                    ${option.id === question.userAnswer ? 'selected' : ''} 
                    ${option.isCorrect ? 'correct' : ''}
                  `}
                >
                  <span className="option-text">{option.text}</span>
                  
                  {option.id === question.userAnswer && option.isCorrect && (
                    <i className="fas fa-check correct-icon"></i>
                  )}
                  
                  {option.id === question.userAnswer && !option.isCorrect && (
                    <i className="fas fa-times incorrect-icon"></i>
                  )}
                  
                  {option.id !== question.userAnswer && option.isCorrect && (
                    <i className="fas fa-check-circle correct-answer-icon"></i>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="results-actions">
        <Link to="/create-quiz" className="btn btn-primary">
          <i className="fas fa-plus"></i> Create New Quiz
        </Link>
        <Link to="/history" className="btn btn-secondary">
          <i className="fas fa-history"></i> Quiz History
        </Link>
        <Link to="/dashboard" className="btn btn-secondary">
          <i className="fas fa-home"></i> Dashboard
        </Link>
      </div>
    </div>
  );
};

export default QuizResults;

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import './TakeQuiz.css';

const TakeQuiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  
  // Fetch quiz data
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const response = await api.getQuiz(id);
        setQuiz(response.data.data);
        setTimerActive(true);
      } catch (err) {
        console.error('Error fetching quiz:', err);
        setError('Failed to load quiz. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuiz();
    
    // Cleanup function to handle component unmount
    return () => {
      setTimerActive(false);
    };
  }, [id]);
  
  // Timer functionality
  useEffect(() => {
    let interval;
    
    if (timerActive) {
      interval = setInterval(() => {
        setTimerSeconds(seconds => seconds + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive]);
  
  // Format timer display
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };
  
  const handleOptionSelect = (questionId, optionId) => {
    setAnswers({
      ...answers,
      [questionId]: optionId
    });
  };
  
  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };
  
  const handleNext = () => {
    if (quiz && currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };
  
  const handleSubmit = async () => {
    // Check if all questions have been answered
    const answeredQuestions = Object.keys(answers).length;
    
    if (answeredQuestions < quiz.questions.length) {
      const confirmed = window.confirm(
        `You've only answered ${answeredQuestions} out of ${quiz.questions.length} questions. Are you sure you want to submit?`
      );
      
      if (!confirmed) return;
    }
    
    try {
      setSubmitting(true);
      
      // Format answers for submission
      const formattedAnswers = Object.keys(answers).map(questionId => ({
        questionId: parseInt(questionId),
        selectedOptionId: answers[questionId]
      }));
      
      // Submit quiz
      const response = await api.submitQuiz(id, formattedAnswers, timerSeconds);
      
      // Stop timer
      setTimerActive(false);
      
      // Navigate to results page
      navigate(`/quiz/${id}/results`);
    } catch (err) {
      console.error('Error submitting quiz:', err);
      setError('Failed to submit quiz. Please try again.');
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return <LoadingSpinner message="Loading quiz..." />;
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
  
  if (!quiz) {
    return (
      <div className="error-container">
        <h2>Quiz Not Found</h2>
        <p>The requested quiz could not be found.</p>
        <button onClick={() => navigate('/dashboard')} className="btn btn-primary">
          Back to Dashboard
        </button>
      </div>
    );
  }
  
  // Get current question
  const question = quiz.questions[currentQuestion];
  
  return (
    <div className="take-quiz-container">
      <div className="quiz-header">
        <h1>{quiz.topic}</h1>
        <div className="quiz-info">
          <span className={`badge badge-${quiz.difficulty}`}>{quiz.difficulty}</span>
          <span className="quiz-timer">
            <i className="fas fa-clock"></i> {formatTime(timerSeconds)}
          </span>
        </div>
      </div>
      
      <div className="quiz-progress">
        <div 
          className="quiz-progress-bar" 
          style={{ width: `${(currentQuestion + 1) / quiz.questions.length * 100}%` }}
        ></div>
        <div className="quiz-progress-text">
          Question {currentQuestion + 1} of {quiz.questions.length}
        </div>
      </div>
      
      <div className="question-card">
        <h3 className="question-text">{question.question}</h3>
        
        <div className="options-list">
          {question.options.map((option) => (
            <label
              key={option.id}
              className={`option-label ${answers[question.id] === option.id ? 'selected' : ''}`}
            >
              <input
                type="radio"
                name={`question-${question.id}`}
                checked={answers[question.id] === option.id}
                onChange={() => handleOptionSelect(question.id, option.id)}
                className="option-radio"
              />
              {option.text}
            </label>
          ))}
        </div>
      </div>
      
      <div className="quiz-navigation">
        <button 
          className="btn btn-secondary" 
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
        >
          <i className="fas fa-arrow-left"></i> Previous
        </button>
        
        {currentQuestion < quiz.questions.length - 1 ? (
          <button className="btn btn-primary" onClick={handleNext}>
            Next <i className="fas fa-arrow-right"></i>
          </button>
        ) : (
          <button 
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? <LoadingSpinner /> : 'Submit Quiz'}
          </button>
        )}
      </div>
      
      <div className="quiz-questions-nav">
        {quiz.questions.map((q, index) => (
          <button
            key={q.id}
            className={`question-nav-button ${answers[q.id] ? 'answered' : ''} ${currentQuestion === index ? 'current' : ''}`}
            onClick={() => setCurrentQuestion(index)}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TakeQuiz;

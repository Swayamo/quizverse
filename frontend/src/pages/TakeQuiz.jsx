import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
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
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isTimerWarning, setIsTimerWarning] = useState(false);
  
  const questionCardRef = useRef(null);
  
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const response = await api.getQuiz(id);
        setQuiz(response.data.data);
        setTimerActive(true);
        
        const initialAnswers = {};
        response.data.data.questions.forEach(q => {
          initialAnswers[q.id] = null;
        });
        setAnswers(initialAnswers);
      } catch (err) {
        console.error('Error fetching quiz:', err);
        setError('Failed to load quiz. Please try again.');
        toast.error('Failed to load quiz');
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuiz();
    
    return () => {
      setTimerActive(false);
    };
  }, [id]);
  
  useEffect(() => {
    let interval;
    
    if (timerActive) {
      interval = setInterval(() => {
        setTimerSeconds(seconds => {
          const newSeconds = seconds + 1;
          if (newSeconds > 600 && !isTimerWarning) {
            setIsTimerWarning(true);
          }
          return newSeconds;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive, isTimerWarning]);
  
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!quiz) return;
      
      switch(e.key) {
        case 'ArrowLeft':
          if (currentQuestion > 0) handlePrevious();
          break;
        case 'ArrowRight':
          if (currentQuestion < quiz.questions.length - 1) handleNext();
          break;
        case '1': case '2': case '3': case '4':
          const optionIndex = parseInt(e.key) - 1;
          const question = quiz.questions[currentQuestion];
          if (question.options[optionIndex]) {
            handleOptionSelect(question.id, question.options[optionIndex].id);
          }
          break;
        default:
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [quiz, currentQuestion]);
  
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };
  
  const handleOptionSelect = useCallback((questionId, optionId) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }));
    
    if (quiz && currentQuestion < quiz.questions.length - 1) {
      const timer = setTimeout(() => {
        setCurrentQuestion(curr => curr + 1);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [quiz, currentQuestion]);
  
  const handlePrevious = useCallback(() => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      questionCardRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentQuestion]);
  
  const handleNext = useCallback(() => {
    if (quiz && currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      questionCardRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [quiz, currentQuestion]);
  
  const handleSubmitClick = useCallback(() => {
    const unansweredCount = Object.values(answers).filter(answer => answer === null).length;
    
    if (unansweredCount > 0) {
      setShowConfirmModal(true);
    } else {
      handleSubmit();
    }
  }, [answers]);
  
  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setShowConfirmModal(false);

      const questionType =
        Array.isArray(quiz.questions[0]?.options) && quiz.questions[0].options.length > 0
          ? 'MCQ'
          : 'Subjective';

      let formattedAnswers;
      if (questionType === 'Subjective') {
        formattedAnswers = Object.entries(answers)
          .filter(([_, value]) => value !== null && value !== '')
          .map(([questionId, answer]) => ({
            questionId: parseInt(questionId),
            answer
          }));
      } else {
        formattedAnswers = Object.entries(answers)
          .filter(([_, value]) => value !== null)
          .map(([questionId, selectedOptionId]) => ({
            questionId: parseInt(questionId),
            selectedOptionId
          }));
      }

      await api.submitQuiz(id, formattedAnswers, timerSeconds, questionType);

      setTimerActive(false);
      toast.success('Quiz submitted successfully!');
      navigate(`/quiz/${id}/results`);
    } catch (err) {
      console.error('Error submitting quiz:', err);
      setError('Failed to submit quiz. Please try again.');
      toast.error('Failed to submit quiz');
      setSubmitting(false);
    }
  };
  
  const calculateProgress = useCallback(() => {
    if (!quiz) return 0;
    return (Object.values(answers).filter(a => a !== null).length / quiz.questions.length) * 100;
  }, [quiz, answers]);
  
  if (loading) {
    return (
      <div className="quiz-loading-container">
        <LoadingSpinner message="Loading quiz..." />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="error-container">
        <div className="error-card">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/dashboard')} className="btn btn-primary">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }
  
  if (!quiz) {
    return (
      <div className="error-container">
        <div className="error-card">
          <h2>Quiz Not Found</h2>
          <p>The requested quiz could not be found.</p>
          <button onClick={() => navigate('/dashboard')} className="btn btn-primary">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }
  
  const question = quiz.questions[currentQuestion];
  const answeredQuestionsCount = Object.values(answers).filter(a => a !== null).length;
  
  return (
    <div className="take-quiz-container">
      <header className="quiz-header shadow-sm">
        <div className="quiz-header-content">
          <div className="quiz-title-section">
            <h1 className="quiz-title">{quiz.topic}</h1>
            <span className={`badge bg-${quiz.difficulty.toLowerCase() === 'easy' ? 'success' : 
                                quiz.difficulty.toLowerCase() === 'medium' ? 'warning' : 'danger'}`}>
              {quiz.difficulty}
            </span>
          </div>
          
          <div className="quiz-meta">
            <div className={`quiz-timer ${isTimerWarning ? 'timer-warning' : ''}`}>
              <i className="fas fa-clock me-2"></i> {formatTime(timerSeconds)}
            </div>
            
            <div className="progress-stats">
              <span>{answeredQuestionsCount} of {quiz.questions.length} answered</span>
            </div>
          </div>
        </div>
        
        <div className="progress rounded-0" style={{ height: '5px' }}>
          <div 
            className="progress-bar bg-success"
            style={{ width: `${calculateProgress()}%` }}
            role="progressbar"
            aria-valuenow={calculateProgress()}
            aria-valuemin="0"
            aria-valuemax="100"
          ></div>
        </div>
      </header>
      
      <main className="quiz-content" ref={questionCardRef}>
        <div className="question-number mb-3">
          Question {currentQuestion + 1} of {quiz.questions.length}
        </div>
        
        <AnimatePresence mode="wait">
          <motion.div 
            key={question.id}
            className="question-card shadow"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="question-text">{question.question}</h3>
            
            {Array.isArray(question.options) && question.options.length > 0 ? (
              <div className="options-list">
                {question.options.map((option, index) => (
                  <motion.div
                    key={option.id || index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <label
                      className={`option-label ${answers[question.id] === option.id ? 'selected' : ''}`}
                    >
                      <div className="option-content">
                        <div className="option-indicator">
                          <span className="option-number">{index + 1}</span>
                          <input
                            type="radio"
                            name={`question-${question.id}`}
                            checked={answers[question.id] === option.id}
                            onChange={() => handleOptionSelect(question.id, option.id)}
                            className="option-radio"
                          />
                        </div>
                        <div className="option-text">{option.text || option}</div>
                      </div>
                    </label>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="mb-4">
                <textarea
                  className="form-control"
                  rows={4}
                  placeholder="Type your answer here..."
                  value={answers[question.id] || ''}
                  onChange={e => setAnswers(prev => ({
                    ...prev,
                    [question.id]: e.target.value
                  }))}
                  style={{ width: '100%', fontSize: '1.1rem', padding: '1rem' }}
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
        
        <div className="quiz-navigation mt-4">
          <button 
            className="btn btn-outline-secondary" 
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
          >
            <i className="fas fa-arrow-left me-2"></i> Previous
          </button>
          
          {currentQuestion < quiz.questions.length - 1 ? (
            <button className="btn btn-primary" onClick={handleNext}>
              Next <i className="fas fa-arrow-right ms-2"></i>
            </button>
          ) : (
            <button 
              className="btn btn-success"
              onClick={handleSubmitClick}
              disabled={submitting}
            >
              {submitting ? <><LoadingSpinner size="small" /> Submitting...</> : 'Submit Quiz'}
            </button>
          )}
        </div>
      </main>
      
      <aside className="quiz-questions-nav shadow">
        <div className="questions-nav-header bg-dark text-white p-2">
          Quiz Progress
        </div>
        <div className="questions-nav-grid p-3">
          {quiz.questions.map((q, index) => (
            <button
              key={q.id}
              className={`question-nav-button 
                ${answers[q.id] !== null ? 'answered' : ''} 
                ${currentQuestion === index ? 'current' : ''}`
              }
              onClick={() => setCurrentQuestion(index)}
              aria-label={`Go to question ${index + 1}`}
            >
              {index + 1}
            </button>
          ))}
        </div>
        <div className="questions-nav-legend p-3">
          <div className="legend-item">
            <span className="legend-indicator current"></span>
            <span>Current</span>
          </div>
          <div className="legend-item">
            <span className="legend-indicator answered"></span>
            <span>Answered</span>
          </div>
          <div className="legend-item">
            <span className="legend-indicator"></span>
            <span>Unanswered</span>
          </div>
        </div>
      </aside>
      
      {showConfirmModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Submit Quiz?</h5>
                <button 
                  type="button"
                  className="btn-close"
                  onClick={() => setShowConfirmModal(false)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  You have {Object.values(answers).filter(a => a === null).length} unanswered questions. 
                  Are you sure you want to submit?
                </p>
              </div>
              <div className="modal-footer">
                <button 
                  type="button"
                  className="btn btn-secondary" 
                  onClick={() => setShowConfirmModal(false)}
                >
                  Continue Quiz
                </button>
                <button 
                  type="button"
                  className="btn btn-primary" 
                  onClick={handleSubmit}
                >
                  Submit Anyway
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="keyboard-shortcuts-info">
        <div className="shortcut-info-toggle">
          <i className="fas fa-keyboard"></i>
        </div>
        <div className="shortcuts-panel shadow">
          <h4>Keyboard Shortcuts</h4>
          <ul className="list-unstyled">
            <li><kbd>←</kbd> Previous question</li>
            <li><kbd>→</kbd> Next question</li>
            <li><kbd>1-4</kbd> Select option</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TakeQuiz;

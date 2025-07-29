import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { motion } from 'framer-motion';
import './QuizHistory.css';

const QuizHistory = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [filters, setFilters] = useState({
    topic: '',
    difficulty: '',
    status: '' 
  });
  
  useEffect(() => {
    const fetchQuizHistory = async () => {
      try {
        setLoading(true);
        const response = await api.getQuizHistory();
        setQuizzes(response.data.data);
        console.log('Fetched quizzes:', response.data);
      } catch (err) {
        console.error('Error fetching quiz history:', err);
        setError('Failed to load quiz history. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuizHistory();
  }, []);
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };
  
  const resetFilters = () => {
    setFilters({
      topic: '',
      difficulty: '',
      status: ''
    });
  };
  
  const filteredQuizzes = quizzes.filter(quiz => {
   
    if (filters.topic && !quiz.topic.toLowerCase().includes(filters.topic.toLowerCase())) {
      return false;
    }
    
    if (filters.difficulty && quiz.difficulty !== filters.difficulty) {
      return false;
    }
    
    if (filters.status === 'completed' && quiz.score === null) {
      return false;
    }
    
    if (filters.status === 'pending' && quiz.score !== null) {
      return false;
    }
    
    return true;
  });
  
  
  const uniqueTopics = [...new Set(quizzes.map(quiz => quiz.topic))];

  const getQuizScoreInfo = (quiz) => {
    const correct = correctAnswers;
    const total = typeof quiz.total_questions === 'number' ? quiz.total_questions : 0;
    const percent = quiz.score;
    return { correct, total, percent };
  };
  
  if (loading) {
    return <LoadingSpinner message="Loading quiz history..." />;
  }
  
  return (
    <div className="history-container">
      <motion.div 
        className="history-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1>Quiz History</h1>
        <Link to="/create-quiz" className="btn btn-primary">
          <i className="fas fa-plus"></i> Create New Quiz
        </Link>
      </motion.div>
      
      {error && (
        <motion.div 
          className="notification notification-error"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <i className="fas fa-exclamation-circle"></i> {error}
        </motion.div>
      )}
      
      <motion.div 
        className="history-filters-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="filters-header">
          <h2><i className="fas fa-filter"></i> Filter Quizzes</h2>
        </div>
        <div className="filters-body">
          <div className="filters-row">
            <div className="filter-group">
              <label htmlFor="topic">Topic</label>
              <div className="select-wrapper">
                <select
                  id="topic"
                  name="topic"
                  className="form-control"
                  value={filters.topic}
                  onChange={handleFilterChange}
                >
                  <option value="">All Topics</option>
                  {uniqueTopics.map((topic, index) => (
                    <option key={index} value={topic}>{topic}</option>
                  ))}
                </select>
                <i className="fas fa-chevron-down"></i>
              </div>
            </div>
            
            <div className="filter-group">
              <label htmlFor="difficulty">Difficulty</label>
              <div className="select-wrapper">
                <select
                  id="difficulty"
                  name="difficulty"
                  className="form-control"
                  value={filters.difficulty}
                  onChange={handleFilterChange}
                >
                  <option value="">All Difficulties</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
                <i className="fas fa-chevron-down"></i>
              </div>
            </div>
            
            <div className="filter-group">
              <label htmlFor="status">Status</label>
              <div className="select-wrapper">
                <select
                  id="status"
                  name="status"
                  className="form-control"
                  value={filters.status}
                  onChange={handleFilterChange}
                >
                  <option value="">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                </select>
                <i className="fas fa-chevron-down"></i>
              </div>
            </div>
            
            <div className="filter-group filter-actions">
              <button 
                className="btn btn-reset" 
                onClick={resetFilters}
                disabled={!filters.topic && !filters.difficulty && !filters.status}
              >
                <i className="fas fa-undo-alt"></i> Reset Filters
              </button>
            </div>
          </div>
        </div>
      </motion.div>
      
      {filteredQuizzes.length === 0 ? (
        <motion.div 
          className="empty-history"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <i className="fas fa-history empty-icon"></i>
          <h3>No quizzes found</h3>
          <p>
            {quizzes.length === 0 
              ? "You haven't taken any quizzes yet." 
              : "No quizzes match your filters."
            }
          </p>
          {quizzes.length > 0 && (
            <button className="btn btn-secondary" onClick={resetFilters}>
              Clear Filters
            </button>
          )}
          <Link to="/create-quiz" className="btn btn-primary create-link">
            <i className="fas fa-plus"></i> Create Your First Quiz
          </Link>
        </motion.div>
      ) : (
        <motion.div 
          className="history-list-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="history-summary">
            <h2>Your Quiz Collection</h2>
            <p>Showing {filteredQuizzes.length} of {quizzes.length} quizzes</p>
          </div>
          
          <div className="history-list-header">
            <span className="col-topic">Topic</span>
            <span className="col-difficulty">Difficulty</span>
            <span className="col-date">Date</span>
            <span className="col-score">Score</span>
            <span className="col-action">Actions</span>
          </div>
          
          <div className="history-items">
            {filteredQuizzes.map((quiz, index) => {
              const { correct, total, percent } = getQuizScoreInfo(quiz);
              return (
                <motion.div 
                  key={quiz.quiz_id} 
                  className={`history-item ${quiz.score !== null ? 'completed' : 'pending'}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 + 0.3 }}
                >
                  <div className="col-topic">
                    <h3 className="quiz-topic">{quiz.topic}</h3>
                    {quiz.source_type && (
                      <div className="quiz-source">
                        <i className={`fas ${quiz.source_type === 'pdf' ? 'fa-file-pdf' : 'fa-robot'}`}></i>
                        {quiz.source_type === 'pdf' ? 'PDF-based' : 'AI-generated'}
                      </div>
                    )}
                  </div>
                  
                  <div className="col-difficulty">
                    <span className={`badge badge-${quiz.difficulty?.toLowerCase()}`}>
                      <i className={`fas ${
                        quiz.difficulty?.toLowerCase() === 'easy' ? 'fa-star' : 
                        quiz.difficulty?.toLowerCase() === 'medium' ? 'fa-star-half-alt' : 
                        'fa-star'
                      }`}></i>
                      {quiz.difficulty}
                    </span>
                  </div>
                  
                  <div className="col-date">
                    <i className="far fa-calendar-alt"></i> 
                    {quiz.created_at ? new Date(quiz.created_at).toLocaleDateString() : ''}
                  </div>
                  
                  <div className="col-score">
                    {quiz.score !== null && total > 0 ? (
                      <div className="score-display">
                        <div 
                          className={`score-circle ${
                            percent >= 70 ? 'high-score' :
                            percent >= 40 ? 'medium-score' : 
                            'low-score'
                          }`}
                        >
                          {percent}%
                        </div>
                      </div>
                    ) : (
                      <span className="status-badge">
                        <i className="fas fa-hourglass-half"></i> Pending
                      </span>
                    )}
                  </div>
                  
                  <div className="col-action">
                    {quiz.score !== null ? (
                      <Link to={`/quiz/${quiz.quiz_id}/results`} className="btn btn-secondary">
                        <i className="fas fa-chart-bar"></i> View Results
                      </Link>
                    ) : (
                      <Link to={`/quiz/${quiz.quiz_id}`} className="btn btn-primary">
                        <i className="fas fa-play"></i> Take Quiz
                      </Link>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default QuizHistory;
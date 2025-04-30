import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import './QuizHistory.css';

const QuizHistory = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    topic: '',
    difficulty: '',
    status: '' // 'completed' or 'pending'
  });
  
  useEffect(() => {
    const fetchQuizHistory = async () => {
      try {
        setLoading(true);
        const response = await api.getQuizHistory();
        setQuizzes(response.data.data);
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
  
  // Apply filters to quizzes
  const filteredQuizzes = quizzes.filter(quiz => {
    // Filter by topic
    if (filters.topic && !quiz.topic.toLowerCase().includes(filters.topic.toLowerCase())) {
      return false;
    }
    
    // Filter by difficulty
    if (filters.difficulty && quiz.difficulty !== filters.difficulty) {
      return false;
    }
    
    // Filter by status
    if (filters.status === 'completed' && quiz.score === null) {
      return false;
    }
    
    if (filters.status === 'pending' && quiz.score !== null) {
      return false;
    }
    
    return true;
  });
  
  // Get unique topics for filter dropdown
  const uniqueTopics = [...new Set(quizzes.map(quiz => quiz.topic))];
  
  if (loading) {
    return <LoadingSpinner message="Loading quiz history..." />;
  }
  
  return (
    <div className="history-container">
      <div className="history-header">
        <h1>Quiz History</h1>
        <Link to="/create-quiz" className="btn btn-primary">
          <i className="fas fa-plus"></i> Create New Quiz
        </Link>
      </div>
      
      {error && (
        <div className="notification notification-error">
          <i className="fas fa-exclamation-circle"></i> {error}
        </div>
      )}
      
      <div className="history-filters">
        <div className="filters-row">
          <div className="filter-group">
            <label htmlFor="topic">Topic</label>
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
          </div>
          
          <div className="filter-group">
            <label htmlFor="difficulty">Difficulty</label>
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
          </div>
          
          <div className="filter-group">
            <label htmlFor="status">Status</label>
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
          </div>
          
          <button className="btn btn-secondary reset-btn" onClick={resetFilters}>
            Reset Filters
          </button>
        </div>
      </div>
      
      {filteredQuizzes.length === 0 ? (
        <div className="empty-history">
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
        </div>
      ) : (
        <div className="history-list">
          <div className="history-list-header">
            <span className="col-topic">Topic</span>
            <span className="col-difficulty">Difficulty</span>
            <span className="col-date">Date</span>
            <span className="col-score">Score</span>
            <span className="col-action">Actions</span>
          </div>
          
          {filteredQuizzes.map(quiz => (
            <div key={quiz.id} className="history-item">
              <div className="col-topic">{quiz.topic}</div>
              
              <div className="col-difficulty">
                <span className={`badge badge-${quiz.difficulty}`}>
                  {quiz.difficulty}
                </span>
              </div>
              
              <div className="col-date">
                {new Date(quiz.created_at).toLocaleDateString()}
              </div>
              
              <div className="col-score">
                {quiz.score !== null ? (
                  <span className="score-badge">
                    {Math.round((quiz.score / quiz.total_questions) * 100)}%
                  </span>
                ) : (
                  <span className="status-badge">Pending</span>
                )}
              </div>
              
              <div className="col-action">
                {quiz.score !== null ? (
                  <Link to={`/quiz/${quiz.id}/results`} className="btn btn-sm btn-secondary">
                    View Results
                  </Link>
                ) : (
                  <Link to={`/quiz/${quiz.id}`} className="btn btn-sm btn-primary">
                    Take Quiz
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuizHistory;

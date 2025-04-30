import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import './Dashboard.css';

const Dashboard = () => {
  const [recentQuizzes, setRecentQuizzes] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { currentUser } = useAuth();
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch recent quizzes
        const quizzesResponse = await api.getQuizHistory();
        
        // Fetch user stats
        const statsResponse = await api.getUserStats();
        
        setRecentQuizzes(quizzesResponse.data.data.slice(0, 5));
        setStats(statsResponse.data.data);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }
  
  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Welcome, {currentUser?.username}!</h1>
        <Link to="/create-quiz" className="btn btn-primary">
          <i className="fas fa-plus"></i> Create New Quiz
        </Link>
      </header>
      
      {error && (
        <div className="notification notification-error">
          <i className="fas fa-exclamation-circle"></i> {error}
        </div>
      )}
      
      <div className="dashboard-grid">
        {/* Stats Summary */}
        <div className="dashboard-card stats-card">
          <h2>Your Stats</h2>
          {stats ? (
            <div className="stats-container">
              <div className="stat-item">
                <h3>{stats.totalQuizzes}</h3>
                <p>Total Quizzes</p>
              </div>
              <div className="stat-item">
                <h3>{stats.completedQuizzes}</h3>
                <p>Completed</p>
              </div>
              <div className="stat-item">
                <h3>{stats.averageScore}%</h3>
                <p>Average Score</p>
              </div>
            </div>
          ) : (
            <p>No statistics available yet. Start taking quizzes!</p>
          )}
          <Link to="/statistics" className="card-link">
            View detailed stats
          </Link>
        </div>
        
        {/* Recent Quizzes */}
        <div className="dashboard-card">
          <h2>Recent Quizzes</h2>
          {recentQuizzes.length > 0 ? (
            <ul className="recent-quiz-list">
              {recentQuizzes.map((quiz) => (
                <li key={quiz.id} className="recent-quiz-item">
                  <div className="quiz-info">
                    <h3>{quiz.topic}</h3>
                    <p>
                      <span className="badge badge-{quiz.difficulty.toLowerCase()}">
                        {quiz.difficulty}
                      </span>
                      <span className="quiz-date">
                        {new Date(quiz.created_at).toLocaleDateString()}
                      </span>
                    </p>
                  </div>
                  <div className="quiz-actions">
                    {quiz.score !== null ? (
                      <>
                        <span className="quiz-score">
                          {Math.round((quiz.score / quiz.total_questions) * 100)}%
                        </span>
                        <Link to={`/quiz/${quiz.id}/results`} className="btn btn-sm">
                          View Results
                        </Link>
                      </>
                    ) : (
                      <Link to={`/quiz/${quiz.id}`} className="btn btn-primary btn-sm">
                        Take Quiz
                      </Link>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No recent quizzes found. Create your first quiz!</p>
          )}
          <Link to="/history" className="card-link">
            View all quizzes
          </Link>
        </div>
        
        {/* Quiz Sources - New Card */}
        {stats && stats.quizSources && stats.quizSources.length > 0 && (
          <div className="dashboard-card sources-card">
            <h2>Quiz Sources</h2>
            <div className="sources-chart">
              {stats.quizSources.map((source, index) => (
                <div key={index} className="source-item">
                  <div className="source-bar" style={{ width: `${(source.count / stats.totalQuizzes) * 100}%` }}>
                    <span className="source-label">
                      {source.source_type === 'ai_generated' ? 'AI Generated' : 
                       source.source_type === 'pdf' ? 'PDF Based' : source.source_type}
                    </span>
                  </div>
                  <span className="source-count">{source.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Quick Links */}
        <div className="dashboard-card quick-links-card">
          <h2>Quick Links</h2>
          <div className="quick-links">
            <Link to="/create-quiz" className="quick-link-item">
              <i className="fas fa-plus-circle"></i>
              <span>Create Quiz</span>
            </Link>
            <Link to="/history" className="quick-link-item">
              <i className="fas fa-history"></i>
              <span>Quiz History</span>
            </Link>
            <Link to="/profile" className="quick-link-item">
              <i className="fas fa-user"></i>
              <span>Profile</span>
            </Link>
            <Link to="/statistics" className="quick-link-item">
              <i className="fas fa-chart-bar"></i>
              <span>Statistics</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import './Dashboard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Dashboard = () => {
  const [recentQuizzes, setRecentQuizzes] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quizProgress, setQuizProgress] = useState([]);
  
  const { currentUser } = useAuth();
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        const quizzesResponse = await api.getQuizHistory();
        
        const statsResponse = await api.getUserStats();
        
        setRecentQuizzes(quizzesResponse.data.data.slice(0, 5));
        setStats(statsResponse.data.data);
        
        const completedQuizzes = quizzesResponse.data.data
          .filter(quiz => quiz.score !== null)
          .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
          .slice(-10); 
        setQuizProgress(completedQuizzes);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  const chartData = {
    labels: quizProgress.map(quiz => new Date(quiz.created_at).toLocaleDateString()),
    datasets: [
      {
        label: 'Quiz Score (%)',
        data: quizProgress.map(quiz => Math.round((quiz.score / quiz.total_questions) * 100)),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 350);
          gradient.addColorStop(0, 'rgba(75, 192, 192, 0.6)');
          gradient.addColorStop(1, 'rgba(75, 192, 192, 0.1)');
          return gradient;
        },
        tension: 0.4,
        fill: true,
        borderWidth: 3,
        pointBackgroundColor: 'white',
        pointBorderColor: 'rgba(75, 192, 192, 1)',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 9,
        pointHoverBackgroundColor: 'rgba(75, 192, 192, 1)',
        pointHoverBorderColor: 'white',
        pointHoverBorderWidth: 2,
      }
    ]
  };
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          borderDash: [3, 3],
        },
        ticks: {
          font: {
            size: 12,
            family: "'Poppins', sans-serif"
          },
          color: '#666',
          padding: 10,
        },
        title: {
          display: true,
          text: 'Score (%)',
          font: {
            size: 16,
            weight: 'bold',
            family: "'Poppins', sans-serif"
          },
          color: '#333',
          padding: {
            bottom: 10
          }
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 12,
            family: "'Poppins', sans-serif"
          },
          color: '#666',
          maxRotation: 45,
          minRotation: 45,
          padding: 10,
        },
        title: {
          display: true,
          text: 'Quiz Date',
          font: {
            size: 16,
            weight: 'bold',
            family: "'Poppins', sans-serif"
          },
          color: '#333',
          padding: {
            top: 10
          }
        }
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        align: 'end',
        labels: {
          font: {
            size: 14,
            family: "'Poppins', sans-serif"
          },
          usePointStyle: true,
          padding: 20,
          boxWidth: 10,
        }
      },
      title: {
        display: true,
        text: 'Your Quiz Performance Over Time',
        font: {
          size: 20,
          weight: 'bold',
          family: "'Poppins', sans-serif"
        },
        color: '#333',
        padding: {
          top: 10,
          bottom: 30
        }
      },
      tooltip: {
        backgroundColor: 'rgba(32, 32, 32, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
          family: "'Poppins', sans-serif"
        },
        bodyFont: {
          size: 13,
          family: "'Poppins', sans-serif"
        },
        displayColors: false,
        cornerRadius: 6,
        callbacks: {
          label: function(context) {
            return `Score: ${context.raw}%`;
          },
          title: function(context) {
            return `Date: ${context[0].label}`;
          }
        }
      }
    },
    animation: {
      duration: 2000,
      easing: 'easeOutQuart'
    },
    elements: {
      line: {
        tension: 0.4
      }
    },
    layout: {
      padding: {
        left: 10,
        right: 25,
        top: 20,
        bottom: 10
      }
    }
  };
  
  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }
  
  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Welcome, {currentUser?.username}!</h1>
        <Link to="/create-quiz" className="btn btn-primary create-quiz-btn">
          <i className="fas fa-plus"></i> Create New Quiz
        </Link>
      </header>
      
      {error && (
        <div className="notification notification-error">
          <i className="fas fa-exclamation-circle"></i> {error}
        </div>
      )}
     
      <div className="full-width-card progress-graph-card">
        <div className="card-header">
          <h2>Your Progress</h2>
          {quizProgress.length > 3 && (
            <div className="progress-summary">
              <span className="trend-indicator">
                {quizProgress[quizProgress.length - 1].score > quizProgress[quizProgress.length - 2].score ? 
                  <><i className="fas fa-arrow-up"></i> Improving</> : 
                  <><i className="fas fa-arrow-down"></i> Keep practicing</>}
              </span>
            </div>
          )}
        </div>
        
        {quizProgress.length > 0 ? (
          <div className="progress-chart">
            <Line data={chartData} options={chartOptions} height={380} />
          </div>
        ) : (
          <div className="empty-chart">
            <i className="fas fa-chart-line empty-chart-icon"></i>
            <p>Complete more quizzes to see your progress over time.</p>
            <Link to="/create-quiz" className="btn btn-outline">Start a quiz</Link>
          </div>
        )}
      </div>
      
      <div className="cards-row">
        {/* Stats Summary with enhanced styling */}
        <div className="dashboard-card stats-card">
          <div className="card-header">
            <h2>Your Stats</h2>
            <i className="fas fa-chart-pie card-icon"></i>
          </div>
          
          {stats ? (
            <div className="stats-container">
              <div className="stat-item">
                <div className="stat-circle">
                  <span className="stat-value">{stats.totalQuizzes}</span>
                </div>
                <p>Total Quizzes</p>
              </div>
              <div className="stat-item">
                <div className="stat-circle completed">
                  <span className="stat-value">{stats.completedQuizzes}</span>
                </div>
                <p>Completed</p>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <i className="fas fa-chart-pie empty-icon"></i>
              <p>No statistics available yet. Start taking quizzes!</p>
            </div>
          )}
          <Link to="/statistics" className="card-link">
            <span>View detailed stats</span>
            <i className="fas fa-arrow-right"></i>
          </Link>
        </div>
        
        {/* Recent Quizzes with enhanced styling */}
        <div className="dashboard-card recent-quizzes-card">
          <div className="card-header">
            <h2>Recent Quizzes</h2>
            <i className="fas fa-history card-icon"></i>
          </div>
          
          {recentQuizzes.length > 0 ? (
            <ul className="recent-quiz-list">
              {recentQuizzes.map((quiz) => (
                <li key={quiz.id} className="recent-quiz-item">
                  <div className="quiz-info">
                    <h3>{quiz.topic}</h3>
                    <div className="quiz-meta">
                      <span className={`badge badge-${quiz.difficulty.toLowerCase()}`}>
                        {quiz.difficulty}
                      </span>
                      <span className="quiz-date">
                        <i className="far fa-calendar-alt"></i>
                        {new Date(quiz.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="quiz-actions">
                    {quiz.score !== null ? (
                      <>
                        <span className="quiz-score">
                          <i className="fas fa-trophy"></i>
                          {Math.round((quiz.score))}%
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
            <div className="empty-state">
              <i className="fas fa-file-alt empty-icon"></i>
              <p>No recent quizzes found. Create your first quiz!</p>
            </div>
          )}
          <Link to="/history" className="card-link">
            <span>View all quizzes</span>
            <i className="fas fa-arrow-right"></i>
          </Link>
        </div>
        
        {/* Quick Links with enhanced styling */}
        <div className="dashboard-card quick-links-card">
          <div className="card-header">
            <h2>Quick Links</h2>
            <i className="fas fa-link card-icon"></i>
          </div>
          
          <div className="quick-links">
            <Link to="/create-quiz" className="quick-link-item">
              <div className="link-icon">
                <i className="fas fa-plus-circle"></i>
              </div>
              <span>Create Quiz</span>
            </Link>
            <Link to="/history" className="quick-link-item">
              <div className="link-icon">
                <i className="fas fa-history"></i>
              </div>
              <span>Quiz History</span>
            </Link>
            <Link to="/profile" className="quick-link-item">
              <div className="link-icon">
                <i className="fas fa-user"></i>
              </div>
              <span>Profile</span>
            </Link>
            <Link to="/statistics" className="quick-link-item">
              <div className="link-icon">
                <i className="fas fa-chart-bar"></i>
              </div>
              <span>Statistics</span>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Quiz Sources - Enhanced styling */}
      {stats && stats.quizSources && stats.quizSources.length > 0 && (
        <div className="dashboard-card sources-card">
          <div className="card-header">
            <h2>Quiz Sources</h2>
            <i className="fas fa-database card-icon"></i>
          </div>
          
          <div className="sources-chart">
            {stats.quizSources.map((source, index) => (
              <div key={index} className="source-item">
                <div className="source-label-container">
                  <span className="source-label">
                    {source.source_type === 'ai_generated' ? 'AI Generated' : 
                     source.source_type === 'pdf' ? 'PDF Based' : source.source_type}
                  </span>
                </div>
                <div className="source-bar-container">
                  <div 
                    className={`source-bar source-${source.source_type.toLowerCase().replace('_', '-')}`} 
                    style={{ width: `${(source.count / stats.totalQuizzes) * 100}%` }}
                  ></div>
                </div>
                <div className="source-count-container">
                  <span className="source-count">{source.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
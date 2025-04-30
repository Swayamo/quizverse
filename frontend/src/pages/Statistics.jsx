import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Statistics.css';

const Statistics = () => {
  const [stats, setStats] = useState(null);
  const [recentQuizzes, setRecentQuizzes] = useState([]);
  const [trend, setTrend] = useState('stable');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('/api/stats');
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    const fetchRecentQuizzes = async () => {
      try {
        const response = await axios.get('/api/recent-quizzes');
        setRecentQuizzes(response.data);
      } catch (error) {
        console.error('Error fetching recent quizzes:', error);
      }
    };

    fetchStats();
    fetchRecentQuizzes();
  }, []);

  useEffect(() => {
    if (recentQuizzes.length > 1) {
      const scores = recentQuizzes.map(quiz => (quiz.score / quiz.total_questions) * 100);
      const latestScore = scores[scores.length - 1];
      const previousScore = scores[scores.length - 2];

      if (latestScore > previousScore) {
        setTrend('increasing');
      } else if (latestScore < previousScore) {
        setTrend('decreasing');
      } else {
        setTrend('stable');
      }
    }
  }, [recentQuizzes]);

  return (
    <div className="statistics-container">
      <h1>Your Statistics</h1>
      
      {!stats && recentQuizzes.length === 0 ? (
        <div className="empty-stats">
          <i className="fas fa-chart-bar empty-icon"></i>
          <h3>No Statistics Available</h3>
          <p>Take some quizzes to see your performance stats!</p>
        </div>
      ) : (
        <>
          <div className="stats-summary">
            <div className="stat-card">
              <div className="stat-value">{stats?.totalQuizzes || 0}</div>
              <div className="stat-label">Total Quizzes</div>
              <i className="fas fa-clipboard-list stat-icon"></i>
            </div>
            
            <div className="stat-card">
              <div className="stat-value">{stats?.completedQuizzes || 0}</div>
              <div className="stat-label">Completed Quizzes</div>
              <i className="fas fa-check-circle stat-icon"></i>
            </div>
            
            <div className="stat-card">
              <div className="stat-value">{stats?.averageScore || 0}%</div>
              <div className="stat-label">Average Score</div>
              <i className="fas fa-star stat-icon"></i>
            </div>
          </div>
          
          {recentQuizzes.length > 0 && (
            <div className="performance-trend">
              <h2>Performance Trend</h2>
              
              <div className="trend-indicator">
                <div className={`trend-arrow trend-${trend}`}>
                  {trend === 'increasing' && <i className="fas fa-arrow-up"></i>}
                  {trend === 'decreasing' && <i className="fas fa-arrow-down"></i>}
                  {trend === 'stable' && <i className="fas fa-arrows-alt-h"></i>}
                </div>
                <div className="trend-text">
                  {trend === 'increasing' ? 'Your performance is improving!' : 
                   trend === 'decreasing' ? 'Your performance is declining' : 
                   'Your performance is stable'}
                </div>
              </div>
              
              <div className="chart-container">
                {recentQuizzes.map((quiz, index) => {
                  const percentage = (quiz.score / quiz.total_questions) * 100;
                  return (
                    <div className="chart-bar" key={quiz.id}>
                      <div className="chart-fill" style={{ height: `${percentage}%` }}></div>
                      <div className="chart-label">{index + 1}</div>
                    </div>
                  );
                })}
              </div>
              <div className="chart-legend">
                <div className="legend-label">Recent Quizzes (newest on right)</div>
              </div>
            </div>
          )}
          
          {stats?.topTopics?.length > 0 && (
            <div className="top-topics">
              <h2>Your Top Topics</h2>
              <div className="topics-list">
                {stats.topTopics.map((topic, index) => (
                  <div key={index} className="topic-item">
                    <div className="topic-name">{topic.topic}</div>
                    <div className="topic-count">
                      <span className="count-value">{topic.count}</span> quizzes
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Statistics;
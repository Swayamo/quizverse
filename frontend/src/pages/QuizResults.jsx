import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import './QuizResults.css';

const QuizResults = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedExplanations, setExpandedExplanations] = useState({});
  const [categories, setCategories] = useState(null);
  
  // Chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  
  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const response = await api.getQuizResults(id);
        setResults(response.data.data);
        
        // Initialize expanded state for each question
        const expandedState = {};
        response.data.data.questions.forEach(q => {
          expandedState[q.id] = false;
        });
        setExpandedExplanations(expandedState);
        
        // Calculate category-based performance if available
        if (response.data.data.questions) {
          processQuestionCategories(response.data.data.questions);
        }
      } catch (err) {
        console.error('Error fetching quiz results:', err);
        setError('Failed to load quiz results. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchResults();
  }, [id]);
  
  // Process question categories to generate category performance data
  const processQuestionCategories = (questions) => {
    const categoryMap = {};
    
    questions.forEach(question => {
      // Assuming questions might have category property. If not, handle gracefully
      const category = question.category || 'General';
      
      if (!categoryMap[category]) {
        categoryMap[category] = { name: category, correct: 0, incorrect: 0, total: 0 };
      }
      
      categoryMap[category].total += 1;
      if (question.correct) {
        categoryMap[category].correct += 1;
      } else {
        categoryMap[category].incorrect += 1;
      }
    });
    
    const categoryData = Object.values(categoryMap).map(cat => ({
      ...cat,
      score: Math.round((cat.correct / cat.total) * 100)
    }));
    
    setCategories(categoryData);
  };
  
  // Format time display (seconds to minutes:seconds)
  const formatTime = (seconds) => {
    if (!seconds) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };
  
  const toggleExplanation = (questionId) => {
    setExpandedExplanations(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };
  
  // Create data for pie chart
  const createPieChartData = (correct, incorrect) => {
    return [
      { name: 'Correct', value: correct },
      { name: 'Incorrect', value: incorrect }
    ];
  };
  
  // Generate performance insights based on results
  const generateInsights = (analysis) => {
    if (!analysis) return null;
    
    const insights = [];
    
    if (analysis.percentage >= 90) {
      insights.push('Excellent performance! You have a strong understanding of this subject.');
    } else if (analysis.percentage >= 70) {
      insights.push('Good job! You have a solid grasp of most concepts.');
    } else if (analysis.percentage >= 50) {
      insights.push('You\'re on the right track, but there\'s room for improvement.');
    } else {
      insights.push('This topic requires more study. Consider reviewing the material again.');
    }
    
    // Add time-based insight
    if (analysis.timeTaken < 60) {
      insights.push('You completed this quiz very quickly!');
    } else if (analysis.timeTaken > 300) {
      insights.push('You took your time with this quiz, which shows careful consideration.');
    }
    
    return insights;
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
  
  // Create pie chart data
  const pieData = createPieChartData(
    analysis.score, 
    analysis.totalQuestions - analysis.score
  );
  
  // Generate insights
  const insights = generateInsights(analysis);
  
  return (
    <div className="results-container">
      <div className="results-header">
        <div className="results-header-top">
          <h1>Quiz Results</h1>
          <div className="quiz-metadata">
            <div className="topic-badge">
              <i className="fas fa-book"></i> {topic}
            </div>
            <div className="difficulty-badge">
              <i className="fas fa-signal"></i> {difficulty}
            </div>
            {source_type && (
              <div className="source-badge">
                <i className={`fas ${source_type === 'pdf' ? 'fa-file-pdf' : 'fa-robot'}`}></i>
                {source_type === 'pdf' ? 'PDF-based' : 'AI-generated'}
              </div>
            )}
          </div>
        </div>
        
        <div className="results-summary-grid">
          <div className="score-card">
            <div className="scorecard-header">Score Overview</div>
            <div className="score-chart">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className={`score-display ${analysis.percentage >= 70 ? 'high-score' : analysis.percentage >= 50 ? 'medium-score' : 'low-score'}`}>
              <span className="score-value">{Math.round(analysis.percentage)}%</span>
              <span className="score-label">Score</span>
            </div>
          </div>
          
          <div className="performance-metrics">
            <div className="metrics-header">Performance Metrics</div>
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-icon"><i className="fas fa-check-circle"></i></div>
                <div className="metric-value">{analysis.score}/{analysis.totalQuestions}</div>
                <div className="metric-label">Correct Answers</div>
              </div>
              
              <div className="metric-card">
                <div className="metric-icon"><i className="fas fa-clock"></i></div>
                <div className="metric-value">{formatTime(analysis.timeTaken)}</div>
                <div className="metric-label">Time Taken</div>
              </div>
              
              <div className="metric-card">
                <div className="metric-icon"><i className="fas fa-tachometer-alt"></i></div>
                <div className="metric-value">
                  {Math.round(analysis.timeTaken / analysis.totalQuestions)} sec
                </div>
                <div className="metric-label">Avg. Time per Question</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Category Performance Chart (if categories available) */}
      {categories && categories.length > 1 && (
        <div className="category-performance">
          <h2><i className="fas fa-chart-bar"></i> Performance by Category</h2>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categories} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                <YAxis label={{ value: 'Score (%)', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value) => [`${value}%`, 'Score']} />
                <Bar dataKey="score" fill="#8884d8" name="Score (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      
      <div className="results-feedback-container">
        <div className="results-feedback">
          <h3><i className="fas fa-comment-dots"></i> Feedback</h3>
          <p>{analysis.feedback}</p>
          <p><strong>Strength:</strong> {analysis.strength}</p>
        </div>
        
        {/* Insights section */}
        {insights && insights.length > 0 && (
          <div className="results-insights">
            <h3><i className="fas fa-lightbulb"></i> Performance Insights</h3>
            <ul>
              {insights.map((insight, index) => (
                <li key={index}>{insight}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      <div className="results-questions">
        <h2>Question Review</h2>
        
        {questions.map((question, index) => (
          <div 
            key={question.id} 
            className={`question-review-card ${question.correct ? 'correct' : 'incorrect'}`}
          >
            <div className="question-header">
              <h3 className="question-number">Question {index + 1}</h3>
              {question.category && (
                <span className="question-category">{question.category}</span>
              )}
              <span className={`question-result-badge ${question.correct ? 'correct' : 'incorrect'}`}>
                {question.correct ? 'Correct' : 'Incorrect'}
              </span>
            </div>
            
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
            
            {/* Explanation Section */}
            <div className="explanation-section">
              <button 
                className="explanation-toggle"
                onClick={() => toggleExplanation(question.id)}
              >
                <i className={`fas fa-${expandedExplanations[question.id] ? 'minus' : 'plus'}-circle`}></i>
                {expandedExplanations[question.id] ? 'Hide Explanation' : 'Show Explanation'}
              </button>
              
              {expandedExplanations[question.id] && (
                <div className="explanation-content">
                  <i className="fas fa-lightbulb explanation-icon"></i>
                  <div className="explanation-text">
                    {question.explanation || "No explanation available for this question."}
                  </div>
                </div>
              )}
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
        <button 
          className="btn btn-accent"
          onClick={() => {window.print()}}
        >
          <i className="fas fa-print"></i> Print Results
        </button>
      </div>
    </div>
  );
};

export default QuizResults;
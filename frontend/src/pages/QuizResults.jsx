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
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  
  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const response = await api.getQuizResults(id);
        setResults(response.data.data);
        
        const expandedState = {};
        response.data.data.questions.forEach(q => {
          expandedState[q.id] = false;
        });
        setExpandedExplanations(expandedState);
        
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
  
  const processQuestionCategories = (questions) => {
    const categoryMap = {};
    
    questions.forEach(question => {
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
  
  const createPieChartData = (correct, incorrect) => {
    return [
      { name: 'Correct', value: correct },
      { name: 'Incorrect', value: incorrect }
    ];
  };

  const getCorrectCounts = (questions) => {
    let correct = 0;
    let total = 0;
    if (!questions) return { correct: 0, total: 0 };
    for (const q of questions) {
      total++;
      if (!q.options || q.options.length === 0) {
        if (typeof q.subjectiveScore === 'number' && q.subjectiveScore >= 50) correct++;
      } else {
        if (q.correct) correct++;
      }
    }
    return { correct, total };
  };

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
  
  const { topic, difficulty, questions, analysis, source_type, grading } = results;

  const gradingMap = {};
  if (grading && Array.isArray(grading)) {
    grading.forEach(g => {
      gradingMap[g.questionId] = g;
    });
  }

  const { correct, total } = getCorrectCounts(questions);

  const pieData = createPieChartData(
    correct,
    total - correct
  );

  const insights = generateInsights({
    ...analysis,
    score: correct,
    totalQuestions: total,
    percentage: total > 0 ? (correct / total) * 100 : 0
  });
  
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
            <div className={`score-display ${
              total > 0 && (correct / total) * 100 >= 70
                ? 'high-score'
                : total > 0 && (correct / total) * 100 >= 50
                ? 'medium-score'
                : 'low-score'
            }`}>
              <span className="score-value">{total > 0 ? Math.round((correct / total) * 100) : 0}%</span>
              <span className="score-label">Score</span>
            </div>
          </div>
          
          <div className="performance-metrics">
            <div className="metrics-header">Performance Metrics</div>
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-icon"><i className="fas fa-check-circle"></i></div>
                <div className="metric-value">{correct}/{total}</div>
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
                  {total > 0 ? Math.round(analysis.timeTaken / total) : 0} sec
                </div>
                <div className="metric-label">Avg. Time per Question</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    
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
        {questions.map((question, index) => {
          const isSubjective = !question.options || question.options.length === 0;
          return (
            <div
              key={question.id}
              className={`question-review-card ${
                isSubjective
                  ? (question.subjectiveScore >= 50 ? 'correct' : 'incorrect')
                  : (question.correct ? 'correct' : 'incorrect')
              }`}
            >
              <div className="question-header">
                <h3 className="question-number">Question {index + 1}</h3>
                {question.category && (
                  <span className="question-category">{question.category}</span>
                )}

                {isSubjective && typeof question.subjectiveScore === 'number' ? (
                  <span className="question-result-badge" style={{
                    background: question.subjectiveScore >= 70
                      ? 'rgba(82, 196, 26, 0.15)'
                      : question.subjectiveScore >= 40
                      ? 'rgba(255, 187, 40, 0.15)'
                      : 'rgba(245, 34, 45, 0.15)',
                    color: question.subjectiveScore >= 70
                      ? '#52c41a'
                      : question.subjectiveScore >= 40
                      ? '#FFBB28'
                      : '#f5222d'
                  }}>
                    {question.subjectiveScore}% Correct
                  </span>
                ) : (
                  <span className={`question-result-badge ${question.correct ? 'correct' : 'incorrect'}`}>
                    {question.correct ? 'Correct' : 'Incorrect'}
                  </span>
                )}
              </div>

              <p className="question-text">{question.question}</p>

              {isSubjective ? (
                <div className="subjective-review mb-3">
                  <div>
                    <strong>Your Answer:</strong>
                    <div style={{ background: '#f8f9fa', borderRadius: 8, padding: '0.75rem', margin: '0.5rem 0' }}>
                      {question.subjectiveAnswer || <span className="text-muted">No answer given.</span>}
                    </div>
                  </div>
                  <div>
                    <strong>Reference Answer:</strong>
                    <div style={{ background: '#f6ffed', borderRadius: 8, padding: '0.75rem', margin: '0.5rem 0' }}>
                      {question.explanation || <span className="text-muted">No reference answer.</span>}
                    </div>
                  </div>
                  {typeof question.subjectiveScore === 'number' && (
                    <div>
                      <strong>AI Feedback:</strong>
                      <div style={{ background: '#fffbe6', borderRadius: 8, padding: '0.75rem', margin: '0.5rem 0' }}>
                        <span>{question.subjectiveReason || 'No feedback available.'}</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (

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
              )}

              {!isSubjective && (
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
              )}
            </div>
          );
        })}
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
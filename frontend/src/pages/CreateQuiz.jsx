import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import PDFUploader from '../components/quiz/PDFUploader';
import './CreateQuiz.css';

const CreateQuiz = () => {
  const [formData, setFormData] = useState({
    topic: '',
    difficulty: 'medium',
    numQuestions: 5
  });
  
  const [quizType, setQuizType] = useState('text'); // 'text' or 'pdf'
  const [pdfFile, setPdfFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Convert numQuestions to a number if necessary
    const parsedValue = name === 'numQuestions' ? parseInt(value) : value;
    
    setFormData({
      ...formData,
      [name]: parsedValue
    });
  };
  
  const handleQuizTypeChange = (type) => {
    setQuizType(type);
    setError(null);
  };
  
  const handlePDFSelect = (file) => {
    setPdfFile(file);
    setError(null);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.topic.trim()) {
      setError('Please enter a topic');
      return;
    }
    
    if (quizType === 'pdf' && !pdfFile) {
      setError('Please upload a PDF file');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      let response;
      
      if (quizType === 'text') {
        // Generate quiz using text-based Gemini AI
        response = await api.generateQuiz(
          formData.topic, 
          formData.difficulty, 
          formData.numQuestions
        );
      } else {
        // Generate quiz using PDF content
        const pdfFormData = new FormData();
        pdfFormData.append('pdf', pdfFile);
        pdfFormData.append('topic', formData.topic);
        pdfFormData.append('difficulty', formData.difficulty);
        pdfFormData.append('numQuestions', formData.numQuestions);
        
        response = await api.generatePDFQuiz(pdfFormData);
      }
      
      // Navigate to the quiz page with the quiz ID
      navigate(`/quiz/${response.data.data.quizId}`);
    } catch (err) {
      console.error('Error creating quiz:', err);
      setError(err.response?.data?.message || 'Failed to create quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const popularTopics = [
    "JavaScript",
    "Python",
    "World History",
    "Geography",
    "Science",
    "Literature",
    "Art",
    "Music",
    "Sports",
    "Movies",
    "Tech Gadgets",
    "Biology"
  ];
  
  const handleSelectTopic = (topic) => {
    setFormData({
      ...formData,
      topic
    });
  };
  
  return (
    <div className="create-quiz-container">
      <h1>Create a New Quiz</h1>
      
      {error && (
        <div className="notification notification-error">
          <i className="fas fa-exclamation-circle"></i> {error}
        </div>
      )}
      
      <div className="quiz-type-selector">
        <button 
          className={`quiz-type-btn ${quizType === 'text' ? 'active' : ''}`}
          onClick={() => handleQuizTypeChange('text')}
        >
          <i className="fas fa-font"></i>
          <span>Text-based Quiz</span>
        </button>
        <button 
          className={`quiz-type-btn ${quizType === 'pdf' ? 'active' : ''}`}
          onClick={() => handleQuizTypeChange('pdf')}
        >
          <i className="fas fa-file-pdf"></i>
          <span>PDF-based Quiz</span>
        </button>
      </div>
      
      <div className="quiz-form-container">
        <form onSubmit={handleSubmit} className="quiz-form">
          <div className="form-group">
            <label htmlFor="topic">Quiz Topic</label>
            <input
              type="text"
              id="topic"
              name="topic"
              className="form-control"
              placeholder="e.g., JavaScript Fundamentals, World History, Solar System"
              value={formData.topic}
              onChange={handleChange}
              required
            />
          </div>
          
          {quizType === 'pdf' && (
            <div className="form-group">
              <label>Upload PDF Document</label>
              <PDFUploader onFileSelect={handlePDFSelect} />
              <p className="form-hint">
                The quiz will be generated based on the content of the PDF document.
              </p>
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="difficulty">Difficulty Level</label>
            <select
              id="difficulty"
              name="difficulty"
              className="form-control"
              value={formData.difficulty}
              onChange={handleChange}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="numQuestions">Number of Questions</label>
            <input
              type="range"
              id="numQuestions"
              name="numQuestions"
              min="3"
              max="10"
              step="1"
              value={formData.numQuestions}
              onChange={handleChange}
            />
            <div className="range-value">{formData.numQuestions} questions</div>
          </div>
          
          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? <LoadingSpinner /> : 'Generate Quiz'}
          </button>
        </form>
        
        <div className="popular-topics">
          <h3>Popular Topics</h3>
          <div className="topic-tags">
            {popularTopics.map((topic, index) => (
              <div 
                key={index} 
                className="topic-tag"
                onClick={() => handleSelectTopic(topic)}
              >
                {topic}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="quiz-tips">
        <h3><i className="fas fa-lightbulb"></i> Tips for great quizzes</h3>
        <ul>
          <li>Be specific with your topic (e.g., "Ancient Egypt" instead of just "History")</li>
          <li>Match the difficulty level to your audience</li>
          <li>Consider 5-7 questions for an optimal quiz experience</li>
          {quizType === 'pdf' && (
            <li>For PDF quizzes, ensure your document is legible and contains relevant information</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default CreateQuiz;

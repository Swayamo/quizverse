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
      <h1 className="mb-4">Create a New Quiz</h1>
      
      {error && (
        <div className="alert alert-danger d-flex align-items-center" role="alert">
          <i className="fas fa-exclamation-circle me-2"></i> {error}
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
      
      <div className="quiz-form-container card shadow-sm">
        <form onSubmit={handleSubmit} className="quiz-form">
          <div className="form-group mb-4">
            <label htmlFor="topic" className="form-label">Quiz Topic</label>
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
            <div className="form-group mb-4">
              <label className="form-label">Upload PDF Document</label>
              <PDFUploader onFileSelect={handlePDFSelect} />
              <p className="form-hint text-muted">
                The quiz will be generated based on the content of the PDF document.
              </p>
            </div>
          )}
          
          <div className="form-group mb-4">
            <label htmlFor="difficulty" className="form-label">Difficulty Level</label>
            <select
              id="difficulty"
              name="difficulty"
              className="form-select"
              value={formData.difficulty}
              onChange={handleChange}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          
          <div className="form-group mb-4">
            <label htmlFor="numQuestions" className="form-label">
              Number of Questions: <span className="text-accent fw-bold">{formData.numQuestions}</span>
            </label>
            <input
              type="range"
              className="form-range"
              id="numQuestions"
              name="numQuestions"
              min="3"
              max="10"
              step="1"
              value={formData.numQuestions}
              onChange={handleChange}
            />
            <div className="d-flex justify-content-between">
              <span className="range-value">3</span>
              <span className="range-value">10</span>
            </div>
          </div>
          
          <button
            type="submit"
            className="btn btn-primary btn-lg w-100"
            disabled={loading}
          >
            {loading ? (
              <div className="d-flex align-items-center justify-content-center">
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Generating Quiz...
              </div>
            ) : (
              <><i className="fas fa-magic me-2"></i> Generate Quiz</>
            )}
          </button>
        </form>
        
        <div className="popular-topics">
          <h3 className="mb-3">Popular Topics</h3>
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
      
      <div className="quiz-tips card shadow-sm mt-4">
        <div className="card-body">
          <h3 className="d-flex align-items-center mb-3">
            <i className="fas fa-lightbulb text-warning me-2"></i> Tips for great quizzes
          </h3>
          <ul className="list-group list-group-flush">
            <li className="list-group-item bg-transparent">Be specific with your topic (e.g., "Ancient Egypt" instead of just "History")</li>
            <li className="list-group-item bg-transparent">Match the difficulty level to your audience</li>
            <li className="list-group-item bg-transparent">Consider 5-7 questions for an optimal quiz experience</li>
            {quizType === 'pdf' && (
              <li className="list-group-item bg-transparent">For PDF quizzes, ensure your document is legible and contains relevant information</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CreateQuiz;

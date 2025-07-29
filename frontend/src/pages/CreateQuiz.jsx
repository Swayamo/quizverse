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
    numQuestions: 5,
    questionType: 'MCQ' 
  });
  
  const [quizType, setQuizType] = useState('pdf'); 
  const [pdfFile, setPdfFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
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
    
        response = await api.generateQuiz(
          formData.topic, 
          formData.difficulty, 
          formData.numQuestions,
          formData.questionType 
        );
      } else {
        const pdfFormData = new FormData();
        pdfFormData.append('pdf', pdfFile);
        pdfFormData.append('topic', formData.topic);
        pdfFormData.append('difficulty', formData.difficulty);
        pdfFormData.append('numQuestions', formData.numQuestions);
        pdfFormData.append('questionType', formData.questionType); 
        
        response = await api.generatePDFQuiz(pdfFormData);
      }
      
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
      <div className="page-header text-center mb-5">
        <h1 className="fw-bold mb-2">Create Your Quiz</h1>
        <p className="text-muted fw-light">Design custom quizzes powered by AI technology</p>
        <div className="title-underline"></div>
      </div>
      
      {error && (
        <div className="alert alert-danger d-flex align-items-center shadow-sm fade show" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i> 
          <div>{error}</div>
          <button type="button" className="btn-close ms-auto" onClick={() => setError(null)} aria-label="Close"></button>
        </div>
      )}
      
      <div className="card main-card border-0 mb-4">
        <div className="card-header bg-transparent border-0 pt-4 px-4">
          <ul className="nav nav-tabs tab-selector card-header-tabs">
            <li className="nav-item">
              {/* <button 
                className={`nav-link ${quizType === 'text' ? 'active' : ''}`}
                onClick={() => handleQuizTypeChange('text')}
              >
                <i className="bi bi-fonts me-2"></i>
                <span>Text-based Quiz</span>
              </button> */}
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${quizType === 'pdf' ? 'active' : ''}`}
                onClick={() => handleQuizTypeChange('pdf')}
              >
                <i className="bi bi-file-earmark-pdf-fill me-2"></i>
                <span>PDF-based Quiz</span>
              </button>
            </li>
          </ul>
        </div>
        
        <div className="card-body p-lg-5 p-4">
          <div className="row g-4">
            <div className="col-lg-8">
              <form onSubmit={handleSubmit} className="quiz-form">
                <div className="mb-4">
                  <label htmlFor="topic" className="form-label">Quiz Topic</label>
                  <div className="input-group input-group-lg">
                    <span className="input-group-text bg-transparent">
                      <i className="bi bi-bookmark-fill"></i>
                    </span>
                    <input
                      type="text"
                      id="topic"
                      name="topic"
                      className="form-control"
                      placeholder="e.g., JavaScript Fundamentals, World History"
                      value={formData.topic}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-text">Be specific with your topic for better results</div>
                </div>
                
                {quizType === 'pdf' && (
                  <div className="mb-4">
                    <label className="form-label">Upload PDF Document</label>
                    <PDFUploader onFileSelect={handlePDFSelect} />
                    <div className="form-text">
                      PDF content will be analyzed to generate relevant questions
                    </div>
                  </div>
                )}
                
                <div className="mb-4">
                  <label htmlFor="questionType" className="form-label">Question Type</label>
                  <div className="btn-group w-100" role="group" aria-label="Question Type">
                    <button
                      type="button"
                      className={`btn btn-outline-primary${formData.questionType === 'MCQ' ? ' active' : ''}`}
                      onClick={() => setFormData({ ...formData, questionType: 'MCQ' })}
                    >
                      MCQ
                    </button>
                    <button
                      type="button"
                      className={`btn btn-outline-primary${formData.questionType === 'Subjective' ? ' active' : ''}`}
                      onClick={() => setFormData({ ...formData, questionType: 'Subjective' })}
                    >
                      Subjective
                    </button>
                  </div>
                </div>
                
                <div className="row mb-4 g-4">
                  <div className="col-md-6">
                    <div className="difficulty-selector">
                      <label htmlFor="difficulty" className="form-label">Difficulty Level</label>
                      <div className="difficulty-options">
                        <div 
                          className={`difficulty-option ${formData.difficulty === 'easy' ? 'active' : ''}`}
                          onClick={() => setFormData({...formData, difficulty: 'easy'})}
                        >
                          <i className="bi bi-star-fill"></i>
                          <span>Easy</span>
                        </div>
                        <div 
                          className={`difficulty-option ${formData.difficulty === 'medium' ? 'active' : ''}`}
                          onClick={() => setFormData({...formData, difficulty: 'medium'})}
                        >
                          <i className="bi bi-star-fill"></i>
                          <i className="bi bi-star-fill"></i>
                          <span>Medium</span>
                        </div>
                        <div 
                          className={`difficulty-option ${formData.difficulty === 'hard' ? 'active' : ''}`}
                          onClick={() => setFormData({...formData, difficulty: 'hard'})}
                        >
                          <i className="bi bi-star-fill"></i>
                          <i className="bi bi-star-fill"></i>
                          <i className="bi bi-star-fill"></i>
                          <span>Hard</span>
                        </div>
                      </div>
                      <select
                        id="difficulty"
                        name="difficulty"
                        className="d-none"
                        value={formData.difficulty}
                        onChange={handleChange}
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <div className="questions-selector">
                      <label htmlFor="numQuestions" className="form-label d-flex justify-content-between">
                        <span>Number of Questions</span>
                        <span className="questions-badge">{formData.numQuestions}</span>
                      </label>
                      <input
                        type="range"
                        className="form-range mt-3"
                        id="numQuestions"
                        name="numQuestions"
                        min="3"
                        max="10"
                        step="1"
                        value={formData.numQuestions}
                        onChange={handleChange}
                      />
                      <div className="range-labels d-flex justify-content-between mt-2">
                        <span>3</span>
                        <span>10</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <button
                  type="submit"
                  className="btn btn-generate w-100 py-3 mt-3"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="d-flex align-items-center justify-content-center">
                      <div className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></div>
                      <span>Creating your quiz...</span>
                    </div>
                  ) : (
                    <span className="btn-text">
                      <i className="bi bi-magic me-2"></i> Generate Quiz
                    </span>
                  )}
                </button>
              </form>
            </div>
            
            <div className="col-lg-4">
              <div className="popular-topics-wrapper">
                <h5 className="section-title">Popular Topics</h5>
                <div className="popular-topics-container">
                  {popularTopics.map((topic, index) => (
                    <div 
                      key={index} 
                      className={`topic-chip ${formData.topic === topic ? 'active' : ''}`}
                      onClick={() => handleSelectTopic(topic)}
                    >
                      {topic}
                    </div>
                  ))}
                </div>
                
                <div className="tips-section">
                  <h5 className="section-title">
                    <i className="bi bi-lightbulb-fill me-2"></i> Pro Tips
                  </h5>
                  <ul className="tips-list">
                    <li>
                      <i className="bi bi-check-circle-fill"></i>
                      Use specific topics rather than broad categories
                    </li>
                    <li>
                      <i className="bi bi-check-circle-fill"></i>
                      Choose difficulty based on your audience's knowledge level
                    </li>
                    <li>
                      <i className="bi bi-check-circle-fill"></i>
                      5-7 questions creates the optimal quiz experience
                    </li>
                    {quizType === 'pdf' && (
                      <li>
                        <i className="bi bi-check-circle-fill"></i>
                        Ensure PDF documents are text-searchable for best results
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="help-card">
        <div className="help-card-content">
          <div className="row align-items-center">
            <div className="col-md-8">
              <h4>Need help with your quiz?</h4>
              <p className="mb-md-0">Our comprehensive guide explains how to create effective quizzes for any purpose.</p>
            </div>
            <div className="col-md-4 text-md-end mt-3 mt-md-0">
              <a href="#" className="btn btn-outline">
                <i className="bi bi-journal-text me-2"></i> View Guide
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateQuiz;


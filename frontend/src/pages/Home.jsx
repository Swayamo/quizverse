import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Home.css';

const Home = () => {
  const { currentUser } = useAuth();

  return (
    <div className="home-container">
      <section className="hero-section">
        <div className="hero-content">
          <h1>Welcome to QuizWiz</h1>
          <p className="hero-subtitle">
            Test your knowledge with AI-generated quizzes on any topic
          </p>
          
          {currentUser ? (
            <div className="hero-buttons">
              <Link to="/dashboard" className="btn btn-primary">
                Go to Dashboard
              </Link>
              <Link to="/create-quiz" className="btn btn-secondary">
                Create New Quiz
              </Link>
            </div>
          ) : (
            <div className="hero-buttons">
              <Link to="/login" className="btn btn-primary">
                Login
              </Link>
              <Link to="/register" className="btn btn-secondary">
                Register
              </Link>
            </div>
          )}
        </div>
        
        <div className="hero-image">
          <img src="/quiz-hero.svg" alt="Quiz illustration" />
        </div>
      </section>
      
      <section className="features-section">
        <h2>Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <i className="fas fa-robot feature-icon"></i>
            <h3>AI-Generated Quizzes</h3>
            <p>Create custom quizzes on any topic using advanced AI technology</p>
          </div>
          
          <div className="feature-card">
            <i className="fas fa-chart-line feature-icon"></i>
            <h3>Performance Tracking</h3>
            <p>Track your progress and see detailed analytics on your quiz performance</p>
          </div>
          
          <div className="feature-card">
            <i className="fas fa-sliders-h feature-icon"></i>
            <h3>Customizable Difficulty</h3>
            <p>Adjust quiz difficulty to match your knowledge level</p>
          </div>
          
          <div className="feature-card">
            <i className="fas fa-history feature-icon"></i>
            <h3>Quiz History</h3>
            <p>Review your past quizzes and learn from your mistakes</p>
          </div>
        </div>
      </section>
      
      <section className="how-it-works-section">
        <h2>How It Works</h2>
        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Create Account</h3>
            <p>Sign up for a free account to access all features</p>
          </div>
          
          <div className="step">
            <div className="step-number">2</div>
            <h3>Generate a Quiz</h3>
            <p>Specify your topic and difficulty level</p>
          </div>
          
          <div className="step">
            <div className="step-number">3</div>
            <h3>Take the Quiz</h3>
            <p>Answer the questions and test your knowledge</p>
          </div>
          
          <div className="step">
            <div className="step-number">4</div>
            <h3>Review Results</h3>
            <p>Get instant feedback and detailed analysis</p>
          </div>
        </div>
      </section>
      
      <section className="cta-section">
        <h2>Ready to Test Your Knowledge?</h2>
        <p>Create your first quiz in minutes and start learning today</p>
        
        {currentUser ? (
          <Link to="/create-quiz" className="btn btn-primary btn-large">
            Create Your First Quiz
          </Link>
        ) : (
          <Link to="/register" className="btn btn-primary btn-large">
            Get Started Now
          </Link>
        )}
      </section>
    </div>
  );
};

export default Home;

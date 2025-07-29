import React, { useEffect } from 'react';
import './Home.css';
import { Link } from 'react-router-dom';

const Home = () => {
  useEffect(() => {
    
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });

    const floatingComponents = document.querySelectorAll('.floating-component');
    floatingComponents.forEach((component, index) => {
      const randomDelay = Math.random() * 2;
      const randomDuration = 4 + Math.random() * 4;
      component.style.animationDelay = `${randomDelay}s`;
      component.style.animationDuration = `${randomDuration}s`;
    });

    
    return () => {};
  }, []);

  return (
    <div>
      <section className="hero" id="home">
        {[
          { className: 'notebook', top: '20%', left: '10%', delay: '0s' },
          { className: 'pen', top: '60%', right: '15%', delay: '1s' },
          { className: 'book', top: '30%', right: '25%', delay: '2s' },
          { className: 'calculator', top: '70%', left: '20%', delay: '3s' },
          { className: 'notebook', top: '40%', left: '80%', delay: '1.5s' },
          { className: 'pen', top: '80%', right: '40%', delay: '2.5s' },
          { className: 'book', top: '15%', left: '70%', delay: '0.5s' },
          { className: 'calculator', top: '50%', left: '5%', delay: '3.5s' },
        ].map((item, idx) => (
          <div
            key={idx}
            className="floating-component"
            style={{ ...item, animationDelay: item.delay }}
          >
            <div className={item.className}></div>
          </div>
        ))}

        <div className="hero-content">
          <h1 className="hero-title">Quizverse</h1>
          <div className="hero-description">
            <div className="description-line1">Create stunning quizzes with</div>
            <div className="description-line2">AI-powered intelligence</div>
          </div>
          <Link to="/create-quiz" className="cta-button">
                  Start Creating
          </Link>
        </div>
      </section>

      <section className="features" id="features">
        <h2 className="features-title">Why Choose Quizverse?</h2>
        <div className="features-grid features-2x2">
          <div className="feature-card">
            <h3>AI-Powered Generation</h3>
            <p>Generate intelligent questions from any topic or PDF document using advanced AI algorithms that understand context and create meaningful assessments.</p>
          </div>
          <div className="feature-card">
            <h3>Multiple Question Types</h3>
            <p>Support for MCQ and subjective questions with customizable difficulty levels to match your audience's knowledge and learning objectives.</p>
          </div>
          <div className="feature-card">
            <h3>PDF Integration</h3>
            <p>Upload PDF documents and automatically extract relevant content to create targeted quizzes that test specific knowledge areas.</p>
          </div>
          <div className="feature-card">
            <h3>Intuitive Interface</h3>
            <p>Clean, modern design that makes quiz creation effortless. Focus on content while we handle the technical complexities for you.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

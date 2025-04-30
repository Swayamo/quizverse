import React from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css';

const NotFound = () => {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <h1 className="not-found-code">404</h1>
        <h2 className="not-found-title">Page Not Found</h2>
        <p className="not-found-message">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="not-found-actions">
          <Link to="/" className="btn btn-primary">
            <i className="fas fa-home"></i> Back to Home
          </Link>
          <Link to="/dashboard" className="btn btn-secondary">
            <i className="fas fa-tachometer-alt"></i> Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

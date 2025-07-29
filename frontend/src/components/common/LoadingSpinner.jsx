import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ 
  message = 'Loading...', 
  size = 'medium', 
  color = 'primary',
  overlay = false,
  fullPage = false,
  inline = false,
  buttonLoader = false
}) => {
  const spinnerClasses = [
    'loading-spinner',
    `size-${size}`,
    `color-${color}`,
    inline ? 'inline' : '',
    buttonLoader ? 'button-loader' : ''
  ].filter(Boolean).join(' ');

  const containerClasses = [
    'spinner-container',
    overlay ? 'with-overlay' : '',
    fullPage ? 'full-page' : '',
    buttonLoader ? 'button-container' : ''
  ].filter(Boolean).join(' ');

  if (buttonLoader) {
    return (
      <div className={containerClasses}>
        <div className={spinnerClasses}>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      <div className="spinner-content">
        <div className={spinnerClasses}>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
        </div>
        {message && <p className="spinner-message">{message}</p>}
      </div>
    </div>
  );
};

export default LoadingSpinner;

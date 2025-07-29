import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaTachometerAlt } from 'react-icons/fa';
import { useTheme } from '../contexts/ThemeContext';

const NotFound = () => {
  const { theme } = useTheme();

  const bgColor = theme === 'dark' ? '#121212' : '#f5f5f5';
  const textColor = theme === 'dark' ? '#e0e0e0' : '#333';
  const accentColor = '#3498db';

  const container = {
    backgroundColor: bgColor,
    color: textColor,
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    boxSizing: 'border-box',
    fontFamily: 'sans-serif',
    textAlign: 'center',
  };

  const content = {
    maxWidth: '400px',
    width: '100%',
  };

  const codeStyle = {
    fontSize: '6rem',
    margin: '0',
    fontWeight: 'bold',
  };

  const titleStyle = {
    fontSize: '2rem',
    margin: '10px 0',
  };

  const msgStyle = {
    fontSize: '1rem',
    margin: '15px 0 25px',
    lineHeight: 1.5,
  };

  const actions = {
    display: 'flex',
    gap: '15px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  };

  const btnBase = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 18px',
    borderRadius: '4px',
    textDecoration: 'none',
    fontWeight: 500,
    transition: 'background-color 0.2s, color 0.2s',
    cursor: 'pointer',
  };

  const primaryBtn = {
    ...btnBase,
    backgroundColor: accentColor,
    color: '#fff',
  };

  const secondaryBtn = {
    ...btnBase,
    backgroundColor: 'transparent',
    border: `2px solid ${accentColor}`,
    color: accentColor,
  };

  return (
    <div style={container}>
      <div style={content}>
        <h1 style={codeStyle}>404</h1>
        <h2 style={titleStyle}>Oops, page not found.</h2>
        <p style={msgStyle}>
          We can’t find the page you’re looking for. It might’ve been removed or you may have mistyped the URL.
        </p>
        <div style={actions}>
          <Link
            to="/"
            style={primaryBtn}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#217dbb')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = accentColor)}
          >
            <FaHome /> Back to Home
          </Link>
          <Link
            to="/dashboard"
            style={secondaryBtn}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = accentColor;
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = accentColor;
            }}
          >
            <FaTachometerAlt /> Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

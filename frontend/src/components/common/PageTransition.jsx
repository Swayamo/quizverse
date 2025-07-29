import React from 'react';

// Simple fade-in transition wrapper for route changes
const PageTransition = ({ children }) => {
  return (
    <div className="page-transition">
      {children}
    </div>
  );
};

export default PageTransition;

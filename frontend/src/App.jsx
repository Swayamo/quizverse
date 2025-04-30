import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import CreateQuiz from './pages/CreateQuiz'
import TakeQuiz from './pages/TakeQuiz'
import QuizResults from './pages/QuizResults'
import QuizHistory from './pages/QuizHistory'
import Profile from './pages/Profile'
import Statistics from './pages/Statistics'
import NotFound from './pages/NotFound'
import './App.css'

// Protected route component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="app-container">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/create-quiz" element={
                <ProtectedRoute>
                  <CreateQuiz />
                </ProtectedRoute>
              } />
              
              <Route path="/quiz/:id" element={
                <ProtectedRoute>
                  <TakeQuiz />
                </ProtectedRoute>
              } />
              
              <Route path="/quiz/:id/results" element={
                <ProtectedRoute>
                  <QuizResults />
                </ProtectedRoute>
              } />
              
              <Route path="/history" element={
                <ProtectedRoute>
                  <QuizHistory />
                </ProtectedRoute>
              } />
              
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              
              <Route path="/statistics" element={
                <ProtectedRoute>
                  <Statistics />
                </ProtectedRoute>
              } />
              
              {/* 404 Page */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App

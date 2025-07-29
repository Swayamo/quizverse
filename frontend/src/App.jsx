import { useState, useEffect, Suspense } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import LoadingSpinner from './components/common/LoadingSpinner'
import PageTransition from './components/common/PageTransition'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import CreateQuiz from './pages/CreateQuiz'
import TakeQuiz from './pages/TakeQuiz'
import QuizResults from './pages/QuizResults'
import QuizHistory from './pages/QuizHistory'
import NotFound from './pages/NotFound'
import './App.css'

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="auth-loading">
        <LoadingSpinner size="small" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const PageLoader = () => (
  <div className="page-loader">
    <LoadingSpinner message="Loading page..." />
  </div>
);

function App() {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="app-container">
          <div className="app-backdrop"></div>
          <Navbar />
          
          <main className="main-content">
            <div className="content-wrapper">
              {isLoading && (
                <div className="route-loading">
                  <div className="loading-bar"></div>
                </div>
              )}
              
              <Suspense fallback={<PageLoader />}>
                <PageTransition>
                  <Routes location={location}>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    
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
                    
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </PageTransition>
              </Suspense>
            </div>
          </main>
          
          <Footer />
          
          <div className="app-notifications">
            <div id="toast-container"></div>
          </div>
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App

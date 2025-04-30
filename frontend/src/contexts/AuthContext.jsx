import { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (token) {
      fetchUserProfile(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async (token) => {
    try {
      api.setAuthToken(token);
      const response = await api.get('/users/profile');
      setCurrentUser(response.data.data);
    } catch (err) {
      console.error('Error fetching user profile:', err);
      // If the token is invalid, log the user out
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setError(null);
    try {
      const response = await api.post('/auth/login', { email, password });
      
      const { token, data } = response.data;
      
      // Set the token in local storage
      localStorage.setItem('token', token);
      
      // Set the auth token in the API
      api.setAuthToken(token);
      
      // Set the user in state
      setCurrentUser(data);
      
      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed. Please try again.';
      setError(errorMessage);
      return false;
    }
  };

  const register = async (username, email, password) => {
    setError(null);
    try {
      const response = await api.post('/auth/register', { username, email, password });
      
      const { token, data } = response.data;
      
      // Set the token in local storage
      localStorage.setItem('token', token);
      
      // Set the auth token in the API
      api.setAuthToken(token);
      
      // Set the user in state
      setCurrentUser(data.user);
      
      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      return false;
    }
  };

  const logout = () => {
    // Remove token from local storage
    localStorage.removeItem('token');
    
    // Remove the auth token in the API
    api.removeAuthToken();
    
    // Set the user in state to null
    setCurrentUser(null);
    
    return true;
  };

  const updateProfile = async (userData) => {
    try {
      const response = await api.put('/users/profile', userData);
      setCurrentUser(response.data.data);
      return { success: true, data: response.data.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Update failed. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const value = {
    currentUser,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

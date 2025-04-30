import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Update the error interceptor to better handle route errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with an error status code
      console.error(`Server error (${error.response.status}):`, error.response.data);
      
      // Add special handling for common errors
      if (error.response.status === 404) {
        // Check if this is a route not found error
        if (error.config && error.config.url && error.config.url.includes('/history')) {
          console.warn('Route error detected - history route may be misplaced in router definition');
        }
      }
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Request error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Helper methods for API service
const apiService = {
  setAuthToken: (token) => {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  },

  removeAuthToken: () => {
    delete api.defaults.headers.common['Authorization'];
  },

  get: (url, config = {}) => api.get(url, config),
  
  post: (url, data = {}, config = {}) => api.post(url, data, config),
  
  put: (url, data = {}, config = {}) => api.put(url, data, config),
  
  delete: (url, config = {}) => api.delete(url, config),
  
  // Quiz specific methods
  generateQuiz: (topic, difficulty, numQuestions) => {
    return api.post('/quizzes/generate', { topic, difficulty, numQuestions });
  },
  
  generatePDFQuiz: (formData) => {
    return api.post('/quizzes/generate-from-pdf', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  
  getQuiz: (quizId) => {
    return api.get(`/quizzes/${quizId}`);
  },
  
  submitQuiz: (quizId, answers, timeSpent) => {
    return api.post(`/quizzes/${quizId}/submit`, { answers, timeSpent });
  },
  
  getQuizHistory: () => {
    return api.get('/quizzes/history');
  },
  
  getQuizResults: (quizId) => {
    return api.get(`/quizzes/${quizId}/results`);
  },
  
  // User specific methods
  getUserProfile: () => {
    return api.get('/users/profile');
  },
  
  updateUserProfile: (userData) => {
    return api.put('/users/profile', userData);
  },
  
  getUserStats: () => {
    return api.get('/users/stats');
  },
  
  getUserQuizStats: () => {
    return api.get('/quizzes/user/stats');
  }
};

// Initialize token from localStorage
const token = localStorage.getItem('token');
if (token) {
  apiService.setAuthToken(token);
}

export default apiService;

import axios from 'axios';

const BASE_URL = 'https://quiz-application-1-s25h.onrender.com/api';

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
    // Store the token timestamp for automatic refresh
    localStorage.setItem('tokenTimestamp', Date.now().toString());
  },

  removeAuthToken: () => {
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('tokenTimestamp');
  },

  checkTokenExpiration: () => {
    const tokenTimestamp = localStorage.getItem('tokenTimestamp');
    if (tokenTimestamp) {
      const currentTime = Date.now();
      const tokenAge = currentTime - parseInt(tokenTimestamp);
      // If token is older than 23 hours (82800000 ms), refresh it
      if (tokenAge > 82800000) {
        return true;
      }
    }
    return false;
  },

  // Standard HTTP methods with improved error handling
  get: async (url, config = {}) => {
    try {
      return await api.get(url, config);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');
      }
      throw error;
    }
  },
  
  post: async (url, data = {}, config = {}) => {
    try {
      return await api.post(url, data, config);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');
      }
      throw error;
    }
  },
  
  put: async (url, data = {}, config = {}) => {
    try {
      return await api.put(url, data, config);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');
      }
      throw error;
    }
  },
  
  delete: async (url, config = {}) => {
    try {
      return await api.delete(url, config);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');
      }
      throw error;
    }
  },
  
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

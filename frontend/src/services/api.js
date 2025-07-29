import axios from 'axios';

const BASE_URL = 'https://quzz.onrender.com/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error(`Server error (${error.response.status}):`, error.response.data);
      if (error.response.status === 404) {
        if (error.config && error.config.url && error.config.url.includes('/history')) {
          console.warn('Route error detected - history route may be misplaced in router definition');
        }
      }
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Request error:', error.message);
    }
    return Promise.reject(error);
  }
);

const apiService = {
  setAuthToken: (token) => {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
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
      if (tokenAge > 82800000) {
        return true;
      }
    }
    return false;
  },

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
  
  submitQuiz: (quizId, answers, timeSpent, questionType) => {
    return api.post(`/quizzes/${quizId}/submit`, { answers, timeSpent, questionType });
  },
  
  getQuizHistory: () => {
    return api.get('/quizzes/history');
  },
  
  getQuizResults: (quizId) => {
    return api.get(`/quizzes/${quizId}/results`);
  },
  
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

const token = localStorage.getItem('token');
if (token) {
  apiService.setAuthToken(token);
}

export default apiService;

import axios from 'axios';
import { API_CONFIG } from '../../constants/config';

// Axios instance banao with base configuration
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor (for adding auth tokens later)
apiClient.interceptors.request.use(
  (config) => {
    // Future: Add authentication token
    // const token = await AsyncStorage.getItem('authToken');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor (for error handling)
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

/**
 * Spring Boot API Methods
 */
const SpringBootAPI = {
  /**
   * Compare face with database
   * @param {string} faceImageBase64 - Base64 encoded face image
   * @returns {Promise} - Match result with user ID
   */
  compareFace: async (faceImageBase64) => {
    try {
      const response = await apiClient.post('/face/compare', {
        image: faceImageBase64,
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Register new face
   * @param {string} faceImageBase64 - Base64 encoded face image
   * @param {string} userId - User ID from Firebase
   * @returns {Promise} - Face ID from backend
   */
  registerFace: async (faceImageBase64, userId) => {
    try {
      const response = await apiClient.post('/face/register', {
        image: faceImageBase64,
        userId: userId,
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Health check
   */
  healthCheck: async () => {
    try {
      const response = await apiClient.get('/health');
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default SpringBootAPI;
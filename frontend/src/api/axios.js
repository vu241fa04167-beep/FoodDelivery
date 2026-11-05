import axios from 'axios';

// Create an Axios instance with base API URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api'
});

// Request interceptor: attach JWT token from localStorage to every outgoing request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// When receiving 401, purge stale token so requests do not remain stuck in an invalid state.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      error.isAuthError = true;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('auth:logout'));
    }
    return Promise.reject(error);
  }
);

export default api;


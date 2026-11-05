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

// Keep the local session intact when a single protected request returns 401.
// A transient API/auth failure (for example while the backend is restarting)
// should not unexpectedly throw the customer out of the app. Protected pages
// render their own retry/error state instead.
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) error.isAuthError = true;
    return Promise.reject(error);
  }
);

export default api;


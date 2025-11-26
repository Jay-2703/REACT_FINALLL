import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies
});

// Request interceptor for adding auth token
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

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || '';
    const status = error.response?.status;
    
    // Don't auto-redirect for auth-related endpoints that handle their own errors
    const authEndpoints = ['/auth/forgot-password', '/auth/verify-reset-otp', '/auth/reset-password', '/auth/resend-otp'];
    const isAuthEndpoint = authEndpoints.some(endpoint => url.includes(endpoint));
    
    // Only redirect to login on 401 for non-auth endpoints
    if (status === 401 && !isAuthEndpoint) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;
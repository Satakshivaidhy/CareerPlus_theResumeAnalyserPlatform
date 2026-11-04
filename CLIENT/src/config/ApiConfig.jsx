import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4500/api',
  withCredentials: true,
});

// Request interceptor: attach auth header if token exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Global Error Handler for Session Expired
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || '';

    const isSessionExpired =
      status === 401 ||
      (typeof message === 'string' &&
        (message.toLowerCase().includes('session expired') ||
         message.toLowerCase().includes('invalid token') ||
         message.toLowerCase().includes('jwt expired')));

    if (isSessionExpired) {
      console.warn('Global Error Handler: Session Expired. Redirecting to login page...');

      // Clear cached credentials
      localStorage.removeItem('user');
      localStorage.removeItem('token');

      // Notify AuthContext to clear React state
      window.dispatchEvent(new Event('auth:session-expired'));

      // Redirect if not already on an auth page
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register') {
        toast.error('Session Expired. Please log in again.', {
          id: 'session-expired',
        });
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;

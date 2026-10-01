import axios from 'axios';

const rawBaseURL = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').trim();
const normalizedBaseURL = rawBaseURL.replace(/\/+$/, '');
const baseURL = normalizedBaseURL.endsWith('/api') ? normalizedBaseURL : `${normalizedBaseURL}/api`;

const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
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

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url || '';
      const isAuthEndpoint = requestUrl.includes('/accounts/login/') ||
                             requestUrl.includes('/accounts/register/') ||
                             requestUrl.includes('/accounts/oauth/');
      const currentPath = window.location.pathname;

      if (!isAuthEndpoint && currentPath !== '/login' && currentPath !== '/register') {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;

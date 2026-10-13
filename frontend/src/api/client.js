import axios from 'axios';

const api = axios.create({
  // Locally Vite proxies /api to the backend; in production VITE_API_URL points at the deployed backend
  baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api` : '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('tripzy_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized, clear stale credentials if token is invalid
      if (localStorage.getItem('tripzy_token') && !window.location.pathname.includes('/login')) {
        // optionally keep session or redirect
      }
    }
    return Promise.reject(error);
  }
);

export default api;

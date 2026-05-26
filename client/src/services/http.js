import axios from 'axios';
import { API_BASE } from '../config/api';

const http = axios.create({
  baseURL: `${API_BASE}/api`
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 401: log out unless the request opted out (e.g. optional theme sync via GET /users/settings)
http.interceptors.response.use(
  (response) => response,
  (error) => {
    const skip = error.config?.skipAuthRedirect === true;
    if (error.response?.status === 401 && !skip) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userName');
      localStorage.removeItem('skillswap_theme');
      if (
        !window.location.pathname.includes('/login') &&
        !window.location.pathname.includes('/register')
      ) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default http;

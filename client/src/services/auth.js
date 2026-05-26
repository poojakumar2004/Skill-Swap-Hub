import axios from 'axios';
import { API_BASE } from '../config/api';

const API = axios.create({
  baseURL: `${API_BASE}/api/users`
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const registerUser = (data) => API.post('/register', data);

export const loginUser = (data) => API.post('/login', data);

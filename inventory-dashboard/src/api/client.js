import axios from 'axios';

const API_BASE = 'http://localhost:3001/api';

const client = axios.create({ baseURL: API_BASE });

// Attach JWT on every request
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('linkit_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401
client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('linkit_token');
      localStorage.removeItem('linkit_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default client;

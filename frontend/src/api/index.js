import axios from 'axios';
const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 5000,
  headers: { 'Content-Type': 'application/json' }
});

apiClient.interceptors.request.use((config) => {
  const userId = localStorage.getItem('userId');
  if (userId) {
    config.headers['x-user-id'] = userId;
  }
  return config;
});

export default apiClient;

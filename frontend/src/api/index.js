import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 10000,
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error);
    // Return the error response data if available, else the error object
    return Promise.resolve(error.response ? error.response.data : { success: false, error: { message: 'Network Error' } });
  }
);

export const login = (data) => api.post('/auth/login', data);
export const loginVerify = (data) => api.post('/auth/login-verify', data);
export const sendLoginSms = (loginId) => api.post('/auth/send-login-sms', { loginId });
export const register = (data) => api.post('/auth/register', data);
export const checkAvailability = (field, value) => api.get('/auth/check-availability', { params: { field, value } });
export const sendSms = (phone) => api.post('/auth/send-sms', { phone });

export default api;

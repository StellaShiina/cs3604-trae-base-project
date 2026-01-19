import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 10000,
});

// Request interceptor to add user info
api.interceptors.request.use(
  (config) => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      config.headers['x-user-id'] = userId;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

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
export const verifyUserForReset = (data) => api.post('/auth/forgot-password/verify-user', data);
export const sendForgotSms = (phone) => api.post('/auth/forgot-password/send-sms', { phone });
export const resetPassword = (data) => api.post('/auth/forgot-password/reset', data);
export const queryTickets = (params) => api.get('/tickets/query', { params });
export const listPassengers = () => api.get('/passengers');
export const createOrder = (data) => api.post('/orders', data);
export const getOrder = (id) => api.get(`/orders/${id}`);
export const payOrder = (id) => api.post(`/orders/${id}/pay`);
export const cancelOrder = (id) => api.post(`/orders/${id}/cancel`);

export default api;

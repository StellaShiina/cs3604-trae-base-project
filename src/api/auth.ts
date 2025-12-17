import axios from 'axios'

const API_BASE_URL = '/api/v1' // Assuming the backend is at /api/v1 based on previous context, but wait, the React code used API_BASE_URL import.

// Let's double check config.ts in React project to be sure about the base URL.
export const login = async (data: any) => {
  return axios.post(`${API_BASE_URL}/auth/login`, data)
}

export const verifyLogin = async (data: any) => {
  return axios.post(`${API_BASE_URL}/auth/verify-login`, data)
}

export const sendSms = async (data: any) => {
  return axios.post(`${API_BASE_URL}/auth/send-sms`, data)
}

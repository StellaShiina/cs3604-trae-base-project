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

// Registration Validation
export const validateUsername = async (username: string) => {
  return axios.post(`${API_BASE_URL}/auth/register/validate-username`, { username })
}

export const validatePhone = async (phone: string) => {
  return axios.post(`${API_BASE_URL}/auth/register/validate-phone`, { phone })
}

export const validateEmail = async (email: string) => {
  return axios.post(`${API_BASE_URL}/auth/register/validate-email`, { email })
}

// Registration Flow
export const startRegistration = async (data: any) => {
  return axios.post(`${API_BASE_URL}/auth/register`, data)
}

export const sendRegisterSms = async (data: any) => {
  return axios.post(`${API_BASE_URL}/auth/register/send-verification-code`, data)
}

export const completeRegistration = async (data: any) => {
  return axios.post(`${API_BASE_URL}/auth/register/complete`, data)
}

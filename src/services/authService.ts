import axios from 'axios'

export interface User {
  id?: number | string
  username: string
  email?: string
  mobile?: string
  name?: string
  token?: string
  id_no?: string
  id_type?: string
  gender?: string
}

export interface LoginResponse {
  user: User
}

export interface RegisterResponse {
  userId: number | string
}

export const login = async (identifier: string, password: string): Promise<LoginResponse> => {
  const response = await axios.post('/api/v1/auth/login', {
    identifier,
    password
  })
  return response.data
}

export const register = async (data: any): Promise<RegisterResponse> => {
  const response = await axios.post('/api/v1/auth/register', data)
  return response.data
}

export const sendSMS = async (mobile: string) => {
  const response = await axios.post('/api/v1/auth/send-sms', { mobile })
  return response.data
}

export const verifySMS = async (mobile: string, code: string) => {
  const response = await axios.post('/api/v1/auth/verify-sms', { mobile, code })
  return response.data
}

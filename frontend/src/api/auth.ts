import request from '../utils/request'

export interface LoginRequest {
  identifier: string
  password: string
}

export interface LoginResponse {
  success: boolean
  sessionId?: string
  error?: string
}

export interface SendVerificationCodeRequest {
  sessionId: string
  idCardLast4: string
}

export interface SendVerificationCodeResponse {
  success: boolean
  verificationCode?: string // For dev environment
  phone?: string // For dev environment
  error?: string
}

export interface VerifyLoginRequest {
  sessionId: string
  idCardLast4: string
  verificationCode: string
}

export interface VerifyLoginResponse {
  success: boolean
  token?: string
  user?: any
  userId?: string
  error?: string
}

export const login = (data: LoginRequest) => {
  return request.post<any, LoginResponse>('/auth/login', data)
}

export const sendVerificationCode = (data: SendVerificationCodeRequest) => {
  return request.post<any, SendVerificationCodeResponse>('/auth/send-verification-code', data)
}

export const verifyLogin = (data: VerifyLoginRequest) => {
  return request.post<any, VerifyLoginResponse>('/auth/verify-login', data)
}

export const logout = () => {
  return request.post('/auth/logout')
}

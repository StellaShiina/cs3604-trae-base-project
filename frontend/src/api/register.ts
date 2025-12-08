import request from '../utils/request'

export interface RegisterRequest {
  username: string
  password: string
  confirmPassword: string
  idCardType: string
  name: string
  gender?: string
  idCardNumber: string
  discountType: string
  email?: string
  phone: string
  agreedToTerms: boolean
}

export interface RegisterResponse {
  message: string
  sessionId: string
}

export interface SendVerificationCodeRequest {
  sessionId: string
  phone?: string
  email?: string
}

export interface SendVerificationCodeResponse {
  message: string
  verificationCode?: string // For dev environment
}

export interface CompleteRegistrationRequest {
  sessionId: string
  smsCode?: string
  emailCode?: string
}

export interface CompleteRegistrationResponse {
  message: string
  user?: any
}

// Step 1: Submit registration info to get session ID
export const startRegistration = (data: RegisterRequest) => {
  return request.post<any, RegisterResponse>('/register', data)
}

// Step 2: Send verification code (SMS or Email)
export const sendRegisterVerificationCode = (data: SendVerificationCodeRequest) => {
  return request.post<any, SendVerificationCodeResponse>('/register/send-verification-code', data)
}

// Step 3: Complete registration with verification code
export const completeRegistration = (data: CompleteRegistrationRequest) => {
  return request.post<any, CompleteRegistrationResponse>('/register/complete', data)
}

// Validation endpoints (Optional usage)
export const validateUsername = (username: string) => {
  return request.post('/register/validate-username', { username })
}

export const validatePassword = (password: string) => {
  return request.post('/register/validate-password', { password })
}

export const validateName = (name: string) => {
  return request.post('/register/validate-name', { name })
}

export const validateIdCard = (idCardType: string, idCardNumber: string) => {
  return request.post('/register/validate-idcard', { idCardType, idCardNumber })
}

export const validateEmail = (email: string) => {
  return request.post('/register/validate-email', { email })
}

export const validatePhone = (phone: string) => {
  return request.post('/register/validate-phone', { phone })
}

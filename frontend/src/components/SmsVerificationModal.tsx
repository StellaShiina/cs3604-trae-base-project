import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { API_BASE_URL } from '../config'
import './SmsVerificationModal.css'

interface SmsVerificationModalProps {
  sessionId?: string
  onClose: () => void
  onSubmit: (data: { idCardLast4: string; code: string }) => void
  externalError?: string  // 外部传入的错误信息
  externalSuccess?: string  // 外部传入的成功信息
}

const SmsVerificationModal: React.FC<SmsVerificationModalProps> = ({ 
  sessionId, 
  onClose, 
  onSubmit,
  externalError = '',
  externalSuccess = ''
}) => {
  const [idCardLast4, setIdCardLast4] = useState('')
  const [code, setCode] = useState('')
  const [countdown, setCountdown] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [validationError, setValidationError] = useState('')

  // 倒计时效果
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleSendCode = async () => {
    console.log('Sending SMS for ID card last 4:', idCardLast4)
    
    if (!idCardLast4 || idCardLast4.length !== 4) {
      setValidationError('请输入证件号后4位')
      return
    }

    setIsLoading(true)
    setValidationError('')
    
    // 如果没有sessionId，只做本地倒计时（用于测试）
    if (!sessionId) {
      setCountdown(60)
      setIsLoading(false)
      return
    }
    
    try {
      // 调用发送验证码API
      const response = await axios.post(`${API_BASE_URL}/auth/send-sms`, {
        sessionId,
        idCardLast4
      })
      
      if (response.status === 200) {
        // 从后端获取真实验证码和手机号（开发环境）
        const realCode = response.data.verificationCode || response.data.code
        const phone = response.data.phone
        if (realCode) {
          console.log(`\n=================================`)
          console.log(`📱 登录验证码`)
          console.log(`手机号: ${phone || '未知'}`)
          console.log(`验证码: ${realCode}`)
          console.log(`有效期: 5分钟`)
          console.log(`=================================\n`)
        }
        
        // 开始倒计时
        setCountdown(60)
      } else {
        // API调用成功但返回失败状态
        setValidationError('发送验证码失败')
      }
    } catch (error: any) {
      console.error('Failed to send SMS:', error)
      // 显示错误信息
      const errorMsg = error.response?.data?.error || '发送验证码失败，请重试'
      setValidationError(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // 清除之前的错误
    setValidationError('')
    
    // 客户端验证
    if (!idCardLast4 || idCardLast4.trim() === '') {
      setValidationError('请输入登录账号绑定的证件号后4位')
      return
    }
    
    if (idCardLast4.length !== 4) {
      setValidationError('请输入登录账号绑定的证件号后4位')
      return
    }
    
    if (!code || code.trim() === '') {
      setValidationError('请输入验证码')
      return
    }
    
    if (code.length < 6) {
      setValidationError('请输入正确的验证码')
      return
    }
    
    onSubmit({ idCardLast4, code })
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  // 判断发送按钮是否可用
  const isSendButtonDisabled = idCardLast4.length < 4 || countdown > 0 || isLoading

  return (
    <div className="sms-modal-backdrop" onClick={handleBackdropClick}>
      <div className="sms-modal">
        <div className="sms-modal-header">
          <span className="modal-title">选择验证方式</span>
          <button className="close-button" onClick={onClose} type="button">
            ×
          </button>
        </div>
        
        <div className="verification-type">
          短信验证
        </div>
        
        <form className="sms-modal-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              placeholder="请输入登录账号绑定的证件号后4位"
              value={idCardLast4}
              onChange={(e) => {
                // 允许输入数字和字母（身份证最后一位可能是X），并转为大写
                const value = e.target.value.replace(/[^0-9a-zA-Z]/g, '').slice(0, 4).toUpperCase()
                setIdCardLast4(value)
                setValidationError('')
              }}
              maxLength={4}
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <div className="code-input-group">
              <input
                type="text"
                placeholder="输入验证码"
                value={code}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                  setCode(value)
                  setValidationError('')
                }}
                maxLength={6}
                className="form-input code-input"
              />
              <button
                type="button"
                className={`send-code-button ${isSendButtonDisabled ? 'disabled' : ''}`}
                onClick={handleSendCode}
                disabled={isSendButtonDisabled}
              >
                {countdown > 0 
                  ? `重新发送(${countdown}s)` 
                  : isLoading 
                  ? '发送中...' 
                  : '获取验证码'}
              </button>
            </div>
          </div>
          
          {(validationError || externalError) && (
            <div className="sms-verification-error-message">{externalError || validationError}</div>
          )}
          
          {externalSuccess && (
            <div className="success-message">{externalSuccess}</div>
          )}
          
          <button type="submit" className="confirm-button">
            确定
          </button>
        </form>
      </div>
    </div>
  )
}

export default SmsVerificationModal

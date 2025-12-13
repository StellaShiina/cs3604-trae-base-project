import React, { useState, useEffect } from 'react'
import './LoginForm.css'

interface LoginFormProps {
  onSubmit: (data: { identifier?: string; username?: string; password: string }) => void
  onQrLogin?: () => void
  onRegister?: () => void
  onForgotPassword?: () => void
  onRegisterClick?: () => void
  onForgotPasswordClick?: () => void
  isLoading?: boolean
  error?: string
}

const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  onQrLogin,
  onRegister,
  onForgotPassword,
  onRegisterClick,
  onForgotPasswordClick,
  isLoading = false,
  error
}) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginType, setLoginType] = useState<'account' | 'qr'>('account')
  const [validationError, setValidationError] = useState('')

  // 当有error时清空密码字段
  useEffect(() => {
    if (error) {
      setPassword('')
    }
  }, [error])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // 清除之前的验证错误
    setValidationError('')
    
    if (loginType === 'account') {
      // 客户端验证
      if (!username || username.trim() === '') {
        setValidationError('请输入用户名！')
        return
      }
      
      if (!password || password.trim() === '') {
        setValidationError('请输入密码！')
        return
      }
      
      if (password.length < 6) {
        setValidationError('密码长度不能少于6位！')
        return
      }
      
      // 传递identifier和password
      onSubmit({ identifier: username, password })
    } else if (loginType === 'qr' && onQrLogin) {
      onQrLogin()
    }
  }

  return (
    <div className="login-form-container">
      <div className="login-tabs">
        <button 
          className={`tab-button ${loginType === 'account' ? 'active' : ''}`}
          onClick={() => setLoginType('account')}
        >
          账号登录
        </button>
        <button 
          className={`tab-button ${loginType === 'qr' ? 'active' : ''}`}
          onClick={() => setLoginType('qr')}
        >
          扫码登录
        </button>
      </div>

      <form className="login-form" onSubmit={handleSubmit} role="form">
        {(error || validationError) && (
          <div className="error-message">{validationError || error}</div>
        )}
        
        {loginType === 'account' && (
          <>
            <div className="form-group">
              <input
                type="text"
                placeholder="用户名/邮箱/手机号"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="form-input"
                disabled={isLoading}
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                placeholder="密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                disabled={isLoading}
              />
            </div>
          </>
        )}

        {loginType === 'qr' && (
          <div className="qr-login-area">
            <div className="qr-code-container">
              <img 
                src="/images/qr-code.png" 
                alt="扫码登录" 
                className="qr-code-image"
              />
              <div className="qr-instructions">
                <p>打开铁路12306手机APP</p>
                <p>扫描二维码登录</p>
              </div>
            </div>
          </div>
        )}

        {loginType !== 'qr' && (
          <button 
            type="submit" 
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? '登录中...' : '立即登录'}
          </button>
        )}

        <div className="form-links">
          <button type="button" className="link-button" onClick={onRegisterClick || onRegister}>
            注册12306账户
          </button>
          <button type="button" className="link-button forgot-password-link" onClick={onForgotPasswordClick || onForgotPassword}>
            忘记密码？
          </button>
        </div>
      </form>
    </div>
  )
}

export default LoginForm
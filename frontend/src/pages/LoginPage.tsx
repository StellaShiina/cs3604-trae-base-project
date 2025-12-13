import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import TopNavigation from '../components/TopNavigation'
import LoginForm from '../components/LoginForm'
import BottomNavigation from '../components/BottomNavigation'
import SmsVerificationModal from '../components/SmsVerificationModal'
import '../components/LoginPage.css'

const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const [showSmsModal, setShowSmsModal] = useState(false)
  const [sessionId, setSessionId] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [smsError, setSmsError] = useState('')
  const [smsSuccess, setSmsSuccess] = useState('')

  const handleLoginSuccess = async (data: { identifier?: string; username?: string; password: string }) => {
    setIsLoading(true)
    setError('')
    
    try {
      // 调用登录API（支持identifier或username）
      const response = await axios.post('/api/auth/login', {
        identifier: data.identifier || data.username,
        password: data.password
      })
      
      if (response.data.success) {
        // 保存sessionId并显示验证弹窗
        setSessionId(response.data.sessionId)
        setShowSmsModal(true)
        console.log('Login data:', response.data.sessionId)
      }
    } catch (error: any) {
      console.error('Login error:', error)
      setError(error.response?.data?.error || '登录失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  const handleNavigateToRegister = () => {
    navigate('/register')
  }

  const handleNavigateToForgotPassword = () => {
    navigate('/forgot-password')
  }

  const handleNavigateToHome = () => {
    navigate('/')
  }

  // const handleSmsVerificationSuccess = () => {
  //   // TODO: 实现短信验证成功后的逻辑
  //   console.log('SMS verification success')
  //   setShowSmsModal(false)
  // }

  const handleCloseSmsModal = () => {
    setShowSmsModal(false)
    setSmsError('')
    setSmsSuccess('')
  }

  const handleSmsVerificationSubmit = async (data: { idCardLast4: string; code: string }) => {
    // 清除之前的消息
    setSmsError('')
    setSmsSuccess('')
    
    try {
      // 调用验证登录API
      const response = await axios.post('/api/auth/verify-login', {
        sessionId,
        idCardLast4: data.idCardLast4,
        verificationCode: data.code
      })
      
      if (response.data.success || response.data.token) {
        console.log('SMS verification success:', response.data)
        
        // 保存token到localStorage
        const token = response.data.token
        if (token) {
          localStorage.setItem('authToken', token)
          localStorage.setItem('userId', response.data.user?.id || response.data.userId || '')
          localStorage.setItem('username', response.data.user?.name || response.data.user?.username || '')
        }
        
        setSmsSuccess('登录成功！正在跳转...')
        
        // 2秒后关闭弹窗并跳转到首页
        setTimeout(() => {
          setShowSmsModal(false)
          navigate('/')
        }, 2000)
      }
    } catch (error: any) {
      console.error('SMS verification error:', error)
      console.log('错误响应数据:', error.response?.data)
      console.log('错误状态码:', error.response?.status)
      const errorMsg = error.response?.data?.error || '验证失败，请重试'
      console.log('最终显示的错误信息:', errorMsg)
      // 直接显示后端返回的错误信息
      setSmsError(errorMsg)
    }
  }

  return (
    <div className="login-page">
      <TopNavigation onLogoClick={handleNavigateToHome} showWelcomeLogin={true} />
      
      <div className="login-content">
        <div className="login-promotion">
          <h1 className="promotion-title">
            铁路12306 - 中国铁路官方APP
          </h1>
          <h2 className="promotion-subtitle">
            尽享精彩出行服务
          </h2>
          
          <ul className="promotion-features">
            <li>个人行程提醒</li>
            <li>积分兑换</li>
            <li>餐饮·特产</li>
            <li>车站大屏</li>
          </ul>
          
          <div className="app-download">
            <div className="qr-code-section">
              <img src="/images/铁路12306二维码.png" alt="铁路12306二维码" />
              <div className="qr-code-text">
                扫描左侧二维码<br />
                安装 铁路12306
              </div>
            </div>
          </div>
        </div>
        
        <div className="login-form-container">
          <LoginForm
            onSubmit={handleLoginSuccess}
            onQrLogin={() => console.log('QR login')}
            onRegisterClick={handleNavigateToRegister}
            onForgotPasswordClick={handleNavigateToForgotPassword}
            error={error}
            isLoading={isLoading}
          />
        </div>
      </div>
      
      <BottomNavigation />
      
      {showSmsModal && sessionId && (
        <SmsVerificationModal
          sessionId={sessionId}
          onClose={handleCloseSmsModal}
          onSubmit={handleSmsVerificationSubmit}
          externalError={smsError}
          externalSuccess={smsSuccess}
        />
      )}
    </div>
  )
}

export default LoginPage
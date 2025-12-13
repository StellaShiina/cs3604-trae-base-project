import React from 'react'
import { Link } from 'react-router-dom'
import './TopNavigation.css'

interface TopNavigationProps {
  onLogoClick?: () => void
  showWelcomeLogin?: boolean  // 是否显示"欢迎登录12306"（用于登录页面）
}

const TopNavigation: React.FC<TopNavigationProps> = ({ onLogoClick, showWelcomeLogin = false }) => {
  const handleLogoClick = () => {
    if (onLogoClick) {
      onLogoClick()
    }
  }

  return (
    <div className="top-navigation">
      <div className="logo-section">
        <div onClick={handleLogoClick}>
          <img 
            src="/images/logo.png" 
            alt="中国铁路12306" 
            className="logo-image"
          />
          <div className="logo-text">
            <div className="logo-chinese">中国铁路12306</div>
            <div className="logo-english">12306 CHINA RAILWAY</div>
          </div>
          {showWelcomeLogin && (
            <div className="welcome-login-text">欢迎登录12306</div>
          )}
        </div>
        {!showWelcomeLogin && (
          <div className="welcome-section">
            <span className="welcome-text">
              您好，请<Link to="/login" className="login-link">登录</Link>
            </span>
            <Link to="/register" className="register-link">注册</Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default TopNavigation
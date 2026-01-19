import React from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import './LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();

  const handleLoginSuccess = (user) => {
    navigate('/');
  };

  return (
    <div className="login-page">
      {/* Header */}
      <header className="login-header">
        <div className="header-content">
          <div className="brand">
            <div className="logo-icon-circle"></div>
            <div className="brand-text">
              <div className="cn">中国铁路12306</div>
              <div className="en">12306 CHINA RAILWAY</div>
            </div>
          </div>
          <div className="page-title">欢迎登录12306</div>
        </div>
      </header>

      {/* Hero / Main Area */}
      <div className="login-hero">
        <div className="hero-content">
          {/* Left Marketing */}
          <div className="marketing-block">
            <div className="market-title">铁路12306 - 中国铁路官方APP</div>
            <div className="market-subtitle">尽享精彩出行服务</div>
            
            <div className="feature-list">
              <div className="feature-item">✓ 个人行程提醒</div>
              <div className="feature-item">✓ 积分兑换</div>
              <div className="feature-item">✓ 餐饮·特产</div>
              <div className="feature-item">✓ 车站大屏</div>
            </div>
          </div>

          {/* Right Login Card */}
          <LoginForm onSuccess={handleLoginSuccess} />
        </div>
      </div>

      {/* Footer (Simplified) */}
      <footer className="login-footer">
        <div className="footer-links">
          友情链接 | 中国铁路官方微信 | 中国铁路官方微博
        </div>
        <div className="copyright">
          版权所有©2008-2025 中国铁道科学研究院集团有限公司
        </div>
      </footer>
    </div>
  );
};

export default LoginPage;

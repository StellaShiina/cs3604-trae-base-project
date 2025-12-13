import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HomeTopBar from '../components/HomeTopBar';
import MainNavigation from '../components/MainNavigation';
import BottomNavigation from '../components/BottomNavigation';
import PhoneRecoveryFlow from '../components/ForgotPassword/PhoneRecoveryFlow';
import './ForgotPasswordPage.css';

/**
 * 密码找回页面
 */
const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'face' | 'phone' | 'email'>('phone');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    setIsLoggedIn(!!token);
  }, []);

  const handleNavigateToHome = () => {
    navigate('/');
  };

  const handleNavigateToLogin = () => {
    navigate('/login');
  };

  const handleNavigateToRegister = () => {
    navigate('/register');
  };

  const handleNavigateToPersonalCenter = () => {
    if (isLoggedIn) {
      navigate('/personal-info');
    } else {
      navigate('/login');
    }
  };

  const handleMy12306Click = () => {
    if (isLoggedIn) {
      navigate('/personal-info');
    } else {
      navigate('/login');
    }
  };

  const username = isLoggedIn ? (localStorage.getItem('username') || localStorage.getItem('userId') || '用户') : '';

  return (
    <div className="forgot-password-page">
      <HomeTopBar 
        isLoggedIn={isLoggedIn} 
        username={username} 
        onMy12306Click={handleMy12306Click} 
      />
      <MainNavigation
        isLoggedIn={isLoggedIn}
        onLoginClick={handleNavigateToLogin}
        onRegisterClick={handleNavigateToRegister}
        onPersonalCenterClick={handleNavigateToPersonalCenter}
      />
      
      <div className="forgot-password-content">
        <div className="recovery-tabs">
          <button
            className={`recovery-tab ${activeTab === 'face' ? 'active' : ''}`}
            onClick={() => setActiveTab('face')}
          >
            <span className="tab-icon">👤</span>
            <span className="tab-text">人脸找回</span>
          </button>
          <button
            className={`recovery-tab ${activeTab === 'phone' ? 'active' : ''}`}
            onClick={() => setActiveTab('phone')}
          >
            <span className="tab-icon">📱</span>
            <span className="tab-text">手机找回</span>
          </button>
          <button
            className={`recovery-tab ${activeTab === 'email' ? 'active' : ''}`}
            onClick={() => setActiveTab('email')}
          >
            <span className="tab-icon">✉️</span>
            <span className="tab-text">邮箱找回</span>
          </button>
        </div>

        <div className="recovery-content-area">
          {activeTab === 'phone' && <PhoneRecoveryFlow />}
          {activeTab === 'face' && (
            <div className="placeholder-content">
              <p>人脸找回功能暂未开放</p>
            </div>
          )}
          {activeTab === 'email' && (
            <div className="placeholder-content">
              <p>邮箱找回功能暂未开放</p>
            </div>
          )}
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default ForgotPasswordPage;


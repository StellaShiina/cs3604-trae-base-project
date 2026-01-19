import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api';
import './LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const [loginType, setLoginType] = useState('account'); // account | scan
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const res = await login(formData);
      if (res.success) {
        // Store token if needed, for now just redirect
        navigate('/');
      } else {
        setError(res.error?.message || '登录失败');
      }
    } catch (err) {
      setError('登录请求失败，请稍后重试');
    }
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
          <div className="login-card">
            <div className="card-tabs">
              <div 
                className={`card-tab ${loginType === 'account' ? 'active' : ''}`}
                onClick={() => setLoginType('account')}
              >
                账号登录
              </div>
              <div className="tab-divider"></div>
              <div 
                className={`card-tab ${loginType === 'scan' ? 'active' : ''}`}
                onClick={() => setLoginType('scan')}
              >
                扫码登录
              </div>
            </div>

            {loginType === 'account' ? (
              <form className="login-form" onSubmit={handleSubmit}>
                <div className="input-group">
                  <input 
                    type="text" 
                    name="username"
                    placeholder="用户名/邮箱/手机号" 
                    value={formData.username}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="input-group">
                  <input 
                    type="password" 
                    name="password"
                    placeholder="密码" 
                    value={formData.password}
                    onChange={handleInputChange}
                  />
                </div>

                {error && <div className="error-msg">{error}</div>}

                <button type="submit" className="login-btn">立即登录</button>

                <div className="card-links">
                  <a href="/register">注册12306账号</a>
                  <span className="link-sep">|</span>
                  <a href="/forgot-password">忘记密码？</a>
                </div>
              </form>
            ) : (
              <div className="scan-placeholder">
                <div className="qr-box">QR Code Here</div>
                <p>打开手机12306扫一扫登录</p>
              </div>
            )}

            <div className="card-footer-text">
              铁路12306每日5:00至次日1:00（周二为5:00至24:00）提供购票、改签、变更到站业务办理，全天均可办理退票等其他服务。
            </div>
          </div>
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

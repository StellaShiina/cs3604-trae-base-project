import React, { useState, useEffect } from 'react';
import { loginVerify, sendLoginSms } from '../api';
import '../pages/LoginPage.css';

const LoginForm = ({ onSuccess, className = '' }) => {
  const [loginType, setLoginType] = useState('account'); // account | scan
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  
  // 2FA State
  const [show2FA, setShow2FA] = useState(false);
  const [twoFaData, setTwoFaData] = useState({ idLast4: '', code: '' });
  const [countdown, setCountdown] = useState(0);
  const [twoFaError, setTwoFaError] = useState('');

  // Timer for 2FA
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handle2FaChange = (e) => {
    const { name, value } = e.target;
    setTwoFaData(prev => ({ ...prev, [name]: value }));
  };

  const handleInitialSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!formData.username || !formData.password) {
        setError('请输入用户名和密码');
        return;
    }
    // Open 2FA Modal
    setShow2FA(true);
    setTwoFaError('');
  };

  const handleSendCode = async () => {
    if (countdown > 0) return;
    try {
        const res = await sendLoginSms(formData.username);
        if (res.success) {
            setCountdown(60);
        } else {
            setTwoFaError(res.error?.message || '验证码发送失败');
        }
    } catch (err) {
        setTwoFaError('网络错误');
    }
  };

  const handleFinalSubmit = async () => {
    setTwoFaError('');
    try {
      const res = await loginVerify({
          loginId: formData.username,
          password: formData.password,
          idLast4: twoFaData.idLast4,
          code: twoFaData.code
      });

      if (res.success) {
        // Persist Login State
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        localStorage.setItem('username', res.data.user.username);
        localStorage.setItem('userId', res.data.user.id);
        
        if (onSuccess) {
            onSuccess(res.data.user);
        }
      } else {
        setTwoFaError(res.error?.message || '登录失败');
      }
    } catch (err) {
      setTwoFaError('登录请求失败');
    }
  };

  return (
    <>
    <div className={`login-card ${className}`}>
      <div className="card-tabs" role="tablist">
        <div 
          className={`card-tab ${loginType === 'account' ? 'active' : ''}`}
          onClick={() => setLoginType('account')}
          role="tab"
          aria-selected={loginType === 'account'}
        >
          账号登录
        </div>
        <div className="tab-divider"></div>
        <div 
          className={`card-tab ${loginType === 'scan' ? 'active' : ''}`}
          onClick={() => setLoginType('scan')}
          role="tab"
          aria-selected={loginType === 'scan'}
        >
          扫码登录
        </div>
      </div>

      {loginType === 'account' ? (
        <form className="login-form" onSubmit={handleInitialSubmit}>
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
          <p>打开手机12306APP扫码登录</p>
        </div>
      )}

      <div className="card-footer-text">
        铁路12306每日5:00至次日1:00（周二为5:00至24:00）提供购票、改签、变更到站业务办理，全天均可办理退票等其他服务。
      </div>
    </div>

    {/* 2FA Modal */}
    {show2FA && (
        <div className="login-2fa-modal-overlay">
            <div className="login-2fa-modal">
                <div className="modal-header">
                    <h3>安全验证</h3>
                    <button className="close-btn" onClick={() => setShow2FA(false)}>×</button>
                </div>
                <div className="modal-body">
                    <p>为了您的账户安全，请进行短信验证</p>
                    
                    <div className="input-row">
                        <input 
                           type="text" 
                           name="idLast4"
                           placeholder="请输入证件号后四位" 
                           value={twoFaData.idLast4}
                           onChange={handle2FaChange}
                        />
                    </div>
                    <div className="input-row verify-row">
                        <input 
                           type="text" 
                           name="code"
                           placeholder="验证码" 
                           value={twoFaData.code}
                           onChange={handle2FaChange}
                        />
                        <button 
                           type="button" 
                           className="code-btn" 
                           onClick={handleSendCode}
                           disabled={countdown > 0}
                        >
                            {countdown > 0 ? `${countdown}秒后重发` : '获取验证码'}
                        </button>
                    </div>

                    {twoFaError && <div className="error-msg">{twoFaError}</div>}

                    <button className="confirm-btn" onClick={handleFinalSubmit}>确定</button>
                </div>
            </div>
        </div>
    )}
    </>
  );
};

export default LoginForm;

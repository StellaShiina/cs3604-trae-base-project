import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const [loginMethod, setLoginMethod] = useState('account'); // 'account' or 'qrcode'
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [hasSent, setHasSent] = useState(false);
  
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const [verifyData, setVerifyData] = useState({
    idLast4: '',
    smsCode: ''
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleVerifyChange = (e) => {
    setVerifyData({ ...verifyData, [e.target.name]: e.target.value });
  };

  const handleInitialSubmit = (e) => {
    e.preventDefault();
    if (!formData.username || !formData.password) {
      setError('请输入用户名和密码');
      return;
    }
    // In a real app, we might validate the user first here, 
    // but per requirements, we just show the modal.
    setError('');
    setShowModal(true);
  };

  const handleFinalSubmit = async () => {
    try {
      const payload = {
        ...formData,
        ...verifyData
      };
      const response = await axios.post('/api/auth/login', payload);
      if (response.data.code === 200) {
        // Success
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('username', response.data.data.username);
        localStorage.setItem('userId', response.data.data.userId);
        // Force a storage event or custom event if needed, but for now simple navigation is enough
        // as Header will mount fresh on full page loads, but strictly speaking SPA navigation
        // might not re-mount Header if it's outside the Routes. 
        // Let's assume Header checks localStorage on mount/update.
        // To be safe, dispatch a custom event for immediate UI update if Header doesn't unmount.
        window.dispatchEvent(new Event('storage'));
        
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || '登录失败');
    }
  };

  const sendSmsCode = async () => {
    if (countdown > 0) return;
    
    // Start countdown immediately for UX
    setCountdown(60);
    setHasSent(true);

    // Mock SMS send
    try {
      await axios.post('/api/auth/send-sms', { phone: formData.username });
      alert('验证码已发送 (请查看后端控制台)');
    } catch (err) {
      console.error(err);
      // If failed, maybe reset countdown? keeping it simple for now as per requirements
    }
  };

  // Countdown effect
  React.useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  return (
    <div className="login-container">
      <div className="login-tabs">
        <div 
          className={`tab-item ${loginMethod === 'account' ? 'active' : ''}`}
          onClick={() => setLoginMethod('account')}
        >
          账号登录
        </div>
        <div 
          className={`tab-item ${loginMethod === 'qrcode' ? 'active' : ''}`}
          onClick={() => setLoginMethod('qrcode')}
        >
          扫码登录
        </div>
      </div>

      {loginMethod === 'account' ? (
        <form onSubmit={handleInitialSubmit}>
          <div className="form-group">
            <input 
              type="text" 
              name="username" 
              className="form-input" 
              placeholder="用户名/邮箱/手机号" 
              value={formData.username}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <input 
              type="password" 
              name="password" 
              className="form-input" 
              placeholder="密码" 
              value={formData.password}
              onChange={handleInputChange}
            />
          </div>
          {error && <div style={{color: 'red', marginBottom: '10px'}}>{error}</div>}
          <button type="submit" className="login-btn">立即登录</button>
          
          <div className="links">
            <Link to="/register">注册12306账号</Link>
            <Link to="/forgot-password">忘记密码</Link>
          </div>
        </form>
      ) : (
        <div className="qr-placeholder">
          <div>二维码占位区域</div>
          <p>请使用12306APP扫码登录</p>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">安全验证</h3>
            <div className="form-group">
              <input 
                type="text" 
                name="idLast4" 
                className="form-input" 
                placeholder="请输入登录账号绑定的证件号后4位" 
                value={verifyData.idLast4}
                onChange={handleVerifyChange}
              />
            </div>
            <div className="form-group verify-row">
              <input 
                type="text" 
                name="smsCode" 
                className="form-input" 
                placeholder="短信验证码" 
                value={verifyData.smsCode}
                onChange={handleVerifyChange}
              />
              <button 
                type="button" 
                className="verify-btn" 
                onClick={sendSmsCode}
                disabled={countdown > 0}
              >
                {countdown > 0 ? `重新发送(${countdown}s)` : (hasSent ? '重新发送' : '获取验证码')}
              </button>
            </div>
            <button type="button" className="login-btn" onClick={handleFinalSubmit}>提交验证</button>
            <button 
              type="button" 
              style={{marginTop: '10px', width: '100%', background: '#ccc', border: 'none', padding: '10px'}}
              onClick={() => setShowModal(false)}
            >
              取消
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;

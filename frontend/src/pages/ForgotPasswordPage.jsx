import React, { useState } from 'react';
import './ForgotPasswordPage.css';
import Header from '../components/Header';
import { verifyUserForReset, sendForgotSms, resetPassword } from '../api';

const ForgotPasswordPage = () => {
  const [activeTab, setActiveTab] = useState('phone');
  const [step, setStep] = useState(0); // 0: Verify User, 1: Verify Code, 2: Reset Password, 3: Success
  const [formData, setFormData] = useState({
    phone: '',
    idType: '中国居民身份证',
    idNumber: '',
    code: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleVerifyUser = async () => {
    try {
      setLoading(true);
      const res = await verifyUserForReset({
        phone: formData.phone,
        idType: formData.idType,
        idNumber: formData.idNumber
      });
      
      if (res.success) {
        setStep(1);
      } else {
        setError(res.error?.message || '验证失败');
      }
    } catch (err) {
      setError('系统错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleSendCode = async () => {
    if (countdown > 0) return;
    try {
      const res = await sendForgotSms(formData.phone);
      if (res.success) {
        setCountdown(60);
        const timer = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setError(res.error?.message || '发送失败');
      }
    } catch (err) {
      setError('发送失败');
    }
  };

  const handleVerifyCode = () => {
    if (!formData.code) {
        setError('请输入验证码');
        return;
    }
    setStep(2);
  };

  const handleResetPassword = async () => {
    if (formData.newPassword !== formData.confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }
    if (!formData.newPassword) {
        setError('请输入新密码');
        return;
    }

    try {
      setLoading(true);
      const res = await resetPassword({
        phone: formData.phone,
        code: formData.code,
        newPassword: formData.newPassword
      });

      if (res.success) {
        setStep(3);
      } else {
        setError(res.error?.message || '重置失败');
      }
    } catch (err) {
      setError('重置失败');
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (activeTab === 'face' || activeTab === 'email') {
      return <div className="placeholder-msg">功能暂未开放</div>;
    }

    // Phone Flow
    switch (step) {
      case 0:
        return (
          <div className="step-form">
            <h3>验证身份信息</h3>
            {error && <div className="error-msg">{error}</div>}
            <div className="input-group">
              <label>手机号</label>
              <input name="phone" value={formData.phone} onChange={handleInputChange} />
            </div>
            <div className="input-group">
              <label>证件类型</label>
              <select name="idType" value={formData.idType} onChange={handleInputChange}>
                <option value="中国居民身份证">中国居民身份证</option>
              </select>
            </div>
            <div className="input-group">
              <label>证件号码</label>
              <input name="idNumber" value={formData.idNumber} onChange={handleInputChange} />
            </div>
            <button onClick={handleVerifyUser} disabled={loading}>
              {loading ? '验证中...' : '下一步'}
            </button>
          </div>
        );
      case 1:
        return (
          <div className="step-form">
            <h3>短信验证</h3>
            {error && <div className="error-msg">{error}</div>}
            <div className="input-group">
              <label>短信验证码</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input name="code" value={formData.code} onChange={handleInputChange} style={{ flex: 1 }} />
                <button 
                  onClick={handleSendCode} 
                  disabled={countdown > 0}
                  style={{ width: '120px', padding: '0' }}
                >
                  {countdown > 0 ? `${countdown}s` : '获取验证码'}
                </button>
              </div>
            </div>
            <button onClick={handleVerifyCode}>下一步</button>
          </div>
        );
      case 2:
        return (
          <div className="step-form">
            <h3>设置新密码</h3>
            {error && <div className="error-msg">{error}</div>}
            <div className="input-group">
              <label>新密码</label>
              <input type="password" name="newPassword" value={formData.newPassword} onChange={handleInputChange} />
            </div>
            <div className="input-group">
              <label>确认密码</label>
              <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} />
            </div>
            <button onClick={handleResetPassword} disabled={loading}>
              {loading ? '提交中...' : '确定'}
            </button>
          </div>
        );
      case 3:
        return (
          <div className="step-success">
            <h3>重置成功</h3>
            <p>您的密码已重置，请重新登录。</p>
            <a href="/login" className="login-link">去登录</a>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="forgot-password-page">
      <Header />
      <div className="fp-container">
        <h2>找回密码</h2>
        <div className="fp-tabs" role="tablist">
          <div className={`fp-tab ${activeTab === 'phone' ? 'active' : ''}`} onClick={() => setActiveTab('phone')} role="tab">手机找回</div>
          <div className={`fp-tab ${activeTab === 'face' ? 'active' : ''}`} onClick={() => setActiveTab('face')} role="tab">人脸找回</div>
          <div className={`fp-tab ${activeTab === 'email' ? 'active' : ''}`} onClick={() => setActiveTab('email')} role="tab">邮箱找回</div>
        </div>
        <div className="fp-content">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

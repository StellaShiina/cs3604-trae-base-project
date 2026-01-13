import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './ForgotPasswordPage.css';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [method, setMethod] = useState('phone'); // 'phone', 'face', 'email'
  const [step, setStep] = useState(1); // 1: Verify User, 2: SMS Verify, 3: Set New Password, 4: Success
  
  const [formData, setFormData] = useState({
    phone: '',
    idType: '居民身份证',
    idNumber: '',
    smsCode: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleStep1Submit = async (e) => {
    e.preventDefault();
    if (!formData.phone || !formData.idNumber) {
      setError('请填写完整信息');
      return;
    }
    try {
      const response = await axios.post('/api/auth/forgot-password/verify-user', {
        phone: formData.phone,
        idNumber: formData.idNumber,
        idType: formData.idType
      });
      if (response.data.code === 200) {
        setError('');
        setStep(2);
      }
    } catch (err) {
      setError(err.response?.data?.message || '用户信息校验失败');
    }
  };

  const handleStep2Submit = async (e) => {
    e.preventDefault();
    if (!formData.smsCode) {
      setError('请输入验证码');
      return;
    }
    try {
      const response = await axios.post('/api/auth/forgot-password/verify-sms', {
        phone: formData.phone,
        smsCode: formData.smsCode
      });
      if (response.data.code === 200) {
        setError('');
        setStep(3);
      }
    } catch (err) {
      setError(err.response?.data?.message || '验证码错误');
    }
  };

  const handleStep3Submit = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }
    try {
      const response = await axios.post('/api/auth/forgot-password/reset', {
        phone: formData.phone,
        newPassword: formData.newPassword
      });
      if (response.data.code === 200) {
        setError('');
        setStep(4);
      }
    } catch (err) {
      setError(err.response?.data?.message || '重置密码失败');
    }
  };

  const sendSms = async () => {
    try {
      await axios.post('/api/auth/send-sms', { phone: formData.phone });
      alert('验证码已发送');
    } catch (err) {
      console.error(err);
    }
  };

  const renderStepIndicator = () => (
    <div className="step-indicator">
      <div className={`step-item ${step >= 1 ? 'active' : ''}`}>
        <div className="step-number">1</div>
        <div className="step-text">填写账号</div>
      </div>
      <div className={`step-item ${step >= 2 ? 'active' : ''}`}>
        <div className="step-number">2</div>
        <div className="step-text">短信验证</div>
      </div>
      <div className={`step-item ${step >= 3 ? 'active' : ''}`}>
        <div className="step-number">3</div>
        <div className="step-text">设置新密码</div>
      </div>
      <div className={`step-item ${step >= 4 ? 'active' : ''}`}>
        <div className="step-number">4</div>
        <div className="step-text">完成</div>
      </div>
    </div>
  );

  return (
    <div className="forgot-password-container">
      <h2 className="forgot-password-title">找回密码</h2>
      
      <div className="method-tabs">
        <div className={`method-tab ${method === 'phone' ? 'active' : ''}`} onClick={() => setMethod('phone')}>手机找回</div>
        <div className={`method-tab ${method === 'face' ? 'active' : ''}`} onClick={() => setMethod('face')}>人脸找回</div>
        <div className={`method-tab ${method === 'email' ? 'active' : ''}`} onClick={() => setMethod('email')}>邮箱找回</div>
      </div>

      {method === 'phone' ? (
        <div className="step-container">
          {renderStepIndicator()}
          
          {error && <div style={{color: 'red', marginBottom: '20px', textAlign: 'center'}}>{error}</div>}

          {step === 1 && (
            <form onSubmit={handleStep1Submit}>
              <div className="form-group">
                <label className="form-label">手机号码：</label>
                <input type="text" name="phone" className="form-input" value={formData.phone} onChange={handleInputChange} placeholder="请输入手机号码" />
              </div>
              <div className="form-group">
                <label className="form-label">证件类型：</label>
                <select name="idType" className="form-input" value={formData.idType} onChange={handleInputChange}>
                  <option value="居民身份证">居民身份证</option>
                  <option value="港澳居民来往内地通行证">港澳居民来往内地通行证</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">证件号码：</label>
                <input type="text" name="idNumber" className="form-input" value={formData.idNumber} onChange={handleInputChange} placeholder="请输入证件号码" />
              </div>
              <button type="submit" className="submit-btn">提交校验</button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleStep2Submit}>
              <div className="form-group">
                <label className="form-label">手机号码：</label>
                <input type="text" className="form-input" value={formData.phone} disabled />
              </div>
              <div className="form-group verify-row">
                <input type="text" name="smsCode" className="form-input" value={formData.smsCode} onChange={handleInputChange} placeholder="短信验证码" />
                <button type="button" className="submit-btn" style={{width: 'auto', padding: '0 20px', margin: 0}} onClick={sendSms}>获取验证码</button>
              </div>
              <button type="submit" className="submit-btn">验证</button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleStep3Submit}>
              <div className="form-group">
                <label className="form-label">新密码：</label>
                <input type="password" name="newPassword" className="form-input" value={formData.newPassword} onChange={handleInputChange} placeholder="请输入新密码" />
              </div>
              <div className="form-group">
                <label className="form-label">确认新密码：</label>
                <input type="password" name="confirmPassword" className="form-input" value={formData.confirmPassword} onChange={handleInputChange} placeholder="请再次输入新密码" />
              </div>
              <button type="submit" className="submit-btn">重置密码</button>
            </form>
          )}

          {step === 4 && (
            <div className="success-page">
              <div className="success-icon">✓</div>
              <h3 className="success-title">密码重置成功</h3>
              <p className="success-text">您的密码已成功重置，请妥善保管。</p>
              <Link to="/login" className="back-to-login">立即登录</Link>
            </div>
          )}
        </div>
      ) : (
        <div className="not-available">
          功能暂未开放
        </div>
      )}
    </div>
  );
};

export default ForgotPasswordPage;

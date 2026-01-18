import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/index';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Info, 2: SMS, 3: Password, 4: Success
  const [formData, setFormData] = useState({
    phone: '',
    idType: '1',
    idNumber: '',
    smsCode: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [countdown, setCountdown] = useState(0);

  // Render skeleton
  return (
    <div className="forgot-page" style={{ padding: 20 }}>
      <h2>找回密码</h2>
      {step === 1 && (
        <div className="step-1">
          <h3>1. 身份核验</h3>
          <input placeholder="手机号码" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
          <select value={formData.idType} onChange={e => setFormData({...formData, idType: e.target.value})}>
             <option value="1">居民身份证</option>
          </select>
          <input placeholder="证件号码" value={formData.idNumber} onChange={e => setFormData({...formData, idNumber: e.target.value})} />
          <button>下一步</button>
        </div>
      )}
      
      {step === 2 && (
        <div className="step-2">
          <h3>2. 短信验证</h3>
          <input placeholder="验证码" value={formData.smsCode} onChange={e => setFormData({...formData, smsCode: e.target.value})} />
          <button>获取验证码</button>
          <button>下一步</button>
        </div>
      )}

      {step === 3 && (
        <div className="step-3">
          <h3>3. 设置新密码</h3>
          <input placeholder="新密码" type="password" value={formData.newPassword} onChange={e => setFormData({...formData, newPassword: e.target.value})} />
          <input placeholder="确认密码" type="password" value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} />
          <button>确定</button>
        </div>
      )}

      {step === 4 && (
        <div className="step-4">
          <h3>重置成功</h3>
          <p>您的密码已重置成功。</p>
          <button onClick={() => navigate('/login')}>去登录</button>
        </div>
      )}
    </div>
  );
};

export default ForgotPassword;

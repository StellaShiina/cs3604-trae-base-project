import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleStep1 = async () => {
    if (!formData.phone || !formData.idNumber) {
      alert('请填写完整信息');
      return;
    }
    try {
      const res = await fetch('http://localhost:3000/api/v1/auth/verify-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: formData.phone,
          idType: formData.idType,
          idNumber: formData.idNumber
        })
      });
      const data = await res.json();
      if (data.code === 0) {
        setStep(2);
      } else {
        alert(data.message);
      }
    } catch (e) {
      alert('校验失败');
    }
  };

  const handleGetCode = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/v1/auth/send-forgot-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formData.phone })
      });
      const data = await res.json();
      if (data.code === 0) {
        setCountdown(60);
      } else {
        alert(data.message);
      }
    } catch (e) {
      alert('发送失败');
    }
  };

  const handleStep2 = () => {
    if (!formData.smsCode) {
      alert('请输入验证码');
      return;
    }
    // Assume verification happens at final step or client side check for now
    setStep(3);
  };

  const handleStep3 = async () => {
    if (!formData.newPassword || !formData.confirmPassword) {
      alert('请输入新密码');
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      alert('密码不一致');
      return;
    }
    try {
      const res = await fetch('http://localhost:3000/api/v1/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: formData.phone,
          smsCode: formData.smsCode,
          newPassword: formData.newPassword
        })
      });
      const data = await res.json();
      if (data.code === 0) {
        setStep(4);
      } else {
        alert(data.message);
      }
    } catch (e) {
      alert('重置失败');
    }
  };

  return (
    <div className="forgot-page" style={{ padding: 20, maxWidth: 400, margin: '0 auto' }}>
      <h2>找回密码</h2>
      <div className="tabs" style={{ display: 'flex', marginBottom: 20, borderBottom: '1px solid #ccc' }}>
        <div style={{ padding: 10, borderBottom: '2px solid blue', fontWeight: 'bold' }}>手机找回</div>
        <div style={{ padding: 10, color: '#999' }}>人脸找回</div>
        <div style={{ padding: 10, color: '#999' }}>邮箱找回</div>
      </div>

      {step === 1 && (
        <div className="step-1">
          <h3>1. 身份核验</h3>
          <div style={{ marginBottom: 10 }}>
            <input
              placeholder="手机号码"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              style={{ width: '100%', padding: 8 }}
            />
          </div>
          <div style={{ marginBottom: 10 }}>
            <select
              value={formData.idType}
              onChange={e => setFormData({ ...formData, idType: e.target.value })}
              style={{ width: '100%', padding: 8 }}
            >
              <option value="1">居民身份证</option>
            </select>
          </div>
          <div style={{ marginBottom: 10 }}>
            <input
              placeholder="证件号码"
              value={formData.idNumber}
              onChange={e => setFormData({ ...formData, idNumber: e.target.value })}
              style={{ width: '100%', padding: 8 }}
            />
          </div>
          <button onClick={handleStep1} style={{ width: '100%', padding: 10, background: 'orange', color: 'white', border: 'none' }}>下一步</button>
        </div>
      )}
      
      {step === 2 && (
        <div className="step-2">
          <h3>2. 短信验证</h3>
          <div style={{ marginBottom: 10, display: 'flex' }}>
            <button
              onClick={handleGetCode}
              disabled={countdown > 0}
              style={{ marginRight: 10 }}
            >
              {countdown > 0 ? `${countdown}秒后重发` : '获取验证码'}
            </button>
            <input
              placeholder="验证码"
              value={formData.smsCode}
              onChange={e => setFormData({ ...formData, smsCode: e.target.value })}
              style={{ flex: 1, padding: 8 }}
            />
          </div>
          <button onClick={handleStep2} style={{ width: '100%', padding: 10, background: 'orange', color: 'white', border: 'none' }}>下一步</button>
        </div>
      )}

      {step === 3 && (
        <div className="step-3">
          <h3>3. 设置新密码</h3>
          <div style={{ marginBottom: 10 }}>
            <input
              placeholder="新密码"
              type="password"
              value={formData.newPassword}
              onChange={e => setFormData({ ...formData, newPassword: e.target.value })}
              style={{ width: '100%', padding: 8 }}
            />
          </div>
          <div style={{ marginBottom: 10 }}>
            <input
              placeholder="确认密码"
              type="password"
              value={formData.confirmPassword}
              onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
              style={{ width: '100%', padding: 8 }}
            />
          </div>
          <button onClick={handleStep3} style={{ width: '100%', padding: 10, background: 'blue', color: 'white', border: 'none' }}>确定</button>
        </div>
      )}

      {step === 4 && (
        <div className="step-4">
          <h3>重置成功</h3>
          <p>您的密码已重置成功。</p>
          <button onClick={() => navigate('/login')} style={{ padding: 10, background: 'blue', color: 'white', border: 'none' }}>去登录</button>
        </div>
      )}
    </div>
  );
};

export default ForgotPassword;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import './RegisterPage.css';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    realName: '',
    idType: '1', // 1: 居民身份证
    idNumber: '',
    phone: '',
    email: '',
    passengerType: '1' // 1: 成人
  });

  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0); // 0-3
  const [submitStatus, setSubmitStatus] = useState(null);
  const [showSmsModal, setShowSmsModal] = useState(false);
  const [smsCode, setSmsCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();

  // Validation Patterns
  const PATTERNS = {
    username: /^[a-zA-Z][a-zA-Z0-9_]{5,29}$/, // 6-30 chars, start with letter
    password: /.{6,20}/,
    phone: /^1[3-9]\d{9}$/,
    smsCode: /^\d{6}$/,
    idNumber: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
  };

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error on change
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }

    if (name === 'password') {
      calculateStrength(value);
    }
  };

  const calculateStrength = (pwd) => {
    if (!pwd) return setPasswordStrength(0);
    let score = 0;
    if (pwd.length >= 6) score++;
    if (/[A-Za-z]/.test(pwd) && /[0-9]/.test(pwd)) score++;
    if (/[_@$!%*?&]/.test(pwd)) score++;
    setPasswordStrength(Math.min(score, 3));
  };

  const validateField = (name, value) => {
    let error = null;
    switch (name) {
      case 'username':
        if (!value) error = '请输入用户名';
        else if (!PATTERNS.username.test(value)) error = '用户名格式错误';
        break;
      case 'password':
        if (!value) error = '请输入密码';
        else if (value.length < 6) error = '密码长度不足';
        break;
      case 'confirmPassword':
        if (value !== formData.password) error = '两次密码输入不一致';
        break;
      case 'phone':
        if (!PATTERNS.phone.test(value)) error = '手机号码格式错误';
        break;
      case 'smsCode':
        if (!PATTERNS.smsCode.test(value)) error = '验证码必须是6位数字';
        break;
      case 'idNumber':
        if (formData.idType === '1' && !PATTERNS.idNumber.test(value)) error = '身份证号码格式错误';
        break;
      default:
        break;
    }
    return error;
  };

  const handleBlur = async (e) => {
    const { name, value } = e.target;
    let error = validateField(name, value);
    
    console.log(`[DEBUG] Blur: ${name}, Value: ${value}, Error: ${error}`);

    if (name === 'username' && !error && value) {
      try {
        console.log('[DEBUG] Calling check-username...');
        const res = await axios.get(`/api/auth/check-username?username=${value}`);
        console.log('[DEBUG] check-username res:', res.data);
        if (!res.data.available) {
          error = '该用户名已经占用，请重新选择用户名';
        }
      } catch (err) {
        console.error('Failed to check username availability', err);
      }
    }

    if (error) {
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleSendSms = async () => {
    try {
      await axios.post('/api/auth/send-sms', { phone: formData.phone });
      setCountdown(60);
      console.log('SMS sent');
    } catch (err) {
      console.error('Failed to send SMS', err);
      setErrors(prev => ({ ...prev, modal: '发送验证码失败' }));
    }
  };

  const handleInitialSubmit = async (e) => {
    e.preventDefault();
    
    // Validate Terms
    if (!agreed) {
      setErrors(prev => ({ ...prev, terms: '请确定服务条款' }));
      return;
    }

    // Validate all fields
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    // Specific password confirmation check
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '两次输入的密码不一致';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Check if username/id/phone exists (optional but good UX before modal)
    // For now, proceed to modal
    setShowSmsModal(true);
    setErrors({});
  };

  const handleFinalRegister = async () => {
    if (!PATTERNS.smsCode.test(smsCode)) {
      setErrors(prev => ({ ...prev, modal: '验证码必须是6位数字' }));
      return;
    }

    try {
      const payload = { ...formData, smsCode };
      const response = await axios.post('/api/auth/register', payload);
      
      if (response.data.code === 200) {
        setSubmitStatus('success');
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (err) {
      console.error('Registration failed', err);
      if (err.response && err.response.data) {
        const msg = err.response.data.message;
        if (msg.includes('Username')) setErrors(prev => ({ ...prev, username: msg }));
        else if (msg.includes('User already exists')) setErrors(prev => ({ ...prev, idNumber: '该证件号码已被注册' })); // Map general conflict to ID for now or show global
        else setErrors(prev => ({ ...prev, modal: msg || '注册失败' }));
      } else {
        setErrors(prev => ({ ...prev, modal: '注册失败，请稍后重试' }));
      }
    }
  };

  return (
    <div className="register-page-container">
      <Header />
      <div className="register-container">
        <div className="register-header">账户注册</div>
        {submitStatus === 'success' ? (
          <div className="success-message">注册成功！请登录。</div>
        ) : (
          <form className="register-form" onSubmit={handleInitialSubmit}>
            <div className="form-row">
              <label htmlFor="username">用户名：</label>
              <div className="input-wrapper">
                <input 
                  id="username"
                  name="username" 
                  value={formData.username} 
                  onChange={handleChange} 
                  onBlur={handleBlur}
                  placeholder="字母开头，6-30位"
                />
                {errors.username && <span className="validation-message">{errors.username}</span>}
              </div>
            </div>

            <div className="form-row">
              <label htmlFor="password">密码：</label>
              <div className="input-wrapper">
                <input 
                  type="password"
                  id="password"
                  name="password" 
                  value={formData.password} 
                  onChange={handleChange} 
                  onBlur={handleBlur}
                />
                <div className={`password-strength strength-${passwordStrength > 0 ? (passwordStrength === 1 ? 'low' : passwordStrength === 2 ? 'medium' : 'high') : 'none'}`}>
                   <div className="bar" style={{ width: passwordStrength === 0 ? '0%' : passwordStrength === 1 ? '33%' : passwordStrength === 2 ? '66%' : '100%', background: passwordStrength === 1 ? 'red' : passwordStrength === 2 ? 'orange' : 'green' }}></div>
                </div>
                {errors.password && <span className="validation-message">{errors.password}</span>}
              </div>
            </div>

            <div className="form-row">
              <label htmlFor="confirmPassword">确认密码：</label>
              <div className="input-wrapper">
                <input 
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword" 
                  value={formData.confirmPassword} 
                  onChange={handleChange} 
                  onBlur={handleBlur}
                />
                {errors.confirmPassword && <span className="validation-message">{errors.confirmPassword}</span>}
              </div>
            </div>

            <div className="form-row">
              <label htmlFor="realName">姓名：</label>
              <div className="input-wrapper">
                <input 
                  id="realName"
                  name="realName" 
                  value={formData.realName} 
                  onChange={handleChange} 
                  onBlur={handleBlur}
                  placeholder="请输入真实姓名"
                />
              </div>
            </div>

            <div className="form-row">
              <label htmlFor="idType">证件类型：</label>
              <div className="input-wrapper">
                <select id="idType" name="idType" value={formData.idType} onChange={handleChange}>
                  <option value="1">居民身份证</option>
                  <option value="C">港澳台居民居住证</option>
                  <option value="G">护照</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <label htmlFor="idNumber">证件号码：</label>
              <div className="input-wrapper">
                <input 
                  id="idNumber"
                  name="idNumber" 
                  value={formData.idNumber} 
                  onChange={handleChange} 
                  onBlur={handleBlur}
                />
                {errors.idNumber && <span className="validation-message">{errors.idNumber}</span>}
              </div>
            </div>

             <div className="form-row">
              <label htmlFor="phone">手机号码：</label>
              <div className="input-wrapper phone-wrapper">
                <select className="phone-prefix" aria-label="mobile-prefix">
                  <option value="+86">+86 中国</option>
                  <option value="+852">+852 香港</option>
                  <option value="+853">+853 澳门</option>
                  <option value="+886">+886 台湾</option>
                </select>
                <input 
                  id="phone"
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleChange} 
                  onBlur={handleBlur}
                  className="phone-input"
                />
                {errors.phone && <span className="validation-message">{errors.phone}</span>}
              </div>
            </div>

            <div className="form-row">
              <label htmlFor="passengerType">旅客类型：</label>
              <div className="input-wrapper">
                <select id="passengerType" name="passengerType" value={formData.passengerType} onChange={handleChange}>
                  <option value="1">成人</option>
                  <option value="2">儿童</option>
                  <option value="3">学生</option>
                  <option value="4">残疾军人</option>
                </select>
              </div>
            </div>

            <div className="form-row terms-row">
                <div className="input-wrapper" style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <input 
                        type="checkbox" 
                        id="terms" 
                        checked={agreed} 
                        onChange={(e) => setAgreed(e.target.checked)}
                        style={{ width: 'auto', marginRight: '8px' }}
                    />
                    <label htmlFor="terms" style={{ width: 'auto', marginBottom: 0 }}>
                        我已阅读并同意《中国铁路客户服务中心网站服务条款》
                    </label>
                </div>
                {errors.terms && <div className="validation-message" style={{ color: 'red', marginLeft: '120px' }}>{errors.terms}</div>}
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-btn" disabled={submitStatus === 'submitting'}>
                下一步
              </button>
            </div>
          </form>
        )}

        {showSmsModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>手机短信验证</h3>
              <p>验证码将发送至: {formData.phone}</p>
              <div className="form-row">
                <input
                  type="text"
                  value={smsCode}
                  onChange={(e) => setSmsCode(e.target.value)}
                  placeholder="请输入6位验证码"
                  className="sms-input-modal"
                />
                <button
                  type="button"
                  className="send-sms-btn"
                  onClick={handleSendSms}
                  disabled={countdown > 0}
                >
                  {countdown > 0 ? `${countdown}s` : '获取验证码'}
                </button>
              </div>
              {errors.modal && <div className="error-message">{errors.modal}</div>}
              <div className="modal-actions">
                <button onClick={() => setShowSmsModal(false)} className="cancel-btn">取消</button>
                <button onClick={handleFinalRegister} className="confirm-btn">完成注册</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisterPage;

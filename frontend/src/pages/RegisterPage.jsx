import React, { useState, useEffect } from 'react';
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

  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0); // 0-3
  const [submitStatus, setSubmitStatus] = useState(null);

  // Validation Patterns
  const PATTERNS = {
    username: /^[a-zA-Z][a-zA-Z0-9_]{5,29}$/, // 6-30 chars, start with letter
    password: /.{6,20}/,
    phone: /^1[3-9]\d{9}$/,
    idNumber: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
  };

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
      case 'idNumber':
        if (formData.idType === '1' && !PATTERNS.idNumber.test(value)) error = '身份证号码格式错误';
        break;
      default:
        break;
    }
    return error;
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    if (error) {
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate all
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const res = await axios.post('/api/auth/register', formData);
      if (res.data.code === 200) {
        setSubmitStatus('success');
      }
    } catch (err) {
      setSubmitStatus('error: ' + (err.response?.data?.message || err.message));
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
          <form className="register-form" onSubmit={handleSubmit}>
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
              <div className="input-wrapper">
                <input 
                  id="phone"
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleChange} 
                  onBlur={handleBlur}
                />
                {errors.phone && <span className="validation-message">{errors.phone}</span>}
              </div>
            </div>

            <button type="submit" className="submit-btn">注册</button>
            {submitStatus && submitStatus.startsWith('error') && <div className="error-message">{submitStatus}</div>}
          </form>
        )}
      </div>
    </div>
  );
};

export default RegisterPage;

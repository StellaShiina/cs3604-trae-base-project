import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/index';
import Header from '../components/Header';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    name: '',
    idType: '1',
    idNumber: '',
    phone: '',
    smsCode: '',
    agreed: false
  });

  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState('');
  const [countdown, setCountdown] = useState(0);

  // Validation Logic
  const validateUsername = async (value) => {
    if (!value) return;
    console.log('Validating username:', value);
    // Format: 6-30 chars, letter start, letter/num/_
    if (!/^[a-zA-Z][a-zA-Z0-9_]{5,29}$/.test(value)) {
      if (value.length < 6 || value.length > 30) return '6-30位字母、数字或“_”';
      if (!/^[a-zA-Z]/.test(value)) return '必须以字母开头';
      return '只能包含字母、数字或“_”';
    }
    // Check availability via API
    try {
      console.log('Checking API for:', value);
      const res = await apiClient.get(`/v1/auth/check-username?username=${value}`);
      console.log('API Response:', res.data);
      if (res.data.code === 0 && !res.data.data.available) {
        return '用户名已被占用';
      }
    } catch (e) {
      console.error('API Error:', e);
    }
    return '';
  };

  const validatePassword = (value) => {
    if (!value) return;
    if (value.length < 6 || value.length > 20) return '6-20位字母、数字或符号';

    // Check types
    let types = 0;
    if (/[a-zA-Z]/.test(value)) types++;
    if (/[0-9]/.test(value)) types++;
    if (/[^a-zA-Z0-9]/.test(value)) types++;

    if (types < 2) return '必须包含至少两种字符（字母、数字或符号）';

    // Update strength
    if (types === 2) setPasswordStrength('中');
    else if (types >= 3) setPasswordStrength('强');
    else setPasswordStrength('弱');

    return '';
  };

  const validateConfirmPassword = (value) => {
    if (value !== formData.password) return '密码不一致';
    return '';
  };

  const validateIdNumber = (value) => {
    if (formData.idType === '1') {
      // Simple Regex for ID Card (18 digits or 17+X)
      if (!/^\d{17}[\dX]$/.test(value)) return '格式错误';
    }
    return '';
  };

  const validatePhone = (value) => {
    // Simple Regex for China Phone
    if (!/^1[3-9]\d{9}$/.test(value)) return '格式错误';
    return '';
  };

  // Handlers
  const handleBlur = async (field) => {
    let error = '';
    const value = formData[field];

    switch (field) {
      case 'username':
        error = await validateUsername(value);
        break;
      case 'password':
        error = validatePassword(value);
        break;
      case 'confirmPassword':
        error = validateConfirmPassword(value);
        break;
      case 'idNumber':
        error = validateIdNumber(value);
        break;
      case 'phone':
        error = validatePhone(value);
        break;
      default:
        break;
    }
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleChange = (field, value) => {
    if (field === 'password' && value.length > 20) return; // Max length constraint
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error on change? Or wait for blur? Requirement says "光标移开...显示错误". 
    // Real-time checks: "username... no change on input...". 
    // So usually clear error when typing is good UX, but requirement emphasizes blur for errors.
    // However, "password... input length < 6... blur -> error".
    // "password... input 2 types -> strength update". This is real-time.
    if (field === 'password') {
      // Update strength real-time logic (simplified)
      let types = 0;
      if (/[a-zA-Z]/.test(value)) types++;
      if (/[0-9]/.test(value)) types++;
      if (/[^a-zA-Z0-9]/.test(value)) types++;
      if (value.length >= 6 && types >= 2) {
        if (types === 2) setPasswordStrength('中');
        else if (types >= 3) setPasswordStrength('强');
      } else {
        setPasswordStrength('');
      }
    }
  };

  const handleSendCode = async () => {
    if (countdown > 0) return;
    if (!formData.phone || errors.phone) {
      alert('请先填写正确的手机号码');
      return;
    }
    try {
      const url = 'http://localhost:3000/api/v1/auth/send-sms-code';
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formData.phone })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.code === 0) {
          setCountdown(60);
        } else {
          alert(data.message);
        }
      } else {
        alert('发送失败');
      }
    } catch (e) {
      alert('发送失败');
    }
  };

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSubmit = async () => {
    // Final validate
    const newErrors = {};
    newErrors.username = await validateUsername(formData.username);
    newErrors.password = validatePassword(formData.password);
    newErrors.confirmPassword = validateConfirmPassword(formData.confirmPassword);
    newErrors.idNumber = validateIdNumber(formData.idNumber);
    newErrors.phone = validatePhone(formData.phone);

    // Filter empty errors
    const hasError = Object.values(newErrors).some(e => e);
    if (hasError) {
      setErrors(newErrors);
      return;
    }

    if (!formData.agreed) {
      alert('请确定服务条款');
      return;
    }

    try {
      const res = await apiClient.post('/v1/auth/register', formData);
      if (res.data.code === 0) {
        alert('注册成功，跳转到登录页面');
        navigate('/login');
      } else {
        alert(res.data.message);
      }
    } catch (e) {
      alert('注册失败: ' + (e.response?.data?.message || e.message));
    }
  };

  return (
    <div className="register-page" style={{ paddingBottom: 20 }}>
      <Header />
      <div style={{ maxWidth: '920px', margin: '10px auto', border: '1px solid #2F86D9' }}>
        <div style={{ padding: '10px', background: 'linear-gradient(to right, #2F86D9, #1E6FBF)', color: 'white' }}>账户信息</div>
        <form style={{ padding: 20 }}>
          {/* Username */}
        <div className="form-group">
          <label>用户名</label>
          <input 
            type="text" 
            placeholder="用户名设置成功后不可修改" 
            value={formData.username}
            onChange={(e) => handleChange('username', e.target.value)}
            onBlur={() => handleBlur('username')}
          />
          {errors.username && <div style={{ color: 'red' }}>{errors.username}</div>}
        </div>

        {/* Password */}
        <div className="form-group">
          <label>登录密码</label>
          <input 
            type="password" 
            placeholder="6-20位字母、数字或符号" 
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
            onBlur={() => handleBlur('password')}
          />
          {passwordStrength && <span style={{ marginLeft: '10px', color: 'green' }}>强度: {passwordStrength}</span>}
          {errors.password && <div style={{ color: 'red' }}>{errors.password}</div>}
        </div>

        {/* Confirm Password */}
        <div className="form-group">
          <label>确认密码</label>
          <input 
            type="password" 
            placeholder="再次输入您的登录密码" 
            value={formData.confirmPassword}
            onChange={(e) => handleChange('confirmPassword', e.target.value)}
            onBlur={() => handleBlur('confirmPassword')}
          />
          {errors.confirmPassword && <div style={{ color: 'red' }}>{errors.confirmPassword}</div>}
        </div>

        {/* Name */}
        <div className="form-group">
          <label>姓名</label>
          <input 
            type="text" 
            placeholder="请输入姓名" 
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
          />
        </div>

        {/* ID Type */}
        <div className="form-group">
          <label>证件类型</label>
          <select 
            value={formData.idType}
            onChange={(e) => handleChange('idType', e.target.value)}
          >
            <option value="1">居民身份证</option>
            <option value="2">港澳台居民居住证</option>
            <option value="C">港澳居民来往内地通行证</option>
            <option value="G">台湾居民来往大陆通行证</option>
            <option value="B">护照</option>
          </select>
        </div>

        {/* ID Number */}
        <div className="form-group">
          <label>证件号码</label>
          <input 
            type="text" 
            placeholder="请输入您的证件号码" 
            value={formData.idNumber}
            onChange={(e) => handleChange('idNumber', e.target.value)}
            onBlur={() => handleBlur('idNumber')}
          />
          {errors.idNumber && <div style={{ color: 'red' }}>{errors.idNumber}</div>}
        </div>

        {/* Phone */}
        <div className="form-group">
          <label>手机号码</label>
          <select defaultValue="+86">
            <option value="+86">+86 中国</option>
          </select>
          <input 
            type="text" 
            placeholder="手机号码" 
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            onBlur={() => handleBlur('phone')}
          />
          {errors.phone && <div style={{ color: 'red' }}>{errors.phone}</div>}
        </div>

        {/* SMS Code */}
        <div className="form-group">
          <label>验证码</label>
          <input 
            type="text" 
            placeholder="输入验证码" 
            value={formData.smsCode}
            onChange={(e) => handleChange('smsCode', e.target.value)}
          />
          <button type="button" onClick={handleSendCode} disabled={countdown > 0}>
            {countdown > 0 ? `${countdown}秒后重发` : '获取验证码'}
          </button>
        </div>

        {/* Agreement */}
        <div className="form-group">
          <label>
            <input 
              type="checkbox" 
              checked={formData.agreed}
              onChange={(e) => handleChange('agreed', e.target.checked)}
            />
            我已阅读并同意《服务条款》
          </label>
        </div>

        <button type="button" onClick={handleSubmit}>下一步</button>
      </form>
      </div>
    </div>
  );
};

export default Register;

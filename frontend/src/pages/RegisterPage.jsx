import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { register, checkAvailability, sendSms } from '../api';
import './RegisterPage.css';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    realName: '',
    idType: '1',
    idNumber: '',
    phone: '',
    verificationCode: '',
    userType: 'normal'
  });
  
  const [errors, setErrors] = useState({});
  const [strength, setStrength] = useState(0); // 0-3
  const [agreed, setAgreed] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [globalError, setGlobalError] = useState('');

  // Password Strength Calculator
  const checkStrength = (pwd) => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 6) {
      if (/[A-Za-z]/.test(pwd)) score++;
      if (/\d/.test(pwd)) score++;
      if (/_/.test(pwd)) score++;
    }
    return score;
  };

  useEffect(() => {
    setStrength(checkStrength(formData.password));
  }, [formData.password]);

  // Timer
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error on change
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleBlur = async (e) => {
    const { name, value } = e.target;
    if (!value) return;

    let errorMsg = '';

    if (name === 'username') {
      if (!/^[a-zA-Z][a-zA-Z0-9_]{5,29}$/.test(value)) {
        if (!/^[a-zA-Z]/.test(value)) errorMsg = '用户名格式错误'; // Starts with letter
        else errorMsg = '用户名长度错误'; // Length 6-30
      } else {
        try {
            console.log('Checking availability for', value);
            const res = await checkAvailability('username', value);
            console.log('Availability result:', res);
            if (res.success && res.exists) errorMsg = '用户名已被占用';
        } catch (err) {
            console.error('Check availability failed', err);
        }
      }
    }

    if (name === 'password') {
       if (value.length < 6) errorMsg = '密码长度不能少于6位';
       else if (checkStrength(value) < 2) errorMsg = '密码必须包含字母、数字或下划线中的至少两种';
    }

    if (name === 'confirmPassword') {
      if (value !== formData.password) errorMsg = '两次密码输入不一致';
    }

    if (name === 'idNumber') {
      // Simple format check (15 or 18 digits)
      if (!/(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(value)) {
        errorMsg = '身份证号码格式错误';
      } else {
         // Mock ID check if needed, but client format is usually enough for immediate feedback
      }
    }

    if (name === 'phone') {
       if (!/^1[3-9]\d{9}$/.test(value)) errorMsg = '手机号码格式错误';
    }

    if (errorMsg) {
      setErrors(prev => ({ ...prev, [name]: errorMsg }));
    }
  };

  const handleSendCode = async () => {
    if (countdown > 0) return;
    if (!formData.phone) {
      setErrors(prev => ({ ...prev, phone: '请先输入手机号码' }));
      return;
    }
    if (errors.phone) {
        return;
    }

    try {
      const res = await sendSms(formData.phone);
      if (res.success) {
        setCountdown(60);
      } else {
        setGlobalError(res.error?.message || '验证码发送失败');
      }
    } catch (err) {
      console.error('Send SMS failed', err);
      setGlobalError('网络错误');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalError('');
    
    // Check all fields explicitly
    const newErrors = {};
    if (!formData.username) newErrors.username = '请输入用户名';
    if (!formData.password) newErrors.password = '密码不能为空'; // Matches generic requirement, specific text can be tuned
    else if (formData.password.length < 6) newErrors.password = '密码长度不能少于6位';
    
    if (!formData.confirmPassword) newErrors.confirmPassword = '请再次输入密码';
    else if (formData.confirmPassword !== formData.password) newErrors.confirmPassword = '两次密码输入不一致';

    if (!formData.realName) newErrors.realName = '请输入姓名';
    if (!formData.idNumber) newErrors.idNumber = '请输入证件号码';
    
    if (!formData.phone) newErrors.phone = '请输入手机号，以完成用户校验'; // Requirement: register-phone-validation.json
    else if (!/^1[3-9]\d{9}$/.test(formData.phone)) newErrors.phone = '手机号码格式错误';

    if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
    }

    if (!agreed) {
       setGlobalError('请先同意服务条款'); // Might be triggered by "Next" in requirement
       return;
    }

    if (Object.values(errors).some(e => e)) {
       setGlobalError('请修正表单错误');
       return;
    }

    // Pre-check availability for ID and Phone
    try {
        const idCheck = await checkAvailability('id_number', formData.idNumber);
        if (idCheck.success && idCheck.exists) {
            setGlobalError('该证件号码已被注册');
            return;
        }
        
        const phoneCheck = await checkAvailability('phone', formData.phone);
        if (phoneCheck.success && phoneCheck.exists) {
            setGlobalError('该手机号码已被注册');
            return;
        }
    } catch (err) {
        // Ignore network errors here, let register handle it
    }

    try {
      const res = await register({
        username: formData.username,
        password: formData.password,
        real_name: formData.realName,
        id_type: formData.idType,
        id_number: formData.idNumber,
        phone: formData.phone,
        verificationCode: formData.verificationCode,
        user_type: formData.userType
      });

      if (res.success) {
        // Show success and redirect (mock alert/logic)
        alert('注册成功，跳转到登录页面');
        navigate('/login');
      } else {
        if (res.error?.message?.includes('Duplicate')) {
           // Try to guess which one
           setGlobalError('该证件号码或手机号已被注册');
        } else {
           setGlobalError(res.error?.message || '注册失败');
        }
      }
    } catch (err) {
      setGlobalError('注册请求失败');
    }
  };

  return (
    <div className="register-page">
      <header className="reg-header">
        <div className="reg-container">
          <div className="brand">
             <div className="logo-icon-circle"></div>
             <div className="brand-text">
               <div className="cn">中国铁路12306</div>
               <div className="en">12306 CHINA RAILWAY</div>
             </div>
          </div>
          <div className="reg-utility">
             <span>登录</span> | <span>注册</span>
          </div>
        </div>
      </header>

      <div className="reg-body">
        <div className="reg-container">
          <div className="breadcrumb">您现在的位置： 客运首页 {'>'} 注册</div>
          
          <div className="reg-panel">
            <div className="panel-header">账户信息</div>
            <div className="panel-body">
              <form onSubmit={handleSubmit} className="reg-form">
                <div className="form-row">
                  <label>用户名 <span className="req">*</span></label>
                  <div className="input-wrap">
                    <input 
                      type="text" 
                      name="username" 
                      value={formData.username}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="字母、数字或'_', 6-30位"
                      className={errors.username ? 'error' : ''}
                      maxLength={30}
                    />
                    {errors.username && <div className="field-error">{errors.username}</div>}
                  </div>
                </div>

                <div className="form-row">
                  <label>密码 <span className="req">*</span></label>
                  <div className="input-wrap">
                    <input 
                      type="password" 
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={errors.password ? 'error' : ''}
                      maxLength={20}
                    />
                    {errors.password && <div className="field-error">{errors.password}</div>}
                    <div className={`strength-meter level-${strength}`}>
                       <span className="weak">弱</span>
                       <span className="medium">中</span>
                       <span className="high">强</span>
                    </div>
                  </div>
                </div>

                <div className="form-row">
                  <label>确认密码 <span className="req">*</span></label>
                  <div className="input-wrap">
                    <input 
                      type="password" 
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={errors.confirmPassword ? 'error' : ''}
                    />
                    {errors.confirmPassword && <div className="field-error">{errors.confirmPassword}</div>}
                  </div>
                </div>

                <div className="form-row">
                  <label>姓名 <span className="req">*</span></label>
                  <div className="input-wrap">
                    <input 
                      type="text" 
                      name="realName"
                      value={formData.realName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <label>证件类型 <span className="req">*</span></label>
                  <div className="input-wrap">
                    <select name="idType" value={formData.idType} onChange={handleChange}>
                       <option value="1">居民身份证</option>
                       <option value="C">港澳台居民居住证</option>
                       <option value="G">外国人永久居留身份证</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <label>证件号码 <span className="req">*</span></label>
                  <div className="input-wrap">
                    <input 
                      type="text" 
                      name="idNumber"
                      value={formData.idNumber}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="请输入您的证件号码"
                      className={errors.idNumber ? 'error' : ''}
                    />
                     {errors.idNumber && <div className="field-error">{errors.idNumber}</div>}
                  </div>
                </div>

                <div className="form-row">
                  <label>手机号码 <span className="req">*</span></label>
                  <div className="input-wrap">
                    <div className="phone-group">
                      <select className="prefix-select">
                        <option>+86</option>
                      </select>
                      <input 
                        type="text" 
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={errors.phone ? 'error' : ''}
                      />
                    </div>
                    {errors.phone && <div className="field-error">{errors.phone}</div>}
                  </div>
                </div>

                <div className="form-row">
                  <label>验证码 <span className="req">*</span></label>
                  <div className="input-wrap">
                    <div className="code-group">
                      <input 
                        type="text" 
                        name="verificationCode"
                        value={formData.verificationCode}
                        onChange={handleChange}
                        style={{width: '120px'}}
                      />
                      <button type="button" className="code-btn" onClick={handleSendCode} disabled={countdown > 0}>
                        {countdown > 0 ? `${countdown}秒后重发` : '获取验证码'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="form-row">
                   <div className="terms-wrap">
                     <label className="checkbox-label">
                       <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} />
                       我已阅读并同意《中国铁路客户服务中心网站服务条款》
                     </label>
                   </div>
                </div>

                {globalError && <div className="error-msg center">{globalError}</div>}

                <div className="form-actions">
                  <button type="submit" className="next-btn">下一步</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

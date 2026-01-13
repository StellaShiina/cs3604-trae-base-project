import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './RegisterPage.css';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    realName: '',
    idType: '居民身份证',
    idNumber: '',
    email: '',
    phone: '',
    passengerType: '成人'
  });

  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0); // 0-3

  // Validation Logic
  const validateField = (name, value) => {
    let error = '';
    switch (name) {
      case 'username':
        if (!/^[a-zA-Z]/.test(value)) error = '必须以字母开头';
        else if (value.length < 6 || value.length > 30) error = '长度必须在6-30位之间';
        else if (!/^[a-zA-Z0-9_]+$/.test(value)) error = '只能包含字母、数字或下划线';
        break;
      case 'password':
        if (value.length < 6) error = '长度不能少于6位';
        else if (!/(?=.*[a-zA-Z])|(?=.*[0-9])|(?=.*[_])/.test(value)) error = '必须包含字母、数字或下划线';
        break;
      case 'confirmPassword':
        if (value !== formData.password) error = '两次密码输入不一致';
        break;
      case 'idNumber':
        if (formData.idType === '居民身份证' && !/(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(value)) {
          error = '身份证号码格式不正确';
        }
        break;
      case 'phone':
        if (!/^1[3-9]\d{9}$/.test(value)) error = '手机号码格式不正确';
        break;
      default:
        break;
    }
    return error;
  };

  const calculateStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 6) {
      if (/[a-zA-Z]/.test(pwd)) score++;
      if (/[0-9]/.test(pwd)) score++;
      if (/[_]/.test(pwd)) score++;
    }
    return score;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Limit password length
    if ((name === 'password' || name === 'confirmPassword') && value.length > 20) return;

    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'password') {
      setPasswordStrength(calculateStrength(value));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate all fields
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
        alert('注册成功，跳转到登录页面');
        navigate('/login');
      }
    } catch (err) {
      if (err.response && err.response.data) {
        if (err.response.data.code === 409) {
           alert('该证件号码已被注册'); // Or user/phone exists
        } else {
           alert(err.response.data.message || '注册失败');
        }
      } else {
        alert('网络错误');
      }
    }
  };

  return (
    <div className="register-container">
      <div className="register-header">
        <h2>账户注册</h2>
      </div>
      <form className="register-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>用户名:</label>
          <input 
            type="text" 
            name="username" 
            value={formData.username} 
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="用户名设置成功后不可修改"
          />
          {errors.username && <span className="error-msg">{errors.username}</span>}
        </div>

        <div className="form-group">
          <label>登录密码:</label>
          <input 
            type="password" 
            name="password" 
            value={formData.password} 
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="6-20位字母、数字或符号"
          />
          {errors.password && <span className="error-msg">{errors.password}</span>}
          <div className={`strength-meter level-${passwordStrength}`}>
             强度: {['弱', '中', '强'][passwordStrength - 1] || '无'}
          </div>
        </div>

        <div className="form-group">
          <label>确认密码:</label>
          <input 
            type="password" 
            name="confirmPassword" 
            value={formData.confirmPassword} 
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="再次输入您的登录密码"
          />
          {errors.confirmPassword && <span className="error-msg">{errors.confirmPassword}</span>}
        </div>

        <div className="form-group">
          <label>姓名:</label>
          <input 
            type="text" 
            name="realName" 
            value={formData.realName} 
            onChange={handleChange}
            placeholder="请输入姓名"
          />
        </div>

        <div className="form-group">
          <label>证件类型:</label>
          <select name="idType" value={formData.idType} onChange={handleChange}>
            <option value="居民身份证">居民身份证</option>
            <option value="港澳台居民居住证">港澳台居民居住证</option>
            <option value="护照">护照</option>
          </select>
        </div>

        <div className="form-group">
          <label>证件号码:</label>
          <input 
            type="text" 
            name="idNumber" 
            value={formData.idNumber} 
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="请输入您的证件号码"
          />
          {errors.idNumber && <span className="error-msg">{errors.idNumber}</span>}
        </div>

        <div className="form-group">
          <label>手机号码:</label>
          <div className="phone-input-group">
             <select className="area-code">
               <option>+86</option>
             </select>
            <input 
              type="text" 
              name="phone" 
              value={formData.phone} 
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="请输入您的手机号码"
            />
          </div>
          {errors.phone && <span className="error-msg">{errors.phone}</span>}
        </div>

        <div className="form-group">
          <label>旅客类型:</label>
          <select name="passengerType" value={formData.passengerType} onChange={handleChange}>
            <option value="成人">成人</option>
            <option value="儿童">儿童</option>
            <option value="学生">学生</option>
            <option value="残疾军人">残疾军人</option>
          </select>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-submit">下一步</button>
        </div>
      </form>
    </div>
  );
};

export default RegisterPage;
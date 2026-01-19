import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../api';
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
    userType: 'normal'
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('两次密码输入不一致');
      return;
    }

    try {
      const res = await register({
        username: formData.username,
        password: formData.password,
        real_name: formData.realName,
        id_type: formData.idType,
        id_number: formData.idNumber,
        phone: formData.phone,
        user_type: formData.userType
      });

      if (res.success) {
        navigate('/login');
      } else {
        setError(res.error?.message || '注册失败');
      }
    } catch (err) {
      setError('注册请求失败');
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
                  <input 
                    type="text" 
                    name="username" 
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="字母、数字或'_'"
                    required
                  />
                </div>
                <div className="form-row">
                  <label>密码 <span className="req">*</span></label>
                  <input 
                    type="password" 
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-row">
                  <label>确认密码 <span className="req">*</span></label>
                  <input 
                    type="password" 
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-row">
                  <label>姓名 <span className="req">*</span></label>
                  <input 
                    type="text" 
                    name="realName"
                    value={formData.realName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-row">
                  <label>证件号码 <span className="req">*</span></label>
                  <input 
                    type="text" 
                    name="idNumber"
                    value={formData.idNumber}
                    onChange={handleChange}
                    placeholder="请输入您的证件号码"
                    required
                  />
                </div>
                <div className="form-row">
                  <label>手机号码 <span className="req">*</span></label>
                  <input 
                    type="text" 
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>

                {error && <div className="error-msg center">{error}</div>}

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

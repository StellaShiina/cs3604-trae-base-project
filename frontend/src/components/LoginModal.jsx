import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './LoginModal.css';

const LoginModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.password) {
      setError('请输入用户名和密码');
      return;
    }

    try {
      const res = await axios.post('/api/auth/login', formData);
      if (res.data.code === 200) {
        // Save user to local storage (mock session)
        localStorage.setItem('user', JSON.stringify(res.data.data));
        onLoginSuccess(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || '登录失败，请检查用户名或密码');
    }
  };

  return (
    <div className="login-modal-overlay">
      <div className="login-modal-content">
        <button className="login-modal-close" onClick={onClose}>&times;</button>
        <div className="login-modal-header">用户登录</div>
        
        {error && <div className="error-message">{error}</div>}
        
        <form className="login-modal-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              name="username"
              placeholder="用户名/邮箱/手机号"
              value={formData.username}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              name="password"
              placeholder="密码"
              value={formData.password}
              onChange={handleChange}
            />
          </div>
          <button type="submit" className="login-modal-submit">立即登录</button>
        </form>

        <div className="login-modal-footer">
          <Link to="/register" onClick={onClose}>注册账户</Link>
          <Link to="/forgot-password" onClick={onClose}>忘记密码？</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;

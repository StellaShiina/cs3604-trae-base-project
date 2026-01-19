import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse user from local storage', e);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    setUser(null);
    navigate('/login');
  };

  return (
    <header className="site-header">
      <div className="header-container">
        {/* Logo Block */}
        <div className="logo-block">
          <div className="logo-icon">
             {/* Simple CSS shape or placeholder for the rail logo */}
             <div className="rail-icon"></div>
          </div>
          <div className="logo-text">
            <div className="logo-cn">中国铁路12306</div>
            <div className="logo-en">12306 CHINA RAILWAY</div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="search-bar">
          <input 
            type="text" 
            placeholder="搜索车票、餐饮、旅游产品、相关规章" 
            className="search-input"
          />
          <button className="search-btn">
            🔍
          </button>
        </div>

        {/* Utility Links */}
        <div className="utility-links">
          <a href="#">无障碍</a>
          <span className="separator">|</span>
          <a href="#">敬老版</a>
          <span className="separator">|</span>
          <a href="#">English</a>
          <span className="separator">|</span>
          <Link to="/personal">我的12306</Link>
          <span className="separator">|</span>
          {user ? (
            <>
              <span className="user-greeting">您好，{user.username}</span>
              <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }}>退出</a>
            </>
          ) : (
            <>
              <Link to="/login">登录</Link>
              <Link to="/register">注册</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

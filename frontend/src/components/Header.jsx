import React from 'react';
import './Header.css';

const Header = () => {
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
          <a href="#">我的12306</a>
          <span className="separator">|</span>
          <a href="#">登录</a>
          <a href="#">注册</a>
        </div>
      </div>
    </header>
  );
};

export default Header;

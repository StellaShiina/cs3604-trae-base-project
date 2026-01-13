import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const [showTicketDropdown, setShowTicketDropdown] = useState(false);

  const handleTicketClick = (type) => {
    navigate(`/search?type=${type}`);
  };

  return (
    <div className="header-wrapper">
      {/* Top Global Bar */}
      <div className="top-global-bar">
        <div className="logo-area">
          <Link to="/" className="logo-link">
            <span className="logo-icon">🚄</span>
            <div className="logo-text">
              <span className="cn">中国铁路12306</span>
              <span className="en">12306 CHINA RAILWAY</span>
            </div>
          </Link>
        </div>
        
        <div className="search-bar">
          <input type="text" placeholder="搜索车票、餐饮、常旅客、相关规章" />
          <button className="search-btn">🔍</button>
        </div>

        <div className="header-tools">
          <span>无障碍</span>
          <span>爱老版</span>
          <span>English</span>
          <span>我的12306</span>
          <div className="auth-status">
            <span>您好，请</span>
            <Link to="/login">登录</Link> | <Link to="/register">注册</Link>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="main-nav">
        <ul className="nav-list">
          <li className="nav-item"><Link to="/">首页</Link></li>
          <li 
            className="nav-item ticket-menu"
            onMouseEnter={() => setShowTicketDropdown(true)}
            onMouseLeave={() => setShowTicketDropdown(false)}
          >
            <span className="nav-label">车票 ▼</span>
            {showTicketDropdown && (
              <div className="dropdown-menu">
                <div className="dropdown-section">
                  <div className="dropdown-title">购买</div>
                  <div className="dropdown-links">
                    <span onClick={() => handleTicketClick('one-way')}>单程</span>
                    <span onClick={() => handleTicketClick('round-trip')}>往返</span>
                  </div>
                </div>
              </div>
            )}
          </li>
          <li className="nav-item">团购服务</li>
          <li className="nav-item">会员服务</li>
          <li className="nav-item">站车服务</li>
          <li className="nav-item">商旅服务</li>
          <li className="nav-item">出行指南</li>
          <li className="nav-item">信息查询</li>
        </ul>
      </nav>
    </div>
  );
};

export default Header;

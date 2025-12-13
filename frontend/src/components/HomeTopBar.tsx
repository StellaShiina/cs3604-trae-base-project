import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomeTopBar.css';

interface HomeTopBarProps {
  isLoggedIn?: boolean;
  username?: string;
  onLogout?: () => void;
  onMy12306Click?: () => void;
}

/**
 * 主页专用顶部栏组件
 * 包含logo、搜索框、链接和登录/注册按钮
 */
const HomeTopBar: React.FC<HomeTopBarProps> = ({ isLoggedIn = false, username, onLogout, onMy12306Click }) => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = React.useState('');

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleRegister = () => {
    navigate('/register');
  };

  const handleSearch = () => {
    if (searchText.trim()) {
      // TODO: 实现搜索功能
      console.log('搜索:', searchText);
    }
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      // TODO: 调用退出登录API
      console.log('退出登录');
      localStorage.removeItem('authToken');
      localStorage.removeItem('username');
      window.location.reload(); // 刷新页面更新登录状态
    }
  };

  const handleMy12306Click = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (onMy12306Click) {
      onMy12306Click();
    }
  };

  return (
    <div className="home-top-bar">
      <div className="home-top-bar-container">
        {/* Logo区域 */}
        <div className="home-logo-section" onClick={handleLogoClick}>
          <img 
            src="/images/logo.png" 
            alt="中国铁路12306" 
            className="home-logo-image"
          />
          <div className="home-logo-text">
            <div className="home-logo-chinese">中国铁路12306</div>
            <div className="home-logo-english">12306 CHINA RAILWAY</div>
          </div>
        </div>

        {/* 搜索框 */}
        <div className="home-search-box">
          <input
            type="text"
            className="home-search-input"
            placeholder="搜索车票、餐饮、常旅客、相关规章"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyPress={handleSearchKeyPress}
          />
          <button className="home-search-button" onClick={handleSearch}>
            <img src="/images/search.svg" alt="搜索" className="home-search-icon" />
          </button>
        </div>

        {/* 右侧链接区域 */}
        <div className="home-top-links">
          <a href="#" className="home-top-link">无障碍</a>
          <a href="#" className="home-top-link">敬老版</a>
          <a href="#" className="home-top-link">English</a>
          <a href="#" className="home-top-link" onClick={handleMy12306Click}>我的12306</a>
          {!isLoggedIn ? (
            <>
              <button className="home-top-auth-link login" onClick={handleLogin}>登录</button>
              <button className="home-top-auth-link register" onClick={handleRegister}>注册</button>
            </>
          ) : (
            <>
              <span className="home-welcome-text">您好，</span>
              <span className="home-username">{username}</span>
              <span className="home-divider">|</span>
              <button className="home-logout-button" onClick={handleLogout}>退出</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeTopBar;


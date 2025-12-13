import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './TrainListTopBar.css';

interface TrainListTopBarProps {
  isLoggedIn: boolean;
  username?: string;
  onLogout?: () => void;
  onMy12306Click?: () => void;
}

/**
 * 车次列表页专用顶部栏组件
 * 基于HomeTopBar，保留所有功能，只修改登录/注册样式
 */
const TrainListTopBar: React.FC<TrainListTopBarProps> = ({ isLoggedIn, username, onLogout, onMy12306Click }) => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = React.useState('');

  const handleLogoClick = () => {
    navigate('/');
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
      navigate('/login');
    }
  };

  const handleMy12306Click = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (onMy12306Click) {
      onMy12306Click();
    }
  };

  return (
    <div className="train-list-top-bar">
      <div className="train-list-top-container">
        {/* Logo区域 */}
        <div className="train-list-logo-section" onClick={handleLogoClick}>
          <img 
            src="/images/logo.png" 
            alt="中国铁路12306" 
            className="train-list-logo-image"
          />
          <div className="train-list-logo-text">
            <div className="train-list-logo-chinese">中国铁路12306</div>
            <div className="train-list-logo-english">12306 CHINA RAILWAY</div>
          </div>
        </div>

        {/* 搜索框 */}
        <div className="train-list-search-box">
          <input
            type="text"
            className="train-list-search-input"
            placeholder="搜索车票、餐饮、常旅客、相关规章"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyPress={handleSearchKeyPress}
          />
          <button className="train-list-search-button" onClick={handleSearch}>
            <img src="/images/search.svg" alt="搜索" className="train-list-search-icon" />
          </button>
        </div>

        {/* 右侧链接区域 */}
        <div className="train-list-top-links">
          <a href="#" className="train-list-top-link">无障碍</a>
          <a href="#" className="train-list-top-link">敬老版</a>
          <a href="#" className="train-list-top-link">English</a>
          <a href="#" className="train-list-top-link" onClick={handleMy12306Click}>我的12306</a>
          {!isLoggedIn ? (
            <>
              <span className="train-list-welcome-text">
                您好，请<Link to="/login" className="train-list-auth-link">登录</Link>
              </span>
              <Link to="/register" className="train-list-auth-link">注册</Link>
            </>
          ) : (
            <>
              <span className="train-list-welcome-text">您好，</span>
              <span className="train-list-username">{username}</span>
              <span className="train-list-divider">|</span>
              <button className="train-list-logout-button" onClick={handleLogout}>退出</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrainListTopBar;


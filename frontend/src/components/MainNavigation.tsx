import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './MainNavigation.css';

interface MainNavigationProps {
  isLoggedIn: boolean;
  onLoginClick: () => void;
  onRegisterClick: () => void;
  onPersonalCenterClick: () => void;
}

/**
 * 主导航栏组件
 * 12306 蓝色导航栏，包含主要功能入口
 */
const MainNavigation: React.FC<MainNavigationProps> = ({
  isLoggedIn: _isLoggedIn,
  onLoginClick: _onLoginClick,
  onRegisterClick: _onRegisterClick,
  onPersonalCenterClick: _onPersonalCenterClick,
}) => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  // 车票相关的页面：车次列表、订单填写、历史订单、个人信息、手机核验、乘客管理
  const isTrainsPage = location.pathname === '/trains' 
    || location.pathname === '/order' 
    || location.pathname === '/orders' 
    || location.pathname === '/personal-info' 
    || location.pathname === '/phone-verification' 
    || location.pathname === '/passengers';

  return (
    <nav className="main-navigation">
      <div className="nav-container">
        <Link to="/" className={`nav-item ${isHomePage ? 'active' : ''}`}>首页</Link>
        <Link to="/trains" className={`nav-item ${isTrainsPage ? 'active' : ''}`}>车票 <span className="nav-arrow">▼</span></Link>
        <a href="#" className="nav-item">团购服务 <span className="nav-arrow">▼</span></a>
        <a href="#" className="nav-item">会员服务 <span className="nav-arrow">▼</span></a>
        <a href="#" className="nav-item">站车服务 <span className="nav-arrow">▼</span></a>
        <a href="#" className="nav-item">商旅服务 <span className="nav-arrow">▼</span></a>
        <a href="#" className="nav-item">出行指南 <span className="nav-arrow">▼</span></a>
        <a href="#" className="nav-item">信息查询 <span className="nav-arrow">▼</span></a>
      </div>
    </nav>
  );
};

export default MainNavigation;

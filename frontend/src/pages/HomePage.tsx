import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';
import HomeTopBar from '../components/HomeTopBar';
import MainNavigation from '../components/MainNavigation';
import TrainSearchForm from '../components/TrainSearchForm';
import BottomNavigation from '../components/BottomNavigation';

/**
 * 首页/查询页主容器组件
 */
const HomePage: React.FC = () => {
  const navigate = useNavigate();
  
  // 从localStorage读取登录状态
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // 检查localStorage中是否有authToken
    const token = localStorage.getItem('authToken');
    setIsLoggedIn(!!token);
  }, []);

  // 实现导航功能
  const handleNavigateToLogin = () => {
    navigate('/login');
  };

  const handleNavigateToRegister = () => {
    navigate('/register');
  };

  const handleNavigateToPersonalCenter = () => {
    // 跳转到个人中心
    if (isLoggedIn) {
      navigate('/personal-info');
    } else {
      navigate('/login');
    }
  };

  const handleMy12306Click = () => {
    // 点击"我的12306"跳转到个人中心
    if (isLoggedIn) {
      navigate('/personal-info');
    } else {
      navigate('/login');
    }
  };

  const handleNavigateToTrainList = (params: any) => {
    // 将查询参数传递到车次列表页
    navigate('/trains', { state: params });
  };

  const username = isLoggedIn ? (localStorage.getItem('username') || localStorage.getItem('userId') || '用户') : '';
  
  return (
    <div className="home-page">
      <HomeTopBar isLoggedIn={isLoggedIn} username={username} onMy12306Click={handleMy12306Click} />
      <MainNavigation
        isLoggedIn={isLoggedIn}
        onLoginClick={handleNavigateToLogin}
        onRegisterClick={handleNavigateToRegister}
        onPersonalCenterClick={handleNavigateToPersonalCenter}
      />
      <main className="home-main">
        <div className="home-search-container">
          <div className="home-search-wrapper">
            <TrainSearchForm onNavigateToTrainList={handleNavigateToTrainList} />
          </div>
        </div>
        
        {/* 中部7个快捷按钮 */}
        <section className="home-quick-buttons">
          <div className="home-quick-buttons-container">
            <img 
              src="/images/首页中部.png" 
              alt="快捷服务入口" 
              className="home-quick-buttons-image"
            />
          </div>
        </section>
        
        {/* 宣传栏区域 - 使用真实图片 */}
        <section className="home-promo-section">
          <div className="home-promo-grid">
            <div className="home-promo-card">
              <img 
                src="/images/首页-会员服务-左上.jpg" 
                alt="会员服务" 
                className="home-promo-image"
              />
            </div>
            
            <div className="home-promo-card">
              <img 
                src="/images/首页-餐饮特产-右上.jpg" 
                alt="餐饮特产" 
                className="home-promo-image"
              />
            </div>
            
            <div className="home-promo-card">
              <img 
                src="/images/首页-铁路保险-左下.jpg" 
                alt="铁路保险" 
                className="home-promo-image"
              />
            </div>
            
            <div className="home-promo-card">
              <img 
                src="/images/首页-计次定期票-右下.png" 
                alt="计次定期票" 
                className="home-promo-image"
              />
            </div>
          </div>
        </section>
        
        {/* 底部发布区域 */}
        <section className="home-info-section">
          <div className="home-info-container">
            <img 
              src="/images/首页-底部发布.png" 
              alt="最新发布、常见问题、信用信息" 
              className="home-info-image"
            />
          </div>
        </section>
      </main>
      <BottomNavigation />
    </div>
  );
};

export default HomePage;


import React from 'react';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="home-container">
      <header className="header">
        <div className="logo">12306 China Railway</div>
        <nav className="nav">
          <ul>
            <li>首页</li>
            <li>车票</li>
            <li>团购服务</li>
            <li>会员服务</li>
            <li>站车服务</li>
            <li>商旅服务</li>
            <li>出行指南</li>
            <li>信息查询</li>
          </ul>
        </nav>
        <div className="auth-links">
          <span>登录</span> | <span>注册</span>
        </div>
      </header>
      <main className="main-content">
        <div className="banner">
          <h1>欢迎使用12306购票系统</h1>
        </div>
        <div className="search-panel-placeholder">
          {/* Search Module will be injected here in later requirements */}
          <p>车票查询</p>
        </div>
      </main>
      <footer className="footer">
        <p>© 2026 12306 Demo</p>
      </footer>
    </div>
  );
};

export default HomePage;

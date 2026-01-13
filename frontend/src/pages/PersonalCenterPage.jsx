
import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './PersonalCenterPage.css';

const PersonalCenterPage = () => {
  return (
    <div className="personal-center-page">
      <Header />
      <div className="center-container">
        <div className="sidebar">
          <div className="sidebar-title">个人中心</div>
          <ul className="sidebar-menu">
            <li className="menu-item active">个人信息</li>
            <li className="menu-item">乘车人</li>
          </ul>
        </div>
        <div className="main-content">
          <h2>个人中心</h2>
          <div className="content-placeholder">
            Select an item from the sidebar.
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PersonalCenterPage;

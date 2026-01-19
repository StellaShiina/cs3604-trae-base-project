import React from 'react';
import './NavBar.css';

const NavBar = () => {
  const menuItems = [
    '首页', '车票', '团购服务', '会员服务', 
    '站车服务', '商旅服务', '出行指南', '信息查询'
  ];

  return (
    <nav className="main-nav">
      <div className="nav-container">
        <ul className="nav-list">
          {menuItems.map((item, index) => (
            <li key={index} className={`nav-item ${index === 0 ? 'active' : ''}`}>
              <a href="#">{item}</a>
              {/* Add caret for items usually having dropdowns, skipping first one */}
              {index > 0 && <span className="nav-caret">▼</span>}
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default NavBar;

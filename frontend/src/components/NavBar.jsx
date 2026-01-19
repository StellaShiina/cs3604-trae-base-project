import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './NavBar.css';

const NavBar = () => {
  const location = useLocation();
  const menuItems = [
    { label: '首页', path: '/' },
    { label: '车票', path: '/ticket-search' },
    { label: '团购服务', path: '#' },
    { label: '会员服务', path: '#' }, 
    { label: '站车服务', path: '#' },
    { label: '商旅服务', path: '#' },
    { label: '出行指南', path: '#' },
    { label: '信息查询', path: '#' }
  ];

  return (
    <nav className="main-nav">
      <div className="nav-container">
        <ul className="nav-list">
          {menuItems.map((item, index) => {
            const isActive = location.pathname === item.path || (item.path === '/' && location.pathname === '/');
            return (
              <li key={index} className={`nav-item ${isActive ? 'active' : ''}`}>
                <Link to={item.path}>{item.label}</Link>
                {/* Add caret for items usually having dropdowns, skipping first two (Home/Ticket usually don't have dropdown in this simplified view, or Ticket might) */}
                {index > 1 && <span className="nav-caret">▼</span>}
                {index === 1 && <span className="nav-caret">▼</span>} 
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
};

export default NavBar;

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse user', e);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    navigate('/login');
  };

  return (
    <div>
      {/* Top Header */}
      <div className="top-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 70, padding: '0 20px', background: 'white', borderBottom: '1px solid #E6EEF6' }}>
        <div className="brand" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 40, height: 40, background: 'red', borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>Logo</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 20, fontWeight: 'bold', color: '#2F86E5' }}>中国铁路12306</span>
            <span style={{ fontSize: 14, fontWeight: 'bold', color: '#2F86E5' }}>12306 CHINA RAILWAY</span>
          </div>
        </div>

        <div className="search-bar" style={{ display: 'flex' }}>
          <input placeholder="搜索车票、餐饮、旅游产品" style={{ width: 300, padding: 5, border: '1px solid #ccc' }} />
          <button style={{ background: '#2F86E5', color: 'white', border: 'none', width: 40 }}>Q</button>
        </div>

        <div className="utility-links" style={{ fontSize: 12, color: '#666' }}>
          <span style={{ marginRight: 10 }}>无障碍</span>
          <span style={{ marginRight: 10 }}>敬老版</span>
          <span style={{ marginRight: 10 }}>English</span>
          <span style={{ marginRight: 10 }}>我的12306</span>
          {user ? (
            <span>
              您好，{user.username} | <button onClick={handleLogout} style={{ cursor: 'pointer', border: 'none', background: 'none', color: 'blue' }}>退出</button>
            </span>
          ) : (
            <span>
              <Link to="/login" style={{ color: '#2F86E5' }}>登录</Link> | <Link to="/register" style={{ color: '#2F86E5' }}>注册</Link>
            </span>
          )}
        </div>
      </div>

      {/* Blue Nav Bar */}
      <nav className="nav-bar" style={{ background: '#2F86E5', height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 40 }}>
        {["首页", "车票", "团购服务", "会员服务", "站车服务", "商旅服务", "出行指南", "信息查询"].map(item => (
          <Link key={item} to="/" style={{ color: 'white', textDecoration: 'none', fontSize: 14 }}>{item}</Link>
        ))}
      </nav>
    </div>
  );
};

export default Header;

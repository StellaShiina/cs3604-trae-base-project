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
    <div className="header" style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 20px', background: '#f0f0f0', borderBottom: '1px solid #ccc' }}>
      <div className="logo" style={{ fontWeight: 'bold', fontSize: '20px' }}>
        <Link to="/" style={{ textDecoration: 'none', color: '#333' }}>中国铁路12306</Link>
      </div>
      <div className="user-nav">
        {user ? (
          <span>
            您好，{user.username} | <button onClick={handleLogout} style={{ cursor: 'pointer', border: 'none', background: 'none', color: 'blue', textDecoration: 'underline' }}>退出</button>
          </span>
        ) : (
          <span>
            您好，请<Link to="/login" style={{ margin: '0 5px' }}>登录</Link> | <Link to="/register" style={{ margin: '0 5px' }}>注册</Link>
          </span>
        )}
      </div>
    </div>
  );
};

export default Header;

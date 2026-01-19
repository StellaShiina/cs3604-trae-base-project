import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState({ from: '北京', to: '上海', date: '2025-12-20' });

  const handleSearch = () => {
    navigate(`/search?from=${search.from}&to=${search.to}&date=${search.date}`);
  };

  const handleSwap = () => {
    setSearch(prev => ({ ...prev, from: prev.to, to: prev.from }));
  };

  return (
    <div>
      <Header />

      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          {/* Left: Booking Card */}
          <div className="booking-card">
            {/* Sidebar Tabs */}
            <div className="booking-card-sidebar">
              <div className="sidebar-item active">
                <span>🎫</span>
                <span>车票</span>
              </div>
              <div className="sidebar-item">
                <span>🔍</span>
                <span>常用查询</span>
              </div>
              <div className="sidebar-item">
                <span>🍱</span>
                <span>订餐</span>
              </div>
            </div>

            {/* Main Form Area */}
            <div className="booking-form-area">
              {/* Top Tabs */}
              <div className="form-tabs">
                <span className="form-tab active">🔘 单程</span>
                <span className="form-tab">⚪ 往返</span>
                <span className="form-tab">⚪ 中转换乘</span>
                <span className="form-tab">⚪ 退改签</span>
              </div>

              {/* Form Fields */}
              <div className="form-row">
                <div style={{ flex: 1 }}>
                  <div className="form-label">出发地</div>
                  <input
                    className="form-input"
                    value={search.from}
                    onChange={e => setSearch({ ...search, from: e.target.value })}
                  />
                </div>
                <button className="swap-btn" onClick={handleSwap}>⇄</button>
                <div style={{ flex: 1, textAlign: 'right' }}>
                  <div className="form-label">到达地</div>
                  <input
                    className="form-input"
                    style={{ textAlign: 'right' }}
                    value={search.to}
                    onChange={e => setSearch({ ...search, to: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div style={{ flex: 1 }}>
                  <div className="form-label">出发日期</div>
                  <input
                    className="form-input"
                    value={search.date}
                    onChange={e => setSearch({ ...search, date: e.target.value })}
                  />
                </div>
                <span style={{ fontSize: '20px' }}>📅</span>
              </div>

              <div className="checkbox-row">
                <label><input type="checkbox" /> 学生</label>
                <label><input type="checkbox" defaultChecked /> 高铁/动车</label>
              </div>

              <button className="search-btn" onClick={handleSearch}>查  询</button>
            </div>
          </div>

          {/* Right: Hero Illustration */}
          <div className="hero-illustration">
            <div className="promo-bubble">
              计次·定期票 / 开售
            </div>
            <div className="hero-headline">
              直刷乘车、出行乐无忧
            </div>
            <div className="illustration-mock">
              [Illustration: Phone + Ticket Machine]
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access Icon Row */}
      <div className="quick-access-bar">
        <div className="quick-access-content">
          {[
            { icon: '♿', text: '重点旅客预约' },
            { icon: '🔍', text: '遗失物品查找' },
            { icon: '🚗', text: '约车服务' },
            { icon: '📦', text: '便民托运' },
            { icon: '💁', text: '车站引导' },
            { icon: '🌟', text: '站车风采' },
            { icon: '📝', text: '用户反馈' },
          ].map((item, index) => (
            <div key={index} className="quick-access-item">
              <div className="quick-icon">{item.icon}</div>
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Promo Grid */}
      <div className="promo-section">
        <div className="promo-grid">
          <div className="promo-card">
            <div className="promo-title">会员服务</div>
            <div className="promo-subtitle">铁路畅行 尊享体验</div>
            <div className="promo-desc">12306铁路会员积分服务</div>
          </div>
          <div className="promo-card">
            <div className="promo-title">餐饮·特产</div>
            <div className="promo-subtitle">带着温度的旅途配餐</div>
            <div className="promo-desc">享受星级的体验和家乡的味道</div>
          </div>
          <div className="promo-card">
            <div className="promo-title">铁路保险</div>
            <div className="promo-subtitle">用心呵护 放心出行</div>
            <div className="promo-desc">12306铁路保险出行安全</div>
          </div>
          <div className="promo-card">
            <div className="promo-title">计次·定期票</div>
            <div className="promo-subtitle">预约随心乘 出行更便捷</div>
            <div className="promo-desc">为您提供全新的自助式出行体验</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;

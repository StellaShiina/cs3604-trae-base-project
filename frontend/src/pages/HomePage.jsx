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

  return (
    <div>
      <Header />
      <div className="hero" style={{ background: '#BFDFF6', padding: 40, height: 440 }}>
        <div className="search-panel" style={{ background: 'white', padding: 20, width: 560 }}>
          <h3>车票查询</h3>
          <div style={{ marginBottom: 10 }}>
            <label>出发地</label>
            <input value={search.from} onChange={e => setSearch({ ...search, from: e.target.value })} />
          </div>
          <div style={{ marginBottom: 10 }}>
            <label>到达地</label>
            <input value={search.to} onChange={e => setSearch({ ...search, to: e.target.value })} />
          </div>
          <div style={{ marginBottom: 10 }}>
            <label>出发日期</label>
            <input value={search.date} onChange={e => setSearch({ ...search, date: e.target.value })} />
          </div>
          <button onClick={handleSearch} style={{ width: '100%', background: '#F47A1F', color: 'white', padding: 10, border: 'none' }}>查 询</button>
        </div>
      </div>
      <div className="content" style={{ padding: '20px' }}>
        <h1>欢迎使用12306</h1>

        {/* Promo Grid */}
        <div className="promo-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div style={{ background: 'white', padding: 20 }}>
            <h3>会员服务</h3>
            <p>铁路畅行 尊享体验</p>
            <p>12306铁路会员积分服务</p>
          </div>
          <div style={{ background: 'white', padding: 20 }}>
            <h3>餐饮·特产</h3>
            <p>带着温度的旅途配餐</p>
          </div>
          <div style={{ background: 'white', padding: 20 }}>
            <h3>铁路保险</h3>
            <p>用心呵护 放心出行</p>
          </div>
          <div style={{ background: 'white', padding: 20 }}>
            <h3>计次·定期票</h3>
            <p>预约随心乘 出行更便捷</p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default HomePage;

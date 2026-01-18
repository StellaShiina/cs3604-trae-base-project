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
          <button onClick={handleSearch} style={{ width: '100%', background: '#F47A1F', color: 'white', padding: 10, border: 'none' }}>查询</button>
        </div>
      </div>
      <div className="content" style={{ padding: '20px' }}>
        <h1>欢迎使用12306</h1>
      </div>
    </div>
  );
};
export default HomePage;

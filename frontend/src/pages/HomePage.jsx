import React from 'react';
import Header from '../components/Header';
import './HomePage.css';

const HomePage = () => {
  return (
    <div>
      <Header />
      <div className="content" style={{ padding: '20px' }}>
        <h1>欢迎使用12306</h1>
      </div>
    </div>
  );
};
export default HomePage;

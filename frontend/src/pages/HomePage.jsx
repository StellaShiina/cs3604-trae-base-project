import React from 'react';
import Header from '../components/Header';
import NavBar from '../components/NavBar';
import Hero from '../components/Hero';
import QuickAccess from '../components/QuickAccess';
import PromoGrid from '../components/PromoGrid';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="home-page">
      <Header />
      <NavBar />
      <Hero />
      <QuickAccess />
      <PromoGrid />
      
      {/* Simple Footer Placeholder */}
      <footer style={{ padding: '20px', textAlign: 'center', fontSize: '12px', color: '#999' }}>
        © 2025 12306 China Railway. All Rights Reserved.
      </footer>
    </div>
  );
};

export default HomePage;

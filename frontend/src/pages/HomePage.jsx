import React from 'react';
import Header from '../components/Header';
import TicketSearchForm from '../components/TicketSearchForm';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="home-container">
      <Header />
      <main className="main-content">
        <div className="banner">
          <div className="banner-content">
            <TicketSearchForm />
          </div>
        </div>
      </main>
      <footer className="footer">
        <p>© 2026 12306 Demo</p>
      </footer>
    </div>
  );
};

export default HomePage;

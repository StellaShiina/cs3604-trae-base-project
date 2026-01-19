import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Hero.css';

const Hero = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('tickets'); // tickets, query, food
  const [formData, setFormData] = useState({
    from: '北京',
    to: '上海',
    date: '2025-12-21'
  });

  const handleQuery = () => {
    const searchParams = new URLSearchParams({
      from: formData.from,
      to: formData.to,
      date: formData.date
    });
    navigate(`/ticket-search?${searchParams.toString()}`);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="hero-section">
      <div className="hero-container">
        {/* Left Booking Panel */}
        <div className="booking-panel">
          {/* Vertical Tabs */}
          <div className="panel-tabs">
            <div 
              className={`panel-tab ${activeTab === 'tickets' ? 'active' : ''}`}
              onClick={() => setActiveTab('tickets')}
            >
              <span className="tab-icon">🎫</span>
              车票
            </div>
            <div 
              className={`panel-tab ${activeTab === 'query' ? 'active' : ''}`}
              onClick={() => setActiveTab('query')}
            >
              <span className="tab-icon">🔍</span>
              常用查询
            </div>
            <div 
              className={`panel-tab ${activeTab === 'food' ? 'active' : ''}`}
              onClick={() => setActiveTab('food')}
            >
              <span className="tab-icon">🍱</span>
              订餐
            </div>
          </div>

          {/* Form Area */}
          <div className="panel-content">
            {/* Trip Type Tabs */}
            <div className="trip-types">
              <label className="radio-label active">
                <span className="radio-circle">●</span> 单程
              </label>
              <label className="radio-label">
                <span className="radio-circle">○</span> 往返
              </label>
              <label className="radio-label">
                <span className="radio-circle">○</span> 中转换乘
              </label>
              <label className="radio-label">
                <span className="radio-circle">○</span> 退改签
              </label>
            </div>

            {/* Form Fields */}
            <div className="booking-form">
              <div className="form-row">
                <span className="form-label">出发地</span>
                <input 
                  type="text" 
                  name="from"
                  value={formData.from}
                  onChange={handleChange}
                  className="form-input" 
                />
              </div>
              <div className="form-row">
                <span className="form-label">到达地</span>
                <input 
                  type="text" 
                  name="to"
                  value={formData.to}
                  onChange={handleChange}
                  className="form-input" 
                />
              </div>
              <div className="form-row">
                <span className="form-label">出发日期</span>
                <input 
                  type="text" 
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="form-input" 
                />
                <span className="calendar-icon">📅</span>
              </div>

              {/* Checkboxes */}
              <div className="form-options">
                <label className="checkbox-label">
                  <input type="checkbox" /> 学生
                </label>
                <label className="checkbox-label">
                  <input type="checkbox" defaultChecked /> 高铁/动车
                </label>
              </div>

              {/* Submit Button */}
              <button className="submit-btn" onClick={handleQuery}>查 询</button>

              {/* Footer Links */}
              <div className="panel-footer">
                <div className="history-links">
                  <span>北京-北京</span>
                  <span className="history-sep">|</span>
                  <span>北京-上海</span>
                </div>
                <div className="clear-history">删除历史</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Illustration Area */}
        <div className="hero-visual">
          <div className="speech-bubble">
            <div className="bubble-line">计次·定期票</div>
            <div className="bubble-line large">开售</div>
          </div>
          <div className="hero-headline">
            直刷乘车、出行乐无忧
          </div>
        </div>
      </div>
      
      {/* Carousel Dots */}
      <div className="carousel-dots">
        <span className="dot active"></span>
        <span className="dot"></span>
        <span className="dot"></span>
        <span className="dot"></span>
        <span className="dot"></span>
        <span className="dot"></span>
      </div>
    </div>
  );
};

export default Hero;

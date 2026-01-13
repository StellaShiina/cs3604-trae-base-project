import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './TicketSearchForm.css';

const TicketSearchForm = ({ initialType = 'one-way' }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useState({
    fromStation: '北京',
    toStation: '上海',
    date: new Date().toISOString().split('T')[0],
    type: initialType // 'one-way' or 'round-trip'
  });

  const handleSwap = () => {
    setSearchParams(prev => ({
      ...prev,
      fromStation: prev.toStation,
      toStation: prev.fromStation
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const queryString = new URLSearchParams(searchParams).toString();
    navigate(`/search?${queryString}`);
  };

  return (
    <div className="ticket-search-form">
      <div className="form-tabs">
        <div 
          className={`form-tab ${searchParams.type === 'one-way' ? 'active' : ''}`}
          onClick={() => setSearchParams({...searchParams, type: 'one-way'})}
        >
          单程
        </div>
        <div 
          className={`form-tab ${searchParams.type === 'round-trip' ? 'active' : ''}`}
          onClick={() => setSearchParams({...searchParams, type: 'round-trip'})}
        >
          往返
        </div>
      </div>

      <form onSubmit={handleSubmit} className="search-form-content">
        <div className="station-row">
          <div className="input-group">
            <label>出发地</label>
            <input 
              type="text" 
              value={searchParams.fromStation}
              onChange={(e) => setSearchParams({...searchParams, fromStation: e.target.value})}
              placeholder="简拼/全拼/汉字"
            />
          </div>
          <div className="swap-icon" onClick={handleSwap}>⇋</div>
          <div className="input-group">
            <label>到达地</label>
            <input 
              type="text" 
              value={searchParams.toStation}
              onChange={(e) => setSearchParams({...searchParams, toStation: e.target.value})}
              placeholder="简拼/全拼/汉字"
            />
          </div>
        </div>

        <div className="date-row">
          <div className="input-group">
            <label>出发日</label>
            <input 
              type="date" 
              value={searchParams.date}
              onChange={(e) => setSearchParams({...searchParams, date: e.target.value})}
            />
          </div>
          {searchParams.type === 'round-trip' && (
             <div className="input-group">
             <label>返程日</label>
             <input 
               type="date" 
               disabled={searchParams.type !== 'round-trip'}
             />
           </div>
          )}
        </div>

        <button type="submit" className="search-submit-btn">查询</button>
      </form>
    </div>
  );
};

export default TicketSearchForm;

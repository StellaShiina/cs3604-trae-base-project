import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import LoginModal from '../components/LoginModal';
import './SearchPage.css';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    fromStation: searchParams.get('fromStation') || '',
    toStation: searchParams.get('toStation') || '',
    date: searchParams.get('date') || '',
    type: searchParams.get('type') || 'one-way'
  });

  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [pendingTrain, setPendingTrain] = useState(null);

  const fetchTrains = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/tickets/query', { params: filters });
      if (res.data.code === 200) {
        setTrains(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch trains', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (filters.fromStation && filters.toStation) {
      fetchTrains();
    }
  }, [filters]);

  const handleBookTicket = (train) => {
    const user = localStorage.getItem('user');
    if (user) {
      navigate('/order', { state: { train } });
    } else {
      setPendingTrain(train);
      setIsLoginModalOpen(true);
    }
  };

  const handleLoginSuccess = (user) => {
    setIsLoginModalOpen(false);
    if (pendingTrain) {
      navigate('/order', { state: { train: pendingTrain } });
      setPendingTrain(null);
    }
  };

  return (
    <div className="search-page-container">
      <Header />
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
      
      {/* Search Bar Area */}
      <div className="search-toolbar">
        <div className="search-inputs">
          <input 
            value={filters.fromStation} 
            onChange={(e) => setFilters({...filters, fromStation: e.target.value})}
            placeholder="出发地"
          />
          <span className="arrow">→</span>
          <input 
            value={filters.toStation} 
            onChange={(e) => setFilters({...filters, toStation: e.target.value})}
            placeholder="到达地"
          />
          <input 
            type="date"
            value={filters.date} 
            onChange={(e) => setFilters({...filters, date: e.target.value})}
          />
          <button className="query-btn" onClick={fetchTrains}>查询</button>
        </div>
      </div>

      {/* Results Area */}
      <div className="results-container">
        <div className="filter-panel">
           <span>车次类型：全部</span>
           <span>出发车站：全部</span>
           {/* More filters */}
        </div>

        <div className="train-list">
          {loading ? <div>Loading...</div> : trains.length === 0 ? (
            <div className="no-results">暂无车次信息</div>
          ) : (
            trains.map((train, index) => (
              <div key={train.id || index} className="train-item">
                <div className="train-info-col train-number">
                    <div className="number">{train.trainNumber}</div>
                </div>
                <div className="train-info-col train-stations">
                    <div className="station start">
                        <span className="station-name">{train.fromStation}</span>
                        <span className="time">{train.departureTime}</span>
                    </div>
                    <div className="station end">
                        <span className="station-name">{train.toStation}</span>
                        <span className="time">{train.arrivalTime}</span>
                    </div>
                </div>
                <div className="train-info-col train-duration">
                    <span className="duration">{train.duration}</span>
                </div>
                <div className="train-info-col train-price">
                    {/* Mock Price display */}
                    <span>二等座: ¥{train.price?.second || '100'}</span>
                </div>
                <div className="train-info-col train-action">
                    <button className="book-btn" onClick={() => handleBookTicket(train)}>预订</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;

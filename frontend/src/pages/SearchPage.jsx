import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import LoginModal from '../components/LoginModal';
import CitySelector from '../components/CitySelector';
import './SearchPage.css';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
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
  const [seatFilters, setSeatFilters] = useState({
    business: false,
    first: false,
    second: false,
    hardSleeper: false,
    softSleeper: false
  });

  const [trainTypeFilters, setTrainTypeFilters] = useState({
    G: false,
    D: false,
    Z: false,
    T: false,
    K: false,
    fuxing: false
  });

  const fetchTrains = async () => {
    if (filters.fromStation && filters.toStation && filters.fromStation === filters.toStation) {
        alert('出发地和到达地不能相同');
        setTrains([]);
        return;
    }

    // Sync URL params
    setSearchParams(filters);

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

  const filteredTrains = trains.filter(train => {
    // Train Type Filter
    const activeTypes = [];
    if (trainTypeFilters.G) {
        activeTypes.push('G');
        activeTypes.push('C');
    }
    if (trainTypeFilters.D) activeTypes.push('D');
    if (trainTypeFilters.Z) activeTypes.push('Z');
    if (trainTypeFilters.T) activeTypes.push('T');
    if (trainTypeFilters.K) activeTypes.push('K');
    if (trainTypeFilters.fuxing) {
        activeTypes.push('G');
        activeTypes.push('C');
    }

    if (activeTypes.length > 0) {
        const firstLetter = train.trainNumber.charAt(0);
        // If activeTypes contains types, we filter.
        // Logic: Train must match ONE of the active types.
        if (!activeTypes.includes(firstLetter)) return false;
    }

    // Seat Type Filter
    const activeSeatTypes = Object.keys(seatFilters).filter(key => seatFilters[key]);
    if (activeSeatTypes.length > 0) {
        // Logic: if any selected seat type exists in train.price, keep it.
        // Actually usually we want AND? Or OR?
        // GUI test says: "点击“一等座”文字...列表中的每个车次必须包含优选一等座"
        // So we filter OUT trains that DON'T have the selected seat type.
        // If multiple selected? Usually intersection (AND) or union (OR). Let's assume OR for now, or per request.
        // Re-reading test: "点击...以勾选...列表中的每个车次必须包含..."
        // If I check Second AND First, it should probably have EITHER? Or BOTH? 
        // Let's assume if ANY checked filter is missing, we drop it? No, that's strict AND.
        // Let's implement: Train must have AT LEAST ONE of the selected available. 
        // Wait, "tickets-filter-seat-second-class.json": "列表中的每个车次必须包含优选二等座"
        // If I select Second, I only want trains with Second.
        
        // Simple Logic: For every checked filter key, the train MUST have that seat. (AND logic)
        for (const type of activeSeatTypes) {
            if (!train.price?.[type]) return false;
        }
    }

    return true;
  });

  useEffect(() => {
    if (filters.fromStation && filters.toStation) {
      fetchTrains();
    }
  }, [filters]);

  const handleBookTicket = (train) => {
    // Check both user object and token for robustness
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (user || token) {
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
          <CitySelector 
            value={filters.fromStation} 
            onChange={(val) => setFilters({ ...filters, fromStation: val })}
            placeholder="出发地"
          />
          <span className="arrow">→</span>
          <CitySelector 
            value={filters.toStation} 
            onChange={(val) => setFilters({ ...filters, toStation: val })}
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
           <div className="filter-row">
             <span className="filter-label">车次类型：</span>
             {['G', 'D', 'Z', 'T', 'K'].map(type => (
                <span 
                  key={type}
                  className={`filter-option ${trainTypeFilters[type] ? 'active' : ''}`}
                  onClick={() => setTrainTypeFilters(prev => ({ ...prev, [type]: !prev[type] }))}
                  style={{ cursor: 'pointer', marginRight: '10px', color: trainTypeFilters[type] ? '#007bff' : '#333', fontWeight: trainTypeFilters[type] ? 'bold' : 'normal' }}
                >
                  {type === 'G' ? 'GC-高铁/城际' : type}
                </span>
             ))}
             <span 
               className={`filter-option ${trainTypeFilters.fuxing ? 'active' : ''}`}
               onClick={() => setTrainTypeFilters(prev => ({ ...prev, fuxing: !prev.fuxing }))}
               style={{ cursor: 'pointer', marginRight: '10px', color: trainTypeFilters.fuxing ? '#007bff' : '#333', fontWeight: trainTypeFilters.fuxing ? 'bold' : 'normal' }}
             >
               复兴号
             </span>
           </div>
           <div className="filter-row">
             <span className="filter-label">席别类型：</span>
             <span 
               className={`filter-option ${seatFilters.business ? 'active' : ''}`}
               onClick={() => setSeatFilters(prev => ({ ...prev, business: !prev.business }))}
               style={{ cursor: 'pointer', marginRight: '10px', color: seatFilters.business ? '#007bff' : '#333', fontWeight: seatFilters.business ? 'bold' : 'normal' }}
             >
               商务座
             </span>
             <span 
               className={`filter-option ${seatFilters.first ? 'active' : ''}`}
               onClick={() => setSeatFilters(prev => ({ ...prev, first: !prev.first }))}
               style={{ cursor: 'pointer', marginRight: '10px', color: seatFilters.first ? '#007bff' : '#333', fontWeight: seatFilters.first ? 'bold' : 'normal' }}
             >
               一等座
             </span>
             <span 
               className={`filter-option ${seatFilters.second ? 'active' : ''}`}
               onClick={() => setSeatFilters(prev => ({ ...prev, second: !prev.second }))}
               style={{ cursor: 'pointer', marginRight: '10px', color: seatFilters.second ? '#007bff' : '#333', fontWeight: seatFilters.second ? 'bold' : 'normal' }}
             >
               二等座 Second Class Seat
             </span>
             {/* Add others if needed */}
           </div>
        </div>

        <div className="train-list">
          {loading ? <div>Loading...</div> : filteredTrains.length === 0 ? (
            <div className="no-results">未找到列车</div>
          ) : (
            filteredTrains.map((train, index) => (
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
                <div className="train-info-col train-price" style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px' }}>
                    {/* Mock Price display */}
                    {train.price?.business && <div>商务座: <span style={{color: '#fc8302'}}>¥{train.price.business}</span></div>}
                    {train.price?.first && <div>一等座: <span style={{color: '#fc8302'}}>¥{train.price.first}</span></div>}
                    {train.price?.second && <div>二等座: <span style={{color: '#fc8302'}}>¥{train.price.second}</span></div>}
                    {train.price?.softSleeper && <div>软卧: <span style={{color: '#fc8302'}}>¥{train.price.softSleeper}</span></div>}
                    {train.price?.hardSleeper && <div>硬卧: <span style={{color: '#fc8302'}}>¥{train.price.hardSleeper}</span></div>}
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

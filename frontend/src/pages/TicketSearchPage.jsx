import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import NavBar from '../components/NavBar';
import LoginModal from '../components/LoginModal';
import { queryTickets } from '../api';
import './TicketSearchPage.css';

const TicketSearchPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    trainType: { G: true, D: true, Z: true, T: true, K: true, Other: true }
  });
  
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingBooking, setPendingBooking] = useState(null);

  const query = {
    from: searchParams.get('from') || '北京',
    to: searchParams.get('to') || '上海',
    date: searchParams.get('date') || new Date().toISOString().split('T')[0]
  };

  const handleFilterChange = (type, checked) => {
    setFilters(prev => ({
      ...prev,
      trainType: { ...prev.trainType, [type]: checked }
    }));
  };

  const filteredTickets = tickets.filter(t => {
    const typeChar = t.train_no.charAt(0);
    const typeKey = ['G', 'D', 'Z', 'T', 'K'].includes(typeChar) ? typeChar : 'Other';
    return filters.trainType[typeKey];
  });

  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await queryTickets(query);
        if (res.success) {
          setTickets(res.data);
        } else {
          setError(res.error?.message || '查询失败');
        }
      } catch (err) {
        setError('网络错误，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [searchParams]);

  const handleBook = (ticket) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setPendingBooking(ticket);
      setShowLoginModal(true);
      return;
    }

    // Navigate to Order Page with ticket info
    const params = new URLSearchParams({
      trainNo: ticket.train_no,
      fromStation: ticket.from_station,
      toStation: ticket.to_station,
      date: query.date,
      departureTime: ticket.departure_time,
      arrivalTime: ticket.arrival_time,
      duration: ticket.duration
    }).toString();
    navigate(`/order?${params}`);
  };

  const handleLoginSuccess = (user) => {
    setShowLoginModal(false);
    if (pendingBooking) {
      handleBook(pendingBooking);
      setPendingBooking(null);
    }
  };

  const changeDate = (days) => {
    const currentDate = new Date(query.date);
    currentDate.setDate(currentDate.getDate() + days);
    const newDateStr = currentDate.toISOString().split('T')[0];
    
    // Update params
    const newParams = new URLSearchParams(searchParams);
    newParams.set('date', newDateStr);
    navigate(`/ticket-search?${newParams.toString()}`);
  };

  return (
    <div className="ticket-search-page">
      <Header />
      <NavBar />
      
      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal 
          onClose={() => setShowLoginModal(false)} 
          onSuccess={handleLoginSuccess} 
        />
      )}
      
      {/* Query Bar */}
      <div className="search-bar-container">
        <div className="search-bar">
          <div className="sb-item">
            <span className="sb-label">出发地</span>
            <span className="sb-value">{query.from}</span>
          </div>
          <div className="sb-swap">⇋</div>
          <div className="sb-item">
            <span className="sb-label">目的地</span>
            <span className="sb-value">{query.to}</span>
          </div>
          <div className="sb-item">
            <span className="sb-label">出发日</span>
            <span className="sb-value">{query.date}</span>
          </div>
          <button className="sb-btn">查询</button>
        </div>
      </div>

      {/* Date Tabs */}
      <div className="date-tabs">
        <div className="date-tab" onClick={() => changeDate(-1)}>前一天</div>
        <div className="date-tab active">
          {query.date} (查询日期)
        </div>
        <div className="date-tab" onClick={() => changeDate(1)}>后一天</div>
      </div>

      {/* Filter Section */}
      <div className="filter-section">
        <div className="filter-row">
          <span className="filter-label">车次类型：</span>
          <label><input type="checkbox" checked={filters.trainType.G} onChange={e => handleFilterChange('G', e.target.checked)} />GC-高铁/城际</label>
          <label><input type="checkbox" checked={filters.trainType.D} onChange={e => handleFilterChange('D', e.target.checked)} />D-动车</label>
          <label><input type="checkbox" checked={filters.trainType.Z} onChange={e => handleFilterChange('Z', e.target.checked)} />Z-直达</label>
          <label><input type="checkbox" checked={filters.trainType.T} onChange={e => handleFilterChange('T', e.target.checked)} />T-特快</label>
          <label><input type="checkbox" checked={filters.trainType.K} onChange={e => handleFilterChange('K', e.target.checked)} />K-快速</label>
          <label><input type="checkbox" checked={filters.trainType.Other} onChange={e => handleFilterChange('Other', e.target.checked)} />其他</label>
        </div>
      </div>

      {/* Results Table */}
      <div className="results-container">
        {loading && <div className="loading">查询中...</div>}
        {error && <div className="error">{error}</div>}
        
        {!loading && !error && (
          <table className="ticket-table">
            <thead>
              <tr>
                <th>车次</th>
                <th>出发站<br/>到达站</th>
                <th>出发时间<br/>到达时间</th>
                <th>历时</th>
                <th>商务座<br/>特等座</th>
                <th>一等座</th>
                <th>二等座</th>
                <th>软卧</th>
                <th>硬卧</th>
                <th>硬座</th>
                <th>无座</th>
                <th>备注</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map((ticket, index) => (
                <tr key={index} className={index % 2 === 0 ? 'even' : 'odd'}>
                  <td className="train-no">{ticket.train_no}</td>
                  <td>
                    <div className="station start">{ticket.from_station}</div>
                    <div className="station end">{ticket.to_station}</div>
                  </td>
                  <td>
                    <div className="time start">{ticket.departure_time}</div>
                    <div className="time end">{ticket.arrival_time}</div>
                  </td>
                  <td>{ticket.duration}</td>
                  <td>{ticket.business_seat || '--'}</td>
                  <td>{ticket.first_class || '--'}</td>
                  <td>{ticket.second_class || '--'}</td>
                  <td>{ticket.soft_sleeper || '--'}</td>
                  <td>{ticket.hard_sleeper || '--'}</td>
                  <td>{ticket.hard_seat || '--'}</td>
                  <td>{ticket.no_seat || '--'}</td>
                  <td>
                    <button className="book-btn" onClick={() => handleBook(ticket)}>预订</button>
                  </td>
                </tr>
              ))}
              {filteredTickets.length === 0 && !loading && (
                <tr>
                  <td colSpan="12" className="no-data">暂无车次信息</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default TicketSearchPage;

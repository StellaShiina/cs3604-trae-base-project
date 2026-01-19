import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import NavBar from '../components/NavBar';
import { queryTickets } from '../api';
import './TicketSearchPage.css';

const TicketSearchPage = () => {
  const [searchParams] = useSearchParams();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const query = {
    from: searchParams.get('from') || '北京',
    to: searchParams.get('to') || '上海',
    date: searchParams.get('date') || new Date().toISOString().split('T')[0]
  };

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

  return (
    <div className="ticket-search-page">
      <Header />
      <NavBar />
      
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
        <div className="date-tab active">
          {query.date} (查询日期)
        </div>
        {/* Placeholder for other dates */}
        <div className="date-tab">后一天</div>
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
              {tickets.map((ticket, index) => (
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
                    <button className="book-btn">预订</button>
                  </td>
                </tr>
              ))}
              {tickets.length === 0 && !loading && (
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

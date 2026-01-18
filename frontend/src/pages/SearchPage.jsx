import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import apiClient from '../api/index';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  
  useEffect(() => {
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const date = searchParams.get('date');
    if (from && to && date) {
      fetchTickets(from, to, date);
    }
  }, [searchParams]);

  const fetchTickets = async (from, to, date) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      // Fix: apiClient base is /api, so we need /v1/tickets
      const res = await apiClient.get('/v1/tickets', { params: { from, to, date } });
      if (res.data && res.data.code === 200) {
        setTickets(res.data.data);
      } else {
        setErrorMsg(res.data.message || 'Unknown error');
      }
    } catch (error) {
      console.error(error);
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="search-page" style={{ background: '#F5F7FA', minHeight: '100vh' }}>
      <Header />

      {/* Search Panel (Read Only / Simple Display for now) */}
      <div style={{ width: 1100, margin: '20px auto', background: 'white', padding: 20, border: '1px solid #BFD3EE' }}>
        <h3>
          {searchParams.get('from')} --&gt; {searchParams.get('to')} ({searchParams.get('date')})
        </h3>
      </div>

      <div className="content" style={{ width: 1100, margin: '0 auto', paddingBottom: 50 }}>
        {errorMsg && <div style={{ color: 'red', padding: 20 }}>Error: {errorMsg}</div>}
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="results-list">
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #BFD3EE', background: 'white' }}>
                <thead style={{ background: '#2F7EDB', color: 'white' }}>
                  <tr>
                    <th style={{ padding: 10 }}>车次</th>
                    <th style={{ padding: 10 }}>出发站/到达站</th>
                    <th style={{ padding: 10 }}>出发时间/到达时间</th>
                    <th style={{ padding: 10 }}>历时</th>
                    <th style={{ padding: 10 }}>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map(ticket => (
                    <tr key={ticket.code} style={{ borderBottom: '1px solid #eee', textAlign: 'center' }}>
                      <td style={{ padding: 15, fontWeight: 'bold' }}>{ticket.code}</td>
                      <td>
                        <div>{ticket.from_station}</div>
                        <div>{ticket.to_station}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 'bold' }}>{ticket.departure_time}</div>
                        <div style={{ color: '#999' }}>{ticket.arrival_time}</div>
                      </td>
                      <td>{ticket.duration}</td>
                      <td>
                        <button style={{ background: '#1677FF', color: 'white', border: 'none', padding: '5px 15px', borderRadius: 4 }}>
                          预订
                        </button>
                      </td>
                    </tr>
                  ))}
                  {tickets.length === 0 && (
                    <tr>
                      <td colSpan="5" style={{ padding: 20 }}>暂无车次信息</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;

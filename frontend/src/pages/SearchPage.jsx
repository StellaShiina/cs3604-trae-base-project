import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import apiClient from '../api/index';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const [tickets, setTickets] = useState([]);
  
  useEffect(() => {
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const date = searchParams.get('date');
    if (from && to && date) {
      // fetchTickets(from, to, date);
    }
  }, [searchParams]);

  return (
    <div className="search-page">
      <Header />
      <div className="content" style={{ padding: 20 }}>
        <h2>车票查询</h2>
        <div className="results-list">
           <p>查询结果 loading...</p>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import './SearchPage.css';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    fromStation: searchParams.get('fromStation') || '',
    toStation: searchParams.get('toStation') || '',
    date: searchParams.get('date') || '',
    type: searchParams.get('type') || 'one-way'
  });

  const [trains, setTrains] = useState([]);

  useEffect(() => {
    // In a real app, we would fetch data here based on filters
    // For now, mock data or empty list
    console.log('Searching for:', filters);
  }, [filters]);

  return (
    <div className="search-page-container">
      <Header />
      
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
          <button className="query-btn">查询</button>
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
          {trains.length === 0 ? (
            <div className="no-results">暂无车次信息</div>
          ) : (
            trains.map(train => (
              <div key={train.id} className="train-item">
                {/* Train details */}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;

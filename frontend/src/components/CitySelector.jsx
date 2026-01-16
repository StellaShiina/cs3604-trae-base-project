
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './CitySelector.css';

const CitySelector = ({ value, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    fetchStations();

    // Click outside handler
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchStations = async () => {
    try {
      setLoading(true);
      // Ensure we use the full path relative to api root setup in axios or proxy
      const res = await axios.get('/api/tickets/stations');
      if (res.data.code === 200) {
        setStations(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch stations', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (stationName) => {
    onChange(stationName);
    setIsOpen(false);
  };

  // Group stations by City? Or just flat list?
  // Requirements say "热门城市/车站列表". 
  // For simplicity, let's group by city if available, or just list distinct names.
  // The API returns [{id, name, code, city}, ...].
  
  // Let's create a "Hot Cities" or just list all grouped by City for better UX
  const groupedStations = stations.reduce((acc, station) => {
      const city = station.city;
      if (!acc[city]) {
          acc[city] = [];
      }
      acc[city].push(station);
      return acc;
  }, {});

  return (
    <div className="city-selector-container" ref={containerRef}>
      <input
        type="text"
        className="city-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
      />
      
      {isOpen && (
        <div className="city-dropdown">
          {loading ? (
            <div className="city-item">Loading...</div>
          ) : stations.length === 0 ? (
            <div className="city-item">No data</div>
          ) : (
            Object.keys(groupedStations).map(city => (
                <div key={city}>
                    <div className="city-group-title">{city}</div>
                    {groupedStations[city].map(station => (
                        <div 
                            key={station.id} 
                            className="city-item"
                            onClick={() => handleSelect(station.name)}
                        >
                            {station.name}
                        </div>
                    ))}
                </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default CitySelector;

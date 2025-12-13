import React, { useState } from 'react';
import './StationInput.css';
import { getAllStations, searchStations } from '../services/stationService';

interface StationInputProps {
  value: string;
  placeholder: string;
  type: 'departure' | 'arrival';
  onChange: (value: string) => void;
  onSelect: (station: string) => void;
}

/**
 * 站点输入组件
 * 实现站点搜索和推荐功能
 */
const StationInput: React.FC<StationInputProps> = ({
  value,
  placeholder,
  type: _type,
  onChange,
  onSelect,
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // 加载所有站点（当输入框获得焦点时）
  const handleFocus = async () => {
    setShowSuggestions(true);
    setIsLoading(true);
    setError('');

    try {
      const stations = await getAllStations();
      const stationNames = stations.map((station: any) => station.name);
      setSuggestions(stationNames);
      setIsLoading(false);
    } catch (err) {
      console.error('加载站点列表失败:', err);
      setError('加载站点列表失败');
      setSuggestions([]);
      setIsLoading(false);
    }
  };

  // 实时搜索站点
  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    onChange(inputValue);

    // 如果输入为空，显示所有站点
    if (!inputValue.trim()) {
      setIsLoading(true);
      try {
        const stations = await getAllStations();
        const stationNames = stations.map((station: any) => station.name);
        setSuggestions(stationNames);
        setIsLoading(false);
      } catch (err) {
        console.error('加载站点列表失败:', err);
        setSuggestions([]);
        setIsLoading(false);
      }
      return;
    }

    // 搜索匹配的站点
    setIsLoading(true);
    try {
      const stations = await searchStations(inputValue);
      const stationNames = stations.map((station: any) => station.name);
      setSuggestions(stationNames);
      setIsLoading(false);
    } catch (err) {
      console.error('搜索站点失败:', err);
      setSuggestions([]);
      setIsLoading(false);
    }
  };

  // 选择站点
  const handleSelectStation = (station: string) => {
    onSelect(station);
    setShowSuggestions(false);
  };

  return (
    <div className="station-input">
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        className="station-input-field"
      />
      {showSuggestions && (
        <div className="suggestions-dropdown">
          {isLoading && <div className="suggestion-item loading">加载中...</div>}
          {!isLoading && suggestions.length === 0 && (
            <div className="suggestion-item empty">暂无匹配站点</div>
          )}
          {!isLoading &&
            suggestions.map((station, index) => (
              <div
                key={index}
                className="suggestion-item"
                onClick={() => handleSelectStation(station)}
              >
                {station}
              </div>
            ))}
        </div>
      )}
      {error && <div className="input-error">{error}</div>}
    </div>
  );
};

export default StationInput;


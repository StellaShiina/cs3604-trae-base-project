import React, { useState } from 'react';
import './StationInput.css'; // 复用StationInput的样式
import { getAllCities } from '../services/stationService';

interface CityInputProps {
  value: string;
  placeholder: string;
  type: 'departure' | 'arrival';
  onChange: (value: string) => void;
  onSelect: (city: string) => void;
}

/**
 * 城市输入组件
 * 实现城市搜索和推荐功能
 */
const CityInput: React.FC<CityInputProps> = ({
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

  // 加载所有城市（当输入框获得焦点时）
  const handleFocus = async () => {
    setShowSuggestions(true);
    setIsLoading(true);
    setError('');

    try {
      const cities = await getAllCities();
      setSuggestions(cities);
      setIsLoading(false);
    } catch (err) {
      console.error('加载城市列表失败:', err);
      setError('加载城市列表失败');
      setSuggestions([]);
      setIsLoading(false);
    }
  };

  // 实时搜索城市
  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    onChange(inputValue);

    // 如果输入为空，显示所有城市
    if (!inputValue.trim()) {
      setIsLoading(true);
      try {
        const cities = await getAllCities();
        setSuggestions(cities);
        setIsLoading(false);
      } catch (err) {
        console.error('加载城市列表失败:', err);
        setSuggestions([]);
        setIsLoading(false);
      }
      return;
    }

    // 搜索匹配的城市（简单的前缀匹配）
    setIsLoading(true);
    try {
      const allCities = await getAllCities();
      const filteredCities = allCities.filter(city => 
        city.includes(inputValue)
      );
      setSuggestions(filteredCities);
      setIsLoading(false);
    } catch (err) {
      console.error('搜索城市失败:', err);
      setSuggestions([]);
      setIsLoading(false);
    }
  };

  // 选择城市
  const handleSelectCity = (city: string) => {
    onSelect(city);
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
            <div className="suggestion-item empty">暂无匹配城市</div>
          )}
          {!isLoading &&
            suggestions.map((city, index) => (
              <div
                key={index}
                className="suggestion-item"
                onClick={() => handleSelectCity(city)}
              >
                {city}
              </div>
            ))}
        </div>
      )}
      {error && <div className="input-error">{error}</div>}
    </div>
  );
};

export default CityInput;


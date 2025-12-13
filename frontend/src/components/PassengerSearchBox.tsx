import React, { useState } from 'react';
import './PassengerSearchBox.css';

interface PassengerSearchBoxProps {
  onSearch: (keyword: string) => void;
  placeholder: string;
}

/**
 * 乘客搜索框组件
 */
const PassengerSearchBox: React.FC<PassengerSearchBoxProps> = ({
  onSearch,
  placeholder,
}) => {
  const [searchKeyword, setSearchKeyword] = useState('');
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const keyword = e.target.value;
    setSearchKeyword(keyword);
    onSearch(keyword);
  };
  
  const handleClear = () => {
    setSearchKeyword('');
    onSearch('');
  };
  
  return (
    <div className="passenger-search-box">
      <input
        type="text"
        value={searchKeyword}
        onChange={handleChange}
        placeholder={placeholder}
        className="search-input"
      />
      {searchKeyword && (
        <button className="clear-button" onClick={handleClear}>
          ×
        </button>
      )}
      <span className="search-icon">🔍</span>
    </div>
  );
};

export default PassengerSearchBox;


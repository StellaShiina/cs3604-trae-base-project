// 订单搜索筛选组件
import React, { useState } from 'react';
import DatePicker from '../DatePicker';
import './OrderSearchFilter.css';

interface OrderSearchFilterProps {
  onSearch: (startDate: string, endDate: string, keyword: string, searchType?: string) => void;
  variant?: 'history' | 'unpaid';  // 区分历史订单和未出行订单
}

const OrderSearchFilter: React.FC<OrderSearchFilterProps> = ({ 
  onSearch,
  variant = 'history' 
}) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [keyword, setKeyword] = useState('');
  const [searchType, setSearchType] = useState('order-date'); // 'order-date' 或 'travel-date'

  // 设置默认日期范围（根据订单类型）
  React.useEffect(() => {
    const today = new Date();
    
    if (variant === 'history') {
      // 历史订单：默认近15天
      const fifteenDaysAgo = new Date(today);
      fifteenDaysAgo.setDate(today.getDate() - 15);
      setStartDate(fifteenDaysAgo.toISOString().split('T')[0]);
      setEndDate(today.toISOString().split('T')[0]);
    } else {
      // 未出行订单：默认今天到未来7天
      const sevenDaysLater = new Date(today);
      sevenDaysLater.setDate(today.getDate() + 7);
      setStartDate(today.toISOString().split('T')[0]);
      setEndDate(sevenDaysLater.toISOString().split('T')[0]);
    }
  }, [variant]);

  // 处理开始日期变化，确保开始日期不晚于结束日期
  const handleStartDateChange = (date: string) => {
    setStartDate(date);
    // 如果开始日期晚于结束日期，自动调整结束日期
    if (endDate && date > endDate) {
      setEndDate(date);
    }
  };

  // 处理结束日期变化，确保结束日期不早于开始日期
  const handleEndDateChange = (date: string) => {
    setEndDate(date);
    // 如果结束日期早于开始日期，自动调整开始日期
    if (startDate && date < startDate) {
      setStartDate(date);
    }
  };

  const handleSearch = () => {
    onSearch(startDate, endDate, keyword, searchType);
  };

  const handleClear = () => {
    setKeyword('');
  };

  // 计算日期范围（根据订单类型返回不同范围）
  const getDateRange = () => {
    const today = new Date();
    
    if (variant === 'history') {
      // 历史订单：过去30天到当前日期
      const minDate = new Date(today);
      minDate.setDate(today.getDate() - 30);
      const maxDate = new Date(today);
      
      return {
        minDate: minDate.toISOString().split('T')[0],
        maxDate: maxDate.toISOString().split('T')[0]
      };
    } else {
      // 未出行订单：今天到未来15天
      const minDate = new Date(today);
      const maxDate = new Date(today);
      maxDate.setDate(today.getDate() + 14); // 15天内（包括今天）
      
      return {
        minDate: minDate.toISOString().split('T')[0],
        maxDate: maxDate.toISOString().split('T')[0]
      };
    }
  };

  const dateRange = getDateRange();

  // 计算动态的日期范围限制
  const getStartDateRange = () => {
    // 开始日期：最小为基准最小日期，最大为当前结束日期或基准最大日期（取较小值）
    const maxForStart = endDate && endDate < dateRange.maxDate ? endDate : dateRange.maxDate;
    return {
      minDate: dateRange.minDate,
      maxDate: maxForStart
    };
  };

  const getEndDateRange = () => {
    // 结束日期：最小为当前开始日期或基准最小日期（取较大值），最大为基准最大日期
    const minForEnd = startDate && startDate > dateRange.minDate ? startDate : dateRange.minDate;
    return {
      minDate: minForEnd,
      maxDate: dateRange.maxDate
    };
  };

  const startDateRange = getStartDateRange();
  const endDateRange = getEndDateRange();

  // 历史订单：显示完整查询栏（一行显示）
  if (variant === 'history') {
    return (
      <div className="order-search-filter history-filter">
        <div className="filter-row single-row">
          <div className="filter-group dropdown-group">
            <select 
              className="filter-dropdown"
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
            >
              <option value="order-date">按订票日期查询</option>
              <option value="travel-date">按乘车日期查询</option>
            </select>
          </div>

          <div className="filter-group date-group">
            <DatePicker
              value={startDate}
              onChange={handleStartDateChange}
              minDate={startDateRange.minDate}
              maxDate={startDateRange.maxDate}
            />
            <span className="date-separator">-</span>
            <DatePicker
              value={endDate}
              onChange={handleEndDateChange}
              minDate={endDateRange.minDate}
              maxDate={endDateRange.maxDate}
            />
          </div>

          <div className="filter-group keyword-group">
            <input
              type="text"
              className="filter-input"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="订单号/车次/姓名"
            />
            <button className="clear-button" onClick={handleClear}>
              ✕
            </button>
          </div>

          <button className="order-search-button" onClick={handleSearch}>
            查询
          </button>
        </div>
      </div>
    );
  }

  // 未出行订单：显示带下拉框的查询栏
  return (
    <div className="order-search-filter unpaid-filter">
      <div className="filter-row single-row">
        <div className="filter-group dropdown-group">
          <select 
            className="filter-dropdown"
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
          >
            <option value="order-date">按订票日期查询</option>
            <option value="travel-date">按乘车日期查询</option>
          </select>
        </div>

        <div className="filter-group date-group">
          <DatePicker
            value={startDate}
            onChange={handleStartDateChange}
            minDate={startDateRange.minDate}
            maxDate={startDateRange.maxDate}
          />
          <span className="date-separator">-</span>
          <DatePicker
            value={endDate}
            onChange={handleEndDateChange}
            minDate={endDateRange.minDate}
            maxDate={endDateRange.maxDate}
          />
        </div>

        <div className="filter-group keyword-group">
          <input
            type="text"
            className="filter-input"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="订单号/车次/姓名"
          />
          <button className="clear-button" onClick={handleClear}>
            ✕
          </button>
        </div>

        <button className="order-search-button" onClick={handleSearch}>
          查询
        </button>
      </div>
    </div>
  );
};

export default OrderSearchFilter;


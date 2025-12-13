import React, { useState } from 'react';
import './TrainSearchForm.css';
import CityInput from './CityInput';
import DatePicker from './DatePicker';
import { validateCity } from '../services/stationService';
import { getTodayString, getDateAfterDays } from '../utils/dateUtils';

interface TrainSearchFormProps {
  onNavigateToTrainList: (params: any) => void;
}

/**
 * 车票查询表单组件
 */
const TrainSearchForm: React.FC<TrainSearchFormProps> = ({ onNavigateToTrainList }) => {
  const [departureStation, setDepartureStation] = useState('');
  const [arrivalStation, setArrivalStation] = useState('');
  // 默认日期设置为今天（使用本地时间）
  const [departureDate, setDepartureDate] = useState(getTodayString());
  const [isStudent, setIsStudent] = useState(false); // 【新增】学生票状态
  const [isHighSpeed, setIsHighSpeed] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // 实现交换出发地和到达地
  const handleSwapStations = () => {
    const temp = departureStation;
    setDepartureStation(arrivalStation);
    setArrivalStation(temp);
  };

  // 实现查询功能
  const handleSearch = async () => {
    const newErrors: { [key: string]: string } = {};

    // 验证出发城市
    if (!departureStation || departureStation.trim() === '') {
      newErrors.departure = '请选择出发城市';
      setErrors({ ...newErrors, general: '请选择出发城市' });
      return;
    }

    // 验证到达城市
    if (!arrivalStation || arrivalStation.trim() === '') {
      newErrors.arrival = '请选择到达城市';
      setErrors({ ...newErrors, general: '请选择到达城市' });
      return;
    }

    // 验证出发城市是否合法
    const departureResult = await validateCity(departureStation);
    if (!departureResult.valid) {
      // Check if this is a network error
      if (departureResult.error === '验证城市失败，请稍后重试') {
        setErrors({
          general: '查询失败，请稍后重试'
        });
        return;
      }
      setErrors({
        departure: departureResult.error || '无法匹配该出发城市',
        general: departureResult.error || '无法匹配该出发城市'
      });
      return;
    }

    // 验证到达城市是否合法
    const arrivalResult = await validateCity(arrivalStation);
    if (!arrivalResult.valid) {
      // Check if this is a network error
      if (arrivalResult.error === '验证城市失败，请稍后重试') {
        setErrors({
          general: '查询失败，请稍后重试'
        });
        return;
      }
      setErrors({
        arrival: arrivalResult.error || '无法匹配该到达城市',
        general: arrivalResult.error || '无法匹配该到达城市'
      });
      return;
    }

    // 所有验证通过，跳转到车次列表页
    setErrors({});
    onNavigateToTrainList({
      departureStation,
      arrivalStation,
      departureDate,
      isHighSpeed
    });
  };

  return (
    <div className="train-search-form">
      {/* 左侧三栏 - 横向显示文字 */}
      <div className="form-sidebar">
        <button className="sidebar-tab active">
          <span className="sidebar-icon sidebar-icon-train" aria-hidden="true" />
          <span>车票</span>
        </button>
        <button className="sidebar-tab">
          <span className="sidebar-icon sidebar-icon-query" aria-hidden="true" />
          <span>常用查询</span>
        </button>
        <button className="sidebar-tab">
          <span className="sidebar-icon sidebar-icon-meal" aria-hidden="true" />
          <span>订餐</span>
        </button>
      </div>
      
      <div className="search-form-container">
        {/* 车票内四个选项卡 - 只有下方蓝线 */}
        <div className="form-tabs">
          <button className="form-tab-button active">
            <span className="form-tab-icon form-tab-icon-single" aria-hidden="true" />
            <span>单程</span>
          </button>
          <button className="form-tab-button">
            <span className="form-tab-icon form-tab-icon-round" aria-hidden="true" />
            <span>往返</span>
          </button>
          <button className="form-tab-button">
            <span className="form-tab-icon form-tab-icon-transfer" aria-hidden="true" />
            <span>中转换乘</span>
          </button>
          <button className="form-tab-button">
            <span className="form-tab-icon form-tab-icon-ticket" aria-hidden="true" />
            <span>退改签</span>
          </button>
        </div>
        
        {/* 城市选择区域 - 带灰色折线和转换按钮 */}
        <div className="stations-container">
          {/* 出发城市 */}
          <div className="train-search-row-horizontal">
            <label className="field-label-left">出发城市</label>
            <div className="input-with-icon">
              <CityInput
                value={departureStation}
                placeholder="请选择城市"
                type="departure"
                onChange={setDepartureStation}
                onSelect={setDepartureStation}
              />
              <svg className="location-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#cccccc"/>
              </svg>
            </div>
          </div>

          {/* 灰色折线和转换按钮 */}
          <div className="connector-wrapper">
            <svg className="connector-line" width="40" height="90" viewBox="0 0 40 90">
              <path d="M0 10 H25 V80 H0" stroke="#e5e5e5" strokeWidth="2" fill="none"/>
            </svg>
            <button className="swap-button-center" onClick={handleSwapStations} aria-label="交换出发城市和到达城市">
              <span className="swap-icon" aria-hidden="true" />
            </button>
          </div>

          {/* 到达城市 */}
          <div className="train-search-row-horizontal">
            <label className="field-label-left">到达城市</label>
            <div className="input-with-icon">
              <CityInput
                value={arrivalStation}
                placeholder="请选择城市"
                type="arrival"
                onChange={setArrivalStation}
                onSelect={setArrivalStation}
              />
              <svg className="location-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#cccccc"/>
              </svg>
            </div>
          </div>
        </div>

        {/* 出发日期 */}
        <div className="train-search-row-horizontal date-row">
          <label className="field-label-left">出发日期</label>
          <div className="input-with-icon">
            <DatePicker
              value={departureDate}
              onChange={setDepartureDate}
              minDate={getTodayString()}
              maxDate={getDateAfterDays(14)}
            />
            <svg className="calendar-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z" fill="#cccccc"/>
            </svg>
          </div>
        </div>

        {/* 两个勾选框居中 */}
        <div className="train-search-row checkbox-row">
          <label className="checkbox-label">
            <span>学生</span>
            <input
              type="checkbox"
              checked={isStudent}
              onChange={(e) => setIsStudent(e.target.checked)}
            />
          </label>
          <label className="checkbox-label">
            <span>高铁/动车</span>
            <input
              type="checkbox"
              checked={isHighSpeed}
              onChange={(e) => setIsHighSpeed(e.target.checked)}
            />
          </label>
        </div>

        {/* 错误消息 */}
        {errors.general && <div className="train-search-error-message">{errors.general}</div>}

        {/* 查询按钮 */}
        <div className="train-search-row">
          <button className="search-button" onClick={handleSearch}>
            查    询
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrainSearchForm;


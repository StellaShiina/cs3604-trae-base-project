import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './TrainListPage.css';
import TrainListTopBar from '../components/TrainListTopBar';
import MainNavigation from '../components/MainNavigation';
import TrainSearchBar from '../components/TrainSearchBar';
import TrainFilterPanel from '../components/TrainFilterPanel';
import TrainList from '../components/TrainList';
import BottomNavigation from '../components/BottomNavigation';
import ConfirmModal from '../components/ConfirmModal';
import { searchTrains } from '../services/trainService';
import { getStationsByCity } from '../services/stationService';
import { getTodayString } from '../utils/dateUtils';

/**
 * 车次列表页主容器组件
 */
const TrainListPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [searchParams, setSearchParams] = useState<any>({
    departureStation: location.state?.departureStation || '',
    arrivalStation: location.state?.arrivalStation || '',
    departureDate: location.state?.departureDate || getTodayString(),
    isHighSpeed: location.state?.isHighSpeed || false
  });
  // 新增：已显示的查询参数（只在查询成功后更新，用于显示摘要信息）
  const [displayedQueryParams, setDisplayedQueryParams] = useState<any>({
    departureStation: location.state?.departureStation || '',
    arrivalStation: location.state?.arrivalStation || '',
    departureDate: location.state?.departureDate || getTodayString(),
  });
  const [trains, setTrains] = useState<any[]>([]);
  const [filteredTrains, setFilteredTrains] = useState<any[]>([]);
  const [filterOptions, setFilterOptions] = useState<any>({
    departureStations: [],
    arrivalStations: [],
    seatTypes: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [queryTimestamp, setQueryTimestamp] = useState<Date>(new Date());
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showUnpaidOrderModal, setShowUnpaidOrderModal] = useState(false);

  // 检查登录状态
  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem('authToken');
      setIsLoggedIn(!!token);
    };
    
    checkLoginStatus();
    
    // 监听storage事件，当其他标签页登录/登出时同步状态
    window.addEventListener('storage', checkLoginStatus);
    
    return () => {
      window.removeEventListener('storage', checkLoginStatus);
    };
  }, []);

  // 查询车次
  const fetchTrains = async (params: any) => {
    console.log('fetchTrains called with params:', params);
    
    if (!params.departureStation || !params.arrivalStation) {
      console.log('Missing required params, skipping fetch');
      return;
    }

    // 更新已显示的查询参数（用于摘要信息显示）
    setDisplayedQueryParams({
      departureStation: params.departureStation,
      arrivalStation: params.arrivalStation,
      departureDate: params.departureDate,
    });

    setIsLoading(true);
    setError('');
    console.log('Loading started...');

    try {
      // 构建车次类型筛选
      const trainTypes = params.isHighSpeed ? ['G', 'C', 'D'] : [];
      console.log('Train types filter:', trainTypes);

      // 搜索车次
      console.log('Calling searchTrains API...');
      const result = await searchTrains(
        params.departureStation,
        params.arrivalStation,
        params.departureDate,
        trainTypes
      );

      console.log('Search result:', result);

      if (!result.success) {
        throw new Error(result.error || '查询失败');
      }

      console.log('Found trains:', result.trains.length);
      setTrains(result.trains);
      setFilteredTrains(result.trains);
      setQueryTimestamp(new Date());

      // 获取城市的所有车站（而不是仅从当前车次列表中提取）
      console.log('Fetching all stations for cities...');
      const depStations = await getStationsByCity(params.departureStation);
      const arrStations = await getStationsByCity(params.arrivalStation);
      
      // 提取所有席别类型
      const seatTypesSet = new Set<string>();
      result.trains.forEach((train: any) => {
        if (train.availableSeats) {
          Object.keys(train.availableSeats).forEach(seatType => {
            seatTypesSet.add(seatType);
          });
        }
      });
      
      setFilterOptions({
        departureStations: depStations,
        arrivalStations: arrStations,
        seatTypes: Array.from(seatTypesSet)
      });
      
      console.log('Filter options:', {
        departureStations: depStations,
        arrivalStations: arrStations,
        seatTypes: Array.from(seatTypesSet)
      });

      setIsLoading(false);
      console.log('Loading complete!');
    } catch (error: any) {
      console.error('查询车次失败:', error);
      setError(error.message || '查询失败，请稍后重试');
      setTrains([]);
      setFilteredTrains([]);
      setIsLoading(false);
    }
  };

  // 从首页进入时，如果有搜索参数，立即查询
  useEffect(() => {
    console.log('TrainListPage mounted with params:', searchParams);
    if (searchParams.departureStation && searchParams.arrivalStation) {
      console.log('Fetching trains on mount...');
      fetchTrains(searchParams);
    }
  }, []);

  // 实现5分钟过期检查
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const timeDiff = now.getTime() - queryTimestamp.getTime();
      const fiveMinutesInMs = 5 * 60 * 1000;

      if (timeDiff > fiveMinutesInMs && trains.length > 0) {
        // 显示过期提示
        setError('页面内容已过期，请重新查询！');
      }
    }, 60000); // 每分钟检查一次

    return () => clearInterval(timer);
  }, [queryTimestamp, trains]);

  // 实现导航功能
  const handleNavigateToLogin = () => {
    navigate('/login');
  };

  const handleNavigateToRegister = () => {
    navigate('/register');
  };

  const handleNavigateToPersonalCenter = () => {
    if (isLoggedIn) {
      navigate('/personal-info');
    } else {
      navigate('/login');
    }
  };

  const handleMy12306Click = () => {
    if (isLoggedIn) {
      navigate('/personal-info');
    } else {
      navigate('/login');
    }
  };

  const handleNavigateToOrderPage = (trainNo: string) => {
    console.log('Navigate to order page for train:', trainNo);
    
    // 从车次列表中找到对应的车次信息
    const train = trains.find(t => t.trainNo === trainNo);
    if (!train) {
      setError('找不到车次信息');
      return;
    }
    
    console.log('Found train data:', {
      trainNo: train.trainNo,
      departureStation: train.departureStation,
      arrivalStation: train.arrivalStation,
      departureDate: train.departureDate
    });
    
    console.log('Original search params:', {
      departureStation: searchParams.departureStation,
      arrivalStation: searchParams.arrivalStation,
      departureDate: searchParams.departureDate
    });
    
    console.log('Actual train stations:', {
      departureStation: train.departureStation,
      arrivalStation: train.arrivalStation
    });
    
    // 跳转到订单填写页，传递完整的车次信息
    // 重要：使用车次的实际车站名（如"沧州西"），而不是搜索参数中的城市名（如"沧州"）
    navigate('/order', { 
      state: { 
        trainNo: train.trainNo,
        departureStation: train.departureStation,  // 使用车次的实际出发车站
        arrivalStation: train.arrivalStation,      // 使用车次的实际到达车站
        departureDate: train.departureDate
      } 
    });
  };

  // 实现筛选功能
  const handleFilterChange = (filters: any) => {
    console.log('Filter changed:', filters);
    
    // 基于原始车次列表进行筛选
    let filtered = [...trains];
    
    // 1. 按车次类型筛选
    if (filters.trainTypes && filters.trainTypes.length > 0) {
      filtered = filtered.filter(train => {
        const firstChar = train.trainNo.charAt(0);
        return filters.trainTypes.includes(firstChar);
      });
    }
    
    // 2. 按出发车站筛选
    if (filters.departureStations && filters.departureStations.length > 0) {
      filtered = filtered.filter(train => 
        filters.departureStations.includes(train.departureStation)
      );
    }
    
    // 3. 按到达车站筛选
    if (filters.arrivalStations && filters.arrivalStations.length > 0) {
      filtered = filtered.filter(train => 
        filters.arrivalStations.includes(train.arrivalStation)
      );
    }
    
    // 4. 按席别筛选（只显示有该席别的车次）
    if (filters.seatTypes && filters.seatTypes.length > 0) {
      filtered = filtered.filter(train => {
        return filters.seatTypes.some((seatType: string) => 
          train.availableSeats && train.availableSeats[seatType] !== undefined
        );
      });
    }
    
    // 5. 按发车时间筛选
    if (filters.departureTimeRange && filters.departureTimeRange !== '00:00--24:00') {
      const [startTime, endTime] = filters.departureTimeRange.split('--');
      filtered = filtered.filter(train => {
        if (!train.departureTime) return false;
        const trainTime = train.departureTime;
        return trainTime >= startTime && trainTime < endTime;
      });
    }
    
    console.log('Filtered trains:', filtered.length);
    setFilteredTrains(filtered);
  };

  // 处理日期变化（从日期标签点击）- 更新日期并触发搜索
  const handleDateChange = (newDate: string) => {
    console.log('Date changed to:', newDate);
    
    // 更新搜索参数
    const newSearchParams = {
      ...searchParams,
      departureDate: newDate
    };
    setSearchParams(newSearchParams);
    
    // 重新查询车次
    fetchTrains(newSearchParams);
  };

  // 处理日期更新（从出发日选择器改变）- 只更新日期显示，不触发搜索
  const handleDateUpdate = (newDate: string) => {
    console.log('Date updated to:', newDate);
    
    // 只更新搜索参数中的日期，不触发搜索
    setSearchParams({
      ...searchParams,
      departureDate: newDate
    });
  };

  // 获取用户名
  const username = isLoggedIn ? (localStorage.getItem('username') || localStorage.getItem('userId') || '用户') : '';

  return (
    <div className="train-list-page">
      <TrainListTopBar isLoggedIn={isLoggedIn} username={username} onMy12306Click={handleMy12306Click} />
      <MainNavigation
        isLoggedIn={isLoggedIn}
        onLoginClick={handleNavigateToLogin}
        onRegisterClick={handleNavigateToRegister}
        onPersonalCenterClick={handleNavigateToPersonalCenter}
      />
      <div className="train-list-content">
        <TrainSearchBar
          initialDepartureStation={searchParams.departureStation || ''}
          initialArrivalStation={searchParams.arrivalStation || ''}
          initialDepartureDate={searchParams.departureDate || ''}
          onSearch={(params) => {
            console.log('TrainSearchBar onSearch called with:', params);
            // 更新搜索参数状态
            setSearchParams(params);
            // 执行查询
            fetchTrains(params);
          }}
          onDateUpdate={handleDateUpdate}
        />
        <TrainFilterPanel
          onFilterChange={handleFilterChange}
          departureStations={filterOptions.departureStations || []}
          arrivalStations={filterOptions.arrivalStations || []}
          seatTypes={filterOptions.seatTypes || []}
          departureDate={searchParams.departureDate}
          onDateChange={handleDateChange}
          isHighSpeed={searchParams.isHighSpeed}
        />
        {error && <div className="train-list-error-message">{error}</div>}
        {isLoading ? (
          <div className="loading">加载中...</div>
               ) : (
                 <TrainList
                   trains={filteredTrains}
                   onReserve={handleNavigateToOrderPage}
                   isLoggedIn={isLoggedIn}
                   queryTimestamp={queryTimestamp.toISOString()}
                   departureCity={displayedQueryParams.departureStation}
                   arrivalCity={displayedQueryParams.arrivalStation}
                   departureDate={displayedQueryParams.departureDate}
                 />
               )}
      </div>
      <BottomNavigation />
      
      {/* 未支付订单提示弹窗 */}
      <ConfirmModal
        isVisible={showUnpaidOrderModal}
        title="提示"
        message={
          <span>
            您还有未处理的订单，请您到
            <span 
              className="link-text"
              onClick={() => {
                setShowUnpaidOrderModal(false);
                navigate('/orders');
              }}
            >
              [未完成订单]
            </span>
            进行处理！
          </span>
        }
        confirmText="确认"
        onConfirm={() => {
          // 点击"确认"：关闭弹窗，保持在车次列表页
          setShowUnpaidOrderModal(false);
        }}
      />
    </div>
  );
};

export default TrainListPage;


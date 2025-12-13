import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './OrderPage.css';
import TrainListTopBar from '../components/TrainListTopBar';
import MainNavigation from '../components/MainNavigation';
import TrainInfoSection from '../components/TrainInfoSection';
import PassengerInfoSection from '../components/PassengerInfoSection';
import OrderSubmitSection from '../components/OrderSubmitSection';
import WarmTipsSection from '../components/WarmTipsSection';
import BottomNavigation from '../components/BottomNavigation';
import OrderConfirmationModal from '../components/OrderConfirmationModal';
import ConfirmModal from '../components/ConfirmModal';
import { getCityByStation } from '../services/stationService';

/**
 * 订单填写页主容器组件
 */
const OrderPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 从路由参数获取车次信息
  const { trainNo, departureStation, arrivalStation, departureDate } = location.state || {};
  
  // 调试日志
  console.log('OrderPage received params:', {
    trainNo,
    departureStation,
    arrivalStation,
    departureDate,
  });
  
  const [trainInfo, setTrainInfo] = useState<any>(null);
  const [fareInfo, setFareInfo] = useState<any>(null);
  const [availableSeats, setAvailableSeats] = useState<any>(null);
  const [passengers, setPassengers] = useState<any[]>([]);
  const [selectedPassengers, setSelectedPassengers] = useState<string[]>([]);
  const [purchaseInfo, setPurchaseInfo] = useState<any[]>([]);
  const [defaultSeatType, setDefaultSeatType] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorModalMessage, setErrorModalMessage] = useState('');
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
  
  // 页面加载时获取车次信息和乘客列表
  useEffect(() => {
    const fetchOrderPageData = async () => {
      setIsLoading(true);
      setError('');
      
      try {
        // 获取用户登录token
        const token = localStorage.getItem('authToken');
        
        // 调用API获取订单页面数据
        const queryParams = new URLSearchParams({
          trainNo: trainNo || '',
          departureStation: departureStation || '',
          arrivalStation: arrivalStation || '',
          departureDate: departureDate || '',
        });
        
        console.log('Fetching order page data with params:', {
          trainNo,
          departureStation,
          arrivalStation,
          departureDate
        });
        console.log('Query string:', queryParams.toString());
        
        const response = await fetch(
          `/api/orders/new?${queryParams.toString()}`,
          {
            headers: {
              ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            },
          }
        );
        
        if (!response.ok) {
          const errorData = await response.json();
          
          // 如果是未登录错误，跳转到登录页
          if (response.status === 401) {
            setError('请先登录');
            navigate('/login');
            return;
          }
          
          // 如果有未支付订单，显示提示弹窗
          if (response.status === 403 && errorData.hasUnpaidOrder) {
            setShowUnpaidOrderModal(true);
            return;
          }
          
          throw new Error(errorData.error || '加载订单页失败');
        }
        
        const data = await response.json();
        setTrainInfo(data.trainInfo);
        setFareInfo(data.fareInfo);
        setAvailableSeats(data.availableSeats);
        setPassengers(data.passengers);
        setDefaultSeatType(data.defaultSeatType);
        
        // 初始化购票信息表格，默认有一个空行
        setPurchaseInfo([]);
      } catch (error: any) {
        setError(error.message || '加载订单页失败，请稍后重试');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (trainNo && departureStation && arrivalStation && departureDate) {
      fetchOrderPageData();
    } else {
      setError('缺少必要的车次信息');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trainNo, departureStation, arrivalStation, departureDate]);
  
  // 实现乘客选择逻辑
  const handlePassengerSelect = (passengerId: string, selected: boolean) => {
    const passenger = passengers.find(p => p.id === passengerId);
    if (!passenger) return;
    
    if (selected) {
      // 勾选乘客 - 添加到已选列表和购票信息
      setSelectedPassengers([...selectedPassengers, passengerId]);
      
      // 添加新的购票信息行
      const newPurchaseInfo = {
        passenger: passenger,
        ticketType: '成人票',
        seatType: defaultSeatType,
      };
      setPurchaseInfo([...purchaseInfo, newPurchaseInfo]);
    } else {
      // 取消勾选乘客 - 从已选列表和购票信息中移除
      setSelectedPassengers(selectedPassengers.filter(id => id !== passengerId));
      setPurchaseInfo(purchaseInfo.filter(info => info.passenger.id !== passengerId));
    }
  };
  
  // 实现席位变更逻辑
  const handleSeatTypeChange = (index: number, seatType: string) => {
    // 检查索引是否有效
    if (index < 0 || index >= purchaseInfo.length) {
      return; // 如果是空行（默认显示），不执行任何操作
    }
    
    const newPurchaseInfo = [...purchaseInfo];
    newPurchaseInfo[index] = {
      ...newPurchaseInfo[index],
      seatType: seatType,
    };
    setPurchaseInfo(newPurchaseInfo);
  };
  
  // 实现票种变更逻辑
  const handleTicketTypeChange = (index: number, ticketType: string) => {
    // 检查索引是否有效
    if (index < 0 || index >= purchaseInfo.length) {
      return; // 如果是空行（默认显示），不执行任何操作
    }
    
    const newPurchaseInfo = [...purchaseInfo];
    newPurchaseInfo[index] = {
      ...newPurchaseInfo[index],
      ticketType: ticketType,
    };
    setPurchaseInfo(newPurchaseInfo);
  };
  
  // 实现删除购票信息行的逻辑
  const handleDeleteRow = (index: number) => {
    const deletedInfo = purchaseInfo[index];
    // 从购票信息中移除
    setPurchaseInfo(purchaseInfo.filter((_, i) => i !== index));
    // 从已选乘客列表中移除
    setSelectedPassengers(selectedPassengers.filter(id => id !== deletedInfo.passenger.id));
  };
  
  // 实现返回车次列表页
  const handleBack = async () => {
    // 将车站名转换为城市名
    const departureCity = await getCityByStation(departureStation) || departureStation;
    const arrivalCity = await getCityByStation(arrivalStation) || arrivalStation;
    
    navigate('/trains', { 
      state: { 
        departureStation: departureCity, 
        arrivalStation: arrivalCity, 
        departureDate 
      } 
    });
  };
  
  // 实现提交订单逻辑
  const handleSubmit = async () => {
    // 验证至少选择一名乘客
    if (selectedPassengers.length === 0) {
      setErrorModalMessage('请选择乘车人！');
      setShowErrorModal(true);
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const token = typeof localStorage !== 'undefined' ? localStorage.getItem('authToken') : null;
      if (!token) {
        setError('请先登录');
        navigate('/login');
        return;
      }
      
      // 准备乘客数据
      const passengersData = purchaseInfo.map(info => ({
        passengerId: info.passenger.id,
        ticketType: info.ticketType,
        seatType: info.seatType,
      }));
      
      // 调用API提交订单
      const response = await fetch('/api/orders/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          trainNo,
          departureStation,
          arrivalStation,
          departureDate,
          passengers: passengersData,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        
        // 特殊处理：如果是车票售罄，跳转回车次列表页
        if (errorData.error === '手慢了，该车次车票已售罄！') {
          setErrorModalMessage(errorData.error);
          setShowErrorModal(true);
          setTimeout(() => {
            setShowErrorModal(false);
            navigate('/trains');
          }, 1500);
          return;
        }
        
        throw new Error(errorData.error || '提交订单失败');
      }
      
      const data = await response.json();
      setOrderId(data.orderId);
      
      // 显示信息核对弹窗
      setShowConfirmModal(true);
    } catch (error: any) {
      setErrorModalMessage(error.message || '网络忙，请稍后再试。');
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };
  
  // 实现订单确认逻辑（空函数，实际逻辑在OrderConfirmationModal内部）
  const handleConfirmOrder = async () => {
    // OrderConfirmationModal内部已经处理了确认订单的API调用和显示逻辑
    // 这里只是一个占位符，保持接口一致性
  };
  
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
  
  // 获取用户名
  const username = isLoggedIn ? (localStorage.getItem('username') || localStorage.getItem('userId') || '用户') : '';
  
  return (
    <div className="order-page">
      <TrainListTopBar isLoggedIn={isLoggedIn} username={username} onMy12306Click={handleMy12306Click} />
      <MainNavigation
        isLoggedIn={isLoggedIn}
        onLoginClick={handleNavigateToLogin}
        onRegisterClick={handleNavigateToRegister}
        onPersonalCenterClick={handleNavigateToPersonalCenter}
      />
      
      <main className="order-main">
        {isLoading ? (
          <div className="loading">加载中...</div>
        ) : error ? (
          <div className="order-page-error-message">{error}</div>
        ) : (
          <>
            <TrainInfoSection
              trainInfo={trainInfo}
              fareInfo={fareInfo}
              availableSeats={availableSeats}
            />
            
            <PassengerInfoSection
              passengers={passengers}
              onPassengerSelect={handlePassengerSelect}
              onSearchPassenger={() => {}}
              availableSeatTypes={fareInfo ? Object.keys(fareInfo).filter(key => fareInfo[key].available > 0) : []}
              defaultSeatType={defaultSeatType}
              selectedPassengers={selectedPassengers}
              purchaseInfo={purchaseInfo}
              onSeatTypeChange={handleSeatTypeChange}
              onTicketTypeChange={handleTicketTypeChange}
              onDeleteRow={handleDeleteRow}
              fareInfo={fareInfo}
            />
            
            <OrderSubmitSection
              onSubmit={handleSubmit}
              onBack={handleBack}
              isSubmitting={isLoading}
            />
            
            <WarmTipsSection onTermsClick={() => {}} />
          </>
        )}
      </main>
      
      <BottomNavigation />
      
      {showConfirmModal && (
        <OrderConfirmationModal
          isVisible={showConfirmModal}
          orderId={orderId}
          onConfirm={handleConfirmOrder}
          onBack={() => setShowConfirmModal(false)}
          onSuccess={() => {
            // 购买成功后返回首页查询页
            navigate('/');
          }}
        />
      )}
      
      {showErrorModal && (
        <ConfirmModal
          isVisible={showErrorModal}
          title="提示"
          message={errorModalMessage}
          confirmText="确认"
          cancelText=""
          onConfirm={() => setShowErrorModal(false)}
          onCancel={() => setShowErrorModal(false)}
        />
      )}
      
      {/* 未支付订单提示弹窗 */}
      {showUnpaidOrderModal && (
        <ConfirmModal
          isVisible={showUnpaidOrderModal}
          title="提示"
          message={
            <span>
              您还有未处理的订单，请您到
              <a
                href="#"
                style={{ margin: '0 6px' }}
                onClick={(e) =>  {
                  e.preventDefault();
                  setShowUnpaidOrderModal(false);
                  navigate('/personal-info', { 
                    state: { defaultTab: 'order', defaultSubTab: 'pending' } 
                  });
                }}
                aria-label="跳转到未完成订单"
              >
                未完成订单
              </a>
              进行处理！
            </span>
          }
          confirmText="确认"
          onConfirm={async () => {
            setShowUnpaidOrderModal(false);
            // 将车站名转换为城市名
            const departureCity = await getCityByStation(departureStation) || departureStation;
            const arrivalCity = await getCityByStation(arrivalStation) || arrivalStation;
            
            navigate('/trains', { 
              state: {
                departureStation: departureCity,
                arrivalStation: arrivalCity,
                departureDate
              }
            });
          }}
        />
      )}
    </div>
  );
};

export default OrderPage;

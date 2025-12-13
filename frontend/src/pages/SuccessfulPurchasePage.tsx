import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './SuccessfulPurchasePage.css';
import TrainListTopBar from '../components/TrainListTopBar';
import MainNavigation from '../components/MainNavigation';
import BottomNavigation from '../components/BottomNavigation';
import SuccessBanner from '../components/SuccessBanner';
import SuccessOrderInfo from '../components/SuccessOrderInfo';

/**
 * 购票成功页
 */
const SuccessfulPurchasePage: React.FC = () => {
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();
  
  const [orderData, setOrderData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 检查登录状态
  useEffect(() => {
    const checkLoginStatus = () => {
      setIsLoggedIn(!!localStorage.getItem('authToken'));
    };
    
    checkLoginStatus();
    window.addEventListener('storage', checkLoginStatus);
    
    return () => {
      window.removeEventListener('storage', checkLoginStatus);
    };
  }, []);

  // 加载订单数据
  useEffect(() => {
    if (!orderId) return;

    const fetchOrderData = async () => {
      setIsLoading(true);
      setError('');

      try {
        const token = localStorage.getItem('authToken');
        // 从订单详情获取数据
        const detailResponse = await fetch(`/api/orders/${orderId}/confirmation`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!detailResponse.ok) {
          throw new Error('获取订单信息失败');
        }

        const detailData = await detailResponse.json();
        // 生成订单号（EA + 8位字符）
        const orderNumber = 'EA' + orderId.substring(0, 8).toUpperCase().replace(/-/g, '');
        
        // 构造成功页数据
        setOrderData({
          orderNumber,
          trainInfo: detailData.trainInfo,
          passengers: detailData.passengers.map((p: any) => ({
            sequence: p.sequence,
            name: p.name,
            idCardType: p.idCardType,
            idCardNumber: p.idCardNumber,
            ticketType: p.ticketType,
            seatType: p.seatType,
            carNumber: p.carNumber,
            seatNumber: p.seatNumber,
            price: p.price || 0
          })),
          totalPrice: detailData.totalPrice
        });
      } catch (err: any) {
        setError(err.message || '加载失败');
        console.error('加载订单数据失败:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderData();
  }, [orderId]);

  // 处理导航
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

  const handleContinuePurchase = () => {
    navigate('/trains');
  };

  const handleViewOrderDetails = () => {
    navigate('/orders', { state: { orderId } });
  };

  const username = isLoggedIn ? (localStorage.getItem('username') || localStorage.getItem('userId') || '用户') : '';

  const handleFoodClick = () => {
    // 餐饮特产功能
  };

  if (isLoading) {
    return (
      <div className="successful-purchase-page">
        <div className="loading">加载中...</div>
      </div>
    );
  }

  if (error && !orderData) {
    return (
      <div className="successful-purchase-page">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="successful-purchase-page">
      <TrainListTopBar 
        isLoggedIn={isLoggedIn} 
        username={username} 
        onMy12306Click={handleMy12306Click} 
      />
      <MainNavigation
        isLoggedIn={isLoggedIn}
        onLoginClick={handleNavigateToLogin}
        onRegisterClick={handleNavigateToRegister}
        onPersonalCenterClick={handleNavigateToPersonalCenter}
      />

      <main className="successful-purchase-main">
        {/* 成功提示区域 */}
        {orderData && (
          <SuccessBanner
            orderNumber={orderData.orderNumber}
            passengers={orderData.passengers}
          />
        )}

        {/* 订单信息区（包含所有内容） */}
        {orderData && (
          <SuccessOrderInfo
            trainInfo={orderData.trainInfo}
            passengers={orderData.passengers}
            totalPrice={orderData.totalPrice}
            onFoodClick={handleFoodClick}
            onContinuePurchase={handleContinuePurchase}
            onViewDetails={handleViewOrderDetails}
          />
        )}
      </main>

      <BottomNavigation />
    </div>
  );
};

export default SuccessfulPurchasePage;


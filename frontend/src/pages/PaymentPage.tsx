import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './PaymentPage.css';
import TrainListTopBar from '../components/TrainListTopBar';
import MainNavigation from '../components/MainNavigation';
import BottomNavigation from '../components/BottomNavigation';
import PaymentCountdownTimer from '../components/PaymentCountdownTimer';
import OrderInfoDisplay from '../components/OrderInfoDisplay';
import CancelOrderModal from '../components/CancelOrderModal';
import TimeoutModal from '../components/TimeoutModal';

/**
 * 订单支付页
 */
const PaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();
  
  const [paymentData, setPaymentData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // 检查登录状态
  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem('authToken');
      setIsLoggedIn(!!token);
      if (!token) {
        navigate('/login');
      }
    };
    
    checkLoginStatus();
    window.addEventListener('storage', checkLoginStatus);
    
    return () => {
      window.removeEventListener('storage', checkLoginStatus);
    };
  }, [navigate]);

  // 加载支付页面数据
  useEffect(() => {
    if (!orderId || !isLoggedIn) return;

    const fetchPaymentData = async () => {
      setIsLoading(true);
      setError('');

      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`/api/payment/${orderId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          if (response.status === 400 && errorData.error?.includes('过期')) {
            setShowTimeoutModal(true);
            return;
          }
          throw new Error(errorData.error || '获取支付页面数据失败');
        }

        const data = await response.json();
        setPaymentData(data);
      } catch (err: any) {
        setError(err.message || '加载失败');
        console.error('加载支付页面数据失败:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaymentData();
  }, [orderId, isLoggedIn]);

  // 处理取消订单
  const handleCancelOrder = async () => {
    if (!orderId) return;

    setIsProcessing(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/payment/${orderId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '取消订单失败');
      }

      // 取消成功，跳转到车次列表页
      navigate('/trains');
    } catch (err: any) {
      setError(err.message || '取消订单失败');
      console.error('取消订单失败:', err);
    } finally {
      setIsProcessing(false);
      setShowCancelModal(false);
    }
  };

  // 处理确认支付
  const handleConfirmPayment = async () => {
    if (!orderId) return;

    setIsProcessing(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/payment/${orderId}/confirm`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 400 && errorData.error?.includes('过期')) {
          setShowTimeoutModal(true);
          return;
        }
        throw new Error(errorData.error || '支付失败');
      }

      // 支付成功，跳转到购票成功页
      navigate(`/purchase-success/${orderId}`);
    } catch (err: any) {
      setError(err.message || '支付失败');
      console.error('支付失败:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // 处理倒计时超时
  const handleTimeout = () => {
    setShowTimeoutModal(true);
  };

  // 处理超时弹窗确认
  const handleTimeoutConfirm = () => {
    setShowTimeoutModal(false);
    navigate('/trains');
  };

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

  const username = isLoggedIn ? (localStorage.getItem('username') || localStorage.getItem('userId') || '用户') : '';

  if (isLoading) {
    return (
      <div className="payment-page">
        <div className="loading">加载中...</div>
      </div>
    );
  }

  if (error && !paymentData) {
    return (
      <div className="payment-page">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="payment-page">
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

      <main className="payment-main">
        {/* 席位锁定时效倒计时区域 */}
        {paymentData && (
          <PaymentCountdownTimer
            orderId={orderId!}
            initialTimeRemaining={paymentData.timeRemaining}
            onTimeout={handleTimeout}
          />
        )}

        {/* 订单信息与确认支付区（包含按钮和温馨提示） */}
        {paymentData && (
          <OrderInfoDisplay
            trainInfo={paymentData.trainInfo}
            passengers={paymentData.passengers}
            totalPrice={paymentData.totalPrice}
            onCancelOrder={() => setShowCancelModal(true)}
            onConfirmPayment={handleConfirmPayment}
            isProcessing={isProcessing}
          />
        )}

        {error && (
          <div className="error-message">{error}</div>
        )}
      </main>

      <BottomNavigation />

      {/* 取消订单确认弹窗 */}
      <CancelOrderModal
        isVisible={showCancelModal}
        onConfirm={handleCancelOrder}
        onCancel={() => setShowCancelModal(false)}
      />

      {/* 超时提示弹窗 */}
      <TimeoutModal
        isVisible={showTimeoutModal}
        onConfirm={handleTimeoutConfirm}
      />
    </div>
  );
};

export default PaymentPage;


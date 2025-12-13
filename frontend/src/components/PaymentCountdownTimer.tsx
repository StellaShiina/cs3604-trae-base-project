import React, { useState, useEffect } from 'react';
import './PaymentCountdownTimer.css';

interface PaymentCountdownTimerProps {
  orderId: string;
  initialTimeRemaining?: number; // 初始剩余时间（秒）
  onTimeout?: () => void;
}

/**
 * 支付倒计时组件
 */
const PaymentCountdownTimer: React.FC<PaymentCountdownTimerProps> = ({
  orderId,
  initialTimeRemaining,
  onTimeout
}) => {
  const [timeRemaining, setTimeRemaining] = useState<number>(initialTimeRemaining || 0);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    // 如果提供了初始时间，使用它
    if (initialTimeRemaining !== undefined) {
      setTimeRemaining(initialTimeRemaining);
    } else {
      // 否则从后端获取
      fetchTimeRemaining();
    }
  }, [orderId, initialTimeRemaining]);

  const fetchTimeRemaining = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/payment/${orderId}/time-remaining`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTimeRemaining(data.timeRemaining || 0);
      }
    } catch (error) {
      console.error('获取剩余时间失败:', error);
    }
  };

  useEffect(() => {
    if (timeRemaining <= 0) {
      setIsExpired(true);
      if (onTimeout) {
        onTimeout();
      }
      return;
    }

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsExpired(true);
          if (onTimeout) {
            onTimeout();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeRemaining, onTimeout]);

  // 每30秒同步一次服务器时间
  useEffect(() => {
    const syncInterval = setInterval(() => {
      fetchTimeRemaining();
    }, 30000);

    return () => clearInterval(syncInterval);
  }, [orderId]);

  const formatTime = (seconds: number): string => {
    if (seconds <= 0) return '00分00秒';
    
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    
    return `${String(minutes).padStart(2, '0')}分${String(secs).padStart(2, '0')}秒`;
  };

  const isWarning = timeRemaining < 300; // 小于5分钟时显示警告

  return (
    <div className={`payment-countdown-timer ${isExpired ? 'payment-countdown-expired' : ''} ${isWarning ? 'payment-countdown-warning' : ''}`}>
      <div className="payment-countdown-icon">
        <img src="/images/lock.png" alt="锁定" />
      </div>
      <span className="payment-countdown-text">
        席位已锁定，请在提示时间内尽快完成支付，完成网上购票。支付剩余时间：<span className="payment-countdown-time">{formatTime(timeRemaining)}</span>
      </span>
    </div>
  );
};

export default PaymentCountdownTimer;

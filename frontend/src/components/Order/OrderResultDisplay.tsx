// 订单结果展示组件
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OrderItem from './OrderItem';
import CancelOrderModal from '../CancelOrderModal';
import './OrderResultDisplay.css';

interface OrderResultDisplayProps {
  orders: any[];
  onNavigateToTrainList: () => void;
  showEmptyState?: boolean;  // 是否显示空状态（只有未完成订单显示）
  onOrderCancelled?: () => void;  // 订单取消后的回调
}

const OrderResultDisplay: React.FC<OrderResultDisplayProps> = ({
  orders,
  onNavigateToTrainList,
  showEmptyState = true,
  onOrderCancelled
}) => {
  const navigate = useNavigate();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const handlePayOrder = (orderId: string) => {
    navigate(`/payment/${orderId}`);
  };

  const handleCancelOrder = (orderId: string) => {
    setOrderToCancel(orderId);
    setShowCancelModal(true);
  };

  const confirmCancelOrder = async () => {
    if (!orderToCancel) return;
    
    setIsCancelling(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/payment/${orderToCancel}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '取消订单失败');
      }

      // 取消成功，关闭弹窗并刷新订单列表
      setShowCancelModal(false);
      setOrderToCancel(null);
      
      // 调用父组件的回调来刷新订单列表
      if (onOrderCancelled) {
        onOrderCancelled();
      }
    } catch (error: any) {
      console.error('取消订单失败:', error);
      alert(error.message || '取消订单失败，请重试');
    } finally {
      setIsCancelling(false);
    }
  };
  // 如果没有订单且需要显示空状态（仅未完成订单）
  if (orders.length === 0 && showEmptyState) {
    return (
      <div className="order-result-display empty">
        <div className="empty-icon">
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
            <rect x="20" y="30" width="80" height="60" rx="4" stroke="#2196f3" strokeWidth="2" fill="none"/>
            <circle cx="50" cy="65" r="15" stroke="#2196f3" strokeWidth="2" fill="none"/>
            <line x1="62" y1="76" x2="75" y2="89" stroke="#2196f3" strokeWidth="2"/>
            <line x1="30" y1="45" x2="70" y2="45" stroke="#2196f3" strokeWidth="2"/>
            <line x1="30" y1="55" x2="55" y2="55" stroke="#2196f3" strokeWidth="2"/>
          </svg>
        </div>
        <p className="empty-message">
          您没有对应的订单内容哦~
          <br />
          您可以通过
          <span className="link" onClick={onNavigateToTrainList}>车票预订</span>
          功能，来制定出行计划。
        </p>
      </div>
    );
  }

  // 其他情况：显示表头和订单列表（即使列表为空）
  return (
    <div className="order-result-display">
      {/* 表格表头 */}
      <div className="order-table">
        <div className="order-table-header">
          <div className="order-header-cell order-train-info-col">车次信息</div>
          <div className="order-header-cell order-passenger-info-col">旅客信息</div>
          <div className="order-header-cell order-seat-info-col">席位信息</div>
          <div className="order-header-cell order-price-col">票价</div>
          <div className="order-header-cell order-status-col">车票状态</div>
        </div>

        {/* 订单列表 */}
        <div className="order-table-body">
          {orders.map((order) => (
            <OrderItem 
              key={order.id} 
              order={order}
              onPayOrder={() => handlePayOrder(order.id)}
              onCancelOrder={() => handleCancelOrder(order.id)}
            />
          ))}
        </div>
      </div>

      {/* 取消订单确认弹窗 */}
      {showCancelModal && (
        <CancelOrderModal
          isVisible={showCancelModal}
          onConfirm={confirmCancelOrder}
          onCancel={() => {
            setShowCancelModal(false);
            setOrderToCancel(null);
          }}
          isLoading={isCancelling}
        />
      )}
    </div>
  );
};

export default OrderResultDisplay;


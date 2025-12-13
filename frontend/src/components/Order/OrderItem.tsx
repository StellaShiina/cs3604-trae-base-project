// 订单项组件
import React, { useState } from 'react';
import './OrderItem.css';
import { formatSeatInfoForDisplay } from '../../utils/seatNumberFormatter';

interface OrderItemProps {
  order: any;
  onViewDetails?: () => void;
  onCancelOrder?: () => void;
  onPayOrder?: () => void;
}

const OrderItem: React.FC<OrderItemProps> = ({ 
  order, 
  onViewDetails, 
  onCancelOrder,
  onPayOrder 
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  // 格式化状态显示
  const formatStatus = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'pending': '待支付',
      'confirmed_unpaid': '待支付',
      'paid': '已支付',
      'completed': '已完成',
      'cancelled': '已取消'
    };
    return statusMap[status] || status;
  };

  // 格式化座位信息
  const formatSeatInfo = (passenger: any, status: string) => {
    // 已确认未支付（confirmed_unpaid）、已支付（paid）或已完成（completed）的订单，如果有座位号则显示完整信息
    if ((status === 'confirmed_unpaid' || status === 'paid' || status === 'completed') && passenger.seat_number) {
      const seatType = passenger.seat_type || passenger.seatType || '二等座';
      return formatSeatInfoForDisplay(passenger.seat_number, passenger.car_number, seatType);
    } else if (passenger.car_number && !passenger.seat_number) {
      // 有车厢号但没有座位号（pending 状态）
      return `${String(passenger.car_number).padStart(2, '0')}车`;
    } else {
      // 没有分配座位
      return '待分配';
    }
  };

  // 获取乘客列表，如果没有则创建默认数据
  const passengers = order.passengers && order.passengers.length > 0 
    ? order.passengers 
    : [{
        passenger_name: order.passenger_name || '乘客',
        seat_type: order.seat_type || '二等座',
        seat_number: order.seat_number || null,
        car_number: order.car_number || null,
        ticket_type: order.ticket_type || '成人票'
      }];

  // 计算单价
  const singlePrice = order.total_price / passengers.length;

  return (
    <div className="order-item">
      {/* 订单日期 */}
      <div className="order-item-date-row" onClick={() => setIsExpanded(!isExpanded)}>
        <svg className="order-item-date-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="7" stroke="#2876c8" strokeWidth="1.5" fill="#f0f8ff"/>
          <path 
            d={isExpanded ? "M5 10 L8 7 L11 10 Z" : "M5 6 L8 9 L11 6 Z"} 
            fill="#2876c8"
          />
        </svg>
        <span className="order-item-date-label">订票日期：</span>
        <span className="order-item-date-value">{order.created_at ? order.created_at.split(' ')[0] : order.departure_date}</span>
        <span className="order-item-number-label">订单号：</span>
        <span className="order-item-number-value">{order.id}</span>
      </div>

      {/* 订单主体信息 - 表格行 */}
      {isExpanded && (
      <div className="order-item-main-content">
        {/* 车次信息列（只显示一次）*/}
        <div className="order-item-cell order-item-train-cell">
          <div className="order-item-train-route">
            <span className="order-item-train-from">{order.departure_station}</span>
            <span className="order-item-train-arrow">→</span>
            <span className="order-item-train-to">{order.arrival_station}</span>
            <span className="order-item-train-number">{order.train_no}</span>
          </div>
          <div className="order-item-train-datetime">
            {order.departure_date}
            <span className="order-item-train-time">{order.departure_time ? ` ${order.departure_time}开` : ' 开'}</span>
          </div>
        </div>

        {/* 右侧乘客信息区域（分成多行）*/}
        <div className="order-item-passengers-info-area">
          {passengers.map((passenger: any, index: number) => (
            <div key={index} className="order-item-passenger-row">
              {/* 旅客信息列 */}
              <div className="order-item-cell order-item-passenger-cell">
                <div className="order-item-passenger-name">{passenger.passenger_name}</div>
                <div className="order-item-passenger-id-type">{passenger.id_card_type || '居民身份证'}</div>
              </div>

              {/* 席位信息列 */}
              <div className="order-item-cell order-item-seat-cell">
                <div className="order-item-seat-detail">
                  {passenger.seat_type}
                  <br />
                  {formatSeatInfo(passenger, order.status)}
                </div>
              </div>

              {/* 票价列 */}
              <div className="order-item-cell order-item-price-cell">
                <div className="order-item-price-detail">
                  <div className="order-item-ticket-type">{passenger.ticket_type || '成人票'}</div>
                  <div className="order-item-price-amount">
                    <span className="order-item-price-value">{singlePrice.toFixed(1)}元</span>
                    {order.discount && (
                      <span className="order-item-price-discount">{order.discount}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* 车票状态列 */}
              <div className="order-item-cell order-item-status-cell">
                <div className="order-item-status-value">{formatStatus(order.status)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      )}

      {/* 订单操作按钮 */}
      {isExpanded && (order.status === 'pending' || order.status === 'confirmed_unpaid') && (
        <div className="order-item-actions">
          <button className="order-item-action-button order-item-cancel-button" onClick={onCancelOrder}>
            取消订单
          </button>
          <button className="order-item-action-button order-item-pay-button" onClick={onPayOrder}>
            去支付
          </button>
        </div>
      )}

      {isExpanded && onViewDetails && order.status !== 'pending' && (
        <div className="order-item-footer">
          <button className="order-item-view-details-button" onClick={onViewDetails}>
            查看详情
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderItem;

import React from 'react';
import ReactDOM from 'react-dom';
import { formatSeatInfoForDisplay } from '../utils/seatNumberFormatter';
import { translateSeatType, translateTicketType } from '../utils/translationUtils';
import './OrderSuccessModal.css';

interface TicketInfo {
  passengerName: string;
  seatType: string;
  seatNo: string;
  carNo?: string;
  ticketType: string;
}

interface TrainInfo {
  trainNo: string;
  departureStation: string;
  arrivalStation: string;
  departureDate: string;
  departureTime: string;
  arrivalTime: string;
}

interface OrderSuccessModalProps {
  isVisible: boolean;
  orderId: string;
  trainInfo?: TrainInfo;
  tickets?: TicketInfo[];
  onClose: () => void;
}

/**
 * 购买成功提示弹窗组件
 * 显示车票信息（包括座位号）
 */
const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({ 
  isVisible, 
  orderId, 
  trainInfo,
  tickets,
  onClose 
}) => {
  console.log('🎉 OrderSuccessModal 渲染:', {
    isVisible,
    orderId,
    hasTrainInfo: !!trainInfo,
    hasTickets: !!tickets,
    ticketsCount: tickets?.length || 0
  });
  
  if (!isVisible) return null;
  
  // 格式化日期，显示星期
  const formatDate = (date: string) => {
    const d = new Date(date);
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const weekDay = weekDays[d.getDay()];
    return `${date}（${weekDay}）`;
  };
  
  const modalContent = (
    <div className="order-success-modal">
      <div className="success-modal-overlay"></div>
      <div className="success-modal-content">
        <div className="success-icon">✓</div>
        <h2 className="success-title">购买成功</h2>
        <p className="success-message">恭喜您，订单已确认！您的车票信息如下：</p>
        
        {trainInfo && (
          <div className="success-train-info">
            <h3 className="info-section-title">车次信息</h3>
            <p className="train-info-text">
              <span className="info-label">日期</span>
              <span className="info-value">{formatDate(trainInfo.departureDate)}</span>
            </p>
            <p className="train-info-text">
              <span className="info-label">车次</span>
              <span className="info-value">{trainInfo.trainNo}次</span>
            </p>
            <p className="train-info-text">
              <span className="info-label">行程</span>
              <span className="info-value">
                {trainInfo.departureStation}站 {trainInfo.departureTime}开 → {trainInfo.arrivalStation}站 {trainInfo.arrivalTime}到
              </span>
            </p>
          </div>
        )}
        
        {tickets && tickets.length > 0 && (
          <div className="success-tickets-info">
            <h3 className="info-section-title">车票信息</h3>
            <table className="tickets-table">
              <thead>
                <tr>
                  <th>乘客</th>
                  <th>席别</th>
                  <th>座位号</th>
                  <th>票种</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket, index) => {
                  const formattedSeat = formatSeatInfoForDisplay(
                    ticket.seatNo,
                    ticket.carNo,
                    translateSeatType(ticket.seatType)
                  );
                  return (
                    <tr key={index}>
                      <td>{ticket.passengerName}</td>
                      <td>{translateSeatType(ticket.seatType)}</td>
                      <td className="seat-no-highlight">{formattedSeat}</td>
                      <td>{translateTicketType(ticket.ticketType)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        
        <p className="success-order-id">订单号：{orderId}</p>
        
        <button className="success-confirm-button" onClick={onClose}>
          确认
        </button>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default OrderSuccessModal;


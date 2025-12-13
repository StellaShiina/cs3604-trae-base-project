import React from 'react';
import { useNavigate } from 'react-router-dom';
import './BookingFailedModal.css';

interface BookingFailedModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const BookingFailedModal: React.FC<BookingFailedModalProps> = ({
  isVisible,
  onClose
}) => {
  const navigate = useNavigate();

  if (!isVisible) return null;

  const handleNavigateToOrders = () => {
    onClose();
    navigate('/orders');
  };

  const handleNavigateToTrains = () => {
    onClose();
    navigate('/trains');
  };

  return (
    <div className="booking-failed-overlay" onClick={onClose}>
      <div className="booking-failed-modal" onClick={(e) => e.stopPropagation()}>
        <div className="booking-failed-header">
          <h3>提示</h3>
        </div>
        <div className="booking-failed-body">
          <div className="error-icon">
            <svg width="80" height="80" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="35" fill="#f44336" opacity="0.1"/>
              <circle cx="40" cy="40" r="30" fill="none" stroke="#f44336" strokeWidth="3"/>
              <line x1="30" y1="30" x2="50" y2="50" stroke="#f44336" strokeWidth="3"/>
              <line x1="50" y1="30" x2="30" y2="50" stroke="#f44336" strokeWidth="3"/>
            </svg>
          </div>
          <p className="error-title">订票失败!</p>
          <p className="error-message">
            原因： 对不起，由于您取消次数过多，今日将不能继续受理您的订票请求。明日您可继续使用订票功能。
          </p>
          <p className="error-suggestion">
            请点击
            <span className="link-text" onClick={handleNavigateToOrders}>[我的12306]</span>
            办理其他业务。您也可以点击
            <span className="link-text" onClick={handleNavigateToTrains}>[预订车票]</span>
            ，重新规划您的旅程。
          </p>
        </div>
      </div>
    </div>
  );
};

export default BookingFailedModal;


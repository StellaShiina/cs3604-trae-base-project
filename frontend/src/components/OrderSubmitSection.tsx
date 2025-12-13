import React from 'react';
import './OrderSubmitSection.css';

interface OrderSubmitSectionProps {
  onSubmit: () => void;
  onBack: () => void;
  isSubmitting: boolean;
}

/**
 * 订单提交与温馨提示区域组件
 */
const OrderSubmitSection: React.FC<OrderSubmitSectionProps> = ({
  onSubmit,
  onBack,
  isSubmitting,
}) => {
  return (
    <div className="order-submit-section">
      <div className="submit-notice">
        <p className="notice-text">
          提交订单表示已阅读并同意
          <a href="#" onClick={(e) => e.preventDefault()}>《国铁集团铁路旅客运输规程》</a>
          <a href="#" onClick={(e) => e.preventDefault()}>《服务条款》</a>
        </p>
      </div>
      
      <div className="submit-buttons">
        <button
          className="order-back-button"
          onClick={onBack}
          disabled={isSubmitting}
        >
          上一步
        </button>
        <button
          className="order-submit-button"
          onClick={onSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? '提交中...' : '提交订单'}
        </button>
      </div>
    </div>
  );
};

export default OrderSubmitSection;


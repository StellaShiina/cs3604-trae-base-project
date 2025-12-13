import React from 'react';
import { createPortal } from 'react-dom';
import './CancelOrderModal.css';

interface CancelOrderModalProps {
  isVisible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

/**
 * 取消订单确认弹窗
 */
const CancelOrderModal: React.FC<CancelOrderModalProps> = ({
  isVisible,
  onConfirm,
  onCancel
}) => {
  if (!isVisible) return null;

  return createPortal(
    <div className="cancel-order-modal-overlay" onClick={onCancel}>
      <div className="cancel-order-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="cancel-order-modal-header">
          <h3 className="cancel-order-modal-title">交易提示</h3>
        </div>
        <div className="cancel-order-modal-body">
          <div className="cancel-order-modal-content-wrapper">
            <div className="cancel-order-icon">
              <img 
                src="/images/问号.png" 
                alt="问号"
              />
            </div>
            <div className="cancel-order-text-content">
              <div className="cancel-order-question">
                您确认取消订单吗？
              </div>
              <div className="cancel-order-warning">
                一天内3次申请车票成功后取消订单（包含无座车票或不符合选铺需求车票时取消5次计为取消1次），当日将不能在12306继续购票。
              </div>
            </div>
          </div>
        </div>
        <div className="cancel-order-modal-footer">
          <button className="cancel-order-button cancel-button" onClick={onCancel}>
            取消
          </button>
          <button className="cancel-order-button confirm-button" onClick={onConfirm}>
            确认
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default CancelOrderModal;


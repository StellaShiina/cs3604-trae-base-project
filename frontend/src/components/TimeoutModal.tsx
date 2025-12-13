import React from 'react';
import { createPortal } from 'react-dom';
import './TimeoutModal.css';

interface TimeoutModalProps {
  isVisible: boolean;
  onConfirm: () => void;
}

/**
 * 支付超时提示弹窗
 */
const TimeoutModal: React.FC<TimeoutModalProps> = ({
  isVisible,
  onConfirm
}) => {
  if (!isVisible) return null;

  return createPortal(
    <div className="timeout-modal-overlay">
      <div className="timeout-modal-content">
        <div className="timeout-modal-body">
          <p className="timeout-modal-message">支付超时，请重新购票</p>
        </div>
        <div className="timeout-modal-footer">
          <button className="timeout-modal-button" onClick={onConfirm}>
            确认
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default TimeoutModal;


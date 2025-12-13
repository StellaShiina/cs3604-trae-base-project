import React from 'react';
import ReactDOM from 'react-dom';
import './ProcessingModal.css';
import LoadingSpinner from './LoadingSpinner';

interface ProcessingModalProps {
  isVisible: boolean;
  message: string;
}

/**
 * 订单处理中弹窗组件
 * 使用 React Portal 渲染到 body，避免被父元素样式限制
 */
const ProcessingModal: React.FC<ProcessingModalProps> = ({ isVisible, message }) => {
  if (!isVisible) return null;
  
  const modalContent = (
    <div className="processing-modal">
      <div className="processing-modal-overlay"></div>
      <div className="processing-modal-content">
        <LoadingSpinner size="large" />
        <p className="processing-message">{message}</p>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default ProcessingModal;


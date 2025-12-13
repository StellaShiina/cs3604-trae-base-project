import React from 'react';
import ReactDOM from 'react-dom';
import './ConfirmModal.css';

interface ConfirmModalProps {
  isVisible: boolean;
  title: string;
  message: string | React.ReactNode;
  confirmText: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

/**
 * 确认弹窗组件
 * 使用 React Portal 渲染到 body，避免被父元素样式限制
 */
const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isVisible,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
}) => {
  if (!isVisible) return null;

  const modalContent = (
    <div className="confirm-modal">
      <div className="modal-overlay" onClick={onCancel}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3 className="modal-title">{title}</h3>
          </div>
          <div className="modal-body">
            <div className="modal-message">{message}</div>
          </div>
          <div className="modal-footer">
            <button className="modal-button confirm-button" onClick={onConfirm}>
              {confirmText}
            </button>
            {cancelText && onCancel && (
              <button className="modal-button cancel-button" onClick={onCancel}>
                {cancelText}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default ConfirmModal;

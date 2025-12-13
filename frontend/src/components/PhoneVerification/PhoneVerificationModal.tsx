// 手机验证弹窗组件
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import './PhoneVerificationModal.css';

interface PhoneVerificationModalProps {
  isVisible: boolean;
  phone: string;
  sessionId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const PhoneVerificationModal: React.FC<PhoneVerificationModalProps> = ({
  isVisible,
  phone,
  sessionId: _sessionId,
  onSuccess,
  onCancel
}) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isVisible) return null;

  const handleSubmit = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('请输入6位验证码');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/user/phone/confirm-update', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ newPhone: phone, verificationCode })
      });

      if (response.ok) {
        onSuccess();
      } else {
        const data = await response.json();
        setError(data.error || '验证失败');
      }
    } catch (err) {
      console.error('Error confirming phone update:', err);
      setError('验证失败');
    } finally {
      setIsLoading(false);
    }
  };

  const modalContent = (
    <div className="phone-verification-modal-overlay" onClick={onCancel}>
      <div className="phone-verification-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">手机验证</h3>
          <button className="close-button" onClick={onCancel}>×</button>
        </div>
        
        <div className="modal-content">
          <p className="verification-hint">
            验证码已发送至【{phone}】
          </p>
          
          <div className="input-group">
            <label className="input-label">验证码：</label>
            <input
              type="text"
              className="verification-input"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="请输入6位验证码"
              maxLength={6}
            />
          </div>
          
          {error && <div className="phone-verification-error-message">{error}</div>}
        </div>
        
        <div className="modal-footer">
          <button className="return-button" onClick={onCancel}>返回修改</button>
          <button 
            className="complete-button" 
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? '验证中...' : '完成'}
          </button>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default PhoneVerificationModal;


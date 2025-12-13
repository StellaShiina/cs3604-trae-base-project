/**
 * RegistrationVerificationModal组件
 * 用于注册流程的手机验证弹窗
 */

import React, { useState } from 'react';
import './RegistrationVerificationModal.css';

interface RegistrationVerificationModalProps {
  phoneNumber: string;
  onClose: () => void;
  onComplete: (code: string) => void;
  onBack: () => void;
  isSuccess?: boolean;
  successMessage?: string;
  externalError?: string; // 外部传入的错误信息（如验证码错误或已过期）
}

const RegistrationVerificationModal: React.FC<RegistrationVerificationModalProps> = ({
  phoneNumber,
  onClose,
  onComplete,
  onBack,
  isSuccess = false,
  successMessage = '',
  externalError = ''
}) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!verificationCode) {
      setError('请输入验证码');
      return;
    }

    if (verificationCode.length !== 6) {
      setError('验证码应为6位数字');
      return;
    }

    onComplete(verificationCode);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="reg-verification-modal-backdrop" onClick={handleBackdropClick}>
      <div className="reg-verification-modal">
        {/* 标题栏 */}
        <div className="reg-verification-modal-header">
          <h3>手机验证</h3>
          <button 
            className="close-button" 
            onClick={onClose}
            aria-label="关闭"
          >
            ×
          </button>
        </div>

        {/* 内容区域 */}
        <div className="reg-verification-modal-content">
          {isSuccess ? (
            /* 成功消息 */
            <div className="success-content">
              <div className="success-icon">✓</div>
              <p className="success-message">{successMessage}</p>
            </div>
          ) : (
            <>
              {/* 验证码发送提示 */}
              <p className="verification-message">
                验证码已发送至{phoneNumber}
              </p>

              {/* 验证码输入表单 */}
              <form className="verification-form" onSubmit={handleSubmit}>
                <div className="form-row">
                  <label className="form-label">验证码：</label>
                  <input
                    type="text"
                    className="form-input"
                    value={verificationCode}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, ''); // 只允许数字
                      setVerificationCode(value.slice(0, 6));
                      setError('');
                    }}
                    maxLength={6}
                    placeholder="请输入6位验证码"
                  />
                </div>
                
                {(error || externalError) && (
                  <div className="reg-verification-error-message">{error || externalError}</div>
                )}

                <div className="button-group">
                  <button 
                    type="submit" 
                    className="submit-button"
                  >
                    完成注册
                  </button>
                  <button 
                    type="button" 
                    className="back-button"
                    onClick={onBack}
                  >
                    返回修改
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegistrationVerificationModal;

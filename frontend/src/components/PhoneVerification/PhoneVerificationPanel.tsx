// 手机核验信息展示面板组件
import React, { useState } from 'react';
import './PhoneVerificationPanel.css';

interface PhoneVerificationPanelProps {
  oldPhone: string;
  onSubmit: (newPhone: string, password: string) => void;
  onCancel: () => void;
  externalError?: string; // 外部传入的错误信息（如密码错误）
}

const PhoneVerificationPanel: React.FC<PhoneVerificationPanelProps> = ({
  oldPhone,
  onSubmit,
  onCancel,
  externalError
}) => {
  const [newPhone, setNewPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ newPhone?: string; password?: string }>({});

  const validateNewPhone = (phone: string) => {
    if (!phone) {
      return '手机号不能为空';
    }
    if (phone.length !== 11) {
      return '您输入的手机号码不是有效的格式！';
    }
    if (!/^\d{11}$/.test(phone)) {
      return '您输入的手机号码不是有效的格式！';
    }
    return '';
  };

  const handleNewPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewPhone(value);
    const error = validateNewPhone(value);
    setErrors({ ...errors, newPhone: error });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    if (!value) {
      setErrors({ ...errors, password: '输入登录密码！' });
    } else {
      setErrors({ ...errors, password: '' });
    }
  };

  const handleSubmit = () => {
    const newPhoneError = validateNewPhone(newPhone);
    const passwordError = password ? '' : '输入登录密码！';

    if (newPhoneError || passwordError) {
      setErrors({ newPhone: newPhoneError, password: passwordError });
      return;
    }

    onSubmit(newPhone, password);
  };

  // 格式化原手机号显示
  const formatOldPhone = (phone: string) => {
    if (!phone) return '';
    // 将 (+86)158****9968 格式转换为 +86-158****9968
    return phone.replace('(+86)', '+86-');
  };

  return (
    <div className="phone-verification-panel">
      <div className="verification-section">
        <h3 className="section-title">手机核验</h3>
        <div className="form-content">
          <div className="form-row">
            <label className="form-label">
              <span className="required">*</span> 原手机号：
            </label>
            <div className="form-value">
              {formatOldPhone(oldPhone)} <span className="verified-link">已通过核验</span>
            </div>
          </div>
          <div className="form-row form-row-with-divider">
            <label className="form-label">
              <span className="required">*</span> 新手机号：
            </label>
            <div className="form-input-wrapper">
              <div className="form-input-group">
                <select className="country-code">
                  <option>+86</option>
                </select>
                <input
                  type="text"
                  className="form-input phone-input"
                  value={newPhone}
                  onChange={handleNewPhoneChange}
                  placeholder=""
                  maxLength={11}
                />
              </div>
              {errors.newPhone && <div className="phone-panel-error-message">{errors.newPhone}</div>}
            </div>
          </div>
          <div className="form-row">
            <label className="form-label">
              <span className="required">*</span> 登录密码：
            </label>
            <div className="form-input-wrapper">
              <input
                type="password"
                className="form-input password-input"
                value={password}
                onChange={handlePasswordChange}
                placeholder=""
              />
              <span className="password-hint">正确输入密码才能修改密保</span>
              {(errors.password || externalError) && (
                <div className="phone-panel-error-message">{externalError || errors.password}</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="button-group">
        <button className="cancel-button" onClick={onCancel}>取消</button>
        <button className="confirm-button" onClick={handleSubmit}>确认</button>
      </div>
    </div>
  );
};

export default PhoneVerificationPanel;


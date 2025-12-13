import React, { useState } from 'react';
import axios from 'axios';
import './SetNewPasswordStep.css';

interface SetNewPasswordStepProps {
  resetToken: string;
  onSuccess: () => void;
}

/**
 * 步骤3：设置新密码
 */
const SetNewPasswordStep: React.FC<SetNewPasswordStepProps> = ({
  resetToken,
  onSuccess
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({
    newPassword: '',
    confirmPassword: '',
    general: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  // 验证密码格式
  const validatePassword = (password: string): string => {
    if (!password) {
      return '';
    }

    if (password.length < 6) {
      return '密码长度不能少于6位';
    }

    // 检查密码是否包含字母、数字、下划线中的至少两种
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasUnderscore = /_/.test(password);
    const typesCount = [hasLetter, hasNumber, hasUnderscore].filter(Boolean).length;

    if (typesCount < 2) {
      return '需包含字母、数字、下划线中不少于两种';
    }

    return '';
  };

  // 验证确认密码
  const validateConfirmPassword = (password: string, confirm: string): string => {
    if (!confirm) {
      return '';
    }

    if (password !== confirm) {
      return '两次密码输入不一致';
    }

    return '';
  };

  const handlePasswordChange = (value: string) => {
    setNewPassword(value);
    // 只清除错误，不进行实时验证
    setErrors(prev => ({
      ...prev,
      newPassword: '',
      confirmPassword: '',
      general: ''
    }));
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    // 只清除错误，不进行实时验证
    setErrors(prev => ({
      ...prev,
      confirmPassword: '',
      general: ''
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 清除之前的错误
    setErrors({
      newPassword: '',
      confirmPassword: '',
      general: ''
    });

    // 验证新密码
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setErrors(prev => ({ ...prev, newPassword: passwordError }));
      return;
    }

    // 验证确认密码
    const confirmError = validateConfirmPassword(newPassword, confirmPassword);
    if (confirmError) {
      setErrors(prev => ({ ...prev, confirmPassword: confirmError }));
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post('/api/password-reset/reset-password', {
        resetToken,
        newPassword,
        confirmPassword
      });

      if (response.data.success) {
        // 密码重置成功，进入完成步骤
        onSuccess();
      } else {
        setErrors(prev => ({
          ...prev,
          general: response.data.error || '密码重置失败'
        }));
      }
    } catch (error: any) {
      console.error('重置密码失败:', error);
      setErrors(prev => ({
        ...prev,
        general: error.response?.data?.error || '密码重置失败，请重试'
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="set-new-password-step">
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <label className="form-label">
            <span className="required-mark">*</span> 新密码：
          </label>
          <div className="input-wrapper">
            <input
              type="password"
              className="form-input"
              value={newPassword}
              onChange={(e) => handlePasswordChange(e.target.value)}
              placeholder="请输入新密码"
              disabled={isLoading}
            />
            <span className="hint-text">需包含字母、数字、下划线中不少于两种且长度不少于6</span>
          </div>
          {errors.newPassword && <div className="error-text">{errors.newPassword}</div>}
        </div>

        <div className="form-row">
          <label className="form-label">
            <span className="required-mark">*</span> 密码确认：
          </label>
          <div className="input-wrapper">
            <input
              type="password"
              className="form-input"
              value={confirmPassword}
              onChange={(e) => handleConfirmPasswordChange(e.target.value)}
              placeholder="请再次输入新密码"
              disabled={isLoading}
            />
            <span className="hint-text">请再次输入密码</span>
          </div>
          {errors.confirmPassword && <div className="error-text">{errors.confirmPassword}</div>}
        </div>

        {errors.general && <div className="error-text general-error">{errors.general}</div>}

        <div className="button-row">
          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? '提交中...' : '提交'}
          </button>
        </div>
        <div className="help-link">
          手机号未通过核验？试试<a href="#email">邮箱找回</a>
        </div>
      </form>
    </div>
  );
};

export default SetNewPasswordStep;


import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './VerificationCodeStep.css';

interface VerificationCodeStepProps {
  sessionId: string;
  phone: string;
  onSuccess: (resetToken: string) => void;
}

/**
 * 步骤2：获取验证码
 */
const VerificationCodeStep: React.FC<VerificationCodeStepProps> = ({
  sessionId,
  phone,
  onSuccess
}) => {
  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);

  // 倒计时效果
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // 格式化手机号显示
  const formatPhone = (phoneNumber: string) => {
    if (phoneNumber.length === 11) {
      return `(+86) ${phoneNumber.slice(0, 3)}${phoneNumber.slice(3, 7)}${phoneNumber.slice(7)}`;
    }
    return phoneNumber;
  };

  // 发送验证码
  const handleSendCode = async () => {
    if (countdown > 0) return;

    setError('');
    setIsLoading(true);

    try {
      const response = await axios.post('/api/password-reset/send-code', {
        sessionId
      });

      if (response.data.success) {
        setCountdown(120); // 120秒倒计时
        setCodeSent(true);
        
        // 开发环境打印验证码
        if (response.data.verificationCode) {
          console.log('\n=================================');
          console.log('📱 密码重置验证码');
          console.log(`手机号: ${phone}`);
          console.log(`验证码: ${response.data.verificationCode}`);
          console.log('有效期: 120秒');
          console.log('=================================\n');
        }
      } else {
        setError(response.data.error || '发送验证码失败');
      }
    } catch (error: any) {
      console.error('发送验证码失败:', error);
      setError(error.response?.data?.error || '发送验证码失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  // 提交验证码
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code) {
      setError('请输入手机验证码！');
      return;
    }

    if (code.length !== 6) {
      setError('请输入6位验证码');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/password-reset/verify-code', {
        sessionId,
        code
      });

      if (response.data.success) {
        // 验证成功，进入下一步
        onSuccess(response.data.resetToken);
      } else {
        setError(response.data.error || '验证码验证失败');
      }
    } catch (error: any) {
      console.error('验证验证码失败:', error);
      setError(error.response?.data?.error || '很抱歉，您输入的短信验证码有误。');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="verification-code-step">
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <label className="form-label">
            <span className="required-mark">*</span> 手机号：
          </label>
          <div className="phone-display">{formatPhone(phone)}</div>
        </div>

        <div className="form-row">
          <label className="form-label">
            <span className="required-mark">*</span> 请填写手机验证码：
          </label>
          <div className="input-wrapper">
            <div className="code-input-group">
              <input
                type="text"
                className="form-input"
                value={code}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setCode(value);
                  setError('');
                }}
                placeholder="请输入6位验证码"
                maxLength={6}
                disabled={isLoading}
              />
              {countdown === 0 ? (
                <button
                  type="button"
                  className="send-code-button"
                  onClick={handleSendCode}
                  disabled={isLoading}
                >
                  {isLoading ? '发送中...' : codeSent ? '重新获取验证码' : '获取手机验证码'}
                </button>
              ) : (
                <div className="countdown-text">
                  验证码已发出，请注意查收短信，你可以在{countdown}秒后重新发送
                </div>
              )}
            </div>
          </div>
          {error && <div className="error-text">{error}</div>}
        </div>

        <div className="button-row">
          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? '验证中...' : '提交'}
          </button>
        </div>

        <div className="help-link">
          手机号未通过核验？试试<a href="#email">邮箱找回</a>
        </div>
      </form>
    </div>
  );
};

export default VerificationCodeStep;


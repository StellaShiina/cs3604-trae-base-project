import React, { useState } from 'react';
import axios from 'axios';
import SelectDropdown from '../SelectDropdown';
import './AccountInfoStep.css';

interface AccountInfoStepProps {
  onSuccess: (sessionId: string, accountInfo: { phone: string; idCardType: string; idCardNumber: string }) => void;
}

const idCardTypes = [
  '居民身份证',
  '港澳居民居住证',
  '台湾居民居住证',
  '外国人永久居留身份证',
  '外国护照',
  '中国护照',
  '港澳居民来往内地通行证',
  '台湾居民来往大陆通行证'
];

// 转换为 SelectDropdown 需要的格式
const idCardTypeOptions = idCardTypes.map(type => ({
  value: type,
  label: type
}));

/**
 * 步骤1：填写账户信息
 */
const countryCodeOptions = [
  { value: '+86', label: '(+86)中国' },
  { value: '+852', label: '(+852)中国香港' },
  { value: '+853', label: '(+853)中国澳门' },
  { value: '+886', label: '(+886)中国台湾' }
];

const AccountInfoStep: React.FC<AccountInfoStepProps> = ({ onSuccess }) => {
  const [countryCode, setCountryCode] = useState('+86');
  const [phone, setPhone] = useState('');
  const [idCardType, setIdCardType] = useState('居民身份证');
  const [idCardNumber, setIdCardNumber] = useState('');
  const [errors, setErrors] = useState({
    phone: '',
    idCardNumber: '',
    general: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  // 身份证校验算法（GB 11643-1999）
  const validateIdCardCheckCode = (idCard: string): boolean => {
    if (idCard.length !== 18) return false;
    
    const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
    const checkCodes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];
    
    let sum = 0;
    for (let i = 0; i < 17; i++) {
      const char = idCard[i];
      if (!/^\d$/.test(char)) return false;
      sum += parseInt(char) * weights[i];
    }
    
    const expectedCheckCode = checkCodes[sum % 11];
    const checkCode = idCard[17].toUpperCase();
    
    return checkCode === expectedCheckCode;
  };

  // 验证证件号码格式
  const validateIdCardFormat = (value: string, type: string): string => {
    if (!value) {
      return '';
    }

    // 对于居民身份证，进行详细验证
    if (type === '居民身份证') {
      // 检查是否包含特殊字符（仅允许数字和字母X）
      const idCardRegex = /^[a-zA-Z0-9]+$/;
      if (!idCardRegex.test(value)) {
        return '输入的证件编号中包含中文信息或特殊字符！';
      }

      if (value.length !== 18) {
        return '请正确输入18位证件号码！';
      }

      // 验证身份证号码格式（前17位必须是数字，最后一位是校验码）
      if (!validateIdCardCheckCode(value)) {
        return '请正确输入18位证件号码！';
      }
    }

    return '';
  };

  const handleIdCardNumberChange = (value: string) => {
    // 限制只能输入字母和数字，且最多18位
    const sanitizedValue = value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 18).toUpperCase();
    setIdCardNumber(sanitizedValue);
    // 只清除错误，不进行实时验证
    setErrors(prev => ({
      ...prev,
      idCardNumber: '',
      general: ''
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 清除之前的错误
    setErrors({
      phone: '',
      idCardNumber: '',
      general: ''
    });

    // 验证手机号
    if (!phone) {
      setErrors(prev => ({ ...prev, phone: '请输入手机号码' }));
      return;
    }

    if (!/^\d{11}$/.test(phone)) {
      setErrors(prev => ({ ...prev, phone: '请输入正确的手机号码' }));
      return;
    }

    // 验证证件号码格式
    const formatError = validateIdCardFormat(idCardNumber, idCardType);
    if (formatError) {
      setErrors(prev => ({ ...prev, idCardNumber: formatError }));
      return;
    }

    if (!idCardNumber) {
      setErrors(prev => ({ ...prev, idCardNumber: '请输入证件号码' }));
      return;
    }

    setIsLoading(true);

    try {
      // 调用后端API验证账户信息
      const response = await axios.post('/api/password-reset/verify-account', {
        phone,
        idCardType,
        idCardNumber
      });

      if (response.data.success) {
        // 验证成功，进入下一步
        onSuccess(response.data.sessionId, { phone, idCardType, idCardNumber });
      } else {
        setErrors(prev => ({
          ...prev,
          idCardNumber: response.data.error || '手机号码或证件号码不正确！'
        }));
      }
    } catch (error: any) {
      console.error('验证账户信息失败:', error);
      const errorMsg = error.response?.data?.error || '手机号码或证件号码不正确！';
      setErrors(prev => ({
        ...prev,
        idCardNumber: errorMsg
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="account-info-step">
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <label className="form-label">
            <span className="required-mark">*</span> 手机号码：
          </label>
          <div className="input-wrapper">
            <div className="phone-input-group">
              <div className="country-code-select">
                <SelectDropdown
                  options={countryCodeOptions}
                  value={countryCode}
                  placeholder="+86"
                  onChange={(value) => {
                    setCountryCode(value);
                    setErrors(prev => ({ ...prev, phone: '', general: '' }));
                  }}
                  disabled={isLoading}
                  testId="account-info-country-code-dropdown"
                  getDisplayValue={(value, _label) => {
                    // 选中时只显示国家代码（如 "+86"），不显示完整标签（如 "(+86)中国"）
                    return value;
                  }}
                />
              </div>
              <input
                type="text"
                className="form-input phone-input"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setErrors(prev => ({ ...prev, phone: '', general: '' }));
                }}
                placeholder=""
                maxLength={11}
                disabled={isLoading}
              />
            </div>
            <span className="hint-text">已通过核验的手机号码</span>
          </div>
          {errors.phone && <div className="error-text">{errors.phone}</div>}
        </div>

        <div className="form-row">
          <label className="form-label">
            <span className="required-mark">*</span> 证件类型：
          </label>
          <div className="input-wrapper">
            <div className="id-card-type-select">
              <SelectDropdown
                options={idCardTypeOptions}
                value={idCardType}
                placeholder="请选择证件类型"
                onChange={(value) => {
                  setIdCardType(value);
                  setErrors(prev => ({ ...prev, idCardNumber: '', general: '' }));
                }}
                disabled={isLoading}
                testId="account-info-id-card-type-dropdown"
              />
            </div>
            <span className="hint-text">请选择证件类型</span>
          </div>
        </div>

        <div className="form-row">
          <label className="form-label">
            <span className="required-mark">*</span> 证件号码：
          </label>
          <div className="input-wrapper">
            <input
              type="text"
              className="form-input"
              value={idCardNumber}
              onChange={(e) => handleIdCardNumberChange(e.target.value)}
              placeholder=""
              maxLength={18}
              disabled={isLoading}
            />
            <span className="hint-text">请输入证件号码</span>
          </div>
          {errors.idCardNumber && <div className="error-text">{errors.idCardNumber}</div>}
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

export default AccountInfoStep;


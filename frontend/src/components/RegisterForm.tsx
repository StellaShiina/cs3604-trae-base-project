/**
 * RegisterForm组件
 * 源文件：frontend/src/components/RegisterForm.tsx
 * 测试文件：frontend/test/components/RegisterForm.test.tsx
 * 
 * 说明：用户注册表单组件
 */

import React, { useState } from 'react';
import axios from 'axios';
import SelectDropdown from './SelectDropdown';
import './RegisterForm.css';

interface RegisterFormProps {
  onSubmit: (data: any) => void;
  onNavigateToLogin: () => void;
}

interface FieldValidation {
  isValid: boolean;
  errorMessage: string;
  showCheckmark: boolean;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSubmit }) => {
  // 表单数据状态
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [idCardType, setIdCardType] = useState('居民身份证'); // 默认值为"居民身份证"
  const [name, setName] = useState('');
  const [idCardNumber, setIdCardNumber] = useState('');
  const [discountType, setDiscountType] = useState('成人'); // 默认值为"成人"
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // 验证状态
  const [usernameValidation, setUsernameValidation] = useState<FieldValidation>({ isValid: false, errorMessage: '', showCheckmark: false });
  const [passwordValidation, setPasswordValidation] = useState<FieldValidation>({ isValid: false, errorMessage: '', showCheckmark: false });
  const [confirmPasswordValidation, setConfirmPasswordValidation] = useState<FieldValidation>({ isValid: false, errorMessage: '', showCheckmark: false });
  const [nameValidation, setNameValidation] = useState<FieldValidation>({ isValid: false, errorMessage: '', showCheckmark: false });
  const [idCardValidation, setIdCardValidation] = useState<FieldValidation>({ isValid: false, errorMessage: '', showCheckmark: false });
  const [emailValidation, setEmailValidation] = useState<FieldValidation>({ isValid: false, errorMessage: '', showCheckmark: false });
  const [phoneValidation, setPhoneValidation] = useState<FieldValidation>({ isValid: false, errorMessage: '', showCheckmark: false });
  const [generalError, setGeneralError] = useState('');

  // 证件类型选项
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

  // 优惠类型选项
  const discountTypes = ['成人', '儿童', '学生', '残疾军人'];

  // 用户名验证
  const validateUsername = async (value: string) => {
    if (!value) {
      setUsernameValidation({ isValid: false, errorMessage: '', showCheckmark: false });
      return;
    }

    if (value.length < 6) {
      setUsernameValidation({ isValid: false, errorMessage: '用户名长度不能少于6个字符！', showCheckmark: false });
      return;
    }

    if (value.length > 30) {
      setUsernameValidation({ isValid: false, errorMessage: '用户名长度不能超过30个字符！', showCheckmark: false });
      return;
    }

    const usernameRegex = /^[a-zA-Z][a-zA-Z0-9_]*$/;
    if (!usernameRegex.test(value)) {
      setUsernameValidation({ isValid: false, errorMessage: '用户名只能由字母、数字和_组成，须以字母开头！', showCheckmark: false });
      return;
    }

    // 调用API检查用户名是否已存在
    // 前端暂时模拟成功，因为后端缺少单独的验证接口
    setUsernameValidation({ isValid: true, errorMessage: '', showCheckmark: true });
    /*
    try {
      const response = await axios.post('/api/register/validate-username', { username: value });
      if (response.data.valid) {
        setUsernameValidation({ isValid: true, errorMessage: '', showCheckmark: true });
      } else {
        setUsernameValidation({ isValid: false, errorMessage: response.data.error, showCheckmark: false });
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || '验证失败，请稍后重试';
      setUsernameValidation({ isValid: false, errorMessage: errorMsg, showCheckmark: false });
    }
    */
  };

  // 密码验证
  const validatePassword = async (value: string) => {
    if (!value) {
      setPasswordValidation({ isValid: false, errorMessage: '', showCheckmark: false });
      return;
    }

    if (value.length < 6) {
      setPasswordValidation({ isValid: false, errorMessage: '密码长度不能少于6个字符！', showCheckmark: false });
      return;
    }

    const passwordRegex = /^[a-zA-Z0-9_]+$/;
    if (!passwordRegex.test(value)) {
      setPasswordValidation({ isValid: false, errorMessage: '格式错误，必须且只能包含字母、数字和下划线中的两种或两种以上！', showCheckmark: false });
      return;
    }

    const hasLetter = /[a-zA-Z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasUnderscore = /_/.test(value);
    const typeCount = (hasLetter ? 1 : 0) + (hasNumber ? 1 : 0) + (hasUnderscore ? 1 : 0);

    if (typeCount < 2) {
      setPasswordValidation({ isValid: false, errorMessage: '格式错误，必须且只能包含字母、数字和下划线中的两种或两种以上！', showCheckmark: false });
      return;
    }

    setPasswordValidation({ isValid: true, errorMessage: '', showCheckmark: true });
  };

  // 确认密码验证
  const validateConfirmPassword = (value: string) => {
    if (!value) {
      setConfirmPasswordValidation({ isValid: false, errorMessage: '', showCheckmark: false });
      return;
    }

    if (value !== password) {
      setConfirmPasswordValidation({ isValid: false, errorMessage: '确认密码与密码不一致！', showCheckmark: false });
      return;
    }

    setConfirmPasswordValidation({ isValid: true, errorMessage: '', showCheckmark: true });
  };

  // 姓名验证
  const validateName = (value: string) => {
    if (!value) {
      setNameValidation({ isValid: false, errorMessage: '', showCheckmark: false });
      return;
    }

    // 计算字符长度（1个汉字算2个字符）
    const charLength = value.split('').reduce((len, char) => {
      return len + (/[\u4e00-\u9fa5]/.test(char) ? 2 : 1);
    }, 0);

    if (charLength < 3 || charLength > 30) {
      setNameValidation({ isValid: false, errorMessage: '允许输入的字符串在3-30个字符之间！', showCheckmark: false });
      return;
    }

    // 验证只包含中英文字符、点和单空格
    const nameRegex = /^[\u4e00-\u9fa5a-zA-Z.\s]+$/;
    if (!nameRegex.test(value)) {
      setNameValidation({ isValid: false, errorMessage: '请输入姓名！', showCheckmark: false });
      return;
    }

    setNameValidation({ isValid: true, errorMessage: '', showCheckmark: true });
  };

  // 身份证校验码验证
  const validateIdCardCheckCode = (idCard: string): boolean => {
    // 前17位必须是数字
    const first17 = idCard.substring(0, 17);
    if (!/^\d{17}$/.test(first17)) {
      return false;
    }

    // 最后一位校验码
    const checkCode = idCard.charAt(17).toUpperCase();

    // 加权系数
    const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
    // 校验码对照表
    const checkCodes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];

    // 步骤一和二：计算加权求和
    let sum = 0;
    for (let i = 0; i < 17; i++) {
      sum += parseInt(first17.charAt(i)) * weights[i];
    }

    // 步骤三：求余数
    const remainder = sum % 11;

    // 步骤四：根据余数确定校验码
    const expectedCheckCode = checkCodes[remainder];

    return checkCode === expectedCheckCode;
  };

  // 证件号码验证
  const validateIdCard = async (value: string) => {
    if (!value) {
      setIdCardValidation({ isValid: false, errorMessage: '', showCheckmark: false });
      return;
    }

    // 先验证格式，后验证长度
    const idCardRegex = /^[a-zA-Z0-9]+$/;
    if (!idCardRegex.test(value)) {
      setIdCardValidation({ isValid: false, errorMessage: '输入的证件编号中包含中文信息或特殊字符！', showCheckmark: false });
      return;
    }

    if (value.length !== 18) {
      setIdCardValidation({ isValid: false, errorMessage: '请正确输入18位证件号码！', showCheckmark: false });
      return;
    }

    // 验证身份证号码格式（前17位必须是数字，最后一位是校验码）
    if (!validateIdCardCheckCode(value)) {
      setIdCardValidation({ isValid: false, errorMessage: '请正确输入18位证件号码！', showCheckmark: false });
      return;
    }

    // 调用API检查证件号是否已注册
    // 前端暂时模拟成功，因为后端缺少单独的验证接口
    setIdCardValidation({ isValid: true, errorMessage: '', showCheckmark: true });
    /*
    try {
      const response = await axios.post('/api/register/validate-idcard', { 
        idCardType: idCardType,
        idCardNumber: value 
      });
      if (response.data.valid) {
        setIdCardValidation({ isValid: true, errorMessage: '', showCheckmark: true });
      } else {
        setIdCardValidation({ isValid: false, errorMessage: response.data.error, showCheckmark: false });
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || '验证失败，请稍后重试';
      setIdCardValidation({ isValid: false, errorMessage: errorMsg, showCheckmark: false });
    }
    */
  };

  // 邮箱验证
  const validateEmail = (value: string) => {
    if (!value) {
      setEmailValidation({ isValid: false, errorMessage: '', showCheckmark: false });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      setEmailValidation({ isValid: false, errorMessage: '请输入有效的电子邮件地址！', showCheckmark: false });
      return;
    }

    setEmailValidation({ isValid: true, errorMessage: '', showCheckmark: false });
  };

  // 手机号验证
  const validatePhone = (value: string) => {
    if (!value) {
      setPhoneValidation({ isValid: false, errorMessage: '', showCheckmark: false });
      return;
    }

    // 先检查是否包含非数字字符
    const phoneRegex = /^[0-9]+$/;
    if (!phoneRegex.test(value)) {
      setPhoneValidation({ isValid: false, errorMessage: '您输入的手机号码不是有效的格式！', showCheckmark: false });
      return;
    }

    if (value.length !== 11) {
      setPhoneValidation({ isValid: false, errorMessage: '您输入的手机号码不是有效的格式！', showCheckmark: false });
      return;
    }

    setPhoneValidation({ isValid: true, errorMessage: '', showCheckmark: false });
  };

  // 手机号输入处理（限制11位）
  const handlePhoneChange = (value: string) => {
    // 限制长度为11位，保留所有字符（包括非数字）以便验证能检测错误
    setPhone(value.slice(0, 11));
  };

  // 表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');

    // 检查用户协议
    if (!agreedToTerms) {
      setGeneralError('请确认服务条款！');
      return;
    }

    // 检查必填字段（证件类型和优惠类型有默认值，不需要检查）
    const missingFields = [];
    if (!username) missingFields.push('用户名');
    if (!password) missingFields.push('登录密码');
    if (!confirmPassword) missingFields.push('确认密码');
    if (!name) missingFields.push('姓名');
    if (!idCardNumber) missingFields.push('证件号码');
    if (!phone) missingFields.push('手机号码');
    
    if (missingFields.length > 0) {
      setGeneralError('请填写完整信息！');
      return;
    }

    // 检查字段验证状态
    if (usernameValidation.errorMessage) {
      setGeneralError('用户名验证失败，请检查并重新输入');
      return;
    }
    if (passwordValidation.errorMessage) {
      setGeneralError('密码验证失败，请检查并重新输入');
      return;
    }
    if (confirmPasswordValidation.errorMessage) {
      setGeneralError('确认密码验证失败，请检查并重新输入');
      return;
    }
    if (nameValidation.errorMessage) {
      setGeneralError('姓名验证失败，请检查并重新输入');
      return;
    }
    if (idCardValidation.errorMessage) {
      setGeneralError('证件号码验证失败，请检查并重新输入');
      return;
    }
    if (phoneValidation.errorMessage) {
      setGeneralError('手机号码验证失败，请检查并重新输入');
      return;
    }
    if (emailValidation.errorMessage && email) {
      setGeneralError('邮箱验证失败，请检查并重新输入');
      return;
    }

    // 提交数据
    const formData = {
      username,
      password,
      confirmPassword,
      idCardType,
      name,
      idCardNumber,
      discountType,
      email,
      phone,
      agreedToTerms
    };

    onSubmit(formData);
  };

  // 计算密码强度
  const getPasswordStrength = (pwd: string): number => {
    if (!pwd || pwd.length === 0) return 0; // 完全没输入时返回0
    if (pwd.length < 6) return 1; // 不满6位时显示一格（弱）
    let strength = 0;
    if (/[a-z]/.test(pwd)) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[_]/.test(pwd)) strength++;
    return Math.min(strength, 3);
  };

  const passwordStrength = getPasswordStrength(password);

  return (
    <div className="register-form-container">
      {generalError && (
        <div className="general-error-message">{generalError}</div>
      )}
      
      <form className="register-form" onSubmit={handleSubmit}>
        {/* 用户名 */}
        <div className="form-row">
          <div className="form-label-wrapper">
            <label className="form-label">
              <span className="required-mark">*</span>用户名：
            </label>
          </div>
          <div className="form-input-container">
            <div className="form-input-wrapper">
              <input
                className={`form-input ${usernameValidation.errorMessage ? 'error' : usernameValidation.showCheckmark ? 'valid' : ''}`}
                type="text"
                placeholder="用户名设置成功后不可修改"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onBlur={() => validateUsername(username)}
              />
              {usernameValidation.showCheckmark && (
                <span className="input-checkmark" data-testid="username-checkmark">✓</span>
              )}
              <span className="form-hint-message">6-30位字母、数字或"_"，字母开头</span>
            </div>
            {usernameValidation.errorMessage && (
              <div className="form-error-message">{usernameValidation.errorMessage}</div>
            )}
          </div>
        </div>

        {/* 登录密码 */}
        <div className="form-row">
          <div className="form-label-wrapper">
            <label className="form-label">
              <span className="required-mark">*</span>登录密码：
            </label>
          </div>
          <div className="form-input-container">
            <div className="form-input-wrapper">
              <input
                className={`form-input ${passwordValidation.errorMessage ? 'error' : passwordValidation.showCheckmark ? 'valid' : ''}`}
                type="password"
                placeholder="6-20位字母、数字或符号"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => validatePassword(password)}
              />
              {passwordValidation.showCheckmark && (
                <span className="input-checkmark" data-testid="password-checkmark">✓</span>
              )}
              <div className="password-strength">
                <div className="strength-bars">
                  <div className={`strength-bar ${passwordStrength >= 1 ? 'weak' : ''}`}></div>
                  <div className={`strength-bar ${passwordStrength >= 2 ? 'medium' : ''}`}></div>
                  <div className={`strength-bar ${passwordStrength >= 3 ? 'strong' : ''}`}></div>
                </div>
              </div>
            </div>
            {passwordValidation.errorMessage && (
              <div className="form-error-message">{passwordValidation.errorMessage}</div>
            )}
          </div>
        </div>

        {/* 确认密码 */}
        <div className="form-row">
          <div className="form-label-wrapper">
            <label className="form-label">
              <span className="required-mark">*</span>确认密码：
            </label>
          </div>
          <div className="form-input-container">
            <div className="form-input-wrapper">
              <input
                className={`form-input ${confirmPasswordValidation.errorMessage ? 'error' : confirmPasswordValidation.showCheckmark ? 'valid' : ''}`}
                type="password"
                placeholder="请再次输入您的登录密码"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onBlur={() => validateConfirmPassword(confirmPassword)}
              />
              {confirmPasswordValidation.showCheckmark && (
                <span className="input-checkmark" data-testid="confirm-password-checkmark">✓</span>
              )}
            </div>
            {confirmPasswordValidation.errorMessage && (
              <div className="form-error-message">{confirmPasswordValidation.errorMessage}</div>
            )}
          </div>
        </div>

        {/* 证件类型 */}
        <div className="form-row">
          <div className="form-label-wrapper">
            <label className="form-label">
              <span className="required-mark">*</span>证件类型：
            </label>
          </div>
          <div className="form-input-container">
            <SelectDropdown
              options={idCardTypes}
              value={idCardType}
              placeholder="居民身份证"
              onChange={setIdCardType}
              testId="id-card-type-dropdown"
            />
          </div>
        </div>

        {/* 姓名 */}
        <div className="form-row">
          <div className="form-label-wrapper">
            <label className="form-label">
              <span className="required-mark">*</span>姓名：
            </label>
          </div>
          <div className="form-input-container">
            <div className="form-input-wrapper">
              <input
                className={`form-input ${nameValidation.errorMessage ? 'error' : nameValidation.showCheckmark ? 'valid' : ''}`}
                type="text"
                placeholder="请输入姓名"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => validateName(name)}
              />
              {nameValidation.showCheckmark && (
                <span className="input-checkmark" data-testid="name-checkmark">✓</span>
              )}
              <span className="form-hint-message">姓名填写规则（用于身份核验，请正确填写真实姓名）</span>
            </div>
            {nameValidation.errorMessage && (
              <div className="form-error-message">{nameValidation.errorMessage}</div>
            )}
          </div>
        </div>

        {/* 证件号码 */}
        <div className="form-row">
          <div className="form-label-wrapper">
            <label className="form-label">
              <span className="required-mark">*</span>证件号码：
            </label>
          </div>
          <div className="form-input-container">
            <div className="form-input-wrapper">
              <input
                className={`form-input ${idCardValidation.errorMessage ? 'error' : idCardValidation.showCheckmark ? 'valid' : ''}`}
                type="text"
                placeholder="请输入您的证件号码"
                value={idCardNumber}
                onChange={(e) => setIdCardNumber(e.target.value)}
                onBlur={() => validateIdCard(idCardNumber)}
              />
              {idCardValidation.showCheckmark && (
                <span className="input-checkmark" data-testid="id-card-checkmark">✓</span>
              )}
              <span className="form-hint-message">（用于身份核验，请正确填写）</span>
            </div>
            {idCardValidation.errorMessage && (
              <div className="form-error-message">{idCardValidation.errorMessage}</div>
            )}
          </div>
        </div>

        {/* 优惠类型 */}
        <div className="form-row">
          <div className="form-label-wrapper">
            <label className="form-label">优惠（待）类型：</label>
          </div>
          <div className="form-input-container">
            <SelectDropdown
              options={discountTypes}
              value={discountType}
              placeholder="成人"
              onChange={setDiscountType}
              testId="discount-type-dropdown"
            />
          </div>
        </div>

        {/* 邮箱 */}
        <div className="form-row">
          <div className="form-label-wrapper">
            <label className="form-label">邮箱：</label>
          </div>
          <div className="form-input-container">
            <div className="form-input-wrapper">
              <input
                className={`form-input ${emailValidation.errorMessage ? 'error' : ''}`}
                type="email"
                placeholder="请正确填写邮箱地址"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => validateEmail(email)}
              />
            </div>
            {emailValidation.errorMessage && (
              <div className="form-error-message">{emailValidation.errorMessage}</div>
            )}
          </div>
        </div>

        {/* 手机号码 */}
        <div className="form-row">
          <div className="form-label-wrapper">
            <label className="form-label">
              <span className="required-mark">*</span>手机号码：
            </label>
          </div>
          <div className="form-input-container">
            <div className="form-input-wrapper">
              <div className="phone-input-wrapper">
                <div className="phone-country-select">
                  <SelectDropdown
                    options={['+86 中国']}
                    value="+86 中国"
                    placeholder="+86 中国"
                    onChange={() => {}}
                    testId="country-code-dropdown"
                  />
                </div>
                <input
                  className={`form-input phone-input ${phoneValidation.errorMessage ? 'error' : ''}`}
                  type="tel"
                  placeholder="手机号码"
                  value={phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  onBlur={() => validatePhone(phone)}
                  maxLength={11}
                />
              </div>
              <span className="form-hint-message">请正确填写手机号码，稍后将向该手机号发送短信验证码</span>
            </div>
            {phoneValidation.errorMessage && (
              <div className="form-error-message">{phoneValidation.errorMessage}</div>
            )}
          </div>
        </div>

        {/* 用户协议 */}
        <div className="agreement-section">
          <div className="agreement-wrapper">
            <input
              type="checkbox"
              className="agreement-checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
            />
            <span className="agreement-text">
              我已阅读并同意遵守{' '}
              <a href="/service-terms" className="agreement-link" onClick={(e) => e.preventDefault()}>
                《中国铁路客户服务中心网站服务条款》
              </a>
              {' '}
              <a href="/privacy-policy" className="agreement-link" onClick={(e) => e.preventDefault()}>
                《隐私权政策》
              </a>
            </span>
          </div>
        </div>

        {/* 提交按钮 */}
        <div className="submit-section">
          <button type="submit" className="submit-button">
            下一步
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;

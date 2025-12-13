/**
 * ValidationInput组件
 * 源文件：frontend/src/components/ValidationInput.tsx
 * 测试文件：frontend/test/components/ValidationInput.test.tsx
 * 
 * 说明：带验证功能的输入框组件
 */

import React, { useState } from 'react';
import './ValidationInput.css';

interface ValidationInputProps {
  value: string;
  onChange: (value: string) => void;
  onValidate: (value: string) => void | Promise<void>;
  placeholder: string;
  type?: string;
  maxLength?: number;
  required?: boolean;
  showCheckmark?: boolean;
  errorMessage?: string;
  disabled?: boolean;
  label?: string;
  testIdPrefix?: string;
}

const ValidationInput: React.FC<ValidationInputProps> = ({
  value,
  onChange,
  onValidate,
  placeholder,
  type = 'text',
  maxLength,
  required = false,
  showCheckmark = false,
  errorMessage = '',
  disabled = false,
  label,
  testIdPrefix
}) => {
  const [isValidating, setIsValidating] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleBlur = async () => {
    if (!disabled) {
      setIsValidating(true);
      try {
        await onValidate(value);
      } finally {
        setIsValidating(false);
      }
    }
  };

  return (
    <div className="validation-input-container">
      {label && (
        <label className="validation-input-label">
          {required && <span className="required-asterisk">*</span>}
          {label}
        </label>
      )}
      <div className="validation-input-wrapper">
        {required && !label && <span className="required">*</span>}
        <input
          type={type}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          maxLength={maxLength}
          disabled={disabled}
          className={`validation-input ${errorMessage ? 'error' : ''} ${disabled ? 'disabled' : ''}`}
        />
        {isValidating && (
          <span className="validation-loading" data-testid="validation-loading">
            <span className="loading-spinner"></span>
          </span>
        )}
        {showCheckmark && !isValidating && !errorMessage && (
          <span 
            data-testid={testIdPrefix ? `${testIdPrefix}-checkmark` : 'validation-checkmark'}
            className="checkmark valid"
          >
            ✓
          </span>
        )}
      </div>
      {errorMessage && (
        <div className="validation-input-error-message">{errorMessage}</div>
      )}
    </div>
  );
};

export default ValidationInput;


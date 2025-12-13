/**
 * SelectDropdown组件
 * 源文件：frontend/src/components/SelectDropdown.tsx
 * 测试文件：frontend/test/components/SelectDropdown.test.tsx
 * 
 * 说明：下拉选择框组件
 */

import React, { useState, useRef, useEffect } from 'react';
import './SelectDropdown.css';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectDropdownProps {
  options: string[] | SelectOption[];
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  testId?: string;
  getDisplayValue?: (value: string, label: string) => string; // 自定义显示值的函数
}

const SelectDropdown: React.FC<SelectDropdownProps> = ({
  options,
  value,
  placeholder,
  onChange,
  disabled = false,
  testId = 'select-dropdown',
  getDisplayValue: customGetDisplayValue
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 标准化选项格式
  const normalizedOptions: SelectOption[] = options.map(opt => 
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  // 获取当前选中项的显示文本
  const getDisplayValue = () => {
    const selected = normalizedOptions.find(opt => opt.value === value);
    if (!selected) return placeholder;
    
    // 如果提供了自定义显示值函数，使用它；否则使用 label
    if (customGetDisplayValue) {
      return customGetDisplayValue(selected.value, selected.label);
    }
    return selected.label;
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isExpanded]);

  const handleToggle = (e: React.MouseEvent) => {
    if (!disabled) {
      e.stopPropagation();
      setIsExpanded(!isExpanded);
    }
  };

  const handleSelect = (optionValue: string) => {
    if (!disabled) {
      onChange(optionValue);
      setIsExpanded(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleToggle(e as any);
    }
  };

  return (
    <div 
      ref={dropdownRef}
      className={`select-dropdown ${disabled ? 'disabled' : ''} ${isExpanded ? 'expanded' : ''}`}
      data-testid={testId}
      onClick={handleToggle}
      onKeyDown={handleKeyDown}
      tabIndex={disabled ? -1 : 0}
    >
      <div className="selected-value-display">
        {getDisplayValue()}
      </div>
      <input
        type="hidden"
        value={value || placeholder}
        readOnly
      />
      <span 
        data-testid="dropdown-arrow"
        className={`arrow ${isExpanded ? 'rotated' : ''}`}
      ></span>
      {isExpanded && !disabled && normalizedOptions.length > 0 && (
        <div className="options-list">
          {normalizedOptions.map((option, index) => (
            <div
              key={index}
              className={`option ${option.value === value ? 'selected' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                handleSelect(option.value);
              }}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SelectDropdown;


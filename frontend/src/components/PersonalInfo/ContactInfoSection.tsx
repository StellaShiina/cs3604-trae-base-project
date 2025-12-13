// 联系方式模块组件
import React, { useState } from 'react';
import './ContactInfoSection.css';

interface ContactInfoSectionProps {
  phone: string;
  email: string;
  isEditing?: boolean;
  onEdit?: () => void;
  onSave?: () => void;
  onNavigateToPhoneVerification?: () => void;
}

/**
 * UI-ContactInfoSection: 联系方式模块组件
 * 显示手机号和邮箱信息，支持编辑手机号
 */
const ContactInfoSection: React.FC<ContactInfoSectionProps> = ({
  phone,
  email,
  isEditing = false,
  onEdit,
  onSave,
  onNavigateToPhoneVerification
}) => {
  const [localIsEditing, setLocalIsEditing] = useState(false);

  const handleEdit = () => {
    setLocalIsEditing(true);
    onEdit?.();
  };

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('保存按钮被点击');
    // 退出编辑模式，手机号已通过手机核验页面更新
    setLocalIsEditing(false);
    onSave?.();
  };

  const showEditing = isEditing || localIsEditing;

  // 格式化手机号，在区号和号码之间添加空格
  const formatPhone = (phoneNumber: string) => {
    // 如果包含 (+86) 前缀，在后面添加空格
    return phoneNumber.replace(/(\(\+\d+\))(\d)/, '$1 $2');
  };

  return (
    <div className="contact-info-section">
      <div className="section-header">
        <h3 className="section-title">联系方式</h3>
        {showEditing ? (
          <button className="save-button" onClick={handleSave}>
            保存
          </button>
        ) : (
          <button className="edit-button" onClick={handleEdit}>
            编辑
          </button>
        )}
      </div>
      <div className="info-content">
        <div className="info-row">
          <span className="info-label">
            <span className="required-mark">* </span>手机号：
          </span>
          <div className="info-value-group">
            <span className="info-value">{formatPhone(phone)}</span>
            {showEditing ? (
              <span className="phone-verification-text">
                去<span className="phone-verification-link" onClick={onNavigateToPhoneVerification}>手机核验</span>修改
              </span>
            ) : (
              <span className="verification-status">已通过核验</span>
            )}
          </div>
        </div>
        <div className="info-row">
          <span className="info-label">邮箱：</span>
          <span className="info-value">{email || ''}</span>
        </div>
      </div>
    </div>
  );
};

export default ContactInfoSection;


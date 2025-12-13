// 个人信息展示面板组件
import React, { useState } from 'react';
import BasicInfoSection from './BasicInfoSection';
import ContactInfoSection from './ContactInfoSection';
import AdditionalInfoSection from './AdditionalInfoSection';
import './PersonalInfoPanel.css';

interface UserInfo {
  username: string;
  name: string;
  country: string;
  idCardType: string;
  idCardNumber: string;
  verificationStatus: string;
  phone: string;
  email: string;
  discountType: string;
}

interface PersonalInfoPanelProps {
  userInfo: UserInfo;
  onEditContact?: () => void;
  onEditAdditional?: () => void;
  onNavigateToPhoneVerification?: () => void;
  onSaveDiscountType?: (discountType: string) => void;
}

/**
 * UI-PersonalInfoPanel: 个人信息展示面板组件
 * 分为三个信息模块：基本信息、联系方式、附加信息
 */
const PersonalInfoPanel: React.FC<PersonalInfoPanelProps> = ({
  userInfo,
  onEditContact,
  onEditAdditional,
  onNavigateToPhoneVerification,
  onSaveDiscountType
}) => {
  const [isEditingContact, setIsEditingContact] = useState(false);

  const handleEditContact = () => {
    setIsEditingContact(true);
    onEditContact?.();
  };

  const handleSaveContact = () => {
    setIsEditingContact(false);
  };

  const handleEditAdditional = () => {
    // 附加信息编辑逻辑（暂未实现）
    onEditAdditional?.();
  };

  return (
    <div className="personal-info-panel">
      <BasicInfoSection
        username={userInfo.username}
        name={userInfo.name}
        country={userInfo.country}
        idCardType={userInfo.idCardType}
        idCardNumber={userInfo.idCardNumber}
        verificationStatus={userInfo.verificationStatus}
      />
      
      <ContactInfoSection
        phone={userInfo.phone}
        email={userInfo.email}
        isEditing={isEditingContact}
        onEdit={handleEditContact}
        onSave={handleSaveContact}
        onNavigateToPhoneVerification={onNavigateToPhoneVerification}
      />
      
      <AdditionalInfoSection
        discountType={userInfo.discountType}
        onEdit={handleEditAdditional}
        onSaveDiscountType={onSaveDiscountType}
      />
    </div>
  );
};

export default PersonalInfoPanel;


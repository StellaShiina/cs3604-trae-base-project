// 基本信息模块组件
import React from 'react';
import './BasicInfoSection.css';

interface BasicInfoSectionProps {
  username: string;
  name: string;
  country: string;
  idCardType: string;
  idCardNumber: string;
  verificationStatus: string;
}

/**
 * UI-BasicInfoSection: 基本信息模块组件
 * 显示用户的主要身份信息
 */
const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
  username,
  name,
  country,
  idCardType,
  idCardNumber,
  verificationStatus
}) => {
  // 脱敏显示证件号码：显示前4位和后3位，中间用*替代
  const maskIdCard = (idCard: string) => {
    if (!idCard || idCard.length <= 7) return idCard;
    const firstFour = idCard.substring(0, 4);
    const lastThree = idCard.substring(idCard.length - 3);
    const middleLength = idCard.length - 7;
    const masked = '*'.repeat(middleLength);
    return `${firstFour}${masked}${lastThree}`;
  };

  return (
    <div className="basic-info-section">
      <h3 className="section-title">基本信息</h3>
      <div className="info-content">
        <div className="info-row">
          <span className="info-label">
            <span className="required-mark">* </span>用户名：
          </span>
          <span className="info-value">{username}</span>
        </div>
        <div className="info-row">
          <span className="info-label">
            <span className="required-mark">* </span>姓名：
          </span>
          <span className="info-value">{name}</span>
        </div>
        <div className="info-row">
          <span className="info-label">国家/地区：</span>
          <span className="info-value">{country}</span>
        </div>
        <div className="info-row">
          <span className="info-label">
            <span className="required-mark">* </span>证件类型：
          </span>
          <span className="info-value">{idCardType}</span>
        </div>
        <div className="info-row">
          <span className="info-label">
            <span className="required-mark">* </span>证件号码：
          </span>
          <span className="info-value">{maskIdCard(idCardNumber)}</span>
        </div>
        <div className="info-row">
          <span className="info-label">核验状态：</span>
          <span className="info-value verification-status">{verificationStatus}</span>
        </div>
      </div>
    </div>
  );
};

export default BasicInfoSection;


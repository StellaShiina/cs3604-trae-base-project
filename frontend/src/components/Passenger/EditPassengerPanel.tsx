// 编辑乘车人面板组件
import React, { useState } from 'react';
import SelectDropdown from '../SelectDropdown';
import './EditPassengerPanel.css';

interface EditPassengerPanelProps {
  passenger: any;
  onSubmit: (passengerData: any) => void;
  onCancel: () => void;
}

const EditPassengerPanel: React.FC<EditPassengerPanelProps> = ({
  passenger,
  onSubmit,
  onCancel
}) => {
  const [phone, setPhone] = useState(passenger.phone || '');
  const [discountType, setDiscountType] = useState(passenger.discountType || passenger.discount_type || '成人');
  const [errors, setErrors] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);

  const discountTypes = ['成人', '儿童', '学生', '残疾军人'];

  const validatePhone = (value: string) => {
    if (!value) return '手机号码不能为空';
    if (value.length !== 11 || !/^\d{11}$/.test(value)) {
      return '您输入的手机号码不是有效的格式！';
    }
    return '';
  };

  const handleSubmit = async () => {
    const phoneError = validatePhone(phone);

    if (phoneError) {
      setErrors({ phone: phoneError });
      return;
    }

    setIsLoading(true);
    try {
      // 传递所有字段，包括不可编辑的字段，以避免数据丢失
      await onSubmit({ 
        name: passenger.name,
        idCardType: passenger.idCardType || passenger.id_card_type,
        idCardNumber: passenger.idCardNumber || passenger.id_card_number,
        phone, 
        discountType 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="edit-passenger-panel">
      <div className="edit-passenger-form-container">
        {/* 基本信息 - 只读显示 */}
        <div className="edit-passenger-section edit-basic-info-section">
          <h3 className="edit-passenger-section-title">基本信息</h3>
          
          <div className="edit-info-content">
            <div className="edit-info-row">
              <span className="edit-info-label">
                <span className="edit-required-mark">* </span>证件类型：
              </span>
              <span className="edit-info-value">
                {passenger.idCardType || passenger.id_card_type || '居民身份证'}
              </span>
            </div>

            <div className="edit-info-row">
              <span className="edit-info-label">
                <span className="edit-required-mark">* </span>姓名：
              </span>
              <span className="edit-info-value">{passenger.name}</span>
            </div>

            <div className="edit-info-row">
              <span className="edit-info-label">
                <span className="edit-required-mark">* </span>证件号码：
              </span>
              <span className="edit-info-value">
                {passenger.idCardNumber || passenger.id_card_number}
              </span>
            </div>

            <div className="edit-info-row">
              <span className="edit-info-label">
                <span className="edit-required-mark">* </span>国家/地区：
              </span>
              <span className="edit-info-value">中国China</span>
            </div>

            <div className="edit-info-row">
              <span className="edit-info-label">添加日期：</span>
              <span className="edit-info-value">
                {passenger.created_at || new Date().toISOString().split('T')[0]}
              </span>
            </div>

            <div className="edit-info-row">
              <span className="edit-info-label">核验状态：</span>
              <span className="edit-info-value edit-verification-status">已通过</span>
            </div>
          </div>
        </div>

        {/* 联系方式 - 可编辑 */}
        <div className="edit-passenger-section">
          <h3 className="edit-passenger-section-title">
            联系方式<span className="edit-passenger-section-subtitle">（请提供乘车人真实有效的联系方式）</span>
          </h3>

          <div className="edit-passenger-form-row">
            <div className="edit-passenger-label-wrapper">
              <label className="edit-passenger-label">手机号码：</label>
            </div>
            <div className="edit-passenger-input-container">
              <div className="edit-passenger-input-wrapper">
                <div className="edit-passenger-phone-group">
                  <SelectDropdown
                    options={['+86']}
                    value="+86"
                    onChange={() => {}}
                    placeholder="+86"
                  />
                  <input
                    type="text"
                    className={`edit-passenger-input edit-passenger-phone-input ${errors.phone ? 'edit-passenger-input-error' : ''}`}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="请填写手机号码"
                    maxLength={11}
                  />
                </div>
              </div>
              {errors.phone && <div className="edit-passenger-error-message">{errors.phone}</div>}
              <div className="edit-passenger-hint edit-passenger-hint-block">
                请您填写乘车人真实有效的联系方式，以便接收铁路部门推送的重要服务信息，以及在紧急特殊情况下的联系。
              </div>
            </div>
          </div>
        </div>

        {/* 附加信息 - 可编辑 */}
        <div className="edit-passenger-section">
          <h3 className="edit-passenger-section-title">附加信息</h3>

          <div className="edit-passenger-form-row">
            <div className="edit-passenger-label-wrapper">
              <label className="edit-passenger-label">
                <span className="edit-passenger-required">*</span> 优惠(待)类型：
              </label>
            </div>
            <div className="edit-passenger-input-container">
              <SelectDropdown
                options={discountTypes}
                value={discountType}
                onChange={setDiscountType}
                placeholder="请选择优惠类型"
              />
            </div>
          </div>
        </div>

        {/* 按钮组 */}
        <div className="edit-passenger-button-group">
          <button className="edit-passenger-button edit-passenger-button-cancel" onClick={onCancel}>
            取消
          </button>
          <button 
            className="edit-passenger-button edit-passenger-button-submit" 
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? '保存中...' : '保存'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditPassengerPanel;


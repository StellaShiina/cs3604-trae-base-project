// 附加信息模块组件
import React, { useState } from 'react';
import SelectDropdown from '../SelectDropdown';
import './AdditionalInfoSection.css';

interface AdditionalInfoSectionProps {
  discountType: string;
  onEdit?: () => void;
  onSaveDiscountType?: (discountType: string) => void;
}

/**
 * UI-AdditionalInfoSection: 附加信息模块组件
 * 显示优惠(待)类型信息
 */
const AdditionalInfoSection: React.FC<AdditionalInfoSectionProps> = ({
  discountType,
  onEdit = () => {},
  onSaveDiscountType
}) => {
  const [localIsEditing, setLocalIsEditing] = useState(false);
  const [editingDiscountType, setEditingDiscountType] = useState(discountType);

  // 优惠类型选项（与注册页一致）
  const discountTypes = ['成人', '儿童', '学生', '残疾军人'];

  // 当discountType prop变化时，同步更新editingDiscountType
  React.useEffect(() => {
    setEditingDiscountType(discountType);
  }, [discountType]);

  const handleEdit = () => {
    setEditingDiscountType(discountType); // 确保编辑时从最新的值开始
    setLocalIsEditing(true);
    onEdit?.();
  };

  const handleSave = async () => {
    // 保存优惠类型（随时可以保存，不管是否有修改）
    if (onSaveDiscountType) {
      await onSaveDiscountType(editingDiscountType);
    }
    setLocalIsEditing(false);
  };

  return (
    <div className="additional-info-section">
      <div className="section-header">
        <h3 className="section-title">附加信息</h3>
        {localIsEditing ? (
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
            <span className="required-mark">* </span>优惠(待)类型：
          </span>
          {localIsEditing ? (
            <div className="discount-dropdown-wrapper">
              <SelectDropdown
                options={discountTypes}
                value={editingDiscountType}
                placeholder="请选择优惠类型"
                onChange={setEditingDiscountType}
              />
            </div>
          ) : (
            <span className="info-value">{discountType}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdditionalInfoSection;


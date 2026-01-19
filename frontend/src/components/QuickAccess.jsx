import React from 'react';
import './QuickAccess.css';

const QuickAccess = () => {
  const items = [
    { label: '重点旅客预约', icon: '♿' },
    { label: '遗失物品查找', icon: '🔍' },
    { label: '约车服务', icon: '🚗' },
    { label: '便民托运', icon: '📦' },
    { label: '车站引导', icon: '🚉' },
    { label: '站车风采', icon: '📷' },
    { label: '用户反馈', icon: '💬' }
  ];

  return (
    <div className="quick-access">
      <div className="quick-access-container">
        {items.map((item, index) => (
          <div key={index} className="quick-item">
            <div className="quick-icon">{item.icon}</div>
            <div className="quick-label">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuickAccess;

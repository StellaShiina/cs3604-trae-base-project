// 左侧功能菜单栏组件
import { useState } from 'react';
import './SideMenu.css';

interface SideMenuProps {
  currentSection: string;
  onMenuClick: (section: string) => void;
}

/**
 * UI-SideMenu: 左侧功能菜单栏组件
 * 采用垂直列表形式展示功能分区
 */
const SideMenu = ({ currentSection, onMenuClick }: SideMenuProps) => {
  const [selectedItem, setSelectedItem] = useState(currentSection);
  const [expandedSections, setExpandedSections] = useState<string[]>(['order-center', 'personal-info', 'common-info']);

  const handleClick = (section: string, hasPage: boolean = true) => {
    if (hasPage) {
      setSelectedItem(section);
      onMenuClick(section);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  return (
    <div className="side-menu">
      <div className="menu-header">个人中心</div>
      
      {/* 订单中心 */}
      <div className="menu-section">
        <div className="menu-title" onClick={() => toggleSection('order-center')}>
          订单中心
          <span className="menu-toggle">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="1" width="14" height="14" stroke="#aaaaaa" strokeWidth="1.5" fill="white"/>
              <path 
                d={expandedSections.includes('order-center') ? "M5 6 L8 9 L11 6 Z" : "M5 10 L8 7 L11 10 Z"} 
                fill="#aaaaaa"
              />
            </svg>
          </span>
        </div>
        {expandedSections.includes('order-center') && (
          <div className="menu-items">
            <div
              className={`menu-item ${selectedItem === 'train-orders' ? 'selected' : ''}`}
              onClick={() => handleClick('train-orders')}
            >
              火车票订单
            </div>
            <div className="menu-item disabled">候补订单</div>
            <div className="menu-item disabled">计次·定期票...</div>
            <div className="menu-item disabled">约号订单</div>
            <div className="menu-item disabled">雪具快运订单</div>
            <div className="menu-item disabled">餐饮·特产</div>
            <div className="menu-item disabled">保险订单</div>
            <div className="menu-item disabled">电子发票</div>
          </div>
        )}
      </div>

      {/* 本人车票 */}
      <div className="menu-section">
        <div className="menu-title-simple">本人车票</div>
      </div>

      {/* 会员中心 */}
      <div className="menu-section">
        <div className="menu-title-simple">会员中心</div>
      </div>

      {/* 个人信息 */}
      <div className="menu-section">
        <div className="menu-title" onClick={() => toggleSection('personal-info')}>
          个人信息
          <span className="menu-toggle">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="1" width="14" height="14" stroke="#aaaaaa" strokeWidth="1.5" fill="white"/>
              <path 
                d={expandedSections.includes('personal-info') ? "M5 6 L8 9 L11 6 Z" : "M5 10 L8 7 L11 10 Z"} 
                fill="#aaaaaa"
              />
            </svg>
          </span>
        </div>
        {expandedSections.includes('personal-info') && (
          <div className="menu-items">
            <div
              className={`menu-item ${selectedItem === 'personal-info' ? 'selected' : ''}`}
              onClick={() => handleClick('personal-info')}
            >
              查看个人信息
            </div>
            <div className="menu-item disabled">账号安全</div>
            <div
              className={`menu-item ${selectedItem === 'phone-verification' ? 'selected' : ''}`}
              onClick={() => handleClick('phone-verification')}
            >
              手机核验
            </div>
            <div className="menu-item disabled">账号注销</div>
          </div>
        )}
      </div>

      {/* 常用信息管理 */}
      <div className="menu-section">
        <div className="menu-title" onClick={() => toggleSection('common-info')}>
          常用信息管理
          <span className="menu-toggle">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="1" width="14" height="14" stroke="#aaaaaa" strokeWidth="1.5" fill="white"/>
              <path 
                d={expandedSections.includes('common-info') ? "M5 6 L8 9 L11 6 Z" : "M5 10 L8 7 L11 10 Z"} 
                fill="#aaaaaa"
              />
            </svg>
          </span>
        </div>
        {expandedSections.includes('common-info') && (
          <div className="menu-items">
            <div
              className={`menu-item ${selectedItem === 'passengers' ? 'selected' : ''}`}
              onClick={() => handleClick('passengers')}
            >
              乘车人
            </div>
            <div className="menu-item disabled">地址管理</div>
          </div>
        )}
      </div>

      {/* 温馨服务 */}
      <div className="menu-section">
        <div className="menu-title" onClick={() => toggleSection('warm-service')}>
          温馨服务
          <span className="menu-toggle">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="1" width="14" height="14" stroke="#aaaaaa" strokeWidth="1.5" fill="white"/>
              <path 
                d={expandedSections.includes('warm-service') ? "M5 6 L8 9 L11 6 Z" : "M5 10 L8 7 L11 10 Z"} 
                fill="#aaaaaa"
              />
            </svg>
          </span>
        </div>
        {expandedSections.includes('warm-service') && (
          <div className="menu-items">
            <div className="menu-item disabled">重点旅客预约</div>
            <div className="menu-item disabled">遗失物品查找</div>
            <div className="menu-item disabled">服务查询</div>
          </div>
        )}
      </div>

      {/* 投诉和建议 */}
      <div className="menu-section">
        <div className="menu-title" onClick={() => toggleSection('feedback')}>
          投诉和建议
          <span className="menu-toggle">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="1" width="14" height="14" stroke="#aaaaaa" strokeWidth="1.5" fill="white"/>
              <path 
                d={expandedSections.includes('feedback') ? "M5 6 L8 9 L11 6 Z" : "M5 10 L8 7 L11 10 Z"} 
                fill="#aaaaaa"
              />
            </svg>
          </span>
        </div>
        {expandedSections.includes('feedback') && (
          <div className="menu-items">
            <div className="menu-item disabled">投诉</div>
            <div className="menu-item disabled">建议</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SideMenu;


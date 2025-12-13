// 位置导航组件
import React from 'react';
import './BreadcrumbNavigation.css';

interface BreadcrumbNavigationProps {
  path: string[];
  currentPage: string;
}

/**
 * UI-BreadcrumbNavigation: 位置导航组件
 * 显示当前页面的位置路径
 */
const BreadcrumbNavigation: React.FC<BreadcrumbNavigationProps> = ({
  path,
  currentPage
}) => {
  return (
    <div className="breadcrumb-navigation">
      <span className="breadcrumb-label">当前位置：</span>
      {path.map((item, index) => (
        <span key={index}>
          <span className="breadcrumb-item">{item}</span>
          <span className="breadcrumb-separator">&gt;</span>
        </span>
      ))}
      <span className="breadcrumb-current">{currentPage}</span>
    </div>
  );
};

export default BreadcrumbNavigation;


import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ReserveButton.css';
import ConfirmModal from './ConfirmModal';

interface ReserveButtonProps {
  trainNo: string;
  departureStation: string;
  arrivalStation: string;
  departureDate: string;
  departureTime: string;
  hasSoldOut: boolean;
  isLoggedIn: boolean;
  onReserve: (trainNo: string) => void;
  queryTimestamp: string;
}

/**
 * 预订按钮组件
 * 骨架实现：仅包含组件结构，不实现真实逻辑
 */
const ReserveButton: React.FC<ReserveButtonProps> = ({
  trainNo,
  departureStation: _departureStation,
  arrivalStation: _arrivalStation,
  departureDate,
  departureTime,
  hasSoldOut,
  isLoggedIn,
  onReserve,
  queryTimestamp,
}) => {
  const navigate = useNavigate();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [modalConfig, setModalConfig] = useState<any>({});

  // 实现预订逻辑
  const handleClick = () => {
    // 1. 检查用户登录状态
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }

    // 2. 检查查询时间是否超过5分钟
    const now = new Date();
    const queryTime = new Date(queryTimestamp);
    const timeDiff = now.getTime() - queryTime.getTime();
    const fiveMinutesInMs = 5 * 60 * 1000;

    if (timeDiff > fiveMinutesInMs) {
      setModalConfig({
        title: '提示',
        message: '页面内容已过期，请重新查询！',
        confirmText: '确认',
        cancelText: '取消',
        onConfirm: () => {
          setShowConfirmModal(false);
          // 刷新页面或重新查询
          window.location.reload();
        },
      });
      setShowConfirmModal(true);
      return;
    }

    // 3. 检查距离发车时间（如果小于3小时，显示提示）
    const departureDateTime = new Date(`${departureDate} ${departureTime}`);
    const timeUntilDeparture = departureDateTime.getTime() - now.getTime();
    const threeHoursInMs = 3 * 60 * 60 * 1000;

    if (timeUntilDeparture < threeHoursInMs && timeUntilDeparture > 0) {
      setModalConfig({
        title: '温馨提示',
        message: '您选择的列车距开车时间很近了，进站约需20分钟，请确保有足够的时间办理安全检查、实名制验证及检票等手续，以免耽误您的旅行。',
        confirmText: '确认',
        cancelText: '取消',
        onConfirm: () => {
          setShowConfirmModal(false);
          // 继续预订
          onReserve(trainNo);
        },
      });
      setShowConfirmModal(true);
      return;
    }

    // 4. 正常预订流程
    onReserve(trainNo);
  };

  return (
    <>
      <button
        className={`reserve-button ${hasSoldOut ? 'soldout' : ''}`}
        onClick={handleClick}
        disabled={hasSoldOut}
      >
        预订
      </button>
      
      {/* 登录提示弹窗 */}
      {showLoginModal && (
        <ConfirmModal
          isVisible={showLoginModal}
          title="提示"
          message="请先登录！"
          confirmText="确认"
          cancelText="取消"
          onConfirm={() => {
            setShowLoginModal(false);
            navigate('/login');
          }}
          onCancel={() => setShowLoginModal(false)}
        />
      )}
      
      {/* 其他确认弹窗 */}
      {showConfirmModal && (
        <ConfirmModal
          isVisible={showConfirmModal}
          title={modalConfig.title}
          message={modalConfig.message}
          confirmText={modalConfig.confirmText}
          cancelText={modalConfig.cancelText}
          onConfirm={modalConfig.onConfirm}
          onCancel={() => setShowConfirmModal(false)}
        />
      )}
    </>
  );
};

export default ReserveButton;


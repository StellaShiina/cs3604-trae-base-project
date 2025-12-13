import React from 'react';
import './TrainInfoDisplay.css';

interface TrainInfoDisplayProps {
  trainInfo: any;
}

/**
 * 车次信息展示组件（用于信息核对弹窗）
 */
const TrainInfoDisplay: React.FC<TrainInfoDisplayProps> = ({ trainInfo }) => {
  if (!trainInfo) return null;
  
  // 实现日期格式化（包含星期）
  const formatDate = (date: string, dayOfWeek?: string) => {
    if (dayOfWeek) {
      return `${date}（${dayOfWeek}）`;
    }
    const d = new Date(date);
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const weekDay = weekDays[d.getDay()];
    return `${date}（${weekDay}）`;
  };
  
  return (
    <div className="train-info-display">
      <div className="train-info-line">
        <span className="info-date">{formatDate(trainInfo.departureDate, trainInfo.dayOfWeek)}</span>
        <span className="info-group">
          <span className="info-train-no">{trainInfo.trainNo}</span>
          <span className="info-text">次</span>
        </span>
        <span className="info-group">
          <span className="info-station">{trainInfo.departureStation}</span>
          <span className="info-text">站</span>
          <span className="info-bold-group">（{trainInfo.departureTime}开）—{trainInfo.arrivalStation}</span>
          <span className="info-text">站（{trainInfo.arrivalTime}到）</span>
        </span>
      </div>
    </div>
  );
};

export default TrainInfoDisplay;


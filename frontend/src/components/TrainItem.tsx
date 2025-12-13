import React from 'react';
import './TrainItem.css';
import ReserveButton from './ReserveButton';

interface TrainItemProps {
  train: any;
  onReserve: (trainNo: string) => void;
  isLoggedIn: boolean;
  queryTimestamp: string;
  rowIndex: number;
}

/**
 * 车次列表项组件
 */
const TrainItem: React.FC<TrainItemProps> = ({ train, onReserve, isLoggedIn, queryTimestamp, rowIndex }) => {
  // 从 train.availableSeats 中提取座位信息，映射中文到英文
  const availableSeats = {
    business: train.availableSeats?.['商务座'] ?? null,
    firstClass: train.availableSeats?.['一等座'] ?? null,
    secondClass: train.availableSeats?.['二等座'] ?? null,
    softSleeper: train.availableSeats?.['软卧'] ?? null,
    hardSleeper: train.availableSeats?.['硬卧'] ?? null,
  };

  const formatSeatStatus = (count: number | null | undefined) => {
    if (count === null || count === undefined) return '--';
    if (count === 0) return '无';
    if (count >= 20) return '有';
    return count.toString();
  };

  const getSeatClass = (count: number | null | undefined) => {
    if (count === null || count === undefined) return 'not-available';
    if (count === 0) return 'sold-out';
    if (count >= 20) return 'available';
    return 'limited';
  };

  // 判断是否所有座位都售罄
  const isAllSoldOut = () => {
    const validSeats = Object.values(availableSeats).filter(count => count !== null && count !== undefined);
    // 如果没有任何有效座位，不算售罄（可能是数据问题）
    if (validSeats.length === 0) return false;
    // 所有有效座位都为0才算售罄
    return validSeats.every(count => count === 0);
  };

  // 格式化历时（分钟 -> "HH:MM"）
  const formatDuration = (minutes: number | undefined) => {
    if (!minutes) return '--';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  };

  return (
    <div className={`train-item ${rowIndex % 2 === 0 ? 'train-item-even' : 'train-item-odd'}`}>
      {/* 车次号 - 带下拉箭头 */}
      <div className="train-item-cell align-left">
        <div className="train-number-container">
          <span className="train-number">{train.trainNo || '--'}</span>
          <svg className="train-dropdown-arrow" width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 8L2 4H10L6 8Z" fill="#2196f3"/>
          </svg>
        </div>
        {/* 可以在这里添加车次类型标签 */}
        <div className="train-badges">
          {train.trainNo?.startsWith('G') && <span className="train-badge">高</span>}
          {train.trainNo?.startsWith('D') && <span className="train-badge">动</span>}
        </div>
      </div>
      
      {/* 出发站/到达站 */}
      <div className="train-item-cell">
        <div className="train-stations-vertical">
          <div className="station-name-with-badge">
            <span className="station-badge station-badge-start">始</span>
            <span className="station-name">{train.departureStation || '--'}</span>
          </div>
          <div className="station-name-with-badge">
            <span className="station-badge station-badge-end">终</span>
            <span className="station-name">{train.arrivalStation || '--'}</span>
          </div>
        </div>
      </div>
      
      {/* 出发/到达时间 */}
      <div className="train-item-cell">
        <div className="train-times-vertical">
          <div className="train-time train-time-departure">{train.departureTime || '--'}</div>
          <div className="train-time train-time-arrival">{train.arrivalTime || '--'}</div>
        </div>
      </div>
      
      {/* 历时 */}
      <div className="train-item-cell">
        <div className="train-duration">{formatDuration(train.duration)}</div>
        <div className="train-arrival-date">
          {(() => {
            if (!train.departureTime || !train.arrivalTime) return <span className="arrival-day-tag">当日到达</span>;
            const depTime = train.departureTime.split(':').map(Number);
            const arrTime = train.arrivalTime.split(':').map(Number);
            const depMinutes = depTime[0] * 60 + depTime[1];
            const arrMinutes = arrTime[0] * 60 + arrTime[1];
            return arrMinutes < depMinutes ? (
              <span className="arrival-day-tag">次日到达</span>
            ) : (
              <span className="arrival-day-tag">当日到达</span>
            );
          })()}
        </div>
      </div>
      
      {/* 商务座/特等座 */}
      <div className="train-item-cell">
        <div className={`seat-info ${getSeatClass(availableSeats.business)}`}>
          {formatSeatStatus(availableSeats.business)}
        </div>
      </div>
      
      {/* 优选/一等座 */}
      <div className="train-item-cell">
        <div className="seat-info">--</div>
      </div>
      
      {/* 一等座 */}
      <div className="train-item-cell">
        <div className={`seat-info ${getSeatClass(availableSeats.firstClass)}`}>
          {formatSeatStatus(availableSeats.firstClass)}
        </div>
      </div>
      
      {/* 二等座/二等包座 */}
      <div className="train-item-cell">
        <div className={`seat-info ${getSeatClass(availableSeats.secondClass)}`}>
          {formatSeatStatus(availableSeats.secondClass)}
        </div>
      </div>
      
      {/* 高级/软卧 */}
      <div className="train-item-cell">
        <div className="seat-info">--</div>
      </div>
      
      {/* 软卧/动卧/一等卧 */}
      <div className="train-item-cell">
        <div className={`seat-info ${getSeatClass(availableSeats.softSleeper)}`}>
          {formatSeatStatus(availableSeats.softSleeper)}
        </div>
      </div>
      
      {/* 硬卧/二等卧 */}
      <div className="train-item-cell">
        <div className={`seat-info ${getSeatClass(availableSeats.hardSleeper)}`}>
          {formatSeatStatus(availableSeats.hardSleeper)}
        </div>
      </div>
      
      {/* 软座 */}
      <div className="train-item-cell">
        <div className="seat-info">--</div>
      </div>
      
      {/* 硬座 */}
      <div className="train-item-cell">
        <div className="seat-info">--</div>
      </div>
      
      {/* 无座 */}
      <div className="train-item-cell">
        <div className="seat-info">--</div>
      </div>
      
      {/* 其他 */}
      <div className="train-item-cell">
        <div className="seat-info">--</div>
      </div>
      
      {/* 备注 */}
      <div className="train-item-cell train-reserve-cell">
        <ReserveButton
          trainNo={train.trainNo}
          departureStation={train.departureStation}
          arrivalStation={train.arrivalStation}
          departureDate={train.departureDate}
          departureTime={train.departureTime}
          hasSoldOut={isAllSoldOut()}
          isLoggedIn={isLoggedIn}
          onReserve={onReserve}
          queryTimestamp={queryTimestamp}
        />
      </div>
    </div>
  );
};

export default TrainItem;


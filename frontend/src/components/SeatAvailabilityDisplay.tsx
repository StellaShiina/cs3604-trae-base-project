import React from 'react';
import './SeatAvailabilityDisplay.css';

interface SeatAvailabilityDisplayProps {
  availableSeats: any;
}

/**
 * 余票状态显示组件
 */
const SeatAvailabilityDisplay: React.FC<SeatAvailabilityDisplayProps> = ({ availableSeats }) => {
  if (!availableSeats) return null;
  
  return (
    <div className="seat-availability-display">
      <p className="availability-text">
        本次列车，
        {Object.entries(availableSeats).map(([seatType, count], index) => (
          <span key={seatType}>
            {index > 0 && '，'}
            {seatType}余票 <span className="seat-count">{String(count)}</span> 张
          </span>
        ))}
        。
      </p>
    </div>
  );
};

export default SeatAvailabilityDisplay;


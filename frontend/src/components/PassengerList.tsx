import React from 'react';
import './PassengerList.css';
import PassengerCheckbox from './PassengerCheckbox';

interface PassengerListProps {
  passengers: any[];
  selectedPassengerIds: string[];
  onSelect: (passengerId: string, selected: boolean) => void;
  searchKeyword: string;
}

/**
 * 乘客列表组件
 */
const PassengerList: React.FC<PassengerListProps> = ({
  passengers,
  selectedPassengerIds,
  onSelect,
  searchKeyword,
}) => {
  if (passengers.length === 0) {
    return (
      <div className="passenger-list-empty">
        {searchKeyword ? '没有找到匹配的乘客' : '暂无乘客信息，请先在个人中心添加乘客'}
      </div>
    );
  }
  
  return (
    <div className="passenger-list">
      {passengers.map((passenger) => (
        <PassengerCheckbox
          key={passenger.id}
          passenger={passenger}
          isChecked={selectedPassengerIds.includes(passenger.id)}
          onChange={(selected) => onSelect(passenger.id, selected)}
        />
      ))}
    </div>
  );
};

export default PassengerList;


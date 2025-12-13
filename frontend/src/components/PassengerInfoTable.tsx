import React from 'react';
import './PassengerInfoTable.css';

interface PassengerInfoTableProps {
  passengers: any[];
}

/**
 * 乘客信息表格组件（用于信息核对弹窗）
 */
const PassengerInfoTable: React.FC<PassengerInfoTableProps> = ({ passengers }) => {
  if (!passengers || passengers.length === 0) return null;
  
  return (
    <div className="passenger-info-table-container">
      <table className="passenger-info-table">
        <thead>
          <tr>
            <th>序号</th>
            <th>席别</th>
            <th>票种</th>
            <th>姓名</th>
            <th>证件类型</th>
            <th>证件号码</th>
          </tr>
        </thead>
        <tbody>
          {passengers.map((passenger, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{passenger.seatType}</td>
              <td>{passenger.ticketType}</td>
              <td>
                {passenger.name}
                {passenger.points !== undefined && (
                  <span className="passenger-points">积分*{passenger.points}</span>
                )}
              </td>
              <td>{passenger.idCardType}</td>
              <td>{passenger.idCardNumber}</td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <div className="seat-allocation-notice">
        系统将随机为您申请席位，暂不支持自选席位。
      </div>
    </div>
  );
};

export default PassengerInfoTable;


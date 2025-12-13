import React from 'react';
import './PurchaseInfoTable.css';
import PurchaseInfoRow from './PurchaseInfoRow';

interface PurchaseInfoTableProps {
  purchaseInfo: any[];
  availableSeatTypes: any[];
  onSeatTypeChange: (index: number, seatType: string) => void;
  onTicketTypeChange: (index: number, ticketType: string) => void;
  onDeleteRow?: (index: number) => void;
  fareInfo?: any;
}

/**
 * 购票信息填写表格组件
 */
const PurchaseInfoTable: React.FC<PurchaseInfoTableProps> = ({
  purchaseInfo,
  availableSeatTypes,
  onSeatTypeChange,
  onTicketTypeChange,
  onDeleteRow,
  fareInfo,
}) => {
  // 如果没有选择乘客，显示一个默认的空行
  const isEmptyRow = purchaseInfo.length === 0;
  const displayInfo = isEmptyRow 
    ? [{
        passenger: { name: '', idCardType: '居民身份证', idCardNumber: '' },
        ticketType: '成人票',
        seatType: availableSeatTypes.length > 0 ? availableSeatTypes[0] : ''
      }]
    : purchaseInfo;
  
  return (
    <div className="purchase-info-table">
      <div className="table-header">
        <div className="table-header-cell">序号</div>
        <div className="table-header-cell">票种</div>
        <div className="table-header-cell">席别</div>
        <div className="table-header-cell">姓名</div>
        <div className="table-header-cell">证件类型</div>
        <div className="table-header-cell">证件号码</div>
        <div className="table-header-cell"></div>
      </div>
      
      <div className="table-body">
        {displayInfo.map((info, index) => (
          <PurchaseInfoRow
            key={index}
            sequence={index + 1}
            passenger={info.passenger}
            ticketType={info.ticketType}
            seatType={info.seatType}
            availableSeatTypes={availableSeatTypes}
            onSeatTypeChange={isEmptyRow ? () => {} : (seatType) => onSeatTypeChange(index, seatType)}
            onTicketTypeChange={isEmptyRow ? () => {} : (ticketType) => onTicketTypeChange(index, ticketType)}
            onDelete={onDeleteRow && !isEmptyRow ? () => onDeleteRow(index) : undefined}
            fareInfo={fareInfo}
          />
        ))}
      </div>
    </div>
  );
};

export default PurchaseInfoTable;


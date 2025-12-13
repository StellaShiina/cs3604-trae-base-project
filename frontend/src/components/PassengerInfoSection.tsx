import React, { useState } from 'react';
import './PassengerInfoSection.css';
import PassengerList from './PassengerList';
import PurchaseInfoTable from './PurchaseInfoTable';
import PassengerSearchBox from './PassengerSearchBox';

interface PassengerInfoSectionProps {
  passengers?: any[];
  onPassengerSelect: (passengerId: string, selected: boolean) => void;
  onSearchPassenger: (keyword: string) => void;
  availableSeatTypes: any[];
  defaultSeatType: string;
  selectedPassengers: string[];
  purchaseInfo: any[];
  onSeatTypeChange: (index: number, seatType: string) => void;
  onTicketTypeChange: (index: number, ticketType: string) => void;
  onDeleteRow?: (index: number) => void;
  fareInfo?: any;
}

/**
 * 乘客信息区域组件
 */
const PassengerInfoSection: React.FC<PassengerInfoSectionProps> = ({
  passengers = [],
  onPassengerSelect,
  onSearchPassenger,
  availableSeatTypes,
  defaultSeatType: _defaultSeatType,
  selectedPassengers,
  purchaseInfo,
  onSeatTypeChange,
  onTicketTypeChange,
  onDeleteRow,
  fareInfo,
}) => {
  const [searchKeyword, setSearchKeyword] = useState('');
  
  // 确保 passengers 始终是数组，并进行筛选
  const filteredPassengers = (passengers || []).filter(p => 
    p && (!searchKeyword || (p.name && p.name.includes(searchKeyword)))
  );
  
  const handleSearch = (keyword: string) => {
    setSearchKeyword(keyword);
    onSearchPassenger(keyword);
  };
  
  return (
    <div className="passenger-info-section">
      <div className="passenger-info-header">
        <h2 className="section-title">乘客信息（填写说明）</h2>
        <PassengerSearchBox
          onSearch={handleSearch}
          placeholder="输入乘客姓名"
        />
      </div>
      
      <div className="passenger-info-content">
        <div className="passenger-list-container">
          <h3 className="subsection-title">乘车人</h3>
          <PassengerList
            passengers={filteredPassengers}
            selectedPassengerIds={selectedPassengers}
            onSelect={onPassengerSelect}
            searchKeyword={searchKeyword}
          />
        </div>
        
        <div className="purchase-info-container">
          <PurchaseInfoTable
            purchaseInfo={purchaseInfo}
            availableSeatTypes={availableSeatTypes}
            onSeatTypeChange={onSeatTypeChange}
            onTicketTypeChange={onTicketTypeChange}
            onDeleteRow={onDeleteRow}
            fareInfo={fareInfo}
          />
        </div>
        
        {/* 中国铁路保险横幅 */}
        <div className="railway-insurance-banner">
          <img src="/images/order.jpg" alt="乘意相伴 安心出行 - 中国铁路保险" />
        </div>
      </div>
    </div>
  );
};

export default PassengerInfoSection;


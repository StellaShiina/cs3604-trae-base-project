import React from 'react';
import './PurchaseInfoRow.css';
import SelectDropdown from './SelectDropdown';

interface PurchaseInfoRowProps {
  sequence: number;
  passenger: any;
  ticketType: string;
  seatType: string;
  availableSeatTypes: any[];
  onSeatTypeChange: (seatType: string) => void;
  onTicketTypeChange: (ticketType: string) => void;
  onDelete?: () => void;
  fareInfo?: any;
}

/**
 * 购票信息行组件
 */
const PurchaseInfoRow: React.FC<PurchaseInfoRowProps> = ({
  sequence,
  passenger,
  ticketType,
  seatType,
  availableSeatTypes,
  onSeatTypeChange,
  onTicketTypeChange,
  onDelete,
  fareInfo,
}) => {
  const ticketTypeOptions = [
    { value: '成人票', label: '成人票' }
  ];
  
  // 席别名称映射
  const seatTypeMap: Record<string, string> = {
    business: '商务座',
    first: '一等座',
    second: '二等座',
    softSleeper: '软卧',
    hardSleeper: '硬卧',
    hardSeat: '硬座',
    softSeat: '软座',
    noSeat: '无座',
    // 兼容下划线格式
    soft_sleeper: '软卧',
    hard_sleeper: '硬卧',
    hard_seat: '硬座',
    soft_seat: '软座',
    no_seat: '无座'
  };

  // 生成席别选项（显示席别和票价）
  const seatTypeOptions = availableSeatTypes.map(seatTypeName => {
    // fareInfo values are integers (cents) or objects depending on backend, 
    // but based on current backend code, they are integers (cents).
    let price = '';
    if (fareInfo && fareInfo[seatTypeName] !== undefined) {
       // Check if it's an object or number
       const val = fareInfo[seatTypeName];
       if (typeof val === 'object' && val.price) {
           price = (val.price / 100).toFixed(1);
       } else if (typeof val === 'number') {
           price = (val / 100).toFixed(1);
       }
    }
    
    const label = seatTypeMap[seatTypeName] || seatTypeName;
    return {
      value: seatTypeName,
      label: price ? `${label}（¥${price}元）` : label
    };
  });
  
  // 证件类型选项
  const idCardTypeOptions = [
    { value: '居民身份证', label: '居民身份证' },
    { value: '港澳居民来往内地通行证', label: '港澳居民来往内地通行证' },
    { value: '台湾居民来往大陆通行证', label: '台湾居民来往大陆通行证' },
    { value: '护照', label: '护照' }
  ];
  
  // 证件号码脱敏显示
  const maskIdNumber = (idNumber: string) => {
    if (!idNumber || idNumber.length < 8) return idNumber;
    return idNumber.substring(0, 4) + '************' + idNumber.substring(idNumber.length - 4);
  };
  
  // 防御性编程：确保 passenger 对象存在
  const safePassenger = passenger || { name: '', idCardType: '居民身份证', idCardNumber: '' };
  
  return (
    <div className="purchase-info-row">
      <div className="row-cell">{sequence}</div>
      <div className="row-cell">
        <SelectDropdown
          options={ticketTypeOptions}
          value={ticketType}
          onChange={onTicketTypeChange}
          placeholder="选择票种"
        />
      </div>
      <div className="row-cell">
        <SelectDropdown
          options={seatTypeOptions}
          value={seatType}
          onChange={onSeatTypeChange}
          placeholder="选择席别"
        />
      </div>
      <div className="row-cell">
        <input type="text" value={safePassenger.name} readOnly className="readonly-input" />
      </div>
      <div className="row-cell">
        <SelectDropdown
          options={idCardTypeOptions}
          value={safePassenger.idCardType || safePassenger.card_type || '居民身份证'}
          onChange={() => {}}
          placeholder="证件类型"
        />
      </div>
      <div className="row-cell">
        <input type="text" value={maskIdNumber(safePassenger.idCardNumber || safePassenger.card_no)} readOnly className="readonly-input" />
      </div>
      <div className="row-cell row-cell-delete">
        {onDelete && (
          <button className="delete-button" onClick={onDelete} title="删除">
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

export default PurchaseInfoRow;


// 乘客信息表格组件
import React from 'react';
import './PassengerTable.css';

interface PassengerTableProps {
  passengers: any[];
  selectedIds: string[];
  onSelect: (ids: string[]) => void;
  onEdit: (passenger: any) => void;
  onDelete: (passengerId: string) => void;
}

const PassengerTable: React.FC<PassengerTableProps> = ({
  passengers,
  selectedIds,
  onSelect,
  onEdit,
  onDelete
}) => {
  const maskIdCard = (idCard: string) => {
    if (idCard.length <= 8) return idCard;
    const start = idCard.substring(0, 4);
    const end = idCard.substring(idCard.length - 3);
    return `${start}${'*'.repeat(idCard.length - 7)}${end}`;
  };

  const maskPhone = (phone: string) => {
    if (!phone || phone.length <= 7) return phone;
    const start = phone.substring(0, 3);
    const end = phone.substring(phone.length - 4);
    return `(+86)${start}****${end}`;
  };

  const handleSelectOne = (passengerId: string) => {
    if (selectedIds.includes(passengerId)) {
      onSelect(selectedIds.filter((id) => id !== passengerId));
    } else {
      onSelect([...selectedIds, passengerId]);
    }
  };

  return (
    <div className="passenger-table-container">
      <table className="passenger-table">
        <tbody>
          {passengers.map((passenger, index) => (
            <tr key={passenger.id}>
              <td className="checkbox-index-cell">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(passenger.id)}
                  onChange={() => handleSelectOne(passenger.id)}
                  disabled={passenger.isSelf}
                />
                <span className="index-number">{index + 1}</span>
              </td>
              <td className="name-cell">{passenger.name}</td>
              <td className="id-type-cell">{passenger.idCardType || passenger.id_card_type}</td>
              <td className="id-number-cell">{maskIdCard(passenger.idCardNumber || passenger.id_card_number)}</td>
              <td className="phone-cell">
                {(() => {
                  const phone = passenger.phone || passenger.phoneNumber || passenger.phone_number;
                  return phone && phone.trim() !== '' ? maskPhone(phone) : '-';
                })()}
              </td>
              <td className="verification-cell">
                <span className="verification-badge">
                  <span className="verification-icon">✓</span>
                </span>
              </td>
              <td className="action-cell">
                {!passenger.isSelf && (
                  <>
                    <button
                      className="action-button edit-button"
                      onClick={() => onEdit(passenger)}
                      title="修改"
                    >
                      <img src="/images/修改.svg" alt="修改" className="action-icon" />
                    </button>
                    <button
                      className="action-button delete-button"
                      onClick={() => onDelete(passenger.id)}
                      title="删除"
                    >
                      <img src="/images/删除.svg" alt="删除" className="action-icon" />
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {passengers.length === 0 && (
        <div className="empty-state">暂无乘客信息</div>
      )}
    </div>
  );
};

export default PassengerTable;


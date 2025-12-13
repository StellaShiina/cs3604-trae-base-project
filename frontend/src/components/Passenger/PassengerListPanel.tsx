// 乘车人列表展示面板组件
import React, { useState } from 'react';
import PassengerTable from './PassengerTable';
import ConfirmModal from '../ConfirmModal';
import './PassengerListPanel.css';

interface PassengerListPanelProps {
  passengers: any[];
  onAdd: () => void;
  onEdit: (passenger: any) => void;
  onDelete: (passengerId: string) => void;
  onSearch: (keyword: string) => void;
}

const PassengerListPanel: React.FC<PassengerListPanelProps> = ({
  passengers,
  onAdd,
  onEdit,
  onDelete,
  onSearch
}) => {
  const [selectedPassengers, setSelectedPassengers] = useState<string[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showBatchDeleteModal, setShowBatchDeleteModal] = useState(false);

  const handleSearch = () => {
    onSearch(searchKeyword);
  };

  const handleBatchDelete = () => {
    if (selectedPassengers.length === 0) {
      alert('请选择要删除的乘客');
      return;
    }
    setShowBatchDeleteModal(true);
  };

  const handleConfirmBatchDelete = async () => {
    setShowBatchDeleteModal(false);
    
    for (const id of selectedPassengers) {
      await onDelete(id);
    }
    setSelectedPassengers([]);
  };

  const handleCancelBatchDelete = () => {
    setShowBatchDeleteModal(false);
  };

  const handleClear = () => {
    setSearchKeyword('');
    onSearch('');
  };

  return (
    <div className="passenger-list-panel">
      <div className="search-section">
        <div className="search-group">
          <div className="search-input-wrapper">
            <input
              type="text"
              className="search-input"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="请输入乘客姓名"
            />
            <button className="clear-input-button" onClick={handleClear}>
              ✕
            </button>
          </div>
          <button className="passenger-search-button" onClick={handleSearch}>
            查询
          </button>
        </div>
      </div>

      <div className="table-section">
        <div className="table-header-row">
          <table className="header-table">
            <thead>
              <tr>
                <th className="checkbox-index-header">序号</th>
                <th className="name-header">姓名</th>
                <th className="id-type-header">证件类型</th>
                <th className="id-number-header">证件号码</th>
                <th className="phone-header">手机/电话</th>
                <th className="verification-header">核验状态</th>
                <th className="action-header">操作</th>
              </tr>
            </thead>
          </table>
        </div>
        <div className="table-actions">
          <button className="add-button" onClick={onAdd}>
            <img src="/images/plus-circle-fill.svg" alt="添加" className="add-icon" />
            <span className="add-text">添加</span>
          </button>
          <button className="batch-delete-button" onClick={handleBatchDelete}>
            <img src="/images/删除.svg" alt="删除" className="delete-icon" />
            <span className="delete-text">批量删除</span>
          </button>
        </div>

        <PassengerTable
          passengers={passengers}
          selectedIds={selectedPassengers}
          onSelect={setSelectedPassengers}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>

      <ConfirmModal
        isVisible={showBatchDeleteModal}
        title="提示"
        message={`确定要删除选中的${selectedPassengers.length}个乘客吗？`}
        confirmText="确定"
        cancelText="取消"
        onConfirm={handleConfirmBatchDelete}
        onCancel={handleCancelBatchDelete}
      />
    </div>
  );
};

export default PassengerListPanel;


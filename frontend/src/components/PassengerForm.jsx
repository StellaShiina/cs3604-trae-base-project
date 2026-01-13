import React, { useState } from 'react';
import './PassengerForm.css';

const PassengerForm = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    idType: 'ID_CARD',
    idNumber: '',
    phone: '',
    type: 'ADULT'
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.idNumber || !formData.phone) {
      setError('请填写所有必填字段');
      return;
    }
    try {
      await onSave(formData);
    } catch (err) {
      setError(err.message || '保存失败');
    }
  };

  return (
    <div className="passenger-form-overlay">
      <div className="passenger-form-modal">
        <h3>添加乘车人</h3>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">姓名</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="请输入姓名"
            />
          </div>
          <div className="form-group">
            <label htmlFor="idType">证件类型</label>
            <select
              id="idType"
              name="idType"
              value={formData.idType}
              onChange={handleChange}
            >
              <option value="ID_CARD">中国居民身份证</option>
              <option value="PASSPORT">护照</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="idNumber">证件号码</label>
            <input
              type="text"
              id="idNumber"
              name="idNumber"
              value={formData.idNumber}
              onChange={handleChange}
              placeholder="请输入证件号码"
            />
          </div>
          <div className="form-group">
            <label htmlFor="phone">手机号</label>
            <input
              type="text"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="请输入手机号"
            />
          </div>
          <div className="form-group">
            <label htmlFor="type">旅客类型</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
            >
              <option value="ADULT">成人</option>
              <option value="CHILD">儿童</option>
              <option value="STUDENT">学生</option>
              <option value="DISABILITY_SOLDIER">残疾军人</option>
            </select>
          </div>
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onCancel}>取消</button>
            <button type="submit" className="btn-primary">保存</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PassengerForm;

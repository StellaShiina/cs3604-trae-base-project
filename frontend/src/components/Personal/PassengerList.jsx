import React, { useEffect, useState } from 'react';
import { getPassengers, addPassenger, deletePassenger } from '../../api';

const PassengerList = () => {
  const [passengers, setPassengers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPassenger, setNewPassenger] = useState({
      realName: '',
      idType: '1',
      idNumber: '',
      phone: '',
      passengerType: 'adult'
  });

  const fetchPassengers = () => {
    setLoading(true);
    getPassengers().then(res => {
        if (res.success) setPassengers(res.data);
        setLoading(false);
    });
  };

  useEffect(() => {
    fetchPassengers();
  }, []);

  const handleDelete = async (id) => {
      if (!window.confirm('确认删除该乘车人吗？')) return;
      try {
          const res = await deletePassenger(id);
          if (res.success) {
              fetchPassengers();
          } else {
              alert(res.error?.message || '删除失败');
          }
      } catch (err) {
          alert('删除请求失败');
      }
  };

  const handleAdd = async () => {
      try {
          const res = await addPassenger(newPassenger);
          if (res.success) {
              setShowAddModal(false);
              fetchPassengers();
              setNewPassenger({ realName: '', idType: '1', idNumber: '', phone: '', passengerType: 'adult' });
          } else {
              // Show backend error explicitly (e.g., duplicate passenger)
              alert(res.error?.message || '添加失败');
          }
      } catch (err) {
          alert('添加请求失败');
      }
  };

  if (loading && !showAddModal) return <div>加载中...</div>;

  return (
    <div className="passenger-list">
       <div className="top-controls" style={{ marginBottom: '15px', display: 'flex', gap: '10px' }}>
           <input type="text" placeholder="请输入乘车姓名" style={{ padding: '5px', width: '200px' }} />
           <button style={{ padding: '5px 15px', backgroundColor: '#2F86E6', color: 'white', border: 'none', borderRadius: '4px' }}>查询</button>
       </div>

       <div className="table-container" style={{ border: '1px solid #D6DCE5' }}>
           <div className="table-toolbar" style={{ padding: '10px', backgroundColor: '#F7F8FA', borderBottom: '1px solid #E5E7EB' }}>
               <button onClick={() => setShowAddModal(true)} style={{ color: '#2F86E6', marginRight: '15px', background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}>
                   <span style={{ fontSize: '18px', marginRight: '5px' }}>+</span> 添加
               </button>
               <button style={{ color: '#E60012', background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}>
                   <span style={{ marginRight: '5px' }}>🗑</span> 批量删除
               </button>
           </div>
           
           <table style={{ width: '100%', borderCollapse: 'collapse' }}>
               <thead style={{ backgroundColor: '#F7F8FA', color: '#666' }}>
                   <tr>
                       <th style={{ padding: '10px', textAlign: 'left' }}>序号</th>
                       <th style={{ padding: '10px', textAlign: 'left' }}>姓名</th>
                       <th style={{ padding: '10px', textAlign: 'left' }}>证件类型</th>
                       <th style={{ padding: '10px', textAlign: 'left' }}>证件号码</th>
                       <th style={{ padding: '10px', textAlign: 'left' }}>手机 / 电话</th>
                       <th style={{ padding: '10px', textAlign: 'left' }}>核验状态</th>
                       <th style={{ padding: '10px', textAlign: 'left' }}>操作</th>
                   </tr>
               </thead>
               <tbody>
                   {passengers.map((p, index) => (
                       <tr key={p.id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                           <td style={{ padding: '10px' }}>{index + 1}</td>
                           <td style={{ padding: '10px' }}>{p.real_name}</td>
                           <td style={{ padding: '10px' }}>{p.id_type === '1' ? '居民身份证' : '其他'}</td>
                           <td style={{ padding: '10px' }}>{p.id_number}</td>
                           <td style={{ padding: '10px' }}>{p.phone}</td>
                           <td style={{ padding: '10px', color: '#19A05B' }}>已核验</td>
                           <td style={{ padding: '10px' }}>
                               <button className="delete-btn" onClick={() => handleDelete(p.id)} style={{ color: '#E60012', background: 'none', border: 'none', cursor: 'pointer' }}>删除</button>
                           </td>
                       </tr>
                   ))}
               </tbody>
           </table>
       </div>

       {showAddModal && (
           <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
               <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '4px', width: '400px' }}>
                   <h3>添加乘车人</h3>
                   <div style={{ marginBottom: '10px' }}>
                       <label>姓名: </label>
                       <input 
                           name="realName"
                           value={newPassenger.realName}
                           onChange={e => setNewPassenger({...newPassenger, realName: e.target.value})}
                           style={{ width: '100%', padding: '5px' }}
                       />
                   </div>
                   <div style={{ marginBottom: '10px' }}>
                       <label>证件类型: </label>
                       <select 
                           name="idType"
                           value={newPassenger.idType}
                           onChange={e => setNewPassenger({...newPassenger, idType: e.target.value})}
                           style={{ width: '100%', padding: '5px' }}
                       >
                           <option value="1">居民身份证</option>
                       </select>
                   </div>
                   <div style={{ marginBottom: '10px' }}>
                       <label>证件号码: </label>
                       <input 
                           name="idNumber"
                           value={newPassenger.idNumber}
                           onChange={e => setNewPassenger({...newPassenger, idNumber: e.target.value})}
                           style={{ width: '100%', padding: '5px' }}
                       />
                   </div>
                   <div style={{ marginBottom: '10px' }}>
                       <label>手机号码: </label>
                       <input 
                           name="phone"
                           value={newPassenger.phone}
                           onChange={e => setNewPassenger({...newPassenger, phone: e.target.value})}
                           style={{ width: '100%', padding: '5px' }}
                       />
                   </div>
                   <div style={{ marginBottom: '10px' }}>
                       <label>旅客类型: </label>
                       <select 
                           name="passengerType"
                           value={newPassenger.passengerType}
                           onChange={e => setNewPassenger({...newPassenger, passengerType: e.target.value})}
                           style={{ width: '100%', padding: '5px' }}
                       >
                           <option value="adult">成人</option>
                           <option value="student">学生</option>
                           <option value="child">儿童</option>
                       </select>
                   </div>
                   <div style={{ textAlign: 'right', marginTop: '20px' }}>
                       <button onClick={() => setShowAddModal(false)} style={{ marginRight: '10px', padding: '5px 15px' }}>取消</button>
                       <button onClick={handleAdd} style={{ padding: '5px 15px', backgroundColor: '#2F86E6', color: 'white', border: 'none' }}>保存</button>
                   </div>
               </div>
           </div>
       )}
    </div>
  );
};

export default PassengerList;

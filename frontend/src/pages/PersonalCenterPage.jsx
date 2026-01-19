import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import apiClient from '../api/index';

const PersonalCenterPage = () => {
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'dashboard'; // dashboard, orders, passengers
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
    const [passengers, setPassengers] = useState([]);
    const [newPassenger, setNewPassenger] = useState({ name: '', idType: '1', idNumber: '', type: '成人' });
    const [showAddPassenger, setShowAddPassenger] = useState(false);
  
  useEffect(() => {
    fetchUser();
    if (activeTab === 'orders') {
        fetchOrders();
    } else if (activeTab === 'passengers') {
        fetchPassengers();
    }
  }, [activeTab]);

  const fetchUser = async () => {
    try {
        const userId = localStorage.getItem('userId');
        if (!userId) return; // or redirect
        const res = await apiClient.get('/v1/auth/me'); // We added this endpoint
        if (res.data.code === 0) {
            setUser(res.data.data);
        }
    } catch (e) {
        console.error(e);
    }
  };

  const fetchOrders = async () => {
    try {
        const res = await apiClient.get('/v1/orders');
        if (res.data.code === 0) {
            setOrders(res.data.data);
        }
    } catch (e) {
        console.error(e);
    }
  };

    const fetchPassengers = async () => {
        try {
            const res = await apiClient.get('/v1/orders/passengers');
            if (res.data.code === 0) {
                setPassengers(res.data.data);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleAddPassenger = async () => {
        if (!newPassenger.name || !newPassenger.idNumber) {
            alert('请填写完整信息');
            return;
        }
        try {
            const res = await apiClient.post('/v1/orders/passengers', newPassenger);
            if (res.data.code === 0) {
                alert('添加成功');
                setShowAddPassenger(false);
                fetchPassengers();
                setNewPassenger({ name: '', idType: '1', idNumber: '', type: '成人' });
            } else {
                alert(res.data.message);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleDeletePassenger = async (id) => {
        if (!window.confirm('确定删除吗？')) return;
        try {
            const res = await apiClient.delete(`/v1/orders/passengers/${id}`);
            if (res.data.code === 0) {
                alert('删除成功');
                fetchPassengers();
            } else {
                alert(res.data.message);
            }
        } catch (e) {
            console.error(e);
        }
    };

  return (
    <div style={{ background: '#F5F7FA', minHeight: '100vh' }}>
      <Header />
      
      {/* Breadcrumb */}
      <div style={{ width: 1200, margin: '10px auto', fontSize: 12, color: '#777' }}>
         当前位置：个人中心 {activeTab === 'orders' ? '> 订单中心 > 火车票订单' : ''}
      </div>

      <div style={{ width: 1200, margin: '0 auto', display: 'flex', gap: 20 }}>
        
        {/* Sidebar */}
        <div style={{ width: 220, background: 'white', border: '1px solid #E6EAF0' }}>
            <div style={{ padding: 20 }}>
                <div style={{ fontWeight: 'bold', marginBottom: 10 }}>个人中心</div>
                <div 
                   style={{ 
                       padding: '5px 10px', 
                       background: activeTab === 'dashboard' ? '#2F86E6' : 'transparent', 
                       color: activeTab === 'dashboard' ? 'white' : '#333',
                       cursor: 'pointer' 
                   }}
                   onClick={() => window.location.href = '/personal-center'}
                >
                    个人中心
                </div>
            </div>
            <div style={{ padding: 20, paddingTop: 0 }}>
                <div style={{ fontWeight: 'bold', marginBottom: 10 }}>订单中心</div>
                <div 
                   style={{ 
                       padding: '5px 10px', 
                       background: activeTab === 'orders' ? '#2F86E6' : 'transparent', 
                       color: activeTab === 'orders' ? 'white' : '#333',
                       cursor: 'pointer'
                   }}
                   onClick={() => window.location.href = '/personal-center?tab=orders'}
                >
                    火车票订单
                </div>
            </div>
             <div style={{ padding: 20, paddingTop: 0 }}>
                <div style={{ fontWeight: 'bold', marginBottom: 10 }}>常用信息管理</div>
                 <div 
                   style={{ 
                       padding: '5px 10px', 
                              background: activeTab === 'passengers' ? '#2F86E6' : 'transparent',
                              color: activeTab === 'passengers' ? 'white' : '#333',
                       cursor: 'pointer'
                   }}
                          onClick={() => window.location.href = '/personal-center?tab=passengers'}
                >
                    乘车人
                </div>
            </div>
        </div>

        {/* Right Content */}
        <div style={{ width: 940 }}>
           
           {/* Dashboard View */}
           {activeTab === 'dashboard' && user && (
               <div style={{ background: 'white', padding: 25, border: '1px solid #D9E6F7', minHeight: 600 }}>
                   <div style={{ fontSize: 20, marginBottom: 20 }}>
                       {user.name} 先生/女士, 下午好!
                   </div>
                   <div style={{ border: '1px dashed #BFD7F5', padding: 15, marginBottom: 20 }}>
                       <p>欢迎您登录中国铁路客户服务中心网站。</p>
                       <p style={{ color: 'red' }}>如果您的密码在其他网站也使用，建议您修改本网站密码。</p>
                   </div>
                   <div style={{ border: '1px solid #F3C08A', background: '#FFF8F0', padding: 15 }}>
                       <p style={{ fontWeight: 'bold' }}>温馨提示：</p>
                       <p>消息通知方式进行相关调整...</p>
                   </div>
               </div>
           )}

           {/* Orders View */}
           {activeTab === 'orders' && (
               <div style={{ background: 'white', minHeight: 600 }}>
                   <div style={{ display: 'flex', borderBottom: '1px solid #E6EAF0' }}>
                       <div style={{ padding: '10px 20px', borderRight: '1px solid #eee', color: '#2F86E6' }}>历史订单</div>
                   </div>
                   
                   <div style={{ padding: 20 }}>
                       {orders.map(order => (
                           <div key={order.id} style={{ border: '1px solid #BFD9FF', marginBottom: 20 }}>
                               <div style={{ background: '#EAF4FF', padding: 10, fontSize: 12 }}>
                                   订票日期: {order.created_at}  订单号: {order.id}
                               </div>
                               {order.items && order.items.map(item => (
                                   <div key={item.id} style={{ display: 'flex', padding: 10, borderTop: '1px solid #eee' }}>
                                       <div style={{ flex: 1 }}>
                                           <div>{item.train_code}</div>
                                           <div>{item.departure_station} -> {item.arrival_station}</div>
                                       </div>
                                       <div style={{ flex: 1 }}>
                                           {/* Passenger Name would be here, assuming 1 item per passenger logic for display simplification */}
                                            {/* In real data, item has passenger_id, we might join or store name */}
                                            Passenger
                                       </div>
                                       <div style={{ flex: 1 }}>{item.seat_type}</div>
                                       <div style={{ flex: 1, color: 'orange' }}>¥{item.price}</div>
                                       <div style={{ flex: 1 }}>{order.status}</div>
                                   </div>
                               ))}
                           </div>
                       ))}
                       {orders.length === 0 && <p>暂无订单</p>}
                   </div>
               </div>
           )}

                  {/* Passengers View */}
                  {activeTab === 'passengers' && (
                      <div style={{ background: 'white', minHeight: 600, padding: 20 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                              <div style={{ fontSize: 18, fontWeight: 'bold' }}>乘车人管理</div>
                              <button onClick={() => setShowAddPassenger(true)} style={{ background: '#F57C00', color: 'white', border: 'none', padding: '5px 15px', borderRadius: 4 }}>
                                  + 添加乘车人
                              </button>
                          </div>

                          {showAddPassenger && (
                              <div style={{ background: '#F9F9F9', padding: 15, marginBottom: 20, border: '1px solid #eee' }}>
                                  <div style={{ marginBottom: 10 }}>
                                      <label style={{ marginRight: 10 }}>姓名</label>
                                      <input value={newPassenger.name} onChange={e => setNewPassenger({ ...newPassenger, name: e.target.value })} />
                                  </div>
                                  <div style={{ marginBottom: 10 }}>
                                      <label style={{ marginRight: 10 }}>证件号码</label>
                                      <input value={newPassenger.idNumber} onChange={e => setNewPassenger({ ...newPassenger, idNumber: e.target.value })} />
                                  </div>
                                  <button onClick={handleAddPassenger} style={{ background: '#2F86E6', color: 'white', border: 'none', padding: '5px 15px', borderRadius: 4, marginRight: 10 }}>保存</button>
                                  <button onClick={() => setShowAddPassenger(false)}>取消</button>
                              </div>
                          )}

                          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                              <thead>
                                  <tr style={{ background: '#eee' }}>
                                      <th style={{ padding: 10 }}>姓名</th>
                                      <th>证件类型</th>
                                      <th>证件号码</th>
                                      <th>旅客类型</th>
                                      <th>操作</th>
                                  </tr>
                              </thead>
                              <tbody>
                                  {passengers.map(p => (
                                      <tr key={p.id} style={{ borderBottom: '1px solid #eee', textAlign: 'center' }}>
                                          <td style={{ padding: 10 }}>{p.name}</td>
                                          <td>{p.id_type === '1' ? '中国居民身份证' : p.id_type}</td>
                                          <td>{p.id_number}</td>
                                          <td>{p.type}</td>
                                          <td>
                                              <button onClick={() => handleDeletePassenger(p.id)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>
                                                  删除
                                              </button>
                                          </td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                      </div>
                  )}

        </div>
      </div>
    </div>
  );
};

export default PersonalCenterPage;

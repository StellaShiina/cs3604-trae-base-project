
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PassengerForm from '../components/PassengerForm';
import './PersonalCenterPage.css';

const PersonalCenterPage = () => {
  const [activeTab, setActiveTab] = useState('personal_info');
  const [userInfo, setUserInfo] = useState(null);
  const [passengers, setPassengers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [orderStatus, setOrderStatus] = useState('pending_payment'); // pending_payment, paid, cancelled
  const [isAddingPassenger, setIsAddingPassenger] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (activeTab === 'personal_info') {
      fetchUserInfo();
    } else if (activeTab === 'passengers') {
      fetchPassengers();
    } else if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab, orderStatus]);

  const fetchUserInfo = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/users/me');
      if (res.data.code === 200) {
        setUserInfo(res.data.data);
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load user info');
    } finally {
      setLoading(false);
    }
  };

  const fetchPassengers = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/passengers');
      if (res.data.code === 200) {
        setPassengers(res.data.data);
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load passengers');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/orders?status=${orderStatus}`);
      if (res.data.code === 200) {
        setOrders(res.data.data);
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('确定要取消该订单吗？')) return;

    try {
      const res = await axios.put(`/api/orders/${orderId}/status`, { status: 'cancelled' });
      if (res.data.code === 200) {
        // Refresh list
        fetchOrders();
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      console.error(err);
      alert('取消订单失败');
    }
  };

  const handlePayOrder = async (orderId) => {
    // Mock payment process
    try {
      const res = await axios.put(`/api/orders/${orderId}/status`, { status: 'paid' });
      if (res.data.code === 200) {
        alert('支付成功');
        fetchOrders();
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      console.error(err);
      alert('支付失败');
    }
  };

  // ... (handleAddPassenger, handleDeletePassenger same)

  const renderContent = () => {
    // ... (personal_info, passengers same)
    if (activeTab === 'personal_info') {
        // ... (existing code)
        if (loading) return <div>Loading...</div>;
        if (error) return <div className="error">{error}</div>;
        if (!userInfo) return <div>No user info</div>;
  
        return (
          <div className="info-panel">
            <h3>基本信息</h3>
            <div className="info-item">
              <label>用户名：</label>
              <span>{userInfo.username}</span>
            </div>
            <div className="info-item">
              <label>姓名：</label>
              <span>{userInfo.real_name}</span>
            </div>
            <div className="info-item">
              <label>证件类型：</label>
              <span>{userInfo.id_type || '中国居民身份证'}</span>
            </div>
             <div className="info-item">
              <label>证件号码：</label>
              <span>{userInfo.id_number}</span>
            </div>
            <div className="info-item">
              <label>手机号：</label>
              <span>{userInfo.phone}</span>
            </div>
            <div className="info-item">
              <label>邮箱：</label>
              <span>{userInfo.email}</span>
            </div>
             <div className="info-item">
              <label>旅客类型：</label>
              <span>{userInfo.passenger_type}</span>
            </div>
          </div>
        );
    } else if (activeTab === 'passengers') {
      if (loading && !isAddingPassenger) return <div>Loading...</div>;
      if (error) return <div className="error">{error}</div>;
      
      return (
        <div className="passenger-list">
           <div className="passenger-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
             <h3>常用联系人</h3>
             <button className="btn-primary" onClick={() => setIsAddingPassenger(true)}>添加</button>
           </div>
           
           {isAddingPassenger && (
             <PassengerForm 
               onSave={handleAddPassenger} 
               onCancel={() => setIsAddingPassenger(false)} 
             />
           )}

           {passengers.length === 0 ? (
             <div>暂无联系人</div>
           ) : (
             <ul className="passenger-items">
               {passengers.map(p => (
                 <li key={p.id} className="passenger-item">
                   <div className="passenger-info">
                     <span>{p.name}</span>
                     <span>{p.id_type}</span>
                     <span>{p.id_number}</span>
                     <span>{p.passenger_type}</span>
                   </div>
                   <button 
                     className="btn-delete" 
                     onClick={() => handleDeletePassenger(p.id)}
                   >
                     删除
                   </button>
                 </li>
               ))}
             </ul>
           )}
        </div>
      );
    } else if (activeTab === 'orders') {
      // if (loading) return <div>Loading...</div>; // Moved loading check inside
      if (error) return <div className="error">{error}</div>;

      return (
        <div className="order-list-panel">
          <div className="order-tabs">
            <button 
              className={orderStatus === 'pending_payment' ? 'active' : ''} 
              onClick={() => setOrderStatus('pending_payment')}
            >
              未完成订单
            </button>
            <button 
              className={orderStatus === 'paid' ? 'active' : ''} 
              onClick={() => setOrderStatus('paid')}
            >
              未出行订单
            </button>
            <button 
              className={orderStatus === 'cancelled' ? 'active' : ''} 
              onClick={() => setOrderStatus('cancelled')}
            >
              历史订单
            </button>
          </div>
          
          <div className="order-list">
             {loading ? (
               <div>Loading...</div>
             ) : orders.length === 0 ? (
               <div>暂无订单</div>
             ) : (
               <ul className="order-items">
                 {orders.map(order => (
                   <li key={order.id} className="order-item">
                     <div className="order-header">
                       <span>订单号: {order.id}</span>
                       <span>下单时间: {order.created_at}</span>
                       <span>状态: {order.status === 'pending_payment' ? '未支付' : (order.status === 'paid' ? '已支付' : '已取消')}</span>
                     </div>
                     <div className="order-body">
                       <div className="train-info">
                         <span>{order.train_number}</span>
                         <span>{order.from_station_name} -> {order.to_station_name}</span>
                         <span>{order.departure_date}</span>
                       </div>
                       <div className="order-actions">
                         {order.status === 'pending_payment' && (
                           <>
                             <button className="btn-primary" onClick={() => handlePayOrder(order.id)}>支付</button>
                             <button className="btn-secondary" onClick={() => handleCancelOrder(order.id)}>取消</button>
                           </>
                         )}
                         {order.status === 'paid' && (
                           <button className="btn-secondary">改签</button>
                         )}
                       </div>
                     </div>
                   </li>
                 ))}
               </ul>
             )}
          </div>
        </div>
      );
    }
    return <div>Select an item from the sidebar.</div>;
  };

  return (
    <div className="personal-center-page">
      <Header />
      <div className="center-container">
        <div className="sidebar">
          <div className="sidebar-title">个人中心</div>
          <ul className="sidebar-menu">
            <li 
              className={`menu-item ${activeTab === 'personal_info' ? 'active' : ''}`}
              onClick={() => setActiveTab('personal_info')}
            >
              个人信息
            </li>
            <li 
              className={`menu-item ${activeTab === 'passengers' ? 'active' : ''}`}
              onClick={() => setActiveTab('passengers')}
            >
              乘车人
            </li>
          </ul>
          
          <div className="sidebar-title">订单中心</div>
          <ul className="sidebar-menu">
            <li 
              className={`menu-item ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              火车票订单
            </li>
          </ul>
        </div>
        <div className="main-content">
          <h2>
            {activeTab === 'orders' ? '火车票订单' : '个人中心'}
          </h2>
          {renderContent()}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PersonalCenterPage;

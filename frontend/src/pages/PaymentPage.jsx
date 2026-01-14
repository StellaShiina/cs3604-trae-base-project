import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import './PaymentPage.css';

const PaymentPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null); // Init to null to avoid premature expiry
  const [isExpired, setIsExpired] = useState(false);

  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
           // Not logged in, redirect or show error
           setError('请先登录');
           // Optional: navigate('/login');
           return;
        }

        const res = await axios.get(`/api/orders/${orderId}`, {
           headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.data.code === 200) {
          setOrder(res.data.data);
          
          // Calculate remaining time (30 mins from created_at)
          // SQLite datetime('now') returns 'YYYY-MM-DD HH:MM:SS' in UTC
          const createdStr = res.data.data.created_at;
          const created = new Date(createdStr.replace(' ', 'T') + 'Z');
          const now = new Date();
          
          const expireTime = created.getTime() + 30 * 60 * 1000;
          const remaining = Math.floor((expireTime - now.getTime()) / 1000);
          
          if (remaining <= 0) {
              setTimeLeft(0);
              if (res.data.data.status === 'pending_payment') {
                 setIsExpired(true);
              }
          } else {
              setTimeLeft(remaining);
          }
        }
      } catch (err) {
        console.error('Failed to fetch order', err);
        setError(err.response?.data?.message || '加载订单失败');
      }
    };
    fetchOrder();
  }, [orderId]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  useEffect(() => {
      if (isExpired) {
          alert('订单已过期，请重新预订');
          navigate('/search');
      }
  }, [isExpired]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handlePay = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`/api/orders/${orderId}/status`, { status: 'paid' }, {
         headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.code === 200) {
        // alert('支付成功！');
        navigate(`/purchase-success/${orderId}`);
      }
    } catch (err) {
      alert('支付失败');
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('确定要取消订单吗？')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`/api/orders/${orderId}/status`, { status: 'cancelled' }, {
         headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.code === 200) {
        alert('订单已取消');
        navigate('/search');
      }
    } catch (err) {
      alert('取消失败');
    }
  };

  if (error) return (
      <div className="payment-page">
          <Header />
          <div className="main-content">
              <div className="payment-panel" style={{textAlign: 'center', padding: '50px'}}>
                  <h2 style={{color: 'red'}}>{error}</h2>
                  <button onClick={() => navigate('/login')} style={{marginTop: '20px', padding: '10px 20px', cursor: 'pointer'}}>
                      去登录
                  </button>
              </div>
          </div>
      </div>
  );

  if (!order) return <div className="loading">加载中...</div>;

  return (
    <div className="payment-page">
      <Header />
      <div className="main-content">
        <div className="payment-panel">
          <div className="payment-header">
            <h2>订单支付</h2>
            <div className="timer">
              {timeLeft === null ? '加载中...' : (timeLeft > 0 ? `剩余支付时间: ${formatTime(timeLeft)}` : '订单已过期')}
            </div>
          </div>

          <div className="order-info">
             <div className="train-info-row">
                <span><strong>{order.train_number}</strong></span>
                <span>{order.from_station_name} ({order.start_time}) -> {order.to_station_name} ({order.end_time})</span>
                <span>{order.departure_date}</span>
             </div>

             <table className="ticket-table">
               <thead>
                 <tr>
                   <th>姓名</th>
                   <th>证件号码</th>
                   <th>票种</th>
                   <th>席别</th>
                   <th>票价</th>
                 </tr>
               </thead>
               <tbody>
                 {order.tickets && order.tickets.map(ticket => (
                   <tr key={ticket.id}>
                     <td>{ticket.passenger_name}</td>
                     <td>{ticket.id_number}</td>
                     <td>成人票</td>
                     <td>{ticket.seat_type}</td>
                     <td><span style={{color: '#ff8001'}}>¥{ticket.price}</span></td>
                   </tr>
                 ))}
               </tbody>
             </table>
          </div>

          <div className="price-summary">
            应付金额: <span className="total-price">¥{order.totalPrice}</span>
          </div>

          <div className="actions">
            <button className="btn-cancel" onClick={handleCancel}>取消订单</button>
            <button className="btn-pay" onClick={handlePay} disabled={timeLeft <= 0}>
               确认支付
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;

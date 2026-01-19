import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import NavBar from '../components/NavBar';
import { getOrder, payOrder, cancelOrder } from '../api';
import './PaymentPage.css';

const PaymentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0); // Seconds
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await getOrder(id);
        if (res.success) {
          setOrder(res.data);
          // Calculate time left (30 mins = 1800s)
          // DB created_at is likely UTC "YYYY-MM-DD HH:MM:SS"
          // We treat it as UTC by appending 'Z' or assuming server returns ISO.
          // SQLite simple string: treat as local if no Z?
          // Let's assume server/client same timezone for dev.
          const created = new Date(res.data.createdAt.replace(' ', 'T') + 'Z'); // Assume UTC from SQLite
          const now = new Date();
          // Adjust if SQLite returns UTC but no Z.
          // Actually, let's just use diff.
          // If created is very old, diff is negative.
          
          const expireTime = created.getTime() + 30 * 60 * 1000; 
          const diff = Math.floor((expireTime - now.getTime()) / 1000);
          
          // Fix timezone offset if needed (SQLite CURRENT_TIMESTAMP is UTC)
          // new Date() is local.
          // new Date(utc_string) -> local time if 'Z' is present.
          // If '2023-01-01 12:00:00' -> local.
          // If I append 'Z', it's UTC.
          // Let's try appending 'Z'.
          
          setTimeLeft(diff > 0 ? diff : 0);
        } else {
          setError(res.error?.message || '无法加载订单');
        }
      } catch (err) {
        setError('网络错误');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handlePay = async () => {
    try {
      const res = await payOrder(id);
      if (res.success) {
        navigate(`/purchase-success/${id}`);
      } else {
        alert(res.error?.message || '支付失败');
      }
    } catch (err) {
      alert('支付请求失败');
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('确认要取消该订单吗？')) return;
    try {
      const res = await cancelOrder(id);
      if (res.success) {
        navigate('/ticket-search');
      } else {
        alert(res.error?.message || '取消失败');
      }
    } catch (err) {
      alert('取消请求失败');
    }
  };

  if (loading) return <div>加载中...</div>;
  if (error) return <div>错误: {error}</div>;
  if (!order) return <div>订单不存在</div>;

  const isExpired = timeLeft <= 0;

  return (
    <div className="payment-page">
      <Header />
      <NavBar />
      
      <div className="payment-container">
        <div className="success-header">
           <h2>席位已锁定，请尽快支付</h2>
        </div>

        <div className="order-info-box">
           <div className="train-info-row">
              <span className="train-no">{order.items[0]?.trainNo}</span>
              <span>{order.items[0]?.fromStation} → {order.items[0]?.toStation}</span>
              <span>{order.items[0]?.departureDate}</span>
           </div>
           
           <table className="passenger-table">
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
                 {order.items.map(item => (
                   <tr key={item.id}>
                     <td>{item.passengerName}</td>
                     <td>{item.idNumber}</td>
                     <td>{item.passengerType === 'student' ? '学生票' : '成人票'}</td>
                     <td>{item.seatType}</td>
                     <td style={{color: '#f60'}}>¥{item.price}</td>
                   </tr>
                 ))}
              </tbody>
           </table>
        </div>

        <div className="action-bar">
           <div className="countdown">
              {isExpired ? '订单已过期' : `请在 ${formatTime(timeLeft)} 内完成支付`}
           </div>
           <div className="total-price">
              总金额：<span style={{fontSize: '24px', color: '#f60', fontWeight: 'bold'}}>¥{order.totalAmount}</span>
           </div>
           <div className="btn-group">
              <button className="cancel-btn" onClick={handleCancel}>取消订单</button>
              <button className="pay-btn" onClick={handlePay} disabled={isExpired || order.status !== 'PENDING'}>
                 确认支付
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;

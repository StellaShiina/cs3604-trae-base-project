import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import apiClient from '../api/index';

const PaymentPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes in seconds

  useEffect(() => {
    fetchOrder();
    
    // Timer
    const timer = setInterval(() => {
        setTimeLeft(t => t > 0 ? t - 1 : 0);
    }, 1000);
    return () => clearInterval(timer);
  }, [orderId]);

  const fetchOrder = async () => {
    try {
        const res = await apiClient.get(`/v1/orders/${orderId}`);
        if (res.data.code === 0) {
            setOrder(res.data.data);
            // In real app, calculate remaining time from created_at
            // const created = new Date(res.data.data.created_at);
            // const diff = ...
        } else {
            alert(res.data.message);
        }
    } catch (e) {
        console.error(e);
    }
  };

  const handlePay = async () => {
      try {
          const res = await apiClient.post(`/v1/orders/${orderId}/pay`);
          if (res.data.code === 0) {
              navigate(`/purchase-success/${orderId}`);
          } else {
              alert(res.data.message);
          }
      } catch (e) {
          console.error(e);
      }
  };

  const formatTime = (s) => {
      const m = Math.floor(s / 60);
      const sec = s % 60;
      return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  if (!order) return <div>Loading...</div>;

  const item = order.items && order.items[0]; // Assuming 1 item for display

  return (
    <div style={{ background: '#F5F7FA', minHeight: '100vh' }}>
      <Header />
      <div style={{ width: 1100, margin: '20px auto', background: 'white', padding: 20 }}>
        <h3>订单支付</h3>
        <div style={{ padding: 20, border: '1px solid #eee' }}>
            <p>订单号: {order.id}</p>
            {item && (
                <>
                  <p>车次: {item.train_code}</p>
                  <p>出发站: {item.departure_station}</p>
                  <p>到达站: {item.arrival_station}</p>
                  <p>日期: {item.departure_date}</p>
                  <p>票价: ¥{item.price}</p>
                </>
            )}
            <p>状态: {order.status === 'PENDING' ? '待支付' : order.status}</p>
        </div>
        
        <div style={{ marginTop: 20, textAlign: 'center' }}>
            <div style={{ color: 'orange', fontSize: 20, marginBottom: 20 }}>
                剩余支付时间: {formatTime(timeLeft)}
            </div>
            <button 
                onClick={handlePay}
                disabled={order.status !== 'PENDING' || timeLeft === 0}
                style={{ background: '#F57C00', color: 'white', padding: '10px 40px', border: 'none', borderRadius: 4, fontSize: 18 }}
            >
                确认支付
            </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;

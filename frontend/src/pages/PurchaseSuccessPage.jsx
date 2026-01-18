import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/Header';

const PurchaseSuccessPage = () => {
  const { orderId } = useParams();

  return (
    <div style={{ background: '#F5F7FA', minHeight: '100vh' }}>
      <Header />
      <div style={{ width: 1100, margin: '20px auto', background: 'white', padding: 50, textAlign: 'center' }}>
         <div style={{ fontSize: 40, color: 'green', marginBottom: 20 }}>✔ 支付成功</div>
         <p>订单号: {orderId}</p>
         <div style={{ marginTop: 40 }}>
            <Link to="/" style={{ marginRight: 20, textDecoration: 'none', background: '#2F86E5', color: 'white', padding: '10px 20px', borderRadius: 4 }}>
              继续购票
            </Link>
            <Link to="/orders" style={{ textDecoration: 'none', border: '1px solid #ccc', color: '#333', padding: '10px 20px', borderRadius: 4 }}>
              查看订单
            </Link>
         </div>
      </div>
    </div>
  );
};

export default PurchaseSuccessPage;

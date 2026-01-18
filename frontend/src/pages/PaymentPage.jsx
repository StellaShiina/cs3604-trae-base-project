import React from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';

const PaymentPage = () => {
  const { orderId } = useParams();
  
  return (
    <div>
      <Header />
      <div style={{ padding: 20, textAlign: 'center' }}>
        <h1>支付页面</h1>
        <p>订单号: {orderId}</p>
        <button style={{ background: 'orange', color: 'white', padding: 10 }}>确认支付</button>
      </div>
    </div>
  );
};

export default PaymentPage;

import React from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import NavBar from '../components/NavBar';

const PaymentPage = () => {
  const { id } = useParams();

  return (
    <div className="payment-page">
      <Header />
      <NavBar />
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>订单提交成功</h1>
        <p>订单号: {id}</p>
        <p>请在 30 分钟内完成支付</p>
      </div>
    </div>
  );
};

export default PaymentPage;

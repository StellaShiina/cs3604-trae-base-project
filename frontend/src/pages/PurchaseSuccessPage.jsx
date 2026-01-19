import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import NavBar from '../components/NavBar';

const PurchaseSuccessPage = () => {
  const { id } = useParams();

  return (
    <div className="purchase-success-page">
      <Header />
      <NavBar />
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <h1 style={{ color: 'green' }}>支付成功！</h1>
        <p>订单号: {id}</p>
        <p>您的车票已成功购买。</p>
        <div style={{ marginTop: '30px' }}>
            <Link to="/ticket-search" style={{ marginRight: '20px', padding: '10px 20px', backgroundColor: '#007bff', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
                继续购票
            </Link>
            <Link to="/" style={{ padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
                返回首页
            </Link>
        </div>
      </div>
    </div>
  );
};

export default PurchaseSuccessPage;

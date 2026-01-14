import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import './PaymentPage.css'; // Reuse CSS

const PurchaseSuccessPage = () => {
    const { orderId } = useParams();
    return (
        <div className="payment-page">
            <Header />
            <div className="main-content">
                <div className="payment-panel" style={{textAlign: 'center', padding: '50px'}}>
                    <h2 style={{color: 'green', fontSize: '28px', marginBottom: '20px'}}>支付成功！</h2>
                    <p style={{fontSize: '18px', marginBottom: '40px'}}>您的订单 {orderId} 已成功支付。</p>
                    <div className="actions">
                        <Link to="/order" className="btn-cancel" style={{textDecoration: 'none', display: 'inline-block', lineHeight: '20px'}}>查看订单</Link>
                        <Link to="/search" className="btn-pay" style={{textDecoration: 'none', display: 'inline-block', lineHeight: '20px'}}>继续购票</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default PurchaseSuccessPage;

import React, { useEffect, useState } from 'react';
import { getOrders } from '../../api';

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrders().then(res => {
      if (res.success) setOrders(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div>加载中...</div>;

  return (
    <div className="order-list">
      <h3>火车票订单</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
         <thead style={{ backgroundColor: '#EEF6FF' }}>
            <tr>
               <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #D9E6F7' }}>订单号</th>
               <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #D9E6F7' }}>车次信息</th>
               <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #D9E6F7' }}>状态</th>
               <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #D9E6F7' }}>总金额</th>
               <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #D9E6F7' }}>操作</th>
            </tr>
         </thead>
         <tbody>
            {orders.map(order => (
                <tr key={order.id}>
                    <td style={{ padding: '10px', borderBottom: '1px solid #E6E6E6' }}>{order.id}</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #E6E6E6' }}>
                        <div>{order.trainNo}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>{order.fromStation} -> {order.toStation}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>{order.departureDate}</div>
                    </td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #E6E6E6' }}>{order.status}</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #E6E6E6', color: '#FF7A00', fontWeight: 'bold' }}>¥{order.totalAmount}</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #E6E6E6' }}>
                        {order.status === 'PENDING' && (
                            <a href={`/payment/${order.id}`} style={{ color: '#1E6BD6', marginRight: '10px' }}>支付</a>
                        )}
                        <a href={`/order/${order.id}`} style={{ color: '#1E6BD6' }}>详情</a>
                    </td>
                </tr>
            ))}
            {orders.length === 0 && (
                <tr>
                    <td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#999' }}>暂无订单</td>
                </tr>
            )}
         </tbody>
      </table>
    </div>
  );
};

export default OrderList;

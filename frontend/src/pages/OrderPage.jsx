import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import NavBar from '../components/NavBar';
import { listPassengers, createOrder } from '../api';
import './OrderPage.css';

const OrderPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [trainInfo, setTrainInfo] = useState({
    trainNo: searchParams.get('trainNo'),
    fromStation: searchParams.get('fromStation'),
    toStation: searchParams.get('toStation'),
    date: searchParams.get('date'),
    departureTime: searchParams.get('departureTime'),
    arrivalTime: searchParams.get('arrivalTime'),
    duration: searchParams.get('duration')
  });

  const [passengers, setPassengers] = useState([]);
  const [selectedPassengers, setSelectedPassengers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPassengers = async () => {
      try {
        const res = await listPassengers();
        if (res.success) {
          setPassengers(res.data);
        } else {
          setError('无法加载乘车人信息');
        }
      } catch (err) {
        setError('网络错误');
      }
    };
    fetchPassengers();
  }, []);

  const handlePassengerToggle = (passenger) => {
    setSelectedPassengers(prev => {
      const exists = prev.find(p => p.id === passenger.id);
      if (exists) {
        return prev.filter(p => p.id !== passenger.id);
      } else {
        return [...prev, passenger];
      }
    });
  };

  const handleSubmit = async () => {
    if (selectedPassengers.length === 0) {
      alert('请选择乘车人');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        trainNo: trainInfo.trainNo,
        seatType: 'second_class', // Default or select via UI (keep simple for now)
        passengers: selectedPassengers,
        fromStation: trainInfo.fromStation,
        toStation: trainInfo.toStation,
        departureDate: trainInfo.date
      };

      const res = await createOrder(orderData);
      if (res.success) {
        // Redirect to payment or success page
        // For now, assume success page is /payment/:id or just alert
        navigate(`/payment/${res.data.id}`);
      } else {
        alert(res.error?.message || '订单提交失败');
      }
    } catch (err) {
      alert('网络错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="order-page">
      <Header />
      <NavBar />
      
      <div className="order-container">
        <h2 className="page-title">填写核对订单信息</h2>
        
        {/* Train Info Card */}
        <div className="train-info-card">
          <div className="train-row">
            <span className="train-date">{trainInfo.date}</span>
            <span className="train-no">{trainInfo.trainNo}</span>
          </div>
          <div className="station-row">
             <div className="station-item">
               <div className="station-name">{trainInfo.fromStation}</div>
               <div className="station-time">{trainInfo.departureTime}</div>
             </div>
             <div className="arrow">➜</div>
             <div className="station-item">
               <div className="station-name">{trainInfo.toStation}</div>
               <div className="station-time">{trainInfo.arrivalTime}</div>
             </div>
          </div>
        </div>

        {/* Passenger Selection */}
        <div className="passenger-section">
          <h3>选择乘车人</h3>
          {error && <div className="error">{error}</div>}
          
          <div className="passenger-list">
             {passengers.map(p => (
               <label key={p.id} className="passenger-item">
                 <input 
                   type="checkbox" 
                   checked={!!selectedPassengers.find(sp => sp.id === p.id)}
                   onChange={() => handlePassengerToggle(p)}
                 />
                 <span className="p-name">{p.real_name}</span>
                 <span className="p-type">{p.passenger_type === 'adult' ? '成人' : '学生'}</span>
                 <span className="p-id">{p.id_number}</span>
               </label>
             ))}
          </div>
        </div>

        {/* Selected Passengers Table (Ticket Pool) */}
        <div className="ticket-pool">
           <table className="passenger-table">
             <thead>
               <tr>
                 <th>序号</th>
                 <th>席别</th>
                 <th>票种</th>
                 <th>姓名</th>
                 <th>证件类型</th>
                 <th>证件号码</th>
                 <th>手机号码</th>
               </tr>
             </thead>
             <tbody>
               {selectedPassengers.map((p, idx) => (
                 <tr key={p.id}>
                   <td>{idx + 1}</td>
                   <td>
                     <select disabled>
                       <option>二等座</option>
                     </select>
                   </td>
                   <td>{p.passenger_type === 'adult' ? '成人票' : '学生票'}</td>
                   <td>{p.real_name}</td>
                   <td>中国居民身份证</td>
                   <td>{p.id_number}</td>
                   <td>{p.phone}</td>
                 </tr>
               ))}
             </tbody>
           </table>
        </div>

        {/* Submit Bar */}
        <div className="submit-bar">
          <button className="submit-btn" onClick={handleSubmit} disabled={loading}>
            {loading ? '提交中...' : '提交订单'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderPage;

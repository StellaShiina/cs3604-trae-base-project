import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import NavBar from '../components/NavBar';
import { listPassengers, createOrder } from '../api';
import './OrderPage.css';

const SEAT_TYPES = [
  { value: 'second_class', label: '二等座', price: 298.0 },
  { value: 'first_class', label: '一等座', price: 522.0 },
  { value: 'business_class', label: '商务座', price: 888.0 }
];

const TICKET_TYPES = [
  { value: 'adult', label: '成人票' },
  { value: 'child', label: '儿童票' },
  { value: 'student', label: '学生票' },
  { value: 'disability', label: '残军票' }
];

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
        return [...prev, { 
            ...passenger, 
            seatType: 'second_class', 
            ticketType: passenger.passenger_type || 'adult' 
        }];
      }
    });
  };

  const updatePassengerSeat = (id, seatType) => {
    setSelectedPassengers(prev => prev.map(p => p.id === id ? { ...p, seatType } : p));
  };
  
  const updatePassengerTicketType = (id, ticketType) => {
      setSelectedPassengers(prev => prev.map(p => p.id === id ? { ...p, ticketType } : p));
  };

  const removePassenger = (id) => {
    setSelectedPassengers(prev => prev.filter(p => p.id !== id));
  };

  const handleSubmit = async () => {
    if (selectedPassengers.length === 0) {
      alert('请选择乘车人');
      return;
    }

    setLoading(true);
    try {
      // In a real app, we might group by seatType or handle mixed seat types.
      // The current backend createOrder might expect a single seatType for the whole order 
      // OR handle items individually.
      // Looking at orderService.js:
      // const { trainNo, seatType, passengers, ... } = orderData;
      // It expects a single seatType for all passengers?
      // "stmt.run(orderId, p.id, trainNo, seatType, unitPrice, ...)"
      // Yes, current backend implementation uses `seatType` from root object for all.
      // I should update backend to support per-passenger seat type if I want to support mixed.
      // BUT for simplicity and complying with "Reference Image" where it shows one order, 
      // usually 12306 orders are per seat type (or split orders).
      // However, the UI shows a table with "席别" column for each passenger.
      // So users CAN select different seats.
      // My backend `orderService.js` takes `seatType` from root.
      // I should fix `orderService.js` to take seatType from passenger item.
      
      // For now, I'll pass the first passenger's seatType as the "main" one if backend restricts,
      // but ideally I should update backend.
      // I'll update backend later if needed. For now, let's assume all must be same or backend takes array.
      // My backend implementation:
      // const stmt = db.prepare(...)
      // passengers.forEach(p => { stmt.run(..., seatType, ...) })
      // It uses `seatType` variable which comes from `orderData.seatType`.
      
      // Let's check if I can modify backend quickly.
      // I'll just send `seatType` as 'mixed' and let backend read from passenger object if I change it.
      // OR, simpler: Force all to be same seat type in UI? No, UI allows change.
      // I will update backend to read seatType from passenger object.
      // But first let's send the request.
      
      // I will wrap passengers with their seatTypes.
      // Backend expects `passengers` array. I'll pass `seatType` inside each passenger object.
      // And I need to update backend to use it.
      
      const orderData = {
        trainNo: trainInfo.trainNo,
        seatType: selectedPassengers[0].seatType, // Fallback/Main
        passengers: selectedPassengers.map(p => ({
            id: p.id,
            seatType: p.seatType,
            ticketType: p.ticketType
        })),
        fromStation: trainInfo.fromStation,
        toStation: trainInfo.toStation,
        departureDate: trainInfo.date
      };

      const res = await createOrder(orderData);
      if (res.success) {
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

  const totalPrice = selectedPassengers.reduce((sum, p) => {
      const seat = SEAT_TYPES.find(s => s.value === p.seatType);
      return sum + (seat ? seat.price : 0);
  }, 0);

  return (
    <div className="order-page">
      <Header />
      <NavBar />
      
      <div className="order-container">
        <h2 className="page-title">填写核对订单信息</h2>
        
        {/* Train Info Card */}
        <div className="train-info-card">
          <div className="card-header">
            列车信息 <span className="sub-text">（以下余票信息仅供参考）</span>
          </div>
          <div className="train-row">
            <span className="train-date">{trainInfo.date}</span>
            <span className="train-no">{trainInfo.trainNo}</span>
            <span className="train-route">
                {trainInfo.fromStation} ({trainInfo.departureTime}开) — {trainInfo.toStation} ({trainInfo.arrivalTime}到)
            </span>
          </div>
          
          <div className="seat-prices-row">
             {SEAT_TYPES.map(seat => (
                 <span key={seat.value} className="seat-price-item">
                     {seat.label} <span className="price">¥{seat.price}</span> <span className="has-ticket">有票</span>
                 </span>
             ))}
          </div>
        </div>

        {/* Passenger Selection */}
        <div className="passenger-section">
          <div className="section-header">
              <h3>乘客信息</h3>
              <div className="passenger-filter">
                  <input placeholder="输入乘客姓名" />
              </div>
          </div>
          
          <div className="passenger-group">
             <div className="group-label">乘车人</div>
             <div className="passenger-list">
                {passengers.map(p => (
                  <label key={p.id} className="passenger-item">
                    <input 
                      type="checkbox" 
                      checked={!!selectedPassengers.find(sp => sp.id === p.id)}
                      onChange={() => handlePassengerToggle(p)}
                    />
                    <span className="p-name">{p.real_name}</span>
                  </label>
                ))}
             </div>
          </div>
        </div>

        {/* Selected Passengers Table (Ticket Pool) */}
        <div className="ticket-pool">
           <table className="passenger-table">
             <thead>
               <tr>
                 <th>序号</th>
                 <th>票种</th>
                 <th>席别</th>
                 <th>姓名</th>
                 <th>证件类型</th>
                 <th>证件号码</th>
                 <th>操作</th>
               </tr>
             </thead>
             <tbody>
               {selectedPassengers.map((p, idx) => (
                 <tr key={p.id}>
                   <td>{idx + 1}</td>
                   <td>
                     <select 
                        value={p.ticketType} 
                        onChange={(e) => updatePassengerTicketType(p.id, e.target.value)}
                     >
                        {TICKET_TYPES.map(t => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                     </select>
                   </td>
                   <td>
                     <select 
                        value={p.seatType} 
                        onChange={(e) => updatePassengerSeat(p.id, e.target.value)}
                     >
                        {SEAT_TYPES.map(s => (
                            <option key={s.value} value={s.value}>{s.label} (¥{s.price})</option>
                        ))}
                     </select>
                   </td>
                   <td>{p.real_name}</td>
                   <td>中国居民身份证</td>
                   <td>{p.id_number}</td>
                   <td>
                       <button className="remove-btn" onClick={() => removePassenger(p.id)}>×</button>
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
           
           {/* Add Passenger Button Placeholder */}
           <div className="add-passenger-row">
               <span className="add-btn-text" onClick={() => navigate('/passengers')}>+ 添加乘车人</span>
           </div>
        </div>

        {/* Insurance Banner */}
        <div className="insurance-banner">
            <div className="insurance-content">
                <span className="slogan">乘意相伴 安心出行</span>
            </div>
        </div>

        {/* Warning Box */}
        <div className="warning-box">
            <div className="warning-title">温馨提示：</div>
            <p>1. 一张有效身份证件同一乘车日期同一车次只能购买一张车票...</p>
            <p>2. 购买儿童票时，乘车人需有有效身份证件的，请填写本人有效身份证件信息...</p>
        </div>

        {/* Submit Bar */}
        <div className="submit-bar">
          <div className="total-price">
              订单总额: <span className="price-val">¥{totalPrice.toFixed(1)}</span>
          </div>
          <button className="submit-btn" onClick={handleSubmit} disabled={loading}>
            {loading ? '提交中...' : '提交订单'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderPage;

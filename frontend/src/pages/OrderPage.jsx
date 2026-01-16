import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import './OrderPage.css';
import axios from 'axios';

const OrderPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [passengers, setPassengers] = useState([]);
  const [selectedPassengerIds, setSelectedPassengerIds] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState({});
  const [trainInfo, setTrainInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const typeMap = {
    business: '商务座',
    first: '一等座',
    second: '二等座',
    softSleeper: '软卧',
    hardSleeper: '硬卧'
  };

  const getAvailableSeats = () => {
    if (!trainInfo || !trainInfo.price) return [];
    const seats = [];
    Object.keys(trainInfo.price).forEach(key => {
      if (trainInfo.price[key] !== null) {
        seats.push({
          type: key,
          label: typeMap[key] || key,
          price: trainInfo.price[key]
        });
      }
    });
    return seats;
  };

  // Mock data for dev if no location state (e.g. direct access)
  // In real app, we might redirect back to search
  useEffect(() => {
    if (location.state && location.state.train) {
      setTrainInfo(location.state.train);
    } else {
      // Fallback or redirect
      // navigate('/search');
      setTrainInfo({
         trainNumber: 'G1',
         fromStation: '北京南',
         toStation: '上海虹桥',
         departureTime: '08:00',
         arrivalTime: '12:00',
         duration: '4h'
      });
    }

    fetchPassengers();
  }, [location]);

  const fetchPassengers = async () => {
    try {
      const token = localStorage.getItem('token');
      // const userStr = localStorage.getItem('user');
      // const user = userStr ? JSON.parse(userStr) : null;
      // const token = user ? user.token : 'mock-jwt-token-1'; // Fallback for dev

      const res = await axios.get('/api/passengers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.code === 200) {
        setPassengers(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch passengers', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePassengerToggle = (id) => {
    setSelectedPassengerIds(prev => {
      if (prev.includes(id)) {
        const newSeats = { ...selectedSeats };
        delete newSeats[id];
        setSelectedSeats(newSeats);
        return prev.filter(pid => pid !== id);
      } else {
        // Auto select first available seat
        const seats = getAvailableSeats();
        if (seats.length > 0) {
          setSelectedSeats(prevSeats => ({
            ...prevSeats,
            [id]: seats[0].type
          }));
        }
        return [...prev, id];
      }
    });
  };

  const handleSeatChange = (passengerId, newSeatType) => {
    setSelectedSeats(prev => ({
      ...prev,
      [passengerId]: newSeatType
    }));
  };

  const handleSubmit = async () => {
    if (selectedPassengerIds.length === 0) {
      alert('请选择乘车人');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      // const userStr = localStorage.getItem('user');
      // const user = userStr ? JSON.parse(userStr) : null;
      // const token = user ? user.token : 'mock-jwt-token-1';

      const selectedPassengers = passengers
        .filter(p => selectedPassengerIds.includes(p.id))
        .map(p => {
          const seatTypeKey = selectedSeats[p.id];
          const price = trainInfo.price ? trainInfo.price[seatTypeKey] : 0;
          return {
            passengerId: p.id,
            seatType: seatTypeKey,
            price: price
          };
        });

      const payload = {
        trainId: trainInfo.id || 1, // Fallback
        fromStationId: 1, // Mock
        toStationId: 2, // Mock
        departureDate: '2023-10-01', // Mock
        passengers: selectedPassengers
      };

      const res = await axios.post('/api/orders', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.code === 201) {
        // Navigate to payment
        navigate(`/payment/${res.data.data.orderId}`);
      }
    } catch (err) {
      console.error('Order submission failed', err);
      alert('订单提交失败');
    }
  };

  return (
    <div className="order-page">
      <Header />
      <div className="order-container">
        <h2>填写订单</h2>
        
        {trainInfo && (
            <div className="train-info-card">
                <h3>{trainInfo.trainNumber} {trainInfo.fromStation} - {trainInfo.toStation}</h3>
                <p>{trainInfo.departureTime} 开 - {trainInfo.arrivalTime} 到 ({trainInfo.duration})</p>
            </div>
        )}

        <div className="passenger-selection">
          <h3>选择乘车人</h3>
          <div className="passenger-list">
             {loading ? <p>加载中...</p> : (
                 passengers.length === 0 ? <p>暂无常用联系人</p> : (
                     passengers.map(p => (
                         <div key={p.id} className="passenger-item">
                             <label>
                                 <input 
                                    type="checkbox" 
                                    checked={selectedPassengerIds.includes(p.id)}
                                    onChange={() => handlePassengerToggle(p.id)}
                                 />
                                 {p.name} ({p.id_type}: {p.id_number})
                             </label>
                         {selectedPassengerIds.includes(p.id) && (
                           <select
                             value={selectedSeats[p.id] || ''}
                             onChange={(e) => handleSeatChange(p.id, e.target.value)}
                             style={{ marginLeft: '10px', padding: '4px' }}
                           >
                             {getAvailableSeats().map(seat => (
                               <option key={seat.type} value={seat.type}>
                                 {seat.label} (¥{seat.price})
                               </option>
                             ))}
                           </select>
                         )}
                         </div>
                     ))
                 )
             )}
          </div>
          <button className="add-passenger-btn">+ 添加乘车人</button>
        </div>

        <button className="submit-order-btn" onClick={handleSubmit}>提交订单</button>
      </div>
    </div>
  );
};

export default OrderPage;

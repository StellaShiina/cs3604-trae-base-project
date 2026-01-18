import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import apiClient from '../api/index';

const OrderPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [passengers, setPassengers] = useState([]);
  const [selectedPassengers, setSelectedPassengers] = useState([]);
  const [trainInfo, setTrainInfo] = useState(null);

  useEffect(() => {
    // Check login
    const userId = localStorage.getItem('userId');
    if (!userId) {
      alert('请先登录');
      navigate('/login');
      return;
    }

    // Get train info from state
    if (location.state) {
      setTrainInfo(location.state);
    } else {
        // Fallback or error if direct access
    }

    // Fetch passengers
    fetchPassengers();
  }, [location, navigate]);

  const fetchPassengers = async () => {
    try {
      const res = await apiClient.get('/v1/orders/passengers');
      if (res.data.code === 0) {
        setPassengers(res.data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const togglePassenger = (p) => {
    const exists = selectedPassengers.find(sp => sp.id === p.id);
    if (exists) {
      setSelectedPassengers(selectedPassengers.filter(sp => sp.id !== p.id));
    } else {
      setSelectedPassengers([...selectedPassengers, { ...p, seatType: '二等座', ticketType: '成人' }]);
    }
  };

  const handleSubmit = async () => {
    if (selectedPassengers.length === 0) {
      alert('请选择乘车人');
      return;
    }
    
    const orderPayload = {
      trainCode: trainInfo.code,
      fromStation: trainInfo.from_station,
      toStation: trainInfo.to_station,
      date: trainInfo.date, // Need to pass date in state
      totalPrice: 100 * selectedPassengers.length, // Mock price calculation
      passengers: selectedPassengers.map(p => ({
        passengerId: p.id,
        seatType: p.seatType,
        ticketType: p.ticketType,
        price: 100 // Mock price
      }))
    };

    try {
      const res = await apiClient.post('/v1/orders', orderPayload);
      if (res.data.code === 0) {
        navigate(`/payment/${res.data.data.orderId}`);
      } else {
        alert(res.data.message);
      }
    } catch (e) {
      console.error(e);
      alert('提交失败');
    }
  };

  if (!trainInfo) return <div>Loading...</div>;

  return (
    <div className="order-page" style={{ background: '#F5F7FA', minHeight: '100vh' }}>
      <Header />
      <div className="content" style={{ width: 1100, margin: '20px auto' }}>
        
        {/* Train Info Panel */}
        <div style={{ background: 'white', border: '1px solid #BFD3EE', borderRadius: 4, marginBottom: 20 }}>
          <div style={{ background: 'linear-gradient(to right, #2E79B8, #1F5F98)', color: 'white', padding: '5px 10px' }}>
            列车信息（以下余票信息仅供参考）
          </div>
          <div style={{ padding: 20, background: '#F3F8FF' }}>
            <div style={{ fontWeight: 'bold', fontSize: 16 }}>
              {trainInfo.date}（周X） {trainInfo.code}次 {trainInfo.from_station}（{trainInfo.departure_time}开）— {trainInfo.to_station}（{trainInfo.arrival_time}到）
            </div>
          </div>
        </div>

        {/* Passenger Panel */}
        <div style={{ background: 'white', border: '1px solid #BFD3EE', borderRadius: 4, marginBottom: 20 }}>
          <div style={{ background: 'linear-gradient(to right, #2E79B8, #1F5F98)', color: 'white', padding: '5px 10px' }}>
             乘客信息
          </div>
          <div style={{ padding: 20 }}>
            <div style={{ marginBottom: 10 }}>
              <strong>乘车人</strong>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10 }}>
                {passengers.map(p => (
                  <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={!!selectedPassengers.find(sp => sp.id === p.id)}
                      onChange={() => togglePassenger(p)}
                    />
                    {p.name}
                  </label>
                ))}
              </div>
            </div>
            
            <div style={{ borderTop: '1px dashed #ccc', margin: '20px 0' }}></div>

            {/* Selected Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#eee' }}>
                  <th style={{ padding: 10 }}>姓名</th>
                  <th>证件类型</th>
                  <th>证件号码</th>
                  <th>席别</th>
                  <th>票种</th>
                </tr>
              </thead>
              <tbody>
                {selectedPassengers.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #eee', textAlign: 'center' }}>
                    <td style={{ padding: 10 }}>{p.name}</td>
                    <td>{p.id_type === '1' ? '中国居民身份证' : p.id_type}</td>
                    <td>{p.id_number}</td>
                    <td>
                      <select value={p.seatType} onChange={e => {
                         const updated = selectedPassengers.map(sp => sp.id === p.id ? { ...sp, seatType: e.target.value } : sp);
                         setSelectedPassengers(updated);
                      }}>
                        <option value="二等座">二等座</option>
                        <option value="一等座">一等座</option>
                      </select>
                    </td>
                    <td>
                      <select value={p.ticketType} onChange={e => {
                         const updated = selectedPassengers.map(sp => sp.id === p.id ? { ...sp, ticketType: e.target.value } : sp);
                         setSelectedPassengers(updated);
                      }}>
                        <option value="成人">成人票</option>
                        <option value="儿童">儿童票</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Submit Bar */}
        <div style={{ textAlign: 'center', marginTop: 30 }}>
           <button onClick={handleSubmit} style={{ background: '#F57C00', color: 'white', fontSize: 18, padding: '10px 40px', border: 'none', borderRadius: 4 }}>
             提交订单
           </button>
        </div>

      </div>
    </div>
  );
};

export default OrderPage;

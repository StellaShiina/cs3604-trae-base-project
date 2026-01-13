import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './OrderFormPage.css';

const OrderFormPage = () => {
  const { trainId } = useParams();
  const navigate = useNavigate();
  const [train, setTrain] = useState(null);
  const [passengers, setPassengers] = useState([]);
  const [selectedPassengers, setSelectedPassengers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const trainRes = await axios.get(`/api/trains/${trainId}`);
        if (trainRes.data.code === 200) {
          setTrain(trainRes.data.data);
        }

        const passRes = await axios.get('/api/passengers');
        if (passRes.data.code === 200) {
          setPassengers(passRes.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch data', error);
      }
    };
    fetchData();
  }, [trainId]);

  const togglePassenger = (passenger) => {
    if (selectedPassengers.find(p => p.id === passenger.id)) {
      setSelectedPassengers(selectedPassengers.filter(p => p.id !== passenger.id));
    } else {
      setSelectedPassengers([...selectedPassengers, passenger]);
    }
  };

  const handleSubmit = async () => {
    if (!train || selectedPassengers.length === 0) return;

    // Determine stations from train stops (Simplified: First and Last)
    const fromStationId = train.stops?.[0]?.station_id;
    const toStationId = train.stops?.[train.stops.length - 1]?.station_id;

    const payload = {
      trainId: train.id,
      fromStationId: fromStationId,
      toStationId: toStationId,
      departureDate: '2023-10-01', // TODO: Get from query param
      passengers: selectedPassengers.map(p => ({
        passengerId: p.id,
        seatType: '二等座', // Default
        price: 553.0 // Default price
      }))
    };

    try {
      const res = await axios.post('/api/orders', payload);
      if (res.data.code === 201) {
        // alert('Order created successfully');
        navigate('/order'); // Go to order list
      }
    } catch (error) {
      console.error('Failed to create order', error);
    }
  };

  return (
    <div className="order-form-page">
      <Header />
      <div className="main-content">
        <div className="order-panel">
          <h2>订单填写</h2>
          {/* Train Info */}
          <div className="train-info-card">
             {train && (
               <>
                 <div className="train-number">{train.train_number}</div>
                 <div className="train-route">
                   {train.start_station} -> {train.end_station}
                 </div>
                 <div className="train-time">
                   {train.start_time} - {train.end_time}
                 </div>
               </>
             )}
          </div>

          {/* Passenger Selection */}
          <div className="passenger-selection">
            <h3>选择乘车人</h3>
            <div className="passenger-list">
              {passengers.map(p => (
                <div key={p.id} className="passenger-item">
                  <label>
                    <input 
                      type="checkbox" 
                      checked={!!selectedPassengers.find(sp => sp.id === p.id)}
                      onChange={() => togglePassenger(p)}
                    />
                    {p.name} ({p.id_type}: {p.id_number})
                  </label>
                </div>
              ))}
            </div>
          </div>

          <button onClick={handleSubmit} className="btn-submit">提交订单</button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default OrderFormPage;

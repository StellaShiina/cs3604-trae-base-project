
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './PersonalCenterPage.css';

const PersonalCenterPage = () => {
  const [activeTab, setActiveTab] = useState('personal_info');
  const [userInfo, setUserInfo] = useState(null);
  const [passengers, setPassengers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (activeTab === 'personal_info') {
      fetchUserInfo();
    } else if (activeTab === 'passengers') {
      fetchPassengers();
    }
  }, [activeTab]);

  const fetchUserInfo = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/users/me');
      if (res.data.code === 200) {
        setUserInfo(res.data.data);
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load user info');
    } finally {
      setLoading(false);
    }
  };

  const fetchPassengers = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/passengers');
      if (res.data.code === 200) {
        setPassengers(res.data.data);
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load passengers');
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (activeTab === 'personal_info') {
      if (loading) return <div>Loading...</div>;
      if (error) return <div className="error">{error}</div>;
      if (!userInfo) return <div>No user info</div>;

      return (
        <div className="info-panel">
          <h3>基本信息</h3>
          <div className="info-item">
            <label>用户名：</label>
            <span>{userInfo.username}</span>
          </div>
          <div className="info-item">
            <label>姓名：</label>
            <span>{userInfo.real_name}</span>
          </div>
          <div className="info-item">
            <label>证件类型：</label>
            <span>{userInfo.id_type || '中国居民身份证'}</span>
          </div>
           <div className="info-item">
            <label>证件号码：</label>
            <span>{userInfo.id_number}</span>
          </div>
          <div className="info-item">
            <label>手机号：</label>
            <span>{userInfo.phone}</span>
          </div>
          <div className="info-item">
            <label>邮箱：</label>
            <span>{userInfo.email}</span>
          </div>
           <div className="info-item">
            <label>旅客类型：</label>
            <span>{userInfo.passenger_type}</span>
          </div>
        </div>
      );
    } else if (activeTab === 'passengers') {
      if (loading) return <div>Loading...</div>;
      if (error) return <div className="error">{error}</div>;
      
      return (
        <div className="passenger-list">
           <h3>常用联系人</h3>
           {passengers.length === 0 ? (
             <div>暂无联系人</div>
           ) : (
             <ul className="passenger-items">
               {passengers.map(p => (
                 <li key={p.id} className="passenger-item">
                   <span>{p.name}</span>
                   <span>{p.id_type}</span>
                   <span>{p.id_number}</span>
                   <span>{p.passenger_type}</span>
                 </li>
               ))}
             </ul>
           )}
        </div>
      );
    }
    return <div>Select an item from the sidebar.</div>;
  };

  return (
    <div className="personal-center-page">
      <Header />
      <div className="center-container">
        <div className="sidebar">
          <div className="sidebar-title">个人中心</div>
          <ul className="sidebar-menu">
            <li 
              className={`menu-item ${activeTab === 'personal_info' ? 'active' : ''}`}
              onClick={() => setActiveTab('personal_info')}
            >
              个人信息
            </li>
            <li 
              className={`menu-item ${activeTab === 'passengers' ? 'active' : ''}`}
              onClick={() => setActiveTab('passengers')}
            >
              乘车人
            </li>
          </ul>
        </div>
        <div className="main-content">
          <h2>个人中心</h2>
          {renderContent()}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PersonalCenterPage;

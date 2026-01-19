import React from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import Header from '../components/Header';
import NavBar from '../components/NavBar';
import PersonalInfo from '../components/Personal/PersonalInfo';
import OrderList from '../components/Personal/OrderList';
import PassengerList from '../components/Personal/PassengerList';
import './PersonalPage.css';

const PersonalPage = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className="personal-page" style={{ backgroundColor: '#F5F7FA', minHeight: '100vh' }}>
      <Header />
      <NavBar />
      
      <div className="main-area" style={{ width: '1200px', margin: '0 auto', paddingTop: '18px' }}>
         <div className="breadcrumb" style={{ fontSize: '12px', color: '#8A95A3', marginBottom: '15px' }}>
            当前位置：个人中心
         </div>

         <div className="content-row" style={{ display: 'flex', gap: '20px' }}>
            {/* Left Sidebar */}
            <div className="sidebar" style={{ width: '220px', backgroundColor: '#FFFFFF', padding: '10px 0' }}>
               <div className="menu-item active" style={{ backgroundColor: '#2E7CE6', color: 'white', padding: '10px 20px', fontWeight: 'bold' }}>
                  个人中心
               </div>
               
               <div className="menu-section" style={{ marginTop: '10px' }}>
                  <div className="section-header" style={{ padding: '10px 20px', fontWeight: 'bold', color: '#333' }}>订单中心</div>
                  <Link to="/personal/orders" style={{ display: 'block', padding: '8px 20px 8px 40px', color: '#555', textDecoration: 'none' }}>火车票订单</Link>
                  <div style={{ padding: '8px 20px 8px 40px', color: '#555' }}>候补订单</div>
               </div>

               <div className="menu-section" style={{ marginTop: '10px' }}>
                  <div className="section-header" style={{ padding: '10px 20px', fontWeight: 'bold', color: '#333' }}>常用信息管理</div>
                  <Link to="/personal/passengers" style={{ display: 'block', padding: '8px 20px 8px 40px', color: '#555', textDecoration: 'none' }}>乘车人</Link>
               </div>
               
               {/* Other sections omitted for brevity */}
            </div>

            {/* Right Main Panel */}
            <div className="main-panel" style={{ flex: 1, backgroundColor: '#FFFFFF', border: '1px solid #D9E2EF', padding: '25px', minHeight: '600px' }}>
               <Routes>
                  <Route path="/" element={<PersonalInfo />} />
                  <Route path="/orders" element={<OrderList />} />
                  <Route path="/passengers" element={<PassengerList />} />
               </Routes>
            </div>
         </div>
      </div>
    </div>
  );
};

export default PersonalPage;

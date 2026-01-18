import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Register from './pages/Register';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import SearchPage from './pages/SearchPage';
import OrderPage from './pages/OrderPage';
import PaymentPage from './pages/PaymentPage';
import PurchaseSuccessPage from './pages/PurchaseSuccessPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/order" element={<OrderPage />} />
      <Route path="/payment/:orderId" element={<PaymentPage />} />
      <Route path="/purchase-success/:orderId" element={<PurchaseSuccessPage />} />
    </Routes>
  );
}
export default App;

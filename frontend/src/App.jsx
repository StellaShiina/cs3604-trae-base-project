import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import TicketSearchPage from './pages/TicketSearchPage';
import OrderPage from './pages/OrderPage';
import PaymentPage from './pages/PaymentPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/ticket-search" element={<TicketSearchPage />} />
      <Route path="/order" element={<OrderPage />} />
      <Route path="/payment/:id" element={<PaymentPage />} />
    </Routes>
  );
}
export default App;

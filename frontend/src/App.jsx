import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import SearchPage from './pages/SearchPage';
import OrderPage from './pages/OrderPage';
import OrderFormPage from './pages/OrderFormPage';
import PersonalCenterPage from './pages/PersonalCenterPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/order" element={<OrderPage />} />
      <Route path="/order/create/:trainId" element={<OrderFormPage />} />
      <Route path="/center" element={<PersonalCenterPage />} />
    </Routes>
  );
}
export default App;

import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import TrainListPage from './pages/TrainListPage'
import OrderPage from './pages/OrderPage'
import PersonalInfoPage from './pages/PersonalInfoPage'
import PhoneVerificationPage from './pages/PhoneVerificationPage'
import PassengerManagementPage from './pages/PassengerManagementPage'
import OrderHistoryPage from './pages/OrderHistoryPage'
import PaymentPage from './pages/PaymentPage'
import SuccessfulPurchasePage from './pages/SuccessfulPurchasePage'
import './App.css'

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/trains" element={<TrainListPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/order" element={<OrderPage />} />
        <Route path="/personal-info" element={<PersonalInfoPage />} />
        <Route path="/phone-verification" element={<PhoneVerificationPage />} />
        <Route path="/passengers" element={<PassengerManagementPage />} />
        <Route path="/orders" element={<OrderHistoryPage />} />
        <Route path="/payment/:orderId" element={<PaymentPage />} />
        <Route path="/purchase-success/:orderId" element={<SuccessfulPurchasePage />} />
      </Routes>
    </div>
  )
}

export default App
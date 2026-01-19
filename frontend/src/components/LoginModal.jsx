import React from 'react';
import LoginForm from './LoginForm';
import './LoginModal.css';

const LoginModal = ({ onClose, onSuccess }) => {
  return (
    <div className="login-modal-overlay">
       <div className="login-modal-container">
           <button className="login-modal-close-btn" onClick={onClose}>×</button>
           <LoginForm onSuccess={onSuccess} />
       </div>
    </div>
  );
};

export default LoginModal;

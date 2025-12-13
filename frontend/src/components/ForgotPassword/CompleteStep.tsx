import React from 'react';
import { useNavigate } from 'react-router-dom';
import './CompleteStep.css';

/**
 * 步骤4：完成
 */
const CompleteStep: React.FC = () => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <div className="complete-step">
      <div className="success-icon">✓</div>
      <div className="success-message">
        新密码设置成功，您可以使用新密码
        <span className="login-link" onClick={handleLoginClick}>
          登录系统
        </span>
        ！
      </div>
    </div>
  );
};

export default CompleteStep;


import React from 'react';
import './ProgressBar.css';

interface ProgressBarProps {
  currentStep: number;
}

const steps = [
  { id: 1, label: '填写账户信息' },
  { id: 2, label: '获取验证码' },
  { id: 3, label: '设置新密码' },
  { id: 4, label: '完成' }
];

/**
 * 密码找回进度条组件
 */
const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep }) => {
  return (
    <div className="password-reset-progress-bar">
      <div className="progress-line-container">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className={`progress-node ${currentStep >= step.id ? 'active' : ''} ${currentStep === step.id ? 'current' : ''}`}>
              <div className="node-circle">
                {currentStep > step.id ? '✓' : ''}
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className={`progress-line ${currentStep > step.id ? 'active' : ''}`} />
            )}
          </React.Fragment>
        ))}
      </div>
      <div className="progress-labels">
        {steps.map((step) => (
          <div
            key={step.id}
            className={`progress-label ${currentStep >= step.id ? 'active' : ''}`}
          >
            {step.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressBar;


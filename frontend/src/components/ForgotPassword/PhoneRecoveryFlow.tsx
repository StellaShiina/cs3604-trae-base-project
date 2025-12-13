import React, { useState } from 'react';
import ProgressBar from './ProgressBar';
import AccountInfoStep from './AccountInfoStep';
import VerificationCodeStep from './VerificationCodeStep';
import SetNewPasswordStep from './SetNewPasswordStep';
import CompleteStep from './CompleteStep';
import './PhoneRecoveryFlow.css';

type Step = 1 | 2 | 3 | 4;

interface AccountInfo {
  phone: string;
  idCardType: string;
  idCardNumber: string;
}

/**
 * 手机找回流程组件
 */
const PhoneRecoveryFlow: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [sessionId, setSessionId] = useState<string>('');
  const [resetToken, setResetToken] = useState<string>('');
  const [accountInfo, setAccountInfo] = useState<AccountInfo>({
    phone: '',
    idCardType: '',
    idCardNumber: ''
  });

  const handleAccountVerified = (sessId: string, info: AccountInfo) => {
    setSessionId(sessId);
    setAccountInfo(info);
    setCurrentStep(2);
  };

  const handleCodeVerified = (token: string) => {
    setResetToken(token);
    setCurrentStep(3);
  };

  const handlePasswordReset = () => {
    setCurrentStep(4);
  };

  return (
    <div className="phone-recovery-flow">
      <ProgressBar currentStep={currentStep} />
      
      <div className="step-content">
        {currentStep === 1 && (
          <AccountInfoStep onSuccess={handleAccountVerified} />
        )}
        {currentStep === 2 && (
          <VerificationCodeStep
            sessionId={sessionId}
            phone={accountInfo.phone}
            onSuccess={handleCodeVerified}
          />
        )}
        {currentStep === 3 && (
          <SetNewPasswordStep
            resetToken={resetToken}
            onSuccess={handlePasswordReset}
          />
        )}
        {currentStep === 4 && <CompleteStep />}
      </div>
    </div>
  );
};

export default PhoneRecoveryFlow;


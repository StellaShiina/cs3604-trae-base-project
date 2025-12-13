import React from 'react'

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large'
  message?: string
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium', 
  message = '加载中...' 
}) => {
  return (
    <div className={`loading-spinner ${size}`}>
      <div className="spinner-icon">
        {/* TODO: 实现旋转动画 */}
        <div className="spinner-circle"></div>
      </div>
      {message && <div className="spinner-message">{message}</div>}
    </div>
  )
}

export default LoadingSpinner
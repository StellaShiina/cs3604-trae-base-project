import React from 'react'

interface ErrorMessageProps {
  message: string
  type: 'error' | 'warning' | 'info'
  onClose?: () => void
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, type, onClose }) => {
  if (!message) return null

  return (
    <div className={`error-message ${type}`}>
      <span className="message-text">{message}</span>
      {onClose && (
        <button className="close-button" onClick={onClose}>
          ×
        </button>
      )}
    </div>
  )
}

export default ErrorMessage
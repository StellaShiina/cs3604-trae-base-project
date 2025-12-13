import { render, screen, fireEvent } from '@testing-library/react'
import LoginForm from './src/components/LoginForm'

const mockProps = {
  onSubmit: () => {},
  onQrLogin: () => {},
  onRegister: () => {},
  onForgotPassword: () => {}
}

// Test
const { container } = render(<LoginForm {...mockProps} />)
const submitButton = screen.getByText('立即登录')
fireEvent.click(submitButton)

console.log('HTML after click:', container.innerHTML)
console.log('Error found:', screen.queryByText(/请输入用户名/i))

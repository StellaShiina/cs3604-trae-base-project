import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import ForgotPasswordPage from '../../src/pages/ForgotPasswordPage';

vi.mock('axios');

describe('Unit: <ForgotPasswordPage />', () => {
  it('renders phone recovery by default', () => {
    render(<BrowserRouter><ForgotPasswordPage /></BrowserRouter>);
    expect(screen.getByText('手机找回')).toHaveClass('active');
    expect(screen.getByPlaceholderText('请输入手机号码')).toBeInTheDocument();
  });

  it('switches tabs to unavailable methods', () => {
    render(<BrowserRouter><ForgotPasswordPage /></BrowserRouter>);
    
    fireEvent.click(screen.getByText('人脸找回'));
    expect(screen.getByText('功能暂未开放')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('邮箱找回'));
    expect(screen.getByText('功能暂未开放')).toBeInTheDocument();
  });

  it('validates step 1 empty input', () => {
    render(<BrowserRouter><ForgotPasswordPage /></BrowserRouter>);
    fireEvent.click(screen.getByRole('button', { name: /提交校验/i }));
    expect(screen.getByText('请填写完整信息')).toBeInTheDocument();
  });
});

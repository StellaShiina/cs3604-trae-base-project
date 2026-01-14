import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../../src/pages/LoginPage';

// Mock axios if needed, but for pure UI unit tests, we can just check rendering
// However, the component imports axios, so we should mock it to avoid side effects
vi.mock('axios');

describe('Unit: <LoginPage />', () => {
  it('renders login form by default', () => {
    render(<BrowserRouter><LoginPage /></BrowserRouter>);
    expect(screen.getByText('账号登录')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('用户名/邮箱/手机号')).toBeInTheDocument();
  });

  it('toggles tabs', () => {
    render(<BrowserRouter><LoginPage /></BrowserRouter>);
    
    // Switch to QR
    fireEvent.click(screen.getByText('扫码登录'));
    expect(screen.getByText('二维码占位区域')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('用户名/邮箱/手机号')).not.toBeInTheDocument();

    // Switch back
    fireEvent.click(screen.getByText('账号登录'));
    expect(screen.getByPlaceholderText('用户名/邮箱/手机号')).toBeInTheDocument();
  });

  it('validates empty input', () => {
    render(<BrowserRouter><LoginPage /></BrowserRouter>);
    fireEvent.click(screen.getByRole('button', { name: /立即登录/i }));
    expect(screen.getByText('请输入用户名和密码')).toBeInTheDocument();
  });
});

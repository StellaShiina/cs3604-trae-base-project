import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import RegisterPage from '../../src/pages/RegisterPage';

// Mock axios for unit test
vi.mock('axios', () => ({
  default: {
    post: vi.fn(() => Promise.resolve({ data: { code: 200 } }))
  }
}));

describe('RegisterPage Unit', () => {
  it('renders all form fields', () => {
    render(<BrowserRouter><RegisterPage /></BrowserRouter>);
    expect(screen.getByText('用户名：')).toBeInTheDocument();
    expect(screen.getByText('密码：')).toBeInTheDocument();
    expect(screen.getByText('确认密码：')).toBeInTheDocument();
    expect(screen.getByText('姓名：')).toBeInTheDocument();
    expect(screen.getByText('证件类型：')).toBeInTheDocument();
    expect(screen.getByText('证件号码：')).toBeInTheDocument();
    expect(screen.getByText('手机号码：')).toBeInTheDocument();
    expect(screen.getByText('旅客类型：')).toBeInTheDocument();
  });

  it('updates input values on change', () => {
    render(<BrowserRouter><RegisterPage /></BrowserRouter>);
    const input = screen.getByPlaceholderText('请输入真实姓名');
    fireEvent.change(input, { target: { value: 'Test Name' } });
    expect(input.value).toBe('Test Name');
  });
});
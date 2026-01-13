import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';

// [IMPORTS]
import app from '../../../backend/src/index'; 
import db from '../../../backend/src/database/init_db'; 
import ForgotPasswordPage from '../../src/pages/ForgotPasswordPage';

// [GLOBALS]
let server;
let lastApiResponse = null; 

describe('Full-Stack Integration: <ForgotPasswordPage />', () => {

  beforeAll(async () => {
    server = await new Promise(resolve => {
      const s = app.listen(0, () => resolve(s));
    });
    const port = server.address().port;
    axios.defaults.baseURL = `http://localhost:${port}`;
    
    axios.interceptors.response.use((response) => {
      lastApiResponse = response.data;
      return response;
    }, (error) => {
        lastApiResponse = error.response?.data;
        return Promise.reject(error);
    });
  });

  afterAll((done) => server?.close(done));

  beforeEach(async () => {
    lastApiResponse = null;
    await new Promise(resolve => db.run('DELETE FROM users', resolve));
    // Seed a user
    await new Promise(resolve => {
        db.run(`INSERT INTO users (username, password, id_number, phone) VALUES (?, ?, ?, ?)`, 
            ['forgot_user', 'oldpass', '110101199001019999', '13700137000'], resolve);
    });
  });

  it('renders forgot password page and defaults to phone recovery', () => {
    render(<BrowserRouter><ForgotPasswordPage /></BrowserRouter>);
    expect(screen.getByText('找回密码')).toBeInTheDocument();
    expect(screen.getByText('手机找回')).toHaveClass('active');
    expect(screen.getByPlaceholderText('请输入手机号码')).toBeInTheDocument();
  });

  it('shows placeholder for unavailable methods', () => {
    render(<BrowserRouter><ForgotPasswordPage /></BrowserRouter>);
    fireEvent.click(screen.getByText('人脸找回'));
    expect(screen.getByText('功能暂未开放')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('邮箱找回'));
    expect(screen.getByText('功能暂未开放')).toBeInTheDocument();
  });

  it('completes the full password reset flow', async () => {
    render(<BrowserRouter><ForgotPasswordPage /></BrowserRouter>);

    // Step 1: Verify User
    fireEvent.change(screen.getByPlaceholderText('请输入手机号码'), { target: { value: '13700137000' } });
    fireEvent.change(screen.getByPlaceholderText('请输入证件号码'), { target: { value: '110101199001019999' } });
    fireEvent.click(screen.getByRole('button', { name: /提交校验/i }));

    await waitFor(() => {
        expect(screen.getByPlaceholderText('短信验证码')).toBeInTheDocument();
    });

    // Step 2: SMS Verify
    fireEvent.change(screen.getByPlaceholderText('短信验证码'), { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: /^验证$/ }));

    await waitFor(() => {
        expect(screen.getByPlaceholderText('请输入新密码')).toBeInTheDocument();
    });

    // Step 3: Set New Password
    fireEvent.change(screen.getByPlaceholderText('请输入新密码'), { target: { value: 'newpassword123' } });
    fireEvent.change(screen.getByPlaceholderText('请再次输入新密码'), { target: { value: 'newpassword123' } });
    fireEvent.click(screen.getByRole('button', { name: /重置密码/i }));

    await waitFor(() => {
        expect(screen.getByText('密码重置成功')).toBeInTheDocument();
        expect(lastApiResponse.code).toBe(200);
    });
  });
});

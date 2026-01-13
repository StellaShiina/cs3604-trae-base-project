import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import app from '../../../backend/src/index'; 
import db from '../../../backend/src/database/init_db'; 
import ForgotPasswordPage from '../../src/pages/ForgotPasswordPage';

// Helper for DB operations
const runDb = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

let server;
let lastApiResponse = null; 

describe('Full-Stack Integration: ForgotPasswordPage', () => {

  beforeAll(async () => {
    server = await new Promise(resolve => {
      const s = app.listen(0, () => resolve(s));
    });
    const port = server.address().port;
    axios.defaults.baseURL = `http://localhost:${port}`;
    
    axios.interceptors.response.use(
      (response) => {
        lastApiResponse = response.data; 
        return response; 
      },
      (error) => {
        if (error.response) {
          lastApiResponse = error.response.data;
        }
        return Promise.reject(error);
      }
    );
  });

  afterAll((done) => server?.close(done));

  beforeEach(async () => {
    lastApiResponse = null;
    vi.stubGlobal('location', { href: 'http://localhost/forgot-password', assign: vi.fn() });
    
    // Cleanup and Seed
    await runDb('DELETE FROM users WHERE phone = ?', ['13900139000']);
    await runDb(`INSERT INTO users (username, password, real_name, id_type, id_number, phone, passenger_type) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`, 
                 ['forgotuser', 'oldpass123', 'Forgot User', '居民身份证', '110101198001015678', '13900139000', '1']);
  });

  it('renders initial state correctly (Mobile Tab Default)', () => {
    render(
      <MemoryRouter>
        <ForgotPasswordPage />
      </MemoryRouter>
    );
    expect(screen.getByText('找回密码')).toBeInTheDocument();
    expect(screen.getByText('手机找回').classList.contains('active')).toBe(true);
    expect(screen.getByPlaceholderText('请输入手机号码')).toBeInTheDocument();
  });

  it('switches tabs to "Not Available" features', () => {
    render(
      <MemoryRouter>
        <ForgotPasswordPage />
      </MemoryRouter>
    );
    
    fireEvent.click(screen.getByText('人脸找回'));
    expect(screen.getByText('功能暂未开放')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('邮箱找回'));
    expect(screen.getByText('功能暂未开放')).toBeInTheDocument();
  });

  it('completes the full password reset flow', async () => {
    render(
      <MemoryRouter>
        <ForgotPasswordPage />
      </MemoryRouter>
    );

    // Step 1: Verify User
    fireEvent.change(screen.getByPlaceholderText('请输入手机号码'), { target: { value: '13900139000' } });
    fireEvent.change(screen.getByPlaceholderText('请输入证件号码'), { target: { value: '110101198001015678' } });
    // Assuming '居民身份证' is default
    
    fireEvent.click(screen.getByText('提交校验'));
    
    await waitFor(() => {
      expect(lastApiResponse).toBeTruthy();
      expect(lastApiResponse.code).toBe(200);
      expect(lastApiResponse.message).toBe('User verified');
    });

    // Step 2: SMS Verify
    await waitFor(() => expect(screen.getByPlaceholderText('短信验证码')).toBeInTheDocument());
    
    fireEvent.click(screen.getByText('获取验证码'));
    // Mock SMS send if needed or just wait
    
    fireEvent.change(screen.getByPlaceholderText('短信验证码'), { target: { value: '123456' } });
    fireEvent.click(screen.getByText('验证'));
    
    await waitFor(() => {
        expect(lastApiResponse.code).toBe(200);
        expect(lastApiResponse.message).toBe('Verification successful');
    });

    // Step 3: Reset Password
    await waitFor(() => expect(screen.getByPlaceholderText('请输入新密码')).toBeInTheDocument());
    
    fireEvent.change(screen.getByPlaceholderText('请输入新密码'), { target: { value: 'newpass123' } });
    fireEvent.change(screen.getByPlaceholderText('请再次输入新密码'), { target: { value: 'newpass123' } });
    
    fireEvent.click(screen.getByText('重置密码'));
    
    await waitFor(() => {
        expect(lastApiResponse.code).toBe(200);
        expect(lastApiResponse.message).toBe('Password reset successful');
    });

    // Step 4: Success Page
    await waitFor(() => expect(screen.getByText('密码重置成功')).toBeInTheDocument());
  });

  it('fails verify user with wrong ID', async () => {
    render(
      <MemoryRouter>
        <ForgotPasswordPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('请输入手机号码'), { target: { value: '13900139000' } });
    fireEvent.change(screen.getByPlaceholderText('请输入证件号码'), { target: { value: '000000000000000000' } }); // Wrong ID
    
    fireEvent.click(screen.getByText('提交校验'));
    
    await waitFor(() => {
      expect(screen.getByText('User not found or information mismatch')).toBeInTheDocument();
    });
  });

  it('fails verify user with wrong ID Type', async () => {
    render(
      <MemoryRouter>
        <ForgotPasswordPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('请输入手机号码'), { target: { value: '13900139000' } });
    fireEvent.change(screen.getByPlaceholderText('请输入证件号码'), { target: { value: '110101198001015678' } }); // Correct ID
    
    // Change ID Type to something else (e.g. 港澳居民...)
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '港澳居民来往内地通行证' } });
    
    // Verify value changed
    expect(select.value).toBe('港澳居民来往内地通行证');

    fireEvent.click(screen.getByText('提交校验'));
    
    await waitFor(() => {
      // Should fail if backend checks idType
      expect(lastApiResponse.code).not.toBe(200);
      expect(screen.getByText('User not found or information mismatch')).toBeInTheDocument();
    });
  });

});

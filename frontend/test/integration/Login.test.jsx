import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';

// [IMPORTS]
import app from '../../../backend/src/index'; 
import db from '../../../backend/src/database/init_db'; 
import LoginPage from '../../src/pages/LoginPage';

// [GLOBALS]
let server;
let lastApiResponse = null; 

describe('Full-Stack Integration: <LoginPage />', () => {

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
    vi.stubGlobal('location', { href: 'http://localhost/', assign: vi.fn() });
    
    await new Promise(resolve => db.run('DELETE FROM users', resolve));
    // Seed a user
    await new Promise(resolve => {
        db.run(`INSERT INTO users (username, password, id_number, phone) VALUES (?, ?, ?, ?)`, 
            ['testuser', 'password123', '110101199001011234', '13800138000'], resolve);
    });
  });

  it('renders login page correctly', () => {
    render(<BrowserRouter><LoginPage /></BrowserRouter>);
    expect(screen.getByText('账号登录')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('用户名/邮箱/手机号')).toBeInTheDocument();
  });

  it('switches to qr code login', () => {
    render(<BrowserRouter><LoginPage /></BrowserRouter>);
    fireEvent.click(screen.getByText('扫码登录'));
    expect(screen.getByText('二维码占位区域')).toBeInTheDocument();
  });

  it('performs full login flow (Happy Path)', async () => {
    render(<BrowserRouter><LoginPage /></BrowserRouter>);

    // Step 1: Enter User/Pass
    fireEvent.change(screen.getByPlaceholderText('用户名/邮箱/手机号'), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByPlaceholderText('密码'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /立即登录/i }));

    // Step 2: Verify Modal Appears
    expect(screen.getByText('安全验证')).toBeInTheDocument();

    // Step 3: Enter Verification Info
    fireEvent.change(screen.getByPlaceholderText('证件号后四位'), { target: { value: '1234' } }); // From seeded data
    fireEvent.change(screen.getByPlaceholderText('短信验证码'), { target: { value: '123456' } }); // Mock code
    
    // Step 4: Submit
    fireEvent.click(screen.getByRole('button', { name: /提交验证/i }));

    // Verify
    await waitFor(() => {
      expect(lastApiResponse).not.toBeNull();
      expect(lastApiResponse.code).toBe(200);
      expect(lastApiResponse.message).toMatch(/Login successful/i);
    });
  });

  it('fails with incorrect password', async () => {
    render(<BrowserRouter><LoginPage /></BrowserRouter>);

    fireEvent.change(screen.getByPlaceholderText('用户名/邮箱/手机号'), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByPlaceholderText('密码'), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByRole('button', { name: /立即登录/i }));

    fireEvent.change(screen.getByPlaceholderText('证件号后四位'), { target: { value: '1234' } });
    fireEvent.change(screen.getByPlaceholderText('短信验证码'), { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: /提交验证/i }));

    await waitFor(() => {
        expect(lastApiResponse).not.toBeNull();
        expect(lastApiResponse.code).not.toBe(200);
        expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument();
    });
  });
});

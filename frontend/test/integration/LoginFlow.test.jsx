import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import app from '../../../backend/src/index'; 
import db from '../../../backend/src/database/init_db'; 
import LoginPage from '../../src/pages/LoginPage';

// Helper to wrap DB run in promise
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

describe('Integration: Login Flow', () => {

  beforeAll(async () => {
    // Start backend on random port
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
    vi.stubGlobal('location', { href: 'http://localhost/login', assign: vi.fn() });
    
    // Seed DB with a test user
    // User: testuser / password123 / ID: 110101199001011234 (Last 4: 1234)
    // Cleanup potential conflicts
    await runDb('DELETE FROM users WHERE username = ? OR phone = ? OR id_number = ?', ['testuser', '13800138000', '110101199001011234']);
    
    await runDb(`INSERT INTO users (username, password, real_name, id_type, id_number, phone, passenger_type) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`, 
                 ['testuser', 'password123', 'Test User', '1', '110101199001011234', '13800138000', '1']);
  });

  it('renders login page elements correctly', () => {
    render(<MemoryRouter><LoginPage /></MemoryRouter>);
    expect(screen.getByText('账号登录')).toBeInTheDocument();
    expect(screen.getByText('扫码登录')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('用户名/邮箱/手机号')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('密码')).toBeInTheDocument();
    expect(screen.getByText('立即登录')).toBeInTheDocument();
  });

  it('switches to QR code login', () => {
    render(<MemoryRouter><LoginPage /></MemoryRouter>);
    fireEvent.click(screen.getByText('扫码登录'));
    expect(screen.getByText('二维码占位区域')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('用户名/邮箱/手机号')).not.toBeInTheDocument();
  });

  it('shows modal after initial submit', () => {
    render(<MemoryRouter><LoginPage /></MemoryRouter>);
    fireEvent.change(screen.getByPlaceholderText('用户名/邮箱/手机号'), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByPlaceholderText('密码'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByText('立即登录'));
    
    expect(screen.getByText('安全验证')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('证件号后四位')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('短信验证码')).toBeInTheDocument();
  });

  it('handles invalid SMS code', async () => {
    render(<MemoryRouter><LoginPage /></MemoryRouter>);
    
    // Fill initial form
    fireEvent.change(screen.getByPlaceholderText('用户名/邮箱/手机号'), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByPlaceholderText('密码'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByText('立即登录'));

    // Fill modal form with WRONG code
    fireEvent.change(screen.getByPlaceholderText('证件号后四位'), { target: { value: '1234' } });
    fireEvent.change(screen.getByPlaceholderText('短信验证码'), { target: { value: '000000' } }); // Wrong
    
    fireEvent.click(screen.getByText('提交验证'));

    await waitFor(() => {
        expect(lastApiResponse.code).toBe(401);
        expect(screen.getByText('Invalid SMS code')).toBeInTheDocument();
    });
  });

  it('handles valid SMS code but invalid ID Last 4', async () => {
    render(<MemoryRouter><LoginPage /></MemoryRouter>);
    
    // Fill initial form
    fireEvent.change(screen.getByPlaceholderText('用户名/邮箱/手机号'), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByPlaceholderText('密码'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByText('立即登录'));

    // Fill modal form with RIGHT code but WRONG ID
    fireEvent.change(screen.getByPlaceholderText('证件号后四位'), { target: { value: '9999' } }); // Wrong
    fireEvent.change(screen.getByPlaceholderText('短信验证码'), { target: { value: '123456' } }); // Right
    
    fireEvent.click(screen.getByText('提交验证'));

    await waitFor(() => {
        expect(lastApiResponse.code).toBe(401);
        expect(screen.getByText('Invalid ID verification')).toBeInTheDocument();
    });
  });

  it('performs successful login', async () => {
    // Mock navigation
    const navigate = vi.fn();
    // We can't easily mock useNavigate inside component without wrapper or mock module.
    // But we can check if window location changes if we used window.location (which we don't, we use react-router).
    // Or we check the backend response code.
    
    render(<MemoryRouter><LoginPage /></MemoryRouter>);
    
    // Fill initial form
    fireEvent.change(screen.getByPlaceholderText('用户名/邮箱/手机号'), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByPlaceholderText('密码'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByText('立即登录'));

    // Fill modal form with ALL RIGHT
    fireEvent.change(screen.getByPlaceholderText('证件号后四位'), { target: { value: '1234' } }); 
    fireEvent.change(screen.getByPlaceholderText('短信验证码'), { target: { value: '123456' } }); 
    
    fireEvent.click(screen.getByText('提交验证'));

    await waitFor(() => {
        expect(lastApiResponse.code).toBe(200);
        expect(lastApiResponse.data.token).toBeDefined();
        // Since we are in MemoryRouter, navigate('/') won't change window.location.href.
        // But we verified the backend interaction.
    });
  });
});

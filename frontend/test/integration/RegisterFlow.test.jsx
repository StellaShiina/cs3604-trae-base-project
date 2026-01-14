/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import app from '../../../backend/src/index'; 
import db from '../../../backend/src/database/init_db'; 
import RegisterPage from '../../src/pages/RegisterPage';

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

describe('Full-Stack Integration: RegisterPage', () => {

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
    vi.stubGlobal('location', { href: 'http://localhost/register', assign: vi.fn() });
    
    // Cleanup
    await runDb('DELETE FROM users WHERE username = ? OR phone = ? OR id_number = ?', ['testuser', '13800138000', '110101199001011234']);
    await runDb('DELETE FROM users WHERE username = ?', ['existing_user']);
    
    // Seed existing user
    await runDb(`INSERT INTO users (username, password, real_name, id_type, id_number, phone, passenger_type) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`, 
                 ['existing_user', 'password123', 'Existing User', '居民身份证', '110101198001018888', '13900139999', '1']);
  });

  it('renders register form correctly', () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );
    expect(screen.getByText('账户注册')).toBeInTheDocument();
    expect(screen.getByText('用户名：')).toBeInTheDocument();
    expect(screen.getByText('密码：')).toBeInTheDocument();
  });

  it('validates username availability on blur', async () => {
    render(<MemoryRouter><RegisterPage /></MemoryRouter>);
    
    const usernameInput = screen.getByLabelText('用户名：');
    fireEvent.change(usernameInput, { target: { value: 'existing_user' } });
    fireEvent.blur(usernameInput);
    
    await waitFor(() => {
      expect(screen.getByText('用户名已被占用')).toBeInTheDocument();
    });
    
    fireEvent.change(usernameInput, { target: { value: 'new_user_123' } });
    fireEvent.blur(usernameInput);
    
    await waitFor(() => {
      expect(screen.queryByText('用户名已被占用')).not.toBeInTheDocument();
      // Implementation might show "Username available" or just clear error
    });
  });

  it('updates password strength indicator', async () => {
    render(<MemoryRouter><RegisterPage /></MemoryRouter>);
    const passwordInput = screen.getByLabelText('密码：');
    
    // Weak
    fireEvent.change(passwordInput, { target: { value: '123456' } });
    const strengthBar = passwordInput.parentElement.querySelector('.password-strength');
    expect(strengthBar).toHaveClass('strength-low');

    // Medium
    fireEvent.change(passwordInput, { target: { value: '123456a' } });
    expect(strengthBar).toHaveClass('strength-medium');

    // Strong
    fireEvent.change(passwordInput, { target: { value: '123456a@' } });
    expect(strengthBar).toHaveClass('strength-high');
  });

  it('submits form successfully with valid data', async () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText('用户名：'), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText('密码：'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText('确认密码：'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText('姓名：'), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText('证件号码：'), { target: { value: '110101199001011234' } });
    fireEvent.change(screen.getByLabelText('手机号码：'), { target: { value: '13800138000' } });

    fireEvent.click(screen.getByRole('button', { name: '注册' }));

    await waitFor(() => {
      expect(lastApiResponse).toBeTruthy();
      expect(lastApiResponse.code).toBe(200);
      expect(screen.getByText('注册成功！请登录。')).toBeInTheDocument();
    });
  });

  it('fails submission with existing phone', async () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText('用户名：'), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText('密码：'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText('确认密码：'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText('姓名：'), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText('证件号码：'), { target: { value: '110101199001011235' } }); // Different ID
    fireEvent.change(screen.getByLabelText('手机号码：'), { target: { value: '13900139999' } }); // Existing Phone (from seed)

    fireEvent.click(screen.getByRole('button', { name: '注册' }));

    await waitFor(() => {
      expect(lastApiResponse.code).toBe(409);
      expect(screen.getByText('error: User already exists')).toBeInTheDocument();
    });
  });

  it('fails submission with existing ID', async () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText('用户名：'), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText('密码：'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText('确认密码：'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText('姓名：'), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText('证件号码：'), { target: { value: '110101198001018888' } }); // Existing ID
    fireEvent.change(screen.getByLabelText('手机号码：'), { target: { value: '13800138000' } });

    fireEvent.click(screen.getByRole('button', { name: '注册' }));

    await waitFor(() => {
      expect(lastApiResponse.code).toBe(409);
      expect(screen.getByText('error: User already exists')).toBeInTheDocument();
    });
  });

});

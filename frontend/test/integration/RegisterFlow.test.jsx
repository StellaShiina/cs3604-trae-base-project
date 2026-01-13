import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import RegisterPage from '../../src/pages/RegisterPage';

vi.mock('axios');

describe('Integration: Registration Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

  it('validates username format', async () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    const usernameInput = screen.getByLabelText('用户名：');
    fireEvent.change(usernameInput, { target: { value: '123' } }); // Invalid start
    fireEvent.blur(usernameInput);

    await waitFor(() => {
      expect(screen.getByText('用户名格式错误')).toBeInTheDocument();
    });

    fireEvent.change(usernameInput, { target: { value: 'ValidUser123' } });
    fireEvent.blur(usernameInput);

    await waitFor(() => {
      expect(screen.queryByText('用户名格式错误')).not.toBeInTheDocument();
    });
  });

  it('validates password mismatch', async () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText('密码：'), { target: { value: 'password123' } });
    const confirmInput = screen.getByLabelText('确认密码：');
    fireEvent.change(confirmInput, { target: { value: 'password456' } });
    fireEvent.blur(confirmInput);

    await waitFor(() => {
      expect(screen.getByText('两次密码输入不一致')).toBeInTheDocument();
    });
  });

  it('submits form successfully', async () => {
    axios.post.mockResolvedValueOnce({ data: { code: 200, message: 'Success' } });

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    // Fill all valid data
    fireEvent.change(screen.getByLabelText('用户名：'), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText('密码：'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText('确认密码：'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText('证件号码：'), { target: { value: '110101199001011234' } });
    fireEvent.change(screen.getByLabelText('手机号码：'), { target: { value: '13800138000' } });

    fireEvent.click(screen.getByRole('button', { name: '注册' }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/api/auth/register', expect.objectContaining({
        username: 'testuser',
        password: 'password123'
      }));
      expect(screen.getByText('注册成功！请登录。')).toBeInTheDocument();
    });
  });

  it('handles submission error', async () => {
    axios.post.mockRejectedValueOnce({ response: { data: { message: 'User already exists' } } });

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText('用户名：'), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText('密码：'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText('确认密码：'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText('证件号码：'), { target: { value: '110101199001011234' } });
    fireEvent.change(screen.getByLabelText('手机号码：'), { target: { value: '13800138000' } });

    fireEvent.click(screen.getByRole('button', { name: '注册' }));

    await waitFor(() => {
      expect(screen.getByText('error: User already exists')).toBeInTheDocument();
    });
  });
});

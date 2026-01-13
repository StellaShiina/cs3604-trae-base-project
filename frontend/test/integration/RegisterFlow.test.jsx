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

  // Layer 2 & 3: 交互与验证
  it('validates username availability on blur', async () => {
    // Mock check-username response for existing user
    axios.get.mockResolvedValueOnce({ data: { available: false } });

    render(<MemoryRouter><RegisterPage /></MemoryRouter>);
    
    const usernameInput = screen.getByLabelText('用户名：');
    fireEvent.change(usernameInput, { target: { value: 'existing_user' } });
    fireEvent.blur(usernameInput);
    
    try {
      await waitFor(() => {
        expect(axios.get).toHaveBeenCalled();
        expect(screen.getByText('用户名已被占用')).toBeInTheDocument();
      });
    } catch (e) {
      console.error('Test Failed. Axios calls:', axios.get.mock.calls);
      throw e;
    }
  });

  it('renders phone area code selector', () => {
    render(<MemoryRouter><RegisterPage /></MemoryRouter>);
    expect(screen.getByRole('combobox', { name: /mobile-prefix/i })).toBeInTheDocument();
  });

  it('validates id number format', async () => {
    render(<MemoryRouter><RegisterPage /></MemoryRouter>);
    const idInput = screen.getByLabelText('证件号码：');
    fireEvent.change(idInput, { target: { value: '123' } });
    fireEvent.blur(idInput);
    await waitFor(() => {
      expect(screen.getByText('身份证号码格式错误')).toBeInTheDocument();
    });
    
    fireEvent.change(idInput, { target: { value: '110101199001018888' } }); // Valid ID
    fireEvent.blur(idInput);
    await waitFor(() => {
      expect(screen.queryByText('身份证号码格式错误')).not.toBeInTheDocument();
    });
  });

  it('validates phone number format', async () => {
    render(<MemoryRouter><RegisterPage /></MemoryRouter>);
    const phoneInput = screen.getByLabelText('手机号码：');
    fireEvent.change(phoneInput, { target: { value: '123' } });
    fireEvent.blur(phoneInput);
    await waitFor(() => {
      expect(screen.getByText('手机号码格式错误')).toBeInTheDocument();
    });

    fireEvent.change(phoneInput, { target: { value: '13800138000' } }); // Valid Phone
    fireEvent.blur(phoneInput);
    await waitFor(() => {
      expect(screen.queryByText('手机号码格式错误')).not.toBeInTheDocument();
    });
  });

  it('updates password strength indicator', async () => {
    render(<MemoryRouter><RegisterPage /></MemoryRouter>);
    const passwordInput = screen.getByLabelText('密码：');
    
    // Weak
    fireEvent.change(passwordInput, { target: { value: '123456' } });
    // Expect bar to be red or class to be strength-low (implementation detail)
    // The component has className={`password-strength strength-...`}
    // let's check class existence via container
    const strengthBar = passwordInput.parentElement.querySelector('.password-strength');
    expect(strengthBar).toHaveClass('strength-low');

    // Medium
    fireEvent.change(passwordInput, { target: { value: '123456a' } });
    expect(strengthBar).toHaveClass('strength-medium');

    // Strong
    fireEvent.change(passwordInput, { target: { value: '123456a@' } });
    expect(strengthBar).toHaveClass('strength-high');
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

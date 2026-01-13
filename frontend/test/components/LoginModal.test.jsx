import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import LoginModal from '../../src/components/LoginModal';

vi.mock('axios');

describe('LoginModal Component', () => {
  const mockOnClose = vi.fn();
  const mockOnLoginSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <BrowserRouter>
        <LoginModal isOpen={false} onClose={mockOnClose} onLoginSuccess={mockOnLoginSuccess} />
      </BrowserRouter>
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders login form when isOpen is true', () => {
    render(
      <BrowserRouter>
        <LoginModal isOpen={true} onClose={mockOnClose} onLoginSuccess={mockOnLoginSuccess} />
      </BrowserRouter>
    );
    expect(screen.getByText('用户登录')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('用户名/邮箱/手机号')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('密码')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(
      <BrowserRouter>
        <LoginModal isOpen={true} onClose={mockOnClose} onLoginSuccess={mockOnLoginSuccess} />
      </BrowserRouter>
    );
    fireEvent.click(screen.getByText('×'));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls onLoginSuccess with user data on successful login', async () => {
    const mockUser = { id: 1, username: 'testuser', token: 'token123' };
    axios.post.mockResolvedValueOnce({ data: { code: 200, data: mockUser } });

    render(
      <BrowserRouter>
        <LoginModal isOpen={true} onClose={mockOnClose} onLoginSuccess={mockOnLoginSuccess} />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('用户名/邮箱/手机号'), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByPlaceholderText('密码'), { target: { value: 'password' } });
    fireEvent.click(screen.getByText('立即登录'));

    await waitFor(() => {
      expect(mockOnLoginSuccess).toHaveBeenCalledWith(mockUser);
    });
  });

  it('displays error message on login failure', async () => {
    axios.post.mockRejectedValueOnce({ response: { data: { message: 'Invalid credentials' } } });

    render(
      <BrowserRouter>
        <LoginModal isOpen={true} onClose={mockOnClose} onLoginSuccess={mockOnLoginSuccess} />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('用户名/邮箱/手机号'), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByPlaceholderText('密码'), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByText('立即登录'));

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
    expect(mockOnLoginSuccess).not.toHaveBeenCalled();
  });
});

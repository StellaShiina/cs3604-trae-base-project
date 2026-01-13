import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import SearchPage from '../../src/pages/SearchPage';
import OrderPage from '../../src/pages/OrderPage';

// Mock axios
vi.mock('axios');

describe('Integration: Search to Order Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('shows login modal when unauthenticated user clicks Book', async () => {
    // Mock train search response
    const mockTrains = [
      {
        id: 'G1',
        trainNumber: 'G1',
        fromStation: 'Beijing',
        toStation: 'Shanghai',
        departureTime: '08:00',
        arrivalTime: '12:00',
        duration: '4h',
        price: { business: 1000, first: 500, second: 300 }
      }
    ];
    axios.get.mockResolvedValue({ data: { code: 200, data: mockTrains } });

    render(
      <MemoryRouter initialEntries={['/search?fromStation=Beijing&toStation=Shanghai&date=2023-10-01']}>
        <Routes>
          <Route path="/search" element={<SearchPage />} />
          <Route path="/order" element={<div>Mock Order Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    // Wait for trains to load
    await waitFor(() => {
      expect(screen.getByText('G1')).toBeInTheDocument();
    });

    // Click Book button
    const bookBtn = screen.getByText('预订');
    fireEvent.click(bookBtn);

    // Expect Login Modal to appear
    await waitFor(() => {
      expect(screen.getByText('用户登录')).toBeInTheDocument();
    });

    // Verify Order Page is NOT shown yet
    expect(screen.queryByText('Mock Order Page')).not.toBeInTheDocument();
  });

  it('navigates to order page after successful login in modal', async () => {
    // Mock train search response
    const mockTrains = [
      {
        id: 'G1',
        trainNumber: 'G1',
        fromStation: 'Beijing',
        toStation: 'Shanghai',
        departureTime: '08:00',
        arrivalTime: '12:00',
        duration: '4h',
        price: { business: 1000, first: 500, second: 300 }
      }
    ];
    axios.get.mockResolvedValueOnce({ data: { code: 200, data: mockTrains } });

    // Mock Login response
    axios.post.mockResolvedValueOnce({ 
      data: { 
        code: 200, 
        data: { id: 1, username: 'testuser', token: 'fake-token' } 
      } 
    });

    render(
      <MemoryRouter initialEntries={['/search?fromStation=Beijing&toStation=Shanghai&date=2023-10-01']}>
        <Routes>
          <Route path="/search" element={<SearchPage />} />
          <Route path="/order" element={<div>Mock Order Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    // Wait for trains to load
    await waitFor(() => {
      expect(screen.getByText('G1')).toBeInTheDocument();
    });

    // Click Book button
    fireEvent.click(screen.getByText('预订'));

    // Fill Login Form
    fireEvent.change(screen.getByPlaceholderText('用户名/邮箱/手机号'), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByPlaceholderText('密码'), { target: { value: 'password' } });
    
    // Click Login
    fireEvent.click(screen.getByText('立即登录'));

    // Expect to navigate to Order Page
    await waitFor(() => {
      expect(screen.getByText('Mock Order Page')).toBeInTheDocument();
    });
  });
});

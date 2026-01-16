
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import PersonalCenterPage from '../../src/pages/PersonalCenterPage';

// Mock axios
vi.mock('axios');

describe('Refund Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.confirm
    window.confirm = vi.fn(() => true);
    window.alert = vi.fn();
    
    // Default mocks
    axios.get.mockImplementation((url) => {
      if (url === '/api/users/me') {
        return Promise.resolve({ data: { code: 200, data: { username: 'testuser' } } });
      }
      if (url === '/api/passengers') {
        return Promise.resolve({ data: { code: 200, data: [] } });
      }
      if (url.includes('/api/orders')) {
        // Return empty by default
        return Promise.resolve({ data: { code: 200, data: [] } });
      }
      return Promise.resolve({ data: { code: 200 } });
    });
  });

  it('should show refund button for paid orders and handle refund', async () => {
    // Mock orders response for "paid" status
    const paidOrders = [
      {
        id: 123,
        train_number: 'G1',
        from_station_name: 'Beijing',
        to_station_name: 'Shanghai',
        departure_date: '2023-12-01',
        status: 'paid',
        created_at: '2023-11-01 10:00:00'
      }
    ];

    axios.get.mockImplementation((url) => {
        if (url.includes('status=paid')) {
            return Promise.resolve({ data: { code: 200, data: paidOrders } });
        }
        return Promise.resolve({ data: { code: 200, data: [] } });
    });

    axios.put.mockResolvedValue({ data: { code: 200, message: '退票成功' } });

    render(
      <BrowserRouter>
        <PersonalCenterPage />
      </BrowserRouter>
    );

    // 1. Switch to "Orders" tab
    const orderTab = screen.getByText('火车票订单');
    fireEvent.click(orderTab);

    // 2. Switch to "Unused Orders" (paid) tab
    const paidTab = screen.getByText('未出行订单');
    fireEvent.click(paidTab);

    // 3. Wait for orders to load
    await waitFor(() => {
      expect(screen.getByText('订单号: 123')).toBeInTheDocument();
    });

    // 4. Check for Refund button
    const refundBtn = screen.getByText('退票');
    expect(refundBtn).toBeInTheDocument();

    // 5. Click Refund
    fireEvent.click(refundBtn);

    // 6. Verify confirm was called
    expect(window.confirm).toHaveBeenCalledWith(expect.stringContaining('确定要退票吗'));

    // 7. Verify API call
    expect(axios.put).toHaveBeenCalledWith('/api/orders/123/status', { status: 'refunded' });

    // 8. Verify success alert (and list refresh call)
    await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith('退票成功');
    });
    
    // Verify fetchOrders called again (axios.get called)
    // 1. fetchUserInfo (initial load)
    // 2. fetchOrders (switch to orders tab, pending_payment)
    // 3. fetchOrders (switch to paid tab)
    // 4. fetchOrders (refresh after refund)
    expect(axios.get).toHaveBeenCalledTimes(4); 
  });
});

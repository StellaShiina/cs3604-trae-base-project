
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import axios from 'axios';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import OrderPage from '../../src/pages/OrderPage';

// Mock axios
vi.mock('axios');

const mocks = vi.hoisted(() => ({
  useLocation: vi.fn(),
  useNavigate: vi.fn(),
}));

// Mock useLocation to provide state
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useLocation: mocks.useLocation,
        useNavigate: () => mocks.useNavigate
    };
});

describe('Order Page Seat Selection', () => {
  const mockTrain = {
      id: 1,
      trainNumber: 'G1',
      fromStation: 'Beijing',
      toStation: 'Shanghai',
      departureTime: '08:00',
      arrivalTime: '12:00',
      duration: '4h',
      price: {
          business: 1500,
          first: 800,
          second: 500
      }
  };

  const mockPassengers = [
      { id: 101, name: 'Passenger A', id_type: '身份证', id_number: '123456' }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock Location
    mocks.useLocation.mockReturnValue({
        state: { train: mockTrain }
    });

    // Mock Axios
    axios.get.mockImplementation((url) => {
      if (url === '/api/passengers') {
        return Promise.resolve({ data: { code: 200, data: mockPassengers } });
      }
      return Promise.resolve({ data: { code: 200 } });
    });

    axios.post.mockResolvedValue({ data: { code: 201, data: { orderId: 999 } } });
  });

  it('should allow seat selection and submit correct price', async () => {
    render(
      <BrowserRouter>
        <OrderPage />
      </BrowserRouter>
    );

    // 1. Wait for passengers to load
    await waitFor(() => {
        expect(screen.getByText('Passenger A (身份证: 123456)')).toBeInTheDocument();
    });

    // 2. Select passenger
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    // 3. Verify dropdown appears with default seat (first key? object order is not guaranteed but usually business/first/second)
    // In our logic: getAvailableSeats pushes keys. 'business' was first.
    // Check if dropdown exists
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
    
    // Verify default value (should be 'business' as it is first in mockTrain.price keys order if iterated)
    // Actually JS object key order is insertion order for strings mostly.
    expect(select.value).toBe('business');

    // 4. Change seat to 'second'
    fireEvent.change(select, { target: { value: 'second' } });
    expect(select.value).toBe('second');

    // 5. Submit Order
    const submitBtn = screen.getByText('提交订单');
    fireEvent.click(submitBtn);

    // 6. Verify Payload
    await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith(
            '/api/orders',
            expect.objectContaining({
                passengers: [
                    expect.objectContaining({
                        passengerId: 101,
                        seatType: 'second',
                        price: 500
                    })
                ]
            }),
            expect.any(Object)
        );
    });
  });
});

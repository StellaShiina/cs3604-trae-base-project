import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import app from '../../../backend/src/index'; 
import db from '../../../backend/src/database/init_db';
import OrderPage from '../../src/pages/OrderPage';

let server;
let lastApiResponse = null;
let lastApiRequest = null;

describe('Full-Stack Integration: Order Flow', () => {
  beforeAll(async () => {
    server = await new Promise(resolve => {
      const s = app.listen(0, () => resolve(s));
    });
    const port = server.address().port;
    axios.defaults.baseURL = `http://localhost:${port}`;

    axios.interceptors.request.use((req) => {
        lastApiRequest = req;
        return req;
    });

    axios.interceptors.response.use((response) => {
      lastApiResponse = response.data;
      return response;
    });
  });

  afterAll((done) => server?.close(done));

  beforeEach(async () => {
    lastApiResponse = null;
    lastApiRequest = null;
    // We don't need to stub location for MemoryRouter, but if code uses window.location.assign for redirect, we might.
    // OrderPage uses useNavigate, so MemoryRouter handles it.
    
    // Seeding
    await new Promise(resolve => {
        db.serialize(() => {
            db.run('DELETE FROM users');
            db.run('DELETE FROM passengers');
            db.run('DELETE FROM orders');
            
            // Insert User
            db.run("INSERT INTO users (id, username, password) VALUES (1, 'testuser', 'password')");
            
            // Insert Passenger
            db.run(`INSERT INTO passengers (user_id, name, id_type, id_number, phone, type) 
                    VALUES (1, '测试乘客', '身份证', '110101199001011234', '13912345678', 'adult')`, () => resolve());
        });
    });
  });

  it('renders passenger list and submits order', async () => {
    render(
      <MemoryRouter initialEntries={[{ 
          pathname: '/order', 
          state: { 
              train: { 
                  id: 1, 
                  trainNumber: 'G1',
                  fromStation: '北京',
                  toStation: '上海',
                  departureTime: '08:00',
                  arrivalTime: '12:00',
                  duration: '4h'
              } 
          } 
      }]}>
        <Routes>
           <Route path="/order" element={<OrderPage />} />
           <Route path="/payment/:orderId" element={<div>Payment Page</div>} />
        </Routes>
      </MemoryRouter>
    );
    
    // 1. Verify Passenger List Load
    await waitFor(() => {
        expect(screen.getByText(/测试乘客/)).toBeInTheDocument();
    });

    // 2. Select Passenger
    const checkbox = screen.getByRole('checkbox'); // Assuming checkbox for selection
    fireEvent.click(checkbox);

    // 3. Submit Order
    fireEvent.click(screen.getByText('提交订单'));

    // 4. Verify API Call and Redirect
    await waitFor(() => {
        expect(lastApiRequest).not.toBeNull();
        expect(lastApiRequest.url).toContain('/api/orders');
        expect(lastApiRequest.method).toBe('post');
        
        let requestData = lastApiRequest.data;
        if (typeof requestData === 'string') {
            requestData = JSON.parse(requestData);
        }
        expect(requestData.passengers).toHaveLength(1);
        
        // Check for redirect (Payment Page rendered)
        expect(screen.getByText('Payment Page')).toBeInTheDocument();
    });
  });
});

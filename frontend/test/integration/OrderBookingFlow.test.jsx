import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import app from '../../../backend/src/index'; 
import db from '../../../backend/src/database/init_db'; 
import OrderFormPage from '../../src/pages/OrderFormPage';

let server;
let lastApiResponse = null; 

describe('Order Booking Flow Integration', () => {

  beforeAll(async () => {
    server = await new Promise(resolve => {
      const s = app.listen(0, () => resolve(s));
    });
    const port = server.address().port;
    
    axios.defaults.baseURL = `http://localhost:${port}`;
    
    axios.interceptors.response.use((response) => {
      lastApiResponse = response.data; 
      return response; 
    });
  });

  afterAll((done) => server?.close(done));

  beforeEach(async () => {
    lastApiResponse = null;
    vi.stubGlobal('location', { href: 'http://localhost/', assign: vi.fn() });
    
    // Seed Data
    await new Promise((resolve) => {
        db.serialize(() => {
            db.run('DELETE FROM users');
            db.run('DELETE FROM passengers');
            // Seed user
            db.run(`INSERT INTO users (username, password, phone, id_number, passenger_type) VALUES ('test_user', 'pass123', '13800138000', '110101199001011234', '成人')`, function(err) {
                 const userId = this.lastID;
                 // Seed passenger
                 db.run(`INSERT INTO passengers (user_id, name, id_type, id_number, type) VALUES (?, 'Test Passenger', '身份证', '110101199001011234', '成人')`, [userId], () => {
                     resolve();
                 });
            });
        });
    });

    // Mock Auth (We can bypass login UI by mocking localStorage or setting axios header if app uses it, 
    // but integration tests usually test real flow. 
    // However, to skip login flow for this specific page test, we can mock the "logged in" state if the component checks it.
    // Or we can just log in first.
    // For simplicity, let's log in programmatically.)
    const loginRes = await axios.post('/api/auth/login', {
        username: 'test_user',
        password: 'pass123',
        idLast4: '1234',
        smsCode: '123456'
    });
    axios.defaults.headers.common['Authorization'] = `Bearer ${loginRes.data.data.token}`;
    lastApiResponse = null; // Reset after login
  });

  it('REQ-4-2:SCE-0 Book Ticket', async () => {
    render(
      <MemoryRouter initialEntries={['/order/create/1']}>
        <Routes>
            <Route path="/order/create/:trainId" element={<OrderFormPage />} />
        </Routes>
      </MemoryRouter>
    );

    // 1. Verify Train Info Loading
    // Wait for train info (G1 is seeded in init_db, ID 1)
    await waitFor(() => {
        expect(screen.getByText(/G1/)).toBeInTheDocument();
    });

    // 2. Select Passenger
    // Wait for passenger list
    await waitFor(() => {
        expect(screen.getByText(/Test Passenger/)).toBeInTheDocument();
    });
    
    // Click checkbox to select passenger
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    // 3. Submit Order
    const submitBtn = screen.getByText('提交订单');
    fireEvent.click(submitBtn);

    // 4. Verify Order Created
    await waitFor(() => {
        expect(lastApiResponse).not.toBeNull();
        expect(lastApiResponse.code).toBe(201);
        expect(lastApiResponse.message).toBe('Order created successfully');
    });
  });
});

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import app from '../../../backend/src/index'; 
import db from '../../../backend/src/database/init_db';
import PersonalCenterPage from '../../src/pages/PersonalCenterPage';

let server;
let lastApiResponse = null;

describe('Order Payment Flow Integration', () => {

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

    // Mock window.alert
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  afterAll((done) => server?.close(done));

  beforeEach(async () => {
    lastApiResponse = null;
    
    // Seed DB
    await new Promise(resolve => {
        db.serialize(() => {
            db.run('DELETE FROM users');
            db.run('DELETE FROM orders');
            // Insert user
            db.run(`INSERT INTO users (username, password, phone, id_number, passenger_type) VALUES ('test_user', 'pass123', '13800138000', '110101199001011234', '成人')`, function() {
                const userId = this.lastID;
                // Insert pending order
                 db.run(`INSERT INTO orders (user_id, train_id, from_station_id, to_station_id, departure_date, status, created_at) VALUES (?, 1, 1, 2, '2023-10-01', 'pending_payment', datetime('now'))`, [userId], function() {
                    resolve();
                 });
            });
        });
    });

    // Login
    const loginRes = await axios.post('/api/auth/login', {
        username: 'test_user',
        password: 'pass123',
        idLast4: '1234',
        smsCode: '123456'
    });
    axios.defaults.headers.common['Authorization'] = `Bearer ${loginRes.data.data.token}`;
  });

  it('REQ-4-4:SCE-0 Pay Order Flow', async () => {
    render(
        <BrowserRouter>
            <PersonalCenterPage />
        </BrowserRouter>
    );

    // 1. Navigate to Order Tab
    const orderLink = screen.getByText('火车票订单');
    fireEvent.click(orderLink);

    // 2. Wait for order to appear
    await waitFor(() => {
        expect(screen.getByText(/2023-10-01/)).toBeInTheDocument();
        expect(screen.getByText('支付')).toBeInTheDocument();
    });

    // 3. Click Pay
    const payBtn = screen.getByText('支付');
    fireEvent.click(payBtn);

    // 4. Verify API called
    await waitFor(() => {
        expect(lastApiResponse).not.toBeNull();
        expect(lastApiResponse.message).toMatch(/updated/i); 
        expect(lastApiResponse.data.status).toBe('paid');
    });

    // 5. Verify UI Update
    // It should switch to 'paid' tab or refresh current tab (where it disappears)
    // If we assume it stays on current tab, the order should disappear.
    await waitFor(() => {
        expect(screen.queryByText('支付')).not.toBeInTheDocument();
    });
    
    // Optional: Switch to Paid tab and verify
    const paidTab = screen.getByText('未出行订单');
    fireEvent.click(paidTab);
    await waitFor(() => {
         expect(screen.getByText(/2023-10-01/)).toBeInTheDocument();
         expect(screen.getByText('改签')).toBeInTheDocument(); // Paid orders show '改签'
    });
  });
});

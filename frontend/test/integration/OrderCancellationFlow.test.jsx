import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import app from '../../../backend/src/index'; 
import db from '../../../backend/src/database/init_db';
import PersonalCenterPage from '../../src/pages/PersonalCenterPage';

let server;
let lastApiResponse = null;

describe('Order Cancellation Flow Integration', () => {

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

    // Mock window.confirm
    vi.spyOn(window, 'confirm').mockImplementation(() => true);
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
                // Insert order
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

  it('REQ-4-3:SCE-0 Cancel Order Flow', async () => {
    render(
        <BrowserRouter>
            <PersonalCenterPage />
        </BrowserRouter>
    );

    // 1. Navigate to Order Tab (Clicking '火车票订单' in sidebar)
    const orderLink = screen.getByText('火车票订单');
    fireEvent.click(orderLink);

    // 2. Wait for order to appear in "Unfinished" tab (default)
    // Note: The page might use status='0' by default which mismatches 'pending_payment'.
    // We expect this to fail initially or we need to fix the page to match.
    // Assuming we will fix the page to map tab 0 to 'pending_payment'.
    
    // Wait for the order item
    await waitFor(() => {
        expect(screen.getByText(/2023-10-01/)).toBeInTheDocument();
        expect(screen.getByText('取消')).toBeInTheDocument();
    });

    // 3. Click Cancel
    const cancelBtn = screen.getByText('取消');
    fireEvent.click(cancelBtn);

    // 4. Verify API called
    await waitFor(() => {
        expect(lastApiResponse).not.toBeNull();
        expect(lastApiResponse.message).toMatch(/updated/i); // "Order status updated"
    });

    // 5. Verify UI Update (Order should disappear from Unfinished tab or change status)
    // If it disappears, queryByText should be null.
    // If we refresh logic is implemented.
    await waitFor(() => {
        // Should be empty or different status
        // Since we are still on "Unfinished" tab, and status is now 'cancelled', it should disappear.
        expect(screen.queryByText('取消')).not.toBeInTheDocument();
    });
  });
});

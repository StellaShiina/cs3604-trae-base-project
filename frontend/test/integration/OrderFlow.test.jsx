
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import App from '../../src/App';
import app from '../../../backend/src/index';
import db from '../../../backend/src/database/init_db';

let server;
let lastApiResponse = null;

describe('Order Flow Integration', () => {
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
    await new Promise(resolve => db.run('DELETE FROM orders', resolve));
    await new Promise(resolve => db.run('DELETE FROM users', resolve));
    
    // Create User & Login Mock
    await new Promise(resolve => {
      db.run(`INSERT INTO users (username, password, real_name, id_type, id_number, phone, passenger_type) 
              VALUES ('testuser', 'password123', 'Test User', 'ID_CARD', '111111111111111111', '13800138000', 'ADULT')`, 
              function() {
        // Create Order
        const userId = this.lastID;
        db.run(`INSERT INTO orders (user_id, train_id, from_station_id, to_station_id, departure_date, status, created_at)
                VALUES (?, 1, 1, 2, '2023-10-01', 'pending_payment', datetime('now'))`, [userId], resolve);
      });
    });

    // Mock Authorization Header for axios
    // Login
    const loginRes = await axios.post('/api/auth/login', {
      username: 'testuser',
      password: 'password123',
      idLast4: '1111',
      smsCode: '123456'
    });
    axios.defaults.headers.common['Authorization'] = `Bearer ${loginRes.data.data.token}`;
  });

  it('REQ-4-1:SCE-0 View Order List', async () => {
    render(
      <MemoryRouter initialEntries={['/center']}>
        <App />
      </MemoryRouter>
    );

    // 1. Verify Sidebar "Order Center" exists (We need to add this)
    // We expect "火车票订单" (Train Ticket Orders) under "订单中心" (Order Center)
    // Or just "火车票订单" in the menu.
    // Let's assume we click "火车票订单".
    
    // Check if the text exists (it won't initially, so this test will fail, driving implementation)
    // Use findByText to wait if needed, but getByText is fine if it should be there.
    
    // Since we are modifying PersonalCenterPage, let's verify we can navigate to orders.
    // Note: The requirement says "Click left sidebar 'Order Center' - 'Train Ticket Orders'".
    
    // We will simulate clicking the menu item.
    // If "订单中心" is a section header, we look for the item "火车票订单".
    
    // Wait for sidebar to render? It renders immediately.
    
    // EXPECTATION: Sidebar has "火车票订单"
    const orderLink = screen.getByText('火车票订单'); 
    fireEvent.click(orderLink);

    // 2. Verify Order List is fetched and UI displays the order
    await waitFor(() => {
        // Verify UI displays the order details
        expect(screen.getByText(/2023-10-01/)).toBeInTheDocument();
        expect(screen.getByText(/未支付/)).toBeInTheDocument(); 
        expect(screen.getByText(/G1/)).toBeInTheDocument();
        expect(screen.getByText(/北京南.*上海虹桥/)).toBeInTheDocument();
    });
  });
});

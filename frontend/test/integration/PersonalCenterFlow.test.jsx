
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import App from '../../src/App';

// [IMPORTS] - Backend for integration testing context
import app from '../../../backend/src/index'; 
import db from '../../../backend/src/database/init_db'; 

// [GLOBALS]
let server;

describe('REQ-3: Personal Center Infrastructure', () => {

  // ================= 1. Lifecycle: Server & Network Spy =================
  beforeAll(async () => {
    // Start backend server
    server = await new Promise(resolve => {
      const s = app.listen(0, () => resolve(s));
    });
    const port = server.address().port;
    axios.defaults.baseURL = `http://localhost:${port}`;
  });

  afterAll((done) => server?.close(done));

  beforeEach(async () => {
    // Seed user for testing
    const sql = `INSERT OR REPLACE INTO users (id, username, password, real_name, id_number, phone, email, passenger_type) 
                 VALUES (1, 'testuser', 'password123', 'Test User', '123456789012345678', '13800138000', 'test@example.com', 'ADULT')`;
    await new Promise((resolve, reject) => {
        db.run(sql, [], (err) => {
            if (err) reject(err);
            else resolve();
        });
    });

    // Mock logged in state via headers
    axios.defaults.headers.common['Authorization'] = 'Bearer mock-jwt-token-1';
  });

  // ================= 2. Test Cases =================
  
  it('REQ-3:SCE-0 Navigate to Personal Center from Header', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );
    const myLink = screen.getByText(/我的12306/i);
    fireEvent.click(myLink);
    await waitFor(() => {
        expect(screen.getByText('个人中心', { selector: '.sidebar-title' })).toBeInTheDocument();
    });
  });

  it('REQ-3-1:SCE-0 View Personal Info', async () => {
    render(
      <MemoryRouter initialEntries={['/center']}>
        <App />
      </MemoryRouter>
    );

    // 1. Click "个人信息" sidebar item
    const infoTab = screen.getByText('个人信息');
    fireEvent.click(infoTab);

    // 2. Verify Data Loaded
    await waitFor(() => {
        expect(screen.getByText(/Test User/)).toBeInTheDocument();
        expect(screen.getByText(/test@example.com/)).toBeInTheDocument();
        expect(screen.getByText(/13800138000/)).toBeInTheDocument();
    });
  });

  it('REQ-3-2:SCE-0 List Passengers', async () => {
    render(
      <MemoryRouter initialEntries={['/center']}>
        <App />
      </MemoryRouter>
    );

    // 1. Click "乘车人" sidebar item
    const passengersTab = screen.getByText('乘车人');
    fireEvent.click(passengersTab);

    // 2. Verify List Loaded
    await waitFor(() => {
        expect(screen.getByText('Passenger A')).toBeInTheDocument();
        expect(screen.getByText('Passenger B')).toBeInTheDocument();
        expect(screen.getByText('111111111111111111')).toBeInTheDocument();
    });
  });

});


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
    // Mock window.location if needed, but MemoryRouter handles routing
    // vi.stubGlobal('location', { href: 'http://localhost/', assign: vi.fn() });
  });

  // ================= 2. Test Cases =================
  
  it('REQ-3:SCE-0 Navigate to Personal Center from Header', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    // 1. Find "我的12306" link in Header
    const myLink = screen.getByText(/我的12306/i);
    expect(myLink).toBeInTheDocument();

    // 2. Click it
    fireEvent.click(myLink);

    // 3. Verify Component Render
    await waitFor(() => {
        expect(screen.getByText('个人中心', { selector: '.sidebar-title' })).toBeInTheDocument();
        expect(screen.getByText('个人信息', { selector: '.menu-item' })).toBeInTheDocument();
        expect(screen.getByText('乘车人', { selector: '.menu-item' })).toBeInTheDocument();
    });
  });

});

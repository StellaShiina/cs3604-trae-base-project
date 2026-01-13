
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
    // Seed user and passengers for testing
    await new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run("DELETE FROM passengers");
            db.run(`INSERT OR REPLACE INTO users (id, username, password, real_name, id_number, phone, email, passenger_type) 
                    VALUES (1, 'testuser', 'password123', 'Test User', '123456789012345678', '13800138000', 'test@example.com', 'ADULT')`);
            db.run(`INSERT INTO passengers (user_id, name, id_type, id_number, phone, type) 
                    VALUES (1, 'Passenger A', 'ID_CARD', '111111111111111111', '13900139000', 'ADULT')`);
            db.run(`INSERT INTO passengers (user_id, name, id_type, id_number, phone, type) 
                    VALUES (1, 'Passenger B', 'ID_CARD', '222222222222222222', '13900139001', 'CHILD')`, (err) => {
                if (err) reject(err);
                else resolve();
            });
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

  it('REQ-3-2-1:SCE-0 Add Passenger', async () => {
    render(
      <MemoryRouter initialEntries={['/center']}>
        <App />
      </MemoryRouter>
    );

    // 1. Click "乘车人" sidebar item
    fireEvent.click(screen.getByText('乘车人'));

    // 2. Click "Add" button
    await waitFor(() => {
        expect(screen.getByText('添加')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('添加'));

    // 3. Fill form
    fireEvent.change(screen.getByLabelText(/姓名/i), { target: { value: 'New Passenger' } });
    fireEvent.change(screen.getByLabelText(/证件号码/i), { target: { value: '999999999999999999' } });
    fireEvent.change(screen.getByLabelText(/手机号/i), { target: { value: '13900139999' } });
    // Assuming defaults for Type (ADULT) and ID Type (ID_CARD) or explicit selection
    // fireEvent.change(screen.getByLabelText(/旅客类型/i), { target: { value: 'ADULT' } });

    // 4. Click "Save"
    fireEvent.click(screen.getByText('保存'));

    // 5. Verify New Passenger appears
    await waitFor(() => {
        expect(screen.getByText('New Passenger')).toBeInTheDocument();
        expect(screen.getByText('999999999999999999')).toBeInTheDocument();
    });
  });

  it('REQ-3-2-2:SCE-0 Delete Passenger', async () => {
    render(
      <MemoryRouter initialEntries={['/center']}>
        <App />
      </MemoryRouter>
    );

    // 1. Click "乘车人" sidebar item
    fireEvent.click(screen.getByText('乘车人'));

    // 2. Wait for list
    await waitFor(() => {
        expect(screen.getByText('Passenger A')).toBeInTheDocument();
    });

    // 3. Mock window.confirm
    const confirmSpy = vi.spyOn(window, 'confirm').mockImplementation(() => true);

    // 4. Click "Delete" button for Passenger A
    // Finding the specific delete button might be tricky if not labelled uniquely.
    // Assuming the button is within the same list item.
    // Let's find the list item first.
    const passengerAItem = screen.getByText('Passenger A').closest('li');
    const deleteBtn = passengerAItem.querySelector('button.btn-delete') || screen.getAllByText('删除')[0];
    
    // Fallback if structure is simple
    fireEvent.click(deleteBtn);

    // 5. Verify Confirm called
    expect(confirmSpy).toHaveBeenCalled();

    // 6. Verify Passenger A gone
    await waitFor(() => {
        expect(screen.queryByText('Passenger A')).not.toBeInTheDocument();
    });
    
    confirmSpy.mockRestore();
  });

});

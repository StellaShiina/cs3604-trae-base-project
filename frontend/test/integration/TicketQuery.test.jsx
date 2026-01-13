import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import App from '../../src/App';
import app from '../../../backend/src/index';

let server;

describe('Full-Stack Integration: Ticket Query Flow', () => {
  beforeAll(async () => {
    server = await new Promise(resolve => {
      const s = app.listen(0, () => resolve(s));
    });
    const port = server.address().port;
    axios.defaults.baseURL = `http://localhost:${port}`;
  });

  afterAll((done) => server?.close(done));

  beforeEach(() => {
    vi.stubGlobal('scrollTo', vi.fn());
  });

  it('navigates from home to search page with params', async () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    // 1. Verify Homepage Elements
    // TicketSearchForm uses labels "出发地" and "到达地" but inputs have placeholder "简拼/全拼/汉字"
    // Since there are two inputs with same placeholder, we should select by label or specific container
    const inputs = screen.getAllByPlaceholderText('简拼/全拼/汉字');
    const fromInput = inputs[0];
    const toInput = inputs[1];
    const submitBtn = screen.getByRole('button', { name: /查询/i });

    // 2. Interact
    fireEvent.change(fromInput, { target: { value: '北京' } });
    fireEvent.change(toInput, { target: { value: '上海' } });
    fireEvent.click(submitBtn);

    // 3. Verify Navigation (SearchPage should render)
    await waitFor(() => {
        expect(window.location.search).toContain('fromStation=%E5%8C%97%E4%BA%AC');
        expect(screen.getByText('车次类型：全部')).toBeInTheDocument(); // Element in SearchPage
    });
  });

  it('shows dropdown menu on hover', async () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    const ticketMenu = screen.getByText('车票 ▼');
    fireEvent.mouseEnter(ticketMenu);

    await waitFor(() => {
      expect(screen.getByText('购买')).toBeInTheDocument();
      expect(screen.getByText('单程')).toBeInTheDocument();
    });
  });
});

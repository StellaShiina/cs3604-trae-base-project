
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import SearchPage from '../../src/pages/SearchPage';

// Mock axios
vi.mock('axios');

describe('Search Page City Selector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mocks
    axios.get.mockImplementation((url) => {
      if (url === '/api/tickets/stations') {
        return Promise.resolve({
          data: {
            code: 200,
            data: [
              { id: 1, name: '北京南', code: 'VNP', city: '北京' },
              { id: 2, name: '上海虹桥', code: 'AOH', city: '上海' }
            ]
          }
        });
      }
      if (url.includes('/api/tickets/query')) {
        return Promise.resolve({ data: { code: 200, data: [] } });
      }
      return Promise.resolve({ data: { code: 200 } });
    });
  });

  it('should display city selector and allow selection', async () => {
    render(
      <BrowserRouter>
        <SearchPage />
      </BrowserRouter>
    );

    // 1. Find inputs (placeholder text is used)
    const fromInput = screen.getByPlaceholderText('出发地');
    const toInput = screen.getByPlaceholderText('到达地');

    // 2. Click "From" input to open dropdown
    fireEvent.focus(fromInput);

    // 3. Wait for dropdown content (stations fetch)
    await waitFor(() => {
      expect(screen.getByText('北京')).toBeInTheDocument(); // Group title
      expect(screen.getByText('北京南')).toBeInTheDocument(); // Station
    });

    // 4. Select "Beijing Nan"
    const beijingOption = screen.getByText('北京南');
    fireEvent.click(beijingOption);

    // 5. Verify input value updated
    expect(fromInput.value).toBe('北京南');

    // 6. Verify dropdown closed
    // Note: queryByText returns null if not found
    expect(screen.queryByText('上海')).not.toBeInTheDocument(); 

    // 7. Test "To" input interaction
    fireEvent.focus(toInput);
    await waitFor(() => {
        expect(screen.getByText('上海')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('上海虹桥'));
    expect(toInput.value).toBe('上海虹桥');
  });
});

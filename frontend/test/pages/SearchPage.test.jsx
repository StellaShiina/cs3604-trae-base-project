import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import SearchPage from '../../src/pages/SearchPage';

describe('SearchPage Unit Test', () => {
  it('renders Header and Search Inputs', () => {
    render(
      <BrowserRouter>
        <SearchPage />
      </BrowserRouter>
    );
    expect(screen.getByText('中国铁路12306')).toBeInTheDocument(); // Header
    expect(screen.getByRole('button', { name: /查询/i })).toBeInTheDocument(); // Search Bar Button
    expect(screen.getByText('车次类型：全部')).toBeInTheDocument(); // Filter panel
  });
});

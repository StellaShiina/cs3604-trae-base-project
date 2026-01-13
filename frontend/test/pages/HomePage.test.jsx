import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import HomePage from '../../src/pages/HomePage';

describe('HomePage Unit Test', () => {
  it('renders Header, Banner and SearchForm', () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );
    expect(screen.getByText('中国铁路12306')).toBeInTheDocument(); // Header
    expect(screen.getByRole('button', { name: /查询/i })).toBeInTheDocument(); // SearchForm
  });
});

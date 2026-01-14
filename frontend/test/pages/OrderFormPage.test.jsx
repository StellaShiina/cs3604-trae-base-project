import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import OrderFormPage from '../../src/pages/OrderFormPage';

// Mock Header and Footer
vi.mock('../../src/components/Header', () => ({ default: () => <div data-testid="header">Header</div> }));
vi.mock('../../src/components/Footer', () => ({ default: () => <div data-testid="footer">Footer</div> }));

describe('OrderFormPage Unit Test', () => {
  it('renders order form structure', () => {
    render(
      <MemoryRouter>
        <OrderFormPage />
      </MemoryRouter>
    );

    expect(screen.getByText('订单填写')).toBeInTheDocument();
    expect(screen.getByText('选择乘车人')).toBeInTheDocument();
    expect(screen.getByText('提交订单')).toBeInTheDocument();
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });
});

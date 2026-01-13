import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import PersonalCenterPage from '../../src/pages/PersonalCenterPage';

// Mock child components
vi.mock('../../src/components/Header', () => ({ default: () => <div data-testid="header">Header</div> }));
vi.mock('../../src/components/Footer', () => ({ default: () => <div data-testid="footer">Footer</div> }));
vi.mock('../../src/components/PassengerForm', () => ({ default: () => <div data-testid="passenger-form">PassengerForm</div> }));

describe('PersonalCenterPage Unit Test', () => {
  it('renders sidebar and default content', () => {
    render(
      <MemoryRouter>
        <PersonalCenterPage />
      </MemoryRouter>
    );

    expect(screen.getByText('个人中心')).toBeInTheDocument();
    expect(screen.getByText('订单中心')).toBeInTheDocument();
    expect(screen.getByText('个人信息')).toBeInTheDocument();
    expect(screen.getByText('乘车人')).toBeInTheDocument();
    expect(screen.getByText('火车票订单')).toBeInTheDocument();
  });
});

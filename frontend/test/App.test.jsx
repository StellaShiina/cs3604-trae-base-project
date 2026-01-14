import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import App from '../src/App';

describe('App Routing', () => {
  it('renders HomePage on default route', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    expect(screen.getByText('12306 CHINA RAILWAY')).toBeInTheDocument();
  });
});
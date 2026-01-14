import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import HomePage from '../../src/pages/HomePage';

// Mock the database initialization to avoid sqlite3 binary issues during frontend tests
vi.mock('../../../backend/src/database/init_db', () => {
  return {};
});

// Import backend app for integration testing
import app from '../../../backend/src/index';

let server;

describe('Full-Stack Integration: <HomePage />', () => {

  beforeAll(async () => {
    server = await new Promise(resolve => {
      const s = app.listen(0, () => resolve(s));
    });
    const port = server.address().port;
    axios.defaults.baseURL = `http://localhost:${port}`;
  });

  afterAll((done) => {
    if (server) {
      server.close(done);
    } else {
      done();
    }
  });

  beforeEach(() => {
    vi.stubGlobal('location', { href: 'http://localhost/', assign: vi.fn() });
  });

  it('renders homepage structure', () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    // Verify Header
    expect(screen.getByText('12306 CHINA RAILWAY')).toBeInTheDocument();
    expect(screen.getByText('登录')).toBeInTheDocument();
    expect(screen.getByText('注册')).toBeInTheDocument();

    // Verify Navigation (Check a few items)
    expect(screen.getByText('首页')).toBeInTheDocument();
    expect(screen.getByText(/车票/)).toBeInTheDocument();

    // Verify Banner
    // expect(screen.getByText('欢迎使用12306购票系统')).toBeInTheDocument();

    // Verify Search Placeholder
    expect(screen.getByText('查询')).toBeInTheDocument();

    // Verify Footer
    expect(screen.getByText(/© 2026 12306 Demo/)).toBeInTheDocument();
  });
});

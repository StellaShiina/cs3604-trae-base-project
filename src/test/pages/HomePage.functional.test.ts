import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/vue';
import HomePage from '@/views/HomePage.vue';
import { renderWithPlugins } from '../utils';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

// Mock router
vi.mock('vue-router', async () => {
  const actual = await vi.importActual('vue-router');
  return {
    ...actual,
    useRouter: vi.fn(() => ({
      push: vi.fn()
    }))
  };
});

// Mock auth store
vi.mock('@/stores/auth', () => ({
  useAuthStore: vi.fn()
}));

describe('HomePage Functional Tests', () => {
  const mockPush = vi.fn();
  const mockClearToken = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue({
      push: mockPush
    });
    // Default: not logged in
    (useAuthStore as any).mockReturnValue({
      token: null,
      clearToken: mockClearToken
    });
  });

  it('should navigate to trains page when clicking search button', async () => {
    renderWithPlugins(HomePage);
    
    const searchBtn = screen.getByRole('button', { name: /查询车票/ });
    await fireEvent.click(searchBtn);
    
    expect(mockPush).toHaveBeenCalledWith('/trains');
  });

  it('should show user info and logout link when logged in', async () => {
    (useAuthStore as any).mockReturnValue({
      token: 'mock-token',
      clearToken: mockClearToken
    });

    renderWithPlugins(HomePage);
    
    expect(screen.getByText('欢迎您')).toBeInTheDocument();
    const logoutLink = screen.getByText('退出');
    expect(logoutLink).toBeInTheDocument();
    
    await fireEvent.click(logoutLink);
    expect(mockClearToken).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith('/login');
  });
});

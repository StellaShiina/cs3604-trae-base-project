import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/vue';
import TopNavigation from '@/components/TopNavigation.vue';
import { renderWithPlugins } from '../utils';
import { useAuthStore } from '@/stores/auth';
import { useRouter, useRoute } from 'vue-router';

// Mock auth store
vi.mock('@/stores/auth', () => ({
  useAuthStore: vi.fn()
}));

// Mock router
vi.mock('vue-router', async () => {
  const actual = await vi.importActual('vue-router');
  return {
    ...actual,
    useRouter: vi.fn(() => ({
      push: vi.fn()
    })),
    useRoute: vi.fn(() => ({
      path: '/'
    }))
  };
});

describe('TopNavigation Component Tests', () => {
  const mockPush = vi.fn();
  const mockClearToken = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue({
      push: mockPush
    });
    (useRoute as any).mockReturnValue({
      path: '/'
    });
  });

  it('should render Logo', () => {
    (useAuthStore as any).mockReturnValue({ token: null });
    renderWithPlugins(TopNavigation);
    expect(screen.getByAltText('12306')).toBeInTheDocument();
    expect(screen.getByText('中国铁路12306')).toBeInTheDocument();
  });

  it('should render Login and Register links when not logged in', () => {
    (useAuthStore as any).mockReturnValue({ token: null });
    renderWithPlugins(TopNavigation);
    expect(screen.getByRole('link', { name: /登录/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /注册/ })).toBeInTheDocument();
    expect(screen.queryByText('欢迎您')).not.toBeInTheDocument();
  });

  it('should render User Info and Logout when logged in', async () => {
    (useAuthStore as any).mockReturnValue({
      token: 'mock-token',
      clearToken: mockClearToken
    });
    renderWithPlugins(TopNavigation);
    
    expect(screen.getByText('欢迎您')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /登录/ })).not.toBeInTheDocument();
    
    const logoutLink = screen.getByText('退出');
    await fireEvent.click(logoutLink);
    expect(mockClearToken).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith('/login');
  });

  it('should highlight active link', () => {
    (useRoute as any).mockReturnValue({ path: '/trains' });
    (useAuthStore as any).mockReturnValue({ token: null });
    
    renderWithPlugins(TopNavigation);
    
    const trainsLink = screen.getByRole('link', { name: /车票/ });
    expect(trainsLink.classList.contains('active')).toBe(true);
  });
});

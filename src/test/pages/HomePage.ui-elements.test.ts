import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen } from '@testing-library/vue';
import HomePage from '@/views/HomePage.vue';
import { renderWithPlugins } from '../utils';

describe('HomePage UI Elements Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Top Navigation Check', () => {
    it('should render Logo', () => {
      renderWithPlugins(HomePage);
      const logoImage = screen.getByAltText('12306');
      expect(logoImage).toBeInTheDocument();
      expect(screen.getByText('中国铁路12306')).toBeInTheDocument();
    });

    it('should render Login and Register links when not logged in', () => {
      renderWithPlugins(HomePage);
      // In Vue Router, router-link renders as 'a' tag by default
      const loginLink = screen.getByRole('link', { name: /登录/ });
      const registerLink = screen.getByRole('link', { name: /注册/ });
      
      expect(loginLink).toBeInTheDocument();
      expect(registerLink).toBeInTheDocument();
    });
    
    it('should render navigation links', () => {
        renderWithPlugins(HomePage);
        expect(screen.getByRole('link', { name: /首页/ })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /车票/ })).toBeInTheDocument();
    });
  });

  describe('Banner Section Check', () => {
    it('should render banner and search button', () => {
      renderWithPlugins(HomePage);
      expect(screen.getByText('车票查询')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /查询车票/ })).toBeInTheDocument();
    });
  });
});

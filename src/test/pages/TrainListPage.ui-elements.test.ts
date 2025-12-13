import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen } from '@testing-library/vue';
import TrainListPage from '@/views/TrainListPage.vue';
import { renderWithPlugins } from '../utils';

// Mock services
vi.mock('@/services/trainService', () => ({
  searchTrains: vi.fn().mockResolvedValue({
    success: true,
    trains: [],
    error: undefined
  })
}));

describe('TrainListPage UI Elements Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Page Structure Check', () => {
    it('should render main page sections', () => {
      const { container } = renderWithPlugins(TrainListPage);
      
      // 1. Top Navigation
      const topNav = container.querySelector('.top-nav');
      expect(topNav).toBeInTheDocument();
      
      // 2. Search Bar
      const searchBar = container.querySelector('.train-search-bar');
      expect(searchBar).toBeInTheDocument();
      
      // 3. Filter Panel
      const filterPanel = container.querySelector('.train-filter');
      expect(filterPanel).toBeInTheDocument();
      
      // 4. Train List
      const trainList = container.querySelector('.train-list');
      expect(trainList).toBeInTheDocument();
    });
  });

  describe('Search Bar Elements Check', () => {
    it('should render search inputs and button', () => {
      renderWithPlugins(TrainListPage);
      
      expect(screen.getByText('出发地')).toBeInTheDocument();
      expect(screen.getByText('到达地')).toBeInTheDocument();
      expect(screen.getByText('出发日期')).toBeInTheDocument();
      
      const searchBtn = screen.getByRole('button', { name: /查询/ });
      expect(searchBtn).toBeInTheDocument();
    });
  });

  describe('Filter Panel Elements Check', () => {
    it('should render filter checkboxes', () => {
      renderWithPlugins(TrainListPage);
      
      expect(screen.getByText('车次类型：')).toBeInTheDocument();
      expect(screen.getByText(/GC-高铁\/城际/)).toBeInTheDocument();
      expect(screen.getByText(/D-动车/)).toBeInTheDocument();
      expect(screen.getByText(/Z-直达/)).toBeInTheDocument();
      expect(screen.getByText(/T-特快/)).toBeInTheDocument();
      expect(screen.getByText(/K-快速/)).toBeInTheDocument();
    });
  });

  describe('Train List Elements Check', () => {
    it('should render table headers', () => {
      renderWithPlugins(TrainListPage);
      
      expect(screen.getByText('车次')).toBeInTheDocument();
      expect(screen.getByText(/出发站/)).toBeInTheDocument();
      expect(screen.getByText(/到达站/)).toBeInTheDocument();
      expect(screen.getByText(/出发时间/)).toBeInTheDocument();
      expect(screen.getByText(/到达时间/)).toBeInTheDocument();
      expect(screen.getByText('历时')).toBeInTheDocument();
      expect(screen.getByText('备注')).toBeInTheDocument();
      
      // Seat types
      expect(screen.getByText('商务座')).toBeInTheDocument();
      expect(screen.getByText('一等座')).toBeInTheDocument();
      expect(screen.getByText('二等座')).toBeInTheDocument();
    });

    it('should show empty state initially', () => {
      renderWithPlugins(TrainListPage);
      expect(screen.getByText('暂无符合条件的车次')).toBeInTheDocument();
    });
  });
});

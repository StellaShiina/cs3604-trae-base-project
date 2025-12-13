import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/vue';
import TrainListPage from '@/views/TrainListPage.vue';
import { renderWithPlugins } from '../utils';
import { searchTrains } from '@/services/trainService';
import { useRoute } from 'vue-router';

// Mock services
vi.mock('@/services/trainService', () => ({
  searchTrains: vi.fn()
}));

// Mock router
vi.mock('vue-router', async () => {
  const actual = await vi.importActual('vue-router');
  return {
    ...actual,
    useRoute: vi.fn(),
    useRouter: vi.fn(() => ({
      push: vi.fn()
    }))
  };
});

describe('TrainListPage Functional Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useRoute as any).mockReturnValue({
      query: {}
    });
  });

  it('should show empty state initially', () => {
    renderWithPlugins(TrainListPage);
    expect(screen.getByText('暂无符合条件的车次')).toBeInTheDocument();
  });

  it('should search trains when query params are present', async () => {
    (useRoute as any).mockReturnValue({
      query: {
        departureStation: '北京',
        arrivalStation: '上海',
        departureDate: '2024-01-01'
      }
    });

    (searchTrains as any).mockResolvedValue({
      success: true,
      trains: [
        {
          trainNo: 'G1234',
          startStation: '北京南',
          endStation: '上海虹桥',
          fromStation: '北京南',
          toStation: '上海虹桥',
          startTime: '09:00',
          endTime: '13:18',
          duration: '4小时18分',
          seatTypes: []
        }
      ]
    });

    renderWithPlugins(TrainListPage);

    await waitFor(() => {
      expect(searchTrains).toHaveBeenCalledWith('北京', '上海', '2024-01-01');
      expect(screen.getByText('G1234')).toBeInTheDocument();
    });
  });

  it('should filter trains by type', async () => {
    (useRoute as any).mockReturnValue({
      query: {
        departureStation: '北京',
        arrivalStation: '上海',
        departureDate: '2024-01-01'
      }
    });

    (searchTrains as any).mockResolvedValue({
      success: true,
      trains: [
        {
          trainNo: 'G1234',
          startStation: '北京',
          endStation: '上海',
          startTime: '09:00',
          endTime: '13:00',
          duration: '4h',
          seatTypes: []
        },
        {
          trainNo: 'K1234',
          startStation: '北京',
          endStation: '上海',
          startTime: '10:00',
          endTime: '20:00',
          duration: '10h',
          seatTypes: []
        }
      ]
    });

    renderWithPlugins(TrainListPage);

    await waitFor(() => {
      expect(screen.getByText('G1234')).toBeInTheDocument();
      expect(screen.getByText('K1234')).toBeInTheDocument();
    });

    // Click 'GC-高铁/城际' filter
    // Element Plus checkboxes render as a label wrapper with an input inside.
    // Clicking the text should toggle it.
    const gcFilter = screen.getByText(/GC-高铁\/城际/);
    await fireEvent.click(gcFilter);

    // Only G1234 should be visible
    await waitFor(() => {
       expect(screen.getByText('G1234')).toBeInTheDocument();
       expect(screen.queryByText('K1234')).not.toBeInTheDocument();
    });
  });

  it('should trigger search when clicking search button', async () => {
    (useRoute as any).mockReturnValue({ query: {} });
    (searchTrains as any).mockResolvedValue({ success: true, trains: [] });

    renderWithPlugins(TrainListPage);

    // Input data
    const inputs = screen.getAllByRole('textbox'); 
    // Assuming order: departure, arrival, date
    
    const stationInputs = screen.getAllByPlaceholderText('简拼/全拼/汉字');
    await fireEvent.update(stationInputs[0], '广州');
    await fireEvent.update(stationInputs[1], '深圳');
    
    // Date picker is tricky. It's often readonly input.
    // We might need to manually set component state or mock the component if we can't interact easily.
    // However, TrainSearchBar.vue uses v-model.
    // For this test, let's skip date interaction if it's too hard and assume default date or just check validation.
    
    // Let's try to set date manually if possible.
    // Or just click search and expect error if date is empty.
    // But default date is set to today in component.
    
    const searchBtn = screen.getByRole('button', { name: /查询/ });
    await fireEvent.click(searchBtn);
    
    await waitFor(() => {
      expect(searchTrains).toHaveBeenCalled();
    });
  });
});

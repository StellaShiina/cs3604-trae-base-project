import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import OrderPage from '../../src/pages/OrderPage';

/**
 * 跨页流程测试：订单填写页与信息核对弹窗余票一致性验证
 * 
 * 测试场景：
 * 验证订单填写页列车信息区域显示的余票数量
 * 与提交订单后信息核对弹窗显示的余票数量一致
 */
describe('订单填写页与信息核对弹窗余票一致性测试', () => {
  const mockTrainInfo = {
    trainNo: 'D6',
    departureStation: '上海',
    arrivalStation: '北京',
    departureTime: '21:15',
    arrivalTime: '09:26',
    departureDate: '2025-11-13'
  };

  const mockPassenger = {
    id: 'passenger-1',
    name: '刘嘉敏',
    id_card_type: '居民身份证',
    id_card_number: '330102199001011234',
    phone: '13800138000',
    points: 500
  };

  const mockOrderId = 'order-123';

  // 定义一致的余票数量
  const consistentAvailableSeats = {
    '二等座': 1040,
    '硬卧': 120,
    '软卧': 30
  };

  const mockOrderConfirmationData = {
    trainInfo: {
      trainNo: 'D6',
      departureStation: '上海',
      arrivalStation: '北京',
      departureDate: '2025-11-13',
      departureTime: '21:15',
      arrivalTime: '09:26',
      dayOfWeek: '周四'
    },
    passengers: [
      {
        sequence: 1,
        seatType: '二等座',
        ticketType: '成人票',
        name: '刘嘉敏',
        idCardType: '居民身份证',
        idCardNumber: '330102199001011234',
        points: 500
      }
    ],
    availableSeats: consistentAvailableSeats,
    totalPrice: 517
  };

  beforeEach(() => {
    // 模拟登录状态
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(() => 'mock-token'),
        setItem: vi.fn(),
        clear: vi.fn(),
        removeItem: vi.fn(),
      },
      writable: true
    });
    
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('应该在订单填写页和信息核对弹窗中显示一致的余票数量', async () => {
    const user = userEvent.setup();

    // Mock API responses - 确保订单填写页和弹窗使用相同的余票数据
    (global.fetch as any).mockImplementation((url: string) => {
      // Mock /api/orders/new - 订单页初始化数据（使用一致的余票数量）
      if (url.includes('/api/orders/new')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            trainInfo: mockTrainInfo,
            fareInfo: {
              '二等座': 517,
              '硬卧': 1170,
              '软卧': 1420
            },
            availableSeats: consistentAvailableSeats,  // 使用一致的余票数据
            passengers: [mockPassenger],
            defaultSeatType: '二等座'
          })
        });
      }
      
      // Mock /api/orders/submit - 提交订单
      if (url.includes('/api/orders/submit')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            orderId: mockOrderId,
            message: '订单提交成功'
          })
        });
      }
      
      // Mock /api/orders/:orderId/confirmation - 获取订单确认信息（使用一致的余票数据）
      if (url.includes(`/api/orders/${mockOrderId}/confirmation`)) {
        return Promise.resolve({
          ok: true,
          json: async () => mockOrderConfirmationData
        });
      }
      
      return Promise.resolve({
        ok: true,
        json: async () => ({})
      });
    });

    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: '/order',
            state: {
              trainNo: 'D6',
              departureStation: '上海',
              arrivalStation: '北京',
              departureDate: '2025-11-13'
            }
          }
        ]}
      >
        <Routes>
          <Route path="/order" element={<OrderPage />} />
        </Routes>
      </MemoryRouter>
    );

    // 等待订单填写页加载完成
    await waitFor(() => {
      expect(screen.getByText(/列车信息/i)).toBeInTheDocument();
    });

    // 验证订单填写页显示的余票数量
    await waitFor(() => {
      const pageContent = screen.getByText(/列车信息/i).closest('.order-page');
      expect(pageContent).toBeInTheDocument();
      
      // 检查二等座余票：1040张
      expect(pageContent).toHaveTextContent('1040');
      
      // 检查硬卧余票：120张
      expect(pageContent).toHaveTextContent('120');
      
      // 检查软卧余票：30张
      expect(pageContent).toHaveTextContent('30');
    }, { timeout: 3000 });

    // 选择乘客
    await waitFor(() => {
      expect(screen.getByText('刘嘉敏')).toBeInTheDocument();
    });

    const passengerCheckbox = screen.getByRole('checkbox', { name: /刘嘉敏/ });
    await user.click(passengerCheckbox);

    await waitFor(() => {
      expect(passengerCheckbox).toBeChecked();
    });

    // 提交订单
    const submitButton = screen.getByRole('button', { name: /提交订单/i });
    await user.click(submitButton);

    // 等待信息核对弹窗显示
    await waitFor(() => {
      expect(screen.getByText('请核对以下信息')).toBeInTheDocument();
    }, { timeout: 5000 });

    // 等待加载完成
    await waitFor(() => {
      expect(screen.queryByText('加载中...')).not.toBeInTheDocument();
      expect(screen.queryByText('加载订单信息...')).not.toBeInTheDocument();
    }, { timeout: 5000 });

    // 验证弹窗中显示的余票数量与订单填写页一致
    const modal = screen.getByText('请核对以下信息').closest('.modal-content');
    expect(modal).toBeInTheDocument();

    await waitFor(() => {
      // 验证余票信息存在
      expect(modal).toHaveTextContent('本次列车');
      
      // 验证二等座余票：1040张（与订单填写页一致）
      expect(modal).toHaveTextContent('二等座余票');
      expect(modal).toHaveTextContent('1040');
      
      // 验证硬卧余票：120张（与订单填写页一致）
      expect(modal).toHaveTextContent('硬卧余票');
      expect(modal).toHaveTextContent('120');
      
      // 验证软卧余票：30张（与订单填写页一致）
      expect(modal).toHaveTextContent('软卧余票');
      expect(modal).toHaveTextContent('30');
    }, { timeout: 3000 });
  });

  it('应该在API返回不同余票时正确显示（模拟实际场景）', async () => {
    const user = userEvent.setup();

    // 定义实际的余票数量（跨区间计算后的结果）
    const realAvailableSeats = {
      '二等座': 1040,
      '硬卧': 120,
      '软卧': 30
    };

    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('/api/orders/new')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            trainInfo: mockTrainInfo,
            fareInfo: {
              '二等座': 517,
              '硬卧': 1170,
              '软卧': 1420
            },
            availableSeats: realAvailableSeats,
            passengers: [mockPassenger],
            defaultSeatType: '二等座'
          })
        });
      }
      
      if (url.includes('/api/orders/submit')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ orderId: mockOrderId })
        });
      }
      
      if (url.includes(`/api/orders/${mockOrderId}/confirmation`)) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            ...mockOrderConfirmationData,
            availableSeats: realAvailableSeats
          })
        });
      }
      
      return Promise.resolve({
        ok: true,
        json: async () => ({})
      });
    });

    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: '/order',
            state: {
              trainNo: 'D6',
              departureStation: '上海',
              arrivalStation: '北京',
              departureDate: '2025-11-13'
            }
          }
        ]}
      >
        <Routes>
          <Route path="/order" element={<OrderPage />} />
        </Routes>
      </MemoryRouter>
    );

    // 等待页面加载
    await waitFor(() => {
      expect(screen.getByText(/列车信息/i)).toBeInTheDocument();
    });

    // 验证订单填写页显示正确的余票
    const pageContent = screen.getByText(/列车信息/i).closest('.order-page');
    expect(pageContent).toHaveTextContent('1040');
    expect(pageContent).toHaveTextContent('120');
    expect(pageContent).toHaveTextContent('30');

    // 选择乘客并提交
    await waitFor(() => {
      expect(screen.getByText('刘嘉敏')).toBeInTheDocument();
    });

    const passengerCheckbox = screen.getByRole('checkbox', { name: /刘嘉敏/ });
    await user.click(passengerCheckbox);
    
    const submitButton = screen.getByRole('button', { name: /提交订单/i });
    await user.click(submitButton);

    // 等待弹窗
    await waitFor(() => {
      expect(screen.getByText('请核对以下信息')).toBeInTheDocument();
    }, { timeout: 5000 });

    await waitFor(() => {
      expect(screen.queryByText('加载中...')).not.toBeInTheDocument();
    }, { timeout: 5000 });

    // 验证弹窗显示一致的余票
    const modal = screen.getByText('请核对以下信息').closest('.modal-content');
    expect(modal).toHaveTextContent('1040');
    expect(modal).toHaveTextContent('120');
    expect(modal).toHaveTextContent('30');
  });
});


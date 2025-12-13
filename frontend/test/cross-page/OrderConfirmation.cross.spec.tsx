import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import OrderPage from '../../src/pages/OrderPage';

/**
 * 跨页流程测试：订单填写页 -> 信息核对弹窗
 * 
 * 测试路径：
 * 1. 从车次列表页进入订单填写页
 * 2. 选择乘客
 * 3. 提交订单
 * 4. 显示信息核对弹窗
 * 5. 验证弹窗中的车次信息、乘客信息和余票信息
 */
describe('订单填写页 -> 信息核对弹窗 跨页流程测试', () => {
  const mockTrainInfo = {
    trainNo: 'D6',
    train_type: '动车组',
    model: 'CRH',
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

  const mockOrderConfirmationData = {
    trainInfo: {
      trainNo: 'D6',
      departureStation: '上海',
      arrivalStation: '北京',
      departureDate: '2025-11-13',
      departureTime: '21:15',
      arrivalTime: '09:26',
      dayOfWeek: '周三'
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
    availableSeats: {
      '二等座': 100,
      '硬卧': 20,
      '软卧': 10
    },
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
    
    // 清理所有 mock
    vi.clearAllMocks();
    
    // Mock fetch API
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('应该完整展示信息核对弹窗的所有信息（车次、乘客、余票）', async () => {
    const user = userEvent.setup();

    // Mock API responses
    (global.fetch as any).mockImplementation((url: string) => {
      console.log('Mock fetch called with URL:', url);
      
      // Mock /api/orders/new - 订单页初始化数据
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
            availableSeats: {
              '二等座': 100,
              '硬卧': 20,
              '软卧': 10
            },
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
      
      // Mock /api/orders/:orderId/confirmation - 获取订单确认信息
      if (url.includes(`/api/orders/${mockOrderId}/confirmation`)) {
        return Promise.resolve({
          ok: true,
          json: async () => mockOrderConfirmationData
        });
      }
      
      // 默认返回空对象，避免抛出错误
      console.warn('Unhandled API endpoint:', url);
      return Promise.resolve({
        ok: true,
        json: async () => ({})
      });
    });

    // 渲染订单填写页
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

    // 等待页面加载完成
    await waitFor(() => {
      expect(screen.getByText(/列车信息/i)).toBeInTheDocument();
    });

    // 选择乘客
    await waitFor(() => {
      expect(screen.getByText('刘嘉敏')).toBeInTheDocument();
    });

    const passengerCheckbox = screen.getByRole('checkbox', { name: /刘嘉敏/ });
    await user.click(passengerCheckbox);

    // 等待乘客被选中
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

    // 在弹窗中查找车次信息（需要等待弹窗加载完成）
    await waitFor(() => {
      // 等待加载状态消失
      expect(screen.queryByText('加载中...')).not.toBeInTheDocument();
      expect(screen.queryByText('加载订单信息...')).not.toBeInTheDocument();
    }, { timeout: 5000 });

    // 验证车次信息显示（在弹窗内）
    // 使用getByRole查找弹窗，然后在其中查找内容
    const modal = screen.getByText('请核对以下信息').closest('.modal-content');
    expect(modal).toBeInTheDocument();

    // 在弹窗中验证车次信息（使用简单的文本匹配）
    await waitFor(() => {
      expect(modal).toHaveTextContent('D6');
      expect(modal).toHaveTextContent('上海');
      expect(modal).toHaveTextContent('北京');
    }, { timeout: 3000 });

    // 验证乘客信息表格存在
    await waitFor(() => {
      const table = within(modal!).getByRole('table');
      expect(table).toBeInTheDocument();
      
      // 验证乘客姓名显示
      expect(within(modal!).getByText('刘嘉敏')).toBeInTheDocument();
      
      // 验证席别和票种
      expect(within(modal!).getByText('二等座')).toBeInTheDocument();
      expect(within(modal!).getByText('成人票')).toBeInTheDocument();
    }, { timeout: 3000 });

    // 验证座位分配提示
    expect(modal).toHaveTextContent('系统将随机为您申请席位');

    // 验证余票信息
    await waitFor(() => {
      expect(modal).toHaveTextContent('本次列车');
      expect(modal).toHaveTextContent('余票');
    }, { timeout: 3000 });

    // 验证操作按钮
    expect(within(modal!).getByRole('button', { name: /返回修改/ })).toBeInTheDocument();
    expect(within(modal!).getByRole('button', { name: /确认/ })).toBeInTheDocument();
  });

  it('应该在点击"返回修改"后关闭弹窗回到订单填写页', async () => {
    const user = userEvent.setup();

    // Mock API responses
    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('/api/orders/new')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            trainInfo: mockTrainInfo,
            fareInfo: { '二等座': 517 },
            availableSeats: { '二等座': 100 },
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

    // 等待页面加载并选择乘客
    await waitFor(() => {
      expect(screen.getByText('刘嘉敏')).toBeInTheDocument();
    });

    const passengerCheckbox = screen.getByRole('checkbox', { name: /刘嘉敏/ });
    await user.click(passengerCheckbox);

    // 提交订单
    const submitButton = screen.getByRole('button', { name: /提交订单/i });
    await user.click(submitButton);

    // 等待信息核对弹窗显示
    await waitFor(() => {
      expect(screen.getByText('请核对以下信息')).toBeInTheDocument();
    });

    // 点击"返回修改"按钮
    const backButton = screen.getByRole('button', { name: /返回修改/ });
    await user.click(backButton);

    // 验证弹窗关闭，回到订单填写页
    await waitFor(() => {
      expect(screen.queryByText('请核对以下信息')).not.toBeInTheDocument();
    });

    // 验证仍在订单填写页
    expect(screen.getByText(/列车信息/i)).toBeInTheDocument();
  });

  it('应该处理API返回错误的情况并显示错误信息', async () => {
    const user = userEvent.setup();

    // Mock API responses with error
    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('/api/orders/new')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            trainInfo: mockTrainInfo,
            fareInfo: { '二等座': 517 },
            availableSeats: { '二等座': 100 },
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
          ok: false,
          json: async () => ({ error: '获取订单信息失败' })
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

    // 等待页面加载并选择乘客
    await waitFor(() => {
      expect(screen.getByText('刘嘉敏')).toBeInTheDocument();
    });

    const passengerCheckbox = screen.getByRole('checkbox', { name: /刘嘉敏/ });
    await user.click(passengerCheckbox);

    // 提交订单
    const submitButton = screen.getByRole('button', { name: /提交订单/i });
    await user.click(submitButton);

    // 等待信息核对弹窗显示
    await waitFor(() => {
      expect(screen.getByText('请核对以下信息')).toBeInTheDocument();
    });

    // 验证显示错误信息
    await waitFor(() => {
      expect(screen.getByText('获取订单信息失败')).toBeInTheDocument();
    });
  });
});


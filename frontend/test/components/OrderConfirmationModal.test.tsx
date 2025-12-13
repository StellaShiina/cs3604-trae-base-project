import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import OrderConfirmationModal from '../../src/components/OrderConfirmationModal';

// Mock React Router
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock API calls
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('OrderConfirmationModal Component Tests', () => {
  const mockOrderInfo = {
    orderId: 'order-123',
    trainInfo: {
      trainNo: 'G1476',
      departureStation: '上海虹桥站',
      arrivalStation: '南京南站',
      departureDate: '2025-11-20',
      departureTime: '09:51',
      arrivalTime: '11:29',
      dayOfWeek: '周四'
    },
    passengers: [
      {
        sequence: 1,
        seatType: '二等座',
        ticketType: '成人票',
        name: '刘蕊蕊',
        idCardType: '居民身份证',
        idCardNumber: '3301************028',
        points: 1200
      },
      {
        sequence: 2,
        seatType: '二等座',
        ticketType: '成人票',
        name: '王欣',
        idCardType: '居民身份证',
        idCardNumber: '1101************015',
        points: 800
      }
    ],
    availableSeats: {
      '二等座': 99,
    },
    totalPrice: 1106
  };

  const mockOnConfirm = vi.fn();
  const mockOnBack = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    mockFetch.mockClear();
    mockOnConfirm.mockClear();
    mockOnBack.mockClear();
    mockOnSuccess.mockClear();
    mockNavigate.mockClear();
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(() => 'mock-token'),
        setItem: vi.fn(),
        clear: vi.fn(),
        removeItem: vi.fn(),
      },
      writable: true
    });
    
    // Mock fetch to return order confirmation data
    mockFetch.mockImplementation((url: string, options?: any) => {
      if (url.includes('/api/orders/') && url.includes('/confirmation')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockOrderInfo
        });
      }
      if (url.includes('/api/orders/') && url.includes('/confirm') && options?.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            success: true,
            orderId: mockOrderInfo.orderId
          })
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({})
      });
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('弹窗布局和内容显示', () => {
    it('标题区域应该为蓝色背景，内容为"请核对以下信息"', async () => {
      render(
        <OrderConfirmationModal
          isVisible={true}
          orderId={mockOrderInfo.orderId}
          onConfirm={mockOnConfirm}
          onBack={mockOnBack}
        />
      );

      // 验证标题存在
      const title = await screen.findByText('请核对以下信息');
      expect(title).toBeInTheDocument();
      
      // 验证标题区域有蓝色背景样式
      const titleElement = title.closest('.modal-header');
      expect(titleElement).toHaveClass('blue-background');
    });

    it('主体区域应该为白色背景', async () => {
      render(
        <OrderConfirmationModal
          isVisible={true}
          orderId={mockOrderInfo.orderId}
          onConfirm={mockOnConfirm}
          onBack={mockOnBack}
        />
      );

      await waitFor(() => {
        expect(screen.queryByText('加载中...')).not.toBeInTheDocument();
      });

      const modalTitle = screen.getByText('请核对以下信息');
      const modal = modalTitle.closest('.order-confirmation-modal');
      expect(modal).toBeInTheDocument();
      
      const modalBody = modal?.querySelector('.modal-body');
      expect(modalBody).toHaveClass('white-background');
    });

    it('弹窗不可见时不应该渲染', () => {
      render(
        <OrderConfirmationModal
          isVisible={false}
          orderId={mockOrderInfo.orderId}
          onConfirm={mockOnConfirm}
          onBack={mockOnBack}
        />
      );

      expect(screen.queryByText('请核对以下信息')).not.toBeInTheDocument();
    });
  });

  describe('车次与出行信息区', () => {
    it('应该显示完整的列车信息', async () => {
      render(
        <OrderConfirmationModal
          isVisible={true}
          orderId={mockOrderInfo.orderId}
          onConfirm={mockOnConfirm}
          onBack={mockOnBack}
        />
      );

      // 等待数据加载
      await waitFor(() => {
        expect(screen.queryByText('加载中...')).not.toBeInTheDocument();
      });

      // 验证出行日期、车次号、出发站、出发时间、到达站、到达时间
      // 注意：文本可能被拆分到多个元素中，统一使用textContent验证更可靠
      const trainInfoContainer = document.querySelector('.train-info-display');
      expect(trainInfoContainer).toBeInTheDocument();
      const containerText = trainInfoContainer?.textContent || '';
      
      // 验证所有必要信息都存在于容器中
      expect(containerText).toContain('2025-11-20');
      expect(containerText).toContain('周四');
      expect(containerText).toContain('G1476');
      expect(containerText).toContain('次');
      expect(containerText).toContain('上海虹桥站');
      expect(containerText).toContain('09:51');
      expect(containerText).toContain('开');
      expect(containerText).toContain('南京南站');
      expect(containerText).toContain('11:29');
      expect(containerText).toContain('到');
    });

    it('应该正确显示日期、车次号、出发时间为粗体', async () => {
      render(
        <OrderConfirmationModal
          isVisible={true}
          orderId={mockOrderInfo.orderId}
          onConfirm={mockOnConfirm}
          onBack={mockOnBack}
        />
      );

      await waitFor(() => {
        expect(screen.queryByText('加载中...')).not.toBeInTheDocument();
      });

      // TrainInfoDisplay 组件会显示这些信息，具体的样式检查依赖于组件的实现
      // 注意：文本可能被拆分到多个元素中
      const trainInfoContainer = document.querySelector('.train-info-display');
      expect(trainInfoContainer?.textContent).toContain('2025-11-20');
      expect(screen.getByText('G1476')).toBeInTheDocument();
      // 验证时间信息存在
      expect(trainInfoContainer?.textContent).toContain('09:51');
      
      // 验证粗体元素存在（通过class名称）
      const trainInfoDisplay = document.querySelector('.train-info-display');
      expect(trainInfoDisplay).toBeInTheDocument();
      const dateElement = trainInfoDisplay?.querySelector('.info-date');
      const trainNoElement = trainInfoDisplay?.querySelector('.info-train-no');
      const boldGroupElement = trainInfoDisplay?.querySelector('.info-bold-group');
      expect(dateElement).toBeInTheDocument();
      expect(trainNoElement).toBeInTheDocument();
      expect(boldGroupElement).toBeInTheDocument();
    });
  });

  describe('乘客信息区', () => {
    it('应该以表格形式展示乘车人信息', async () => {
      render(
        <OrderConfirmationModal
          isVisible={true}
          orderId={mockOrderInfo.orderId}
          onConfirm={mockOnConfirm}
          onBack={mockOnBack}
        />
      );

      await waitFor(() => {
        expect(screen.queryByText('加载中...')).not.toBeInTheDocument();
      });

      // 验证表格标题
      expect(screen.getByText('序号')).toBeInTheDocument();
      expect(screen.getByText('席别')).toBeInTheDocument();
      expect(screen.getByText('票种')).toBeInTheDocument();
      expect(screen.getByText('姓名')).toBeInTheDocument();
      expect(screen.getByText('证件类型')).toBeInTheDocument();
      expect(screen.getByText('证件号码')).toBeInTheDocument();

      // 验证乘客信息显示
      expect(screen.getByText('刘蕊蕊')).toBeInTheDocument();
      expect(screen.getByText('王欣')).toBeInTheDocument();
      // "二等座"和"成人票"有多个（每个乘客一行），使用getAllByText
      const seatTypeElements = screen.getAllByText('二等座');
      expect(seatTypeElements.length).toBeGreaterThanOrEqual(1);
      const ticketTypeElements = screen.getAllByText('成人票');
      expect(ticketTypeElements.length).toBeGreaterThanOrEqual(1);
    });

    it('应该在乘客姓名右侧显示积分标签', async () => {
      render(
        <OrderConfirmationModal
          isVisible={true}
          orderId={mockOrderInfo.orderId}
          onConfirm={mockOnConfirm}
          onBack={mockOnBack}
        />
      );

      await waitFor(() => {
        expect(screen.queryByText('加载中...')).not.toBeInTheDocument();
      });

      // 验证积分标签显示
      expect(screen.getByText('积分*1200')).toBeInTheDocument();
      expect(screen.getByText('积分*800')).toBeInTheDocument();
    });

    it('应该显示说明文字：系统将随机为您申请席位，暂不支持自选席位', async () => {
      render(
        <OrderConfirmationModal
          isVisible={true}
          orderId={mockOrderInfo.orderId}
          onConfirm={mockOnConfirm}
          onBack={mockOnBack}
        />
      );

      await waitFor(() => {
        expect(screen.queryByText('加载中...')).not.toBeInTheDocument();
      });

      expect(screen.getByText('系统将随机为您申请席位，暂不支持自选席位。')).toBeInTheDocument();
    });

    it('没有乘客信息时应该显示提示', async () => {
      const emptyOrderInfo = {
        ...mockOrderInfo,
        passengers: []
      };

      mockFetch.mockImplementation((url: string) => {
        if (url.includes('/api/orders/') && url.includes('/confirmation')) {
          return Promise.resolve({
            ok: true,
            json: async () => emptyOrderInfo
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({})
        });
      });

      render(
        <OrderConfirmationModal
          isVisible={true}
          orderId={mockOrderInfo.orderId}
          onConfirm={mockOnConfirm}
          onBack={mockOnBack}
        />
      );

      await waitFor(() => {
        expect(screen.queryByText('加载中...')).not.toBeInTheDocument();
      });

      expect(screen.getByText('暂无乘客信息')).toBeInTheDocument();
    });
  });

  describe('余票信息与操作按钮区', () => {
    it('应该显示余票信息', async () => {
      render(
        <OrderConfirmationModal
          isVisible={true}
          orderId={mockOrderInfo.orderId}
          onConfirm={mockOnConfirm}
          onBack={mockOnBack}
        />
      );

      await waitFor(() => {
        expect(screen.queryByText('加载中...')).not.toBeInTheDocument();
      });

      // SeatAvailabilityDisplay 组件会显示余票信息
      // 具体显示格式：本次列车，二等座余票 x 张
      expect(screen.getByText(/二等座余票/)).toBeInTheDocument();
    });

    it('应该显示"返回修改"和"确认"按钮', async () => {
      render(
        <OrderConfirmationModal
          isVisible={true}
          orderId={mockOrderInfo.orderId}
          onConfirm={mockOnConfirm}
          onBack={mockOnBack}
        />
      );

      await waitFor(() => {
        expect(screen.queryByText('加载中...')).not.toBeInTheDocument();
      });

      const confirmButton = screen.getByText('确认');
      const backButton = screen.getByText('返回修改');
      
      expect(confirmButton).toBeInTheDocument();
      expect(backButton).toBeInTheDocument();
    });

    it('"返回修改"按钮应该有白色背景、灰色文字样式', async () => {
      render(
        <OrderConfirmationModal
          isVisible={true}
          orderId={mockOrderInfo.orderId}
          onConfirm={mockOnConfirm}
          onBack={mockOnBack}
        />
      );

      await waitFor(() => {
        expect(screen.queryByText('加载中...')).not.toBeInTheDocument();
      });

      const backButton = screen.getByText('返回修改');
      expect(backButton).toHaveClass('back-modal-button', 'white-background', 'gray-text');
    });

    it('"确认"按钮应该有橙色背景、白色文字样式', async () => {
      render(
        <OrderConfirmationModal
          isVisible={true}
          orderId={mockOrderInfo.orderId}
          onConfirm={mockOnConfirm}
          onBack={mockOnBack}
        />
      );

      await waitFor(() => {
        expect(screen.queryByText('加载中...')).not.toBeInTheDocument();
      });

      const confirmButton = screen.getByText('确认');
      expect(confirmButton).toHaveClass('confirm-modal-button', 'orange-background', 'white-text');
    });
  });

  describe('用户核对信息', () => {
    it('点击关闭按钮应该调用onBack回调', async () => {
      render(
        <OrderConfirmationModal
          isVisible={true}
          orderId={mockOrderInfo.orderId}
          onConfirm={mockOnConfirm}
          onBack={mockOnBack}
        />
      );

      await waitFor(() => {
        expect(screen.queryByText('加载中...')).not.toBeInTheDocument();
      });

      // 查找关闭按钮（×符号）
      const closeButton = screen.getByText('×');
      fireEvent.click(closeButton);
      
      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });

    it('点击"返回修改"按钮应该调用onBack回调', async () => {
      render(
        <OrderConfirmationModal
          isVisible={true}
          orderId={mockOrderInfo.orderId}
          onConfirm={mockOnConfirm}
          onBack={mockOnBack}
        />
      );

      await waitFor(() => {
        expect(screen.queryByText('加载中...')).not.toBeInTheDocument();
      });

      const backButton = screen.getByText('返回修改');
      fireEvent.click(backButton);
      
      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });

    it('点击"确认"按钮应该显示处理中弹窗并调用确认API', async () => {
      render(
        <OrderConfirmationModal
          isVisible={true}
          orderId={mockOrderInfo.orderId}
          onConfirm={mockOnConfirm}
          onBack={mockOnBack}
        />
      );

      await waitFor(() => {
        expect(screen.queryByText('加载中...')).not.toBeInTheDocument();
      });

      const confirmButton = screen.getByText('确认');
      fireEvent.click(confirmButton);

      // 验证处理中弹窗显示
      await waitFor(() => {
        expect(screen.getByText('订单已经提交，系统正在处理中，请稍等')).toBeInTheDocument();
      });

      // 验证API被调用
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/orders/') && expect.stringContaining('/confirm'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': expect.stringContaining('Bearer'),
          })
        })
      );
    });

    it('确认成功后应该跳转到支付页面', async () => {
      render(
        <OrderConfirmationModal
          isVisible={true}
          orderId={mockOrderInfo.orderId}
          onConfirm={mockOnConfirm}
          onBack={mockOnBack}
        />
      );

      await waitFor(() => {
        expect(screen.queryByText('加载中...')).not.toBeInTheDocument();
      });

      const confirmButton = screen.getByText('确认');
      fireEvent.click(confirmButton);

      // 等待API调用完成
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/confirm'),
          expect.any(Object)
        );
      }, { timeout: 3000 });

      // 验证导航被调用（延迟100ms后）
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(`/payment/${mockOrderInfo.orderId}`);
      }, { timeout: 2000 });
    });

    it('确认失败时应该显示错误信息', async () => {
      mockFetch.mockImplementation((url: string, options?: any) => {
        if (url.includes('/api/orders/') && url.includes('/confirmation')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockOrderInfo
          });
        }
        if (url.includes('/api/orders/') && url.includes('/confirm') && options?.method === 'POST') {
          return Promise.resolve({
            ok: false,
            json: async () => ({ error: '订单确认失败' })
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({})
        });
      });

      render(
        <OrderConfirmationModal
          isVisible={true}
          orderId={mockOrderInfo.orderId}
          onConfirm={mockOnConfirm}
          onBack={mockOnBack}
        />
      );

      await waitFor(() => {
        expect(screen.queryByText('加载中...')).not.toBeInTheDocument();
      });

      const confirmButton = screen.getByText('确认');
      fireEvent.click(confirmButton);

      // 等待错误信息显示
      await waitFor(() => {
        expect(screen.getByText(/订单确认失败/)).toBeInTheDocument();
      });
    });

    it('当取消订单次数达到上限时应该显示BookingFailedModal', async () => {
      mockFetch.mockImplementation((url: string, options?: any) => {
        if (url.includes('/api/orders/') && url.includes('/confirmation')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockOrderInfo
          });
        }
        if (url.includes('/api/orders/') && url.includes('/confirm') && options?.method === 'POST') {
          return Promise.resolve({
            ok: false,
            status: 403,
            json: async () => ({ error: '今日取消订单次数已达上限' })
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({})
        });
      });

      render(
        <OrderConfirmationModal
          isVisible={true}
          orderId={mockOrderInfo.orderId}
          onConfirm={mockOnConfirm}
          onBack={mockOnBack}
        />
      );

      await waitFor(() => {
        expect(screen.queryByText('加载中...')).not.toBeInTheDocument();
      });

      const confirmButton = screen.getByText('确认');
      fireEvent.click(confirmButton);

      // 等待BookingFailedModal显示
      await waitFor(() => {
        // BookingFailedModal应该显示在portal中
        const modal = document.body.querySelector('.booking-failed-modal') || 
                     document.body.querySelector('[class*="failed"]');
        expect(modal).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('加载中时确认按钮应该被禁用', async () => {
      // 延迟API响应以保持加载状态
      let resolveConfirmation: any;
      const confirmationPromise = new Promise((resolve) => {
        resolveConfirmation = resolve;
      });

      mockFetch.mockImplementation((url: string) => {
        if (url.includes('/api/orders/') && url.includes('/confirmation')) {
          return confirmationPromise.then(() => ({
            ok: true,
            json: async () => mockOrderInfo
          }));
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({})
        });
      });

      render(
        <OrderConfirmationModal
          isVisible={true}
          orderId={mockOrderInfo.orderId}
          onConfirm={mockOnConfirm}
          onBack={mockOnBack}
        />
      );

      // 验证加载中时按钮被禁用
      const confirmButton = await screen.findByText('确认');
      expect(confirmButton).toBeDisabled();

      // 完成加载
      resolveConfirmation();

      await waitFor(() => {
        expect(confirmButton).not.toBeDisabled();
      });
    });

    it('没有token时应该显示错误信息', async () => {
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: vi.fn(() => null),
          setItem: vi.fn(),
          clear: vi.fn(),
          removeItem: vi.fn(),
        },
        writable: true
      });

      render(
        <OrderConfirmationModal
          isVisible={true}
          orderId={mockOrderInfo.orderId}
          onConfirm={mockOnConfirm}
          onBack={mockOnBack}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('请先登录')).toBeInTheDocument();
      });
    });
  });

  describe('弹窗状态管理', () => {
    it('加载中应该显示加载提示', async () => {
      // 延迟API响应以模拟加载状态
      mockFetch.mockImplementation((url: string) => {
        if (url.includes('/api/orders/') && url.includes('/confirmation')) {
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                ok: true,
                json: async () => mockOrderInfo
              });
            }, 100);
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({})
        });
      });

      render(
        <OrderConfirmationModal
          isVisible={true}
          orderId={mockOrderInfo.orderId}
          onConfirm={mockOnConfirm}
          onBack={mockOnBack}
        />
      );

      // 验证加载提示显示
      expect(screen.getByText('加载中...')).toBeInTheDocument();

      // 等待加载完成
      await waitFor(() => {
        expect(screen.queryByText('加载中...')).not.toBeInTheDocument();
      });
    });

    it('可以使用外部传入的orderInfo', async () => {
      render(
        <OrderConfirmationModal
          isVisible={true}
          orderId={mockOrderInfo.orderId}
          orderInfo={mockOrderInfo}
          onConfirm={mockOnConfirm}
          onBack={mockOnBack}
        />
      );

      // 优化后：如果传入了orderInfo，组件应该立即显示数据，不显示加载状态
      // 验证数据立即显示（不需要等待API调用）
      expect(screen.getByText('刘蕊蕊')).toBeInTheDocument();
      expect(screen.queryByText('加载中...')).not.toBeInTheDocument();
      
      // 验证不会调用confirmation API（因为已有orderInfo）
      await waitFor(() => {
        const confirmationCalls = mockFetch.mock.calls.filter(call => 
          call[0] && call[0].includes('/confirmation')
        );
        expect(confirmationCalls.length).toBe(0);
      });
    });
  });
});


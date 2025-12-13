/**
 * 用户基本信息页测试
 * 基于需求文档 05-个人信息页.md 的测试用例
 */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom';
import PersonalInfoPage from '../../src/pages/PersonalInfoPage';

// Mock React Router
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

// Mock fetch API
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Helper function to render with router
const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('PersonalInfoPage - 用户基本信息页', () => {
  const mockUserInfo = {
    username: 'testuser',
    name: '张三',
    country: '中国China',
    idCardType: '居民身份证',
    idCardNumber: '310101199001011234',
    verificationStatus: '已通过',
    phone: '(+86)158****9968',
    email: 'test@example.com',
    discountType: '成人'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    
    // Reset localStorage mock
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
    
    // 默认设置已登录状态
    localStorageMock.getItem.mockImplementation((key: string) => {
      if (key === 'authToken') return 'test-token';
      if (key === 'username') return 'testuser';
      if (key === 'userId') return 'user-1';
      return null;
    });
    
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    localStorageMock.clear.mockClear();
    
    // 默认mock API成功响应
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockUserInfo
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('6.1.1 整体布局', () => {
    it('页面背景为白色，整体分为上中下三大部分', async () => {
      const { container } = renderWithRouter(<PersonalInfoPage />);
      
      // 等待页面加载
      await waitFor(() => {
        const personalInfoPage = container.querySelector('.personal-info-page');
        expect(personalInfoPage).toBeInTheDocument();
      }, { timeout: 3000 });
      
      const personalInfoPage = container.querySelector('.personal-info-page');
      expect(personalInfoPage).toBeInTheDocument();
      
      // 验证三大部分：
      // 1. 顶部导航栏区域
      const topBar = container.querySelector('.train-list-top-bar');
      const mainNav = container.querySelector('.main-navigation');
      expect(topBar || mainNav).toBeTruthy();
      
      // 2. 中部主要内容区域
      await waitFor(() => {
        const mainContent = container.querySelector('.main-content');
        expect(mainContent).toBeInTheDocument();
      }, { timeout: 3000 });
      
      // 3. 底部导航区域
      const bottomNav = container.querySelector('.bottom-navigation');
      expect(bottomNav).toBeInTheDocument();
    });
  });

  describe('6.1.2 顶部导航栏区域', () => {
    it('应该显示Logo和欢迎信息', async () => {
      renderWithRouter(<PersonalInfoPage />);
      
      await waitFor(() => {
        // 检查Logo存在
        const logoImage = screen.queryByAltText('中国铁路12306');
        expect(logoImage).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('应该显示位置导航', async () => {
      const { container } = renderWithRouter(<PersonalInfoPage />);
      
      await waitFor(() => {
        // 检查位置导航组件存在
        const breadcrumbNav = container.querySelector('.breadcrumb-navigation');
        expect(breadcrumbNav).toBeInTheDocument();
        
        // 检查包含"当前位置："文本
        expect(screen.getByText(/当前位置：/i)).toBeInTheDocument();
        
        // 检查位置导航中包含"查看个人信息"（使用容器查询避免与其他位置混淆）
        const breadcrumbCurrent = breadcrumbNav?.querySelector('.breadcrumb-current');
        expect(breadcrumbCurrent).toBeInTheDocument();
        expect(breadcrumbCurrent?.textContent).toContain('查看个人信息');
      }, { timeout: 3000 });
    });
  });

  describe('6.1.3 左侧功能菜单栏', () => {
    it('应该显示左侧功能菜单栏', async () => {
      const { container } = renderWithRouter(<PersonalInfoPage />);
      
      await waitFor(() => {
        const sideMenu = container.querySelector('.side-menu');
        expect(sideMenu).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('应该显示"查看个人信息"菜单项为选中状态', async () => {
      const { container } = renderWithRouter(<PersonalInfoPage />);
      
      await waitFor(() => {
        // 在侧边菜单中查找"查看个人信息"菜单项
        const sideMenu = container.querySelector('.side-menu');
        expect(sideMenu).toBeInTheDocument();
        
        // 查找带有 selected 类的菜单项
        const selectedMenuItem = sideMenu?.querySelector('.menu-item.selected');
        expect(selectedMenuItem).toBeInTheDocument();
        expect(selectedMenuItem?.textContent).toContain('查看个人信息');
      }, { timeout: 3000 });
    });
  });

  describe('6.1.4 右侧个人信息展示面板', () => {
    it('应该显示个人信息展示面板', async () => {
      const { container } = renderWithRouter(<PersonalInfoPage />);
      
      await waitFor(() => {
        const panel = container.querySelector('.personal-info-panel');
        expect(panel).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('应该显示基本信息模块的所有字段', async () => {
      const { container } = renderWithRouter(<PersonalInfoPage />);
      
      await waitFor(() => {
        // 验证基本信息模块存在
        const basicInfoSection = container.querySelector('.basic-info-section');
        expect(basicInfoSection).toBeInTheDocument();
        
        // 验证基本信息标签存在（在模块内查找）
        expect(basicInfoSection?.textContent).toMatch(/用户名：/i);
        expect(basicInfoSection?.textContent).toMatch(/姓名：/i);
        expect(basicInfoSection?.textContent).toMatch(/国家\/地区：/i);
        expect(basicInfoSection?.textContent).toMatch(/证件类型：/i);
        expect(basicInfoSection?.textContent).toMatch(/证件号码：/i);
        expect(basicInfoSection?.textContent).toMatch(/核验状态：/i);
        
        // 验证基本信息值存在（在模块内查找）
        expect(basicInfoSection?.textContent).toContain('testuser');
        expect(basicInfoSection?.textContent).toContain('张三');
        expect(basicInfoSection?.textContent).toContain('中国China');
        expect(basicInfoSection?.textContent).toContain('居民身份证');
        // 证件号码会被脱敏，显示为前4位+星号+后3位，例如：3101***********234
        expect(basicInfoSection?.textContent).toMatch(/3101\*+234/);
        expect(basicInfoSection?.textContent).toContain('已通过');
      }, { timeout: 3000 });
    });

    it('应该显示联系方式模块', async () => {
      const { container } = renderWithRouter(<PersonalInfoPage />);
      
      await waitFor(() => {
        // 验证联系方式模块存在
        const contactInfoSection = container.querySelector('.contact-info-section');
        expect(contactInfoSection).toBeInTheDocument();
        
        // 验证联系方式标签存在
        expect(contactInfoSection?.textContent).toMatch(/手机号：/i);
        expect(contactInfoSection?.textContent).toMatch(/邮箱：/i);
        
        // 验证手机号信息存在（手机号格式可能是 (+86) 158****9968 或 (+86)158****9968）
        expect(contactInfoSection?.textContent).toMatch(/158\*\*\*\*9968/);
        // 验证"已通过核验"状态存在（未编辑状态下）
        expect(contactInfoSection?.textContent).toMatch(/已通过核验/);
      }, { timeout: 3000 });
    });

    it('应该显示附加信息模块', async () => {
      const { container } = renderWithRouter(<PersonalInfoPage />);
      
      await waitFor(() => {
        // 验证附加信息模块存在
        const additionalInfoSection = container.querySelector('.additional-info-section');
        expect(additionalInfoSection).toBeInTheDocument();
        
        // 验证附加信息内容（文本可能被拆分到多个元素）
        expect(additionalInfoSection?.textContent).toMatch(/优惠.*类型/);
        expect(additionalInfoSection?.textContent).toContain('成人');
      }, { timeout: 3000 });
    });

    it('联系方式模块应该有编辑按钮', async () => {
      renderWithRouter(<PersonalInfoPage />);
      
      await waitFor(() => {
        // 查找联系方式模块的编辑按钮
        const editButtons = screen.getAllByText(/编辑/i);
        // 至少应该有一个编辑按钮（联系方式或附加信息）
        expect(editButtons.length).toBeGreaterThan(0);
      }, { timeout: 3000 });
    });
  });

  describe('6.1.5 底部导航区域', () => {
    it('应该显示底部导航区域', async () => {
      const { container } = renderWithRouter(<PersonalInfoPage />);
      
      await waitFor(() => {
        const bottomNav = container.querySelector('.bottom-navigation');
        expect(bottomNav).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('6.2 "邮箱："默认设置', () => {
    it('当数据库中未存储邮箱信息时，页面仅显示"邮箱："', async () => {
      // Mock API返回无邮箱的用户信息
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ...mockUserInfo,
          email: '' // 或者 null/undefined
        })
      });
      
      renderWithRouter(<PersonalInfoPage />);
      
      await waitFor(() => {
        // 验证显示"邮箱："但后面没有内容
        const emailLabel = screen.getByText(/邮箱：/i);
        expect(emailLabel).toBeInTheDocument();
        
        // 验证邮箱值区域为空（不显示邮箱地址）
        const emailSection = emailLabel.closest('.info-row');
        if (emailSection) {
          const emailValue = emailSection.querySelector('.info-value');
          // 如果邮箱为空，info-value可能为空或不显示内容
          expect(emailValue?.textContent || '').toMatch(/^\s*$/);
        }
      }, { timeout: 3000 });
    });

    it('当数据库中存储了邮箱信息时，页面显示"邮箱：xxxx@xxx"', async () => {
      // Mock API返回有邮箱的用户信息
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ...mockUserInfo,
          email: 'test@example.com'
        })
      });
      
      renderWithRouter(<PersonalInfoPage />);
      
      await waitFor(() => {
        // 验证显示邮箱地址
        expect(screen.getByText(/邮箱/i)).toBeInTheDocument();
        expect(screen.getByText(/test@example\.com/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('6.3 修改联系方式模块', () => {
    it('点击联系方式模块的"编辑"按钮后，应该显示"去手机核验修改"', async () => {
      const { container } = renderWithRouter(<PersonalInfoPage />);
      
      await waitFor(() => {
        const contactInfoSection = container.querySelector('.contact-info-section');
        expect(contactInfoSection).toBeInTheDocument();
      }, { timeout: 3000 });
      
      // 在联系方式模块中找到编辑按钮并点击
      const contactInfoSection = container.querySelector('.contact-info-section');
      const editButton = contactInfoSection?.querySelector('.edit-button');
      expect(editButton).toBeInTheDocument();
      
      if (editButton) {
        fireEvent.click(editButton);
        
        // 验证显示"去手机核验修改"或"手机核验"链接（在联系方式模块内）
        await waitFor(() => {
          const phoneVerificationText = contactInfoSection?.querySelector('.phone-verification-text');
          expect(phoneVerificationText).toBeInTheDocument();
          expect(phoneVerificationText?.textContent).toMatch(/去.*手机核验.*修改/i);
        }, { timeout: 2000 });
      }
    });
  });

  describe('页面加载和API调用', () => {
    it('页面加载时应该自动获取用户信息', async () => {
      renderWithRouter(<PersonalInfoPage />);
      
      // 验证API被调用
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          '/api/user/info',
          expect.objectContaining({
            headers: expect.objectContaining({
              'Authorization': expect.stringContaining('Bearer')
            })
          })
        );
      }, { timeout: 3000 });
    });

    it('应该在加载时显示加载指示器', async () => {
      // Mock API延迟返回
      mockFetch.mockImplementationOnce(
        () => new Promise(resolve => setTimeout(() => {
          resolve({
            ok: true,
            json: async () => mockUserInfo
          });
        }, 100))
      );
      
      renderWithRouter(<PersonalInfoPage />);
      
      // 验证显示加载状态
      expect(screen.getByText(/加载中/i)).toBeInTheDocument();
      
      // 等待加载完成
      await waitFor(() => {
        expect(screen.queryByText(/加载中/i)).not.toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it('应该在API调用失败时显示错误信息', async () => {
      // Mock API返回错误
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: '获取用户信息失败' })
      });
      
      renderWithRouter(<PersonalInfoPage />);
      
      // 验证显示错误信息
      await waitFor(() => {
        expect(screen.getByText(/获取用户信息失败/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('当Token失效时应该跳转到登录页', async () => {
      // Mock API返回401未授权
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Unauthorized' })
      });
      
      renderWithRouter(<PersonalInfoPage />);
      
      // 验证跳转到登录页
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/login');
      }, { timeout: 3000 });
    });
  });

  describe('登录状态检查', () => {
    it('未登录时应该跳转到登录页', async () => {
      // Mock未登录状态
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'authToken') return null;
        return null;
      });
      
      renderWithRouter(<PersonalInfoPage />);
      
      // 验证跳转到登录页
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/login');
      }, { timeout: 3000 });
    });
  });

  describe('菜单导航功能', () => {
    it('点击左侧菜单的"手机核验"应该跳转到手机核验页', async () => {
      renderWithRouter(<PersonalInfoPage />);
      
      await waitFor(() => {
        expect(screen.getByText(/手机核验/i)).toBeInTheDocument();
      }, { timeout: 3000 });
      
      // 查找并点击"手机核验"菜单项
      const phoneVerificationMenu = screen.getByText(/手机核验/i);
      fireEvent.click(phoneVerificationMenu);
      
      // 验证跳转到手机核验页
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/phone-verification');
      }, { timeout: 2000 });
    });
  });
});

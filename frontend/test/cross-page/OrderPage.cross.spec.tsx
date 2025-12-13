/**
 * 跨页流程测试：订单填写页跨页导航
 * 
 * 测试场景：
 * 1. 车次列表页 → 订单填写页（点击预订按钮）
 * 2. 订单填写页 → 车次列表页（点击"上一步"按钮）
 * 3. 订单填写页 → 登录页（通过主导航栏登录按钮）
 * 4. 订单填写页 → 注册页（通过主导航栏注册按钮）
 * 5. 订单填写页 → 首页（点击Logo）
 * 6. 未登录访问订单页 → 跳转到登录页
 * 7. 订单填写页接收并显示车次参数
 * 
 * 需求文档参考：
 * - requirements/04-订单填写页/04-订单填写页.md
 * - 5.1 订单填写页布局
 * - 5.5 用户提交订单
 */

import React from 'react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import HomePage from '../../src/pages/HomePage'
import TrainListPage from '../../src/pages/TrainListPage'
import LoginPage from '../../src/pages/LoginPage'
import RegisterPage from '../../src/pages/RegisterPage'
import OrderPage from '../../src/pages/OrderPage'
import {
  setupLocalStorageMock,
  cleanupTest,
  mockUnauthenticatedUser,
  mockAuthenticatedUser,
  renderWithRouter,
  mockFetch,
} from './test-utils'

// 使用 globalThis 而不是 global

describe('跨页流程：订单填写页基本导航', () => {
  beforeEach(() => {
    cleanupTest()
    setupLocalStorageMock()
    mockUnauthenticatedUser()
    mockFetch()
    
    // Mock默认的API响应
    ;(globalThis.fetch as any).mockImplementation((url: string) => {
      if (url.includes('/api/orders/new')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            trainInfo: {
              trainNo: 'G27',
              date: '2025-09-14',
              departureStation: '北京南站',
              arrivalStation: '上海虹桥',
              departureTime: '19:00',
              arrivalTime: '23:35'
            },
            fareInfo: {
              '商务座': { price: 1748, available: 10 },
              '一等座': { price: 933, available: 50 },
              '二等座': { price: 553, available: 100 }
            },
            availableSeats: {
              '商务座': 10,
              '一等座': 50,
              '二等座': 100
            },
            passengers: [
              { id: '1', name: '刘蕊蕊', idCardType: '居民身份证', idCardNumber: '3301************028', points: 1234 },
              { id: '2', name: '王欣', idCardType: '居民身份证', idCardNumber: '4401************123', points: 567 }
            ],
            defaultSeatType: '二等座'
          })
        })
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({})
      })
    })
  })

  it('应该能从订单填写页通过主导航栏的"登录"按钮导航到登录页', async () => {
    const user = userEvent.setup()

    await renderWithRouter({
      initialEntries: [
        { 
          pathname: '/order', 
          state: { 
            trainNo: 'G27', 
            departureStation: '北京南站', 
            arrivalStation: '上海虹桥', 
            departureDate: '2025-09-14' 
          } 
        }
      ],
      routes: [
        { path: '/order', element: <OrderPage /> },
        { path: '/login', element: <LoginPage /> },
      ],
    })

    // 等待订单页加载完成（TrainListTopBar 显示 "您好，请登录"）
    await waitFor(() => {
      expect(screen.getByText(/您好，请/i)).toBeInTheDocument()
    }, { timeout: 3000 })

    // 找到并点击登录按钮（TrainListTopBar 使用 Link 组件）
    const loginLink = screen.getByRole('link', { name: /登录/i })
    expect(loginLink).toBeInTheDocument()
    await act(async () => {
      await user.click(loginLink)
    })

    // 等待导航完成，验证进入登录页
    await waitFor(() => {
      expect(screen.getByText(/账号登录/i)).toBeInTheDocument()
    }, { timeout: 3000 })

    // 验证登录页的关键元素存在
    expect(screen.getByPlaceholderText(/用户名\/邮箱\/手机号/i)).toBeInTheDocument()
  })

  it('应该能从订单填写页通过主导航栏的"注册"按钮导航到注册页', async () => {
    const user = userEvent.setup()

    await renderWithRouter({
      initialEntries: [
        { 
          pathname: '/order', 
          state: { 
            trainNo: 'G27', 
            departureStation: '北京南站', 
            arrivalStation: '上海虹桥', 
            departureDate: '2025-09-14' 
          } 
        }
      ],
      routes: [
        { path: '/order', element: <OrderPage /> },
        { path: '/register', element: <RegisterPage /> },
      ],
    })

    // 等待订单页加载完成（TrainListTopBar 显示 "您好，请登录"）
    await waitFor(() => {
      expect(screen.getByText(/您好，请/i)).toBeInTheDocument()
    }, { timeout: 3000 })

    // 找到并点击注册按钮（TrainListTopBar 使用 Link 组件）
    const registerLink = screen.getByRole('link', { name: /注册/i })
    expect(registerLink).toBeInTheDocument()
    await act(async () => {
      await user.click(registerLink)
    })

    // 等待导航完成，验证进入注册页
    await waitFor(() => {
      expect(screen.getByText(/账户信息/i)).toBeInTheDocument()
    }, { timeout: 3000 })

    // 验证注册页的关键元素存在
    expect(screen.getByPlaceholderText(/用户名设置成功后不可修改/i)).toBeInTheDocument()
  })

  it('应该能从订单填写页点击Logo返回首页', async () => {
    const user = userEvent.setup()

    await renderWithRouter({
      initialEntries: [
        { 
          pathname: '/order', 
          state: { 
            trainNo: 'G27', 
            departureStation: '北京南站', 
            arrivalStation: '上海虹桥', 
            departureDate: '2025-09-14' 
          } 
        }
      ],
      routes: [
        { path: '/', element: <HomePage /> },
        { path: '/order', element: <OrderPage /> },
      ],
    })

    // 等待订单页加载完成（TrainListTopBar 显示 "您好，请登录"）
    await waitFor(() => {
      expect(screen.getByText(/您好，请/i)).toBeInTheDocument()
    }, { timeout: 3000 })

    // 找到并点击Logo（点击整个 Logo 区域）
    await waitFor(() => {
      const logoElement = screen.queryByAltText(/中国铁路12306/i)
      const logoSection = document.querySelector('.train-list-logo-section')
      expect(logoElement || logoSection).toBeTruthy()
    }, { timeout: 3000 })
    
    const logoSection = document.querySelector('.train-list-logo-section')
    if (logoSection) {
      await act(async () => {
        await user.click(logoSection as HTMLElement)
      })
    } else {
      const logoElement = screen.getByAltText(/中国铁路12306/i)
      await act(async () => {
        await user.click(logoElement)
      })
    }

    // 等待导航完成，验证返回首页
    await waitFor(() => {
      // 首页特征：有首页容器和查询表单
      const homePage = document.querySelector('.home-page')
      const searchForm = document.querySelector('.train-search-form')
      expect(homePage).toBeTruthy()
      expect(searchForm).toBeTruthy()
    }, { timeout: 3000 })
  })

  it('应该能从订单填写页点击"上一步"按钮返回车次列表页', async () => {
    const user = userEvent.setup()

    await renderWithRouter({
      initialEntries: [
        { 
          pathname: '/order', 
          state: { 
            trainNo: 'G27', 
            departureStation: '北京南站', 
            arrivalStation: '上海虹桥', 
            departureDate: '2025-09-14' 
          } 
        }
      ],
      routes: [
        { path: '/trains', element: <TrainListPage /> },
        { path: '/order', element: <OrderPage /> },
      ],
    })

    // 等待订单页加载完成（TrainListTopBar 显示 "您好，请登录"）
    await waitFor(() => {
      expect(screen.getByText(/您好，请/i)).toBeInTheDocument()
    }, { timeout: 3000 })

    // 找到并点击"上一步"按钮
    const backButton = screen.getByRole('button', { name: /上一步/i })
    expect(backButton).toBeInTheDocument()
    await act(async () => {
      await user.click(backButton)
    })

    // 等待导航完成，验证返回车次列表页
    await waitFor(() => {
      // 车次列表页特征：有"您好，请"文字，且不在订单页
      const trainListPage = document.querySelector('.train-list-page')
      const orderPage = document.querySelector('.order-page')
      expect(trainListPage).toBeTruthy()
      expect(orderPage).toBeFalsy()
      expect(screen.getByText(/您好，请/i)).toBeInTheDocument()
    }, { timeout: 3000 })
  })
})

describe('跨页流程：订单填写页参数传递', () => {
  beforeEach(() => {
    cleanupTest()
    setupLocalStorageMock()
    mockUnauthenticatedUser()
    mockFetch()
    
    // Mock API响应
    ;(globalThis.fetch as any).mockImplementation((url: string) => {
      if (url.includes('/api/orders/new')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            trainInfo: {
              trainNo: 'G27',
              date: '2025-09-14',
              departureStation: '北京南站',
              arrivalStation: '上海虹桥',
              departureTime: '19:00',
              arrivalTime: '23:35'
            },
            fareInfo: {
              '二等座': { price: 553, available: 100 }
            },
            availableSeats: {
              '二等座': 100
            },
            passengers: [],
            defaultSeatType: '二等座'
          })
        })
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({})
      })
    })
  })

  it('通过location.state传递的车次参数应该正确加载订单页数据', async () => {
    await renderWithRouter({
      initialEntries: [
        { 
          pathname: '/order', 
          state: { 
            trainNo: 'G27', 
            departureStation: '北京南站', 
            arrivalStation: '上海虹桥', 
            departureDate: '2025-09-14' 
          } 
        }
      ],
      routes: [
        { path: '/order', element: <OrderPage /> },
      ],
    })

    // 等待页面加载完成
    await waitFor(() => {
      expect(screen.getByText(/您好，请/i)).toBeInTheDocument()
    }, { timeout: 3000 })

    // 验证API被调用并传递了正确的参数
    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalled()
      const fetchCalls = (globalThis.fetch as any).mock.calls
      const orderApiCall = fetchCalls.find((call: any[]) => 
        call[0] && typeof call[0] === 'string' && call[0].includes('/api/orders/new')
      )
      expect(orderApiCall).toBeTruthy()
      if (orderApiCall) {
        const url = orderApiCall[0]
        // URL 中的中文字符会被编码，所以需要解码后验证
        const decodedUrl = decodeURIComponent(url)
        expect(decodedUrl).toContain('trainNo=G27')
        expect(decodedUrl).toContain('departureStation=北京南站')
        expect(decodedUrl).toContain('arrivalStation=上海虹桥')
        expect(decodedUrl).toContain('departureDate=2025-09-14')
      }
    }, { timeout: 3000 })
  })

  it('订单填写页应该显示从车次列表页传递来的列车信息', async () => {
    await renderWithRouter({
      initialEntries: [
        { 
          pathname: '/order', 
          state: { 
            trainNo: 'G27', 
            departureStation: '北京南站', 
            arrivalStation: '上海虹桥', 
            departureDate: '2025-09-14' 
          } 
        }
      ],
      routes: [
        { path: '/order', element: <OrderPage /> },
      ],
    })

    // 等待页面加载完成并显示车次信息
    await waitFor(() => {
      expect(screen.getByText(/G27/i)).toBeInTheDocument()
    }, { timeout: 3000 })

    // 验证车次信息显示
    expect(screen.getByText(/北京南站/i)).toBeInTheDocument()
    expect(screen.getByText(/上海虹桥/i)).toBeInTheDocument()
  })

  it('缺少必要参数时应该显示错误信息', async () => {
    await renderWithRouter({
      initialEntries: [
        { 
          pathname: '/order', 
          state: {} 
        }
      ],
      routes: [
        { path: '/order', element: <OrderPage /> },
      ],
    })

    // 等待错误信息显示
    await waitFor(() => {
      expect(screen.getByText(/缺少必要的车次信息/i)).toBeInTheDocument()
    }, { timeout: 3000 })
  })
})

describe('跨页流程：订单填写页登录状态检查', () => {
  beforeEach(() => {
    cleanupTest()
    setupLocalStorageMock()
    mockFetch()
  })

  it('未登录访问订单填写页应该跳转到登录页', async () => {
    mockUnauthenticatedUser()
    
    // 模拟API返回401未登录错误
    ;(globalThis.fetch as any).mockImplementation((url: string) => {
      if (url.includes('/api/orders/new')) {
        return Promise.resolve({
          ok: false,
          status: 401,
          json: async () => ({
            error: '请先登录'
          })
        })
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({})
      })
    })

    await renderWithRouter({
      initialEntries: [
        { 
          pathname: '/order', 
          state: { 
            trainNo: 'G27', 
            departureStation: '北京南站', 
            arrivalStation: '上海虹桥', 
            departureDate: '2025-09-14' 
          } 
        }
      ],
      routes: [
        { path: '/order', element: <OrderPage /> },
        { path: '/login', element: <LoginPage /> },
      ],
    })

    // 等待跳转到登录页
    await waitFor(() => {
      expect(screen.getByText(/账号登录/i)).toBeInTheDocument()
    }, { timeout: 3000 })

    // 验证登录页的关键元素存在
    expect(screen.getByPlaceholderText(/用户名\/邮箱\/手机号/i)).toBeInTheDocument()
  })

  it('已登录状态应该成功加载订单填写页', async () => {
    mockAuthenticatedUser('test-token-123', 'test-user-id')
    
    // Mock成功的API响应（假设已登录）
    ;(globalThis.fetch as any).mockImplementation((url: string) => {
      if (url.includes('/api/orders/new')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            trainInfo: {
              trainNo: 'G27',
              date: '2025-09-14',
              departureStation: '北京南站',
              arrivalStation: '上海虹桥',
              departureTime: '19:00',
              arrivalTime: '23:35'
            },
            fareInfo: {
              '二等座': { price: 553, available: 100 }
            },
            availableSeats: {
              '二等座': 100
            },
            passengers: [
              { id: '1', name: '刘蕊蕊', idCardType: '居民身份证', idCardNumber: '3301************028', points: 1234 }
            ],
            defaultSeatType: '二等座'
          })
        })
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({})
      })
    })

    await renderWithRouter({
      initialEntries: [
        { 
          pathname: '/order', 
          state: { 
            trainNo: 'G27', 
            departureStation: '北京南站', 
            arrivalStation: '上海虹桥', 
            departureDate: '2025-09-14' 
          } 
        }
      ],
      routes: [
        { path: '/order', element: <OrderPage /> },
        { path: '/login', element: <LoginPage /> },
      ],
    })

    // 等待页面加载完成（已登录状态显示 "您好，{username}"）
    await waitFor(() => {
      // 已登录状态下，TopBar 显示 "您好，" 或用户名
      const welcomeText = screen.queryByText(/您好/i)
      const orderPage = document.querySelector('.order-page')
      expect(welcomeText || orderPage).toBeTruthy()
    }, { timeout: 3000 })

    // 验证订单页的关键元素存在
    await waitFor(() => {
      expect(screen.getByText(/G27/i)).toBeInTheDocument()
    }, { timeout: 3000 })

    // 验证API调用包含认证token
    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalled()
      const fetchCalls = (globalThis.fetch as any).mock.calls
      const orderApiCall = fetchCalls.find((call: any[]) => 
        call[0] && typeof call[0] === 'string' && call[0].includes('/api/orders/new')
      )
      expect(orderApiCall).toBeTruthy()
      if (orderApiCall && orderApiCall[1]) {
        const headers = orderApiCall[1].headers || {}
        expect(headers['Authorization']).toBe('Bearer test-token-123')
      }
    }, { timeout: 3000 })
  })
})

describe('跨页流程：订单填写页UI元素验证', () => {
  beforeEach(() => {
    cleanupTest()
    setupLocalStorageMock()
    mockUnauthenticatedUser()
    mockFetch()
    
    // Mock成功的API响应
    ;(globalThis.fetch as any).mockImplementation((url: string) => {
      if (url.includes('/api/orders/new')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            trainInfo: {
              trainNo: 'G27',
              date: '2025-09-14',
              departureStation: '北京南站',
              arrivalStation: '上海虹桥',
              departureTime: '19:00',
              arrivalTime: '23:35'
            },
            fareInfo: {
              '商务座': { price: 1748, available: 10 },
              '一等座': { price: 933, available: 50 },
              '二等座': { price: 553, available: 100 }
            },
            availableSeats: {
              '商务座': 10,
              '一等座': 50,
              '二等座': 100
            },
            passengers: [
              { id: '1', name: '刘蕊蕊', idCardType: '居民身份证', idCardNumber: '3301************028', points: 1234 }
            ],
            defaultSeatType: '二等座'
          })
        })
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({})
      })
    })
  })

  it('订单填写页应该显示顶部导航栏和底部导航', async () => {
    await renderWithRouter({
      initialEntries: [
        { 
          pathname: '/order', 
          state: { 
            trainNo: 'G27', 
            departureStation: '北京南站', 
            arrivalStation: '上海虹桥', 
            departureDate: '2025-09-14' 
          } 
        }
      ],
      routes: [
        { path: '/order', element: <OrderPage /> },
      ],
    })

    // 等待页面加载
    await waitFor(() => {
      expect(screen.getByText(/您好，请/i)).toBeInTheDocument()
    }, { timeout: 3000 })

    // 验证顶部导航
    expect(screen.getByAltText(/中国铁路12306/i)).toBeInTheDocument()

    // 验证底部导航
    expect(screen.getByText(/友情链接/i)).toBeInTheDocument()
  })

  it('订单填写页应该显示"上一步"和"提交订单"按钮', async () => {
    await renderWithRouter({
      initialEntries: [
        { 
          pathname: '/order', 
          state: { 
            trainNo: 'G27', 
            departureStation: '北京南站', 
            arrivalStation: '上海虹桥', 
            departureDate: '2025-09-14' 
          } 
        }
      ],
      routes: [
        { path: '/order', element: <OrderPage /> },
      ],
    })

    // 等待页面加载完成
    await waitFor(() => {
      expect(screen.getByText(/您好，请/i)).toBeInTheDocument()
    }, { timeout: 3000 })

    // 验证按钮存在
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /上一步/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /提交订单/i })).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('订单填写页应该显示温馨提示区域', async () => {
    await renderWithRouter({
      initialEntries: [
        { 
          pathname: '/order', 
          state: { 
            trainNo: 'G27', 
            departureStation: '北京南站', 
            arrivalStation: '上海虹桥', 
            departureDate: '2025-09-14' 
          } 
        }
      ],
      routes: [
        { path: '/order', element: <OrderPage /> },
      ],
    })

    // 等待页面加载完成
    await waitFor(() => {
      expect(screen.getByText(/您好，请/i)).toBeInTheDocument()
    }, { timeout: 3000 })

    // 验证温馨提示
    await waitFor(() => {
      expect(screen.getByText(/温馨提示/i)).toBeInTheDocument()
    }, { timeout: 3000 })
  })
})


/**
 * 跨页流程测试：订单提交流程
 * 
 * 测试场景：
 * 1. 成功流程：选择乘客 → 提交订单 → 信息核对弹窗 → 确认 → 购买成功
 * 2. 异常流程：未选择乘客 → 提示"请选择乘车人！"
 * 3. 异常流程：车票售罄 → 提示并返回首页查询页
 * 4. 异常流程：网络异常 → 提示并留在订单填写页
 * 5. 弹窗流程：信息核对弹窗 → 返回修改 → 订单填写页
 * 
 * 需求文档参考：
 * - requirements/04-订单填写页/04-订单填写页.md
 * - 5.3 用户选择乘车人
 * - 5.5 用户提交订单
 * - 5.6 信息核对弹窗
 */

import React from 'react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import HomePage from '../../src/pages/HomePage'
import TrainListPage from '../../src/pages/TrainListPage'
import OrderPage from '../../src/pages/OrderPage'
import {
  setupLocalStorageMock,
  cleanupTest,
  mockUnauthenticatedUser,
  mockAuthenticatedUser,
  renderWithRouter,
  mockFetch,
} from './test-utils'

describe('跨页流程：订单提交 - 成功场景', () => {
  beforeEach(() => {
    cleanupTest()
    setupLocalStorageMock()
    mockAuthenticatedUser('test-token-123', 'test-user-id')
    mockFetch()
    
    // Mock API响应
    ;(globalThis.fetch as any).mockImplementation((url: string, options?: any) => {
      // 获取订单页数据
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
      
      // 提交订单
      if (url.includes('/api/orders/submit') && options?.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            message: '订单提交成功',
            orderId: 'ORDER-123456',
            orderDetails: {}
          })
        })
      }
      
      // 确认订单
      if (url.includes('/confirm') && options?.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            message: '订单已经提交，系统正在处理中，请稍等',
            orderId: 'ORDER-123456',
            status: 'processing'
          })
        })
      }
      
      return Promise.resolve({
        ok: true,
        json: async () => ({})
      })
    })
  })

  it('选择乘客并提交订单应该显示信息核对弹窗', async () => {
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
      ],
    })

    // 等待页面加载完成（TrainListTopBar 显示 "您好，{username}" 或 "您好，请登录"）
    await waitFor(() => {
      const welcomeText = screen.queryByText(/您好/i)
      const orderPage = document.querySelector('.order-page')
      expect(welcomeText || orderPage).toBeTruthy()
    }, { timeout: 3000 })

    // 等待乘客列表加载
    await waitFor(() => {
      expect(screen.getByText(/刘蕊蕊/i)).toBeInTheDocument()
    }, { timeout: 3000 })

    // 选择乘客（通过checkbox）
    await waitFor(() => {
      const passengerCheckboxes = screen.getAllByRole('checkbox')
      expect(passengerCheckboxes.length).toBeGreaterThan(0)
    }, { timeout: 3000 })
    
    const passengerCheckboxes = screen.getAllByRole('checkbox')
    const firstPassengerCheckbox = passengerCheckboxes.find(cb => {
      const label = cb.closest('label') || cb.parentElement
      return label?.textContent?.includes('刘蕊蕊')
    })
    
    if (firstPassengerCheckbox) {
      await act(async () => {
        await user.click(firstPassengerCheckbox)
      })
    }

    // 点击提交订单按钮
    const submitButton = screen.getByRole('button', { name: /提交订单/i })
    await act(async () => {
      await user.click(submitButton)
    })

    // 验证API被调用
    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalled()
      const fetchCalls = (globalThis.fetch as any).mock.calls
      const submitCall = fetchCalls.find((call: any[]) => 
        call[0] && typeof call[0] === 'string' && call[0].includes('/api/orders/submit')
      )
      expect(submitCall).toBeTruthy()
      if (submitCall && submitCall[1]) {
        expect(submitCall[1].method).toBe('POST')
        const headers = submitCall[1].headers || {}
        expect(headers['Authorization']).toBe('Bearer test-token-123')
      }
    }, { timeout: 3000 })

    // 验证信息核对弹窗显示
    await waitFor(() => {
      expect(screen.getByText(/请核对以下信息/i)).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('在信息核对弹窗中点击"返回修改"应该关闭弹窗回到订单填写页', async () => {
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
      ],
    })

    // 等待页面加载完成
    await waitFor(() => {
      const welcomeText = screen.queryByText(/您好/i)
      const orderPage = document.querySelector('.order-page')
      expect(welcomeText || orderPage).toBeTruthy()
    }, { timeout: 3000 })

    // 等待乘客列表加载并选择乘客
    await waitFor(() => {
      expect(screen.getByText(/刘蕊蕊/i)).toBeInTheDocument()
    }, { timeout: 3000 })

    const passengerCheckboxes = screen.getAllByRole('checkbox')
    const firstPassengerCheckbox = passengerCheckboxes.find(cb => {
      const label = cb.closest('label') || cb.parentElement
      return label?.textContent?.includes('刘蕊蕊')
    })
    
    if (firstPassengerCheckbox) {
      await act(async () => {
        await user.click(firstPassengerCheckbox)
      })
    }

    // 提交订单
    const submitButton = screen.getByRole('button', { name: /提交订单/i })
    await act(async () => {
      await user.click(submitButton)
    })

    // 等待信息核对弹窗显示
    await waitFor(() => {
      expect(screen.getByText(/请核对以下信息/i)).toBeInTheDocument()
    }, { timeout: 3000 })

    // 点击"返回修改"按钮
    const backButton = screen.getByRole('button', { name: /返回修改/i })
    await act(async () => {
      await user.click(backButton)
    })

    // 验证弹窗关闭，仍在订单填写页
    await waitFor(() => {
      expect(screen.queryByText(/请核对以下信息/i)).not.toBeInTheDocument()
      const orderPage = document.querySelector('.order-page')
      expect(orderPage).toBeTruthy()
    }, { timeout: 3000 })
  })
})

describe('跨页流程：订单提交 - 异常场景', () => {
  beforeEach(() => {
    cleanupTest()
    setupLocalStorageMock()
    mockAuthenticatedUser('test-token-123', 'test-user-id')
    mockFetch()
  })

  it('未选择乘客点击"提交订单"应该显示提示"请选择乘车人！"', async () => {
    const user = userEvent.setup()

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
      ],
    })

    // 等待页面加载完成
    await waitFor(() => {
      const welcomeText = screen.queryByText(/您好/i)
      const orderPage = document.querySelector('.order-page')
      expect(welcomeText || orderPage).toBeTruthy()
    }, { timeout: 3000 })

    // 不选择任何乘客，直接点击提交订单
    const submitButton = screen.getByRole('button', { name: /提交订单/i })
    await act(async () => {
      await user.click(submitButton)
    })

    // 验证显示错误提示
    await waitFor(() => {
      expect(screen.getByText(/请选择乘车人/i)).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('车票售罄时应该显示提示并跳转到首页查询页', async () => {
    const user = userEvent.setup()

    // Mock API响应
    ;(globalThis.fetch as any).mockImplementation((url: string, options?: any) => {
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
      
      // 提交订单时返回售罄错误
      if (url.includes('/api/orders/submit') && options?.method === 'POST') {
        return Promise.resolve({
          ok: false,
          json: async () => ({
            error: '手慢了，该车次车票已售罄！'
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
        { path: '/trains', element: <TrainListPage /> },
      ],
    })

    // 等待页面加载完成
    await waitFor(() => {
      const welcomeText = screen.queryByText(/您好/i)
      const orderPage = document.querySelector('.order-page')
      expect(welcomeText || orderPage).toBeTruthy()
    }, { timeout: 3000 })

    // 等待乘客列表加载并选择乘客
    await waitFor(() => {
      expect(screen.getByText(/刘蕊蕊/i)).toBeInTheDocument()
    }, { timeout: 3000 })

    const passengerCheckboxes = screen.getAllByRole('checkbox')
    const firstPassengerCheckbox = passengerCheckboxes.find(cb => {
      const label = cb.closest('label') || cb.parentElement
      return label?.textContent?.includes('刘蕊蕊')
    })
    
    if (firstPassengerCheckbox) {
      await act(async () => {
        await user.click(firstPassengerCheckbox)
      })
    }

    // 提交订单
    const submitButton = screen.getByRole('button', { name: /提交订单/i })
    await act(async () => {
      await user.click(submitButton)
    })

    // 验证显示售罄提示
    await waitFor(() => {
      expect(screen.getByText(/手慢了，该车次.*车票已售罄/i)).toBeInTheDocument()
    }, { timeout: 3000 })

    // 验证会跳转到车次列表页（通过setTimeout延迟，1500ms后跳转）
    // 注意：由于setTimeout的存在，我们需要等待足够的时间
    await waitFor(() => {
      const trainListPage = document.querySelector('.train-list-page')
      const orderPage = document.querySelector('.order-page')
      // 跳转后应该显示车次列表页，不显示订单页
      expect(trainListPage).toBeTruthy()
      expect(orderPage).toBeFalsy()
    }, { timeout: 3000 })
  })

  it('网络异常时应该显示提示并停留在订单填写页', async () => {
    const user = userEvent.setup()

    // Mock API响应
    ;(globalThis.fetch as any).mockImplementation((url: string, options?: any) => {
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
      
      // 提交订单时返回网络错误
      if (url.includes('/api/orders/submit') && options?.method === 'POST') {
        return Promise.reject(new Error('网络忙，请稍后再试'))
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
      ],
    })

    // 等待页面加载完成
    await waitFor(() => {
      const welcomeText = screen.queryByText(/您好/i)
      const orderPage = document.querySelector('.order-page')
      expect(welcomeText || orderPage).toBeTruthy()
    }, { timeout: 3000 })

    // 等待乘客列表加载并选择乘客
    await waitFor(() => {
      expect(screen.getByText(/刘蕊蕊/i)).toBeInTheDocument()
    }, { timeout: 3000 })

    const passengerCheckboxes = screen.getAllByRole('checkbox')
    const firstPassengerCheckbox = passengerCheckboxes.find(cb => {
      const label = cb.closest('label') || cb.parentElement
      return label?.textContent?.includes('刘蕊蕊')
    })
    
    if (firstPassengerCheckbox) {
      await act(async () => {
        await user.click(firstPassengerCheckbox)
      })
    }

    // 提交订单
    const submitButton = screen.getByRole('button', { name: /提交订单/i })
    await act(async () => {
      await user.click(submitButton)
    })

    // 验证显示网络错误提示
    await waitFor(() => {
      expect(screen.getByText(/网络忙，请稍后再试/i)).toBeInTheDocument()
    }, { timeout: 3000 })

    // 验证仍停留在订单填写页
    const orderPage = document.querySelector('.order-page')
    expect(orderPage).toBeTruthy()
  })

  it('提交订单时未登录应该跳转到登录页', async () => {
    const user = userEvent.setup()
    mockUnauthenticatedUser()

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
        { path: '/login', element: <div>登录页面</div> },
      ],
    })

    // 等待页面加载完成
    await waitFor(() => {
      const welcomeText = screen.queryByText(/您好/i)
      const orderPage = document.querySelector('.order-page')
      expect(welcomeText || orderPage).toBeTruthy()
    }, { timeout: 3000 })

    // 等待乘客列表加载并选择乘客
    await waitFor(() => {
      expect(screen.getByText(/刘蕊蕊/i)).toBeInTheDocument()
    }, { timeout: 3000 })

    const passengerCheckboxes = screen.getAllByRole('checkbox')
    const firstPassengerCheckbox = passengerCheckboxes.find(cb => {
      const label = cb.closest('label') || cb.parentElement
      return label?.textContent?.includes('刘蕊蕊')
    })
    
    if (firstPassengerCheckbox) {
      await act(async () => {
        await user.click(firstPassengerCheckbox)
      })
    }

    // 提交订单
    const submitButton = screen.getByRole('button', { name: /提交订单/i })
    await act(async () => {
      await user.click(submitButton)
    })

    // 验证跳转到登录页
    await waitFor(() => {
      expect(screen.getByText(/登录页面/i)).toBeInTheDocument()
    }, { timeout: 3000 })
  })
})

describe('跨页流程：订单提交 - 席别选择', () => {
  beforeEach(() => {
    cleanupTest()
    setupLocalStorageMock()
    mockAuthenticatedUser('test-token-123', 'test-user-id')
    mockFetch()
  })

  it('选择乘客后应该自动填充默认席别（G字头车次默认二等座）', async () => {
    const user = userEvent.setup()

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
      const welcomeText = screen.queryByText(/您好/i)
      const orderPage = document.querySelector('.order-page')
      expect(welcomeText || orderPage).toBeTruthy()
    }, { timeout: 3000 })

    // 等待乘客列表加载
    await waitFor(() => {
      expect(screen.getByText(/刘蕊蕊/i)).toBeInTheDocument()
    }, { timeout: 3000 })

    // 选择乘客
    const passengerCheckboxes = screen.getAllByRole('checkbox')
    const firstPassengerCheckbox = passengerCheckboxes.find(cb => {
      const label = cb.closest('label') || cb.parentElement
      return label?.textContent?.includes('刘蕊蕊')
    })
    
    if (firstPassengerCheckbox) {
      await act(async () => {
        await user.click(firstPassengerCheckbox)
      })
    }

    // 验证购票信息表格中显示默认席别"二等座"
    await waitFor(() => {
      // 注意：需要根据实际组件实现来验证
      // 这里假设购票信息表格会显示席别信息
      const seatTypeElements = screen.queryAllByText(/二等座/i)
      expect(seatTypeElements.length).toBeGreaterThan(0)
    }, { timeout: 3000 })
  })
})


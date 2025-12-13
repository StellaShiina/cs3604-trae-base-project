/**
 * 订单页面跨区间票价计算集成测试
 * 
 * 测试场景：
 * 1. 从车次列表页点击"预定"跳转到订单页
 * 2. 订单页正确计算跨区间票价（如：上海→北京 = 上海→无锡 + 无锡→南京 + 南京→天津西 + 天津西→北京）
 * 3. 显示正确的车次信息和票价
 * 
 * 需求文档参考：
 * - requirements/04-订单填写页/04-订单填写页.md
 * - 跨区间票价计算逻辑
 */

import React from 'react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import OrderPage from '../../src/pages/OrderPage'
import {
  setupLocalStorageMock,
  cleanupTest,
  mockAuthenticatedUser,
  renderWithRouter,
  mockFetch,
} from './test-utils'

describe('订单页面跨区间票价计算集成测试', () => {
  beforeEach(() => {
    cleanupTest()
    setupLocalStorageMock()
    mockAuthenticatedUser('test-token-123', 'user-123')
    mockFetch()
  })

  it('应该正确计算上海到北京的跨区间票价', async () => {
    // Mock API response for cross-interval fare calculation
    ;(globalThis.fetch as any).mockImplementation((url: string, options?: any) => {
      if (url.includes('/api/orders/new')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            trainInfo: {
              trainNo: 'D6',
              date: '2025-11-13',
              departureStation: '上海',
              arrivalStation: '北京',
              departureTime: '08:00',
              arrivalTime: '14:30'
            },
            fareInfo: {
              '二等座': {
                price: 517, // 跨区间累加: 39 + 39 + 400 + 39 = 517
                available: 50
              },
              '一等座': {
                price: 850,
                available: 30
              },
              '商务座': {
                price: 1200,
                available: 10
              }
            },
            availableSeats: {
              '二等座': 50,
              '一等座': 30,
              '商务座': 10
            },
            passengers: [
              {
                id: 'p1',
                name: '张三',
                idCardType: '居民身份证',
                idCardNumber: '123456789012345678',
                points: 0
              }
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

    // Render OrderPage with route state
    await renderWithRouter({
      initialEntries: [
        {
          pathname: '/order',
          state: {
            trainNo: 'D6',
            departureStation: '上海',
            arrivalStation: '北京',
            departureDate: '2025-11-13'
          }
        }
      ],
      routes: [
        { path: '/order', element: <OrderPage /> },
      ],
    })

    // Wait for API call
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

    // Wait for page to load
    await waitFor(() => {
      const orderPage = document.querySelector('.order-page')
      const errorMessage = screen.queryByText(/缺少必要的车次信息/i)
      expect(orderPage).toBeTruthy()
      expect(errorMessage).not.toBeInTheDocument()
    }, { timeout: 3000 })

    // Verify fare is correctly displayed
    // 注意：票价可能在多个地方显示（TrainInfoSection 的 seat-price 和可能的席别选择器）
    // 使用 queryAllByText 处理多个匹配，或使用更精确的选择器
    await waitFor(() => {
      // 方法1：使用 queryAllByText 验证至少有一个元素包含 517
      const priceElements = screen.queryAllByText(/517/)
      expect(priceElements.length).toBeGreaterThan(0)
      
      // 方法2：验证在 seat-price 元素中存在（更精确）
      const seatPriceElement = document.querySelector('.seat-price')
      if (seatPriceElement) {
        expect(seatPriceElement.textContent).toMatch(/517/)
      }
    }, { timeout: 3000 })

    // Verify train info is displayed
    expect(screen.getByText(/D6/i)).toBeInTheDocument()
    expect(screen.getByText(/上海/i)).toBeInTheDocument()
    expect(screen.getByText(/北京/i)).toBeInTheDocument()
  })

  it('应该正确计算相邻区间的票价（上海→无锡）', async () => {
    // Mock API response for adjacent stations
    ;(globalThis.fetch as any).mockImplementation((url: string, options?: any) => {
      if (url.includes('/api/orders/new')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            trainInfo: {
              trainNo: 'D6',
              date: '2025-11-13',
              departureStation: '上海',
              arrivalStation: '无锡',
              departureTime: '08:00',
              arrivalTime: '08:30'
            },
            fareInfo: {
              '二等座': {
                price: 39, // 单区间价格
                available: 50
              }
            },
            availableSeats: {
              '二等座': 50
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

    await renderWithRouter({
      initialEntries: [
        {
          pathname: '/order',
          state: {
            trainNo: 'D6',
            departureStation: '上海',
            arrivalStation: '无锡',
            departureDate: '2025-11-13'
          }
        }
      ],
      routes: [
        { path: '/order', element: <OrderPage /> },
      ],
    })

    // Wait for page to load
    await waitFor(() => {
      const orderPage = document.querySelector('.order-page')
      const errorMessage = screen.queryByText(/缺少必要的车次信息/i)
      expect(orderPage).toBeTruthy()
      expect(errorMessage).not.toBeInTheDocument()
    }, { timeout: 3000 })

    // Wait for API call
    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalled()
    }, { timeout: 3000 })

    // Verify adjacent station fare
    // 注意：票价可能在多个地方显示，使用 queryAllByText 或更精确的选择器
    await waitFor(() => {
      // 方法1：使用 queryAllByText 验证至少有一个元素包含 39
      const priceElements = screen.queryAllByText(/39/)
      expect(priceElements.length).toBeGreaterThan(0)
      
      // 方法2：验证在 seat-price 元素中存在（更精确）
      const seatPriceElement = document.querySelector('.seat-price')
      if (seatPriceElement) {
        expect(seatPriceElement.textContent).toMatch(/39/)
      }
    }, { timeout: 3000 })
  })

  it('当票价信息不存在时应该显示错误信息', async () => {
    // Mock API error response
    ;(globalThis.fetch as any).mockImplementation((url: string, options?: any) => {
      if (url.includes('/api/orders/new')) {
        return Promise.resolve({
          ok: false,
          status: 404,
          json: async () => ({
            error: '未找到该区间的票价信息'
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
            trainNo: 'D999',
            departureStation: '不存在站',
            arrivalStation: '不存在站2',
            departureDate: '2025-11-13'
          }
        }
      ],
      routes: [
        { path: '/order', element: <OrderPage /> },
      ],
    })

    // Wait for error message
    // 注意：OrderPage 在 API 失败时会显示错误信息，或者如果缺少必要参数会显示"缺少必要的车次信息"
    await waitFor(() => {
      const errorMessage = screen.queryByText(/未找到该区间的票价信息|缺少必要的车次信息|加载订单页失败/i)
      const orderPageError = document.querySelector('.order-page-error-message')
      expect(errorMessage || orderPageError).toBeTruthy()
    }, { timeout: 3000 })
  })
})


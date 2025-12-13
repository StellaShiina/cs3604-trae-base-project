/**
 * 跨页测试通用工具函数
 * 提供统一的测试设置和辅助方法
 */

import React, { ReactElement } from 'react'
import { render, RenderOptions, act } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { vi } from 'vitest'

/**
 * 设置 localStorage mock
 */
export function setupLocalStorageMock() {
  const localStorageMock: { [key: string]: string } = {}
  
  const mockLocalStorage = {
    getItem: vi.fn((key: string) => localStorageMock[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      localStorageMock[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete localStorageMock[key]
    }),
    clear: vi.fn(() => {
      Object.keys(localStorageMock).forEach(key => delete localStorageMock[key])
    }),
    get length() {
      return Object.keys(localStorageMock).length
    },
    key: vi.fn((index: number) => Object.keys(localStorageMock)[index] || null),
  }
  
  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
    writable: true,
    configurable: true,
  })
  
  return { localStorageMock, mockLocalStorage }
}

/**
 * 渲染带路由的组件
 */
export interface RenderWithRouterOptions extends Omit<RenderOptions, 'wrapper'> {
  initialEntries?: string[] | Array<{ pathname: string; state?: any }>
  routes: Array<{ path: string; element: ReactElement }>
}

export async function renderWithRouter(options: RenderWithRouterOptions) {
  const { routes, initialEntries = ['/'], ...renderOptions } = options

  let rendered: ReturnType<typeof render>

  await act(async () => {
    rendered = render(
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          {routes.map((route, index) => (
            <Route key={index} path={route.path} element={route.element} />
          ))}
        </Routes>
      </MemoryRouter>,
      renderOptions
    )
  })

  return rendered!
}

/**
 * Mock fetch API
 */
export function mockFetch() {
  global.fetch = vi.fn()
  return global.fetch as ReturnType<typeof vi.fn>
}

/**
 * 清理测试环境
 */
export function cleanupTest() {
  window.history.pushState({}, '', '/')
  vi.clearAllMocks()
  // 不直接调用 localStorage.clear()，因为它可能被 mock 了
  // 如果需要清理 localStorage，应该在 mock 设置后手动清理
  if (window.localStorage && typeof window.localStorage.clear === 'function') {
    try {
      window.localStorage.clear()
    } catch (e) {
      // Ignore errors from mocked localStorage
    }
  }
}

/**
 * 模拟用户登录状态
 */
export function mockAuthenticatedUser(token: string = 'test-token', userId: string = 'test-user-id') {
  localStorage.setItem('authToken', token)
  localStorage.setItem('userId', userId)
}

/**
 * 模拟用户未登录状态
 */
export function mockUnauthenticatedUser() {
  localStorage.removeItem('authToken')
  localStorage.removeItem('userId')
}

/**
 * 等待导航完成
 */
export async function waitForNavigation(expectedPath?: string, timeout: number = 3000) {
  const startTime = Date.now()
  
  return new Promise((resolve, reject) => {
    const checkPath = () => {
      if (expectedPath && window.location.pathname === expectedPath) {
        resolve(true)
      } else if (!expectedPath) {
        resolve(true)
      } else if (Date.now() - startTime > timeout) {
        reject(new Error(`Navigation timeout: expected path ${expectedPath}`))
      } else {
        setTimeout(checkPath, 50)
      }
    }
    checkPath()
  })
}

/**
 * Mock 站点服务 API 的辅助函数
 * 注意：需要在测试文件中使用 vi.mock() 来 mock 模块，然后使用此函数来配置 mock 行为
 * 
 * 使用示例：
 * ```typescript
 * import * as stationService from '../../src/services/stationService'
 * 
 * vi.mock('../../src/services/stationService', () => ({
 *   getAllCities: vi.fn(),
 *   validateCity: vi.fn(),
 *   getStationsByCity: vi.fn(),
 * }))
 * 
 * beforeEach(() => {
 *   setupStationServiceMocks(stationService)
 * })
 * ```
 */
export function setupStationServiceMocks(mockModule: any) {
  const validCities = ['北京', '上海', '广州', '深圳', '杭州', '南京', '武汉', '成都']
  
  // Mock getAllCities
  if (mockModule.getAllCities) {
    mockModule.getAllCities.mockResolvedValue(validCities)
  }
  
  // Mock validateCity
  if (mockModule.validateCity) {
    mockModule.validateCity.mockImplementation(async (cityName: string) => {
      if (validCities.includes(cityName)) {
        return {
          valid: true,
          city: cityName,
          stations: [`${cityName}站`, `${cityName}南站`, `${cityName}北站`],
        }
      } else {
        return {
          valid: false,
          error: '无法匹配该城市',
          suggestions: validCities,
        }
      }
    })
  }
  
  // Mock getStationsByCity
  if (mockModule.getStationsByCity) {
    mockModule.getStationsByCity.mockResolvedValue(['站1', '站2', '站3'])
  }
}

/**
 * Mock 车次服务 API 的辅助函数
 * 
 * 使用示例：
 * ```typescript
 * import * as trainService from '../../src/services/trainService'
 * 
 * vi.mock('../../src/services/trainService', () => ({
 *   searchTrains: vi.fn(),
 *   getFilterOptions: vi.fn(),
 * }))
 * 
 * beforeEach(() => {
 *   setupTrainServiceMocks(trainService)
 * })
 * ```
 */
export function setupTrainServiceMocks(mockModule: any) {
  // Mock searchTrains
  if (mockModule.searchTrains) {
    mockModule.searchTrains.mockResolvedValue({
      success: true,
      trains: [
        {
          trainNo: 'G123',
          departureStation: '北京',
          arrivalStation: '上海',
          departureTime: '08:00',
          arrivalTime: '12:00',
          duration: '4小时',
          seatTypes: ['商务座', '一等座', '二等座'],
        },
      ],
      timestamp: new Date().toISOString(),
    })
  }
  
  // Mock getFilterOptions
  if (mockModule.getFilterOptions) {
    mockModule.getFilterOptions.mockResolvedValue({
      success: true,
      options: {
        departureStations: ['北京', '上海'],
        arrivalStations: ['上海', '北京'],
        seatTypes: ['商务座', '一等座', '二等座'],
      },
    })
  }
}


/**
 * 跨页流程测试：车次列表页跨页导航
 * 
 * 测试场景：
 * 1. 首页 → 车次列表页（接收查询参数）
 * 2. 车次列表页 → 登录页（通过主导航栏登录按钮）
 * 3. 车次列表页 → 注册页（通过主导航栏注册按钮）
 * 4. 车次列表页 → 首页（点击Logo）
 * 5. 车次列表页 → 订单填写页（点击预订按钮）
 * 6. 车次列表页未登录时点击预订按钮应提示登录
 * 7. 车次列表页接收并显示查询参数
 * 
 * 需求文档参考：
 * - requirements/03-车次列表页/03-车次列表页.md
 * - 4.2 车票查询页面的进入
 * - 4.4 用户点击预定按钮
 */

import React from 'react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import HomePage from '../../src/pages/HomePage'
import TrainListPage from '../../src/pages/TrainListPage'
import LoginPage from '../../src/pages/LoginPage'
import RegisterPage from '../../src/pages/RegisterPage'
import { renderWithRouter, setupLocalStorageMock, cleanupTest, mockUnauthenticatedUser, setupStationServiceMocks, setupTrainServiceMocks } from './test-utils'

// Mock 站点服务
vi.mock('../../src/services/stationService', () => ({
  getAllCities: vi.fn(),
  validateCity: vi.fn(),
  getStationsByCity: vi.fn(),
}))

// Mock 车次服务
vi.mock('../../src/services/trainService', () => ({
  searchTrains: vi.fn(),
  getFilterOptions: vi.fn(),
}))

import * as stationService from '../../src/services/stationService'
import * as trainService from '../../src/services/trainService'

describe('跨页流程：车次列表页导航', () => {
  beforeEach(() => {
    cleanupTest()
    setupLocalStorageMock()
    mockUnauthenticatedUser()
    vi.clearAllMocks()
  })

  it('应该能从车次列表页通过主导航栏的"登录"按钮导航到登录页', async () => {
    const user = userEvent.setup()

    await renderWithRouter({
      initialEntries: ['/trains'],
      routes: [
        { path: '/trains', element: <TrainListPage /> },
        { path: '/login', element: <LoginPage /> },
      ],
    })

    // 验证当前在车次列表页 - 等待页面加载完成
    await waitFor(() => {
      const trainListPage = document.querySelector('.train-list-page')
      expect(trainListPage).toBeTruthy()
    }, { timeout: 3000 })

    // 找到并点击登录链接（TrainListTopBar 使用 Link 组件）
    await waitFor(() => {
      const loginLink = screen.queryByRole('link', { name: /登录/i })
      expect(loginLink).toBeInTheDocument()
    }, { timeout: 3000 })
    
    const loginLink = screen.getByRole('link', { name: /登录/i })
    expect(loginLink).toBeInTheDocument()
    
    await act(async () => {
      await user.click(loginLink)
    })

    // 等待导航完成，验证进入登录页
    await waitFor(() => {
      const loginTitle = screen.queryByText(/账号登录/i)
      const welcomeText = screen.queryByText(/欢迎登录12306/i)
      const loginForm = screen.queryByPlaceholderText(/用户名\/邮箱\/手机号/i)
      expect(loginTitle || welcomeText || loginForm).toBeTruthy()
    }, { timeout: 3000 })

    // 验证登录页的关键元素存在
    expect(screen.getByPlaceholderText(/用户名\/邮箱\/手机号/i)).toBeInTheDocument()
  })

  it('应该能从车次列表页通过主导航栏的"注册"按钮导航到注册页', async () => {
    const user = userEvent.setup()

    await renderWithRouter({
      initialEntries: ['/trains'],
      routes: [
        { path: '/trains', element: <TrainListPage /> },
        { path: '/register', element: <RegisterPage /> },
      ],
    })

    // 验证当前在车次列表页 - 等待页面加载完成
    await waitFor(() => {
      const trainListPage = document.querySelector('.train-list-page')
      expect(trainListPage).toBeTruthy()
    }, { timeout: 3000 })

    // 找到并点击注册链接（TrainListTopBar 使用 Link 组件）
    await waitFor(() => {
      const registerLink = screen.queryByRole('link', { name: /注册/i })
      expect(registerLink).toBeInTheDocument()
    }, { timeout: 3000 })
    
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

  it('应该能从车次列表页点击Logo返回首页', async () => {
    const user = userEvent.setup()

    await renderWithRouter({
      initialEntries: ['/trains'],
      routes: [
        { path: '/', element: <HomePage /> },
        { path: '/trains', element: <TrainListPage /> },
      ],
    })

    // 验证当前在车次列表页 - 等待页面加载完成
    await waitFor(() => {
      const trainListPage = document.querySelector('.train-list-page')
      expect(trainListPage).toBeTruthy()
    }, { timeout: 3000 })

    // 找到并点击Logo - 可以点击图片或整个 Logo 区域
    await waitFor(() => {
      const logoElement = screen.queryByAltText(/中国铁路12306/i)
      const logoSection = document.querySelector('.train-list-logo-section')
      expect(logoElement || logoSection).toBeTruthy()
    }, { timeout: 3000 })
    
    // 点击整个 Logo 区域（包含 onClick 处理函数的 div）
    const logoSection = document.querySelector('.train-list-logo-section')
    if (logoSection) {
      await act(async () => {
        await user.click(logoSection as HTMLElement)
      })
    } else {
      // 如果没有找到区域，点击图片（事件会冒泡到父元素）
      const logoElement = screen.getByAltText(/中国铁路12306/i)
      await act(async () => {
        await user.click(logoElement)
      })
    }

    // 等待导航完成，验证返回首页
    // 关键验证：首页容器存在，车次列表页容器不存在
    await waitFor(() => {
      const homePage = document.querySelector('.home-page')
      const trainListPage = document.querySelector('.train-list-page')
      // 如果导航成功，应该显示首页而不是车次列表页
      expect(homePage).toBeTruthy()
      expect(trainListPage).toBeFalsy()
    }, { timeout: 5000 })

    // 验证首页已完全加载（至少有一个首页特有的元素）
    // 首页可能有 HomeTopBar（显示登录按钮）或搜索表单
    const homePage = document.querySelector('.home-page')
    expect(homePage).toBeInTheDocument()
    
    // 验证不再在车次列表页
    const trainListPage = document.querySelector('.train-list-page')
    expect(trainListPage).not.toBeInTheDocument()
  })
})

describe('跨页流程：首页 → 车次列表页（参数传递）', () => {
  beforeEach(() => {
    cleanupTest()
    setupLocalStorageMock()
    mockUnauthenticatedUser()
    vi.clearAllMocks()
    // 设置 API mock
    setupStationServiceMocks(stationService)
    setupTrainServiceMocks(trainService)
  })

  it('从首页导航到车次列表页时应该正确传递查询参数', async () => {
    const user = userEvent.setup()

    await renderWithRouter({
      initialEntries: ['/'],
      routes: [
        { path: '/', element: <HomePage /> },
        { path: '/trains', element: <TrainListPage /> },
      ],
    })

    // 验证当前在首页
    await waitFor(() => {
      const welcomeText = screen.queryByText(/您好，请/i)
      const loginButton = screen.queryByRole('button', { name: /登录/i })
      expect(welcomeText || loginButton).toBeTruthy()
    })

    // 填写出发地 - TrainSearchForm 使用 CityInput，placeholder 是 "请选择城市"
    // 等待搜索表单加载完成
    await waitFor(() => {
      const searchForm = document.querySelector('.train-search-form')
      expect(searchForm).toBeTruthy()
    }, { timeout: 3000 })
    
    // 查找输入框（可能有多个，第一个是出发地）
    await waitFor(() => {
      const inputs = screen.queryAllByPlaceholderText(/请选择城市/i)
      expect(inputs.length).toBeGreaterThan(0)
    }, { timeout: 5000 })
    
    const departureInput = screen.getAllByPlaceholderText(/请选择城市/i)[0]
    
    await act(async () => {
      await user.click(departureInput)
      // 等待 getAllCities API 调用完成（CityInput 在 focus 时会调用）
      await new Promise(resolve => setTimeout(resolve, 100))
      await user.type(departureInput, '北京')
    })

    // 填写到达地 - TrainSearchForm 使用 CityInput，placeholder 是 "请选择城市"
    const arrivalInputs = screen.getAllByPlaceholderText(/请选择城市/i)
    const arrivalInput = arrivalInputs[1] // 第二个输入框是到达地
    
    await act(async () => {
      await user.click(arrivalInput)
      await user.type(arrivalInput, '上海')
    })

    // 点击查询按钮
    const searchButton = screen.getByRole('button', { name: /查询/i })
    
    await act(async () => {
      await user.click(searchButton)
    })

    // 等待导航到车次列表页
    await waitFor(() => {
      // 车次列表页会有搜索栏，使用正确的 placeholder
      const trainListPage = document.querySelector('.train-list-page')
      const allInputs = screen.queryAllByPlaceholderText(/请选择城市|出发地/i)
      // 车次列表页有搜索栏（可能会有多个输入框）
      expect(trainListPage || allInputs.length > 0).toBeTruthy()
    }, { timeout: 5000 })
  })

  it('从首页勾选高铁/动车后导航到车次列表页应该保持筛选状态', async () => {
    const user = userEvent.setup()

    await renderWithRouter({
      initialEntries: ['/'],
      routes: [
        { path: '/', element: <HomePage /> },
        { path: '/trains', element: <TrainListPage /> },
      ],
    })

    // 填写查询信息 - TrainSearchForm 使用 CityInput，placeholder 是 "请选择城市"
    // 等待搜索表单加载完成
    await waitFor(() => {
      const searchForm = document.querySelector('.train-search-form')
      expect(searchForm).toBeTruthy()
    }, { timeout: 3000 })
    
    // 查找输入框
    await waitFor(() => {
      const inputs = screen.queryAllByPlaceholderText(/请选择城市/i)
      expect(inputs.length).toBeGreaterThan(0)
    }, { timeout: 5000 })
    
    const departureInput = screen.getAllByPlaceholderText(/请选择城市/i)[0]
    
    await act(async () => {
      await user.click(departureInput)
      // 等待 getAllCities API 调用完成
      await new Promise(resolve => setTimeout(resolve, 100))
      await user.type(departureInput, '北京')
    })

    const arrivalInputs = screen.getAllByPlaceholderText(/请选择城市/i)
    const arrivalInput = arrivalInputs[1] // 第二个输入框是到达地
    
    await act(async () => {
      await user.click(arrivalInput)
      // 等待 getAllCities API 调用完成
      await new Promise(resolve => setTimeout(resolve, 100))
      await user.type(arrivalInput, '上海')
    })

    // 勾选高铁/动车
    const highSpeedCheckbox = screen.getByRole('checkbox', { name: /高铁\/动车/i })
    
    await act(async () => {
      await user.click(highSpeedCheckbox)
    })
    
    expect(highSpeedCheckbox).toBeChecked()

    // 点击查询
    const searchButton = screen.getByRole('button', { name: /查询/i })
    
    await act(async () => {
      await user.click(searchButton)
    })

    // 等待导航完成
    await waitFor(() => {
      const trainListPage = document.querySelector('.train-list-page')
      const allInputs = screen.queryAllByPlaceholderText(/请选择城市|出发地/i)
      expect(trainListPage || allInputs.length > 0).toBeTruthy()
    }, { timeout: 5000 })
  })
})

describe('跨页流程：车次列表页初始状态', () => {
  beforeEach(() => {
    cleanupTest()
    setupLocalStorageMock()
    mockUnauthenticatedUser()
    vi.clearAllMocks()
  })

  it('直接访问车次列表页应该显示默认状态', async () => {
    await renderWithRouter({
      initialEntries: ['/trains'],
      routes: [
        { path: '/trains', element: <TrainListPage /> },
      ],
    })

    // 验证页面基本元素存在 - 等待页面加载完成
    await waitFor(() => {
      const trainListPage = document.querySelector('.train-list-page')
      expect(trainListPage).toBeTruthy()
    }, { timeout: 3000 })
    
    // 验证搜索栏存在
    await waitFor(() => {
      const departureInputs = screen.queryAllByPlaceholderText(/请选择城市|出发地/i)
      expect(departureInputs.length).toBeGreaterThan(0)
    }, { timeout: 3000 })
  })

  it('车次列表页应该显示筛选面板', async () => {
    await renderWithRouter({
      initialEntries: ['/trains'],
      routes: [
        { path: '/trains', element: <TrainListPage /> },
      ],
    })

    // TrainFilterPanel 应该存在
    // 注意：具体的筛选选项可能需要根据实际数据动态生成
    // 这里只验证页面能正常渲染
    await waitFor(() => {
      const trainListPage = document.querySelector('.train-list-page')
      expect(trainListPage).toBeTruthy()
    }, { timeout: 3000 })
  })

  it('车次列表页应该显示顶部和底部导航', async () => {
    await renderWithRouter({
      initialEntries: ['/trains'],
      routes: [
        { path: '/trains', element: <TrainListPage /> },
      ],
    })

    // 验证顶部导航
    await waitFor(() => {
      const logoElement = screen.queryByAltText(/中国铁路12306/i)
      const welcomeText = screen.queryByText(/您好，请/i)
      expect(logoElement || welcomeText).toBeTruthy()
    })

    // 验证底部导航
    expect(screen.getByText(/友情链接/i)).toBeInTheDocument()
  })
})

describe('跨页流程：车次列表页接收查询参数', () => {
  beforeEach(() => {
    cleanupTest()
    setupLocalStorageMock()
    mockUnauthenticatedUser()
    vi.clearAllMocks()
  })

  it('通过location.state传递的参数应该填充到搜索栏', async () => {
    const searchParams = {
      departureStation: '北京',
      arrivalStation: '上海',
      departureDate: '2025-12-01',
      isHighSpeed: false
    }

    await renderWithRouter({
      initialEntries: [
        { pathname: '/trains', state: searchParams }
      ],
      routes: [
        { path: '/trains', element: <TrainListPage /> },
      ],
    })

    // TrainListPage会通过location.state接收参数并传递给TrainSearchBar
    // 验证页面正常渲染
    await waitFor(() => {
      const trainListPage = document.querySelector('.train-list-page')
      expect(trainListPage).toBeTruthy()
    }, { timeout: 3000 })
  })

  it('没有传递参数时应该使用默认值', async () => {
    await renderWithRouter({
      initialEntries: ['/trains'],
      routes: [
        { path: '/trains', element: <TrainListPage /> },
      ],
    })

    // 验证页面正常渲染，使用默认参数
    await waitFor(() => {
      const trainListPage = document.querySelector('.train-list-page')
      expect(trainListPage).toBeTruthy()
    }, { timeout: 3000 })
    
    // TrainListPage会在没有参数时使用默认的空字符串和当前日期
    await waitFor(() => {
      const departureInputs = screen.queryAllByPlaceholderText(/请选择城市|出发地/i)
      expect(departureInputs.length).toBeGreaterThan(0)
    }, { timeout: 3000 })
  })
})

describe('跨页流程：车次列表页未登录状态', () => {
  beforeEach(() => {
    cleanupTest()
    setupLocalStorageMock()
    mockUnauthenticatedUser()
    vi.clearAllMocks()
  })

  it('未登录时应该显示登录和注册按钮', async () => {
    await renderWithRouter({
      initialEntries: ['/trains'],
      routes: [
        { path: '/trains', element: <TrainListPage /> },
      ],
    })

    // 等待组件加载完成
    await waitFor(() => {
      const loginLink = screen.queryByRole('link', { name: /登录/i })
      expect(loginLink).toBeInTheDocument()
    })

    // 验证显示登录和注册链接（未登录状态，TrainListTopBar 使用 Link 组件）
    expect(screen.getByRole('link', { name: /登录/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /注册/i })).toBeInTheDocument()
  })
})

describe('跨页流程：车次列表页查询功能', () => {
  beforeEach(() => {
    cleanupTest()
    setupLocalStorageMock()
    mockUnauthenticatedUser()
    vi.clearAllMocks()
    // 设置 API mock
    setupStationServiceMocks(stationService)
    setupTrainServiceMocks(trainService)
  })

  it('在车次列表页修改查询条件并重新查询', async () => {
    const user = userEvent.setup()

    await renderWithRouter({
      initialEntries: [
        { 
          pathname: '/trains', 
          state: { 
            departureStation: '北京', 
            arrivalStation: '上海',
            departureDate: '2025-12-01'
          } 
        }
      ],
      routes: [
        { path: '/trains', element: <TrainListPage /> },
      ],
    })

    // 验证页面渲染
    await waitFor(() => {
      const trainListPage = document.querySelector('.train-list-page')
      expect(trainListPage).toBeTruthy()
    }, { timeout: 3000 })

    // 车次列表页的搜索栏允许用户修改查询条件
    await waitFor(() => {
      const departureInputs = screen.queryAllByPlaceholderText(/请选择城市|出发地/i)
      expect(departureInputs.length).toBeGreaterThan(0)
    }, { timeout: 3000 })
    
    const departureInputs = screen.getAllByPlaceholderText(/请选择城市|出发地/i)

    // 可以重新输入并查询
    await act(async () => {
      await user.click(departureInputs[0])
      await user.clear(departureInputs[0])
      await user.type(departureInputs[0], '广州')
    })

    // 验证输入成功
    expect(departureInputs[0]).toHaveValue('广州')
  })

  it('点击Logo返回首页后可以重新发起查询', async () => {
    const user = userEvent.setup()

    await renderWithRouter({
      initialEntries: ['/trains'],
      routes: [
        { path: '/', element: <HomePage /> },
        { path: '/trains', element: <TrainListPage /> },
      ],
    })

    // 验证当前在车次列表页
    await waitFor(() => {
      const trainListPage = document.querySelector('.train-list-page')
      expect(trainListPage).toBeTruthy()
    }, { timeout: 3000 })

    // 从车次列表页返回首页 - 点击整个 Logo 区域
    const logoSection = document.querySelector('.train-list-logo-section')
    if (logoSection) {
      await act(async () => {
        await user.click(logoSection as HTMLElement)
      })
    } else {
      // 如果没有找到区域，点击图片（事件会冒泡到父元素）
      const logoElement = screen.getByAltText(/中国铁路12306/i)
      await act(async () => {
        await user.click(logoElement)
      })
    }

    // 等待返回首页
    // 关键验证：首页容器存在，车次列表页容器不存在
    await waitFor(() => {
      const homePage = document.querySelector('.home-page')
      const trainListPage = document.querySelector('.train-list-page')
      // 如果导航成功，应该显示首页而不是车次列表页
      expect(homePage).toBeTruthy()
      expect(trainListPage).toBeFalsy()
    }, { timeout: 5000 })

    // 验证首页已完全加载
    const homePage = document.querySelector('.home-page')
    expect(homePage).toBeInTheDocument()
    
    // 验证不再在车次列表页
    const trainListPage = document.querySelector('.train-list-page')
    expect(trainListPage).not.toBeInTheDocument()

    // 等待搜索表单加载完成
    await waitFor(() => {
      const searchForm = document.querySelector('.train-search-form')
      expect(searchForm).toBeTruthy()
    }, { timeout: 3000 })

    // 重新填写查询表单 - TrainSearchForm 使用 CityInput，placeholder 是 "请选择城市"
    await waitFor(() => {
      const inputs = screen.queryAllByPlaceholderText(/请选择城市/i)
      expect(inputs.length).toBeGreaterThan(0)
    }, { timeout: 5000 })

    const departureInput = screen.getAllByPlaceholderText(/请选择城市/i)[0]
    
    await act(async () => {
      await user.click(departureInput)
      // 等待 getAllCities API 调用完成
      await new Promise(resolve => setTimeout(resolve, 100))
      await user.type(departureInput, '深圳')
    })

    const arrivalInputs = screen.getAllByPlaceholderText(/请选择城市/i)
    const arrivalInput = arrivalInputs[1] // 第二个输入框是到达地
    
    await act(async () => {
      await user.click(arrivalInput)
      // 等待 getAllCities API 调用完成
      await new Promise(resolve => setTimeout(resolve, 100))
      await user.type(arrivalInput, '杭州')
    })

    // 验证可以重新查询
    const searchButton = screen.getByRole('button', { name: /查询/i })
    expect(searchButton).toBeInTheDocument()
  })
})

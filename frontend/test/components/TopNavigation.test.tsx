import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import TopNavigation from '../../src/components/TopNavigation'

describe('TopNavigation - 顶部导航组件', () => {
  const renderWithRouter = (component: React.ReactElement) => {
    return render(
      <BrowserRouter>
        {component}
      </BrowserRouter>
    )
  }

  it('应该渲染Logo区域', () => {
    renderWithRouter(<TopNavigation />)
    
    // 验证Logo图片存在（alt为"中国铁路12306"）
    const logo = screen.getByAltText(/中国铁路12306/i)
    expect(logo).toBeInTheDocument()
  })

  it('应该显示"欢迎登录12306"文字（当showWelcomeLogin为true时）', () => {
    // Given: 渲染组件并设置showWelcomeLogin为true
    renderWithRouter(<TopNavigation showWelcomeLogin={true} />)
    
    // Then: 应该显示欢迎文字
    expect(screen.getByText(/欢迎登录12306/i)).toBeInTheDocument()
  })

  it('默认状态应该显示登录/注册链接', () => {
    // Given: 渲染组件（默认showWelcomeLogin为false）
    renderWithRouter(<TopNavigation />)
    
    // Then: 应该显示登录和注册链接
    expect(screen.getByText(/登录/i)).toBeInTheDocument()
    expect(screen.getByText(/注册/i)).toBeInTheDocument()
  })

  it('应该支持Logo点击跳转到首页', () => {
    // Given: 渲染组件并传入onLogoClick回调
    const mockOnLogoClick = vi.fn()
    renderWithRouter(<TopNavigation onLogoClick={mockOnLogoClick} />)
    
    // When: 点击Logo区域
    const logoSection = screen.getByAltText(/中国铁路12306/i).closest('div')
    if (logoSection) {
      fireEvent.click(logoSection)
    }
    
    // Then: 应该调用onLogoClick回调
    expect(mockOnLogoClick).toHaveBeenCalledTimes(1)
  })

  it('应该显示Logo图片并包含正确的src和alt属性', () => {
    // Given: 渲染组件
    renderWithRouter(<TopNavigation />)
    
    // Then: 应该显示Logo图片
    const logoImage = screen.getByAltText(/中国铁路12306/i)
    expect(logoImage).toBeInTheDocument()
    expect(logoImage).toHaveAttribute('src', '/images/logo.png')
    expect(logoImage).toHaveAttribute('alt', '中国铁路12306')
  })

  it('应该包含中国铁路12306相关文字', () => {
    // Given: 渲染组件
    renderWithRouter(<TopNavigation />)
    
    // Then: 应该显示"中国铁路12306"文字
    expect(screen.getByText(/中国铁路12306/i)).toBeInTheDocument()
    
    // 应该显示"12306 CHINA RAILWAY"文字
    expect(screen.getByText(/12306 CHINA RAILWAY/i)).toBeInTheDocument()
  })

  it('应该有正确的布局结构', () => {
    // Given: 渲染组件
    const { container } = renderWithRouter(<TopNavigation />)
    
    // Then: 应该包含top-navigation类名的div
    const topNav = container.querySelector('.top-navigation')
    expect(topNav).toBeInTheDocument()
    
    // 应该包含logo-section类名的div
    const logoSection = container.querySelector('.logo-section')
    expect(logoSection).toBeInTheDocument()
  })
})


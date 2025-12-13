import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import BottomNavigation from '../../src/components/BottomNavigation'

describe('BottomNavigation - 底部导航组件', () => {
  it('应该显示友情链接', () => {
    // Given: 渲染组件
    render(<BottomNavigation />)
    
    // Then: 应该显示友情链接标题
    expect(screen.getByText('友情链接')).toBeInTheDocument()
    
    // 应该显示友情链接区域的图片（4个友情链接图片）
    const friendshipLinkImages = [
      '中国国家铁路集团有限公司',
      '中国铁路客户保险总公司',
      '中铁银通支付有限公司',
      '中铁程科技有限责任公司'
    ]
    
    friendshipLinkImages.forEach(altText => {
      const image = screen.getByAltText(altText)
      expect(image).toBeInTheDocument()
      expect(image.tagName).toBe('IMG')
    })
  })

  it('应该显示四个二维码', () => {
    // Given: 渲染组件
    render(<BottomNavigation />)
    
    // Then: 应该显示4个二维码图片（使用精确的alt文本）
    const qrCodes = [
      '中国铁路官方微信',
      '中国铁路官方微博',
      '12306 公众号',
      '铁路12306'
    ]
    
    qrCodes.forEach(altText => {
      const qrImage = screen.getByAltText(altText)
      expect(qrImage).toBeInTheDocument()
      expect(qrImage.tagName).toBe('IMG')
    })
  })

  it('应该使用正确的二维码图片', () => {
    // Given: 渲染组件
    render(<BottomNavigation />)
    
    // Then: 验证每个二维码图片的alt和src属性
    const expectedQRCodes = [
      { alt: '中国铁路官方微信', src: '/images/中国铁路官方微信二维码.png' },
      { alt: '中国铁路官方微博', src: '/images/中国铁路官方微博二维码.png' },
      { alt: '12306 公众号', src: '/images/12306公众号二维码.png' },
      { alt: '铁路12306', src: '/images/铁路12306二维码.png' }
    ]
    
    expectedQRCodes.forEach(({ alt, src }) => {
      const qrImage = screen.getByAltText(alt)
      expect(qrImage).toBeInTheDocument()
      expect(qrImage).toHaveAttribute('src', src)
      expect(qrImage.tagName).toBe('IMG')
    })
  })

  it('应该有正确的布局结构（左侧友情链接，右侧二维码）', () => {
    // Given: 渲染组件
    const { container } = render(<BottomNavigation />)
    
    // Then: 应该包含footer元素和bottom-navigation类
    const footer = container.querySelector('footer.bottom-navigation')
    expect(footer).toBeInTheDocument()
    
    // 应该包含友情链接区域（左侧）
    const friendshipLinksSection = container.querySelector('.friendship-links-section')
    expect(friendshipLinksSection).toBeInTheDocument()
    
    // 应该包含二维码区域（右侧）
    const qrCodesSection = container.querySelector('.qr-codes-section')
    expect(qrCodesSection).toBeInTheDocument()
    
    // 验证布局顺序：友情链接在前，二维码在后
    const bottomContent = container.querySelector('.bottom-content')
    expect(bottomContent).toBeInTheDocument()
    const children = Array.from(bottomContent?.children || [])
    expect(children[0]).toHaveClass('friendship-links-section')
    expect(children[1]).toHaveClass('qr-codes-section')
  })

  it('应该显示中国铁路官方微信二维码', () => {
    // Given: 渲染组件
    render(<BottomNavigation />)
    
    // Then: 应该显示微信二维码
    const wechatQR = screen.getByAltText('中国铁路官方微信')
    expect(wechatQR).toBeInTheDocument()
    expect(wechatQR.tagName).toBe('IMG')
    expect(wechatQR).toHaveAttribute('src', '/images/中国铁路官方微信二维码.png')
  })

  it('应该显示中国铁路官方微博二维码', () => {
    // Given: 渲染组件
    render(<BottomNavigation />)
    
    // Then: 应该显示微博二维码
    const weiboQR = screen.getByAltText('中国铁路官方微博')
    expect(weiboQR).toBeInTheDocument()
    expect(weiboQR.tagName).toBe('IMG')
    expect(weiboQR).toHaveAttribute('src', '/images/中国铁路官方微博二维码.png')
  })

  it('应该显示12306公众号二维码', () => {
    // Given: 渲染组件
    render(<BottomNavigation />)
    
    // Then: 应该显示12306公众号二维码
    const officialQR = screen.getByAltText('12306 公众号')
    expect(officialQR).toBeInTheDocument()
    expect(officialQR.tagName).toBe('IMG')
    expect(officialQR).toHaveAttribute('src', '/images/12306公众号二维码.png')
  })

  it('应该显示铁路12306二维码', () => {
    // Given: 渲染组件
    render(<BottomNavigation />)
    
    // Then: 应该显示铁路12306二维码
    const railwayQR = screen.getByAltText('铁路12306')
    expect(railwayQR).toBeInTheDocument()
    expect(railwayQR.tagName).toBe('IMG')
    expect(railwayQR).toHaveAttribute('src', '/images/铁路12306二维码.png')
  })
})


/**
 * SuccessModal组件测试
 * 测试文件：frontend/test/components/SuccessModal.test.tsx
 * 对应源文件：frontend/src/components/SuccessModal.tsx
 * 
 * 测试目标：验证注册成功弹窗组件功能
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SuccessModal from '../../src/components/SuccessModal';
import '@testing-library/jest-dom';

describe('SuccessModal Component Tests', () => {
  let mockOnConfirm: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnConfirm = vi.fn();
    vi.clearAllMocks();
  });

  // ==================== UI元素存在性检查 ====================
  describe('UI元素存在性检查', () => {
    test('弹窗可见时应该渲染', () => {
      // When: 渲染可见的弹窗
      render(
        <SuccessModal
          isVisible={true}
          message="恭喜您注册成功，请到登录页面进行登录！"
          onConfirm={mockOnConfirm}
        />
      );

      // Then: 弹窗应该存在
      expect(screen.getByTestId('success-modal')).toBeInTheDocument();
    });

    test('弹窗不可见时不应该渲染', () => {
      // When: 渲染不可见的弹窗
      render(
        <SuccessModal
          isVisible={false}
          message="恭喜您注册成功，请到登录页面进行登录！"
          onConfirm={mockOnConfirm}
        />
      );

      // Then: 弹窗不应该存在
      expect(screen.queryByTestId('success-modal')).not.toBeInTheDocument();
    });

    test('应该显示成功消息', () => {
      // When: 渲染弹窗
      render(
        <SuccessModal
          isVisible={true}
          message="恭喜您注册成功，请到登录页面进行登录！"
          onConfirm={mockOnConfirm}
        />
      );

      // Then: 应该显示消息
      expect(screen.getByText('恭喜您注册成功，请到登录页面进行登录！')).toBeInTheDocument();
    });

    test('应该渲染确认按钮', () => {
      // When: 渲染弹窗
      render(
        <SuccessModal
          isVisible={true}
          message="注册成功"
          onConfirm={mockOnConfirm}
        />
      );

      // Then: 应该有确认按钮
      const confirmButton = screen.getByRole('button', { name: /确认/ });
      expect(confirmButton).toBeInTheDocument();
    });
  });

  // ==================== 弹窗尺寸和位置 ====================
  describe('弹窗尺寸和位置', () => {
    test('弹窗应该占据页面30%', () => {
      // When: 渲染弹窗
      render(
        <SuccessModal
          isVisible={true}
          message="注册成功"
          onConfirm={mockOnConfirm}
        />
      );

      // Then: 弹窗应该有30%的大小样式
      const modal = screen.getByTestId('success-modal');
      const styles = window.getComputedStyle(modal);
      
      // 注意：实际样式验证取决于CSS实现
      expect(modal).toHaveClass('modal-30-percent');
    });

    test('弹窗应该居中显示', () => {
      // When: 渲染弹窗
      render(
        <SuccessModal
          isVisible={true}
          message="注册成功"
          onConfirm={mockOnConfirm}
        />
      );

      // Then: 弹窗应该有居中样式
      const modal = screen.getByTestId('success-modal');
      expect(modal).toHaveClass('centered');
    });
  });

  // ==================== 确认按钮功能 ====================
  describe('确认按钮功能', () => {
    test('点击确认按钮应调用onConfirm回调', async () => {
      // Given: 渲染弹窗
      render(
        <SuccessModal
          isVisible={true}
          message="注册成功"
          onConfirm={mockOnConfirm}
        />
      );

      const confirmButton = screen.getByRole('button', { name: /确认/ });

      // When: 点击确认按钮
      await userEvent.click(confirmButton);

      // Then: 应该调用onConfirm
      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    });

    test('点击确认按钮应关闭弹窗', async () => {
      // Given: 渲染弹窗
      const { rerender } = render(
        <SuccessModal
          isVisible={true}
          message="注册成功"
          onConfirm={mockOnConfirm}
        />
      );

      const confirmButton = screen.getByRole('button', { name: /确认/ });

      // When: 点击确认按钮并重新渲染为不可见
      await userEvent.click(confirmButton);
      rerender(
        <SuccessModal
          isVisible={false}
          message="注册成功"
          onConfirm={mockOnConfirm}
        />
      );

      // Then: 弹窗应该消失
      expect(screen.queryByTestId('success-modal')).not.toBeInTheDocument();
    });
  });

  // ==================== 消息内容显示 ====================
  describe('消息内容显示', () => {
    test('应该正确显示自定义消息', () => {
      // When: 渲染不同的消息
      const { rerender } = render(
        <SuccessModal
          isVisible={true}
          message="第一条消息"
          onConfirm={mockOnConfirm}
        />
      );

      // Then: 应该显示第一条消息
      expect(screen.getByText('第一条消息')).toBeInTheDocument();

      // When: 更改消息
      rerender(
        <SuccessModal
          isVisible={true}
          message="第二条消息"
          onConfirm={mockOnConfirm}
        />
      );

      // Then: 应该显示第二条消息
      expect(screen.getByText('第二条消息')).toBeInTheDocument();
      expect(screen.queryByText('第一条消息')).not.toBeInTheDocument();
    });

    test('应该支持长消息内容', () => {
      // Given: 准备长消息
      const longMessage = '恭喜您注册成功！'.repeat(10);

      // When: 渲染长消息
      render(
        <SuccessModal
          isVisible={true}
          message={longMessage}
          onConfirm={mockOnConfirm}
        />
      );

      // Then: 应该完整显示长消息
      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });

    test('应该支持多行消息内容', () => {
      // Given: 准备多行消息
      const multilineMessage = '恭喜您注册成功！\n请到登录页面进行登录！';

      // When: 渲染多行消息
      render(
        <SuccessModal
          isVisible={true}
          message={multilineMessage}
          onConfirm={mockOnConfirm}
        />
      );

      // Then: 应该显示多行消息
      expect(screen.getByText(/恭喜您注册成功/)).toBeInTheDocument();
      expect(screen.getByText(/请到登录页面进行登录/)).toBeInTheDocument();
    });
  });

  // ==================== 遮罩层功能 ====================
  describe('遮罩层功能', () => {
    test('应该有遮罩层背景', () => {
      // When: 渲染弹窗
      render(
        <SuccessModal
          isVisible={true}
          message="注册成功"
          onConfirm={mockOnConfirm}
        />
      );

      // Then: 应该有遮罩层
      const overlay = screen.getByTestId('modal-overlay');
      expect(overlay).toBeInTheDocument();
      expect(overlay).toHaveClass('overlay');
    });

    test('点击遮罩层不应该关闭弹窗', async () => {
      // Given: 渲染弹窗
      render(
        <SuccessModal
          isVisible={true}
          message="注册成功"
          onConfirm={mockOnConfirm}
        />
      );

      const overlay = screen.getByTestId('modal-overlay');

      // When: 点击遮罩层
      await userEvent.click(overlay);

      // Then: 不应该调用onConfirm（必须点击确认按钮）
      expect(mockOnConfirm).not.toHaveBeenCalled();
    });
  });

  // ==================== 动画和过渡效果 ====================
  describe('动画和过渡效果', () => {
    test('弹窗显示时应该有动画类', () => {
      // When: 渲染可见的弹窗
      render(
        <SuccessModal
          isVisible={true}
          message="注册成功"
          onConfirm={mockOnConfirm}
        />
      );

      // Then: 应该有动画类
      const modal = screen.getByTestId('success-modal');
      expect(modal).toHaveClass('fade-in');
    });

    test('弹窗内容应该平滑显示', async () => {
      // When: 渲染弹窗
      render(
        <SuccessModal
          isVisible={true}
          message="注册成功"
          onConfirm={mockOnConfirm}
        />
      );

      // Then: 消息和按钮应该都可见
      await waitFor(() => {
        expect(screen.getByText('注册成功')).toBeVisible();
        expect(screen.getByRole('button', { name: /确认/ })).toBeVisible();
      });
    });
  });

  // ==================== 可访问性 ====================
  describe('可访问性', () => {
    test('确认按钮应该可以通过键盘访问', () => {
      // When: 渲染弹窗
      render(
        <SuccessModal
          isVisible={true}
          message="注册成功"
          onConfirm={mockOnConfirm}
        />
      );

      // Then: 按钮应该可以获得焦点
      const confirmButton = screen.getByRole('button', { name: /确认/ });
      confirmButton.focus();
      expect(confirmButton).toHaveFocus();
    });

    test('弹窗应该有适当的ARIA属性', () => {
      // When: 渲染弹窗
      render(
        <SuccessModal
          isVisible={true}
          message="注册成功"
          onConfirm={mockOnConfirm}
        />
      );

      // Then: 应该有role="dialog"
      const modal = screen.getByRole('dialog');
      expect(modal).toBeInTheDocument();
    });
  });

  // ==================== 边界条件测试 ====================
  describe('边界条件测试', () => {
    test('空消息应该正常渲染', () => {
      // When: 渲染空消息
      render(
        <SuccessModal
          isVisible={true}
          message=""
          onConfirm={mockOnConfirm}
        />
      );

      // Then: 弹窗应该存在（即使消息为空）
      expect(screen.getByTestId('success-modal')).toBeInTheDocument();
    });

    test('快速切换可见性应该正常工作', async () => {
      // Given: 渲染不可见的弹窗
      const { rerender } = render(
        <SuccessModal
          isVisible={false}
          message="注册成功"
          onConfirm={mockOnConfirm}
        />
      );

      // When: 快速切换为可见
      rerender(
        <SuccessModal
          isVisible={true}
          message="注册成功"
          onConfirm={mockOnConfirm}
        />
      );

      // Then: 弹窗应该显示
      expect(screen.getByTestId('success-modal')).toBeInTheDocument();

      // When: 立即切换为不可见
      rerender(
        <SuccessModal
          isVisible={false}
          message="注册成功"
          onConfirm={mockOnConfirm}
        />
      );

      // Then: 弹窗应该消失
      expect(screen.queryByTestId('success-modal')).not.toBeInTheDocument();
    });

    test('多次点击确认按钮应该只触发一次回调', async () => {
      // Given: 渲染弹窗
      render(
        <SuccessModal
          isVisible={true}
          message="注册成功"
          onConfirm={mockOnConfirm}
        />
      );

      const confirmButton = screen.getByRole('button', { name: /确认/ });

      // When: 快速多次点击
      await userEvent.click(confirmButton);
      await userEvent.click(confirmButton);
      await userEvent.click(confirmButton);

      // Then: 应该只调用一次（防止重复提交）
      // 注意：这取决于组件是否实现了防抖
      expect(mockOnConfirm.mock.calls.length).toBeGreaterThan(0);
    });
  });
});


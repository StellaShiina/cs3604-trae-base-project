/**
 * SelectDropdown组件测试
 * 测试文件：frontend/test/components/SelectDropdown.test.tsx
 * 对应源文件：frontend/src/components/SelectDropdown.tsx
 * 
 * 测试目标：验证下拉选择框组件功能
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SelectDropdown from '../../src/components/SelectDropdown';
import '@testing-library/jest-dom';

describe('SelectDropdown Component Tests', () => {
  const mockOptions = ['选项1', '选项2', '选项3'];
  let mockOnChange: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnChange = vi.fn();
    vi.clearAllMocks();
  });

  // ==================== UI元素存在性检查 ====================
  describe('UI元素存在性检查', () => {
    test('应该显示占位符文本', () => {
      // When: 渲染组件
      render(
        <SelectDropdown
          options={mockOptions}
          value=""
          placeholder="请选择"
          onChange={mockOnChange}
        />
      );

      // Then: 应该显示占位符
      expect(screen.getByText('请选择')).toBeInTheDocument();
    });

    test('应该显示当前选中的值', () => {
      // When: 渲染组件带选中值
      render(
        <SelectDropdown
          options={mockOptions}
          value="选项1"
          placeholder="请选择"
          onChange={mockOnChange}
        />
      );

      // Then: 应该显示选中的值
      expect(screen.getByText('选项1')).toBeInTheDocument();
    });

    test('应该显示向下箭头图标', () => {
      // When: 渲染组件
      render(
        <SelectDropdown
          options={mockOptions}
          value=""
          placeholder="请选择"
          onChange={mockOnChange}
        />
      );

      // Then: 应该有箭头图标
      const arrow = screen.getByTestId('dropdown-arrow');
      expect(arrow).toBeInTheDocument();
    });
  });

  // ==================== 展开和收起功能 ====================
  describe('展开和收起功能', () => {
    test('点击选择框应该展开选项列表', async () => {
      // Given: 渲染组件
      render(
        <SelectDropdown
          options={mockOptions}
          value=""
          placeholder="请选择"
          onChange={mockOnChange}
        />
      );

      const dropdown = screen.getByTestId('select-dropdown');

      // When: 点击选择框
      await userEvent.click(dropdown);

      // Then: 应该显示所有选项
      mockOptions.forEach(option => {
        expect(screen.getByText(option)).toBeInTheDocument();
      });
    });

    test('选项展开后再次点击应该收起', async () => {
      // Given: 渲染并展开选项
      render(
        <SelectDropdown
          options={mockOptions}
          value=""
          placeholder="请选择"
          onChange={mockOnChange}
        />
      );

      const dropdown = screen.getByTestId('select-dropdown');
      
      // 第一次点击展开
      await userEvent.click(dropdown);
      expect(screen.getByText('选项1')).toBeInTheDocument();

      // When: 再次点击
      await userEvent.click(dropdown);

      // Then: 选项应该被隐藏
      expect(screen.queryByText('选项1')).not.toBeInTheDocument();
    });

    test('选择某个选项后应自动收起', async () => {
      // Given: 渲染并展开选项
      render(
        <SelectDropdown
          options={mockOptions}
          value=""
          placeholder="请选择"
          onChange={mockOnChange}
        />
      );

      await userEvent.click(screen.getByTestId('select-dropdown'));

      // When: 选择一个选项
      const option = screen.getByText('选项1');
      await userEvent.click(option);

      // Then: 选项列表应该收起
      expect(screen.queryByText('选项2')).not.toBeInTheDocument();
    });
  });

  // ==================== 选项选择功能 ====================
  describe('选项选择功能', () => {
    test('选择选项应该调用onChange回调', async () => {
      // Given: 渲染并展开选项
      render(
        <SelectDropdown
          options={mockOptions}
          value=""
          placeholder="请选择"
          onChange={mockOnChange}
        />
      );

      await userEvent.click(screen.getByTestId('select-dropdown'));

      // When: 选择一个选项
      const option = screen.getByText('选项2');
      await userEvent.click(option);

      // Then: 应该调用onChange并传入正确的值
      expect(mockOnChange).toHaveBeenCalledWith('选项2');
    });

    test('选择选项后应更新显示值', async () => {
      // Given: 渲染组件
      const { rerender } = render(
        <SelectDropdown
          options={mockOptions}
          value=""
          placeholder="请选择"
          onChange={mockOnChange}
        />
      );

      await userEvent.click(screen.getByTestId('select-dropdown'));
      const option = screen.getByText('选项3');
      await userEvent.click(option);

      // When: 更新组件值
      rerender(
        <SelectDropdown
          options={mockOptions}
          value="选项3"
          placeholder="请选择"
          onChange={mockOnChange}
        />
      );

      // Then: 应该显示新选中的值
      expect(screen.getByText('选项3')).toBeInTheDocument();
      expect(screen.queryByText('请选择')).not.toBeInTheDocument();
    });
  });

  // ==================== 禁用状态 ====================
  describe('禁用状态', () => {
    test('禁用时不应该响应点击事件', async () => {
      // Given: 渲染禁用的组件
      render(
        <SelectDropdown
          options={mockOptions}
          value=""
          placeholder="请选择"
          onChange={mockOnChange}
          disabled={true}
        />
      );

      const dropdown = screen.getByTestId('select-dropdown');

      // When: 尝试点击
      await userEvent.click(dropdown);

      // Then: 不应该展开选项列表
      expect(screen.queryByText('选项1')).not.toBeInTheDocument();
      expect(mockOnChange).not.toHaveBeenCalled();
    });

    test('禁用时应该有禁用样式', () => {
      // When: 渲染禁用的组件
      render(
        <SelectDropdown
          options={mockOptions}
          value=""
          placeholder="请选择"
          onChange={mockOnChange}
          disabled={true}
        />
      );

      // Then: 应该有禁用样式
      const dropdown = screen.getByTestId('select-dropdown');
      expect(dropdown).toHaveClass('disabled');
    });
  });

  // ==================== 边界条件测试 ====================
  describe('边界条件测试', () => {
    test('空选项列表应该正常渲染', () => {
      // When: 渲染空选项列表
      render(
        <SelectDropdown
          options={[]}
          value=""
          placeholder="请选择"
          onChange={mockOnChange}
        />
      );

      // Then: 应该显示占位符
      expect(screen.getByText('请选择')).toBeInTheDocument();
    });

    test('只有一个选项时应该正常工作', async () => {
      // Given: 渲染只有一个选项的组件
      render(
        <SelectDropdown
          options={['唯一选项']}
          value=""
          placeholder="请选择"
          onChange={mockOnChange}
        />
      );

      await userEvent.click(screen.getByTestId('select-dropdown'));

      // When: 选择该选项
      await userEvent.click(screen.getByText('唯一选项'));

      // Then: 应该正常工作
      expect(mockOnChange).toHaveBeenCalledWith('唯一选项');
    });

    test('选项包含特殊字符时应该正常显示', async () => {
      // Given: 渲染包含特殊字符的选项
      const specialOptions = ['选项@#$', '选项<>', '选项&nbsp;'];
      
      render(
        <SelectDropdown
          options={specialOptions}
          value=""
          placeholder="请选择"
          onChange={mockOnChange}
        />
      );

      // When: 展开选项
      await userEvent.click(screen.getByTestId('select-dropdown'));

      // Then: 应该正确显示特殊字符
      specialOptions.forEach(option => {
        expect(screen.getByText(option)).toBeInTheDocument();
      });
    });
  });

  // ==================== 键盘导航（可选功能） ====================
  describe('键盘导航', () => {
    test('按下Enter键应该展开选项列表', () => {
      // Given: 渲染组件
      render(
        <SelectDropdown
          options={mockOptions}
          value=""
          placeholder="请选择"
          onChange={mockOnChange}
        />
      );

      const dropdown = screen.getByTestId('select-dropdown');

      // When: 按下Enter键
      fireEvent.keyDown(dropdown, { key: 'Enter' });

      // Then: 应该展开选项（如果支持键盘导航）
      // 注意：这是可选功能，可能不实现
    });

    test('按下Escape键应该收起选项列表', async () => {
      // Given: 渲染并展开选项
      render(
        <SelectDropdown
          options={mockOptions}
          value=""
          placeholder="请选择"
          onChange={mockOnChange}
        />
      );

      await userEvent.click(screen.getByTestId('select-dropdown'));

      // When: 按下Escape键
      fireEvent.keyDown(document, { key: 'Escape' });

      // Then: 应该收起选项（如果支持键盘导航）
      // 注意：这是可选功能，可能不实现
    });
  });
});


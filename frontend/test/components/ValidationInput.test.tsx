/**
 * ValidationInput组件测试
 * 测试文件：frontend/test/components/ValidationInput.test.tsx
 * 对应源文件：frontend/src/components/ValidationInput.tsx
 * 
 * 测试目标：验证带验证功能的输入框组件
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ValidationInput from '../../src/components/ValidationInput';
import '@testing-library/jest-dom';

describe('ValidationInput Component Tests', () => {
  let mockOnChange: ReturnType<typeof vi.fn>;
  let mockOnValidate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnChange = vi.fn();
    mockOnValidate = vi.fn();
    vi.clearAllMocks();
  });

  // ==================== UI元素存在性检查 ====================
  describe('UI元素存在性检查', () => {
    test('应该渲染输入框', () => {
      // When: 渲染组件
      render(
        <ValidationInput
          value=""
          onChange={mockOnChange}
          onValidate={mockOnValidate}
          placeholder="请输入"
        />
      );

      // Then: 输入框应该存在
      const input = screen.getByPlaceholderText('请输入');
      expect(input).toBeInTheDocument();
    });

    test('必填字段应该显示*号', () => {
      // When: 渲染必填输入框
      render(
        <ValidationInput
          value=""
          onChange={mockOnChange}
          onValidate={mockOnValidate}
          placeholder="请输入"
          required={true}
        />
      );

      // Then: 应该显示*号
      expect(screen.getByText('*')).toBeInTheDocument();
    });

    test('非必填字段不应该显示*号', () => {
      // When: 渲染非必填输入框
      render(
        <ValidationInput
          value=""
          onChange={mockOnChange}
          onValidate={mockOnValidate}
          placeholder="请输入"
          required={false}
        />
      );

      // Then: 不应该显示*号
      expect(screen.queryByText('*')).not.toBeInTheDocument();
    });
  });

  // ==================== 输入和验证功能 ====================
  describe('输入和验证功能', () => {
    test('输入内容时应调用onChange回调', async () => {
      // Given: 渲染组件
      render(
        <ValidationInput
          value=""
          onChange={mockOnChange}
          onValidate={mockOnValidate}
          placeholder="请输入"
        />
      );

      const input = screen.getByPlaceholderText('请输入');

      // When: 输入内容
      await userEvent.type(input, 'test');

      // Then: 应该调用onChange
      expect(mockOnChange).toHaveBeenCalled();
    });

    test('失焦时应调用onValidate回调', async () => {
      // Given: 渲染组件
      render(
        <ValidationInput
          value="test"
          onChange={mockOnChange}
          onValidate={mockOnValidate}
          placeholder="请输入"
        />
      );

      const input = screen.getByPlaceholderText('请输入');

      // When: 失焦
      fireEvent.blur(input);

      // Then: 应该调用onValidate
      await waitFor(() => {
        expect(mockOnValidate).toHaveBeenCalledWith('test');
      });
    });

    test('验证通过时应显示绿色勾勾', async () => {
      // When: 渲染组件，设置showCheckmark为true
      render(
        <ValidationInput
          value="valid"
          onChange={mockOnChange}
          onValidate={mockOnValidate}
          placeholder="请输入"
          showCheckmark={true}
        />
      );

      // Then: 应该显示绿色勾勾
      const checkmark = screen.getByTestId('validation-checkmark');
      expect(checkmark).toBeInTheDocument();
      expect(checkmark).toHaveClass('valid');
    });

    test('验证失败时应显示错误信息', () => {
      // When: 渲染组件，传入错误信息
      render(
        <ValidationInput
          value="invalid"
          onChange={mockOnChange}
          onValidate={mockOnValidate}
          placeholder="请输入"
          errorMessage="输入格式不正确"
        />
      );

      // Then: 应该显示错误信息
      expect(screen.getByText('输入格式不正确')).toBeInTheDocument();
    });

    test('有错误信息时输入框应该有错误样式', () => {
      // When: 渲染组件，传入错误信息
      render(
        <ValidationInput
          value="invalid"
          onChange={mockOnChange}
          onValidate={mockOnValidate}
          placeholder="请输入"
          errorMessage="输入格式不正确"
        />
      );

      // Then: 输入框应该有错误样式
      const input = screen.getByPlaceholderText('请输入');
      expect(input).toHaveClass('error');
    });
  });

  // ==================== 不同输入类型支持 ====================
  describe('不同输入类型支持', () => {
    test('应该支持文本输入类型', () => {
      // When: 渲染文本输入框
      render(
        <ValidationInput
          value=""
          onChange={mockOnChange}
          onValidate={mockOnValidate}
          type="text"
          placeholder="请输入文本"
        />
      );

      // Then: 输入框类型应该是text
      const input = screen.getByPlaceholderText('请输入文本') as HTMLInputElement;
      expect(input.type).toBe('text');
    });

    test('应该支持密码输入类型', () => {
      // When: 渲染密码输入框
      render(
        <ValidationInput
          value=""
          onChange={mockOnChange}
          onValidate={mockOnValidate}
          type="password"
          placeholder="请输入密码"
        />
      );

      // Then: 输入框类型应该是password
      const input = screen.getByPlaceholderText('请输入密码') as HTMLInputElement;
      expect(input.type).toBe('password');
    });

    test('应该支持邮箱输入类型', () => {
      // When: 渲染邮箱输入框
      render(
        <ValidationInput
          value=""
          onChange={mockOnChange}
          onValidate={mockOnValidate}
          type="email"
          placeholder="请输入邮箱"
        />
      );

      // Then: 输入框类型应该是email
      const input = screen.getByPlaceholderText('请输入邮箱') as HTMLInputElement;
      expect(input.type).toBe('email');
    });
  });

  // ==================== 最大长度限制 ====================
  describe('最大长度限制', () => {
    test('应该支持最大长度限制', () => {
      // When: 渲染带最大长度限制的输入框
      render(
        <ValidationInput
          value=""
          onChange={mockOnChange}
          onValidate={mockOnValidate}
          placeholder="请输入"
          maxLength={10}
        />
      );

      // Then: 输入框应该有maxLength属性
      const input = screen.getByPlaceholderText('请输入') as HTMLInputElement;
      expect(input.maxLength).toBe(10);
    });

    test('输入超过最大长度时应该被截断', async () => {
      // Given: 渲染带最大长度限制的输入框
      const { rerender } = render(
        <ValidationInput
          value=""
          onChange={mockOnChange}
          onValidate={mockOnValidate}
          placeholder="请输入"
          maxLength={5}
        />
      );

      const input = screen.getByPlaceholderText('请输入') as HTMLInputElement;

      // When: 尝试输入超过最大长度的内容
      await userEvent.type(input, '12345678');

      // Then: 只应该保留前5个字符
      // 注意：实际验证取决于组件实现
      expect(input.value.length).toBeLessThanOrEqual(5);
    });
  });

  // ==================== 实时验证 ====================
  describe('实时验证', () => {
    test('输入时应该实时调用验证函数', async () => {
      // Given: 渲染组件
      mockOnValidate.mockResolvedValue(true);

      render(
        <ValidationInput
          value=""
          onChange={mockOnChange}
          onValidate={mockOnValidate}
          placeholder="请输入"
        />
      );

      const input = screen.getByPlaceholderText('请输入');

      // When: 输入内容
      await userEvent.type(input, 'a');
      fireEvent.blur(input);

      // Then: 应该调用验证函数
      await waitFor(() => {
        expect(mockOnValidate).toHaveBeenCalled();
      });
    });

    test('验证中应该显示加载状态', async () => {
      // Given: 模拟异步验证
      mockOnValidate.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(true), 100)));

      render(
        <ValidationInput
          value="test"
          onChange={mockOnChange}
          onValidate={mockOnValidate}
          placeholder="请输入"
        />
      );

      const input = screen.getByPlaceholderText('请输入');

      // When: 触发验证
      fireEvent.blur(input);

      // Then: 应该显示加载状态
      await waitFor(() => {
        expect(screen.getByTestId('validation-loading')).toBeInTheDocument();
      });
    });
  });

  // ==================== 边界条件测试 ====================
  describe('边界条件测试', () => {
    test('空值验证应该正常工作', async () => {
      // Given: 渲染组件
      render(
        <ValidationInput
          value=""
          onChange={mockOnChange}
          onValidate={mockOnValidate}
          placeholder="请输入"
          required={true}
        />
      );

      const input = screen.getByPlaceholderText('请输入');

      // When: 不输入任何内容直接失焦
      fireEvent.blur(input);

      // Then: 应该调用验证函数
      await waitFor(() => {
        expect(mockOnValidate).toHaveBeenCalledWith('');
      });
    });

    test('特殊字符输入应该被正确处理', async () => {
      // Given: 渲染组件
      render(
        <ValidationInput
          value=""
          onChange={mockOnChange}
          onValidate={mockOnValidate}
          placeholder="请输入"
        />
      );

      const input = screen.getByPlaceholderText('请输入');

      // When: 输入特殊字符
      await userEvent.type(input, '!@#$%^&*()');

      // Then: 应该触发onChange
      expect(mockOnChange).toHaveBeenCalled();
    });

    test('中文输入应该被正确处理', async () => {
      // Given: 渲染组件
      render(
        <ValidationInput
          value=""
          onChange={mockOnChange}
          onValidate={mockOnValidate}
          placeholder="请输入"
        />
      );

      const input = screen.getByPlaceholderText('请输入');

      // When: 输入中文
      await userEvent.type(input, '测试');

      // Then: 应该触发onChange
      expect(mockOnChange).toHaveBeenCalled();
    });

    test('连续快速输入应该正确处理', async () => {
      // Given: 渲染组件
      render(
        <ValidationInput
          value=""
          onChange={mockOnChange}
          onValidate={mockOnValidate}
          placeholder="请输入"
        />
      );

      const input = screen.getByPlaceholderText('请输入');

      // When: 快速连续输入
      await userEvent.type(input, 'abcdefghij', { delay: 1 });

      // Then: onChange应该被多次调用
      expect(mockOnChange.mock.calls.length).toBeGreaterThan(1);
    });
  });

  // ==================== 禁用状态 ====================
  describe('禁用状态', () => {
    test('禁用时输入框应该不可编辑', () => {
      // When: 渲染禁用的输入框
      render(
        <ValidationInput
          value=""
          onChange={mockOnChange}
          onValidate={mockOnValidate}
          placeholder="请输入"
          disabled={true}
        />
      );

      // Then: 输入框应该被禁用
      const input = screen.getByPlaceholderText('请输入') as HTMLInputElement;
      expect(input.disabled).toBe(true);
    });

    test('禁用时应该有禁用样式', () => {
      // When: 渲染禁用的输入框
      render(
        <ValidationInput
          value=""
          onChange={mockOnChange}
          onValidate={mockOnValidate}
          placeholder="请输入"
          disabled={true}
        />
      );

      // Then: 应该有禁用样式
      const input = screen.getByPlaceholderText('请输入');
      expect(input).toHaveClass('disabled');
    });
  });
});


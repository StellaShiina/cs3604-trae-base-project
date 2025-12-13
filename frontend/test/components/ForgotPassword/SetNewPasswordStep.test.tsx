/**
 * SetNewPasswordStep组件单元测试
 * 测试文件：frontend/test/components/ForgotPassword/SetNewPasswordStep.test.tsx
 * 对应源文件：frontend/src/components/ForgotPassword/SetNewPasswordStep.tsx
 * 
 * 测试目标：验证设置新密码步骤的UI和验证逻辑
 */

import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import SetNewPasswordStep from '../../../src/components/ForgotPassword/SetNewPasswordStep';
import axios from 'axios';

// 辅助函数：查找错误消息元素
const getErrorText = (text: string | RegExp) => {
  const elements = screen.getAllByText(text);
  return elements.find(el => el.classList.contains('error-text'));
};

vi.mock('axios');

describe('SetNewPasswordStep 组件测试', () => {
  const mockOnSuccess = vi.fn();
  const mockResetToken = 'test-reset-token-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('UI渲染', () => {
    it('应该渲染新密码和确认密码输入框', () => {
      render(<SetNewPasswordStep resetToken={mockResetToken} onSuccess={mockOnSuccess} />);

      expect(screen.getByText(/新密码/)).toBeInTheDocument();
      expect(screen.getByText(/密码确认/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /提交/ })).toBeInTheDocument();
    });

    it('应该在输入框右侧显示橙色提示文字', () => {
      render(<SetNewPasswordStep resetToken={mockResetToken} onSuccess={mockOnSuccess} />);

      expect(screen.getByText(/需包含字母、数字、下划线中不少于两种且长度不少于6/)).toBeInTheDocument();
      expect(screen.getByText(/请再次输入密码/)).toBeInTheDocument();
    });

    it('密码输入框应该是password类型', () => {
      render(<SetNewPasswordStep resetToken={mockResetToken} onSuccess={mockOnSuccess} />);

      const passwordInputs = screen.getAllByDisplayValue('');
      const passwordTypeInputs = passwordInputs.filter(
        (input) => input.getAttribute('type') === 'password'
      );

      expect(passwordTypeInputs.length).toBe(2);
    });
  });

  describe('密码验证', () => {
    it('应该拒绝长度少于6位的密码', async () => {
      const user = userEvent.setup();
      render(<SetNewPasswordStep resetToken={mockResetToken} onSuccess={mockOnSuccess} />);

      const passwordInputs = screen.getAllByDisplayValue('');
      const newPasswordInput = passwordInputs.find((input) => input.getAttribute('type') === 'password');
      const confirmPasswordInput = passwordInputs.filter((input) => input.getAttribute('type') === 'password')[1];

      await user.type(newPasswordInput!, '123');
      await user.type(confirmPasswordInput!, '123');

      const submitButton = screen.getByRole('button', { name: /提交/ });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/密码长度不能少于6位/)).toBeInTheDocument();
      });
    });

    it('应该拒绝只包含单一类型字符的密码', async () => {
      const user = userEvent.setup();
      render(<SetNewPasswordStep resetToken={mockResetToken} onSuccess={mockOnSuccess} />);

      const passwordInputs = screen.getAllByDisplayValue('');
      const newPasswordInput = passwordInputs.find((input) => input.getAttribute('type') === 'password');
      const confirmPasswordInput = passwordInputs.filter((input) => input.getAttribute('type') === 'password')[1];

      await user.type(newPasswordInput!, 'aaaaaa'); // 只有字母
      await user.type(confirmPasswordInput!, 'aaaaaa');

      const submitButton = screen.getByRole('button', { name: /提交/ });
      await user.click(submitButton);

      await waitFor(() => {
        // 错误消息应该存在于error-text类的元素中，而不是hint-text
        const errorText = getErrorText(/需包含字母、数字、下划线中不少于两种/);
        expect(errorText).toBeInTheDocument();
        expect(errorText?.textContent).toBe('需包含字母、数字、下划线中不少于两种');
      });
    });

    it('应该拒绝两次密码输入不一致', async () => {
      const user = userEvent.setup();
      render(<SetNewPasswordStep resetToken={mockResetToken} onSuccess={mockOnSuccess} />);

      const passwordInputs = screen.getAllByDisplayValue('');
      const newPasswordInput = passwordInputs.find((input) => input.getAttribute('type') === 'password');
      const confirmPasswordInput = passwordInputs.filter((input) => input.getAttribute('type') === 'password')[1];

      await user.type(newPasswordInput!, 'test123');
      await user.type(confirmPasswordInput!, 'different456');

      const submitButton = screen.getByRole('button', { name: /提交/ });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/两次密码输入不一致/)).toBeInTheDocument();
      });
    });

    it('应该接受符合要求的密码', async () => {
      const user = userEvent.setup();

      (axios.post as any).mockResolvedValue({
        data: { success: true },
      });

      render(<SetNewPasswordStep resetToken={mockResetToken} onSuccess={mockOnSuccess} />);

      const passwordInputs = screen.getAllByDisplayValue('');
      const newPasswordInput = passwordInputs.find((input) => input.getAttribute('type') === 'password');
      const confirmPasswordInput = passwordInputs.filter((input) => input.getAttribute('type') === 'password')[1];

      await user.type(newPasswordInput!, 'test123'); // 字母+数字
      await user.type(confirmPasswordInput!, 'test123');

      const submitButton = screen.getByRole('button', { name: /提交/ });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });

    it('输入时不应该显示验证错误', async () => {
      const user = userEvent.setup();
      render(<SetNewPasswordStep resetToken={mockResetToken} onSuccess={mockOnSuccess} />);

      const passwordInputs = screen.getAllByDisplayValue('');
      const newPasswordInput = passwordInputs.find((input) => input.getAttribute('type') === 'password');

      // 输入短密码
      await user.type(newPasswordInput!, '123');

      // 不应该立即显示错误
      expect(screen.queryByText(/密码长度不能少于6位/)).not.toBeInTheDocument();

      // 提交后才显示错误
      const submitButton = screen.getByRole('button', { name: /提交/ });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/密码长度不能少于6位/)).toBeInTheDocument();
      });
    });
  });

  describe('有效密码示例测试', () => {
    const validPasswords = [
      'test123',      // 字母+数字
      'user_01',      // 字母+下划线
      'pass_123',     // 字母+数字+下划线
      '123_456',      // 数字+下划线
    ];

    validPasswords.forEach((password) => {
      it(`应该接受有效密码: ${password}`, async () => {
        const user = userEvent.setup();

        (axios.post as any).mockResolvedValue({
          data: { success: true },
        });

        render(<SetNewPasswordStep resetToken={mockResetToken} onSuccess={mockOnSuccess} />);

        const passwordInputs = screen.getAllByDisplayValue('');
        const newPasswordInput = passwordInputs.find((input) => input.getAttribute('type') === 'password');
        const confirmPasswordInput = passwordInputs.filter((input) => input.getAttribute('type') === 'password')[1];

        await user.type(newPasswordInput!, password);
        await user.type(confirmPasswordInput!, password);

        const submitButton = screen.getByRole('button', { name: /提交/ });
        await user.click(submitButton);

        await waitFor(() => {
          expect(mockOnSuccess).toHaveBeenCalled();
        });
      });
    });
  });

  describe('无效密码示例测试', () => {
    const invalidPasswords = [
      { password: '123456', error: '需包含字母、数字、下划线中不少于两种' },
      { password: 'abcdef', error: '需包含字母、数字、下划线中不少于两种' },
      { password: '12345', error: '密码长度不能少于6位' },
    ];

    invalidPasswords.forEach(({ password, error }) => {
      it(`应该拒绝无效密码: ${password}`, async () => {
        const user = userEvent.setup();
        render(<SetNewPasswordStep resetToken={mockResetToken} onSuccess={mockOnSuccess} />);

        const passwordInputs = screen.getAllByDisplayValue('');
        const newPasswordInput = passwordInputs.find((input) => input.getAttribute('type') === 'password');
        const confirmPasswordInput = passwordInputs.filter((input) => input.getAttribute('type') === 'password')[1];

        await user.type(newPasswordInput!, password);
        await user.type(confirmPasswordInput!, password);

        const submitButton = screen.getByRole('button', { name: /提交/ });
        await user.click(submitButton);

        await waitFor(() => {
          // 对于可能匹配多个元素的错误消息，使用辅助函数查找错误消息元素
          if (error.includes('需包含字母、数字、下划线中不少于两种')) {
            // 这个错误消息可能同时匹配提示文字和错误消息
            const errorText = getErrorText(new RegExp(error));
            expect(errorText).toBeInTheDocument();
            expect(errorText?.textContent).toBe(error);
          } else {
            // 其他错误消息应该唯一匹配
            expect(screen.getByText(new RegExp(error))).toBeInTheDocument();
          }
        });

        expect(mockOnSuccess).not.toHaveBeenCalled();
      });
    });
  });
});


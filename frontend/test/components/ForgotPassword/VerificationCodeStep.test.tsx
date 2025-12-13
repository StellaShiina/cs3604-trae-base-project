/**
 * VerificationCodeStep组件单元测试
 * 测试文件：frontend/test/components/ForgotPassword/VerificationCodeStep.test.tsx
 * 对应源文件：frontend/src/components/ForgotPassword/VerificationCodeStep.tsx
 * 
 * 测试目标：验证获取验证码步骤的UI和倒计时逻辑
 */

import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import VerificationCodeStep from '../../../src/components/ForgotPassword/VerificationCodeStep';
import axios from 'axios';

vi.mock('axios');

describe('VerificationCodeStep 组件测试', () => {
  const mockOnSuccess = vi.fn();
  const mockSessionId = 'test-session-123';
  const mockPhone = '19805819256';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('UI渲染', () => {
    it('应该显示格式化的手机号', () => {
      render(
        <VerificationCodeStep
          sessionId={mockSessionId}
          phone={mockPhone}
          onSuccess={mockOnSuccess}
        />
      );

      // 验证手机号格式化显示为 (+86) 19805819256
      expect(screen.getByText(/\(\+86\)\s*198/)).toBeInTheDocument();
    });

    it('应该显示验证码输入框和发送按钮', () => {
      render(
        <VerificationCodeStep
          sessionId={mockSessionId}
          phone={mockPhone}
          onSuccess={mockOnSuccess}
        />
      );

      expect(screen.getByPlaceholderText(/请输入6位验证码/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /获取手机验证码/ })).toBeInTheDocument();
    });

    it('应该显示帮助链接', () => {
      render(
        <VerificationCodeStep
          sessionId={mockSessionId}
          phone={mockPhone}
          onSuccess={mockOnSuccess}
        />
      );

      expect(screen.getByText(/手机号未通过核验/)).toBeInTheDocument();
      expect(screen.getByText(/邮箱找回/)).toBeInTheDocument();
    });
  });

  describe('验证码输入', () => {
    it('应该只允许输入数字', async () => {
      const user = userEvent.setup();
      render(
        <VerificationCodeStep
          sessionId={mockSessionId}
          phone={mockPhone}
          onSuccess={mockOnSuccess}
        />
      );

      const codeInput = screen.getByPlaceholderText(/请输入6位验证码/);

      await user.type(codeInput, 'abc123xyz');

      expect(codeInput).toHaveValue('123'); // 只保留数字
    });

    it('应该限制为6位数字', async () => {
      const user = userEvent.setup();
      render(
        <VerificationCodeStep
          sessionId={mockSessionId}
          phone={mockPhone}
          onSuccess={mockOnSuccess}
        />
      );

      const codeInput = screen.getByPlaceholderText(/请输入6位验证码/);

      await user.type(codeInput, '1234567890');

      expect(codeInput).toHaveValue('123456'); // 只保留6位
    });
  });

  describe('发送验证码', () => {
    it('应该调用API发送验证码', async () => {
      const user = userEvent.setup();

      (axios.post as any).mockResolvedValue({
        data: {
          success: true,
          verificationCode: '123456',
          phone: mockPhone,
        },
      });

      render(
        <VerificationCodeStep
          sessionId={mockSessionId}
          phone={mockPhone}
          onSuccess={mockOnSuccess}
        />
      );

      const sendButton = screen.getByRole('button', { name: /获取手机验证码/ });
      await user.click(sendButton);

      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith('/api/password-reset/send-code', {
          sessionId: mockSessionId,
        });
      });
    });

    it('应该在发送成功后显示120秒倒计时', async () => {
      const user = userEvent.setup();

      (axios.post as any).mockResolvedValue({
        data: {
          success: true,
          verificationCode: '123456',
          phone: mockPhone,
        },
      });

      render(
        <VerificationCodeStep
          sessionId={mockSessionId}
          phone={mockPhone}
          onSuccess={mockOnSuccess}
        />
      );

      const sendButton = screen.getByRole('button', { name: /获取手机验证码/ });
      await user.click(sendButton);

      await waitFor(() => {
        expect(screen.getByText(/验证码已发出.*120秒|119秒/)).toBeInTheDocument();
      });

      // 验证倒计时文字是橙色（通过检查CSS类）
      const countdownText = screen.getByText(/验证码已发出/);
      expect(countdownText.className).toContain('countdown-text');
    });

    it('倒计时期间发送按钮应该被隐藏', async () => {
      const user = userEvent.setup();

      (axios.post as any).mockResolvedValue({
        data: {
          success: true,
          verificationCode: '123456',
          phone: mockPhone,
        },
      });

      render(
        <VerificationCodeStep
          sessionId={mockSessionId}
          phone={mockPhone}
          onSuccess={mockOnSuccess}
        />
      );

      const sendButton = screen.getByRole('button', { name: /获取手机验证码/ });
      await user.click(sendButton);

      await waitFor(() => {
        expect(screen.queryByRole('button', { name: /获取手机验证码/ })).not.toBeInTheDocument();
      });
    });
  });

  describe('验证码验证', () => {
    it('应该在输入正确验证码后调用onSuccess', async () => {
      const user = userEvent.setup();

      (axios.post as any).mockResolvedValue({
        data: {
          success: true,
          resetToken: 'reset-token-789',
        },
      });

      render(
        <VerificationCodeStep
          sessionId={mockSessionId}
          phone={mockPhone}
          onSuccess={mockOnSuccess}
        />
      );

      const codeInput = screen.getByPlaceholderText(/请输入6位验证码/);
      await user.type(codeInput, '123456');

      const submitButton = screen.getByRole('button', { name: /提交/ });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledWith('reset-token-789');
      });
    });

    it('应该在验证码错误时显示错误提示', async () => {
      const user = userEvent.setup();

      (axios.post as any).mockRejectedValue({
        response: {
          data: {
            success: false,
            error: '很抱歉，您输入的短信验证码有误。',
          },
        },
      });

      render(
        <VerificationCodeStep
          sessionId={mockSessionId}
          phone={mockPhone}
          onSuccess={mockOnSuccess}
        />
      );

      const codeInput = screen.getByPlaceholderText(/请输入6位验证码/);
      await user.type(codeInput, '000000');

      const submitButton = screen.getByRole('button', { name: /提交/ });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/很抱歉，您输入的短信验证码有误/)).toBeInTheDocument();
      });

      expect(mockOnSuccess).not.toHaveBeenCalled();
    });

    it('应该在验证码为空时显示提示', async () => {
      const user = userEvent.setup();
      render(
        <VerificationCodeStep
          sessionId={mockSessionId}
          phone={mockPhone}
          onSuccess={mockOnSuccess}
        />
      );

      const submitButton = screen.getByRole('button', { name: /提交/ });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/请输入手机验证码！/)).toBeInTheDocument();
      });
    });
  });

  describe('倒计时功能', () => {
    it('倒计时应该从120秒开始', async () => {
      const user = userEvent.setup();

      (axios.post as any).mockResolvedValue({
        data: {
          success: true,
          verificationCode: '123456',
          phone: mockPhone,
        },
      });

      render(
        <VerificationCodeStep
          sessionId={mockSessionId}
          phone={mockPhone}
          onSuccess={mockOnSuccess}
        />
      );

      const sendButton = screen.getByRole('button', { name: /获取手机验证码/ });
      await user.click(sendButton);

      await waitFor(() => {
        const countdownText = screen.getByText(/验证码已发出/);
        expect(countdownText.textContent).toMatch(/120秒|119秒/);
      });
    });
  });
});


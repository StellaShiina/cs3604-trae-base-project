/**
 * AccountInfoStep组件单元测试
 * 测试文件：frontend/test/components/ForgotPassword/AccountInfoStep.test.tsx
 * 对应源文件：frontend/src/components/ForgotPassword/AccountInfoStep.tsx
 * 
 * 测试目标：验证账户信息填写步骤的UI和验证逻辑
 */

import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import AccountInfoStep from '../../../src/components/ForgotPassword/AccountInfoStep';
import axios from 'axios';

vi.mock('axios');

describe('AccountInfoStep 组件测试', () => {
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('UI渲染', () => {
    it('应该渲染所有必需的表单元素', () => {
      render(<AccountInfoStep onSuccess={mockOnSuccess} />);

      // 使用更精确的查询，匹配label中的完整文本（包含冒号）
      expect(screen.getByText(/手机号码：/)).toBeInTheDocument();
      expect(screen.getByText(/证件类型：/)).toBeInTheDocument();
      expect(screen.getByText(/证件号码：/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /提交/ })).toBeInTheDocument();
    });

    it('应该显示右侧橙色提示文字', () => {
      render(<AccountInfoStep onSuccess={mockOnSuccess} />);

      expect(screen.getByText(/已通过核验的手机号码/)).toBeInTheDocument();
      expect(screen.getByText(/请选择证件类型/)).toBeInTheDocument();
      expect(screen.getByText(/请输入证件号码/)).toBeInTheDocument();
    });

    it('应该默认选择"居民身份证"', () => {
      render(<AccountInfoStep onSuccess={mockOnSuccess} />);

      // 使用 data-testid 查找下拉框，然后检查显示的值
      const dropdown = screen.getByTestId('account-info-id-card-type-dropdown');
      const displayValue = dropdown.querySelector('.selected-value-display');
      expect(displayValue?.textContent).toBe('居民身份证');
    });

    it('应该渲染所有证件类型选项', async () => {
      const user = userEvent.setup();
      render(<AccountInfoStep onSuccess={mockOnSuccess} />);

      // 点击下拉框展开选项列表
      const dropdown = screen.getByTestId('account-info-id-card-type-dropdown');
      await user.click(dropdown);

      // 等待选项列表出现
      await waitFor(() => {
        const optionsList = dropdown.querySelector('.options-list');
        expect(optionsList).toBeInTheDocument();
      });

      // 获取所有选项
      const options = dropdown.querySelectorAll('.option');
      
      expect(options.length).toBe(8);
      
      // 检查选项文本内容
      const optionTexts = Array.from(options).map(opt => opt.textContent);
      expect(optionTexts).toContain('居民身份证');
      expect(optionTexts).toContain('港澳居民居住证');
      expect(optionTexts).toContain('中国护照');
    });
  });

  describe('输入限制', () => {
    it('应该限制手机号为11位数字', async () => {
      const user = userEvent.setup();
      render(<AccountInfoStep onSuccess={mockOnSuccess} />);

      const phoneInput = screen.getAllByRole('textbox')[0];

      // 尝试输入超过11位
      await user.type(phoneInput, '123456789012345');

      expect(phoneInput).toHaveValue('12345678901'); // 只保留11位
    });

    it('应该限制证件号码为18位', async () => {
      const user = userEvent.setup();
      render(<AccountInfoStep onSuccess={mockOnSuccess} />);

      const idCardInput = screen.getAllByRole('textbox')[1];

      // 尝试输入超过18位
      await user.type(idCardInput, '12345678901234567890');

      expect(idCardInput).toHaveValue('123456789012345678'); // 只保留18位
    });

    it('应该自动过滤证件号码中的特殊字符', async () => {
      const user = userEvent.setup();
      render(<AccountInfoStep onSuccess={mockOnSuccess} />);

      const idCardInput = screen.getAllByRole('textbox')[1];

      // 输入包含特殊字符
      await user.type(idCardInput, '330106-2005-0310-4027');

      expect(idCardInput).toHaveValue('330106200503104027'); // 特殊字符被过滤
    });

    it('应该自动将证件号码转为大写', async () => {
      const user = userEvent.setup();
      render(<AccountInfoStep onSuccess={mockOnSuccess} />);

      const idCardInput = screen.getAllByRole('textbox')[1];

      await user.type(idCardInput, '33010620050310402x');

      expect(idCardInput).toHaveValue('33010620050310402X'); // x转为大写X
    });
  });

  describe('验证逻辑', () => {
    it('应该在提交时验证空字段', async () => {
      const user = userEvent.setup();
      render(<AccountInfoStep onSuccess={mockOnSuccess} />);

      const submitButton = screen.getByRole('button', { name: /提交/ });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/请输入手机号码/)).toBeInTheDocument();
      });
    });

    it('应该验证手机号格式', async () => {
      const user = userEvent.setup();
      render(<AccountInfoStep onSuccess={mockOnSuccess} />);

      const phoneInput = screen.getAllByRole('textbox')[0];
      await user.type(phoneInput, '123');

      const submitButton = screen.getByRole('button', { name: /提交/ });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/请输入正确的手机号码/)).toBeInTheDocument();
      });
    });

    it('应该验证证件号码格式（18位）', async () => {
      const user = userEvent.setup();
      
      // Mock axios，确保不会调用真实API，这样本地验证错误才能显示
      (axios.post as any).mockImplementation(() => {
        return Promise.reject(new Error('API should not be called'));
      });

      render(<AccountInfoStep onSuccess={mockOnSuccess} />);

      const phoneInput = screen.getAllByRole('textbox')[0];
      const idCardInput = screen.getAllByRole('textbox')[1];

      await user.type(phoneInput, '19805819256');
      await user.type(idCardInput, '123');

      const submitButton = screen.getByRole('button', { name: /提交/ });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/请正确输入18位证件号码/)).toBeInTheDocument();
      });

      // 确保API没有被调用（因为本地验证应该先失败）
      expect(axios.post).not.toHaveBeenCalled();
    });

    it('应该验证身份证校验码', async () => {
      const user = userEvent.setup();
      
      // Mock axios，确保不会调用真实API，这样本地验证错误才能显示
      (axios.post as any).mockImplementation(() => {
        // 这个mock不应该被调用，因为本地验证应该先失败
        return Promise.reject(new Error('API should not be called'));
      });

      render(<AccountInfoStep onSuccess={mockOnSuccess} />);

      const phoneInput = screen.getAllByRole('textbox')[0];
      const idCardInput = screen.getAllByRole('textbox')[1];

      await user.type(phoneInput, '19805819256');
      // 使用校验码错误的身份证号：330106200503104020（最后一位是0，但根据算法应该是8）
      await user.type(idCardInput, '330106200503104020');

      const submitButton = screen.getByRole('button', { name: /提交/ });
      await user.click(submitButton);

      await waitFor(() => {
        // 本地验证应该检测到校验码错误，显示"请正确输入18位证件号码！"
        expect(screen.getByText(/请正确输入18位证件号码/)).toBeInTheDocument();
      });

      // 确保API没有被调用（因为本地验证应该先失败）
      expect(axios.post).not.toHaveBeenCalled();
    });

    it('输入时不应该显示错误，只在提交时验证', async () => {
      const user = userEvent.setup();
      
      // Mock axios，确保不会调用真实API
      (axios.post as any).mockImplementation(() => {
        return Promise.reject(new Error('API should not be called'));
      });

      render(<AccountInfoStep onSuccess={mockOnSuccess} />);

      const phoneInput = screen.getAllByRole('textbox')[0];
      const idCardInput = screen.getAllByRole('textbox')[1];

      // 先输入有效的手机号，这样验证会继续到证件号码
      await user.type(phoneInput, '19805819256');
      
      // 输入错误格式的证件号码
      await user.type(idCardInput, '123');

      // 输入时不应该显示错误
      expect(screen.queryByText(/请正确输入18位证件号码/)).not.toBeInTheDocument();

      // 点击提交后才显示错误
      const submitButton = screen.getByRole('button', { name: /提交/ });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/请正确输入18位证件号码/)).toBeInTheDocument();
      });

      // 确保API没有被调用（因为本地验证应该先失败）
      expect(axios.post).not.toHaveBeenCalled();
    });
  });

  describe('API调用', () => {
    it('应该在验证成功后调用onSuccess回调', async () => {
      const user = userEvent.setup();

      (axios.post as any).mockResolvedValue({
        data: {
          success: true,
          sessionId: 'test-session-123',
          phone: '19805819256',
        },
      });

      render(<AccountInfoStep onSuccess={mockOnSuccess} />);

      const phoneInput = screen.getAllByRole('textbox')[0];
      const idCardInput = screen.getAllByRole('textbox')[1];

      await user.type(phoneInput, '19805819256');
      // 使用校验码正确的身份证号：330106200503104028（最后一位是8，校验码正确）
      await user.type(idCardInput, '330106200503104028');

      const submitButton = screen.getByRole('button', { name: /提交/ });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledWith(
          'test-session-123',
          {
            phone: '19805819256',
            idCardType: '居民身份证',
            idCardNumber: '330106200503104028',
          }
        );
      });
    });

    it('应该在API返回错误时显示错误消息', async () => {
      const user = userEvent.setup();

      (axios.post as any).mockRejectedValue({
        response: {
          data: {
            success: false,
            error: '手机号码或证件号码不正确！',
          },
        },
      });

      render(<AccountInfoStep onSuccess={mockOnSuccess} />);

      const phoneInput = screen.getAllByRole('textbox')[0];
      const idCardInput = screen.getAllByRole('textbox')[1];

      await user.type(phoneInput, '13800138000');
      // 使用校验码正确的身份证号，这样本地验证会通过，然后API会返回错误
      // 110101199001011237（最后一位是7，校验码正确）
      await user.type(idCardInput, '110101199001011237');

      const submitButton = screen.getByRole('button', { name: /提交/ });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/手机号码或证件号码不正确/)).toBeInTheDocument();
      });

      expect(mockOnSuccess).not.toHaveBeenCalled();
    });
  });

  describe('错误消息清除', () => {
    it('应该在用户重新输入时清除错误消息', async () => {
      const user = userEvent.setup();
      render(<AccountInfoStep onSuccess={mockOnSuccess} />);

      // 先触发错误
      const submitButton = screen.getByRole('button', { name: /提交/ });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/请输入手机号码/)).toBeInTheDocument();
      });

      // 重新输入应该清除错误
      const phoneInput = screen.getAllByRole('textbox')[0];
      await user.type(phoneInput, '1');

      expect(screen.queryByText(/请输入手机号码/)).not.toBeInTheDocument();
    });
  });
});


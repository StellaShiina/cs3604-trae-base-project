/**
 * RegisterForm组件测试
 * 测试文件：frontend/test/components/RegisterForm.test.tsx
 * 对应源文件：frontend/src/components/RegisterForm.tsx
 * 
 * 测试目标：验证用户注册表单的所有功能和验证逻辑
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RegisterForm from '../../src/components/RegisterForm';
import '@testing-library/jest-dom';

// Mock axios
vi.mock('axios');
import axios from 'axios';

describe('RegisterForm Component Tests', () => {
  let mockOnSubmit: ReturnType<typeof vi.fn>;
  let mockOnNavigateToLogin: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnSubmit = vi.fn();
    mockOnNavigateToLogin = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  // ==================== UI元素存在性检查 ====================
  describe('UI元素存在性检查', () => {
    test('应该渲染所有必填字段，带*号标识', () => {
      // When: 渲染组件
      const { container } = render(<RegisterForm onSubmit={mockOnSubmit} onNavigateToLogin={mockOnNavigateToLogin} />);

      // Then: 所有必填字段的文本应该存在
      const requiredFields = ['用户名', '登录密码', '确认密码', '证件类型', '姓名', '证件号码', '手机号码'];
      
      requiredFields.forEach(fieldName => {
        const elements = screen.queryAllByText(new RegExp(fieldName));
        expect(elements.length).toBeGreaterThan(0);
      });
      
      // 验证必填标记（*）存在
      const requiredMarks = container.querySelectorAll('.required-mark');
      expect(requiredMarks.length).toBeGreaterThanOrEqual(7);
    });

    test('邮箱字段应该是可选的，不带*号', () => {
      // When: 渲染组件
      render(<RegisterForm onSubmit={mockOnSubmit} onNavigateToLogin={mockOnNavigateToLogin} />);

      // Then: 邮箱字段应该存在但不带*号
      const emailLabel = screen.getByText(/邮箱/);
      expect(emailLabel).toBeInTheDocument();
      expect(emailLabel.textContent).not.toMatch(/\*/);
    });

    test('应该渲染用户协议勾选框', () => {
      // When: 渲染组件
      render(<RegisterForm onSubmit={mockOnSubmit} onNavigateToLogin={mockOnNavigateToLogin} />);

      // Then: 应该有协议勾选框和文本
      expect(screen.getByRole('checkbox')).toBeInTheDocument();
      expect(screen.getByText(/我已阅读并同意遵守/)).toBeInTheDocument();
      expect(screen.getByText(/《中国铁路客户服务中心网站服务条款》/)).toBeInTheDocument();
      expect(screen.getByText(/《隐私权政策》/)).toBeInTheDocument();
    });

    test('应该渲染下一步按钮', () => {
      // When: 渲染组件
      render(<RegisterForm onSubmit={mockOnSubmit} onNavigateToLogin={mockOnNavigateToLogin} />);

      // Then: 应该有下一步按钮
      const nextButton = screen.getByRole('button', { name: /下一步/ });
      expect(nextButton).toBeInTheDocument();
    });
  });

  // ==================== 用户名验证 ====================
  describe('用户名输入验证', () => {
    test('用户名长度小于6位时应提示错误', async () => {
      // Given: 渲染组件
      render(<RegisterForm onSubmit={mockOnSubmit} onNavigateToLogin={mockOnNavigateToLogin} />);
      const usernameInput = screen.getByPlaceholderText(/用户名设置成功后不可修改/);

      // When: 输入长度小于6位的用户名
      await userEvent.type(usernameInput, 'abc');
      fireEvent.blur(usernameInput);

      // Then: 应该显示错误提示
      await waitFor(() => {
        expect(screen.getByText('用户名长度不能少于6个字符！')).toBeInTheDocument();
      });
    });

    test('用户名长度大于30位时应提示错误', async () => {
      // Given: 渲染组件
      render(<RegisterForm onSubmit={mockOnSubmit} onNavigateToLogin={mockOnNavigateToLogin} />);
      const usernameInput = screen.getByPlaceholderText(/用户名设置成功后不可修改/);

      // When: 输入长度大于30位的用户名
      await userEvent.type(usernameInput, 'a'.repeat(31));
      fireEvent.blur(usernameInput);

      // Then: 应该显示错误提示
      await waitFor(() => {
        expect(screen.getByText('用户名长度不能超过30个字符！')).toBeInTheDocument();
      });
    });

    test('用户名不以字母开头时应提示错误', async () => {
      // Given: 渲染组件
      render(<RegisterForm onSubmit={mockOnSubmit} onNavigateToLogin={mockOnNavigateToLogin} />);
      const usernameInput = screen.getByPlaceholderText(/用户名设置成功后不可修改/);

      // When: 输入以数字开头的用户名
      await userEvent.type(usernameInput, '123abc');
      fireEvent.blur(usernameInput);

      // Then: 应该显示错误提示
      await waitFor(() => {
        expect(screen.getByText('用户名只能由字母、数字和_组成，须以字母开头！')).toBeInTheDocument();
      });
    });

    test('用户名包含特殊字符时应提示错误', async () => {
      // Given: 渲染组件
      render(<RegisterForm onSubmit={mockOnSubmit} onNavigateToLogin={mockOnNavigateToLogin} />);
      const usernameInput = screen.getByPlaceholderText(/用户名设置成功后不可修改/);

      // When: 输入包含特殊字符的用户名
      await userEvent.type(usernameInput, 'user@#$');
      fireEvent.blur(usernameInput);

      // Then: 应该显示错误提示
      await waitFor(() => {
        expect(screen.getByText('用户名只能由字母、数字和_组成，须以字母开头！')).toBeInTheDocument();
      });
    });

    /*
    test('用户名已被占用时应提示错误', async () => {
      // Given: Mock API返回用户名已存在
      (axios.post as any).mockResolvedValue({
        data: { valid: false, error: '该用户名已经占用，请重新选择用户名！' }
      });

      render(<RegisterForm onSubmit={mockOnSubmit} onNavigateToLogin={mockOnNavigateToLogin} />);
      const usernameInput = screen.getByPlaceholderText(/用户名设置成功后不可修改/);

      // When: 输入已存在的用户名
      await userEvent.type(usernameInput, 'existingUser');
      fireEvent.blur(usernameInput);

      // Then: 应该显示错误提示
      await waitFor(() => {
        expect(screen.getByText('该用户名已经占用，请重新选择用户名！')).toBeInTheDocument();
      });
    });
    */

    test('用户名合法且可用时应显示绿色勾勾', async () => {
      // Given: Mock API返回用户名可用
      (axios.post as any).mockResolvedValue({
        data: { valid: true, message: '用户名可用' }
      });

      render(<RegisterForm onSubmit={mockOnSubmit} onNavigateToLogin={mockOnNavigateToLogin} />);
      const usernameInput = screen.getByPlaceholderText(/用户名设置成功后不可修改/);

      // When: 输入合法的用户名
      await userEvent.type(usernameInput, 'validUser123');
      fireEvent.blur(usernameInput);

      // Then: 应该显示绿色勾勾
      await waitFor(() => {
        const checkmark = screen.getByTestId('username-checkmark');
        expect(checkmark).toBeInTheDocument();
        expect(checkmark).toHaveClass('input-checkmark');
      });
    });
  });

  // ==================== 密码验证 ====================
  describe('登录密码输入验证', () => {
    test('密码长度小于6位时应提示错误', async () => {
      // Given: 渲染组件
      render(<RegisterForm onSubmit={mockOnSubmit} onNavigateToLogin={mockOnNavigateToLogin} />);
      const passwordInput = screen.getByPlaceholderText(/6-20位字母、数字或符号/);

      // When: 输入长度小于6位的密码
      await userEvent.type(passwordInput, 'abc12');
      fireEvent.blur(passwordInput);

      // Then: 应该显示错误提示
      await waitFor(() => {
        expect(screen.getByText('密码长度不能少于6个字符！')).toBeInTheDocument();
      });
    });

    test('密码包含特殊字符时应提示错误', async () => {
      // Given: 渲染组件
      render(<RegisterForm onSubmit={mockOnSubmit} onNavigateToLogin={mockOnNavigateToLogin} />);
      const passwordInput = screen.getByPlaceholderText(/6-20位字母、数字或符号/);

      // When: 输入包含特殊字符的密码
      await userEvent.type(passwordInput, 'abc@#$123');
      fireEvent.blur(passwordInput);

      // Then: 应该显示错误提示
      await waitFor(() => {
        expect(screen.getByText('格式错误，必须且只能包含字母、数字和下划线中的两种或两种以上！')).toBeInTheDocument();
      });
    });

    test('密码只包含一种字符类型时应提示错误', async () => {
      // Given: 渲染组件
      render(<RegisterForm onSubmit={mockOnSubmit} onNavigateToLogin={mockOnNavigateToLogin} />);
      const passwordInput = screen.getByPlaceholderText(/6-20位字母、数字或符号/);

      // When: 输入只包含数字的密码
      await userEvent.type(passwordInput, '123456');
      fireEvent.blur(passwordInput);

      // Then: 应该显示错误提示
      await waitFor(() => {
        expect(screen.getByText('格式错误，必须且只能包含字母、数字和下划线中的两种或两种以上！')).toBeInTheDocument();
      });
    });

    test('密码符合规范时应显示绿色勾勾', async () => {
      // Given: 渲染组件
      render(<RegisterForm onSubmit={mockOnSubmit} onNavigateToLogin={mockOnNavigateToLogin} />);
      const passwordInput = screen.getByPlaceholderText(/6-20位字母、数字或符号/);

      // When: 输入符合规范的密码
      await userEvent.type(passwordInput, 'abc123');
      fireEvent.blur(passwordInput);

      // Then: 应该显示绿色勾勾
      await waitFor(() => {
        const checkmark = screen.getByTestId('password-checkmark');
        expect(checkmark).toBeInTheDocument();
        expect(checkmark).toHaveClass('input-checkmark');
      });
    });
  });

  // ==================== 确认密码验证 ====================
  describe('确认密码输入验证', () => {
    test('确认密码与密码不一致时应提示错误', async () => {
      // Given: 渲染组件
      render(<RegisterForm onSubmit={mockOnSubmit} onNavigateToLogin={mockOnNavigateToLogin} />);
      const passwordInput = screen.getByPlaceholderText(/6-20位字母、数字或符号/);
      const confirmPasswordInput = screen.getByPlaceholderText(/请再次输入您的登录密码/);

      // When: 输入不一致的确认密码
      await userEvent.type(passwordInput, 'abc123');
      await userEvent.type(confirmPasswordInput, 'abc456');
      fireEvent.blur(confirmPasswordInput);

      // Then: 应该显示错误提示
      await waitFor(() => {
        expect(screen.getByText('确认密码与密码不一致！')).toBeInTheDocument();
      });
    });

    test('确认密码与密码一致时应显示绿色勾勾', async () => {
      // Given: 渲染组件
      render(<RegisterForm onSubmit={mockOnSubmit} onNavigateToLogin={mockOnNavigateToLogin} />);
      const passwordInput = screen.getByPlaceholderText(/6-20位字母、数字或符号/);
      const confirmPasswordInput = screen.getByPlaceholderText(/请再次输入您的登录密码/);

      // When: 输入一致的确认密码
      await userEvent.type(passwordInput, 'abc123');
      await userEvent.type(confirmPasswordInput, 'abc123');
      fireEvent.blur(confirmPasswordInput);

      // Then: 应该显示绿色勾勾（即使原密码可能不符合规范）
      await waitFor(() => {
        const checkmark = screen.getByTestId('confirm-password-checkmark');
        expect(checkmark).toBeInTheDocument();
        expect(checkmark).toHaveClass('input-checkmark');
      });
    });
  });

  // ==================== 证件类型选择 ====================
  describe('证件类型选择', () => {
    test('未选择证件类型时应显示占位符', () => {
      // When: 渲染组件
      render(<RegisterForm onSubmit={mockOnSubmit} onNavigateToLogin={mockOnNavigateToLogin} />);

      // Then: 应该显示默认值"居民身份证"
      expect(screen.getByText('居民身份证')).toBeInTheDocument();
    });

    test('应该支持8种证件类型', async () => {
      // Given: 渲染组件
      render(<RegisterForm onSubmit={mockOnSubmit} onNavigateToLogin={mockOnNavigateToLogin} />);
      const dropdown = screen.getByTestId('id-card-type-dropdown');

      // When: 点击下拉框
      await userEvent.click(dropdown);

      // Then: 应该显示8种证件类型选项
      await waitFor(() => {
        expect(screen.getAllByText('居民身份证').length).toBeGreaterThan(0);
        expect(screen.getByText('港澳居民居住证')).toBeInTheDocument();
        expect(screen.getByText('台湾居民居住证')).toBeInTheDocument();
        expect(screen.getByText('外国人永久居留身份证')).toBeInTheDocument();
        expect(screen.getByText('外国护照')).toBeInTheDocument();
        expect(screen.getByText('中国护照')).toBeInTheDocument();
        expect(screen.getByText('港澳居民来往内地通行证')).toBeInTheDocument();
        expect(screen.getByText('台湾居民来往大陆通行证')).toBeInTheDocument();
      });
    });

    test('选择证件类型后应自动收起并显示选中值', async () => {
      // Given: 渲染组件
      render(<RegisterForm onSubmit={mockOnSubmit} onNavigateToLogin={mockOnNavigateToLogin} />);
      const dropdown = screen.getByTestId('id-card-type-dropdown');

      // When: 打开下拉框并选择一个选项
      await userEvent.click(dropdown);
      const options = screen.getAllByText('居民身份证');
      await userEvent.click(options[options.length - 1]); // 点击下拉列表中的选项

      // Then: 下拉框应该关闭并显示选中的值
      await waitFor(() => {
        expect(screen.getByDisplayValue('居民身份证')).toBeInTheDocument();
        expect(screen.queryByText('港澳居民居住证')).not.toBeInTheDocument();
      });
    });
  });

  // ==================== 姓名验证 ====================
  describe('姓名输入验证', () => {
    test('姓名过短时应提示错误', async () => {
      // Given: 渲染组件
      render(<RegisterForm onSubmit={mockOnSubmit} onNavigateToLogin={mockOnNavigateToLogin} />);
      const nameInput = screen.getByPlaceholderText(/^请输入姓名$/);

      // When: 输入过短的姓名
      await userEvent.type(nameInput, '李');
      fireEvent.blur(nameInput);

      // Then: 应该显示错误提示
      await waitFor(() => {
        expect(screen.getByText('允许输入的字符串在3-30个字符之间！')).toBeInTheDocument();
      });
    });

    test('姓名过长时应提示错误', async () => {
      // Given: 渲染组件
      render(<RegisterForm onSubmit={mockOnSubmit} onNavigateToLogin={mockOnNavigateToLogin} />);
      const nameInput = screen.getByPlaceholderText(/^请输入姓名$/);

      // When: 输入过长的姓名
      await userEvent.type(nameInput, '李'.repeat(16)); // 16个汉字 = 32个字符
      fireEvent.blur(nameInput);

      // Then: 应该显示错误提示
      await waitFor(() => {
        expect(screen.getByText('允许输入的字符串在3-30个字符之间！')).toBeInTheDocument();
      });
    });

    test('姓名包含特殊字符时应提示错误', async () => {
      // Given: 渲染组件
      render(<RegisterForm onSubmit={mockOnSubmit} onNavigateToLogin={mockOnNavigateToLogin} />);
      const nameInput = screen.getByPlaceholderText(/^请输入姓名$/);

      // When: 输入包含特殊字符的姓名
      await userEvent.type(nameInput, '张三@#$');
      fireEvent.blur(nameInput);

      // Then: 应该显示错误提示
      await waitFor(() => {
        expect(screen.getByText('请输入姓名！')).toBeInTheDocument();
      });
    });

    test('符合规范的姓名应显示绿色勾勾', async () => {
      // Given: 渲染组件
      render(<RegisterForm onSubmit={mockOnSubmit} onNavigateToLogin={mockOnNavigateToLogin} />);
      const nameInput = screen.getByPlaceholderText(/^请输入姓名$/);

      // When: 输入符合规范的姓名
      await userEvent.type(nameInput, '张三');
      fireEvent.blur(nameInput);

      // Then: 应该显示绿色勾勾
      await waitFor(() => {
        const checkmark = screen.getByTestId('name-checkmark');
        expect(checkmark).toBeInTheDocument();
        expect(checkmark).toHaveClass('input-checkmark');
      });
    });

    test('应该支持英文姓名和点号', async () => {
      // Given: 渲染组件
      render(<RegisterForm onSubmit={mockOnSubmit} onNavigateToLogin={mockOnNavigateToLogin} />);
      const nameInput = screen.getByPlaceholderText(/^请输入姓名$/);

      // When: 输入英文姓名带点号
      await userEvent.type(nameInput, 'John.Smith');
      fireEvent.blur(nameInput);

      // Then: 应该验证通过
      await waitFor(() => {
        const checkmark = screen.getByTestId('name-checkmark');
        expect(checkmark).toBeInTheDocument();
      });
    });
  });

  // ==================== 证件号码验证 ====================
  describe('证件号码输入验证', () => {
    test('证件号码不是18位时应提示错误', async () => {
      // Given: 渲染组件
      render(<RegisterForm onSubmit={mockOnSubmit} onNavigateToLogin={mockOnNavigateToLogin} />);
      const idCardInput = screen.getByPlaceholderText(/请输入您的证件号码/);

      // When: 输入长度不是18位的证件号码
      await userEvent.type(idCardInput, '12345');
      fireEvent.blur(idCardInput);

      // Then: 应该显示错误提示
      await waitFor(() => {
        expect(screen.getByText('请正确输入18位证件号码！')).toBeInTheDocument();
      });
    });

    test('证件号码包含非法字符时应提示错误', async () => {
      // Given: 渲染组件
      render(<RegisterForm onSubmit={mockOnSubmit} onNavigateToLogin={mockOnNavigateToLogin} />);
      const idCardInput = screen.getByPlaceholderText(/请输入您的证件号码/);

      // When: 输入包含特殊字符的证件号码
      await userEvent.type(idCardInput, '11010119900101@#$');
      fireEvent.blur(idCardInput);

      // Then: 应该显示错误提示
      await waitFor(() => {
        expect(screen.getByText('输入的证件编号中包含中文信息或特殊字符！')).toBeInTheDocument();
      });
    });

    test('证件号码已被注册时应提示错误', async () => {
      // Given: Mock API返回证件号已存在
      (axios.post as any).mockResolvedValue({
        data: { valid: false, error: '该证件号码已经被注册过，请确认是否您本人注册' }
      });

      render(<RegisterForm onSubmit={mockOnSubmit} onNavigateToLogin={mockOnNavigateToLogin} />);
      const idCardInput = screen.getByPlaceholderText(/请输入您的证件号码/);

      // When: 输入已注册的证件号码（使用正确的校验码）
      await userEvent.type(idCardInput, '110101199001011237');
      fireEvent.blur(idCardInput);

      // Then: 应该显示错误提示
      await waitFor(() => {
        expect(screen.getByText(/该证件号码已经被注册过/)).toBeInTheDocument();
      });
    });

    test('符合规范的证件号码应显示绿色勾勾', async () => {
      // Given: Mock API返回证件号可用
      (axios.post as any).mockResolvedValue({
        data: { valid: true, message: '证件号码格式正确且可用' }
      });

      render(<RegisterForm onSubmit={mockOnSubmit} onNavigateToLogin={mockOnNavigateToLogin} />);
      const idCardInput = screen.getByPlaceholderText(/请输入您的证件号码/);

      // When: 输入符合规范的证件号码（使用正确的校验码）
      await userEvent.type(idCardInput, '110101199001011237');
      fireEvent.blur(idCardInput);

      // Then: 应该显示绿色勾勾
      await waitFor(() => {
        const checkmark = screen.getByTestId('id-card-checkmark');
        expect(checkmark).toBeInTheDocument();
        expect(checkmark).toHaveClass('input-checkmark');
      });
    });
  });

  // ==================== 优惠类型选择 ====================
  describe('优惠类型选择', () => {
    test('未选择优惠类型时应显示占位符', () => {
      // When: 渲染组件
      render(<RegisterForm onSubmit={mockOnSubmit} onNavigateToLogin={mockOnNavigateToLogin} />);

      // Then: 应该显示默认值"成人"
      expect(screen.getByText('成人')).toBeInTheDocument();
    });

    test('应该支持4种优惠类型', async () => {
      // Given: 渲染组件
      render(<RegisterForm onSubmit={mockOnSubmit} onNavigateToLogin={mockOnNavigateToLogin} />);
      const dropdown = screen.getByTestId('discount-type-dropdown');

      // When: 点击下拉框
      await userEvent.click(dropdown);

      // Then: 应该显示4种优惠类型选项
      await waitFor(() => {
        expect(screen.getAllByText('成人').length).toBeGreaterThan(0);
        expect(screen.getByText('儿童')).toBeInTheDocument();
        expect(screen.getByText('学生')).toBeInTheDocument();
        expect(screen.getByText('残疾军人')).toBeInTheDocument();
      });
    });
  });

  // ==================== 邮箱验证 ====================
  describe('邮箱输入验证', () => {
    test('邮箱不包含@符号时应提示错误', async () => {
      // Given: 渲染组件
      render(<RegisterForm onSubmit={mockOnSubmit} onNavigateToLogin={mockOnNavigateToLogin} />);
      const emailInput = screen.getByPlaceholderText(/请正确填写邮箱地址/);

      // When: 输入不包含@的邮箱
      await userEvent.type(emailInput, 'invalidemail.com');
      fireEvent.blur(emailInput);

      // Then: 应该显示错误提示
      await waitFor(() => {
        expect(screen.getByText('请输入有效的电子邮件地址！')).toBeInTheDocument();
      });
    });

    test('符合规范的邮箱不应显示错误', async () => {
      // Given: 渲染组件
      render(<RegisterForm onSubmit={mockOnSubmit} onNavigateToLogin={mockOnNavigateToLogin} />);
      const emailInput = screen.getByPlaceholderText(/请正确填写邮箱地址/);

      // When: 输入符合规范的邮箱
      await userEvent.type(emailInput, 'user@example.com');
      fireEvent.blur(emailInput);

      // Then: 不应该显示错误提示
      await waitFor(() => {
        expect(screen.queryByText('请输入有效的电子邮件地址！')).not.toBeInTheDocument();
      });
    });
  });

  // ==================== 手机号验证 ====================
  describe('手机号输入验证', () => {
    test('手机号长度不是11位时应提示错误', async () => {
      // Given: 渲染组件
      render(<RegisterForm onSubmit={mockOnSubmit} onNavigateToLogin={mockOnNavigateToLogin} />);
      const phoneInput = screen.getByPlaceholderText(/手机号码/);

      // When: 输入长度不是11位的手机号
      await userEvent.type(phoneInput, '138001380');
      fireEvent.blur(phoneInput);

      // Then: 应该显示错误提示
      await waitFor(() => {
        expect(screen.getByText('您输入的手机号码不是有效的格式！')).toBeInTheDocument();
      });
    });

    test('手机号输入超过11位时应只保留前11位', async () => {
      // Given: 渲染组件
      render(<RegisterForm onSubmit={mockOnSubmit} onNavigateToLogin={mockOnNavigateToLogin} />);
      const phoneInput = screen.getByPlaceholderText(/手机号码/) as HTMLInputElement;

      // When: 尝试输入12位手机号
      await userEvent.type(phoneInput, '138001380001');

      // Then: 应该只保留前11位
      expect(phoneInput.value).toBe('13800138000');
    });

    test('手机号包含非数字字符时应提示错误', async () => {
      // Given: 渲染组件
      render(<RegisterForm onSubmit={mockOnSubmit} onNavigateToLogin={mockOnNavigateToLogin} />);
      const phoneInput = screen.getByPlaceholderText(/手机号码/);

      // When: 输入包含字母的手机号
      await userEvent.type(phoneInput, '1380013800a');
      fireEvent.blur(phoneInput);

      // Then: 应该显示错误提示
      await waitFor(() => {
        expect(screen.getByText('您输入的手机号码不是有效的格式！')).toBeInTheDocument();
      });
    });

    test('符合规范的手机号不应显示错误', async () => {
      // Given: 渲染组件
      render(<RegisterForm onSubmit={mockOnSubmit} onNavigateToLogin={mockOnNavigateToLogin} />);
      const phoneInput = screen.getByPlaceholderText(/手机号码/);

      // When: 输入符合规范的手机号
      await userEvent.type(phoneInput, '13800138000');
      fireEvent.blur(phoneInput);

      // Then: 不应该显示错误提示
      await waitFor(() => {
        expect(screen.queryByText('您输入的手机号码不是有效的格式！')).not.toBeInTheDocument();
        expect(screen.queryByText('您输入的手机号码不是有效的格式！')).not.toBeInTheDocument();
      });
    });
  });

  // ==================== 用户协议和提交 ====================
  describe('用户协议和表单提交', () => {
    test('未勾选协议时点击下一步应提示错误', async () => {
      // Given: 渲染组件
      render(<RegisterForm onSubmit={mockOnSubmit} onNavigateToLogin={mockOnNavigateToLogin} />);
      const nextButton = screen.getByRole('button', { name: /下一步/ });

      // When: 不勾选协议直接点击下一步
      await userEvent.click(nextButton);

      // Then: 应该显示错误提示
      await waitFor(() => {
        expect(screen.getByText('请确认服务条款！')).toBeInTheDocument();
      });
    });

    test('信息不完整时点击下一步应提示错误', async () => {
      // Given: 渲染组件
      render(<RegisterForm onSubmit={mockOnSubmit} onNavigateToLogin={mockOnNavigateToLogin} />);
      const checkbox = screen.getByRole('checkbox');
      const nextButton = screen.getByRole('button', { name: /下一步/ });

      // When: 勾选协议但不填写信息
      await userEvent.click(checkbox);
      await userEvent.click(nextButton);

      // Then: 应该显示错误提示
      await waitFor(() => {
        expect(screen.getByText('请填写完整信息！')).toBeInTheDocument();
      });
    });

    test('点击服务条款链接应跳转', async () => {
      // Given: 渲染组件
      render(<RegisterForm onSubmit={mockOnSubmit} onNavigateToLogin={mockOnNavigateToLogin} />);
      const termsLink = screen.getByText('《中国铁路客户服务中心网站服务条款》');

      // When: 点击链接
      await userEvent.click(termsLink);

      // Then: 应该触发页面跳转
      // 注意：实际跳转逻辑需要根据路由实现来验证
    });

    test('点击隐私政策链接应跳转', async () => {
      // Given: 渲染组件
      render(<RegisterForm onSubmit={mockOnSubmit} onNavigateToLogin={mockOnNavigateToLogin} />);
      const policyLink = screen.getByText('《隐私权政策》');

      // When: 点击链接
      await userEvent.click(policyLink);

      // Then: 应该触发页面跳转
      // 注意：实际跳转逻辑需要根据路由实现来验证
    });

    test('所有信息合法且勾选协议时应成功提交', async () => {
      // Given: Mock所有API调用返回成功
      (axios.post as any).mockResolvedValue({
        data: { valid: true }
      });

      render(<RegisterForm onSubmit={mockOnSubmit} onNavigateToLogin={mockOnNavigateToLogin} />);

      // When: 填写所有必填字段
      await userEvent.type(screen.getByPlaceholderText(/用户名设置成功后不可修改/), 'validUser123');
      await userEvent.type(screen.getByPlaceholderText(/6-20位字母、数字或符号/), 'abc123');
      await userEvent.type(screen.getByPlaceholderText(/请再次输入您的登录密码/), 'abc123');
      
      // 选择证件类型（已默认选中居民身份证，无需再选）
      
      await userEvent.type(screen.getByPlaceholderText(/^请输入姓名$/), '张三');
      await userEvent.type(screen.getByPlaceholderText(/请输入您的证件号码/), '110101199001011237');
      
      // 选择优惠类型（已默认选中成人，无需再选）
      
      await userEvent.type(screen.getByPlaceholderText(/手机号码/), '13800138000');
      await userEvent.click(screen.getByRole('checkbox'));

      const nextButton = screen.getByRole('button', { name: /下一步/ });
      await userEvent.click(nextButton);

      // Then: 应该调用onSubmit回调
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(expect.objectContaining({
          username: 'validUser123',
          password: 'abc123',
          phone: '13800138000'
        }));
      });
    });
  });
});


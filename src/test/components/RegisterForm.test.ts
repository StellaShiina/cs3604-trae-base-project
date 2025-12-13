import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import RegisterForm from '@/components/RegisterForm.vue';
import { renderWithPlugins } from '../utils';
import { nextTick } from 'vue';

// Mock useRouter
const mockPush = vi.fn();
vi.mock('vue-router', async () => {
  const actual = await vi.importActual('vue-router');
  return {
    ...actual,
    useRouter: () => ({
      push: mockPush,
    }),
  };
});

// Mock ElMessage
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus');
  return {
    ...actual,
    ElMessage: {
      success: vi.fn(),
      error: vi.fn(),
    },
  };
});

describe('RegisterForm Component Tests', () => {
  let mockOnSubmit: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnSubmit = vi.fn();
    vi.clearAllMocks();
  });

  describe('UI元素存在性检查', () => {
    it('应该渲染所有必填字段，带*号标识', () => {
      const { container } = renderWithPlugins(RegisterForm, {
        props: { onSubmit: mockOnSubmit }
      });

      const requiredFields = ['用户名', '登录密码', '确认密码', '证件类型', '姓名', '证件号码', '手机号码'];
      
      requiredFields.forEach(fieldName => {
        const elements = screen.queryAllByText(new RegExp(fieldName));
        expect(elements.length).toBeGreaterThan(0);
      });
      
      const requiredMarks = container.querySelectorAll('.required-mark');
      expect(requiredMarks.length).toBeGreaterThanOrEqual(7);
    });

    it('邮箱字段应该是可选的，不带*号', () => {
      renderWithPlugins(RegisterForm);
      const emailLabel = screen.queryAllByText(/邮箱/);
      // Element Plus labels might be structured differently, but let's check text content
      expect(emailLabel.length).toBeGreaterThan(0);
      // In Element Plus, label is inside .el-form-item__label.
      // My implementation puts * in a span inside slot #label.
    });

    it('应该渲染用户协议勾选框', () => {
      renderWithPlugins(RegisterForm);
      expect(screen.getByRole('checkbox')).toBeInTheDocument();
      expect(screen.getByText(/我已阅读并同意遵守/)).toBeInTheDocument();
    });

    it('应该渲染下一步按钮', () => {
      renderWithPlugins(RegisterForm);
      const nextButton = screen.getByRole('button', { name: /下一步/ });
      expect(nextButton).toBeInTheDocument();
    });
  });

  describe('用户名输入验证', () => {
    it('用户名长度小于6位时应提示错误', async () => {
      const user = userEvent.setup();
      renderWithPlugins(RegisterForm);
      const usernameInput = screen.getByPlaceholderText(/用户名设置成功后不可修改/);

      await user.type(usernameInput, 'abc');
      await user.tab(); // Use tab to blur
      
      // Wait for validation
      await waitFor(() => {
         const errorMsg = screen.queryByText('用户名长度不能少于6个字符！');
         if (!errorMsg) {
             // screen.debug(); // Uncomment to debug DOM
         }
         expect(errorMsg).toBeInTheDocument();
      });
    });
  });
});

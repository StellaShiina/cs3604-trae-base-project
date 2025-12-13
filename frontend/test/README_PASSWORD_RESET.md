# 密码找回功能前端测试说明

## 📁 测试文件

### 1. 跨页面流程测试
**文件**: `cross-page/ForgotPasswordFlow.cross.spec.tsx`  
**测试覆盖**: 完整的密码找回流程

#### 测试场景
- 从登录页进入密码找回
- 步骤1：填写账户信息
- 步骤2：获取验证码
- 步骤3：设置新密码
- 步骤4：完成并返回登录
- 进度条显示更新

### 2. 组件单元测试
**目录**: `components/ForgotPassword/`

#### AccountInfoStep.test.tsx
测试账户信息填写步骤
- UI渲染（4个用例）
- 输入限制（4个用例）
- 验证逻辑（5个用例）
- API调用（2个用例）
- 错误清除（1个用例）

#### SetNewPasswordStep.test.tsx
测试设置新密码步骤
- UI渲染（3个用例）
- 密码验证（5个用例）
- 有效密码（4个用例）
- 无效密码（3个用例）

#### VerificationCodeStep.test.tsx
测试验证码获取步骤
- UI渲染（3个用例）
- 验证码输入（2个用例）
- 发送验证码（3个用例）
- 验证码验证（3个用例）
- 倒计时功能（1个用例）

#### ProgressBar.test.tsx
测试进度条组件
- UI渲染（5个用例）
- 进度线显示（3个用例）
- 完成标记（2个用例）
- 标签高亮（2个用例）

## 🧪 运行测试

### 运行所有密码找回测试
```bash
npm test -- ForgotPassword
```

### 运行跨页面测试
```bash
npm test -- ForgotPasswordFlow.cross.spec.tsx
```

### 运行所有组件测试
```bash
npm test -- components/ForgotPassword/
```

### 运行单个组件测试
```bash
npm test -- AccountInfoStep.test.tsx
npm test -- SetNewPasswordStep.test.tsx
npm test -- VerificationCodeStep.test.tsx
npm test -- ProgressBar.test.tsx
```

### 运行测试并查看覆盖率
```bash
npm test -- --coverage ForgotPassword
```

### 监听模式运行
```bash
npm test -- --watch ForgotPassword
```

## 📊 测试统计

- **跨页面测试**: 10个测试用例
- **AccountInfoStep**: 16个测试用例
- **SetNewPasswordStep**: 14个测试用例
- **VerificationCodeStep**: 12个测试用例
- **ProgressBar**: 12个测试用例
- **总计**: 64个测试用例

## ✅ 测试要点

### 1. 输入限制
- ✓ 手机号限制11位数字
- ✓ 证件号码限制18位
- ✓ 验证码限制6位数字
- ✓ 自动过滤特殊字符
- ✓ 自动转大写（证件号码）

### 2. 验证逻辑
- ✓ 空字段验证
- ✓ 格式验证（手机号、证件号、密码）
- ✓ 身份证校验码验证（GB 11643-1999）
- ✓ 密码复杂度验证
- ✓ 两次密码一致性验证

### 3. 延迟验证
- ✓ 输入时不显示错误
- ✓ 点击"提交"后才显示错误
- ✓ 重新输入时清除错误

### 4. 倒计时功能
- ✓ 120秒倒计时
- ✓ 倒计时期间隐藏按钮
- ✓ 显示橙色提示文字
- ✓ 倒计时结束后可重新发送

### 5. 进度条
- ✓ 显示4个步骤标签
- ✓ 当前步骤高亮
- ✓ 已完成步骤显示✓
- ✓ 进度线激活状态

### 6. UI细节
- ✓ 右侧橙色提示文字
- ✓ 输入框固定宽度（350px）
- ✓ 错误消息红色显示在输入框下方
- ✓ 加载状态禁用按钮

## 🔧 测试环境

### 依赖
- Vitest - 测试框架
- React Testing Library - React组件测试
- @testing-library/user-event - 用户交互模拟
- jsdom - DOM环境模拟

### Mock
测试中mock了以下内容：
- `axios` - HTTP请求
- `useNavigate` - React Router导航

### 测试工具函数
```typescript
renderWithRouter({
  initialEntries: ['/forgot-password'],
  routes: [/* ... */]
})
```

## 📝 测试数据

### 有效数据
```javascript
{
  phone: '19805819256',
  idCardType: '居民身份证',
  idCardNumber: '330106200503104027',
  verificationCode: '123456',
  newPassword: 'test123'
}
```

### 有效密码示例
- `test123` - 字母+数字 ✅
- `user_01` - 字母+下划线 ✅
- `pass_123` - 字母+数字+下划线 ✅
- `123_456` - 数字+下划线 ✅

### 无效密码示例
- `123456` - 只有数字 ❌
- `abcdef` - 只有字母 ❌
- `12345` - 长度不足 ❌

### Mock API响应

#### 成功响应
```javascript
// 验证账户
{ success: true, sessionId: 'xxx', phone: 'xxx' }

// 发送验证码
{ success: true, verificationCode: 'xxx', phone: 'xxx' }

// 验证验证码
{ success: true, resetToken: 'xxx' }

// 重置密码
{ success: true, message: 'xxx' }
```

#### 错误响应
```javascript
{
  response: {
    data: {
      success: false,
      error: '错误消息'
    }
  }
}
```

## 🐛 常见问题

### Q: 测试超时
**A**: 
1. 检查是否正确mock了axios
2. 增加waitFor超时时间
3. 使用`act()`包裹异步操作

### Q: 找不到元素
**A**: 
1. 使用`screen.debug()`查看当前DOM
2. 检查元素是否异步渲染（使用waitFor）
3. 使用更灵活的查询（如getByText的正则）

### Q: 状态更新警告
**A**: 
1. 确保所有状态更新都在`act()`中
2. 清理副作用（useEffect返回清理函数）
3. 在beforeEach中调用cleanupTest()

## 🎯 测试最佳实践

### 1. 查询优先级
```typescript
// 推荐
screen.getByRole('button', { name: /提交/ })
screen.getByPlaceholderText(/请输入/)
screen.getByText(/错误消息/)

// 避免
screen.getByTestId('submit-button')
```

### 2. 用户交互
```typescript
const user = userEvent.setup();
await user.type(input, 'text');
await user.click(button);
```

### 3. 异步断言
```typescript
await waitFor(() => {
  expect(screen.getByText(/成功/)).toBeInTheDocument();
});
```

### 4. Mock清理
```typescript
beforeEach(() => {
  vi.clearAllMocks();
  cleanupTest();
});
```

## 📚 相关文档

- 功能文档: `/FORGOT_PASSWORD_FEATURE.md`
- 测试总览: `/FORGOT_PASSWORD_TESTS.md`
- 后端测试: `/backend/test/README_PASSWORD_RESET.md`
- UI修复文档: `/PASSWORD_RESET_UI_FIX.md`

## 🔍 测试覆盖率目标

- **语句覆盖率**: > 90%
- **分支覆盖率**: > 85%
- **函数覆盖率**: > 90%
- **行覆盖率**: > 90%

## ✨ 特殊测试点

### 120秒倒计时测试
```typescript
await user.click(sendCodeButton);

await waitFor(() => {
  expect(screen.getByText(/120秒|119秒/)).toBeInTheDocument();
});
```

### 延迟验证测试
```typescript
// 输入时不显示错误
await user.type(input, 'invalid');
expect(screen.queryByText(/错误/)).not.toBeInTheDocument();

// 提交后显示错误
await user.click(submitButton);
expect(screen.getByText(/错误/)).toBeInTheDocument();
```

### 身份证校验码测试
```typescript
// 正确的校验码
await user.type(input, '330106200503104027'); // ✓

// 错误的校验码
await user.type(input, '330106200503104028'); // ✗
expect(screen.getByText(/请正确输入18位证件号码/)).toBeInTheDocument();
```


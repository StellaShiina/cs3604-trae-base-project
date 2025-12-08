<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import SelectDropdown from './SelectDropdown.vue';
import './RegisterForm.css';
import { 
  validateUsername as apiValidateUsername, 
  validateIdCard as apiValidateIdCard 
} from '../api/register';

// Define types
interface FieldValidation {
  isValid: boolean;
  errorMessage: string;
  showCheckmark: boolean;
}

interface RegisterFormData {
  username: string;
  password: string;
  confirmPassword: string;
  idCardType: string;
  name: string;
  gender: string;
  idCardNumber: string;
  discountType: string;
  email: string;
  phone: string;
  agreedToTerms: boolean;
}

const emit = defineEmits<{
  (e: 'submit', data: RegisterFormData): void;
  (e: 'navigateToLogin'): void;
}>();

// Form Data State
const formData = reactive<RegisterFormData>({
  username: '',
  password: '',
  confirmPassword: '',
  idCardType: '居民身份证',
  name: '',
  gender: '',
  idCardNumber: '',
  discountType: '成人',
  email: '',
  phone: '',
  agreedToTerms: false
});

// Validation State
const usernameValidation = reactive<FieldValidation>({ isValid: false, errorMessage: '', showCheckmark: false });
const passwordValidation = reactive<FieldValidation>({ isValid: false, errorMessage: '', showCheckmark: false });
const confirmPasswordValidation = reactive<FieldValidation>({ isValid: false, errorMessage: '', showCheckmark: false });
const nameValidation = reactive<FieldValidation>({ isValid: false, errorMessage: '', showCheckmark: false });
const idCardValidation = reactive<FieldValidation>({ isValid: false, errorMessage: '', showCheckmark: false });
const emailValidation = reactive<FieldValidation>({ isValid: false, errorMessage: '', showCheckmark: false });
const phoneValidation = reactive<FieldValidation>({ isValid: false, errorMessage: '', showCheckmark: false });
const generalError = ref('');

// Options
const idCardTypes = [
  '居民身份证',
  '港澳居民居住证',
  '台湾居民居住证',
  '外国人永久居留身份证',
  '外国护照',
  '中国护照',
  '港澳居民来往内地通行证',
  '台湾居民来往大陆通行证'
];

const discountTypes = ['成人', '儿童', '学生', '残疾军人'];
const genderOptions = ['男', '女'];

// Validation Functions

// Username Validation
const validateUsername = async () => {
  const value = formData.username;
  if (!value) {
    Object.assign(usernameValidation, { isValid: false, errorMessage: '', showCheckmark: false });
    return;
  }

  if (value.length < 6) {
    Object.assign(usernameValidation, { isValid: false, errorMessage: '用户名长度不能少于6个字符！', showCheckmark: false });
    return;
  }

  if (value.length > 30) {
    Object.assign(usernameValidation, { isValid: false, errorMessage: '用户名长度不能超过30个字符！', showCheckmark: false });
    return;
  }

  const usernameRegex = /^[a-zA-Z][a-zA-Z0-9_]*$/;
  if (!usernameRegex.test(value)) {
    Object.assign(usernameValidation, { isValid: false, errorMessage: '用户名只能由字母、数字和_组成，须以字母开头！', showCheckmark: false });
    return;
  }

  try {
    const response = await apiValidateUsername(value);
    // Assuming API returns { valid: boolean, error?: string } based on reference code
    // But our api/register.ts returns whatever request.post returns.
    // Let's assume the response structure matches the reference usage: response.data.valid
    // If using the request util, it usually returns response.data directly.
    // Let's assume standard response structure. 
    // If the API call succeeds, it means valid? Or does it return a boolean?
    // Looking at reference: response.data.valid
    
    // Adjust based on actual API response if known, otherwise stick to reference logic
    // The api/register.ts wrapper returns request.post result.
    // Assuming request interceptor handles data extraction.
    const data = response as any;
    if (data.valid) {
      Object.assign(usernameValidation, { isValid: true, errorMessage: '', showCheckmark: true });
    } else {
      Object.assign(usernameValidation, { isValid: false, errorMessage: data.error || '用户名已被使用', showCheckmark: false });
    }
  } catch (error: any) {
    const errorMsg = error.response?.data?.error || '验证失败，请稍后重试';
    Object.assign(usernameValidation, { isValid: false, errorMessage: errorMsg, showCheckmark: false });
  }
};

// Password Validation
const validatePassword = () => {
  const value = formData.password;
  if (!value) {
    Object.assign(passwordValidation, { isValid: false, errorMessage: '', showCheckmark: false });
    return;
  }

  if (value.length < 6) {
    Object.assign(passwordValidation, { isValid: false, errorMessage: '密码长度不能少于6个字符！', showCheckmark: false });
    return;
  }

  const passwordRegex = /^[a-zA-Z0-9_]+$/;
  if (!passwordRegex.test(value)) {
    Object.assign(passwordValidation, { isValid: false, errorMessage: '格式错误，必须且只能包含字母、数字和下划线中的两种或两种以上！', showCheckmark: false });
    return;
  }

  const hasLetter = /[a-zA-Z]/.test(value);
  const hasNumber = /[0-9]/.test(value);
  const hasUnderscore = /_/.test(value);
  const typeCount = (hasLetter ? 1 : 0) + (hasNumber ? 1 : 0) + (hasUnderscore ? 1 : 0);

  if (typeCount < 2) {
    Object.assign(passwordValidation, { isValid: false, errorMessage: '格式错误，必须且只能包含字母、数字和下划线中的两种或两种以上！', showCheckmark: false });
    return;
  }

  Object.assign(passwordValidation, { isValid: true, errorMessage: '', showCheckmark: true });
};

// Confirm Password Validation
const validateConfirmPassword = () => {
  const value = formData.confirmPassword;
  if (!value) {
    Object.assign(confirmPasswordValidation, { isValid: false, errorMessage: '', showCheckmark: false });
    return;
  }

  if (value !== formData.password) {
    Object.assign(confirmPasswordValidation, { isValid: false, errorMessage: '确认密码与密码不一致！', showCheckmark: false });
    return;
  }

  Object.assign(confirmPasswordValidation, { isValid: true, errorMessage: '', showCheckmark: true });
};

// Name Validation
const validateName = () => {
  const value = formData.name;
  if (!value) {
    Object.assign(nameValidation, { isValid: false, errorMessage: '', showCheckmark: false });
    return;
  }

  const charLength = value.split('').reduce((len, char) => {
    return len + (/[\u4e00-\u9fa5]/.test(char) ? 2 : 1);
  }, 0);

  if (charLength < 3 || charLength > 30) {
    Object.assign(nameValidation, { isValid: false, errorMessage: '允许输入的字符串在3-30个字符之间！', showCheckmark: false });
    return;
  }

  const nameRegex = /^[\u4e00-\u9fa5a-zA-Z.\s]+$/;
  if (!nameRegex.test(value)) {
    Object.assign(nameValidation, { isValid: false, errorMessage: '请输入姓名！', showCheckmark: false });
    return;
  }

  Object.assign(nameValidation, { isValid: true, errorMessage: '', showCheckmark: true });
};

// ID Card Check Code Validation
const validateIdCardCheckCode = (idCard: string): boolean => {
  const first17 = idCard.substring(0, 17);
  if (!/^\d{17}$/.test(first17)) {
    return false;
  }

  const checkCode = idCard.charAt(17).toUpperCase();
  const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
  const checkCodes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];

  let sum = 0;
  for (let i = 0; i < 17; i++) {
    sum += parseInt(first17.charAt(i)) * weights[i]!;
  }

  const remainder = sum % 11;
  const expectedCheckCode = checkCodes[remainder];

  return checkCode === expectedCheckCode;
};

// ID Card Validation
const validateIdCard = async () => {
  const value = formData.idCardNumber;
  if (!value) {
    Object.assign(idCardValidation, { isValid: false, errorMessage: '', showCheckmark: false });
    return;
  }

  const idCardRegex = /^[a-zA-Z0-9]+$/;
  if (!idCardRegex.test(value)) {
    Object.assign(idCardValidation, { isValid: false, errorMessage: '输入的证件编号中包含中文信息或特殊字符！', showCheckmark: false });
    return;
  }

  if (value.length !== 18) {
    Object.assign(idCardValidation, { isValid: false, errorMessage: '请正确输入18位证件号码！', showCheckmark: false });
    return;
  }

  if (!validateIdCardCheckCode(value)) {
    Object.assign(idCardValidation, { isValid: false, errorMessage: '请正确输入18位证件号码！', showCheckmark: false });
    return;
  }

  try {
    const response = await apiValidateIdCard(formData.idCardType, value);
    const data = response as any;
    if (data.valid) {
      Object.assign(idCardValidation, { isValid: true, errorMessage: '', showCheckmark: true });
    } else {
      Object.assign(idCardValidation, { isValid: false, errorMessage: data.error || '证件号已被使用', showCheckmark: false });
    }
  } catch (error: any) {
    const errorMsg = error.response?.data?.error || '验证失败，请稍后重试';
    Object.assign(idCardValidation, { isValid: false, errorMessage: errorMsg, showCheckmark: false });
  }
};

// Email Validation
const validateEmail = () => {
  const value = formData.email;
  if (!value) {
    Object.assign(emailValidation, { isValid: false, errorMessage: '', showCheckmark: false });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    Object.assign(emailValidation, { isValid: false, errorMessage: '请输入有效的电子邮件地址！', showCheckmark: false });
    return;
  }

  Object.assign(emailValidation, { isValid: true, errorMessage: '', showCheckmark: false });
};

// Phone Validation
const validatePhone = () => {
  const value = formData.phone;
  if (!value) {
    Object.assign(phoneValidation, { isValid: false, errorMessage: '', showCheckmark: false });
    return;
  }

  const phoneRegex = /^[0-9]+$/;
  if (!phoneRegex.test(value)) {
    Object.assign(phoneValidation, { isValid: false, errorMessage: '您输入的手机号码不是有效的格式！', showCheckmark: false });
    return;
  }

  if (value.length !== 11) {
    Object.assign(phoneValidation, { isValid: false, errorMessage: '您输入的手机号码不是有效的格式！', showCheckmark: false });
    return;
  }

  Object.assign(phoneValidation, { isValid: true, errorMessage: '', showCheckmark: false });
};

// Handle Phone Change
const handlePhoneChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  formData.phone = target.value.slice(0, 11);
};

// Handle Submit
const handleSubmit = (e: Event) => {
  e.preventDefault();
  generalError.value = '';

  if (!formData.agreedToTerms) {
    generalError.value = '请确认服务条款！';
    return;
  }

  const missingFields: string[] = [];
  if (!formData.username) missingFields.push('用户名');
  if (!formData.password) missingFields.push('登录密码');
  if (!formData.confirmPassword) missingFields.push('确认密码');
  if (!formData.name) missingFields.push('姓名');
  if (!formData.idCardNumber) missingFields.push('证件号码');
  if (!formData.phone) missingFields.push('手机号码');

  if (missingFields.length > 0) {
    generalError.value = '请填写完整信息！';
    return;
  }

  if (usernameValidation.errorMessage) {
    generalError.value = '用户名验证失败，请检查并重新输入';
    return;
  }
  if (passwordValidation.errorMessage) {
    generalError.value = '密码验证失败，请检查并重新输入';
    return;
  }
  if (confirmPasswordValidation.errorMessage) {
    generalError.value = '确认密码验证失败，请检查并重新输入';
    return;
  }
  if (nameValidation.errorMessage) {
    generalError.value = '姓名验证失败，请检查并重新输入';
    return;
  }
  if (idCardValidation.errorMessage) {
    generalError.value = '证件号码验证失败，请检查并重新输入';
    return;
  }
  if (phoneValidation.errorMessage) {
    generalError.value = '手机号码验证失败，请检查并重新输入';
    return;
  }
  if (emailValidation.errorMessage && formData.email) {
    generalError.value = '邮箱验证失败，请检查并重新输入';
    return;
  }

  emit('submit', { ...formData });
};

// Password Strength
const passwordStrength = computed(() => {
  const pwd = formData.password;
  if (!pwd || pwd.length === 0) return 0;
  if (pwd.length < 6) return 1;
  let strength = 0;
  if (/[a-z]/.test(pwd)) strength++;
  if (/[A-Z]/.test(pwd)) strength++;
  if (/[0-9]/.test(pwd)) strength++;
  if (/[_]/.test(pwd)) strength++;
  return Math.min(strength, 3);
});

// Select Handlers
const handleIdCardTypeChange = (val: string) => {
  formData.idCardType = val;
};

const handleDiscountTypeChange = (val: string) => {
  formData.discountType = val;
};

const handleGenderChange = (val: string) => {
  formData.gender = val;
};
</script>

<template>
  <div class="register-form-container">
    <div v-if="generalError" class="general-error-message">{{ generalError }}</div>
    
    <form class="register-form" @submit="handleSubmit">
      <!-- 用户名 -->
      <div class="form-row">
        <div class="form-label-wrapper">
          <label class="form-label">
            <span class="required-mark">*</span>用户名：
          </label>
        </div>
        <div class="form-input-container">
          <div class="form-input-wrapper">
            <input
              class="form-input"
              :class="{ 'error': usernameValidation.errorMessage, 'valid': usernameValidation.showCheckmark }"
              type="text"
              placeholder="用户名设置成功后不可修改"
              v-model="formData.username"
              @blur="validateUsername"
            />
            <span v-if="usernameValidation.showCheckmark" class="input-checkmark" data-testid="username-checkmark">✓</span>
            <span class="form-hint-message">6-30位字母、数字或"_"，字母开头</span>
          </div>
          <div v-if="usernameValidation.errorMessage" class="form-error-message">{{ usernameValidation.errorMessage }}</div>
        </div>
      </div>

      <!-- 登录密码 -->
      <div class="form-row">
        <div class="form-label-wrapper">
          <label class="form-label">
            <span class="required-mark">*</span>登录密码：
          </label>
        </div>
        <div class="form-input-container">
          <div class="form-input-wrapper">
            <input
              class="form-input"
              :class="{ 'error': passwordValidation.errorMessage, 'valid': passwordValidation.showCheckmark }"
              type="password"
              placeholder="6-20位字母、数字或符号"
              v-model="formData.password"
              @blur="validatePassword"
            />
            <span v-if="passwordValidation.showCheckmark" class="input-checkmark" data-testid="password-checkmark">✓</span>
            <div class="password-strength">
              <div class="strength-bars">
                <div class="strength-bar" :class="{ 'weak': passwordStrength >= 1 }"></div>
                <div class="strength-bar" :class="{ 'medium': passwordStrength >= 2 }"></div>
                <div class="strength-bar" :class="{ 'strong': passwordStrength >= 3 }"></div>
              </div>
            </div>
          </div>
          <div v-if="passwordValidation.errorMessage" class="form-error-message">{{ passwordValidation.errorMessage }}</div>
        </div>
      </div>

      <!-- 确认密码 -->
      <div class="form-row">
        <div class="form-label-wrapper">
          <label class="form-label">
            <span class="required-mark">*</span>确认密码：
          </label>
        </div>
        <div class="form-input-container">
          <div class="form-input-wrapper">
            <input
              class="form-input"
              :class="{ 'error': confirmPasswordValidation.errorMessage, 'valid': confirmPasswordValidation.showCheckmark }"
              type="password"
              placeholder="请再次输入您的登录密码"
              v-model="formData.confirmPassword"
              @blur="validateConfirmPassword"
            />
            <span v-if="confirmPasswordValidation.showCheckmark" class="input-checkmark" data-testid="confirm-password-checkmark">✓</span>
          </div>
          <div v-if="confirmPasswordValidation.errorMessage" class="form-error-message">{{ confirmPasswordValidation.errorMessage }}</div>
        </div>
      </div>

      <!-- 证件类型 -->
      <div class="form-row">
        <div class="form-label-wrapper">
          <label class="form-label">
            <span class="required-mark">*</span>证件类型：
          </label>
        </div>
        <div class="form-input-container">
          <SelectDropdown
            :options="idCardTypes"
            :value="formData.idCardType"
            placeholder="居民身份证"
            @change="handleIdCardTypeChange"
            testId="id-card-type-dropdown"
          />
        </div>
      </div>

      <!-- 姓名 -->
      <div class="form-row">
        <div class="form-label-wrapper">
          <label class="form-label">
            <span class="required-mark">*</span>姓名：
          </label>
        </div>
        <div class="form-input-container">
          <div class="form-input-wrapper">
            <input
              class="form-input"
              :class="{ 'error': nameValidation.errorMessage, 'valid': nameValidation.showCheckmark }"
              type="text"
              placeholder="请输入姓名"
              v-model="formData.name"
              @blur="validateName"
            />
            <span v-if="nameValidation.showCheckmark" class="input-checkmark" data-testid="name-checkmark">✓</span>
            <span class="form-hint-message">姓名填写规则（用于身份核验，请正确填写真实姓名）</span>
          </div>
          <div v-if="nameValidation.errorMessage" class="form-error-message">{{ nameValidation.errorMessage }}</div>
        </div>
      </div>

      <!-- 性别 -->
      <div class="form-row">
        <div class="form-label-wrapper">
          <label class="form-label">性别：</label>
        </div>
        <div class="form-input-container">
          <SelectDropdown
            :options="genderOptions"
            :value="formData.gender"
            placeholder="请选择性别"
            @change="handleGenderChange"
            testId="gender-dropdown"
          />
        </div>
      </div>

      <!-- 证件号码 -->
      <div class="form-row">
        <div class="form-label-wrapper">
          <label class="form-label">
            <span class="required-mark">*</span>证件号码：
          </label>
        </div>
        <div class="form-input-container">
          <div class="form-input-wrapper">
            <input
              class="form-input"
              :class="{ 'error': idCardValidation.errorMessage, 'valid': idCardValidation.showCheckmark }"
              type="text"
              placeholder="请输入您的证件号码"
              v-model="formData.idCardNumber"
              @blur="validateIdCard"
            />
            <span v-if="idCardValidation.showCheckmark" class="input-checkmark" data-testid="id-card-checkmark">✓</span>
            <span class="form-hint-message">（用于身份核验，请正确填写）</span>
          </div>
          <div v-if="idCardValidation.errorMessage" class="form-error-message">{{ idCardValidation.errorMessage }}</div>
        </div>
      </div>

      <!-- 优惠类型 -->
      <div class="form-row">
        <div class="form-label-wrapper">
          <label class="form-label">优惠（待）类型：</label>
        </div>
        <div class="form-input-container">
          <SelectDropdown
            :options="discountTypes"
            :value="formData.discountType"
            placeholder="成人"
            @change="handleDiscountTypeChange"
            testId="discount-type-dropdown"
          />
        </div>
      </div>

      <!-- 邮箱 -->
      <div class="form-row">
        <div class="form-label-wrapper">
          <label class="form-label">邮箱：</label>
        </div>
        <div class="form-input-container">
          <div class="form-input-wrapper">
            <input
              class="form-input"
              :class="{ 'error': emailValidation.errorMessage }"
              type="email"
              placeholder="请正确填写邮箱地址"
              v-model="formData.email"
              @blur="validateEmail"
            />
          </div>
          <div v-if="emailValidation.errorMessage" class="form-error-message">{{ emailValidation.errorMessage }}</div>
        </div>
      </div>

      <!-- 手机号码 -->
      <div class="form-row">
        <div class="form-label-wrapper">
          <label class="form-label">
            <span class="required-mark">*</span>手机号码：
          </label>
        </div>
        <div class="form-input-container">
          <div class="form-input-wrapper">
            <div class="phone-input-wrapper">
              <div class="phone-country-select">
                <SelectDropdown
                  :options="['+86 中国']"
                  value="+86 中国"
                  placeholder="+86 中国"
                  @change="() => {}"
                  testId="country-code-dropdown"
                />
              </div>
              <input
                class="form-input phone-input"
                :class="{ 'error': phoneValidation.errorMessage }"
                type="tel"
                placeholder="手机号码"
                :value="formData.phone"
                @input="handlePhoneChange"
                @blur="validatePhone"
                maxlength="11"
              />
            </div>
            <span class="form-hint-message">请正确填写手机号码，稍后将向该手机号发送短信验证码</span>
          </div>
          <div v-if="phoneValidation.errorMessage" class="form-error-message">{{ phoneValidation.errorMessage }}</div>
        </div>
      </div>

      <!-- 用户协议 -->
      <div class="agreement-section">
        <div class="agreement-wrapper">
          <input
            type="checkbox"
            class="agreement-checkbox"
            v-model="formData.agreedToTerms"
          />
          <span class="agreement-text">
            我已阅读并同意遵守{' '}
            <a href="/service-terms" class="agreement-link" @click.prevent>
              《中国铁路客户服务中心网站服务条款》
            </a>
            {' '}
            <a href="/privacy-policy" class="agreement-link" @click.prevent>
              《隐私权政策》
            </a>
          </span>
        </div>
      </div>

      <!-- 提交按钮 -->
      <div class="submit-section">
        <button type="submit" class="submit-button">
          下一步
        </button>
      </div>
    </form>
  </div>
</template>

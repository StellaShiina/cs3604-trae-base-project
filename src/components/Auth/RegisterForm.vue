<script setup lang="ts">
import { ref, computed } from 'vue';
import axios from 'axios';
import SelectDropdown from '@/components/Common/SelectDropdown.vue';
import RegistrationVerificationModal from './RegistrationVerificationModal.vue';


// Props and Emits
const emit = defineEmits<{
  (e: 'submit', data: any): void;
  (e: 'navigate-to-login'): void;
}>();

// Types
interface FieldValidation {
  isValid: boolean;
  errorMessage: string;
  showCheckmark: boolean;
}

// Form State
const username = ref('');
const password = ref('');
const confirmPassword = ref('');
const idCardType = ref('居民身份证');
const name = ref('');
const idCardNumber = ref('');
const discountType = ref('成人');
const email = ref('');
const phone = ref('');
const agreedToTerms = ref(false);

// Validation State
const usernameValidation = ref<FieldValidation>({ isValid: false, errorMessage: '', showCheckmark: false });
const passwordValidation = ref<FieldValidation>({ isValid: false, errorMessage: '', showCheckmark: false });
const confirmPasswordValidation = ref<FieldValidation>({ isValid: false, errorMessage: '', showCheckmark: false });
const nameValidation = ref<FieldValidation>({ isValid: false, errorMessage: '', showCheckmark: false });
const idCardValidation = ref<FieldValidation>({ isValid: false, errorMessage: '', showCheckmark: false });
const emailValidation = ref<FieldValidation>({ isValid: false, errorMessage: '', showCheckmark: false });
const phoneValidation = ref<FieldValidation>({ isValid: false, errorMessage: '', showCheckmark: false });
const generalError = ref('');

// UI State
const showVerificationModal = ref(false);
const isSubmitting = ref(false);
const sessionId = ref('');
const serverError = ref('');

// Constants
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

const mapIdCardTypeToBackend = (type: string): string => {
  switch (type) {
    case '居民身份证': return 'id_card';
    case '外国护照':
    case '中国护照': return 'passport';
    // Map other types to 'other' or specific enums if known. 
    // Based on common practices and potential enum values:
    default: return 'other';
  }
};

const getGenderFromIdCard = (idNo: string): string => {
  if (!idNo || idNo.length !== 18) return 'male'; // Default to male if not standard ID
  const genderCode = parseInt(idNo.charAt(16));
  return genderCode % 2 === 1 ? 'male' : 'female';
};

const discountTypes = ['成人', '儿童', '学生', '残疾军人'];

// Password Strength
const passwordStrength = computed(() => {
  if (!password.value) return 0;
  let strength = 0;
  if (password.value.length >= 6) strength++;
  if (/[A-Z]/.test(password.value)) strength++;
  if (/[a-z]/.test(password.value)) strength++;
  if (/[0-9]/.test(password.value)) strength++;
  if (/[_]/.test(password.value)) strength++;
  return Math.min(strength, 3);
});

// Validation Logic

const validateUsername = async (value: string) => {
  if (!value) {
    usernameValidation.value = { isValid: false, errorMessage: '', showCheckmark: false };
    return;
  }

  if (value.length < 6) {
    usernameValidation.value = { isValid: false, errorMessage: '用户名长度不能少于6个字符！', showCheckmark: false };
    return;
  }

  if (value.length > 30) {
    usernameValidation.value = { isValid: false, errorMessage: '用户名长度不能超过30个字符！', showCheckmark: false };
    return;
  }

  const usernameRegex = /^[a-zA-Z][a-zA-Z0-9_]*$/;
  if (!usernameRegex.test(value)) {
    usernameValidation.value = { isValid: false, errorMessage: '用户名只能由字母、数字和_组成，须以字母开头！', showCheckmark: false };
    return;
  }

  // Simulate API check
  usernameValidation.value = { isValid: true, errorMessage: '', showCheckmark: true };
};

const validatePassword = async (value: string) => {
  if (!value) {
    passwordValidation.value = { isValid: false, errorMessage: '', showCheckmark: false };
    return;
  }

  if (value.length < 6) {
    passwordValidation.value = { isValid: false, errorMessage: '密码长度不能少于6个字符！', showCheckmark: false };
    return;
  }

  const passwordRegex = /^[a-zA-Z0-9_]+$/;
  if (!passwordRegex.test(value)) {
    passwordValidation.value = { isValid: false, errorMessage: '格式错误，必须且只能包含字母、数字和下划线中的两种或两种以上！', showCheckmark: false };
    return;
  }

  const hasLetter = /[a-zA-Z]/.test(value);
  const hasNumber = /[0-9]/.test(value);
  const hasUnderscore = /_/.test(value);
  const typeCount = (hasLetter ? 1 : 0) + (hasNumber ? 1 : 0) + (hasUnderscore ? 1 : 0);

  if (typeCount < 2) {
    passwordValidation.value = { isValid: false, errorMessage: '格式错误，必须且只能包含字母、数字和下划线中的两种或两种以上！', showCheckmark: false };
    return;
  }

  passwordValidation.value = { isValid: true, errorMessage: '', showCheckmark: true };
  
  // Re-validate confirm password if it exists
  if (confirmPassword.value) {
    validateConfirmPassword(confirmPassword.value);
  }
};

const validateConfirmPassword = (value: string) => {
  if (!value) {
    confirmPasswordValidation.value = { isValid: false, errorMessage: '', showCheckmark: false };
    return;
  }

  if (value !== password.value) {
    confirmPasswordValidation.value = { isValid: false, errorMessage: '确认密码与密码不一致！', showCheckmark: false };
    return;
  }

  confirmPasswordValidation.value = { isValid: true, errorMessage: '', showCheckmark: true };
};

const validateName = (value: string) => {
  if (!value) {
    nameValidation.value = { isValid: false, errorMessage: '', showCheckmark: false };
    return;
  }

  const charLength = value.split('').reduce((len, char) => {
    return len + (/[\u4e00-\u9fa5]/.test(char) ? 2 : 1);
  }, 0);

  if (charLength < 3 || charLength > 30) {
    nameValidation.value = { isValid: false, errorMessage: '允许输入的字符串在3-30个字符之间！', showCheckmark: false };
    return;
  }

  const nameRegex = /^[\u4e00-\u9fa5a-zA-Z.\s]+$/;
  if (!nameRegex.test(value)) {
    nameValidation.value = { isValid: false, errorMessage: '请输入姓名！', showCheckmark: false };
    return;
  }

  nameValidation.value = { isValid: true, errorMessage: '', showCheckmark: true };
};

const validateIdCardCheckCode = (idCard: string): boolean => {
  const first17 = idCard.substring(0, 17);
  if (!/^\d{17}$/.test(first17)) return false;

  const checkCode = idCard.charAt(17).toUpperCase();
  const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
  const checkCodes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];

  let sum = 0;
  for (let i = 0; i < 17; i++) {
    sum += parseInt(first17.charAt(i)) * (weights[i] ?? 0);
  }

  const remainder = sum % 11;
  const expectedCheckCode = checkCodes[remainder];

  return checkCode === expectedCheckCode;
};

const validateIdCard = async (value: string) => {
  if (!value) {
    idCardValidation.value = { isValid: false, errorMessage: '', showCheckmark: false };
    return;
  }

  const idCardRegex = /^[a-zA-Z0-9]+$/;
  if (!idCardRegex.test(value)) {
    idCardValidation.value = { isValid: false, errorMessage: '输入的证件编号中包含中文信息或特殊字符！', showCheckmark: false };
    return;
  }

  if (value.length !== 18) {
    idCardValidation.value = { isValid: false, errorMessage: '请正确输入18位证件号码！', showCheckmark: false };
    return;
  }

  if (!validateIdCardCheckCode(value)) {
    idCardValidation.value = { isValid: false, errorMessage: '请正确输入18位证件号码！', showCheckmark: false };
    return;
  }

  // Simulate API check
  idCardValidation.value = { isValid: true, errorMessage: '', showCheckmark: true };
};

const validateEmail = (value: string) => {
  if (!value) {
    emailValidation.value = { isValid: false, errorMessage: '', showCheckmark: false };
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    emailValidation.value = { isValid: false, errorMessage: '请输入有效的电子邮件地址！', showCheckmark: false };
    return;
  }

  emailValidation.value = { isValid: true, errorMessage: '', showCheckmark: false };
};

const validatePhone = (value: string) => {
  if (!value) {
    phoneValidation.value = { isValid: false, errorMessage: '', showCheckmark: false };
    return;
  }

  const phoneRegex = /^[0-9]+$/;
  if (!phoneRegex.test(value)) {
    phoneValidation.value = { isValid: false, errorMessage: '您输入的手机号码不是有效的格式！', showCheckmark: false };
    return;
  }

  if (value.length !== 11) {
    phoneValidation.value = { isValid: false, errorMessage: '您输入的手机号码不是有效的格式！', showCheckmark: false };
    return;
  }

  phoneValidation.value = { isValid: true, errorMessage: '', showCheckmark: false };
};

const handlePhoneChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const value = target.value.slice(0, 11);
  phone.value = value;
};

const checkAllFields = () => {
  validateUsername(username.value);
  validatePassword(password.value);
  validateConfirmPassword(confirmPassword.value);
  validateName(name.value);
  validateIdCard(idCardNumber.value);
  validateEmail(email.value);
  validatePhone(phone.value);

  if (!agreedToTerms.value) {
    generalError.value = '请阅读并同意服务条款、隐私政策和儿童个人信息保护规则';
    return false;
  }

  if (!usernameValidation.value.isValid ||
      !passwordValidation.value.isValid ||
      !confirmPasswordValidation.value.isValid ||
      !nameValidation.value.isValid ||
      !idCardValidation.value.isValid ||
      (email.value && !emailValidation.value.isValid) ||
      !phoneValidation.value.isValid) {
    generalError.value = '请完善页面中的错误信息！';
    return false;
  }

  generalError.value = '';
  return true;
};

const handleSubmit = async (e?: Event) => {
  if (e) e.preventDefault();

  if (!checkAllFields()) return;

  isSubmitting.value = true;
  generalError.value = '';

  try {
    // 1. Submit registration data to get session ID
    const registrationData = {
      username: username.value,
      password: password.value,
      email: email.value,
      mobile: phone.value,
      name: name.value,
      id_type: mapIdCardTypeToBackend(idCardType.value),
      id_no: idCardNumber.value,
      gender: getGenderFromIdCard(idCardNumber.value)
    };

    const registerResponse = await axios.post('/api/v1/auth/register', registrationData);
    
    if (registerResponse.data.sessionId) {
      sessionId.value = registerResponse.data.sessionId;
      
      // 2. Send SMS code
      await axios.post('/api/v1/auth/send-sms', {
        sessionId: sessionId.value
      });
      
      // 3. Show verification modal
      showVerificationModal.value = true;
    }
  } catch (error: any) {
    console.error('Registration error:', error);
    generalError.value = error.response?.data?.error || '注册提交失败，请重试';
  } finally {
    isSubmitting.value = false;
  }
};

const handleVerificationComplete = async (code: string) => {
  isSubmitting.value = true;
  generalError.value = '';

  try {
    // 4. Complete registration with SMS code
    const response = await axios.post('/api/v1/auth/register/complete', {
      sessionId: sessionId.value,
      smsCode: code
    });
    
    if (response.status === 200 || response.status === 201) {
      showVerificationModal.value = false;
      emit('submit', { username: username.value });
    }
  } catch (error: any) {
    const errorMsg = error.response?.data?.error || '验证失败，请稍后重试';
    // Pass error to modal via a way, or just show general error
    // For now we can use generalError but it's behind the modal.
    // Ideally we should pass error to modal.
    // Let's use a ref that is passed to modal
    serverError.value = errorMsg;
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="register-form">
    <div v-if="generalError" class="general-error-message">
      {{ generalError }}
    </div>

    <form @submit.prevent="handleSubmit">
      <!-- Username -->
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
              placeholder="请输入用户名"
              v-model="username"
              @blur="validateUsername(username)"
            />
            <span v-if="usernameValidation.showCheckmark" class="input-checkmark">✓</span>
          </div>
          <div v-if="usernameValidation.errorMessage" class="form-error-message">
            {{ usernameValidation.errorMessage }}
          </div>
          <div class="field-hint" v-else>
            6-30位字母、数字或"_"，字母开头
          </div>
        </div>
      </div>

      <!-- Password -->
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
              v-model="password"
              @blur="validatePassword(password)"
            />
            <span v-if="passwordValidation.showCheckmark" class="input-checkmark">✓</span>
          </div>
          <div class="strength-bar-container" v-if="password">
             <div class="strength-bar" :class="{ filled: passwordStrength >= 1 }"></div>
             <div class="strength-bar" :class="{ filled: passwordStrength >= 2 }"></div>
             <div class="strength-bar" :class="{ filled: passwordStrength >= 3 }"></div>
             <span class="strength-text">
               {{ ['弱', '中', '强'][passwordStrength - 1] || '' }}
             </span>
          </div>
          <div v-if="passwordValidation.errorMessage" class="form-error-message">
            {{ passwordValidation.errorMessage }}
          </div>
        </div>
      </div>

      <!-- Confirm Password -->
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
              v-model="confirmPassword"
              @blur="validateConfirmPassword(confirmPassword)"
            />
            <span v-if="confirmPasswordValidation.showCheckmark" class="input-checkmark">✓</span>
          </div>
          <div v-if="confirmPasswordValidation.errorMessage" class="form-error-message">
            {{ confirmPasswordValidation.errorMessage }}
          </div>
        </div>
      </div>

      <!-- ID Card Type -->
      <div class="form-row">
        <div class="form-label-wrapper">
          <label class="form-label">
            <span class="required-mark">*</span>证件类型：
          </label>
        </div>
        <div class="form-input-container">
          <SelectDropdown
            :options="idCardTypes"
            v-model="idCardType"
            placeholder="居民身份证"
          />
        </div>
      </div>

      <!-- Name -->
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
              v-model="name"
              @blur="validateName(name)"
            />
            <span v-if="nameValidation.showCheckmark" class="input-checkmark">✓</span>
          </div>
          <div v-if="nameValidation.errorMessage" class="form-error-message">
            {{ nameValidation.errorMessage }}
          </div>
          <div class="field-hint" v-else>
            请输入有效身份证件上的姓名
          </div>
        </div>
      </div>

      <!-- ID Card Number -->
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
              v-model="idCardNumber"
              @blur="validateIdCard(idCardNumber)"
            />
            <span v-if="idCardValidation.showCheckmark" class="input-checkmark">✓</span>
          </div>
          <div v-if="idCardValidation.errorMessage" class="form-error-message">
            {{ idCardValidation.errorMessage }}
          </div>
        </div>
      </div>

      <!-- Email -->
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
              placeholder="请正确输入邮箱地址"
              v-model="email"
              @blur="validateEmail(email)"
            />
          </div>
          <div v-if="emailValidation.errorMessage" class="form-error-message">
            {{ emailValidation.errorMessage }}
          </div>
        </div>
      </div>

      <!-- Phone -->
      <div class="form-row">
        <div class="form-label-wrapper">
          <label class="form-label">
            <span class="required-mark">*</span>手机号码：
          </label>
        </div>
        <div class="form-input-container">
          <div class="form-input-wrapper phone-input-wrapper">
            <div class="phone-country-select">
              <SelectDropdown
                :options="['+86']"
                modelValue="+86"
                placeholder="+86"
                disabled
              />
            </div>
            <input
              class="form-input phone-input"
              :class="{ 'error': phoneValidation.errorMessage }"
              type="text"
              placeholder="请输入您的手机号码"
              :value="phone"
              @input="handlePhoneChange"
              @blur="validatePhone(phone)"
            />
          </div>
          <div v-if="phoneValidation.errorMessage" class="form-error-message">
            {{ phoneValidation.errorMessage }}
          </div>
          <div class="field-hint" v-else>
            请正确填写手机号码，稍后将向该手机号码发送短信验证码
          </div>
        </div>
      </div>

      <!-- Discount Type -->
      <div class="form-row">
        <div class="form-label-wrapper">
          <label class="form-label">
            <span class="required-mark">*</span>旅客类型：
          </label>
        </div>
        <div class="form-input-container">
          <SelectDropdown
            :options="discountTypes"
            v-model="discountType"
            placeholder="成人"
          />
        </div>
      </div>

      <!-- Agreement -->
      <div class="agreement-section">
        <div class="agreement-wrapper">
          <input
            type="checkbox"
            id="agreement"
            class="agreement-checkbox"
            v-model="agreedToTerms"
          />
          <label for="agreement" class="agreement-text">
            我已阅读并同意
            <a href="#" class="agreement-link">《中国铁路客户服务中心网站服务条款》</a>
            <a href="#" class="agreement-link">《隐私政策》</a>
            <a href="#" class="agreement-link">《儿童个人信息保护规则》</a>
          </label>
        </div>
      </div>

      <!-- Submit Button -->
      <div class="submit-section">
        <button
          type="submit"
          class="submit-button"
          :disabled="isSubmitting"
        >
          下一步
        </button>
      </div>
    </form>

    <RegistrationVerificationModal 
      :is-visible="showVerificationModal"
      :phone-number="phone"
      :external-error="serverError"
      @close="showVerificationModal = false"
      @complete="handleVerificationComplete"
      @back="showVerificationModal = false"
    />
  </div>
</template>

<style scoped>
/* RegisterForm Styles */

.register-form {
  width: 100%;
  max-width: 950px;
  margin: 0 auto;
}

/* Form Row */
.form-row {
  margin-bottom: 22px;
  display: flex;
  align-items: center;
}

/* Label Area */
.form-label-wrapper {
  width: 200px;
  text-align: right;
  padding-top: 0;
  flex-shrink: 0;
  white-space: nowrap;
}

.form-label {
  font-size: 14px;
  color: #333;
  line-height: 20px;
  display: inline-block;
}

.required-mark {
  color: #ff4d4f;
  margin-right: 4px;
  font-weight: bold;
}

/* Input Area */
.form-input-container {
  flex: 1;
  margin-left: 20px;
  max-width: 600px;
}

.form-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

/* Input Fields */
.form-input {
  width: 350px !important;
  min-width: 350px !important;
  max-width: 350px !important;
  height: 36px !important;
  padding: 0 12px !important;
  border: 1px solid #b8b8b8 !important;
  border-radius: 0px !important;
  font-size: 14px !important;
  color: #333 !important;
  outline: none !important;
  transition: all 0.3s !important;
  box-sizing: border-box !important;
  background: white !important;
  flex-shrink: 0 !important;
}

.form-input::placeholder {
  color: #999 !important;
}

.form-input:hover {
  border-color: #40a9ff !important;
}

.form-input:focus {
  border-color: #40a9ff !important;
  box-shadow: 0 0 0 2px rgba(64, 169, 255, 0.1) !important;
}

.form-input.error {
  border-color: #ff4d4f !important;
}

.form-input.error:focus {
  box-shadow: 0 0 0 2px rgba(255, 77, 79, 0.1) !important;
}

.form-input.valid {
  border-color: #52c41a !important;
}

/* Checkmark */
.input-checkmark {
  margin-left: 8px;
  color: #52c41a;
  font-size: 16px;
  font-weight: bold;
  flex-shrink: 0;
}

/* Error Message */
.form-error-message {
  color: #ff4d4f;
  font-size: 12px;
  margin-top: 4px;
  line-height: 1.5;
}

/* Field Hint */
.field-hint {
  color: #999;
  font-size: 12px;
  margin-top: 4px;
}

/* Password Strength */
.strength-bar-container {
  display: flex;
  align-items: center;
  margin-top: 8px;
  width: 350px;
}

.strength-bar {
  flex: 1;
  height: 4px;
  background-color: #eee;
  margin-right: 4px;
  border-radius: 2px;
}

.strength-bar:last-child {
  margin-right: 8px;
}

.strength-bar.filled {
  background-color: #ffc107;
}

.strength-bar.filled:nth-child(2) {
  background-color: #ff9800;
}

.strength-bar.filled:nth-child(3) {
  background-color: #4caf50;
}

.strength-text {
  font-size: 12px;
  color: #666;
  margin-left: 8px;
}

/* Phone Input */
.phone-input-wrapper {
  display: flex;
}

.phone-country-select {
  width: 110px;
  margin-right: 10px;
}

.phone-input {
  width: 230px !important;
  min-width: 230px !important;
  max-width: 230px !important;
  flex-shrink: 0 !important;
}

/* Agreement Section */
.agreement-section {
  margin: 30px 0 24px;
  padding-left: 220px;
}

.agreement-wrapper {
  display: flex;
  align-items: flex-start;
}

.agreement-checkbox {
  margin: 3px 8px 0 0;
  width: 14px;
  height: 14px;
  cursor: pointer;
  flex-shrink: 0;
}

.agreement-text {
  font-size: 13px;
  color: #666;
  line-height: 1.6;
}

.agreement-link {
  color: #0066cc;
  text-decoration: none;
  cursor: pointer; 
}

.agreement-link:hover {
  text-decoration: underline;
}

/* Submit Section */
.submit-section {
  margin-top: 30px;
  display: flex;
  justify-content: center;
}

.submit-button {
  width: 170px !important;
  height: 38px !important;
  background: #ff8001 !important;
  border-radius: 5px !important;
  color: white !important;
  font-size: 16px !important;
  font-weight: bold !important;
  cursor: pointer !important;
  transition: all 0.3s !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
  text-align: center !important;
  padding: 0px !important;
  border: none !important;
}

.submit-button:hover {
  background: #ffaa55 !important;
}

.submit-button:active {
  background: linear-gradient(to bottom, #ff7700 0%, #ee6600 100%) !important;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.2) !important;
}

.submit-button:disabled {
  background: #cccccc !important;
  cursor: not-allowed !important;
  box-shadow: none !important;
}

/* General Error Message */
.general-error-message {
  color: #ff4d4f;
  font-size: 14px;
  text-align: center;
  margin-bottom: 20px;
  padding: 10px 15px;
  background: #fff2f0;
  border: 1px solid #ffccc7;
  border-radius: 0px;
  line-height: 1.5;
}

/* Responsive */
@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
    align-items: stretch;
  }

  .form-label-wrapper {
    width: 100%;
    text-align: left;
    padding-top: 0;
    margin-bottom: 8px;
  }

  .form-input-container {
    margin-left: 0;
    max-width: 100%;
  }

  .agreement-section,
  .submit-section {
    padding-left: 0;
  }

  .submit-button {
    width: 100%;
  }

  .phone-input-wrapper {
    flex-direction: column;
  }

  .phone-country-select {
    width: 100%;
    margin-bottom: 10px;
  }
  
  .phone-input {
    width: 100% !important;
    min-width: 100% !important;
    max-width: 100% !important;
  }
}
</style>
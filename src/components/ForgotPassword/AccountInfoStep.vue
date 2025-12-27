<template>
  <div class="account-info-step">
    <form @submit.prevent="handleSubmit">
      <div class="form-row">
        <label class="form-label">
          <span class="required-mark">*</span> 手机号码：
        </label>
        <div class="input-wrapper">
          <div class="phone-input-group">
            <div class="country-code-select">
              <SelectDropdown
                :options="countryCodeOptions"
                v-model="countryCode"
                placeholder="+86"
                :disabled="isLoading"
                testId="account-info-country-code-dropdown"
                :getDisplayValue="(value: string) => value"
                @update:modelValue="handleCountryCodeChange"
              />
            </div>
            <input
              type="text"
              class="form-input phone-input"
              v-model="phone"
              @input="handlePhoneInput"
              placeholder=""
              maxlength="11"
              :disabled="isLoading"
            />
          </div>
          <span class="hint-text">已通过核验的手机号码</span>
        </div>
        <div v-if="errors.phone" class="error-text">{{ errors.phone }}</div>
      </div>

      <div class="form-row">
        <label class="form-label">
          <span class="required-mark">*</span> 证件类型：
        </label>
        <div class="input-wrapper">
          <div class="id-card-type-select">
            <SelectDropdown
              :options="idCardTypeOptions"
              v-model="idCardType"
              placeholder="请选择证件类型"
              :disabled="isLoading"
              testId="account-info-id-card-type-dropdown"
              @update:modelValue="handleIdCardTypeChange"
            />
          </div>
          <span class="hint-text">请选择证件类型</span>
        </div>
      </div>

      <div class="form-row">
        <label class="form-label">
          <span class="required-mark">*</span> 证件号码：
        </label>
        <div class="input-wrapper">
          <input
            type="text"
            class="form-input"
            v-model="idCardNumber"
            @input="handleIdCardNumberInput"
            placeholder=""
            maxlength="18"
            :disabled="isLoading"
          />
          <span class="hint-text">请输入证件号码</span>
        </div>
        <div v-if="errors.idCardNumber" class="error-text">{{ errors.idCardNumber }}</div>
      </div>

      <div class="button-row">
        <button type="submit" class="submit-button" :disabled="isLoading">
          {{ isLoading ? '验证中...' : '提交' }}
        </button>
      </div>

      <div class="help-link">
        手机号未通过核验？试试<a href="#email">邮箱找回</a>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import axios from 'axios';
import SelectDropdown from '@/components/Common/SelectDropdown.vue';

const emit = defineEmits<{
  (e: 'success', sessionId: string, accountInfo: { phone: string; idCardType: string; idCardNumber: string }): void
}>();

const countryCode = ref('+86');
const phone = ref('');
const idCardType = ref('居民身份证');
const idCardNumber = ref('');
const isLoading = ref(false);

const errors = reactive({
  phone: '',
  idCardNumber: '',
  general: ''
});

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

const idCardTypeOptions = idCardTypes.map(type => ({
  value: type,
  label: type
}));

const countryCodeOptions = [
  { value: '+86', label: '(+86)中国' },
  { value: '+852', label: '(+852)中国香港' },
  { value: '+853', label: '(+853)中国澳门' },
  { value: '+886', label: '(+886)中国台湾' }
];

const handleCountryCodeChange = () => {
  errors.phone = '';
  errors.general = '';
};

const handlePhoneInput = () => {
  errors.phone = '';
  errors.general = '';
};

const handleIdCardTypeChange = () => {
  errors.idCardNumber = '';
  errors.general = '';
};

// 身份证校验算法（GB 11643-1999）
const validateIdCardCheckCode = (idCard: string): boolean => {
  if (idCard.length !== 18) return false;
  
  const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2] as const;
  const checkCodes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'] as const;
  
  let sum = 0;
  for (let i = 0; i < 17; i++) {
    const char = idCard.charAt(i);
    if (!/^\d$/.test(char)) return false;
    const weight = weights[i];
    if (weight === undefined) return false;
    sum += parseInt(char, 10) * weight;
  }
  
  const expectedCheckCode = checkCodes[sum % 11];
  const checkCode = idCard.charAt(17).toUpperCase();
  
  return checkCode === expectedCheckCode;
};

// 验证证件号码格式
const validateIdCardFormat = (value: string, type: string): string => {
  if (!value) {
    return '';
  }

  // 对于居民身份证，进行详细验证
  if (type === '居民身份证') {
    // 检查是否包含特殊字符（仅允许数字和字母X）
    const idCardRegex = /^[a-zA-Z0-9]+$/;
    if (!idCardRegex.test(value)) {
      return '输入的证件编号中包含中文信息或特殊字符！';
    }

    if (value.length !== 18) {
      return '请正确输入18位证件号码！';
    }

    // 验证身份证号码格式（前17位必须是数字，最后一位是校验码）
    if (!validateIdCardCheckCode(value)) {
      return '请正确输入18位证件号码！';
    }
  }

  return '';
};

const handleIdCardNumberInput = (e: Event) => {
  const target = e.target as HTMLInputElement;
  // 限制只能输入字母和数字，且最多18位
  const sanitizedValue = target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 18).toUpperCase();
  idCardNumber.value = sanitizedValue;
  target.value = sanitizedValue;
  
  // 只清除错误，不进行实时验证
  errors.idCardNumber = '';
  errors.general = '';
};

const handleSubmit = async () => {
  // 清除之前的错误
  errors.phone = '';
  errors.idCardNumber = '';
  errors.general = '';

  // 验证手机号
  if (!phone.value) {
    errors.phone = '请输入手机号码';
    return;
  }

  if (!/^\d{11}$/.test(phone.value)) {
    errors.phone = '请输入正确的手机号码';
    return;
  }

  // 验证证件号码格式
  const formatError = validateIdCardFormat(idCardNumber.value, idCardType.value);
  if (formatError) {
    errors.idCardNumber = formatError;
    return;
  }

  if (!idCardNumber.value) {
    errors.idCardNumber = '请输入证件号码';
    return;
  }

  isLoading.value = true;

  try {
    // 调用后端API验证账户信息
    // Note: Use a constant for API base URL or proxy
    const response = await axios.post('/api/v1/password-reset/verify-account', {
      phone: phone.value,
      idCardType: idCardType.value,
      idCardNumber: idCardNumber.value
    });

    if (response.data.success) {
      // 验证成功，进入下一步
      emit('success', response.data.sessionId, { 
        phone: phone.value, 
        idCardType: idCardType.value, 
        idCardNumber: idCardNumber.value 
      });
    } else {
      errors.idCardNumber = response.data.error || '手机号码或证件号码不正确！';
    }
  } catch (error: any) {
    console.error('验证账户信息失败:', error);
    const errorMsg = error.response?.data?.error || '手机号码或证件号码不正确！';
    errors.idCardNumber = errorMsg;
  } finally {
    isLoading.value = false;
  }
};
</script>

<style lang="scss" scoped>
/* ==================== 账户信息步骤容器 ==================== */
.account-info-step {
  max-width: 1000px;
  margin: 0 auto;

  form {
    display: flex;
    flex-direction: column;
  }

  /* ==================== 表单行布局 ==================== */
  .form-row {
    display: flex;
    align-items: center;
    margin-bottom: 20px; /* 减少间距，从35px改为20px */
    margin-left: 80px; /* 整体向右移动 */
    position: relative;
  }

  .form-label {
    width: 120px;
    text-align: right;
    padding-right: 8px; /* 减小标签与输入框之间的距离，从15px改为8px */
    font-size: 14px;
    color: #333;
    flex-shrink: 0;
  }

  .required-mark {
    color: #ff4d4f;
    margin-right: 2px;
  }

  /* ==================== 输入框容器 ==================== */
  .input-wrapper {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-left: 20px; /* 减小标签与输入框之间的距离，从40px改为20px */
  }

  /* ==================== 手机号输入组 ==================== */
  .phone-input-group {
    display: flex;
    gap: 5px; /* 两个框之间间距为5px */
    align-items: center;
    flex-shrink: 0;

    .phone-input {
      width: 135px;
      height: 30px; /* 统一高度为30px，与下拉框一致 */
      line-height: 20px;
      border: 1px solid #dedede;
      border-radius: 0px; /* 改为完整的圆角，因为现在有间隙了 */
      margin-left: 0; /* 移除负margin，因为现在有gap了 */
      box-sizing: border-box;
      padding: 4px 10px;
      font-size: 14px;
    }

    &:focus-within {
      .phone-input {
        border-color: #40a9ff;
        box-shadow: 0 0 0 2px rgba(64, 169, 255, 0.1);
      }
      
      /* Target the dropdown within */
      :deep(.select-dropdown .selected-value-display) {
        border-color: #40a9ff;
        box-shadow: 0 0 0 2px rgba(64, 169, 255, 0.1);
      }
    }
  }

  /* ==================== 国家代码下拉框 ==================== */
  .country-code-select {
    flex-shrink: 0;

    :deep(.select-dropdown) {
      width: 120px;
      min-width: 120px;
      max-width: 120px;

      .selected-value-display {
        width: 120px;
        height: 30px;
        line-height: 20px;
        border: 1px solid #dedede;
        border-radius: 0px;
        font-size: 14px;
        padding: 4px 10px;
        background-color: #ffffff;
        color: #333;
        box-sizing: border-box;
      }

      &:not(.disabled) .selected-value-display:hover {
        border-color: #40a9ff;
      }

      &.expanded .selected-value-display {
        border-color: #40a9ff;
        box-shadow: 0 0 0 2px rgba(64, 169, 255, 0.1);
      }

      .options-list {
        width: auto;
        min-width: 120px;
        border: 1px solid #d9d9d9;
        border-radius: 2px;
      }

      .option {
        white-space: nowrap;
        overflow: visible;
        min-width: 120px;
        padding: 8px 12px;
        font-size: 14px;
        color: #333;
        cursor: pointer;

        &:hover, &.selected {
          background-color: #e6f7ff;
          color: #1890ff;
        }
      }
    }
  }

  /* ==================== 输入框 ==================== */
  .form-input {
    width: 260px;
    height: 30px;
    line-height: 20px;
    padding: 4px 10px;
    border: 1px solid #dedede;
    border-radius: 0px;
    font-size: 14px;
    transition: border-color 0.3s;
    background: white;
    box-sizing: border-box;
    flex-shrink: 0;

    &:focus {
      outline: none;
      border-color: #40a9ff;
      box-shadow: 0 0 0 2px rgba(64, 169, 255, 0.1);
    }

    &:disabled {
      background: #f5f5f5;
      cursor: not-allowed;
    }
  }

  /* ==================== 证件类型下拉框 ==================== */
  .id-card-type-select {
    flex-shrink: 0;

    :deep(.select-dropdown) {
      width: 260px;
      min-width: 260px;
      max-width: 260px;

      .selected-value-display {
        width: 260px;
        height: 30px;
        line-height: 20px;
        border: 1px solid #dedede;
        border-radius: 0px;
        font-size: 14px;
        padding: 4px 10px;
        background-color: #ffffff;
        color: #333;
        box-sizing: border-box;
      }

      &:not(.disabled) .selected-value-display:hover {
        border-color: #40a9ff;
      }

      &.expanded .selected-value-display {
        border-color: #40a9ff;
        box-shadow: 0 0 0 2px rgba(64, 169, 255, 0.1);
      }

      .options-list {
        width: auto;
        min-width: 260px;
        border: 1px solid #d9d9d9;
        border-radius: 2px;
      }

      .option {
        white-space: nowrap;
        overflow: visible;
        min-width: 260px;
        padding: 8px 12px;
        font-size: 14px;
        color: #333;
        cursor: pointer;
        text-align: left;

        &:hover, &.selected {
          background-color: #e6f7ff;
          color: #1890ff;
        }
      }
    }
  }

  /* ==================== 提示文字 ==================== */
  .hint-text {
    color: #ff8000;
    font-size: 13px;
    white-space: nowrap;
    flex-shrink: 0;
  }

  /* ==================== 错误提示 ==================== */
  .error-text {
    position: absolute;
    left: 135px;
    bottom: -22px;
    color: #FF2626;
    font-size: 13px;
  }

  .general-error {
    text-align: center;
    padding: 10px 15px;
    background: #fff2f0;
    border: 1px solid #ffccc7;
    border-radius: 2px;
    margin-left: 135px;
    margin-bottom: 20px;
    position: static;
  }

  /* ==================== 按钮行 ==================== */
  .button-row {
    display: flex;
    justify-content: center;
    margin-top: 15px; /* 减少上边距，从30px改为15px */
    margin-bottom: 10px; /* 减少下边距，从20px改为10px */
  }

  /* ==================== 提交按钮 ==================== */
  .submit-button {
    padding: 4px 10px;
    background: #ff8000;
    color: white;
    border: 1px solid #dedede;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
    transition: background 0.3s;
    min-width: 120px;
    height: 30px;
    line-height: 20px;

    &:hover:not(:disabled) {
      background: #ff8000;
    }

    &:disabled {
      background: #d9d9d9;
      cursor: not-allowed;
    }
  }

  /* ==================== 帮助链接 ==================== */
  .help-link {
    text-align: center;
    font-size: 14px;
    color: #666;
    margin-top: 10px;

    a {
      color: #1890ff;
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  }
}
</style>

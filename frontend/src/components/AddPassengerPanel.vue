<template>
  <div class="add-passenger-panel">
    <div class="passenger-form-container">
      <!-- 基本信息 -->
      <div class="passenger-section">
        <h3 class="passenger-section-title">
          基本信息
        </h3>

        <div class="passenger-form-row">
          <div class="passenger-label-wrapper">
            <label class="passenger-label">
              <span class="passenger-required">*</span> 证件类型：
            </label>
          </div>
          <div class="passenger-input-container">
            <SelectDropdown
              :options="idCardTypes"
              :value="idCardType"
              placeholder="请选择证件类型"
              @update:value="(val: string) => idCardType = val"
            />
          </div>
        </div>

        <div class="passenger-form-row">
          <div class="passenger-label-wrapper">
            <label class="passenger-label">
              <span class="passenger-required">*</span> 姓名：
            </label>
          </div>
          <div class="passenger-input-container">
            <div class="passenger-input-wrapper">
              <input
                type="text"
                class="passenger-input"
                :class="{ 'passenger-input-error': errors.name }"
                v-model="name"
                placeholder="请输入姓名"
              />
              <span class="passenger-hint">姓名填写规则（用于身份核验）</span>
            </div>
            <div v-if="errors.name" class="passenger-error-message">{{ errors.name }}</div>
          </div>
        </div>

        <div class="passenger-form-row">
          <div class="passenger-label-wrapper">
            <label class="passenger-label">
              <span class="passenger-required">*</span> 证件号码：
            </label>
          </div>
          <div class="passenger-input-container">
            <div class="passenger-input-wrapper">
              <input
                type="text"
                class="passenger-input"
                :class="{ 'passenger-input-error': errors.idCardNumber }"
                v-model="idCardNumber"
                placeholder="请填写证件号码"
              />
              <span class="passenger-hint">用于身份核验，请正确填写。</span>
            </div>
            <div v-if="errors.idCardNumber" class="passenger-error-message">{{ errors.idCardNumber }}</div>
          </div>
        </div>
      </div>

      <!-- 联系方式 -->
      <div class="passenger-section">
        <h3 class="passenger-section-title">
          联系方式<span class="passenger-section-subtitle">（请提供乘车人真实有效的联系方式）</span>
        </h3>

        <div class="passenger-form-row">
          <div class="passenger-label-wrapper">
            <label class="passenger-label">手机号码：</label>
          </div>
          <div class="passenger-input-container">
            <div class="passenger-input-wrapper">
              <div class="passenger-phone-group">
                <SelectDropdown
                  :options="['+86']"
                  value="+86"
                  placeholder="+86"
                  @update:value="() => {}"
                />
                <input
                  type="text"
                  class="passenger-input passenger-phone-input"
                  :class="{ 'passenger-input-error': errors.phone }"
                  v-model="phone"
                  placeholder="请填写手机号码"
                  maxlength="11"
                />
              </div>
            </div>
            <div v-if="errors.phone" class="passenger-error-message">{{ errors.phone }}</div>
            <div class="passenger-hint passenger-hint-block">
              请您填写乘车人真实有效的联系方式，以便接收铁路部门推送的重要服务信息，以及在紧急特殊情况下的联系。
            </div>
          </div>
        </div>
      </div>

      <!-- 附加信息 -->
      <div class="passenger-section">
        <h3 class="passenger-section-title">附加信息</h3>

        <div class="passenger-form-row">
          <div class="passenger-label-wrapper">
            <label class="passenger-label">
              <span class="passenger-required">*</span> 优惠(待)类型：
            </label>
          </div>
          <div class="passenger-input-container">
            <SelectDropdown
              :options="discountTypes"
              :value="discountType"
              placeholder="请选择优惠类型"
              @update:value="(val: string) => discountType = val"
            />
          </div>
        </div>
      </div>

      <div class="passenger-button-group">
        <button 
          class="passenger-button passenger-button-submit" 
          @click="handleSubmit"
          :disabled="isLoading"
        >
          {{ isLoading ? '保存中...' : '保存' }}
        </button>
        <button 
          class="passenger-button passenger-button-cancel" 
          @click="onCancel"
          :disabled="isLoading"
        >
          取消
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import SelectDropdown from './SelectDropdown.vue';

const props = defineProps<{
  onSubmit?: (data: any) => void;
  onCancel?: () => void;
}>();

const emit = defineEmits<{
  (e: 'submit', data: any): void;
  (e: 'cancel'): void;
}>();

const idCardType = ref('居民身份证');
const name = ref('');
const idCardNumber = ref('');
const phone = ref('');
const discountType = ref('成人');
const errors = ref<Record<string, string>>({});
const isLoading = ref(false);

const idCardTypes = [
  '居民身份证',
  '港澳居民来往内地通行证',
  '台湾居民来往大陆通行证',
  '护照'
];

const discountTypes = ['成人', '儿童', '学生', '残军'];

const validateForm = () => {
  const newErrors: Record<string, string> = {};
  let isValid = true;

  if (!name.value.trim()) {
    newErrors.name = '姓名不能为空';
    isValid = false;
  } else if (!/^[\u4e00-\u9fa5a-zA-Z·]+$/.test(name.value)) {
    newErrors.name = '姓名只能包含中文、英文和点';
    isValid = false;
  }

  if (!idCardNumber.value.trim()) {
    newErrors.idCardNumber = '证件号码不能为空';
    isValid = false;
  } else if (idCardType.value === '居民身份证' && !/(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(idCardNumber.value)) {
    newErrors.idCardNumber = '请输入正确的身份证号码';
    isValid = false;
  }

  if (phone.value && !/^1[3-9]\d{9}$/.test(phone.value)) {
    newErrors.phone = '请输入正确的手机号码';
    isValid = false;
  }

  errors.value = newErrors;
  return isValid;
};

const handleSubmit = async () => {
  if (!validateForm()) return;

  isLoading.value = true;
  const passengerData = {
    name: name.value,
    type: idCardType.value,
    id_card: idCardNumber.value, // Keep consistent with backend/reference naming if needed, checking payload
    phone: phone.value,
    discountType: discountType.value,
    // Add other fields as expected by backend
  };

  try {
    if (props.onSubmit) {
      await props.onSubmit(passengerData);
    }
    emit('submit', passengerData);
  } catch (error) {
    console.error('Submit failed:', error);
  } finally {
    isLoading.value = false;
  }
};

const onCancel = () => {
  if (props.onCancel) {
    props.onCancel();
  }
  emit('cancel');
};
</script>

<style>
/* 添加乘车人面板样式 - 像素级还原12306设计 */
.add-passenger-panel {
  background-color: #fff;
  padding: 0;
  margin: 0;
  width: 100%;
}

.passenger-form-container {
  width: 100%;
  max-width: 950px;
  margin: 0 auto;
  padding: 30px 30px;
}

/* 分节样式 */
.passenger-section {
  margin-bottom: 20px;
}

.passenger-section-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 20px 0;
  line-height: 1.5;
}

.passenger-section-subtitle {
  color: #ff8000;
  font-size: 14px;
  font-weight: 400;
}

/* 表单行 */
.passenger-form-row {
  margin-bottom: 22px;
  display: flex;
  align-items: flex-start;
}

/* 标签区域 */
.passenger-label-wrapper {
  width: 250px;
  text-align: right;
  padding-top: 10px;
  flex-shrink: 0;
  white-space: nowrap;
}

.passenger-label {
  font-size: 15px;
  color: #333;
  line-height: 20px;
  display: inline-block;
}

.passenger-required {
  color: #ff4d4f;
  margin-right: 4px;
  font-weight: bold;
}

/* 输入区域 */
.passenger-input-container {
  flex: 1;
  margin-left: 20px;
  max-width: 700px;
}

.passenger-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

/* 输入框 */
.passenger-input {
  width: 300px;
  height: 36px;
  padding: 0 12px;
  border: 1px solid #c5c5c5;
  border-radius: 0px;
  font-size: 14px;
  color: #333;
  outline: none;
  transition: all 0.3s;
  box-sizing: border-box;
  background: white;
  flex-shrink: 0;
}

.passenger-input::placeholder {
  color: #999;
}

.passenger-input:hover {
  border-color: #40a9ff;
}

.passenger-input:focus {
  border-color: #40a9ff;
  box-shadow: 0 0 0 2px rgba(64, 169, 255, 0.1);
}

.passenger-input-error {
  border-color: #ff4d4f;
}

.passenger-input-error:focus {
  box-shadow: 0 0 0 2px rgba(255, 77, 79, 0.1);
}

/* 下拉框统一宽度和样式 */
.passenger-input-container > :deep(.select-dropdown) {
  width: 300px !important;
  flex-shrink: 0;
}

/* 下拉框显示框样式 - 在这里可以单独调整高度、边框等 */
.passenger-input-container :deep(.select-dropdown .selected-value-display) {
  height: 36px !important;
  line-height: 36px !important;
  border: 1px solid #c5c5c5 !important;
  border-radius: 0px !important;
  font-size: 14px !important;
  padding: 0 28px 0 12px !important;
  background-color: #fff !important;
  width: 300px !important;
}

.passenger-input-container :deep(.select-dropdown:not(.disabled) .selected-value-display:hover) {
  border-color: #40a9ff !important;
}

.passenger-input-container :deep(.select-dropdown.expanded .selected-value-display) {
  border-color: #40a9ff !important;
  box-shadow: 0 0 0 2px rgba(64, 169, 255, 0.1) !important;
}

/* 提示信息 */
.passenger-hint {
  color: #ff8800;
  font-size: 12px;
  margin-left: 12px;
  line-height: 36px;
  flex-shrink: 0;
  white-space: nowrap;
}

.passenger-hint-block {
  width: 100%;
  margin-left: 0;
  margin-top: 8px;
  line-height: 1.6;
  white-space: normal;
}

/* 错误消息 */
.passenger-error-message {
  color: #ff4d4f;
  font-size: 12px;
  margin-top: 6px;
  line-height: 1.5;
  min-height: 18px;
  width: 100%;
}

/* 手机号码区域 */
.passenger-phone-group {
  display: flex;
  gap: 10px;
  align-items: center;
  width: 350px;
}

/* 国家代码下拉框 - 可以调整这里的宽度 */
.passenger-phone-group :deep(.select-dropdown) {
  width: 100px !important;
  min-width: 100px !important;
  max-width: 100px !important;
  flex-shrink: 0;
}

/* 手机号区域的下拉框显示框样式 */
.passenger-phone-group :deep(.select-dropdown .selected-value-display) {
  height: 36px !important;
  line-height: 36px !important;
  border: 1px solid #c5c5c5 !important;
  border-radius: 0px !important;
  font-size: 14px !important;
  padding: 0 33px 0 12px !important;
  background-color: #fff !important;
  width: 100px !important;
  text-align: center !important;
}

.passenger-phone-group :deep(.select-dropdown:not(.disabled) .selected-value-display:hover) {
  border-color: #40a9ff !important;
}

/* 手机号输入框 - 可以调整这里的宽度 */
.passenger-phone-input {
  width: 240px;
  flex-shrink: 0;
}

/* 按钮组 */
.passenger-button-group {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-top: 20px;
  padding-top: 20px;
}

.passenger-button {
  min-width: 100px;
  height: 38px;
  padding: 0 20px;
  border-radius: 5px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  box-sizing: border-box;
  font-weight: normal;
  font-weight: 500;
}

.passenger-button-cancel {
  background-color: #fff;
  color: #333;
  border: 1px solid #d0d0d0;
}

.passenger-button-cancel:hover {
  color: #ff8000;
  border-color: #ff8000;
}

.passenger-button-submit {
  background: #ff8000;
  color: white;
  font-weight: bold;
  border: none;
}

.passenger-button-submit:hover:not(:disabled) {
  background: #ff6f00;
  border: none;
}

.passenger-button-submit:active {
  background: linear-gradient(to bottom, #ff7700 0%, #ee6600 100%);
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.2);
}

.passenger-button-submit:disabled {
  background: #cccccc;
  border-color: #bbbbbb;
  cursor: not-allowed;
  box-shadow: none;
  opacity: 0.7;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .passenger-form-container {
    padding: 20px;
  }

  .passenger-form-row {
    flex-direction: column;
    align-items: stretch;
  }

  .passenger-label-wrapper {
    width: 100%;
    text-align: left;
    padding-top: 0;
    margin-bottom: 8px;
  }

  .passenger-input-container {
    margin-left: 0;
    max-width: 100%;
  }

  .passenger-input,
  .passenger-input-container > :deep(.select-dropdown) {
    width: 100% !important;
    min-width: 100% !important;
    max-width: 100% !important;
  }

  .passenger-phone-group {
    width: 100%;
    flex-direction: column;
    gap: 10px;
  }

  .passenger-phone-group :deep(.select-dropdown) {
    width: 100% !important;
    min-width: 100% !important;
    max-width: 100% !important;
  }

  .passenger-phone-input {
    width: 100%;
    min-width: 100%;
    max-width: 100%;
  }

  .passenger-hint {
    margin-left: 0;
    margin-top: 8px;
    line-height: 1.6;
    white-space: normal;
  }

  .passenger-button-group {
    flex-direction: column;
    gap: 10px;
  }

  .passenger-button {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .passenger-input {
    font-size: 16px; /* 防止iOS自动缩放 */
  }

  .passenger-form-container {
    padding: 15px;
  }
}
</style>

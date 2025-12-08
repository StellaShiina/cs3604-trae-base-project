<template>
  <div class="edit-passenger-panel">
    <div class="edit-passenger-form-container">
      <!-- 基本信息部分 - 只读显示样式 -->
      <div class="edit-passenger-section edit-basic-info-section">
        <h3 class="edit-passenger-section-title">
          基本信息
        </h3>

        <div class="edit-info-content">
          <div class="edit-info-row">
            <span class="edit-info-label">
              <span class="edit-required-mark">* </span>姓名：
            </span>
            <span class="edit-info-value">{{ passenger.name }}</span>
          </div>

          <div class="edit-info-row">
            <span class="edit-info-label">
              <span class="edit-required-mark">* </span>证件类型：
            </span>
            <span class="edit-info-value">{{ passenger.type || passenger.card_type }}</span>
          </div>

          <div class="edit-info-row">
            <span class="edit-info-label">
              <span class="edit-required-mark">* </span>证件号码：
            </span>
            <span class="edit-info-value">{{ passenger.id_card || passenger.card_no }}</span>
          </div>

          <div class="edit-info-row">
            <span class="edit-info-label">
              <span class="edit-required-mark">* </span>国家/地区：
            </span>
            <span class="edit-info-value">中国China</span>
          </div>

          <div class="edit-info-row">
            <span class="edit-info-label">添加日期：</span>
            <span class="edit-info-value">
              {{ passenger.created_at || new Date().toISOString().split('T')[0] }}
            </span>
          </div>

          <div class="edit-info-row">
            <span class="edit-info-label">核验状态：</span>
            <span class="edit-info-value edit-verification-status">已通过</span>
          </div>
        </div>
      </div>

      <!-- 联系方式 - 可编辑 -->
      <div class="edit-passenger-section">
        <h3 class="edit-passenger-section-title">
          联系方式<span class="edit-passenger-section-subtitle">（请提供乘车人真实有效的联系方式）</span>
        </h3>

        <div class="edit-passenger-form-row">
          <div class="edit-passenger-label-wrapper">
            <label class="edit-passenger-label">手机号码：</label>
          </div>
          <div class="edit-passenger-input-container">
            <div class="edit-passenger-input-wrapper">
              <div class="edit-passenger-phone-group">
                <SelectDropdown
                  :options="['+86']"
                  value="+86"
                  placeholder="+86"
                  @update:value="() => {}"
                />
                <input
                  type="text"
                  class="edit-passenger-input edit-passenger-phone-input"
                  :class="{ 'edit-passenger-input-error': errors.phone }"
                  v-model="phone"
                  placeholder="请填写手机号码"
                  maxlength="11"
                />
              </div>
            </div>
            <div v-if="errors.phone" class="edit-passenger-error-message">{{ errors.phone }}</div>
            <div class="edit-passenger-hint edit-passenger-hint-block">
              请您填写乘车人真实有效的联系方式，以便接收铁路部门推送的重要服务信息，以及在紧急特殊情况下的联系。
            </div>
          </div>
        </div>
      </div>

      <!-- 附加信息 - 可编辑 -->
      <div class="edit-passenger-section">
        <h3 class="edit-passenger-section-title">附加信息</h3>

        <div class="edit-passenger-form-row">
          <div class="edit-passenger-label-wrapper">
            <label class="edit-passenger-label">
              <span class="edit-required-mark">*</span> 优惠(待)类型：
            </label>
          </div>
          <div class="edit-passenger-input-container">
            <SelectDropdown
              :options="discountTypes"
              :value="discountType"
              placeholder="请选择优惠类型"
              @change="(val: string) => discountType = val"
            />
          </div>
        </div>
      </div>

      <div class="edit-passenger-button-group">
        <button 
          class="edit-passenger-button edit-passenger-button-submit" 
          @click="handleSubmit"
          :disabled="isLoading"
        >
          {{ isLoading ? '保存中...' : '保存' }}
        </button>
        <button 
          class="edit-passenger-button edit-passenger-button-cancel" 
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
  passenger: any;
  onSubmit?: (data: any) => void;
  onCancel?: () => void;
}>();

const emit = defineEmits<{
  (e: 'submit', data: any): void;
  (e: 'cancel'): void;
}>();

const phone = ref(props.passenger.phone || '');
const discountType = ref(props.passenger.discountType || props.passenger.discount_type || '成人');
const errors = ref<Record<string, string>>({});
const isLoading = ref(false);

const discountTypes = ['成人', '儿童', '学生', '残疾军人'];

const validateForm = () => {
  const newErrors: Record<string, string> = {};
  let isValid = true;

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
    ...props.passenger,
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
/* 编辑乘车人面板样式 - 结合个人信息页和添加乘车人页面的样式 */
.edit-passenger-panel {
  background-color: #fff;
  padding: 0;
  margin: 0;
  width: 100%;
}

.edit-passenger-form-container {
  width: 100%;
  max-width: 950px;
  margin: 0 auto;
  padding: 30px 30px;
}

/* 分节样式 */
.edit-passenger-section {
  margin-bottom: 20px;
}

.edit-passenger-section-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 20px 0;
  line-height: 1.5;
}

.edit-passenger-section-subtitle {
  color: #ff8000;
  font-size: 14px;
  font-weight: 400;
}

/* ===== 基本信息部分 - 只读显示样式（参考个人信息页）===== */
.edit-basic-info-section {
  background-color: transparent;
  padding: 0;
  border-radius: 0;
  margin-bottom: 20px;
  box-shadow: none;
  border: none;
  position: relative;
}

.edit-info-content {
  display: flex;
  flex-direction: column;
  gap: 0;
  max-width: 900px;
  margin: 0 auto;
}

.edit-info-row {
  display: flex;
  align-items: flex-start;
  margin-bottom: 5px;
}

.edit-info-label {
  width: 250px;
  text-align: right;
  padding-top: 10px;
  flex-shrink: 0;
  white-space: nowrap;
  font-size: 15px;
  color: #333;
  line-height: 20px;
}

.edit-required-mark {
  color: #ff4d4f;
  margin-right: 4px;
  font-weight: bold;
}

.edit-info-value {
  flex: 1;
  margin-left: 10px;
  padding-top: 10px;
  color: #333;
  font-size: 14px;
  line-height: 20px;
}

.edit-verification-status {
  color: #52c41a;
  font-weight: bold;
}

/* ===== 可编辑表单部分 ===== */
/* 表单行 */
.edit-passenger-form-row {
  margin-bottom: 22px;
  display: flex;
  align-items: flex-start;
}

/* 标签区域 */
.edit-passenger-label-wrapper {
  width: 250px;
  text-align: right;
  padding-top: 10px;
  flex-shrink: 0;
  white-space: nowrap;
}

.edit-passenger-label {
  font-size: 15px;
  color: #333;
  line-height: 20px;
  display: inline-block;
}

/* 输入区域 */
.edit-passenger-input-container {
  flex: 1;
  margin-left: 20px;
  max-width: 700px;
}

.edit-passenger-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

/* 输入框 */
.edit-passenger-input {
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

.edit-passenger-input:hover {
  border-color: #40a9ff;
}

.edit-passenger-input:focus {
  border-color: #40a9ff;
  box-shadow: 0 0 0 2px rgba(64, 169, 255, 0.1);
}

.edit-passenger-input-error {
  border-color: #ff4d4f;
}

.edit-passenger-input-error:focus {
  box-shadow: 0 0 0 2px rgba(255, 77, 79, 0.1);
}

/* 下拉框统一宽度和样式 */
.edit-passenger-input-container > :deep(.select-dropdown) {
  width: 300px !important;
  flex-shrink: 0;
}

/* 下拉框显示框样式 */
.edit-passenger-input-container :deep(.select-dropdown .selected-value-display) {
  height: 36px !important;
  line-height: 36px !important;
  border: 1px solid #c5c5c5 !important;
  border-radius: 0px !important;
  font-size: 14px !important;
  padding: 0 28px 0 12px !important;
  background-color: #fff !important;
  width: 300px !important;
}

.edit-passenger-input-container :deep(.select-dropdown:not(.disabled) .selected-value-display:hover) {
  border-color: #40a9ff !important;
}

.edit-passenger-input-container :deep(.select-dropdown.expanded .selected-value-display) {
  border-color: #40a9ff !important;
  box-shadow: 0 0 0 2px rgba(64, 169, 255, 0.1) !important;
}

/* 提示信息 */
.edit-passenger-hint {
  color: #ff8800;
  font-size: 12px;
  margin-left: 12px;
  line-height: 36px;
  flex-shrink: 0;
  white-space: nowrap;
}

.edit-passenger-hint-block {
  width: 100%;
  margin-left: 0;
  margin-top: 8px;
  line-height: 1.6;
  white-space: normal;
}

/* 错误消息 */
.edit-passenger-error-message {
  color: #ff4d4f;
  font-size: 12px;
  margin-top: 6px;
  line-height: 1.5;
  min-height: 18px;
  width: 100%;
}

/* 手机号码区域 */
.edit-passenger-phone-group {
  display: flex;
  gap: 10px;
  align-items: center;
  width: 350px;
}

/* 国家代码下拉框 */
.edit-passenger-phone-group :deep(.select-dropdown) {
  width: 100px !important;
  min-width: 100px !important;
  max-width: 100px !important;
  flex-shrink: 0;
}

/* 手机号区域的下拉框显示框样式 */
.edit-passenger-phone-group :deep(.select-dropdown .selected-value-display) {
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

.edit-passenger-phone-group :deep(.select-dropdown:not(.disabled) .selected-value-display:hover) {
  border-color: #40a9ff !important;
}

/* 手机号输入框 */
.edit-passenger-phone-input {
  width: 240px;
  flex-shrink: 0;
}

/* 按钮组 */
.edit-passenger-button-group {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-top: 20px;
  padding-top: 20px;
}

.edit-passenger-button {
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

.edit-passenger-button-cancel {
  background-color: #fff;
  color: #333;
  border: 1px solid #d0d0d0;
}

.edit-passenger-button-cancel:hover {
  color: #ff8000;
  border-color: #ff8000;
}

.edit-passenger-button-submit {
  background: #ff8000;
  color: white;
  font-weight: bold;
  border: none;
}

.edit-passenger-button-submit:hover:not(:disabled) {
  background: #ff6f00;
  border: none;
}

.edit-passenger-button-submit:active {
  background: linear-gradient(to bottom, #ff7700 0%, #ee6600 100%);
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.2);
}

.edit-passenger-button-submit:disabled {
  background: #cccccc;
  border-color: #bbbbbb;
  cursor: not-allowed;
  box-shadow: none;
  opacity: 0.7;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .edit-passenger-form-container {
    padding: 20px;
  }

  .edit-passenger-form-row {
    flex-direction: column;
    align-items: stretch;
  }

  .edit-passenger-label-wrapper {
    width: 100%;
    text-align: left;
    padding-top: 0;
    margin-bottom: 8px;
  }

  .edit-info-label {
    width: 120px;
    text-align: left;
  }

  .edit-passenger-input-container {
    margin-left: 0;
    max-width: 100%;
  }

  .edit-passenger-input,
  .edit-passenger-input-container > :deep(.select-dropdown) {
    width: 100% !important;
    min-width: 100% !important;
    max-width: 100% !important;
  }

  .edit-passenger-phone-group {
    width: 100%;
    flex-direction: column;
    gap: 10px;
  }

  .edit-passenger-phone-group :deep(.select-dropdown) {
    width: 100% !important;
    min-width: 100% !important;
    max-width: 100% !important;
  }

  .edit-passenger-phone-input {
    width: 100%;
    min-width: 100%;
    max-width: 100%;
  }

  .edit-passenger-hint {
    margin-left: 0;
    margin-top: 8px;
    line-height: 1.6;
    white-space: normal;
  }

  .edit-passenger-button-group {
    flex-direction: column;
    gap: 10px;
  }

  .edit-passenger-button {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .edit-passenger-input {
    font-size: 16px; /* 防止iOS自动缩放 */
  }

  .edit-passenger-form-container {
    padding: 15px;
  }
}
</style>

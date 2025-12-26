<template>
  <button
    class="reserve-button"
    :class="{ soldout: hasSoldOut }"
    @click="handleClick"
    :disabled="hasSoldOut"
  >
    预订
  </button>

  <!-- 其他确认弹窗 -->
  <ConfirmModal
    :is-visible="showConfirmModal"
    :title="modalConfig.title || ''"
    :message="modalConfig.message || ''"
    :confirm-text="modalConfig.confirmText || '确认'"
    :cancel-text="modalConfig.cancelText"
    @confirm="modalConfig.onConfirm"
    @cancel="() => showConfirmModal = false"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ConfirmModal from './ConfirmModal.vue';

const props = defineProps<{
  trainNo: string;
  departureStation: string;
  arrivalStation: string;
  departureDate: string;
  departureTime: string;
  hasSoldOut: boolean;
  isLoggedIn: boolean;
  queryTimestamp: string;
}>();

const emit = defineEmits<{
  (e: 'reserve', trainNo: string, departureStation: string, arrivalStation: string, departureDate: string): void;
}>();

const showConfirmModal = ref(false);
const modalConfig = ref<{
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
}>({
  onConfirm: () => {}
});

const handleClick = () => {
  // 1. 检查查询时间是否超过5分钟
  const now = new Date();
  const queryTime = new Date(props.queryTimestamp);
  const timeDiff = now.getTime() - queryTime.getTime();
  const fiveMinutesInMs = 5 * 60 * 1000;

  if (timeDiff > fiveMinutesInMs) {
    modalConfig.value = {
      title: '提示',
      message: '页面内容已过期，请重新查询！',
      confirmText: '确认',
      cancelText: '取消',
      onConfirm: () => {
        showConfirmModal.value = false;
        // 刷新页面
        window.location.reload();
      },
    };
    showConfirmModal.value = true;
    return;
  }

  // 3. 检查距离发车时间（如果小于3小时，显示提示）
  // 注意：这里假设 departureDate 是 YYYY-MM-DD 格式，departureTime 是 HH:mm 格式
  // 如果 dateUtils 返回的是其他格式，可能需要调整
  const departureDateTimeStr = `${props.departureDate} ${props.departureTime}`;
  const departureDateTime = new Date(departureDateTimeStr);
  const timeUntilDeparture = departureDateTime.getTime() - now.getTime();
  const threeHoursInMs = 3 * 60 * 60 * 1000;

  if (timeUntilDeparture < threeHoursInMs && timeUntilDeparture > 0) {
    modalConfig.value = {
      title: '温馨提示',
      message: '您选择的列车距开车时间很近了，进站约需20分钟，请确保有足够的时间办理安全检查、实名制验证及检票等手续，以免耽误您的旅行。',
      confirmText: '确认',
      cancelText: '取消',
      onConfirm: () => {
        showConfirmModal.value = false;
        // 继续预订
        emit('reserve', props.trainNo, props.departureStation, props.arrivalStation, props.departureDate);
      },
    };
    showConfirmModal.value = true;
    return;
  }

  // 4. 正常预订流程
  emit('reserve', props.trainNo, props.departureStation, props.arrivalStation, props.departureDate);
};
</script>

<style scoped lang="scss">
/* 预订按钮样式 */
.reserve-button {
  padding: 6px 18px;
  background-color: #0080ff;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover:not(:disabled) {
    background-color: #1a90ff;
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled,
  &.soldout {
    background: linear-gradient(to bottom, #d9d9d9 0%, #cccccc 100%);
    cursor: not-allowed;
    opacity: 0.6;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .reserve-button {
    padding: 10px;
    font-size: 13px;
    width: 100%;
  }
}

@media (max-width: 480px) {
  .reserve-button {
    padding: 9px;
    font-size: 12px;
  }
}
</style>
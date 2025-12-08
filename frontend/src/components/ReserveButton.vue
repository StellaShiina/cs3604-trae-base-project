<template>
  <button
    class="reserve-button"
    :class="{ soldout: hasSoldOut }"
    @click="handleClick"
    :disabled="hasSoldOut"
  >
    预订
  </button>

  <!-- 登录提示弹窗 -->
  <ConfirmModal
    :isVisible="showLoginModal"
    title="提示"
    message="请先登录！"
    confirmText="确认"
    cancelText="取消"
    @confirm="handleLoginConfirm"
    @cancel="showLoginModal = false"
  />

  <!-- 其他确认弹窗 -->
  <ConfirmModal
    v-if="showConfirmModal"
    :isVisible="showConfirmModal"
    :title="modalConfig.title"
    :message="modalConfig.message"
    :confirmText="modalConfig.confirmText"
    :cancelText="modalConfig.cancelText"
    @confirm="handleModalConfirm"
    @cancel="showConfirmModal = false"
  />
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import ConfirmModal from './ConfirmModal.vue'

interface Props {
  trainNo: string
  departureStation?: string
  arrivalStation?: string
  departureDate?: string
  departureTime?: string
  hasSoldOut: boolean
  isLoggedIn: boolean
  queryTimestamp: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'reserve', trainNo: string): void
}>()

const router = useRouter()

const showLoginModal = ref(false)
const showConfirmModal = ref(false)
const modalConfig = reactive({
  title: '',
  message: '',
  confirmText: '',
  cancelText: '',
  onConfirm: () => {}
})

const handleLoginConfirm = () => {
  showLoginModal.value = false
  router.push('/login')
}

const handleModalConfirm = () => {
  modalConfig.onConfirm()
}

const handleClick = () => {
  // 1. 检查用户登录状态
  if (!props.isLoggedIn) {
    showLoginModal.value = true
    return
  }

  // 2. 检查查询时间是否超过5分钟
  const now = new Date()
  const queryTime = new Date(props.queryTimestamp)
  const timeDiff = now.getTime() - queryTime.getTime()
  const fiveMinutesInMs = 5 * 60 * 1000

  if (timeDiff > fiveMinutesInMs) {
    modalConfig.title = '提示'
    modalConfig.message = '页面内容已过期，请重新查询！'
    modalConfig.confirmText = '确认'
    modalConfig.cancelText = '取消'
    modalConfig.onConfirm = () => {
      showConfirmModal.value = false
      window.location.reload()
    }
    showConfirmModal.value = true
    return
  }

  // 3. 检查距离发车时间（如果小于3小时，显示提示）
  if (props.departureDate && props.departureTime) {
    // departureDate format: YYYY-MM-DD
    // departureTime format: HH:MM
    const departureDateTime = new Date(`${props.departureDate} ${props.departureTime}`)
    const timeUntilDeparture = departureDateTime.getTime() - now.getTime()
    const threeHoursInMs = 3 * 60 * 60 * 1000

    if (timeUntilDeparture < threeHoursInMs && timeUntilDeparture > 0) {
      modalConfig.title = '温馨提示'
      modalConfig.message = '您选择的列车距开车时间很近了，进站约需20分钟，请确保有足够的时间办理安全检查、实名制验证及检票等手续，以免耽误您的旅行。'
      modalConfig.confirmText = '确认'
      modalConfig.cancelText = '取消'
      modalConfig.onConfirm = () => {
        showConfirmModal.value = false
        emit('reserve', props.trainNo)
      }
      showConfirmModal.value = true
      return
    }
  }

  // 4. 正常预订流程
  emit('reserve', props.trainNo)
}
</script>

<style>
.reserve-button {
  width: 100%;
  padding: 8px 16px;
  background-color: #3B99FC;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
  white-space: nowrap;
}

.reserve-button:hover {
  background-color: #0082fc;
}

.reserve-button:active {
  background-color: #2a88eb;
}

.reserve-button.soldout {
  background-color: #e0e0e0;
  color: #999999;
  cursor: not-allowed;
  border: 1px solid #d0d0d0;
}

.reserve-button:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}
</style>

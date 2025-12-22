<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import MessageModal from '@/components/Common/MessageModal.vue'

const props = defineProps<{
  trainNo: string
  departureDate: string
  departureTime: string
  hasSoldOut: boolean
  isLoggedIn: boolean
  queryTimestamp: string
}>()

const emit = defineEmits<{
  (e: 'reserve', trainNo: string): void
}>()

const router = useRouter()
const showMessageModal = ref(false)
const modalConfig = ref<{
  title: string
  message: string
  confirmText: string
  cancelText?: string
  onConfirm: () => void
}>({
  title: '',
  message: '',
  confirmText: '',
  cancelText: '',
  onConfirm: () => {}
})

const handleClick = () => {
  // 1. Check login
  if (!props.isLoggedIn) {
    router.push('/login')
    return
  }

  // 2. Check query timestamp (5 mins)
  const now = new Date()
  const queryTime = new Date(props.queryTimestamp)
  const timeDiff = now.getTime() - queryTime.getTime()
  const fiveMinutesInMs = 5 * 60 * 1000

  if (timeDiff > fiveMinutesInMs) {
    modalConfig.value = {
      title: '提示',
      message: '页面内容已过期，请重新查询！',
      confirmText: '确认',
      cancelText: '取消',
      onConfirm: () => {
        showMessageModal.value = false
        window.location.reload()
      }
    }
    showMessageModal.value = true
    return
  }

  // 3. Check departure time (< 3 hours)
  const departureDateTime = new Date(`${props.departureDate} ${props.departureTime}`)
  const timeUntilDeparture = departureDateTime.getTime() - now.getTime()
  const threeHoursInMs = 3 * 60 * 60 * 1000

  if (timeUntilDeparture < threeHoursInMs && timeUntilDeparture > 0) {
    modalConfig.value = {
      title: '温馨提示',
      message: '您选择的列车距开车时间很近了，进站约需20分钟，请确保有足够的时间办理安全检查、实名制验证及检票等手续，以免耽误您的旅行。',
      confirmText: '确认',
      cancelText: '取消',
      onConfirm: () => {
        showMessageModal.value = false
        emit('reserve', props.trainNo)
      }
    }
    showMessageModal.value = true
    return
  }

  // 4. Normal reserve
  emit('reserve', props.trainNo)
}

const handleConfirm = () => {
  if (modalConfig.value.onConfirm) {
    modalConfig.value.onConfirm()
  }
}
</script>

<template>
  <button
    class="booking-button"
    :class="{ 'soldout': hasSoldOut }"
    @click="handleClick"
    :disabled="hasSoldOut"
  >
    预订
  </button>
  
  <MessageModal
    :is-visible="showMessageModal"
    :title="modalConfig.title"
    :message="modalConfig.message"
    :confirm-text="modalConfig.confirmText"
    :cancel-text="modalConfig.cancelText"
    @confirm="handleConfirm"
    @cancel="showMessageModal = false"
  />
</template>

<style scoped lang="scss">
.booking-button {
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

  /* Responsive design */
  @media (max-width: 768px) {
    padding: 10px;
    font-size: 13px;
    width: 100%;
  }

  @media (max-width: 480px) {
    padding: 9px;
    font-size: 12px;
  }
}
</style>

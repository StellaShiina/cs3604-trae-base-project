<template>
  <Teleport to="body">
    <div v-if="isVisible" class="booking-failed-overlay" @click="onClose">
      <div class="booking-failed-modal" @click.stop>
        <div class="booking-failed-header">
          <h3>提示</h3>
        </div>
        <div class="booking-failed-body">
          <div class="error-icon">
            <svg width="80" height="80" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="35" fill="#f44336" opacity="0.1"/>
              <circle cx="40" cy="40" r="30" fill="none" stroke="#f44336" strokeWidth="3"/>
              <line x1="30" y1="30" x2="50" y2="50" stroke="#f44336" strokeWidth="3"/>
              <line x1="50" y1="30" x2="30" y2="50" stroke="#f44336" strokeWidth="3"/>
            </svg>
          </div>
          <p class="error-title">订票失败!</p>
          <p class="error-message">
            原因： 对不起，由于您取消次数过多，今日将不能继续受理您的订票请求。明日您可继续使用订票功能。
          </p>
          <p class="error-suggestion">
            请点击
            <span class="link-text" @click="handleNavigateToOrders">[我的12306]</span>
            办理其他业务。您也可以点击
            <span class="link-text" @click="handleNavigateToTrains">[预订车票]</span>
            ，重新规划您的旅程。
          </p>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const props = defineProps<{
  isVisible: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const router = useRouter();

const onClose = () => {
  emit('close');
};

const handleNavigateToOrders = () => {
  onClose();
  router.push('/orders');
};

const handleNavigateToTrains = () => {
  onClose();
  router.push('/trains'); // Assuming this is the path for train search
};
</script>

<style>
.booking-failed-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10001;
}

.booking-failed-modal {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.booking-failed-header {
  background-color: #2196f3;
  padding: 15px 20px;
  border-radius: 8px 8px 0 0;
}

.booking-failed-header h3 {
  margin: 0;
  color: white;
  font-size: 18px;
  font-weight: bold;
}

.booking-failed-body {
  padding: 30px 20px;
  text-align: center;
}

.error-icon {
  margin-bottom: 15px;
}

.error-title {
  color: #f44336;
  font-size: 24px;
  font-weight: bold;
  margin: 10px 0 20px 0;
}

.error-message {
  color: #666;
  font-size: 14px;
  line-height: 1.6;
  margin: 15px 0;
  text-align: left;
}

.error-suggestion {
  color: #666;
  font-size: 14px;
  line-height: 1.6;
  margin: 15px 0;
}

.link-text {
  color: #2196f3;
  cursor: pointer;
  font-weight: bold;
  text-decoration: none;
}

.link-text:hover {
  text-decoration: underline;
}
</style>

<template>
  <Transition name="toast-fade">
    <div v-if="visible" class="toast-container" :class="type">
      <div class="toast-content">
        <span class="toast-icon" v-if="type === 'success'">✓</span>
        <span class="toast-icon" v-if="type === 'error'">✕</span>
        <span class="toast-icon" v-if="type === 'warning'">!</span>
        <span class="toast-message">{{ message }}</span>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const props = defineProps<{
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}>();

const visible = ref(false);

onMounted(() => {
  visible.value = true;
  setTimeout(() => {
    visible.value = false;
  }, props.duration || 3000);
});
</script>

<style>
.toast-container {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  pointer-events: none;
}

.toast-content {
  background-color: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-radius: 4px;
  padding: 10px 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 200px;
  justify-content: center;
  border: 1px solid #ebeef5;
}

.toast-message {
  font-size: 14px;
  color: #606266;
}

.success .toast-content {
  background-color: #f0f9eb;
  border-color: #e1f3d8;
}

.success .toast-message {
  color: #67c23a;
}

.success .toast-icon {
  color: #67c23a;
  font-weight: bold;
}

.error .toast-content {
  background-color: #fef0f0;
  border-color: #fde2e2;
}

.error .toast-message {
  color: #f56c6c;
}

.error .toast-icon {
  color: #f56c6c;
  font-weight: bold;
}

.warning .toast-content {
  background-color: #fdf6ec;
  border-color: #faecd8;
}

.warning .toast-message {
  color: #e6a23c;
}

.warning .toast-icon {
  color: #e6a23c;
  font-weight: bold;
}

/* Animation */
.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: all 0.3s ease;
}

.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -20px);
}
</style>

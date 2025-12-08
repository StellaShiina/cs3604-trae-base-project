<template>
  <div :class="['loading-spinner', size]">
    <div class="spinner-icon">
      <div class="spinner-circle"></div>
    </div>
    <div v-if="message" class="spinner-message">{{ message }}</div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  size?: 'small' | 'medium' | 'large';
  message?: string;
}

withDefaults(defineProps<Props>(), {
  size: 'medium',
  message: '加载中...'
});
</script>

<style>
.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.spinner-icon {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner-circle {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-spinner.small .spinner-circle {
  width: 20px;
  height: 20px;
  border-width: 2px;
}

.loading-spinner.medium .spinner-circle {
  width: 40px;
  height: 40px;
  border-width: 4px;
}

.loading-spinner.large .spinner-circle {
  width: 60px;
  height: 60px;
  border-width: 6px;
}

.spinner-message {
  margin-top: 10px;
  color: #666;
  font-size: 14px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>

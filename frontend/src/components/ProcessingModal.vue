<template>
  <Teleport to="body">
    <div v-if="isVisible" class="processing-modal">
      <div class="processing-modal-overlay"></div>
      <div class="processing-modal-content">
        <LoadingSpinner size="large" />
        <p class="processing-message">{{ message }}</p>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import LoadingSpinner from './LoadingSpinner.vue';

defineProps<{
  isVisible: boolean;
  message: string;
}>();
</script>

<style>
/* 订单处理中弹窗样式 */
.processing-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2000;
  display: flex;
  justify-content: center;
  align-items: center;
}

.processing-modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
}

.processing-modal-content {
  position: relative;
  background-color: #ffffff;
  border-radius: 8px;
  padding: 40px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.processing-message {
  margin-top: 20px;
  font-size: 16px;
  color: #333333;
}
</style>

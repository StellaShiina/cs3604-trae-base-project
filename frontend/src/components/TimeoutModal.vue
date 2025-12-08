<template>
  <Teleport to="body">
    <div v-if="isVisible" class="timeout-modal-overlay">
      <div class="timeout-modal-content">
        <div class="timeout-modal-body">
          <p class="timeout-modal-message">支付超时，请重新购票</p>
        </div>
        <div class="timeout-modal-footer">
          <button class="timeout-modal-button" @click="emit('confirm')">
            确认
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import './TimeoutModal.css';

defineProps<{
  isVisible: boolean;
}>();

const emit = defineEmits<{
  (e: 'confirm'): void;
}>();
</script>

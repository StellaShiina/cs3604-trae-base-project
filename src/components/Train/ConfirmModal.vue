<template>
  <Teleport to="body">
    <div v-if="isVisible" class="confirm-modal">
      <div class="modal-overlay" @click="onCancel">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3 class="modal-title">{{ title }}</h3>
          </div>
          <div class="modal-body">
            <div class="modal-message">
              <slot>{{ message }}</slot>
            </div>
          </div>
          <div class="modal-footer">
            <button class="modal-button confirm-button" @click="onConfirm">
              {{ confirmText }}
            </button>
            <button v-if="cancelText && onCancel" class="modal-button cancel-button" @click="onCancel">
              {{ cancelText }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{
  isVisible: boolean;
  title: string;
  message?: string;
  confirmText: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}>();
</script>

<style scoped lang="scss">
/* 确认弹窗样式 - 使用 .confirm-modal 命名空间 + !important 避免被其他弹窗的样式覆盖 */
.confirm-modal {
  .modal-overlay {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    background-color: rgba(0, 0, 0, 0.5) !important;
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
    z-index: 10000 !important;
  }

  .modal-content {
    background: white !important;
    border-radius: 8px !important;
    width: 90% !important;
    max-width: 400px !important;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
    padding: 0 !important;
    position: relative !important;
  }

  .modal-header {
    padding: 10px 20px !important;
    border-bottom: 1px solid #e0e0e0 !important;
    background-color: #3b99fc; // Added to match likely intent since text is white in CSS
    border-radius: 8px 8px 0 0;
  }

  .modal-title {
    margin: 0 !important;
    font-size: 18px !important;
    font-weight: bold !important;
    color: #fff !important;
  }

  .modal-body {
    padding: 20px !important;
  }

  .modal-message {
    margin: 0 !important;
    font-size: 18px !important;
    line-height: 1.6 !important;
    color: #333 !important;
    text-align: left !important; // Changed flex-start to left for text-align

    :deep(.link-text) {
      color: #2196f3;
      cursor: pointer;
      text-decoration: none;
      font-weight: bold;

      &:hover {
        text-decoration: underline;
      }
    }
  }

  .modal-footer {
    padding: 15px 20px !important;
    border-top: 1px solid #e0e0e0 !important;
    display: flex !important;
    justify-content: center !important;
    gap: 30px !important;
  }

  .modal-button {
    padding: 8px 20px !important;
    border: none !important;
    border-radius: 4px !important;
    cursor: pointer !important;
    font-size: 14px !important;
    font-weight: bold !important;
  }

  .confirm-button {
    background-color: #ff6600 !important;
    color: white !important;

    &:hover {
      background-color: #ff8833 !important;
    }
  }

  .cancel-button {
    background-color: #e0e0e0 !important;
    color: #333 !important;

    &:hover {
      background-color: #d0d0d0 !important;
    }
  }
}
</style>

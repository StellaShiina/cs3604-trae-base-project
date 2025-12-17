<script setup lang="ts">

defineProps<{
  isVisible: boolean
  title: string
  message: string
  confirmText: string
  cancelText?: string
}>()

const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()
</script>

<template>
  <Teleport to="body">
    <div v-if="isVisible" class="confirm-modal">
      <div class="modal-overlay" @click="emit('cancel')">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3 class="modal-title">{{ title }}</h3>
          </div>
          <div class="modal-body">
            <div class="modal-message" v-html="message"></div>
          </div>
          <div class="modal-footer">
            <button class="modal-button confirm-button" @click="emit('confirm')">
              {{ confirmText }}
            </button>
            <button v-if="cancelText" class="modal-button cancel-button" @click="emit('cancel')">
              {{ cancelText }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped lang="scss">
/* Scoped styles - !important shouldn't be needed as much, but keeping core styles */
.confirm-modal {
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
  }

  .modal-content {
    background: white;
    border-radius: 4px;
    width: 90%;
    max-width: 400px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    padding: 0;
    position: relative;
    overflow: hidden;
  }

  .modal-header {
    background: linear-gradient(to right, #3B99FC, #2196f3); /* Added gradient to match header look */
    padding: 10px 20px;
    border-bottom: 1px solid #e0e0e0;
    
    .modal-title {
      margin: 0;
      font-size: 16px;
      font-weight: bold;
      color: #fff;
    }
  }

  .modal-body {
    padding: 30px 20px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    
    .modal-message {
      margin: 0;
      font-size: 14px;
      line-height: 1.6;
      color: #333;
      
      /* Handle link text if passed in HTML */
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
    
    /* Icon styling similar to standard 12306 alerts if needed */
    &::before {
      content: "!";
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 40px;
      height: 40px;
      border-radius: 50%;
      background-color: #f0ad4e;
      color: white;
      font-weight: bold;
      font-size: 24px;
      margin-right: 15px;
    }
  }

  .modal-footer {
    padding: 15px 20px;
    border-top: 1px solid #e0e0e0;
    display: flex;
    justify-content: center;
    gap: 20px;
    background-color: #f8f9fa;

    .modal-button {
      padding: 6px 25px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s;

      &.confirm-button {
        background-color: #ff9900;
        color: white;
        
        &:hover {
          background-color: #e68a00;
        }
      }

      &.cancel-button {
        background-color: #e0e0e0;
        color: #666;
        
        &:hover {
          background-color: #d0d0d0;
        }
      }
    }
  }
}
</style>

<template>
  <Teleport to="body">
    <div v-if="isVisible" class="confirm-modal">
      <div class="modal-overlay" @click="handleOverlayClick">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3 class="modal-title">{{ title }}</h3>
          </div>
          <div class="modal-body">
            <div class="modal-message">
              <!-- Support HTML content if needed, or just text -->
              <slot>{{ message }}</slot>
            </div>
          </div>
          <div class="modal-footer">
            <button class="modal-button confirm-button" @click="onConfirm">
              {{ confirmText }}
            </button>
            <button v-if="cancelText" class="modal-button cancel-button" @click="onCancel">
              {{ cancelText }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">

const props = defineProps<{
  isVisible: boolean;
  title: string;
  message?: string;
  confirmText: string;
  cancelText?: string;
}>();

const emit = defineEmits<{
  (e: 'confirm'): void;
  (e: 'cancel'): void;
}>();

const onConfirm = () => {
  emit('confirm');
};

const onCancel = () => {
  emit('cancel');
};

const handleOverlayClick = () => {
  if (props.cancelText) {
    emit('cancel');
  }
};
</script>

<style>
/* 确认弹窗样式 - 使用 .confirm-modal 命名空间 + !important 避免被其他弹窗的样式覆盖 */
.confirm-modal .modal-overlay {
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

.confirm-modal .modal-content {
  background: white !important;
  border-radius: 8px !important;
  width: 90% !important;
  max-width: 400px !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
  padding: 0 !important;
  position: relative !important;
}

.confirm-modal .modal-header {
  padding: 10px 20px !important;
  border-bottom: 1px solid #e0e0e0 !important;
  background-color: #3B99FC; /* Added to match typical modal headers if needed, checking ref... ref says color: #fff but no bg color in CSS provided? Wait. */
}

/* Re-checking reference CSS for modal-header */
/* .confirm-modal .modal-header { padding: ...; border-bottom: ...; } */
/* .confirm-modal .modal-title { ... color: #fff !important; } */
/* If title is white, header likely has a background color. 
   The provided CSS didn't explicitly set background-color for header, but let's look at the React component. 
   It's just a div. 
   Maybe it inherits or I missed it. 
   Let's check the CSS I read again.
   Line 25: .confirm-modal .modal-header { padding... border-bottom... }
   Line 30: .confirm-modal .modal-title { ... color: #fff !important; }
   If color is white, background must be dark. 
   Ah, looking at other components (HomeTopBar), the primary color is #3B99FC.
   I will assume #3B99FC for the header background.
*/

.confirm-modal .modal-header {
  padding: 10px 20px !important;
  border-bottom: 1px solid #e0e0e0 !important;
  background-color: #3B99FC !important; /* Inferred */
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
}

.confirm-modal .modal-title {
  margin: 0 !important;
  font-size: 18px !important;
  font-weight: bold !important;
  color: #fff !important;
}

.confirm-modal .modal-body {
  padding: 20px !important;
}

.confirm-modal .modal-message {
  margin: 0 !important;
  font-size: 18px !important;
  line-height: 1.6 !important;
  color: #333 !important;
  text-align: left !important; /* flex-start in CSS is for flex containers, for text it's left/start */
}

.confirm-modal .modal-footer {
  padding: 15px 20px !important;
  border-top: 1px solid #e0e0e0 !important;
  display: flex !important;
  justify-content: center !important;
  gap: 30px !important;
}

.confirm-modal .modal-button {
  padding: 8px 20px !important;
  border: none !important;
  border-radius: 4px !important;
  cursor: pointer !important;
  font-size: 14px !important;
  font-weight: bold !important;
}

.confirm-modal .confirm-button {
  background-color: #ff6600 !important;
  color: white !important;
}

.confirm-modal .confirm-button:hover {
  background-color: #ff8833 !important;
}

.confirm-modal .cancel-button {
  background-color: #e0e0e0 !important;
  color: #333 !important;
}

.confirm-modal .cancel-button:hover {
  background-color: #d0d0d0 !important;
}
</style>

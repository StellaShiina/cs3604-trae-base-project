<template>
  <Teleport to="body">
    <div v-if="isVisible" class="cancel-order-modal-overlay" @click="emit('cancel')">
      <div class="cancel-order-modal-content" @click.stop>
        <div class="cancel-order-modal-header">
          <h3 class="cancel-order-modal-title">交易提示</h3>
        </div>
        <div class="cancel-order-modal-body">
          <div class="cancel-order-modal-content-wrapper">
            <div class="cancel-order-icon">
              <img 
                src="/images/问号.png" 
                alt="问号"
              />
            </div>
            <div class="cancel-order-text-content">
              <div class="cancel-order-question">
                您确认取消订单吗？
              </div>
              <div class="cancel-order-warning">
                一天内3次申请车票成功后取消订单（包含无座车票或不符合选铺需求车票时取消5次计为取消1次），当日将不能在12306继续购票。
              </div>
            </div>
          </div>
        </div>
        <div class="cancel-order-modal-footer">
          <button class="cancel-order-button cancel-button" @click="emit('cancel')">
            取消
          </button>
          <button class="cancel-order-button confirm-button" @click="emit('confirm')">
            确认
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import './CancelOrderModal.css';

defineProps<{
  isVisible: boolean;
  isLoading?: boolean;
}>();

const emit = defineEmits<{
  (e: 'confirm'): void;
  (e: 'cancel'): void;
}>();
</script>

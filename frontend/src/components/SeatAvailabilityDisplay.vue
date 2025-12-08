<template>
  <div v-if="availableSeats" class="seat-availability-display">
    <p class="availability-text">
      本次列车，
      <span v-for="(count, seatType, index) in availableSeats" :key="seatType">
        {{ index > 0 ? '，' : '' }}
        {{ seatType }}余票 <span class="seat-count">{{ String(count) }}</span> 张
      </span>
      。
    </p>
  </div>
</template>

<script setup lang="ts">

interface SeatAvailabilityDisplayProps {
  availableSeats: Record<string, number | string>;
}

defineProps<SeatAvailabilityDisplayProps>();
</script>

<style>
/* 余票状态显示样式（信息核对弹窗） */
.seat-availability-display {
  padding: 5px 0 5px 0;
  margin-top: 0;
  border-top: 1px dashed #d0d0d0;
}

.availability-text {
  font-size: 14px;
  color: #333333;
  margin: 0;
  line-height: 1.6;
}

.availability-text .seat-count {
  color: #d32f2f;
  font-weight: bold;
  margin: 0 2px;
  font-size: 20px;
}
</style>

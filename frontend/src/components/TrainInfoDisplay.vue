<template>
  <div v-if="trainInfo" class="train-info-display">
    <div class="train-info-line">
      <span class="info-date">{{ formatDate(trainInfo.departureDate, trainInfo.dayOfWeek) }}</span>
      <span class="info-group">
        <span class="info-train-no">{{ trainInfo.trainNo }}</span>
        <span class="info-text">次</span>
      </span>
      <span class="info-group">
        <span class="info-station">{{ trainInfo.departureStation }}</span>
        <span class="info-text">站</span>
        <span class="info-bold-group">（{{ trainInfo.departureTime }}开）—{{ trainInfo.arrivalStation }}</span>
        <span class="info-text">站（{{ trainInfo.arrivalTime }}到）</span>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">

interface TrainInfo {
  departureDate: string;
  dayOfWeek?: string;
  trainNo: string;
  departureStation: string;
  departureTime: string;
  arrivalStation: string;
  arrivalTime: string;
}

const props = defineProps<{
  trainInfo: TrainInfo;
}>();

const formatDate = (date: string, dayOfWeek?: string) => {
  if (dayOfWeek) {
    return `${date}（${dayOfWeek}）`;
  }
  const d = new Date(date);
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const weekDay = weekDays[d.getDay()];
  return `${date}（${weekDay}）`;
};
</script>

<style>
/* 车次信息展示样式（信息核对弹窗） */
.train-info-display {
  padding: 5px 0 5px 0;
  margin-bottom: 10px !important;
}

.train-info-line {
  font-size: 20px;
  color: #333333;
  line-height: 20px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.info-group {
  display: inline-flex;
  align-items: baseline;
  gap: 0;
  white-space: nowrap;
}

.info-date, .info-train-no, .info-station, .info-bold-group {
  font-weight: 800;
  color: #000000;
  font-size: 20px;
}

.info-text {
  font-weight: 400;
  color: #000000;
  font-size: 16px;
}
</style>

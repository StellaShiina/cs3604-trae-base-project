<template>
  <div class="train-info-section">
    <div class="train-info-header">
      <h2 class="section-title">列车信息（以下余票信息仅供参考）</h2>
    </div>
    
    <div class="train-info-content">
      <div v-if="trainInfo" class="train-basic-info">
        <span class="train-date">{{ formatDate(trainInfo.departureDate) }}</span>
        <span class="train-info-group">
          <span class="train-no">{{ trainInfo.trainNo }}</span>
          <span class="train-text">次</span>
        </span>
        <span class="train-info-group">
          <span class="train-station">{{ trainInfo.departureStation }}</span>
          <span class="train-text">站</span>
          <span class="train-bold-group">（{{ trainInfo.departureTime }}开）—{{ trainInfo.arrivalStation }}</span>
          <span class="train-text">站（{{ trainInfo.arrivalTime }}到）</span>
        </span>
      </div>
      
      <div v-if="fareInfo && availableSeats" class="train-fare-info">
        <div v-for="seatType in Object.keys(fareInfo)" :key="seatType" class="fare-item">
          <span class="seat-type-label">{{ seatType }}</span>
          <span class="seat-price-bracket">（</span>
          <span class="seat-price">¥{{ fareInfo[seatType]?.price }}.0元</span>
          <span class="seat-price-bracket">）</span>
          <span class="seat-discount">{{ fareInfo[seatType]?.discount ? `${fareInfo[seatType]?.discount}折` : '' }}</span>
          <span class="seat-available">{{ availableSeats[seatType] !== undefined ? ` ${availableSeats[seatType]}张票` : ' 无票' }}</span>
          <span v-if="fareInfo[seatType]?.status" class="seat-status"> {{ fareInfo[seatType]?.status }}</span>
        </div>
      </div>
      
      <div class="train-info-notice">
        <p class="notice-text">显示的价格均为实际活动折扣后票价，供您参考，查看<a href="#" @click.prevent>公布票价</a>。具体票价以您确认支付时实际购买的铺别票价为准。</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import './TrainInfoSection.css';

interface TrainInfo {
  departureDate: string;
  trainNo: string;
  departureStation: string;
  arrivalStation: string;
  departureTime: string;
  arrivalTime: string;
}

interface FareInfo {
  [key: string]: {
    price: number;
    discount?: string;
    status?: string;
  };
}

interface AvailableSeats {
  [key: string]: number | string;
}

const props = defineProps<{
  trainInfo: TrainInfo | null;
  fareInfo: FareInfo | null;
  availableSeats: AvailableSeats | null;
}>();

const formatDate = (date: string) => {
  if (!date) return '';
  const d = new Date(date);
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const weekDay = weekDays[d.getDay()];
  return `${date}（${weekDay}）`;
};
</script>

<style>
/* 样式已通过 CSS 文件引入 */
</style>

<template>
  <div class="train-item" :class="rowIndex % 2 === 0 ? 'train-item-even' : 'train-item-odd'">
    <!-- 车次号 - 带下拉箭头 -->
    <div class="train-item-cell align-left">
      <div class="train-number-container">
        <span class="train-number">{{ train.trainNo || '--' }}</span>
        <svg class="train-dropdown-arrow" width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M6 8L2 4H10L6 8Z" fill="#2196f3"/>
        </svg>
      </div>
      <!-- 可以在这里添加车次类型标签 -->
      <div class="train-badges">
        <span v-if="train.trainNo?.startsWith('G')" class="train-badge">高</span>
        <span v-if="train.trainNo?.startsWith('D')" class="train-badge">动</span>
      </div>
    </div>
    
    <!-- 出发站/到达站 -->
    <div class="train-item-cell">
      <div class="train-stations-vertical">
        <div class="station-name-with-badge">
          <span class="station-badge station-badge-start">始</span>
          <span class="station-name">{{ train.departureStation || '--' }}</span>
        </div>
        <div class="station-name-with-badge">
          <span class="station-badge station-badge-end">终</span>
          <span class="station-name">{{ train.arrivalStation || '--' }}</span>
        </div>
      </div>
    </div>
    
    <!-- 出发/到达时间 -->
    <div class="train-item-cell">
      <div class="train-times-vertical">
        <div class="train-time train-time-departure">{{ train.departureTime || '--' }}</div>
        <div class="train-time train-time-arrival">{{ train.arrivalTime || '--' }}</div>
      </div>
    </div>
    
    <!-- 历时 -->
    <div class="train-item-cell">
      <div class="train-duration">{{ formatDuration(train.duration) }}</div>
      <div class="train-arrival-date">
        <span v-if="isNextDay" class="arrival-day-tag">次日到达</span>
        <span v-else class="arrival-day-tag">当日到达</span>
      </div>
    </div>
    
    <!-- 商务座/特等座 -->
    <div class="train-item-cell">
      <div class="seat-info" :class="getSeatClass(availableSeats.business)">
        {{ formatSeatStatus(availableSeats.business) }}
      </div>
    </div>
    
    <!-- 优选/一等座 -->
    <div class="train-item-cell">
      <div class="seat-info">--</div>
    </div>
    
    <!-- 一等座 -->
    <div class="train-item-cell">
      <div class="seat-info" :class="getSeatClass(availableSeats.firstClass)">
        {{ formatSeatStatus(availableSeats.firstClass) }}
      </div>
    </div>
    
    <!-- 二等座/二等包座 -->
    <div class="train-item-cell">
      <div class="seat-info" :class="getSeatClass(availableSeats.secondClass)">
        {{ formatSeatStatus(availableSeats.secondClass) }}
      </div>
    </div>
    
    <!-- 高级/软卧 -->
    <div class="train-item-cell">
      <div class="seat-info">--</div>
    </div>
    
    <!-- 软卧/动卧/一等卧 -->
    <div class="train-item-cell">
      <div class="seat-info" :class="getSeatClass(availableSeats.softSleeper)">
        {{ formatSeatStatus(availableSeats.softSleeper) }}
      </div>
    </div>
    
    <!-- 硬卧/二等卧 -->
    <div class="train-item-cell">
      <div class="seat-info" :class="getSeatClass(availableSeats.hardSleeper)">
        {{ formatSeatStatus(availableSeats.hardSleeper) }}
      </div>
    </div>
    
    <!-- 软座 -->
    <div class="train-item-cell">
      <div class="seat-info" :class="getSeatClass(availableSeats.softSeat)">
        {{ formatSeatStatus(availableSeats.softSeat) }}
      </div>
    </div>
    
    <!-- 硬座 -->
    <div class="train-item-cell">
      <div class="seat-info" :class="getSeatClass(availableSeats.hardSeat)">
        {{ formatSeatStatus(availableSeats.hardSeat) }}
      </div>
    </div>
    
    <!-- 无座 -->
    <div class="train-item-cell">
      <div class="seat-info" :class="getSeatClass(availableSeats.noSeat)">
        {{ formatSeatStatus(availableSeats.noSeat) }}
      </div>
    </div>
    
    <!-- 其他 -->
    <div class="train-item-cell">
      <div class="seat-info">--</div>
    </div>
    
    <!-- 备注 -->
    <div class="train-item-cell train-reserve-cell">
      <ReserveButton
        :train-no="train.trainNo"
        :departure-station="train.departureStation"
        :arrival-station="train.arrivalStation"
        :departure-date="train.departureDate"
        :departure-time="train.departureTime"
        :has-sold-out="isAllSoldOut"
        :is-logged-in="isLoggedIn"
        :query-timestamp="queryTimestamp"
        @reserve="onReserve"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import ReserveButton from './ReserveButton.vue';

const props = defineProps<{
  train: any;
  rowIndex: number;
  isLoggedIn: boolean;
  queryTimestamp: string;
}>();

const emit = defineEmits<{
  (e: 'reserve', trainNo: string, departureStation: string, arrivalStation: string, departureDate: string): void;
}>();

// Available Seats Mapping
const availableSeats = computed(() => {
  const seats = props.train.availableSeats || {};
  return {
    business: seats['商务座'] ?? null,
    firstClass: seats['一等座'] ?? null,
    secondClass: seats['二等座'] ?? null,
    softSleeper: seats['软卧'] ?? null,
    hardSleeper: seats['硬卧'] ?? null,
    hardSeat: seats['硬座'] ?? null,
    softSeat: seats['软座'] ?? null,
    noSeat: seats['无座'] ?? null,
  };
});

const formatSeatStatus = (count: number | null | undefined) => {
  if (count === null || count === undefined) return '--';
  if (count === 0) return '无';
  if (count >= 20) return '有';
  return count.toString();
};

const getSeatClass = (count: number | null | undefined) => {
  if (count === null || count === undefined) return 'not-available';
  if (count === 0) return 'sold-out';
  if (count >= 20) return 'available';
  return 'limited';
};

const isAllSoldOut = computed(() => {
  const seats = availableSeats.value;
  const validSeats = Object.values(seats).filter(count => count !== null && count !== undefined);
  if (validSeats.length === 0) return false;
  return validSeats.every(count => count === 0);
});

const formatDuration = (minutes: number | undefined) => {
  if (!minutes) return '--';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
};

const isNextDay = computed(() => {
  if (!props.train.departureTime || !props.train.arrivalTime) return false;
  const depTime = props.train.departureTime.split(':').map(Number);
  const arrTime = props.train.arrivalTime.split(':').map(Number);
  const depMinutes = depTime[0] * 60 + depTime[1];
  const arrMinutes = arrTime[0] * 60 + arrTime[1];
  return arrMinutes < depMinutes;
});

const onReserve = (trainNo: string, departureStation: string, arrivalStation: string, departureDate: string) => {
  emit('reserve', trainNo, departureStation, arrivalStation, departureDate);
};
</script>

<style scoped lang="scss">
/* 车次列表项样式 */
.train-item {
  display: grid;
  grid-template-columns: 80px 100px 80px 70px repeat(11, minmax(50px, 1fr)) 80px;
  gap: 0;
  padding: 0px 0px;
  border-bottom: 1px solid #e9ecef;
  align-items: stretch;
  transition: all 0.2s ease;
  
  &:hover {
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  }

  &:last-child {
    border-bottom: none;
  }
}

.train-item-even {
  background-color: #eff1f9;
}

.train-item-odd {
  background-color: #ffffff;
}

/* 车次单元格 */
.train-item-cell {
  text-align: center;
  font-size: 13px;
  color: #495057;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  &.align-left {
    text-align: right;
    align-items: flex-end;
    justify-content: center;
  }

  /* 从历时右边开始的列添加浅蓝色竖线分隔 - 使用右边框 */
  &:nth-child(n+4):nth-child(-n+15) {
    border-right: 1px solid #c8ddf0;
  }

  /* 最后一列（备注）不需要右边框 */
  &:nth-child(16) {
    border-right: none;
  }

  &:nth-child(n+5) {
    padding-left: 4px;
    padding-right: 4px;
  }

  &:nth-child(4) {
    padding-left: 8px;
    padding-right: 8px;
  }

  &:nth-child(1),
  &:nth-child(2),
  &:nth-child(3) {
    padding-left: 8px;
    padding-right: 8px;
  }
}

/* 车次号容器 */
.train-number-container {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

.train-number {
  font-weight: 800;
  color: #333333;
  font-size: 16px;
  text-decoration: underline;
  text-decoration-color: #333333;
  margin-bottom: 0px !important;
}

.train-dropdown-arrow {
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s;

  &:hover {
    opacity: 1;
  }
}

/* 车次标签 */
.train-badges {
  display: flex;
  gap: 4px;
  margin-top: 3px;
  margin-right: 15px
}

.train-badge {
  display: inline-block;
  padding: 1px 4px;
  background-color: #ffffff;
  color: #ff7700;
  border: 0.5px solid #ff7700;
  font-size: 10px;
  border-radius: 2px;
  font-weight: 600;
}

/* 站点信息 - 垂直布局 */
.train-stations-vertical {
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: left;
  align-items: flex-start;
  width: 100%;

  .station-name {
    font-size: 14px;
    font-weight: 600;
    color: #333333;
    line-height: 1.4;
  }
}

.station-name-with-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  justify-content: flex-start;
}

.station-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 2px;
  font-size: 11px;
  font-weight: 600;
  color: white;
}

.station-badge-start {
  background-color: #cf9840;
}

.station-badge-end {
  background-color: #3f6901;
}

/* 时间信息 - 垂直布局 */
.train-times-vertical {
  display: flex;
  flex-direction: column;
  gap: 0px;
  text-align: left;
  align-items: flex-start;
  width: 100%;
}

.train-time {
  font-size: 16px !important;
  font-weight: 800;
  color: #333333;
  line-height: 1.2;

  &.train-time-arrival {
    font-size: 16px !important;
    color: #999999 !important;
    font-weight: 800;
  }
}

.train-arrival-date {
  margin-top: 0px;
  text-align: left;
  width: 100%;
}

.arrival-day-tag {
  display: inline-block;
  font-size: 13px;
  color: #5c5c5c;
  font-weight: 500;
}

/* 历时 */
.train-duration {
  font-size: 15px;
  color: #343434;
  line-height: 1.3;
  text-align: left;
  width: 100%;
  font-weight: 800;
}

/* 座位信息 */
.seat-info {
  font-size: 13px;
  font-weight: 500;
  padding: 2px 0;
  color: #999999; /* 默认灰色（用于--） */

  &.available {
    color: #52c41a;
    font-weight: 600;
  }

  &.limited {
    color: #000000;
    font-weight: 800;
  }

  &.sold-out {
    color: #999999;
  }

  &.not-available {
    color: #999999;
  }
}

/* 预订按钮单元格 */
.train-reserve-cell {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 响应式设计 - 平板 */
@media (max-width: 1024px) {
  .train-item {
    grid-template-columns: 70px 160px 110px 110px 90px repeat(5, minmax(60px, 1fr)) 90px;
    gap: 8px;
    padding: 15px;
  }

  .train-item-cell {
    font-size: 13px;
  }

  .train-number {
    font-size: 14px;
  }

  .station-name {
    font-size: 13px;
  }

  .train-time {
    font-size: 16px;
  }

  .train-duration {
    font-size: 12px;
  }

  .seat-info {
    font-size: 13px;
  }
}

/* 响应式设计 - 手机（卡片式布局） */
@media (max-width: 768px) {
  .train-item {
    display: flex;
    flex-direction: column;
    gap: 15px;
    padding: 15px;
    border-radius: 6px;
    margin-bottom: 10px;
  }
  
  .train-reserve-cell {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .train-item {
    padding: 12px;
    gap: 12px;
  }
  
  .train-number {
    font-size: 15px;
  }
  
  .train-time {
    font-size: 18px;
  }
  
  .station-name {
    font-size: 13px;
  }
}
</style>
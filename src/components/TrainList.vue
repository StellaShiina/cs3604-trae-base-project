<template>
  <div class="train-list">
    <div class="train-list-header">
      <div class="col train-no">车次</div>
      <div class="col station">出发站<br>到达站</div>
      <div class="col time">出发时间<br>到达时间</div>
      <div class="col duration">历时</div>
      <div class="col seat" v-for="type in seatTypes" :key="type">{{ type }}</div>
      <div class="col action">备注</div>
    </div>

    <div v-if="trains.length === 0" class="no-data">
      暂无符合条件的车次
    </div>

    <div v-else class="train-items">
      <div v-for="train in trains" :key="train.trainNo" class="train-item">
        <div class="col train-no">
          <span class="number">{{ train.trainNo }}</span>
        </div>
        <div class="col station">
          <div class="start">
            <span class="icon start-icon">始</span>
            {{ train.startStation }}
          </div>
          <div class="end">
            <span class="icon end-icon">终</span>
            {{ train.endStation }}
          </div>
        </div>
        <div class="col time">
          <div class="start-time">{{ train.startTime }}</div>
          <div class="end-time">{{ train.endTime }}</div>
        </div>
        <div class="col duration">
          {{ train.duration }}
          <div class="day-diff" v-if="train.dayDiff">次日到达</div>
        </div>
        
        <!-- 动态渲染席别 -->
        <div class="col seat" v-for="type in seatTypes" :key="type">
          <div v-if="getSeatInfo(train, type)" class="seat-info">
             <div class="price">¥{{ getSeatInfo(train, type)?.price }}</div>
             <div class="count" :class="{ 'has-ticket': getSeatInfo(train, type)?.count > 0 }">
               {{ formatCount(getSeatInfo(train, type)?.count) }}
             </div>
          </div>
          <div v-else class="no-seat">--</div>
        </div>

        <div class="col action">
          <el-button type="primary" size="small" @click="$emit('reserve', train)">预订</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Train } from '../services/trainService'

const props = defineProps<{
  trains: Train[]
}>()

defineEmits<{
  (e: 'reserve', train: Train): void
}>()

// 定义显示的席别列（实际项目中可能需要动态获取）
const seatTypes = ['商务座', '一等座', '二等座', '硬卧', '硬座', '无座']

const getSeatInfo = (train: Train, typeName: string) => {
  return train.seatTypes.find(s => s.type === typeName)
}

const formatCount = (count: number | undefined) => {
  if (count === undefined) return '--'
  if (count === 0) return '无'
  if (count > 20) return '有'
  return count
}
</script>

<style scoped>
.train-list {
  border: 1px solid #ddd;
  background: #fff;
}

.train-list-header {
  background: #f8f9fa;
  height: 50px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #eee;
  font-size: 14px;
  color: #666;
  text-align: center;
}

.train-item {
  display: flex;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #eee;
  font-size: 14px;
  text-align: center;
}

.train-item:hover {
  background-color: #f1f8ff;
}

.col {
  padding: 0 10px;
}

.train-no { width: 100px; font-weight: bold; font-size: 16px; }
.station { width: 120px; text-align: left; }
.time { width: 100px; font-weight: bold; }
.duration { width: 100px; }
.seat { flex: 1; min-width: 80px; }
.action { width: 100px; }

.start-time { font-size: 18px; color: #333; }
.end-time { font-size: 16px; color: #999; }

.icon {
  display: inline-block;
  width: 16px;
  height: 16px;
  line-height: 16px;
  text-align: center;
  border-radius: 2px;
  font-size: 12px;
  margin-right: 5px;
  color: #fff;
}
.start-icon { background-color: #fa8c16; }
.end-icon { background-color: #52c41a; }

.seat-info .price { color: #f60; font-weight: bold; }
.seat-info .count { color: #333; margin-top: 4px; }
.seat-info .count.has-ticket { color: #28a745; font-weight: bold; }

.no-data {
  padding: 40px;
  text-align: center;
  color: #999;
}
</style>

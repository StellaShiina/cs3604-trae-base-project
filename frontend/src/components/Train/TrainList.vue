<template>
  <div class="train-list">
    <!-- 查询结果提示信息 - 始终显示 -->
    <div v-if="departureCity && arrivalCity" class="train-list-info">
      <div class="train-list-summary">
        <span class="summary-route">{{ departureCity }} → {{ arrivalCity }} </span>
        <span class="summary-date">({{ formatDate(departureDate) }})</span>
        <span class="summary-count"> 共{{ sortedTrains.length }}个车次</span>
        <span class="summary-transfer">您可使用<span class="transfer-highlight">中转换乘</span>功能，查询途中换乘一次的部分列车余票情况。</span>
      </div>
      <div class="train-list-hints">
        <label class="hint-checkbox">
          <input type="checkbox" />
          <span>显示折扣车次</span>
        </label>
        <label class="hint-checkbox">
          <input type="checkbox" />
          <span>显示积分兑换车次</span>
        </label>
        <label class="hint-checkbox">
          <input type="checkbox" />
          <span>显示全部可预订车次</span>
        </label>
      </div>
    </div>
    
    <div class="train-list-container">
      <div class="train-list-header">
        <div class="train-list-header-cell">车次</div>
        <div class="train-list-header-cell">
          出发站
          <br />
          到达站
        </div>
        <div class="train-list-header-cell">
          <span 
            class="header-line sortable-line"
            @click="handleSort('departureTime')"
          >
            出发时间 
            <span class="sort-icon" :class="getSortIconClass('departureTime')">
              {{ getSortIcon('departureTime') }}
            </span>
          </span>
          <span 
            class="header-line sortable-line"
            @click="handleSort('arrivalTime')"
          >
            到达时间 
            <span class="sort-icon" :class="getSortIconClass('arrivalTime')">
              {{ getSortIcon('arrivalTime', true) }}
            </span>
          </span>
        </div>
        <div 
          class="train-list-header-cell sortable"
          @click="handleSort('duration')"
        >
          <span class="header-line">
            历时 
            <span class="sort-icon" :class="getSortIconClass('duration')">
              {{ getSortIcon('duration') }}
            </span>
          </span>
        </div>
        <div class="train-list-header-cell">
          商务座
          <br />
          特等座
        </div>
        <div class="train-list-header-cell">
          优选
          <br />
          一等座
        </div>
        <div class="train-list-header-cell">一等座</div>
        <div class="train-list-header-cell">
          二等座
          <br />
          二等包座
        </div>
        <div class="train-list-header-cell">
          高级
          <br />
          软卧
        </div>
        <div class="train-list-header-cell">
          软卧/动卧
          <br />
          一等卧
        </div>
        <div class="train-list-header-cell">
          硬卧
          <br />
          二等卧
        </div>
        <div class="train-list-header-cell">软座</div>
        <div class="train-list-header-cell">硬座</div>
        <div class="train-list-header-cell">无座</div>
        <div class="train-list-header-cell">其他</div>
        <div class="train-list-header-cell">备注</div>
      </div>

      <div v-if="sortedTrains.length === 0" class="train-list-empty">
        <div class="train-list-empty-icon">🚄</div>
        <div class="train-list-empty-text">暂无符合条件的车次</div>
        <div class="train-list-empty-hint">请尝试修改筛选条件或查询日期</div>
      </div>
      <div v-else class="train-list-body">
        <TrainListItem
          v-for="(train, index) in sortedTrains"
          :key="train.trainNo"
          :train="train"
          :row-index="index"
          :is-logged-in="isLoggedIn"
          :query-timestamp="queryTimestamp"
          @reserve="onReserve"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import TrainListItem from './TrainListItem.vue';

const props = defineProps<{
  trains: any[];
  isLoggedIn: boolean;
  queryTimestamp: string;
  departureCity?: string;
  arrivalCity?: string;
  departureDate?: string;
}>();

const emit = defineEmits<{
  (e: 'reserve', trainNo: string, departureStation: string, arrivalStation: string, departureDate: string): void;
}>();

type SortField = 'departureTime' | 'arrivalTime' | 'duration' | null;
type SortOrder = 'asc' | 'desc';

const sortField = ref<SortField>(null);
const sortOrder = ref<SortOrder>('desc');

const handleSort = (field: SortField) => {
  if (sortField.value === field) {
    // 如果点击相同字段，切换排序顺序
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    // 如果点击新字段，设置为升序
    sortField.value = field;
    sortOrder.value = 'asc';
  }
};

const sortedTrains = computed(() => {
  const trains = [...props.trains];
  if (!sortField.value) return trains;

  return trains.sort((a, b) => {
    let comparison = 0;
    if (sortField.value === 'departureTime') {
      comparison = (a.departureTime || '').localeCompare(b.departureTime || '');
    } else if (sortField.value === 'arrivalTime') {
      comparison = (a.arrivalTime || '').localeCompare(b.arrivalTime || '');
    } else if (sortField.value === 'duration') {
      comparison = (a.duration || 0) - (b.duration || 0);
    }

    return sortOrder.value === 'asc' ? comparison : -comparison;
  });
});

const formatDate = (dateStr: string | undefined) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const weekday = weekdays[date.getDay()];
  return `${month}月${day}日 ${weekday}`;
};

const getSortIcon = (field: SortField, isArrival: boolean = false) => {
  if (sortField.value !== field) {
    return isArrival ? '▼' : '▲';
  }
  return sortOrder.value === 'asc' ? '▲' : '▼';
};

const getSortIconClass = (field: SortField) => {
  if (sortField.value !== field) {
    return 'neutral';
  }
  return sortOrder.value;
};

const onReserve = (trainNo: string, departureStation: string, arrivalStation: string, departureDate: string) => {
  emit('reserve', trainNo, departureStation, arrivalStation, departureDate);
};
</script>

<style scoped lang="scss">
/* 车次列表区域样式 */
.train-list {
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
}

/* 查询结果提示信息 */
.train-list-info {
  padding: 12px 16px;
  background-color: #ffffff;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.train-list-summary {
  font-size: 13px;
  color: #333333;
  display: flex;
  align-items: center;
  gap: 4px;
}

.summary-route {
  font-weight: 600;
  color: #333333;
}

.summary-date {
  color: #000000;
}

.summary-count {
  color: #000000;
  font-weight: 600;
}

.summary-transfer {
  color: #333333;
  font-weight: 400;
  margin-left: 20px;
}

.transfer-highlight {
  color: #ff7700;
  font-weight: 500;
}

.train-list-hints {
  display: flex;
  gap: 16px;
  align-items: center;
}

.hint-checkbox {
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  font-size: 12px;
  color: #333333;
  user-select: none;
  
  input[type="checkbox"] {
    width: 14px;
    height: 14px;
    cursor: pointer;
    margin: 0;
  }
  
  &:hover {
    color: #2196f3;
  }
}

.train-list-container {
  width: 100%;
}

/* 列表表头 */
.train-list-header {
  display: grid;
  grid-template-columns: 80px 100px 80px 70px repeat(11, minmax(50px, 1fr)) 80px;
  gap: 0;
  padding: 0px 0px;
  background: linear-gradient(to bottom, #3699d6 0%, #187ac1 100%);
  border-bottom: 2px solid #3466a0;
  font-weight: 600;
  font-size: 13px;
  color: white;
  align-items: center;
  line-height: 1.3;
}

.train-list-header-cell {
  text-align: center;
  white-space: normal;
  position: relative;
  padding: 4px 3px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  line-height: 1.5;
  min-height: 32px;
  gap: 2px;
  border-right: 1px solid #2270a4;

  &:last-child {
    border-right: none;
  }

  &.align-left {
    align-items: flex-start;
  }

  &.sortable {
    cursor: pointer;
    user-select: none;
    transition: background-color 0.2s;
    padding: 4px;
    border-radius: 0px;
    flex-direction: column;
    gap: 3px;

    &:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }

    &:active {
      background-color: rgba(255, 255, 255, 0.2);
    }
  }
}

.header-line {
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 3px;
}

.sortable-line {
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 2px;
  transition: background-color 0.2s;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  &:active {
    background-color: rgba(255, 255, 255, 0.2);
  }
}

/* 排序图标 */
.sort-icon {
  display: inline-block;
  font-size: 10px;
  margin-left: 2px;
  opacity: 0.7;

  &.neutral {
    opacity: 0.4;
  }

  &.asc {
    opacity: 1;
    color: #ffd700;
  }

  &.desc {
    opacity: 1;
    color: #ffd700;
  }
}

/* 列表主体 */
.train-list-body {
  background-color: #ffffff;
  position: relative;
}

/* 空状态 */
.train-list-empty {
  padding: 60px 20px;
  text-align: center;
  color: #999999;
}

.train-list-empty-icon {
  font-size: 48px;
  margin-bottom: 15px;
  opacity: 0.5;
}

.train-list-empty-text {
  font-size: 16px;
  color: #666666;
  margin-bottom: 10px;
}

.train-list-empty-hint {
  font-size: 14px;
  color: #999999;
}

/* 响应式设计 - 平板 */
@media (max-width: 1024px) {
  .train-list-header {
    grid-template-columns: 70px 160px 110px 110px 90px repeat(5, minmax(60px, 1fr)) 90px;
    gap: 8px;
    padding: 12px 15px;
    font-size: 12px;
  }
}

/* 响应式设计 - 手机 */
@media (max-width: 768px) {
  .train-list {
    border-radius: 6px;
  }

  .train-list-header {
    display: none; /* 在手机上隐藏表头，改用卡片式布局 */
  }

  .train-list-empty {
    padding: 40px 15px;
  }

  .train-list-empty-icon {
    font-size: 40px;
  }

  .train-list-empty-text {
    font-size: 15px;
  }

  .train-list-empty-hint {
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .train-list-empty {
    padding: 30px 10px;
  }

  .train-list-empty-icon {
    font-size: 36px;
  }

  .train-list-empty-text {
    font-size: 14px;
  }

  .train-list-empty-hint {
    font-size: 12px;
  }
}
</style>
<template>
  <div class="ticket-search">
    <!-- 搜索表单 -->
    <div class="search-form-container">
      <div class="search-form">
        <h2>车票查询</h2>
        
        <form @submit.prevent="searchTickets" class="search-inputs">
          <div class="input-row">
            <div class="input-group">
              <label>出发地</label>
              <select v-model="searchForm.fromStation" required>
                <option value="">请选择出发地</option>
                <option v-for="station in stations" :key="station.code" :value="station.code">
                  {{ station.name }}
                </option>
              </select>
            </div>
            
            <div class="swap-btn-container">
              <button type="button" @click="swapStations" class="swap-btn">
                ⇄
              </button>
            </div>
            
            <div class="input-group">
              <label>目的地</label>
              <select v-model="searchForm.toStation" required>
                <option value="">请选择目的地</option>
                <option v-for="station in stations" :key="station.code" :value="station.code">
                  {{ station.name }}
                </option>
              </select>
            </div>
          </div>
          
          <div class="input-row">
            <div class="input-group">
              <label>出发日期</label>
              <input 
                type="date" 
                v-model="searchForm.departDate" 
                :min="today"
                required
              />
            </div>
            
            <div class="input-group">
              <label>座位类型</label>
              <select v-model="searchForm.seatType">
                <option value="">不限</option>
                <option value="business">商务座</option>
                <option value="first">一等座</option>
                <option value="second">二等座</option>
                <option value="hard_sleeper">硬卧</option>
                <option value="soft_sleeper">软卧</option>
              </select>
            </div>
          </div>
          
          <div class="search-actions">
            <button type="submit" class="search-btn" :disabled="isSearching">
              {{ isSearching ? '查询中...' : '查询' }}
            </button>
          </div>
        </form>
      </div>
    </div>
    
    <!-- 搜索结果 -->
    <div class="search-results" v-if="hasSearched">
      <div class="results-header">
        <h3>查询结果</h3>
        <div class="result-info">
          <span v-if="searchResults.length > 0">
            找到 {{ searchResults.length }} 趟列车
          </span>
          <span v-else class="no-results">
            未找到符合条件的列车
          </span>
        </div>
      </div>
      
      <div v-if="searchResults.length > 0" class="train-list">
        <div class="train-header">
          <div class="col-train">车次</div>
          <div class="col-route">出发/到达</div>
          <div class="col-time">时间</div>
          <div class="col-duration">历时</div>
          <div class="col-seats">座位</div>
          <div class="col-price">票价</div>
          <div class="col-action">操作</div>
        </div>
        
        <div 
          v-for="train in searchResults" 
          :key="train.trainNumber"
          class="train-item"
        >
          <div class="col-train">
            <div class="train-number">{{ train.trainNumber }}</div>
            <div class="train-type">{{ getTrainType(train.trainNumber) }}</div>
          </div>
          
          <div class="col-route">
            <div class="station-info">
              <div class="from-station">{{ getStationName(train.fromStation) }}</div>
              <div class="to-station">{{ getStationName(train.toStation) }}</div>
            </div>
          </div>
          
          <div class="col-time">
            <div class="depart-time">{{ train.departTime }}</div>
            <div class="arrive-time">{{ train.arriveTime }}</div>
          </div>
          
          <div class="col-duration">
            {{ train.duration }}
          </div>
          
          <div class="col-seats">
            <div class="seat-info">
              <div v-for="seat in train.seats" :key="seat.type" class="seat-item">
                <span class="seat-type">{{ getSeatTypeName(seat.type) }}</span>
                <span class="seat-count" :class="{ 'no-seat': seat.available === 0 }">
                  {{ seat.available > 0 ? seat.available : '无' }}
                </span>
              </div>
            </div>
          </div>
          
          <div class="col-price">
            <div class="price-info">
              <div v-for="price in train.prices" :key="price.type" class="price-item">
                <span class="price-type">{{ getSeatTypeName(price.type) }}</span>
                <span class="price-value">¥{{ price.price }}</span>
              </div>
            </div>
          </div>
          
          <div class="col-action">
            <button 
              class="book-btn"
              @click="bookTicket(train)"
              :disabled="!hasAvailableSeats(train)"
            >
              {{ hasAvailableSeats(train) ? '预订' : '无票' }}
            </button>
          </div>
        </div>
      </div>
      
      <div v-else class="empty-results">
        <div class="empty-icon">🚄</div>
        <p>抱歉，没有找到符合条件的列车</p>
        <p class="empty-tip">请尝试调整查询条件</p>
      </div>
    </div>

    <!-- 订票流程弹窗 -->
    <BookingFlow 
      v-if="showBookingFlow && selectedTrain"
      :train-info="selectedTrain"
      @close="closeBookingFlow"
      @booking-complete="handleBookingComplete"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import BookingFlow from './BookingFlow.vue'

export default {
  name: 'TicketSearch',
  components: {
    BookingFlow
  },
  setup() {
    const searchForm = ref({
      fromStation: '',
      toStation: '',
      departDate: '',
      seatType: ''
    })
    
    const searchResults = ref([])
    const isSearching = ref(false)
    const hasSearched = ref(false)
    
    const stations = ref([
      { code: 'BJP', name: '北京' },
      { code: 'SHH', name: '上海' },
      { code: 'GZN', name: '广州' },
      { code: 'SZN', name: '深圳' },
      { code: 'HZH', name: '杭州' },
      { code: 'NJH', name: '南京' },
      { code: 'TJN', name: '天津' },
      { code: 'CQW', name: '重庆' },
      { code: 'CDW', name: '成都' },
      { code: 'XAY', name: '西安' },
      { code: 'WUH', name: '武汉' },
      { code: 'CSQ', name: '长沙' }
    ])
    
    const today = computed(() => {
      const date = new Date()
      return date.toISOString().split('T')[0]
    })
    
    const swapStations = () => {
      const temp = searchForm.value.fromStation
      searchForm.value.fromStation = searchForm.value.toStation
      searchForm.value.toStation = temp
    }
    
    const getStationName = (code) => {
      const station = stations.value.find(s => s.code === code)
      return station ? station.name : code
    }
    
    const getTrainType = (trainNumber) => {
      const firstChar = trainNumber.charAt(0)
      const typeMap = {
        'G': '高速',
        'D': '动车',
        'C': '城际',
        'Z': '直达',
        'T': '特快',
        'K': '快速'
      }
      return typeMap[firstChar] || '普通'
    }
    
    const getSeatTypeName = (type) => {
      const typeMap = {
        'business': '商务座',
        'first': '一等座',
        'second': '二等座',
        'hard_sleeper': '硬卧',
        'soft_sleeper': '软卧'
      }
      return typeMap[type] || type
    }
    
    const hasAvailableSeats = (train) => {
      return train.seats.some(seat => seat.available > 0)
    }
    
    const searchTickets = async () => {
      if (searchForm.value.fromStation === searchForm.value.toStation) {
        alert('出发地和目的地不能相同')
        return
      }
      
      isSearching.value = true
      hasSearched.value = true
      
      try {
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        // 模拟搜索结果
        searchResults.value = [
          {
            trainNumber: 'G123',
            fromStation: searchForm.value.fromStation,
            toStation: searchForm.value.toStation,
            departTime: '08:00',
            arriveTime: '12:30',
            duration: '4小时30分',
            seats: [
              { type: 'business', available: 5 },
              { type: 'first', available: 12 },
              { type: 'second', available: 28 }
            ],
            prices: [
              { type: 'business', price: 1748 },
              { type: 'first', price: 933 },
              { type: 'second', price: 553 }
            ]
          },
          {
            trainNumber: 'D456',
            fromStation: searchForm.value.fromStation,
            toStation: searchForm.value.toStation,
            departTime: '14:30',
            arriveTime: '19:45',
            duration: '5小时15分',
            seats: [
              { type: 'first', available: 8 },
              { type: 'second', available: 0 }
            ],
            prices: [
              { type: 'first', price: 623 },
              { type: 'second', price: 373 }
            ]
          },
          {
            trainNumber: 'G789',
            fromStation: searchForm.value.fromStation,
            toStation: searchForm.value.toStation,
            departTime: '16:20',
            arriveTime: '20:05',
            duration: '3小时45分',
            seats: [
              { type: 'business', available: 2 },
              { type: 'first', available: 15 },
              { type: 'second', available: 32 }
            ],
            prices: [
              { type: 'business', price: 1748 },
              { type: 'first', price: 933 },
              { type: 'second', price: 553 }
            ]
          }
        ]
      } catch (error) {
        console.error('搜索失败:', error)
        searchResults.value = []
      } finally {
        isSearching.value = false
      }
    }
    
    const showBookingFlow = ref(false)
    const selectedTrain = ref(null)

    const bookTicket = (train) => {
      console.log('预订车票:', train)
      selectedTrain.value = {
        ...train,
        departDate: searchForm.value.departDate
      }
      showBookingFlow.value = true
    }

    const closeBookingFlow = () => {
      showBookingFlow.value = false
      selectedTrain.value = null
    }

    const handleBookingComplete = (orderData) => {
      console.log('订票完成:', orderData)
      alert('订票成功！订单信息已保存。')
      closeBookingFlow()
    }
    
    onMounted(() => {
      // 设置默认日期为今天
      searchForm.value.departDate = today.value
    })
    
    return {
      searchForm,
      searchResults,
      isSearching,
      hasSearched,
      stations,
      today,
      showBookingFlow,
      selectedTrain,
      swapStations,
      getStationName,
      getTrainType,
      getSeatTypeName,
      hasAvailableSeats,
      searchTickets,
      bookTicket,
      closeBookingFlow,
      handleBookingComplete
    }
  }
}
</script>

<style scoped>
.ticket-search {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.search-form-container {
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
}

.search-form {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  max-width: 800px;
  width: 100%;
}

.search-form h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
  font-size: 28px;
  font-weight: 600;
}

.search-inputs {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.input-row {
  display: flex;
  gap: 20px;
  align-items: end;
}

.input-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-group label {
  font-weight: 500;
  color: #555;
  font-size: 14px;
}

.input-group select,
.input-group input {
  padding: 12px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s ease;
}

.input-group select:focus,
.input-group input:focus {
  outline: none;
  border-color: #667eea;
}

.swap-btn-container {
  display: flex;
  align-items: center;
  padding-bottom: 12px;
}

.swap-btn {
  background: #f8f9fa;
  border: 2px solid #e1e5e9;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 18px;
  color: #667eea;
  transition: all 0.3s ease;
}

.swap-btn:hover {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.search-actions {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

.search-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 15px 40px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.search-btn:hover:not(:disabled) {
  transform: translateY(-2px);
}

.search-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.search-results {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.results-header {
  background: #f8f9fa;
  padding: 20px 30px;
  border-bottom: 1px solid #e1e5e9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.results-header h3 {
  margin: 0;
  color: #333;
  font-size: 20px;
}

.result-info {
  color: #666;
  font-size: 14px;
}

.no-results {
  color: #ff6b6b;
}

.train-list {
  overflow-x: auto;
}

.train-header {
  display: grid;
  grid-template-columns: 100px 150px 120px 100px 200px 150px 80px;
  gap: 20px;
  padding: 15px 30px;
  background: #f8f9fa;
  border-bottom: 1px solid #e1e5e9;
  font-weight: 600;
  color: #555;
  font-size: 14px;
}

.train-item {
  display: grid;
  grid-template-columns: 100px 150px 120px 100px 200px 150px 80px;
  gap: 20px;
  padding: 20px 30px;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s ease;
}

.train-item:hover {
  background: #f8f9fa;
}

.train-item:last-child {
  border-bottom: none;
}

.col-train {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.train-number {
  font-weight: 600;
  color: #333;
  font-size: 16px;
}

.train-type {
  font-size: 12px;
  color: #666;
  background: #e9ecef;
  padding: 2px 6px;
  border-radius: 4px;
  text-align: center;
}

.station-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.from-station {
  font-weight: 600;
  color: #333;
}

.to-station {
  color: #666;
}

.col-time {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.depart-time {
  font-weight: 600;
  color: #333;
  font-size: 16px;
}

.arrive-time {
  color: #666;
}

.col-duration {
  display: flex;
  align-items: center;
  color: #666;
  font-size: 14px;
}

.seat-info,
.price-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.seat-item,
.price-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.seat-type,
.price-type {
  color: #666;
}

.seat-count {
  font-weight: 600;
  color: #52c41a;
}

.seat-count.no-seat {
  color: #ff4d4f;
}

.price-value {
  font-weight: 600;
  color: #ff6b35;
}

.book-btn {
  background: #52c41a;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.3s ease;
}

.book-btn:hover:not(:disabled) {
  background: #73d13d;
}

.book-btn:disabled {
  background: #d9d9d9;
  color: #999;
  cursor: not-allowed;
}

.empty-results {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-results p {
  margin: 8px 0;
  color: #666;
}

.empty-tip {
  font-size: 14px;
  color: #999;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .ticket-search {
    padding: 10px;
  }
  
  .search-form {
    padding: 20px;
  }
  
  .input-row {
    flex-direction: column;
    gap: 15px;
  }
  
  .swap-btn-container {
    order: -1;
    padding-bottom: 0;
    justify-content: center;
  }
  
  .train-header,
  .train-item {
    grid-template-columns: 1fr;
    gap: 10px;
    text-align: left;
  }
  
  .train-header {
    display: none;
  }
  
  .train-item {
    display: block;
    padding: 15px;
  }
  
  .col-train,
  .col-route,
  .col-time,
  .col-duration,
  .col-seats,
  .col-price,
  .col-action {
    margin-bottom: 10px;
  }
  
  .col-train::before { content: "车次: "; font-weight: 600; }
  .col-route::before { content: "路线: "; font-weight: 600; }
  .col-time::before { content: "时间: "; font-weight: 600; }
  .col-duration::before { content: "历时: "; font-weight: 600; }
  .col-seats::before { content: "座位: "; font-weight: 600; }
  .col-price::before { content: "票价: "; font-weight: 600; }
}

/* 更小屏幕的额外优化 */
@media (max-width: 480px) {
  .search-form {
    padding: 15px;
  }
  
  .search-form h2 {
    font-size: 20px;
  }
  
  .input-group label {
    font-size: 13px;
  }
  
  .input-group select,
  .input-group input {
    font-size: 14px;
    padding: 10px;
  }
  
  .search-btn {
    font-size: 14px;
    padding: 12px 20px;
  }
  
  .train-number {
    font-size: 16px;
  }
  
  .from-station, .to-station {
    font-size: 14px;
  }
  
  .depart-time, .arrive-time {
    font-size: 14px;
  }
}
</style>
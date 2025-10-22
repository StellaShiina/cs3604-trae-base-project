<template>
  <div class="booking-flow">
    <div class="booking-container">
      <!-- 步骤指示器 -->
      <div class="step-indicator">
        <div class="step" :class="{ active: currentStep >= 1, completed: currentStep > 1 }">
          <div class="step-number">1</div>
          <div class="step-title">选择乘车人</div>
        </div>
        <div class="step-line" :class="{ active: currentStep > 1 }"></div>
        <div class="step" :class="{ active: currentStep >= 2, completed: currentStep > 2 }">
          <div class="step-number">2</div>
          <div class="step-title">选择座位</div>
        </div>
        <div class="step-line" :class="{ active: currentStep > 2 }"></div>
        <div class="step" :class="{ active: currentStep >= 3, completed: currentStep > 3 }">
          <div class="step-number">3</div>
          <div class="step-title">确认支付</div>
        </div>
      </div>

      <!-- 车次信息 -->
      <div class="train-info-card">
        <div class="train-header">
          <h3>{{ trainInfo.trainNumber }}</h3>
          <span class="train-type">{{ getTrainType(trainInfo.trainNumber) }}</span>
        </div>
        <div class="route-info">
          <div class="station-time">
            <div class="station">{{ getStationName(trainInfo.fromStation) }}</div>
            <div class="time">{{ trainInfo.departTime }}</div>
          </div>
          <div class="duration">
            <div class="arrow">→</div>
            <div class="duration-text">{{ trainInfo.duration }}</div>
          </div>
          <div class="station-time">
            <div class="station">{{ getStationName(trainInfo.toStation) }}</div>
            <div class="time">{{ trainInfo.arriveTime }}</div>
          </div>
        </div>
        <div class="date-info">{{ formatDate(trainInfo.departDate) }}</div>
      </div>

      <!-- 步骤1: 选择乘车人 -->
      <div v-if="currentStep === 1" class="step-content">
        <div class="passenger-selection">
          <h4>选择乘车人</h4>
          <div class="passenger-list">
            <div 
              v-for="passenger in passengers" 
              :key="passenger.id"
              class="passenger-item"
              :class="{ selected: selectedPassengers.includes(passenger.id) }"
              @click="togglePassenger(passenger.id)"
            >
              <div class="passenger-info">
                <div class="name">{{ passenger.name }}</div>
                <div class="id-number">{{ passenger.idNumber }}</div>
                <div class="passenger-type">{{ passenger.type }}</div>
              </div>
              <div class="checkbox">
                <input 
                  type="checkbox" 
                  :checked="selectedPassengers.includes(passenger.id)"
                  @change="togglePassenger(passenger.id)"
                />
              </div>
            </div>
          </div>
          <div class="step-actions">
            <button @click="$emit('close')" class="btn-secondary">取消</button>
            <button 
              @click="nextStep" 
              class="btn-primary"
              :disabled="selectedPassengers.length === 0"
            >
              下一步
            </button>
          </div>
        </div>
      </div>

      <!-- 步骤2: 选择座位 -->
      <div v-if="currentStep === 2" class="step-content">
        <div class="seat-selection">
          <h4>选择座位类型</h4>
          <div class="seat-types">
            <div 
              v-for="seat in availableSeats" 
              :key="seat.type"
              class="seat-type-card"
              :class="{ selected: selectedSeatType === seat.type, disabled: seat.available === 0 }"
              @click="selectSeatType(seat.type)"
            >
              <div class="seat-type-name">{{ getSeatTypeName(seat.type) }}</div>
              <div class="seat-price">¥{{ getSeatPrice(seat.type) }}</div>
              <div class="seat-available">
                {{ seat.available > 0 ? `余${seat.available}张` : '无票' }}
              </div>
            </div>
          </div>

          <!-- 座位偏好 -->
          <div v-if="selectedSeatType" class="seat-preference">
            <h5>座位偏好</h5>
            <div class="preference-options">
              <label class="preference-item">
                <input type="radio" v-model="seatPreference" value="window" />
                <span>靠窗</span>
              </label>
              <label class="preference-item">
                <input type="radio" v-model="seatPreference" value="aisle" />
                <span>靠过道</span>
              </label>
              <label class="preference-item">
                <input type="radio" v-model="seatPreference" value="any" />
                <span>无要求</span>
              </label>
            </div>
          </div>

          <div class="step-actions">
            <button @click="prevStep" class="btn-secondary">上一步</button>
            <button 
              @click="nextStep" 
              class="btn-primary"
              :disabled="!selectedSeatType"
            >
              下一步
            </button>
          </div>
        </div>
      </div>

      <!-- 步骤3: 确认支付 -->
      <div v-if="currentStep === 3" class="step-content">
        <div class="payment-confirmation">
          <h4>订单确认</h4>
          
          <!-- 订单详情 -->
          <div class="order-details">
            <div class="detail-section">
              <h5>乘车人信息</h5>
              <div class="passenger-summary">
                <div 
                  v-for="passengerId in selectedPassengers" 
                  :key="passengerId"
                  class="passenger-summary-item"
                >
                  <span class="name">{{ getPassengerName(passengerId) }}</span>
                  <span class="seat-info">{{ getSeatTypeName(selectedSeatType) }}</span>
                  <span class="price">¥{{ getSeatPrice(selectedSeatType) }}</span>
                </div>
              </div>
            </div>

            <div class="detail-section">
              <h5>费用明细</h5>
              <div class="cost-breakdown">
                <div class="cost-item">
                  <span>票价 ({{ selectedPassengers.length }}人)</span>
                  <span>¥{{ totalTicketPrice }}</span>
                </div>
                <div class="cost-item">
                  <span>服务费</span>
                  <span>¥5</span>
                </div>
                <div class="cost-item total">
                  <span>总计</span>
                  <span>¥{{ totalPrice }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 支付方式 -->
          <div class="payment-methods">
            <h5>支付方式</h5>
            <div class="payment-options">
              <label class="payment-item">
                <input type="radio" v-model="paymentMethod" value="alipay" />
                <div class="payment-info">
                  <span class="payment-name">支付宝</span>
                  <span class="payment-icon">💰</span>
                </div>
              </label>
              <label class="payment-item">
                <input type="radio" v-model="paymentMethod" value="wechat" />
                <div class="payment-info">
                  <span class="payment-name">微信支付</span>
                  <span class="payment-icon">💚</span>
                </div>
              </label>
              <label class="payment-item">
                <input type="radio" v-model="paymentMethod" value="bank" />
                <div class="payment-info">
                  <span class="payment-name">银行卡</span>
                  <span class="payment-icon">💳</span>
                </div>
              </label>
            </div>
          </div>

          <div class="step-actions">
            <button @click="prevStep" class="btn-secondary">上一步</button>
            <button 
              @click="confirmPayment" 
              class="btn-primary payment-btn"
              :disabled="!paymentMethod || isProcessing"
            >
              {{ isProcessing ? '处理中...' : `确认支付 ¥${totalPrice}` }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'

export default {
  name: 'BookingFlow',
  props: {
    trainInfo: {
      type: Object,
      required: true
    }
  },
  emits: ['close', 'booking-complete'],
  setup(props, { emit }) {
    const currentStep = ref(1)
    const selectedPassengers = ref([])
    const selectedSeatType = ref('')
    const seatPreference = ref('any')
    const paymentMethod = ref('')
    const isProcessing = ref(false)
    
    const passengers = ref([
      {
        id: 1,
        name: '张三',
        idNumber: '110101199001011234',
        type: '成人'
      },
      {
        id: 2,
        name: '李四',
        idNumber: '110101199502021234',
        type: '成人'
      }
    ])

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

    const availableSeats = computed(() => {
      return props.trainInfo.seats || []
    })

    const totalTicketPrice = computed(() => {
      if (!selectedSeatType.value || selectedPassengers.value.length === 0) return 0
      const price = getSeatPrice(selectedSeatType.value)
      return price * selectedPassengers.value.length
    })

    const totalPrice = computed(() => {
      return totalTicketPrice.value + 5 // 加上服务费
    })

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

    const getSeatPrice = (type) => {
      const price = props.trainInfo.prices?.find(p => p.type === type)
      return price ? price.price : 0
    }

    const getPassengerName = (id) => {
      const passenger = passengers.value.find(p => p.id === id)
      return passenger ? passenger.name : ''
    }

    const formatDate = (dateStr) => {
      const date = new Date(dateStr)
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      })
    }

    const togglePassenger = (id) => {
      const index = selectedPassengers.value.indexOf(id)
      if (index > -1) {
        selectedPassengers.value.splice(index, 1)
      } else {
        selectedPassengers.value.push(id)
      }
    }

    const selectSeatType = (type) => {
      const seat = availableSeats.value.find(s => s.type === type)
      if (seat && seat.available > 0) {
        selectedSeatType.value = type
      }
    }

    const nextStep = () => {
      if (currentStep.value < 3) {
        currentStep.value++
      }
    }

    const prevStep = () => {
      if (currentStep.value > 1) {
        currentStep.value--
      }
    }

    const confirmPayment = async () => {
      isProcessing.value = true
      
      try {
        // 模拟支付处理
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // 创建订单数据
        const orderData = {
          trainInfo: props.trainInfo,
          passengers: selectedPassengers.value.map(id => 
            passengers.value.find(p => p.id === id)
          ),
          seatType: selectedSeatType.value,
          seatPreference: seatPreference.value,
          paymentMethod: paymentMethod.value,
          totalPrice: totalPrice.value,
          orderTime: new Date().toISOString()
        }
        
        console.log('订单创建成功:', orderData)
        emit('booking-complete', orderData)
        
      } catch (error) {
        console.error('支付失败:', error)
        alert('支付失败，请重试')
      } finally {
        isProcessing.value = false
      }
    }

    return {
      currentStep,
      selectedPassengers,
      selectedSeatType,
      seatPreference,
      paymentMethod,
      isProcessing,
      passengers,
      availableSeats,
      totalTicketPrice,
      totalPrice,
      getStationName,
      getTrainType,
      getSeatTypeName,
      getSeatPrice,
      getPassengerName,
      formatDate,
      togglePassenger,
      selectSeatType,
      nextStep,
      prevStep,
      confirmPayment
    }
  }
}
</script>

<style scoped>
.booking-flow {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.booking-container {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 30px;
}

/* 步骤指示器 */
.step-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 30px;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e0e0e0;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  transition: all 0.3s ease;
}

.step.active .step-number {
  background: #007bff;
  color: white;
}

.step.completed .step-number {
  background: #28a745;
  color: white;
}

.step-title {
  font-size: 12px;
  color: #666;
  text-align: center;
}

.step.active .step-title {
  color: #007bff;
  font-weight: 500;
}

.step-line {
  width: 80px;
  height: 2px;
  background: #e0e0e0;
  margin: 0 20px;
  transition: all 0.3s ease;
}

.step-line.active {
  background: #007bff;
}

/* 车次信息卡片 */
.train-info-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
}

.train-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.train-header h3 {
  margin: 0;
  color: #333;
}

.train-type {
  background: #007bff;
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.route-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.station-time {
  text-align: center;
}

.station-time .station {
  font-size: 18px;
  font-weight: 500;
  color: #333;
}

.station-time .time {
  font-size: 16px;
  color: #666;
  margin-top: 5px;
}

.duration {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #666;
}

.arrow {
  font-size: 20px;
  margin-bottom: 5px;
}

.duration-text {
  font-size: 12px;
}

.date-info {
  text-align: center;
  color: #666;
  font-size: 14px;
}

/* 步骤内容 */
.step-content {
  margin-bottom: 30px;
}

.step-content h4 {
  margin-bottom: 20px;
  color: #333;
}

/* 乘车人选择 */
.passenger-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.passenger-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.passenger-item:hover {
  border-color: #007bff;
}

.passenger-item.selected {
  border-color: #007bff;
  background: #f0f8ff;
}

.passenger-info .name {
  font-weight: 500;
  margin-bottom: 5px;
}

.passenger-info .id-number {
  color: #666;
  font-size: 14px;
  margin-bottom: 5px;
}

.passenger-info .passenger-type {
  color: #007bff;
  font-size: 12px;
}

/* 座位选择 */
.seat-types {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.seat-type-card {
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.seat-type-card:hover:not(.disabled) {
  border-color: #007bff;
}

.seat-type-card.selected {
  border-color: #007bff;
  background: #f0f8ff;
}

.seat-type-card.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.seat-type-name {
  font-weight: 500;
  margin-bottom: 10px;
}

.seat-price {
  font-size: 18px;
  color: #007bff;
  font-weight: bold;
  margin-bottom: 5px;
}

.seat-available {
  font-size: 12px;
  color: #666;
}

.seat-preference {
  margin-top: 20px;
}

.seat-preference h5 {
  margin-bottom: 15px;
  color: #333;
}

.preference-options {
  display: flex;
  gap: 20px;
}

.preference-item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

/* 支付确认 */
.order-details {
  margin-bottom: 30px;
}

.detail-section {
  margin-bottom: 25px;
}

.detail-section h5 {
  margin-bottom: 15px;
  color: #333;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 5px;
}

.passenger-summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}

.cost-breakdown {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
}

.cost-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.cost-item.total {
  font-weight: bold;
  font-size: 18px;
  color: #007bff;
  border-top: 1px solid #e0e0e0;
  padding-top: 10px;
  margin-top: 10px;
  margin-bottom: 0;
}

.payment-methods h5 {
  margin-bottom: 15px;
  color: #333;
}

.payment-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.payment-item {
  display: flex;
  align-items: center;
  padding: 15px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.payment-item:hover {
  border-color: #007bff;
}

.payment-item:has(input:checked) {
  border-color: #007bff;
  background: #f0f8ff;
}

.payment-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-left: 10px;
}

.payment-name {
  font-weight: 500;
}

.payment-icon {
  font-size: 20px;
}

/* 操作按钮 */
.step-actions {
  display: flex;
  justify-content: space-between;
  gap: 15px;
  margin-top: 30px;
}

.btn-secondary, .btn-primary {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
}

.btn-primary {
  background: #007bff;
  color: white;
  flex: 1;
}

.btn-primary:hover:not(:disabled) {
  background: #0056b3;
}

.btn-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.payment-btn {
  font-weight: bold;
  font-size: 18px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .booking-container {
    width: 95%;
    padding: 20px;
    margin: 10px;
  }
  
  .step-indicator {
    flex-direction: column;
    gap: 10px;
  }
  
  .step-line {
    width: 2px;
    height: 30px;
    margin: 10px 0;
  }
  
  .route-info {
    flex-direction: column;
    gap: 10px;
  }
  
  .seat-types {
    grid-template-columns: 1fr;
  }
  
  .preference-options {
    flex-direction: column;
    gap: 10px;
  }
  
  .step-actions {
    flex-direction: column;
  }
}
</style>
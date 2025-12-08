<template>
  <Teleport to="body">
    <div v-if="isVisible" class="order-success-modal">
      <div class="success-modal-overlay"></div>
      <div class="success-modal-content">
        <div class="success-icon">✓</div>
        <h2 class="success-title">购买成功</h2>
        <p class="success-message">恭喜您，订单已确认！您的车票信息如下：</p>
        
        <div v-if="trainInfo" class="success-train-info">
          <h3 class="info-section-title">车次信息</h3>
          <p class="train-info-text">
            <span class="info-label">日期</span>
            <span class="info-value">{{ formatDate(trainInfo.departureDate) }}</span>
          </p>
          <p class="train-info-text">
            <span class="info-label">车次</span>
            <span class="info-value">{{ trainInfo.trainNo }}次</span>
          </p>
          <p class="train-info-text">
            <span class="info-label">行程</span>
            <span class="info-value">
              {{ trainInfo.departureStation }}站 {{ trainInfo.departureTime }}开 → {{ trainInfo.arrivalStation }}站 {{ trainInfo.arrivalTime }}到
            </span>
          </p>
        </div>
        
        <div v-if="tickets && tickets.length > 0" class="success-tickets-info">
          <h3 class="info-section-title">车票信息</h3>
          <table class="tickets-table">
            <thead>
              <tr>
                <th>乘客</th>
                <th>席别</th>
                <th>座位号</th>
                <th>票种</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(ticket, index) in tickets" :key="index">
                <td>{{ ticket.passengerName }}</td>
                <td>{{ ticket.seatType }}</td>
                <td class="seat-no-highlight">
                  {{ formatSeatInfoForDisplay(ticket.seatNo, ticket.carNo, ticket.seatType) }}
                </td>
                <td>{{ ticket.ticketType }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <p class="success-order-id">订单号：{{ orderId }}</p>
        
        <button class="success-confirm-button" @click="onClose">
          确认
        </button>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { formatSeatInfoForDisplay } from '../utils/seatNumberFormatter';

interface TicketInfo {
  passengerName: string;
  seatType: string;
  seatNo: string;
  carNo?: string;
  ticketType: string;
}

interface TrainInfo {
  trainNo: string;
  departureStation: string;
  arrivalStation: string;
  departureDate: string;
  departureTime: string;
  arrivalTime: string;
}

const props = defineProps<{
  isVisible: boolean;
  orderId: string;
  trainInfo?: TrainInfo;
  tickets?: TicketInfo[];
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const onClose = () => {
  emit('close');
};

const formatDate = (date: string) => {
  const d = new Date(date);
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const weekDay = weekDays[d.getDay()];
  return `${date}（${weekDay}）`;
};

onMounted(() => {
  console.log('🎉 OrderSuccessModal 渲染:', {
    isVisible: props.isVisible,
    orderId: props.orderId,
    hasTrainInfo: !!props.trainInfo,
    hasTickets: !!props.tickets,
    ticketsCount: props.tickets?.length || 0
  });
});
</script>

<style>
/* 购买成功提示弹窗样式 */
.order-success-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 3000;
  display: flex;
  justify-content: center;
  align-items: center;
}

.success-modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
}

.success-modal-content {
  position: relative;
  background-color: #ffffff;
  border-radius: 8px;
  padding: 40px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  min-width: 500px;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
}

.success-modal-content .success-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%);
  color: white;
  font-size: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
  animation: successPulse 0.6s ease-out;
}

@keyframes successPulse {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.success-modal-content .success-title {
  font-size: 24px;
  font-weight: bold;
  color: #333333;
  margin: 0 0 15px 0;
}

.success-order-id {
  font-size: 14px;
  color: #666666;
  margin: 20px 0 30px 0;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 4px;
  border-left: 4px solid #1e88e5;
}

.success-confirm-button {
  padding: 14px 60px;
  background: linear-gradient(to bottom, #ff9933 0%, #ff7700 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(255, 119, 0, 0.4);
  margin-top: 10px;
}

.success-confirm-button:hover {
  background: linear-gradient(to bottom, #ffaa44 0%, #ff8822 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(255, 119, 0, 0.5);
}

.success-message {
  font-size: 16px;
  color: #666666;
  margin: 0 0 20px 0;
}

.success-train-info,
.success-tickets-info {
  text-align: left;
  margin: 20px 0;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.info-section-title {
  font-size: 18px;
  font-weight: bold;
  color: #1976d2;
  margin: 0 0 15px 0;
  padding-bottom: 10px;
  border-bottom: 2px solid #1e88e5;
  display: flex;
  align-items: center;
}

.info-section-title::before {
  content: '🎫';
  margin-right: 8px;
  font-size: 20px;
}

.train-info-text {
  font-size: 15px;
  color: #333333;
  margin: 10px 0;
  line-height: 1.8;
  display: flex;
  align-items: center;
}

.info-label {
  font-weight: 600;
  color: #1976d2;
  margin-right: 12px;
  min-width: 60px;
  display: inline-block;
}

.info-value {
  color: #333333;
  font-weight: 500;
}

.tickets-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
  background-color: white;
  border-radius: 6px;
  overflow: hidden;
}

.tickets-table th {
  background: linear-gradient(to bottom, #42a5f5 0%, #1e88e5 100%);
  color: white;
  padding: 12px;
  text-align: center;
  font-weight: 600;
  font-size: 15px;
  border-bottom: none;
}

.tickets-table td {
  padding: 12px;
  border-bottom: 1px solid #e0e0e0;
  font-size: 15px;
  color: #333333;
  text-align: center;
}

.tickets-table tbody tr:hover {
  background-color: #f5f5f5;
  transition: background-color 0.2s;
}

.seat-no-highlight {
  color: #ff5722;
  font-weight: bold;
  font-size: 16px;
  background-color: #fff3e0;
  padding: 4px 8px;
  border-radius: 4px;
}
</style>

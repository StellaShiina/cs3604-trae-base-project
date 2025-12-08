<template>
  <div class="order-list-container">
    <div class="header">
      <el-button @click="$router.push('/')">Back to Home</el-button>
      <span>My Orders</span>
    </div>

    <el-tabs v-model="activeTab" @tab-click="handleTabClick">
      <el-tab-pane label="All" name="all" />
      <el-tab-pane label="Pending Payment" name="pending_payment" />
      <el-tab-pane label="Paid" name="paid" />
      <el-tab-pane label="Cancelled" name="cancelled" />
    </el-tabs>

    <div class="order-list">
      <el-card v-for="order in orders" :key="order.orderId" class="order-card">
        <template #header>
          <div class="card-header">
            <span>Order ID: {{ order.orderId }}</span>
            <el-tag :type="getStatusType(order.status)">{{ order.status }}</el-tag>
          </div>
        </template>
        <div class="order-info">
          <div><strong>Train:</strong> {{ order.trainNo }}</div>
          <div><strong>Route:</strong> {{ order.fromStation }} -> {{ order.toStation }}</div>
          <div><strong>Departure:</strong> {{ order.departTime }}</div>
          <div><strong>Price:</strong> ¥{{ order.totalPrice / 100 }}</div>
        </div>
        
        <div class="tickets">
          <div v-for="(ticket, idx) in order.tickets" :key="idx" class="ticket-item">
            <div class="ticket-info">
              <span>{{ ticket.passenger_name }} ({{ ticket.seat_type }})</span>
              <el-tag size="small" v-if="ticket.status !== 'active'" style="margin-left: 10px">{{ ticket.status }}</el-tag>
            </div>
            <el-button 
              v-if="order.status === 'paid' && ticket.status === 'active'"
              type="danger" 
              link
              size="small"
              @click="handleRefund(ticket)"
            >
              Refund
            </el-button>
          </div>
        </div>

        <div class="actions">
          <el-button 
            v-if="order.status === 'pending_payment'" 
            type="primary" 
            size="small"
            @click="handlePay(order)"
          >
            Pay
          </el-button>
          <el-button 
            v-if="order.status === 'pending_payment' || order.status === 'paid'" 
            type="danger" 
            size="small"
            @click="handleCancel(order)"
          >
            Cancel
          </el-button>
        </div>
      </el-card>
      
      <div v-if="orders.length === 0" class="no-data">
        No orders found.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getOrders, payOrder, cancelOrder, refundTicket } from '../api/order'
import type { Order, Ticket } from '../api/order'
import { ElMessage, ElMessageBox } from 'element-plus'

const activeTab = ref('all')
const orders = ref<Order[]>([])

onMounted(() => {
  fetchOrders()
})

const fetchOrders = async () => {
  const status = activeTab.value === 'all' ? undefined : activeTab.value
  try {
    orders.value = await getOrders(status)
  } catch (error) {
    console.error(error)
  }
}

const handleTabClick = () => {
  fetchOrders()
}

const getStatusType = (status: string) => {
  switch (status) {
    case 'paid': return 'success'
    case 'pending_payment': return 'warning'
    case 'cancelled': return 'info'
    default: return ''
  }
}

const handlePay = async (order: Order) => {
  try {
    await payOrder(order.orderId)
    ElMessage.success('Payment successful')
    fetchOrders()
  } catch (error) {
    console.error(error)
  }
}

const handleRefund = async (ticket: Ticket) => {
  try {
    await ElMessageBox.confirm('Are you sure you want to refund this ticket?', 'Warning', {
      type: 'warning'
    })
    await refundTicket(ticket.ticket_id)
    ElMessage.success('Ticket refunded')
    fetchOrders()
  } catch (error) {
    if (error !== 'cancel') {
      console.error(error)
    }
  }
}

const handleCancel = async (order: Order) => {
  try {
    await ElMessageBox.confirm('Are you sure you want to cancel this order?', 'Warning', {
      type: 'warning'
    })
    await cancelOrder(order.orderId)
    ElMessage.success('Order cancelled')
    fetchOrders()
  } catch (error) {
    if (error !== 'cancel') {
      console.error(error)
    }
  }
}
</script>

<style>
.order-list-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}
.header {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 20px;
  font-size: 18px;
  font-weight: bold;
}
.order-card {
  margin-bottom: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.order-info {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 15px;
}
.tickets {
  background-color: #f5f7fa;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 15px;
}
.ticket-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #e4e7ed;
}
.ticket-item:last-child {
  border-bottom: none;
}
.actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
.no-data {
  text-align: center;
  color: #999;
  padding: 40px;
}
</style>

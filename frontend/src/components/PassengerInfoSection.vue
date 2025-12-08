<template>
  <div class="passenger-info-section">
    <div class="passenger-info-header">
      <h2 class="section-title">乘客信息（填写说明）</h2>
      <PassengerSearchBox
        @search="handleSearch"
        placeholder="输入乘客姓名"
      />
    </div>
    
    <div class="passenger-info-content">
      <div class="passenger-list-container">
        <h3 class="subsection-title">乘车人</h3>
        <PassengerList
          :passengers="filteredPassengers"
          :selectedPassengerIds="selectedPassengers"
          @select="(id, selected) => $emit('passengerSelect', id, selected)"
          :searchKeyword="searchKeyword"
        />
      </div>
      
      <div class="purchase-info-container">
        <PurchaseInfoTable
          :purchaseInfo="purchaseInfo"
          :availableSeatTypes="availableSeatTypes"
          @seatTypeChange="(index, seatType) => $emit('seatTypeChange', index, seatType)"
          @ticketTypeChange="(index, ticketType) => $emit('ticketTypeChange', index, ticketType)"
          @deleteRow="(index) => $emit('deleteRow', index)"
          :fareInfo="fareInfo"
        />
      </div>
      
      <!-- 中国铁路保险横幅 -->
      <div class="railway-insurance-banner">
        <img src="/images/order.jpg" alt="乘意相伴 安心出行 - 中国铁路保险" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import PassengerList from './PassengerList.vue';
import PurchaseInfoTable from './PurchaseInfoTable.vue';
import PassengerSearchBox from './PassengerSearchBox.vue';
import './PassengerInfoSection.css';

interface Passenger {
  id: string;
  name: string;
  [key: string]: any;
}

interface FareInfo {
  [key: string]: {
    price: number;
    // other fields...
  };
}

const props = defineProps<{
  passengers: Passenger[];
  selectedPassengers: string[];
  availableSeatTypes: string[];
  purchaseInfo: any[];
  fareInfo?: FareInfo;
  defaultSeatType?: string;
}>();

const emit = defineEmits<{
  (e: 'passengerSelect', passengerId: string, selected: boolean): void;
  (e: 'searchPassenger', keyword: string): void;
  (e: 'seatTypeChange', index: number, seatType: string): void;
  (e: 'ticketTypeChange', index: number, ticketType: string): void;
  (e: 'deleteRow', index: number): void;
}>();

const searchKeyword = ref('');

const filteredPassengers = computed(() => {
  return (props.passengers || []).filter(p => 
    p && (!searchKeyword.value || (p.name && p.name.includes(searchKeyword.value)))
  );
});

const handleSearch = (keyword: string) => {
  searchKeyword.value = keyword;
  emit('searchPassenger', keyword);
};
</script>

<style>
/* 样式已通过 CSS 文件引入 */
</style>

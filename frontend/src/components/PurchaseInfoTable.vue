<template>
  <div class="purchase-info-table">
    <div class="table-header">
      <div class="table-header-cell">序号</div>
      <div class="table-header-cell">票种</div>
      <div class="table-header-cell">席别</div>
      <div class="table-header-cell">姓名</div>
      <div class="table-header-cell">证件类型</div>
      <div class="table-header-cell">证件号码</div>
      <div class="table-header-cell"></div>
    </div>
    
    <div class="table-body">
      <PurchaseInfoRow
        v-for="(info, index) in displayInfo"
        :key="index"
        :sequence="index + 1"
        :passenger="info.passenger"
        :ticketType="info.ticketType"
        :seatType="info.seatType || ''"
        :availableSeatTypes="availableSeatTypes"
        :fareInfo="fareInfo"
        :canDelete="!isEmptyRow"
        @seatTypeChange="(seatType) => !isEmptyRow && $emit('seatTypeChange', index, seatType)"
        @ticketTypeChange="(ticketType) => !isEmptyRow && $emit('ticketTypeChange', index, ticketType)"
        @delete="() => !isEmptyRow && $emit('deleteRow', index)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import PurchaseInfoRow from './PurchaseInfoRow.vue';
import './PurchaseInfoTable.css';

interface Passenger {
  name: string;
  idCardType: string;
  idCardNumber: string;
}

interface PurchaseInfoItem {
  passenger: Passenger;
  ticketType: string;
  seatType: string;
}

interface FareInfo {
  [key: string]: {
    price: number;
    // other fields...
  };
}

const props = defineProps<{
  purchaseInfo: PurchaseInfoItem[];
  availableSeatTypes: string[];
  fareInfo?: FareInfo;
}>();

const emit = defineEmits<{
  (e: 'seatTypeChange', index: number, seatType: string): void;
  (e: 'ticketTypeChange', index: number, ticketType: string): void;
  (e: 'deleteRow', index: number): void;
}>();

const isEmptyRow = computed(() => props.purchaseInfo.length === 0);

const displayInfo = computed(() => {
  if (isEmptyRow.value) {
    return [{
      passenger: { name: '', idCardType: '居民身份证', idCardNumber: '' },
      ticketType: '成人票',
      seatType: props.availableSeatTypes.length > 0 ? props.availableSeatTypes[0] : ''
    }];
  }
  return props.purchaseInfo;
});
</script>

<style>
/* 样式已通过 CSS 文件引入 */
</style>

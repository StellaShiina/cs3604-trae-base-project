<template>
  <div class="purchase-info-row">
    <div class="row-cell">
      {{ sequence }}
    </div>
    
    <div class="row-cell">
      <SelectDropdown
        :value="ticketType"
        :options="ticketTypeOptions"
        @change="(val) => $emit('ticketTypeChange', val)"
        placeholder="请选择"
      />
    </div>
    
    <div class="row-cell">
      <SelectDropdown
        :value="seatType"
        :options="seatTypeOptions"
        @change="(val) => $emit('seatTypeChange', val)"
        placeholder="请选择"
      />
    </div>
    
    <div class="row-cell">
      <input
        type="text"
        class="readonly-input"
        :value="passenger.name"
        readonly
      />
    </div>
    
    <div class="row-cell">
      <SelectDropdown
        :value="passenger.idCardType || '居民身份证'"
        :options="idCardTypeOptions"
        @change="() => {}"
        placeholder="请选择"
        :disabled="true"
      />
    </div>
    
    <div class="row-cell">
      <input
        type="text"
        class="readonly-input"
        :value="passenger.idCardNumber"
        readonly
      />
    </div>
    
    <div class="row-cell row-cell-delete">
      <button v-if="canDelete" class="delete-button" @click="$emit('delete')" title="删除乘客">
        ×
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import SelectDropdown from './SelectDropdown.vue';
import './PurchaseInfoRow.css';

interface Passenger {
  name: string;
  idCardType: string;
  idCardNumber: string;
}

interface FareInfo {
  [key: string]: {
    price: number;
    // other fields...
  };
}

const props = defineProps<{
  sequence: number;
  passenger: Passenger;
  ticketType: string;
  seatType: string;
  availableSeatTypes: string[];
  fareInfo?: FareInfo;
  canDelete?: boolean; // We'll check if the listener exists or pass a prop to indicate deletability
}>();

const emit = defineEmits<{
  (e: 'seatTypeChange', seatType: string): void;
  (e: 'ticketTypeChange', ticketType: string): void;
  (e: 'delete'): void;
}>();

const ticketTypeOptions = [
  { value: '成人票', label: '成人票' }
];

const idCardTypeOptions = [
  { value: '居民身份证', label: '居民身份证' },
  { value: '港澳居民来往内地通行证', label: '港澳居民来往内地通行证' },
  { value: '台湾居民来往大陆通行证', label: '台湾居民来往大陆通行证' },
  { value: '护照', label: '护照' }
];

const seatTypeOptions = computed(() => {
  return props.availableSeatTypes.map(seatTypeName => {
    const price = props.fareInfo && props.fareInfo[seatTypeName] ? props.fareInfo[seatTypeName].price : '';
    return {
      value: seatTypeName,
      label: price ? `${seatTypeName}（¥${price}.0元）` : seatTypeName
    };
  });
});
</script>

<style>
/* 样式已通过 CSS 文件引入 */
</style>

<template>
  <div v-if="passengers.length === 0" class="passenger-list-empty">
    {{ searchKeyword ? '没有找到匹配的乘客' : '暂无乘客信息，请先在个人中心添加乘客' }}
  </div>
  
  <div v-else class="passenger-list">
    <PassengerCheckbox
        v-for="passenger in passengers"
        :key="passenger.id"
        :passenger="passenger"
        :selected="selectedPassengerIds.includes(passenger.id)"
        @change="(selected: boolean) => $emit('select', passenger.id, selected)"
      />
  </div>
</template>

<script setup lang="ts">
import PassengerCheckbox from './PassengerCheckbox.vue';
import './PassengerList.css';

// Define props
const props = defineProps<{
  passengers: any[];
  selectedPassengerIds: string[];
  searchKeyword: string;
}>();

const emit = defineEmits<{
  (e: 'select', passengerId: string, selected: boolean): void;
}>();
</script>



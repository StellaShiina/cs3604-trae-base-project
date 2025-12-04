<script setup lang="ts">
import type { Train } from '../services/trainService'

defineProps<{
  trains: Train[]
}>()

const emit = defineEmits<{
  (e: 'book', train: Train, seatType: string): void
}>()

const handleBook = (train: Train, seatType: string) => {
  emit('book', train, seatType)
}
</script>

<template>
  <div class="space-y-4">
    <div v-for="train in trains" :key="train.trainNo" class="bg-white p-4 rounded shadow border border-gray-200">
      <div class="flex flex-wrap justify-between items-center mb-4">
        <div class="flex items-center space-x-4">
          <span class="text-2xl font-bold text-blue-600">{{ train.trainNo }}</span>
          <div class="flex flex-col">
            <span class="text-lg">{{ train.from }}</span>
            <span class="text-sm text-gray-500">{{ train.startTime }}</span>
          </div>
          <div class="text-gray-400">→</div>
          <div class="flex flex-col">
            <span class="text-lg">{{ train.to }}</span>
            <span class="text-sm text-gray-500">{{ train.endTime }}</span>
          </div>
        </div>
      </div>
      
      <div class="border-t pt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        <div v-for="seat in train.seats" :key="seat.type" class="flex flex-col items-center p-2 bg-gray-50 rounded">
          <span class="text-sm font-medium text-gray-700 mb-1">{{ seat.type }}</span>
          <span :class="{'text-green-600': seat.left > 0, 'text-red-500': seat.left === 0}" class="text-sm mb-2">
            {{ seat.left }}
          </span>
          <button 
            @click="handleBook(train, seat.type)"
            :disabled="!seat.bookable"
            :class="[
              'px-3 py-1 text-xs rounded transition-colors',
              seat.bookable 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            ]"
          >
            预订
          </button>
        </div>
      </div>
    </div>
    <div v-if="trains.length === 0" class="text-center py-10 text-gray-500">
      暂无车次信息
    </div>
  </div>
</template>

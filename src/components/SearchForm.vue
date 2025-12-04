<script setup lang="ts">
import { ref } from 'vue'

const fromStation = ref('')
const toStation = ref('')
const date = ref('')

const emit = defineEmits<{
  (e: 'search', payload: { from: string; to: string; date: string }): void
}>()

const handleSubmit = () => {
  emit('search', {
    from: fromStation.value,
    to: toStation.value,
    date: date.value
  })
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="bg-white p-6 rounded-lg shadow-md space-y-4">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- From Station -->
      <div class="flex flex-col">
        <label class="text-sm font-medium text-gray-700 mb-1">出发地</label>
        <input 
          v-model="fromStation"
          type="text" 
          placeholder="简拼/全拼/汉字"
          class="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
      </div>

      <!-- To Station -->
      <div class="flex flex-col">
        <label class="text-sm font-medium text-gray-700 mb-1">目的地</label>
        <input 
          v-model="toStation"
          type="text" 
          placeholder="简拼/全拼/汉字"
          class="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
      </div>

      <!-- Date -->
      <div class="flex flex-col">
        <label class="text-sm font-medium text-gray-700 mb-1">出发日期</label>
        <input 
          v-model="date"
          type="date" 
          class="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
      </div>
    </div>

    <div class="flex justify-end mt-4">
      <button 
        type="submit"
        class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded transition duration-200"
      >
        Search
      </button>
    </div>
  </form>
</template>

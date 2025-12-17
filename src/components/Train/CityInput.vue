<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { getAllCities } from '@/api/station'

const props = defineProps<{
  value: string
  placeholder: string
  type: 'departure' | 'arrival'
}>()

const emit = defineEmits<{
  (e: 'update:value', value: string): void
  (e: 'select', city: string): void
}>()

const showSuggestions = ref(false)
const suggestions = ref<string[]>([])
const isLoading = ref(false)
const error = ref('')
const containerRef = ref<HTMLDivElement | null>(null)

// Load all cities
const loadAllCities = async () => {
  try {
    const cities = await getAllCities()
    return cities
  } catch (err) {
    console.error('加载城市列表失败:', err)
    error.value = '加载城市列表失败'
    return []
  }
}

// Handle focus
const handleFocus = async () => {
  showSuggestions.value = true
  setIsLoading(true)
  error.value = ''

  const cities = await loadAllCities()
  suggestions.value = cities
  setIsLoading(false)
}

// Handle input change
const handleChange = async (e: Event) => {
  const inputValue = (e.target as HTMLInputElement).value
  emit('update:value', inputValue)

  if (!inputValue.trim()) {
    setIsLoading(true)
    const cities = await loadAllCities()
    suggestions.value = cities
    setIsLoading(false)
    return
  }

  setIsLoading(true)
  const allCities = await loadAllCities()
  suggestions.value = allCities.filter(city => city.includes(inputValue))
  setIsLoading(false)
}

// Handle select
const handleSelectCity = (city: string) => {
  emit('update:value', city)
  emit('select', city)
  showSuggestions.value = false
}

const setIsLoading = (loading: boolean) => {
  isLoading.value = loading
}

// Click outside
const handleClickOutside = (event: MouseEvent) => {
  if (containerRef.value && !containerRef.value.contains(event.target as Node)) {
    showSuggestions.value = false
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})
</script>

<template>
  <div class="station-input" ref="containerRef">
    <input
      ref="inputRef"
      type="text"
      :value="value"
      :placeholder="placeholder"
      @input="handleChange"
      @focus="handleFocus"
      class="station-input-field"
    />
    <div v-if="showSuggestions" class="suggestions-dropdown">
      <div v-if="isLoading" class="suggestion-item loading">加载中...</div>
      <div v-else-if="suggestions.length === 0" class="suggestion-item empty">暂无匹配城市</div>
      <div
        v-else
        v-for="(city, index) in suggestions"
        :key="index"
        class="suggestion-item"
        @click="handleSelectCity(city)"
      >
        {{ city }}
      </div>
    </div>
    <div v-if="error" class="input-error">{{ error }}</div>
  </div>
</template>

<style scoped lang="scss">
.station-input {
  position: relative;
  width: 100%;
}

.station-input-field {
  width: 100%;
  padding: 6px 30px 6px 10px;
  border: 1px solid #d0d5e8;
  border-radius: 3px;
  font-size: 13px;
  color: #333333;
  background-color: white;
  transition: border-color 0.2s;
  height: 30px;
  box-sizing: border-box;

  &::placeholder {
    color: #bbb;
    font-size: 12px;
  }

  &:focus {
    outline: none;
    border-color: #5ba3e0;
    box-shadow: 0 0 0 2px rgba(91, 163, 224, 0.1);
  }
}

.suggestions-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #d0d0d0;
  border-top: none;
  border-radius: 0;
  max-height: 250px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  margin-top: -1px;
}

.suggestion-item {
  padding: 10px 12px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  font-size: 14px;
  color: #333333;
  transition: background-color 0.2s;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: #f0f8ff;
    color: #3B99FC;
  }

  &.loading,
  &.empty {
    cursor: default;
    color: #999999;
    text-align: center;
    
    &:hover {
      background-color: white;
      color: #999999;
    }
  }
}

.input-error {
  color: #d32f2f;
  font-size: 12px;
  margin-top: 4px;
}
</style>

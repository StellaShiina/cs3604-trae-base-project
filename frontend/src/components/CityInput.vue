<template>
  <div class="station-input">
    <input
      type="text"
      :value="modelValue"
      :placeholder="placeholder"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
      class="station-input-field"
    />
    <div v-if="showSuggestions" class="suggestions-dropdown">
      <div v-if="isLoading" class="suggestion-item loading">加载中...</div>
      <div v-if="!isLoading && suggestions.length === 0" class="suggestion-item empty">暂无匹配城市</div>
      <template v-if="!isLoading">
        <div
          v-for="(city, index) in suggestions"
          :key="index"
          class="suggestion-item"
          @mousedown.prevent="handleSelectCity(city)"
        >
          {{ city }}
        </div>
      </template>
    </div>
    <div v-if="error" class="input-error">{{ error }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { getAllCities } from '../api/station';

const props = defineProps<{
  modelValue: string;
  placeholder?: string;
  type?: 'departure' | 'arrival';
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'select', city: string): void;
}>();

const showSuggestions = ref(false);
const suggestions = ref<string[]>([]);
const isLoading = ref(false);
const error = ref('');

// Load all cities
const loadCities = async () => {
  isLoading.value = true;
  error.value = '';
  try {
    const cities = await getAllCities();
    suggestions.value = cities;
  } catch (err) {
    console.error('加载城市列表失败:', err);
    error.value = '加载城市列表失败';
    suggestions.value = [];
  } finally {
    isLoading.value = false;
  }
};

const handleFocus = async () => {
  showSuggestions.value = true;
  await loadCities();
};

const handleInput = async (e: Event) => {
  const inputValue = (e.target as HTMLInputElement).value;
  emit('update:modelValue', inputValue);

  if (!inputValue.trim()) {
    await loadCities();
    return;
  }

  // Filter
  isLoading.value = true;
  try {
    const allCities = await getAllCities();
    const filtered = allCities.filter(city => city.includes(inputValue));
    suggestions.value = filtered;
  } catch (err) {
    console.error('搜索城市失败:', err);
    suggestions.value = [];
  } finally {
    isLoading.value = false;
  }
};

const handleBlur = () => {
  // Delay hiding suggestions to allow click event to fire
  setTimeout(() => {
    showSuggestions.value = false;
  }, 200);
};

const handleSelectCity = (city: string) => {
  emit('update:modelValue', city);
  emit('select', city);
  showSuggestions.value = false;
};
</script>

<style>
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
}

.station-input-field::placeholder {
  color: #bbb;
  font-size: 12px;
}

.station-input-field:focus {
  outline: none;
  border-color: #5ba3e0;
  box-shadow: 0 0 0 2px rgba(91, 163, 224, 0.1);
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
}

.suggestion-item:last-child {
  border-bottom: none;
}

.suggestion-item:hover {
  background-color: #f0f8ff;
  color: #3B99FC;
}

.suggestion-item.loading,
.suggestion-item.empty {
  cursor: default;
  color: #999999;
  text-align: center;
}

.suggestion-item.loading:hover,
.suggestion-item.empty:hover {
  background-color: white;
  color: #999999;
}

.input-error {
  color: #d32f2f;
  font-size: 12px;
  margin-top: 4px;
}
</style>

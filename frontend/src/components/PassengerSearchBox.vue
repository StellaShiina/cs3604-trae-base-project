<template>
  <div class="passenger-search-box">
    <input
      type="text"
      :value="searchKeyword"
      @input="handleChange"
      :placeholder="placeholder"
      class="search-input"
    />
    <button v-if="searchKeyword" class="clear-button" @click="handleClear">
      ×
    </button>
    <span class="search-icon">🔍</span>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import './PassengerSearchBox.css';

const props = defineProps<{
  placeholder: string;
}>();

const emit = defineEmits<{
  (e: 'search', keyword: string): void;
}>();

const searchKeyword = ref('');

const handleChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const keyword = target.value;
  searchKeyword.value = keyword;
  emit('search', keyword);
};

const handleClear = () => {
  searchKeyword.value = '';
  emit('search', '');
};
</script>

<style>
/* 样式已在全局引入或通过 CSS 文件引入 */
</style>

<template>
  <div class="train-filter">
    <div class="filter-row">
      <span class="label">车次类型：</span>
      <el-checkbox-group v-model="selectedTypes" @change="handleChange">
        <el-checkbox label="G">GC-高铁/城际</el-checkbox>
        <el-checkbox label="D">D-动车</el-checkbox>
        <el-checkbox label="Z">Z-直达</el-checkbox>
        <el-checkbox label="T">T-特快</el-checkbox>
        <el-checkbox label="K">K-快速</el-checkbox>
        <el-checkbox label="O">其他</el-checkbox>
      </el-checkbox-group>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  (e: 'change', types: string[]): void
}>()

const selectedTypes = ref<string[]>([])

const handleChange = (val: string[]) => {
  emit('change', val)
}
</script>

<style scoped>
.train-filter {
  background: #fff;
  padding: 15px;
  border: 1px solid #ddd;
  margin-bottom: 10px;
}
.filter-row {
  display: flex;
  align-items: center;
}
.label {
  width: 80px;
  color: #666;
  font-size: 14px;
}
</style>

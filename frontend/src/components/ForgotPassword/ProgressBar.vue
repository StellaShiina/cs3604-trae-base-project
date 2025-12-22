<template>
  <div class="password-reset-progress-bar">
    <div class="progress-line-container">
      <template v-for="(step, index) in steps" :key="step.id">
        <div 
          class="progress-node" 
          :class="{ 
            'active': currentStep >= step.id, 
            'current': currentStep === step.id 
          }"
        >
          <div class="node-circle">
            {{ currentStep > step.id ? '✓' : '' }}
          </div>
        </div>
        <div 
          v-if="index < steps.length - 1" 
          class="progress-line" 
          :class="{ 'active': currentStep > step.id }"
        ></div>
      </template>
    </div>
    <div class="progress-labels">
      <div
        v-for="step in steps"
        :key="step.id"
        class="progress-label"
        :class="{ 'active': currentStep >= step.id }"
      >
        {{ step.label }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  currentStep: number;
}>();

const steps = [
  { id: 1, label: '填写账户信息' },
  { id: 2, label: '获取验证码' },
  { id: 3, label: '设置新密码' },
  { id: 4, label: '完成' }
];
</script>

<style lang="scss" scoped>
/* ==================== 密码重置进度条容器 ==================== */
.password-reset-progress-bar {
  width: 100%;
  padding: 15px 0; /* 减少上下padding，压缩间距 */
  
  .progress-line-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: relative;
    margin-bottom: 10px;
  }

  /* ==================== 进度节点 ==================== */
  .progress-node {
    position: relative;
    z-index: 2;

    .node-circle {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: #e4e7ed;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      color: white;
      transition: all 0.3s ease;
    }

    &.active .node-circle {
      background: #3b99fc;
      border-color: #3b99fc;
    }

    &.current .node-circle {
      background: #3b99fc;
      box-shadow: 0 0 0 8px #e4e7ed;
    }
  }

  /* ==================== 进度线 ==================== */
  .progress-line {
    flex: 1;
    height: 8px;
    background: #e4e7ed;
    margin: 0 10px;
    transition: all 0.3s ease;

    &.active {
      background: #3b99fc;
    }
  }

  /* ==================== 进度标签容器 ==================== */
  .progress-labels {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    position: relative;
    /* 与 progress-line-container 使用相同的布局方式 */
  }

  /* ==================== 进度标签 ==================== */
  .progress-label {
    flex: 0 0 auto; /* 不自动增长，根据内容自适应宽度 */
    text-align: center; /* 居中对齐，使标签中心对齐到节点中心 */
    font-size: 14px;
    color: #333;
    transition: all 0.3s ease;
    white-space: nowrap; /* 确保标签文字不换行，保持在同一行 */
    position: relative;
    /* 通过负margin微调，使标签中心对齐到节点中心 */
    /* 由于节点容器中有进度线，而标签容器没有，需要微调对齐 */
    margin-left: -2px; /* 微调向左偏移，使标签中心对齐到节点中心 */

    /* 第一个标签不需要向左偏移 */
    &:first-child {
      margin-left: 0;
    }

    /* 最后一个标签不需要向左偏移 */
    &:last-child {
      margin-left: 0;
    }

    &.active {
      color: #333;
      font-weight: 500;
    }
  }

  /* ==================== 响应式设计 ==================== */
  @media (max-width: 768px) {
    .node-circle {
      width: 32px;
      height: 32px;
      font-size: 14px;
    }

    .progress-label {
      font-size: 12px;
    }
  }
}
</style>

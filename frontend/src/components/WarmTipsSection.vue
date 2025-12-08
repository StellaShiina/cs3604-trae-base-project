<template>
  <div 
    class="warm-tips-section" 
    :class="variant === 'order-page' ? 'order-page-tips' : 'history-page-tips'"
  >
    <h3 class="tips-title">{{ variant === 'order-page' ? '温馨提示：' : '温馨提示' }}</h3>
    
    <!-- Order Page Variant (Complex) -->
    <ol v-if="variant === 'order-page'" class="tips-list">
      <template v-if="tips && tips.length > 0">
         <li v-for="(tip, index) in tips" :key="index" class="tip-item">
            {{ tip }}
         </li>
      </template>
      <template v-else>
        <!-- Hardcoded default tips for order page to match reference -->
        <li class="tip-item">
          一张有效身份证件同一乘车日期同一车次只能购买一张车票，高铁动卧列车除外。改签或变更到站后车票的乘车日期在春运期间，如再办理退票将按票面价格20%核收退票费。请合理安排行程，更多改签规则请查看
          <a href="#" @click.prevent>《退改说明》</a>
        </li>
        <li class="tip-item">
          购买儿童票时，乘车儿童有有效身份证件的，请填写本人有效身份证件信息。自2023年1月1日起，每一名持票成人旅客可免费携带一名未满6周岁且不单独占用席位的儿童乘车，超过一名时，超过人数应购买儿童优惠票。
        </li>
        <li class="tip-item">
          购买残疾军人（伤残警察）优待票的，须在购票后，开车前办理换票手续方可进站乘车。换票时，不符合规定的减价优待条件，没有有效"中华人民共和国残疾军人证"或"中华人民共和国伤残人民警察证"的，不予换票，所购车票按规定办理退票手续。
        </li>
        <li class="tip-item">
          一天内3次申请车票成功后取消订单（包含无座票时取消5次计为取消1次），当日将不能在12306继续购票。
        </li>
        <li class="tip-item">
          购买铁路乘意险的注册用户年龄须在18周岁以上，使用非中国居民身份证注册的用户如购买铁路乘意险，须在
          <a href="#" @click.prevent>我的12306——个人信息</a> 如实填写"出生日期"。
        </li>
        <li class="tip-item">
          父母为未成年子女投保，须在
          <a href="#" @click.prevent>我的乘车人</a> 登记未成年子女的有效身份证件信息。
        </li>
        <li class="tip-item">
          未尽事宜详见《铁路旅客运输规程》等有关规定和车站公告。
        </li>
      </template>
    </ol>

    <!-- History Page Variant (Simple) -->
    <ol v-else class="tips-list">
      <li v-for="(tip, index) in tips || []" :key="index" class="tip-item">
        {{ tip }}
      </li>
    </ol>
  </div>
</template>

<script setup lang="ts">

interface Props {
  tips?: string[];
  variant?: 'default' | 'order-page';
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'order-page',
  tips: () => []
});
</script>

<style>
/* 温馨提示区域样式 - 基础样式 */
.warm-tips-section {
  background-color: #fffbe5;
  border: 1px solid #f5e6a8;
  border-radius: 10px;
  padding: 10px 15px;
  margin: 20px auto;
  max-width: 1100px;
}

/* 订单填写页专用样式 */
.warm-tips-section.order-page-tips {
  background-color: #fffbe5;
  border: 1px solid #f5e6a8;
  border-radius: 10px;
  padding: 10px 15px;
  margin: 20px auto;
  max-width: 1100px;
}

.warm-tips-section.order-page-tips .tips-title {
  font-size: 15px;
  font-weight: 700;
  color: #333333;
  margin: 0 0 5px 0;
}

.warm-tips-section.order-page-tips .tips-list {
  margin: 0;
  padding-left: 15px;
  list-style-position: outside;
  list-style-type: decimal;
}

.warm-tips-section.order-page-tips .tip-item {
  font-size: 14px;
  color: #404040;
  line-height: 22px;
  margin-bottom: 2px;
  padding-left: 4px;
}

.warm-tips-section.order-page-tips .tip-item:last-child {
  margin-bottom: 0;
}

.warm-tips-section.order-page-tips .tip-item a {
  color: #0073e7;
  text-decoration: none;
  cursor: pointer;
}

.warm-tips-section.order-page-tips .tip-item a:hover {
  color: #0052a3;
}

/* 订单历史页等其他页面样式 */
.warm-tips-section.history-page-tips {
  background-color: #fffbf8;
  border: 1px solid #ffdfbd;
  border-radius: 0;
  padding: 20px 20px;
  margin: 20px 0px;
  max-width: none;  /* 不限制宽度 */
}

.warm-tips-section.history-page-tips .tips-title {
  font-size: 14px;
  font-weight: 600;
  color: #222;
}
</style>
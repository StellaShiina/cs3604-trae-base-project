<template>
  <footer class="bottom-navigation">
    <div class="bottom-content">
      <!-- 友情链接区域 -->
      <div class="friendship-links-section">
        <h3 class="section-title">友情链接</h3>
        <div class="friendship-links-grid">
          <div class="friendship-link-item">
            <img src="/images/友情链接-左上.png" alt="中国国家铁路集团有限公司" />
          </div>
          <div class="friendship-link-item">
            <img src="/images/友情链接-右上.png" alt="中国铁路客户保险总公司" />
          </div>
          <div class="friendship-link-item">
            <img src="/images/友情链接-左下.png" alt="中铁银通支付有限公司" />
          </div>
          <div class="friendship-link-item">
            <img src="/images/友情链接-右下.png" alt="中铁程科技有限责任公司" />
          </div>
        </div>
      </div>

      <!-- 二维码区域 -->
      <div class="qr-codes-section">
        <div class="qr-codes-wrapper">
          <div class="qr-code-row">
            <span class="qr-label">中国铁路官方微信</span>
            <span class="qr-label">中国铁路官方微博</span>
            <span class="qr-label">12306 公众号</span>
            <span class="qr-label">铁路12306</span>
          </div>
          <div class="qr-code-row">
            <div class="qr-code-item">
              <img src="/images/中国铁路官方微信二维码.png" alt="中国铁路官方微信" />
            </div>
            <div class="qr-code-item">
              <img src="/images/中国铁路官方微博二维码.png" alt="中国铁路官方微博" />
            </div>
            <div class="qr-code-item">
              <img src="/images/12306公众号二维码.png" alt="12306 公众号" />
            </div>
            <div class="qr-code-item">
              <img src="/images/铁路12306二维码.png" alt="铁路12306" />
            </div>
          </div>
        </div>
        <div class="qr-code-footer">
          <p>官方APP下载，目前铁路未授权其他网站或APP开展类似服务内容，敬请广大用户注意。</p>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
// No script logic needed for this static component
</script>

<style>
/* ==================== 底部导航栏样式 ==================== */
.bottom-navigation {
  background-color: #f5f5f5;
  border-top: none;
  padding: 40px 0;
  margin-top: auto;
  width: 100%;
}

.bottom-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 40px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 40px;
}

/* ==================== 友情链接区域 ==================== */
.friendship-links-section {
  flex: 0 0 40%;
}

.section-title {
  font-size: 14px !important;
  font-weight: 500 !important;
  color: #333333 !important;
  margin-bottom: 20px !important;
  margin-top: 0 !important;
  border: none !important;
  padding: 0 !important;
}

.friendship-links-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px 10px;
}

.friendship-link-item {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #ffffff;
  border: 1px solid #d0d0d0;
  border-radius: 0;
  padding: 0px 0px;
  min-height: 30px;
}

.friendship-link-item img {
  width: auto;
  height: auto;
  object-fit: contain;
  max-width: 200px;
  max-height: 30px;
}

/* ==================== 二维码区域 ==================== */
.qr-codes-section {
  flex: 0 0 55%;
  display: flex;
  gap: 30px;
  align-items: flex-start;
}

.qr-codes-wrapper {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.qr-code-row {
  display: flex;
  gap: 35px;
  justify-content: flex-start;
}

.qr-code-row:first-child {
  margin-bottom: 0;
}

.qr-label {
  font-size: 13px;
  color: #333333 !important;
  text-align: center;
  white-space: nowrap;
  width: 80px;
}

/* 为底部导航的二维码项添加更具体的选择器，避免与其他页面冲突 */
.qr-code-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.qr-code-item img {
  width: 80px;
  height: 80px;
  border: none;
  padding: 0;
  background-color: #ffffff;
  border-radius: 0;
}

/* ==================== 最右侧提示语 ==================== */
.qr-code-footer {
  flex: 0 0 200px;
  display: flex;
  align-items: center;
  padding: 15px;
  background-color: #ffffff;
  border: 1px solid #d0d0d0;
  /* 【修改2】移除圆角，变为方框 */
  border-radius: 0;
  /* 【修改1】增加上外边距，使提示框下移。您可以调整这个数值来控制下移的距离 */
  margin-top: 20px;
}

.qr-code-footer p {
  font-size: 12px;
  color: #333333 !important;
  line-height: 1.8;
  margin: 0;
}

/* ==================== 响应式设计 (保留并微调) ==================== */
@media (max-width: 968px) {
  .bottom-content {
    flex-direction: column;
    gap: 40px;
    align-items: center;
  }

  .friendship-links-section, .qr-codes-section {
    width: 100%;
    flex-basis: auto !important; /* 在垂直布局时重置宽度占比 */
  }
  
  .friendship-links-section {
    max-width: 500px;
  }

  .qr-codes-section {
    flex-direction: column;
    align-items: center;
  }
  
  .qr-code-footer {
      margin-top: 0; /* 在垂直布局时重置下移 */
  }
}

@media (max-width: 768px) {
  .bottom-navigation {
    padding: 20px 0;
  }

  .bottom-content {
    padding: 0 20px;
  }

  .section-title {
    font-size: 15px;
  }

  .friendship-links-grid {
    gap: 12px 15px;
  }

  .qr-code-row {
    gap: 20px;
    justify-content: center;
  }

  .qr-codes-wrapper {
    align-items: center;
  }
}

@media (max-width: 480px) {
  .bottom-navigation {
    padding: 15px 0;
  }

  .bottom-content {
    padding: 0 15px;
  }

  .section-title {
    font-size: 14px;
    margin-bottom: 15px;
    text-align: center;
  }

  .friendship-links-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .qr-code-row {
    flex-wrap: wrap;
    gap: 15px;
  }
  
  .qr-code-footer {
    padding: 15px;
    flex-basis: auto !important; /* 在手机端取消固定宽度 */
  }
}
</style>

<template>
  <footer class="site-footer">
    <div class="footer-content">
      <!-- Friendship Links -->
      <div class="links-section">
        <h3 class="footer-title">友情链接</h3>
        <div class="links-grid">
          <div class="link-card">
            <img src="/images/友情链接-左上.png" alt="China Railway Group" />
          </div>
          <div class="link-card">
            <img src="/images/友情链接-右上.png" alt="China Railway Insurance" />
          </div>
          <div class="link-card">
            <img src="/images/友情链接-左下.png" alt="China Railway Yintong Payment" />
          </div>
          <div class="link-card">
            <img src="/images/友情链接-右下.png" alt="China Railway Cheng Technology" />
          </div>
        </div>
      </div>

      <!-- QR Codes -->
      <div class="qr-section">
        <div class="qr-container">
          <div class="qr-labels">
            <span class="qr-label">中国铁路官方微信</span>
            <span class="qr-label">中国铁路官方微博</span>
            <span class="qr-label">12306 公众号</span>
            <span class="qr-label">铁路12306</span>
          </div>
          <div class="qr-images">
            <div class="qr-item">
              <img src="/images/中国铁路官方微信二维码.png" alt="WeChat" />
            </div>
            <div class="qr-item">
              <img src="/images/中国铁路官方微博二维码.png" alt="Weibo" />
            </div>
            <div class="qr-item">
              <img src="/images/12306公众号二维码.png" alt="12306 Official Account" />
            </div>
            <div class="qr-item">
              <img src="/images/铁路12306二维码.png" alt="12306 App" />
            </div>
          </div>
        </div>
        <div class="footer-note">
          <p>官方APP下载，目前铁路未授权其他网站或APP开展类似服务内容，敬请广大用户注意。</p>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped lang="scss">
.site-footer {
  background-color: #f5f5f5;
  border-top: none;
  padding: 40px 0;
  margin-top: auto;

  .footer-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 40px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 40px;

    .links-section {
      flex: 0 0 40%;

      .footer-title {
        font-size: 14px;
        font-weight: 500;
        color: #333333;
        margin-bottom: 20px;
        margin-top: 0;
        border: none;
        padding: 0;
      }

      .links-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 10px 10px;

        .link-card {
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #ffffff;
          border: 1px solid #d0d0d0;
          border-radius: 0;
          padding: 0px 0px;
          min-height: 30px;

          img {
            width: auto;
            height: auto;
            object-fit: contain;
            max-width: 200px;
            max-height: 30px;
          }
        }
      }
    }

    .qr-section {
      flex: 0 0 55%;
      display: flex;
      gap: 30px;
      align-items: flex-start;
      
      .qr-container {
         display: flex;
         flex-direction: column;
         gap: 15px;

         .qr-labels, .qr-images {
            display: flex;
            gap: 35px;
            justify-content: flex-start;
         }
         
         .qr-label {
            font-size: 13px;
            color: #333333;
            text-align: center;
            white-space: nowrap;
            width: 80px;
         }

         .qr-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            
            img {
               width: 80px;
               height: 80px;
            }
         }
      }
      
      .footer-note {
          p {
              font-size: 13px;
              color: #666;
              margin: 0;
          }
      }
    }
  }
}
</style>

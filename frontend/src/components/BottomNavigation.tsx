import React from 'react';
import './BottomNavigation.css';

const BottomNavigation: React.FC = () => {
  return (
    <footer className="bottom-navigation">
      <div className="bottom-content">
        {/* 友情链接区域 */}
        <div className="friendship-links-section">
          <h3 className="section-title">友情链接</h3>
          <div className="friendship-links-grid">
            <div className="friendship-link-item">
              <img src="/images/友情链接-左上.png" alt="中国国家铁路集团有限公司" />
            </div>
            <div className="friendship-link-item">
              <img src="/images/友情链接-右上.png" alt="中国铁路客户保险总公司" />
            </div>
            <div className="friendship-link-item">
              <img src="/images/友情链接-左下.png" alt="中铁银通支付有限公司" />
            </div>
            <div className="friendship-link-item">
              <img src="/images/友情链接-右下.png" alt="中铁程科技有限责任公司" />
            </div>
          </div>
        </div>

        {/* 二维码区域 */}
        <div className="qr-codes-section">
          <div className="qr-codes-wrapper">
            <div className="qr-code-row">
              <span className="qr-label">中国铁路官方微信</span>
              <span className="qr-label">中国铁路官方微博</span>
              <span className="qr-label">12306 公众号</span>
              <span className="qr-label">铁路12306</span>
            </div>
            <div className="qr-code-row">
              <div className="qr-code-item">
                <img src="/images/中国铁路官方微信二维码.png" alt="中国铁路官方微信" />
              </div>
              <div className="qr-code-item">
                <img src="/images/中国铁路官方微博二维码.png" alt="中国铁路官方微博" />
              </div>
              <div className="qr-code-item">
                <img src="/images/12306公众号二维码.png" alt="12306 公众号" />
              </div>
              <div className="qr-code-item">
                <img src="/images/铁路12306二维码.png" alt="铁路12306" />
              </div>
            </div>
          </div>
          <div className="qr-code-footer">
            <p>官方APP下载，目前铁路未授权其他网站或APP开展类似服务内容，敬请广大用户注意。</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default BottomNavigation;
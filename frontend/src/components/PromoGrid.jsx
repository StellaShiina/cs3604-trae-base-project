import React from 'react';
import './PromoGrid.css';

const PromoGrid = () => {
  return (
    <div className="promo-section">
      <div className="promo-container">
        <div className="promo-card card-member">
          <div className="card-text">
            <h3>会员服务</h3>
            <p>铁路畅行 尊享体验</p>
            <a href="#">12306铁路会员积分服务</a>
          </div>
          <div className="card-icon">💎</div>
        </div>
        
        <div className="promo-card card-food">
          <div className="card-text">
            <h3>餐饮·特产</h3>
            <p>带着温度的旅途配餐</p>
            <p>享受星级的体验和家乡的味道</p>
          </div>
          <div className="card-icon">🍜</div>
        </div>

        <div className="promo-card card-insurance">
          <div className="card-text">
            <h3>铁路保险</h3>
            <p>用心呵护 放心出行</p>
            <p>12306铁路保障出行安全</p>
          </div>
          <div className="card-icon">🛡️</div>
        </div>

        <div className="promo-card card-pass">
          <div className="card-text">
            <h3>计次·定期票</h3>
            <p>预约随心乘 出行更便捷</p>
            <p>为您提供全新的自助式出行体验</p>
          </div>
          <div className="card-icon">🎫</div>
        </div>
      </div>
    </div>
  );
};

export default PromoGrid;

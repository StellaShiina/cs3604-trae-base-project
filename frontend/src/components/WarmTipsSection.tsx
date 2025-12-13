import React from 'react';
import './WarmTipsSection.css';

interface TipItem {
  text: string;
  link?: string | null;
  linkUrl?: string | null;
}

interface WarmTipsSectionProps {
  onTermsClick?: () => void;
  tips?: string[];
  variant?: 'default' | 'order-page';  // 新增variant prop来区分不同的使用场景
}

/**
 * 温馨提示区域组件
 */
const WarmTipsSection: React.FC<WarmTipsSectionProps> = ({ 
  onTermsClick: _onTermsClick, 
  tips,
  variant = 'order-page'  // 默认使用订单填写页的原始样式
}) => {
  // 订单填写页的原始提示内容（复杂格式，带链接）
  const orderPageTips: TipItem[] = [
    {
      text: '一张有效身份证件同一乘车日期同一车次只能购买一张车票，高铁动卧列车除外。改签或变更到站后车票的乘车日期在春运期间，如再办理退票将按票面价格20%核收退票费。请合理安排行程，更多改签规则请查看',
      link: '《退改说明》',
      linkUrl: '#'
    },
    {
      text: '购买儿童票时，乘车儿童有有效身份证件的，请填写本人有效身份证件信息。自2023年1月1日起，每一名持票成人旅客可免费携带一名未满6周岁且不单独占用席位的儿童乘车，超过一名时，超过人数应购买儿童优惠票。免费儿童可以在购票成功后添加。',
      link: null,
      linkUrl: null
    },
    {
      text: '购买残疾军人（伤残警察）优待票的，须在购票后，开车前办理换票手续方可进站乘车。换票时，不符合规定的减价优待条件，没有有效"中华人民共和国残疾军人证"或"中华人民共和国伤残人民警察证"的，不予换票，所购车票按规定办理退票手续。',
      link: null,
      linkUrl: null
    },
    {
      text: '一天内3次申请车票成功后取消订单（包含无座票时取消5次计为取消1次），当日将不能在12306继续购票。',
      link: null,
      linkUrl: null
    },
    {
      text: '购买铁路乘意险的注册用户年龄须在18周岁以上，使用非中国居民身份证注册的用户如购买铁路乘意险，须在',
      link: '我的12306——个人信息',
      linkUrl: '#'
    },
    {
      text: '父母为未成年子女投保，须在',
      link: '我的乘车人',
      linkUrl: '#'
    },
    {
      text: '未尽事宜详见《铁路旅客运输规程》等有关规定和车站公告。',
      link: null,
      linkUrl: null
    }
  ];

  // 根据variant决定渲染方式
  if (variant === 'order-page') {
    // 如果提供了自定义tips，使用简单格式但保持order-page样式
    if (tips && tips.length > 0) {
      return (
        <div className="warm-tips-section order-page-tips">
          <h3 className="tips-title">温馨提示：</h3>
          <ol className="tips-list">
            {tips.map((tip, index) => (
              <li key={index} className="tip-item">
                {tip}
              </li>
            ))}
          </ol>
        </div>
      );
    }
    
    // 订单填写页：使用原始的复杂格式
    return (
      <div className="warm-tips-section order-page-tips">
        <h3 className="tips-title">温馨提示：</h3>
        <ol className="tips-list">
          {orderPageTips.map((tip, index) => (
            <li key={index} className="tip-item">
              {tip.text}
              {tip.link && tip.linkUrl && (
                <a href={tip.linkUrl} onClick={(e) => e.preventDefault()}>{tip.link}</a>
              )}
              {index === 4 && ' 如实填写"出生日期"。'}
              {index === 5 && ' 登记未成年子女的有效身份证件信息。'}
            </li>
          ))}
        </ol>
      </div>
    );
  } else {
    // 订单历史页等其他页面：使用简单格式
    const displayTips = tips || [];
    
    return (
      <div className="warm-tips-section history-page-tips">
        <h3 className="tips-title">温馨提示</h3>
        <ol className="tips-list">
          {displayTips.map((tip, index) => (
            <li key={index} className="tip-item">
              {tip}
            </li>
          ))}
        </ol>
      </div>
    );
  }
};

export default WarmTipsSection;


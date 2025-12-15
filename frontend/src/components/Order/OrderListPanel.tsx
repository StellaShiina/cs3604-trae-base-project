// 订单列表展示面板组件
import React, { useState, useMemo } from 'react';
import OrderSearchFilter from './OrderSearchFilter';
import OrderResultDisplay from './OrderResultDisplay';
import WarmTipsSection from '../WarmTipsSection';
import './OrderListPanel.css';

interface OrderListPanelProps {
  orders: any[];
  onSearch: (startDate: string, endDate: string, keyword: string, searchType?: string) => void;
  onNavigateToTrainList: () => void;
  onOrderCancelled?: () => void;  // 订单取消后的回调
}

const OrderListPanel: React.FC<OrderListPanelProps> = ({
  orders,
  onSearch,
  onNavigateToTrainList,
  onOrderCancelled
}) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'upcoming' | 'history'>('upcoming');

  // 根据选中标签过滤订单
  const filteredOrders = useMemo(() => {
    const now = new Date(); // 使用当前实时时间
    
    // 辅助函数：构造列车发车时间
    const getDepartureDateTime = (order: any) => {
      // 优先使用 departure_date，如果没有则尝试 created_at
      const dateString = order.departure_date || order.created_at;
      if (!dateString) return null;

      // 提取日期部分 (YYYY-MM-DD)
      // 如果是 created_at (YYYY-MM-DD HH:MM:SS)，只取前10位
      const datePart = dateString.substring(0, 10);

      // 兼容日期格式，将 - 替换为 / 以防部分浏览器解析问题
      const safeDateStr = datePart.replace(/-/g, '/');
      const departureDate = new Date(safeDateStr);
      
      // 如果有发车时间，构造完整的日期时间
      if (order.departure_time) {
        const [hours, minutes] = order.departure_time.split(':');
        departureDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
        return departureDate;
      }
      
      // 如果没有发车时间，只使用日期（设为当天23:59:59）
      departureDate.setHours(23, 59, 59, 999);
      return departureDate;
    };
    
    if (activeTab === 'pending') {
      // 未完成订单：仅 confirmed_unpaid（已确认未支付）状态或 pending_payment
      return orders.filter(order => order.status === 'confirmed_unpaid' || order.status === 'pending_payment');
    } else if (activeTab === 'upcoming') {
      // 未出行订单：已支付（paid）或已完成（completed）且列车尚未发车（当前时间 < 发车时间）
      // 调试日志：检查过滤逻辑
      // console.log('Filtering upcoming orders:', { ... });

      return orders.filter(order => {
        if (order.status !== 'paid' && order.status !== 'completed') return false;
        const departureDateTime = getDepartureDateTime(order);
        if (!departureDateTime) {
             // 如果无法解析时间，默认显示（避免数据问题导致订单消失）
             return true; 
        }
        return now < departureDateTime; // 当前时间早于发车时间
      });
    } else if (activeTab === 'history') {
      // 历史订单：已完成、已取消、已退票，或已支付且列车已发车
      return orders.filter(order => {
        // 已完成、已取消、已退票的订单直接显示在历史订单中
        if (order.status === 'completed' || order.status === 'cancelled' || order.status === 'canceled' || order.status === 'refunded') {
          return true;
        }
        
        // 已支付订单，如果已发车则显示在历史订单中
        if (order.status === 'paid') {
          const departureDateTime = getDepartureDateTime(order);
          if (!departureDateTime) return false;
          return now >= departureDateTime; // 当前时间晚于或等于发车时间
        }
        
        return false;
      });
    }
    return [];
  }, [orders, activeTab]);

  // 不同标签的温馨提示内容
  const getTipsForTab = () => {
    if (activeTab === 'pending') {
      return [
        '席位已锁定，请在指定时间内完成网上支付。',
        '逾期未支付，系统将取消本次交易。',
        '在完成支付或取消本订单之前，您将无法购买其他车票。',
        '未尽事宜详见《国铁集团铁路旅客运输规程》《广深港高速铁路跨境旅客运输组织规则》《中老铁路跨境旅客联运组织规则》等有关规定和车站公告。'
      ];
    } else {
      return [
        '订单信息保存期限为30日。',
        '在12306.cn网站改签和退票，改签应不晚于票面日期当日24:00，变更到站不晚于开车前48小时，退票应不晚于开车前。',
        '在本网站办理退票，只能逐次单张办理。',
        '车票改签、变更到站均只能办理一次。已经改签或变更到站的车票不再办理改签；对已改签车票、团体票暂不提供"变更到站"服务。',
        '退票、改签、变更到站后，如有应退票款，按购票时所使用的在线支付工具相关规定，将在规定时间内退还至原在线支付工具账户，请及时查询。如有疑问，请致电12306人工客服查询。',
        '投保、退保或查看电子保单状态，请点击"我的保险"或"购/赠/退保险"。',
        '"除有效期有其他规定的车票外，车票当日当次有效。旅客自行中途上车、下车的，未乘区间的票款不予退还。"',
        '如因运力原因或其他不可控因素导致列车调度调整时，当前车型可能会发生变动。',
        '未尽事宜详见《国铁集团铁路旅客运输规程》《广深港高速铁路跨境旅客运输组织规则》《中老铁路跨境旅客联运组织规则》等有关规定和车站公告。'
      ];
    }
  };

  return (
    <div className="order-list-panel">
      <div className="order-type-section">
        <div className="order-tabs">
          <div 
            className={`order-tab ${activeTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveTab('upcoming')}
          >
            未出行订单
          </div>
          <div 
            className={`order-tab ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            未支付订单
          </div>
          <div 
            className={`order-tab ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            历史订单
          </div>
        </div>
      </div>

      {/* 未出行订单和历史订单都显示搜索筛选 */}
      {(activeTab === 'upcoming' || activeTab === 'history') && (
        <OrderSearchFilter 
          onSearch={onSearch} 
          variant={activeTab === 'history' ? 'history' : 'unpaid'} 
        />
      )}

      {/* 显示订单结果 */}
      <OrderResultDisplay
        orders={filteredOrders}
        onNavigateToTrainList={onNavigateToTrainList}
        showEmptyState={activeTab === 'pending'}  // 只有未完成订单显示空状态
        onOrderCancelled={onOrderCancelled}  // 传递订单取消回调
      />

      {/* 所有标签都显示温馨提示 */}
      <WarmTipsSection tips={getTipsForTab()} variant="default" />
    </div>
  );
};

export default OrderListPanel;


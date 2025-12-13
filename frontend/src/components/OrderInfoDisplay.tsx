import React from 'react';
import './OrderInfoDisplay.css';
import { formatSeatNumber } from '../utils/seatNumberFormatter';

interface Passenger {
  sequence: number;
  name: string;
  idCardType: string;
  idCardNumber: string;
  ticketType: string;
  seatType: string;
  carNumber?: string;
  seatNumber?: string;
  price: number;
}

interface TrainInfo {
  trainNo: string;
  departureStation: string;
  arrivalStation: string;
  departureDate: string;
  departureTime: string;
  arrivalTime: string;
}

interface OrderInfoDisplayProps {
  trainInfo: TrainInfo;
  passengers: Passenger[];
  totalPrice: number;
  onCancelOrder: () => void;
  onConfirmPayment: () => void;
  isProcessing: boolean;
}

/**
 * 订单信息显示组件
 */
const OrderInfoDisplay: React.FC<OrderInfoDisplayProps> = ({
  trainInfo,
  passengers,
  totalPrice,
  onCancelOrder,
  onConfirmPayment,
  isProcessing
}) => {
  // 支付页温馨提示内容（使用渲染函数以支持链接）
  const renderPaymentWarmTips = () => {
    return (
      <div className="payment-warm-tips-section">
        <h3 className="payment-tips-title">温馨提示：</h3>
        <ol className="payment-tips-list">
          <li className="payment-tip-item">请在指定时间内完成网上支付。</li>
          <li className="payment-tip-item">逾期未支付，系统将取消本次交易。</li>
          <li className="payment-tip-item">在完成支付或取消本订单之前，您将无法购买其他车票。</li>
          <li className="payment-tip-item">
            退票政策收获现：<a href="#" onClick={(e) => e.preventDefault()}>退改说明</a>
          </li>
          <li className="payment-tip-item">购买铁路乘意险保障您的出行安全，提供意外伤害身故伤残、意外伤害医疗费用、意外伤害住院津贴、突发急性病身故保障，同时保障您和随行被监护人因意疏忽过失造成第三人身伤亡和财产损失依法应由您承担的直接经济赔偿责任，详见保险条款</li>
          <li className="payment-tip-item">
            请充分理解保险责任、责任免除、保险期间、合同解除等约定，详见保险条款，凭保单号或保单查询号登录<a href="#" onClick={(e) => e.preventDefault()}>www.china-ric.com</a> 查看电子保单或下载电子发票。
          </li>
          <li className="payment-tip-item">如因运力原因或其他不可控因素致列车调度调整时，当前车型可能会发生变动。</li>
          <li className="payment-tip-item">跨境旅客旅行须知详见跨境旅客相关运输组织规则和车站公告。</li>
          <li className="payment-tip-item">未尽事宜详见《国铁集团铁路旅客运输规程》等有关规定和车站公告。</li>
        </ol>
      </div>
    );
  };
  // 格式化日期显示
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const weekday = weekdays[date.getDay()];
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day} （${weekday}）`;
  };

  // 格式化身份证号码（中间打码）
  const maskIdCard = (idCard: string): string => {
    if (!idCard || idCard.length < 8) return idCard;
    const start = idCard.substring(0, 4);
    const end = idCard.substring(idCard.length - 3);
    const middle = '*'.repeat(idCard.length - 7);
    return `${start}${middle}${end}`;
  };

  // 格式化座位号显示
  const formatSeatDisplay = (seatNumber?: string, seatType?: string): string => {
    if (!seatNumber || !seatType) return '';
    return formatSeatNumber(seatNumber, seatType);
  };

  return (
    <div className="payment-order-info-container">
      <div className="payment-order-info-display">
        {/* 订单信息标题 */}
        <div className="payment-order-info-header">
          订单信息
        </div>

        <div className="payment-order-info-content">
          {/* 车次信息行 */}
          <div className="payment-train-info-row">
            <span className="payment-train-date">{formatDate(trainInfo.departureDate)}</span>
            <span className="payment-train-info-group">
              <span className="payment-train-no">{trainInfo.trainNo}</span>
              <span className="payment-train-text">次</span>
            </span>
            <span className="payment-train-info-group">
              <span className="payment-train-station">{trainInfo.departureStation}</span>
              <span className="payment-train-text">站</span>
              <span className="payment-train-bold-group">（{trainInfo.departureTime} 开）—{trainInfo.arrivalStation}</span>
              <span className="payment-train-text">站（{trainInfo.arrivalTime} 到）</span>
            </span>
          </div>

          {/* 乘车人信息表格 */}
          <div className="payment-passenger-table-container">
            <table className="payment-passenger-table">
              <thead>
                <tr>
                  <th>序号</th>
                  <th>姓名</th>
                  <th>证件类型</th>
                  <th>证件号码</th>
                  <th>票种</th>
                  <th>席别</th>
                  <th>车厢</th>
                  <th>席位号</th>
                  <th>票价（元）</th>
                </tr>
              </thead>
              <tbody>
                {passengers.map((passenger, index) => (
                  <tr key={index}>
                    <td>{passenger.sequence}</td>
                    <td>{passenger.name}</td>
                    <td>{passenger.idCardType}</td>
                    <td>{maskIdCard(passenger.idCardNumber)}</td>
                    <td>{passenger.ticketType}</td>
                    <td>{passenger.seatType}</td>
                    <td>{passenger.carNumber ? `${String(passenger.carNumber).padStart(2, '0')}` : ''}</td>
                    <td>{formatSeatDisplay(passenger.seatNumber, passenger.seatType)}</td>
                    <td>{passenger.price.toFixed(1)}元</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 保险区域 - Mock展示 */}
          <div className="payment-insurance-section">
            <img src="/images/ensurance.png" alt="添加铁路乘意险保障" className="payment-insurance-image" />
          </div>

          {/* 总票价 */}
          <div className="payment-total-price-row">
            <span className="payment-total-label">总票价：</span>
            <span className="payment-total-amount">{totalPrice.toFixed(1)} 元</span>
          </div>

          {/* 操作按钮 */}
          <div className="payment-actions">
            <button
              className="payment-button cancel-order-button"
              onClick={onCancelOrder}
              disabled={isProcessing}
            >
              取消订单
            </button>
            <button
              className="payment-button confirm-payment-button"
              onClick={onConfirmPayment}
              disabled={isProcessing}
            >
              {isProcessing ? '处理中...' : '网上支付'}
            </button>
          </div>

          {/* 温馨提示区域 */}
          {renderPaymentWarmTips()}
        </div>
      </div>
    </div>
  );
};

export default OrderInfoDisplay;

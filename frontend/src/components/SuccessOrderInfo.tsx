import React from 'react';
import './SuccessOrderInfo.css';
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

interface SuccessOrderInfoProps {
  trainInfo: TrainInfo;
  passengers: Passenger[];
  totalPrice: number;
  onFoodClick: () => void;
  onContinuePurchase: () => void;
  onViewDetails: () => void;
}

/**
 * 购票成功页专用订单信息组件
 */
const SuccessOrderInfo: React.FC<SuccessOrderInfoProps> = ({
  trainInfo,
  passengers,
  totalPrice: _totalPrice,
  onFoodClick,
  onContinuePurchase,
  onViewDetails
}) => {
  // 温馨提示和二维码区域
  const renderWarmTipsWithQRCodes = () => {
    return (
      <div className="success-order-warm-tips-container">
        <div className="success-order-warm-tips-content">
          <h3 className="success-order-tips-title">温馨提示：</h3>
          <ol className="success-order-tips-list">
            <li className="success-order-tip-item">如需换票，请尽早携带购票时使用的乘车人有效身份证件到车站、售票窗口、自动售（取）票机、铁路客票代售点办理。</li>
            <li className="success-order-tip-item">请乘车人持购票时使用的有效证件按时乘车。</li>
            <li className="success-order-tip-item">
              投保后可于凭保单号"查看电子保单"查看保单（登陆<a href="#" onClick={(e) => e.preventDefault()}>中国铁路保险www.china-ric.com</a> 查看电子保单）。
            </li>
            <li className="success-order-tip-item">完成微信或付宝绑定后，购票、改签、退票、购买餐食险、退票爱路险的通知消息，将会通过微信或付宝通知提醒发送给您；手机号码换频、通过手机号码投回密码、列车运行调整的通知仍然通过短信发送给您。</li>
            <li className="success-order-tip-item">未尽事宜详见《铁路旅客运输规程》等有关规定和车站公告。</li>
          </ol>
        </div>
        
        {/* 二维码在温馨提示框内的右侧 */}
        <div className="success-order-qr-codes-inline">
          <div className="success-order-qr-item-inline">
            <img 
              src="/images/微信二维码.png" 
              alt="微信二维码"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <p className="success-order-qr-text-inline">使用微信扫一扫，可通过微信接收12306行程通知</p>
          </div>
          <div className="success-order-qr-item-inline">
            <img 
              src="/images/支付宝二维码.png" 
              alt="支付宝二维码"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <p className="success-order-qr-text-inline">使用支付宝扫一扫，可通过支付宝通知提醒接收12306行程通知</p>
          </div>
        </div>
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
    <div className="success-order-info-container">
      <div className="success-order-info-display">
        {/* 订单信息标题 */}
        <div className="success-order-info-header">
          订单信息
        </div>

        <div className="success-order-info-content">
          {/* 车次信息行 */}
          <div className="success-train-info-row">
            <span className="success-train-date">{formatDate(trainInfo.departureDate)}</span>
            <span className="success-train-info-group">
              <span className="success-train-no">{trainInfo.trainNo}</span>
              <span className="success-train-text">次</span>
            </span>
            <span className="success-train-info-group">
              <span className="success-train-station">{trainInfo.departureStation}</span>
              <span className="success-train-text">站</span>
              <span className="success-train-bold-group">（{trainInfo.departureTime} 开）—{trainInfo.arrivalStation}</span>
              <span className="success-train-text">站（{trainInfo.arrivalTime} 到）</span>
            </span>
          </div>

          {/* 乘车人信息表格 */}
          <div className="success-passenger-table-container">
            <table className="success-passenger-table">
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
                  <th>订单状态</th>
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
                    <td><span className="status-paid">已支付</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 操作按钮 */}
          <div className="success-order-actions">
            <button
              className="success-order-button food-button"
              onClick={onFoodClick}
            >
              餐饮·特产
            </button>
            <button
              className="success-order-button continue-button"
              onClick={onContinuePurchase}
            >
              继续购票
            </button>
            <button
              className="success-order-button view-details-button"
              onClick={onViewDetails}
            >
              查询订单详情
            </button>
          </div>

          {/* 温馨提示和二维码区域（二维码在温馨提示框内） */}
          {renderWarmTipsWithQRCodes()}

          {/* 广告区域 */}
          <div className="success-order-advertisement">
            <img 
              src="/images/广告.png" 
              alt="广告"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessOrderInfo;


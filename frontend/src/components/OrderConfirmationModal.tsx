import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import './OrderConfirmationModal.css';
import TrainInfoDisplay from './TrainInfoDisplay';
import SeatAvailabilityDisplay from './SeatAvailabilityDisplay';
import ProcessingModal from './ProcessingModal';
import OrderSuccessModal from './OrderSuccessModal';
import BookingFailedModal from './BookingFailedModal';

interface OrderConfirmationModalProps {
  isVisible: boolean;
  orderId: string;
  orderInfo?: any;
  onConfirm: () => Promise<void>;
  onBack: () => void;
  onSuccess?: () => void; // 购买成功后的回调，通常是返回首页
}

/**
 * 信息核对弹窗组件
 */
const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  isVisible,
  orderId,
  orderInfo: externalOrderInfo,
  onConfirm: _onConfirm,
  onBack,
  onSuccess,
}) => {
  const navigate = useNavigate();
  const [orderInfo, setOrderInfo] = useState<any>(externalOrderInfo || null);
  const [isLoading, setIsLoading] = useState(false);
  const [showBookingFailedModal, setShowBookingFailedModal] = useState(false);
  const [error, setError] = useState('');
  const [showProcessingModal, setShowProcessingModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  // 获取订单核对信息
  useEffect(() => {
    const fetchOrderConfirmation = async () => {
      if (!isVisible || !orderId) return;
      
      // 如果已经有外部传入的orderInfo，不需要再调用API
      if (externalOrderInfo) {
        setOrderInfo(externalOrderInfo);
        return;
      }
      
      setIsLoading(true);
      setError('');
      
      try {
        const token = typeof localStorage !== 'undefined' ? localStorage.getItem('authToken') : null;
        if (!token) {
          setError('请先登录');
          return;
        }
        
        // 调用API获取订单核对信息
        const response = await fetch(`/api/orders/${orderId}/confirmation`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || '获取订单信息失败');
        }
        
        const data = await response.json();
        setOrderInfo(data);
      } catch (error: any) {
        setError(error.message || '获取订单信息失败');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrderConfirmation();
  }, [isVisible, orderId, externalOrderInfo]);
  
  const [confirmResult, setConfirmResult] = React.useState<any>(null);
  
  const handleConfirm = async () => {
    console.log('🔵 handleConfirm 开始执行');
    setShowProcessingModal(true);
    setError('');
    
    try {
      const token = typeof localStorage !== 'undefined' ? localStorage.getItem('authToken') : null;
      if (!token) {
        console.error('❌ Token 不存在');
        setError('请先登录');
        setShowProcessingModal(false);
        return;
      }
      
      console.log('🔵 调用确认订单API:', `/api/orders/${orderId}/confirm`);
      
      // 调用确认订单API
      const response = await fetch(`/api/orders/${orderId}/confirm`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log('🔵 API 响应状态:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ API 错误:', errorData);
        throw new Error(errorData.error || '确认订单失败');
      }
      
      const result = await response.json();
      console.log('✅ API 返回数据:', result);
      console.log('✅ 包含 trainInfo:', !!result.trainInfo);
      console.log('✅ 包含 tickets:', !!result.tickets);
      
      setConfirmResult(result);
      
      // 关闭处理中弹窗
      console.log('🟢 关闭处理中弹窗');
      setShowProcessingModal(false);
      
      // 跳转到支付页面
      setTimeout(() => {
        console.log('🟢 跳转到支付页面');
        navigate(`/payment/${orderId}`);
      }, 100);
    } catch (error: any) {
      console.error('❌ handleConfirm 错误:', error);
      setShowProcessingModal(false);
      
      // Check if it's a 403 error with cancellation limit code
      if (error.message && error.message.includes('今日取消订单次数已达上限')) {
        setShowBookingFailedModal(true);
      } else {
        setError(error.message || '订单确认失败，请稍后重试');
      }
    }
  };
  
  // 调试日志
  console.log('OrderConfirmationModal 渲染状态:', {
    isVisible,
    showProcessingModal,
    showSuccessModal,
    hasConfirmResult: !!confirmResult
  });
  
  if (!isVisible) return null;
  
  // 当显示处理中或成功弹窗时，隐藏主弹窗内容，避免遮挡
  const shouldHideMainModal = showProcessingModal || showSuccessModal;
  
  // 添加更多调试日志
  console.log('🔍 OrderConfirmationModal 渲染:', {
    shouldHideMainModal,
    showProcessingModal,
    showSuccessModal
  });
  
  return (
    <>
      {!shouldHideMainModal && (
        <div className="order-confirmation-modal">
          <div className="modal-overlay"></div>
          <div className="modal-content">
            <div className="modal-header blue-background">
              <h2 className="modal-title">请核对以下信息</h2>
              <button 
                className="modal-close" 
                onClick={() => {
                  console.log('❌ 点击关闭按钮');
                  onBack();
                }}
              >×</button>
            </div>
            
            <div className="modal-body white-background">
              {isLoading ? (
                <div className="loading">加载中...</div>
              ) : error ? (
                <div className="order-confirmation-error-message">{error}</div>
              ) : orderInfo ? (
                <>
                  <TrainInfoDisplay trainInfo={orderInfo.trainInfo} />
                  {orderInfo.passengers && orderInfo.passengers.length > 0 ? (
                    <>
                      <div className="confirmation-table-container">
                        <table className="confirmation-passenger-table">
                          <thead>
                            <tr>
                              <th>序号</th>
                              <th>席别</th>
                              <th>票种</th>
                              <th>姓名</th>
                              <th>证件类型</th>
                              <th>证件号码</th>
                            </tr>
                          </thead>
                          <tbody>
                            {orderInfo.passengers.map((passenger: any, index: number) => (
                              <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{passenger.seatType || '二等座'}</td>
                                <td>{passenger.ticketType || '成人票'}</td>
                                <td>
                                  {passenger.name}
                                  {passenger.points > 0 ? (
                                    <span className="passenger-points-badge">积分*{passenger.points}</span>
                                  ) : null}
                                </td>
                                <td>{passenger.idCardType || '居民身份证'}</td>
                                <td>{passenger.idCardNumber}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="seat-allocation-notice">
                        系统将随机为您申请席位，暂不支持自选席位。
                      </div>
                    </>
                  ) : (
                    <div className="empty-passengers">暂无乘客信息</div>
                  )}
                  {orderInfo.availableSeats && Object.keys(orderInfo.availableSeats).length > 0 ? (
                    <SeatAvailabilityDisplay availableSeats={orderInfo.availableSeats} />
                  ) : (
                    <div className="empty-seats">暂无余票信息</div>
                  )}
                </>
              ) : (
                <div className="loading">加载订单信息...</div>
              )}
            </div>
            
            <div className="modal-footer">
              <button 
                type="button"
                className="back-modal-button white-background gray-text" 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('🔙 点击"返回修改"按钮');
                  onBack();
                }}
              >
                返回修改
              </button>
              <button 
                type="button"
                className="confirm-modal-button orange-background white-text" 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('🟠 点击"确认"按钮，准备调用 handleConfirm');
                  handleConfirm();
                }}
                disabled={isLoading}
              >
                确认
              </button>
            </div>
          </div>
        </div>
      )}
      
      {showProcessingModal && createPortal(
        <ProcessingModal
          isVisible={showProcessingModal}
          message="订单已经提交，系统正在处理中，请稍等"
        />,
        document.body
      )}
      
      {showSuccessModal && createPortal(
        <OrderSuccessModal
          isVisible={showSuccessModal}
          orderId={orderId}
          trainInfo={confirmResult?.trainInfo}
          tickets={confirmResult?.tickets}
          onClose={() => {
            setShowSuccessModal(false);
            // 调用成功回调，通常是返回首页
            if (onSuccess) {
              onSuccess();
            } else {
              onBack();
            }
          }}
        />,
        document.body
      )}
      
      {/* 订票失败弹窗 */}
      {showBookingFailedModal && createPortal(
        <BookingFailedModal
          isVisible={showBookingFailedModal}
          onClose={() => {
            setShowBookingFailedModal(false);
            onBack();
          }}
        />,
        document.body
      )}
    </>
  );
};

export default OrderConfirmationModal;


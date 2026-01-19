import React, { useEffect, useState } from 'react';
import { getMe } from '../../api';

const PersonalInfo = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMe().then(res => {
      if (res.success) setUser(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div>加载中...</div>;
  if (!user) return <div>加载失败</div>;

  return (
    <div className="personal-info">
      <div className="greeting-row" style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
         <span style={{ fontSize: '20px', fontWeight: 'bold' }}>{user.real_name} 先生, 下午好!</span>
      </div>

      <div className="dashed-info-box" style={{ 
          border: '1px dashed #A9C8F5', 
          padding: '15px 20px', 
          marginBottom: '20px',
          lineHeight: '1.8'
      }}>
         <div>欢迎您登录中国铁路客户服务中心网站。</div>
         <div style={{ color: '#E64545' }}>如果您的密码在其他网站也使用，建议您修改本网站密码。</div>
         <div>如果您需要预订车票，请您点击 <a href="/ticket-search" style={{ color: '#1E6EDC' }}>车票预订</a>。</div>
      </div>

      <div className="qr-code-block" style={{ marginBottom: '20px' }}>
          <div style={{ width: '120px', height: '120px', border: '1px solid #D9E2EF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '5px' }}>
              QR Code
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
             使用微信扫一扫，可通过<br/>微信公众号接收12306行程通知
          </div>
      </div>

      <div className="notice-box" style={{ 
          backgroundColor: '#FFF6EE', 
          border: '1px solid #F2B36D', 
          padding: '15px 18px',
          fontSize: '13px'
      }}>
          <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>温馨提示：</div>
          <div>1.消息通知方式进行相关调整，将通过“铁路12306”App客户端为您推送相关消息（需开启通知权限）。您也可以扫描关注“铁路12306”微信公众号或支付宝生活号，选择消息接收</div>
          <div>2.您可通过“账号安全”中的“通知设置”修改您接收信息服务的方式。</div>
      </div>
    </div>
  );
};

export default PersonalInfo;

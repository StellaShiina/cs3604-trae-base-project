import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../api/index';

const Login = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState('account'); // account | scan
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState({ idLast4: '', smsCode: '' });
  
  // Skeleton render
  return (
    <div className="login-page">
      <div className="login-box">
        <div className="tabs">
          <button onClick={() => setTab('scan')}>扫码登录</button>
          <button onClick={() => setTab('account')}>账号登录</button>
        </div>

        {tab === 'account' && (
          <form>
            <input 
              type="text" 
              placeholder="用户名/邮箱/手机号" 
              value={formData.username}
              onChange={e => setFormData({...formData, username: e.target.value})}
            />
            <input 
              type="password" 
              placeholder="密码" 
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
            />
            <button type="button" onClick={() => setModalVisible(true)}>立即登录</button>
            
            <div className="links">
              <Link to="/register">注册12306账号</Link>
              <Link to="/forgot-password">忘记密码</Link>
            </div>
          </form>
        )}

        {tab === 'scan' && <div>扫码登录二维码</div>}
      </div>

      {modalVisible && (
        <div className="login-modal" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)' }}>
          <div style={{ background: 'white', padding: 20, margin: '100px auto', width: 300 }}>
            <h3>安全验证</h3>
            <input 
              placeholder="证件号后4位" 
              value={modalData.idLast4} 
              onChange={e => setModalData({...modalData, idLast4: e.target.value})}
            />
            <button>获取验证码</button>
            <input 
              placeholder="验证码" 
              value={modalData.smsCode}
              onChange={e => setModalData({...modalData, smsCode: e.target.value})}
            />
            <button>确定</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;

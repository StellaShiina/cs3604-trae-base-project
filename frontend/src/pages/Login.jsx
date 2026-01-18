import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header'; // Optional, but usually login page has simple header or none. Requirement says "Header updates after login". Login page itself? Usually has simple header.
// But I'll stick to the layout provided in png description (not visible here).
// I'll just render the form.

const Login = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState('account'); // account | scan
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState({ idLast4: '', smsCode: '' });
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleLoginStep1 = () => {
    if (!formData.username || !formData.password) {
      alert('请输入账号和密码');
      return;
    }
    setModalVisible(true);
  };

  const handleGetCode = async () => {
    if (!modalData.idLast4) {
      alert('请输入证件号后4位');
      return;
    }
    try {
      const res = await fetch('http://localhost:3000/api/v1/auth/send-login-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: formData.username, idLast4: modalData.idLast4 })
      });
      const data = await res.json();
      if (data.code === 0) {
        setCountdown(60);
      } else {
        alert(data.message);
      }
    } catch (e) {
      alert('发送失败');
    }
  };

  const handleLoginStep2 = async () => {
    if (!modalData.smsCode) {
      alert('请输入验证码');
      return;
    }
    try {
      const res = await fetch('http://localhost:3000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          idLast4: modalData.idLast4,
          smsCode: modalData.smsCode
        })
      });
      const data = await res.json();
      if (data.code === 0) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        localStorage.setItem('username', data.data.user.username);
        localStorage.setItem('userId', data.data.user.id);
        navigate('/');
      } else {
        alert(data.message);
      }
    } catch (e) {
      alert('登录失败');
    }
  };

  return (
    <div className="login-page">
      <div className="header" style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', background: 'white' }}>
        <div style={{ fontSize: 24, fontWeight: 'bold', marginRight: 20, color: '#333' }}>中国铁路12306</div>
        <div style={{ fontSize: 20, color: '#333' }}>欢迎登录12306</div>
      </div>
      <div className="login-box" style={{ maxWidth: 400, margin: '50px auto', padding: 20, border: '1px solid #ccc' }}>
        <div className="tabs" style={{ display: 'flex', marginBottom: 20 }}>
          <button style={{ flex: 1, padding: 10, background: tab === 'scan' ? '#eee' : 'white' }} onClick={() => setTab('scan')}>扫码登录</button>
          <button style={{ flex: 1, padding: 10, background: tab === 'account' ? '#eee' : 'white' }} onClick={() => setTab('account')}>账号登录</button>
        </div>

        {tab === 'account' && (
          <form onSubmit={(e) => { e.preventDefault(); handleLoginStep1(); }}>
            <div style={{ marginBottom: 10 }}>
              <input
                type="text"
                placeholder="用户名/邮箱/手机号"
                value={formData.username}
                onChange={e => setFormData({ ...formData, username: e.target.value })}
                style={{ width: '100%', padding: 8 }}
              />
            </div>
            <div style={{ marginBottom: 10 }}>
              <input
                type="password"
                placeholder="密码"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                style={{ width: '100%', padding: 8 }}
              />
            </div>
            <button type="submit" style={{ width: '100%', padding: 10, background: 'orange', color: 'white', border: 'none' }}>立即登录</button>
            
            <div className="links" style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between' }}>
              <Link to="/register">注册12306账号</Link>
              <Link to="/forgot-password">忘记密码</Link>
            </div>
          </form>
        )}

        {tab === 'scan' && <div style={{ textAlign: 'center', padding: 20 }}>扫码登录二维码</div>}
      </div>

      {modalVisible && (
        <div className="login-modal" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ background: 'white', padding: 20, width: 300, borderRadius: 8 }}>
            <h3>安全验证</h3>
            <div style={{ marginBottom: 10 }}>
              <input
                placeholder="证件号后4位"
                value={modalData.idLast4}
                onChange={e => setModalData({ ...modalData, idLast4: e.target.value })}
                style={{ width: '100%', padding: 8 }}
              />
            </div>
            <div style={{ marginBottom: 10, display: 'flex' }}>
              <button
                type="button"
                onClick={handleGetCode}
                disabled={countdown > 0}
                style={{ marginRight: 10 }}
              >
                {countdown > 0 ? `${countdown}秒后重发` : '获取验证码'}
              </button>
              <input
                placeholder="验证码"
                value={modalData.smsCode}
                onChange={e => setModalData({ ...modalData, smsCode: e.target.value })}
                style={{ flex: 1, padding: 8 }}
              />
            </div>
            <button onClick={handleLoginStep2} style={{ width: '100%', padding: 10, background: 'blue', color: 'white', border: 'none' }}>确定</button>
            <button onClick={() => setModalVisible(false)} style={{ width: '100%', padding: 10, marginTop: 10 }}>取消</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;

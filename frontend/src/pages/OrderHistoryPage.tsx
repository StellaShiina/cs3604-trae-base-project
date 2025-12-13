// 历史订单页
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TrainListTopBar from '../components/TrainListTopBar';
import MainNavigation from '../components/MainNavigation';
import SideMenu from '../components/SideMenu';
import BreadcrumbNavigation from '../components/BreadcrumbNavigation';
import BottomNavigation from '../components/BottomNavigation';
import OrderListPanel from '../components/Order/OrderListPanel';
import './OrderHistoryPage.css';

const OrderHistoryPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 检查登录状态
  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem('authToken');
      setIsLoggedIn(!!token);
      if (!token) {
        console.log('未登录，跳转到登录页');
        navigate('/login');
        return false;
      }
      return true;
    };
    
    if (checkLoginStatus()) {
      fetchOrders();
    }
    
    // 监听storage事件，当其他标签页登录/登出时同步状态
    window.addEventListener('storage', checkLoginStatus);
    
    return () => {
      window.removeEventListener('storage', checkLoginStatus);
    };
  }, [navigate]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      setError('');
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/user/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
        setFilteredOrders(data.orders || []);
      } else {
        setError('获取订单列表失败');
      }
    } catch (err) {
      setError('获取订单列表失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (start: string, end: string, kw: string, searchType?: string) => {
    if (!start && !end && !kw) {
      setFilteredOrders(orders);
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const params = new URLSearchParams();
      if (start) params.append('startDate', start);
      if (end) params.append('endDate', end);
      if (kw) params.append('keyword', kw);
      if (searchType) params.append('searchType', searchType);

      const response = await fetch(`/api/user/orders?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setFilteredOrders(data.orders || []);
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('搜索失败');
    }
  };

  const handleMenuClick = (section: string) => {
    switch (section) {
      case 'train-orders':
        // 已在当前页面
        break;
      case 'personal-info':
        navigate('/personal-info');
        break;
      case 'phone-verification':
        navigate('/phone-verification');
        break;
      case 'passengers':
        navigate('/passengers');
        break;
    }
  };

  const handleNavigateToLogin = () => {
    navigate('/login');
  };

  const handleNavigateToRegister = () => {
    navigate('/register');
  };

  const handleNavigateToPersonalCenter = () => {
    if (isLoggedIn) {
      navigate('/personal-info');
    } else {
      navigate('/login');
    }
  };

  const handleMy12306Click = () => {
    if (isLoggedIn) {
      navigate('/personal-info');
    } else {
      navigate('/login');
    }
  };

  // 获取用户名
  const username = isLoggedIn ? (localStorage.getItem('username') || localStorage.getItem('userId') || '用户') : '';

  return (
    <div className="order-history-page">
      <TrainListTopBar isLoggedIn={isLoggedIn} username={username} onMy12306Click={handleMy12306Click} />
      <MainNavigation
        isLoggedIn={isLoggedIn}
        onLoginClick={handleNavigateToLogin}
        onRegisterClick={handleNavigateToRegister}
        onPersonalCenterClick={handleNavigateToPersonalCenter}
      />

      <BreadcrumbNavigation
        path={['个人中心']}
        currentPage="火车票订单"
      />

      <div className="main-content">
        <SideMenu currentSection="train-orders" onMenuClick={handleMenuClick} />

        <div className="content-area">
          {isLoading ? (
            <div className="loading">加载中...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : (
            <OrderListPanel
              orders={filteredOrders}
              onSearch={handleSearch}
              onNavigateToTrainList={() => navigate('/')}
              onOrderCancelled={fetchOrders}  // 订单取消后重新获取订单列表
            />
          )}
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default OrderHistoryPage;


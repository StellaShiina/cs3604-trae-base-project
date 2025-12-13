// 用户基本信息页
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TrainListTopBar from '../components/TrainListTopBar';
import MainNavigation from '../components/MainNavigation';
import SideMenu from '../components/SideMenu';
import PersonalInfoPanel from '../components/PersonalInfo/PersonalInfoPanel';
import BreadcrumbNavigation from '../components/BreadcrumbNavigation';
import BottomNavigation from '../components/BottomNavigation';
import './PersonalInfoPage.css';

/**
 * UI-PersonalInfoPage: 用户基本信息页主容器组件
 * 整体页面背景为白色，分为上中下三大部分
 */
const PersonalInfoPage = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState<any>(null);
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
      fetchUserInfo();
    }
    
    // 监听storage事件，当其他标签页登录/登出时同步状态
    window.addEventListener('storage', checkLoginStatus);
    
    return () => {
      window.removeEventListener('storage', checkLoginStatus);
    };
  }, [navigate]);

  // 监听从手机核验页返回，自动刷新用户信息
  useEffect(() => {
    const handleFocus = () => {
      // 当页面获得焦点时（从其他页面返回），刷新用户信息
      if (isLoggedIn) {
        fetchUserInfo();
      }
    };

    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [isLoggedIn]);

  const fetchUserInfo = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // 从localStorage获取token
      const token = localStorage.getItem('authToken');
      
      const response = await fetch('/api/user/info', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          // Token失效，跳转到登录页
          navigate('/login');
          return;
        }
        throw new Error('获取用户信息失败');
      }
      
      const data = await response.json();
      setUserInfo(data);
    } catch (err) {
      setError('获取用户信息失败');
      console.error('Error fetching user info:', err);
    } finally {
      setIsLoading(false);
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

  const handleMenuClick = (section: string) => {
    switch (section) {
      case 'train-orders':
        navigate('/orders');
        break;
      case 'personal-info':
        // 已在当前页面
        break;
      case 'phone-verification':
        navigate('/phone-verification');
        break;
      case 'passengers':
        navigate('/passengers');
        break;
      default:
        break;
    }
  };

  const handleNavigateToPhoneVerification = () => {
    navigate('/phone-verification');
  };

  const handleSaveDiscountType = async (discountType: string) => {
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch('/api/user/discount-type', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ discountType })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('更新优惠类型失败，错误详情:', errorData);
        throw new Error(errorData.error || '更新优惠类型失败');
      }
      
      // 保存成功，直接更新本地状态，不刷新整个页面
      if (userInfo) {
        setUserInfo({
          ...userInfo,
          discountType: discountType
        });
      }
      console.log('✅ 优惠类型更新成功');
    } catch (err: any) {
      console.error('Error updating discount type:', err);
      alert(err.message || '更新优惠类型失败');
    }
  };

  // 获取用户名
  const username = isLoggedIn ? (localStorage.getItem('username') || localStorage.getItem('userId') || '用户') : '';

  if (isLoading) {
    return (
      <div className="personal-info-page">
        <TrainListTopBar isLoggedIn={isLoggedIn} username={username} onMy12306Click={handleMy12306Click} />
        <MainNavigation
          isLoggedIn={isLoggedIn}
          onLoginClick={handleNavigateToLogin}
          onRegisterClick={handleNavigateToRegister}
          onPersonalCenterClick={handleNavigateToPersonalCenter}
        />
        <div className="loading-container">加载中...</div>
        <BottomNavigation />
      </div>
    );
  }

  if (error) {
    return (
      <div className="personal-info-page">
        <TrainListTopBar isLoggedIn={isLoggedIn} username={username} onMy12306Click={handleMy12306Click} />
        <MainNavigation
          isLoggedIn={isLoggedIn}
          onLoginClick={handleNavigateToLogin}
          onRegisterClick={handleNavigateToRegister}
          onPersonalCenterClick={handleNavigateToPersonalCenter}
        />
        <div className="error-container">错误: {error}</div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="personal-info-page">
      <TrainListTopBar isLoggedIn={isLoggedIn} username={username} onMy12306Click={handleMy12306Click} />
      <MainNavigation
        isLoggedIn={isLoggedIn}
        onLoginClick={handleNavigateToLogin}
        onRegisterClick={handleNavigateToRegister}
        onPersonalCenterClick={handleNavigateToPersonalCenter}
      />
      
      <BreadcrumbNavigation 
        path={['个人中心']}
        currentPage="查看个人信息"
      />
      
      <div className="main-content">
        <SideMenu 
          currentSection="personal-info" 
          onMenuClick={handleMenuClick}
        />
        
        <div className="content-area">
          {userInfo && (
            <PersonalInfoPanel
              userInfo={userInfo}
              onNavigateToPhoneVerification={handleNavigateToPhoneVerification}
              onSaveDiscountType={handleSaveDiscountType}
            />
          )}
        </div>
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default PersonalInfoPage;


// 乘客管理页
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TrainListTopBar from '../components/TrainListTopBar';
import MainNavigation from '../components/MainNavigation';
import SideMenu from '../components/SideMenu';
import BreadcrumbNavigation from '../components/BreadcrumbNavigation';
import BottomNavigation from '../components/BottomNavigation';
import PassengerListPanel from '../components/Passenger/PassengerListPanel';
import AddPassengerPanel from '../components/Passenger/AddPassengerPanel';
import EditPassengerPanel from '../components/Passenger/EditPassengerPanel';
import ConfirmModal from '../components/ConfirmModal';
import SuccessModal from '../components/SuccessModal';
import './PassengerManagementPage.css';

import { API_BASE_URL } from '../config';

const PassengerManagementPage = () => {
  const navigate = useNavigate();
  const [passengers, setPassengers] = useState<any[]>([]);
  const [filteredPassengers, setFilteredPassengers] = useState<any[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentView, setCurrentView] = useState<'list' | 'add' | 'edit'>('list');
  const [editingPassenger, setEditingPassenger] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

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
      fetchPassengers();
    }
    
    // 监听storage事件，当其他标签页登录/登出时同步状态
    window.addEventListener('storage', checkLoginStatus);
    
    return () => {
      window.removeEventListener('storage', checkLoginStatus);
    };
  }, [navigate]);

  useEffect(() => {
    if (searchKeyword) {
      setFilteredPassengers(
        passengers.filter((p) =>
          p.name.toLowerCase().includes(searchKeyword.toLowerCase())
        )
      );
    } else {
      setFilteredPassengers(passengers);
    }
  }, [searchKeyword, passengers]);

  const fetchPassengers = async () => {
    try {
      setIsLoading(true);
      setError(''); // 清除之前的错误
      const token = localStorage.getItem('authToken');
      
      console.log('=== 乘客列表加载开始 ===');
      console.log('Token存在:', !!token);
      
      if (!token) {
        console.log('Token不存在，跳转登录页');
        navigate('/login');
        return;
      }
      
      const response = await fetch(`${API_BASE_URL}/passengers`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      console.log('API响应状态:', response.status);

      if (response.status === 401) {
        // Token失效，跳转到登录页
        console.log('Token失效(401)，跳转登录页');
        localStorage.removeItem('authToken');
        navigate('/login');
        return;
      }

      if (response.ok) {
        const data = await response.json();
        console.log('获取到乘客数据:', data);
        setPassengers(data || []);
        setFilteredPassengers(data || []);
        console.log('乘客列表设置成功，数量:', (data || []).length);
      } else {
        const errorText = await response.text();
        console.error('API错误响应:', errorText);
        setError(`获取乘客列表失败: ${response.status}`);
      }
    } catch (err) {
      console.error('获取乘客列表异常:', err);
      setError('获取乘客列表失败');
    } finally {
      setIsLoading(false);
      console.log('=== 乘客列表加载结束 ===');
    }
  };

  const handleMenuClick = (section: string) => {
    switch (section) {
      case 'train-orders':
        navigate('/orders');
        break;
      case 'personal-info':
        navigate('/personal-info');
        break;
      case 'phone-verification':
        navigate('/phone-verification');
        break;
      case 'passengers':
        // 已在当前页面
        break;
    }
  };

  const handleAdd = () => {
    setCurrentView('add');
  };

  const handleEdit = (passenger: any) => {
    setEditingPassenger(passenger);
    setCurrentView('edit');
  };

  const handleDelete = (passengerId: string) => {
    setPendingDeleteId(passengerId);
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    // 先关闭确认对话框
    setShowConfirmModal(false);
    
    if (!pendingDeleteId) return;

    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        console.log('Token不存在，跳转登录页');
        navigate('/login');
        return;
      }

      console.log('删除乘客，ID:', pendingDeleteId);
      const response = await fetch(`${API_BASE_URL}/passengers/${pendingDeleteId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      console.log('删除响应状态:', response.status);

      if (response.status === 401) {
        // Token失效，跳转到登录页
        console.log('Token失效(401)，跳转登录页');
        localStorage.removeItem('authToken');
        navigate('/login');
        return;
      }

      if (response.ok) {
        await fetchPassengers();
        // 使用 setTimeout 确保确认对话框完全关闭后再显示成功提示
        setTimeout(() => {
          setSuccessMessage('删除成功');
          setShowSuccessModal(true);
        }, 100);
      } else {
        // 获取具体的错误信息
        const errorData = await response.json().catch(() => ({ error: '删除失败' }));
        const errorMessage = errorData.error || '删除失败';
        console.error('删除失败:', errorMessage, errorData);
        setTimeout(() => {
          setSuccessMessage(errorMessage);
          setShowSuccessModal(true);
        }, 100);
      }
    } catch (err) {
      console.error('删除乘客异常:', err);
      setTimeout(() => {
        setSuccessMessage('删除失败，请稍后重试');
        setShowSuccessModal(true);
      }, 100);
    } finally {
      setPendingDeleteId(null);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmModal(false);
    setPendingDeleteId(null);
  };

  const handleSuccessConfirm = () => {
    setShowSuccessModal(false);
    setSuccessMessage('');
  };

  const handleAddSubmit = async (passengerData: any) => {
    try {
      const token = localStorage.getItem('authToken');
      // Map frontend fields to backend struct
      const payload = {
        name: passengerData.name,
        card_type: passengerData.idCardType,
        card_no: passengerData.idCardNumber,
        type: passengerData.discountType
      };

      const response = await fetch(`${API_BASE_URL}/passengers`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        await fetchPassengers();
        setCurrentView('list');
        // 延迟显示成功提示，确保视图切换完成
        setTimeout(() => {
          setSuccessMessage('添加成功！');
          setShowSuccessModal(true);
        }, 100);
      } else {
        const data = await response.json();
        // 检查是否是重复乘客错误
        const errorMessage = data.error || '添加失败';
        setTimeout(() => {
          setSuccessMessage(errorMessage);
          setShowSuccessModal(true);
        }, 100);
      }
    } catch (err) {
      setTimeout(() => {
        setSuccessMessage('添加失败');
        setShowSuccessModal(true);
      }, 100);
    }
  };

  const handleEditSubmit = async (passengerData: any) => {
    try {
      const token = localStorage.getItem('authToken');
      
      console.log('📝 编辑乘客请求:', {
        passengerId: editingPassenger.id,
        data: passengerData
      });
      
      const payload = {
        name: passengerData.name,
        card_type: passengerData.idCardType,
        card_no: passengerData.idCardNumber,
        type: passengerData.discountType
      };

      const response = await fetch(`${API_BASE_URL}/passengers/${editingPassenger.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      console.log('📡 响应状态:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ 更新成功:', result);
        await fetchPassengers();
        setCurrentView('list');
        setEditingPassenger(null);
        // 延迟显示成功提示，确保视图切换完成
        setTimeout(() => {
          setSuccessMessage('修改成功');
          setShowSuccessModal(true);
        }, 100);
      } else {
        const errorData = await response.json().catch(() => ({ error: '更新失败' }));
        console.error('❌ 更新失败:', errorData);
        setTimeout(() => {
          setSuccessMessage(errorData.error || '更新失败');
          setShowSuccessModal(true);
        }, 100);
      }
    } catch (err) {
      console.error('❌ 请求异常:', err);
      setTimeout(() => {
        setSuccessMessage('更新失败: ' + (err instanceof Error ? err.message : '网络错误'));
        setShowSuccessModal(true);
      }, 100);
    }
  };

  const handleCancel = () => {
    setCurrentView('list');
    setEditingPassenger(null);
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
    <div className="passenger-management-page">
      <TrainListTopBar isLoggedIn={isLoggedIn} username={username} onMy12306Click={handleMy12306Click} />
      <MainNavigation
        isLoggedIn={isLoggedIn}
        onLoginClick={handleNavigateToLogin}
        onRegisterClick={handleNavigateToRegister}
        onPersonalCenterClick={handleNavigateToPersonalCenter}
      />

      <BreadcrumbNavigation
        path={['个人中心', '常用信息管理']}
        currentPage="乘车人"
      />

      <div className="main-content">
        <SideMenu currentSection="passengers" onMenuClick={handleMenuClick} />

        <div className="content-area">
          {isLoading && (
            <div style={{ padding: '20px', textAlign: 'center' }}>
              加载中...
            </div>
          )}

          {error && !isLoading && (
            <div style={{ padding: '20px', color: 'red', textAlign: 'center' }}>
              {error}
            </div>
          )}

          {!isLoading && !error && currentView === 'list' && (
            <PassengerListPanel
              passengers={filteredPassengers}
              onAdd={handleAdd}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onSearch={setSearchKeyword}
            />
          )}

          {currentView === 'add' && (
            <AddPassengerPanel
              onSubmit={handleAddSubmit}
              onCancel={handleCancel}
            />
          )}

          {currentView === 'edit' && editingPassenger && (
            <EditPassengerPanel
              passenger={editingPassenger}
              onSubmit={handleEditSubmit}
              onCancel={handleCancel}
            />
          )}
        </div>
      </div>

      <BottomNavigation />

      <ConfirmModal
        isVisible={showConfirmModal}
        title="删除确认"
        message="确定要删除该乘客吗？"
        confirmText="确定"
        cancelText="取消"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      <SuccessModal
        isVisible={showSuccessModal}
        message={successMessage}
        onConfirm={handleSuccessConfirm}
      />
    </div>
  );
};

export default PassengerManagementPage;


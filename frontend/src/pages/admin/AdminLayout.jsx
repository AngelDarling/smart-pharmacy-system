/**
 * Modern Admin Layout with Ant Design
 * Replaces the old admin layout with a professional interface
 */

import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Layout,
  Menu,
  Button,
  Avatar,
  Dropdown,
  Typography,
  Space,
  Badge,
  theme
} from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  ShoppingOutlined,
  FolderOutlined,
  DatabaseOutlined,
  UserOutlined,
  LogoutOutlined,
  BellOutlined,
  SettingOutlined,
  TeamOutlined,
  UsergroupAddOutlined,
  HeartOutlined
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { usePermissions } from '../../hooks/usePermissions';
import api from '../../api/client.js';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const AdminLayout = () => {
  const { user, loading, logout } = useAuth();
  const { permissions } = usePermissions();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [processingOrders, setProcessingOrders] = useState(0);
  const [shippingOrders, setShippingOrders] = useState(0);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  useEffect(() => {
    let isMounted = true;
    async function loadOrderBadge() {
      try {
        const res = await api.get('/orders/stats');
        const arr = res.data?.statusBreakdown || [];
        const byStatus = Object.fromEntries(arr.map(s => [s._id, s.count]));
        const pendingCount = Number(byStatus['pending'] || 0);
        const processingCount = Number(byStatus['processing'] || 0);
        const shippingCount = Number(byStatus['shipping'] || 0);
        if (isMounted) {
          setPendingOrders(pendingCount);
          setProcessingOrders(processingCount);
          setShippingOrders(shippingCount);
        }
      } catch (error) {
        console.debug('orders stats error', error);
        if (isMounted) {
          setPendingOrders(0);
          setProcessingOrders(0);
          setShippingOrders(0);
        }
      }
    }
    loadOrderBadge();
    const intervalRef = setInterval(loadOrderBadge, 30000);
    return () => { isMounted = false; clearInterval(intervalRef); };
  }, []);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        Đang kiểm tra quyền...
      </div>
    );
  }

  // Allow admin, manager, pharmacist, and staff to access admin panel
  const allowedRoles = ['admin', 'manager', 'pharmacist', 'staff'];
  
  if (!user || !allowedRoles.includes(user.role)) {
    navigate('/admin/login');
    return null;
  }

  // Menu items - dynamically generated based on permissions
  const menuItems = [
    {
      key: '/admin/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    // Products section
    ...(permissions.canReadProducts() || permissions.canReadCategories() ? [{
      key: 'products',
      icon: <ShoppingOutlined />,
      label: 'Sản phẩm',
      children: [
        ...(permissions.canReadProducts() ? [{
          key: '/admin/products',
          label: 'Sản phẩm',
        }] : []),
        {
          key: '/admin/brands',
          label: 'Thương hiệu',
        },
        ...(permissions.canReadCategories() ? [{
          key: '/admin/categories',
          label: 'Danh mục',
        }] : []),
        {
          key: '/admin/coupons',
          label: 'Mã khuyến mãi',
        },
        {
          key: '/admin/reviews',
          label: 'Đánh giá sản phẩm',
        },
        {
          key: '/admin/health-checks',
          label: 'Kiểm tra sức khỏe',
        },
      ].filter(Boolean),
    }] : []),
    // Orders section
    ...[{
      key: 'orders',
      icon: <FolderOutlined />,
      label: (
        <span style={{ position: 'relative', display: 'inline-block', paddingRight: 14 }}>
          Quản lý đơn hàng
          {pendingOrders > 0 && (
            <Badge count={pendingOrders} size="small" style={{ backgroundColor: '#ef4444', pointerEvents: 'none' }} offset={[10, -6]} />
          )}
        </span>
      ),
      children: [
        {
          key: '/admin/orders',
          label: (
            <span style={{ position: 'relative', display: 'inline-block', paddingRight: 14 }}>
              Đơn hàng
              {pendingOrders > 0 && (
                <Badge count={pendingOrders} size="small" style={{ backgroundColor: '#ef4444', pointerEvents: 'none' }} offset={[10, -6]} />
              )}
            </span>
          ),
        },
        {
          key: '/admin/orders/shipping',
          label: 'Đơn đang giao',
        },
        {
          key: '/admin/orders/tracking',
          label: 'Theo dõi đơn hàng',
        },
        {
          key: '/admin/orders/invoices',
          label: 'Hóa đơn',
        },
      ],
    }],
    // Inventory section
    ...(permissions.canReadInventory() ? [{
      key: 'inventory',
      icon: <DatabaseOutlined />,
      label: 'Quản lý tồn kho',
      children: [
        {
          key: '/admin/inventory',
          label: 'Nhập/Xuất kho',
        },
        {
          key: '/admin/goods-receipts',
          label: 'Phiếu nhập',
        },
        {
          key: '/admin/inventory-alerts',
          label: 'Cảnh báo tồn kho',
        },
        {
          key: '/admin/suppliers',
          label: 'Nhà cung cấp',
        },
        {
          key: '/admin/sales-report',
          label: 'Báo cáo bán hàng',
        },
      ],
    }] : []),
    // Users section
    ...(permissions.canReadUsers() || permissions.canManageStaff() ? [{
      key: 'users',
      icon: <UsergroupAddOutlined />,
      label: 'Quản lý người dùng',
      children: [
        ...(permissions.canReadUsers() ? [{
          key: '/admin/users',
          label: 'Người dùng',
        }] : []),
        ...(permissions.canManageStaff() ? [{
          key: '/admin/staff',
          label: 'Nhân viên',
        }] : []),
      ].filter(Boolean),
    }] : []),
  ].filter(Boolean);

  // User dropdown menu
  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Thông tin cá nhân',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Cài đặt',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      danger: true,
    },
  ];

  // Handle menu click
  const handleMenuClick = ({ key }) => {
    if (key === 'logout') {
      logout();
    } else if (key.startsWith('/admin/')) {
      navigate(key);
    }
  };

  // Handle user menu click
  const handleUserMenuClick = ({ key }) => {
    if (key === 'logout') {
      logout();
    } else if (key === 'profile') {
      navigate('/admin/profile');
    } else if (key === 'settings') {
      navigate('/admin/settings');
    }
  };

  // Get selected keys based on current path
  const getSelectedKeys = () => {
    const path = location.pathname;
    if (path === '/admin/dashboard') return ['/admin/dashboard'];
    if (path.startsWith('/admin/products') || path.startsWith('/admin/categories')) {
      return ['products'];
    }
    if (path.startsWith('/admin/orders')) {
      return ['orders'];
    }
    if (path.startsWith('/admin/inventory') || path.startsWith('/admin/suppliers') || path.startsWith('/admin/goods-receipts') || path.startsWith('/admin/inventory-alerts') || path.startsWith('/admin/sales-report')) {
      return ['inventory'];
    }
    if (path.startsWith('/admin/users') || path.startsWith('/admin/staff')) {
      return ['users'];
    }
    return [];
  };

  // Get open keys based on current path
  const getOpenKeys = () => {
    const path = location.pathname;
    if (path.startsWith('/admin/products') || path.startsWith('/admin/categories')) {
      return ['products'];
    }
    if (path.startsWith('/admin/orders')) {
      return ['orders'];
    }
    if (path.startsWith('/admin/inventory') || path.startsWith('/admin/suppliers') || path.startsWith('/admin/goods-receipts') || path.startsWith('/admin/inventory-alerts') || path.startsWith('/admin/sales-report')) {
      return ['inventory'];
    }
    if (path.startsWith('/admin/users') || path.startsWith('/admin/staff')) {
      return ['users'];
    }
    return [];
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        style={{
          background: colorBgContainer,
          boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
        }}
      >
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid #f0f0f0',
          marginBottom: 16,
        }}>
          <Text strong style={{ fontSize: collapsed ? 16 : 18, color: '#1890ff' }}>
            {collapsed ? 'SP' : 'Smart Pharmacy'}
          </Text>
        </div>
        
        <Menu
          mode="inline"
          selectedKeys={getSelectedKeys()}
          defaultOpenKeys={getOpenKeys()}
          items={menuItems}
          onClick={handleMenuClick}
          style={{
            border: 'none',
            background: 'transparent',
          }}
        />
      </Sider>
      
      <Layout>
        <Header style={{
          padding: '0 24px',
          background: colorBgContainer,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
            }}
          />
          
          <Space size="middle">
            <Dropdown
              trigger={["click"]}
              placement="bottomRight"
              menu={{
                items: [
                  {
                    key: 'orders-pending',
                    label: (
                      <div onClick={() => navigate('/admin/orders')} style={{ minWidth: 280 }}>
                        <div style={{ fontWeight: 600, marginBottom: 8 }}>Thông báo</div>
                        <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
                          {pendingOrders > 0 || processingOrders > 0 || shippingOrders > 0 ? (
                            <>
                              {pendingOrders > 0 && (
                                <div style={{ marginBottom: 4 }}>Có {pendingOrders} đơn hàng chờ xử lý</div>
                              )}
                              {processingOrders > 0 && (
                                <div style={{ marginBottom: 4 }}>Có {processingOrders} đơn hàng đang xử lý</div>
                              )}
                              {shippingOrders > 0 && (
                                <div style={{ marginBottom: 4 }}>Có {shippingOrders} đơn hàng đang giao</div>
                              )}
                            </>
                          ) : (
                            'Chưa có thông báo mới'
                          )}
                        </div>
                        <div style={{ marginTop: 8, color: '#1d4ed8', cursor: 'pointer' }}>Xem danh sách đơn hàng</div>
                      </div>
                    )
                  }
                ]
              }}
            >
              <Badge count={pendingOrders + processingOrders + shippingOrders} size="small" overflowCount={99}>
                <Button type="text" icon={<BellOutlined />} />
              </Badge>
            </Dropdown>
            
            <Dropdown
              menu={{
                items: userMenuItems,
                onClick: handleUserMenuClick,
              }}
              placement="bottomRight"
              arrow
            >
              <Space style={{ cursor: 'pointer' }}>
                <Avatar 
                  size="small" 
                  icon={<UserOutlined />}
                  style={{ backgroundColor: '#1890ff' }}
                />
                <Text strong>{user.name}</Text>
              </Space>
            </Dropdown>
          </Space>
        </Header>
        
        <Content style={{
          margin: '24px 16px',
          padding: 24,
          minHeight: 280,
          background: colorBgContainer,
          borderRadius: borderRadiusLG,
        }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;

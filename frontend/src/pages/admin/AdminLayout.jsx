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
    // Health News section
    ...(permissions.canViewHealthNews() ? [{
      key: 'health-news',
      icon: <HeartOutlined />,
      label: 'Tin tức sức khỏe',
      children: [
        {
          key: '/admin/health-news',
          label: 'Quản lý bài viết',
        },
        {
          key: '/admin/health-news/categories',
          label: 'Quản lý danh mục',
        },
      ],
    }] : []),
    // Orders section
    ...(permissions.canViewOrders() ? [{
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
    }] : []),
    // Inventory section
    ...(permissions.canReadInventory() ? [{
      key: 'inventory',
      icon: <DatabaseOutlined />,
      label: 'Quản lý tồn kho',
      children: [
        {
          key: '/admin/inventory',
          label: 'Quản lý tồn kho',
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
          key: '/admin/customers',
          label: 'Khách hàng',
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
    if (path.startsWith('/admin/health-news')) {
      return ['health-news'];
    }
    if (path.startsWith('/admin/orders')) {
      return ['orders'];
    }
    if (path.startsWith('/admin/inventory') || path.startsWith('/admin/suppliers') || path.startsWith('/admin/sales-report')) {
      return ['inventory'];
    }
    if (path.startsWith('/admin/customers') || path.startsWith('/admin/staff')) {
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
    if (path.startsWith('/admin/health-news')) {
      return ['health-news'];
    }
    if (path.startsWith('/admin/orders')) {
      return ['orders'];
    }
    if (path.startsWith('/admin/inventory') || path.startsWith('/admin/suppliers') || path.startsWith('/admin/sales-report')) {
      return ['inventory'];
    }
    if (path.startsWith('/admin/customers') || path.startsWith('/admin/staff')) {
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
        width={260}
        style={{
          background: 'linear-gradient(180deg, #1e40af 0%, #2563eb 50%, #3b82f6 100%)',
          boxShadow: '4px 0 24px rgba(0,0,0,0.12)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative background pattern */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.08) 0%, transparent 50%)',
          pointerEvents: 'none',
        }} />

        {/* Logo section */}
        <div style={{
          height: 80,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.15)',
          marginBottom: 16,
          padding: '16px',
          position: 'relative',
        }}>
          {!collapsed && (
            <Text strong style={{
              fontSize: 20,
              color: '#67e8f9',
              letterSpacing: '1px',
              textShadow: '0 2px 8px rgba(103, 232, 249, 0.4)',
              fontWeight: 700,
            }}>
              Smart Pharmacy
            </Text>
          )}
          {collapsed && (
            <Text strong style={{
              fontSize: 18,
              color: '#67e8f9',
              letterSpacing: '0.5px',
              textShadow: '0 2px 8px rgba(103, 232, 249, 0.4)',
              fontWeight: 700,
            }}>
              SP
            </Text>
          )}
        </div>

        {/* Menu */}
        <Menu
          mode="inline"
          selectedKeys={getSelectedKeys()}
          defaultOpenKeys={getOpenKeys()}
          items={menuItems}
          onClick={handleMenuClick}
          style={{
            border: 'none',
            background: 'transparent',
            color: '#fff',
          }}
          theme="dark"
          className="custom-sidebar-menu"
        />

        {/* Add custom CSS for menu styling */}
        <style>{`
          .custom-sidebar-menu .ant-menu-item,
          .custom-sidebar-menu .ant-menu-submenu-title {
            border-radius: 8px;
            margin: 4px 8px;
            transition: all 0.3s ease;
            color: rgba(255,255,255,0.95) !important;
          }
          
          .custom-sidebar-menu .ant-menu-item:hover,
          .custom-sidebar-menu .ant-menu-submenu-title:hover {
            background: rgba(255,255,255,0.2) !important;
            transform: translateX(4px);
            color: #fff !important;
          }
          
          .custom-sidebar-menu .ant-menu-item-selected {
            background: rgba(255,255,255,0.25) !important;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            color: #fff !important;
          }
          
          .custom-sidebar-menu .ant-menu-item-selected::after {
            border-right: 3px solid #60a5fa;
          }
          
          .custom-sidebar-menu .ant-menu-submenu-open > .ant-menu-submenu-title {
            background: rgba(255,255,255,0.15) !important;
            color: #fff !important;
          }
          
          .custom-sidebar-menu .ant-menu-sub {
            background: rgba(0,0,0,0.15) !important;
          }
          
          .custom-sidebar-menu .ant-menu-sub .ant-menu-item {
            color: rgba(255,255,255,0.9) !important;
          }
          
          .custom-sidebar-menu .ant-menu-item .ant-menu-item-icon,
          .custom-sidebar-menu .ant-menu-submenu-title .ant-menu-item-icon {
            font-size: 18px;
            color: rgba(255,255,255,0.95) !important;
          }
          
          .custom-sidebar-menu .ant-badge {
            color: #fff;
          }
          
          .custom-sidebar-menu .ant-menu-submenu-arrow {
            color: rgba(255,255,255,0.8) !important;
          }
        `}</style>
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

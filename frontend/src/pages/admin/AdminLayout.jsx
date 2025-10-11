/**
 * Modern Admin Layout with Ant Design
 * Replaces the old admin layout with a professional interface
 */

import React, { useState } from 'react';
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
  UsergroupAddOutlined
} from '@ant-design/icons';
import useAuth from '../../hooks/useAuth';
import { usePermissions } from '../../hooks/usePermissions';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const AdminLayout = () => {
  const { user, loading, logout } = useAuth();
  const { permissions } = usePermissions();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

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
        ...(permissions.canReadCategories() ? [{
          key: '/admin/categories',
          label: 'Danh mục',
        }] : []),
      ].filter(Boolean),
    }] : []),
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
    if (path.startsWith('/admin/inventory') || path.startsWith('/admin/suppliers') || path.startsWith('/admin/goods-receipts') || path.startsWith('/admin/inventory-alerts')) {
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
    if (path.startsWith('/admin/inventory') || path.startsWith('/admin/suppliers') || path.startsWith('/admin/goods-receipts') || path.startsWith('/admin/inventory-alerts')) {
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
            <Badge count={5} size="small">
              <Button type="text" icon={<BellOutlined />} />
            </Badge>
            
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

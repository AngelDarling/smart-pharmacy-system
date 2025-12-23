/**
 * ProtectedRoute Component
 * Route protection based on granular resource permissions
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import { Result, Button } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext.jsx';
import { usePermissions } from '../hooks/usePermissions';

const ProtectedRoute = ({
  children,
  resource,
  action = 'view',
  // Legacy props for backward compatibility
  requiredPermission,
  requiredPermissions = [],
  requireAll = false,
  fallback = null
}) => {
  const { user, loading } = useAuth();
  const { hasPermission, isAdmin } = usePermissions();

  // Show loading while checking auth
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        Đang kiểm tra quyền truy cập...
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  // Check permissions
  const checkPermission = () => {
    // Admin has all permissions
    if (isAdmin) {
      return true;
    }

    // New granular permission check (resource-based)
    if (resource) {
      return hasPermission(resource, action);
    }

    // Legacy permission checks - map to new structure
    if (requiredPermission) {
      // Map legacy permissions to new resource-based permissions
      const legacyPermissionMap = {
        'read_products': () => hasPermission('products', 'view'),
        'write_products': () => hasPermission('products', 'edit'),
        'delete_products': () => hasPermission('products', 'delete'),
        'read_categories': () => hasPermission('products', 'view'),
        'write_categories': () => hasPermission('products', 'edit'),
        'delete_categories': () => hasPermission('products', 'delete'),
        'read_users': () => hasPermission('staff', 'view'),
        'write_users': () => hasPermission('staff', 'edit'),
        'delete_users': () => hasPermission('staff', 'delete'),
        'manage_staff': () => hasPermission('staff', 'permissions'),
        'read_orders': () => hasPermission('orders', 'view'),
        'write_orders': () => hasPermission('orders', 'edit'),
        'delete_orders': () => hasPermission('orders', 'delete'),
        'read_inventory': () => hasPermission('inventory', 'view'),
        'write_inventory': () => hasPermission('inventory', 'edit'),
        'delete_inventory': () => hasPermission('inventory', 'delete'),
        'read_reports': () => hasPermission('reports', 'view'),
        'write_reports': () => hasPermission('reports', 'export'),
        'manage_settings': () => hasPermission('settings', 'edit'),
        'manage_content': () => hasPermission('healthNews', 'view')
      };

      const checkFunc = legacyPermissionMap[requiredPermission];
      return checkFunc ? checkFunc() : false;
    }

    if (requiredPermissions.length > 0) {
      // Map each legacy permission and check
      const checks = requiredPermissions.map(permission => {
        const legacyPermissionMap = {
          'read_products': () => hasPermission('products', 'view'),
          'write_products': () => hasPermission('products', 'edit'),
          'delete_products': () => hasPermission('products', 'delete'),
          'read_categories': () => hasPermission('products', 'view'),
          'write_categories': () => hasPermission('products', 'edit'),
          'delete_categories': () => hasPermission('products', 'delete'),
          'read_users': () => hasPermission('staff', 'view'),
          'write_users': () => hasPermission('staff', 'edit'),
          'delete_users': () => hasPermission('staff', 'delete'),
          'manage_staff': () => hasPermission('staff', 'permissions'),
          'read_orders': () => hasPermission('orders', 'view'),
          'write_orders': () => hasPermission('orders', 'edit'),
          'delete_orders': () => hasPermission('orders', 'delete'),
          'read_inventory': () => hasPermission('inventory', 'view'),
          'write_inventory': () => hasPermission('inventory', 'edit'),
          'delete_inventory': () => hasPermission('inventory', 'delete'),
          'read_reports': () => hasPermission('reports', 'view'),
          'write_reports': () => hasPermission('reports', 'export'),
          'manage_settings': () => hasPermission('settings', 'edit'),
          'manage_content': () => hasPermission('healthNews', 'edit')
        };

        const checkFunc = legacyPermissionMap[permission];
        return checkFunc ? checkFunc() : false;
      });

      if (requireAll) {
        return checks.every(check => check);
      } else {
        return checks.some(check => check);
      }
    }

    return true;
  };

  if (!checkPermission()) {
    if (fallback) {
      return fallback;
    }

    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh',
        padding: '20px'
      }}>
        <Result
          status="403"
          title="403"
          subTitle="Xin lỗi, bạn không có quyền truy cập trang này."
          icon={<LockOutlined style={{ fontSize: 72, color: '#ff4d4f' }} />}
          extra={
            <Button type="primary" onClick={() => window.history.back()}>
              Quay lại
            </Button>
          }
        />
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;

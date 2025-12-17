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

    // Legacy permission checks (for backward compatibility)
    if (requiredPermission) {
      return user.permissions && user.permissions.includes(requiredPermission);
    }

    if (requiredPermissions.length > 0) {
      if (requireAll) {
        return requiredPermissions.every(permission =>
          user.permissions && user.permissions.includes(permission)
        );
      } else {
        return requiredPermissions.some(permission =>
          user.permissions && user.permissions.includes(permission)
        );
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

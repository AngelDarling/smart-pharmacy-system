/**
 * ProtectedRoute Component
 * Route protection based on permissions
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import { Result, Button } from 'antd';
import useAuth from '../hooks/useAuth';

const ProtectedRoute = ({ 
  children, 
  requiredPermission, 
  requiredPermissions = [], 
  requireAll = false,
  fallback = null 
}) => {
  const { user, loading } = useAuth();

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
  const hasPermission = () => {
    // Admin has all permissions
    if (user.role === 'admin') {
      return true;
    }

    // Single permission check
    if (requiredPermission) {
      return user.permissions && user.permissions.includes(requiredPermission);
    }

    // Multiple permissions check
    if (requiredPermissions.length > 0) {
      if (requireAll) {
        // User needs ALL permissions
        return requiredPermissions.every(permission => 
          user.permissions && user.permissions.includes(permission)
        );
      } else {
        // User needs ANY permission
        return requiredPermissions.some(permission => 
          user.permissions && user.permissions.includes(permission)
        );
      }
    }

    return true;
  };

  if (!hasPermission()) {
    if (fallback) {
      return fallback;
    }

    return (
      <Result
        status="403"
        title="403"
        subTitle="Xin lỗi, bạn không có quyền truy cập trang này."
        extra={
          <Button type="primary" onClick={() => window.history.back()}>
            Quay lại
          </Button>
        }
      />
    );
  }

  return children;
};

export default ProtectedRoute;

/**
 * usePermissions Hook
 * Utility hook for checking user permissions
 */

import { useMemo } from 'react';
import useAuth from './useAuth';

export const usePermissions = () => {
  const { user } = useAuth();

  const hasPermission = (permission) => {
    if (!user) return false;
    
    // Admin has all permissions
    if (user.role === 'admin') return true;
    
    return user.permissions && user.permissions.includes(permission);
  };

  const hasAnyPermission = (permissions) => {
    if (!user) return false;
    
    // Admin has all permissions
    if (user.role === 'admin') return true;
    
    return permissions.some(permission => 
      user.permissions && user.permissions.includes(permission)
    );
  };

  const hasAllPermissions = (permissions) => {
    if (!user) return false;
    
    // Admin has all permissions
    if (user.role === 'admin') return true;
    
    return permissions.every(permission => 
      user.permissions && user.permissions.includes(permission)
    );
  };

  const canRead = (resource) => {
    return hasPermission(`read_${resource}`);
  };

  const canWrite = (resource) => {
    return hasPermission(`write_${resource}`);
  };

  const canDelete = (resource) => {
    return hasPermission(`delete_${resource}`);
  };

  const canManage = (resource) => {
    return hasPermission(`manage_${resource}`);
  };

  // Common permission checks - memoized to prevent infinite loops
  const permissions = useMemo(() => ({
    // Users
    canReadUsers: () => hasPermission('read_users'),
    canWriteUsers: () => hasPermission('write_users'),
    canDeleteUsers: () => hasPermission('delete_users'),
    
    // Staff
    canManageStaff: () => hasPermission('manage_staff'),
    
    // Products
    canReadProducts: () => hasPermission('read_products'),
    canWriteProducts: () => hasPermission('write_products'),
    canDeleteProducts: () => hasPermission('delete_products'),
    
    // Categories
    canReadCategories: () => hasPermission('read_categories'),
    canWriteCategories: () => hasPermission('write_categories'),
    canDeleteCategories: () => hasPermission('delete_categories'),
    
    // Orders
    canReadOrders: () => hasPermission('read_orders'),
    canWriteOrders: () => hasPermission('write_orders'),
    canDeleteOrders: () => hasPermission('delete_orders'),
    
    // Inventory
    canReadInventory: () => hasPermission('read_inventory'),
    canWriteInventory: () => hasPermission('write_inventory'),
    canDeleteInventory: () => hasPermission('delete_inventory'),
    
    // Reports
    canReadReports: () => hasPermission('read_reports'),
    canWriteReports: () => hasPermission('write_reports'),
    
    // Settings
    canManageSettings: () => hasPermission('manage_settings')
  }), [user?.role, user?.permissions]);

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canRead,
    canWrite,
    canDelete,
    canManage,
    permissions,
    userRole: user?.role,
    userPermissions: user?.permissions || []
  };
};

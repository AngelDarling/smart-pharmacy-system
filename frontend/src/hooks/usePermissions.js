/**
 * usePermissions Hook
 * Utility hook for checking user permissions with granular resource-based permissions
 */

import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';

export const usePermissions = () => {
  const { user } = useAuth();

  // Check if user has specific permission for a resource
  const hasPermission = (resource, action) => {
    if (!user) return false;
    
    // Admin always has all permissions
    if (user.role === 'admin') return true;
    
    // Check granular permissions (Map-based)
    if (user.permissions) {
      // Convert Map to object if needed
      const perms = user.permissions instanceof Map 
        ? Object.fromEntries(user.permissions)
        : user.permissions;
      
      const resourcePerms = perms[resource] || [];
      return resourcePerms.includes(action) || resourcePerms.includes('manage');
    }
    
    return false;
  };

  // Check if user can view a resource
  const canView = (resource) => hasPermission(resource, 'view');
  
  // Check if user can create in a resource
  const canCreate = (resource) => hasPermission(resource, 'create');
  
  // Check if user can edit a resource
  const canEdit = (resource) => hasPermission(resource, 'edit');
  
  // Check if user can delete from a resource
  const canDelete = (resource) => hasPermission(resource, 'delete');
  
  // Check if user can manage a resource (full access)
  const canManage = (resource) => hasPermission(resource, 'manage');

  // Legacy permission checks (for backward compatibility)
  const hasLegacyPermission = (permission) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return user.permissions && user.permissions.includes(permission);
  };

  // Common permission checks - memoized
  const permissions = useMemo(() => ({
    // Dashboard
    canViewDashboard: () => canView('dashboard'),
    
    // Products
    canViewProducts: () => canView('products'),
    canCreateProducts: () => canCreate('products'),
    canEditProducts: () => canEdit('products'),
    canDeleteProducts: () => canDelete('products'),
    
    // Inventory
    canViewInventory: () => canView('inventory'),
    canCreateInventory: () => canCreate('inventory'),
    canEditInventory: () => canEdit('inventory'),
    canDeleteInventory: () => canDelete('inventory'),
    
    // Orders
    canViewOrders: () => canView('orders'),
    canCreateOrders: () => canCreate('orders'),
    canEditOrders: () => canEdit('orders'),
    canDeleteOrders: () => canDelete('orders'),
    canCancelOrders: () => hasPermission('orders', 'cancel'),
    
    // Customers
    canViewCustomers: () => canView('customers'),
    canEditCustomers: () => canEdit('customers'),
    canDeleteCustomers: () => canDelete('customers'),
    
    // Staff
    canViewStaff: () => canView('staff'),
    canCreateStaff: () => canCreate('staff'),
    canEditStaff: () => canEdit('staff'),
    canDeleteStaff: () => canDelete('staff'),
    canManagePermissions: () => hasPermission('staff', 'permissions'),
    
    // Reports
    canViewReports: () => canView('reports'),
    canExportReports: () => hasPermission('reports', 'export'),
    
    // Settings
    canViewSettings: () => canView('settings'),
    canEditSettings: () => canEdit('settings'),
    
    // Promotions
    canViewPromotions: () => canView('promotions'),
    canCreatePromotions: () => canCreate('promotions'),
    canEditPromotions: () => canEdit('promotions'),
    canDeletePromotions: () => canDelete('promotions'),
    
    // Health News
    canViewHealthNews: () => canView('healthNews'),
    canCreateHealthNews: () => canCreate('healthNews'),
    canEditHealthNews: () => canEdit('healthNews'),
    canDeleteHealthNews: () => canDelete('healthNews'),
    
    // Legacy - for backward compatibility
    canReadUsers: () => hasLegacyPermission('read_users') || canView('staff'),
    canWriteUsers: () => hasLegacyPermission('write_users') || canEdit('staff'),
    canDeleteUsers: () => hasLegacyPermission('delete_users') || canDelete('staff'),
    canManageStaff: () => hasLegacyPermission('manage_staff') || canManage('staff'),
    canReadProducts: () => hasLegacyPermission('read_products') || canView('products'),
    canWriteProducts: () => hasLegacyPermission('write_products') || canEdit('products'),
    canReadCategories: () => hasLegacyPermission('read_categories') || canView('products'),
    canWriteCategories: () => hasLegacyPermission('write_categories') || canEdit('products'),
    canDeleteCategories: () => hasLegacyPermission('delete_categories') || canDelete('products'),
    canReadOrders: () => hasLegacyPermission('read_orders') || canView('orders'),
    canWriteOrders: () => hasLegacyPermission('write_orders') || canEdit('orders'),
    canReadInventory: () => hasLegacyPermission('read_inventory') || canView('inventory'),
    canWriteInventory: () => hasLegacyPermission('write_inventory') || canEdit('inventory'),
    canReadReports: () => hasLegacyPermission('read_reports') || canView('reports'),
    canManageSettings: () => hasLegacyPermission('manage_settings') || canEdit('settings')
  }), [user?.role, user?.permissions]);

  return {
    hasPermission,
    canView,
    canCreate,
    canEdit,
    canDelete,
    canManage,
    permissions,
    userRole: user?.role,
    userPermissions: user?.permissions || {},
    isAdmin: user?.role === 'admin'
  };
};

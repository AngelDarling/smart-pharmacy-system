// Permission categories and templates
export const PERMISSION_CATEGORIES = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: 'DashboardOutlined',
    permissions: ['view']
  },
  {
    key: 'products',
    label: 'Quản Lý Sản Phẩm',
    icon: 'ShoppingOutlined',
    permissions: ['view', 'create', 'edit', 'delete']
  },
  {
    key: 'brands',
    label: 'Quản Lý Thương Hiệu',
    icon: 'TagsOutlined',
    permissions: ['view', 'create', 'edit', 'delete']
  },
  {
    key: 'categories',
    label: 'Quản Lý Danh Mục',
    icon: 'AppstoreOutlined',
    permissions: ['view', 'create', 'edit', 'delete']
  },
  {
    key: 'inventory',
    label: 'Quản Lý Tồn Kho',
    icon: 'InboxOutlined',
    permissions: ['view', 'create', 'edit', 'delete']
  },
  {
    key: 'suppliers',
    label: 'Quản Lý Nhà Cung Cấp',
    icon: 'ShopOutlined',
    permissions: ['view', 'create', 'edit', 'delete']
  },
  {
    key: 'orders',
    label: 'Quản Lý Đơn Hàng',
    icon: 'ShoppingCartOutlined',
    permissions: ['view', 'create', 'edit', 'delete', 'cancel']
  },
  {
    key: 'customers',
    label: 'Quản Lý Khách Hàng',
    icon: 'UserOutlined',
    permissions: ['view', 'edit', 'delete']
  },
  {
    key: 'staff',
    label: 'Quản Lý Nhân Viên',
    icon: 'TeamOutlined',
    permissions: ['view', 'create', 'edit', 'delete', 'permissions']
  },
  {
    key: 'reports',
    label: 'Báo Cáo',
    icon: 'BarChartOutlined',
    permissions: ['view', 'export']
  },
  {
    key: 'settings',
    label: 'Cài Đặt',
    icon: 'SettingOutlined',
    permissions: ['view', 'edit']
  },
  {
    key: 'promotions',
    label: 'Khuyến Mãi',
    icon: 'GiftOutlined',
    permissions: ['view', 'create', 'edit', 'delete']
  },
  {
    key: 'reviews',
    label: 'Đánh Giá Sản Phẩm',
    icon: 'StarOutlined',
    permissions: ['view', 'edit', 'delete']
  },
  {
    key: 'healthChecks',
    label: 'Kiểm Tra Sức Khỏe',
    icon: 'MedicineBoxOutlined',
    permissions: ['view', 'create', 'edit', 'delete']
  },
  {
    key: 'healthNews',
    label: 'Tin Tức Sức Khỏe',
    icon: 'FileTextOutlined',
    permissions: ['view', 'create', 'edit', 'delete']
  }
];

export const PERMISSION_LABELS = {
  view: 'Xem',
  create: 'Tạo mới',
  edit: 'Chỉnh sửa',
  delete: 'Xóa',
  cancel: 'Hủy',
  permissions: 'Phân quyền',
  export: 'Xuất dữ liệu'
};

export const PERMISSION_TEMPLATES = {
  admin: {
    dashboard: ['view'],
    products: ['view', 'create', 'edit', 'delete'],
    brands: ['view', 'create', 'edit', 'delete'],
    categories: ['view', 'create', 'edit', 'delete'],
    inventory: ['view', 'create', 'edit', 'delete'],
    suppliers: ['view', 'create', 'edit', 'delete'],
    orders: ['view', 'create', 'edit', 'delete', 'cancel'],
    customers: ['view', 'edit', 'delete'],
    staff: ['view', 'create', 'edit', 'delete', 'permissions'],
    reports: ['view', 'export'],
    settings: ['view', 'edit'],
    promotions: ['view', 'create', 'edit', 'delete'],
    reviews: ['view', 'edit', 'delete'],
    healthChecks: ['view', 'create', 'edit', 'delete'],
    healthNews: ['view', 'create', 'edit', 'delete']
  },
  manager: {
    dashboard: ['view'],
    products: ['view', 'create', 'edit'],
    brands: ['view', 'create', 'edit'],
    categories: ['view', 'create', 'edit'],
    inventory: ['view', 'create', 'edit'],
    suppliers: ['view', 'edit'],
    orders: ['view', 'edit', 'cancel'],
    customers: ['view', 'edit'],
    staff: ['view'],
    reports: ['view', 'export'],
    promotions: ['view', 'edit'],
    reviews: ['view', 'edit'],
    healthChecks: ['view', 'edit'],
    healthNews: ['view', 'edit']
  },
  staff: {
    dashboard: ['view'],
    products: ['view'],
    brands: ['view'],
    categories: ['view'],
    orders: ['view'],
    customers: ['view']
  },
  pharmacist: {
    dashboard: ['view'],
    products: ['view', 'edit'],
    brands: ['view'],
    categories: ['view'],
    inventory: ['view'],
    orders: ['view', 'edit'],
    customers: ['view'],
    reports: ['view'],
    promotions: ['view'],
    reviews: ['view'],
    healthChecks: ['view']
  }
};

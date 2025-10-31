/**
 * Staff Management Page
 * Specialized management for staff members
 */

import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Input,
  Select,
  Tag,
  Avatar,
  Popconfirm,
  Tooltip,
  Row,
  Col,
  Typography,
  Form,
  Switch,
  Badge,
  Statistic,
  Dropdown,
  Menu,
  Progress
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  FilterOutlined,
  ReloadOutlined,
  TeamOutlined,
  SettingOutlined,
  EyeOutlined,
  MoreOutlined,
  ClearOutlined,
  UserAddOutlined,
  UserDeleteOutlined,
  CrownOutlined,
  SafetyOutlined,
  CalendarOutlined,
  DollarOutlined,
  IdcardOutlined
} from '@ant-design/icons';
import { useUsers } from '../../../hooks/admin/useUsers';
import { usePermissions } from '../../../hooks/usePermissions';
import UserForm from '../../../components/admin/UserForm';

const { Search } = Input;
const { Option } = Select;

const StaffManagement = () => {
  const {
    users,
    loading,
    pagination,
    stats,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    bulkUpdateUsers,
    handleTableChange
  } = useUsers();

  const { permissions } = usePermissions();

  const [filters, setFilters] = useState({
    search: '',
    role: '',
    isActive: undefined,
    department: ''
  });
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [isUserFormVisible, setIsUserFormVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Staff roles only
  const staffRoles = ['staff', 'manager', 'pharmacist', 'admin'];

  // Department options
  const departmentOptions = [
    'Bán hàng',
    'Kho',
    'Kế toán',
    'Dược',
    'Quản lý',
    'IT',
    'Marketing'
  ];

  // Position options by department
  const positionOptions = {
    'Bán hàng': ['Nhân viên bán hàng', 'Trưởng nhóm bán hàng', 'Giám đốc bán hàng'],
    'Kho': ['Nhân viên kho', 'Trưởng kho', 'Giám đốc kho'],
    'Kế toán': ['Kế toán viên', 'Kế toán trưởng', 'Giám đốc tài chính'],
    'Dược': ['Dược sĩ', 'Dược sĩ trưởng', 'Giám đốc dược'],
    'Quản lý': ['Quản lý', 'Giám đốc', 'CEO'],
    'IT': ['Lập trình viên', 'Kỹ sư hệ thống', 'Giám đốc IT'],
    'Marketing': ['Chuyên viên marketing', 'Trưởng phòng marketing', 'Giám đốc marketing']
  };

  // Filter users to show only staff (include admin users)
  const staffUsers = users.filter(user => {
    // Include all staff roles
    if (staffRoles.includes(user.role)) {
      // For admin role, always include (they are administrators)
      if (user.role === 'admin') {
        return true;
      }
      // For other roles, include if they have employee info
      return user.employeeId || user.department || user.position;
    }
    return false;
  });

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Apply filters
  const applyFilters = () => {
    fetchUsers({ ...filters, role: filters.role || undefined });
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      search: '',
      role: '',
      isActive: undefined,
      department: ''
    });
    fetchUsers({});
  };

  // Handle search
  const handleSearch = (value) => {
    handleFilterChange('search', value);
    fetchUsers({ ...filters, search: value });
  };

  // Handle delete user
  const handleDeleteUser = async (userId) => {
    try {
      await deleteUser(userId);
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    try {
      await bulkUpdateUsers(selectedRowKeys, { isActive: false });
      setSelectedRowKeys([]);
    } catch (error) {
      console.error('Bulk delete error:', error);
    }
  };

  // Handle bulk status update
  const handleBulkStatusUpdate = async (status) => {
    try {
      await bulkUpdateUsers(selectedRowKeys, { isActive: status });
      setSelectedRowKeys([]);
    } catch (error) {
      console.error('Bulk status update error:', error);
    }
  };

  // Handle status toggle
  const handleStatusToggle = async (userId, currentStatus) => {
    try {
      await toggleUserStatus(userId);
    } catch (error) {
      console.error('Status toggle error:', error);
    }
  };

  // Handle add user
  const handleAddUser = () => {
    setEditingUser(null);
    setIsUserFormVisible(true);
  };

  // Handle edit user
  const handleEditUser = (user) => {
    setEditingUser(user);
    setIsUserFormVisible(true);
  };

  // Handle user form submit
  const handleUserFormSubmit = async (values) => {
    try {
      if (editingUser) {
        await updateUser(editingUser._id, values);
      } else {
        await createUser(values);
      }
      setIsUserFormVisible(false);
      setEditingUser(null);
      await fetchUsers(filters);
    } catch (error) {
      console.error('User form submit error:', error);
    }
  };

  // Handle user form close
  const handleUserFormClose = () => {
    setIsUserFormVisible(false);
    setEditingUser(null);
  };

  // Calculate staff statistics
  const staffStats = {
    totalStaff: staffUsers.length,
    activeStaff: staffUsers.filter(user => user.isActive).length,
    staffByRole: {
      staff: staffUsers.filter(user => user.role === 'staff').length,
      manager: staffUsers.filter(user => user.role === 'manager').length,
      pharmacist: staffUsers.filter(user => user.role === 'pharmacist').length,
      admin: staffUsers.filter(user => user.role === 'admin').length
    },
    staffByDepartment: departmentOptions.reduce((acc, dept) => {
      acc[dept] = staffUsers.filter(user => user.department === dept).length;
      return acc;
    }, {})
  };

  // Table columns
  const columns = [
    {
      title: 'Avatar',
      dataIndex: 'avatar',
      key: 'avatar',
      width: 80,
      render: (avatar, record) => (
        <Avatar
          size={50}
          src={avatar || '/default-avatar.png'}
          icon={<TeamOutlined />}
          style={{ 
            backgroundColor: record.isActive ? '#52c41a' : '#ff4d4f'
          }}
        />
      )
    },
    {
      title: 'Thông tin nhân viên',
      dataIndex: 'name',
      key: 'name',
      width: 250,
      render: (text, record) => (
        <div style={{ padding: '8px 0' }}>
          <div style={{ 
            fontWeight: 600, 
            fontSize: '14px',
            marginBottom: '4px',
            color: '#262626',
            lineHeight: '1.4'
          }}>
            {text}
          </div>
          <div style={{ 
            fontSize: '12px', 
            color: '#8c8c8c',
            marginBottom: '6px',
            fontFamily: 'monospace'
          }}>
            {record.email}
          </div>
          {record.employeeId && (
            <div style={{ 
              fontSize: '11px', 
              color: '#1890ff',
              fontWeight: 500
            }}>
              <IdcardOutlined style={{ marginRight: '4px' }} />
              {record.employeeId}
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Vai trò & Phòng ban',
      key: 'roleDepartment',
      width: 200,
      render: (_, record) => (
        <div>
          <div style={{ marginBottom: '4px' }}>
            <Tag 
              color={
                record.role === 'admin' ? 'red' :
                record.role === 'manager' ? 'orange' :
                record.role === 'pharmacist' ? 'purple' : 'green'
              }
              style={{ marginBottom: '2px' }}
            >
              {record.role === 'admin' ? 'Quản trị viên' :
               record.role === 'manager' ? 'Quản lý' :
               record.role === 'pharmacist' ? 'Dược sĩ' : 'Nhân viên'}
            </Tag>
          </div>
          {record.department && (
            <div style={{ marginBottom: '4px' }}>
              <Tag color="blue" style={{ marginBottom: '2px' }}>
                {record.department}
              </Tag>
            </div>
          )}
          {record.position && (
            <div>
              <Tag color="green" style={{ marginBottom: '2px' }}>
                {record.position}
              </Tag>
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Thông tin công việc',
      key: 'workInfo',
      width: 200,
      render: (_, record) => (
        <div>
          {/* Show role-specific information */}
          {record.role === 'admin' ? (
            <div style={{ 
              fontSize: '12px', 
              color: '#722ed1',
              marginBottom: '4px',
              fontWeight: 500
            }}>
              <CrownOutlined style={{ marginRight: '4px' }} />
              Quản trị viên hệ thống
            </div>
          ) : (
            <>
              {record.hireDate && (
                <div style={{ 
                  fontSize: '12px', 
                  color: '#262626',
                  marginBottom: '4px'
                }}>
                  <CalendarOutlined style={{ marginRight: '4px', color: '#1890ff' }} />
                  Tuyển dụng: {new Date(record.hireDate).toLocaleDateString('vi-VN')}
                </div>
              )}
              {record.salary && (
                <div style={{ 
                  fontSize: '12px', 
                  color: '#52c41a',
                  marginBottom: '4px',
                  fontWeight: 500
                }}>
                  <DollarOutlined style={{ marginRight: '4px' }} />
                  {record.salary.toLocaleString('vi-VN')} VNĐ
                </div>
              )}
            </>
          )}
          
          {/* Show last login for all users */}
          {record.lastLogin ? (
            <div style={{ 
              fontSize: '10px', 
              color: '#8c8c8c',
              marginTop: '4px'
            }}>
              Đăng nhập cuối: {new Date(record.lastLogin).toLocaleDateString('vi-VN')}
            </div>
          ) : (
            <div style={{ 
              fontSize: '10px', 
              color: '#8c8c8c',
              marginTop: '4px'
            }}>
              Chưa có lịch sử đăng nhập
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'status',
      width: 120,
      render: (isActive, record) => (
        <div style={{ textAlign: 'center' }}>
          <Switch
            checked={isActive}
            onChange={() => handleStatusToggle(record._id, isActive)}
            checkedChildren="Hoạt động"
            unCheckedChildren="Tạm dừng"
            style={{ marginBottom: '4px' }}
          />
          <div style={{ 
            fontSize: '10px', 
            color: isActive ? '#52c41a' : '#ff4d4f',
            marginTop: '2px'
          }}>
            {isActive ? 'Đang làm việc' : 'Nghỉ việc'}
          </div>
        </div>
      )
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 120,
      render: (_, record) => {
        const actionMenu = [
          {
            key: 'view',
            icon: <EyeOutlined />,
            label: 'Xem chi tiết',
            onClick: () => console.log('View staff:', record._id)
          },
          ...(permissions.canWriteUsers() ? [{
            key: 'edit',
            icon: <EditOutlined />,
            label: 'Chỉnh sửa',
            onClick: () => handleEditUser(record)
          }] : []),
          ...(permissions.canWriteUsers() || permissions.canDeleteUsers() ? [{
            type: 'divider'
          }] : []),
          ...(permissions.canDeleteUsers() ? [{
            key: 'delete',
            icon: <DeleteOutlined />,
            label: 'Xóa nhân viên',
            danger: true,
            onClick: () => handleDeleteUser(record._id)
          }] : [])
        ].filter(Boolean);

        return (
          <Space size="small">
            <Tooltip title="Xem chi tiết">
              <Button
                type="text"
                size="small"
                shape="circle"
                icon={<EyeOutlined />}
                onClick={() => console.log('View staff:', record._id, record.name)}
                style={{ 
                  color: '#1890ff',
                  border: '1px solid #91d5ff'
                }}
              />
            </Tooltip>
            {permissions.canWriteUsers() && (
              <Tooltip title="Chỉnh sửa">
                <Button
                  type="text"
                  size="small"
                  shape="circle"
                  icon={<EditOutlined />}
                  onClick={() => handleEditUser(record)}
                  style={{ 
                    color: '#52c41a',
                    border: '1px solid #b7eb8f'
                  }}
                />
              </Tooltip>
            )}
            {actionMenu.length > 1 && (
              <Dropdown menu={{ items: actionMenu }} trigger={['click']}>
                <Button
                  type="text"
                  size="small"
                  shape="circle"
                  icon={<MoreOutlined />}
                  style={{ 
                    color: '#8c8c8c',
                    border: '1px solid #d9d9d9'
                  }}
                />
              </Dropdown>
            )}
          </Space>
        );
      }
    }
  ];

  // Row selection
  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
    selections: [
      Table.SELECTION_ALL,
      Table.SELECTION_INVERT,
      Table.SELECTION_NONE
    ]
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Quản lý Nhân viên</h2>
        <Space>
          <Tooltip title="Làm mới dữ liệu">
            <Button
              icon={<ReloadOutlined />}
              onClick={() => fetchUsers(filters)}
              loading={loading}
            />
          </Tooltip>
          {permissions.canWriteUsers() && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddUser}
            >
              Thêm nhân viên
            </Button>
          )}
        </Space>
      </div>

      {/* Search and Quick Stats */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={12}>
          <Search
            placeholder="Tìm kiếm theo tên, email, mã nhân viên..."
            allowClear
            onSearch={handleSearch}
            style={{ width: '100%' }}
            prefix={<SearchOutlined />}
          />
        </Col>
        <Col span={12}>
          <Row gutter={16}>
            <Col span={6}>
              <div style={{ textAlign: 'center', padding: 12, background: '#f9fafb', borderRadius: 4 }}>
                <Statistic
                  title="Tổng nhân viên"
                  value={staffStats.totalStaff}
                  prefix={<TeamOutlined />}
                  valueStyle={{ color: '#52c41a', fontSize: '18px' }}
                />
              </div>
            </Col>
            <Col span={6}>
              <div style={{ textAlign: 'center', padding: 12, background: '#f9fafb', borderRadius: 4 }}>
                <Statistic
                  title="Đang làm việc"
                  value={staffStats.activeStaff}
                  prefix={<SafetyOutlined />}
                  valueStyle={{ color: '#1890ff', fontSize: '18px' }}
                />
              </div>
            </Col>
            <Col span={6}>
              <div style={{ textAlign: 'center', padding: 12, background: '#f9fafb', borderRadius: 4 }}>
                <Statistic
                  title="Quản lý"
                  value={staffStats.staffByRole.manager + staffStats.staffByRole.admin}
                  prefix={<CrownOutlined />}
                  valueStyle={{ color: '#faad14', fontSize: '18px' }}
                />
              </div>
            </Col>
            <Col span={6}>
              <div style={{ textAlign: 'center', padding: 12, background: '#f9fafb', borderRadius: 4 }}>
                <Statistic
                  title="Dược sĩ"
                  value={staffStats.staffByRole.pharmacist}
                  prefix={<SettingOutlined />}
                  valueStyle={{ color: '#722ed1', fontSize: '18px' }}
                />
              </div>
            </Col>
          </Row>
        </Col>
      </Row>

      {/* Department Distribution */}
      <div style={{ marginBottom: 16, padding: 16, background: '#f9fafb', borderRadius: 4 }}>
        <h3 style={{ marginBottom: 16, fontSize: 16, fontWeight: 600 }}>Phân bố theo phòng ban</h3>
        <Row gutter={16}>
          {Object.entries(staffStats.staffByDepartment)
            .filter(([dept, count]) => count > 0)
            .map(([dept, count]) => (
            <Col span={3} key={dept}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '16px', fontWeight: 600, color: '#262626' }}>
                  {count}
                </div>
                <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                  {dept}
                </div>
                <Progress
                  percent={staffStats.totalStaff > 0 ? Math.round((count / staffStats.totalStaff) * 100) : 0}
                  size="small"
                  showInfo={false}
                  strokeColor="#52c41a"
                />
              </div>
            </Col>
          ))}
        </Row>
      </div>

      {/* Advanced Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'end' }}>
        <Select
          placeholder="Vai trò"
          allowClear
          style={{ width: 150 }}
          value={filters.role || undefined}
          onChange={(value) => handleFilterChange('role', value)}
        >
          <Option value="staff">Nhân viên</Option>
          <Option value="manager">Quản lý</Option>
          <Option value="pharmacist">Dược sĩ</Option>
          <Option value="admin">Quản trị viên</Option>
        </Select>
        <Select
          placeholder="Phòng ban"
          allowClear
          style={{ width: 150 }}
          value={filters.department || undefined}
          onChange={(value) => handleFilterChange('department', value)}
        >
          {departmentOptions.map(dept => (
            <Option key={dept} value={dept}>
              {dept}
            </Option>
          ))}
        </Select>
        <Select
          placeholder="Trạng thái"
          allowClear
          style={{ width: 150 }}
          value={filters.isActive}
          onChange={(value) => handleFilterChange('isActive', value)}
        >
          <Option value={true}>Đang làm việc</Option>
          <Option value={false}>Nghỉ việc</Option>
        </Select>
        <Button 
          type="primary" 
          onClick={applyFilters}
          icon={<FilterOutlined />}
        >
          Áp dụng
        </Button>
        <Button 
          onClick={resetFilters}
          icon={<ClearOutlined />}
        >
          Đặt lại
        </Button>
      </div>

      {/* Staff Table */}
      <Table
        columns={columns}
        dataSource={staffUsers}
        rowKey={(record) => record._id}
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: '8px',
              color: '#8c8c8c'
            }}>
              <TeamOutlined />
              <span>
                Hiển thị <strong style={{ color: '#262626' }}>{range[0]}-{range[1]}</strong> 
                {' '}trong tổng số <strong style={{ color: '#262626' }}>{total}</strong> nhân viên
              </span>
            </div>
          ),
          pageSizeOptions: ['10', '20', '50', '100'],
          size: 'default'
        }}
        rowSelection={rowSelection}
        onChange={handleTableChange}
        scroll={{ x: 1200 }}
      />

      {/* Bulk Actions */}
      {selectedRowKeys.length > 0 && (
        <div style={{ 
          marginTop: 16,
          padding: 16,
          background: '#f6ffed',
          border: '1px solid #b7eb8f',
          borderRadius: 4,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Space>
            <Badge 
              count={selectedRowKeys.length} 
              style={{ backgroundColor: '#52c41a' }}
            />
            <span style={{ color: '#262626', fontWeight: 500 }}>
              Đã chọn {selectedRowKeys.length} nhân viên
            </span>
          </Space>
          <Space>
            <Button
              type="primary"
              icon={<UserAddOutlined />}
              onClick={() => handleBulkStatusUpdate(true)}
            >
              Kích hoạt đã chọn
            </Button>
            <Button
              icon={<UserDeleteOutlined />}
              onClick={() => handleBulkStatusUpdate(false)}
            >
              Tạm dừng đã chọn
            </Button>
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={handleBulkDelete}
            >
              Xóa đã chọn
            </Button>
            <Button 
              onClick={() => setSelectedRowKeys([])}
              icon={<ClearOutlined />}
            >
              Bỏ chọn
            </Button>
          </Space>
        </div>
      )}

      {/* User Form Modal */}
      <UserForm
        visible={isUserFormVisible}
        onCancel={handleUserFormClose}
        onSubmit={handleUserFormSubmit}
        initialValues={editingUser}
        isEditing={!!editingUser}
      />
    </div>
  );
};

export default StaffManagement;

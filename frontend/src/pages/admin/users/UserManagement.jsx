/**
 * User Management Page
 * Advanced user management with filtering and modern UI
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
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
  Divider,
  Form,
  Switch,
  Badge,
  Statistic,
  Dropdown,
  Menu
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  FilterOutlined,
  ReloadOutlined,
  UserOutlined,
  TeamOutlined,
  SettingOutlined,
  EyeOutlined,
  MoreOutlined,
  ClearOutlined,
  UserAddOutlined,
  UserDeleteOutlined,
  CrownOutlined,
  SafetyOutlined
} from '@ant-design/icons';
import { useUsers } from '../../../hooks/admin/useUsers';
import UserForm from '../../../components/admin/UserForm';

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;

const UserManagement = () => {
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

  const [filters, setFilters] = useState({
    search: '',
    role: '',
    isActive: undefined,
    department: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [isUserFormVisible, setIsUserFormVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Role options
  const roleOptions = [
    { value: 'customer', label: 'Khách hàng', color: 'blue' },
    { value: 'staff', label: 'Nhân viên', color: 'green' },
    { value: 'manager', label: 'Quản lý', color: 'orange' },
    { value: 'pharmacist', label: 'Dược sĩ', color: 'purple' },
    { value: 'admin', label: 'Quản trị viên', color: 'red' }
  ];

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

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Apply filters
  const applyFilters = () => {
    fetchUsers(filters);
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
          icon={<UserOutlined />}
          style={{ 
            backgroundColor: record.isActive ? '#52c41a' : '#ff4d4f'
          }}
        />
      )
    },
    {
      title: 'Thông tin người dùng',
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
              color: '#8c8c8c',
              fontStyle: 'italic'
            }}>
              Mã NV: {record.employeeId}
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
              color={roleOptions.find(r => r.value === record.role)?.color || 'default'}
              style={{ marginBottom: '2px' }}
            >
              {roleOptions.find(r => r.value === record.role)?.label || record.role}
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
      title: 'Thông tin liên hệ',
      key: 'contact',
      width: 180,
      render: (_, record) => (
        <div>
          {record.phone && (
            <div style={{ 
              fontSize: '12px', 
              color: '#262626',
              marginBottom: '4px'
            }}>
              📞 {record.phone}
            </div>
          )}
          {record.address && (
            <div style={{ 
              fontSize: '11px', 
              color: '#8c8c8c',
              fontStyle: 'italic',
              lineHeight: '1.3'
            }}>
              📍 {record.address.length > 30 
                ? `${record.address.substring(0, 30)}...` 
                : record.address
              }
            </div>
          )}
          {record.lastLogin && (
            <div style={{ 
              fontSize: '10px', 
              color: '#8c8c8c',
              marginTop: '4px'
            }}>
              Đăng nhập: {new Date(record.lastLogin).toLocaleDateString()}
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
            {isActive ? 'Đang hoạt động' : 'Đã tạm dừng'}
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
            onClick: () => console.log('View user:', record._id)
          },
          {
            key: 'edit',
            icon: <EditOutlined />,
            label: 'Chỉnh sửa',
            onClick: () => handleEditUser(record)
          },
          {
            type: 'divider'
          },
          {
            key: 'delete',
            icon: <DeleteOutlined />,
            label: 'Xóa người dùng',
            danger: true,
            onClick: () => handleDeleteUser(record._id)
          }
        ];

        return (
          <Space size="small">
            <Tooltip title="Xem chi tiết">
              <Button
                type="text"
                size="small"
                shape="circle"
                icon={<EyeOutlined />}
                onClick={() => console.log('View user:', record._id, record.name)}
                style={{ 
                  color: '#1890ff',
                  border: '1px solid #91d5ff'
                }}
              />
            </Tooltip>
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
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
      <Card
        style={{
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          border: 'none'
        }}
        styles={{ body: { padding: '24px' } }}
      >
        {/* Header Section */}
        <div style={{ 
          marginBottom: '24px',
          paddingBottom: '16px',
          borderBottom: '1px solid #f0f0f0'
        }}>
          <Row justify="space-between" align="middle">
            <Col>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Avatar 
                  size="large" 
                  icon={<TeamOutlined />}
                  style={{ 
                    backgroundColor: '#1890ff',
                    marginRight: '16px'
                  }}
                />
                <div>
                  <Title level={2} style={{ margin: 0, color: '#262626' }}>
                    Quản lý Người dùng
                  </Title>
                  <div style={{ color: '#8c8c8c', fontSize: '14px' }}>
                    Quản lý tài khoản người dùng và nhân viên
                  </div>
                </div>
              </div>
            </Col>
            <Col>
              <Space size="middle">
                <Tooltip title="Làm mới dữ liệu">
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={() => fetchUsers(filters)}
                    loading={loading}
                    shape="circle"
                    size="large"
                  />
                </Tooltip>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAddUser}
                  size="large"
                  style={{
                    borderRadius: '8px',
                    height: '40px',
                    paddingLeft: '20px',
                    paddingRight: '20px',
                    fontWeight: 500
                  }}
                >
                  Thêm người dùng
                </Button>
              </Space>
            </Col>
          </Row>
        </div>

        {/* Search and Quick Stats */}
        <Row gutter={16} style={{ marginBottom: '24px' }}>
          <Col span={12}>
            <Search
              placeholder="Tìm kiếm theo tên, email, mã nhân viên..."
              allowClear
              onSearch={handleSearch}
              size="large"
              style={{ width: '100%' }}
              prefix={<SearchOutlined style={{ color: '#8c8c8c' }} />}
            />
          </Col>
          <Col span={12}>
            <Row gutter={16}>
              <Col span={6}>
                <Card size="small" style={{ textAlign: 'center' }}>
                  <Statistic
                    title="Tổng người dùng"
                    value={stats?.totalUsers || 0}
                    prefix={<UserOutlined />}
                    valueStyle={{ color: '#1890ff', fontSize: '18px' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" style={{ textAlign: 'center' }}>
                  <Statistic
                    title="Đang hoạt động"
                    value={stats?.activeUsers || 0}
                    prefix={<SafetyOutlined />}
                    valueStyle={{ color: '#52c41a', fontSize: '18px' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" style={{ textAlign: 'center' }}>
                  <Statistic
                    title="Nhân viên"
                    value={(stats?.staff || 0) + (stats?.managers || 0) + (stats?.pharmacists || 0)}
                    prefix={<TeamOutlined />}
                    valueStyle={{ color: '#faad14', fontSize: '18px' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" style={{ textAlign: 'center' }}>
                  <Statistic
                    title="Khách hàng"
                    value={stats?.customers || 0}
                    prefix={<UserOutlined />}
                    valueStyle={{ color: '#722ed1', fontSize: '18px' }}
                  />
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>

        {/* Advanced Filters */}
        <Card 
          size="small" 
          style={{ 
            marginBottom: '24px',
            background: '#fafafa',
            border: '1px solid #f0f0f0'
          }}
        >
          <div style={{ marginBottom: '16px' }}>
            <Space>
              <FilterOutlined style={{ color: '#1890ff' }} />
              <Title level={5} style={{ margin: 0, color: '#262626' }}>
                Bộ lọc nâng cao
              </Title>
            </Space>
          </div>
          
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item label="Vai trò" style={{ marginBottom: '8px' }}>
                <Select
                  placeholder="Chọn vai trò"
                  allowClear
                  value={filters.role}
                  onChange={(value) => handleFilterChange('role', value)}
                  size="large"
                >
                  {roleOptions.map(option => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="Phòng ban" style={{ marginBottom: '8px' }}>
                <Select
                  placeholder="Chọn phòng ban"
                  allowClear
                  value={filters.department}
                  onChange={(value) => handleFilterChange('department', value)}
                  size="large"
                >
                  {departmentOptions.map(dept => (
                    <Option key={dept} value={dept}>
                      {dept}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="Trạng thái" style={{ marginBottom: '8px' }}>
                <Select
                  placeholder="Chọn trạng thái"
                  allowClear
                  value={filters.isActive}
                  onChange={(value) => handleFilterChange('isActive', value)}
                  size="large"
                >
                  <Option value={true}>Hoạt động</Option>
                  <Option value={false}>Tạm dừng</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'end', 
                height: '100%',
                gap: '8px'
              }}>
                <Button 
                  type="primary" 
                  onClick={applyFilters}
                  size="large"
                  icon={<FilterOutlined />}
                >
                  Áp dụng bộ lọc
                </Button>
                <Button 
                  onClick={resetFilters}
                  size="large"
                  icon={<ClearOutlined />}
                >
                  Đặt lại
                </Button>
              </div>
            </Col>
          </Row>
        </Card>

        <Divider />

        {/* Users Table */}
        <Card
          style={{
            borderRadius: '8px',
            border: '1px solid #f0f0f0',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
          }}
          styles={{ body: { padding: 0 } }}
        >
          <Table
            columns={columns}
            dataSource={users}
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
                  <UserOutlined />
                  <span>
                    Hiển thị <strong style={{ color: '#262626' }}>{range[0]}-{range[1]}</strong> 
                    {' '}trong tổng số <strong style={{ color: '#262626' }}>{total}</strong> người dùng
                  </span>
                </div>
              ),
              pageSizeOptions: ['10', '20', '50', '100'],
              size: 'default'
            }}
            rowSelection={rowSelection}
            onChange={handleTableChange}
            scroll={{ x: 1200 }}
            style={{
              background: '#fff'
            }}
          />
        </Card>

        {/* Bulk Actions */}
        {selectedRowKeys.length > 0 && (
          <Card 
            size="small" 
            style={{ 
              marginTop: '16px',
              background: '#f6ffed',
              border: '1px solid #b7eb8f',
              borderRadius: '8px'
            }}
          >
            <Row justify="space-between" align="middle">
              <Col>
                <Space>
                  <Badge 
                    count={selectedRowKeys.length} 
                    style={{ backgroundColor: '#52c41a' }}
                  />
                  <span style={{ color: '#262626', fontWeight: 500 }}>
                    Đã chọn {selectedRowKeys.length} người dùng
                  </span>
                </Space>
              </Col>
              <Col>
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
              </Col>
            </Row>
          </Card>
        )}

        {/* User Form Modal */}
        <UserForm
          visible={isUserFormVisible}
          onCancel={handleUserFormClose}
          onSubmit={handleUserFormSubmit}
          initialValues={editingUser}
          isEditing={!!editingUser}
        />
      </Card>
    </div>
  );
};

export default UserManagement;

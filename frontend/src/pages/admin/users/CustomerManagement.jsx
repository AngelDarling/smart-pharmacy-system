/**
 * User Management Page
 * Advanced user management with filtering and modern UI
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
  Form,
  Switch,
  Badge,
  Statistic,
  Dropdown,
  Menu,
  Modal,
  Descriptions,
  Empty,
  Spin
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
import { useCustomers } from '../../../hooks/admin/useCustomers';
import CustomerForm from '../../../components/admin/CustomerForm';
import api from '../../../api/client.js';

const { Search } = Input;
const { Option } = Select;

const CustomerManagement = () => {
  const {
    customers,
    loading,
    pagination,
    stats,
    fetchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    toggleCustomerStatus,
    bulkUpdateCustomers,
    handleTableChange
  } = useCustomers();

  const [filters, setFilters] = useState({
    search: '',
    isActive: undefined
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [isUserFormVisible, setIsUserFormVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);
  const [pointHistory, setPointHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [isHistoryModalVisible, setIsHistoryModalVisible] = useState(false);

  // Role options - not needed for customers
  // Department options - not needed for customers

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Apply filters
  const applyFilters = () => {
    fetchCustomers(filters);
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      search: '',
      isActive: undefined
    });
    fetchCustomers();
  };

  // Handle search
  const handleSearch = (value) => {
    handleFilterChange('search', value);
    fetchCustomers({ ...filters, search: value });
  };

  // Handle delete user
  const handleDeleteUser = async (userId) => {
    try {
      await deleteCustomer(userId);
      // Reload customers
      await fetchCustomers(filters);
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    try {
      await bulkUpdateCustomers(selectedRowKeys, { isActive: false });
      setSelectedRowKeys([]);
    } catch (error) {
      console.error('Bulk delete error:', error);
    }
  };

  // Handle bulk status update
  const handleBulkStatusUpdate = async (status) => {
    try {
      await bulkUpdateCustomers(selectedRowKeys, { isActive: status });
      setSelectedRowKeys([]);
    } catch (error) {
      console.error('Bulk status update error:', error);
    }
  };

  // Handle status toggle
  const handleStatusToggle = async (userId, currentStatus) => {
    try {
      await toggleCustomerStatus(userId);
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

  // Handle view user point history
  const handleViewPointHistory = async (user) => {
    setViewingUser(user);
    setIsHistoryModalVisible(true);
    setHistoryLoading(true);
    setPointHistory([]);
    try {
      const response = await api.get(`/customers/${user._id}/points/history`);
      setPointHistory(response.data || []);
    } catch (error) {
      console.error('Error fetching point history:', error);
      setPointHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Handle user form submit
  const handleUserFormSubmit = async (values) => {
    try {
      // Ensure role is customer
      const customerValues = { ...values, role: 'customer' };

      if (editingUser) {
        await updateUser(editingUser._id, customerValues);
      } else {
        await createUser(customerValues);
      }
      setIsUserFormVisible(false);
      setEditingUser(null);
      // Reload with customer filter
      await fetchUsers({ role: 'customer', ...filters });
    } catch (error) {
      console.error('User form submit error:', error);
    }
  };

  // Handle user form close
  const handleUserFormClose = () => {
    setIsUserFormVisible(false);
    setEditingUser(null);
  };

  // Load customers on mount
  useEffect(() => {
    fetchCustomers();
  }, []);

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
      title: 'Thông tin khách hàng',
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
            {record.email || 'Chưa có email'}
          </div>
        </div>
      )
    },
    {
      title: 'Thông tin liên hệ',
      key: 'contact',
      width: 220,
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
              📍 {record.address.length > 40
                ? `${record.address.substring(0, 40)}...`
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
      title: 'Điểm tích lũy',
      dataIndex: 'loyaltyPoints',
      key: 'loyaltyPoints',
      width: 120,
      align: 'center',
      render: (points) => (
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '16px',
            fontWeight: 700,
            color: '#4f46e5'
          }}>
            {points || 0}
          </div>
          <div style={{
            fontSize: '11px',
            color: '#8c8c8c',
            marginTop: '2px'
          }}>
            điểm
          </div>
        </div>
      ),
      sorter: true
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
            label: 'Xem lịch sử tích điểm',
            onClick: () => handleViewPointHistory(record)
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
            <Tooltip title="Xem lịch sử tích điểm">
              <Button
                type="text"
                size="small"
                shape="circle"
                icon={<EyeOutlined />}
                onClick={() => handleViewPointHistory(record)}
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
    <div>
      {/* Header Section */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Avatar
            size="large"
            icon={<UserOutlined />}
            style={{
              backgroundColor: '#1890ff',
              marginRight: '16px'
            }}
          />
          <div>
            <h2 style={{ margin: 0, color: '#262626' }}>
              Quản lý Khách hàng
            </h2>
            <div style={{ color: '#8c8c8c', fontSize: '14px' }}>
              Quản lý thông tin khách hàng và điểm tích lũy
            </div>
          </div>
        </div>
        <Space>
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
          >
            Thêm người dùng
          </Button>
        </Space>
      </div>

      {/* Search and Quick Stats */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={12}>
          <Search
            placeholder="Tìm kiếm theo tên, email, số điện thoại..."
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
                  title="Tổng khách hàng"
                  value={customers.length}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: '#1890ff', fontSize: '18px' }}
                />
              </div>
            </Col>
            <Col span={6}>
              <div style={{ textAlign: 'center', padding: 12, background: '#f9fafb', borderRadius: 4 }}>
                <Statistic
                  title="Đang hoạt động"
                  value={customers.filter(u => u.isActive).length}
                  prefix={<SafetyOutlined />}
                  valueStyle={{ color: '#52c41a', fontSize: '18px' }}
                />
              </div>
            </Col>
            <Col span={6}>
              <div style={{ textAlign: 'center', padding: 12, background: '#f9fafb', borderRadius: 4 }}>
                <Statistic
                  title="Tổng điểm tích lũy"
                  value={customers.reduce((sum, u) => sum + (u.loyaltyPoints || 0), 0)}
                  prefix={<CrownOutlined />}
                  valueStyle={{ color: '#722ed1', fontSize: '18px' }}
                />
              </div>
            </Col>
            <Col span={6}>
              <div style={{ textAlign: 'center', padding: 12, background: '#f9fafb', borderRadius: 4 }}>
                <Statistic
                  title="Đăng nhập gần nhất"
                  value={customers.filter(u => u.lastLogin).length}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: '#faad14', fontSize: '18px' }}
                />
              </div>
            </Col>
          </Row>
        </Col>
      </Row>

      {/* Advanced Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'end' }}>
        <Select
          placeholder="Trạng thái"
          allowClear
          style={{ width: 150 }}
          value={filters.isActive}
          onChange={(value) => handleFilterChange('isActive', value)}
        >
          <Option value={true}>Hoạt động</Option>
          <Option value={false}>Tạm dừng</Option>
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

      {/* Users Table */}
      <Table
        columns={columns}
        dataSource={customers}
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
                {' '}trong tổng số <strong style={{ color: '#262626' }}>{total}</strong> khách hàng
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
              Đã chọn {selectedRowKeys.length} người dùng
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

      {/* Customer Form Modal */}
      <CustomerForm
        visible={isUserFormVisible}
        onCancel={handleUserFormClose}
        onSubmit={handleUserFormSubmit}
        initialValues={editingUser}
        isEditing={!!editingUser}
      />

      {/* Point History Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CrownOutlined style={{ color: '#722ed1' }} />
            <span>Lịch sử tích điểm - {viewingUser?.name || ''}</span>
          </div>
        }
        open={isHistoryModalVisible}
        onCancel={() => {
          setIsHistoryModalVisible(false);
          setViewingUser(null);
          setPointHistory([]);
        }}
        footer={[
          <Button key="close" onClick={() => {
            setIsHistoryModalVisible(false);
            setViewingUser(null);
            setPointHistory([]);
          }}>
            Đóng
          </Button>
        ]}
        width={700}
      >
        <Spin spinning={historyLoading}>
          {viewingUser && (
            <Descriptions bordered column={2} size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Khách hàng">{viewingUser.name}</Descriptions.Item>
              <Descriptions.Item label="Tổng điểm tích lũy">
                <span style={{ fontSize: '18px', fontWeight: 700, color: '#4f46e5' }}>
                  {viewingUser.loyaltyPoints || 0} điểm
                </span>
              </Descriptions.Item>
            </Descriptions>
          )}

          {pointHistory.length === 0 && !historyLoading ? (
            <Empty description="Khách hàng chưa có lịch sử tích điểm" />
          ) : (
            <Table
              columns={[
                {
                  title: 'Mã đơn hàng',
                  dataIndex: 'orderCode',
                  key: 'orderCode',
                  width: 150
                },
                {
                  title: 'Số điểm nhận',
                  dataIndex: 'points',
                  key: 'points',
                  width: 120,
                  align: 'center',
                  render: (points) => (
                    <span style={{ fontWeight: 600, color: '#4f46e5' }}>+{points} điểm</span>
                  )
                },
                {
                  title: 'Ngày nhận',
                  dataIndex: 'createdAt',
                  key: 'createdAt',
                  render: (date) => new Date(date).toLocaleString('vi-VN')
                }
              ]}
              dataSource={pointHistory}
              rowKey={(record) => record._id || record.orderCode}
              pagination={pointHistory.length > 10 ? { pageSize: 10 } : false}
              size="small"
            />
          )}
        </Spin>
      </Modal>
    </div>
  );
};

export default CustomerManagement;

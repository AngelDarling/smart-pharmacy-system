/**
 * User Form Component
 * Form for creating and editing users
 */

import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  Switch,
  DatePicker,
  InputNumber,
  Row,
  Col,
  Upload,
  Button,
  message,
  Divider,
  Space,
  Tag,
  Typography
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  IdcardOutlined,
  TeamOutlined,
  DollarOutlined,
  CalendarOutlined,
  UploadOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;
const { Title } = Typography;

const UserForm = ({ visible, onCancel, onSubmit, initialValues, isEditing }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState([]);

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

  // Permission options
  const permissionOptions = [
    { value: 'read_products', label: 'Xem sản phẩm', category: 'Sản phẩm' },
    { value: 'write_products', label: 'Thêm/sửa sản phẩm', category: 'Sản phẩm' },
    { value: 'delete_products', label: 'Xóa sản phẩm', category: 'Sản phẩm' },
    { value: 'read_categories', label: 'Xem danh mục', category: 'Danh mục' },
    { value: 'write_categories', label: 'Thêm/sửa danh mục', category: 'Danh mục' },
    { value: 'delete_categories', label: 'Xóa danh mục', category: 'Danh mục' },
    { value: 'read_users', label: 'Xem người dùng', category: 'Người dùng' },
    { value: 'write_users', label: 'Thêm/sửa người dùng', category: 'Người dùng' },
    { value: 'delete_users', label: 'Xóa người dùng', category: 'Người dùng' },
    { value: 'read_orders', label: 'Xem đơn hàng', category: 'Đơn hàng' },
    { value: 'write_orders', label: 'Thêm/sửa đơn hàng', category: 'Đơn hàng' },
    { value: 'delete_orders', label: 'Xóa đơn hàng', category: 'Đơn hàng' },
    { value: 'read_inventory', label: 'Xem tồn kho', category: 'Tồn kho' },
    { value: 'write_inventory', label: 'Cập nhật tồn kho', category: 'Tồn kho' },
    { value: 'delete_inventory', label: 'Xóa tồn kho', category: 'Tồn kho' },
    { value: 'read_reports', label: 'Xem báo cáo', category: 'Báo cáo' },
    { value: 'write_reports', label: 'Tạo báo cáo', category: 'Báo cáo' },
    { value: 'manage_staff', label: 'Quản lý nhân viên', category: 'Hệ thống' },
    { value: 'manage_settings', label: 'Quản lý cài đặt', category: 'Hệ thống' }
  ];

  // Group permissions by category
  const groupedPermissions = permissionOptions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {});

  // Set initial values
  useEffect(() => {
    if (initialValues) {
      const values = {
        ...initialValues,
        hireDate: initialValues.hireDate ? dayjs(initialValues.hireDate) : null
      };
      form.setFieldsValue(values);
      setSelectedPermissions(initialValues.permissions || []);
    } else {
      form.resetFields();
      setSelectedPermissions([]);
    }
  }, [initialValues, form]);

  // Handle form submit
  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      const formData = {
        ...values,
        hireDate: values.hireDate ? values.hireDate.format('YYYY-MM-DD') : null,
        permissions: selectedPermissions
      };

      await onSubmit(formData);
    } catch (error) {
      console.error('Form validation error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle permission toggle
  const handlePermissionToggle = (permission) => {
    setSelectedPermissions(prev => {
      if (prev.includes(permission)) {
        return prev.filter(p => p !== permission);
      } else {
        return [...prev, permission];
      }
    });
  };

  // Handle role change
  const handleRoleChange = (role) => {
    // Auto-set permissions based on role
    let defaultPermissions = [];
    
    switch (role) {
      case 'admin':
        defaultPermissions = permissionOptions.map(p => p.value);
        break;
      case 'manager':
        defaultPermissions = permissionOptions
          .filter(p => !p.value.includes('delete_users') && !p.value.includes('manage_settings'))
          .map(p => p.value);
        break;
      case 'pharmacist':
        defaultPermissions = permissionOptions
          .filter(p => p.value.includes('products') || p.value.includes('inventory') || p.value.includes('orders'))
          .map(p => p.value);
        break;
      case 'staff':
        defaultPermissions = permissionOptions
          .filter(p => p.value.includes('read_') && !p.value.includes('delete_'))
          .map(p => p.value);
        break;
      default:
        defaultPermissions = [];
    }
    
    setSelectedPermissions(defaultPermissions);
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <UserOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
          <span>{isEditing ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}</span>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      width={800}
      okText={isEditing ? 'Cập nhật' : 'Tạo mới'}
      cancelText="Hủy"
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          isActive: true,
          role: 'customer'
        }}
      >
        {/* Basic Information */}
        <Title level={5} style={{ marginBottom: '16px', color: '#262626' }}>
          Thông tin cơ bản
        </Title>
        
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="name"
              label="Họ và tên"
              rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Nhập họ và tên"
                size="large"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Vui lòng nhập email' },
                { type: 'email', message: 'Email không hợp lệ' }
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="Nhập email"
                size="large"
                disabled={isEditing}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="phone"
              label="Số điện thoại"
              rules={[
                { pattern: /^[0-9+\-\s()]+$/, message: 'Số điện thoại không hợp lệ' }
              ]}
            >
              <Input
                prefix={<PhoneOutlined />}
                placeholder="Nhập số điện thoại"
                size="large"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="role"
              label="Vai trò"
              rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
            >
              <Select
                placeholder="Chọn vai trò"
                size="large"
                onChange={handleRoleChange}
              >
                {roleOptions.map(option => (
                  <Option key={option.value} value={option.value}>
                    <Tag color={option.color} style={{ marginRight: '8px' }}>
                      {option.label}
                    </Tag>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="address"
          label="Địa chỉ"
        >
          <TextArea
            prefix={<EnvironmentOutlined />}
            placeholder="Nhập địa chỉ"
            rows={2}
            size="large"
          />
        </Form.Item>

        {/* Password Section */}
        {!isEditing && (
          <>
            <Divider />
            <Title level={5} style={{ marginBottom: '16px', color: '#262626' }}>
              Mật khẩu
            </Title>
            
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="password"
                  label="Mật khẩu"
                  rules={[
                    { required: true, message: 'Vui lòng nhập mật khẩu' },
                    { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' }
                  ]}
                >
                  <Input.Password
                    placeholder="Nhập mật khẩu"
                    size="large"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="confirmPassword"
                  label="Xác nhận mật khẩu"
                  dependencies={['password']}
                  rules={[
                    { required: true, message: 'Vui lòng xác nhận mật khẩu' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('password') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('Mật khẩu xác nhận không khớp'));
                      },
                    }),
                  ]}
                >
                  <Input.Password
                    placeholder="Xác nhận mật khẩu"
                    size="large"
                  />
                </Form.Item>
              </Col>
            </Row>
          </>
        )}

        {/* Staff Information */}
        <Divider />
        <Title level={5} style={{ marginBottom: '16px', color: '#262626' }}>
          Thông tin nhân viên
        </Title>
        
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="employeeId"
              label="Mã nhân viên"
            >
              <Input
                prefix={<IdcardOutlined />}
                placeholder="Nhập mã nhân viên"
                size="large"
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="department"
              label="Phòng ban"
            >
              <Select
                placeholder="Chọn phòng ban"
                size="large"
                allowClear
              >
                {departmentOptions.map(dept => (
                  <Option key={dept} value={dept}>
                    {dept}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="position"
              label="Chức vụ"
            >
              <Input
                prefix={<TeamOutlined />}
                placeholder="Nhập chức vụ"
                size="large"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="hireDate"
              label="Ngày tuyển dụng"
            >
              <DatePicker
                placeholder="Chọn ngày tuyển dụng"
                size="large"
                style={{ width: '100%' }}
                format="DD/MM/YYYY"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="salary"
              label="Lương cơ bản"
            >
              <InputNumber
                prefix={<DollarOutlined />}
                placeholder="Nhập lương cơ bản"
                size="large"
                style={{ width: '100%' }}
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value.replace(/\$\s?|(,*)/g, '')}
                min={0}
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Permissions */}
        <Divider />
        <Title level={5} style={{ marginBottom: '16px', color: '#262626' }}>
          Quyền hạn
        </Title>
        
        <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #f0f0f0', padding: '16px', borderRadius: '6px' }}>
          {Object.entries(groupedPermissions).map(([category, permissions]) => (
            <div key={category} style={{ marginBottom: '16px' }}>
              <Title level={6} style={{ marginBottom: '8px', color: '#1890ff' }}>
                {category}
              </Title>
              <Space wrap>
                {permissions.map(permission => (
                  <Tag.CheckableTag
                    key={permission.value}
                    checked={selectedPermissions.includes(permission.value)}
                    onChange={() => handlePermissionToggle(permission.value)}
                    style={{ marginBottom: '4px' }}
                  >
                    {permission.label}
                  </Tag.CheckableTag>
                ))}
              </Space>
            </div>
          ))}
        </div>

        {/* Status */}
        <Divider />
        <Title level={5} style={{ marginBottom: '16px', color: '#262626' }}>
          Trạng thái
        </Title>
        
        <Form.Item
          name="isActive"
          label="Trạng thái hoạt động"
          valuePropName="checked"
        >
          <Switch
            checkedChildren="Hoạt động"
            unCheckedChildren="Tạm dừng"
            size="large"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UserForm;

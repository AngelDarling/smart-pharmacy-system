/**
 * Profile Page - Thông tin cá nhân
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Form,
  Input,
  Button,
  Avatar,
  Upload,
  message,
  Divider,
  Typography,
  Space,
  Tag,
  Statistic,
  Timeline,
  Descriptions,
  Alert,
  Switch,
  Select,
  DatePicker,
  InputNumber
} from 'antd';
import {
  UserOutlined,
  EditOutlined,
  SaveOutlined,
  CameraOutlined,
  CalendarOutlined,
  DollarOutlined,
  IdcardOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  CrownOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  SafetyOutlined
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext.jsx';
import api from '../../api/client';
import Swal from 'sweetalert2';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const Profile = () => {
  const { user, refreshUser } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  // Get role display info
  const getRoleInfo = (role) => {
    const roleMap = {
      admin: { color: 'purple', icon: <CrownOutlined />, name: 'Quản trị viên' },
      manager: { color: 'orange', icon: <UserOutlined />, name: 'Quản lý' },
      pharmacist: { color: 'blue', icon: <UserOutlined />, name: 'Dược sĩ' },
      staff: { color: 'green', icon: <UserOutlined />, name: 'Nhân viên' }
    };
    return roleMap[role] || { color: 'default', icon: <UserOutlined />, name: role };
  };

  const roleInfo = getRoleInfo(user?.role);

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        department: user.department,
        position: user.position,
        employeeId: user.employeeId,
        salary: user.salary,
        hireDate: user.hireDate ? new Date(user.hireDate) : null,
        isActive: user.isActive
      });
    }
  }, [user, form]);

  const handleSave = async (values) => {
    console.log('🚀 handleSave called with values:', values);
    console.log('🚀 Form validation passed!');
    setLoading(true);
    try {
      console.log('Saving profile data:', values);
      
      // Validate required fields
      if (!values.name || values.name.trim().length < 2) {
        Swal.fire({
          title: 'Lỗi!',
          text: 'Họ và tên phải có ít nhất 2 ký tự!',
          icon: 'error',
          timer: 3000,
          showConfirmButton: false,
          toast: true,
          position: 'top-end'
        });
        setLoading(false);
        return;
      }
      
      // Convert DatePicker value to string
      const dataToSend = {
        ...values,
        hireDate: values.hireDate ? values.hireDate.toISOString() : null
      };
      
      console.log('Sending data to API:', dataToSend);
      console.log('User ID:', user._id);
      
      const response = await api.put(`/users/${user._id}/profile`, dataToSend);
      console.log('Profile update response:', response.data);
      
      // Refresh user data to show updated information
      await refreshUser();
      
      // Show success notification with SweetAlert2
      Swal.fire({
        title: 'Thành công!',
        text: 'Cập nhật thông tin cá nhân thành công!',
        icon: 'success',
        timer: 3000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });
      
      setEditing(false);
    } catch (error) {
      console.error('Profile update error:', error);
      const errorMessage = error.response?.data?.message || 'Cập nhật thông tin thất bại!';
      
      // Show error notification with SweetAlert2
      Swal.fire({
        title: 'Lỗi!',
        text: errorMessage,
        icon: 'error',
        timer: 4000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setEditing(false);
  };

  const handlePasswordChange = async (values) => {
    console.log('🔑 Password change called with values:', values);
    setLoading(true);
    try {
      console.log('Changing password for user:', user._id);
      await api.put(`/users/${user._id}/password`, {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword
      });
      
      // Show success notification with SweetAlert2
      Swal.fire({
        title: 'Thành công!',
        text: 'Đổi mật khẩu thành công!',
        icon: 'success',
        timer: 3000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });
      
      form.resetFields(['currentPassword', 'newPassword', 'confirmPassword']);
    } catch (error) {
      console.error('Password change error:', error);
      const errorMessage = error.response?.data?.message || 'Đổi mật khẩu thất bại!';
      
      // Show error notification with SweetAlert2
      Swal.fire({
        title: 'Lỗi!',
        text: errorMessage,
        icon: 'error',
        timer: 4000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>
        <UserOutlined style={{ marginRight: '8px' }} />
        Thông tin cá nhân
      </Title>

      <Row gutter={[24, 24]}>
        {/* Profile Overview */}
        <Col xs={24} lg={8}>
          <Card>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <Avatar 
                size={120} 
                icon={roleInfo.icon}
                style={{ 
                  backgroundColor: roleInfo.color === 'purple' ? '#722ed1' : undefined,
                  marginBottom: '16px'
                }}
              />
              <Title level={3} style={{ margin: '8px 0' }}>
                {user.name}
              </Title>
              <Space direction="vertical" size="small">
                <Tag color={roleInfo.color} icon={roleInfo.icon}>
                  {roleInfo.name}
                </Tag>
                {user.department && (
                  <Tag color="blue">{user.department}</Tag>
                )}
                {user.position && (
                  <Tag color="green">{user.position}</Tag>
                )}
              </Space>
            </div>

            <Descriptions column={1} size="small">
              <Descriptions.Item label="Email">
                <MailOutlined style={{ marginRight: '4px' }} />
                {user.email}
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">
                <PhoneOutlined style={{ marginRight: '4px' }} />
                {user.phone || 'Chưa cập nhật'}
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ">
                <EnvironmentOutlined style={{ marginRight: '4px' }} />
                {user.address || 'Chưa cập nhật'}
              </Descriptions.Item>
              {user.employeeId && (
                <Descriptions.Item label="Mã nhân viên">
                  <IdcardOutlined style={{ marginRight: '4px' }} />
                  {user.employeeId}
                </Descriptions.Item>
              )}
              {user.hireDate && (
                <Descriptions.Item label="Ngày tuyển dụng">
                  <CalendarOutlined style={{ marginRight: '4px' }} />
                  {new Date(user.hireDate).toLocaleDateString('vi-VN')}
                </Descriptions.Item>
              )}
              {user.salary && (
                <Descriptions.Item label="Lương">
                  <DollarOutlined style={{ marginRight: '4px' }} />
                  {user.salary.toLocaleString('vi-VN')} VNĐ
                </Descriptions.Item>
              )}
            </Descriptions>

            <Divider />

            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title="Số lần đăng nhập"
                  value={user.loginCount || 0}
                  prefix={<ClockCircleOutlined />}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Trạng thái"
                  value={user.isActive ? 'Hoạt động' : 'Tạm dừng'}
                  valueStyle={{ color: user.isActive ? '#52c41a' : '#ff4d4f' }}
                  prefix={<SafetyOutlined />}
                />
              </Col>
            </Row>

            <Divider />

            <div style={{ textAlign: 'center' }}>
              <Text type="secondary">
                Đăng nhập cuối: {user.lastLogin ? new Date(user.lastLogin).toLocaleString('vi-VN') : 'Chưa có'}
              </Text>
            </div>
          </Card>
        </Col>

        {/* Profile Form */}
        <Col xs={24} lg={16}>
          <Card 
            title="Chỉnh sửa thông tin" 
            extra={
              <Space>
                {!editing ? (
                  <Button 
                    type="primary" 
                    icon={<EditOutlined />}
                    onClick={() => setEditing(true)}
                  >
                    Chỉnh sửa
                  </Button>
                ) : (
                  <Space>
                    <Button onClick={handleCancel}>
                      Hủy
                    </Button>
                    <Button
                      type="primary" 
                      icon={<SaveOutlined />}
                      loading={loading}
                      onClick={async () => {
                        // Force submit without validation
                        try {
                          const values = form.getFieldsValue();
                          await handleSave(values);
                        } catch (error) {
                          console.error('❌ Force submit failed:', error);
                        }
                      }}
                    >
                      {loading ? 'Đang lưu...' : 'Lưu'}
                    </Button>
                  </Space>
                )}
              </Space>
            }
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={(values) => {
                handleSave(values);
              }}
              onFinishFailed={(errorInfo) => {
                Swal.fire({
                  title: 'Lỗi!',
                  text: 'Vui lòng kiểm tra lại thông tin!',
                  icon: 'error',
                  timer: 3000,
                  showConfirmButton: false,
                  toast: true,
                  position: 'top-end'
                });
              }}
              disabled={!editing}
            >
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Họ và tên"
                    name="name"
                  >
                    <Input prefix={<UserOutlined />} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Email"
                    name="email"
                  >
                    <Input prefix={<MailOutlined />} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Số điện thoại"
                    name="phone"
                  >
                    <Input prefix={<PhoneOutlined />} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Mã nhân viên"
                    name="employeeId"
                  >
                    <Input prefix={<IdcardOutlined />} />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="Địa chỉ"
                name="address"
              >
                <TextArea rows={3} />
              </Form.Item>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Phòng ban"
                    name="department"
                  >
                    <Select placeholder="Chọn phòng ban">
                      <Option value="Bán hàng">Bán hàng</Option>
                      <Option value="Kho">Kho</Option>
                      <Option value="Kế toán">Kế toán</Option>
                      <Option value="Dược">Dược</Option>
                      <Option value="Quản lý">Quản lý</Option>
                      <Option value="IT">IT</Option>
                      <Option value="Marketing">Marketing</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Chức vụ"
                    name="position"
                  >
                    <Input />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Ngày tuyển dụng"
                    name="hireDate"
                  >
                    <DatePicker style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Lương"
                    name="salary"
                  >
                    <InputNumber 
                      style={{ width: '100%' }}
                      formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={value => value.replace(/\$\s?|(,*)/g, '')}
                      min={0}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="Trạng thái"
                name="isActive"
                valuePropName="checked"
              >
                <Switch checkedChildren="Hoạt động" unCheckedChildren="Tạm dừng" />
              </Form.Item>
            </Form>
          </Card>

          {/* Change Password */}
          <Card title="Đổi mật khẩu" style={{ marginTop: '24px' }}>
            <Form
              layout="vertical"
              onFinish={(values) => {
                console.log('📝 Password form onFinish called with values:', values);
                handlePasswordChange(values);
              }}
              onFinishFailed={(errorInfo) => {
                console.log('❌ Password form validation failed:', errorInfo);
                Swal.fire({
                  title: 'Lỗi!',
                  text: 'Vui lòng kiểm tra lại thông tin mật khẩu!',
                  icon: 'error',
                  timer: 3000,
                  showConfirmButton: false,
                  toast: true,
                  position: 'top-end'
                });
              }}
            >
              <Form.Item
                label="Mật khẩu hiện tại"
                name="currentPassword"
                rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại!' }]}
              >
                <Input.Password />
              </Form.Item>

              <Form.Item
                label="Mật khẩu mới"
                name="newPassword"
                rules={[
                  { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                  { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
                ]}
              >
                <Input.Password />
              </Form.Item>

              <Form.Item
                label="Xác nhận mật khẩu mới"
                name="confirmPassword"
                dependencies={['newPassword']}
                rules={[
                  { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                    },
                  }),
                ]}
              >
                <Input.Password />
              </Form.Item>

              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit"
                  loading={loading}
                  icon={<SaveOutlined />}
                >
                  {loading ? 'Đang đổi...' : 'Đổi mật khẩu'}
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Profile;

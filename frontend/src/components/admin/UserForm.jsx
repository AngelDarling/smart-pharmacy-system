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
  InputNumber,
  Row,
  Col,
  Button,
  message,
  Divider,
  Tag,
  Typography
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined
} from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;
const { Title } = Typography;

const UserForm = ({ visible, onCancel, onSubmit, initialValues, isEditing }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Role options - chỉ khách hàng
  const roleOptions = [
    { value: 'customer', label: 'Khách hàng', color: 'blue' }
  ];


  // Set initial values
  useEffect(() => {
    if (initialValues) {
      const values = {
        ...initialValues,
        role: 'customer' // Luôn là customer
      };
      form.setFieldsValue(values);
    } else {
      form.resetFields();
      form.setFieldsValue({ role: 'customer', isActive: true });
    }
  }, [initialValues, form]);

  // Handle form submit
  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      const formData = {
        ...values,
        role: 'customer' // Luôn là customer
      };

      await onSubmit(formData);
    } catch (error) {
      console.error('Form validation error:', error);
    } finally {
      setLoading(false);
    }
  };


  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <UserOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
          <span>{isEditing ? 'Chỉnh sửa khách hàng' : 'Thêm khách hàng mới'}</span>
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
                disabled
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

        {/* Loyalty Points - Chỉ hiển thị khi chỉnh sửa */}
        {isEditing && (
          <>
            <Divider />
            <Title level={5} style={{ marginBottom: '16px', color: '#262626' }}>
              Điểm tích lũy
            </Title>
            
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="loyaltyPoints"
                  label="Điểm tích lũy"
                  rules={[
                    { type: 'number', min: 0, message: 'Điểm tích lũy phải lớn hơn hoặc bằng 0' }
                  ]}
                >
                  <InputNumber
                    placeholder="Nhập điểm tích lũy"
                    size="large"
                    style={{ width: '100%' }}
                    min={0}
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                  />
                </Form.Item>
              </Col>
            </Row>
          </>
        )}

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

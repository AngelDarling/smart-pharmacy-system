/**
 * Settings Page - Cài đặt hệ thống
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Form,
  Input,
  Button,
  Switch,
  Select,
  InputNumber,
  message,
  Divider,
  Typography,
  Space,
  Alert,
  Tabs,
  Upload,
  ColorPicker,
  TimePicker,
  DatePicker,
  Radio,
  Checkbox
} from 'antd';
import {
  SettingOutlined,
  SaveOutlined,
  ReloadOutlined,
  BellOutlined,
  SafetyOutlined,
  GlobalOutlined,
  BgColorsOutlined,
  DatabaseOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  ShopOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import useAuth from '../../hooks/useAuth';
import { usePermissions } from '../../hooks/usePermissions';
import api from '../../api/client';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

const Settings = () => {
  const { user } = useAuth();
  const { permissions } = usePermissions();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    general: {
      siteName: 'Smart Pharmacy System',
      siteDescription: 'Hệ thống quản lý nhà thuốc thông minh',
      siteLogo: '',
      timezone: 'Asia/Ho_Chi_Minh',
      language: 'vi',
      currency: 'VND',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24h'
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      orderNotifications: true,
      inventoryNotifications: true,
      userNotifications: true,
      systemNotifications: true
    },
    security: {
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      passwordExpiry: 90,
      twoFactorAuth: false,
      ipWhitelist: false,
      auditLog: true
    },
    pharmacy: {
      pharmacyName: 'Nhà thuốc Smart Pharmacy',
      pharmacyAddress: '123 Đường ABC, Quận 1, TP.HCM',
      pharmacyPhone: '0123456789',
      pharmacyEmail: 'info@smartpharmacy.com',
      pharmacyLicense: 'SĐK-123456',
      taxCode: '0123456789',
      workingHours: '08:00 - 22:00',
      deliveryRadius: 10
    },
    inventory: {
      lowStockThreshold: 10,
      expiryWarningDays: 30,
      autoReorder: false,
      reorderLevel: 20,
      inventoryTracking: true,
      batchTracking: true,
      expiryTracking: true
    },
    appearance: {
      theme: 'light',
      primaryColor: '#1890ff',
      sidebarCollapsed: false,
      showBreadcrumb: true,
      showFooter: true,
      compactMode: false
    }
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await api.get('/settings');
      setSettings(response.data);
      form.setFieldsValue(response.data);
    } catch (error) {
      console.error('Error loading settings:', error);
      // Use default settings if API fails
      form.setFieldsValue(settings);
    }
  };

  const handleSave = async (values) => {
    setLoading(true);
    try {
      console.log('Saving settings:', values);
      await api.put('/settings', values);
      setSettings({ ...settings, ...values });
      message.success('Cài đặt đã được lưu thành công!');
    } catch (error) {
      console.error('Settings save error:', error);
      const errorMessage = error.response?.data?.message || 'Lưu cài đặt thất bại!';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    try {
      console.log('Resetting settings to default');
      await api.post('/settings/reset');
      await loadSettings();
      message.info('Đã khôi phục cài đặt mặc định');
    } catch (error) {
      console.error('Settings reset error:', error);
      const errorMessage = error.response?.data?.message || 'Khôi phục cài đặt thất bại!';
      message.error(errorMessage);
    }
  };

  const handleTestEmail = async () => {
    try {
      console.log('Testing email functionality');
      await api.post('/settings/test-email');
      message.success('Email test đã được gửi!');
    } catch (error) {
      console.error('Email test error:', error);
      const errorMessage = error.response?.data?.message || 'Gửi email test thất bại!';
      message.error(errorMessage);
    }
  };

  const handleTestSMS = async () => {
    try {
      console.log('Testing SMS functionality');
      await api.post('/settings/test-sms');
      message.success('SMS test đã được gửi!');
    } catch (error) {
      console.error('SMS test error:', error);
      const errorMessage = error.response?.data?.message || 'Gửi SMS test thất bại!';
      message.error(errorMessage);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>
        <SettingOutlined style={{ marginRight: '8px' }} />
        Cài đặt hệ thống
      </Title>

      <Alert
        message="Thông báo"
        description="Các thay đổi cài đặt sẽ có hiệu lực ngay lập tức. Vui lòng kiểm tra kỹ trước khi lưu."
        type="info"
        showIcon
        style={{ marginBottom: '24px' }}
      />

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        initialValues={settings}
      >
        <Tabs defaultActiveKey="general" type="card">
          {/* General Settings */}
          <TabPane tab={<span><GlobalOutlined />Tổng quan</span>} key="general">
            <Card title="Cài đặt chung">
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Tên hệ thống"
                    name={['general', 'siteName']}
                    rules={[{ required: true, message: 'Vui lòng nhập tên hệ thống!' }]}
                  >
                    <Input prefix={<ShopOutlined />} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Mô tả hệ thống"
                    name={['general', 'siteDescription']}
                  >
                    <Input prefix={<FileTextOutlined />} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} sm={8}>
                  <Form.Item
                    label="Múi giờ"
                    name={['general', 'timezone']}
                  >
                    <Select>
                      <Option value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh</Option>
                      <Option value="UTC">UTC</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item
                    label="Ngôn ngữ"
                    name={['general', 'language']}
                  >
                    <Select>
                      <Option value="vi">Tiếng Việt</Option>
                      <Option value="en">English</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item
                    label="Đơn vị tiền tệ"
                    name={['general', 'currency']}
                  >
                    <Select>
                      <Option value="VND">VND</Option>
                      <Option value="USD">USD</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Định dạng ngày"
                    name={['general', 'dateFormat']}
                  >
                    <Select>
                      <Option value="DD/MM/YYYY">DD/MM/YYYY</Option>
                      <Option value="MM/DD/YYYY">MM/DD/YYYY</Option>
                      <Option value="YYYY-MM-DD">YYYY-MM-DD</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Định dạng giờ"
                    name={['general', 'timeFormat']}
                  >
                    <Radio.Group>
                      <Radio value="12h">12 giờ (AM/PM)</Radio>
                      <Radio value="24h">24 giờ</Radio>
                    </Radio.Group>
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </TabPane>

          {/* Pharmacy Settings */}
          <TabPane tab={<span><ShopOutlined />Nhà thuốc</span>} key="pharmacy">
            <Card title="Thông tin nhà thuốc">
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Tên nhà thuốc"
                    name={['pharmacy', 'pharmacyName']}
                    rules={[{ required: true, message: 'Vui lòng nhập tên nhà thuốc!' }]}
                  >
                    <Input prefix={<ShopOutlined />} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Số điện thoại"
                    name={['pharmacy', 'pharmacyPhone']}
                  >
                    <Input prefix={<PhoneOutlined />} />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="Địa chỉ"
                name={['pharmacy', 'pharmacyAddress']}
              >
                <TextArea rows={3} prefix={<EnvironmentOutlined />} />
              </Form.Item>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Email"
                    name={['pharmacy', 'pharmacyEmail']}
                  >
                    <Input prefix={<MailOutlined />} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Giấy phép kinh doanh"
                    name={['pharmacy', 'pharmacyLicense']}
                  >
                    <Input />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Mã số thuế"
                    name={['pharmacy', 'taxCode']}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Giờ làm việc"
                    name={['pharmacy', 'workingHours']}
                  >
                    <Input placeholder="08:00 - 22:00" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="Bán kính giao hàng (km)"
                name={['pharmacy', 'deliveryRadius']}
              >
                <InputNumber min={0} max={50} style={{ width: '100%' }} />
              </Form.Item>
            </Card>
          </TabPane>

          {/* Inventory Settings */}
          <TabPane tab={<span><DatabaseOutlined />Tồn kho</span>} key="inventory">
            <Card title="Cài đặt tồn kho">
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Ngưỡng cảnh báo tồn kho thấp"
                    name={['inventory', 'lowStockThreshold']}
                  >
                    <InputNumber min={0} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Cảnh báo hết hạn (ngày)"
                    name={['inventory', 'expiryWarningDays']}
                  >
                    <InputNumber min={0} max={365} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Ngưỡng đặt hàng lại"
                    name={['inventory', 'reorderLevel']}
                  >
                    <InputNumber min={0} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Tự động đặt hàng"
                    name={['inventory', 'autoReorder']}
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
              </Row>

              <Divider />

              <Title level={4}>Theo dõi</Title>
              <Row gutter={16}>
                <Col xs={24} sm={8}>
                  <Form.Item
                    name={['inventory', 'inventoryTracking']}
                    valuePropName="checked"
                  >
                    <Checkbox>Theo dõi tồn kho</Checkbox>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item
                    name={['inventory', 'batchTracking']}
                    valuePropName="checked"
                  >
                    <Checkbox>Theo dõi lô hàng</Checkbox>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item
                    name={['inventory', 'expiryTracking']}
                    valuePropName="checked"
                  >
                    <Checkbox>Theo dõi hạn sử dụng</Checkbox>
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </TabPane>

          {/* Notifications Settings */}
          <TabPane tab={<span><BellOutlined />Thông báo</span>} key="notifications">
            <Card title="Cài đặt thông báo">
              <Title level={4}>Kênh thông báo</Title>
              <Row gutter={16}>
                <Col xs={24} sm={8}>
                  <Form.Item
                    label="Email"
                    name={['notifications', 'emailNotifications']}
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item
                    label="SMS"
                    name={['notifications', 'smsNotifications']}
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item
                    label="Push Notification"
                    name={['notifications', 'pushNotifications']}
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
              </Row>

              <Divider />

              <Title level={4}>Loại thông báo</Title>
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name={['notifications', 'orderNotifications']}
                    valuePropName="checked"
                  >
                    <Checkbox>Thông báo đơn hàng</Checkbox>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name={['notifications', 'inventoryNotifications']}
                    valuePropName="checked"
                  >
                    <Checkbox>Thông báo tồn kho</Checkbox>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name={['notifications', 'userNotifications']}
                    valuePropName="checked"
                  >
                    <Checkbox>Thông báo người dùng</Checkbox>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name={['notifications', 'systemNotifications']}
                    valuePropName="checked"
                  >
                    <Checkbox>Thông báo hệ thống</Checkbox>
                  </Form.Item>
                </Col>
              </Row>

              <Divider />

              <Space>
                <Button onClick={handleTestEmail}>
                  Test Email
                </Button>
                <Button onClick={handleTestSMS}>
                  Test SMS
                </Button>
              </Space>
            </Card>
          </TabPane>

          {/* Security Settings */}
          <TabPane tab={<span><SafetyOutlined />Bảo mật</span>} key="security">
            <Card title="Cài đặt bảo mật">
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Thời gian timeout phiên (phút)"
                    name={['security', 'sessionTimeout']}
                  >
                    <InputNumber min={5} max={480} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Số lần đăng nhập sai tối đa"
                    name={['security', 'maxLoginAttempts']}
                  >
                    <InputNumber min={3} max={10} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Hết hạn mật khẩu (ngày)"
                    name={['security', 'passwordExpiry']}
                  >
                    <InputNumber min={30} max={365} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Xác thực 2 yếu tố"
                    name={['security', 'twoFactorAuth']}
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Whitelist IP"
                    name={['security', 'ipWhitelist']}
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Audit Log"
                    name={['security', 'auditLog']}
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </TabPane>

          {/* Appearance Settings */}
          <TabPane tab={<span><BgColorsOutlined />Giao diện</span>} key="appearance">
            <Card title="Cài đặt giao diện">
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Theme"
                    name={['appearance', 'theme']}
                  >
                    <Radio.Group>
                      <Radio value="light">Sáng</Radio>
                      <Radio value="dark">Tối</Radio>
                      <Radio value="auto">Tự động</Radio>
                    </Radio.Group>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Màu chủ đạo"
                    name={['appearance', 'primaryColor']}
                  >
                    <ColorPicker />
                  </Form.Item>
                </Col>
              </Row>

              <Divider />

              <Title level={4}>Layout</Title>
              <Row gutter={16}>
                <Col xs={24} sm={8}>
                  <Form.Item
                    name={['appearance', 'sidebarCollapsed']}
                    valuePropName="checked"
                  >
                    <Checkbox>Sidebar thu gọn</Checkbox>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item
                    name={['appearance', 'showBreadcrumb']}
                    valuePropName="checked"
                  >
                    <Checkbox>Hiển thị breadcrumb</Checkbox>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item
                    name={['appearance', 'showFooter']}
                    valuePropName="checked"
                  >
                    <Checkbox>Hiển thị footer</Checkbox>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name={['appearance', 'compactMode']}
                valuePropName="checked"
              >
                <Checkbox>Chế độ compact</Checkbox>
              </Form.Item>
            </Card>
          </TabPane>
        </Tabs>

        <Divider />

        <Row justify="end">
          <Space>
            <Button onClick={handleReset} icon={<ReloadOutlined />}>
              Khôi phục mặc định
            </Button>
            <Button 
              type="primary" 
              htmlType="submit"
              loading={loading}
              icon={<SaveOutlined />}
            >
              {loading ? 'Đang lưu...' : 'Lưu cài đặt'}
            </Button>
          </Space>
        </Row>
      </Form>
    </div>
  );
};

export default Settings;

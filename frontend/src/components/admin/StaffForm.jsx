/**
 * Staff Form Component
 * Form for creating and editing staff members
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
    Typography,
    DatePicker
} from 'antd';
import {
    UserOutlined,
    MailOutlined,
    PhoneOutlined,
    IdcardOutlined,
    CalendarOutlined,
    DollarOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Option } = Select;
const { Title } = Typography;

const StaffForm = ({ visible, onCancel, onSubmit, initialValues, isEditing }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState(null);

    // Role options
    const roleOptions = [
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

    // Set initial values
    useEffect(() => {
        if (initialValues) {
            const values = {
                ...initialValues,
                hireDate: initialValues.hireDate ? dayjs(initialValues.hireDate) : null
            };
            form.setFieldsValue(values);
            setSelectedDepartment(initialValues.department);
        } else {
            form.resetFields();
            form.setFieldsValue({ role: 'staff', isActive: true });
        }
    }, [initialValues, form]);

    // Handle form submit
    const handleSubmit = async () => {
        try {
            setLoading(true);
            const values = await form.validateFields();

            const formData = {
                ...values,
                hireDate: values.hireDate ? values.hireDate.toISOString() : undefined
            };

            await onSubmit(formData);
            form.resetFields();
        } catch (error) {
            console.error('Form validation error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Handle department change
    const handleDepartmentChange = (value) => {
        setSelectedDepartment(value);
        form.setFieldValue('position', undefined);
    };

    return (
        <Modal
            title={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <UserOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                    <span>{isEditing ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên mới'}</span>
                </div>
            }
            open={visible}
            onCancel={onCancel}
            onOk={handleSubmit}
            confirmLoading={loading}
            width={900}
            okText={isEditing ? 'Cập nhật' : 'Tạo mới'}
            cancelText="Hủy"
            destroyOnClose
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={{
                    isActive: true,
                    role: 'staff'
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

                {/* Password Section - Only for new staff */}
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
                    <Col span={12}>
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
                    <Col span={12}>
                        <Form.Item
                            name="department"
                            label="Phòng ban"
                        >
                            <Select
                                placeholder="Chọn phòng ban"
                                size="large"
                                onChange={handleDepartmentChange}
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
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="position"
                            label="Chức vụ"
                        >
                            <Select
                                placeholder="Chọn chức vụ"
                                size="large"
                                disabled={!selectedDepartment}
                                allowClear
                            >
                                {selectedDepartment && positionOptions[selectedDepartment]?.map(pos => (
                                    <Option key={pos} value={pos}>
                                        {pos}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
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
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="salary"
                            label="Lương (VNĐ)"
                        >
                            <InputNumber
                                placeholder="Nhập lương"
                                size="large"
                                style={{ width: '100%' }}
                                min={0}
                                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={value => value.replace(/\$\s?|(,*)/g, '')}
                            />
                        </Form.Item>
                    </Col>
                </Row>

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

export default StaffForm;

import React, { useState, useEffect } from 'react';
import {
    Modal,
    Checkbox,
    Button,
    Space,
    Tag,
    Row,
    Col,
    Divider,
    message
} from 'antd';
import {
    SafetyOutlined,
    DashboardOutlined,
    ShoppingOutlined,
    InboxOutlined,
    ShoppingCartOutlined,
    UserOutlined,
    TeamOutlined,
    BarChartOutlined,
    SettingOutlined,
    GiftOutlined,
    FileTextOutlined
} from '@ant-design/icons';
import { PERMISSION_CATEGORIES, PERMISSION_LABELS, PERMISSION_TEMPLATES } from '../../constants/permissions';

const ICON_MAP = {
    DashboardOutlined: <DashboardOutlined />,
    ShoppingOutlined: <ShoppingOutlined />,
    InboxOutlined: <InboxOutlined />,
    ShoppingCartOutlined: <ShoppingCartOutlined />,
    UserOutlined: <UserOutlined />,
    TeamOutlined: <TeamOutlined />,
    BarChartOutlined: <BarChartOutlined />,
    SettingOutlined: <SettingOutlined />,
    GiftOutlined: <GiftOutlined />,
    FileTextOutlined: <FileTextOutlined />
};

const PermissionsModal = ({ visible, onCancel, onSave, staff, loading }) => {
    const [selectedPermissions, setSelectedPermissions] = useState({});
    const [activeTemplate, setActiveTemplate] = useState('custom');

    useEffect(() => {
        if (staff && visible) {
            // Convert Map to object if needed
            const perms = staff.permissions instanceof Map
                ? Object.fromEntries(staff.permissions)
                : staff.permissions || {};
            setSelectedPermissions(perms);
            setActiveTemplate('custom');
        }
    }, [staff, visible]);

    const handleTemplateSelect = (templateKey) => {
        setActiveTemplate(templateKey);
        setSelectedPermissions(PERMISSION_TEMPLATES[templateKey] || {});
    };

    const handlePermissionToggle = (category, permission) => {
        setActiveTemplate('custom');
        setSelectedPermissions(prev => {
            const categoryPerms = prev[category] || [];
            const newCategoryPerms = categoryPerms.includes(permission)
                ? categoryPerms.filter(p => p !== permission)
                : [...categoryPerms, permission];

            return {
                ...prev,
                [category]: newCategoryPerms
            };
        });
    };

    const handleCategoryToggleAll = (category) => {
        setActiveTemplate('custom');
        const categoryConfig = PERMISSION_CATEGORIES.find(c => c.key === category);
        const currentPerms = selectedPermissions[category] || [];

        if (currentPerms.length === categoryConfig.permissions.length) {
            // Uncheck all
            setSelectedPermissions(prev => ({
                ...prev,
                [category]: []
            }));
        } else {
            // Check all
            setSelectedPermissions(prev => ({
                ...prev,
                [category]: categoryConfig.permissions
            }));
        }
    };

    const handleSave = () => {
        onSave(selectedPermissions);
    };

    const handleCancel = () => {
        setSelectedPermissions({});
        setActiveTemplate('custom');
        onCancel();
    };

    return (
        <Modal
            title={
                <Space>
                    <SafetyOutlined style={{ color: '#1890ff' }} />
                    <span>Phân Quyền: {staff?.name}</span>
                </Space>
            }
            open={visible}
            onCancel={handleCancel}
            width={900}
            footer={[
                <Button key="cancel" onClick={handleCancel}>
                    Hủy
                </Button>,
                <Button
                    key="save"
                    type="primary"
                    onClick={handleSave}
                    loading={loading}
                    icon={<SafetyOutlined />}
                >
                    Lưu Thay Đổi
                </Button>
            ]}
        >
            {/* Templates */}
            <div style={{ marginBottom: 24 }}>
                <div style={{ marginBottom: 12, fontWeight: 600 }}>
                    Mẫu phân quyền nhanh:
                </div>
                <Space wrap>
                    <Tag
                        color={activeTemplate === 'admin' ? 'red' : 'default'}
                        style={{ cursor: 'pointer', padding: '4px 12px' }}
                        onClick={() => handleTemplateSelect('admin')}
                    >
                        Admin (Toàn quyền)
                    </Tag>
                    <Tag
                        color={activeTemplate === 'manager' ? 'orange' : 'default'}
                        style={{ cursor: 'pointer', padding: '4px 12px' }}
                        onClick={() => handleTemplateSelect('manager')}
                    >
                        Manager (Quản lý)
                    </Tag>
                    <Tag
                        color={activeTemplate === 'pharmacist' ? 'purple' : 'default'}
                        style={{ cursor: 'pointer', padding: '4px 12px' }}
                        onClick={() => handleTemplateSelect('pharmacist')}
                    >
                        Pharmacist (Dược sĩ)
                    </Tag>
                    <Tag
                        color={activeTemplate === 'staff' ? 'green' : 'default'}
                        style={{ cursor: 'pointer', padding: '4px 12px' }}
                        onClick={() => handleTemplateSelect('staff')}
                    >
                        Staff (Nhân viên)
                    </Tag>
                    <Tag
                        color={activeTemplate === 'custom' ? 'blue' : 'default'}
                        style={{ cursor: 'pointer', padding: '4px 12px' }}
                    >
                        Tùy chỉnh
                    </Tag>
                </Space>
            </div>

            <Divider />

            {/* Permissions Grid */}
            <div style={{ maxHeight: '500px', overflowY: 'auto', paddingRight: 8 }}>
                {PERMISSION_CATEGORIES.map((category, index) => {
                    const categoryPerms = selectedPermissions[category.key] || [];
                    const allChecked = categoryPerms.length === category.permissions.length;
                    const someChecked = categoryPerms.length > 0 && !allChecked;

                    return (
                        <div key={category.key} style={{ marginBottom: 16 }}>
                            <Row gutter={16} align="middle">
                                <Col span={8}>
                                    <Space>
                                        <span style={{ fontSize: 18 }}>{ICON_MAP[category.icon]}</span>
                                        <Checkbox
                                            indeterminate={someChecked}
                                            checked={allChecked}
                                            onChange={() => handleCategoryToggleAll(category.key)}
                                        >
                                            <strong>{category.label}</strong>
                                        </Checkbox>
                                    </Space>
                                </Col>
                                <Col span={16}>
                                    <Space wrap>
                                        {category.permissions.map(permission => (
                                            <Checkbox
                                                key={permission}
                                                checked={categoryPerms.includes(permission)}
                                                onChange={() => handlePermissionToggle(category.key, permission)}
                                            >
                                                {PERMISSION_LABELS[permission]}
                                            </Checkbox>
                                        ))}
                                    </Space>
                                </Col>
                            </Row>
                            {index < PERMISSION_CATEGORIES.length - 1 && (
                                <Divider style={{ margin: '12px 0' }} />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Summary */}
            <Divider />
            <div style={{ background: '#f0f2f5', padding: 12, borderRadius: 4 }}>
                <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 4 }}>
                    Tổng số quyền đã chọn:
                </div>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#1890ff' }}>
                    {Object.values(selectedPermissions).reduce((acc, perms) => acc + perms.length, 0)} quyền
                </div>
            </div>
        </Modal>
    );
};

export default PermissionsModal;

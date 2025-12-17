import React, { useState, useEffect, useCallback } from 'react';
import {
    Card,
    Table,
    Button,
    Space,
    Tag,
    Row,
    Col,
    Statistic,
    Typography,
    Tooltip,
    Select,
    Empty
} from 'antd';
import {
    WarningOutlined,
    ExclamationCircleOutlined,
    ClockCircleOutlined,
    ReloadOutlined,
    FireOutlined
} from '@ant-design/icons';
import api from '../../../../api/client.js';
import Swal from 'sweetalert2';
import dayjs from 'dayjs';

const { Text } = Typography;
const { Option } = Select;

export default function AlertsTab() {
    const [loading, setLoading] = useState(false);
    const [alerts, setAlerts] = useState([]);
    const [filter, setFilter] = useState('all'); // all, low_stock, expiring, expired
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 20,
        total: 0
    });
    const [stats, setStats] = useState({
        lowStock: 0,
        expiring: 0,
        expired: 0,
        total: 0
    });

    // Load data and generate alerts
    const loadData = useCallback(async () => {
        try {
            setLoading(true);

            // Get stock by batch data
            const response = await api.get('/inventory/stock-by-batch');
            const stockData = response.data || [];

            // Generate alerts from stock data
            const generatedAlerts = [];
            let lowStockCount = 0;
            let expiringCount = 0;
            let expiredCount = 0;

            stockData.forEach(batch => {
                const product = batch.product;
                const minStock = product.minStockLevel || 10;

                // Check for low stock
                if (batch.quantity <= minStock) {
                    generatedAlerts.push({
                        id: `low_${batch.productId}_${batch.batchNumber}`,
                        type: 'low_stock',
                        severity: batch.quantity === 0 ? 'critical' : batch.quantity <= minStock / 2 ? 'high' : 'medium',
                        product: product,
                        batchNumber: batch.batchNumber,
                        currentStock: batch.quantity,
                        minStock: minStock,
                        expiryDate: batch.expiryDate,
                        message: batch.quantity === 0
                            ? `Sản phẩm "${product.name}" đã hết hàng`
                            : `Sản phẩm "${product.name}" sắp hết hàng (${batch.quantity}/${minStock})`,
                        createdAt: new Date()
                    });
                    lowStockCount++;
                }

                // Check for expiring/expired products
                if (batch.expiryDate) {
                    const expiry = dayjs(batch.expiryDate);
                    const daysUntilExpiry = expiry.diff(dayjs(), 'days');

                    if (daysUntilExpiry < 0) {
                        // Expired
                        generatedAlerts.push({
                            id: `expired_${batch.productId}_${batch.batchNumber}`,
                            type: 'expired',
                            severity: 'critical',
                            product: product,
                            batchNumber: batch.batchNumber,
                            currentStock: batch.quantity,
                            expiryDate: batch.expiryDate,
                            daysUntilExpiry: daysUntilExpiry,
                            message: `Sản phẩm "${product.name}" (Lô: ${batch.batchNumber}) đã hết hạn ${Math.abs(daysUntilExpiry)} ngày`,
                            createdAt: new Date()
                        });
                        expiredCount++;
                    } else if (daysUntilExpiry <= 30) {
                        // Expiring soon
                        generatedAlerts.push({
                            id: `expiring_${batch.productId}_${batch.batchNumber}`,
                            type: 'expiring',
                            severity: daysUntilExpiry <= 7 ? 'high' : 'medium',
                            product: product,
                            batchNumber: batch.batchNumber,
                            currentStock: batch.quantity,
                            expiryDate: batch.expiryDate,
                            daysUntilExpiry: daysUntilExpiry,
                            message: `Sản phẩm "${product.name}" (Lô: ${batch.batchNumber}) sắp hết hạn trong ${daysUntilExpiry} ngày`,
                            createdAt: new Date()
                        });
                        expiringCount++;
                    }
                }
            });

            // Sort by severity and date
            generatedAlerts.sort((a, b) => {
                const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
                if (severityOrder[a.severity] !== severityOrder[b.severity]) {
                    return severityOrder[a.severity] - severityOrder[b.severity];
                }
                return new Date(b.createdAt) - new Date(a.createdAt);
            });

            setAlerts(generatedAlerts);
            setStats({
                lowStock: lowStockCount,
                expiring: expiringCount,
                expired: expiredCount,
                total: generatedAlerts.length
            });

        } catch (error) {
            console.error('Load data error:', error);
            Swal.fire({
                title: 'Lỗi!',
                text: 'Không thể tải dữ liệu cảnh báo',
                icon: 'error',
                timer: 3000,
                showConfirmButton: false,
                toast: true,
                position: 'top-end'
            });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const getSeverityColor = (severity) => {
        const colors = {
            critical: 'error',
            high: 'warning',
            medium: 'orange',
            low: 'default'
        };
        return colors[severity] || 'default';
    };

    const getSeverityText = (severity) => {
        const texts = {
            critical: 'Nghiêm trọng',
            high: 'Cao',
            medium: 'Trung bình',
            low: 'Thấp'
        };
        return texts[severity] || severity;
    };

    const getTypeIcon = (type) => {
        const icons = {
            low_stock: <WarningOutlined />,
            expiring: <ClockCircleOutlined />,
            expired: <FireOutlined />
        };
        return icons[type] || <ExclamationCircleOutlined />;
    };

    const getTypeText = (type) => {
        const texts = {
            low_stock: 'Tồn kho thấp',
            expiring: 'Sắp hết hạn',
            expired: 'Đã hết hạn'
        };
        return texts[type] || type;
    };

    // Filter alerts
    const filteredAlerts = alerts.filter(alert => {
        if (filter === 'all') return true;
        return alert.type === filter;
    });

    const columns = [
        {
            title: 'Mức độ',
            dataIndex: 'severity',
            key: 'severity',
            width: 120,
            align: 'center',
            render: (severity) => (
                <Tag color={getSeverityColor(severity)}>
                    {getSeverityText(severity)}
                </Tag>
            )
        },
        {
            title: 'Loại',
            dataIndex: 'type',
            key: 'type',
            width: 140,
            render: (type) => (
                <Space>
                    {getTypeIcon(type)}
                    <Text>{getTypeText(type)}</Text>
                </Space>
            )
        },
        {
            title: 'Sản phẩm',
            dataIndex: 'product',
            key: 'product',
            width: 250,
            render: (product) => (
                <Space direction="vertical" size={0}>
                    <Text strong>{product?.name}</Text>
                    <Text type="secondary" style={{ fontSize: '12px' }}>{product?.sku}</Text>
                </Space>
            ),
            width: 250
        },
        {
            title: 'Số lô',
            dataIndex: 'batchNumber',
            key: 'batchNumber',
            width: 120,
            align: 'center',
            render: (batch) => batch || '-'
        },
        {
            title: 'Tồn kho',
            dataIndex: 'currentStock',
            key: 'currentStock',
            width: 100,
            align: 'center',
            render: (stock, record) => (
                <Text type={stock === 0 ? 'danger' : stock <= (record.minStock || 10) / 2 ? 'warning' : 'default'} strong>
                    {stock}
                </Text>
            )
        },
        {
            title: 'Hạn sử dụng',
            dataIndex: 'expiryDate',
            key: 'expiryDate',
            width: 130,
            align: 'center',
            render: (date, record) => {
                if (!date) return <Text type="secondary">-</Text>;
                const expiry = dayjs(date);
                const daysUntilExpiry = record.daysUntilExpiry;

                let color = 'default';
                if (daysUntilExpiry < 0) color = 'error';
                else if (daysUntilExpiry <= 7) color = 'warning';
                else if (daysUntilExpiry <= 30) color = 'orange';

                return (
                    <Tooltip title={daysUntilExpiry < 0 ? `Đã hết hạn ${Math.abs(daysUntilExpiry)} ngày` : `Còn ${daysUntilExpiry} ngày`}>
                        <Tag color={color}>{expiry.format('DD/MM/YYYY')}</Tag>
                    </Tooltip>
                );
            }
        },
        {
            title: 'Thông báo',
            dataIndex: 'message',
            key: 'message',
            render: (message) => <Text>{message}</Text>
        }
    ];

    return (
        <div>
            {/* Stats Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                <Col xs={24} sm={6}>
                    <Card>
                        <Statistic
                            title="Tổng cảnh báo"
                            value={stats.total}
                            prefix={<ExclamationCircleOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={6}>
                    <Card>
                        <Statistic
                            title="Tồn kho thấp"
                            value={stats.lowStock}
                            prefix={<WarningOutlined />}
                            valueStyle={{ color: '#fa8c16' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={6}>
                    <Card>
                        <Statistic
                            title="Sắp hết hạn"
                            value={stats.expiring}
                            prefix={<ClockCircleOutlined />}
                            valueStyle={{ color: '#faad14' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={6}>
                    <Card>
                        <Statistic
                            title="Đã hết hạn"
                            value={stats.expired}
                            prefix={<FireOutlined />}
                            valueStyle={{ color: '#f5222d' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Filters */}
            <Card style={{ marginBottom: '24px' }}>
                <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} sm={12} lg={8}>
                        <Select
                            value={filter}
                            onChange={setFilter}
                            style={{ width: '100%' }}
                        >
                            <Option value="all">Tất cả cảnh báo</Option>
                            <Option value="low_stock">Tồn kho thấp</Option>
                            <Option value="expiring">Sắp hết hạn</Option>
                            <Option value="expired">Đã hết hạn</Option>
                        </Select>
                    </Col>
                    <Col xs={24} sm={12} lg={4}>
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={loadData}
                            loading={loading}
                            block
                        >
                            Làm mới
                        </Button>
                    </Col>
                </Row>
            </Card>

            {/* Table */}
            <Card>
                {filteredAlerts.length === 0 ? (
                    <Empty
                        description="Không có cảnh báo nào"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                ) : (
                    <Table
                        columns={columns}
                        dataSource={filteredAlerts}
                        rowKey="id"
                        loading={loading}
                        pagination={{
                            current: pagination.current,
                            pageSize: pagination.pageSize,
                            total: filteredAlerts.length,
                            showSizeChanger: true,
                            showQuickJumper: true,
                            showTotal: (total) => `Tổng ${total} cảnh báo`,
                            pageSizeOptions: ['10', '20', '50', '100']
                        }}
                        onChange={(paginationInfo) => {
                            setPagination({
                                current: paginationInfo.current,
                                pageSize: paginationInfo.pageSize,
                                total: filteredAlerts.length
                            });
                        }}
                    />
                )}
            </Card>
        </div>
    );
}

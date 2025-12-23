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
    DatePicker
} from 'antd';
import {
    ReloadOutlined,
    FileTextOutlined,
    DollarOutlined,
    ShoppingOutlined,
    EyeOutlined
} from '@ant-design/icons';
import api from '../../../../api/client.js';
import Swal from 'sweetalert2';
import dayjs from 'dayjs';

const { Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

export default function GoodsReceiptTab() {
    const [loading, setLoading] = useState(false);
    const [transactions, setTransactions] = useState([]);
    const [batches, setBatches] = useState([]); // Changed from products to batches
    const [suppliers, setSuppliers] = useState([]);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 20,
        total: 0
    });
    const [filters, setFilters] = useState({
        batchNumber: undefined, // Changed from productId to batchNumber
        supplierId: undefined,
        dateRange: null
    });
    const [stats, setStats] = useState({
        totalImports: 0,
        totalQuantity: 0,
        totalValue: 0
    });

    // Load data
    const loadData = useCallback(async () => {
        try {
            setLoading(true);

            const params = {
                page: pagination.current,
                limit: pagination.pageSize,
                type: 'import' // Only show import transactions
            };

            if (filters.batchNumber) params.batchNumber = filters.batchNumber; // Changed to filter by batch
            if (filters.supplierId) params.supplierId = filters.supplierId;
            if (filters.dateRange && filters.dateRange[0]) {
                params.startDate = filters.dateRange[0].format('YYYY-MM-DD');
                params.endDate = filters.dateRange[1].format('YYYY-MM-DD');
            }

            const [transactionsRes, batchesRes, suppliersRes] = await Promise.all([
                api.get('/inventory/transactions', { params }),
                api.get('/inventory/stock-by-batch'), // Get batches instead of products
                api.get('/suppliers')
            ]);

            const importTransactions = transactionsRes.data.transactions || [];
            setTransactions(importTransactions);

            // Extract unique batch numbers
            const uniqueBatches = [...new Set(batchesRes.data.map(b => b.batchNumber).filter(Boolean))];
            setBatches(uniqueBatches.sort());

            setSuppliers(suppliersRes.data.items || []);

            // Use stats from backend (calculated from ALL filtered transactions, not just current page)
            if (transactionsRes.data.stats) {
                setStats(transactionsRes.data.stats);
            } else {
                // Fallback: calculate from current page only
                const totalImports = importTransactions.length;
                const totalQuantity = importTransactions.reduce((sum, t) => sum + t.quantity, 0);
                const totalValue = importTransactions.reduce((sum, t) => sum + (t.unitCost * t.quantity || 0), 0);

                setStats({
                    totalImports,
                    totalQuantity,
                    totalValue
                });
            }

            setPagination(prev => ({
                ...prev,
                total: transactionsRes.data.pagination?.total || 0
            }));

        } catch (error) {
            console.error('Load data error:', error);
            Swal.fire({
                title: 'Lỗi!',
                text: 'Không thể tải dữ liệu',
                icon: 'error',
                timer: 3000,
                showConfirmButton: false,
                toast: true,
                position: 'top-end'
            });
        } finally {
            setLoading(false);
        }
    }, [pagination.current, pagination.pageSize, filters]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleTableChange = (paginationInfo) => {
        setPagination(prev => ({
            ...prev,
            current: paginationInfo.current,
            pageSize: paginationInfo.pageSize
        }));
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
        setPagination(prev => ({
            ...prev,
            current: 1
        }));
    };

    const columns = [
        {
            title: 'Thời gian',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm'),
            width: 130
        },
        {
            title: 'Sản phẩm',
            dataIndex: 'productId',
            key: 'productId',
            render: (product) => (
                <Space direction="vertical" size={0}>
                    <Text strong>{product?.name || 'N/A'}</Text>
                    <Text type="secondary" style={{ fontSize: '12px' }}>{product?.sku}</Text>
                </Space>
            ),
            width: 200
        },
        {
            title: 'Số lô',
            dataIndex: 'batchNumber',
            key: 'batchNumber',
            render: (text) => text || '-',
            width: 100,
            align: 'center'
        },
        {
            title: 'SL',
            dataIndex: 'quantity',
            key: 'quantity',
            render: (qty) => <Text type="success" strong>+{qty}</Text>,
            width: 70,
            align: 'center'
        },
        {
            title: 'Đơn giá',
            dataIndex: 'unitCost',
            key: 'unitCost',
            render: (cost) => cost ? `${cost.toLocaleString('vi-VN')} ₫` : '-',
            width: 110,
            align: 'right'
        },
        {
            title: 'Thành tiền',
            key: 'totalCost',
            render: (_, record) => {
                const total = (record.unitCost || 0) * record.quantity;
                return <Text strong>{total.toLocaleString('vi-VN')} ₫</Text>;
            },
            width: 120,
            align: 'right'
        },
        {
            title: 'HSD',
            dataIndex: 'expiryDate',
            key: 'expiryDate',
            render: (date) => {
                if (!date) return <Text type="secondary">-</Text>;
                const expiry = dayjs(date);
                const daysUntilExpiry = expiry.diff(dayjs(), 'days');
                let color = 'default';
                if (daysUntilExpiry < 0) color = 'error';
                else if (daysUntilExpiry < 30) color = 'warning';
                else if (daysUntilExpiry < 90) color = 'orange';

                return (
                    <Tooltip title={`${daysUntilExpiry} ngày còn lại`}>
                        <Tag color={color}>{expiry.format('DD/MM/YYYY')}</Tag>
                    </Tooltip>
                );
            },
            width: 110,
            align: 'center'
        },
        {
            title: 'Nhà cung cấp',
            dataIndex: 'supplierId',
            key: 'supplierId',
            render: (supplier) => supplier?.name || '-',
            width: 140
        },
        {
            title: 'Người nhập',
            dataIndex: 'performedBy',
            key: 'performedBy',
            render: (user) => user?.name || 'N/A',
            width: 120
        }
    ];

    return (
        <div>
            {/* Stats Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                <Col xs={24} sm={8}>
                    <Card>
                        <Statistic
                            title="Tổng số lần nhập"
                            value={stats.totalImports}
                            prefix={<FileTextOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card>
                        <Statistic
                            title="Tổng số lượng"
                            value={stats.totalQuantity}
                            prefix={<ShoppingOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card>
                        <Statistic
                            title="Tổng giá trị"
                            value={stats.totalValue}
                            prefix={<DollarOutlined />}
                            formatter={(value) => `${value.toLocaleString('vi-VN')} ₫`}
                            valueStyle={{ color: '#722ed1' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Filters */}
            <Card style={{ marginBottom: '24px' }}>
                <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} sm={12} lg={6}>
                        <Select
                            placeholder="Chọn số lô"
                            value={filters.batchNumber}
                            onChange={(value) => handleFilterChange('batchNumber', value)}
                            style={{ width: '100%' }}
                            allowClear
                            showSearch
                            optionFilterProp="children"
                        >
                            {batches.map(batchNum => (
                                <Option key={batchNum} value={batchNum}>
                                    {batchNum}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Select
                            placeholder="Chọn nhà cung cấp"
                            value={filters.supplierId}
                            onChange={(value) => handleFilterChange('supplierId', value)}
                            style={{ width: '100%' }}
                            allowClear
                            showSearch
                            optionFilterProp="children"
                        >
                            {suppliers.map(supplier => (
                                <Option key={supplier._id} value={supplier._id}>
                                    {supplier.name}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                    <Col xs={24} sm={12} lg={8}>
                        <RangePicker
                            value={filters.dateRange}
                            onChange={(dates) => handleFilterChange('dateRange', dates)}
                            style={{ width: '100%' }}
                            format="DD/MM/YYYY"
                            placeholder={['Từ ngày', 'Đến ngày']}
                        />
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
                <Table
                    columns={columns}
                    dataSource={transactions}
                    rowKey="_id"
                    loading={loading}
                    pagination={{
                        ...pagination,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} của ${total} phiếu nhập`
                    }}
                    onChange={handleTableChange}
                    scroll={{ x: 1100 }}
                />
            </Card>
        </div>
    );
}

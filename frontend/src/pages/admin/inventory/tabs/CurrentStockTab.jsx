import React, { useState, useEffect, useCallback } from 'react';
import { Table, Card, Input, Button, Tag, Space, Typography, Tooltip, Modal, Descriptions } from 'antd';
import { SearchOutlined, ReloadOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../../../../api/client';
import dayjs from 'dayjs';
import Swal from 'sweetalert2';

const { Text } = Typography;

export default function CurrentStockTab() {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 20,
        total: 0
    });
    const [detailModal, setDetailModal] = useState({ visible: false, data: null });
    const [transactionHistory, setTransactionHistory] = useState([]);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get('/inventory/stock-by-batch');
            setData(response.data);
        } catch (error) {
            console.error('Load stock data error:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleViewDetail = async (record) => {
        try {
            setLoading(true);
            const response = await api.get(`/inventory/transactions/product/${record.productId}`);
            setTransactionHistory(response.data);
            setDetailModal({ visible: true, data: record });
        } catch (error) {
            console.error('Load transaction history error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteBatch = async (record) => {
        try {
            const result = await Swal.fire({
                title: 'Xác nhận xóa lô hàng?',
                html: `
                    <p>Bạn có chắc chắn muốn xóa lô hàng này?</p>
                    <p><strong>Sản phẩm:</strong> ${record.product.name}</p>
                    <p><strong>Số lô:</strong> ${record.batchNumber}</p>
                    <p><strong>Số lượng:</strong> ${record.quantity} ${record.product.unit}</p>
                    <p style="color: #cf1322; margin-top: 10px;">
                        <strong>Lưu ý:</strong> Tất cả giao dịch liên quan đến lô này sẽ bị xóa!
                    </p>
                `,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Xóa',
                cancelButtonText: 'Hủy'
            });

            if (result.isConfirmed) {
                setLoading(true);

                // Get all transactions for this product
                const transactionsResponse = await api.get(`/inventory/transactions/product/${record.productId}`);
                const transactions = transactionsResponse.data;

                // Filter transactions for this specific batch
                const batchTransactions = transactions.filter(t =>
                    t.batchNumber === record.batchNumber &&
                    (!record.expiryDate || (t.expiryDate && dayjs(t.expiryDate).isSame(dayjs(record.expiryDate), 'day')))
                );

                // Delete all transactions for this batch
                await Promise.all(
                    batchTransactions.map(t => api.delete(`/inventory/transactions/${t._id}`))
                );

                Swal.fire({
                    title: 'Đã xóa!',
                    text: `Đã xóa lô hàng và ${batchTransactions.length} giao dịch liên quan`,
                    icon: 'success',
                    timer: 3000,
                    showConfirmButton: false,
                    toast: true,
                    position: 'top-end'
                });

                loadData();
            }
        } catch (error) {
            console.error('Delete batch error:', error);
            Swal.fire({
                title: 'Lỗi!',
                text: error.response?.data?.message || 'Không thể xóa lô hàng',
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

    const columns = [
        {
            title: 'Sản phẩm',
            dataIndex: ['product', 'name'],
            key: 'productName',
            width: 250,
            render: (text, record) => (
                <Space direction="vertical" size={0}>
                    <Text strong>{text}</Text>
                    <Text type="secondary" style={{ fontSize: '12px' }}>{record.product.sku}</Text>
                </Space>
            ),
            filteredValue: searchText ? [searchText] : null,
            onFilter: (value, record) =>
                record.product.name.toLowerCase().includes(value.toLowerCase()) ||
                record.product.sku?.toLowerCase().includes(value.toLowerCase()) ||
                record.batchNumber?.toLowerCase().includes(value.toLowerCase())
        },
        {
            title: 'Số lô',
            dataIndex: 'batchNumber',
            key: 'batchNumber',
            width: 120,
            align: 'center'
        },
        {
            title: 'Ngày nhập',
            key: 'importDate',
            width: 120,
            align: 'center',
            render: (_, record) => {
                // Get the earliest import date (batch creation date)
                const importDate = record.firstImportDate || record.createdAt;
                return importDate ? (
                    <Text>{dayjs(importDate).format('DD/MM/YYYY')}</Text>
                ) : (
                    <Text type="secondary">N/A</Text>
                );
            }
        },
        {
            title: 'Hạn sử dụng',
            dataIndex: 'expiryDate',
            key: 'expiryDate',
            width: 130,
            align: 'center',
            render: (date) => {
                if (!date) return <Text type="secondary">N/A</Text>;
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
            sorter: (a, b) => new Date(a.expiryDate) - new Date(b.expiryDate)
        },
        {
            title: 'Tồn kho',
            dataIndex: 'quantity',
            key: 'quantity',
            width: 100,
            align: 'center',
            render: (qty, record) => (
                <Text strong style={{ color: qty <= (record.product.minStockLevel || 10) ? '#cf1322' : 'inherit' }}>
                    {qty} {record.product.unit}
                </Text>
            ),
            sorter: (a, b) => a.quantity - b.quantity
        },
        {
            title: 'Trạng thái',
            key: 'status',
            width: 130,
            align: 'center',
            render: (_, record) => {
                const isLowStock = record.quantity <= (record.product.minStockLevel || 10);
                const isExpired = record.expiryDate && dayjs(record.expiryDate).isBefore(dayjs());

                if (isExpired) return <Tag color="error">Hết hạn</Tag>;
                if (isLowStock) return <Tag color="warning">Sắp hết hàng</Tag>;
                return <Tag color="success">Còn hàng</Tag>;
            }
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 100,
            align: 'center',
            fixed: 'right',
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="Xem chi tiết">
                        <Button
                            type="text"
                            icon={<EyeOutlined />}
                            onClick={() => handleViewDetail(record)}
                            size="small"
                        />
                    </Tooltip>
                    <Tooltip title="Xóa lô hàng">
                        <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => handleDeleteBatch(record)}
                            size="small"
                        />
                    </Tooltip>
                </Space>
            )
        }
    ];

    const transactionColumns = [
        {
            title: 'Ngày',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm')
        },
        {
            title: 'Loại',
            dataIndex: 'type',
            key: 'type',
            render: (type) => {
                const typeMap = {
                    import: { text: 'Nhập kho', color: 'green' },
                    export: { text: 'Xuất kho', color: 'red' },
                    adjust: { text: 'Điều chỉnh', color: 'blue' }
                };
                const config = typeMap[type] || { text: type, color: 'default' };
                return <Tag color={config.color}>{config.text}</Tag>;
            }
        },
        {
            title: 'Số lượng',
            dataIndex: 'quantity',
            key: 'quantity',
            render: (qty, record) => (
                <Text type={record.type === 'import' ? 'success' : record.type === 'export' ? 'danger' : 'default'}>
                    {record.type === 'import' ? '+' : record.type === 'export' ? '-' : ''}{qty}
                </Text>
            )
        },
        {
            title: 'Người thực hiện',
            dataIndex: ['performedBy', 'name'],
            key: 'performedBy'
        }
    ];

    return (
        <Card>
            <Space style={{ marginBottom: 16 }}>
                <Input
                    placeholder="Tìm kiếm tên, SKU, số lô..."
                    prefix={<SearchOutlined />}
                    onChange={e => setSearchText(e.target.value)}
                    style={{ width: 300 }}
                />
                <Button icon={<ReloadOutlined />} onClick={loadData}>
                    Làm mới
                </Button>
            </Space>

            <Table
                columns={columns}
                dataSource={data}
                rowKey={(record) => `${record.productId}-${record.batchNumber}-${record.expiryDate}`}
                loading={loading}
                pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: data.length,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total) => `Tổng ${total} lô hàng`,
                    pageSizeOptions: ['10', '20', '50', '100']
                }}
                onChange={(paginationInfo) => {
                    setPagination({
                        current: paginationInfo.current,
                        pageSize: paginationInfo.pageSize,
                        total: data.length
                    });
                }}
            />

            <Modal
                title="Chi tiết tồn kho"
                open={detailModal.visible}
                onCancel={() => setDetailModal({ visible: false, data: null })}
                footer={null}
                width={800}
            >
                {detailModal.data && (
                    <>
                        <Descriptions bordered column={2} size="small">
                            <Descriptions.Item label="Sản phẩm" span={2}>
                                <Text strong>{detailModal.data.product.name}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="SKU">
                                {detailModal.data.product.sku}
                            </Descriptions.Item>
                            <Descriptions.Item label="Số lô">
                                {detailModal.data.batchNumber}
                            </Descriptions.Item>
                            <Descriptions.Item label="Hạn sử dụng">
                                {detailModal.data.expiryDate ? dayjs(detailModal.data.expiryDate).format('DD/MM/YYYY') : 'N/A'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Tồn kho hiện tại">
                                <Text strong>{detailModal.data.quantity} {detailModal.data.product.unit}</Text>
                            </Descriptions.Item>
                        </Descriptions>

                        <div style={{ marginTop: 24 }}>
                            <Text strong>Lịch sử giao dịch:</Text>
                            <Table
                                columns={transactionColumns}
                                dataSource={transactionHistory}
                                rowKey="_id"
                                pagination={false}
                                size="small"
                                style={{ marginTop: 12 }}
                            />
                        </div>
                    </>
                )}
            </Modal>
        </Card >
    );
}

import React, { useState, useEffect } from 'react';
import { Modal, Table, Tag, Typography, Spin, Empty } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import api from '../../api/client';
import dayjs from 'dayjs';

const { Text } = Typography;

export default function ProductBatchModal({ visible, onClose, productId, productName }) {
    const [loading, setLoading] = useState(false);
    const [batches, setBatches] = useState([]);

    useEffect(() => {
        if (visible && productId) {
            loadBatches();
        }
    }, [visible, productId]);

    const loadBatches = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/product-batches/products/${productId}/batches`);
            setBatches(response.data.batches || []);
        } catch (error) {
            console.error('Load batches error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Get expiry date color based on days until expiry
    const getExpiryColor = (expiryDate) => {
        if (!expiryDate) return 'default';

        const now = dayjs();
        const expiry = dayjs(expiryDate);
        const daysUntilExpiry = expiry.diff(now, 'days');

        if (daysUntilExpiry < 0) return 'error'; // Expired
        if (daysUntilExpiry < 30) return 'warning'; // < 30 days
        if (daysUntilExpiry < 90) return 'orange'; // < 90 days
        return 'success'; // > 90 days
    };

    // Get status tag color
    const getStatusColor = (status) => {
        const colors = {
            active: 'success',
            depleted: 'default',
            expired: 'error'
        };
        return colors[status] || 'default';
    };

    // Get status text
    const getStatusText = (status) => {
        const texts = {
            active: 'Còn hàng',
            depleted: 'Hết hàng',
            expired: 'Hết hạn'
        };
        return texts[status] || status;
    };

    const columns = [
        {
            title: 'Số lô',
            dataIndex: 'batchNumber',
            key: 'batchNumber',
            width: 120,
            render: (text) => <Text strong>{text}</Text>
        },
        {
            title: 'Số lượng',
            key: 'quantity',
            width: 150,
            render: (_, record) => (
                <div>
                    <Text strong style={{ color: record.remainingQuantity > 0 ? '#52c41a' : '#ff4d4f' }}>
                        {record.remainingQuantity}
                    </Text>
                    <Text type="secondary"> / {record.quantity}</Text>
                    <div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            ({Math.round((record.remainingQuantity / record.quantity) * 100)}%)
                        </Text>
                    </div>
                </div>
            )
        },
        {
            title: 'Ngày nhập',
            dataIndex: 'importDate',
            key: 'importDate',
            width: 120,
            render: (date) => dayjs(date).format('DD/MM/YYYY')
        },
        {
            title: 'Hạn sử dụng',
            dataIndex: 'expiryDate',
            key: 'expiryDate',
            width: 140,
            render: (date) => {
                if (!date) return <Text type="secondary">-</Text>;

                const color = getExpiryColor(date);
                const daysUntilExpiry = dayjs(date).diff(dayjs(), 'days');

                return (
                    <div>
                        <Tag color={color}>
                            {dayjs(date).format('DD/MM/YYYY')}
                        </Tag>
                        {daysUntilExpiry >= 0 && (
                            <div style={{ fontSize: '11px', color: '#8c8c8c', marginTop: '4px' }}>
                                Còn {daysUntilExpiry} ngày
                            </div>
                        )}
                        {daysUntilExpiry < 0 && (
                            <div style={{ fontSize: '11px', color: '#ff4d4f', marginTop: '4px' }}>
                                Đã hết hạn
                            </div>
                        )}
                    </div>
                );
            }
        },
        {
            title: 'Nhà cung cấp',
            dataIndex: 'supplierId',
            key: 'supplierId',
            width: 150,
            ellipsis: true,
            render: (supplier) => supplier?.name || '-'
        },
        {
            title: 'Đơn giá nhập',
            dataIndex: 'unitCost',
            key: 'unitCost',
            width: 120,
            align: 'right',
            render: (cost) => `${cost.toLocaleString('vi-VN')} ₫`
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: 100,
            align: 'center',
            render: (status) => (
                <Tag color={getStatusColor(status)}>
                    {getStatusText(status)}
                </Tag>
            )
        }
    ];

    return (
        <Modal
            title={
                <div>
                    <InboxOutlined style={{ marginRight: '8px' }} />
                    Danh sách lô hàng - {productName}
                </div>
            }
            open={visible}
            onCancel={onClose}
            footer={null}
            width={1000}
            style={{ top: 20 }}
        >
            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <Spin size="large" />
                </div>
            ) : batches.length === 0 ? (
                <Empty
                    description="Chưa có lô hàng nào cho sản phẩm này"
                    style={{ padding: '40px' }}
                />
            ) : (
                <Table
                    columns={columns}
                    dataSource={batches}
                    rowKey="_id"
                    pagination={false}
                    scroll={{ x: 900 }}
                    size="middle"
                />
            )}
        </Modal>
    );
}

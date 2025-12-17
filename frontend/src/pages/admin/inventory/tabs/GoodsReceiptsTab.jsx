import React, { useState, useEffect, useCallback } from 'react';
import {
    Card,
    Table,
    Button,
    Space,
    Tag,
    Modal,
    Descriptions,
    Select,
    DatePicker,
    Popconfirm,
    message as antMessage
} from 'antd';
import {
    EyeOutlined,
    EditOutlined,
    DeleteOutlined,
    CheckOutlined,
    ReloadOutlined,
    FileTextOutlined
} from '@ant-design/icons';
import api from '../../../../api/client.js';
import Swal from 'sweetalert2';
import dayjs from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;

export default function GoodsReceiptsTab() {
    const [loading, setLoading] = useState(false);
    const [receipts, setReceipts] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 20,
        total: 0
    });
    const [filters, setFilters] = useState({
        status: undefined,
        supplierId: undefined,
        dateRange: null
    });
    const [viewModalVisible, setViewModalVisible] = useState(false);
    const [selectedReceipt, setSelectedReceipt] = useState(null);

    // Load data
    const loadData = useCallback(async () => {
        try {
            setLoading(true);

            const params = {
                page: pagination.current,
                limit: pagination.pageSize
            };

            if (filters.status) params.status = filters.status;
            if (filters.supplierId) params.supplierId = filters.supplierId;
            if (filters.dateRange && filters.dateRange[0]) {
                params.startDate = filters.dateRange[0].format('YYYY-MM-DD');
                params.endDate = filters.dateRange[1].format('YYYY-MM-DD');
            }

            const [receiptsRes, suppliersRes] = await Promise.all([
                api.get('/goods-receipts', { params }),
                api.get('/suppliers')
            ]);

            setReceipts(receiptsRes.data.goodsReceipts || []);
            setSuppliers(suppliersRes.data.items || []);

            setPagination(prev => ({
                ...prev,
                total: receiptsRes.data.pagination?.total || 0
            }));

        } catch (error) {
            console.error('Load data error:', error);
            antMessage.error('Không thể tải dữ liệu');
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

    const handleViewDetails = (receipt) => {
        setSelectedReceipt(receipt);
        setViewModalVisible(true);
    };

    const handleApprove = async (receiptId) => {
        try {
            setLoading(true);
            await api.patch(`/goods-receipts/${receiptId}/approve`);

            Swal.fire({
                title: 'Thành công!',
                text: 'Đã duyệt phiếu nhập thành công',
                icon: 'success',
                timer: 3000,
                showConfirmButton: false,
                toast: true,
                position: 'top-end'
            });

            loadData();
        } catch (error) {
            console.error('Approve error:', error);
            Swal.fire({
                title: 'Lỗi!',
                text: error.response?.data?.message || 'Không thể duyệt phiếu nhập',
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

    const handleDelete = async (receiptId) => {
        try {
            setLoading(true);
            await api.delete(`/goods-receipts/${receiptId}`);

            Swal.fire({
                title: 'Đã xóa!',
                text: 'Đã xóa phiếu nhập thành công',
                icon: 'success',
                timer: 3000,
                showConfirmButton: false,
                toast: true,
                position: 'top-end'
            });

            loadData();
        } catch (error) {
            console.error('Delete error:', error);
            Swal.fire({
                title: 'Lỗi!',
                text: error.response?.data?.message || 'Không thể xóa phiếu nhập',
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

    const getStatusTag = (status) => {
        const statusConfig = {
            draft: { color: 'default', text: 'Nháp' },
            pending: { color: 'processing', text: 'Chờ duyệt' },
            approved: { color: 'success', text: 'Đã duyệt' },
            rejected: { color: 'error', text: 'Từ chối' }
        };
        const config = statusConfig[status] || { color: 'default', text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
    };

    const columns = [
        {
            title: 'Mã phiếu',
            dataIndex: 'code',
            key: 'code',
            width: 140,
            render: (code) => <span style={{ fontWeight: 500 }}>{code}</span>
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: 110,
            render: (status) => getStatusTag(status)
        },
        {
            title: 'Nhà cung cấp',
            dataIndex: 'supplierId',
            key: 'supplierId',
            width: 180,
            render: (supplier) => supplier?.name || '-',
            width: 180
        },
        {
            title: 'Số lô',
            dataIndex: 'batchNumber',
            key: 'batchNumber',
            width: 120,
            align: 'center'
        },
        {
            title: 'Số SP',
            dataIndex: 'items',
            key: 'itemCount',
            width: 80,
            align: 'center',
            render: (items) => items?.length || 0
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'totalAmount',
            key: 'totalAmount',
            width: 140,
            align: 'right',
            render: (amount) => `${(amount || 0).toLocaleString('vi-VN')} ₫`
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 130,
            render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm')
        },
        {
            title: 'Người tạo',
            dataIndex: 'createdBy',
            key: 'createdBy',
            width: 130,
            render: (user) => user?.name || 'N/A',
            width: 130
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 150,
            fixed: 'right',
            render: (_, record) => (
                <Space size="small">
                    <Button
                        type="text"
                        icon={<EyeOutlined />}
                        onClick={() => handleViewDetails(record)}
                        title="Xem chi tiết"
                    />
                    {record.status === 'draft' && (
                        <>
                            <Popconfirm
                                title="Xóa phiếu nháp?"
                                description="Bạn có chắc muốn xóa phiếu nháp này?"
                                onConfirm={() => handleDelete(record._id)}
                                okText="Xóa"
                                cancelText="Hủy"
                            >
                                <Button
                                    type="text"
                                    danger
                                    icon={<DeleteOutlined />}
                                    title="Xóa"
                                />
                            </Popconfirm>
                        </>
                    )}
                    {(record.status === 'pending' || record.status === 'draft') && (
                        <Popconfirm
                            title="Duyệt phiếu nhập?"
                            description="Phiếu nhập sẽ được duyệt và cập nhật tồn kho"
                            onConfirm={() => handleApprove(record._id)}
                            okText="Duyệt"
                            cancelText="Hủy"
                        >
                            <Button
                                type="text"
                                style={{ color: '#52c41a' }}
                                icon={<CheckOutlined />}
                                title="Duyệt"
                            />
                        </Popconfirm>
                    )}
                </Space>
            )
        }
    ];

    return (
        <div>
            {/* Filters */}
            <Card style={{ marginBottom: '24px' }}>
                <Space size="middle" wrap>
                    <Select
                        placeholder="Trạng thái"
                        value={filters.status}
                        onChange={(value) => handleFilterChange('status', value)}
                        style={{ width: 150 }}
                        allowClear
                    >
                        <Option value="draft">Nháp</Option>
                        <Option value="pending">Chờ duyệt</Option>
                        <Option value="approved">Đã duyệt</Option>
                        <Option value="rejected">Từ chối</Option>
                    </Select>

                    <Select
                        placeholder="Nhà cung cấp"
                        value={filters.supplierId}
                        onChange={(value) => handleFilterChange('supplierId', value)}
                        style={{ width: 200 }}
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

                    <RangePicker
                        value={filters.dateRange}
                        onChange={(dates) => handleFilterChange('dateRange', dates)}
                        format="DD/MM/YYYY"
                        placeholder={['Từ ngày', 'Đến ngày']}
                    />

                    <Button
                        icon={<ReloadOutlined />}
                        onClick={loadData}
                        loading={loading}
                    >
                        Làm mới
                    </Button>
                </Space>
            </Card>

            {/* Table */}
            <Card>
                <Table
                    columns={columns}
                    dataSource={receipts}
                    rowKey="_id"
                    loading={loading}
                    pagination={{
                        ...pagination,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} của ${total} phiếu`
                    }}
                    onChange={handleTableChange}
                    scroll={{ x: 1200 }}
                />
            </Card>

            {/* View Details Modal */}
            <Modal
                title={
                    <Space>
                        <FileTextOutlined />
                        Chi tiết phiếu nhập
                    </Space>
                }
                open={viewModalVisible}
                onCancel={() => setViewModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setViewModalVisible(false)}>
                        Đóng
                    </Button>
                ]}
                width={800}
            >
                {selectedReceipt && (
                    <>
                        <Descriptions bordered column={2} size="small">
                            <Descriptions.Item label="Mã phiếu">
                                {selectedReceipt.code}
                            </Descriptions.Item>
                            <Descriptions.Item label="Trạng thái">
                                {getStatusTag(selectedReceipt.status)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Nhà cung cấp">
                                {selectedReceipt.supplierId?.name || '-'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Số lô">
                                {selectedReceipt.batchNumber}
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày tạo">
                                {dayjs(selectedReceipt.createdAt).format('DD/MM/YYYY HH:mm')}
                            </Descriptions.Item>
                            <Descriptions.Item label="Người tạo">
                                {selectedReceipt.createdBy?.name || 'N/A'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Ghi chú" span={2}>
                                {selectedReceipt.note || '-'}
                            </Descriptions.Item>
                        </Descriptions>

                        <div style={{ marginTop: 16 }}>
                            <h4>Danh sách sản phẩm</h4>
                            <Table
                                dataSource={selectedReceipt.items || []}
                                rowKey={(item, index) => index}
                                pagination={false}
                                size="small"
                                columns={[
                                    {
                                        title: 'Sản phẩm',
                                        dataIndex: 'productId',
                                        render: (product) => product?.name || 'N/A'
                                    },
                                    {
                                        title: 'Số lượng',
                                        dataIndex: 'quantity',
                                        align: 'center',
                                        width: 100
                                    },
                                    {
                                        title: 'Đơn giá',
                                        dataIndex: 'unitCost',
                                        align: 'right',
                                        width: 120,
                                        render: (cost) => `${(cost || 0).toLocaleString('vi-VN')} ₫`
                                    },
                                    {
                                        title: 'Thành tiền',
                                        align: 'right',
                                        width: 130,
                                        render: (_, record) => {
                                            const total = (record.quantity || 0) * (record.unitCost || 0);
                                            return `${total.toLocaleString('vi-VN')} ₫`;
                                        }
                                    },
                                    {
                                        title: 'HSD',
                                        dataIndex: 'expiryDate',
                                        align: 'center',
                                        width: 110,
                                        render: (date) => date ? dayjs(date).format('DD/MM/YYYY') : '-'
                                    }
                                ]}
                            />
                        </div>

                        <div style={{ marginTop: 16, textAlign: 'right' }}>
                            <h3 style={{ color: '#1890ff' }}>
                                Tổng cộng: {(selectedReceipt.totalAmount || 0).toLocaleString('vi-VN')} ₫
                            </h3>
                        </div>
                    </>
                )}
            </Modal>
        </div>
    );
}

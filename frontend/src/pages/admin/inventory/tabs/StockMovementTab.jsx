import React, { useState, useEffect, useCallback } from 'react';
import {
    Card,
    Table,
    Button,
    Form,
    Input,
    Select,
    InputNumber,
    DatePicker,
    Space,
    Tag,
    Modal,
    Row,
    Col,
    Typography
} from 'antd';
import {
    PlusOutlined,
    SearchOutlined,
    ReloadOutlined,
    ImportOutlined,
    ExportOutlined
} from '@ant-design/icons';
import api from '../../../../api/client';
import Swal from 'sweetalert2';
import dayjs from 'dayjs';

const { Text } = Typography;
const { Option } = Select;

export default function StockMovementTab() {
    const [loading, setLoading] = useState(false);
    const [transactions, setTransactions] = useState([]);
    const [products, setProducts] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 20,
        total: 0
    });
    const [filters, setFilters] = useState({
        productId: '',
        type: '',
        supplierId: '',
        startDate: null,
        endDate: null
    });
    const [transactionModal, setTransactionModal] = useState({
        visible: false,
        mode: 'create',
        type: 'import', // 'import' or 'export' for quick actions
        data: null
    });
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [form] = Form.useForm();

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const params = {
                page: pagination.current,
                limit: pagination.pageSize,
                ...filters
            };

            if (filters.startDate) params.startDate = filters.startDate.format('YYYY-MM-DD');
            if (filters.endDate) params.endDate = filters.endDate.format('YYYY-MM-DD');

            const [transactionsRes, productsRes, suppliersRes] = await Promise.all([
                api.get('/inventory/transactions', { params }),
                api.get('/products?limit=1000'),
                api.get('/suppliers')
            ]);

            setTransactions(transactionsRes.data.transactions || []);
            setProducts(productsRes.data.items || []);
            setSuppliers(suppliersRes.data.items || []);

            setPagination(prev => ({
                ...prev,
                total: transactionsRes.data.pagination?.total || 0
            }));
        } catch (error) {
            console.error('Load data error:', error);
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
        setFilters(prev => ({ ...prev, [field]: value }));
        setPagination(prev => ({ ...prev, current: 1 }));
    };

    const handleCreateTransaction = (type = 'import') => {
        setTransactionModal({
            visible: true,
            mode: 'create',
            type: type,
            data: null
        });
        form.resetFields();
        form.setFieldsValue({ type: type });
    };

    const handleSubmitTransaction = async (values) => {
        try {
            setLoading(true);
            const data = {
                ...values,
                expiryDate: values.expiryDate ? values.expiryDate.format('YYYY-MM-DD') : undefined
            };

            await api.post('/inventory/transactions', data);

            Swal.fire({
                title: 'Thành công!',
                text: 'Tạo giao dịch thành công!',
                icon: 'success',
                timer: 3000,
                showConfirmButton: false,
                toast: true,
                position: 'top-end'
            });

            setTransactionModal({ visible: false, mode: 'create', type: 'import', data: null });
            form.resetFields();
            loadData();
        } catch (error) {
            console.error('Submit transaction error:', error);
            Swal.fire({
                title: 'Lỗi!',
                text: error.response?.data?.message || 'Không thể tạo giao dịch',
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

    const getTransactionTypeColor = (type) => {
        const colors = {
            import: 'green',
            export: 'red',
            adjust: 'blue',
            transfer: 'orange',
            return: 'purple'
        };
        return colors[type] || 'default';
    };

    const getTransactionTypeText = (type) => {
        const texts = {
            import: 'Nhập kho',
            export: 'Xuất kho',
            adjust: 'Điều chỉnh',
            transfer: 'Chuyển kho',
            return: 'Trả hàng'
        };
        return texts[type] || type;
    };

    const handleDeleteTransaction = async (transactionId) => {
        try {
            const result = await Swal.fire({
                title: 'Xác nhận xóa?',
                text: 'Bạn có chắc chắn muốn xóa giao dịch này?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Xóa',
                cancelButtonText: 'Hủy'
            });

            if (result.isConfirmed) {
                setLoading(true);
                await api.delete(`/inventory/transactions/${transactionId}`);

                Swal.fire({
                    title: 'Đã xóa!',
                    text: 'Giao dịch đã được xóa thành công',
                    icon: 'success',
                    timer: 3000,
                    showConfirmButton: false,
                    toast: true,
                    position: 'top-end'
                });

                loadData();
            }
        } catch (error) {
            console.error('Delete transaction error:', error);
            Swal.fire({
                title: 'Lỗi!',
                text: error.response?.data?.message || 'Không thể xóa giao dịch',
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

    const handleBulkDelete = async () => {
        if (selectedRowKeys.length === 0) {
            Swal.fire({
                title: 'Thông báo',
                text: 'Vui lòng chọn ít nhất một giao dịch để xóa',
                icon: 'info',
                timer: 3000,
                showConfirmButton: false,
                toast: true,
                position: 'top-end'
            });
            return;
        }

        try {
            const result = await Swal.fire({
                title: 'Xác nhận xóa?',
                text: `Bạn có chắc chắn muốn xóa ${selectedRowKeys.length} giao dịch đã chọn?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Xóa tất cả',
                cancelButtonText: 'Hủy'
            });

            if (result.isConfirmed) {
                setLoading(true);

                // Delete all selected transactions
                await Promise.all(
                    selectedRowKeys.map(id => api.delete(`/inventory/transactions/${id}`))
                );

                Swal.fire({
                    title: 'Đã xóa!',
                    text: `Đã xóa thành công ${selectedRowKeys.length} giao dịch`,
                    icon: 'success',
                    timer: 3000,
                    showConfirmButton: false,
                    toast: true,
                    position: 'top-end'
                });

                setSelectedRowKeys([]);
                loadData();
            }
        } catch (error) {
            console.error('Bulk delete error:', error);
            Swal.fire({
                title: 'Lỗi!',
                text: 'Không thể xóa các giao dịch đã chọn',
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
            title: 'Thời gian',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm'),
            width: 140
        },
        {
            title: 'Sản phẩm',
            dataIndex: 'productId',
            key: 'productId',
            render: (product) => product?.name || 'N/A',
            ellipsis: true,
            width: 250
        },
        {
            title: 'Loại',
            dataIndex: 'type',
            key: 'type',
            render: (type) => (
                <Tag color={getTransactionTypeColor(type)}>
                    {getTransactionTypeText(type)}
                </Tag>
            ),
            width: 100,
            align: 'center'
        },
        {
            title: 'Số lượng',
            dataIndex: 'quantity',
            key: 'quantity',
            render: (quantity, record) => (
                <Text type={record.type === 'import' ? 'success' : record.type === 'export' ? 'danger' : 'default'}>
                    {record.type === 'import' ? '+' : record.type === 'export' ? '-' : ''}{quantity}
                </Text>
            ),
            width: 90,
            align: 'center'
        },
        {
            title: 'Số lô',
            dataIndex: 'batchNumber',
            key: 'batchNumber',
            render: (text) => text || '-',
            width: 110,
            align: 'center'
        },
        {
            title: 'Hạn sử dụng',
            dataIndex: 'expiryDate',
            key: 'expiryDate',
            render: (date) => date ? dayjs(date).format('DD/MM/YYYY') : '-',
            width: 110,
            align: 'center'
        },
        {
            title: 'Người thực hiện',
            dataIndex: 'performedBy',
            key: 'performedBy',
            render: (user) => user?.name || 'N/A',
            width: 130,
            ellipsis: true
        },
        {
            title: 'Thao tác',
            key: 'actions',
            fixed: 'right',
            width: 80,
            align: 'center',
            render: (_, record) => (
                <Button
                    type="text"
                    danger
                    size="small"
                    onClick={() => handleDeleteTransaction(record._id)}
                >
                    Xóa
                </Button>
            )
        }
    ];

    return (
        <div>
            <Card style={{ marginBottom: '24px' }}>
                <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} sm={12} lg={6}>
                        <Select
                            placeholder="Chọn sản phẩm"
                            value={filters.productId}
                            onChange={(value) => handleFilterChange('productId', value)}
                            style={{ width: '100%' }}
                            allowClear
                            showSearch
                            optionFilterProp="children"
                        >
                            {products.map(product => (
                                <Option key={product._id} value={product._id}>
                                    {product.name}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Select
                            placeholder="Loại giao dịch"
                            value={filters.type}
                            onChange={(value) => handleFilterChange('type', value)}
                            style={{ width: '100%' }}
                            allowClear
                        >
                            <Option value="import">Nhập kho</Option>
                            <Option value="export">Xuất kho</Option>
                            <Option value="adjust">Điều chỉnh</Option>
                            <Option value="transfer">Chuyển kho</Option>
                            <Option value="return">Trả hàng</Option>
                        </Select>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Space>
                            <Button icon={<ReloadOutlined />} onClick={loadData}>
                                Làm mới
                            </Button>
                        </Space>
                    </Col>
                </Row>
            </Card>

            <Card style={{ marginBottom: '24px' }}>
                <Space>
                    <Button
                        type="primary"
                        icon={<ImportOutlined />}
                        onClick={() => handleCreateTransaction('import')}
                        style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                    >
                        Nhập kho nhanh
                    </Button>
                    <Button
                        type="primary"
                        danger
                        icon={<ExportOutlined />}
                        onClick={() => handleCreateTransaction('export')}
                    >
                        Xuất kho nhanh
                    </Button>
                    <Button
                        icon={<PlusOutlined />}
                        onClick={() => handleCreateTransaction('adjust')}
                    >
                        Điều chỉnh kho
                    </Button>
                    {selectedRowKeys.length > 0 && (
                        <Button
                            danger
                            onClick={handleBulkDelete}
                            loading={loading}
                        >
                            Xóa đã chọn ({selectedRowKeys.length})
                        </Button>
                    )}
                </Space>
            </Card>

            <Card>
                <Table
                    columns={columns}
                    dataSource={transactions}
                    rowKey="_id"
                    loading={loading}
                    rowSelection={{
                        selectedRowKeys,
                        onChange: (selectedKeys) => setSelectedRowKeys(selectedKeys),
                        preserveSelectedRowKeys: true
                    }}
                    pagination={{
                        ...pagination,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} giao dịch`
                    }}
                    onChange={handleTableChange}
                />
            </Card>

            <Modal
                title={transactionModal.type === 'import' ? 'Nhập kho' : transactionModal.type === 'export' ? 'Xuất kho' : 'Điều chỉnh kho'}
                open={transactionModal.visible}
                onCancel={() => setTransactionModal({ visible: false, mode: 'create', type: 'import', data: null })}
                footer={null}
                width={800}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmitTransaction}
                    initialValues={{ type: transactionModal.type }}
                >
                    <Form.Item name="type" hidden>
                        <Input />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="productId"
                                label="Sản phẩm"
                                rules={[{ required: true, message: 'Vui lòng chọn sản phẩm' }]}
                            >
                                <Select
                                    placeholder="Chọn sản phẩm"
                                    showSearch
                                    optionFilterProp="children"
                                >
                                    {products.map(product => (
                                        <Option key={product._id} value={product._id}>
                                            {product.name}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="quantity"
                                label="Số lượng"
                                rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}
                            >
                                <InputNumber
                                    placeholder="Nhập số lượng"
                                    style={{ width: '100%' }}
                                    min={1}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="batchNumber"
                                label="Số lô (Batch Number)"
                                rules={[{ required: transactionModal.type === 'import', message: 'Vui lòng nhập số lô' }]}
                            >
                                <Input placeholder="Nhập số lô" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="expiryDate"
                                label="Hạn sử dụng"
                                rules={[{ required: transactionModal.type === 'import', message: 'Vui lòng chọn hạn sử dụng' }]}
                            >
                                <DatePicker
                                    placeholder="Chọn ngày hết hạn"
                                    style={{ width: '100%' }}
                                    format="DD/MM/YYYY"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="unitCost"
                                label="Đơn giá"
                            >
                                <InputNumber
                                    placeholder="Nhập đơn giá"
                                    style={{ width: '100%' }}
                                    min={0}
                                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="supplierId"
                                label="Nhà cung cấp"
                            >
                                <Select placeholder="Chọn nhà cung cấp" allowClear>
                                    {suppliers.map(supplier => (
                                        <Option key={supplier._id} value={supplier._id}>
                                            {supplier.name}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="note"
                        label="Ghi chú"
                    >
                        <Input.TextArea
                            placeholder="Nhập ghi chú"
                            rows={3}
                        />
                    </Form.Item>

                    <Form.Item>
                        <Space>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                            >
                                Lưu giao dịch
                            </Button>
                            <Button
                                onClick={() => setTransactionModal({ visible: false, mode: 'create', type: 'import', data: null })}
                            >
                                Hủy
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}

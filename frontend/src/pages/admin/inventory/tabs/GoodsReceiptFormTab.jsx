import React, { useState, useEffect } from 'react';
import {
    Card,
    Form,
    Input,
    Select,
    InputNumber,
    DatePicker,
    Button,
    Space,
    Table,
    Typography,
    Row,
    Col,
    Divider,
    message as antMessage,
    Modal,
    Upload,
    Alert
} from 'antd';
import {
    PlusOutlined,
    DeleteOutlined,
    SaveOutlined,
    CheckOutlined,
    DownloadOutlined,
    UploadOutlined,
    FileExcelOutlined
} from '@ant-design/icons';
import api from '../../../../api/client';
import Swal from 'sweetalert2';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';

const { Text, Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export default function GoodsReceiptFormTab() {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [suppliers, setSuppliers] = useState([]);
    const [products, setProducts] = useState([]);
    const [items, setItems] = useState([]);
    const [totalAmount, setTotalAmount] = useState(0);

    // Excel import states
    const [excelModalVisible, setExcelModalVisible] = useState(false);
    const [excelFile, setExcelFile] = useState(null);
    const [parsedData, setParsedData] = useState(null);
    const [parseErrors, setParseErrors] = useState([]);
    const [uploading, setUploading] = useState(false);

    // Load suppliers and products
    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        try {
            const [suppliersRes, productsRes] = await Promise.all([
                api.get('/suppliers'),
                api.get('/products?limit=1000&isActive=true')
            ]);

            setSuppliers(suppliersRes.data.items || []);
            setProducts(productsRes.data.items || []);
        } catch (error) {
            console.error('Load initial data error:', error);
            antMessage.error('Không thể tải dữ liệu');
        }
    };

    // Calculate total amount whenever items change
    useEffect(() => {
        const total = items.reduce((sum, item) => {
            return sum + (item.quantity * item.unitCost || 0);
        }, 0);
        setTotalAmount(total);
    }, [items]);

    // Add new product row
    const handleAddProduct = () => {
        const newItem = {
            key: Date.now(),
            productId: undefined,
            quantity: 1,
            unitCost: 0,
            expiryDate: null
        };
        setItems([...items, newItem]);
    };

    // Remove product row
    const handleRemoveProduct = (key) => {
        setItems(items.filter(item => item.key !== key));
    };

    // Update item field
    const handleItemChange = (key, field, value) => {
        setItems(items.map(item => {
            if (item.key === key) {
                const updated = { ...item, [field]: value };

                // Auto-fill unit cost from product's costPrice
                if (field === 'productId' && value) {
                    const product = products.find(p => p._id === value);
                    if (product && product.costPrice) {
                        updated.unitCost = product.costPrice;
                    }
                }

                return updated;
            }
            return item;
        }));
    };

    // Generate unique receipt code
    const generateReceiptCode = () => {
        const date = dayjs().format('YYYYMMDD');
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `GR${date}${random}`;
    };

    // Submit form
    const handleSubmit = async (isDraft = false) => {
        try {
            // Validate form
            const values = await form.validateFields();

            // Validate items
            if (items.length === 0) {
                antMessage.error('Vui lòng thêm ít nhất 1 sản phẩm');
                return;
            }

            // Check all items have required fields
            const invalidItems = items.filter(item =>
                !item.productId || !item.quantity || item.quantity <= 0 || item.unitCost === undefined || item.unitCost === null || item.unitCost < 0
            );

            if (invalidItems.length > 0) {
                antMessage.error('Vui lòng điền đầy đủ thông tin cho tất cả sản phẩm');
                return;
            }

            setLoading(true);

            // Prepare payload
            const payload = {
                code: values.code || generateReceiptCode(),
                supplierId: values.supplierId,
                batchNumber: values.batchNumber,
                items: items.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    unitCost: item.unitCost,
                    expiryDate: item.expiryDate ? item.expiryDate.format('YYYY-MM-DD') : undefined
                })),
                note: values.note,
                expectedDate: values.expectedDate ? values.expectedDate.format('YYYY-MM-DD') : undefined,
                status: isDraft ? 'draft' : 'pending'
            };

            // Create goods receipt
            const response = await api.post('/goods-receipts', payload);

            // If not draft, approve immediately
            if (!isDraft) {
                await api.patch(`/goods-receipts/${response.data.goodsReceipt._id}/approve`);
            }

            Swal.fire({
                title: 'Thành công!',
                text: isDraft ? 'Đã lưu phiếu nhập nháp' : 'Đã tạo và duyệt phiếu nhập thành công',
                icon: 'success',
                timer: 3000,
                showConfirmButton: false,
                toast: true,
                position: 'top-end'
            });

            // Reset form
            form.resetFields();
            setItems([]);
            setTotalAmount(0);

        } catch (error) {
            console.error('Submit error:', error);
            Swal.fire({
                title: 'Lỗi!',
                text: error.response?.data?.message || 'Không thể tạo phiếu nhập',
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

    // Download Excel template
    const handleDownloadTemplate = async () => {
        try {
            const response = await api.get('/goods-receipts/template', {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'Template_Nhap_Kho.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();

            antMessage.success('Đã tải template thành công');
        } catch (error) {
            console.error('Download template error:', error);
            antMessage.error('Không thể tải template');
        }
    };

    // Handle Excel file upload
    const handleExcelUpload = async (file) => {
        setExcelFile(file);
        setUploading(true);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await api.post('/goods-receipts/parse-excel', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.success) {
                setParsedData(response.data.data);
                setParseErrors([]);
                antMessage.success(`Đã đọc ${response.data.data.totalItems} sản phẩm từ Excel`);
            } else {
                setParseErrors(response.data.errors || []);
                setParsedData(null);
                antMessage.error('File Excel có lỗi, vui lòng kiểm tra lại');
            }
        } catch (error) {
            console.error('Parse Excel error:', error);
            antMessage.error(error.response?.data?.message || 'Không thể đọc file Excel');
            setParsedData(null);
            setParseErrors([]);
        } finally {
            setUploading(false);
        }

        return false; // Prevent auto upload
    };

    // Create goods receipt from Excel data
    const handleCreateFromExcel = async () => {
        if (!parsedData) return;

        try {
            setLoading(true);

            const response = await api.post('/goods-receipts/bulk-create', parsedData);

            if (response.data.success) {
                // Auto approve
                await api.patch(`/goods-receipts/${response.data.goodsReceipt._id}/approve`);

                Swal.fire({
                    title: 'Thành công!',
                    text: `Đã tạo và duyệt phiếu nhập với ${parsedData.totalItems} sản phẩm`,
                    icon: 'success',
                    timer: 3000,
                    showConfirmButton: false,
                    toast: true,
                    position: 'top-end'
                });

                // Close modal and reset
                setExcelModalVisible(false);
                setExcelFile(null);
                setParsedData(null);
                setParseErrors([]);
            }
        } catch (error) {
            console.error('Create from Excel error:', error);
            Swal.fire({
                title: 'Lỗi!',
                text: error.response?.data?.message || 'Không thể tạo phiếu nhập',
                icon: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    // Table columns for product items
    const columns = [
        {
            title: 'Sản phẩm',
            dataIndex: 'productId',
            key: 'productId',
            width: 250,
            render: (value, record) => (
                <Select
                    value={value}
                    onChange={(val) => handleItemChange(record.key, 'productId', val)}
                    placeholder="Chọn sản phẩm"
                    showSearch
                    optionFilterProp="children"
                    style={{ width: '100%' }}
                    optionLabelProp="label"
                >
                    {products.map(product => {
                        const fullName = `${product.name} (${product.sku})`;
                        const truncatedLabel = fullName.length > 35 ? `${fullName.substring(0, 35)}...` : fullName;

                        return (
                            <Option
                                key={product._id}
                                value={product._id}
                                label={truncatedLabel}
                            >
                                <div title={fullName}>
                                    {product.name} <Text type="secondary" style={{ fontSize: '12px' }}>({product.sku})</Text>
                                </div>
                            </Option>
                        );
                    })}
                </Select>
            )
        },
        {
            title: 'Số lượng',
            dataIndex: 'quantity',
            key: 'quantity',
            width: 120,
            render: (value, record) => (
                <InputNumber
                    value={value}
                    onChange={(val) => handleItemChange(record.key, 'quantity', val)}
                    min={1}
                    style={{ width: '100%' }}
                />
            )
        },
        {
            title: 'Đơn giá',
            dataIndex: 'unitCost',
            key: 'unitCost',
            width: 150,
            render: (value, record) => (
                <InputNumber
                    value={value}
                    onChange={(val) => handleItemChange(record.key, 'unitCost', val)}
                    min={0}
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                    style={{ width: '100%' }}
                />
            )
        },
        {
            title: 'Thành tiền',
            key: 'total',
            width: 150,
            render: (_, record) => (
                <Text strong>
                    {((record.quantity || 0) * (record.unitCost || 0)).toLocaleString('vi-VN')} ₫
                </Text>
            )
        },
        {
            title: 'Hạn sử dụng',
            dataIndex: 'expiryDate',
            key: 'expiryDate',
            width: 150,
            render: (value, record) => (
                <DatePicker
                    value={value}
                    onChange={(val) => handleItemChange(record.key, 'expiryDate', val)}
                    format="DD/MM/YYYY"
                    placeholder="Chọn HSD"
                    style={{ width: '100%' }}
                />
            )
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 80,
            align: 'center',
            render: (_, record) => (
                <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemoveProduct(record.key)}
                />
            )
        }
    ];

    return (
        <div>
            <Card style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div>
                        <Title level={4} style={{ marginTop: 0, marginBottom: '8px' }}>Tạo Phiếu Nhập Hàng</Title>
                        <Text type="secondary">
                            Nhập thông tin phiếu nhập và thêm các sản phẩm. Tất cả sản phẩm sẽ có cùng số lô.
                        </Text>
                    </div>
                    <Space>
                        <Button
                            icon={<DownloadOutlined />}
                            onClick={handleDownloadTemplate}
                        >
                            Tải template Excel
                        </Button>
                        <Button
                            type="primary"
                            icon={<FileExcelOutlined />}
                            onClick={() => setExcelModalVisible(true)}
                        >
                            Import từ Excel
                        </Button>
                    </Space>
                </div>

                <Divider />

                <Form
                    form={form}
                    layout="vertical"
                    initialValues={{
                        code: generateReceiptCode(),
                        expectedDate: dayjs()
                    }}
                >
                    <Row gutter={16}>
                        <Col xs={24} sm={12} lg={6}>
                            <Form.Item
                                name="code"
                                label="Mã phiếu nhập"
                                rules={[{ required: true, message: 'Vui lòng nhập mã phiếu' }]}
                            >
                                <Input placeholder="GR20241205001" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} lg={6}>
                            <Form.Item
                                name="supplierId"
                                label="Nhà cung cấp"
                                rules={[{ required: true, message: 'Vui lòng chọn nhà cung cấp' }]}
                            >
                                <Select
                                    placeholder="Chọn nhà cung cấp"
                                    showSearch
                                    optionFilterProp="children"
                                >
                                    {suppliers.map(supplier => (
                                        <Option key={supplier._id} value={supplier._id}>
                                            {supplier.name}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} lg={6}>
                            <Form.Item
                                name="batchNumber"
                                label="Số lô"
                                rules={[{ required: true, message: 'Vui lòng nhập số lô' }]}
                            >
                                <Input placeholder="LOT2024-001" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} lg={6}>
                            <Form.Item
                                name="expectedDate"
                                label="Ngày nhập dự kiến"
                            >
                                <DatePicker
                                    format="DD/MM/YYYY"
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="note"
                        label="Ghi chú"
                    >
                        <TextArea
                            rows={2}
                            placeholder="Nhập ghi chú (nếu có)"
                        />
                    </Form.Item>
                </Form>
            </Card>

            <Card style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <Title level={5} style={{ margin: 0 }}>Danh sách sản phẩm</Title>
                    <Button
                        type="dashed"
                        icon={<PlusOutlined />}
                        onClick={handleAddProduct}
                    >
                        Thêm sản phẩm
                    </Button>
                </div>

                <Table
                    columns={columns}
                    dataSource={items}
                    pagination={false}
                    scroll={{ x: 900 }}
                    locale={{
                        emptyText: 'Chưa có sản phẩm nào. Bấm "Thêm sản phẩm" để bắt đầu.'
                    }}
                />

                <Divider />

                <Row justify="end">
                    <Col>
                        <div style={{ textAlign: 'right' }}>
                            <Text type="secondary">Tổng cộng:</Text>
                            <Title level={3} style={{ margin: '8px 0', color: '#1890ff' }}>
                                {totalAmount.toLocaleString('vi-VN')} ₫
                            </Title>
                        </div>
                    </Col>
                </Row>
            </Card>

            <Card>
                <Space size="middle">
                    <Button
                        type="default"
                        icon={<SaveOutlined />}
                        onClick={() => handleSubmit(true)}
                        loading={loading}
                        size="large"
                    >
                        Lưu nháp
                    </Button>
                    <Button
                        type="primary"
                        icon={<CheckOutlined />}
                        onClick={() => handleSubmit(false)}
                        loading={loading}
                        size="large"
                    >
                        Lưu & Duyệt
                    </Button>
                </Space>
            </Card>

            {/* Excel Import Modal */}
            <Modal
                title="Import từ Excel"
                open={excelModalVisible}
                onCancel={() => {
                    setExcelModalVisible(false);
                    setExcelFile(null);
                    setParsedData(null);
                    setParseErrors([]);
                }}
                width={900}
                footer={[
                    <Button key="cancel" onClick={() => setExcelModalVisible(false)}>
                        Hủy
                    </Button>,
                    <Button
                        key="create"
                        type="primary"
                        onClick={handleCreateFromExcel}
                        disabled={!parsedData || parseErrors.length > 0}
                        loading={loading}
                    >
                        Tạo phiếu nhập
                    </Button>
                ]}
            >
                <Space direction="vertical" style={{ width: '100%' }} size="large">
                    <Alert
                        message="Hướng dẫn"
                        description={
                            <ol style={{ margin: 0, paddingLeft: '20px' }}>
                                <li>Tải template Excel bằng nút "Tải template Excel"</li>
                                <li>Điền thông tin phiếu nhập và danh sách sản phẩm vào file</li>
                                <li>Upload file đã điền vào đây để kiểm tra</li>
                                <li>Nếu không có lỗi, bấm "Tạo phiếu nhập"</li>
                            </ol>
                        }
                        type="info"
                        showIcon
                    />

                    <Upload.Dragger
                        accept=".xlsx,.xls"
                        beforeUpload={handleExcelUpload}
                        fileList={excelFile ? [excelFile] : []}
                        onRemove={() => {
                            setExcelFile(null);
                            setParsedData(null);
                            setParseErrors([]);
                        }}
                        maxCount={1}
                    >
                        <p className="ant-upload-drag-icon">
                            <UploadOutlined />
                        </p>
                        <p className="ant-upload-text">Click hoặc kéo file Excel vào đây</p>
                        <p className="ant-upload-hint">
                            Chỉ hỗ trợ file .xlsx hoặc .xls
                        </p>
                    </Upload.Dragger>

                    {uploading && <Alert message="Đang đọc file..." type="info" />}

                    {parseErrors.length > 0 && (
                        <Alert
                            message="File có lỗi"
                            description={
                                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                                    {parseErrors.map((err, idx) => (
                                        <li key={idx}>
                                            <strong>Dòng {err.row}:</strong> {err.field} - {err.message}
                                        </li>
                                    ))}
                                </ul>
                            }
                            type="error"
                            showIcon
                        />
                    )}

                    {parsedData && parseErrors.length === 0 && (
                        <>
                            <Alert
                                message={`Đã đọc thành công ${parsedData.totalItems} sản phẩm`}
                                type="success"
                                showIcon
                            />

                            <div>
                                <Title level={5}>Thông tin phiếu nhập</Title>
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Text><strong>Nhà cung cấp ID:</strong> {parsedData.receiptInfo.supplierId}</Text>
                                    </Col>
                                    <Col span={12}>
                                        <Text><strong>Số lô:</strong> {parsedData.receiptInfo.batchNumber}</Text>
                                    </Col>
                                </Row>
                            </div>

                            <div>
                                <Title level={5}>Danh sách sản phẩm</Title>
                                <Table
                                    dataSource={parsedData.products}
                                    rowKey={(record, index) => index}
                                    pagination={false}
                                    scroll={{ y: 300 }}
                                    size="small"
                                    columns={[
                                        {
                                            title: 'SKU',
                                            dataIndex: 'sku',
                                            width: 120
                                        },
                                        {
                                            title: 'Tên sản phẩm',
                                            dataIndex: 'productName',
                                            ellipsis: true
                                        },
                                        {
                                            title: 'SL',
                                            dataIndex: 'quantity',
                                            width: 60,
                                            align: 'center'
                                        },
                                        {
                                            title: 'Đơn giá',
                                            dataIndex: 'unitCost',
                                            width: 100,
                                            align: 'right',
                                            render: (val) => `${val?.toLocaleString('vi-VN')} ₫`
                                        },
                                        {
                                            title: 'HSD',
                                            dataIndex: 'expiryDate',
                                            width: 100,
                                            render: (val) => val || '-'
                                        }
                                    ]}
                                />
                            </div>
                        </>
                    )}
                </Space>
            </Modal>
        </div>
    );
}

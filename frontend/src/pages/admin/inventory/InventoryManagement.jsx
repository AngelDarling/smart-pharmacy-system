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
  message,
  Row,
  Col,
  Statistic,
  Typography,
  Divider,
  Tooltip,
  Popconfirm,
  Drawer,
  Tabs,
  Alert,
  Badge
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  ImportOutlined,
  ExportOutlined,
  SettingOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  ShoppingOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import api from '../../../api/client.js';
import Swal from 'sweetalert2';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

export default function InventoryManagement() {
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [stats, setStats] = useState(null);
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
    data: null
  });
  const [form] = Form.useForm();

  // Load data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Load transactions
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        ...filters
      };
      
      if (filters.startDate) params.startDate = filters.startDate.format('YYYY-MM-DD');
      if (filters.endDate) params.endDate = filters.endDate.format('YYYY-MM-DD');
      
      const [transactionsRes, productsRes, suppliersRes, statsRes] = await Promise.all([
        api.get('/inventory/transactions', { params }),
        api.get('/products?limit=1000'),
        api.get('/suppliers'),
        api.get('/inventory/stats')
      ]);

      setTransactions(transactionsRes.data.transactions || []);
      setProducts(productsRes.data.items || []);
      setSuppliers(suppliersRes.data || []);
      setStats(statsRes.data);
      
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

  // Handle table change
  const handleTableChange = (paginationInfo) => {
    setPagination(prev => ({
      ...prev,
      current: paginationInfo.current,
      pageSize: paginationInfo.pageSize
    }));
  };

  // Handle filter change
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

  // Handle search
  const handleSearch = () => {
    setPagination(prev => ({
      ...prev,
      current: 1
    }));
  };

  // Handle reset filters
  const handleResetFilters = () => {
    setFilters({
      productId: '',
      type: '',
      supplierId: '',
      startDate: null,
      endDate: null
    });
    setPagination(prev => ({
      ...prev,
      current: 1
    }));
  };

  // Handle create transaction
  const handleCreateTransaction = () => {
    setTransactionModal({
      visible: true,
      mode: 'create',
      data: null
    });
    form.resetFields();
  };

  // Handle edit transaction
  const handleEditTransaction = (record) => {
    setTransactionModal({
      visible: true,
      mode: 'edit',
      data: record
    });
    form.setFieldsValue({
      ...record,
      expiryDate: record.expiryDate ? new Date(record.expiryDate) : null
    });
  };

  // Handle submit transaction
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
      
      setTransactionModal({ visible: false, mode: 'create', data: null });
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

  // Get transaction type color
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

  // Get transaction type text
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

  // Columns
  const columns = [
    {
      title: 'Thời gian',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleString('vi-VN'),
      sorter: true,
      width: 150
    },
    {
      title: 'Sản phẩm',
      dataIndex: 'productId',
      key: 'productId',
      render: (product) => product?.name || 'N/A',
      width: 200
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
      filters: [
        { text: 'Nhập kho', value: 'import' },
        { text: 'Xuất kho', value: 'export' },
        { text: 'Điều chỉnh', value: 'adjust' },
        { text: 'Chuyển kho', value: 'transfer' },
        { text: 'Trả hàng', value: 'return' }
      ],
      width: 120
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
      sorter: true,
      width: 100
    },
    {
      title: 'Đơn giá',
      dataIndex: 'unitCost',
      key: 'unitCost',
      render: (cost) => cost ? `${cost.toLocaleString('vi-VN')} ₫` : '-',
      sorter: true,
      width: 120
    },
    {
      title: 'Thành tiền',
      dataIndex: 'totalCost',
      key: 'totalCost',
      render: (cost) => cost ? `${cost.toLocaleString('vi-VN')} ₫` : '-',
      sorter: true,
      width: 120
    },
    {
      title: 'Nhà cung cấp',
      dataIndex: 'supplierId',
      key: 'supplierId',
      render: (supplier) => supplier?.name || '-',
      width: 150
    },
    {
      title: 'Người thực hiện',
      dataIndex: 'performedBy',
      key: 'performedBy',
      render: (user) => user?.name || 'N/A',
      width: 150
    },
    {
      title: 'Ghi chú',
      dataIndex: 'note',
      key: 'note',
      render: (note) => note || '-',
      ellipsis: true,
      width: 200
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ margin: 0 }}>
          <ShoppingOutlined style={{ marginRight: '8px' }} />
          Quản lý tồn kho
        </Title>
        <Text type="secondary">
          Quản lý nhập/xuất/điều chỉnh kho hàng
        </Text>
      </div>

      {/* Stats Cards */}
      {stats && (
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Tổng sản phẩm"
                value={stats.totalProducts}
                prefix={<ShoppingOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Sắp hết hàng"
                value={stats.lowStockProducts}
                prefix={<WarningOutlined />}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Hết hàng"
                value={stats.outOfStockProducts}
                prefix={<WarningOutlined />}
                valueStyle={{ color: '#f5222d' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Tổng giao dịch"
                value={stats.transactionStats?.reduce((sum, item) => sum + item.count, 0) || 0}
                prefix={<BarChartOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Filters */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} lg={6}>
            <Select
              placeholder="Chọn sản phẩm"
              value={filters.productId}
              onChange={(value) => handleFilterChange('productId', value)}
              style={{ width: '100%' }}
              allowClear
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
            <Select
              placeholder="Nhà cung cấp"
              value={filters.supplierId}
              onChange={(value) => handleFilterChange('supplierId', value)}
              style={{ width: '100%' }}
              allowClear
            >
              {suppliers.map(supplier => (
                <Option key={supplier._id} value={supplier._id}>
                  {supplier.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Space>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={handleSearch}
              >
                Tìm kiếm
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={handleResetFilters}
              >
                Reset
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Actions */}
      <Card style={{ marginBottom: '24px' }}>
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreateTransaction}
          >
            Tạo giao dịch
          </Button>
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
          dataSource={transactions}
          rowKey="_id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} giao dịch`
          }}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Transaction Modal */}
      <Modal
        title={transactionModal.mode === 'create' ? 'Tạo giao dịch mới' : 'Chỉnh sửa giao dịch'}
        open={transactionModal.visible}
        onCancel={() => setTransactionModal({ visible: false, mode: 'create', data: null })}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmitTransaction}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="productId"
                label="Sản phẩm"
                rules={[{ required: true, message: 'Vui lòng chọn sản phẩm' }]}
              >
                <Select placeholder="Chọn sản phẩm">
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
                name="type"
                label="Loại giao dịch"
                rules={[{ required: true, message: 'Vui lòng chọn loại giao dịch' }]}
              >
                <Select placeholder="Chọn loại giao dịch">
                  <Option value="import">Nhập kho</Option>
                  <Option value="export">Xuất kho</Option>
                  <Option value="adjust">Điều chỉnh</Option>
                  <Option value="transfer">Chuyển kho</Option>
                  <Option value="return">Trả hàng</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
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
          </Row>

          <Row gutter={16}>
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
            <Col span={12}>
              <Form.Item
                name="expiryDate"
                label="Hạn sử dụng"
              >
                <DatePicker
                  placeholder="Chọn ngày hết hạn"
                  style={{ width: '100%' }}
                />
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
                {transactionModal.mode === 'create' ? 'Tạo giao dịch' : 'Cập nhật'}
              </Button>
              <Button
                onClick={() => setTransactionModal({ visible: false, mode: 'create', data: null })}
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

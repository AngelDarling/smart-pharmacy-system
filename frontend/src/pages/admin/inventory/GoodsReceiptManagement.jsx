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
  Statistic,
  Typography,
  Divider,
  Tooltip,
  Popconfirm,
  Drawer,
  Tabs,
  Alert,
  Badge,
  Steps
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  CheckOutlined,
  CloseOutlined,
  EyeOutlined,
  FileTextOutlined,
  TruckOutlined,
  DollarOutlined,
  ShoppingOutlined,
  BarChartOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import api from '../../../api/client.js';
import Swal from 'sweetalert2';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { Step } = Steps;

export default function GoodsReceiptManagement() {
  const [loading, setLoading] = useState(false);
  const [goodsReceipts, setGoodsReceipts] = useState([]);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0
  });
  const [filters, setFilters] = useState({
    supplierId: '',
    status: '',
    startDate: null,
    endDate: null
  });
  const [receiptModal, setReceiptModal] = useState({
    visible: false,
    mode: 'create',
    data: null
  });
  const [detailModal, setDetailModal] = useState({
    visible: false,
    data: null
  });
  const [form] = Form.useForm();

  // Load data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Load goods receipts
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        ...filters
      };
      
      if (filters.startDate) params.startDate = filters.startDate.format('YYYY-MM-DD');
      if (filters.endDate) params.endDate = filters.endDate.format('YYYY-MM-DD');
      
      const [receiptsRes, productsRes, suppliersRes, statsRes] = await Promise.all([
        api.get('/goods-receipts', { params }),
        api.get('/products?limit=1000'),
        api.get('/suppliers'),
        api.get('/goods-receipts/stats')
      ]);

      setGoodsReceipts(receiptsRes.data.goodsReceipts || []);
      setProducts(productsRes.data.items || []);
      setSuppliers(suppliersRes.data || []);
      setStats(statsRes.data);
      
      setPagination(prev => ({
        ...prev,
        total: receiptsRes.data.pagination?.total || 0
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
      supplierId: '',
      status: '',
      startDate: null,
      endDate: null
    });
    setPagination(prev => ({
      ...prev,
      current: 1
    }));
  };

  // Handle create receipt
  const handleCreateReceipt = () => {
    setReceiptModal({
      visible: true,
      mode: 'create',
      data: null
    });
    form.resetFields();
    form.setFieldsValue({
      items: [{ productId: '', quantity: 1, unitCost: 0 }]
    });
  };

  // Handle view detail
  const handleViewDetail = async (record) => {
    try {
      const response = await api.get(`/goods-receipts/${record._id}`);
      setDetailModal({
        visible: true,
        data: response.data
      });
    } catch (error) {
      console.error('Load detail error:', error);
      Swal.fire({
        title: 'Lỗi!',
        text: 'Không thể tải chi tiết phiếu nhập',
        icon: 'error',
        timer: 3000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });
    }
  };

  // Handle approve receipt
  const handleApproveReceipt = async (record) => {
    try {
      await api.patch(`/goods-receipts/${record._id}/approve`);
      
      Swal.fire({
        title: 'Thành công!',
        text: 'Duyệt phiếu nhập thành công!',
        icon: 'success',
        timer: 3000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });
      
      loadData();
      
    } catch (error) {
      console.error('Approve receipt error:', error);
      Swal.fire({
        title: 'Lỗi!',
        text: error.response?.data?.message || 'Không thể duyệt phiếu nhập',
        icon: 'error',
        timer: 4000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });
    }
  };

  // Handle cancel receipt
  const handleCancelReceipt = async (record) => {
    try {
      await api.patch(`/goods-receipts/${record._id}/cancel`);
      
      Swal.fire({
        title: 'Thành công!',
        text: 'Hủy phiếu nhập thành công!',
        icon: 'success',
        timer: 3000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });
      
      loadData();
      
    } catch (error) {
      console.error('Cancel receipt error:', error);
      Swal.fire({
        title: 'Lỗi!',
        text: error.response?.data?.message || 'Không thể hủy phiếu nhập',
        icon: 'error',
        timer: 4000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });
    }
  };

  // Handle submit receipt
  const handleSubmitReceipt = async (values) => {
    try {
      setLoading(true);
      
      const data = {
        ...values,
        expectedDate: values.expectedDate ? values.expectedDate.format('YYYY-MM-DD') : undefined,
        items: values.items.map(item => ({
          ...item,
          expiryDate: item.expiryDate ? item.expiryDate.format('YYYY-MM-DD') : undefined
        }))
      };

      await api.post('/goods-receipts', data);
      
      Swal.fire({
        title: 'Thành công!',
        text: 'Tạo phiếu nhập thành công!',
        icon: 'success',
        timer: 3000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });
      
      setReceiptModal({ visible: false, mode: 'create', data: null });
      form.resetFields();
      loadData();
      
    } catch (error) {
      console.error('Submit receipt error:', error);
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

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      draft: 'default',
      pending: 'processing',
      partial: 'warning',
      completed: 'success',
      cancelled: 'error'
    };
    return colors[status] || 'default';
  };

  // Get status text
  const getStatusText = (status) => {
    const texts = {
      draft: 'Nháp',
      pending: 'Chờ duyệt',
      partial: 'Một phần',
      completed: 'Hoàn thành',
      cancelled: 'Đã hủy'
    };
    return texts[status] || status;
  };

  // Columns
  const columns = [
    {
      title: 'Mã phiếu',
      dataIndex: 'code',
      key: 'code',
      render: (code) => <Text strong>{code}</Text>,
      width: 120
    },
    {
      title: 'Nhà cung cấp',
      dataIndex: 'supplierId',
      key: 'supplierId',
      render: (supplier) => supplier?.name || 'N/A',
      width: 200
    },
    {
      title: 'Số sản phẩm',
      dataIndex: 'itemCount',
      key: 'itemCount',
      render: (count) => <Badge count={count} showZero color="#1890ff" />,
      width: 120
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'finalAmount',
      key: 'finalAmount',
      render: (amount) => `${amount.toLocaleString('vi-VN')} ₫`,
      sorter: true,
      width: 150
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
      filters: [
        { text: 'Nháp', value: 'draft' },
        { text: 'Chờ duyệt', value: 'pending' },
        { text: 'Một phần', value: 'partial' },
        { text: 'Hoàn thành', value: 'completed' },
        { text: 'Đã hủy', value: 'cancelled' }
      ],
      width: 120
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString('vi-VN'),
      sorter: true,
      width: 120
    },
    {
      title: 'Người tạo',
      dataIndex: 'createdBy',
      key: 'createdBy',
      render: (user) => user?.name || 'N/A',
      width: 150
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          {record.status === 'pending' && (
            <Tooltip title="Duyệt">
              <Button
                type="text"
                icon={<CheckOutlined />}
                onClick={() => handleApproveReceipt(record)}
                style={{ color: '#52c41a' }}
              />
            </Tooltip>
          )}
          {(record.status === 'draft' || record.status === 'pending') && (
            <Tooltip title="Hủy">
              <Popconfirm
                title="Bạn có chắc muốn hủy phiếu nhập này?"
                onConfirm={() => handleCancelReceipt(record)}
                okText="Có"
                cancelText="Không"
              >
                <Button
                  type="text"
                  icon={<CloseOutlined />}
                  style={{ color: '#f5222d' }}
                />
              </Popconfirm>
            </Tooltip>
          )}
        </Space>
      ),
      width: 120
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ margin: 0 }}>
          <FileTextOutlined style={{ marginRight: '8px' }} />
          Quản lý phiếu nhập
        </Title>
        <Text type="secondary">
          Quản lý phiếu nhập hàng từ nhà cung cấp
        </Text>
      </div>

      {/* Stats Cards */}
      {stats && (
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Tổng phiếu nhập"
                value={stats.statusStats?.reduce((sum, item) => sum + item.count, 0) || 0}
                prefix={<FileTextOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Chờ duyệt"
                value={stats.statusStats?.find(s => s._id === 'pending')?.count || 0}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Hoàn thành"
                value={stats.statusStats?.find(s => s._id === 'completed')?.count || 0}
                prefix={<CheckOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Tổng giá trị"
                value={stats.statusStats?.reduce((sum, item) => sum + item.totalAmount, 0) || 0}
                prefix={<DollarOutlined />}
                formatter={(value) => `${value.toLocaleString('vi-VN')} ₫`}
                valueStyle={{ color: '#722ed1' }}
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
              placeholder="Chọn nhà cung cấp"
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
            <Select
              placeholder="Trạng thái"
              value={filters.status}
              onChange={(value) => handleFilterChange('status', value)}
              style={{ width: '100%' }}
              allowClear
            >
              <Option value="draft">Nháp</Option>
              <Option value="pending">Chờ duyệt</Option>
              <Option value="partial">Một phần</Option>
              <Option value="completed">Hoàn thành</Option>
              <Option value="cancelled">Đã hủy</Option>
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
            onClick={handleCreateReceipt}
          >
            Tạo phiếu nhập
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
          dataSource={goodsReceipts}
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
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title="Chi tiết phiếu nhập"
        open={detailModal.visible}
        onCancel={() => setDetailModal({ visible: false, data: null })}
        footer={null}
        width={1000}
      >
        {detailModal.data && (
          <div>
            <Row gutter={16} style={{ marginBottom: '16px' }}>
              <Col span={12}>
                <Text strong>Mã phiếu: </Text>
                <Text>{detailModal.data.code}</Text>
              </Col>
              <Col span={12}>
                <Text strong>Nhà cung cấp: </Text>
                <Text>{detailModal.data.supplierId?.name}</Text>
              </Col>
            </Row>
            <Row gutter={16} style={{ marginBottom: '16px' }}>
              <Col span={12}>
                <Text strong>Trạng thái: </Text>
                <Tag color={getStatusColor(detailModal.data.status)}>
                  {getStatusText(detailModal.data.status)}
                </Tag>
              </Col>
              <Col span={12}>
                <Text strong>Tổng tiền: </Text>
                <Text>{detailModal.data.finalAmount.toLocaleString('vi-VN')} ₫</Text>
              </Col>
            </Row>
            
            <Divider />
            
            <Title level={4}>Danh sách sản phẩm</Title>
            <Table
              columns={[
                {
                  title: 'Sản phẩm',
                  dataIndex: 'productId',
                  key: 'productId',
                  render: (product) => product?.name || 'N/A'
                },
                {
                  title: 'Số lượng',
                  dataIndex: 'quantity',
                  key: 'quantity'
                },
                {
                  title: 'Đơn giá',
                  dataIndex: 'unitCost',
                  key: 'unitCost',
                  render: (cost) => `${cost.toLocaleString('vi-VN')} ₫`
                },
                {
                  title: 'Thành tiền',
                  dataIndex: 'totalCost',
                  key: 'totalCost',
                  render: (cost) => `${cost.toLocaleString('vi-VN')} ₫`
                },
                {
                  title: 'Lô',
                  dataIndex: 'batchNumber',
                  key: 'batchNumber',
                  render: (batch) => batch || '-'
                },
                {
                  title: 'Hạn sử dụng',
                  dataIndex: 'expiryDate',
                  key: 'expiryDate',
                  render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : '-'
                }
              ]}
              dataSource={detailModal.data.items}
              rowKey={(item, index) => index}
              pagination={false}
              size="small"
            />
          </div>
        )}
      </Modal>

      {/* Create/Edit Receipt Modal */}
      <Modal
        title={receiptModal.mode === 'create' ? 'Tạo phiếu nhập mới' : 'Chỉnh sửa phiếu nhập'}
        open={receiptModal.visible}
        onCancel={() => setReceiptModal({ visible: false, mode: 'create', data: null })}
        footer={null}
        width={1000}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmitReceipt}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="code"
                label="Mã phiếu"
                rules={[{ required: true, message: 'Vui lòng nhập mã phiếu' }]}
              >
                <Input placeholder="Nhập mã phiếu" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="supplierId"
                label="Nhà cung cấp"
                rules={[{ required: true, message: 'Vui lòng chọn nhà cung cấp' }]}
              >
                <Select placeholder="Chọn nhà cung cấp">
                  {suppliers.map(supplier => (
                    <Option key={supplier._id} value={supplier._id}>
                      {supplier.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="expectedDate"
                label="Ngày dự kiến nhận"
              >
                <DatePicker
                  placeholder="Chọn ngày dự kiến"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="note"
                label="Ghi chú"
              >
                <Input.TextArea
                  placeholder="Nhập ghi chú"
                  rows={2}
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider>Danh sách sản phẩm</Divider>

          <Form.List name="items">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Card key={key} size="small" style={{ marginBottom: '8px' }}>
                    <Row gutter={16}>
                      <Col span={8}>
                        <Form.Item
                          {...restField}
                          name={[name, 'productId']}
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
                      <Col span={4}>
                        <Form.Item
                          {...restField}
                          name={[name, 'quantity']}
                          label="Số lượng"
                          rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}
                        >
                          <InputNumber
                            placeholder="SL"
                            style={{ width: '100%' }}
                            min={1}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={4}>
                        <Form.Item
                          {...restField}
                          name={[name, 'unitCost']}
                          label="Đơn giá"
                          rules={[{ required: true, message: 'Vui lòng nhập đơn giá' }]}
                        >
                          <InputNumber
                            placeholder="Giá"
                            style={{ width: '100%' }}
                            min={0}
                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={value => value.replace(/\$\s?|(,*)/g, '')}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={4}>
                        <Form.Item
                          {...restField}
                          name={[name, 'batchNumber']}
                          label="Lô"
                        >
                          <Input placeholder="Lô" />
                        </Form.Item>
                      </Col>
                      <Col span={3}>
                        <Form.Item
                          {...restField}
                          name={[name, 'expiryDate']}
                          label="Hạn SD"
                        >
                          <DatePicker
                            placeholder="Hạn SD"
                            style={{ width: '100%' }}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={1}>
                        <Form.Item label=" ">
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => remove(name)}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    Thêm sản phẩm
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
              >
                {receiptModal.mode === 'create' ? 'Tạo phiếu nhập' : 'Cập nhật'}
              </Button>
              <Button
                onClick={() => setReceiptModal({ visible: false, mode: 'create', data: null })}
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

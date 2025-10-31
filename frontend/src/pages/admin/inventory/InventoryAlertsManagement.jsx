import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Table,
  Button,
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
  Alert,
  Badge,
  Select,
  Input,
  Form
} from 'antd';
import {
  WarningOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
  SearchOutlined,
  EyeOutlined,
  CheckOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  ClockCircleOutlined,
  ShoppingOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import api from '../../../api/client.js';
import Swal from 'sweetalert2';

const { Title, Text } = Typography;
const { Option } = Select;

export default function InventoryAlertsManagement() {
  const [loading, setLoading] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0
  });
  const [filters, setFilters] = useState({
    type: '',
    severity: '',
    isRead: '',
    isResolved: ''
  });
  const [detailModal, setDetailModal] = useState({
    visible: false,
    data: null
  });
  const [resolveModal, setResolveModal] = useState({
    visible: false,
    data: null
  });
  const [form] = Form.useForm();

  // Load data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Build params, excluding empty string values
      const params = {
        page: pagination.current,
        limit: pagination.pageSize
      };
      
      // Only add non-empty filter values
      if (filters.type) params.type = filters.type;
      if (filters.severity) params.severity = filters.severity;
      if (filters.isRead) params.isRead = filters.isRead;
      if (filters.isResolved) params.isResolved = filters.isResolved;
      
      const [alertsRes, statsRes] = await Promise.all([
        api.get('/inventory-alerts', { params }),
        api.get('/inventory-alerts/stats')
      ]);

      setAlerts(alertsRes.data.alerts || []);
      setStats(statsRes.data);
      
      setPagination(prev => ({
        ...prev,
        total: alertsRes.data.pagination?.total || 0
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
      type: '',
      severity: '',
      isRead: '',
      isResolved: ''
    });
    setPagination(prev => ({
      ...prev,
      current: 1
    }));
  };

  // Handle mark as read
  const handleMarkAsRead = async (record) => {
    try {
      await api.patch(`/inventory-alerts/${record._id}/read`);
      
      Swal.fire({
        title: 'Thành công!',
        text: 'Đánh dấu cảnh báo đã đọc thành công!',
        icon: 'success',
        timer: 3000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });
      
      loadData();
      
    } catch (error) {
      console.error('Mark as read error:', error);
      Swal.fire({
        title: 'Lỗi!',
        text: error.response?.data?.message || 'Không thể đánh dấu cảnh báo',
        icon: 'error',
        timer: 4000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });
    }
  };

  // Handle resolve alert
  const handleResolveAlert = async (values) => {
    try {
      await api.patch(`/inventory-alerts/${resolveModal.data._id}/resolve`, values);
      
      Swal.fire({
        title: 'Thành công!',
        text: 'Giải quyết cảnh báo thành công!',
        icon: 'success',
        timer: 3000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });
      
      setResolveModal({ visible: false, data: null });
      form.resetFields();
      loadData();
      
    } catch (error) {
      console.error('Resolve alert error:', error);
      Swal.fire({
        title: 'Lỗi!',
        text: error.response?.data?.message || 'Không thể giải quyết cảnh báo',
        icon: 'error',
        timer: 4000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });
    }
  };

  // Handle check alerts
  const handleCheckAlerts = async () => {
    try {
      setLoading(true);
      const response = await api.post('/inventory-alerts/check');
      
      Swal.fire({
        title: 'Thành công!',
        text: `Đã tạo ${response.data.alertsCreated} cảnh báo mới, giải quyết ${response.data.alertsResolved || 0} cảnh báo đã hết hiệu lực`,
        icon: 'success',
        timer: 4000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });
      
      // Reset pagination về trang 1 và reload data để hiển thị cảnh báo mới nhất
      setPagination(prev => ({
        ...prev,
        current: 1
      }));
      
      // Fetch lại data với page = 1, exclude empty filters
      const params = {
        page: 1,
        limit: pagination.pageSize
      };
      
      if (filters.type) params.type = filters.type;
      if (filters.severity) params.severity = filters.severity;
      if (filters.isRead) params.isRead = filters.isRead;
      if (filters.isResolved) params.isResolved = filters.isResolved;
      
      const [alertsRes, statsRes] = await Promise.all([
        api.get('/inventory-alerts', { params }),
        api.get('/inventory-alerts/stats')
      ]);

      setAlerts(alertsRes.data.alerts || []);
      setStats(statsRes.data);
      setPagination(prev => ({
        ...prev,
        total: alertsRes.data.pagination?.total || 0
      }));
      
    } catch (error) {
      console.error('Check alerts error:', error);
      Swal.fire({
        title: 'Lỗi!',
        text: error.response?.data?.message || 'Không thể kiểm tra cảnh báo',
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

  // Get alert type color
  const getAlertTypeColor = (type) => {
    const colors = {
      low_stock: 'orange',
      out_of_stock: 'red',
      expiring_soon: 'yellow',
      expired: 'red',
      overstock: 'blue',
      slow_moving: 'purple'
    };
    return colors[type] || 'default';
  };

  // Get alert type text
  const getAlertTypeText = (type) => {
    const texts = {
      low_stock: 'Sắp hết hàng',
      out_of_stock: 'Hết hàng',
      expiring_soon: 'Sắp hết hạn',
      expired: 'Hết hạn',
      overstock: 'Tồn kho cao',
      slow_moving: 'Bán chậm'
    };
    return texts[type] || type;
  };

  // Get severity color
  const getSeverityColor = (severity) => {
    const colors = {
      low: 'green',
      medium: 'orange',
      high: 'red',
      critical: 'red'
    };
    return colors[severity] || 'default';
  };

  // Get severity text
  const getSeverityText = (severity) => {
    const texts = {
      low: 'Thấp',
      medium: 'TB',
      high: 'Cao',
      critical: 'Nguy hiểm'
    };
    return texts[severity] || severity;
  };

  // Get suggested action text
  const getSuggestedActionText = (action) => {
    const texts = {
      reorder: 'Đặt hàng lại',
      discount: 'Giảm giá',
      return_to_supplier: 'Trả nhà cung cấp',
      dispose: 'Tiêu hủy',
      transfer: 'Chuyển kho',
      none: 'Không có'
    };
    return texts[action] || action;
  };

  // Columns
  const columns = [
    {
      title: 'Loại cảnh báo',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color={getAlertTypeColor(type)}>
          {getAlertTypeText(type)}
        </Tag>
      ),
      width: 120,
      fixed: 'left'
    },
    {
      title: 'Mức độ',
      dataIndex: 'severity',
      key: 'severity',
      render: (severity) => (
        <Tag color={getSeverityColor(severity)}>
          {getSeverityText(severity)}
        </Tag>
      ),
      width: 100
    },
    {
      title: 'Sản phẩm',
      dataIndex: 'productId',
      key: 'productId',
      render: (product) => (
        <Tooltip title={product?.name}>
          <Text ellipsis>{product?.name || 'N/A'}</Text>
        </Tooltip>
      ),
      ellipsis: true,
      width: 150
    },
    {
      title: 'Tồn kho',
      dataIndex: 'currentStock',
      key: 'currentStock',
      render: (stock) => (
        <Text strong type={stock === 0 ? 'danger' : stock <= 10 ? 'warning' : 'default'}>
          {stock}
        </Text>
      ),
      align: 'center',
      width: 80
    },
    {
      title: 'Ngưỡng',
      dataIndex: 'thresholdValue',
      key: 'thresholdValue',
      render: (threshold) => threshold || '-',
      align: 'center',
      width: 70
    },
    {
      title: 'SL đề xuất',
      dataIndex: 'suggestedReorderQty',
      key: 'suggestedReorderQty',
      render: (qty, record) => {
        if ((record.type === 'low_stock' || record.type === 'out_of_stock') && qty > 0) {
          return <Text strong style={{ color: '#1890ff' }}>{qty}</Text>;
        }
        return '-';
      },
      align: 'center',
      width: 90
    },
    {
      title: 'Nội dung',
      dataIndex: 'message',
      key: 'message',
      render: (message) => (
        <Tooltip title={message}>
          <Text ellipsis style={{ maxWidth: 250 }}>{message}</Text>
        </Tooltip>
      ),
      ellipsis: true,
      width: 250
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text type={record.isResolved ? 'success' : 'danger'} style={{ fontSize: '12px' }}>
            {record.isResolved ? '✓ Đã giải quyết' : '✗ Chưa giải quyết'}
          </Text>
        </Space>
      ),
      width: 110
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      width: 100
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Chi tiết">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => setDetailModal({ visible: true, data: record })}
            />
          </Tooltip>
          {!record.isRead && (
            <Tooltip title="Đánh dấu đã đọc">
              <Button
                type="text"
                size="small"
                icon={<CheckOutlined />}
                onClick={() => handleMarkAsRead(record)}
                style={{ color: '#52c41a' }}
              />
            </Tooltip>
          )}
          {!record.isResolved && (
            <Tooltip title="Giải quyết">
              <Button
                type="text"
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={() => setResolveModal({ visible: true, data: record })}
                style={{ color: '#1890ff' }}
              />
            </Tooltip>
          )}
          {(record.type === 'low_stock' || record.type === 'out_of_stock') && record.suggestedReorderQty > 0 && (
            <Tooltip title="Tạo phiếu nhập">
              <Button
                type="text"
                size="small"
                icon={<ShoppingOutlined />}
                onClick={() => {
                  const productId = record.productId?._id;
                  const productName = record.productId?.name;
                  const qty = record.suggestedReorderQty;
                  window.location.href = `/admin/goods-receipts?prefill=true&productId=${productId}&productName=${encodeURIComponent(productName)}&quantity=${qty}`;
                }}
                style={{ color: '#52c41a' }}
              />
            </Tooltip>
          )}
        </Space>
      ),
      fixed: 'right',
      width: 130
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ margin: 0 }}>
          <WarningOutlined style={{ marginRight: '8px' }} />
          Quản lý cảnh báo tồn kho
        </Title>
        <Text type="secondary">
          Quản lý các cảnh báo về tồn kho và hạn sử dụng
        </Text>
      </div>

      {/* Stats Cards */}
      {stats && (
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Tổng cảnh báo"
                value={stats.summary?.total || 0}
                prefix={<WarningOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Chưa đọc"
                value={stats.summary?.unread || 0}
                prefix={<ExclamationCircleOutlined />}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Chưa giải quyết"
                value={stats.summary?.unresolved || 0}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#f5222d' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Nguy hiểm"
                value={stats.severityStats?.find(s => s._id === 'critical')?.count || 0}
                prefix={<CloseCircleOutlined />}
                valueStyle={{ color: '#f5222d' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Filters */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]} align="bottom">
          <Col xs={24} sm={12} lg={6}>
            <div>
              <Text strong style={{ display: 'block', marginBottom: '8px' }}>
                Loại cảnh báo
              </Text>
              <Select
                placeholder="Chọn loại cảnh báo"
                value={filters.type || undefined}
                onChange={(value) => handleFilterChange('type', value)}
                style={{ width: '100%' }}
                allowClear
              >
                <Option value="low_stock">Sắp hết hàng</Option>
                <Option value="out_of_stock">Hết hàng</Option>
                <Option value="expiring_soon">Sắp hết hạn</Option>
                <Option value="expired">Hết hạn</Option>
                <Option value="overstock">Tồn kho cao</Option>
                <Option value="slow_moving">Bán chậm</Option>
              </Select>
            </div>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <div>
              <Text strong style={{ display: 'block', marginBottom: '8px' }}>
                Mức độ
              </Text>
              <Select
                placeholder="Chọn mức độ"
                value={filters.severity || undefined}
                onChange={(value) => handleFilterChange('severity', value)}
                style={{ width: '100%' }}
                allowClear
              >
                <Option value="low">Thấp</Option>
                <Option value="medium">Trung bình</Option>
                <Option value="high">Cao</Option>
                <Option value="critical">Nguy hiểm</Option>
              </Select>
            </div>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <div>
              <Text strong style={{ display: 'block', marginBottom: '8px' }}>
                Trạng thái giải quyết
              </Text>
              <Select
                placeholder="Chọn trạng thái"
                value={filters.isResolved || undefined}
                onChange={(value) => handleFilterChange('isResolved', value)}
                style={{ width: '100%' }}
                allowClear
              >
                <Option value="false">Chưa giải quyết</Option>
                <Option value="true">Đã giải quyết</Option>
              </Select>
            </div>
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
            icon={<WarningOutlined />}
            onClick={handleCheckAlerts}
            loading={loading}
          >
            Kiểm tra cảnh báo
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
          dataSource={alerts}
          rowKey="_id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} cảnh báo`
          }}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
          size="small"
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title="Chi tiết cảnh báo"
        open={detailModal.visible}
        onCancel={() => setDetailModal({ visible: false, data: null })}
        footer={null}
        width={600}
      >
        {detailModal.data && (
          <div>
            <Row gutter={16} style={{ marginBottom: '16px' }}>
              <Col span={12}>
                <Text strong>Loại cảnh báo: </Text>
                <Tag color={getAlertTypeColor(detailModal.data.type)}>
                  {getAlertTypeText(detailModal.data.type)}
                </Tag>
              </Col>
              <Col span={12}>
                <Text strong>Mức độ: </Text>
                <Tag color={getSeverityColor(detailModal.data.severity)}>
                  {getSeverityText(detailModal.data.severity)}
                </Tag>
              </Col>
            </Row>
            <Row gutter={16} style={{ marginBottom: '16px' }}>
              <Col span={12}>
                <Text strong>Sản phẩm: </Text>
                <Text>{detailModal.data.productId?.name}</Text>
              </Col>
              <Col span={12}>
                <Text strong>Tồn kho hiện tại: </Text>
                <Text type={detailModal.data.currentStock === 0 ? 'danger' : 'default'}>
                  {detailModal.data.currentStock}
                </Text>
              </Col>
            </Row>
            <Row gutter={16} style={{ marginBottom: '16px' }}>
              <Col span={12}>
                <Text strong>Ngưỡng: </Text>
                <Text>{detailModal.data.thresholdValue}</Text>
              </Col>
              <Col span={12}>
                <Text strong>Hành động đề xuất: </Text>
                <Text>{getSuggestedActionText(detailModal.data.suggestedAction)}</Text>
              </Col>
            </Row>
            <Divider />
            <Text strong>Nội dung: </Text>
            <Text>{detailModal.data.message}</Text>
            {detailModal.data.expiryDate && (
              <>
                <Divider />
                <Text strong>Hạn sử dụng: </Text>
                <Text>{new Date(detailModal.data.expiryDate).toLocaleDateString('vi-VN')}</Text>
              </>
            )}
          </div>
        )}
      </Modal>

      {/* Resolve Modal */}
      <Modal
        title="Giải quyết cảnh báo"
        open={resolveModal.visible}
        onCancel={() => setResolveModal({ visible: false, data: null })}
        footer={null}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleResolveAlert}
        >
          <Form.Item
            name="suggestedAction"
            label="Hành động thực hiện"
            rules={[{ required: true, message: 'Vui lòng chọn hành động' }]}
          >
            <Select placeholder="Chọn hành động">
              <Option value="reorder">Đặt hàng lại</Option>
              <Option value="discount">Giảm giá</Option>
              <Option value="return_to_supplier">Trả nhà cung cấp</Option>
              <Option value="dispose">Tiêu hủy</Option>
              <Option value="transfer">Chuyển kho</Option>
              <Option value="none">Không có</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="resolvedNote"
            label="Ghi chú giải quyết"
            rules={[{ required: true, message: 'Vui lòng nhập ghi chú' }]}
          >
            <Input.TextArea
              placeholder="Nhập ghi chú về cách giải quyết"
              rows={4}
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
              >
                Giải quyết
              </Button>
              <Button
                onClick={() => setResolveModal({ visible: false, data: null })}
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

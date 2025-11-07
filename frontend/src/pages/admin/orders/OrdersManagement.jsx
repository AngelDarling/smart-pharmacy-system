import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Table, Tag, Space, Input, Select, Button, DatePicker, Typography, Statistic, Row, Col, message, Modal, Descriptions } from 'antd';
import { SearchOutlined, ReloadOutlined, ClearOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { getImageUrl, handleImageError } from '../../../utils/imageUtils';
import api from '../../../api/client';

const { RangePicker } = DatePicker;
const { Text } = Typography;

const STATUS_COLORS = {
  pending: 'gold',
  processing: 'blue',
  shipping: 'geekblue',
  completed: 'green',
  cancelled: 'red'
};

const STATUS_LABELS = {
  pending: 'Chờ xử lý',
  processing: 'Đang xử lý',
  shipping: 'Đang giao',
  completed: 'Hoàn tất',
  cancelled: 'Đã hủy'
};

export default function OrdersManagement() {
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [filters, setFilters] = useState({ q: '', status: '', paymentMethod: '', from: null, to: null });
  const [stats, setStats] = useState({ totalOrders: 0, totalRevenue: 0, statusBreakdown: [] });
  const [detail, setDetail] = useState({ open: false, order: null });

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.q) params.set('q', filters.q);
      if (filters.status) params.set('status', filters.status);
      if (filters.paymentMethod) params.set('paymentMethod', filters.paymentMethod);
      if (filters.from) params.set('from', dayjs(filters.from).startOf('day').toISOString());
      if (filters.to) params.set('to', dayjs(filters.to).endOf('day').toISOString());
      params.set('page', pagination.current);
      params.set('limit', pagination.pageSize);

      const [listRes, statsRes] = await Promise.all([
        api.get(`/orders/admin?${params.toString()}`),
        api.get('/orders/stats')
      ]);

      setOrders(listRes.data.items || []);
      setPagination((p) => ({ ...p, total: listRes.data.total || 0 }));
      setStats(statsRes.data || { totalOrders: 0, totalRevenue: 0, statusBreakdown: [] });
    } catch (e) {
      message.error('Không tải được danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.current, pagination.pageSize]);

  useEffect(() => { load(); }, [load]);

  const columns = [
    { 
      title: 'Mã đơn', 
      dataIndex: 'code', 
      width: 140,
      render: (v) => (
        <span style={{ color: '#1d4ed8', fontWeight: 700 }}>{v}</span>
      )
    },
    { 
      title: 'Khách hàng', 
      dataIndex: ['shippingAddress', 'fullName'], 
      width: 220, 
      render: (_, r) => (
        <span style={{ color: '#0f172a', fontWeight: 700 }}>
          {r.shippingAddress?.fullName || (r.userId?.name || 'Khách vãng lai')}
        </span>
      ) 
    },
    { title: 'SĐT', dataIndex: ['shippingAddress','phone'], width: 130, render: (_, r) => r.shippingAddress?.phone || '—' },
    { title: 'Thanh toán', dataIndex: 'paymentMethod', width: 110, render: (v)=> (v||'cod').toUpperCase() },
    { title: 'Trạng thái', dataIndex: 'status', width: 130, render: (v)=> <Tag color={STATUS_COLORS[v] || 'default'}>{STATUS_LABELS[v] || v}</Tag> },
    { title: 'Tổng tiền', dataIndex: ['totals','grand'], align:'right', width: 140, render: (v)=> (
      <span style={{ color: '#16a34a', fontWeight: 700 }}>{(v||0).toLocaleString('vi-VN')}₫</span>
    ) },
    { title: 'Thời gian', dataIndex: 'createdAt', width: 160, render: (v)=> dayjs(v).format('DD/MM/YYYY HH:mm') },
    {
      title: 'Thao tác', fixed: 'right', width: 180,
      render: (_, r) => (
        <Space wrap>
          <Button 
            type="primary" 
            size="small" 
            onClick={async () => {
              try {
                // Fetch chi tiết đơn hàng để có đầy đủ thông tin
                const res = await api.get(`/orders/${r._id}`);
                setDetail({ open: true, order: res.data });
              } catch (error) {
                // Fallback to order from list if fetch fails
                setDetail({ open: true, order: r });
              }
            }}
          >
            Chi tiết
          </Button>
          <Button 
            danger
            size="small"
            onClick={async () => {
              Modal.confirm({
                title: 'Xóa đơn hàng?',
                content: 'Thao tác này sẽ xóa đơn hàng vĩnh viễn. Nếu đơn hàng đã được xử lý, tồn kho sẽ được hoàn lại. Bạn có chắc chắn?',
                onOk: async () => {
                  try {
                    await api.delete(`/orders/${r._id}`);
                    message.success('Đã xóa đơn hàng');
                    load();
                  } catch (e) {
                    message.error('Không thể xóa đơn hàng');
                  }
                }
              });
            }}
          >
            Xóa
          </Button>
        </Space>
      )
    }
  ];

  const onTableChange = (p) => {
    setPagination({ current: p.current, pageSize: p.pageSize, total: pagination.total });
  };

  const updateStatus = async (orderId, status) => {
    try {
      const res = await api.patch(`/orders/${orderId}/status`, { status });
      const updated = res.data;
      message.success('Cập nhật trạng thái thành công');
      // Update modal state
      setDetail((d) => ({ ...d, order: updated }));
      // Update list in place
      setOrders((prev) => prev.map((o) => (o._id === updated._id ? { ...o, ...updated } : o)));
    } catch (e) {
      message.error('Không cập nhật được trạng thái');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ margin: 0, color: '#1d4ed8' }}>Quản lý đơn hàng</h2>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'end' }}>
        <Input
          placeholder="Tìm mã đơn / tên / SĐT"
          value={filters.q}
          onChange={(e)=> setFilters({ ...filters, q: e.target.value })}
          prefix={<SearchOutlined />}
          style={{ width: 260 }}
          allowClear
        />
        <Select
          placeholder="Trạng thái"
          value={filters.status || undefined}
          onChange={(v)=> setFilters({ ...filters, status: v || '' })}
          allowClear
          style={{ width: 180 }}
          options={[
            { label: 'Chờ xử lý', value: 'pending' },
            { label: 'Đang xử lý', value: 'processing' },
            { label: 'Đang giao', value: 'shipping' },
            { label: 'Hoàn tất', value: 'completed' },
            { label: 'Đã hủy', value: 'cancelled' },
          ]}
        />
        <Select
          placeholder="Hình thức thanh toán"
          value={filters.paymentMethod || undefined}
          onChange={(v)=> setFilters({ ...filters, paymentMethod: v || '' })}
          allowClear
          style={{ width: 200 }}
          options={[
            { label: 'COD', value: 'cod' },
            { label: 'Simulate', value: 'simulate' },
          ]}
        />
        <RangePicker
          value={filters.from && filters.to ? [dayjs(filters.from), dayjs(filters.to)] : null}
          onChange={(vals)=> setFilters({ ...filters, from: vals?.[0] || null, to: vals?.[1] || null })}
        />
        <Button 
          onClick={()=> {
            const today = dayjs().startOf('day');
            const todayEnd = dayjs().endOf('day');
            setFilters({ ...filters, from: today, to: todayEnd });
            setPagination((p) => ({ ...p, current: 1 }));
          }}
        >
          Hôm nay
        </Button>
        <Button type="primary" onClick={()=> setPagination((p)=> ({ ...p }))} icon={<ReloadOutlined />}>Lọc</Button>
        <Button 
          onClick={()=> {
            setFilters({ q: '', status: '', paymentMethod: '', from: null, to: null });
            setPagination((p) => ({ ...p, current: 1 }));
          }}
          icon={<ClearOutlined />}
        >
          Reset
        </Button>
      </div>

      {/* Stats */}
      <Row gutter={[16,16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={8}>
          <div style={{ padding: 16, background: '#f9fafb', borderRadius: 4 }}>
            <Statistic title="Tổng đơn hàng" value={stats.totalOrders} />
          </div>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <div style={{ padding: 16, background: '#f9fafb', borderRadius: 4 }}>
            <Statistic title="Doanh thu hoàn tất" value={(stats.totalRevenue||0).toLocaleString('vi-VN') + '₫'} />
          </div>
        </Col>
        <Col xs={24} md={8}>
          <div style={{ padding: 16, background: '#f9fafb', borderRadius: 4 }}>
            <Text strong>Trạng thái</Text>
            <div style={{ marginTop: 8, display:'flex', flexWrap:'wrap', gap: 8 }}>
              {(stats.statusBreakdown || []).map((s)=> (
                <Tag key={s._id} color={STATUS_COLORS[s._id] || 'default'}>{STATUS_LABELS[s._id] || s._id}: {s.count}</Tag>
              ))}
            </div>
          </div>
        </Col>
      </Row>

      {/* Table */}
      <Table
        rowKey={(r) => r._id}
        loading={loading}
        columns={columns}
        dataSource={orders}
        onChange={onTableChange}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showTotal: (t, r) => `${r[0]}-${r[1]} của ${t} đơn`
        }}
        scroll={{ x: 1000 }}
      />

      <Modal
        open={detail.open}
        onCancel={()=> setDetail({ open:false, order:null })}
        title={<span>Chi tiết đơn hàng <strong>{detail.order?.code}</strong></span>}
        footer={null}
        width={1000}
      >
        {detail.order && (
          <div>
            <Row gutter={[16,16]}>
              <Col xs={24} md={12}>
                <div style={{ padding: 16, border: '1px solid #f0f0f0', borderRadius: 4 }}>
                  <h3 style={{ marginTop: 0, marginBottom: 16, fontSize: 16, fontWeight: 600 }}>Thông tin khách hàng</h3>
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Tên khách hàng">{detail.order.shippingAddress?.fullName || detail.order.userId?.name || 'Khách vãng lai'}</Descriptions.Item>
                    <Descriptions.Item label="SĐT">{detail.order.shippingAddress?.phone || '—'}</Descriptions.Item>
                    <Descriptions.Item label="Email">{detail.order.shippingAddress?.email || '—'}</Descriptions.Item>
                    <Descriptions.Item label="Địa chỉ">{detail.order.shippingAddress?.address || '—'}</Descriptions.Item>
                  </Descriptions>
                </div>
              </Col>
              <Col xs={24} md={12}>
                <div style={{ padding: 16, border: '1px solid #f0f0f0', borderRadius: 4 }}>
                  <h3 style={{ marginTop: 0, marginBottom: 16, fontSize: 16, fontWeight: 600 }}>Thông tin thanh toán</h3>
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Phương thức">{(detail.order.paymentMethod||'cod').toUpperCase()}</Descriptions.Item>
                    <Descriptions.Item label="Tổng tiền hàng">{(detail.order.totals?.items||0).toLocaleString('vi-VN')}₫</Descriptions.Item>
                    <Descriptions.Item label="Phí vận chuyển">{(detail.order.totals?.shipping||0).toLocaleString('vi-VN')}₫</Descriptions.Item>
                    {detail.order.couponCode && (
                      <Descriptions.Item label="Mã giảm giá">
                        <Space>
                          <Text code style={{ background: '#f0f0f0', padding: '2px 8px', borderRadius: 4 }}>
                            {detail.order.couponCode}
                          </Text>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            (Giảm {(detail.order.totals?.discount||0).toLocaleString('vi-VN')}₫)
                          </Text>
                        </Space>
                      </Descriptions.Item>
                    )}
                    <Descriptions.Item label="Giảm giá">
                      {(detail.order.totals?.discount||0).toLocaleString('vi-VN')}₫
                      {detail.order.totals?.discount > 0 && detail.order.couponCode && (
                        <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
                          (từ mã {detail.order.couponCode})
                        </Text>
                      )}
                    </Descriptions.Item>
                    <Descriptions.Item label="Trạng thái">
                      <Space>
                        <Tag color={STATUS_COLORS[detail.order.status] || 'default'}>{STATUS_LABELS[detail.order.status] || detail.order.status}</Tag>
                        <Select
                          size="small"
                          value={detail.order.status}
                          onChange={(v)=> updateStatus(detail.order._id, v)}
                          options={[
                            { label: 'Chờ xử lý', value: 'pending' },
                            { label: 'Đang xử lý', value: 'processing' },
                            { label: 'Đang giao', value: 'shipping' },
                            { label: 'Hoàn tất', value: 'completed' },
                            { label: 'Đã hủy', value: 'cancelled' },
                          ]}
                        />
                      </Space>
                    </Descriptions.Item>
                    {detail.order.shipment?.shippingCode && (
                      <Descriptions.Item label="Mã vận chuyển">
                        <Space>
                          <Text code>{detail.order.shipment.shippingCode}</Text>
                          <Button
                            size="small"
                            type="primary"
                            onClick={() => window.open(`/admin/orders/tracking?code=${detail.order.shipment.shippingCode}`, '_blank')}
                          >Theo dõi vận chuyển</Button>
                        </Space>
                      </Descriptions.Item>
                    )}
                    <Descriptions.Item label="Tổng thanh toán"><span style={{ color:'#16a34a', fontWeight:700 }}>{(detail.order.totals?.grand||0).toLocaleString('vi-VN')}₫</span></Descriptions.Item>
                  </Descriptions>
                </div>
              </Col>
            </Row>

            <div style={{ marginTop: 16, padding: 16, border: '1px solid #f0f0f0', borderRadius: 4 }}>
              <h3 style={{ marginTop: 0, marginBottom: 16, fontSize: 16, fontWeight: 600 }}>Sản phẩm</h3>
              <Table
                rowKey={(r,idx)=> `${r.productId || idx}`}
                dataSource={detail.order.items || []}
                pagination={false}
                columns={[
                  {
                    title: 'Sản phẩm',
                    dataIndex: 'nameSnapshot',
                    render: (_, r) => (
                      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                        <img
                          src={getImageUrl(r.productId?.imageUrls?.[0], '/default-product.png')}
                          alt={r.nameSnapshot}
                          width={56}
                          height={56}
                          style={{ objectFit:'cover', borderRadius:8, border:'1px solid #f0f0f0' }}
                          onError={(e)=> handleImageError(e, '/default-product.png')}
                        />
                        <div>
                          <div style={{ fontWeight:600 }}>{r.nameSnapshot}</div>
                        </div>
                      </div>
                    )
                  },
                  { 
                    title:'SL', 
                    dataIndex:'quantity', 
                    align:'right', 
                    width:80 
                  },
                  { 
                    title:'Đơn giá', 
                    dataIndex:'priceSnapshot', 
                    align:'right', 
                    width:180, 
                    render:(v, r) => {
                      // Kiểm tra có giảm giá: có originalPriceSnapshot hoặc có discount > 0
                      const hasDiscount = (r.originalPriceSnapshot && r.originalPriceSnapshot > r.priceSnapshot) || 
                                         (r.discount > 0 && r.priceSnapshot < (r.originalPriceSnapshot || r.priceSnapshot));
                      const displayPrice = r.priceSnapshot || 0; // Giá đã giảm (finalPrice)
                      const originalPrice = r.originalPriceSnapshot || (hasDiscount ? r.priceSnapshot : null);
                      
                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                          <span style={{ color: '#3b82f6', fontWeight: 600 }}>
                            {displayPrice.toLocaleString('vi-VN')}₫
                          </span>
                          {hasDiscount && originalPrice && originalPrice > displayPrice && (
                            <span style={{ fontSize: 11, color: '#9ca3af', textDecoration: 'line-through' }}>
                              {originalPrice.toLocaleString('vi-VN')}₫
                            </span>
                          )}
                          {r.discount > 0 && (
                            <span style={{ fontSize: 11, color: '#ef4444', fontWeight: 500 }}>
                              Giảm {r.discountType === 'percent' ? `${r.discount}%` : `${(r.discountValue||0).toLocaleString('vi-VN')}₫`}
                            </span>
                          )}
                        </div>
                      );
                    }
                  },
                  { 
                    title:'Thành tiền', 
                    align:'right', 
                    width:180, 
                    render:(_,r)=> {
                      const hasDiscount = r.originalPriceSnapshot && r.originalPriceSnapshot > r.priceSnapshot;
                      const totalPrice = (r.priceSnapshot||0) * (r.quantity||0);
                      const totalOriginalPrice = hasDiscount ? (r.originalPriceSnapshot||0) * (r.quantity||0) : null;
                      
                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                          <span style={{ color: '#3b82f6', fontWeight: 600 }}>
                            {totalPrice.toLocaleString('vi-VN')}₫
                          </span>
                          {totalOriginalPrice && (
                            <span style={{ fontSize: 11, color: '#9ca3af', textDecoration: 'line-through' }}>
                              {totalOriginalPrice.toLocaleString('vi-VN')}₫
                            </span>
                          )}
                        </div>
                      );
                    }
                  }
                ]}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}



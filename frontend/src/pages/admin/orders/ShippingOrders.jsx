import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Table, Tag, Space, Input, Button, Row, Col, message, Avatar, Select, DatePicker, Statistic, Card } from 'antd';
import { SearchOutlined, ReloadOutlined, CarOutlined, ClearOutlined, EyeOutlined, DollarOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../../../api/client';

const { RangePicker } = DatePicker;

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

const PAYMENT_METHOD_LABELS = {
  cod: 'Tiền mặt',
  momo: 'MoMo',
  vnpay: 'VNPay',
  simulate: 'Simulate'
};

export default function ShippingOrders() {
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [filters, setFilters] = useState({
    q: '',
    paymentMethod: '',
    from: null,
    to: null
  });

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set('status', 'shipping');
      if (filters.q) params.set('q', filters.q);
      if (filters.paymentMethod) params.set('paymentMethod', filters.paymentMethod);
      if (filters.from) params.set('from', dayjs(filters.from).startOf('day').toISOString());
      if (filters.to) params.set('to', dayjs(filters.to).endOf('day').toISOString());
      params.set('page', pagination.current);
      params.set('limit', pagination.pageSize);
      const res = await api.get(`/orders/admin?${params.toString()}`);
      setOrders(res.data.items || []);
      setPagination((p) => ({ ...p, total: res.data.total || 0 }));
    } catch (e) {
      message.error('Không tải được danh sách đơn đang giao');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.current, pagination.pageSize]);

  useEffect(() => { load(); }, [load]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = pagination.total || 0;
    const revenue = orders.reduce((sum, o) => sum + (o.totals?.grand || 0), 0);
    return { total, revenue };
  }, [orders, pagination.total]);

  const columns = [
    { title: 'Mã đơn', dataIndex: 'code', width: 140, render: (v) => <span style={{ color: '#1d4ed8', fontWeight: 700 }}>{v}</span> },
    { title: 'Khách hàng', dataIndex: ['shippingAddress', 'fullName'], width: 220, render: (_, r) => <span style={{ fontWeight: 700 }}>{r.shippingAddress?.fullName || r.userId?.name || 'Khách vãng lai'}</span> },
    { title: 'SĐT', dataIndex: ['shippingAddress', 'phone'], width: 130, render: (_, r) => r.shippingAddress?.phone || '—' },
    { title: 'Thanh toán', dataIndex: 'paymentMethod', width: 110, render: (v) => PAYMENT_METHOD_LABELS[v] || v },
    { title: 'Trạng thái', dataIndex: 'status', width: 130, render: (v) => <Tag color={STATUS_COLORS[v] || 'default'}>{STATUS_LABELS[v] || v}</Tag> },
    { title: 'Tổng tiền', dataIndex: ['totals', 'grand'], align: 'right', width: 140, render: (v) => <span style={{ color: '#16a34a', fontWeight: 700 }}>{(v || 0).toLocaleString('vi-VN')}₫</span> },
    { title: 'Thời gian', dataIndex: 'createdAt', width: 160, render: (v) => dayjs(v).format('DD/MM/YYYY HH:mm') },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => {
            const code = record.shipment?.shippingCode || record.code;
            window.open(`/admin/orders/tracking?code=${code}`, '_blank');
          }}
        >
          Theo dõi
        </Button>
      )
    }
  ];

  const onTableChange = (p) => {
    setPagination({ current: p.current, pageSize: p.pageSize, total: pagination.total });
  };

  return (
    <div>
      {/* Header Section */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Avatar
            size="large"
            icon={<CarOutlined />}
            style={{
              backgroundColor: '#52c41a',
              marginRight: '16px'
            }}
          />
          <div>
            <h2 style={{ margin: 0, color: '#262626' }}>
              Đơn đang giao
            </h2>
            <div style={{ color: '#8c8c8c', fontSize: '14px' }}>
              Theo dõi đơn hàng đang trong quá trình vận chuyển
            </div>
          </div>
        </div>
        <Link to="/shipper-simulator">
          <Button
            type="primary"
            icon={<span>🚚</span>}
            style={{ backgroundColor: '#10b981', borderColor: '#059669' }}
          >
            Mô phỏng giao hàng
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Đơn đang giao"
              value={stats.total}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Tổng giá trị"
              value={stats.revenue.toLocaleString('vi-VN') + '₫'}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'end' }}>
        <Input
          placeholder="Tìm mã đơn / tên / SĐT"
          value={filters.q}
          onChange={(e) => setFilters({ ...filters, q: e.target.value })}
          prefix={<SearchOutlined />}
          style={{ width: 260 }}
          allowClear
        />
        <Select
          placeholder="Hình thức thanh toán"
          value={filters.paymentMethod || undefined}
          onChange={(v) => setFilters({ ...filters, paymentMethod: v || '' })}
          allowClear
          style={{ width: 200 }}
          options={[
            { label: 'Tiền mặt (COD)', value: 'cod' },
            { label: 'MoMo', value: 'momo' },
            { label: 'VNPay', value: 'vnpay' },
            { label: 'Simulate', value: 'simulate' },
          ]}
        />
        <RangePicker
          value={filters.from && filters.to ? [dayjs(filters.from), dayjs(filters.to)] : null}
          onChange={(vals) => setFilters({ ...filters, from: vals?.[0] || null, to: vals?.[1] || null })}
        />
        <Button
          onClick={() => {
            const today = dayjs().startOf('day');
            const todayEnd = dayjs().endOf('day');
            setFilters({ ...filters, from: today, to: todayEnd });
            setPagination((p) => ({ ...p, current: 1 }));
          }}
        >
          Hôm nay
        </Button>
        <Button type="primary" onClick={() => setPagination((p) => ({ ...p }))} icon={<ReloadOutlined />}>Lọc</Button>
        <Button
          onClick={() => {
            setFilters({ q: '', paymentMethod: '', from: null, to: null });
            setPagination((p) => ({ ...p, current: 1 }));
          }}
          icon={<ClearOutlined />}
        >
          Reset
        </Button>
      </div>

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
        scroll={{ x: 1200 }}
      />
    </div>
  );
}



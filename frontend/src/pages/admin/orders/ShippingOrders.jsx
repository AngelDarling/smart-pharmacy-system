import React, { useCallback, useEffect, useState } from 'react';
import { Table, Tag, Space, Input, Button, Row, Col, message } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../../../api/client';


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

export default function ShippingOrders() {
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [q, setQ] = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set('status', 'shipping');
      if (q) params.set('q', q);
      params.set('page', pagination.current);
      params.set('limit', pagination.pageSize);
      const res = await api.get(`/orders/admin?${params.toString()}`);
      setOrders(res.data.items || []);
      setPagination((p)=> ({ ...p, total: res.data.total || 0 }));
    } catch (e) {
      message.error('Không tải được danh sách đơn đang giao');
    } finally {
      setLoading(false);
    }
  }, [q, pagination.current, pagination.pageSize]);

  useEffect(() => { load(); }, [load]);

  const columns = [
    { title: 'Mã đơn', dataIndex: 'code', width: 140, render: (v)=> <span style={{ color:'#1d4ed8', fontWeight:700 }}>{v}</span> },
    { title: 'Khách hàng', dataIndex: ['shippingAddress','fullName'], width: 220, render: (_,r)=> <span style={{ fontWeight:700 }}>{r.shippingAddress?.fullName || r.userId?.name || 'Khách vãng lai'}</span> },
    { title: 'SĐT', dataIndex: ['shippingAddress','phone'], width: 130, render: (_,r)=> r.shippingAddress?.phone || '—' },
    { title: 'Thanh toán', dataIndex: 'paymentMethod', width: 110, render: (v)=> (v||'cod').toUpperCase() },
    { title: 'Trạng thái', dataIndex: 'status', width: 130, render: (v)=> <Tag color={STATUS_COLORS[v] || 'default'}>{STATUS_LABELS[v] || v}</Tag> },
    { title: 'Tổng tiền', dataIndex: ['totals','grand'], align:'right', width: 140, render: (v)=> <span style={{ color:'#16a34a', fontWeight:700 }}>{(v||0).toLocaleString('vi-VN')}₫</span> },
    { title: 'Thời gian', dataIndex: 'createdAt', width: 160, render: (v)=> dayjs(v).format('DD/MM/YYYY HH:mm') }
  ];

  const onTableChange = (p) => {
    setPagination({ current: p.current, pageSize: p.pageSize, total: pagination.total });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ margin: 0, color: '#1d4ed8' }}>Đơn đang giao</h2>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'end' }}>
        <Input
          placeholder="Tìm mã đơn / tên / SĐT"
          value={q}
          onChange={(e)=> setQ(e.target.value)}
          prefix={<SearchOutlined />}
          style={{ width: 280 }}
          allowClear
        />
        <Button type="primary" icon={<ReloadOutlined />} onClick={()=> setPagination((p)=> ({ ...p }))}>Lọc</Button>
      </div>

      {/* Table */}
      <Table
        rowKey={(r)=> r._id}
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
    </div>
  );
}



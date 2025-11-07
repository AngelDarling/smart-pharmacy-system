import React, { useCallback, useEffect, useState } from 'react';
import { Table, Tag, Space, Input, Select, Button, DatePicker, Typography, Statistic, Row, Col, message, Modal, Descriptions, Card, Divider } from 'antd';
import { SearchOutlined, ReloadOutlined, ClearOutlined, PrinterOutlined, FileTextOutlined, EyeOutlined, DownloadOutlined } from '@ant-design/icons';
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import dayjs from 'dayjs';
import { getImageUrl, handleImageError } from '../../../utils/imageUtils';
import api from '../../../api/client';
import InvoicePDF from '../../../components/InvoicePDF';

const { RangePicker } = DatePicker;
const { Text, Title } = Typography;

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

export default function Invoices() {
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [filters, setFilters] = useState({ q: '', paymentMethod: '', from: null, to: null });
  const [stats, setStats] = useState({ totalInvoices: 0, totalRevenue: 0 });
  const [detail, setDetail] = useState({ open: false, order: null });
  const [printView, setPrintView] = useState({ open: false, order: null });

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      // Chỉ lấy đơn hàng đã hoàn thành
      params.set('status', 'completed');
      if (filters.q) params.set('q', filters.q);
      if (filters.paymentMethod) params.set('paymentMethod', filters.paymentMethod);
      if (filters.from) params.set('from', dayjs(filters.from).startOf('day').toISOString());
      if (filters.to) params.set('to', dayjs(filters.to).endOf('day').toISOString());
      params.set('page', pagination.current);
      params.set('limit', pagination.pageSize);

      const [listRes, statsRes] = await Promise.all([
        api.get(`/orders/admin?${params.toString()}`),
        api.get('/orders/stats?status=completed')
      ]);

      setOrders(listRes.data.items || []);
      setPagination((p) => ({ ...p, total: listRes.data.total || 0 }));
      
      // Tính thống kê từ danh sách đơn hàng
      const totalRevenue = (listRes.data.items || []).reduce((sum, order) => sum + (order.totals?.grand || 0), 0);
      setStats({ 
        totalInvoices: listRes.data.total || 0,
        totalRevenue: statsRes.data?.totalRevenue || totalRevenue
      });
    } catch (e) {
      message.error('Không tải được danh sách hóa đơn');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.current, pagination.pageSize]);

  useEffect(() => { load(); }, [load]);

  const columns = [
    { 
      title: 'Mã hóa đơn', 
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
    { title: 'Tổng tiền', dataIndex: ['totals','grand'], align:'right', width: 140, render: (v)=> (
      <span style={{ color: '#16a34a', fontWeight: 700 }}>{(v||0).toLocaleString('vi-VN')}₫</span>
    ) },
    { title: 'Ngày xuất', dataIndex: 'createdAt', width: 160, render: (v)=> dayjs(v).format('DD/MM/YYYY HH:mm') },
    {
      title: 'Thao tác', fixed: 'right', width: 250,
      render: (_, r) => (
        <Space wrap>
          <Button 
            type="primary" 
            size="small" 
            icon={<EyeOutlined />}
            onClick={async () => {
              try {
                const res = await api.get(`/orders/${r._id}`);
                setDetail({ open: true, order: res.data });
              } catch (error) {
                setDetail({ open: true, order: r });
              }
            }}
          >
            Xem
          </Button>
          <Button 
            size="small"
            icon={<PrinterOutlined />}
            onClick={async () => {
              try {
                const res = await api.get(`/orders/${r._id}`);
                setPrintView({ open: true, order: res.data });
              } catch (error) {
                setPrintView({ open: true, order: r });
              }
            }}
          >
            Xem PDF
          </Button>
          <PDFDownloadLink
            document={<InvoicePDF order={r} />}
            fileName={getPDFFileName(r)}
          >
            {({ loading }) => (
              <Button 
                size="small"
                icon={<DownloadOutlined />}
                loading={loading}
              >
                {loading ? '...' : 'Tải PDF'}
              </Button>
            )}
          </PDFDownloadLink>
        </Space>
      )
    }
  ];

  const onTableChange = (p) => {
    setPagination({ current: p.current, pageSize: p.pageSize, total: pagination.total });
  };

  const handlePrint = () => {
    window.print();
  };

  const getPDFFileName = (order) => {
    if (!order) return 'hoa-don.pdf';
    return `HoaDon_${order.code}_${dayjs(order.createdAt).format('YYYYMMDD')}.pdf`;
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={2} style={{ margin: 0, color: '#1d4ed8' }}>
          <FileTextOutlined style={{ marginRight: 8 }} />
          Quản lý hóa đơn
        </Title>
      </div>

      {/* Filters */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'end' }}>
          <Input
            placeholder="Tìm mã đơn / tên / SĐT"
            value={filters.q}
            onChange={(e)=> setFilters({ ...filters, q: e.target.value })}
            prefix={<SearchOutlined />}
            style={{ width: 260 }}
            allowClear
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
          <Button 
            type="primary" 
            onClick={()=> setPagination((p)=> ({ ...p, current: 1 }))} 
            icon={<ReloadOutlined />}
          >
            Lọc
          </Button>
          <Button 
            onClick={()=> {
              setFilters({ q: '', paymentMethod: '', from: null, to: null });
              setPagination((p) => ({ ...p, current: 1 }));
            }}
            icon={<ClearOutlined />}
          >
            Reset
          </Button>
        </div>
      </Card>

      {/* Stats */}
      <Row gutter={[16,16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={12}>
          <Card>
            <Statistic 
              title="Tổng số hóa đơn" 
              value={stats.totalInvoices}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={12}>
          <Card>
            <Statistic 
              title="Tổng doanh thu" 
              value={(stats.totalRevenue||0).toLocaleString('vi-VN') + '₫'}
              prefix={<DownloadOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Table */}
      <Card>
        <Table
          rowKey={(r) => r._id}
          loading={loading}
          columns={columns}
          dataSource={orders}
          onChange={onTableChange}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (t, r) => `${r[0]}-${r[1]} của ${t} hóa đơn`
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        open={detail.open}
        onCancel={()=> setDetail({ open:false, order:null })}
        title={<span>Chi tiết hóa đơn <strong>{detail.order?.code}</strong></span>}
        footer={[
          <Button key="close" onClick={()=> setDetail({ open:false, order:null })}>
            Đóng
          </Button>,
          <Button 
            key="print" 
            type="primary" 
            icon={<PrinterOutlined />}
            onClick={() => {
              setDetail({ open: false, order: null });
              setPrintView({ open: true, order: detail.order });
            }}
          >
            In hóa đơn
          </Button>
        ]}
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
                    </Descriptions.Item>
                    <Descriptions.Item label="Tổng thanh toán">
                      <span style={{ color:'#16a34a', fontWeight:700 }}>{(detail.order.totals?.grand||0).toLocaleString('vi-VN')}₫</span>
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày xuất">
                      {dayjs(detail.order.createdAt).format('DD/MM/YYYY HH:mm')}
                    </Descriptions.Item>
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
                      const hasDiscount = (r.originalPriceSnapshot && r.originalPriceSnapshot > r.priceSnapshot) || 
                                         (r.discount > 0 && r.priceSnapshot < (r.originalPriceSnapshot || r.priceSnapshot));
                      const displayPrice = r.priceSnapshot || 0;
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
                        </div>
                      );
                    }
                  },
                  { 
                    title:'Thành tiền', 
                    align:'right', 
                    width:180, 
                    render:(_,r)=> {
                      const totalPrice = (r.priceSnapshot||0) * (r.quantity||0);
                      return (
                        <span style={{ color: '#3b82f6', fontWeight: 600 }}>
                          {totalPrice.toLocaleString('vi-VN')}₫
                        </span>
                      );
                    }
                  }
                ]}
              />
            </div>
          </div>
        )}
      </Modal>

      {/* Print View Modal */}
      <Modal
        open={printView.open}
        onCancel={()=> setPrintView({ open:false, order:null })}
        title={<span>Xem và tải hóa đơn <strong>{printView.order?.code}</strong></span>}
        footer={[
          <Button key="close" onClick={()=> setPrintView({ open:false, order:null })}>
            Đóng
          </Button>,
          printView.order && (
            <PDFDownloadLink
              key="download"
              document={<InvoicePDF order={printView.order} />}
              fileName={getPDFFileName(printView.order)}
            >
              {({ loading }) => (
                <Button 
                  type="primary" 
                  icon={<DownloadOutlined />}
                  loading={loading}
                >
                  {loading ? 'Đang tạo PDF...' : 'Tải PDF'}
                </Button>
              )}
            </PDFDownloadLink>
          )
        ]}
        width={900}
        style={{ top: 20 }}
      >
        {printView.order && (
          <div style={{ height: '80vh', border: '1px solid #f0f0f0' }}>
            <PDFViewer width="100%" height="100%">
              <InvoicePDF order={printView.order} />
            </PDFViewer>
          </div>
        )}
      </Modal>
    </div>
  );
}

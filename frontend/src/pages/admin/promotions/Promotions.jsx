import React, { useEffect, useState, useMemo } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, DatePicker, Select, Switch, Space, Avatar, Divider, Tag, message, Tooltip } from 'antd';
import { TagsOutlined, PlusOutlined, ShoppingOutlined, GlobalOutlined, CopyOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import Swal from 'sweetalert2';
import api from '../../../api/client.js';

export default function Promotions() {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();
  const [productMap, setProductMap] = useState({});
  const [generalPageSize, setGeneralPageSize] = useState(10);
  const [productPageSize, setProductPageSize] = useState(10);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get('/coupons');
      const coupons = res.data.items || [];
      setItems(coupons);

      // Fetch product info for product-specific coupons
      const productSlugs = coupons
        .filter(c => c.isDirectApply && c.productSlug)
        .map(c => c.productSlug);

      if (productSlugs.length > 0) {
        const uniqueSlugs = [...new Set(productSlugs)];
        const productInfoMap = {};

        // Fetch product info for each unique slug
        await Promise.all(
          uniqueSlugs.map(async (slug) => {
            try {
              const productRes = await api.get(`/products/slug/${slug}`);
              if (productRes.data) {
                productInfoMap[slug] = {
                  name: productRes.data.name,
                  _id: productRes.data._id
                };
              }
            } catch (e) {
              console.error(`Failed to fetch product ${slug}:`, e);
              productInfoMap[slug] = { name: slug, _id: null };
            }
          })
        );

        setProductMap(productInfoMap);
      }
    } catch (e) {
      Swal.fire('Lỗi!', 'Không tải được danh sách mã', 'error');
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  // Separate coupons into general and product-specific
  const { generalCoupons, productCoupons } = useMemo(() => {
    const general = items.filter(item => !item.isDirectApply || !item.productSlug);
    const product = items.filter(item => item.isDirectApply && item.productSlug);
    return { generalCoupons: general, productCoupons: product };
  }, [items]);

  const currencyFormatter = (value) => {
    if (value === undefined || value === null) return '';
    const str = String(value).replace(/[^0-9.-]/g, '');
    if (str === '') return '';
    const [int, dec] = str.split('.');
    return `${int.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}${dec ? '.' + dec : ''}`;
  };
  const currencyParser = (value) => {
    if (!value) return 0;
    return Number(String(value).replace(/[^0-9.-]/g, ''));
  };

  function onAdd() { setEditing(null); setOpen(true); form.resetFields(); }
  function onEdit(rec) {
    setEditing(rec);
    setOpen(true);
    const formValues = { ...rec };
    // Convert startDate và endDate thành mảng cho DatePicker.RangePicker
    if (rec.startDate || rec.endDate) {
      formValues.dates = [
        rec.startDate ? dayjs(rec.startDate) : null,
        rec.endDate ? dayjs(rec.endDate) : null
      ];
    }
    form.setFieldsValue(formValues);
  }

  async function onDelete(id) {
    const result = await Swal.fire({
      title: 'Xóa mã khuyến mãi?',
      text: 'Bạn có chắc chắn muốn xóa mã này? Thao tác không thể hoàn tác.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/coupons/${id}`);
        Swal.fire('Đã xóa!', 'Mã khuyến mãi đã được xóa thành công', 'success');
        load();
      } catch (error) {
        Swal.fire('Lỗi!', error?.response?.data?.message || 'Không thể xóa mã khuyến mãi', 'error');
      }
    }
  }

  async function onSubmit() {
    try {
      const values = await form.validateFields();
      const payload = { ...values };
      if (values.dates) {
        payload.startDate = values.dates[0]?.toISOString();
        payload.endDate = values.dates[1]?.toISOString();
        delete payload.dates;
      }
      if (payload.discountType === 'amount') { delete payload.maxDiscount; }

      if (editing) {
        await api.patch(`/coupons/${editing._id}`, payload);
        Swal.fire('Thành công!', 'Cập nhật mã khuyến mãi thành công', 'success');
      } else {
        await api.post('/coupons', payload);
        Swal.fire('Thành công!', 'Tạo mã khuyến mãi thành công', 'success');
      }

      setOpen(false);
      load();
    } catch (error) {
      console.error('Error submitting coupon:', error);
      const errorMessage = error?.response?.data?.message || 'Có lỗi xảy ra khi lưu mã khuyến mãi';
      Swal.fire('Lỗi!', errorMessage, 'error');
    }
  }

  const formatCurrency = (value) => {
    if (!value && value !== 0) return '—';
    return `${Number(value).toLocaleString('vi-VN')} ₫`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const baseColumns = [
    {
      title: 'Mã',
      dataIndex: 'code',
      width: 150,
      render: (code) => (
        <div
          style={{
            position: 'relative',
            display: 'inline-block',
            fontWeight: 700,
            fontFamily: 'monospace',
            fontSize: '14px',
            color: '#1890ff',
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: '4px',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#e6f7ff';
            const btn = e.currentTarget.querySelector('.copy-btn');
            if (btn) btn.style.opacity = '1';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            const btn = e.currentTarget.querySelector('.copy-btn');
            if (btn) btn.style.opacity = '0';
          }}
        >
          <span>{code}</span>
          <Tooltip title="Copy mã">
            <Button
              className="copy-btn"
              type="text"
              size="small"
              icon={<CopyOutlined />}
              style={{
                opacity: 0,
                marginLeft: '8px',
                transition: 'opacity 0.2s',
                padding: '0 4px',
                height: '20px'
              }}
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(code);
                message.success(`Đã copy mã: ${code}`);
              }}
            />
          </Tooltip>
        </div>
      )
    },
    { title: 'Loại', dataIndex: 'discountType', width: 120, render: v => v === 'percent' ? 'Phần trăm' : 'Số tiền' },
    {
      title: 'Giá trị',
      dataIndex: 'discountValue',
      width: 120,
      render: (value, record) => {
        if (record.discountType === 'percent') {
          return `${value}%`;
        }
        return formatCurrency(value);
      }
    },
    { title: 'HĐ tối thiểu', dataIndex: 'minOrder', width: 140, render: formatCurrency },
    { title: 'Giảm tối đa', dataIndex: 'maxDiscount', width: 140, render: (v) => v ? formatCurrency(v) : 'không có' },
    {
      title: 'Hiệu lực',
      width: 200,
      render: (_, r) => {
        const start = formatDate(r.startDate);
        const end = formatDate(r.endDate);
        if (start || end) {
          return `${start || '—'} → ${end || '—'}`;
        }
        return 'không giới hạn';
      }
    },
    { title: 'Sử dụng', width: 100, render: (_, r) => `${r.usedCount || 0}/${r.usageLimit || '∞'}` },
    { title: 'Trạng thái', dataIndex: 'isActive', width: 120, render: v => <Tag color={v ? 'green' : 'red'}>{v ? 'Đang bật' : 'Tắt'}</Tag> },
    {
      title: 'Thao tác',
      width: 120,
      fixed: 'right',
      render: (_, r) => (
        <Space>
          <Button onClick={() => onEdit(r)} size="small">Sửa</Button>
          <Button danger onClick={() => onDelete(r._id)} size="small">Xóa</Button>
        </Space>
      )
    }
  ];

  // Columns for product-specific coupons with additional product column
  const productColumns = [
    {
      title: 'Mã',
      dataIndex: 'code',
      width: 150,
      render: (code) => (
        <div
          style={{
            position: 'relative',
            display: 'inline-block',
            fontWeight: 700,
            fontFamily: 'monospace',
            fontSize: '14px',
            color: '#1890ff',
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: '4px',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#e6f7ff';
            const btn = e.currentTarget.querySelector('.copy-btn');
            if (btn) btn.style.opacity = '1';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            const btn = e.currentTarget.querySelector('.copy-btn');
            if (btn) btn.style.opacity = '0';
          }}
        >
          <span>{code}</span>
          <Tooltip title="Copy mã">
            <Button
              className="copy-btn"
              type="text"
              size="small"
              icon={<CopyOutlined />}
              style={{
                opacity: 0,
                marginLeft: '8px',
                transition: 'opacity 0.2s',
                padding: '0 4px',
                height: '20px'
              }}
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(code);
                message.success(`Đã copy mã: ${code}`);
              }}
            />
          </Tooltip>
        </div>
      )
    },
    {
      title: 'Áp dụng cho',
      dataIndex: 'productSlug',
      width: 250,
      render: (slug) => {
        const product = productMap[slug];
        if (!product) {
          return <Tag icon={<ShoppingOutlined />} color="default">{slug}</Tag>;
        }
        return (
          <a
            href={`/admin/products?search=${product.name}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#1890ff' }}
          >
            <ShoppingOutlined /> {product.name}
          </a>
        );
      }
    },
    { title: 'Loại', dataIndex: 'discountType', width: 120, render: v => v === 'percent' ? 'Phần trăm' : 'Số tiền' },
    {
      title: 'Giá trị',
      dataIndex: 'discountValue',
      width: 120,
      render: (value, record) => {
        if (record.discountType === 'percent') {
          return `${value}%`;
        }
        return formatCurrency(value);
      }
    },
    { title: 'HĐ tối thiểu', dataIndex: 'minOrder', width: 140, render: formatCurrency },
    { title: 'Giảm tối đa', dataIndex: 'maxDiscount', width: 140, render: (v) => v ? formatCurrency(v) : 'không có' },
    {
      title: 'Hiệu lực',
      width: 200,
      render: (_, r) => {
        const start = formatDate(r.startDate);
        const end = formatDate(r.endDate);
        if (start || end) {
          return `${start || '—'} → ${end || '—'}`;
        }
        return 'không giới hạn';
      }
    },
    { title: 'Sử dụng', width: 100, render: (_, r) => `${r.usedCount || 0}/${r.usageLimit || '∞'}` },
    { title: 'Trạng thái', dataIndex: 'isActive', width: 120, render: v => <Tag color={v ? 'green' : 'red'}>{v ? 'Đang bật' : 'Tắt'}</Tag> },
    {
      title: 'Thao tác',
      width: 120,
      fixed: 'right',
      render: (_, r) => (
        <Space>
          <Button onClick={() => onEdit(r)} size="small">Sửa</Button>
          <Button danger onClick={() => onDelete(r._id)} size="small">Xóa</Button>
        </Space>
      )
    }
  ];

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
            icon={<TagsOutlined />}
            style={{
              backgroundColor: '#f5222d',
              marginRight: '16px'
            }}
          />
          <div>
            <h2 style={{ margin: 0, color: '#262626' }}>
              Quản lý mã khuyến mãi
            </h2>
            <div style={{ color: '#8c8c8c', fontSize: '14px' }}>
              Quản lý mã giảm giá và chương trình khuyến mãi
            </div>
          </div>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={onAdd} size="large">
          Thêm mã
        </Button>
      </div>

      {/* General Coupons Section */}
      <div style={{ marginBottom: 40 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: 16,
          padding: '12px 16px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 8
        }}>
          <Avatar
            size="small"
            icon={<GlobalOutlined />}
            style={{
              backgroundColor: 'rgba(255,255,255,0.3)',
              marginRight: '12px'
            }}
          />
          <div>
            <h3 style={{ margin: 0, color: 'white', fontSize: 16 }}>
              Mã khuyến mãi chung
            </h3>
            <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: '13px' }}>
              Áp dụng cho tất cả sản phẩm ({generalCoupons.length} mã)
            </div>
          </div>
        </div>
        <Table
          rowKey="_id"
          loading={loading}
          dataSource={generalCoupons}
          columns={baseColumns}
          scroll={{ x: 1200 }}
          pagination={{
            pageSize: generalPageSize,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            showTotal: (total) => `Tổng ${total} mã`,
            onChange: (page, pageSize) => setGeneralPageSize(pageSize),
            onShowSizeChange: (current, size) => setGeneralPageSize(size)
          }}
        />
      </div>

      <Divider />

      {/* Product-Specific Coupons Section */}
      <div style={{ marginBottom: 40 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: 16,
          padding: '12px 16px',
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          borderRadius: 8
        }}>
          <Avatar
            size="small"
            icon={<ShoppingOutlined />}
            style={{
              backgroundColor: 'rgba(255,255,255,0.3)',
              marginRight: '12px'
            }}
          />
          <div>
            <h3 style={{ margin: 0, color: 'white', fontSize: 16 }}>
              Mã khuyến mãi sản phẩm cụ thể
            </h3>
            <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: '13px' }}>
              Áp dụng cho sản phẩm được chỉ định ({productCoupons.length} mã)
            </div>
          </div>
        </div>
        <Table
          rowKey="_id"
          loading={loading}
          dataSource={productCoupons}
          columns={productColumns}
          scroll={{ x: 1400 }}
          pagination={{
            pageSize: productPageSize,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            showTotal: (total) => `Tổng ${total} mã`,
            onChange: (page, pageSize) => setProductPageSize(pageSize),
            onShowSizeChange: (current, size) => setProductPageSize(size)
          }}
        />
      </div>

      <Modal open={open} onCancel={() => setOpen(false)} onOk={onSubmit} okText={editing ? 'Cập nhật' : 'Tạo mới'} title={editing ? 'Sửa mã' : 'Thêm mã'}>
        <Form form={form} layout="vertical">
          <Form.Item name="code" label="Mã" rules={[{ required: true }]}><Input placeholder="VD: SUMMER10" /></Form.Item>
          <Form.Item name="description" label="Mô tả"><Input /></Form.Item>
          <Form.Item name="discountType" label="Loại giảm" initialValue="percent" rules={[{ required: true }]}>
            <Select options={[{ value: 'percent', label: 'Phần trăm (%)' }, { value: 'amount', label: 'Số tiền (đ)' }]} />
          </Form.Item>
          <Form.Item noStyle shouldUpdate={(prev, cur) => prev.discountType !== cur.discountType}>
            {({ getFieldValue }) => getFieldValue('discountType') === 'amount' ? (
              <Form.Item name="discountValue" label="Giá trị" rules={[{ required: true }]}>
                <InputNumber min={1} style={{ width: '100%' }} formatter={currencyFormatter} parser={currencyParser} addonAfter="₫" />
              </Form.Item>
            ) : (
              <Form.Item name="discountValue" label="Giá trị (%)" rules={[{ required: true }]}>
                <InputNumber min={1} max={100} style={{ width: '100%' }} />
              </Form.Item>
            )}
          </Form.Item>
          <Form.Item name="minOrder" label="Đơn tối thiểu">
            <InputNumber min={0} style={{ width: '100%' }} formatter={currencyFormatter} parser={currencyParser} addonAfter="₫" />
          </Form.Item>
          {/* Chỉ hiện khi là giảm theo phần trăm */}
          <Form.Item noStyle shouldUpdate={(prev, cur) => prev.discountType !== cur.discountType}>
            {({ getFieldValue }) => getFieldValue('discountType') !== 'amount' ? (
              <Form.Item name="maxDiscount" label="Giảm tối đa">
                <InputNumber min={0} style={{ width: '100%' }} formatter={currencyFormatter} parser={currencyParser} addonAfter="₫" />
              </Form.Item>
            ) : null}
          </Form.Item>
          <Form.Item name="usageLimit" label="Giới hạn sử dụng"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="dates" label="Thời gian áp dụng"><DatePicker.RangePicker style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="isDirectApply" label="Áp dụng trực tiếp cho sản phẩm" valuePropName="checked" initialValue={false}>
            <Switch />
          </Form.Item>
          <Form.Item noStyle shouldUpdate={(prev, cur) => prev.isDirectApply !== cur.isDirectApply}>
            {({ getFieldValue }) => getFieldValue('isDirectApply') ? (
              <Form.Item
                name="productSlug"
                label="Slug sản phẩm"
                rules={[{ required: true, message: 'Vui lòng nhập slug sản phẩm' }]}
              >
                <Input placeholder="VD: thuoc-than-kinh-31-mhbkq6zn-8zd4" />
              </Form.Item>
            ) : null}
          </Form.Item>
          <Form.Item name="isActive" label="Kích hoạt" valuePropName="checked" initialValue={true}><Switch /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}



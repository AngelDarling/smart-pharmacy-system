import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, DatePicker, Select, Switch, Space, message } from 'antd';
import dayjs from 'dayjs';
import api from '../../../api/client.js';

export default function Promotions() {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  async function load() {
    setLoading(true);
    try {
      const res = await api.get('/coupons');
      setItems(res.data.items || []);
    } catch (e) {
      message.error('Không tải được danh sách mã');
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

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
    Modal.confirm({ title: 'Xóa mã khuyến mãi?', onOk: async () => { await api.delete(`/coupons/${id}`); message.success('Đã xóa'); load(); } });
  }

  async function onSubmit() {
    const values = await form.validateFields();
    const payload = { ...values };
    if (values.dates) { payload.startDate = values.dates[0]?.toISOString(); payload.endDate = values.dates[1]?.toISOString(); delete payload.dates; }
    if (payload.discountType === 'amount') { delete payload.maxDiscount; }
    if (editing) await api.patch(`/coupons/${editing._id}`, payload); else await api.post('/coupons', payload);
    setOpen(false); load();
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

  const columns = [
    { title: 'Mã', dataIndex: 'code' },
    { title: 'Loại', dataIndex: 'discountType', render: v => v === 'percent' ? 'Phần trăm' : 'Số tiền' },
    { 
      title: 'Giá trị', 
      dataIndex: 'discountValue',
      render: (value, record) => {
        if (record.discountType === 'percent') {
          return `${value}%`;
        }
        return formatCurrency(value);
      }
    },
        { title: 'HĐ tối thiểu', dataIndex: 'minOrder', render: formatCurrency },   
    { title: 'Giảm tối đa', dataIndex: 'maxDiscount', render: (v) => v ? formatCurrency(v) : 'không có' },                                                             
    {
      title: 'Hiệu lực',
      render: (_, r) => {
        const start = formatDate(r.startDate);
        const end = formatDate(r.endDate);
        if (start || end) {
          return `${start || '—'} → ${end || '—'}`;
        }
        return 'không giới hạn';
      }
    },
    { title: 'Sử dụng', render: (_, r) => `${r.usedCount || 0}/${r.usageLimit || '∞'}` },
    { title: 'Trạng thái', dataIndex: 'isActive', render: v => v ? 'Đang bật' : 'Tắt' },
    { title: 'Thao tác', render: (_, r) => (
      <Space>
        <Button onClick={() => onEdit(r)} size="small">Sửa</Button>
        <Button danger onClick={() => onDelete(r._id)} size="small">Xóa</Button>
      </Space>
    )}
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Quản lý mã khuyến mãi</h2>
        <Button type="primary" onClick={onAdd}>Thêm mã</Button>
      </div>
      <Table rowKey="_id" loading={loading} dataSource={items} columns={columns} />

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
                <InputNumber min={1} style={{ width: '100%' }} formatter={currencyFormatter} parser={currencyParser} addonAfter="₫"/>
              </Form.Item>
            ) : (
              <Form.Item name="discountValue" label="Giá trị (%)" rules={[{ required: true }]}>
                <InputNumber min={1} max={100} style={{ width: '100%' }} />
              </Form.Item>
            )}
          </Form.Item>
          <Form.Item name="minOrder" label="Đơn tối thiểu">
            <InputNumber min={0} style={{ width: '100%' }} formatter={currencyFormatter} parser={currencyParser} addonAfter="₫"/>
          </Form.Item>
          {/* Chỉ hiện khi là giảm theo phần trăm */}
          <Form.Item noStyle shouldUpdate={(prev, cur) => prev.discountType !== cur.discountType}>
            {({ getFieldValue }) => getFieldValue('discountType') !== 'amount' ? (
              <Form.Item name="maxDiscount" label="Giảm tối đa">
                <InputNumber min={0} style={{ width: '100%' }} formatter={currencyFormatter} parser={currencyParser} addonAfter="₫"/>
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



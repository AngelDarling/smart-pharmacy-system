import React, { useEffect, useMemo, useState } from 'react';
import { Table, Button, Space, Tag, Modal, Form, Input, message, Row, Col, Typography, Select, Avatar, Tooltip, Switch, Upload } from 'antd';
import { PlusOutlined, EditOutlined, ReloadOutlined, SearchOutlined, TagsOutlined, EyeOutlined, DeleteOutlined, GlobalOutlined, FlagOutlined, UploadOutlined } from '@ant-design/icons';
import Swal from 'sweetalert2';
import api from '../../../api/client.js';
import { getImageUrl, handleImageError } from '../../../utils/imageUtils.js';
import { uploadFile } from '../../../api/client.js';

const BrandManagement = () => {
  const [loading, setLoading] = useState(false);
  const [brands, setBrands] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [filters, setFilters] = useState({ search: '', isActive: undefined });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [form] = Form.useForm();
  const logoUrlWatch = Form.useWatch('logoUrl', form);

  const fetchBrands = async (params = {}) => {
    try {
      setLoading(true);
      const res = await api.get('/brands', { params: { page: pagination.current, limit: pagination.pageSize, ...params } });
      const data = Array.isArray(res.data.items) ? res.data.items : (Array.isArray(res.data) ? res.data : []);
      setBrands(data);
      if (res.data && typeof res.data.total === 'number') {
        setPagination(prev => ({ ...prev, total: res.data.total, current: res.data.page || prev.current, pageSize: res.data.limit || prev.pageSize }));
      }
    } catch (e) {
      message.error('Không tải được danh sách thương hiệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBrands(filters); }, []);

  const columns = useMemo(() => ([
    {
      title: 'Logo',
      dataIndex: 'logoUrl',
      key: 'logoUrl',
      width: 90,
      render: (url, record) => (
        <Avatar
          shape="square"
          size={64}
          src={getImageUrl(url, '/default-product.png')}
          alt={record.name}
          onError={(e) => handleImageError(e, '/default-product.png')}
          style={{ borderRadius: 8, border: '1px solid #f0f0f0' }}
        />
      )
    },
    { title: 'Tên thương hiệu', dataIndex: 'name', key: 'name', width: 300 },
    {
      title: 'Sản phẩm', dataIndex: 'productCount', key: 'productCount', width: 140, render: (v, record) => (
        <Button type="link" onClick={() => onOpenProductsByBrand(record)} style={{ padding: 0 }}>
          {v ?? 0}
        </Button>
      )
    },
    { title: 'Trạng thái', dataIndex: 'isActive', key: 'isActive', width: 140, render: (v) => <Tag color={v ? 'green' : 'red'}>{v ? 'Hoạt động' : 'Tạm dừng'}</Tag> },
    {
      title: 'Thao tác',
      key: 'actions',
      fixed: 'right',
      width: 120,
      render: (_, record) => (
        <Space>
          <Tooltip title="Chỉnh sửa">
            <Button icon={<EditOutlined />} size="small" onClick={() => onEdit(record)} />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button danger icon={<DeleteOutlined />} size="small" onClick={() => onDelete(record)} />
          </Tooltip>
        </Space>
      )
    }
  ]), []);

  const onCreate = () => {
    setEditing(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const onEdit = (record) => {
    setEditing(record);
    form.setFieldsValue(record);
    setIsModalOpen(true);
  };

  const onView = async (record) => {
    try {
      setLoading(true);
      const res = await api.get(`/brands/${record._id}`);
      setDetail(res.data);
      setIsDetailOpen(true);
    } catch (e) {
      message.error('Không tải được chi tiết thương hiệu');
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async (record) => {
    const result = await Swal.fire({
      title: 'Xác nhận xóa',
      text: `Bạn có chắc muốn xóa thương hiệu "${record.name}"? Thao tác không thể hoàn tác.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/brands/${record._id}`);
        Swal.fire('Đã xóa!', 'Thương hiệu đã được xóa thành công.', 'success');
        fetchBrands({ page: pagination.current, limit: pagination.pageSize, ...filters });
      } catch (e) {
        Swal.fire('Lỗi!', e?.response?.data?.message || 'Xóa thương hiệu thất bại', 'error');
      }
    }
  };

  const onSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = { ...values };
      // Normalize optional fields
      if (!payload.website) payload.website = '';
      if (!payload.logoUrl) payload.logoUrl = '';
      if (!payload.seoKeywords) payload.seoKeywords = [];
      if (editing) {
        await api.put(`/brands/${editing._id}`, payload);
        Swal.fire('Thành công!', 'Cập nhật thương hiệu thành công', 'success');
      } else {
        await api.post('/brands', payload);
        Swal.fire('Thành công!', 'Thêm thương hiệu thành công', 'success');
      }
      setIsModalOpen(false);
      setEditing(null);
      fetchBrands({ page: pagination.current, limit: pagination.pageSize, ...filters });
    } catch (e) {
      Swal.fire('Lỗi!', e?.response?.data?.message || 'Có lỗi xảy ra', 'error');
    }
  };

  const onOpenProductsByBrand = (brand) => {
    try {
      // Điều hướng sang trang sản phẩm với filter theo slug cho đẹp URL
      const params = new URLSearchParams({ brandSlug: brand.slug, search: brand.name });
      window.location.href = `/admin/products?${params.toString()}`;
    } catch { }
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
            icon={<TagsOutlined />}
            style={{
              backgroundColor: '#1890ff',
              marginRight: '16px'
            }}
          />
          <div>
            <h2 style={{ margin: 0, color: '#262626' }}>
              Quản lý Thương hiệu
            </h2>
            <div style={{ color: '#8c8c8c', fontSize: '14px' }}>
              Quản lý danh sách thương hiệu sản phẩm
            </div>
          </div>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={onCreate} size="large">
          Thêm thương hiệu
        </Button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <Input
          allowClear
          placeholder="Tìm theo tên, website, quốc gia..."
          prefix={<SearchOutlined />}
          style={{ width: 300 }}
          onPressEnter={(e) => { setFilters({ ...filters, search: e.target.value }); fetchBrands({ ...filters, search: e.target.value }); }}
        />
        <Select
          allowClear
          placeholder="Trạng thái"
          style={{ width: 150 }}
          value={filters.isActive}
          onChange={(v) => { const nf = { ...filters, isActive: v }; setFilters(nf); fetchBrands(nf); }}
        >
          <Select.Option value={true}>Hoạt động</Select.Option>
          <Select.Option value={false}>Tạm dừng</Select.Option>
        </Select>
        <Button icon={<ReloadOutlined />} onClick={() => fetchBrands(filters)} loading={loading}>Làm mới</Button>
      </div>

      {/* Table */}
      <Table
        rowKey={(r) => r._id || r.slug}
        columns={columns}
        dataSource={brands}
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showQuickJumper: true,
          pageSizeOptions: ['10', '20', '50', '100']
        }}
        onChange={(p) => {
          setPagination({ ...pagination, current: p.current, pageSize: p.pageSize });
          fetchBrands({ ...filters, page: p.current, limit: p.pageSize });
        }}
      />

      <Modal title={editing ? 'Sửa thương hiệu' : 'Thêm thương hiệu'} open={isModalOpen} onOk={onSubmit} onCancel={() => setIsModalOpen(false)} okText="Lưu" width={720}>
        <Form layout="vertical" form={form}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="Tên thương hiệu" rules={[{ required: true, message: 'Nhập tên thương hiệu' }]}>
                <Input placeholder="VD: Dược Hậu Giang" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="logoUrl" label="Logo">
                <Input.Group compact>
                  <Input style={{ width: 'calc(100% - 110px)' }} placeholder="http(s)://... hoặc /uploads/xxx.png" />
                  <Upload
                    showUploadList={false}
                    beforeUpload={() => false}
                    maxCount={1}
                    onChange={async ({ file }) => {
                      if (!file) return;
                      try {
                        const res = await uploadFile(file);
                        form.setFieldsValue({ logoUrl: res });
                        message.success('Tải logo thành công');
                      } catch (e) {
                        message.error('Tải logo thất bại');
                      }
                    }}
                  >
                    <Button icon={<UploadOutlined />}>Tải lên</Button>
                  </Upload>
                </Input.Group>
                {logoUrlWatch && (
                  <div style={{ marginTop: 8 }}>
                    <Avatar
                      shape="square"
                      size={72}
                      src={getImageUrl(logoUrlWatch, '/default-product.png')}
                      onError={(e) => handleImageError(e, '/default-product.png')}
                      style={{ borderRadius: 8, border: '1px solid #f0f0f0' }}
                    />
                  </div>
                )}
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="website" label="Website" rules={[{ type: 'url', message: 'URL không hợp lệ' }]}>
                <Input prefix={<GlobalOutlined />} placeholder="https://..." />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="country" label="Quốc gia">
                <Input prefix={<FlagOutlined />} placeholder="Việt Nam" />
              </Form.Item>
            </Col>

          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="isActive" label="Trạng thái" valuePropName="checked" initialValue={true}>
                <Switch checkedChildren="Hoạt động" unCheckedChildren="Tạm dừng" />
              </Form.Item>
            </Col>

          </Row>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} />
          </Form.Item>

        </Form>
      </Modal>

      <Modal title="Chi tiết thương hiệu" open={isDetailOpen} onCancel={() => setIsDetailOpen(false)} footer={<Button onClick={() => setIsDetailOpen(false)}>Đóng</Button>} width={800}>
        {detail && (
          <div>
            <Row gutter={16}>
              <Col span={6}>
                <Avatar shape="square" size={96} src={getImageUrl(detail.logoUrl, '/default-product.png')} onError={(e) => handleImageError(e, '/default-product.png')} />
              </Col>
              <Col span={18}>
                <Typography.Title level={4} style={{ marginTop: 0 }}>{detail.name}</Typography.Title>
                <Space wrap>
                  <Tag color={detail.isActive ? 'green' : 'red'}>{detail.isActive ? 'Hoạt động' : 'Tạm dừng'}</Tag>
                  <Tag>SP: {detail.productCount ?? 0}</Tag>
                </Space>
                <div style={{ marginTop: 8 }}>
                  {detail.website && <div><GlobalOutlined /> <a href={detail.website} target="_blank" rel="noreferrer">{detail.website}</a></div>}
                  {detail.country && <div><FlagOutlined /> {detail.country}</div>}

                </div>
              </Col>
            </Row>
            {detail.description && (
              <Card size="small" title="Mô tả" style={{ marginTop: 16 }}>
                {detail.description}
              </Card>
            )}
            <Card size="small" title="SEO" style={{ marginTop: 16 }}>
              <div>Title: {detail.seoTitle || '-'}</div>
              <div>Description: {detail.seoDescription || '-'}</div>
              <div>Keywords: {(detail.seoKeywords || []).join(', ') || '-'}</div>
            </Card>

            <Card size="small" title="Khác" style={{ marginTop: 16 }}>
              <div>Tổng doanh số: {detail.totalSales ?? 0}</div>
              <div>Ngày tạo: {detail.createdAt ? new Date(detail.createdAt).toLocaleString('vi-VN') : '-'}</div>
              <div>Ngày cập nhật: {detail.updatedAt ? new Date(detail.updatedAt).toLocaleString('vi-VN') : '-'}</div>
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default BrandManagement;



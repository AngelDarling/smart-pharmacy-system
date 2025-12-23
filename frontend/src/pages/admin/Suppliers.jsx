import React, { useEffect, useMemo, useState } from "react";
import { Table, Button, Space, Tag, Modal, Form, Input, Row, Col, message, Select, Tooltip, Switch, Statistic, TreeSelect, Avatar } from "antd";
import { PlusOutlined, ReloadOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ShopOutlined, PhoneOutlined, MailOutlined, EnvironmentOutlined } from "@ant-design/icons";
import api from "../../api/client.js";
import { usePermissions } from '../../hooks/usePermissions';

const { Option } = Select;

export default function AdminSuppliers() {
  const { permissions } = usePermissions();
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [filters, setFilters] = useState({ search: "", isActive: undefined, category: undefined });
  const [form] = Form.useForm();
  const [rootCategories, setRootCategories] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  const fetchSuppliers = async (params = {}) => {
    try {
      setLoading(true);
      const res = await api.get("/suppliers", {
        params: {
          page: params.page || pagination.current,
          limit: params.limit || pagination.pageSize,
          q: filters.search || undefined,
          isActive: filters.isActive,
          category: filters.category || undefined
        }
      });
      const data = res.data?.items || [];
      setSuppliers(data);
      setPagination({
        current: res.data?.page || params.page || 1,
        pageSize: params.limit || pagination.pageSize,
        total: res.data?.total || data.length
      });
    } catch (e) {
      message.error("Lỗi khi tải danh sách nhà cung cấp");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSuppliers(); }, []);

  // Load level-0 categories to use as Vietnamese classification options
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/categories');
        const all = Array.isArray(res.data) ? res.data : (res.data?.items || []);
        const roots = all.filter(c => c.level === 0 || !c.parent);
        setRootCategories(roots);
      } catch { }
    })();
  }, []);

  const columns = useMemo(() => ([
    {
      title: "Nhà cung cấp",
      dataIndex: "name",
      key: "name",
      width: 280,
      render: (text, r) => (
        <div>
          <div style={{ fontWeight: 600 }}>{text}</div>
          <div style={{ color: "#8c8c8c", fontSize: 12 }}>{r.companyName || "-"}</div>
        </div>
      )
    },
    {
      title: "Liên hệ", key: "contact", width: 280, render: (_, r) => (
        <div>
          <div><MailOutlined /> {r.email || "-"}</div>
          <div><PhoneOutlined /> {r.phone || "-"}</div>
          <div><EnvironmentOutlined /> {r.address || "-"}</div>
        </div>
      )
    },
    { title: "Phân loại", dataIndex: ["category", "name"], key: "category", width: 160, render: (_, r) => <Tag color="blue">{r.category?.name || "-"}</Tag> },
    { title: "Trạng thái", dataIndex: "isActive", key: "isActive", width: 140, render: (v) => <Tag color={v ? "green" : "red"}>{v ? "Hoạt động" : "Tạm dừng"}</Tag> },
    {
      title: "Thao tác",
      key: "actions",
      fixed: "right",
      width: 140,
      render: (_, record) => (
        <Space>
          {permissions.canEditSuppliers() && (
            <Tooltip title="Chỉnh sửa"><Button icon={<EditOutlined />} size="small" onClick={() => onEdit(record)} /></Tooltip>
          )}
          {permissions.canDeleteSuppliers() && (
            <Tooltip title="Xóa"><Button danger icon={<DeleteOutlined />} size="small" onClick={() => onDelete(record)} /></Tooltip>
          )}
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
    form.setFieldsValue({
      ...record,
      category: record.category?._id || record.category // Extract _id if category is populated
    });
    setIsModalOpen(true);
  };
  const onDelete = (record) => {
    Modal.confirm({
      title: "Xóa nhà cung cấp?",
      okText: "Xóa",
      okButtonProps: { danger: true },
      cancelText: "Hủy",
      onOk: async () => {
        await api.delete(`/suppliers/${record._id}`);
        message.success("Đã xóa");
        fetchSuppliers();
      }
    });
  };
  const onSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editing) {
        await api.put(`/suppliers/${editing._id}`, values);
        message.success("Cập nhật thành công");
      } else {
        await api.post("/suppliers", values);
        message.success("Thêm thành công");
      }
      setIsModalOpen(false);
      setEditing(null);
      fetchSuppliers();
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
            icon={<ShopOutlined />}
            style={{
              backgroundColor: '#13c2c2',
              marginRight: '16px'
            }}
          />
          <div>
            <h2 style={{ margin: 0, color: '#262626' }}>
              Quản lý Nhà cung cấp
            </h2>
            <div style={{ color: '#8c8c8c', fontSize: '14px' }}>
              Quản lý thông tin và liên hệ nhà cung cấp
            </div>
          </div>
        </div>
        <Space>
          <Tooltip title="Làm mới">
            <Button icon={<ReloadOutlined />} onClick={() => fetchSuppliers()} loading={loading} shape="circle" size="large" />
          </Tooltip>
          {permissions.canCreateSuppliers() && (
            <Button type="primary" icon={<PlusOutlined />} onClick={onCreate} size="large">
              Thêm nhà cung cấp
            </Button>
          )}
        </Space>
      </div>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={12}>
          <Input allowClear placeholder="Tìm theo tên, email, SĐT, địa chỉ..." prefix={<SearchOutlined />} onPressEnter={(e) => { setFilters({ ...filters, search: e.target.value }); fetchSuppliers(); }} />
        </Col>
        <Col span={12}>
          <Row gutter={16}>
            <Col span={12}>
              <div style={{ textAlign: 'center', padding: 12, background: '#f9fafb', borderRadius: 4 }}>
                <Statistic title="Tổng NCC" value={pagination.total || suppliers.length} />
              </div>
            </Col>
            <Col span={12}>
              <div style={{ textAlign: 'center', padding: 12, background: '#f9fafb', borderRadius: 4 }}>
                <Statistic title="Đang hoạt động" value={suppliers.filter(s => s.isActive).length} />
              </div>
            </Col>
          </Row>
        </Col>
      </Row>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'end' }}>
        <Select
          allowClear
          placeholder="Trạng thái"
          style={{ width: 150 }}
          value={filters.isActive}
          onChange={(v) => { setFilters({ ...filters, isActive: v }); fetchSuppliers(); }}
        >
          <Option value={true}>Hoạt động</Option>
          <Option value={false}>Tạm dừng</Option>
        </Select>
        <Select
          allowClear
          placeholder="Phân loại"
          style={{ width: 200 }}
          value={filters.category}
          onChange={(v) => { setFilters({ ...filters, category: v }); fetchSuppliers(); }}
        >
          {rootCategories.map(c => (
            <Option key={c._id} value={c._id}>{c.name}</Option>
          ))}
        </Select>
      </div>

      <Table
        rowKey={(r) => r._id}
        columns={columns}
        dataSource={suppliers}
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100'],
          showTotal: (total) => `Tổng ${total} nhà cung cấp`
        }}
        onChange={(p) => fetchSuppliers({ page: p.current, limit: p.pageSize })}
      />

      <Modal title={editing ? 'Sửa nhà cung cấp' : 'Thêm nhà cung cấp'} open={isModalOpen} onOk={onSubmit} onCancel={() => setIsModalOpen(false)} okText="Lưu" width={720}>
        <Form layout="vertical" form={form}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="Tên nhà cung cấp" rules={[{ required: true, message: 'Nhập tên nhà cung cấp' }]}>
                <Input prefix={<ShopOutlined />} />
              </Form.Item>
            </Col>

          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="email" label="Email" rules={[{ type: 'email', message: 'Email không hợp lệ' }]}>
                <Input prefix={<MailOutlined />} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="phone" label="Số điện thoại">
                <Input prefix={<PhoneOutlined />} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="address" label="Địa chỉ">
            <Input prefix={<EnvironmentOutlined />} />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="category" label="Phân loại (danh mục cấp 0)">
                <Select allowClear placeholder="Chọn phân loại">
                  {rootCategories.map(c => (
                    <Option key={c._id} value={c._id}>{c.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="isActive" label="Trạng thái" valuePropName="checked" initialValue={true}>
                <Switch />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}



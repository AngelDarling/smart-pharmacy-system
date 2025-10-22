import React, { useEffect, useMemo, useState } from "react";
import { Card, Table, Button, Space, Tag, Modal, Form, Input, Row, Col, Typography, message, Select, Tooltip, Switch, Statistic, TreeSelect } from "antd";
import { PlusOutlined, ReloadOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ShopOutlined, PhoneOutlined, MailOutlined, EnvironmentOutlined } from "@ant-design/icons";
import api from "../../api/client.js";

const { Title } = Typography;
const { Option } = Select;

export default function AdminSuppliers() {
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [filters, setFilters] = useState({ search: "", isActive: undefined, category: undefined });
  const [form] = Form.useForm();
  const [rootCategories, setRootCategories] = useState([]);

  const fetchSuppliers = async (params = {}) => {
    try {
      setLoading(true);
      const res = await api.get("/suppliers", { params: {
        page: params.page || 1,
        limit: params.limit || 10,
        q: filters.search || undefined,
        isActive: filters.isActive,
        category: filters.category || undefined
      } });
      const data = res.data?.items || [];
      setSuppliers(data);
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
      } catch {}
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
    { title: "Liên hệ", key: "contact", width: 280, render: (_, r) => (
      <div>
        <div><MailOutlined /> {r.email || "-"}</div>
        <div><PhoneOutlined /> {r.phone || "-"}</div>
        <div><EnvironmentOutlined /> {r.address || "-"}</div>
      </div>
    ) },
    { title: "Phân loại", dataIndex: ["category", "name"], key: "category", width: 160, render: (_, r) => <Tag color="blue">{r.category?.name || "-"}</Tag> },
    { title: "Trạng thái", dataIndex: "isActive", key: "isActive", width: 140, render: (v) => <Tag color={v ? "green" : "red"}>{v ? "Hoạt động" : "Tạm dừng"}</Tag> },
    {
      title: "Thao tác",
      key: "actions",
      fixed: "right",
      width: 140,
      render: (_, record) => (
        <Space>
          <Tooltip title="Chỉnh sửa"><Button icon={<EditOutlined />} size="small" onClick={() => onEdit(record)} /></Tooltip>
          <Tooltip title="Xóa"><Button danger icon={<DeleteOutlined />} size="small" onClick={() => onDelete(record)} /></Tooltip>
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
    } catch {}
  };

  return (
    <div style={{ padding: 24, background: "#f5f5f5", minHeight: "100vh" }}>
      <Card style={{ borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", border: "none" }} styles={{ body: { padding: 24 } }}>
        <div style={{ marginBottom: 24, paddingBottom: 16, borderBottom: "1px solid #f0f0f0" }}>
          <Row justify="space-between" align="middle">
            <Col>
              <div style={{ display: "flex", alignItems: "center" }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, background: "#1890ff", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", marginRight: 16 }}>
                  <ShopOutlined />
                </div>
                <div>
                  <Title level={2} style={{ margin: 0 }}>Quản lý Nhà cung cấp</Title>
                  <div style={{ color: "#8c8c8c" }}>Quản lý danh sách nhà cung cấp và thông tin liên hệ</div>
                </div>
              </div>
            </Col>
            <Col>
              <Space>
                <Tooltip title="Làm mới"><Button icon={<ReloadOutlined />} onClick={() => fetchSuppliers()} loading={loading} shape="circle" size="large" /></Tooltip>
                <Button type="primary" icon={<PlusOutlined />} onClick={onCreate} size="large" style={{ borderRadius: 8, height: 40, paddingLeft: 20, paddingRight: 20, fontWeight: 500 }}>Thêm nhà cung cấp</Button>
              </Space>
            </Col>
          </Row>
        </div>

        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={12}>
            <Input size="large" allowClear placeholder="Tìm theo tên, email, SĐT, địa chỉ..." prefix={<SearchOutlined style={{ color: '#8c8c8c' }} />} onPressEnter={(e) => { setFilters({ ...filters, search: e.target.value }); fetchSuppliers(); }} />
          </Col>
          <Col span={12}>
            <Row gutter={16}>
              <Col span={8}>
                <Card size="small" style={{ textAlign: 'center' }}>
                  <Statistic title="Tổng NCC" value={suppliers.length} />
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small" style={{ textAlign: 'center' }}>
                  <Statistic title="Đang hoạt động" value={suppliers.filter(s => s.isActive).length} />
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small" style={{ textAlign: 'center' }}>
                  <Statistic title="Ưu tiên" value={suppliers.filter(s => s.isPreferred).length} />
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>

        <Card size="small" style={{ marginBottom: 24, background: '#fafafa', border: '1px solid #f0f0f0' }}>
          <Row gutter={16} align="middle">
            <Col span={6}>
              <Form.Item label="Trạng thái" style={{ marginBottom: 8 }}>
                <Select allowClear placeholder="Chọn trạng thái" size="large" value={filters.isActive} onChange={(v) => { setFilters({ ...filters, isActive: v }); fetchSuppliers(); }}>
                  <Option value={true}>Hoạt động</Option>
                  <Option value={false}>Tạm dừng</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="Phân loại" style={{ marginBottom: 8 }}>
                <Select allowClear placeholder="Chọn phân loại" size="large" value={filters.category} onChange={(v) => { setFilters({ ...filters, category: v }); fetchSuppliers(); }}>
                  {rootCategories.map(c => (
                    <Option key={c._id} value={c._id}>{c.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Card style={{ borderRadius: 8, border: '1px solid #f0f0f0', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }} styles={{ body: { padding: 0 } }}>
          <Table rowKey={(r) => r._id} columns={columns} dataSource={suppliers} loading={loading} pagination={{ pageSize: 10, showSizeChanger: true, pageSizeOptions: ['10', '20', '50', '100'] }} onChange={(p) => fetchSuppliers({ page: p.current, limit: p.pageSize })} />
        </Card>
      </Card>

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



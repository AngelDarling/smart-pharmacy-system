import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Select, Space, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../../api/client.js';

const { Option } = Select;
const { TextArea } = Input;

export default function ResultManagement() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingResult, setEditingResult] = useState(null);
  const [healthCheckName, setHealthCheckName] = useState('');

  useEffect(() => {
    loadHealthCheck();
    loadResults();
  }, [id]);

  async function loadHealthCheck() {
    try {
      const res = await api.get(`/admin/health-checks/${id}`);
      setHealthCheckName(res.data.item?.name || '');
    } catch (e) {
      console.error('Error loading health check:', e);
    }
  }

  async function loadResults() {
    setLoading(true);
    try {
      const res = await api.get(`/admin/health-check-results?healthCheckId=${id}`);
      setResults(res.data.items || []);
    } catch (e) {
      message.error('Không tải được danh sách kết quả');
    } finally {
      setLoading(false);
    }
  }

  function onAdd() {
    setEditingResult(null);
    setOpen(true);
    form.resetFields();
    form.setFieldsValue({
      healthCheckId: id,
      severity: 'low',
      minScore: 0,
      maxScore: 100,
    });
  }

  function onEdit(result) {
    setEditingResult(result);
    setOpen(true);
    // Convert recommendations array to string for textarea
    const formValues = {
      ...result,
      healthCheckId: id,
      recommendations: Array.isArray(result.recommendations) 
        ? result.recommendations.join('\n') 
        : result.recommendations || '',
    };
    form.setFieldsValue(formValues);
  }

  async function onDelete(resultId) {
    try {
      await api.delete(`/admin/health-check-results/${resultId}`);
      message.success('Đã xóa kết quả');
      loadResults();
    } catch (e) {
      message.error('Không thể xóa kết quả');
    }
  }

  async function onSubmit() {
    try {
      const values = await form.validateFields();
      if (editingResult) {
        await api.put(`/admin/health-check-results/${editingResult._id}`, values);
        message.success('Đã cập nhật kết quả');
      } else {
        await api.post('/admin/health-check-results', values);
        message.success('Đã tạo kết quả mới');
      }
      setOpen(false);
      loadResults();
    } catch (e) {
      message.error('Không thể lưu kết quả');
    }
  }

  const columns = [
    {
      title: 'Điểm tối thiểu',
      dataIndex: 'minScore',
      key: 'minScore',
    },
    {
      title: 'Điểm tối đa',
      dataIndex: 'maxScore',
      key: 'maxScore',
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: 'Mức độ',
      dataIndex: 'severity',
      key: 'severity',
      render: (severity) => {
        const colors = {
          low: 'green',
          medium: 'orange',
          high: 'red',
        };
        const labels = {
          low: 'Thấp',
          medium: 'Trung bình',
          high: 'Cao',
        };
        return <span style={{ color: colors[severity] || 'gray' }}>{labels[severity] || severity}</span>;
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => onEdit(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xóa kết quả?"
            onConfirm={() => onDelete(record._id)}
          >
            <Button danger icon={<DeleteOutlined />} size="small">
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button onClick={() => navigate('/admin/health-checks')}>
          ← Quay lại
        </Button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>
          Quản lý kết quả: {healthCheckName}
        </h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={onAdd}
        >
          Thêm kết quả
        </Button>
      </div>

      <Table
        rowKey="_id"
        loading={loading}
        dataSource={results}
        columns={columns}
        pagination={{ pageSize: 10 }}
        expandable={{
          expandedRowRender: (record) => (
            <div style={{ padding: '16px', background: '#f5f5f5', borderRadius: 4 }}>
              <div style={{ marginBottom: 12 }}>
                <strong>Mô tả:</strong>
                <p style={{ marginTop: 4, marginBottom: 0 }}>{record.description || '—'}</p>
              </div>
              <div>
                <strong>Khuyến nghị:</strong>
                <div style={{ marginTop: 4, marginBottom: 0 }}>
                  {Array.isArray(record.recommendations) && record.recommendations.length > 0 ? (
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                      {record.recommendations.map((rec, idx) => (
                        <li key={idx}>{rec}</li>
                      ))}
                    </ul>
                  ) : (
                    <span>—</span>
                  )}
                </div>
              </div>
            </div>
          ),
        }}
      />

      <Modal
        open={open}
        onCancel={() => {
          setOpen(false);
          setEditingResult(null);
        }}
        onOk={onSubmit}
        okText={editingResult ? 'Cập nhật' : 'Tạo mới'}
        title={editingResult ? 'Sửa kết quả' : 'Thêm kết quả'}
        width={700}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="healthCheckId" hidden>
            <Input />
          </Form.Item>
          <Form.Item
            name="minScore"
            label="Điểm tối thiểu"
            rules={[{ required: true, message: 'Vui lòng nhập điểm tối thiểu' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="maxScore"
            label="Điểm tối đa"
            rules={[{ required: true, message: 'Vui lòng nhập điểm tối đa' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="title"
            label="Tiêu đề kết quả"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
          >
            <Input placeholder="VD: Kết quả tốt" />
          </Form.Item>
          <Form.Item
            name="description"
            label="Mô tả"
          >
            <TextArea rows={3} placeholder="Mô tả chi tiết về kết quả" />
          </Form.Item>
          <Form.Item
            name="recommendations"
            label="Khuyến nghị (mỗi dòng là một khuyến nghị)"
          >
            <TextArea rows={4} placeholder="Mỗi dòng là một khuyến nghị riêng biệt" />
          </Form.Item>
          <Form.Item
            name="severity"
            label="Mức độ"
            rules={[{ required: true }]}
          >
            <Select>
              <Option value="low">Thấp</Option>
              <Option value="medium">Trung bình</Option>
              <Option value="high">Cao</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}


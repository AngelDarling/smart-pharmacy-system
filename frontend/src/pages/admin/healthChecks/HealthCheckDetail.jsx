import React, { useEffect, useState } from 'react';
import { Form, Input, Switch, Button, message, InputNumber, Space } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../../api/client.js';

export default function HealthCheckDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id && id !== 'new') {
      loadHealthCheck();
    }
  }, [id]);

  async function loadHealthCheck() {
    setLoading(true);
    try {
      const res = await api.get(`/admin/health-checks/${id}`);
      const item = res.data.item;
      form.setFieldsValue({
        name: item.name,
        slug: item.slug,
        description: item.description,
        shortDescription: item.shortDescription,
        iconUrl: item.iconUrl,
        isActive: item.isActive !== false,
        sortOrder: item.sortOrder || 0,
      });
    } catch (e) {
      message.error('Không tải được thông tin bài kiểm tra');
      navigate('/admin/health-checks');
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit() {
    try {
      const values = await form.validateFields();
      setSaving(true);

      if (id === 'new') {
        await api.post('/admin/health-checks', values);
        message.success('Đã tạo bài kiểm tra mới');
      } else {
        await api.put(`/admin/health-checks/${id}`, values);
        message.success('Đã cập nhật bài kiểm tra');
      }

      navigate('/admin/health-checks');
    } catch (e) {
      console.error('Error saving health check:', e);
      message.error(e.response?.data?.message || 'Không thể lưu bài kiểm tra');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button onClick={() => navigate('/admin/health-checks')}>
          ← Quay lại
        </Button>
      </div>

      <h2 style={{ marginBottom: 24 }}>
        {id === 'new' ? 'Thêm bài kiểm tra mới' : 'Sửa bài kiểm tra'}
      </h2>

      <Form
        form={form}
        layout="vertical"
        onFinish={onSubmit}
        loading={loading}
      >
        <Form.Item
          name="name"
          label="Tên bài kiểm tra"
          rules={[{ required: true, message: 'Vui lòng nhập tên bài kiểm tra' }]}
        >
          <Input placeholder="VD: Kiểm tra trí nhớ" />
        </Form.Item>

        <Form.Item
          name="slug"
          label="Slug (URL)"
          rules={[{ required: true, message: 'Vui lòng nhập slug' }]}
        >
          <Input placeholder="VD: kiem-tra-tri-nho" />
        </Form.Item>

        <Form.Item
          name="shortDescription"
          label="Mô tả ngắn"
        >
          <Input.TextArea
            rows={2}
            placeholder="Mô tả ngắn gọn về bài kiểm tra"
          />
        </Form.Item>

        <Form.Item
          name="description"
          label="Mô tả chi tiết"
        >
          <Input.TextArea
            rows={4}
            placeholder="Mô tả chi tiết về bài kiểm tra"
          />
        </Form.Item>

        <Form.Item
          name="iconUrl"
          label="URL icon"
        >
          <Input placeholder="URL của icon (tùy chọn)" />
        </Form.Item>

        <Form.Item
          name="sortOrder"
          label="Thứ tự hiển thị"
          initialValue={0}
        >
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="isActive"
          label="Kích hoạt"
          valuePropName="checked"
          initialValue={true}
        >
          <Switch />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={saving}>
              {id === 'new' ? 'Tạo mới' : 'Cập nhật'}
            </Button>
            <Button onClick={() => navigate('/admin/health-checks')}>
              Hủy
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
}


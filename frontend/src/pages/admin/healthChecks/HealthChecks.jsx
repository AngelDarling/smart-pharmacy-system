import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Space, message, Tag, Avatar } from 'antd';
import { EditOutlined, DeleteOutlined, QuestionCircleOutlined, FileTextOutlined, PlusOutlined, HeartOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../../api/client.js';

export default function HealthChecks() {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const navigate = useNavigate();

  async function load() {
    setLoading(true);
    try {
      const res = await api.get('/admin/health-checks');
      setItems(res.data.items || []);
    } catch (e) {
      console.error('Error loading health checks:', e);
      message.error('Không tải được danh sách bài kiểm tra');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onDelete(id) {
    Modal.confirm({
      title: 'Xóa bài kiểm tra?',
      content: 'Thao tác này sẽ xóa tất cả câu hỏi và kết quả liên quan. Bạn có chắc chắn?',
      onOk: async () => {
        try {
          await api.delete(`/admin/health-checks/${id}`);
          message.success('Đã xóa bài kiểm tra');
          load();
        } catch (e) {
          message.error('Không thể xóa bài kiểm tra');
        }
      }
    });
  }

  const columns = [
    {
      title: 'Tên bài kiểm tra',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
    },
    {
      title: 'Mô tả ngắn',
      dataIndex: 'shortDescription',
      key: 'shortDescription',
      ellipsis: true,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Hoạt động' : 'Tắt'}
        </Tag>
      ),
    },
    {
      title: 'Thứ tự',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space wrap>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => navigate(`/admin/health-checks/${record._id}`)}
          >
            Sửa
          </Button>
          <Button
            icon={<QuestionCircleOutlined />}
            size="small"
            onClick={() => navigate(`/admin/health-checks/${record._id}/questions`)}
          >
            Câu hỏi
          </Button>
          <Button
            icon={<FileTextOutlined />}
            size="small"
            onClick={() => navigate(`/admin/health-checks/${record._id}/results`)}
          >
            Kết quả
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            size="small"
            onClick={() => onDelete(record._id)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
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
            icon={<HeartOutlined />}
            style={{
              backgroundColor: '#eb2f96',
              marginRight: '16px'
            }}
          />
          <div>
            <h2 style={{ margin: 0, color: '#262626' }}>
              Quản lý bài kiểm tra sức khỏe
            </h2>
            <div style={{ color: '#8c8c8c', fontSize: '14px' }}>
              Quản lý các bài kiểm tra và đánh giá sức khỏe
            </div>
          </div>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/admin/health-checks/new')}
          size="large"
        >
          Thêm bài kiểm tra
        </Button>
      </div>
      <Table
        rowKey="_id"
        loading={loading}
        dataSource={items}
        columns={columns}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
}


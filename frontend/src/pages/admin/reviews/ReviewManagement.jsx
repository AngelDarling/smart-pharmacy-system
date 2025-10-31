import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Input,
  Select,
  Tag,
  Avatar,
  Popconfirm,
  Modal,
  Form,
  Input as AntInput,
  Typography,
  Rate
} from 'antd';
import {
  DeleteOutlined,
  ReloadOutlined,
  MessageOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  EyeOutlined
} from '@ant-design/icons';
import api from '../../../api/client';
import Swal from 'sweetalert2';
import dayjs from 'dayjs';

const { Search } = Input;
const { TextArea } = AntInput;
const { Text } = Typography;
const { Option } = Select;

const ReviewManagement = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0
  });
  const [filters, setFilters] = useState({
    status: '',
    rating: '',
    q: ''
  });
  const [replyModalVisible, setReplyModalVisible] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [replyForm] = Form.useForm();

  // Fetch reviews
  const fetchReviews = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.pageSize.toString()
      });
      
      if (filters.status) params.append('status', filters.status);
      if (filters.rating) params.append('rating', filters.rating);
      if (filters.q) params.append('q', filters.q);

      const res = await api.get(`/reviews/admin?${params.toString()}`);
      setReviews(res.data.items || []);
      setPagination({
        ...pagination,
        current: res.data.page || 1,
        total: res.data.total || 0
      });
    } catch (err) {
      console.error('Error fetching reviews:', err);
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: err.response?.data?.message || 'Không thể tải danh sách đánh giá'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews(1);
  }, [filters.status, filters.rating]);

  // Handle table change (pagination)
  const handleTableChange = (newPagination) => {
    fetchReviews(newPagination.current);
  };

  // Handle reply
  const handleReply = (review) => {
    setSelectedReview(review);
    replyForm.setFieldsValue({
      adminReply: review.adminReply || ''
    });
    setReplyModalVisible(true);
  };

  // Submit reply
  const handleSubmitReply = async () => {
    try {
      const values = await replyForm.validateFields();
      await api.put(`/reviews/admin/${selectedReview._id}`, {
        adminReply: values.adminReply
      });
      
      Swal.fire({
        icon: 'success',
        title: 'Thành công',
        text: 'Đã phản hồi đánh giá thành công'
      });
      
      setReplyModalVisible(false);
      replyForm.resetFields();
      fetchReviews(pagination.current);
    } catch (err) {
      if (err.errorFields) return; // Form validation error
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: err.response?.data?.message || 'Không thể phản hồi đánh giá'
      });
    }
  };

  // Handle delete
  const handleDelete = async (reviewId) => {
    try {
      await api.delete(`/reviews/admin/${reviewId}`);
      Swal.fire({
        icon: 'success',
        title: 'Thành công',
        text: 'Đã xóa đánh giá thành công'
      });
      fetchReviews(pagination.current);
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: err.response?.data?.message || 'Không thể xóa đánh giá'
      });
    }
  };

  // Handle status change
  const handleStatusChange = async (reviewId, newStatus) => {
    try {
      await api.put(`/reviews/admin/${reviewId}`, { status: newStatus });
      Swal.fire({
        icon: 'success',
        title: 'Thành công',
        text: 'Đã cập nhật trạng thái đánh giá'
      });
      fetchReviews(pagination.current);
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: err.response?.data?.message || 'Không thể cập nhật trạng thái'
      });
    }
  };

  // Get status tag
  const getStatusTag = (status) => {
    const statusMap = {
      pending: { color: 'orange', icon: <ClockCircleOutlined />, text: 'Chờ duyệt' },
      approved: { color: 'green', icon: <CheckCircleOutlined />, text: 'Đã duyệt' },
      rejected: { color: 'red', icon: <CloseCircleOutlined />, text: 'Từ chối' }
    };
    const statusInfo = statusMap[status] || statusMap.pending;
    return (
      <Tag color={statusInfo.color} icon={statusInfo.icon}>
        {statusInfo.text}
      </Tag>
    );
  };

  // Get reviewer name
  const getReviewerName = (review) => {
    if (review.userId) {
      return review.userId.fullName || review.userId.name || 'Người dùng';
    }
    return review.guestName || 'Khách';
  };

  // Get reviewer info
  const getReviewerInfo = (review) => {
    if (review.userId) {
      return review.userId.email || '';
    }
    return review.guestEmail || review.guestPhone || '';
  };

  // Columns
  const columns = [
    {
      title: 'Sản phẩm',
      key: 'product',
      width: 200,
      render: (_, record) => {
        const product = record.productId;
        if (!product) return '-';
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {product.imageUrls?.[0] && (
              <Avatar
                src={product.imageUrls[0]}
                shape="square"
                size={40}
              />
            )}
            <div>
              <div style={{ fontWeight: 500 }}>{product.name}</div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>
                {product.slug}
              </div>
            </div>
          </div>
        );
      }
    },
    {
      title: 'Người đánh giá',
      key: 'reviewer',
      width: 150,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{getReviewerName(record)}</div>
          <div style={{ fontSize: 12, color: '#6b7280' }}>
            {getReviewerInfo(record)}
          </div>
        </div>
      )
    },
    {
      title: 'Đánh giá',
      key: 'rating',
      width: 120,
      render: (_, record) => (
        <div>
          <Rate disabled value={record.rating} style={{ fontSize: 14 }} />
          <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
            {record.rating}/5
          </div>
        </div>
      )
    },
    {
      title: 'Nội dung',
      key: 'comment',
      ellipsis: true,
      render: (_, record) => (
        <div style={{ maxWidth: 300 }}>
          <div style={{ marginBottom: 4 }}>{record.comment}</div>
          {record.adminReply && (
            <div style={{
              marginTop: 8,
              padding: 8,
              background: '#f0f9ff',
              borderRadius: 4,
              borderLeft: '3px solid #3b82f6'
            }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#3b82f6', marginBottom: 4 }}>
                Phản hồi của admin:
              </div>
              <div style={{ fontSize: 13 }}>{record.adminReply}</div>
              {record.adminReplyAt && (
                <div style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>
                  {dayjs(record.adminReplyAt).format('DD/MM/YYYY HH:mm')}
                </div>
              )}
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 120,
      render: (_, record) => getStatusTag(record.status)
    },
    {
      title: 'Ngày tạo',
      key: 'createdAt',
      width: 150,
      render: (_, record) => dayjs(record.createdAt).format('DD/MM/YYYY HH:mm')
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<MessageOutlined />}
            onClick={() => handleReply(record)}
          >
            Phản hồi
          </Button>
          {record.status !== 'approved' && (
            <Button
              type="link"
              icon={<CheckCircleOutlined />}
              onClick={() => handleStatusChange(record._id, 'approved')}
            >
              Duyệt
            </Button>
          )}
          {record.status !== 'rejected' && (
            <Button
              type="link"
              danger
              icon={<CloseCircleOutlined />}
              onClick={() => handleStatusChange(record._id, 'rejected')}
            >
              Từ chối
            </Button>
          )}
          <Popconfirm
            title="Xóa đánh giá này?"
            onConfirm={() => handleDelete(record._id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
            >
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Quản lý đánh giá</h2>
      </div>
      
      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <Select
          placeholder="Trạng thái"
          allowClear
          style={{ width: 150 }}
          value={filters.status || undefined}
          onChange={(value) => setFilters({ ...filters, status: value || '' })}
        >
          <Option value="pending">Chờ duyệt</Option>
          <Option value="approved">Đã duyệt</Option>
          <Option value="rejected">Từ chối</Option>
        </Select>
        <Select
          placeholder="Số sao"
          allowClear
          style={{ width: 120 }}
          value={filters.rating || undefined}
          onChange={(value) => setFilters({ ...filters, rating: value || '' })}
        >
          <Option value="5">5 sao</Option>
          <Option value="4">4 sao</Option>
          <Option value="3">3 sao</Option>
          <Option value="2">2 sao</Option>
          <Option value="1">1 sao</Option>
        </Select>
        <Search
          placeholder="Tìm kiếm theo nội dung, tên, email..."
          allowClear
          onSearch={(value) => {
            setFilters({ ...filters, q: value });
            fetchReviews(1);
          }}
          style={{ width: 300 }}
        />
        <Button
          icon={<ReloadOutlined />}
          onClick={() => {
            setFilters({ status: '', rating: '', q: '' });
            fetchReviews(1);
          }}
        >
          Làm mới
        </Button>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={reviews}
        rowKey="_id"
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
        scroll={{ x: 1500 }}
      />

      {/* Reply Modal */}
      <Modal
        title="Phản hồi đánh giá"
        open={replyModalVisible}
        onOk={handleSubmitReply}
        onCancel={() => {
          setReplyModalVisible(false);
          replyForm.resetFields();
        }}
        okText="Gửi phản hồi"
        cancelText="Hủy"
        width={600}
      >
        {selectedReview && (
          <div style={{ marginBottom: 16 }}>
            <Text strong>Đánh giá từ:</Text> {getReviewerName(selectedReview)}
            <br />
            <Text strong>Sản phẩm:</Text> {selectedReview.productId?.name || '-'}
            <br />
            <Text strong>Nội dung:</Text>
            <div style={{ marginTop: 8, padding: 12, background: '#f9fafb', borderRadius: 4 }}>
              {selectedReview.comment}
            </div>
          </div>
        )}
        <Form form={replyForm} layout="vertical">
          <Form.Item
            name="adminReply"
            label="Phản hồi của admin"
            rules={[
              { required: true, message: 'Vui lòng nhập phản hồi' },
              { max: 2000, message: 'Phản hồi không được quá 2000 ký tự' }
            ]}
          >
            <TextArea
              rows={6}
              placeholder="Nhập phản hồi của bạn..."
              showCount
              maxLength={2000}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ReviewManagement;


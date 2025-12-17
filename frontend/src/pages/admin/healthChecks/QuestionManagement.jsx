import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, InputNumber, Space, message, Popconfirm, Switch, Avatar } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, OrderedListOutlined, HeartOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../../api/client.js';

const { Option } = Select;
const { TextArea } = Input;

export default function QuestionManagement() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [answerOptionForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [answerOptionModalOpen, setAnswerOptionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [editingAnswerOption, setEditingAnswerOption] = useState(null);
  const [currentQuestionId, setCurrentQuestionId] = useState(null);
  const [healthCheckName, setHealthCheckName] = useState('');

  useEffect(() => {
    loadHealthCheck();
    loadQuestions();
  }, [id]);

  async function loadHealthCheck() {
    try {
      const res = await api.get(`/admin/health-checks/${id}`);
      setHealthCheckName(res.data.item?.name || '');
    } catch (e) {
      console.error('Error loading health check:', e);
    }
  }

  async function loadQuestions() {
    setLoading(true);
    try {
      const res = await api.get(`/admin/questions?healthCheckId=${id}`);
      setQuestions(res.data.items || []);
    } catch (e) {
      message.error('Không tải được danh sách câu hỏi');
    } finally {
      setLoading(false);
    }
  }

  function onAddQuestion() {
    setEditingQuestion(null);
    setOpen(true);
    form.resetFields();
    form.setFieldsValue({
      healthCheckId: id,
      questionType: 'single-choice',
      order: questions.length + 1,
      isRequired: true,
    });
  }

  function onEditQuestion(question) {
    setEditingQuestion(question);
    setOpen(true);
    form.setFieldsValue({
      ...question,
      healthCheckId: id,
    });
  }

  async function onDeleteQuestion(questionId) {
    try {
      await api.delete(`/admin/questions/${questionId}`);
      message.success('Đã xóa câu hỏi');
      loadQuestions();
    } catch (e) {
      message.error('Không thể xóa câu hỏi');
    }
  }

  async function onSubmitQuestion() {
    try {
      const values = await form.validateFields();
      if (editingQuestion) {
        await api.put(`/admin/questions/${editingQuestion._id}`, values);
        message.success('Đã cập nhật câu hỏi');
      } else {
        await api.post('/admin/questions', values);
        message.success('Đã tạo câu hỏi mới');
      }
      setOpen(false);
      loadQuestions();
    } catch (e) {
      message.error('Không thể lưu câu hỏi');
    }
  }

  function onAddAnswerOption(questionId) {
    setEditingAnswerOption(null);
    setCurrentQuestionId(questionId);
    setAnswerOptionModalOpen(true);
    answerOptionForm.resetFields();
    const question = questions.find(q => q._id === questionId);
    const maxOrder = question?.options?.length || 0;
    answerOptionForm.setFieldsValue({
      questionId: questionId,
      order: maxOrder + 1,
      scoreValue: 0,
    });
  }

  function onEditAnswerOption(option, questionId) {
    setEditingAnswerOption(option);
    setCurrentQuestionId(questionId);
    setAnswerOptionModalOpen(true);
    answerOptionForm.setFieldsValue({
      ...option,
      questionId: questionId,
    });
  }

  async function onDeleteAnswerOption(optionId) {
    try {
      await api.delete(`/admin/answer-options/${optionId}`);
      message.success('Đã xóa phương án trả lời');
      loadQuestions();
    } catch (e) {
      message.error('Không thể xóa phương án trả lời');
    }
  }

  async function onSubmitAnswerOption() {
    try {
      const values = await answerOptionForm.validateFields();
      if (editingAnswerOption) {
        await api.put(`/admin/answer-options/${editingAnswerOption._id}`, values);
        message.success('Đã cập nhật phương án trả lời');
      } else {
        await api.post('/admin/answer-options', values);
        message.success('Đã tạo phương án trả lời mới');
      }
      setAnswerOptionModalOpen(false);
      loadQuestions();
    } catch (e) {
      message.error('Không thể lưu phương án trả lời');
    }
  }

  const questionColumns = [
    {
      title: 'Thứ tự',
      dataIndex: 'order',
      key: 'order',
      width: 80,
    },
    {
      title: 'Câu hỏi',
      dataIndex: 'questionText',
      key: 'questionText',
      ellipsis: true,
    },
    {
      title: 'Loại',
      dataIndex: 'questionType',
      key: 'questionType',
      render: (type) => {
        const types = {
          'single-choice': 'Chọn 1',
          'multi-choice': 'Chọn nhiều',
          'text': 'Văn bản',
          'number': 'Số',
        };
        return types[type] || type;
      },
    },
    {
      title: 'Bắt buộc',
      dataIndex: 'isRequired',
      key: 'isRequired',
      render: (required) => (required ? 'Có' : 'Không'),
    },
    {
      title: 'Số phương án',
      key: 'optionsCount',
      render: (_, record) => record.options?.length || 0,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space wrap>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => onEditQuestion(record)}
          >
            Sửa
          </Button>
          <Button
            icon={<OrderedListOutlined />}
            size="small"
            onClick={() => onAddAnswerOption(record._id)}
          >
            Thêm phương án
          </Button>
          <Popconfirm
            title="Xóa câu hỏi?"
            onConfirm={() => onDeleteQuestion(record._id)}
          >
            <Button danger icon={<DeleteOutlined />} size="small">
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const expandedRowRender = (question) => {
    const options = question.options || [];
    const optionColumns = [
      {
        title: 'Thứ tự',
        dataIndex: 'order',
        key: 'order',
        width: 80,
      },
      {
        title: 'Phương án',
        dataIndex: 'optionText',
        key: 'optionText',
      },
      {
        title: 'Điểm',
        dataIndex: 'scoreValue',
        key: 'scoreValue',
      },
      {
        title: 'Thao tác',
        key: 'actions',
        render: (_, option) => (
          <Space wrap>
            <Button
              size="small"
              onClick={() => onEditAnswerOption(option, question._id)}
            >
              Sửa
            </Button>
            <Popconfirm
              title="Xóa phương án trả lời?"
              onConfirm={() => onDeleteAnswerOption(option._id)}
            >
              <Button danger size="small">
                Xóa
              </Button>
            </Popconfirm>
          </Space>
        ),
      },
    ];

    return (
      <Table
        columns={optionColumns}
        dataSource={options}
        rowKey="_id"
        pagination={false}
        size="small"
      />
    );
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button onClick={() => navigate('/admin/health-checks')}>
          ← Quay lại
        </Button>
      </div>

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
              Quản lý câu hỏi: {healthCheckName}
            </h2>
            <div style={{ color: '#8c8c8c', fontSize: '14px' }}>
              Quản lý câu hỏi và phương án trả lời
            </div>
          </div>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={onAddQuestion}
          size="large"
        >
          Thêm câu hỏi
        </Button>
      </div>

      <Table
        rowKey="_id"
        loading={loading}
        dataSource={questions}
        columns={questionColumns}
        expandable={{
          expandedRowRender,
          rowExpandable: (record) => (record.options?.length || 0) > 0,
        }}
        pagination={{ pageSize: 10 }}
      />

      {/* Question Modal */}
      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        onOk={onSubmitQuestion}
        okText={editingQuestion ? 'Cập nhật' : 'Tạo mới'}
        title={editingQuestion ? 'Sửa câu hỏi' : 'Thêm câu hỏi'}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="healthCheckId" hidden>
            <Input />
          </Form.Item>
          <Form.Item
            name="questionText"
            label="Nội dung câu hỏi"
            rules={[{ required: true, message: 'Vui lòng nhập nội dung câu hỏi' }]}
          >
            <TextArea rows={3} placeholder="Nhập câu hỏi" />
          </Form.Item>
          <Form.Item
            name="questionType"
            label="Loại câu hỏi"
            rules={[{ required: true }]}
          >
            <Select>
              <Option value="single-choice">Chọn 1 phương án</Option>
              <Option value="multi-choice">Chọn nhiều phương án</Option>
              <Option value="text">Văn bản</Option>
              <Option value="number">Số</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="order"
            label="Thứ tự"
            rules={[{ required: true }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="isRequired"
            label="Bắt buộc"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>

      {/* Answer Option Modal */}
      <Modal
        open={answerOptionModalOpen}
        onCancel={() => {
          setAnswerOptionModalOpen(false);
          setEditingAnswerOption(null);
        }}
        onOk={onSubmitAnswerOption}
        okText={editingAnswerOption ? 'Cập nhật' : 'Tạo mới'}
        title={editingAnswerOption ? 'Sửa phương án trả lời' : 'Thêm phương án trả lời'}
      >
        <Form form={answerOptionForm} layout="vertical">
          <Form.Item name="questionId" hidden>
            <Input />
          </Form.Item>
          <Form.Item
            name="optionText"
            label="Nội dung phương án"
            rules={[{ required: true, message: 'Vui lòng nhập nội dung phương án' }]}
          >
            <TextArea rows={2} placeholder="Nhập phương án trả lời" />
          </Form.Item>
          <Form.Item
            name="scoreValue"
            label="Điểm số"
            rules={[{ required: true }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="order"
            label="Thứ tự"
            rules={[{ required: true }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}


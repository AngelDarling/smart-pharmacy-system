/**
 * Category Form Component
 * Handles creation and editing of categories with parent selection
 */

import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Form,
  Input,
  Select,
  TreeSelect,
  Button,
  Row,
  Col,
  Upload,
  Switch,
  InputNumber,
  message,
  Space,
  Divider,
  Typography,
  Modal
} from 'antd';
import {
  UploadOutlined,
  InboxOutlined
} from '@ant-design/icons';

const { TextArea } = Input;
const { Option } = Select;
const { Dragger } = Upload;
const { Title, Text } = Typography;

const CategoryForm = ({ visible, onCancel, onSubmit, initialValues, isEditing, categories = [], parentCategory = null }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [hasParent, setHasParent] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);

  // Get tree data for TreeSelect
  const getTreeSelectData = (categories) => {
    try {
      if (!categories || !Array.isArray(categories) || categories.length === 0) {
        return [];
      }
      return categories.map(category => ({
        value: category._id,
        title: category.name,
        children: category.children ? getTreeSelectData(category.children) : []
      }));
    } catch (error) {
      console.error('Error building tree select data:', error, categories);
      return [];
    }
  };

  // Set initial values
  useEffect(() => {
    if (initialValues && isEditing) {
      // Map backend fields to frontend fields
      const mappedValues = {
        name: initialValues.name || '',
        slug: initialValues.slug || '',
        description: initialValues.description || '',
        parent: initialValues.parent || null,
        isActive: initialValues.isActive ?? true,
        iconUrl: initialValues.iconUrl || '',
        imageUrl: initialValues.imageUrl || '',
        metaTitle: initialValues.seoTitle || '', // Map seoTitle to metaTitle
        metaDescription: initialValues.seoDescription || '' // Map seoDescription to metaDescription
      };
      
      form.setFieldsValue(mappedValues);
      setHasParent(!!initialValues.parent);
    } else {
      // Reset form first
      form.resetFields();
      
      // Set default values
      form.setFieldsValue({
        isActive: true
      });
      
      // If parentCategory is provided, set it as parent
      if (parentCategory) {
        setHasParent(true);
        
        // Use setTimeout to ensure form is ready
        setTimeout(() => {
          form.setFieldsValue({
            parent: parentCategory._id
          });
        }, 100);
      } else {
        setHasParent(false);
      }
    }
  }, [initialValues, form, parentCategory, isEditing, visible]);

  // Separate effect to handle parent category when form is ready
  useEffect(() => {
    if (visible && parentCategory && !initialValues) {
      // Set hasParent first
      setHasParent(true);
      
      // Force form to update
      setTimeout(() => {
        form.setFieldsValue({
          parent: parentCategory._id,
          hasParent: true
        });
        setForceUpdate(prev => prev + 1);
      }, 200);
      
      // Force update again after a bit more time
      setTimeout(() => {
        setForceUpdate(prev => prev + 1);
      }, 400);
    }
  }, [visible, parentCategory, initialValues, form]);

  // Force update Switch when hasParent changes
  useEffect(() => {
    if (visible) {
      setForceUpdate(prev => prev + 1);
    }
  }, [hasParent, visible]);

  // Separate effect specifically for editing - runs when drawer opens with editing data
  useEffect(() => {
    if (visible && isEditing && initialValues) {
      // Reset form first
      form.resetFields();
      
      // Map and set values
      const mappedValues = {
        name: initialValues.name || '',
        slug: initialValues.slug || '',
        description: initialValues.description || '',
        parent: initialValues.parent || null,
        isActive: initialValues.isActive ?? true,
        iconUrl: initialValues.iconUrl || '',
        imageUrl: initialValues.imageUrl || '',
        metaTitle: initialValues.seoTitle || '',
        metaDescription: initialValues.seoDescription || ''
      };
      
      // Use multiple timeouts to ensure form is ready
      setTimeout(() => {
        form.setFieldsValue(mappedValues);
        setHasParent(!!initialValues.parent);
      }, 50);
      
      setTimeout(() => {
        form.setFieldsValue(mappedValues);
        setForceUpdate(prev => prev + 1);
      }, 200);
    }
  }, [visible, isEditing, initialValues, form]);


  // Handle form submit
  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      // Clean up the data before sending
      const cleanedValues = { ...values };
      
      // If hasParent is false, remove parent field
      if (!hasParent) {
        delete cleanedValues.parent;
        delete cleanedValues.hasParent; // Remove the hasParent field as it's not needed in API
      } else {
        delete cleanedValues.hasParent; // Remove the hasParent field as it's not needed in API
      }
      
      await onSubmit(cleanedValues);
    } catch (error) {
      console.error('Form validation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle modal close
  const handleCancel = () => {
    form.resetFields();
    setHasParent(false);
    onCancel();
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!visible) {
      form.resetFields();
      setHasParent(false);
    }
  }, [visible, form]);

  // Handle checkbox change
  const handleHasParentChange = (checked) => {
    setHasParent(checked);
    form.setFieldValue('hasParent', checked);
    if (!checked) {
      form.setFieldValue('parent', null);
    }
    setForceUpdate(prev => prev + 1);
  };

  // Auto-generate slug from name
  const handleNameChange = (e) => {
    const name = e.target.value;
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim();
    
    form.setFieldValue('slug', slug);
  };

  // Upload props
  const uploadProps = {
    name: 'file',
    multiple: false,
    action: 'http://localhost:5000/api/upload',
    onChange(info) {
      if (info.file.status === 'done') {
        message.success(`${info.file.name} tải lên thành công`);
        form.setFieldValue('iconUrl', info.file.response.url);
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} tải lên thất bại`);
      }
    },
  };

  const imageUploadProps = {
    name: 'file',
    multiple: false,
    action: 'http://localhost:5000/api/upload',
    onChange(info) {
      if (info.file.status === 'done') {
        message.success(`${info.file.name} tải lên thành công`);
        form.setFieldValue('imageUrl', info.file.response.url);
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} tải lên thất bại`);
      }
    },
  };

  return (
    <Drawer
      title={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Title level={4} style={{ margin: 0 }}>
            {isEditing ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
          </Title>
        </div>
      }
      open={visible}
      onClose={handleCancel}
      width={600}
      destroyOnClose
      extra={
        <Space>
          <Button onClick={handleCancel}>
            Hủy
          </Button>
          <Button 
            type="primary" 
            onClick={handleSubmit}
            loading={loading}
          >
            {isEditing ? 'Cập nhật' : 'Tạo mới'}
          </Button>
        </Space>
      }
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          isActive: true,
          order: 0
        }}
        preserve={false}
        key={visible ? 'form' : 'form-hidden'}
      >
        {/* Basic Information Section */}
        <div style={{ marginBottom: '24px' }}>
          <Title level={5} style={{ marginBottom: '16px', color: '#262626' }}>
            Thông tin cơ bản
          </Title>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Tên danh mục"
                rules={[
                  { required: true, message: 'Vui lòng nhập tên danh mục' },
                  { min: 2, message: 'Tên danh mục phải có ít nhất 2 ký tự' },
                  { max: 100, message: 'Tên danh mục không được quá 100 ký tự' }
                ]}
              >
                <Input 
                  placeholder="Nhập tên danh mục" 
                  onChange={handleNameChange}
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="slug"
                label="Slug (URL)"
                rules={[
                  { required: true, message: 'Vui lòng nhập slug' },
                  { pattern: /^[a-z0-9-]+$/, message: 'Slug chỉ được chứa chữ thường, số và dấu gạch ngang' }
                ]}
              >
                <Input 
                  placeholder="slug-danh-muc" 
                  size="large"
                  addonBefore="/"
                />
              </Form.Item>
            </Col>
          </Row>
        </div>

        <Divider />

        {/* Category Structure Section */}
        <div style={{ marginBottom: '24px' }}>
          <Title level={5} style={{ marginBottom: '16px', color: '#262626' }}>
            Cấu trúc danh mục
          </Title>
          
          <Form.Item
            name="hasParent"
            valuePropName="checked"
            style={{ marginBottom: '16px' }}
          >
            <Switch
              checked={hasParent}
              onChange={handleHasParentChange}
              checkedChildren="Có danh mục cha"
              unCheckedChildren="Danh mục gốc"
              size="default"
              key={`switch-${hasParent}-${forceUpdate}`}
              style={{ 
                opacity: hasParent ? 1 : 0.7,
                transition: 'all 0.3s ease'
              }}
            />
          </Form.Item>

          {hasParent && (
            <Form.Item
              key={parentCategory ? `parent-item-${parentCategory._id}` : 'parent-item-no-parent'}
              name="parent"
              label="Chọn danh mục cha"
              rules={[
                { required: hasParent, message: 'Vui lòng chọn danh mục cha' }
              ]}
              help="Chọn danh mục cha để tạo cấu trúc phân cấp"
            >
              <TreeSelect
                key={`tree-select-${parentCategory?._id || 'no-parent'}-${forceUpdate}`}
                placeholder="Chọn danh mục cha"
                allowClear
                treeData={getTreeSelectData(categories)}
                treeDefaultExpandAll
                showSearch
                size="large"
                filterTreeNode={(input, node) =>
                  node.title.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                style={{ width: '100%' }}
                value={form.getFieldValue('parent')}
                onChange={(value) => {
                  form.setFieldValue('parent', value);
                }}
              />
            </Form.Item>
          )}

          <Form.Item
            name="description"
            label="Mô tả"
            rules={[
              { max: 500, message: 'Mô tả không được quá 500 ký tự' }
            ]}
          >
            <TextArea 
              rows={3} 
              placeholder="Mô tả ngắn về danh mục"
              showCount
              maxLength={500}
              size="large"
            />
          </Form.Item>
        </div>

        <Divider />

        {/* Settings Section */}
        <div style={{ marginBottom: '24px' }}>
          <Title level={5} style={{ marginBottom: '16px', color: '#262626' }}>
            Cài đặt
          </Title>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="isActive"
                label="Trạng thái"
                valuePropName="checked"
              >
                <Switch 
                  checkedChildren="Hoạt động" 
                  unCheckedChildren="Tạm dừng" 
                  size="default"
                />
              </Form.Item>
            </Col>
          </Row>
        </div>

        <Divider />

        {/* Media Section */}
        <div style={{ marginBottom: '24px' }}>
          <Title level={5} style={{ marginBottom: '16px', color: '#262626' }}>
            Hình ảnh & Media
          </Title>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="iconUrl"
                label="Icon danh mục"
              >
                <Dragger {...uploadProps}>
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                  </p>
                  <p className="ant-upload-text">Nhấp hoặc kéo thả file icon vào đây</p>
                  <p className="ant-upload-hint">
                    Hỗ trợ định dạng: PNG, JPG, SVG. Kích thước tối đa: 2MB
                  </p>
                </Dragger>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="imageUrl"
                label="Hình ảnh danh mục"
              >
                <Dragger {...imageUploadProps}>
                  <p className="ant-upload-drag-icon">
                    <UploadOutlined />
                  </p>
                  <p className="ant-upload-text">Nhấp hoặc kéo thả hình ảnh vào đây</p>
                  <p className="ant-upload-hint">
                    Hỗ trợ định dạng: PNG, JPG, JPEG. Kích thước tối đa: 5MB
                  </p>
                </Dragger>
              </Form.Item>
            </Col>
          </Row>
        </div>

        <Divider />

        {/* SEO Section */}
        <div style={{ marginBottom: '24px' }}>
          <Title level={5} style={{ marginBottom: '16px', color: '#262626' }}>
            SEO & Tối ưu hóa
          </Title>
          <Form.Item
            name="metaTitle"
            label="Meta Title (SEO)"
            rules={[
              { max: 160, message: 'Meta title không được quá 160 ký tự' }
            ]}
          >
            <Input 
              placeholder="Tiêu đề SEO cho danh mục"
              showCount
              maxLength={160}
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="metaDescription"
            label="Meta Description (SEO)"
            rules={[
              { max: 300, message: 'Meta description không được quá 300 ký tự' }
            ]}
          >
            <TextArea 
              rows={2} 
              placeholder="Mô tả SEO cho danh mục"
              showCount
              maxLength={300}
              size="large"
            />
          </Form.Item>
        </div>
      </Form>
    </Drawer>
  );
};

export default CategoryForm;

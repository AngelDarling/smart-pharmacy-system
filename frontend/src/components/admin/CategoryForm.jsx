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
  Modal,
  Badge
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
        metaTitle: initialValues.seoTitle || '', // Map seoTitle to metaTitle
        metaDescription: initialValues.seoDescription || '' // Map seoDescription to metaDescription
      };
      
      form.setFieldsValue(mappedValues);
      setHasParent(!!initialValues.parent);
      setImageUrl(initialValues.iconUrl || '');
    } else {
      // Reset form first
      form.resetFields();
      setImageUrl('');
      
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
        metaTitle: initialValues.seoTitle || '',
        metaDescription: initialValues.seoDescription || ''
      };
      
      // Use multiple timeouts to ensure form is ready
      setTimeout(() => {
        form.setFieldsValue(mappedValues);
        setHasParent(!!initialValues.parent);
        setImageUrl(initialValues.iconUrl || '');
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

  // State for image preview
  const [imageUrl, setImageUrl] = useState('');

  // Update image preview when form values change
  useEffect(() => {
    const currentUrl = form.getFieldValue('iconUrl');
    if (currentUrl) {
      setImageUrl(currentUrl);
    }
  }, [form, visible, initialValues]);

  // Upload props
  const uploadProps = {
    name: 'file',
    multiple: false,
    action: '/api/upload',
    listType: 'picture-card',
    showUploadList: false,
    onChange(info) {
      const { status, response } = info.file;
      if (status === 'uploading') {
        // Show loading state
      } else if (status === 'done') {
        message.success(`${info.file.name} tải lên thành công`);
        if (response && response.url) {
          form.setFieldValue('iconUrl', response.url);
          setImageUrl(response.url);
        }
      } else if (status === 'error') {
        message.error(`${info.file.name} tải lên thất bại`);
        console.error('Upload error:', info.file.error, info.file.response);
      }
    },
    onError(error) {
      console.error('Upload error:', error);
      message.error('Tải file lên thất bại');
    }
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
            Hình ảnh danh mục
          </Title>
          <Form.Item
            name="iconUrl"
            label="Icon/Hình ảnh"
            extra="Tải lên icon hoặc hình ảnh cho danh mục. Hỗ trợ: PNG, JPG, SVG (tối đa 5MB)"
          >
            <div>
              {imageUrl ? (
                <div style={{ 
                  display: 'inline-block',
                  position: 'relative',
                  border: '1px solid #d9d9d9', 
                  borderRadius: '8px',
                  overflow: 'hidden',
                  background: '#fff'
                }}>
                  {/* Preview Image */}
                  <div style={{
                    width: '200px',
                    height: '200px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#fafafa',
                    position: 'relative'
                  }}>
                    <img 
                      src={imageUrl} 
                      alt="Preview" 
                      style={{ 
                        maxWidth: '100%', 
                        maxHeight: '100%', 
                        objectFit: 'contain',
                        display: 'block'
                      }} 
                    />
                  </div>
                  
                  {/* Success Badge & Actions */}
                  <div style={{ 
                    padding: '12px',
                    background: '#f6ffed',
                    borderTop: '1px solid #b7eb8f',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <Space size={4} align="center">
                      <Badge status="success" />
                      <Text strong style={{ fontSize: '13px', color: '#52c41a' }}>
                        Đã tải lên
                      </Text>
                    </Space>
                    <Button 
                      type="link" 
                      size="small" 
                      danger
                      onClick={() => {
                        setImageUrl('');
                        form.setFieldValue('iconUrl', '');
                      }}
                      style={{ padding: '0 4px' }}
                    >
                      Xóa
                    </Button>
                  </div>
                  
                  {/* URL Display */}
                  <div style={{ 
                    padding: '8px 12px',
                    background: '#fafafa',
                    borderTop: '1px solid #f0f0f0'
                  }}>
                    <Text 
                      ellipsis 
                      copyable 
                      style={{ 
                        fontSize: '11px', 
                        color: '#8c8c8c',
                        display: 'block',
                        maxWidth: '176px'
                      }}
                    >
                      {imageUrl}
                    </Text>
                  </div>
                </div>
              ) : (
                <Upload {...uploadProps}>
                  <div style={{
                    width: '200px',
                    height: '200px',
                    border: '2px dashed #d9d9d9',
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    background: '#fafafa'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#1890ff';
                    e.currentTarget.style.background = '#f0f5ff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#d9d9d9';
                    e.currentTarget.style.background = '#fafafa';
                  }}
                  >
                    <UploadOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />
                    <Text strong style={{ fontSize: '14px', color: '#262626', marginBottom: '8px' }}>
                      Chọn file để tải lên
                    </Text>
                    <Text style={{ fontSize: '12px', color: '#8c8c8c' }}>
                      hoặc kéo thả vào đây
                    </Text>
                  </div>
                </Upload>
              )}
            </div>
          </Form.Item>
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

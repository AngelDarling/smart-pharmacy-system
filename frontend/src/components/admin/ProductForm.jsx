/**
 * Simplified Product Form Component
 * Focuses on essential product management features
 */

import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  TreeSelect,
  Button,
  Row,
  Col,
  InputNumber,
  Switch,
  message,
  Upload,
  Card,
  Divider
} from 'antd';
import {
  PlusOutlined,
  UploadOutlined
} from '@ant-design/icons';
import { useCategories } from '../../hooks/admin/useCategories';
import { useProducts } from '../../hooks/admin/useProducts';

const { TextArea } = Input;
const { Option } = Select;

const ProductForm = ({ visible, onCancel, onSubmit, initialValues, isEditing }) => {
  const [form] = Form.useForm();
  const { categories, getTreeSelectData, fetchCategories } = useCategories();
  const { fetchBrands } = useProducts();
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);

  // Debug categories (temporary)
  useEffect(() => {
    if (visible) {
      console.log('ProductForm - Categories:', categories);
      console.log('ProductForm - Categories length:', categories?.length);
      console.log('ProductForm - TreeSelectData:', getTreeSelectData(categories));
      console.log('ProductForm - TreeSelectData length:', getTreeSelectData(categories)?.length);
    }
  }, [visible, categories, getTreeSelectData]);

  // Force fetch categories if not loaded
  useEffect(() => {
    if (visible && (!categories || categories.length === 0)) {
      console.log('ProductForm - Forcing category fetch');
      fetchCategories();
    }
  }, [visible, categories, fetchCategories]);

  // Load brands
  useEffect(() => {
    const loadBrands = async () => {
      try {
        const brandsData = await fetchBrands();
        setBrands(brandsData || []);
      } catch (error) {
        console.error('Error loading brands:', error);
      }
    };
    loadBrands();
  }, [fetchBrands]);

  // Set initial values
  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        // Ensure categoryId and brandId are strings
        categoryId: initialValues.categoryId?._id || initialValues.categoryId,
        brandId: initialValues.brandId?._id || initialValues.brandId,
        // Convert imageUrls array to textarea string
        imageUrls: initialValues.imageUrls 
          ? Array.isArray(initialValues.imageUrls) 
            ? initialValues.imageUrls.join('\n')
            : initialValues.imageUrls
          : ''
      });
    } else {
      form.resetFields();
    }
  }, [initialValues, form]);

  // Handle form submit
  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      // Convert string IDs to ObjectIds if needed
      const productData = {
        ...values,
        categoryId: values.categoryId,
        brandId: values.brandId || null,
        price: Number(values.price) || 0,
        costPrice: Number(values.costPrice) || 0,
        totalStock: Number(values.totalStock) || 0,
        isActive: values.isActive !== false,
        // Convert imageUrls from textarea to array
        imageUrls: values.imageUrls 
          ? values.imageUrls.split('\n').filter(url => url.trim() !== '')
          : []
      };

      await onSubmit(productData);
    } catch (error) {
      console.error('Form validation failed:', error);
      message.error('Vui lòng kiểm tra lại thông tin');
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={isEditing ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
      open={visible}
      onCancel={handleCancel}
      onOk={handleSubmit}
      width={800}
      confirmLoading={loading}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          isActive: true,
          price: 0,
          costPrice: 0,
          totalStock: 0,
          unit: 'hộp'
        }}
      >
        <Card title="Thông tin cơ bản" size="small" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Tên sản phẩm"
                rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}
              >
                <Input placeholder="Nhập tên sản phẩm" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="slug"
                label="Slug (URL)"
                rules={[{ required: true, message: 'Vui lòng nhập slug' }]}
              >
                <Input placeholder="slug-san-pham" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="categoryId"
                label="Danh mục sản phẩm"
                rules={[{ required: true, message: 'Vui lòng chọn danh mục sản phẩm' }]}
              >
                <TreeSelect
                  placeholder="Chọn danh mục sản phẩm"
                  treeData={getTreeSelectData(categories) || []}
                  treeDefaultExpandAll
                  showSearch
                  loading={!categories || categories.length === 0}
                  notFoundContent={!categories || categories.length === 0 ? "Đang tải..." : "Không có dữ liệu"}
                  filterTreeNode={(input, node) =>
                    node.title.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="brandId"
                label="Thương hiệu"
              >
                <Select
                  placeholder="Chọn thương hiệu"
                  allowClear
                  showSearch
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {brands.map(brand => (
                    <Option key={brand._id} value={brand._id}>
                      {brand.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="shortDescription"
            label="Mô tả ngắn"
          >
            <TextArea rows={2} placeholder="Mô tả ngắn về sản phẩm" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả chi tiết"
          >
            <TextArea rows={4} placeholder="Mô tả chi tiết về sản phẩm" />
          </Form.Item>

          <Form.Item
            name="imageUrls"
            label="URL ảnh sản phẩm"
            help="Nhập URL ảnh sản phẩm (có thể nhập nhiều URL, mỗi URL một dòng)"
          >
            <TextArea 
              rows={3} 
              placeholder="Nhập URL ảnh sản phẩm&#10;Ví dụ:&#10;https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
            />
          </Form.Item>
        </Card>

        <Card title="Thông tin giá và tồn kho" size="small" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="price"
                label="Giá bán "
                rules={[{ required: true, message: 'Vui lòng nhập Giá bán' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Giá bán"
                  min={0}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="costPrice"
                label="Giá nhập"
                rules={[{ required: true, message: 'Vui lòng nhập giá nhập' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Giá nhập"
                  min={0}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="unit"
                label="Đơn vị"
              >
                <Select placeholder="Chọn đơn vị">
                  <Option value="hộp">Hộp</Option>
                  <Option value="vỉ">Vỉ</Option>
                  <Option value="chai">Chai</Option>
                  <Option value="tuýp">Tuýp</Option>
                  <Option value="viên">Viên</Option>
                  <Option value="gói">Gói</Option>
                  <Option value="lọ">Lọ</Option>
                  <Option value="túi">Túi</Option>
                  <Option value="cái">Cái</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="totalStock"
                label="Tồn kho"
                rules={[{ required: true, message: 'Vui lòng nhập số lượng tồn kho' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Số lượng tồn kho"
                  min={0}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="sku"
                label="SKU"
              >
                <Input placeholder="Mã SKU" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="barcode"
                label="Barcode"
              >
                <Input placeholder="Mã vạch" />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Card title="Thông tin bổ sung" size="small">
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="isActive"
                label="Trạng thái"
                valuePropName="checked"
              >
                <Switch checkedChildren="Hoạt động" unCheckedChildren="Tạm dừng" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="isFeatured"
                label="Sản phẩm nổi bật"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="isNewProduct"
                label="Sản phẩm mới"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="usage"
            label="Cách sử dụng"
          >
            <TextArea rows={3} placeholder="Hướng dẫn sử dụng sản phẩm" />
          </Form.Item>

          <Form.Item
            name="storage"
            label="Bảo quản"
          >
            <TextArea rows={2} placeholder="Hướng dẫn bảo quản sản phẩm" />
          </Form.Item>
        </Card>
      </Form>
    </Modal>
  );
};

export default ProductForm;
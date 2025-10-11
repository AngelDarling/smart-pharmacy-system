/**
 * Dynamic Product Form Component
 * Handles creation and editing of products with variants
 */

import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  Row,
  Col,
  Upload,
  InputNumber,
  Switch,
  Divider,
  Card,
  Space,
  Tag,
  message,
  Tabs,
  Collapse,
  Table,
  Popconfirm
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  UploadOutlined,
  MinusCircleOutlined
} from '@ant-design/icons';
import { useCategories } from '../../hooks/admin/useCategories';
import { useProducts } from '../../hooks/admin/useProducts';

const { TextArea } = Input;
const { Option } = Select;
const { Panel } = Collapse;

const ProductForm = ({ visible, onCancel, onSubmit, initialValues, isEditing }) => {
  const [form] = Form.useForm();
  const [productType, setProductType] = useState('');
  const [variants, setVariants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [attributes, setAttributes] = useState([]);
  const [activeSubstances, setActiveSubstances] = useState([]);

  const { categories: categoriesData, getTreeSelectData } = useCategories();
  const { fetchBrands, fetchAttributes, fetchActiveSubstances } = useProducts();

  // Product type specific fields
  const productTypeFields = {
    Drug: [
      { name: 'pharmacologicalClass', label: 'Nhóm dược lý', type: 'input', required: true },
      { name: 'dosageForm', label: 'Dạng bào chế', type: 'select', required: true },
      { name: 'administration.route', label: 'Đường dùng', type: 'input', required: true },
      { name: 'administration.method', label: 'Cách dùng', type: 'textarea' },
      { name: 'administration.frequency', label: 'Tần suất', type: 'input' },
      { name: 'administration.duration', label: 'Thời gian', type: 'input' },
      { name: 'activeSubstances', label: 'Hoạt chất', type: 'select', multiple: true },
      { name: 'ingredients', label: 'Thành phần', type: 'textarea' },
      { name: 'usage', label: 'Chỉ định', type: 'textarea' },
      { name: 'contraindications', label: 'Chống chỉ định', type: 'textarea' },
      { name: 'sideEffects', label: 'Tác dụng phụ', type: 'textarea' },
      { name: 'drugInteractions', label: 'Tương tác thuốc', type: 'textarea' },
      { name: 'warnings', label: 'Cảnh báo', type: 'textarea' },
      { name: 'storage', label: 'Bảo quản', type: 'textarea' },
      { name: 'registrationNumber', label: 'Số đăng ký', type: 'input' },
      { name: 'manufacturer', label: 'Nhà sản xuất', type: 'input' },
      { name: 'countryOfOrigin', label: 'Nước sản xuất', type: 'input' },
      { name: 'isPrescriptionRequired', label: 'Cần kê đơn', type: 'switch' },
      { name: 'atcCode', label: 'Mã ATC', type: 'input' }
    ],
    Cosmeceutical: [
      { name: 'skinType', label: 'Loại da phù hợp', type: 'select', multiple: true },
      { name: 'mainIngredients', label: 'Thành phần chính', type: 'select', multiple: true },
      { name: 'benefits', label: 'Công dụng', type: 'select', multiple: true },
      { name: 'usageInstructions', label: 'Hướng dẫn sử dụng', type: 'textarea' },
      { name: 'applicationArea', label: 'Vùng áp dụng', type: 'input' },
      { name: 'volume', label: 'Thể tích', type: 'inputNumber' },
      { name: 'volumeUnit', label: 'Đơn vị thể tích', type: 'input' },
      { name: 'formulationType', label: 'Loại công thức', type: 'input' },
      { name: 'isHypoallergenic', label: 'Không gây dị ứng', type: 'switch' },
      { name: 'isNonComedogenic', label: 'Không gây bít tắc', type: 'switch' },
      { name: 'spfValue', label: 'Chỉ số SPF', type: 'inputNumber' },
      { name: 'paRating', label: 'Chỉ số PA', type: 'select' }
    ],
    MedicalDevice: [
      { name: 'deviceType', label: 'Loại thiết bị', type: 'input', required: true },
      { name: 'intendedUse', label: 'Mục đích sử dụng', type: 'textarea' },
      { name: 'riskClass', label: 'Phân loại rủi ro', type: 'select', required: true },
      { name: 'manufacturer', label: 'Nhà sản xuất', type: 'input' },
      { name: 'countryOfOrigin', label: 'Nước sản xuất', type: 'input' },
      { name: 'warrantyPeriod', label: 'Thời gian bảo hành (tháng)', type: 'inputNumber' },
      { name: 'technicalSpecifications', label: 'Thông số kỹ thuật', type: 'textarea' },
      { name: 'certifications', label: 'Chứng nhận', type: 'select', multiple: true },
      { name: 'isSterile', label: 'Vô trùng', type: 'switch' },
      { name: 'isSingleUse', label: 'Dùng một lần', type: 'switch' },
      { name: 'powerSource', label: 'Nguồn điện', type: 'input' }
    ],
    FunctionalFood: [
      { name: 'targetAudience', label: 'Đối tượng sử dụng', type: 'select', multiple: true },
      { name: 'nutritionalInfo', label: 'Thông tin dinh dưỡng', type: 'textarea' },
      { name: 'healthBenefits', label: 'Lợi ích sức khỏe', type: 'select', multiple: true },
      { name: 'ingredients', label: 'Thành phần', type: 'textarea' },
      { name: 'usageInstructions', label: 'Hướng dẫn sử dụng', type: 'textarea' },
      { name: 'warnings', label: 'Cảnh báo', type: 'textarea' },
      { name: 'storage', label: 'Bảo quản', type: 'textarea' },
      { name: 'manufacturer', label: 'Nhà sản xuất', type: 'input' },
      { name: 'countryOfOrigin', label: 'Nước sản xuất', type: 'input' },
      { name: 'form', label: 'Dạng', type: 'input' },
      { name: 'netWeight', label: 'Khối lượng tịnh', type: 'inputNumber' },
      { name: 'netWeightUnit', label: 'Đơn vị khối lượng', type: 'input' }
    ]
  };

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [brandsData, attributesData, activeSubstancesData] = await Promise.all([
          fetchBrands(),
          fetchAttributes(),
          fetchActiveSubstances()
        ]);
        setBrands(brandsData);
        setAttributes(attributesData);
        setActiveSubstances(activeSubstancesData);
        setCategories(categoriesData || []);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    loadData();
  }, [categoriesData]);

  // Set initial values
  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
      setProductType(initialValues.productType || '');
      setVariants(initialValues.variants || []);
    } else {
      form.resetFields();
      setProductType('');
      setVariants([]);
    }
  }, [initialValues, form]);

  // Handle product type change
  const handleProductTypeChange = (categoryId) => {
    // Find category name from categoryId
    const category = categories.find(cat => cat._id === categoryId);
    const categoryName = category?.name;
    
    // Map category name to product type for field logic
    const typeMap = {
      'Thuốc': 'Drug',
      'Dược mỹ phẩm': 'Cosmeceutical', 
      'Thiết bị y tế': 'MedicalDevice',
      'Thực phẩm chức năng': 'FunctionalFood'
    };
    
    const mappedType = typeMap[categoryName] || categoryName;
    setProductType(mappedType);
    
    // Clear product type specific fields
    const fieldsToClear = productTypeFields[mappedType]?.map(field => field.name) || [];
    fieldsToClear.forEach(field => {
      form.setFieldValue(field, undefined);
    });
  };

  // Handle variant operations
  const addVariant = () => {
    const newVariant = {
      name: '',
      sku: '',
      barcode: '',
      price: 0,
      compareAtPrice: 0,
      unit: 'sản phẩm',
      quantity: 1,
      stockOnHand: 0,
      imageUrls: [],
      attributes: [],
      isActive: true
    };
    setVariants([...variants, newVariant]);
  };

  const removeVariant = (index) => {
    const newVariants = variants.filter((_, i) => i !== index);
    setVariants(newVariants);
  };

  const updateVariant = (index, field, value) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setVariants(newVariants);
  };

  // Handle form submit
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const productData = {
        ...values,
        productType,
        variants
      };
      await onSubmit(productData);
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  // Render product type specific fields
  const renderProductTypeFields = () => {
    if (!productType || !productTypeFields[productType]) return null;

    return productTypeFields[productType].map(field => {
      const { name, label, type, required, multiple } = field;
      
      switch (type) {
        case 'input':
          return (
            <Col span={12} key={name}>
              <Form.Item
                name={name}
                label={label}
                rules={required ? [{ required: true, message: `Vui lòng nhập ${label}` }] : []}
              >
                <Input placeholder={`Nhập ${label.toLowerCase()}`} />
              </Form.Item>
            </Col>
          );
        
        case 'textarea':
          return (
            <Col span={24} key={name}>
              <Form.Item
                name={name}
                label={label}
                rules={required ? [{ required: true, message: `Vui lòng nhập ${label}` }] : []}
              >
                <TextArea rows={3} placeholder={`Nhập ${label.toLowerCase()}`} />
              </Form.Item>
            </Col>
          );
        
        case 'select':
          return (
            <Col span={12} key={name}>
              <Form.Item
                name={name}
                label={label}
                rules={required ? [{ required: true, message: `Vui lòng chọn ${label}` }] : []}
              >
                <Select
                  placeholder={`Chọn ${label.toLowerCase()}`}
                  mode={multiple ? 'multiple' : undefined}
                  allowClear
                >
                  {/* Options would be populated based on field name */}
                  <Option value="option1">Tùy chọn 1</Option>
                  <Option value="option2">Tùy chọn 2</Option>
                </Select>
              </Form.Item>
            </Col>
          );
        
        case 'inputNumber':
          return (
            <Col span={12} key={name}>
              <Form.Item
                name={name}
                label={label}
                rules={required ? [{ required: true, message: `Vui lòng nhập ${label}` }] : []}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder={`Nhập ${label.toLowerCase()}`}
                />
              </Form.Item>
            </Col>
          );
        
        case 'switch':
          return (
            <Col span={12} key={name}>
              <Form.Item
                name={name}
                label={label}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
          );
        
        default:
          return null;
      }
    });
  };

  // Variant columns for table
  const variantColumns = [
    {
      title: 'Tên biến thể',
      dataIndex: 'name',
      key: 'name',
      render: (text, record, index) => (
        <Input
          value={text}
          onChange={(e) => updateVariant(index, 'name', e.target.value)}
          placeholder="Tên biến thể"
        />
      )
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
      render: (text, record, index) => (
        <Input
          value={text}
          onChange={(e) => updateVariant(index, 'sku', e.target.value)}
          placeholder="SKU"
        />
      )
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      render: (text, record, index) => (
        <InputNumber
          value={text}
          onChange={(value) => updateVariant(index, 'price', value)}
          placeholder="Giá"
          style={{ width: '100%' }}
        />
      )
    },
    {
      title: 'Tồn kho',
      dataIndex: 'stockOnHand',
      key: 'stockOnHand',
      render: (text, record, index) => (
        <InputNumber
          value={text}
          onChange={(value) => updateVariant(index, 'stockOnHand', value)}
          placeholder="Tồn kho"
          style={{ width: '100%' }}
        />
      )
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (text, record, index) => (
        <Popconfirm
          title="Bạn có chắc chắn muốn xóa biến thể này?"
          onConfirm={() => removeVariant(index)}
          okText="Xóa"
          cancelText="Hủy"
        >
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            size="small"
          />
        </Popconfirm>
      )
    }
  ];

  return (
    <Modal
      title={isEditing ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      width={1000}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          isActive: true,
          isFeatured: false,
          isNewProduct: false,
          isBestSeller: false
        }}
      >
        <Tabs 
          defaultActiveKey="basic"
          items={[
            {
              key: 'basic',
              label: 'Thông tin cơ bản',
              children: (
                <>
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
                        <Select
                          placeholder="Chọn danh mục sản phẩm"
                          onChange={handleProductTypeChange}
                          treeData={getTreeSelectData(categories) || []}
                          treeDefaultExpandAll
                          showSearch
                          filterOption={(input, option) =>
                            option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
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

            <Row gutter={16}>
              <Col span={6}>
                <Form.Item
                  name="isActive"
                  label="Hoạt động"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  name="isFeatured"
                  label="Nổi bật"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  name="isNewProduct"
                  label="Sản phẩm mới"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  name="isBestSeller"
                  label="Bán chạy"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>
            </Row>
                </>
              )
            },
            ...(productType ? [{
              key: 'specific',
              label: 'Thông tin chuyên biệt',
              children: (
                <>
                  <Row gutter={16}>
                    {renderProductTypeFields()}
                  </Row>
                </>
              )
            }] : []),
            {
              key: 'variants',
              label: 'Biến thể sản phẩm',
              children: (
                <>
                  <Card
                    title="Quản lý biến thể"
                    extra={
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={addVariant}
                      >
                        Thêm biến thể
                      </Button>
                    }
                  >
                    <Table
                      columns={variantColumns}
                      dataSource={variants}
                      rowKey={(record) => record.id || record._id || Math.random()}
                      pagination={false}
                      size="small"
                    />
                  </Card>
                </>
              )
            }
          ]}
        />
      </Form>
    </Modal>
  );
};

export default ProductForm;

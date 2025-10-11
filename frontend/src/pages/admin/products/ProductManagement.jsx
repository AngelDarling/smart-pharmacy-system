/**
 * Product Management Page
 * Advanced product management with filtering and modern UI
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Input,
  Select,
  Tag,
  Image,
  Popconfirm,
  Tooltip,
  Row,
  Col,
  Typography,
  Divider,
  Collapse,
  Form,
  DatePicker,
  InputNumber,
  Switch,
  Avatar,
  Dropdown,
  Menu,
  Badge,
  Tabs,
  Statistic
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  FilterOutlined,
  ReloadOutlined,
  ExportOutlined,
  ImportOutlined,
  EyeOutlined,
  MoreOutlined,
  SettingOutlined,
  ShoppingOutlined,
  FileTextOutlined,
  DownOutlined,
  UpOutlined,
  ClearOutlined,
  StarOutlined,
  DollarOutlined,
  TagsOutlined
} from '@ant-design/icons';
import { useProducts } from '../../../hooks/admin/useProducts';
import { useCategories } from '../../../hooks/admin/useCategories';
import ProductForm from '../../../components/admin/ProductForm';

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;
const { Panel } = Collapse;

const ProductManagement = () => {
  const {
    products,
    loading,
    pagination,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    updateProductStock,
    updateProductStatus,
    bulkUpdateProducts,
    handleTableChange
  } = useProducts();

  // Debug log
  useEffect(() => {
    console.log('Products in ProductManagement:', products);
    console.log('Pagination:', pagination);
  }, [products, pagination]);

  // Fetch products on mount
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const { categories, getTreeSelectData } = useCategories();

  const [filters, setFilters] = useState({
    search: '',
    categoryId: '',
    brandId: '',
    isActive: undefined,
    minPrice: '',
    maxPrice: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [isProductFormVisible, setIsProductFormVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Category options for filtering
  const categoryOptions = getTreeSelectData(categories);

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Apply filters
  const applyFilters = () => {
    fetchProducts(filters);
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      search: '',
      categoryId: '',
      brandId: '',
      isActive: undefined,
      minPrice: '',
      maxPrice: ''
    });
    fetchProducts({});
  };

  // Handle search
  const handleSearch = (value) => {
    handleFilterChange('search', value);
    fetchProducts({ ...filters, search: value });
  };

  // Handle delete product
  const handleDeleteProduct = async (productId) => {
    try {
      await deleteProduct(productId);
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    try {
      await bulkUpdateProducts(selectedRowKeys, { isActive: false });
      setSelectedRowKeys([]);
    } catch (error) {
      console.error('Bulk delete error:', error);
    }
  };

  // Handle bulk status update
  const handleBulkStatusUpdate = async (status) => {
    try {
      await bulkUpdateProducts(selectedRowKeys, { isActive: status });
      setSelectedRowKeys([]);
    } catch (error) {
      console.error('Bulk status update error:', error);
    }
  };

  // Handle stock update
  const handleStockUpdate = async (productId, newStock) => {
    try {
      await updateProductStock(productId, { totalStock: newStock });
    } catch (error) {
      console.error('Stock update error:', error);
    }
  };

  // Handle status toggle
  const handleStatusToggle = async (productId, currentStatus) => {
    try {
      await updateProductStatus(productId, !currentStatus);
    } catch (error) {
      console.error('Status toggle error:', error);
    }
  };

  // Handle add product
  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsProductFormVisible(true);
  };

  // Handle edit product
  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setIsProductFormVisible(true);
  };

  // Handle product form submit
  const handleProductFormSubmit = async (values) => {
    try {
      if (editingProduct) {
        await updateProduct(editingProduct._id, values);
      } else {
        await createProduct(values);
      }
      setIsProductFormVisible(false);
      setEditingProduct(null);
      await fetchProducts(filters);
    } catch (error) {
      console.error('Product form submit error:', error);
    }
  };

  // Handle product form close
  const handleProductFormClose = () => {
    setIsProductFormVisible(false);
    setEditingProduct(null);
  };

  // Table columns
  const columns = [
    {
      title: 'Ảnh',
      dataIndex: 'imageUrls',
      key: 'image',
      width: 80,
      render: (imageUrls, record) => (
        <Avatar
          size={60}
          shape="square"
          src={imageUrls?.[0] || '/default-product.png'}
          style={{ 
            borderRadius: '8px',
            border: '2px solid #f0f0f0'
          }}
          alt={record.name}
        >
          <ShoppingOutlined />
        </Avatar>
      )
    },
    {
      title: 'Thông tin sản phẩm',
      dataIndex: 'name',
      key: 'name',
      width: 250,
      render: (text, record) => (
        <div style={{ padding: '8px 0' }}>
          <div style={{ 
            fontWeight: 600, 
            fontSize: '14px',
            marginBottom: '4px',
            color: '#262626',
            lineHeight: '1.4'
          }}>
            {text}
          </div>
          <div style={{ 
            fontSize: '12px', 
            color: '#8c8c8c',
            marginBottom: '6px',
            fontFamily: 'monospace'
          }}>
            SKU: {record.variants?.[0]?.sku || '-'}
          </div>
          {record.shortDescription && (
            <div style={{ 
              fontSize: '11px', 
              color: '#8c8c8c',
              fontStyle: 'italic',
              lineHeight: '1.3'
            }}>
              {record.shortDescription.length > 60 
                ? `${record.shortDescription.substring(0, 60)}...` 
                : record.shortDescription
              }
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Phân loại',
      key: 'classification',
      width: 200,
      render: (_, record) => (
        <div>
          <div style={{ marginBottom: '4px' }}>
            <Tag color="blue" style={{ marginBottom: '2px' }}>
              {record.categoryId?.name || 'Chưa phân loại'}
            </Tag>
          </div>
          <div style={{ marginBottom: '4px' }}>
            <Tag color="green" style={{ marginBottom: '2px' }}>
              {record.brandId?.name || 'Không có thương hiệu'}
            </Tag>
          </div>
        </div>
      )
    },
    {
      title: 'Giá & Tồn kho',
      key: 'priceStock',
      width: 180,
      render: (_, record) => (
        <div>
          <div style={{ 
            fontSize: '14px', 
            fontWeight: 600, 
            color: '#52c41a',
            marginBottom: '4px'
          }}>
            {(() => {
              const minPrice = record.minPrice;
              const maxPrice = record.maxPrice;
              if (minPrice === maxPrice) {
                return `${minPrice?.toLocaleString() || 0}đ`;
              }
              return `Từ ${minPrice?.toLocaleString() || 0}đ`;
            })()}
          </div>
          <div style={{ 
            fontSize: '12px', 
            color: '#8c8c8c',
            marginBottom: '8px'
          }}>
            {record.maxPrice && record.minPrice !== record.maxPrice && (
              <span>Đến {record.maxPrice?.toLocaleString()}đ</span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <InputNumber
              size="small"
              value={record.totalStock || 0}
              min={0}
              style={{ width: '80px' }}
              onChange={(value) => handleStockUpdate(record._id, value)}
            />
            <span style={{ fontSize: '12px', color: '#8c8c8c' }}>sản phẩm</span>
          </div>
        </div>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'status',
      width: 140,
      render: (isActive, record) => (
        <div style={{ textAlign: 'center' }}>
          <Switch
            checked={isActive}
            onChange={() => handleStatusToggle(record._id, isActive)}
            checkedChildren="Hoạt động"
            unCheckedChildren="Tạm dừng"
            style={{ marginBottom: '4px' }}
          />
          {record.totalStock === 0 && (
            <div style={{ 
              fontSize: '10px', 
              color: '#ff4d4f',
              marginTop: '2px'
            }}>
              Hết hàng
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 120,
      render: (_, record) => {
        const actionMenu = [
          {
            key: 'view',
            icon: <EyeOutlined />,
            label: 'Xem chi tiết',
            onClick: () => console.log('View:', record._id)
          },
          {
            key: 'edit',
            icon: <EditOutlined />,
            label: 'Chỉnh sửa',
            onClick: () => handleEditProduct(record)
          },
          {
            key: 'duplicate',
            icon: <FileTextOutlined />,
            label: 'Nhân bản',
            onClick: () => console.log('Duplicate:', record._id)
          },
          {
            type: 'divider'
          },
          {
            key: 'delete',
            icon: <DeleteOutlined />,
            label: 'Xóa sản phẩm',
            danger: true,
            onClick: () => handleDeleteProduct(record._id)
          }
        ];

        return (
          <Space size="small">
            <Tooltip title="Xem chi tiết">
              <Button
                type="text"
                size="small"
                shape="circle"
                icon={<EyeOutlined />}
                onClick={() => console.log('View product:', record._id, record.name)}
                style={{ 
                  color: '#1890ff',
                  border: '1px solid #91d5ff'
                }}
              />
            </Tooltip>
            <Tooltip title="Chỉnh sửa">
              <Button
                type="text"
                size="small"
                shape="circle"
                icon={<EditOutlined />}
                onClick={() => handleEditProduct(record)}
                style={{ 
                  color: '#52c41a',
                  border: '1px solid #b7eb8f'
                }}
              />
            </Tooltip>
            <Dropdown menu={{ items: actionMenu }} trigger={['click']}>
              <Button
                type="text"
                size="small"
                shape="circle"
                icon={<MoreOutlined />}
                style={{ 
                  color: '#8c8c8c',
                  border: '1px solid #d9d9d9'
                }}
              />
            </Dropdown>
          </Space>
        );
      }
    }
  ];

  // Row selection
  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
    selections: [
      Table.SELECTION_ALL,
      Table.SELECTION_INVERT,
      Table.SELECTION_NONE
    ]
  };

  // Utility menu for bulk actions
  const utilityMenu = [
    {
      key: 'export',
      icon: <ExportOutlined />,
      label: 'Xuất Excel'
    },
    {
      key: 'import',
      icon: <ImportOutlined />,
      label: 'Nhập Excel'
    },
    {
      type: 'divider'
    },
    {
      key: 'bulk-edit',
      icon: <EditOutlined />,
      label: 'Chỉnh sửa hàng loạt'
    },
    {
      key: 'bulk-delete',
      icon: <DeleteOutlined />,
      label: 'Xóa hàng loạt',
      danger: true
    }
  ];

  return (
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
      <style>
        {`
          .table-row-light {
            background-color: #fafafa;
          }
          .table-row-dark {
            background-color: #fff;
          }
          .table-row-light:hover,
          .table-row-dark:hover {
            background-color: #e6f7ff !important;
          }
        `}
      </style>
      <Card
        style={{
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          border: 'none'
        }}
        styles={{ body: { padding: '24px' } }}
      >
        {/* Header Section */}
        <div style={{ 
          marginBottom: '24px',
          paddingBottom: '16px',
          borderBottom: '1px solid #f0f0f0'
        }}>
          <Row justify="space-between" align="middle">
            <Col>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Avatar 
                  size="large" 
                  icon={<ShoppingOutlined />}
                  style={{ 
                    backgroundColor: '#52c41a',
                    marginRight: '16px'
                  }}
                />
                <div>
                  <Title level={2} style={{ margin: 0, color: '#262626' }}>
                    Quản lý Sản phẩm
                  </Title>
                  <div style={{ color: '#8c8c8c', fontSize: '14px' }}>
                    Quản lý danh mục sản phẩm và tồn kho
                  </div>
                </div>
              </div>
            </Col>
            <Col>
              <Space size="middle">
                <Tooltip title="Làm mới dữ liệu">
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={() => fetchProducts(filters)}
                    loading={loading}
                    shape="circle"
                    size="large"
                  />
                </Tooltip>
                <Dropdown menu={{ items: utilityMenu }} trigger={['click']}>
                  <Button icon={<SettingOutlined />} size="large">
                    Tiện ích <DownOutlined />
                  </Button>
                </Dropdown>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAddProduct}
                  size="large"
                  style={{
                    borderRadius: '8px',
                    height: '40px',
                    paddingLeft: '20px',
                    paddingRight: '20px',
                    fontWeight: 500
                  }}
                >
                  Thêm sản phẩm
                </Button>
              </Space>
            </Col>
          </Row>
        </div>

        {/* Search and Quick Stats */}
        <Row gutter={16} style={{ marginBottom: '24px' }}>
          <Col span={12}>
            <Search
              placeholder="Tìm kiếm sản phẩm theo tên, SKU, thương hiệu..."
              allowClear
              onSearch={handleSearch}
              size="large"
              style={{ width: '100%' }}
              prefix={<SearchOutlined style={{ color: '#8c8c8c' }} />}
            />
          </Col>
          <Col span={12}>
            <Row gutter={16}>
              <Col span={8}>
                <Card size="small" style={{ textAlign: 'center' }}>
                  <Statistic
                    title="Tổng sản phẩm"
                    value={pagination?.total || 0}
                    prefix={<ShoppingOutlined />}
                    valueStyle={{ color: '#1890ff', fontSize: '18px' }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small" style={{ textAlign: 'center' }}>
                  <Statistic
                    title="Đang hoạt động"
                    value={products?.filter(p => p.isActive).length || 0}
                    prefix={<StarOutlined />}
                    valueStyle={{ color: '#52c41a', fontSize: '18px' }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small" style={{ textAlign: 'center' }}>
                  <Statistic
                    title="Hết hàng"
                    value={products?.filter(p => p.totalStock === 0).length || 0}
                    prefix={<TagsOutlined />}
                    valueStyle={{ color: '#ff4d4f', fontSize: '18px' }}
                  />
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>

        {/* Advanced Filters - Always Visible */}
        <Card 
          size="small" 
          style={{ 
            marginBottom: '24px',
            background: '#fafafa',
            border: '1px solid #f0f0f0'
          }}
        >
          <div style={{ marginBottom: '16px' }}>
            <Space>
              <FilterOutlined style={{ color: '#1890ff' }} />
              <Title level={5} style={{ margin: 0, color: '#262626' }}>
                Bộ lọc nâng cao
              </Title>
              <Button 
                type="link" 
                size="small"
                onClick={() => setShowFilters(!showFilters)}
                icon={showFilters ? <UpOutlined /> : <DownOutlined />}
              >
                {showFilters ? 'Thu gọn' : 'Mở rộng'}
              </Button>
            </Space>
          </div>
          
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item label="Danh mục" style={{ marginBottom: '8px' }}>
                <Select
                  placeholder="Chọn danh mục"
                  allowClear
                  value={filters.categoryId}
                  onChange={(value) => handleFilterChange('categoryId', value)}
                  options={categoryOptions || []}
                  size="large"
                  showSearch
                  filterOption={(input, option) =>
                    option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="Thương hiệu" style={{ marginBottom: '8px' }}>
                <Select
                  placeholder="Chọn thương hiệu"
                  allowClear
                  showSearch
                  value={filters.brandId}
                  onChange={(value) => handleFilterChange('brandId', value)}
                  size="large"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {/* This would be populated from brands API */}
                  <Option value="brand1">Thương hiệu 1</Option>
                  <Option value="brand2">Thương hiệu 2</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="Trạng thái" style={{ marginBottom: '8px' }}>
                <Select
                  placeholder="Chọn trạng thái"
                  allowClear
                  value={filters.isActive}
                  onChange={(value) => handleFilterChange('isActive', value)}
                  size="large"
                >
                  <Option value={true}>Hoạt động</Option>
                  <Option value={false}>Tạm dừng</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="Tồn kho" style={{ marginBottom: '8px' }}>
                <Select
                  placeholder="Chọn trạng thái tồn kho"
                  allowClear
                  size="large"
                >
                  <Option value="inStock">Còn hàng</Option>
                  <Option value="outOfStock">Hết hàng</Option>
                  <Option value="lowStock">Sắp hết hàng</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {showFilters && (
            <>
              <Divider style={{ margin: '16px 0' }} />
              <Row gutter={16}>
                <Col span={6}>
                  <Form.Item label="Giá từ" style={{ marginBottom: '8px' }}>
                    <InputNumber
                      placeholder="0"
                      value={filters.minPrice}
                      onChange={(value) => handleFilterChange('minPrice', value)}
                      style={{ width: '100%' }}
                      size="large"
                      formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={value => value.replace(/\$\s?|(,*)/g, '')}
                    />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label="Giá đến" style={{ marginBottom: '8px' }}>
                    <InputNumber
                      placeholder="999999999"
                      value={filters.maxPrice}
                      onChange={(value) => handleFilterChange('maxPrice', value)}
                      style={{ width: '100%' }}
                      size="large"
                      formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={value => value.replace(/\$\s?|(,*)/g, '')}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'end', 
                    height: '100%',
                    gap: '8px'
                  }}>
                    <Button 
                      type="primary" 
                      onClick={applyFilters}
                      size="large"
                      icon={<FilterOutlined />}
                    >
                      Áp dụng bộ lọc
                    </Button>
                    <Button 
                      onClick={resetFilters}
                      size="large"
                      icon={<ClearOutlined />}
                    >
                      Đặt lại
                    </Button>
                  </div>
                </Col>
              </Row>
            </>
          )}
        </Card>

        {/* Advanced Filters */}
        {showFilters && (
          <Card size="small" style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col span={6}>
                <Form.Item label="Giá từ">
                  <InputNumber
                    placeholder="0"
                    style={{ width: '100%' }}
                    value={filters.minPrice}
                    onChange={(value) => handleFilterChange('minPrice', value)}
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label="Giá đến">
                  <InputNumber
                    placeholder="1000000"
                    style={{ width: '100%' }}
                    value={filters.maxPrice}
                    onChange={(value) => handleFilterChange('maxPrice', value)}
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>
        )}

        <Divider />

        {/* Products Table */}
        <Card
          style={{
            borderRadius: '8px',
            border: '1px solid #f0f0f0',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
          }}
          styles={{ body: { padding: 0 } }}
        >
          <Table
            columns={columns}
            dataSource={products}
            rowKey={(record) => record._id}
            loading={loading}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  gap: '8px',
                  color: '#8c8c8c'
                }}>
                  <FileTextOutlined />
                  <span>
                    Hiển thị <strong style={{ color: '#262626' }}>{range[0]}-{range[1]}</strong> 
                    {' '}trong tổng số <strong style={{ color: '#262626' }}>{total}</strong> sản phẩm
                  </span>
                </div>
              ),
              pageSizeOptions: ['10', '20', '50', '100'],
              size: 'default'
            }}
            rowSelection={rowSelection}
            onChange={handleTableChange}
            scroll={{ x: 1200 }}
            style={{
              background: '#fff'
            }}
            rowClassName={(record, index) => 
              index % 2 === 0 ? 'table-row-light' : 'table-row-dark'
            }
          />
        </Card>

        {/* Bulk Actions */}
        {selectedRowKeys.length > 0 && (
          <Card 
            size="small" 
            style={{ 
              marginTop: '16px',
              background: '#f6ffed',
              border: '1px solid #b7eb8f',
              borderRadius: '8px'
            }}
          >
            <Row justify="space-between" align="middle">
              <Col>
                <Space>
                  <Badge 
                    count={selectedRowKeys.length} 
                    style={{ backgroundColor: '#52c41a' }}
                  />
                  <span style={{ color: '#262626', fontWeight: 500 }}>
                    Đã chọn {selectedRowKeys.length} sản phẩm
                  </span>
                </Space>
              </Col>
              <Col>
                <Space>
                  <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={() => handleBulkStatusUpdate(true)}
                  >
                    Kích hoạt đã chọn
                  </Button>
                  <Button
                    icon={<SettingOutlined />}
                    onClick={() => handleBulkStatusUpdate(false)}
                  >
                    Tạm dừng đã chọn
                  </Button>
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={handleBulkDelete}
                  >
                    Xóa đã chọn
                  </Button>
                  <Button 
                    onClick={() => setSelectedRowKeys([])}
                    icon={<ClearOutlined />}
                  >
                    Bỏ chọn
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>
        )}

        {/* Product Form Modal */}
        <ProductForm
          visible={isProductFormVisible}
          onCancel={handleProductFormClose}
          onSubmit={handleProductFormSubmit}
          initialValues={editingProduct}
          isEditing={!!editingProduct}
        />
      </Card>
    </div>
  );
};

export default ProductManagement;

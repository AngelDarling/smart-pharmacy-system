/**
 * Simplified Product Management Page
 * Focuses on essential product management features
 */

import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Input,
  Select,
  TreeSelect,
  Tag,
  Avatar,
  Popconfirm,
  Tooltip,
  Row,
  Col,
  Form,
  InputNumber,
  Switch,
  Badge,
  Statistic,
  Modal,
  message
} from 'antd';

const { Search } = Input;
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  ShoppingOutlined,
  StarOutlined,
  TagsOutlined,
  DollarOutlined
} from '@ant-design/icons';
import { useProducts } from '../../../hooks/admin/useProducts';
import { getImageUrl, handleImageError } from '../../../utils/imageUtils';
import { useCategories } from '../../../hooks/admin/useCategories';
import ProductForm from '../../../components/admin/ProductForm';

const { Option } = Select;

const ProductManagement = () => {
  const {
    products,
    loading,
    pagination,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    updateProductStatus,
    bulkUpdateProducts,
    handleTableChange,
    fetchBrands
  } = useProducts();

  const { categories, getTreeSelectData } = useCategories();

  const [filters, setFilters] = useState({
    search: '',
    categoryId: '',
    brandId: '',
    isActive: undefined
  });
  const [brandOptions, setBrandOptions] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [isProductFormVisible, setIsProductFormVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [viewingProduct, setViewingProduct] = useState(null);

  // Fetch brands for filter
  useEffect(() => {
    (async () => {
      try {
        const list = await fetchBrands();
        setBrandOptions(Array.isArray(list) ? list : []);
      } catch {}
    })();
  }, [fetchBrands]);

  // Fetch products on mount, support prefilled brandSlug (preferred) or brandId from query
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const brandSlug = params.get('brandSlug');
    const brandId = params.get('brandId');
    if (brandSlug) {
      const newFilters = { ...filters, brandSlug };
      setFilters(newFilters);
      fetchProducts(newFilters);
    } else if (brandId) {
      const newFilters = { ...filters, brandId };
      setFilters(newFilters);
      fetchProducts(newFilters);
    } else {
      fetchProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Remove fetchProducts from dependencies to prevent infinite loop

  // Category options for filtering
  const categoryOptions = getTreeSelectData(categories);

  // Handle filter change
  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    // Auto apply filter when changed
    fetchProducts(newFilters);
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
      isActive: undefined
    });
    fetchProducts({});
  };

  // Handle search
  const handleSearch = (value) => {
    const newFilters = { ...filters, search: value };
    setFilters(newFilters);
    fetchProducts(newFilters);
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

  // Handle view product details
  const handleViewProduct = (product) => {
    setViewingProduct(product);
    setIsDetailModalVisible(true);
  };

  // Handle close detail modal
  const handleCloseDetailModal = () => {
    setIsDetailModalVisible(false);
    setViewingProduct(null);
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
          src={getImageUrl(imageUrls?.[0], '/default-product.png')}
          style={{ 
            borderRadius: '8px',
            border: '2px solid #f0f0f0'
          }}
          alt={record.name}
          onError={(e) => handleImageError(e, '/default-product.png')}
        >
          <ShoppingOutlined />
        </Avatar>
      )
    },
    {
      title: 'Thông tin sản phẩm',
      dataIndex: 'name',
      key: 'name',
      width: 300,
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
            SKU: {record.sku || '-'}
          </div>
          {record.shortDescription && (
            <div style={{ 
              fontSize: '11px', 
              color: '#8c8c8c',
              fontStyle: 'italic',
              lineHeight: '1.3'
            }}>
              {record.shortDescription.length > 80 
                ? `${record.shortDescription.substring(0, 80)}...` 
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
              {record.categoryId?.name || record.categoryId || 'Chưa phân loại'}
            </Tag>
          </div>
          {record.brandId && (
            <div style={{ marginBottom: '4px' }}>
              <Tag color="green" style={{ marginBottom: '2px' }}>
                {record.brandId.name || record.brandId}
              </Tag>
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Giá & Tồn kho',
      key: 'priceStock',
      width: 220,
      render: (_, record) => {
        // Kiểm tra có giảm giá không (từ direct coupon hoặc promotionInfo)
        const hasDiscount = record.finalPrice !== undefined && 
                           record.finalPrice < record.price && 
                           record.discount > 0;
        const displayPrice = hasDiscount ? record.finalPrice : record.price;
        const originalPrice = hasDiscount ? (record.originalPrice || record.price) : null;
        
        return (
          <div>
            <div style={{ marginBottom: '4px' }}>
              {hasDiscount ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <div style={{ 
                    fontSize: '14px', 
                    fontWeight: 600, 
                    color: '#3b82f6',
                  }}>
                    Giá bán: {displayPrice?.toLocaleString() || 0}đ
                  </div>
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#9ca3af',
                    textDecoration: 'line-through'
                  }}>
                    {originalPrice?.toLocaleString() || 0}đ
                  </div>
                  {record.discount > 0 && (
                    <div style={{ 
                      fontSize: '11px', 
                      color: '#ef4444',
                      fontWeight: 500
                    }}>
                      Giảm {record.discountType === 'percent' 
                        ? `${record.discount}%` 
                        : `${(record.discountValue || 0).toLocaleString()}đ`}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ 
                  fontSize: '14px', 
                  fontWeight: 600, 
                  color: '#52c41a',
                }}>
                  Giá bán: {record.price?.toLocaleString() || 0}đ
                </div>
              )}
            </div>
            <div style={{ 
              fontSize: '12px', 
              color: '#8c8c8c',
              marginBottom: '8px'
            }}>
              Giá nhập: {record.costPrice?.toLocaleString() || 0}đ
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ 
                fontSize: '14px', 
                fontWeight: 500,
                color: record.totalStock > 0 ? '#52c41a' : '#ff4d4f'
              }}>
                {record.totalStock || 0}
              </span>
              <span style={{ fontSize: '12px', color: '#8c8c8c' }}>
                {record.unit || 'sản phẩm'}
              </span>
            </div>
          </div>
        );
      }
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'status',
      width: 120,
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
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              size="small"
              shape="circle"
              icon={<EyeOutlined />}
              onClick={() => handleViewProduct(record)}
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
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa sản phẩm này?"
            onConfirm={() => handleDeleteProduct(record._id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Tooltip title="Xóa">
              <Button
                type="text"
                size="small"
                shape="circle"
                icon={<DeleteOutlined />}
                style={{ 
                  color: '#ff4d4f',
                  border: '1px solid #ffccc7'
                }}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
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
            icon={<ShoppingOutlined />}
            style={{ 
              backgroundColor: '#52c41a',
              marginRight: '16px'
            }}
          />
          <div>
            <h2 style={{ margin: 0, color: '#262626' }}>
              Quản lý Sản phẩm
            </h2>
            <div style={{ color: '#8c8c8c', fontSize: '14px' }}>
              Quản lý danh mục sản phẩm và tồn kho
            </div>
          </div>
        </div>
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
      </div>

      {/* Search and Quick Stats */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <div style={{ flex: 1 }}>
          <Search
            placeholder="Tìm kiếm sản phẩm theo tên, SKU..."
            allowClear
            onSearch={handleSearch}
            size="large"
            style={{ width: '100%' }}
            prefix={<SearchOutlined style={{ color: '#8c8c8c' }} />}
          />
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ 
            padding: '16px', 
            background: '#fff', 
            borderRadius: '8px', 
            border: '1px solid #f0f0f0',
            textAlign: 'center',
            minWidth: '150px'
          }}>
            <Statistic
              title="Tổng sản phẩm"
              value={pagination?.total || 0}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: '#1890ff', fontSize: '18px' }}
            />
          </div>
          <div style={{ 
            padding: '16px', 
            background: '#fff', 
            borderRadius: '8px', 
            border: '1px solid #f0f0f0',
            textAlign: 'center',
            minWidth: '150px'
          }}>
            <Statistic
              title="Đang hoạt động"
              value={products?.filter(p => p.isActive).length || 0}
              prefix={<StarOutlined />}
              valueStyle={{ color: '#52c41a', fontSize: '18px' }}
            />
          </div>
          <div style={{ 
            padding: '16px', 
            background: '#fff', 
            borderRadius: '8px', 
            border: '1px solid #f0f0f0',
            textAlign: 'center',
            minWidth: '150px'
          }}>
            <Statistic
              title="Hết hàng"
              value={products?.filter(p => p.totalStock === 0).length || 0}
              prefix={<TagsOutlined />}
              valueStyle={{ color: '#ff4d4f', fontSize: '18px' }}
            />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ 
        display: 'flex',
        gap: 16,
        marginBottom: 24,
        padding: '16px',
        background: '#fafafa',
        borderRadius: '8px',
        border: '1px solid #f0f0f0',
        flexWrap: 'wrap',
        alignItems: 'end'
      }}>
        <Form.Item label="Danh mục" style={{ marginBottom: 0, flex: '1 1 200px' }}>
          <TreeSelect
            placeholder="Chọn danh mục"
            allowClear
            value={filters.categoryId}
            onChange={(value) => handleFilterChange('categoryId', value)}
            treeData={categoryOptions || []}
            treeDefaultExpandAll
            size="large"
            showSearch
            filterTreeNode={(input, node) =>
              node.title.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          />
        </Form.Item>
        <Form.Item label="Thương hiệu" style={{ marginBottom: 0, flex: '1 1 200px' }}>
          <Select
            placeholder="Chọn thương hiệu"
            allowClear
            size="large"
            value={filters.brandId || undefined}
            onChange={(value, option) => {
              // Khi chọn thương hiệu, dùng brandSlug để filter đẹp URL, nhưng API hiện nhận brandId/brandSlug đều được
              const selected = brandOptions.find(b => b._id === value);
              const nf = { ...filters, brandId: value || '', brandSlug: selected?.slug || undefined };
              setFilters(nf);
              fetchProducts(nf);
            }}
            showSearch
            optionFilterProp="children"
          >
            {brandOptions.map((b) => (
              <Option key={b._id} value={b._id}>{b.name}</Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="Trạng thái" style={{ marginBottom: 0, flex: '1 1 200px' }}>
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
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button 
            type="primary" 
            onClick={applyFilters}
            size="large"
          >
            Áp dụng bộ lọc
          </Button>
          <Button 
            onClick={resetFilters}
            size="large"
          >
            Đặt lại
          </Button>
        </div>
      </div>

      {/* Products Table */}
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
        onChange={(p, f, s) => {
          const payload = { ...filters, page: p.current, limit: p.pageSize };
          if (s && s.field) {
            payload.sortBy = s.order === 'ascend' ? s.field : `-${s.field}`;
          }
          fetchProducts(payload);
        }}
        scroll={{ x: 1000 }}
        style={{
          background: '#fff'
        }}
      />

      {/* Bulk Actions */}
      {selectedRowKeys.length > 0 && (
        <div style={{ 
          marginTop: 16,
          padding: '16px',
          background: '#f6ffed',
          border: '1px solid #b7eb8f',
          borderRadius: '8px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Space>
            <Badge 
              count={selectedRowKeys.length} 
              style={{ backgroundColor: '#52c41a' }}
            />
            <span style={{ color: '#262626', fontWeight: 500 }}>
              Đã chọn {selectedRowKeys.length} sản phẩm
            </span>
          </Space>
          <Space>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => bulkUpdateProducts(selectedRowKeys, { isActive: true })}
            >
              Kích hoạt đã chọn
            </Button>
            <Button
              icon={<EditOutlined />}
              onClick={() => bulkUpdateProducts(selectedRowKeys, { isActive: false })}
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
            >
              Bỏ chọn
            </Button>
          </Space>
        </div>
      )}

      {/* Product Form Modal */}
      <ProductForm
        visible={isProductFormVisible}
        onCancel={handleProductFormClose}
        onSubmit={handleProductFormSubmit}
        initialValues={editingProduct}
        isEditing={!!editingProduct}
      />

      {/* Product Detail Modal */}
      <Modal
        title="Chi tiết sản phẩm"
        open={isDetailModalVisible}
        onCancel={handleCloseDetailModal}
        footer={[
          <Button key="close" onClick={handleCloseDetailModal}>
            Đóng
          </Button>
        ]}
        width={800}
      >
        {viewingProduct && (
          <div>
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <div style={{ 
                  padding: '16px', 
                  background: '#fafafa', 
                  borderRadius: '8px', 
                  border: '1px solid #f0f0f0',
                  marginBottom: 16
                }}>
                  <h3 style={{ marginTop: 0, marginBottom: 16 }}>Thông tin cơ bản</h3>
                    <Row gutter={16}>
                      <Col span={12}>
                        <div style={{ marginBottom: '12px' }}>
                          <strong>Tên sản phẩm:</strong>
                          <div style={{ marginTop: '4px' }}>{viewingProduct.name}</div>
                        </div>
                        <div style={{ marginBottom: '12px' }}>
                          <strong>Slug:</strong>
                          <div style={{ marginTop: '4px' }}>{viewingProduct.slug}</div>
                        </div>
                        <div style={{ marginBottom: '12px' }}>
                          <strong>Danh mục:</strong>
                          <div style={{ marginTop: '4px' }}>
                            <Tag color="blue">
                              {viewingProduct.categoryId?.name || viewingProduct.categoryId || 'Chưa phân loại'}
                            </Tag>
                          </div>
                        </div>
                        <div style={{ marginBottom: '12px' }}>
                          <strong>Thương hiệu:</strong>
                          <div style={{ marginTop: '4px' }}>
                            {viewingProduct.brandId ? (
                              <Tag color="green">{viewingProduct.brandId.name || viewingProduct.brandId}</Tag>
                            ) : (
                              <span style={{ color: '#8c8c8c' }}>Chưa có thương hiệu</span>
                            )}
                          </div>
                        </div>
                      </Col>
                      <Col span={12}>
                        <div style={{ marginBottom: '12px' }}>
                          <strong>SKU:</strong>
                          <div style={{ marginTop: '4px' }}>
                            {viewingProduct.sku || <span style={{ color: '#8c8c8c' }}>Chưa có SKU</span>}
                          </div>
                        </div>
                        <div style={{ marginBottom: '12px' }}>
                          <strong>Barcode:</strong>
                          <div style={{ marginTop: '4px' }}>
                            {viewingProduct.barcode || <span style={{ color: '#8c8c8c' }}>Chưa có barcode</span>}
                          </div>
                        </div>
                        <div style={{ marginBottom: '12px' }}>
                          <strong>Đơn vị:</strong>
                          <div style={{ marginTop: '4px' }}>
                            {viewingProduct.unit || <span style={{ color: '#8c8c8c' }}>Chưa có đơn vị</span>}
                          </div>
                        </div>
                        <div style={{ marginBottom: '12px' }}>
                          <strong>Trạng thái:</strong>
                          <div style={{ marginTop: '4px' }}>
                            <Tag color={viewingProduct.isActive ? 'green' : 'red'}>
                              {viewingProduct.isActive ? 'Hoạt động' : 'Tạm dừng'}
                            </Tag>
                          </div>
                        </div>
                      </Col>
                    </Row>
                </div>
              </Col>

              <Col span={24}>
                <div style={{ 
                  padding: '16px', 
                  background: '#fafafa', 
                  borderRadius: '8px', 
                  border: '1px solid #f0f0f0',
                  marginBottom: 16
                }}>
                  <h3 style={{ marginTop: 0, marginBottom: 16 }}>Thông tin giá và tồn kho</h3>
                  <Row gutter={16}>
                    <Col span={8}>
                      <Statistic
                        title="Giá thu (Giá bán)"
                        value={viewingProduct.price || 0}
                        formatter={(value) => `${value?.toLocaleString() || 0}đ`}
                        valueStyle={{ color: '#52c41a' }}
                      />
                    </Col>
                    <Col span={8}>
                      <Statistic
                        title="Giá nhập"
                        value={viewingProduct.costPrice || 0}
                        formatter={(value) => `${value?.toLocaleString() || 0}đ`}
                        valueStyle={{ color: '#1890ff' }}
                      />
                    </Col>
                    <Col span={8}>
                      <Statistic
                        title="Tồn kho"
                        value={viewingProduct.totalStock || 0}
                        valueStyle={{ 
                          color: viewingProduct.totalStock > 0 ? '#52c41a' : '#ff4d4f' 
                        }}
                      />
                    </Col>
                  </Row>
                </div>
              </Col>

              {(viewingProduct.shortDescription || viewingProduct.description) && (
                <Col span={24}>
                  <div style={{ 
                    padding: '16px', 
                    background: '#fafafa', 
                    borderRadius: '8px', 
                    border: '1px solid #f0f0f0',
                    marginBottom: 16
                  }}>
                    <h3 style={{ marginTop: 0, marginBottom: 16 }}>Mô tả sản phẩm</h3>
                    {viewingProduct.shortDescription && (
                      <div style={{ marginBottom: '16px' }}>
                        <strong>Mô tả ngắn:</strong>
                        <div style={{ marginTop: '8px', padding: '8px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                          {viewingProduct.shortDescription}
                        </div>
                      </div>
                    )}
                    {viewingProduct.description && (
                      <div>
                        <strong>Mô tả chi tiết:</strong>
                        <div style={{ marginTop: '8px', padding: '8px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                          {viewingProduct.description}
                        </div>
                      </div>
                    )}
                  </div>
                </Col>
              )}

              {viewingProduct.imageUrls && viewingProduct.imageUrls.length > 0 && (
                <Col span={24}>
                  <div style={{ 
                    padding: '16px', 
                    background: '#fafafa', 
                    borderRadius: '8px', 
                    border: '1px solid #f0f0f0',
                    marginBottom: 16
                  }}>
                    <h3 style={{ marginTop: 0, marginBottom: 16 }}>Hình ảnh sản phẩm</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {viewingProduct.imageUrls.map((url, index) => (
                        <div key={index} style={{ width: '120px', height: '120px' }}>
                          <img
                            src={getImageUrl(url)}
                            alt={`Product ${index + 1}`}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              borderRadius: '4px',
                              border: '1px solid #d9d9d9'
                            }}
                            onError={(e) => handleImageError(e, '/default-product.png')}
                          />
                          <div
                            style={{
                              width: '100%',
                              height: '100%',
                              display: 'none',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: '#f5f5f5',
                              borderRadius: '4px',
                              border: '1px solid #d9d9d9',
                              fontSize: '12px',
                              color: '#8c8c8c'
                            }}
                          >
                            Lỗi tải ảnh
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Col>
              )}

              <Col span={24}>
                <div style={{ 
                  padding: '16px', 
                  background: '#fafafa', 
                  borderRadius: '8px', 
                  border: '1px solid #f0f0f0',
                  marginBottom: 16
                }}>
                  <h3 style={{ marginTop: 0, marginBottom: 16 }}>Thông tin bổ sung</h3>
                  <Row gutter={16}>
                    <Col span={12}>
                      <div style={{ marginBottom: '12px' }}>
                        <strong>Ngày tạo:</strong>
                        <div style={{ marginTop: '4px' }}>
                          {viewingProduct.createdAt ? new Date(viewingProduct.createdAt).toLocaleString('vi-VN') : 'N/A'}
                        </div>
                      </div>
                      <div style={{ marginBottom: '12px' }}>
                        <strong>Ngày cập nhật:</strong>
                        <div style={{ marginTop: '4px' }}>
                          {viewingProduct.updatedAt ? new Date(viewingProduct.updatedAt).toLocaleString('vi-VN') : 'N/A'}
                        </div>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div style={{ marginBottom: '12px' }}>
                        <strong>Tính năng đặc biệt:</strong>
                        <div style={{ marginTop: '4px' }}>
                          <Space wrap>
                            {viewingProduct.isFeatured && <Tag color="gold">Nổi bật</Tag>}
                            {viewingProduct.isNewProduct && <Tag color="blue">Sản phẩm mới</Tag>}
                            {viewingProduct.isBestSeller && <Tag color="red">Bán chạy</Tag>}
                            {!viewingProduct.isFeatured && !viewingProduct.isNewProduct && !viewingProduct.isBestSeller && (
                              <span style={{ color: '#8c8c8c' }}>Không có</span>
                            )}
                          </Space>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </div>
              </Col>
              </Row>
            </div>
          )}
        </Modal>
    </div>
  );
};

export default ProductManagement;
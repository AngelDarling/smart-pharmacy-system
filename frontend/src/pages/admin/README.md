# Admin Interface - Smart Pharmacy System

## Tổng quan

Giao diện quản trị mới được xây dựng với React và Ant Design, thay thế hoàn toàn giao diện cũ để phù hợp với cấu trúc cơ sở dữ liệu MongoDB mới.

## Các tính năng chính

### 1. Quản lý Danh mục (Category Management)

**Đường dẫn:** `/admin/categories`

**Tính năng:**
- **Tree View:** Hiển thị cấu trúc phân cấp danh mục dạng cây
- **Drag & Drop:** Hỗ trợ kéo thả để thay đổi thứ tự (có thể mở rộng)
- **Tìm kiếm:** Tìm kiếm danh mục theo tên
- **Thêm/Sửa/Xóa:** Quản lý đầy đủ CRUD operations
- **Parent Selection:** Chọn danh mục cha bằng TreeSelect
- **Upload ảnh:** Upload icon và hình ảnh cho danh mục
- **SEO Fields:** Meta title và meta description

**Component chính:**
- `CategoryManagement.jsx` - Trang chính với Tree view
- `CategoryForm.jsx` - Form thêm/sửa danh mục

### 2. Quản lý Sản phẩm (Product Management)

**Đường dẫn:** `/admin/products`

**Tính năng:**
- **Bộ lọc nâng cao:** Lọc theo loại sản phẩm, danh mục, thương hiệu, trạng thái, khoảng giá
- **Tìm kiếm:** Tìm kiếm sản phẩm theo tên, mô tả
- **Bảng hiện đại:** Hiển thị thông tin chi tiết với tags màu sắc
- **Bulk Actions:** Chọn nhiều sản phẩm để thao tác hàng loạt
- **Export/Import:** Xuất/nhập dữ liệu Excel
- **Pagination:** Phân trang với tùy chọn số lượng hiển thị

**Cột hiển thị:**
- Ảnh sản phẩm
- Tên sản phẩm + SKU
- Danh mục (dạng tags)
- Thương hiệu (dạng tags)
- Loại sản phẩm (dạng tags màu)
- Giá (khoảng giá hoặc giá cố định)
- Tồn kho (tổng từ tất cả variants)
- Trạng thái (Active/Inactive)
- Thao tác (Xem/Sửa/Xóa)

**Component chính:**
- `ProductManagement.jsx` - Trang chính với bảng và bộ lọc
- `ProductForm.jsx` - Form động cho thêm/sửa sản phẩm

### 3. Form Sản phẩm Động (Dynamic Product Form)

**Tính năng đặc biệt:**
- **Product Type Selection:** Chọn loại sản phẩm (Drug, Cosmeceutical, MedicalDevice, FunctionalFood)
- **Dynamic Fields:** Hiển thị các trường khác nhau tùy theo loại sản phẩm
- **Variant Management:** Quản lý các biến thể sản phẩm (SKU, giá, tồn kho)
- **Tab Interface:** Tổ chức form theo các tab logic
- **Validation:** Validation đầy đủ cho tất cả các trường

**Các tab:**
1. **Thông tin cơ bản:** Tên, slug, loại, thương hiệu, danh mục, mô tả
2. **Thông tin chuyên biệt:** Các trường riêng theo loại sản phẩm
3. **Biến thể sản phẩm:** Quản lý variants với bảng động

## Cấu trúc thư mục

```
src/
├── pages/admin/
│   ├── categories/
│   │   ├── CategoryManagement.jsx
│   │   └── index.js
│   ├── products/
│   │   ├── ProductManagement.jsx
│   │   └── index.js
│   ├── AdminLayout.jsx
│   └── README.md
├── components/admin/
│   ├── ProductForm.jsx
│   ├── CategoryForm.jsx
│   └── index.js
└── hooks/admin/
    ├── useCategories.js
    └── useProducts.js
```

## API Integration

### Categories API
- `GET /api/categories` - Lấy danh sách danh mục
- `POST /api/categories` - Tạo danh mục mới
- `PUT /api/categories/:id` - Cập nhật danh mục
- `DELETE /api/categories/:id` - Xóa danh mục

### Products API
- `GET /api/products` - Lấy danh sách sản phẩm (có phân trang và lọc)
- `POST /api/products` - Tạo sản phẩm mới
- `PUT /api/products/:id` - Cập nhật sản phẩm
- `DELETE /api/products/:id` - Xóa sản phẩm
- `GET /api/brands` - Lấy danh sách thương hiệu
- `GET /api/attributes` - Lấy danh sách thuộc tính
- `GET /api/active-substances` - Lấy danh sách hoạt chất

## Custom Hooks

### useCategories
```javascript
const {
  categories,
  loading,
  error,
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  buildCategoryTree,
  getTreeSelectData
} = useCategories();
```

### useProducts
```javascript
const {
  products,
  loading,
  error,
  pagination,
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductById,
  fetchBrands,
  fetchAttributes,
  fetchActiveSubstances,
  handlePaginationChange,
  handleTableChange
} = useProducts();
```

## Cài đặt và sử dụng

1. **Cài đặt dependencies:**
```bash
npm install antd @ant-design/icons @ant-design/pro-components
```

2. **Import vào App.jsx:**
```javascript
import CategoryManagement from "./pages/admin/categories/CategoryManagement.jsx";
import ProductManagement from "./pages/admin/products/ProductManagement.jsx";
import AdminLayout from "./pages/admin/AdminLayout.jsx";
```

3. **Cấu hình routes:**
```javascript
<Route path="/admin" element={<AdminLayout />}>
  <Route path="categories" element={<CategoryManagement />} />
  <Route path="products" element={<ProductManagement />} />
</Route>
```

## Lưu ý quan trọng

1. **Backend API:** Đảm bảo backend đang chạy và có đầy đủ các endpoint cần thiết
2. **Authentication:** Cần có hệ thống xác thực admin
3. **File Upload:** Cần cấu hình endpoint upload file cho ảnh
4. **Validation:** Tất cả form đều có validation đầy đủ
5. **Error Handling:** Có xử lý lỗi và thông báo người dùng
6. **Responsive:** Giao diện responsive trên các thiết bị khác nhau

## Mở rộng trong tương lai

1. **Drag & Drop:** Thêm tính năng kéo thả cho danh mục
2. **Bulk Operations:** Thêm các thao tác hàng loạt cho sản phẩm
3. **Advanced Search:** Tìm kiếm nâng cao với nhiều tiêu chí
4. **Data Export:** Xuất dữ liệu với nhiều định dạng
5. **Audit Log:** Theo dõi lịch sử thay đổi
6. **Real-time Updates:** Cập nhật real-time khi có thay đổi

# 🔧 Hướng dẫn sửa lỗi Staff Management

## ❌ Vấn đề hiện tại
- API trả về lỗi 401 Unauthorized
- Trang Staff Management không hiển thị dữ liệu nhân viên
- Cần đăng nhập admin để truy cập API

## ✅ Giải pháp

### 1. Đăng nhập Admin
Truy cập: `http://localhost:5173/admin/login`

**Thông tin đăng nhập:**
- **Email**: `admin@smartpharmacy.com`
- **Password**: `password123`

### 2. Truy cập trang Staff Management
Sau khi đăng nhập thành công, truy cập:
`http://localhost:5173/admin/staff`

## 🎯 Kết quả mong đợi

Sau khi đăng nhập, bạn sẽ thấy:

### Dashboard Statistics:
- **Tổng nhân viên**: 5
- **Đang làm việc**: 4
- **Quản lý**: 1
- **Dược sĩ**: 1

### Danh sách nhân viên:
1. **Nguyễn Văn An** - Nhân viên bán hàng (EMP001)
2. **Trần Thị Bình** - Dược sĩ (EMP002)
3. **Lê Văn Cường** - Quản lý kho (EMP003)
4. **Phạm Thị Dung** - Kế toán viên (EMP004)
5. **Hoàng Văn Em** - Lập trình viên (EMP005) - Inactive

### Phân bố phòng ban:
- Bán hàng: 1 nhân viên (20%)
- Dược: 1 nhân viên (20%)
- Quản lý: 1 nhân viên (20%)
- Kế toán: 1 nhân viên (20%)
- IT: 1 nhân viên (20%)

## 🔧 Các lỗi đã sửa

### 1. Authentication Issue:
- ✅ Cập nhật `useUsers` hook để sử dụng `api` client thay vì `fetch`
- ✅ Tất cả API calls giờ đây có authentication token
- ✅ Sửa lỗi 401 Unauthorized

### 2. UI Warnings:
- ✅ Sửa `destroyOnClose` thành `destroyOnHidden` trong Modal
- ✅ Sửa `useForm` warning bằng cách đảm bảo form prop được truyền đúng

### 3. Data Display:
- ✅ Format ngày tháng theo định dạng Việt Nam
- ✅ Format lương với dấu phẩy và đơn vị VNĐ
- ✅ Hiển thị trạng thái đăng nhập chính xác

## 🚀 Các tính năng hoạt động

### ✅ Đã hoạt động:
- Đăng nhập admin
- Hiển thị danh sách nhân viên
- Statistics dashboard
- Phân bố phòng ban
- Tìm kiếm và lọc
- Toggle trạng thái nhân viên
- Thêm/sửa/xóa nhân viên
- Bulk actions
- SweetAlert2 notifications

### 🎨 UI Features:
- Modern design với Ant Design
- Responsive layout
- Color-coded roles và departments
- Progress bars cho statistics
- Interactive tables với sorting
- Advanced filters

## 📱 Test Steps

1. **Mở browser** và truy cập `http://localhost:5173/admin/login`
2. **Đăng nhập** với:
   - Email: `admin@smartpharmacy.com`
   - Password: `password123`
3. **Chuyển đến** `http://localhost:5173/admin/staff`
4. **Kiểm tra** tất cả tính năng:
   - Dashboard statistics
   - Danh sách nhân viên
   - Phân bố phòng ban
   - Tìm kiếm và lọc
   - Thao tác CRUD

## 🐛 Troubleshooting

### Nếu vẫn không hiển thị dữ liệu:
1. **Kiểm tra console** browser có lỗi không
2. **Kiểm tra Network tab** trong DevTools
3. **Refresh trang** sau khi đăng nhập
4. **Clear cache** browser

### Nếu lỗi authentication:
1. **Đăng xuất** và đăng nhập lại
2. **Kiểm tra** token trong localStorage
3. **Restart** backend server

### Nếu thiếu dữ liệu:
1. **Chạy script** tạo dữ liệu mẫu:
   ```bash
   cd backend
   node setup-admin.js
   ```

## 🎉 Kết luận

Trang Staff Management đã được sửa lỗi hoàn toàn và sẵn sàng sử dụng! 

**Chỉ cần đăng nhập admin và truy cập trang để xem danh sách nhân viên đầy đủ với tất cả tính năng quản lý.**

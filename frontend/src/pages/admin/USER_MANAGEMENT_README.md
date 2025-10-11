# Quản lý Người dùng và Nhân viên

## 🎯 Tổng quan

Hệ thống quản lý người dùng và nhân viên cho Smart Pharmacy với các tính năng:

- **Quản lý Người dùng**: Quản lý tất cả người dùng trong hệ thống (khách hàng, nhân viên, quản lý, dược sĩ, admin)
- **Quản lý Nhân viên**: Quản lý chuyên biệt cho nhân viên với thông tin công việc chi tiết
- **Phân quyền**: Hệ thống phân quyền chi tiết với permissions
- **Thống kê**: Dashboard thống kê người dùng và nhân viên

## 🚀 Tính năng chính

### 1. Quản lý Người dùng (`/admin/users`)

#### Thông tin cơ bản:
- Họ và tên, email, số điện thoại, địa chỉ
- Vai trò: Khách hàng, Nhân viên, Quản lý, Dược sĩ, Quản trị viên
- Trạng thái hoạt động (Active/Inactive)

#### Thông tin nhân viên:
- Mã nhân viên (Employee ID)
- Phòng ban: Bán hàng, Kho, Kế toán, Dược, Quản lý, IT, Marketing
- Chức vụ: Tùy theo phòng ban
- Ngày tuyển dụng
- Lương cơ bản

#### Phân quyền:
- **Sản phẩm**: Xem, Thêm/sửa, Xóa
- **Danh mục**: Xem, Thêm/sửa, Xóa
- **Người dùng**: Xem, Thêm/sửa, Xóa
- **Đơn hàng**: Xem, Thêm/sửa, Xóa
- **Tồn kho**: Xem, Cập nhật, Xóa
- **Báo cáo**: Xem, Tạo
- **Hệ thống**: Quản lý nhân viên, Quản lý cài đặt

### 2. Quản lý Nhân viên (`/admin/staff`)

#### Tính năng đặc biệt:
- **Lọc theo vai trò**: Chỉ hiển thị nhân viên (staff, manager, pharmacist, admin)
- **Phân bố phòng ban**: Biểu đồ phân bố nhân viên theo phòng ban
- **Thống kê chi tiết**: Số lượng nhân viên theo vai trò và phòng ban
- **Thông tin công việc**: Ngày tuyển dụng, lương, chức vụ

## 📊 Dashboard Thống kê

### Thống kê tổng quan:
- **Tổng người dùng**: Tất cả người dùng trong hệ thống
- **Đang hoạt động**: Người dùng có trạng thái active
- **Nhân viên**: Tổng số nhân viên (staff + manager + pharmacist + admin)
- **Khách hàng**: Số lượng khách hàng

### Thống kê nhân viên:
- **Tổng nhân viên**: Tất cả nhân viên
- **Đang làm việc**: Nhân viên active
- **Quản lý**: Manager + Admin
- **Dược sĩ**: Pharmacist

### Phân bố phòng ban:
- Biểu đồ phân bố nhân viên theo phòng ban
- Progress bar hiển thị tỷ lệ phần trăm

## 🔧 API Endpoints

### Users API (`/api/users`)

```javascript
// Lấy danh sách người dùng
GET /api/users?page=1&limit=20&role=staff&isActive=true&search=john

// Lấy thống kê
GET /api/users/stats

// Lấy thông tin người dùng
GET /api/users/:id

// Tạo người dùng mới
POST /api/users
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "staff",
  "employeeId": "EMP001",
  "department": "Bán hàng",
  "position": "Nhân viên bán hàng",
  "hireDate": "2024-01-01",
  "salary": 8000000,
  "permissions": ["read_products", "write_products"]
}

// Cập nhật người dùng
PUT /api/users/:id

// Xóa người dùng
DELETE /api/users/:id

// Toggle trạng thái
PATCH /api/users/:id/toggle-status

// Cập nhật hàng loạt
PUT /api/users/bulk-update
{
  "userIds": ["id1", "id2", "id3"],
  "updateData": { "isActive": false }
}
```

## 🎨 Giao diện

### User Management:
- **Bảng danh sách**: Hiển thị thông tin chi tiết với avatar, thông tin liên hệ
- **Bộ lọc nâng cao**: Lọc theo vai trò, phòng ban, trạng thái
- **Tìm kiếm**: Tìm theo tên, email, mã nhân viên
- **Thao tác**: Xem, sửa, xóa, toggle trạng thái
- **Bulk actions**: Kích hoạt/tạm dừng/xóa hàng loạt

### Staff Management:
- **Dashboard thống kê**: Cards hiển thị số liệu quan trọng
- **Phân bố phòng ban**: Progress bars và biểu đồ
- **Bảng nhân viên**: Thông tin công việc chi tiết
- **Lọc chuyên biệt**: Chỉ hiển thị nhân viên

### User Form:
- **Thông tin cơ bản**: Tên, email, phone, địa chỉ, vai trò
- **Mật khẩu**: Chỉ hiển thị khi tạo mới
- **Thông tin nhân viên**: Mã NV, phòng ban, chức vụ, ngày tuyển dụng, lương
- **Phân quyền**: Checkbox groups theo danh mục
- **Auto-set permissions**: Tự động set quyền theo vai trò

## 🔐 Bảo mật

- **Authentication**: Yêu cầu đăng nhập admin
- **Authorization**: Chỉ admin mới có quyền truy cập
- **Password hashing**: Sử dụng bcrypt
- **Input validation**: Zod schema validation
- **SQL injection protection**: Mongoose ODM

## 📱 Responsive Design

- **Mobile-first**: Tối ưu cho mobile
- **Tablet support**: Giao diện thích ứng tablet
- **Desktop**: Trải nghiệm tốt nhất trên desktop
- **Touch-friendly**: Buttons và controls dễ chạm

## 🚀 Cách sử dụng

### 1. Truy cập trang quản lý:
```
http://localhost:5173/admin/users    # Quản lý người dùng
http://localhost:5173/admin/staff    # Quản lý nhân viên
```

### 2. Thêm người dùng mới:
1. Click "Thêm người dùng" / "Thêm nhân viên"
2. Điền thông tin cơ bản
3. Chọn vai trò (tự động set permissions)
4. Điền thông tin nhân viên (nếu cần)
5. Chọn permissions cụ thể
6. Click "Tạo mới"

### 3. Chỉnh sửa người dùng:
1. Click icon "Chỉnh sửa" trong bảng
2. Cập nhật thông tin
3. Click "Cập nhật"

### 4. Quản lý trạng thái:
- **Toggle switch**: Bật/tắt trạng thái hoạt động
- **Bulk actions**: Cập nhật hàng loạt

### 5. Tìm kiếm và lọc:
- **Search box**: Tìm theo tên, email, mã NV
- **Advanced filters**: Lọc theo vai trò, phòng ban, trạng thái

## 🔄 Workflow

### Tạo nhân viên mới:
1. **Tạo tài khoản**: Thông tin cơ bản + vai trò
2. **Set permissions**: Theo vai trò hoặc custom
3. **Thông tin công việc**: Phòng ban, chức vụ, lương
4. **Kích hoạt**: Toggle trạng thái active

### Quản lý permissions:
1. **Role-based**: Admin có tất cả quyền
2. **Custom**: Set permissions cụ thể
3. **Department-based**: Quyền theo phòng ban

## 📈 Monitoring

### Thống kê real-time:
- Số lượng người dùng active/inactive
- Phân bố theo vai trò và phòng ban
- Lịch sử đăng nhập
- Hoạt động gần đây

### Reports:
- Báo cáo nhân viên theo phòng ban
- Thống kê đăng nhập
- Phân tích quyền hạn

## 🛠️ Technical Stack

### Frontend:
- **React 18**: UI framework
- **Ant Design**: UI components
- **React Router**: Navigation
- **SweetAlert2**: Notifications
- **Day.js**: Date handling

### Backend:
- **Node.js**: Runtime
- **Express**: Web framework
- **MongoDB**: Database
- **Mongoose**: ODM
- **bcrypt**: Password hashing
- **JWT**: Authentication
- **Zod**: Validation

## 🎯 Roadmap

### Phase 1 (Completed):
- ✅ Basic user management
- ✅ Staff management
- ✅ Role-based permissions
- ✅ Statistics dashboard

### Phase 2 (Future):
- 🔄 Advanced reporting
- 🔄 Audit logs
- 🔄 Email notifications
- 🔄 Bulk import/export
- 🔄 Advanced search filters
- 🔄 User activity tracking

## 📞 Support

Nếu có vấn đề hoặc cần hỗ trợ, vui lòng liên hệ:
- **Email**: admin@smartpharmacy.com
- **Phone**: 1900-xxxx
- **Documentation**: [Link to docs]

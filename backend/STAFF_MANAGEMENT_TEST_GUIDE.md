# Hướng dẫn Test Trang Staff Management

## 🎯 Dữ liệu mẫu đã tạo

Tôi đã tạo 5 nhân viên mẫu trong database với thông tin chi tiết:

### 1. Nguyễn Văn An (Nhân viên bán hàng)
- **Email**: an.nguyen@smartpharmacy.com
- **Role**: staff
- **Employee ID**: EMP001
- **Department**: Bán hàng
- **Position**: Nhân viên bán hàng
- **Salary**: 8,000,000 VNĐ
- **Hire Date**: 15/01/2023
- **Status**: Active

### 2. Trần Thị Bình (Dược sĩ)
- **Email**: binh.tran@smartpharmacy.com
- **Role**: pharmacist
- **Employee ID**: EMP002
- **Department**: Dược
- **Position**: Dược sĩ
- **Salary**: 12,000,000 VNĐ
- **Hire Date**: 01/06/2022
- **Status**: Active

### 3. Lê Văn Cường (Quản lý kho)
- **Email**: cuong.le@smartpharmacy.com
- **Role**: manager
- **Employee ID**: EMP003
- **Department**: Quản lý
- **Position**: Quản lý kho
- **Salary**: 15,000,000 VNĐ
- **Hire Date**: 10/03/2021
- **Status**: Active

### 4. Phạm Thị Dung (Kế toán viên)
- **Email**: dung.pham@smartpharmacy.com
- **Role**: staff
- **Employee ID**: EMP004
- **Department**: Kế toán
- **Position**: Kế toán viên
- **Salary**: 9,000,000 VNĐ
- **Hire Date**: 20/08/2023
- **Status**: Active

### 5. Hoàng Văn Em (Lập trình viên)
- **Email**: em.hoang@smartpharmacy.com
- **Role**: staff
- **Employee ID**: EMP005
- **Department**: IT
- **Position**: Lập trình viên
- **Salary**: 11,000,000 VNĐ
- **Hire Date**: 10/01/2024
- **Status**: Inactive (Tạm dừng)

## 🚀 Cách test trang Staff Management

### 1. Truy cập trang:
```
http://localhost:5173/admin/staff
```

### 2. Đăng nhập admin:
- Email: admin@smartpharmacy.com (hoặc bất kỳ admin nào)
- Password: password123

### 3. Kiểm tra các tính năng:

#### Dashboard Statistics:
- **Tổng nhân viên**: 5
- **Đang làm việc**: 4 (Hoàng Văn Em inactive)
- **Quản lý**: 1 (Lê Văn Cường)
- **Dược sĩ**: 1 (Trần Thị Bình)

#### Phân bố phòng ban:
- **Bán hàng**: 1 nhân viên (20%)
- **Dược**: 1 nhân viên (20%)
- **Quản lý**: 1 nhân viên (20%)
- **Kế toán**: 1 nhân viên (20%)
- **IT**: 1 nhân viên (20%)

#### Bảng danh sách nhân viên:
- Hiển thị đầy đủ thông tin: Avatar, tên, email, mã NV
- Vai trò & phòng ban với màu sắc phân biệt
- Thông tin công việc: Ngày tuyển dụng, lương, trạng thái đăng nhập
- Trạng thái hoạt động với switch toggle
- Các thao tác: Xem, sửa, xóa

#### Bộ lọc nâng cao:
- **Vai trò**: staff, manager, pharmacist, admin
- **Phòng ban**: Bán hàng, Dược, Quản lý, Kế toán, IT
- **Trạng thái**: Đang làm việc, Nghỉ việc

#### Tìm kiếm:
- Tìm theo tên: "Nguyễn", "Trần", "Lê"
- Tìm theo email: "an.nguyen", "binh.tran"
- Tìm theo mã NV: "EMP001", "EMP002"

## 🔧 Các tính năng đã tinh chỉnh

### 1. Filter Logic:
- Chỉ hiển thị nhân viên có thông tin công việc (employeeId, department, position)
- Loại bỏ admin users không có thông tin nhân viên

### 2. Statistics Calculation:
- Tính toán chính xác theo dữ liệu thực
- Phân bố phòng ban chỉ hiển thị phòng ban có nhân viên

### 3. Data Display:
- Format ngày tháng theo định dạng Việt Nam
- Format lương với dấu phẩy và đơn vị VNĐ
- Hiển thị trạng thái đăng nhập (chưa đăng nhập nếu null)

### 4. UI Improvements:
- Progress bars cho phân bố phòng ban
- Color coding cho vai trò
- Responsive design
- SweetAlert2 notifications

## 🎨 Giao diện mong đợi

### Header Section:
- Icon TeamOutlined với màu xanh lá
- Title "Quản lý Nhân viên"
- Nút "Thêm nhân viên" và "Làm mới"

### Statistics Cards:
- 4 cards hiển thị số liệu tổng quan
- Màu sắc phân biệt: xanh lá, xanh dương, vàng, tím

### Department Distribution:
- Card xanh lá với progress bars
- Hiển thị 5 phòng ban với tỷ lệ đều nhau (20% mỗi phòng ban)

### Advanced Filters:
- 3 dropdown filters: Vai trò, Phòng ban, Trạng thái
- Nút "Áp dụng bộ lọc" và "Đặt lại"

### Staff Table:
- 5 nhân viên với đầy đủ thông tin
- Avatar với màu xanh lá (active) hoặc đỏ (inactive)
- Thông tin chi tiết: tên, email, mã NV
- Tags màu sắc cho vai trò và phòng ban
- Thông tin công việc: ngày tuyển dụng, lương
- Switch toggle cho trạng thái
- Action buttons: Xem, Sửa, Menu

## 🐛 Troubleshooting

### Nếu không hiển thị dữ liệu:
1. Kiểm tra backend có chạy không: `http://localhost:5000/api/hello`
2. Kiểm tra authentication: Đăng nhập admin
3. Kiểm tra console browser có lỗi không
4. Kiểm tra Network tab trong DevTools

### Nếu thiếu thông tin:
1. Chạy lại script tạo dữ liệu: `node create-sample-staff.js`
2. Kiểm tra database: `node check-users.js`
3. Clear cache browser và refresh

### Nếu lỗi API:
1. Kiểm tra backend logs
2. Kiểm tra MongoDB connection
3. Restart backend server

## 📊 Expected Results

Khi truy cập `http://localhost:5173/admin/staff`, bạn sẽ thấy:

1. **5 nhân viên** trong bảng với đầy đủ thông tin
2. **4 nhân viên active**, 1 inactive (Hoàng Văn Em)
3. **Phân bố đều** 5 phòng ban (20% mỗi phòng ban)
4. **Thông tin chi tiết** về lương, ngày tuyển dụng
5. **Giao diện đẹp** với màu sắc và icons phù hợp
6. **Tính năng đầy đủ**: filter, search, bulk actions

Trang Staff Management đã được tinh chỉnh để hiển thị chính xác dữ liệu từ database User với đầy đủ thông tin nhân viên!

import useAuth from "../../hooks/useAuth.js";

export default function AdminDashboard() {
  const { user } = useAuth();
  return (
    <div>
      <h2>Dashboard</h2>
      <p>Xin chào, {user?.name}</p>
      <ul>
        <li>Truy cập Danh mục để quản lý phân loại sản phẩm.</li>
        <li>Truy cập Sản phẩm để thêm/sửa/xóa.</li>
        <li>Vào Nhập/Xuất kho để ghi nhận giao dịch kho.</li>
      </ul>
    </div>
  );
}



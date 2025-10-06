import Swal from "sweetalert2";

export function showSuccess(message, title = "Thành công") {
  return Swal.fire({ icon: "success", title, text: message, confirmButtonText: "OK" });
}

export function showError(message, title = "Có lỗi xảy ra") {
  return Swal.fire({ icon: "error", title, text: message, confirmButtonText: "Đóng" });
}

export function confirm(options = {}) {
  const { title = "Bạn có chắc không?", text = "Thao tác này không thể hoàn tác", confirmText = "Xác nhận", cancelText = "Hủy" } = options;
  return Swal.fire({ icon: "question", title, text, showCancelButton: true, confirmButtonText: confirmText, cancelButtonText: cancelText });
}



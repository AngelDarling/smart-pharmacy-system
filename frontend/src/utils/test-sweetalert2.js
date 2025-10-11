/**
 * Test SweetAlert2 functionality
 * This script can be run in browser console to test alerts
 */

// Test function to show different types of SweetAlert2 toasts
function testSweetAlert2() {
  console.log('Testing SweetAlert2 toasts...');
  
  // Test success alert
  setTimeout(() => {
    Swal.fire({
      title: 'Thành công!',
      text: 'Tạo danh mục thành công!',
      icon: 'success',
      timer: 5000,
      timerProgressBar: true,
      showConfirmButton: false,
      toast: true,
      position: 'top-end',
      customClass: {
        popup: 'swal2-popup-custom'
      }
    });
  }, 1000);
  
  // Test update alert
  setTimeout(() => {
    Swal.fire({
      title: 'Thành công!',
      text: 'Cập nhật danh mục thành công!',
      icon: 'success',
      timer: 5000,
      timerProgressBar: true,
      showConfirmButton: false,
      toast: true,
      position: 'top-end',
      customClass: {
        popup: 'swal2-popup-custom'
      }
    });
  }, 2000);
  
  // Test delete alert
  setTimeout(() => {
    Swal.fire({
      title: 'Xóa thành công!',
      text: 'Đã xóa danh mục "Test Category" và 3 danh mục con',
      icon: 'success',
      timer: 5000,
      timerProgressBar: true,
      showConfirmButton: false,
      toast: true,
      position: 'top-end',
      customClass: {
        popup: 'swal2-popup-custom'
      }
    });
  }, 3000);
  
  console.log('SweetAlert2 tests completed! Check the top-right corner for toast notifications.');
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.testSweetAlert2 = testSweetAlert2;
  console.log('SweetAlert2 test function available as window.testSweetAlert2()');
}

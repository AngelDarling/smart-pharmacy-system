import XLSX from 'xlsx';

/**
 * Generate Excel template for goods receipt import
 */
export async function generateGoodsReceiptTemplate(suppliers = []) {
  // Create a new workbook
  const wb = XLSX.utils.book_new();

  // Sheet 1: Instructions
  const instructionsData = [
    ['HƯỚNG DẪN SỬ DỤNG TEMPLATE NHẬP KHO'],
    [''],
    ['1. Xem Sheet "Danh sách NCC" để lấy ID nhà cung cấp'],
    ['2. Điền thông tin phiếu nhập vào Sheet "Thông tin phiếu nhập"'],
    ['3. Điền danh sách sản phẩm vào Sheet "Danh sách sản phẩm"'],
    ['4. SKU và Đơn giá có thể copy từ file "Export danh sách sản phẩm"'],
    ['5. Cột "Thành tiền" sẽ TỰ ĐỘNG tính = Đơn giá × Số lượng'],
    ['6. Số lượng phải > 0, Đơn giá phải >= 0'],
    ['7. HSD (nếu có) phải sau ngày nhập'],
    ['8. Lưu file và upload lại vào hệ thống'],
    [''],
    ['LƯU Ý:'],
    ['- Không xóa hoặc đổi tên các cột'],
    ['- Không xóa các sheet'],
    ['- Định dạng ngày: DD/MM/YYYY'],
    ['- Định dạng số: không dấu phẩy, chỉ số']
  ];
  const wsInstructions = XLSX.utils.aoa_to_sheet(instructionsData);
  XLSX.utils.book_append_sheet(wb, wsInstructions, 'Hướng dẫn');

  // Sheet 2: Supplier List (for reference)
  const supplierData = [
    ['ID Nhà cung cấp', 'Tên nhà cung cấp', 'Mã NCC']
  ];
  
  console.log(`[generateGoodsReceiptTemplate] Received ${suppliers?.length || 0} suppliers`);
  
  if (suppliers && suppliers.length > 0) {
    suppliers.forEach(supplier => {
      const supplierId = supplier._id?.toString() || supplier.id?.toString() || '';
      console.log(`Adding supplier: ${supplierId} - ${supplier.name}`);
      supplierData.push([
        supplierId,
        supplier.name || '',
        supplier.code || '-'
      ]);
    });
  } else {
    supplierData.push(['(Chưa có dữ liệu)', 'Vui lòng thêm nhà cung cấp trong hệ thống', '-']);
  }
  
  const wsSuppliers = XLSX.utils.aoa_to_sheet(supplierData);
  wsSuppliers['!cols'] = [
    { wch: 25 },
    { wch: 30 },
    { wch: 15 }
  ];
  XLSX.utils.book_append_sheet(wb, wsSuppliers, 'Danh sách NCC');

  // Sheet 3: Receipt Info
  const receiptInfoData = [
    ['Mã phiếu', 'Nhà cung cấp (ID)', 'Số lô', 'Ngày nhập (DD/MM/YYYY)', 'Ghi chú'],
    ['(Tự động)', suppliers?.[0]?._id || 'Xem sheet Danh sách NCC', 'LOT2025-2212A', '22/12/2025', 'Nhập kho tháng 12']
  ];
  const wsReceiptInfo = XLSX.utils.aoa_to_sheet(receiptInfoData);
  
  // Set column widths
  wsReceiptInfo['!cols'] = [
    { wch: 15 },
    { wch: 30 },
    { wch: 15 },
    { wch: 25 },
    { wch: 30 }
  ];
  
  XLSX.utils.book_append_sheet(wb, wsReceiptInfo, 'Thông tin phiếu nhập');

  // Sheet 4: Products - Column order matches export format
  const productsData = [
    ['STT', 'SKU', 'Tên sản phẩm (tham khảo)', 'Đơn giá', 'Số lượng', 'Thành tiền', 'HSD (DD/MM/YYYY)'],
    [1, 'PRD-411248-174', 'Acnes Spot Care', 55000, 100, '=D2*E2', '31/12/2025'],
    [2, 'GENE-LIST-250', 'Listerine Cool Mint 250ml', 70000, 50, '=D3*E3', '30/06/2026'],
    [3, '', '', '', '', '', '']
  ];
  const wsProducts = XLSX.utils.aoa_to_sheet(productsData);
  
  // Set column widths
  wsProducts['!cols'] = [
    { wch: 5 },   // STT
    { wch: 18 },  // SKU
    { wch: 35 },  // Tên
    { wch: 12 },  // Đơn giá
    { wch: 10 },  // Số lượng
    { wch: 15 },  // Thành tiền
    { wch: 18 }   // HSD
  ];
  
  XLSX.utils.book_append_sheet(wb, wsProducts, 'Danh sách sản phẩm');

  // Generate buffer
  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  return buffer;
}

/**
 * Parse uploaded Excel file for goods receipt
 */
export function parseGoodsReceiptExcel(fileBuffer) {
  try {
    const wb = XLSX.read(fileBuffer, { type: 'buffer' });

    // Read receipt info
    const receiptInfoSheet = wb.Sheets['Thông tin phiếu nhập'];
    if (!receiptInfoSheet) {
      throw new Error('Không tìm thấy sheet "Thông tin phiếu nhập"');
    }
    
    const receiptInfoData = XLSX.utils.sheet_to_json(receiptInfoSheet, { header: 1 });
    const receiptInfo = {
      supplierId: receiptInfoData[1]?.[1],
      batchNumber: receiptInfoData[1]?.[2],
      importDate: receiptInfoData[1]?.[3],
      note: receiptInfoData[1]?.[4]
    };

    // Read products
    const productsSheet = wb.Sheets['Danh sách sản phẩm'];
    if (!productsSheet) {
      throw new Error('Không tìm thấy sheet "Danh sách sản phẩm"');
    }
    
    const productsData = XLSX.utils.sheet_to_json(productsSheet, { header: 1 });
    const products = [];
    
    // Skip header row (index 0) and start from row 1
    // New column order: STT, SKU, Tên, Đơn giá, Số lượng, Thành tiền, HSD
    for (let i = 1; i < productsData.length; i++) {
      const row = productsData[i];
      
      // Skip empty rows
      if (!row[1]) continue; // No SKU
      
      products.push({
        rowNumber: i + 1,
        sku: row[1]?.toString().trim(),
        productName: row[2]?.toString().trim(), // For reference only
        unitCost: parseFloat(row[3]) || 0,      // Column D - Đơn giá
        quantity: parseFloat(row[4]) || 0,      // Column E - Số lượng
        expiryDate: row[6] // Column G - HSD
      });
    }

    return {
      receiptInfo,
      products,
      totalItems: products.length
    };
  } catch (error) {
    throw new Error(`Lỗi đọc file Excel: ${error.message}`);
  }
}

/**
 * Generate Excel file with product list
 */
export function generateProductListExcel(products) {
  const wb = XLSX.utils.book_new();

  // Prepare data - column order matches import template
  const data = [
    ['STT', 'SKU', 'Tên sản phẩm', 'Giá nhập', 'Giá bán', 'Đơn vị', 'Tồn kho', 'Trạng thái']
  ];

  products.forEach((product, index) => {
    data.push([
      index + 1,
      product.sku || '',
      product.name || '',
      product.costPrice || 0,
      product.price || 0,
      product.unit || '',
      product.totalStock || 0,
      product.isActive ? 'Hoạt động' : 'Ngừng bán'
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(data);
  
  // Set column widths
  ws['!cols'] = [
    { wch: 5 },   // STT
    { wch: 18 },  // SKU
    { wch: 40 },  // Tên
    { wch: 12 },  // Giá nhập
    { wch: 12 },  // Giá bán
    { wch: 10 },  // Đơn vị
    { wch: 10 },  // Tồn kho
    { wch: 12 }   // Trạng thái
  ];
  
  XLSX.utils.book_append_sheet(wb, ws, 'Danh sách sản phẩm');

  // Generate buffer
  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  return buffer;
}

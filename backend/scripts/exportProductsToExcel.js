import mongoose from 'mongoose';
import * as xlsx from 'xlsx';
import path from 'path';
import fs from 'fs';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Brand from '../models/Brand.js';

async function exportProducts() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect('mongodb://localhost:27017/smart-pharmacy');
    console.log('Connected successfully.\n');

    console.log('Fetching products with details...');
    const products = await Product.find({})
      .populate('categoryId', 'name')
      .populate('brandId', 'name')
      .lean();

    console.log(`Found ${products.length} products.\n`);

    const data = products.map((p, index) => ({
      'STT': index + 1,
      'Tên sản phẩm': p.name || '',
      'Danh mục': p.categoryId?.name || 'Không có',
      'Thương hiệu': p.brandId?.name || 'Không có',
      'Giá bán (đ)': p.price || 0,
      'Đơn vị': p.unit || 'đơn vị',
      'SKU': p.sku || 'N/A',
      'Tồn kho': p.totalStock || 0
    }));

    console.log('Creating Excel workbook...');
    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(data);

    // Set column widths for better readability
    const wscols = [
      { wch: 5 },  // STT
      { wch: 40 }, // Tên sản phẩm
      { wch: 25 }, // Danh mục
      { wch: 20 }, // Thương hiệu
      { wch: 15 }, // Giá bán
      { wch: 10 }, // Đơn vị
      { wch: 20 }, // SKU
      { wch: 10 }  // Tồn kho
    ];
    ws['!cols'] = wscols;

    xlsx.utils.book_append_sheet(wb, ws, 'Danh sách sản phẩm');

    const fileName = 'Danh_sach_san_pham.xlsx';
    const filePath = path.join(process.cwd(), fileName);

    console.log(`Saving file to: ${filePath}`);
    xlsx.writeFile(wb, filePath);

    console.log('\n✅ Export completed successfully!');
    console.log(`File created: ${fileName}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error exporting products:', error);
    process.exit(1);
  }
}

exportProducts();

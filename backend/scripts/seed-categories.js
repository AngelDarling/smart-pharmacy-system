import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDatabase } from '../config/db.js';
import Category from '../models/Category.js';

dotenv.config();

function slugify(input) {
  return (input || '')
    .toString()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

async function ensureCategory(name, parentId = null) {
  const baseSlug = slugify(name);
  let slug = baseSlug;
  let i = 1;
  while (await Category.findOne({ slug }).lean()) {
    slug = `${baseSlug}-${i++}`;
  }
  // Try find by name under same parent first
  let exists = await Category.findOne({ name, parent: parentId || null });
  if (exists) return exists;
  const doc = await Category.create({ name, slug, parent: parentId, isActive: true });
  // recompute level/ancestors/path mimicking controller logic
  let ancestors = [];
  let level = 0;
  let path = doc.slug;
  if (parentId) {
    const p = await Category.findById(parentId);
    if (p) {
      ancestors = [...(p.ancestors || []), p._id];
      level = (p.level || 0) + 1;
      path = p.path ? `${p.path}/${doc.slug}` : doc.slug;
    }
  }
  await Category.updateOne({ _id: doc._id }, { $set: { ancestors, level, path } });
  return await Category.findById(doc._id);
}

async function run() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-pharmacy';
  await connectDatabase(uri);

  const data = [
    { level0: 'Thực phẩm chức năng', level1: [
      { name: 'Vitamin & Khoáng chất', level2: [
        'Bổ sung Canxi & Vitamin D',
        'Vitamin tổng hợp',
        'Dầu cá, Omega 3, DHA',
        'Vitamin C các loại',
        'Bổ sung Sắt & Axit Folic'
      ] },
      { name: 'Sinh lý - Nội tiết tố' },
      { name: 'Cải thiện tăng cường chức năng' },
      { name: 'Hỗ trợ điều trị' },
      { name: 'Hỗ trợ tiêu hóa' },
      { name: 'Thần kinh não' },
      { name: 'Hỗ trợ làm đẹp' },
      { name: 'Sức khoẻ tim mạch' },
      { name: 'Dinh dưỡng' }
    ]},
    { level0: 'Dược mỹ phẩm', level1: [
      { name: 'Chăm sóc da mặt', level2: [
        'Sữa rửa mặt (Kem, gel, sữa)',
        'Kem chống nắng da mặt',
        'Dưỡng da mặt',
        'Mặt nạ',
        'Serum, Essence hoặc Ampoule'
      ] },
      { name: 'Chăm sóc cơ thể' },
      { name: 'Giải pháp làn da' },
      { name: 'Chăm sóc tóc - da đầu' },
      { name: 'Mỹ phẩm trang điểm' },
      { name: 'Chăm sóc da vùng mắt' },
      { name: 'Sản phẩm từ thiên nhiên' }
    ]},
    { level0: 'Thuốc', level1: [
      { name: 'Tra cứu thuốc', level2: [
        'Thuốc kháng sinh, kháng nấm',
        'Thuốc điều trị ung thư',
        'Thuốc tim mạch & máu',
        'Thuốc thần kinh',
        'Thuốc tiêu hoá & gan mật'
      ] },
      { name: 'Tra cứu dược chất' },
      { name: 'Tra cứu dược liệu' }
    ]},
    { level0: 'Chăm sóc cá nhân', level1: [
      { name: 'Hỗ trợ tình dục', level2: [ 'Bao cao su', 'Gel bôi trơn' ] },
      { name: 'Thực phẩm - Đồ uống' },
      { name: 'Vệ sinh cá nhân' },
      { name: 'Chăm sóc răng miệng' },
      { name: 'Đồ dùng gia đình' },
      { name: 'Hàng tổng hợp' },
      { name: 'Tinh dầu các loại' },
      { name: 'Thiết bị làm đẹp' }
    ]},
    { level0: 'Thiết bị y tế', level1: [
      { name: 'Dụng cụ y tế', level2: [
        'Dụng cụ vệ sinh mũi', 'Kim các loại', 'Máy massage', 'Túi chườm', 'Vớ ngăn tĩnh mạch'
      ] },
      { name: 'Dụng cụ theo dõi' },
      { name: 'Dụng cụ sơ cứu' },
      { name: 'Khẩu trang' }
    ]}
  ];

  for (const block of data) {
    const root = await ensureCategory(block.level0, null);
    if (Array.isArray(block.level1)) {
      for (const lv1 of block.level1) {
        const parent1 = await ensureCategory(lv1.name || lv1, root._id);
        if (lv1.level2 && Array.isArray(lv1.level2)) {
          for (const lv2 of lv1.level2) {
            await ensureCategory(lv2, parent1._id);
          }
        }
      }
    }
  }

  console.log('Seed categories completed');
  await mongoose.connection.close();
}

run().catch(async (e) => {
  console.error(e);
  try { await mongoose.connection.close(); } catch {}
  process.exit(1);
});



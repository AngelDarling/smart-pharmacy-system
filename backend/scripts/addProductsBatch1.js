import mongoose from 'mongoose';
import fs from 'fs';
import slugify from 'slugify';

// Read category analysis
const categoryData = JSON.parse(fs.readFileSync('category_analysis.json', 'utf8'));

// Product templates for different category types
const productTemplates = {
  // Medicines
  'Thuốc kháng viêm': [
    { name: 'Ibuprofen 400mg (Hộp 100 viên)', price: 45000, unit: 'hộp', description: 'Thuốc giảm đau, hạ sốt, kháng viêm hiệu quả' },
    { name: 'Diclofenac Gel 1% (Tuýp 30g)', price: 35000, unit: 'tuýp', description: 'Gel bôi ngoài da giảm đau, kháng viêm' }
  ],
  'Thuốc tra mắt': [
    { name: 'Rohto V Premium (Chai 13ml)', price: 85000, unit: 'chai', description: 'Thuốc nhỏ mắt giảm mỏi mắt, làm mát mắt' },
    { name: 'Visine Classic (Chai 15ml)', price: 65000, unit: 'chai', description: 'Thuốc nhỏ mắt giảm đỏ mắt, khô mắt' }
  ],
  'Thuốc nhỏ tai': [
    { name: 'Otilin (Chai 10ml)', price: 42000, unit: 'chai', description: 'Thuốc nhỏ tai kháng khuẩn, giảm viêm tai' }
  ],
  'Thuốc xịt mũi': [
    { name: 'Otrivin 0.1% (Chai 10ml)', price: 78000, unit: 'chai', description: 'Xịt mũi giảm nghẹt mũi, viêm mũi dị ứng' },
    { name: 'Physiomer (Chai 135ml)', price: 125000, unit: 'chai', description: 'Nước biển sinh lý rửa mũi, làm sạch mũi' }
  ],
  'Thuốc sát khuẩn': [
    { name: 'Betadine 10% (Chai 30ml)', price: 38000, unit: 'chai', description: 'Dung dịch sát khuẩn vết thương' }
  ],
  'Thuốc bôi ngoài da': [
    { name: 'Fucicort Cream (Tuýp 10g)', price: 95000, unit: 'tuýp', description: 'Kem bôi trị viêm da, dị ứng da' }
  ],
  'Thuốc trị mụn': [
    { name: 'Acnes Spot Care (Tuýp 25g)', price: 55000, unit: 'tuýp', description: 'Gel trị mụn, giảm viêm mụn hiệu quả' }
  ],
  'Thuốc bôi sẹo - liền sẹo': [
    { name: 'Dermatix Ultra (Tuýp 15g)', price: 285000, unit: 'tuýp', description: 'Gel trị sẹo lồi, sẹo phì đại' }
  ],
  'Thuốc tai mũi họng': [
    { name: 'Strepsils Original (Hộp 24 viên)', price: 48000, unit: 'hộp', description: 'Viên ngậm giảm đau họng, kháng khuẩn' }
  ],
  'Thuốc trị đau nhức dầu': [
    { name: 'Paracetamol 500mg (Hộp 100 viên)', price: 25000, unit: 'hộp', description: 'Thuốc giảm đau, hạ sốt an toàn' }
  ],
  'Thuốc trị viêm xoang': [
    { name: 'Sinumax (Hộp 30 viên)', price: 95000, unit: 'hộp', description: 'Viên uống hỗ trợ giảm viêm xoang' }
  ],
  'Thuốc trị tăng nhãn áp': [
    { name: 'Timolol 0.5% (Chai 5ml)', price: 125000, unit: 'chai', description: 'Thuốc nhỏ mắt điều trị tăng nhãn áp' }
  ],
  'Thuốc xịt hen suyễn': [
    { name: 'Ventolin Inhaler (Chai xịt)', price: 185000, unit: 'chai', description: 'Thuốc xịt điều trị hen suyễn' }
  ],
  'Thuốc bôi răng miệng': [
    { name: 'Tantum Verde Gel (Tuýp 20g)', price: 72000, unit: 'tuýp', description: 'Gel bôi giảm đau loét miệng' }
  ],
  'Dung dịch súc miệng': [
    { name: 'Garglin (Chai 250ml)', price: 45000, unit: 'chai', description: 'Dung dịch súc miệng kháng khuẩn' }
  ],
  'Ống hít mũi': [
    { name: 'Poy-Sian (Ống 2ml)', price: 15000, unit: 'ống', description: 'Dầu lăn thông mũi, giảm nghẹt mũi' }
  ],
  
  // Vitamins & Supplements
  'Bổ xương khớp': [
    { name: 'Glucosamine 1500mg (Hộp 60 viên)', price: 320000, unit: 'hộp', description: 'Viên uống bổ xương khớp, giảm đau khớp' },
    { name: 'Move Free Advanced (Hộp 80 viên)', price: 485000, unit: 'hộp', description: 'Viên uống hỗ trợ xương khớp chắc khỏe' }
  ],
  'Thuốc bổ': [
    { name: 'Multivitamin Centrum (Hộp 100 viên)', price: 385000, unit: 'hộp', description: 'Vitamin tổng hợp cho người lớn' }
  ],
  'Thuốc bổ điện giải': [
    { name: 'Oresol (Hộp 20 gói)', price: 35000, unit: 'hộp', description: 'Bổ sung điện giải, phòng mất nước' }
  ],
  'Siro bổ': [
    { name: 'Siro Apeton (Chai 200ml)', price: 125000, unit: 'chai', description: 'Siro bổ sung vitamin, kích thích ăn ngon' },
    { name: 'Siro Pediakid (Chai 125ml)', price: 185000, unit: 'chai', description: 'Siro bổ sung vitamin cho trẻ em' }
  ],
  'Thuốc tăng cường sức đề kháng': [
    { name: 'Vitamin C 1000mg (Hộp 100 viên)', price: 145000, unit: 'hộp', description: 'Viên sủi bổ sung vitamin C, tăng đề kháng' }
  ],
  'Dinh dưỡng': [
    { name: 'Ensure Gold (Hộp 850g)', price: 625000, unit: 'hộp', description: 'Sữa dinh dưỡng cho người lớn tuổi' }
  ],
  
  // Digestive
  'Khó tiêu': [
    { name: 'Motilium 10mg (Hộp 30 viên)', price: 65000, unit: 'hộp', description: 'Thuốc điều trị khó tiêu, đầy hơi' }
  ],
  'Táo bón': [
    { name: 'Duphalac (Chai 200ml)', price: 95000, unit: 'chai', description: 'Siro nhuận tràng, điều trị táo bón' }
  ],
  'Đại tràng': [
    { name: 'Smecta (Hộp 30 gói)', price: 85000, unit: 'hộp', description: 'Thuốc điều trị tiêu chảy cấp' }
  ],
  
  // Cardiovascular
  'Huyết áp': [
    { name: 'Amlodipine 5mg (Hộp 100 viên)', price: 45000, unit: 'hộp', description: 'Thuốc điều trị tăng huyết áp' }
  ],
  'Suy dãn tĩnh mạch': [
    { name: 'Daflon 500mg (Hộp 60 viên)', price: 285000, unit: 'hộp', description: 'Thuốc điều trị suy giãn tĩnh mạch' }
  ],
  'Tuần hoàn máu': [
    { name: 'Ginkgo Biloba 120mg (Hộp 60 viên)', price: 280000, unit: 'hộp', description: 'Viên uống hỗ trợ tuần hoàn não' }
  ],
  
  // Skin care (Dầu gội)
  'Dầu gội trị gàu': [
    { name: 'Clear Men (Chai 630ml)', price: 125000, unit: 'chai', description: 'Dầu gội trị gàu cho nam giới' }
  ],
  'Dầu mù u': [
    { name: 'Dầu Mù U Sơn Tùng (Chai 50ml)', price: 45000, unit: 'chai', description: 'Dầu mù u nguyên chất, giảm ngứa da đầu' }
  ],
  'Dầu gội giúp giảm nám và ngứa da đầu': [
    { name: 'Selsun (Chai 100ml)', price: 95000, unit: 'chai', description: 'Dầu gội trị nấm da đầu, giảm ngứa' }
  ],
  'Dầu gội đầu xả': [
    { name: 'Dove Shampoo (Chai 650ml)', price: 135000, unit: 'chai', description: 'Dầu gội dưỡng ẩm, mềm mượt' }
  ],
  'Dưỡng tóc, ủ tóc': [
    { name: 'Tresemme Hair Mask (Hũ 180ml)', price: 145000, unit: 'hũ', description: 'Kem ủ tóc phục hồi hư tổn' }
  ],
  'Chăm sóc chuyên sâu cho tóc': [
    { name: 'Loreal Serum (Chai 50ml)', price: 185000, unit: 'chai', description: 'Serum dưỡng tóc chuyên sâu' }
  ]
};

// Generate slug from Vietnamese name
function generateSlug(name) {
  return slugify(name, {
    lower: true,
    strict: true,
    locale: 'vi',
    remove: /[*+~.()'"!:@]/g
  });
}

// Generate SKU
function generateSKU(categoryName, brandName, index) {
  const catPrefix = categoryName.substring(0, 3).toUpperCase();
  const brandPrefix = brandName.substring(0, 3).toUpperCase();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${catPrefix}-${brandPrefix}-${random}`;
}

async function addProductsToEmptyCategories() {
  try {
    await mongoose.connect('mongodb://localhost:27017/smart-pharmacy');
    console.log('Connected to MongoDB\n');
    
    const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
    const Category = mongoose.model('Category', new mongoose.Schema({}, { strict: false }));
    
    const emptyCategories = categoryData.emptyCategories;
    const brands = categoryData.brands;
    
    console.log(`Processing ${emptyCategories.length} empty categories...\n`);
    
    const productsToInsert = [];
    let brandIndex = 0;
    
    // Process categories that have templates
    for (const category of emptyCategories) {
      const template = productTemplates[category.name];
      
      if (!template) {
        console.log(`⚠️  No template for: ${category.name}`);
        continue;
      }
      
      console.log(`✅ Processing: ${category.name}`);
      
      for (const productData of template) {
        const brand = brands[brandIndex % brands.length];
        brandIndex++;
        
        const product = {
          name: productData.name,
          slug: generateSlug(productData.name),
          description: productData.description,
          shortDescription: productData.description.substring(0, 100),
          categoryId: new mongoose.Types.ObjectId(category._id),
          brandId: new mongoose.Types.ObjectId(brand._id),
          price: productData.price,
          unit: productData.unit,
          totalStock: Math.floor(Math.random() * 51) + 50, // 50-100
          sku: generateSKU(category.name, brand.name, productsToInsert.length),
          imageUrls: ['https://via.placeholder.com/400x400?text=Product+Image'],
          thumbnailUrl: 'https://via.placeholder.com/200x200?text=Thumbnail',
          isActive: true,
          isFeatured: Math.random() > 0.9, // 10% chance
          minStockLevel: 10,
          maxStockLevel: 200,
          variants: [],
          tags: [],
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        productsToInsert.push(product);
        console.log(`   + ${product.name} (${brand.name})`);
      }
    }
    
    console.log(`\n📦 Total products to insert: ${productsToInsert.length}`);
    console.log('Inserting products...\n');
    
    const result = await Product.insertMany(productsToInsert);
    console.log(`✅ Successfully inserted ${result.length} products!`);
    
    // Verify
    console.log('\n🔍 Verification:');
    for (const category of emptyCategories) {
      if (productTemplates[category.name]) {
        const count = await Product.countDocuments({ categoryId: category._id });
        console.log(`   ${category.name}: ${count} products`);
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

addProductsToEmptyCategories();

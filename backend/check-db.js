import mongoose from 'mongoose';
import Product from './models/Product.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-pharmacy';

async function checkDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Kiểm tra tất cả sản phẩm
    const allProducts = await Product.find({});
    console.log('Total products:', allProducts.length);
    
    allProducts.forEach(p => {
      console.log('- Product:', p.name, '| Active:', p.isActive);
    });

    // Test search
    const searchTerm = 'sua';
    const foundProducts = await Product.find({
      $and: [
        { isActive: true },
        {
          $or: [
            { name: { $regex: searchTerm, $options: 'i' } },
            { description: { $regex: searchTerm, $options: 'i' } },
            { brand: { $regex: searchTerm, $options: 'i' } }
          ]
        }
      ]
    });

    console.log('\nSearch test - Found products:', foundProducts.length);
    foundProducts.forEach(p => {
      console.log('- Found:', p.name);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkDB();

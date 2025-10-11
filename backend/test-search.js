import mongoose from 'mongoose';
import Product from './models/Product.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-pharmacy';

async function testSearch() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Test tìm sản phẩm
    const searchTerm = 'sua';
    console.log('Search term:', searchTerm);

    const products = await Product.find({
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

    console.log('Found products:', products.length);
    products.forEach(p => {
      console.log('- Product:', p.name, '| Active:', p.isActive);
    });

    // Test tìm tất cả sản phẩm
    const allProducts = await Product.find({});
    console.log('\nAll products:');
    allProducts.forEach(p => {
      console.log('- Product:', p.name, '| Active:', p.isActive);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testSearch();

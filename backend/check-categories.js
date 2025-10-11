/**
 * Check categories in database
 */

import mongoose from 'mongoose';
import Category from './models/Category.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkCategories() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-pharmacy';
    console.log('🔗 Connecting to:', mongoUri);
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    const categories = await Category.find();
    console.log('📊 Categories found:', categories.length);
    
    if (categories.length === 0) {
      console.log('⚠️  No categories found. Creating sample data...');
      
      // Create sample categories
      const sampleCategories = [
        {
          name: 'Thuốc',
          slug: 'thuoc',
          description: 'Các loại thuốc chữa bệnh',
          isActive: true,
          order: 1
        },
        {
          name: 'Mỹ phẩm',
          slug: 'my-pham',
          description: 'Các sản phẩm mỹ phẩm',
          isActive: true,
          order: 2
        },
        {
          name: 'Thiết bị y tế',
          slug: 'thiet-bi-y-te',
          description: 'Các thiết bị y tế',
          isActive: true,
          order: 3
        },
        {
          name: 'Thực phẩm chức năng',
          slug: 'thuc-pham-chuc-nang',
          description: 'Các thực phẩm chức năng',
          isActive: true,
          order: 4
        }
      ];

      const createdCategories = await Category.insertMany(sampleCategories);
      console.log('✅ Created sample categories:', createdCategories.length);
    } else {
      console.log('📋 Categories:');
      categories.forEach(cat => {
        console.log(`- ${cat.name} (${cat.slug}) - Active: ${cat.isActive}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

checkCategories();

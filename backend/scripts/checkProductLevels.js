import mongoose from 'mongoose';

mongoose.connect('mongodb://localhost:27017/smart-pharmacy').then(async () => {
    console.log('Connected to MongoDB\n');
    
    const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
    const Category = mongoose.model('Category', new mongoose.Schema({}, { strict: false }));
    
    // Get all products
    const products = await Product.find({}).lean();
    console.log(`Total Products: ${products.length}\n`);
    
    // Get sample products with their category info
    const sampleSize = 5;
    console.log(`=== SAMPLE ${sampleSize} PRODUCTS ===\n`);
    
    for (let i = 0; i < Math.min(sampleSize, products.length); i++) {
        const product = products[i];
        const category = await Category.findById(product.categoryId).lean();
        
        console.log(`${i + 1}. ${product.name}`);
        console.log(`   Category ID: ${product.categoryId}`);
        if (category) {
            console.log(`   Category Name: ${category.name}`);
            console.log(`   Category Level: ${category.level}`);
        } else {
            console.log(`   Category: NOT FOUND`);
        }
        console.log('');
    }
    
    // Count products by category level
    const levelCounts = {};
    let notFoundCount = 0;
    
    for (const product of products) {
        if (!product.categoryId) {
            notFoundCount++;
            continue;
        }
        
        const category = await Category.findById(product.categoryId).lean();
        if (category) {
            const level = category.level;
            levelCounts[level] = (levelCounts[level] || 0) + 1;
        } else {
            notFoundCount++;
        }
    }
    
    console.log('=== PRODUCT DISTRIBUTION BY CATEGORY LEVEL ===\n');
    Object.keys(levelCounts).sort().forEach(level => {
        console.log(`Level ${level}: ${levelCounts[level]} products`);
    });
    if (notFoundCount > 0) {
        console.log(`No Category/Not Found: ${notFoundCount} products`);
    }
    
    process.exit(0);
}).catch(err => {
    console.error('Error:', err);
    process.exit(1);
});

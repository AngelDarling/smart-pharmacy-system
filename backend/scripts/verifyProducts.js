import mongoose from 'mongoose';

mongoose.connect('mongodb://localhost:27017/smart-pharmacy').then(async () => {
    const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
    const Category = mongoose.model('Category', new mongoose.Schema({}, { strict: false }));
    
    // Get all level 2 categories
    const level2Categories = await Category.find({ level: 2 }).lean();
    
    console.log('=== PRODUCT COUNT BY CATEGORY ===\n');
    
    let emptyCount = 0;
    let withProductsCount = 0;
    
    for (const cat of level2Categories) {
        const count = await Product.countDocuments({ categoryId: cat._id });
        if (count === 0) {
            emptyCount++;
        } else {
            withProductsCount++;
            console.log(`✅ ${cat.name}: ${count} products`);
        }
    }
    
    console.log(`\n=== SUMMARY ===`);
    console.log(`Total Level 2 Categories: ${level2Categories.length}`);
    console.log(`With Products: ${withProductsCount}`);
    console.log(`Still Empty: ${emptyCount}`);
    
    // Show remaining empty categories
    if (emptyCount > 0) {
        console.log(`\n=== REMAINING EMPTY CATEGORIES ===`);
        for (const cat of level2Categories) {
            const count = await Product.countDocuments({ categoryId: cat._id });
            if (count === 0) {
                console.log(`   - ${cat.name}`);
            }
        }
    }
    
    process.exit(0);
}).catch(err => {
    console.error('Error:', err);
    process.exit(1);
});

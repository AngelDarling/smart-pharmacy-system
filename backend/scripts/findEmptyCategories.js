import mongoose from 'mongoose';

mongoose.connect('mongodb://localhost:27017/smart-pharmacy').then(async () => {
    console.log('Connected to MongoDB\n');
    
    const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
    const Category = mongoose.model('Category', new mongoose.Schema({}, { strict: false }));
    
    // Get all level 2 categories
    const level2Categories = await Category.find({ level: 2 }).lean();
    console.log(`Total Level 2 Categories: ${level2Categories.length}\n`);
    
    const emptyCategories = [];
    const categoriesWithProducts = [];
    
    for (const cat of level2Categories) {
        const count = await Product.countDocuments({ categoryId: cat._id });
        const parent = await Category.findById(cat.parent).lean();
        
        const catInfo = {
            name: cat.name,
            _id: cat._id.toString(),
            parentName: parent?.name || 'Unknown',
            productCount: count
        };
        
        if (count === 0) {
            emptyCategories.push(catInfo);
        } else {
            categoriesWithProducts.push(catInfo);
        }
    }
    
    console.log('=== EMPTY LEVEL 2 CATEGORIES ===');
    console.log(`Total: ${emptyCategories.length}\n`);
    
    // Group by parent category
    const groupedByParent = {};
    emptyCategories.forEach(cat => {
        if (!groupedByParent[cat.parentName]) {
            groupedByParent[cat.parentName] = [];
        }
        groupedByParent[cat.parentName].push(cat);
    });
    
    Object.keys(groupedByParent).sort().forEach(parentName => {
        console.log(`\n📁 ${parentName}:`);
        groupedByParent[parentName].forEach(cat => {
            console.log(`   - ${cat.name} (ID: ${cat._id})`);
        });
    });
    
    console.log(`\n\n=== CATEGORIES WITH PRODUCTS ===`);
    console.log(`Total: ${categoriesWithProducts.length}\n`);
    
    // Show first 10
    categoriesWithProducts.slice(0, 10).forEach((cat, index) => {
        console.log(`${index + 1}. ${cat.name} (${cat.productCount} products) - Parent: ${cat.parentName}`);
    });
    
    process.exit(0);
}).catch(err => {
    console.error('Error:', err);
    process.exit(1);
});

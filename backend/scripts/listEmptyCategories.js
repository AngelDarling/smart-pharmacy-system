import mongoose from 'mongoose';

mongoose.connect('mongodb://localhost:27017/smart-pharmacy').then(async () => {
    const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
    const Category = mongoose.model('Category', new mongoose.Schema({}, { strict: false }));
    const Brand = mongoose.model('Brand', new mongoose.Schema({}, { strict: false }));
    
    // Get all level 2 categories
    const level2Categories = await Category.find({ level: 2 }).lean();
    
    const emptyCategories = [];
    
    for (const cat of level2Categories) {
        const count = await Product.countDocuments({ categoryId: cat._id });
        if (count === 0) {
            const parent = await Category.findById(cat.parent).lean();
            emptyCategories.push({
                name: cat.name,
                _id: cat._id.toString(),
                parentName: parent?.name || 'Unknown'
            });
        }
    }
    
    console.log(`Total Empty Level 2 Categories: ${emptyCategories.length}`);
    console.log(`\nFirst 20 Empty Categories:\n`);
    
    emptyCategories.slice(0, 20).forEach((cat, index) => {
        console.log(`${index + 1}. ${cat.name}`);
        console.log(`   Parent: ${cat.parentName}`);
        console.log(`   ID: ${cat._id}\n`);
    });
    
    // Get brands for reference
    const brands = await Brand.find({}).select('name _id').lean();
    console.log(`\nAvailable Brands (${brands.length} total):`);
    brands.slice(0, 10).forEach(b => {
        console.log(`- ${b.name} (${b._id})`);
    });
    
    process.exit(0);
}).catch(err => {
    console.error('Error:', err);
    process.exit(1);
});

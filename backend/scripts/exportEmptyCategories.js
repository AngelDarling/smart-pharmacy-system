import mongoose from 'mongoose';
import fs from 'fs';

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
    
    // Get brands
    const brands = await Brand.find({}).select('name _id').lean();
    
    const output = {
        totalEmpty: emptyCategories.length,
        emptyCategories: emptyCategories,
        brands: brands.map(b => ({ name: b.name, _id: b._id.toString() }))
    };
    
    // Write to JSON file
    fs.writeFileSync('empty_categories_data.json', JSON.stringify(output, null, 2), 'utf8');
    console.log('Data written to empty_categories_data.json');
    console.log(`Total Empty Categories: ${emptyCategories.length}`);
    console.log(`Total Brands: ${brands.length}`);
    
    process.exit(0);
}).catch(err => {
    console.error('Error:', err);
    process.exit(1);
});

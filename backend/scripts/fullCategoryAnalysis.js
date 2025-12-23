import mongoose from 'mongoose';
import fs from 'fs';

mongoose.connect('mongodb://localhost:27017/smart-pharmacy').then(async () => {
    const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
    const Category = mongoose.model('Category', new mongoose.Schema({}, { strict: false }));
    const Brand = mongoose.model('Brand', new mongoose.Schema({}, { strict: false }));
    
    console.log('Analyzing categories...\n');
    
    // Get all level 2 categories
    const level2Categories = await Category.find({ level: 2 }).sort({ name: 1 }).lean();
    console.log(`Total Level 2 Categories: ${level2Categories.length}`);
    
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
    
    console.log(`Empty Categories: ${emptyCategories.length}`);
    console.log(`Categories with Products: ${categoriesWithProducts.length}\n`);
    
    // Get brands
    const brands = await Brand.find({}).select('name _id').lean();
    
    // Write full list to file
    const output = {
        summary: {
            totalLevel2: level2Categories.length,
            empty: emptyCategories.length,
            withProducts: categoriesWithProducts.length,
            totalBrands: brands.length
        },
        emptyCategories: emptyCategories,
        categoriesWithProducts: categoriesWithProducts.slice(0, 20), // Just first 20 for reference
        brands: brands.map(b => ({ name: b.name, _id: b._id.toString() }))
    };
    
    fs.writeFileSync('category_analysis.json', JSON.stringify(output, null, 2), 'utf8');
    console.log('Full analysis written to category_analysis.json');
    
    // Print summary
    console.log('\n=== SUMMARY ===');
    console.log(`Total Level 2 Categories: ${output.summary.totalLevel2}`);
    console.log(`Empty Categories: ${output.summary.empty}`);
    console.log(`With Products: ${output.summary.withProducts}`);
    console.log(`Available Brands: ${output.summary.totalBrands}`);
    
    // Print first 30 empty categories
    console.log('\n=== FIRST 30 EMPTY CATEGORIES ===');
    emptyCategories.slice(0, 30).forEach((cat, i) => {
        console.log(`${i+1}. ${cat.name} (Parent: ${cat.parentName})`);
    });
    
    process.exit(0);
}).catch(err => {
    console.error('Error:', err);
    process.exit(1);
});

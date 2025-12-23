import mongoose from 'mongoose';

mongoose.connect('mongodb://localhost:27017/smart-pharmacy').then(async () => {
    console.log('Connected to MongoDB\n');
    
    const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
    
    // Check all products
    const allProducts = await Product.find({}).lean();
    console.log(`Total products in database: ${allProducts.length}\n`);
    
    // Group by stock level
    const stockGroups = {
        zero: [],
        nonZero: []
    };
    
    allProducts.forEach(p => {
        if (p.totalStock === 0 || !p.totalStock) {
            stockGroups.zero.push(p);
        } else {
            stockGroups.nonZero.push(p);
        }
    });
    
    console.log('=== STOCK DISTRIBUTION ===');
    console.log(`Products with stock = 0: ${stockGroups.zero.length}`);
    console.log(`Products with stock > 0: ${stockGroups.nonZero.length}`);
    
    if (stockGroups.nonZero.length > 0) {
        console.log('\n=== PRODUCTS WITH STOCK > 0 ===');
        stockGroups.nonZero.forEach(p => {
            console.log(`${p.name}: ${p.totalStock} ${p.unit || ''}`);
        });
        
        console.log('\n⚠️  Updating remaining products to stock = 0...');
        
        const ids = stockGroups.nonZero.map(p => p._id);
        const result = await Product.updateMany(
            { _id: { $in: ids } },
            { $set: { totalStock: 0, minStockLevel: 0 } }
        );
        
        console.log(`✅ Updated ${result.modifiedCount} products`);
    } else {
        console.log('\n✅ All products have stock = 0');
    }
    
    // Final verification
    const finalNonZero = await Product.countDocuments({ totalStock: { $gt: 0 } });
    console.log(`\n🔍 Final check: ${finalNonZero} products with stock > 0`);
    
    process.exit(0);
}).catch(err => {
    console.error('Error:', err);
    process.exit(1);
});

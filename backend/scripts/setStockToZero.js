import mongoose from 'mongoose';

mongoose.connect('mongodb://localhost:27017/smart-pharmacy').then(async () => {
    console.log('Connected to MongoDB\n');
    
    const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
    
    // Find all products that were just added (they have placeholder images)
    const recentProducts = await Product.find({
        imageUrls: { $in: ['https://via.placeholder.com/400x400?text=Product'] }
    });
    
    console.log(`Found ${recentProducts.length} recently added products\n`);
    
    // Update all to have totalStock = 0
    const result = await Product.updateMany(
        { imageUrls: { $in: ['https://via.placeholder.com/400x400?text=Product'] } },
        { 
            $set: { 
                totalStock: 0,
                minStockLevel: 0
            } 
        }
    );
    
    console.log(`✅ Updated ${result.modifiedCount} products`);
    console.log('   - totalStock: 0');
    console.log('   - minStockLevel: 0');
    
    // Verify
    console.log('\n🔍 Verification:');
    const zeroStockCount = await Product.countDocuments({ 
        totalStock: 0,
        imageUrls: { $in: ['https://via.placeholder.com/400x400?text=Product'] }
    });
    console.log(`   Products with totalStock = 0: ${zeroStockCount}`);
    
    // Show sample
    const samples = await Product.find({ 
        totalStock: 0,
        imageUrls: { $in: ['https://via.placeholder.com/400x400?text=Product'] }
    }).limit(5).lean();
    
    console.log('\n📦 Sample products:');
    samples.forEach(p => {
        console.log(`   - ${p.name}: totalStock = ${p.totalStock}`);
    });
    
    process.exit(0);
}).catch(err => {
    console.error('Error:', err);
    process.exit(1);
});

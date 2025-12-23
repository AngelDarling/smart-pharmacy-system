import mongoose from 'mongoose';

mongoose.connect('mongodb://localhost:27017/smart-pharmacy').then(async () => {
    console.log('Connected to MongoDB\n');
    
    const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
    
    // Find all products created today (recently added)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const recentProducts = await Product.find({
        createdAt: { $gte: today }
    }).lean();
    
    console.log(`Found ${recentProducts.length} products created today\n`);
    
    // Show current stock levels
    console.log('Current stock levels:');
    const stockLevels = {};
    recentProducts.forEach(p => {
        const stock = p.totalStock || 0;
        stockLevels[stock] = (stockLevels[stock] || 0) + 1;
    });
    
    Object.keys(stockLevels).sort((a, b) => b - a).forEach(stock => {
        console.log(`   ${stock} units: ${stockLevels[stock]} products`);
    });
    
    // Count how many need updating
    const needUpdate = recentProducts.filter(p => p.totalStock > 0).length;
    console.log(`\n${needUpdate} products need stock update to 0\n`);
    
    // Update all recent products to have totalStock = 0
    const result = await Product.updateMany(
        { createdAt: { $gte: today } },
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
        createdAt: { $gte: today },
        totalStock: 0
    });
    const nonZeroStockCount = await Product.countDocuments({ 
        createdAt: { $gte: today },
        totalStock: { $gt: 0 }
    });
    
    console.log(`   Products with totalStock = 0: ${zeroStockCount}`);
    console.log(`   Products with totalStock > 0: ${nonZeroStockCount}`);
    
    if (nonZeroStockCount > 0) {
        console.log('\n⚠️  Some products still have stock > 0:');
        const remaining = await Product.find({ 
            createdAt: { $gte: today },
            totalStock: { $gt: 0 }
        }).limit(5).lean();
        
        remaining.forEach(p => {
            console.log(`   - ${p.name}: ${p.totalStock}`);
        });
    }
    
    // Show sample of updated products
    console.log('\n📦 Sample updated products:');
    const samples = await Product.find({ 
        createdAt: { $gte: today }
    }).limit(5).lean();
    
    samples.forEach(p => {
        console.log(`   - ${p.name}: totalStock = ${p.totalStock}`);
    });
    
    process.exit(0);
}).catch(err => {
    console.error('Error:', err);
    process.exit(1);
});

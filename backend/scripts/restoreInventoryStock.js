import mongoose from 'mongoose';

async function restoreStock() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect('mongodb://localhost:27017/smart-pharmacy');
        console.log('Connected successfully.\n');

        const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
        const ProductBatch = mongoose.model('ProductBatch', new mongoose.Schema({}, { strict: false }));

        const skusToRestore = [
            'GENE-LIPB-45',
            'GENE-TRAM-10',
            'GENE-LIST-250',
            'GENE-SENS-100',
            'GENE-SALO-20',
            'GENE-ROHT-13',
            'DOME-IBUP-100',
            'TRAP-PARA-100',
            'GENE-OMRO-7120',
            'GENE-MASK-50',
            'TRAP-VITA-2390'
        ];

        console.log(`Starting restoration for ${skusToRestore.length} products...\n`);

        for (const sku of skusToRestore) {
            const product = await Product.findOne({ sku: sku });
            if (!product) {
                console.log(`❌ SKU: ${sku} - Not found in database.`);
                continue;
            }

            // Find all batches for this product
            const batches = await ProductBatch.find({ productId: product._id });
            
            // Calculate total remaining quantity from batches
            const restoredTotalStock = batches.reduce((sum, batch) => sum + (batch.remainingQuantity || 0), 0);

            console.log(`Processing: ${product.name} (${sku})`);
            console.log(`   - Current totalStock: ${product.totalStock}`);
            console.log(`   - Restored totalStock: ${restoredTotalStock} (from ${batches.length} batches)`);

            // Update the product
            await Product.updateOne(
                { _id: product._id },
                { 
                    $set: { 
                        totalStock: restoredTotalStock,
                        minStockLevel: 10 // Resetting to a reasonable default
                    } 
                }
            );

            console.log(`   ✅ Restored successfully.\n`);
        }

        console.log('--- Restoration Completed ---');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error during restoration:', error);
        process.exit(1);
    }
}

restoreStock();

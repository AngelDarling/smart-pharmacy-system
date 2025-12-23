import mongoose from 'mongoose';

mongoose.connect('mongodb://localhost:27017/smart-pharmacy').then(async () => {
    console.log('Connected to MongoDB\n');
    
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
    
    console.log(`Checking ${skusToRestore.length} products...\n`);
    
    const results = [];
    
    for (const sku of skusToRestore) {
        const product = await Product.findOne({ sku: sku }).lean();
        if (product) {
            const batches = await ProductBatch.find({ productId: product._id }).lean();
            const totalRemainingInBatches = batches.reduce((sum, batch) => sum + (batch.remainingQuantity || 0), 0);
            
            results.push({
                sku: sku,
                name: product.name,
                id: product._id,
                currentTotalStock: product.totalStock,
                batchCount: batches.length,
                totalRemainingInBatches: totalRemainingInBatches,
                batches: batches.map(b => ({
                    batchNumber: b.batchNumber,
                    quantity: b.quantity,
                    remainingQuantity: b.remainingQuantity
                }))
            });
        } else {
            results.push({ sku: sku, status: 'NOT FOUND' });
        }
    }
    
    console.log(JSON.stringify(results, null, 2));
    
    process.exit(0);
}).catch(err => {
    console.error('Error:', err);
    process.exit(1);
});

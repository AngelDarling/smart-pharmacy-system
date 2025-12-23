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
    
    console.log('--- Proposed Stock Restoration (Dry Run) ---\n');
    
    for (const sku of skusToRestore) {
        const product = await Product.findOne({ sku: sku }).lean();
        if (product) {
            const batches = await ProductBatch.find({ productId: product._id }).lean();
            const totalRemaining = batches.reduce((sum, b) => sum + (b.remainingQuantity || 0), 0);
            
            console.log(`SKU: ${sku}`);
            console.log(`Name: ${product.name}`);
            console.log(`Current totalStock: ${product.totalStock}`);
            console.log(`Calculation (Batch remainingQuantities): ${batches.map(b => b.remainingQuantity).join(' + ') || 0}`);
            console.log(`Restored totalStock will be: ${totalRemaining}`);
            console.log('-------------------------------------------');
        } else {
            console.log(`SKU: ${sku} - NOT FOUND`);
            console.log('-------------------------------------------');
        }
    }
    
    process.exit(0);
}).catch(err => {
    console.error('Error:', err);
    process.exit(1);
});

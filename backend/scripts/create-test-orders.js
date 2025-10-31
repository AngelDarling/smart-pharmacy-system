import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

// Kết nối MongoDB
mongoose.connect('mongodb://localhost:27017/smart-pharmacy', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function createTestOrders() {
  try {
    // Xóa các đơn hàng test cũ
    await Order.deleteMany({ code: { $regex: /^ORD/ } });
    console.log('Đã xóa đơn hàng test cũ');
    
    // Lấy một số sản phẩm và user để tạo đơn hàng
    const products = await Product.find({ isActive: true }).limit(10);
    const users = await User.find().limit(3);
    
    if (products.length === 0 || users.length === 0) {
      console.log('Không có sản phẩm hoặc user để tạo đơn hàng');
      return;
    }

    // Tạo đơn hàng cho ngày hôm nay
    const today = new Date();
    const orders = [];

    for (let i = 0; i < 5; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const productCount = Math.floor(Math.random() * 3) + 1; // 1-3 sản phẩm mỗi đơn
      const items = [];
      
      for (let j = 0; j < productCount; j++) {
        const product = products[Math.floor(Math.random() * products.length)];
        const quantity = Math.floor(Math.random() * 3) + 1; // 1-3 sản phẩm
        
        items.push({
          productId: product._id,
          quantity: quantity,
          priceSnapshot: product.price,
          nameSnapshot: product.name,
          imageSnapshot: product.images?.[0] || '/default-product.png'
        });
      }

      const order = new Order({
        code: `ORD${Date.now()}${i}`,
        userId: user._id,
        items: items,
        shippingAddress: {
          fullName: user.fullName,
          phone: user.phone,
          address: '123 Test Street, Test City',
          email: user.email,
          note: 'Test order'
        },
        status: ['processing', 'shipping', 'completed'][Math.floor(Math.random() * 3)],
        totals: {
          items: items.reduce((sum, item) => sum + (item.priceSnapshot * item.quantity), 0),
          shipping: 30000,
          discount: 0,
          grand: items.reduce((sum, item) => sum + (item.priceSnapshot * item.quantity), 0) + 30000
        },
        createdAt: new Date() // Thời gian hiện tại
      });

      orders.push(order);
    }

    await Order.insertMany(orders);
    console.log(`Đã tạo ${orders.length} đơn hàng test cho ngày hôm nay`);
    
    // Hiển thị thống kê
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    
    const todayOrders = await Order.find({
      createdAt: { $gte: todayStart, $lte: todayEnd },
      status: { $in: ['confirmed', 'shipped', 'delivered'] }
    });
    
    console.log(`Tổng đơn hàng hôm nay: ${todayOrders.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Lỗi khi tạo đơn hàng test:', error);
    process.exit(1);
  }
}

createTestOrders();

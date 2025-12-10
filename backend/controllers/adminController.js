import Order from "../models/Order.js";
import Category from "../models/Category.js";
import Product from "../models/Product.js";

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

function startOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
}

function endOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}

export async function getAdminStats(req, res, next) {
  try {
    const now = new Date();
    const sToday = startOfDay(now);
    const eToday = endOfDay(now);
    const sMonth = startOfMonth(now);
    const eMonth = endOfMonth(now);

    // Calculate 7 days ago
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    const s7Days = startOfDay(sevenDaysAgo);

    const [
      todayOrders, 
      monthOrders, 
      dailySales,
      totalProducts,
      totalCategories,
      lowStockProducts,
      last7DaysSales,
      topProducts
    ] = await Promise.all([
      Order.aggregate([
        { $match: { status: "completed", createdAt: { $gte: sToday, $lte: eToday } } },
        { $group: { _id: null, revenue: { $sum: "$totals.grand" }, count: { $sum: 1 } } }
      ]),
      Order.aggregate([
        { $match: { status: "completed", createdAt: { $gte: sMonth, $lte: eMonth } } },
        { $group: { _id: null, revenue: { $sum: "$totals.grand" }, count: { $sum: 1 } } }
      ]),
      Order.aggregate([
        { $match: { status: "completed", createdAt: { $gte: sMonth, $lte: eMonth } } },
        { $group: { _id: { $dayOfMonth: "$createdAt" }, total: { $sum: "$totals.grand" } } },
        { $project: { day: "$_id", total: 1, _id: 0 } },
        { $sort: { day: 1 } }
      ]),
      Product.countDocuments({ isActive: true }),
      Category.countDocuments({ isActive: true }),
      Product.countDocuments({ isActive: true, totalStock: { $lte: 10 } }), // Low stock threshold
      // Last 7 days revenue
      Order.aggregate([
        { $match: { status: "completed", createdAt: { $gte: s7Days, $lte: eToday } } },
        { 
          $group: { 
            _id: { 
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
              day: { $dayOfMonth: "$createdAt" }
            }, 
            revenue: { $sum: "$totals.grand" },
            orders: { $sum: 1 }
          } 
        },
        { 
          $project: { 
            date: {
              $dateFromParts: {
                year: "$_id.year",
                month: "$_id.month",
                day: "$_id.day"
              }
            },
            revenue: 1,
            orders: 1,
            _id: 0
          }
        },
        { $sort: { date: 1 } }
      ]),
      // Top 5 products by sales
      Order.aggregate([
        { $match: { status: "completed", createdAt: { $gte: sMonth, $lte: eMonth } } },
        { $unwind: "$items" },
        { 
          $group: { 
            _id: "$items.productId", 
            sales: { $sum: "$items.quantity" },
            revenue: { $sum: { $multiply: ["$items.quantity", "$items.priceSnapshot"] } }
          } 
        },
        { $sort: { sales: -1 } },
        { $limit: 5 },
        { 
          $lookup: {
            from: "products",
            localField: "_id",
            foreignField: "_id",
            as: "product"
          }
        },
        { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            name: { $ifNull: ["$product.name", "Sản phẩm đã xóa"] },
            sales: 1,
            revenue: 1
          }
        }
      ])
    ]);

    // Build an array for all days in month
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const dayToValue = new Map(dailySales.map((d) => [d.day, d.total]));
    const daily = Array.from({ length: daysInMonth }, (_, i) => ({ day: i + 1, total: Number(dayToValue.get(i + 1) || 0) }));

    // Build array for last 7 days (fill missing days with 0)
    const last7DaysData = [];
    const last7DaysArray = Array.isArray(last7DaysSales) ? last7DaysSales : [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const existing = last7DaysArray.find(d => {
        const dStr = new Date(d.date).toISOString().split('T')[0];
        return dStr === dateStr;
      });
      
      last7DaysData.push({
        date: dateStr,
        day: date.getDate(),
        revenue: Number(existing?.revenue || 0),
        orders: Number(existing?.orders || 0)
      });
    }

    res.json({
      today: {
        revenue: Number(todayOrders[0]?.revenue || 0),
        invoices: Number(todayOrders[0]?.count || 0)
      },
      month: {
        revenue: Number(monthOrders[0]?.revenue || 0),
        invoices: Number(monthOrders[0]?.count || 0)
      },
      chart: {
        daily
      },
      last7Days: last7DaysData,
      topProducts: topProducts.map(p => ({
        name: p.name,
        sales: Number(p.sales),
        revenue: Number(p.revenue)
      })),
      products: {
        total: totalProducts
      },
      categories: {
        total: totalCategories
      },
      inventory: {
        lowStockCount: lowStockProducts
      },
      activities: [] // Placeholder for future activities
    });
  } catch (err) {
    console.error('[AdminStats Error]', err);
    console.error('[AdminStats Error Stack]', err.stack);
    next(err);
  }
}

export async function seedSample(req, res, next) {
  try {
    // Categories
    const categories = [
      { name: "Thuốc giảm đau", slug: "thuoc-giam-dau" },
      { name: "Thuốc ho", slug: "thuoc-ho" },
      { name: "Mỹ phẩm", slug: "my-pham" },
      { name: "Sữa dinh dưỡng", slug: "sua-dinh-duong" }
    ];
    const createdCats = [];
    for (const c of categories) {
      const exists = await Category.findOne({ slug: c.slug });
      createdCats.push(exists || (await Category.create({ ...c, iconUrl: "", isActive: true })));
    }

    const byName = new Map(createdCats.map((c) => [c.name, c._id]));
    // Products
    const products = [
      { name: "Paracetamol 500mg", slug: "paracetamol-500mg", category: "Thuốc giảm đau", price: 15000, unit: "vỉ", sku: "PCM500", barcode: "8935000000001" },
      { name: "Siro ho trẻ em", slug: "siro-ho-tre-em", category: "Thuốc ho", price: 35000, unit: "chai", sku: "SIROHO", barcode: "8935000000002" },
      { name: "Sua rua mat diu nhe", slug: "sua-rua-mat-diu-nhe", category: "Mỹ phẩm", price: 89000, unit: "tuýp", sku: "SRM-DN", barcode: "8935000000003" },
      { name: "Sua bot tre em 900g", slug: "sua-bot-tre-em-900g", category: "Sữa dinh dưỡng", price: 520000, unit: "hộp", sku: "SUA900", barcode: "8935000000004" }
    ];
    const createdProducts = [];
    for (const p of products) {
      const exists = await Product.findOne({ slug: p.slug });
      if (exists) { createdProducts.push(exists); continue; }
      const categoryId = byName.get(p.category) || null;
      const doc = await Product.create({ name: p.name, slug: p.slug, categoryId, price: p.price, unit: p.unit, sku: p.sku, barcode: p.barcode, imageUrls: [] });
      createdProducts.push(doc);
    }

    res.json({ categories: createdCats.length, products: createdProducts.length });
  } catch (err) {
    next(err);
  }
}



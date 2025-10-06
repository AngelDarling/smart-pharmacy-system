import Order from "../models/Order.js";
import AuditLog from "../models/AuditLog.js";
import Category from "../models/Category.js";
import Product from "../models/Product.js";
import InventoryTransaction from "../models/InventoryTransaction.js";
import Inventory from "../models/Inventory.js";
import GoodsReceipt from "../models/GoodsReceipt.js";

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

    const [todayOrders, monthOrders, recentActivities, lowStockCountAgg, todayGoodsReceipts, monthGoodsReceipts, dailySales, nearExpiry] = await Promise.all([
      Order.aggregate([
        { $match: { status: "completed", createdAt: { $gte: sToday, $lte: eToday } } },
        { $group: { _id: null, revenue: { $sum: "$totals.grand" }, count: { $sum: 1 } } }
      ]),
      Order.aggregate([
        { $match: { status: "completed", createdAt: { $gte: sMonth, $lte: eMonth } } },
        { $group: { _id: null, revenue: { $sum: "$totals.grand" }, count: { $sum: 1 } } }
      ]),
      AuditLog.find({}).sort({ createdAt: -1 }).limit(10).lean(),
      Inventory.aggregate([{ $match: { quantity: { $lte: 5 } } }, { $count: "count" }]),
      GoodsReceipt.countDocuments({ createdAt: { $gte: sToday, $lte: eToday } }),
      GoodsReceipt.countDocuments({ createdAt: { $gte: sMonth, $lte: eMonth } }),
      Order.aggregate([
        { $match: { status: "completed", createdAt: { $gte: sMonth, $lte: eMonth } } },
        { $group: { _id: { $dayOfMonth: "$createdAt" }, total: { $sum: "$totals.grand" } } },
        { $project: { day: "$_id", total: 1, _id: 0 } },
        { $sort: { day: 1 } }
      ]),
      Inventory.find({ expiryDate: { $exists: true, $ne: null, $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) } }).sort({ expiryDate: 1 }).limit(10).lean()
    ]);

    // Build an array for all days in month
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const dayToValue = new Map(dailySales.map((d) => [d.day, d.total]));
    const daily = Array.from({ length: daysInMonth }, (_, i) => ({ day: i + 1, total: Number(dayToValue.get(i + 1) || 0) }));

    res.json({
      today: {
        revenue: Number(todayOrders[0]?.revenue || 0),
        invoices: Number(todayOrders[0]?.count || 0),
        goodsReceipts: Number(todayGoodsReceipts || 0)
      },
      month: {
        revenue: Number(monthOrders[0]?.revenue || 0),
        invoices: Number(monthOrders[0]?.count || 0),
        goodsReceipts: Number(monthGoodsReceipts || 0)
      },
      inventory: {
        lowStockCount: Number(lowStockCountAgg[0]?.count || 0)
      },
      chart: {
        daily
      },
      nearExpiry,
      activities: recentActivities.map((a) => ({
        id: String(a._id),
        action: a.action,
        entityType: a.entityType,
        entityId: a.entityId,
        createdAt: a.createdAt
      }))
    });
  } catch (err) {
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
      { name: "Sữa rửa mặt dịu nhẹ", slug: "sua-rua-mat-diu-nhe", category: "Mỹ phẩm", price: 89000, unit: "tuýp", sku: "SRM-DN", barcode: "8935000000003" },
      { name: "Sữa bột trẻ em 900g", slug: "sua-bot-tre-em-900g", category: "Sữa dinh dưỡng", price: 520000, unit: "hộp", sku: "SUA900", barcode: "8935000000004" }
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



import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../models/Product.js";
import ProductSalesDaily from "../models/ProductSalesDaily.js";

dotenv.config();

function* eachDay(start, end) {
  const d = new Date(start);
  d.setHours(0, 0, 0, 0);
  while (d < end) {
    yield new Date(d);
    d.setDate(d.getDate() + 1);
  }
}

async function main() {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/smart-pharmacy";
  await mongoose.connect(uri);
  console.log("Connected to DB");

  const products = await Product.find({ isActive: true }).sort({ createdAt: -1 }).limit(12).select("_id price name");
  if (products.length === 0) {
    console.log("No products to seed");
    return process.exit(0);
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  let writes = 0;
  for (const day of eachDay(startOfMonth, endOfMonth)) {
    for (const p of products) {
      // tạo số lượng ngẫu nhiên nhẹ nhàng, có 60% ngày không bán
      const roll = Math.random();
      const qty = roll < 0.6 ? 0 : Math.floor(1 + Math.random() * 4);
      if (qty === 0) continue;
      await ProductSalesDaily.updateOne(
        { productId: p._id, date: day },
        { $inc: { quantity: qty, revenue: qty * (p.price || 0) } },
        { upsert: true }
      );
      writes++;
    }
  }

  console.log(`Seeded/updated ${writes} daily sales records for ${products.length} products in current month.`);
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});



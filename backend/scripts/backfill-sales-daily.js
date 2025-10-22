import mongoose from "mongoose";
import dotenv from "dotenv";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import ProductSalesDaily from "../models/ProductSalesDaily.js";

dotenv.config();

async function main() {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/smart-pharmacy";
  await mongoose.connect(uri);

  console.log("Connected. Backfilling ProductSalesDaily from completed orders...");

  const cursor = Order.find({ status: { $in: ["completed", "shipping", "processing", "pending"] } }).cursor();

  let count = 0;
  for await (const order of cursor) {
    const day = new Date(order.createdAt);
    day.setHours(0, 0, 0, 0);
    for (const item of order.items) {
      const product = await Product.findById(item.productId).select("price");
      const price = item.priceSnapshot || item.price || product?.price || 0;
      await ProductSalesDaily.updateOne(
        { productId: item.productId, date: day },
        { $inc: { quantity: item.quantity, revenue: item.quantity * price } },
        { upsert: true }
      );
    }
    count++;
    if (count % 100 === 0) console.log(`Processed ${count} orders...`);
  }

  console.log("Done.");
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});



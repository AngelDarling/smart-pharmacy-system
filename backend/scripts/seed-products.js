import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { connectDatabase } from "../config/db.js";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import Brand from "../models/Brand.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function slugify(input) {
  return input
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function listUploadImages() {
  const uploadsDir = path.resolve(__dirname, "../uploads");
  const results = [];

  const walk = (dir) => {
    let entries = [];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch (e) {
      return;
    }
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (/\.(png|jpe?g|webp|gif)$/i.test(entry.name)) {
        // Convert absolute path inside uploads -> web path /uploads/...
        const rel = path.relative(path.resolve(__dirname, "../"), fullPath).replace(/\\/g, "/");
        results.push(`/${rel}`);
      }
    }
  };

  walk(uploadsDir);
  // Fallback
  if (results.length === 0) {
    results.push("/uploads/default.png");
  }
  return results;
}

async function ensureBrand() {
  let brand = await Brand.findOne({ isActive: true });
  if (!brand) {
    brand = await Brand.create({ name: "Generic", slug: "generic", isActive: true });
  }
  return brand;
}

async function main() {
  const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/smart-pharmacy";
  await connectDatabase(MONGODB_URI);

  const targetTotal = parseInt(process.env.SEED_PRODUCT_COUNT || "50", 10);

  const level2Categories = await Category.find({ level: 2, isActive: true }).sort({ name: 1 });
  if (level2Categories.length === 0) {
    console.log("No level 2 categories found. Trying ancestors length === 2...");
    const all = await Category.find({ isActive: true });
    const derived = all.filter((c) => Array.isArray(c.ancestors) && c.ancestors.length === 2);
    level2Categories.push(...derived);
  }

  if (level2Categories.length === 0) {
    console.error("❌ No level 2 categories available. Please create categories first.");
    process.exit(1);
  }

  const brand = await ensureBrand();
  const images = listUploadImages();

  const perCategory = Math.max(1, Math.floor(targetTotal / level2Categories.length));
  let created = 0;
  const docs = [];

  for (const cat of level2Categories) {
    for (let i = 0; i < perCategory; i++) {
      if (created >= targetTotal) break;
      const idx = created + 1;
      const baseName = `${cat.name} ${idx}`;
      const slug = `${slugify(baseName)}-${Date.now().toString(36)}-${(Math.random()*1e6|0).toString(36)}`;
      const price = Math.floor(50000 + Math.random() * 450000);
      const stock = Math.floor(5 + Math.random() * 45);
      const selected = Array.from({ length: 1 + Math.floor(Math.random() * Math.min(3, images.length)) })
        .map(() => images[Math.floor(Math.random() * images.length)]);
      const uniqueImages = [...new Set(selected)];

      docs.push({
        name: baseName,
        slug,
        categoryId: cat._id,
        brandId: brand._id,
        price,
        compareAtPrice: price + Math.floor(price * 0.1),
        totalStock: stock,
        unit: "hộp",
        thumbnailUrl: uniqueImages[0] || "/uploads/default.png",
        imageUrls: uniqueImages,
        shortDescription: `Sản phẩm thuộc danh mục ${cat.name}.`,
        description: `Sản phẩm mẫu để demo giao diện và chức năng. Giá tham khảo: ${price.toLocaleString()}đ.`,
        usage: "Dùng theo hướng dẫn trên bao bì.",
        storage: "Nơi khô ráo, thoáng mát.",
        isActive: true,
        isBestSeller: Math.random() < 0.2,
        isFeatured: Math.random() < 0.2
      });
      created += 1;
    }
    if (created >= targetTotal) break;
  }

  if (docs.length > 0) {
    await Product.insertMany(docs, { ordered: false });
  }

  console.log(`✅ Seeded ${docs.length} products into ${level2Categories.length} level-2 categories.`);
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});



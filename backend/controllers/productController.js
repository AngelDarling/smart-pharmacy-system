import { z } from "zod";
import Product from "../models/Product.js";

const upsertSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  categoryId: z.string(),
  brand: z.string().optional(),
  description: z.string().optional(),
  usage: z.string().optional(),
  imageUrls: z.array(z.string()).optional(),
  price: z.number().nonnegative(),
  compareAtPrice: z.number().nonnegative().optional(),
  unit: z.string().optional(),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  contraindications: z.string().optional(),
  dosage: z.string().optional(),
  ingredients: z.string().optional(),
  storage: z.string().optional(),
  isActive: z.boolean().optional()
});

export async function list(req, res) {
  const page = Math.max(1, parseInt(req.query.page || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || "20", 10)));
  const skip = (page - 1) * limit;

  const q = {};
  if (req.query.categoryId) q.categoryId = req.query.categoryId;
  if (req.query.minPrice) q.price = { ...(q.price || {}), $gte: Number(req.query.minPrice) };
  if (req.query.maxPrice) q.price = { ...(q.price || {}), $lte: Number(req.query.maxPrice) };
  if (req.query.active) q.isActive = req.query.active === "true";

  const text = req.query.q?.trim();
  const filter = text ? { $and: [q, { $text: { $search: text } }] } : q;

  const [items, total] = await Promise.all([
    Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Product.countDocuments(filter)
  ]);

  res.json({ items, page, limit, total });
}

export async function getBySlug(req, res) {
  const doc = await Product.findOne({ slug: req.params.slug });
  if (!doc) return res.status(404).json({ message: "Không tìm thấy" });
  res.json(doc);
}

export async function create(req, res, next) {
  try {
    const parsed = upsertSchema.extend({ attributes: z.record(z.any()).optional() }).parse(req.body);
    const doc = await Product.create(parsed);
    res.status(201).json(doc);
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const parsed = upsertSchema.extend({ attributes: z.record(z.any()).optional() }).partial().parse(req.body);
    const doc = await Product.findByIdAndUpdate(req.params.id, parsed, { new: true });
    if (!doc) return res.status(404).json({ message: "Không tìm thấy" });
    res.json(doc);
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res) {
  const doc = await Product.findByIdAndDelete(req.params.id);
  if (!doc) return res.status(404).json({ message: "Không tìm thấy" });
  res.json({ success: true });
}



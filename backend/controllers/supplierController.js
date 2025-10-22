import { z } from "zod";
import Supplier from "../models/Supplier.js";
import Category from "../models/Category.js";

const upsertSchema = z.object({
  name: z.string().min(2),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  // category: store root category _id as string
  category: z.string().optional(),
  isActive: z.boolean().optional()
});

export async function list(req, res) {
  const page = Math.max(1, parseInt(req.query.page || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '10', 10)));
  const skip = (page - 1) * limit;

  const match = {};
  const { q, isActive, category } = req.query;
  if (isActive === 'true') match.isActive = true;
  if (isActive === 'false') match.isActive = false;
  if (category) match.category = category; // category is root category _id

  let filter = match;
  const text = (q || '').trim();
  if (text) {
    const regex = new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter = {
      $and: [ match, { $or: [
        { name: regex },
        { companyName: regex },
        { email: regex },
        { phone: regex },
        { address: regex }
      ] } ]
    };
  }

  const [items, total] = await Promise.all([
    Supplier.find(filter)
      .populate('category', 'name level')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Supplier.countDocuments(filter)
  ]);

  res.json({ items, page, limit, total });
}

export async function create(req, res, next) {
  try {
    const parsed = upsertSchema.parse(req.body);
    // Auto-generate supplier code if missing
    function slugUpper(input = "") {
      return input
        .toString()
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')
        .slice(0, 16);
    }
    async function ensureUniqueCode(base) {
      let candidate = base || `SUP-${Date.now()}`;
      let i = 1;
      while (await Supplier.findOne({ code: candidate }).lean()) {
        candidate = `${base}-${i++}`;
        if (i > 1000) throw new Error('Cannot generate unique supplier code');
      }
      return candidate;
    }

    const baseCode = `SUP-${slugUpper(parsed.name) || 'AUTO'}`;
    const code = await ensureUniqueCode(baseCode);

    const doc = await Supplier.create({ ...parsed, code });
    res.status(201).json(doc);
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const parsed = upsertSchema.partial().parse(req.body);
    const doc = await Supplier.findByIdAndUpdate(req.params.id, parsed, { new: true });
    if (!doc) return res.status(404).json({ message: "Không tìm thấy" });
    res.json(doc);
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res) {
  const doc = await Supplier.findByIdAndDelete(req.params.id);
  if (!doc) return res.status(404).json({ message: "Không tìm thấy" });
  res.json({ success: true });
}



import { z } from "zod";
import Category from "../models/Category.js";

const upsertSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  parentId: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
  // chấp nhận cả đường dẫn tương đối (VD: /uploads/...) nên không dùng url()
  iconUrl: z.string().optional().or(z.literal(""))
});

export async function list(req, res) {
  const page = Math.max(1, parseInt(req.query.page || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || "10", 10)));
  const skip = (page - 1) * limit;

  const q = (req.query.q || "").trim();
  const filter = q ? { name: { $regex: q, $options: "i" } } : {};

  const [items, total] = await Promise.all([
    Category.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Category.countDocuments(filter)
  ]);
  // Ensure default icon if missing
  const withIcon = items.map((c) => ({
    ...c.toObject(),
    iconUrl: c.iconUrl || "/uploads/default.png"
  }));
  res.json({ items: withIcon, total, page, limit });
}

export async function tree(req, res) {
  const docs = await Category.find({ isActive: true });
  const byId = new Map(docs.map((d) => [d._id.toString(), { ...d.toObject(), children: [] }]));
  const roots = [];
  for (const d of byId.values()) {
    if (d.parentId) {
      const parent = byId.get(d.parentId.toString());
      if (parent) parent.children.push(d);
      else roots.push(d);
    } else {
      roots.push(d);
    }
  }
  res.json(roots);
}

export async function create(req, res, next) {
  try {
    const parsed = upsertSchema.parse(req.body);
    const doc = await Category.create({
      name: parsed.name,
      slug: parsed.slug,
      parentId: parsed.parentId || null,
      isActive: parsed.isActive ?? true,
      path: "",
      iconUrl: parsed.iconUrl || ""
    });
    res.status(201).json(doc);
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const parsed = upsertSchema.partial().parse(req.body);
    const doc = await Category.findByIdAndUpdate(req.params.id, parsed, { new: true });
    if (!doc) return res.status(404).json({ message: "Không tìm thấy" });
    res.json(doc);
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res) {
  const doc = await Category.findByIdAndDelete(req.params.id);
  if (!doc) return res.status(404).json({ message: "Không tìm thấy" });
  res.json({ success: true });
}



import { z } from "zod";
import Supplier from "../models/Supplier.js";

const upsertSchema = z.object({
  name: z.string().min(2),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  isActive: z.boolean().optional()
});

export async function list(req, res) {
  const docs = await Supplier.find({}).sort({ createdAt: -1 });
  res.json(docs);
}

export async function create(req, res, next) {
  try {
    const parsed = upsertSchema.parse(req.body);
    const doc = await Supplier.create(parsed);
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



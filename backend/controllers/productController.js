import { z } from "zod";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import xlsx from "xlsx";

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
    Product.find(filter).populate('categoryId', 'name slug').sort({ createdAt: -1 }).skip(skip).limit(limit),
    Product.countDocuments(filter)
  ]);

  // Default image/icon fallback and add productType
  const withImage = items.map((p) => {
    const product = p.toObject();
    
    // Map category name to productType
    const typeMap = {
      'Thuốc': 'Drug',
      'Dược mỹ phẩm': 'Cosmeceutical',
      'Thiết bị y tế': 'MedicalDevice', 
      'Thực phẩm chức năng': 'FunctionalFood'
    };
    
    return {
      ...product,
      imageUrls: (product.imageUrls && product.imageUrls.length > 0) ? product.imageUrls : ["/uploads/default.png"],
      productType: typeMap[product.categoryId?.name] || product.categoryId?.name || 'Unknown'
    };
  });

  res.json({ items: withImage, page, limit, total });
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

export async function bulkImport(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ message: "Thiếu file" });
    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const rows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: "" });

    const created = [];
    for (const r of rows) {
      const name = String(r.name || r.tên || r.Ten || "").trim();
      if (!name) continue;
      const slug = String(r.slug || name).toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
      const catName = String(r.category || r.danh_muc || "").trim();
      let categoryId = null;
      if (catName) {
        const cat = await Category.findOne({ name: new RegExp(`^${catName}$`, "i") });
        categoryId = cat?._id;
      }
      const price = Number(r.price || r.gia || 0) || 0;
      const sku = String(r.sku || r.SKU || "").trim() || undefined;
      const barcode = String(r.barcode || r.mabarcode || "").trim() || undefined;
      const unit = String(r.unit || r.don_vi || "hộp");
      const image = String(r.image || r.imageUrl || r.anh || "").trim();

      const doc = await Product.create({ name, slug, categoryId, price, sku, barcode, unit, imageUrls: image ? [image] : [] });
      created.push(doc);
    }
    res.json({ success: true, created: created.length });
  } catch (err) {
    next(err);
  }
}

export async function exportTemplate(req, res) {
  const data = [
    { name: "Paracetamol 500mg", category: "Thuốc giảm đau", price: 15000, unit: "vỉ", sku: "PCM500", barcode: "8935000000001" },
    { name: "Siro ho trẻ em", category: "Thuốc ho", price: 35000, unit: "chai", sku: "SIROHO", barcode: "8935000000002" },
    { name: "Sữa rửa mặt dịu nhẹ", category: "Mỹ phẩm", price: 89000, unit: "tuýp", sku: "SRM-DN", barcode: "8935000000003" }
  ];
  const ws = xlsx.utils.json_to_sheet(data);
  const wb = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wb, ws, "Products");
  const buf = xlsx.write(wb, { type: "buffer", bookType: "xlsx" });
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", 'attachment; filename="product_template.xlsx"');
  res.send(buf);
}



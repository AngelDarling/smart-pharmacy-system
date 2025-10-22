import express from 'express';
import Brand from '../models/Brand.js';
import Product from '../models/Product.js';
import { authRequired, requireRole } from '../middlewares/auth.js';

const router = express.Router();

// Helper: slugify Vietnamese text to URL-friendly slug
function slugify(input) {
  return (input || '')
    .toString()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

async function ensureUniqueSlug(baseSlug, excludeId) {
  let candidate = baseSlug;
  let suffix = 1;
  // Loop until unique; safe due to small numbers, add cap
  while (true) {
    const existing = await Brand.findOne({ slug: candidate, ...(excludeId ? { _id: { $ne: excludeId } } : {}) }).lean();
    if (!existing) return candidate;
    candidate = `${baseSlug}-${suffix++}`;
    if (suffix > 1000) throw new Error('Cannot generate unique slug');
  }
}

// GET /api/brands - list with filters + pagination + productCount
router.get('/', async (req, res) => {
  try {
    // Simple list mode for dropdowns
    if (req.query.simple === 'true') {
      const simpleMatch = {};
      if (req.query.isActive === 'true') simpleMatch.isActive = true;
      if (req.query.isActive === 'false') simpleMatch.isActive = false;
      const docs = await Brand.find(simpleMatch).select('name logoUrl isActive').sort({ sortOrder: 1, name: 1 }).lean();
      return res.json(docs);
    }

    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '10', 10), 1), 100);
    const skip = (page - 1) * limit;
    const { search, isActive } = req.query;

    const match = {};
    if (isActive === 'true') match.isActive = true;
    if (isActive === 'false') match.isActive = false;
    if (search) {
      const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      match.$or = [
        { name: regex },
        { description: regex },
        { country: regex },
        { website: regex }
      ];
    }

    const pipeline = [
      { $match: match },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: 'brandId',
          as: 'productsForCount',
          pipeline: [ { $match: { isActive: { $in: [true, false] } } }, { $project: { _id: 1 } } ]
        }
      },
      { $addFields: { productCount: { $size: '$productsForCount' } } },
      { $project: { productsForCount: 0 } },
      { $sort: { sortOrder: 1, name: 1 } },
      {
        $facet: {
          items: [ { $skip: skip }, { $limit: limit } ],
          totalCount: [ { $count: 'count' } ]
        }
      }
    ];

    const agg = await Brand.aggregate(pipeline);
    const items = agg[0]?.items || [];
    const total = agg[0]?.totalCount?.[0]?.count || 0;

    res.json({ items, total, page, limit });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create brand
router.post('/', authRequired, requireRole('admin'), async (req, res) => {
  try {
    const {
      name,
      description,
      logoUrl,
      website,
      country,
      foundedYear,
      isActive,
      sortOrder,
      seoTitle,
      seoDescription,
      seoKeywords,
      contactInfo
    } = req.body || {};

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ message: 'Tên thương hiệu không hợp lệ' });
    }

    const baseSlug = slugify(name);
    const uniqueSlug = await ensureUniqueSlug(baseSlug);

    const created = await Brand.create({
      name: name.trim(),
      slug: uniqueSlug,
      description,
      logoUrl,
      website,
      country,
      foundedYear,
      isActive,
      sortOrder,
      seoTitle,
      seoDescription,
      seoKeywords,
      contactInfo
    });
    res.status(201).json(created);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update brand
router.put('/:id', authRequired, requireRole('admin'), async (req, res) => {
  try {
    const id = req.params.id;
    const existing = await Brand.findById(id);
    if (!existing) return res.status(404).json({ message: 'Không tìm thấy thương hiệu' });

    const update = { ...req.body };
    // Ignore incoming slug; compute if name changed
    if ('slug' in update) delete update.slug;
    if (update.name && update.name !== existing.name) {
      const baseSlug = slugify(update.name);
      update.slug = await ensureUniqueSlug(baseSlug, id);
    }

    const updated = await Brand.findByIdAndUpdate(id, update, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET /api/brands/:id - detail with computed productCount
router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const pipeline = [
      { $match: { _id: new Brand.mongo.ObjectId(id) } }
    ];
    // Fallback: use simple findById if ObjectId helper above is not available
    const brand = await Brand.findById(id).lean();
    if (!brand) return res.status(404).json({ message: 'Không tìm thấy thương hiệu' });
    const productCount = await Product.countDocuments({ brandId: brand._id });
    return res.json({ ...brand, productCount });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE /api/brands/:id - only if no products linked
router.delete('/:id', authRequired, requireRole('admin'), async (req, res) => {
  try {
    const id = req.params.id;
    const count = await Product.countDocuments({ brandId: id });
    if (count > 0) {
      return res.status(400).json({ message: 'Không thể xóa thương hiệu đang được sử dụng bởi sản phẩm' });
    }
    const deleted = await Brand.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Không tìm thấy thương hiệu' });
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;

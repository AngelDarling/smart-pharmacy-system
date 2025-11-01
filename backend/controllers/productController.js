import { z } from "zod";
import mongoose from "mongoose";
import Product from "../models/Product.js";
import Brand from "../models/Brand.js";
import Category from "../models/Category.js";
import ProductSalesDaily from "../models/ProductSalesDaily.js";
import Coupon from "../models/Coupon.js";
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
  costPrice: z.number().nonnegative().optional(),
  unit: z.string().optional(),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  totalStock: z.number().nonnegative().optional(),
  minStockLevel: z.number().nonnegative().optional(),
  maxStockLevel: z.number().nonnegative().optional(),
  safetyStock: z.number().nonnegative().optional(),
  leadTimeDays: z.number().nonnegative().optional(),
  expiryThresholdDays: z.number().nonnegative().optional(),
  contraindications: z.string().optional(),
  dosage: z.string().optional(),
  ingredients: z.string().optional(),
  storage: z.string().optional(),
  isActive: z.boolean().optional()
});

export async function list(req, res) {
  // Support both skip (offset) and page-based pagination
  let skip = 0;
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || "20", 10)));
  
  if (req.query.skip !== undefined) {
    // If skip is provided, use it directly (for load more functionality)
    skip = Math.max(0, parseInt(req.query.skip, 10));
  } else {
    // Traditional page-based pagination
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    skip = (page - 1) * limit;
  }

  const q = {};
  
  // Helper function to recursively get all descendant category IDs including the category itself
  const getCategoryAndDescendants = async (categoryId) => {
    if (!categoryId) return [];
    
    // Convert to ObjectId if it's a string
    let categoryObjectId;
    try {
      if (typeof categoryId === 'string') {
        categoryObjectId = new mongoose.Types.ObjectId(categoryId);
      } else {
        categoryObjectId = categoryId;
      }
    } catch (error) {
      console.error('Invalid categoryId:', categoryId);
      return [];
    }
    
    // Find the category
    const category = await Category.findById(categoryObjectId).select('_id name');
    if (!category) return [];
    
    // Recursive function to find all descendants
    const findAllDescendants = async (parentId) => {
      const result = [parentId];
      
      // Find direct children
      const children = await Category.find({ parent: parentId }).select('_id');
      
      // Recursively find descendants of each child
      for (const child of children) {
        const childDescendants = await findAllDescendants(child._id);
        result.push(...childDescendants);
      }
      
      return result;
    };
    
    // Get all descendants including the category itself
    const allCategoryIds = await findAllDescendants(categoryObjectId);
    
    // Remove duplicates (in case of any)
    const uniqueIds = [...new Set(allCategoryIds.map(id => id.toString()))].map(id => new mongoose.Types.ObjectId(id));
    
    console.log(`[ProductController] Category "${category.name}" (${category._id}) has ${uniqueIds.length} categories (including itself and all descendants)`);
    
    return uniqueIds;
  };
  
  // Filter by categoryId (from admin panel) - include descendants
  if (req.query.categoryId) {
    const categoryIds = await getCategoryAndDescendants(req.query.categoryId);
    console.log(`[ProductController] Filtering by categoryId: ${req.query.categoryId}, found ${categoryIds.length} categories (including descendants)`);
    if (categoryIds.length > 0) {
      q.categoryId = { $in: categoryIds };
    } else {
      q.categoryId = '__no_match__'; // force no results
    }
  }
  
  // Filter by category using category slug (from user-facing pages)
  if (req.query.category) {
    const c = await Category.findOne({ slug: req.query.category }).select('_id name');
    if (c) {
      const categoryIds = await getCategoryAndDescendants(c._id);
      console.log(`[ProductController] Filtering by category slug "${req.query.category}" (${c.name}), found ${categoryIds.length} categories (including descendants)`);
      if (categoryIds.length > 0) {
        q.categoryId = { $in: categoryIds };
      } else {
        q.categoryId = '__no_match__'; // force no results
      }
    } else {
      console.log(`[ProductController] Category with slug "${req.query.category}" not found`);
      q.categoryId = '__no_match__'; // force no results
    }
  }
  // Filter by brand using either brandId or brandSlug
  if (req.query.brandId) q.brandId = req.query.brandId;
  if (req.query.brandSlug) {
    const b = await Brand.findOne({ slug: req.query.brandSlug }).select('_id');
    if (b) q.brandId = b._id;
    else q.brandId = '__no_match__'; // force no results
  }
  if (req.query.minPrice) q.price = { ...(q.price || {}), $gte: Number(req.query.minPrice) };
  if (req.query.maxPrice) q.price = { ...(q.price || {}), $lte: Number(req.query.maxPrice) };
  if (req.query.isActive !== undefined) q.isActive = req.query.isActive === "true";

  const text = req.query.q?.trim();
  const filter = text ? { $and: [q, { $text: { $search: text } }] } : q;

  console.log(`[ProductController] Query filter:`, JSON.stringify(filter, null, 2));
  console.log(`[ProductController] Pagination: skip=${skip}, limit=${limit}`);
  
  const [items, total] = await Promise.all([
    Product.find(filter)
      .populate('categoryId', 'name slug')
      .populate('brandId', 'name slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Product.countDocuments(filter)
  ]);
  
  console.log(`[ProductController] Found ${items.length} products (skip=${skip}, limit=${limit}), total=${total}`);

  // Fetch all active direct apply coupons
  const now = new Date();
  const allDirectCoupons = await Coupon.find({
    isDirectApply: true,
    isActive: true
  }).lean();
  
  // Filter valid coupons (check dates and usage limit)
  const directCoupons = allDirectCoupons.filter(coupon => {
    // Check start date
    if (coupon.startDate && new Date(coupon.startDate) > now) return false;
    // Check end date
    if (coupon.endDate && new Date(coupon.endDate) < now) return false;
    // Check usage limit
    if (coupon.usageLimit && coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) return false;
    return true;
  });

  // Create a map of productSlug -> coupon for quick lookup
  const couponMap = new Map();
  directCoupons.forEach(coupon => {
    if (coupon.productSlug) {
      // Check if coupon is valid
      const isValid = (!coupon.startDate || new Date(coupon.startDate) <= now) &&
                      (!coupon.endDate || new Date(coupon.endDate) >= now) &&
                      (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit);
      if (isValid) {
        couponMap.set(coupon.productSlug, coupon);
      }
    }
  });

  // Default image/icon fallback and add productType, calculate discount
  const withImage = items.map((p) => {
    const product = p.toObject();
    
    // Map category name to productType
    const typeMap = {
      'Thuốc': 'Drug',
      'Dược mỹ phẩm': 'Cosmeceutical',
      'Thiết bị y tế': 'MedicalDevice', 
      'Thực phẩm chức năng': 'FunctionalFood'
    };
    
    // Calculate discount and final price: only if there's a valid promotion or direct coupon
    let discount = 0;
    let discountType = 'percent'; // 'percent' or 'amount'
    let discountValue = 0; // The actual discount value (percentage or amount)
    let finalPrice = product.price; // Default final price is original price
    let originalPrice = product.price; // Default original price
    
    const directCoupon = couponMap.get(product.slug);
    const now = new Date();
    
    if (directCoupon) {
      // Calculate discount from direct coupon
      originalPrice = product.price; // Keep original price
      let discountAmount = 0;
      discountType = directCoupon.discountType; // 'percent' or 'amount'
      discountValue = directCoupon.discountValue;
      
      if (directCoupon.discountType === 'percent') {
        discount = directCoupon.discountValue;
        discountAmount = Math.round(product.price * discount / 100);
        // Apply maxDiscount if exists
        if (directCoupon.maxDiscount && discountAmount > directCoupon.maxDiscount) {
          discountAmount = directCoupon.maxDiscount;
          discount = Math.round((discountAmount / product.price) * 100);
          discountValue = discount; // Update discountValue to reflect actual discount percentage
        }
      } else {
        // If discount is amount
        discountAmount = directCoupon.discountValue;
        // Calculate percentage for display
        if (product.price > 0) {
          discount = Math.round((discountAmount / product.price) * 100);
        }
      }
      
      finalPrice = Math.max(0, product.price - discountAmount);
    } else if (product.promotionInfo?.isOnSale && product.promotionInfo?.discountPercentage) {
      // Only use promotionInfo discount if isOnSale is true
      // Check if sale is currently active (check dates if provided)
      const saleStartDate = product.promotionInfo.saleStartDate ? new Date(product.promotionInfo.saleStartDate) : null;
      const saleEndDate = product.promotionInfo.saleEndDate ? new Date(product.promotionInfo.saleEndDate) : null;
      
      // Check if sale is active
      const isSaleActive = (!saleStartDate || saleStartDate <= now) && (!saleEndDate || saleEndDate >= now);
      
      if (isSaleActive && product.promotionInfo.discountPercentage > 0) {
        discount = product.promotionInfo.discountPercentage;
        discountType = 'percent';
        discountValue = discount;
        originalPrice = product.price;
        finalPrice = Math.round(product.price * (1 - discount / 100));
      }
    }
    // Removed compareAtPrice logic - it's not reliable for discount calculation
    
    // Ensure discount is between 0 and 100
    discount = Math.max(0, Math.min(100, discount));
    
    return {
      ...product,
      imageUrls: (product.imageUrls && product.imageUrls.length > 0) ? product.imageUrls : ["/uploads/default.png"],
      productType: typeMap[product.categoryId?.name] || product.categoryId?.name || 'Unknown',
      discount: discount,
      discountType: discount > 0 ? discountType : null, // 'percent' or 'amount' or null
      discountValue: discount > 0 ? discountValue : 0, // The actual discount value
      originalPrice: originalPrice, // Giá gốc (trước khi giảm)
      finalPrice: discount > 0 ? finalPrice : product.price // Giá sau khi giảm, nếu không có discount thì dùng price gốc
    };
  });

  // Calculate page for response (for compatibility)
  const responsePage = Math.floor(skip / limit) + 1;
  res.json({ items: withImage, page: responsePage, limit, total });
}

export async function getBySlug(req, res) {
  const doc = await Product.findOne({ slug: req.params.slug })
    .populate('categoryId', 'name slug parentId')
    .populate('brandId', 'name slug');
  if (!doc) return res.status(404).json({ message: "Không tìm thấy" });
  
  const product = doc.toObject();
  
  // Fetch direct coupon for this product
  const now = new Date();
  const allDirectCoupons = await Coupon.find({
    isDirectApply: true,
    isActive: true,
    productSlug: product.slug
  }).lean();
  
  // Filter valid coupons (check dates and usage limit)
  const directCoupons = allDirectCoupons.filter(coupon => {
    // Check start date
    if (coupon.startDate && new Date(coupon.startDate) > now) return false;
    // Check end date
    if (coupon.endDate && new Date(coupon.endDate) < now) return false;
    // Check usage limit
    if (coupon.usageLimit && coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) return false;
    return true;
  });
  
  const directCoupon = directCoupons.length > 0 ? directCoupons[0] : null;
  
  // Calculate discount and final price: only if there's a valid promotion or direct coupon
  let discount = 0;
  let discountType = 'percent'; // 'percent' or 'amount'
  let discountValue = 0; // The actual discount value (percentage or amount)
  let finalPrice = product.price; // Default final price is original price
  let originalPrice = product.price; // Default original price
  
  if (directCoupon) {
    // Calculate discount from direct coupon
    originalPrice = product.price; // Keep original price
    let discountAmount = 0;
    discountType = directCoupon.discountType; // 'percent' or 'amount'
    discountValue = directCoupon.discountValue;
    
    if (directCoupon.discountType === 'percent') {
      discount = directCoupon.discountValue;
      discountAmount = Math.round(product.price * discount / 100);
      // Apply maxDiscount if exists
      if (directCoupon.maxDiscount && discountAmount > directCoupon.maxDiscount) {
        discountAmount = directCoupon.maxDiscount;
        discount = Math.round((discountAmount / product.price) * 100);
        discountValue = discount; // Update discountValue to reflect actual discount percentage
      }
    } else {
      // If discount is amount
      discountAmount = directCoupon.discountValue;
      // Calculate percentage for display
      if (product.price > 0) {
        discount = Math.round((discountAmount / product.price) * 100);
      }
    }
    
    finalPrice = Math.max(0, product.price - discountAmount);
  } else if (product.promotionInfo?.isOnSale && product.promotionInfo?.discountPercentage) {
    // Only use promotionInfo discount if isOnSale is true
    // Check if sale is currently active (check dates if provided)
    const saleStartDate = product.promotionInfo.saleStartDate ? new Date(product.promotionInfo.saleStartDate) : null;
    const saleEndDate = product.promotionInfo.saleEndDate ? new Date(product.promotionInfo.saleEndDate) : null;
    
    // Check if sale is active
    const isSaleActive = (!saleStartDate || saleStartDate <= now) && (!saleEndDate || saleEndDate >= now);
    
    if (isSaleActive && product.promotionInfo.discountPercentage > 0) {
      discount = product.promotionInfo.discountPercentage;
      discountType = 'percent';
      discountValue = discount;
      originalPrice = product.price;
      finalPrice = Math.round(product.price * (1 - discount / 100));
    }
  }
  // Removed compareAtPrice logic - it's not reliable for discount calculation
  
  // Ensure discount is between 0 and 100
  discount = Math.max(0, Math.min(100, discount));
  
  res.json({ 
    ...product, 
    discount: discount,
    discountType: discount > 0 ? discountType : null,
    discountValue: discount > 0 ? discountValue : 0,
    originalPrice: originalPrice,
    finalPrice: discount > 0 ? finalPrice : product.price
  });
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

// Best sellers in current month
export async function bestSellers(req, res, next) {
  try {
    const limit = Math.min(20, Math.max(1, parseInt(req.query.limit || "12", 10)));
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const agg = await ProductSalesDaily.aggregate([
      { $match: { date: { $gte: startOfMonth, $lt: endOfMonth } } },
      { $group: { _id: "$productId", qty: { $sum: "$quantity" }, revenue: { $sum: "$revenue" } } },
      { $sort: { qty: -1, revenue: -1 } },
      { $limit: limit },
    ]);

    const productIds = agg.map(a => a._id);
    const products = await Product.find({ _id: { $in: productIds }, isActive: true })
      .populate('brandId', 'name slug')
      .populate('categoryId', 'name slug');

    // Keep order same as ranking
    const orderMap = new Map(productIds.map((id, idx) => [String(id), idx]));
    const items = products
      .map(p => p.toObject())
      .map(p => ({
        ...p,
        imageUrls: (p.imageUrls && p.imageUrls.length > 0) ? p.imageUrls : ["/uploads/default.png"],
        monthQuantity: agg.find(a => String(a._id) === String(p._id))?.qty || 0,
        monthRevenue: agg.find(a => String(a._id) === String(p._id))?.revenue || 0
      }))
      .sort((a, b) => (orderMap.get(String(a._id)) ?? 0) - (orderMap.get(String(b._id)) ?? 0));

    res.json({ items });
  } catch (err) {
    next(err);
  }
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

// Update product stock
export async function updateStock(req, res, next) {
  try {
    const { id } = req.params;
    const { totalStock, variantId, stockOnHand } = req.body;
    
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    if (variantId) {
      // Update specific variant stock
      const variant = product.variants.id(variantId);
      if (!variant) {
        return res.status(404).json({ message: "Không tìm thấy biến thể sản phẩm" });
      }
      variant.stockOnHand = stockOnHand || 0;
    } else {
      // Update total stock
      product.totalStock = totalStock || 0;
    }

    await product.save();
    res.json(product);
  } catch (err) {
    next(err);
  }
}

// Update product status
export async function updateStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    
    const product = await Product.findByIdAndUpdate(
      id, 
      { isActive }, 
      { new: true }
    );
    
    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }
    
    res.json(product);
  } catch (err) {
    next(err);
  }
}

// Bulk update products
export async function bulkUpdate(req, res, next) {
  try {
    const { productIds, updateData } = req.body;
    
    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ message: "Danh sách sản phẩm không hợp lệ" });
    }

    const result = await Product.updateMany(
      { _id: { $in: productIds } },
      { $set: updateData }
    );

    res.json({
      message: `Đã cập nhật ${result.modifiedCount} sản phẩm`,
      modifiedCount: result.modifiedCount
    });
  } catch (err) {
    next(err);
  }
}

// Lấy sản phẩm nổi bật hôm nay (12 sản phẩm bán chạy nhất trong ngày)
export async function getTodayFeatured(req, res, next) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Aggregate để lấy sản phẩm bán chạy nhất trong ngày
    const Order = (await import("../models/Order.js")).default;
    
    const todaySales = await Order.aggregate([
      {
        $match: {
          status: { $in: ['processing', 'shipping', 'completed'] },
          createdAt: {
            $gte: today,
            $lt: tomorrow
          }
        }
      },
      {
        $unwind: '$items'
      },
      {
        $group: {
          _id: '$items.productId',
          totalQuantity: { $sum: '$items.quantity' },
          productName: { $first: '$items.nameSnapshot' },
          productPrice: { $first: '$items.priceSnapshot' },
          productImage: { $first: '$items.imageSnapshot' }
        }
      },
      {
        $sort: { totalQuantity: -1 }
      },
      {
        $limit: 12
      }
    ]);

    // Lấy thông tin chi tiết sản phẩm từ Product collection
    const productIds = todaySales.map(sale => sale._id);
    const products = await Product.find({ 
      _id: { $in: productIds },
      isActive: true 
    }).populate('categoryId', 'name slug').populate('brandId', 'name slug');

    // Kết hợp dữ liệu bán hàng với thông tin sản phẩm
    const featuredProducts = todaySales.map(sale => {
      const product = products.find(p => p._id.toString() === sale._id.toString());
      return {
        ...product?.toObject(),
        todaySales: sale.totalQuantity,
        productName: sale.productName || product?.name,
        productPrice: sale.productPrice || product?.price,
        productImage: sale.productImage || product?.images?.[0]
      };
    }).filter(Boolean);

    res.json({
      success: true,
      items: featuredProducts,
      total: featuredProducts.length
    });
  } catch (err) {
    next(err);
  }
}



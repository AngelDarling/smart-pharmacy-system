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
  slug: z.string().min(2).optional(),
  categoryId: z.string(),
  brandId: z.string(), // Changed from 'brand' to 'brandId' to match model
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
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isNewProduct: z.boolean().optional()
});

// Helper function to generate slug from product name
function generateSlug(name) {
  // Convert Vietnamese to ASCII
  const from = "àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ";
  const to = "aaaaaaaaaaaaaaaaaeeeeeeeeeeeiiiiiooooooooooooooooouuuuuuuuuuuyyyyyd";
  
  let slug = name.toLowerCase();
  
  // Replace Vietnamese characters
  for (let i = 0; i < from.length; i++) {
    slug = slug.replace(new RegExp(from[i], 'g'), to[i]);
  }
  
  // Replace special characters with dash
  slug = slug.replace(/[^a-z0-9]+/g, '-');
  
  // Remove leading/trailing dashes
  slug = slug.replace(/^-+|-+$/g, '');
  
  // Add random string to ensure uniqueness
  const randomStr = Math.random().toString(36).substring(2, 8);
  slug = `${slug}-${randomStr}`;
  
  return slug;
}

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
  if (text) {
    // Escape special regex characters to prevent injection
    const escapedText = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Search across multiple fields with case-insensitive regex
    q.$or = [
      { name: { $regex: escapedText, $options: 'i' } },
      { description: { $regex: escapedText, $options: 'i' } },
      { sku: { $regex: escapedText, $options: 'i' } },
      { barcode: { $regex: escapedText, $options: 'i' } }
    ];
  }
  const filter = q;

  console.log(`[ProductController] Query filter:`, JSON.stringify(filter, null, 2));
  console.log(`[ProductController] Pagination: skip=${skip}, limit=${limit}`);
  
  const [items, total, totalActive, totalOutOfStock] = await Promise.all([
    Product.find(filter)
      .populate('categoryId', 'name slug')
      .populate('brandId', 'name slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Product.countDocuments(filter),
    Product.countDocuments({ isActive: true }),
    Product.countDocuments({ totalStock: 0 })
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
  res.json({ items: withImage, page: responsePage, limit, total, totalActive, totalOutOfStock });
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
    
    // Extract Cloudinary URLs from uploaded files
    if (req.files && req.files.length > 0) {
      parsed.imageUrls = req.files.map(file => file.path);
    }
    
    // Auto-generate slug if not provided
    if (!parsed.slug) {
      parsed.slug = generateSlug(parsed.name);
    }

    // Auto-generate SKU if not provided
    if (!parsed.sku) {
      try {
        const brand = await Brand.findById(parsed.brandId);
        const category = await Category.findById(parsed.categoryId);

        if (brand && category) {
          // Generate Brand Code: TRAPHACO -> TRAP
          const brandCode = brand.slug.replace(/-/g, '').substring(0, 4).toUpperCase();
          
          // Generate Category Code: VITAMIN-E -> VITA
          const categoryCode = category.slug.replace(/-/g, '').substring(0, 4).toUpperCase();
          
          // Generate Random Number: 1000-9999
          const randomNum = Math.floor(1000 + Math.random() * 9000);
          
          parsed.sku = `${brandCode}-${categoryCode}-${randomNum}`;
        } else {
          // Fallback if brand/category not found
          const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
          parsed.sku = `SP-${randomStr}`;
        }
      } catch (error) {
        console.error('Error generating SKU:', error);
        // Fallback on error
        const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
        parsed.sku = `SP-${randomStr}`;
      }
    }
    
    const doc = await Product.create(parsed);
    res.status(201).json(doc);
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const parsed = upsertSchema.extend({ attributes: z.record(z.any()).optional() }).partial().parse(req.body);
    
    // Extract Cloudinary URLs from uploaded files if new images are provided
    if (req.files && req.files.length > 0) {
      const newImageUrls = req.files.map(file => file.path);
      // Merge with existing imageUrls if any
      parsed.imageUrls = parsed.imageUrls 
        ? [...parsed.imageUrls, ...newImageUrls]
        : newImageUrls;
    }
    
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
// Query Orders directly instead of relying on ProductSalesDaily
export async function bestSellers(req, res, next) {
  try {
    const limit = Math.min(20, Math.max(1, parseInt(req.query.limit || "12", 10)));
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    console.log(`[bestSellers] Fetching best sellers for ${startOfMonth.toISOString()} to ${endOfMonth.toISOString()}`);
    // Aggregate orders to get best selling products in current month
    const Order = (await import("../models/Order.js")).default;
    
    const monthSales = await Order.aggregate([
      {
        $match: {
          status: { $in: ['processing', 'shipping', 'completed'] },
          createdAt: {
            $gte: startOfMonth,
            $lt: endOfMonth
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
          totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.priceSnapshot'] } }
        }
      },
      {
        $sort: { totalQuantity: -1, totalRevenue: -1 }
      },
      {
        $limit: limit + 10 // Get extra in case some products are inactive
      }
    ]);
    console.log(`[bestSellers] Found ${monthSales.length} products with sales this month`);
    
    let productIds;
    let salesMap = new Map();
    
    // Get product IDs
    if (monthSales.length === 0) {
      console.log(`[bestSellers] No sales this month, falling back to random products`);
      // Fallback: Get random active products
      const randomProducts = await Product.find({ isActive: true })
        .select('_id')
        .limit(limit)
        .lean();
      productIds = randomProducts.map(p => p._id);
    } else {
      productIds = monthSales.map(sale => sale._id);
      // Create sales data map for quick lookup
      monthSales.forEach(sale => {
        salesMap.set(sale._id.toString(), {
          quantity: sale.totalQuantity,
          revenue: sale.totalRevenue
        });
      });
    }
    
    if (productIds.length === 0) {
      console.log(`[bestSellers] No active products found, returning empty array`);
      return res.json({ items: [] });
    }
    
    // Fetch product details
    let products = await Product.find({ 
      _id: { $in: productIds }, 
      isActive: true 
    })
      .populate('brandId', 'name slug')
      .populate('categoryId', 'name slug')
      .lean();
    console.log(`[bestSellers] Found ${products.length} active products`);
    
    // If we don't have enough products, fill with random ones
    if (products.length < limit) {
      const remaining = limit - products.length;
      console.log(`[bestSellers] Need ${remaining} more products, fetching random products...`);
      
      const existingIds = products.map(p => p._id);
      const randomProducts = await Product.find({
        _id: { $nin: existingIds },
        isActive: true
      })
        .populate('brandId', 'name slug')
        .populate('categoryId', 'name slug')
        .limit(remaining)
        .lean();
      
      console.log(`[bestSellers] Adding ${randomProducts.length} random products`);
      products = [...products, ...randomProducts];
    }
    
    // Fetch all active direct apply coupons
    const allDirectCoupons = await Coupon.find({
      isDirectApply: true,
      isActive: true
    }).lean();
    
    // Filter valid coupons
    const directCoupons = allDirectCoupons.filter(coupon => {
      if (coupon.startDate && new Date(coupon.startDate) > now) return false;
      if (coupon.endDate && new Date(coupon.endDate) < now) return false;
      if (coupon.usageLimit && coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) return false;
      return true;
    });
    // Create coupon map
    const couponMap = new Map();
    directCoupons.forEach(coupon => {
      if (coupon.productSlug) {
        couponMap.set(coupon.productSlug, coupon);
      }
    });
    
    // Keep order same as ranking (only if we have sales data)
    const orderMap = monthSales.length > 0 
      ? new Map(productIds.map((id, idx) => [String(id), idx]))
      : new Map();
    
    const items = products
      .map(p => {
        const salesData = salesMap.get(p._id.toString());
        
        // Calculate discount
        let discount = 0;
        let discountType = 'percent';
        let discountValue = 0;
        let finalPrice = p.price;
        let originalPrice = p.price;
        const directCoupon = couponMap.get(p.slug);
        if (directCoupon) {
          originalPrice = p.price;
          let discountAmount = 0;
          discountType = directCoupon.discountType;
          discountValue = directCoupon.discountValue;
          if (directCoupon.discountType === 'percent') {
            discount = directCoupon.discountValue;
            discountAmount = Math.round(p.price * discount / 100);
            if (directCoupon.maxDiscount && discountAmount > directCoupon.maxDiscount) {
              discountAmount = directCoupon.maxDiscount;
              discount = Math.round((discountAmount / p.price) * 100);
              discountValue = discount;
            }
          } else {
            discountAmount = directCoupon.discountValue;
            if (p.price > 0) {
              discount = Math.round((discountAmount / p.price) * 100);
            }
          }
          finalPrice = Math.max(0, p.price - discountAmount);
        } else if (p.promotionInfo?.isOnSale && p.promotionInfo?.discountPercentage) {
          const saleStartDate = p.promotionInfo.saleStartDate ? new Date(p.promotionInfo.saleStartDate) : null;
          const saleEndDate = p.promotionInfo.saleEndDate ? new Date(p.promotionInfo.saleEndDate) : null;
          const isSaleActive = (!saleStartDate || saleStartDate <= now) && (!saleEndDate || saleEndDate >= now);
          if (isSaleActive && p.promotionInfo.discountPercentage > 0) {
            discount = p.promotionInfo.discountPercentage;
            discountType = 'percent';
            discountValue = discount;
            originalPrice = p.price;
            finalPrice = Math.round(p.price * (1 - discount / 100));
          }
        }
        
        discount = Math.max(0, Math.min(100, discount));
        return {
          ...p,
          imageUrls: (p.imageUrls && p.imageUrls.length > 0) ? p.imageUrls : ["/uploads/default.png"],
          monthQuantity: salesData?.quantity || 0,
          monthRevenue: salesData?.revenue || 0,
          discount: discount,
          discountType: discount > 0 ? discountType : null,
          discountValue: discount > 0 ? discountValue : 0,
          originalPrice: originalPrice,
          finalPrice: discount > 0 ? finalPrice : p.price
        };
      })
      .sort((a, b) => {
        // If we have sales data, sort by ranking
        if (monthSales.length > 0) {
          const aIdx = orderMap.get(String(a._id)) ?? 999;
          const bIdx = orderMap.get(String(b._id)) ?? 999;
          return aIdx - bIdx;
        }
        // Otherwise, keep random order
        return 0;
      })
      .slice(0, limit); // Ensure we return exactly the requested limit
    console.log(`[bestSellers] Returning ${items.length} best sellers`);
    res.json({ items });
  } catch (err) {
    console.error('[bestSellers] Error:', err);
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

// Lấy sản phẩm nổi bật hôm nay
// Ưu tiên sản phẩm có isFeatured: true, sau đó lấy thêm sản phẩm bán chạy nhất
export async function getTodayFeatured(req, res, next) {
  try {
    const limit = 12; // Total products to return
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Step 1: Get featured products (isFeatured: true)
    const featuredProducts = await Product.find({
      isFeatured: true,
      isActive: true
    })
      .populate('categoryId', 'name slug')
      .populate('brandId', 'name slug')
      .limit(limit)
      .lean();

    console.log(`[getTodayFeatured] Found ${featuredProducts.length} featured products`);

    let finalProducts = [...featuredProducts];
    const featuredProductIds = featuredProducts.map(p => p._id.toString());

    // Step 2: If we don't have enough products, fill with best sellers from today
    if (finalProducts.length < limit) {
      const remaining = limit - finalProducts.length;
      console.log(`[getTodayFeatured] Need ${remaining} more products, fetching best sellers...`);

      // Aggregate to get best sellers from today's orders
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
            totalQuantity: { $sum: '$items.quantity' }
          }
        },
        {
          $sort: { totalQuantity: -1 }
        },
        {
          $limit: remaining + 10 // Get extra in case some are already featured
        }
      ]);

      console.log(`[getTodayFeatured] Found ${todaySales.length} best selling products today`);

      // Get product IDs that are not already in featured list
      const bestSellerIds = todaySales
        .map(sale => sale._id.toString())
        .filter(id => !featuredProductIds.includes(id))
        .slice(0, remaining);

      if (bestSellerIds.length > 0) {
        const bestSellerProducts = await Product.find({
          _id: { $in: bestSellerIds },
          isActive: true
        })
          .populate('categoryId', 'name slug')
          .populate('brandId', 'name slug')
          .lean();

        console.log(`[getTodayFeatured] Adding ${bestSellerProducts.length} best sellers`);
        finalProducts = [...finalProducts, ...bestSellerProducts];
      }
    }

    // Step 3: If still not enough, fill with random active products
    if (finalProducts.length < limit) {
      const remaining = limit - finalProducts.length;
      console.log(`[getTodayFeatured] Still need ${remaining} more products, fetching random products...`);

      const existingIds = finalProducts.map(p => p._id.toString());
      const randomProducts = await Product.find({
        _id: { $nin: existingIds },
        isActive: true
      })
        .populate('categoryId', 'name slug')
        .populate('brandId', 'name slug')
        .limit(remaining)
        .lean();

      console.log(`[getTodayFeatured] Adding ${randomProducts.length} random products`);
      finalProducts = [...finalProducts, ...randomProducts];
    }

    // Step 4: Fetch all active direct apply coupons
    const allDirectCoupons = await Coupon.find({
      isDirectApply: true,
      isActive: true
    }).lean();
    
    // Filter valid coupons (check dates and usage limit)
    const directCoupons = allDirectCoupons.filter(coupon => {
      if (coupon.startDate && new Date(coupon.startDate) > today) return false;
      if (coupon.endDate && new Date(coupon.endDate) < today) return false;
      if (coupon.usageLimit && coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) return false;
      return true;
    });

    // Create a map of productSlug -> coupon for quick lookup
    const couponMap = new Map();
    directCoupons.forEach(coupon => {
      if (coupon.productSlug) {
        couponMap.set(coupon.productSlug, coupon);
      }
    });

    // Step 5: Add discount information to products
    const productsWithDiscount = finalProducts.map(p => {
      let discount = 0;
      let discountType = 'percent';
      let discountValue = 0;
      let finalPrice = p.price;
      let originalPrice = p.price;

      const directCoupon = couponMap.get(p.slug);

      if (directCoupon) {
        originalPrice = p.price;
        let discountAmount = 0;
        discountType = directCoupon.discountType;
        discountValue = directCoupon.discountValue;

        if (directCoupon.discountType === 'percent') {
          discount = directCoupon.discountValue;
          discountAmount = Math.round(p.price * discount / 100);
          if (directCoupon.maxDiscount && discountAmount > directCoupon.maxDiscount) {
            discountAmount = directCoupon.maxDiscount;
            discount = Math.round((discountAmount / p.price) * 100);
            discountValue = discount;
          }
        } else {
          discountAmount = directCoupon.discountValue;
          if (p.price > 0) {
            discount = Math.round((discountAmount / p.price) * 100);
          }
        }

        finalPrice = Math.max(0, p.price - discountAmount);
      } else if (p.promotionInfo?.isOnSale && p.promotionInfo?.discountPercentage) {
        const saleStartDate = p.promotionInfo.saleStartDate ? new Date(p.promotionInfo.saleStartDate) : null;
        const saleEndDate = p.promotionInfo.saleEndDate ? new Date(p.promotionInfo.saleEndDate) : null;
        const isSaleActive = (!saleStartDate || saleStartDate <= today) && (!saleEndDate || saleEndDate >= today);

        if (isSaleActive && p.promotionInfo.discountPercentage > 0) {
          discount = p.promotionInfo.discountPercentage;
          discountType = 'percent';
          discountValue = discount;
          originalPrice = p.price;
          finalPrice = Math.round(p.price * (1 - discount / 100));
        }
      }
      
      discount = Math.max(0, Math.min(100, discount));
      
      return {
        ...p,
        imageUrls: (p.imageUrls && p.imageUrls.length > 0) ? p.imageUrls : ["/uploads/default.png"],
        discount: discount,
        discountType: discount > 0 ? discountType : null,
        discountValue: discount > 0 ? discountValue : 0,
        originalPrice: originalPrice,
        finalPrice: discount > 0 ? finalPrice : p.price
      };
    });

    console.log(`[getTodayFeatured] Returning ${productsWithDiscount.length} products total`);
    res.json({ items: productsWithDiscount });
  } catch (err) {
    console.error('[getTodayFeatured] Error:', err);
    next(err);
  }
}
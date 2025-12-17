import Coupon from "../models/Coupon.js";

export async function list(req, res, next) {
  try {
    const { page = 1, limit = 20, q } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const filter = {};
    if (q) filter.code = { $regex: q, $options: 'i' };
    const [items, total] = await Promise.all([
      Coupon.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Coupon.countDocuments(filter)
    ]);
    res.json({ items, total, page: parseInt(page) });
  } catch (err) { next(err); }
}

export async function create(req, res, next) {
  try {
    const data = req.body;
    
    // Validate required fields
    if (!data.code || !data.discountType || data.discountValue === undefined || data.discountValue === null) {
      return res.status(400).json({ 
        message: 'Thiếu thông tin bắt buộc: mã, loại giảm giá, và giá trị giảm' 
      });
    }
    
    data.code = String(data.code || '').toUpperCase().trim();
    
    // Check if code already exists
    const exists = await Coupon.findOne({ code: data.code });
    if (exists) return res.status(400).json({ message: 'Mã đã tồn tại' });
    
    // Create coupon
    const doc = await Coupon.create(data);
    res.json({ success: true, item: doc });
  } catch (err) { 
    // Handle Mongoose validation errors
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    next(err); 
  }
}

export async function update(req, res, next) {
  try {
    const { id } = req.params;
    const data = req.body;
    if (data.code) data.code = String(data.code).toUpperCase().trim();
    const doc = await Coupon.findByIdAndUpdate(id, data, { new: true });
    res.json({ success: true, item: doc });
  } catch (err) { next(err); }
}

export async function remove(req, res, next) {
  try { await Coupon.findByIdAndDelete(req.params.id); res.json({ success: true }); } catch (err) { next(err); }
}

export async function validate(req, res, next) {
  try {
    const { code, orderTotal = 0 } = req.body;
    const coupon = await Coupon.findOne({ code: String(code || '').toUpperCase().trim(), isActive: true });
    if (!coupon) return res.status(404).json({ valid: false, message: 'Mã không hợp lệ' });
    const now = new Date();
    if (coupon.startDate && now < new Date(coupon.startDate)) return res.status(400).json({ valid: false, message: 'Chưa đến thời gian áp dụng' });
    if (coupon.endDate && now > new Date(coupon.endDate)) return res.status(400).json({ valid: false, message: 'Mã đã hết hạn' });
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) return res.status(400).json({ valid: false, message: 'Mã đã sử dụng hết' });
    if (coupon.minOrder && Number(orderTotal) < coupon.minOrder) return res.status(400).json({ valid: false, message: 'Chưa đạt giá trị đơn tối thiểu' });
    let discount = coupon.discountType === 'percent' ? (Number(orderTotal) * coupon.discountValue / 100) : coupon.discountValue;
    if (coupon.maxDiscount && discount > coupon.maxDiscount) discount = coupon.maxDiscount;
    res.json({ valid: true, coupon, discount });
  } catch (err) { next(err); }
}

// Lấy khuyến mãi trực tiếp cho sản phẩm
export async function getDirectApply(req, res, next) {
  try {
    const { productSlug } = req.params;
    const { orderTotal = 0 } = req.query; // Lấy orderTotal từ query parameter
    const now = new Date();
    
    // Lấy TẤT CẢ mã khuyến mãi cho sản phẩm
    const coupons = await Coupon.find({
      isDirectApply: true,
      productSlug: productSlug,
      isActive: true
    }).sort({ discountValue: -1, minOrder: 1 }); // Sort theo giá trị giảm (cao -> thấp) và minOrder (thấp -> cao)

    // Lọc các mã hợp lệ về thời gian và số lần sử dụng
    const validByTime = coupons.filter(coupon => {
      if (coupon.startDate && now < new Date(coupon.startDate)) return false;
      if (coupon.endDate && now > new Date(coupon.endDate)) return false;
      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) return false;
      return true;
    });

    // Tìm mã không có điều kiện (minOrder = 0 hoặc undefined)
    const noConditionCoupon = validByTime.find(c => !c.minOrder || c.minOrder === 0);

    // Nếu không có orderTotal (trang danh sách), trả về mã không điều kiện
    if (!orderTotal || orderTotal === 0 || orderTotal === '0') {
      return res.json({ 
        success: true, 
        coupon: noConditionCoupon || null,
        allValidCoupons: validByTime,
        noConditionCoupon: noConditionCoupon || null
      });
    }

    // Có orderTotal (trang chi tiết) - lọc theo điều kiện minOrder
    const applicableCoupons = validByTime.filter(coupon => {
      if (coupon.minOrder && Number(orderTotal) < coupon.minOrder) return false;
      return true;
    });

    // Chọn mã tốt nhất (giảm nhiều nhất trong các mã đủ điều kiện)
    const bestCoupon = applicableCoupons.length > 0 ? applicableCoupons[0] : null;

    // Tìm mã tốt hơn tiếp theo (nếu có)
    const betterCoupon = validByTime.find(c => {
      if (!c.minOrder || c.minOrder === 0) return false; // Bỏ qua mã không điều kiện
      if (Number(orderTotal) >= c.minOrder) return false; // Bỏ qua mã đã đủ điều kiện
      return c.discountValue > (bestCoupon?.discountValue || 0);
    });

    res.json({ 
      success: true, 
      coupon: bestCoupon,
      allValidCoupons: validByTime,
      noConditionCoupon: noConditionCoupon || null,
      betterCoupon: betterCoupon || null, // Mã tốt hơn nếu mua thêm
      currentOrderTotal: Number(orderTotal)
    });
  } catch (err) {
    next(err);
  }
}



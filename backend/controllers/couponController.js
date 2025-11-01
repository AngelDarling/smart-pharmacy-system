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
    data.code = String(data.code || '').toUpperCase().trim();
    const exists = await Coupon.findOne({ code: data.code });
    if (exists) return res.status(400).json({ message: 'Mã đã tồn tại' });
    const doc = await Coupon.create(data);
    res.json({ success: true, item: doc });
  } catch (err) { next(err); }
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
    const now = new Date();
    
    const coupons = await Coupon.find({
      isDirectApply: true,
      productSlug: productSlug,
      isActive: true
    }).sort({ createdAt: -1 });

    // Tìm coupon hợp lệ về thời gian và số lần sử dụng
    const validCoupon = coupons.find(coupon => {
      if (coupon.startDate && now < new Date(coupon.startDate)) return false;
      if (coupon.endDate && now > new Date(coupon.endDate)) return false;
      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) return false;
      return true;
    });

    if (!validCoupon) {
      return res.json({ success: true, coupon: null });
    }

    res.json({ success: true, coupon: validCoupon });
  } catch (err) {
    next(err);
  }
}



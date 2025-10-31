import Review from "../models/Review.js";
import Product from "../models/Product.js";
import mongoose from "mongoose";

// Lấy danh sách đánh giá của sản phẩm
export async function list(req, res, next) {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10, status = "approved" } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "ProductId không hợp lệ" });
    }

    const filter = { productId: new mongoose.Types.ObjectId(productId), status };
    const [items, total] = await Promise.all([
      Review.find(filter)
        .populate("userId", "name fullName email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Review.countDocuments(filter)
    ]);

    res.json({ items, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    next(err);
  }
}

// Tạo đánh giá mới
export async function create(req, res, next) {
  try {
    const { productId } = req.params;
    const userId = req.user?._id || null;
    const { rating, comment, guestName, guestEmail, guestPhone } = req.body;

    // Validate
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating phải từ 1 đến 5 sao" });
    }
    if (!comment || !comment.trim()) {
      return res.status(400).json({ message: "Vui lòng nhập nội dung đánh giá" });
    }

    // Nếu chưa đăng nhập, yêu cầu thông tin guest
    if (!userId) {
      if (!guestName || !guestName.trim()) {
        return res.status(400).json({ message: "Vui lòng nhập họ và tên" });
      }
      if (!guestPhone || !guestPhone.trim()) {
        return res.status(400).json({ message: "Vui lòng nhập số điện thoại" });
      }
    }

    // Kiểm tra sản phẩm tồn tại
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }

    // Tạo review
    const review = await Review.create({
      productId,
      userId,
      guestName: userId ? null : guestName?.trim(),
      guestEmail: userId ? null : guestEmail?.trim() || null,
      guestPhone: userId ? null : guestPhone?.trim(),
      rating: parseInt(rating),
      comment: comment.trim(),
      status: "approved"
    });

    const populated = await Review.findById(review._id).populate("userId", "name fullName email");

    res.status(201).json({ success: true, item: populated });
  } catch (err) {
    next(err);
  }
}

// Tính toán rating trung bình cho sản phẩm
export async function getProductRating(req, res, next) {
  try {
    const { productId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "ProductId không hợp lệ" });
    }
    
    const stats = await Review.aggregate([
      {
        $match: {
          productId: new mongoose.Types.ObjectId(productId),
          status: "approved"
        }
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
          ratingDistribution: {
            $push: "$rating"
          }
        }
      }
    ]);

    if (stats.length === 0) {
      return res.json({
        averageRating: 0,
        totalReviews: 0,
        distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      });
    }

    const stat = stats[0];
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    stat.ratingDistribution.forEach(rating => {
      distribution[rating] = (distribution[rating] || 0) + 1;
    });

    res.json({
      averageRating: Math.round((stat.averageRating || 0) * 10) / 10,
      totalReviews: stat.totalReviews || 0,
      distribution
    });
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ message: "ProductId không hợp lệ" });
    }
    next(err);
  }
}

// Admin: Lấy danh sách tất cả đánh giá (có filter)
export async function listAdmin(req, res, next) {
  try {
    const { page = 1, limit = 20, status, productId, rating, q } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const filter = {};
    if (status) filter.status = status;
    if (productId) {
      if (mongoose.Types.ObjectId.isValid(productId)) {
        filter.productId = new mongoose.Types.ObjectId(productId);
      } else {
        return res.status(400).json({ message: "ProductId không hợp lệ" });
      }
    }
    if (rating) filter.rating = parseInt(rating);
    if (q) {
      filter.$or = [
        { comment: { $regex: q, $options: 'i' } },
        { guestName: { $regex: q, $options: 'i' } },
        { guestEmail: { $regex: q, $options: 'i' } },
        { adminReply: { $regex: q, $options: 'i' } }
      ];
    }
    
    const [items, total] = await Promise.all([
      Review.find(filter)
        .populate("productId", "name slug imageUrls")
        .populate("userId", "name fullName email")
        .populate("adminReplyBy", "name fullName")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Review.countDocuments(filter)
    ]);
    
    res.json({ items, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    next(err);
  }
}

// Admin: Cập nhật đánh giá (phản hồi, status)
export async function update(req, res, next) {
  try {
    const { id } = req.params;
    const { adminReply, status } = req.body;
    const adminId = req.user?._id;
    
    const updateData = {};
    if (adminReply !== undefined) {
      updateData.adminReply = adminReply?.trim() || null;
      updateData.adminReplyAt = adminReply?.trim() ? new Date() : null;
      updateData.adminReplyBy = adminReply?.trim() ? adminId : null;
    }
    if (status) {
      updateData.status = status;
    }
    
    const review = await Review.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    )
      .populate("productId", "name slug imageUrls")
      .populate("userId", "name fullName email")
      .populate("adminReplyBy", "name fullName");
    
    if (!review) {
      return res.status(404).json({ message: "Đánh giá không tồn tại" });
    }
    
    res.json({ success: true, item: review });
  } catch (err) {
    next(err);
  }
}

// Admin: Xóa đánh giá
export async function remove(req, res, next) {
  try {
    const { id } = req.params;
    const review = await Review.findByIdAndDelete(id);
    
    if (!review) {
      return res.status(404).json({ message: "Đánh giá không tồn tại" });
    }
    
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}


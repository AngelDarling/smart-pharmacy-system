import { 
  Order, 
  Shipment, 
  Product, 
  ProductBatch, 
  InventoryTransaction, 
  ProductSalesDaily, 
  Coupon, 
  Payment 
} from "../models/index.js";
import { allocateStockFromBatches } from "./productBatchController.js";
import mongoose from "mongoose";

// Generate unique order code
function generateOrderCode() {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD${timestamp}${random}`;
}

// Create new order
export async function create(req, res) {
  try {
    const { items, shippingAddress, paymentMethod, totals, couponCode, couponId } = req.body;
    const userId = req.user?.id;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Items are required" });
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.address) {
      return res.status(400).json({ message: "Shipping address is required" });
    }

    // **SPAM PREVENTION: Check for existing pending unpaid orders**
    if (userId && paymentMethod !== 'cod') {
      const existingPendingOrder = await Order.findOne({
        userId,
        status: 'pending',
        paymentStatus: 'pending',
        paymentMethod: { $in: ['momo', 'vnpay'] },
        createdAt: { $gte: new Date(Date.now() - 30 * 60 * 1000) } // Last 30 minutes
      });

      if (existingPendingOrder) {
        return res.status(400).json({ 
          message: "Bạn có đơn hàng chưa thanh toán. Vui lòng hoàn tất hoặc hủy đơn hàng trước khi tạo đơn mới.",
          existingOrderId: existingPendingOrder._id,
          existingOrderCode: existingPendingOrder.code
        });
      }
    }

    // Validate products exist and have sufficient stock
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(400).json({ message: `Product ${item.productId} not found` });
      }

      // Check stock from variants or totalStock
      let availableStock = 0;
      if (product.variants && product.variants.length > 0) {
        const activeVariant = product.variants.find(v => v.isActive);
        availableStock = activeVariant ? activeVariant.stockOnHand : 0;
      } else {
        availableStock = product.totalStock || 0;
      }

      if (availableStock < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for product ${product.name}. Available: ${availableStock}, Requested: ${item.quantity}` 
        });
      }
    }

    // Create order
    const order = new Order({
      code: generateOrderCode(),
      userId: userId || null,
      status: "pending",
      paymentMethod: paymentMethod || "cod",
      shippingAddress,
      items,
      totals: {
        items: totals?.items || 0,
        discount: totals?.discount || 0,
        shipping: totals?.shipping || 0,
        grand: totals?.grand || 0
      },
      ...(couponCode && { couponCode }),
      ...(couponId && { couponId })
    });

    await order.save();

    // Note: Stock will be reduced when order status changes from pending to processing/shipping/completed
    // This allows cancellation of pending orders without affecting inventory

    // Update coupon usedCount if coupon was applied
    if (couponId) {
      await Coupon.findByIdAndUpdate(couponId, { $inc: { usedCount: 1 } });
    }

    res.status(201).json(order);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Get orders for user
export async function list(req, res) {
  try {
    const userId = req.user?.id;
    const { status, page = 1, limit = 10 } = req.query;

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    let query = { userId };
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate("items.productId", "name image")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Get single order
export async function getById(req, res) {
  try {
    const { orderId } = req.params;
    const userId = req.user?.id;

  const order = await Order.findById(orderId)
      .populate("items.productId", "name imageUrls")
      .populate("shipment", "shippingCode status timeline")
      .populate("couponId", "code description discountType discountValue")
      .lean();

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if user can access this order (admins/managers/pharmacists/staff can access any)
    const privilegedRoles = ["admin", "manager", "pharmacist", "staff"];
    const isPrivileged = req.user && privilegedRoles.includes(req.user.role);
    if (!isPrivileged && userId && order.userId && order.userId.toString() !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Update order status (admin only)
export async function updateStatus(req, res) {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses = ["pending", "processing", "shipping", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const oldStatus = order.status;
    const newStatus = status;

    // Không cho phép thay đổi trạng thái nếu đơn hàng đã bị hủy
    if (oldStatus === "cancelled") {
      return res.status(400).json({ 
        message: "Không thể thay đổi trạng thái của đơn hàng đã hủy" 
      });
    }

    // If switching from pending to processing/shipping/completed, reduce inventory using FIFO
    if (oldStatus === "pending" && ["processing", "shipping", "completed"].includes(newStatus)) {
      for (const item of order.items) {
        try {
          // 1. Allocate stock from batches using FIFO (oldest first)
          const allocations = await allocateStockFromBatches(
            item.productId, 
            item.quantity
          );
          
          // 2. Deduct from each batch's remainingQuantity
          for (const allocation of allocations) {
            const batch = await ProductBatch.findById(allocation.batchId);
            if (batch) {
              batch.remainingQuantity -= allocation.quantity;
              await batch.save(); // Will auto-update status via pre-save hook
            }
            
            // 3. Create inventory transaction with batch info
            const transaction = new InventoryTransaction({
              productId: item.productId,
              type: "sale",
              quantity: -allocation.quantity,
              batchNumber: allocation.batchNumber,
              unitCost: allocation.unitCost,
              reason: `Order ${order.code} - FIFO allocation from batch ${allocation.batchNumber}`,
              orderId: order._id,
              performedBy: req.user?.id || null
            });
            await transaction.save();
          }
          
          // 4. Update Product.totalStock
          const product = await Product.findById(item.productId);
          if (product) {
            product.totalStock -= item.quantity;
            await product.save();
          }
          
        } catch (error) {
          // If not enough stock in batches, rollback and return error
          console.error(`FIFO allocation error for product ${item.productId}:`, error);
          return res.status(400).json({ 
            message: `Không đủ hàng trong kho cho sản phẩm: ${item.nameSnapshot || item.productId}. ${error.message}` 
          });
        }
      }
    }

    // If switching to cancelled from processing/shipping/completed, restore inventory to original batches
    if (newStatus === "cancelled" && ["processing", "shipping", "completed"].includes(oldStatus)) {
      for (const item of order.items) {
        // Query InventoryTransactions to find which batches were used
        const transactions = await InventoryTransaction.find({
          orderId: order._id,
          productId: item.productId,
          type: "sale"
        });

        // Restore to the batches that were originally allocated
        for (const tx of transactions) {
          if (tx.batchNumber) {
            const batch = await ProductBatch.findOne({
              productId: item.productId,
              batchNumber: tx.batchNumber
            });
            if (batch) {
              batch.remainingQuantity += Math.abs(tx.quantity);
              await batch.save(); // Will auto-update status via pre-save hook
            }
          }
        }

        // Update Product.totalStock
        const product = await Product.findById(item.productId);
        if (product) {
          product.totalStock += item.quantity;
          await product.save();
        }

        // Create inventory transaction for restoration
        const transaction = new InventoryTransaction({
          productId: item.productId,
          type: "return",
          quantity: item.quantity,
          reason: `Order ${order.code} cancelled - stock restoration to original batches`,
          orderId: order._id,
          performedBy: req.user?.id || null
        });
        await transaction.save();
      }
    }

    // If switching to shipping and shipment not yet created, create simulated shipment
    if (status === "shipping" && !order.shipment) {
      const shippingCode = `SHP${Date.now().toString().slice(-6)}${Math.floor(Math.random()*1000).toString().padStart(3,'0')}`;
      const shipment = new Shipment({
        orderId: order._id,
        shippingCode,
        status: "pickup",
        timeline: [
          { status: "preparing", timestamp: new Date() },
          { status: "pickup", timestamp: new Date(Date.now() + 10 * 1000) }
        ]
      });
      await shipment.save();
      order.shipment = shipment._id;
    }

    order.status = status;
    await order.save();

    // Tích điểm thành viên khi hoàn thành đơn hàng
    if (newStatus === "completed" && order.userId) {
      try {
        const Customer = (await import("../models/Customer.js")).default;
        const { PointHistory } = await import("../models/Customer.js");
        
        // Tính điểm chỉ dựa trên tổng tiền hàng, không tính phí vận chuyển
        const points = Math.floor(order.totals.items / 1000);
        if (points > 0) {
          await Customer.findByIdAndUpdate(order.userId, { $inc: { loyaltyPoints: points } });
          // Lưu lịch sử nhận điểm
          await PointHistory.create({
            userId: order.userId,
            orderId: order._id,
            orderCode: order.code,
            points,
            description: `Tích điểm từ đơn hàng ${order.code}`,
            createdAt: new Date()
          });
        }
      } catch (pointErr) {
        console.error("Error updating loyalty points:", pointErr);
      }
    }

    const populated = await Order.findById(order._id)
      .populate("items.productId", "name imageUrls")
      .populate("shipment", "shippingCode status timeline")
      .populate("couponId", "code description discountType discountValue")
      .lean();
    res.json(populated);
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Explicit endpoint to create shipment and move order to shipping
export async function shipOrder(req, res) {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.shipment) {
      const populated = await Order.findById(orderId).populate("shipment", "shippingCode status timeline");
      return res.json(populated);
    }

    const shippingCode = `SHP${Date.now().toString().slice(-6)}${Math.floor(Math.random()*1000).toString().padStart(3,'0')}`;
    const shipment = new Shipment({
      orderId: order._id,
      shippingCode,
      status: "pickup",
      timeline: [
        { status: "preparing", timestamp: new Date() },
        { status: "pickup", timestamp: new Date(Date.now() + 10 * 1000) }
      ]
    });
    await shipment.save();

    order.status = "shipping";
    order.shipment = shipment._id;
    await order.save();

    const populated = await Order.findById(order._id)
      .populate("shipment", "shippingCode status timeline");
    res.json(populated);
  } catch (error) {
    console.error("Error shipping order:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Cancel order
export async function cancel(req, res) {
  try {
    const { orderId } = req.params;
    const userId = req.user?.id;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if user can cancel this order
    if (userId && order.userId && order.userId.toString() !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Only allow cancellation if order is pending
    if (order.status !== "pending") {
      return res.status(400).json({ message: "Order cannot be cancelled" });
    }

    // Note: No need to restore stock for pending orders since stock hasn't been reduced yet
    // Stock is only reduced when status changes from pending to processing/shipping/completed

    order.status = "cancelled";
    await order.save();

    res.json(order);
  } catch (error) {
    console.error("Error cancelling order:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Get order statistics (admin only)
export async function getStats(req, res) {
  try {
    const stats = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalValue: { $sum: "$totals.grand" }
        }
      }
    ]);

    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $match: { status: { $in: ["completed"] } } },
      { $group: { _id: null, total: { $sum: "$totals.grand" } } }
    ]);

    res.json({
      statusBreakdown: stats,
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0
    });
  } catch (error) {
    console.error("Error fetching order stats:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Admin list with filters and pagination
export async function adminList(req, res) {
  try {
    const { q, status, paymentMethod, page = 1, limit = 10, from, to } = req.query;

    const filters = {};
    if (status) filters.status = status;
    if (paymentMethod) filters.paymentMethod = paymentMethod;
    if (from || to) {
      filters.createdAt = {};
      if (from) filters.createdAt.$gte = new Date(from);
      if (to) filters.createdAt.$lte = new Date(to);
    }
    if (q) {
      const regex = new RegExp(q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filters.$or = [
        { code: regex },
        { "shippingAddress.fullName": regex },
        { "shippingAddress.phone": regex },
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const pageSize = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * pageSize;

  const [items, total] = await Promise.all([
      Order.find(filters)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .populate("userId", "name phone role")
        .populate("items.productId", "name imageUrls price slug")
        .populate("shipment", "shippingCode status")
        .populate("couponId", "code description discountType discountValue")
        .lean(),
      Order.countDocuments(filters),
    ]);

    res.json({ items, total, page: pageNum, limit: pageSize });
  } catch (error) {
    console.error("Error listing orders (admin):", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Public lookup by order code (no auth)
export async function getByCodePublic(req, res) {
  try {
    const { code } = req.params;
    if (!code) return res.status(400).json({ message: "Missing code" });

    const order = await Order.findOne({ code })
      .select("code status paymentMethod paymentStatus createdAt totals shippingAddress items.nameSnapshot items.imageSnapshot items.quantity items.priceSnapshot")
      .lean();
    if (!order) return res.status(404).json({ message: "Order not found" });

    res.json(order);
  } catch (error) {
    console.error("Error fetching order by code:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Delete order (admin only)
export async function deleteOrder(req, res) {
  try {
    const { orderId } = req.params;
    console.log(`[OrderController] Deleting order: ${orderId}`);

    const order = await Order.findById(orderId);
    if (!order) {
      console.log(`[OrderController] Order not found: ${orderId}`);
      return res.status(404).json({ message: "Order not found" });
    }

    // If order status is processing/shipping/completed, restore inventory to original batches
    if (["processing", "shipping", "completed"].includes(order.status)) {
      console.log(`[OrderController] Restoring inventory for order: ${order.code}`);
      for (const item of order.items) {
        // Query InventoryTransactions to find which batches were used
        const transactions = await InventoryTransaction.find({
          orderId: order._id,
          productId: item.productId,
          type: "sale"
        });

        // Restore to the batches that were originally allocated
        for (const tx of transactions) {
          if (tx.batchNumber) {
            const batch = await ProductBatch.findOne({
              productId: item.productId,
              batchNumber: tx.batchNumber
            });
            if (batch) {
              batch.remainingQuantity += Math.abs(tx.quantity);
              await batch.save();
            }
          }
        }

        // Update Product.totalStock
        const product = await Product.findById(item.productId);
        if (product) {
          product.totalStock += item.quantity;
          await product.save();
        }

        // Create inventory transaction for restoration
        const transaction = new InventoryTransaction({
          productId: item.productId,
          type: "return",
          quantity: item.quantity,
          reason: `Order ${order.code} deleted - stock restoration to original batches`,
          orderId: order._id,
          performedBy: req.user?.id || null
        });
        await transaction.save();
      }
    }

    // Delete associated shipment if exists
    if (order.shipment) {
      await Shipment.findByIdAndDelete(order.shipment);
    }

    // Delete inventory transactions related to this order
    await InventoryTransaction.deleteMany({ orderId: order._id });

    // Delete associated payment
    await Payment.deleteMany({ orderId: order._id });

    // Delete the order
    await Order.findByIdAndDelete(orderId);

    console.log(`[OrderController] Order deleted successfully: ${order.code}`);
    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

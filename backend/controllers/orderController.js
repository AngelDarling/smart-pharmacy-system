import Order from "../models/Order.js";
import Shipment from "../models/Shipment.js";
import Product from "../models/Product.js";
import InventoryTransaction from "../models/InventoryTransaction.js";
import ProductSalesDaily from "../models/ProductSalesDaily.js";
import Coupon from "../models/Coupon.js";
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

    // Validate products exist and have sufficient stock
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(400).json({ message: `Product ${item.productId} not found` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for product ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}` 
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

    // Update product stock, create inventory transactions and record daily sales
    for (const item of items) {
      const product = await Product.findById(item.productId);
      
      // Update stock
      product.stock -= item.quantity;
      await product.save();

      // Create inventory transaction
      const transaction = new InventoryTransaction({
        productId: item.productId,
        type: "sale",
        quantity: -item.quantity, // Negative for sales
        reason: "Order sale",
        orderId: order._id,
        userId: userId || null
      });

      await transaction.save();

      // Upsert daily sales counter for current day (based on order creation date)
      const day = new Date();
      day.setHours(0, 0, 0, 0);
      await ProductSalesDaily.updateOne(
        { productId: item.productId, date: day },
        { $inc: { quantity: item.quantity, revenue: item.quantity * (item.priceSnapshot || item.price || product.price || 0) } },
        { upsert: true }
      );
    }

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

    // Restore product stock
    for (const item of order.items) {
      const product = await Product.findById(item.productId);
      if (product) {
        product.stock += item.quantity;
        await product.save();

        // Create inventory transaction for stock restoration
        const transaction = new InventoryTransaction({
          productId: item.productId,
          type: "adjustment",
          quantity: item.quantity,
          reason: "Order cancellation - stock restoration",
          orderId: order._id,
          userId: userId || null
        });

        await transaction.save();
      }
    }

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
      .select("code status createdAt totals shippingAddress items.nameSnapshot items.quantity items.priceSnapshot")
      .lean();
    if (!order) return res.status(404).json({ message: "Order not found" });

    res.json(order);
  } catch (error) {
    console.error("Error fetching order by code:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

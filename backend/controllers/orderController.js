import Order from "../models/Order.js";
import Product from "../models/Product.js";
import InventoryTransaction from "../models/InventoryTransaction.js";
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
    const { items, shippingAddress, paymentMethod, totals } = req.body;
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
      }
    });

    await order.save();

    // Update product stock and create inventory transactions
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
      .populate("items.productId", "name image");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if user can access this order
    if (userId && order.userId && order.userId.toString() !== userId) {
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

    order.status = status;
    await order.save();

    res.json(order);
  } catch (error) {
    console.error("Error updating order status:", error);
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

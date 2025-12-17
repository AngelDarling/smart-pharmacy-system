import { z } from "zod";
import mongoose from "mongoose";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import xlsx from "xlsx";

// Calculate sales from Orders collection
export async function listDaily(req, res, next) {
  try {
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || "20", 10)));
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const skip = (page - 1) * limit;

    const now = new Date();
    const parseDate = (v, fallback) => {
      if (!v) return fallback;
      const d = new Date(v);
      return isNaN(d.getTime()) ? fallback : d;
    };
    const start = parseDate(req.query.from, new Date(now.getFullYear(), now.getMonth(), 1));
    const end = parseDate(req.query.to, new Date(now.getFullYear(), now.getMonth() + 1, 1));

    // Aggregate from Orders
    const pipeline = [
      {
        $match: {
          status: { $in: ['processing', 'shipping', 'completed'] },
          createdAt: { $gte: start, $lt: end }
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            productId: '$items.productId'
          },
          quantity: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.quantity', '$items.priceSnapshot'] } }
        }
      },
      { $sort: { '_id.date': -1 } },
      { $skip: skip },
      { $limit: limit }
    ];

    const results = await Order.aggregate(pipeline);
    
    // Fetch product details
    const productIds = [...new Set(results.map(r => r._id.productId))];
    const products = await Product.find({ _id: { $in: productIds } }).select('name slug price imageUrls').lean();
    const productMap = new Map(products.map(p => [String(p._id), p]));

    const items = results.map(r => ({
      _id: `${r._id.date}_${r._id.productId}`,
      date: new Date(r._id.date),
      productId: productMap.get(String(r._id.productId)),
      quantity: r.quantity,
      revenue: r.revenue
    }));

    // Count total
    const countPipeline = [
      {
        $match: {
          status: { $in: ['processing', 'shipping', 'completed'] },
          createdAt: { $gte: start, $lt: end }
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            productId: '$items.productId'
          }
        }
      },
      { $count: 'total' }
    ];
    
    const countResult = await Order.aggregate(countPipeline);
    const total = countResult[0]?.total || 0;

    res.json({ items, page, limit, total });
  } catch (err) {
    next(err);
  }
}

export async function report(req, res, next) {
  try {
    const limit = Math.min(1000, Math.max(1, parseInt(req.query.limit || "200", 10)));
    const now = new Date();
    const parseDate = (v, fallback) => {
      if (!v) return fallback;
      const d = new Date(v);
      return isNaN(d.getTime()) ? fallback : d;
    };
    const start = parseDate(req.query.from, new Date(now.getFullYear(), now.getMonth(), 1));
    const end = parseDate(req.query.to, new Date(now.getFullYear(), now.getMonth() + 1, 1));
    const groupBy = ["day", "week", "month"].includes(req.query.groupBy) ? req.query.groupBy : "day";

    let groupStage;
    let projectStage;
    let sortStage;
    
    if (groupBy === "day") {
      groupStage = {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          quantity: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.quantity', '$items.priceSnapshot'] } }
        }
      };
      projectStage = {
        $project: {
          _id: 0,
          label: { $dateToString: { format: "%d/%m/%Y", date: { $toDate: "$_id" } } },
          sortKey: { $toDate: "$_id" },
          quantity: 1,
          revenue: 1
        }
      };
      sortStage = { $sort: { sortKey: 1 } };
    } else if (groupBy === "week") {
      groupStage = {
        $group: {
          _id: { 
            y: { $isoWeekYear: "$createdAt" }, 
            w: { $isoWeek: "$createdAt" } 
          },
          quantity: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.quantity', '$items.priceSnapshot'] } }
        }
      };
      projectStage = {
        $project: {
          _id: 0,
          label: { $concat: ["Tuần ", { $toString: "$_id.w" }, "/", { $toString: "$_id.y" }] },
          sortKey: ["$_id.y", "$_id.w"],
          quantity: 1,
          revenue: 1
        }
      };
      sortStage = { $sort: { "sortKey.0": 1, "sortKey.1": 1 } };
    } else { // month
      groupStage = {
        $group: {
          _id: { 
            y: { $year: "$createdAt" }, 
            m: { $month: "$createdAt" } 
          },
          quantity: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.quantity', '$items.priceSnapshot'] } }
        }
      };
      projectStage = {
        $project: {
          _id: 0,
          label: { $concat: [{ $toString: "$_id.m" }, "/", { $toString: "$_id.y" }] },
          sortKey: ["$_id.y", "$_id.m"],
          quantity: 1,
          revenue: 1
        }
      };
      sortStage = { $sort: { "sortKey.0": 1, "sortKey.1": 1 } };
    }

    const pipeline = [
      {
        $match: {
          status: { $in: ['processing', 'shipping', 'completed'] },
          createdAt: { $gte: start, $lt: end }
        }
      },
      { $unwind: '$items' },
      groupStage,
      projectStage,
      sortStage,
      { $limit: limit }
    ];

    const items = await Order.aggregate(pipeline);

    res.json({ items, groupBy, from: start, to: end });
  } catch (err) {
    next(err);
  }
}

export async function topProducts(req, res, next) {
  try {
    const now = new Date();
    const parseDate = (v, fallback) => {
      if (!v) return fallback;
      const d = new Date(v);
      return isNaN(d.getTime()) ? fallback : d;
    };
    const start = parseDate(req.query.from, new Date(now.getFullYear(), now.getMonth(), 1));
    const end = parseDate(req.query.to, new Date(now.getFullYear(), now.getMonth() + 1, 1));
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit || "10", 10)));

    const agg = await Order.aggregate([
      {
        $match: {
          status: { $in: ['processing', 'shipping', 'completed'] },
          createdAt: { $gte: start, $lt: end }
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: "$items.productId",
          quantity: { $sum: "$items.quantity" },
          revenue: { $sum: { $multiply: ['$items.quantity', '$items.priceSnapshot'] } }
        }
      },
      { $sort: { quantity: -1, revenue: -1 } },
      { $limit: limit }
    ]);

    const productIds = agg.map(a => a._id);
    const products = await Product.find({ _id: { $in: productIds } }).select("name slug price imageUrls");
    const orderMap = new Map(productIds.map((id, i) => [String(id), i]));
    const items = products.map(p => ({
      _id: p._id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      image: (p.imageUrls && p.imageUrls[0]) || "/uploads/default.png",
      quantity: agg.find(a => String(a._id) === String(p._id))?.quantity || 0,
      revenue: agg.find(a => String(a._id) === String(p._id))?.revenue || 0
    })).sort((a, b) => (orderMap.get(String(a._id)) ?? 0) - (orderMap.get(String(b._id)) ?? 0));

    res.json({ items });
  } catch (err) {
    next(err);
  }
}

export async function exportExcel(req, res, next) {
  try {
    const now = new Date();
    const parseDate = (v, fallback) => {
      if (!v) return fallback;
      const d = new Date(v);
      return isNaN(d.getTime()) ? fallback : d;
    };
    const start = parseDate(req.query.from, new Date(now.getFullYear(), now.getMonth(), 1));
    const end = parseDate(req.query.to, new Date(now.getFullYear(), now.getMonth() + 1, 1));
    const groupBy = ["day", "week", "month"].includes(req.query.groupBy) ? req.query.groupBy : "day";

    // Detailed
    const detailedPipeline = [
      {
        $match: {
          status: { $in: ['processing', 'shipping', 'completed'] },
          createdAt: { $gte: start, $lt: end }
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            productId: '$items.productId'
          },
          quantity: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.quantity', '$items.priceSnapshot'] } }
        }
      },
      { $sort: { '_id.date': 1 } }
    ];

    const detailed = await Order.aggregate(detailedPipeline);
    
    // Fetch product names
    const productIds = [...new Set(detailed.map(d => d._id.productId))];
    const products = await Product.find({ _id: { $in: productIds } }).select('name');
    const productMap = new Map(products.map(p => [String(p._id), p.name]));

    // Summary - reuse report logic
    let groupStage;
    if (groupBy === "day") {
      groupStage = { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, quantity: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.quantity', '$items.priceSnapshot'] } } } };
    } else if (groupBy === "week") {
      groupStage = { $group: { _id: { y: { $isoWeekYear: "$createdAt" }, w: { $isoWeek: "$createdAt" } }, quantity: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.quantity', '$items.priceSnapshot'] } } } };
    } else {
      groupStage = { $group: { _id: { y: { $year: "$createdAt" }, m: { $month: "$createdAt" } }, quantity: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.quantity', '$items.priceSnapshot'] } } } };
    }

    const summary = await Order.aggregate([
      {
        $match: {
          status: { $in: ['processing', 'shipping', 'completed'] },
          createdAt: { $gte: start, $lt: end }
        }
      },
      { $unwind: '$items' },
      groupStage
    ]);

    const wb = xlsx.utils.book_new();
    const detailRows = detailed.map(d => ({ 
      Date: d._id.date, 
      Product: productMap.get(String(d._id.productId)) || '', 
      Quantity: d.quantity, 
      Revenue: d.revenue 
    }));
    const wsDetail = xlsx.utils.json_to_sheet(detailRows);
    xlsx.utils.book_append_sheet(wb, wsDetail, 'Detailed');

    const sumRows = summary.map(s => ({ 
      Group: typeof s._id === 'string' ? s._id : JSON.stringify(s._id), 
      Quantity: s.quantity, 
      Revenue: s.revenue 
    }));
    const wsSum = xlsx.utils.json_to_sheet(sumRows);
    xlsx.utils.book_append_sheet(wb, wsSum, 'Summary');

    const buf = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="sales_report.xlsx"');
    res.send(buf);
  } catch (err) {
    next(err);
  }
}

// Keep these for backward compatibility but they won't be used
export async function upsertDaily(req, res, next) {
  res.status(501).json({ message: 'This endpoint is deprecated. Sales are calculated from orders.' });
}

export async function removeDaily(req, res, next) {
  res.status(501).json({ message: 'This endpoint is deprecated. Sales are calculated from orders.' });
}

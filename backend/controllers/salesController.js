import { z } from "zod";
import mongoose from "mongoose";
import ProductSalesDaily from "../models/ProductSalesDaily.js";
import Product from "../models/Product.js";
import xlsx from "xlsx";

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

    const match = { date: { $gte: start, $lt: end } };
    if (req.query.productId && mongoose.Types.ObjectId.isValid(req.query.productId)) {
      match.productId = new mongoose.Types.ObjectId(req.query.productId);
    }

    const [items, total] = await Promise.all([
      ProductSalesDaily.find(match)
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit)
        .populate('productId', 'name slug price imageUrls').lean(),
      ProductSalesDaily.countDocuments(match)
    ]);

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

    const match = { date: { $gte: start, $lt: end } };
    if (req.query.productId && mongoose.Types.ObjectId.isValid(req.query.productId)) {
      match.productId = new mongoose.Types.ObjectId(req.query.productId);
    }

    const tz = "+07:00"; // Vietnam timezone
    const localDate = { $dateAdd: { startDate: "$date", unit: "hour", amount: 7 } };
    let groupStage; let projectStage; let sortStage;
    if (groupBy === "day") {
      groupStage = {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: localDate, timezone: tz } },
          quantity: { $sum: "$quantity" },
          revenue: { $sum: "$revenue" }
        }
      };
      projectStage = {
        $project: {
          _id: 0,
          label: { $dateToString: { format: "%d/%m/%Y", date: { $toDate: "$_id" }, timezone: tz } },
          sortKey: { $toDate: "$_id" },
          start: { $toDate: "$_id" },
          end: { $toDate: "$_id" },
          quantity: 1,
          revenue: 1
        }
      };
      sortStage = { $sort: { sortKey: 1 } };
    } else if (groupBy === "week") {
      groupStage = {
        $group: {
          _id: { y: { $isoWeekYear: localDate }, w: { $isoWeek: localDate } },
          quantity: { $sum: "$quantity" },
          revenue: { $sum: "$revenue" }
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
          _id: { y: { $year: localDate }, m: { $month: localDate } },
          quantity: { $sum: "$quantity" },
          revenue: { $sum: "$revenue" }
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

    const pipeline = [ { $match: match }, groupStage, projectStage, sortStage, { $limit: limit } ];
    const items = await ProductSalesDaily.aggregate(pipeline);

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

    const match = { date: { $gte: start, $lt: end } };

    const agg = await ProductSalesDaily.aggregate([
      { $match: match },
      { $group: { _id: "$productId", quantity: { $sum: "$quantity" }, revenue: { $sum: "$revenue" } } },
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
    const detailed = await ProductSalesDaily.find({ date: { $gte: start, $lt: end } })
      .sort({ date: 1 })
      .populate('productId', 'name');

    // Summary using existing report
    req.query.from = start.toISOString();
    req.query.to = end.toISOString();
    req.query.groupBy = groupBy;
    const tz = "+07:00";
    const localDate = { $dateAdd: { startDate: "$date", unit: "hour", amount: 7 } };
    let groupStage;
    if (groupBy === "day") groupStage = { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: localDate, timezone: tz } }, quantity: { $sum: "$quantity" }, revenue: { $sum: "$revenue" } } };
    else if (groupBy === "week") groupStage = { $group: { _id: { y: { $isoWeekYear: localDate }, w: { $isoWeek: localDate } }, quantity: { $sum: "$quantity" }, revenue: { $sum: "$revenue" } } };
    else groupStage = { $group: { _id: { y: { $year: localDate }, m: { $month: localDate } }, quantity: { $sum: "$quantity" }, revenue: { $sum: "$revenue" } } };

    const summary = await ProductSalesDaily.aggregate([
      { $match: { date: { $gte: start, $lt: end } } },
      groupStage
    ]);

    const wb = xlsx.utils.book_new();
    const detailRows = detailed.map(d => ({ Date: d.date, Product: d.productId?.name || '', Quantity: d.quantity, Revenue: d.revenue }));
    const wsDetail = xlsx.utils.json_to_sheet(detailRows);
    xlsx.utils.book_append_sheet(wb, wsDetail, 'Detailed');

    const sumRows = summary.map(s => ({ Group: typeof s._id === 'string' ? s._id : JSON.stringify(s._id), Quantity: s.quantity, Revenue: s.revenue }));
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

export async function upsertDaily(req, res, next) {
  try {
    const schema = z.object({
      productId: z.string(),
      date: z.string().or(z.date()).optional(),
      quantity: z.number().int().positive(),
      price: z.number().nonnegative().optional()
    });
    const parsed = schema.parse(req.body);
    const day = parsed.date ? new Date(parsed.date) : new Date();
    day.setHours(0, 0, 0, 0);

    // Ensure product exists
    const exists = await Product.exists({ _id: parsed.productId });
    if (!exists) return res.status(400).json({ message: 'Sản phẩm không tồn tại' });

    const price = parsed.price ?? (await Product.findById(parsed.productId).select('price')).price ?? 0;

    const result = await ProductSalesDaily.updateOne(
      { productId: parsed.productId, date: day },
      { $inc: { quantity: parsed.quantity, revenue: parsed.quantity * price } },
      { upsert: true }
    );
    res.json({ success: true, result });
  } catch (err) {
    next(err);
  }
}

export async function removeDaily(req, res, next) {
  try {
    const doc = await ProductSalesDaily.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Không tìm thấy' });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}



import { z } from "zod";
import GoodsReceipt from "../models/GoodsReceipt.js";
import InventoryTransaction from "../models/InventoryTransaction.js";
import Product from "../models/Product.js";

const createSchema = z.object({
  code: z.string().min(3),
  supplierId: z.string(),
  note: z.string().optional(),
  items: z.array(z.object({ productId: z.string(), quantity: z.number().positive(), unitCost: z.number().nonnegative() })).min(1)
});

export async function list(req, res) {
  const docs = await GoodsReceipt.find({}).sort({ createdAt: -1 });
  res.json(docs);
}

export async function create(req, res, next) {
  try {
    const parsed = createSchema.parse(req.body);
    const gr = await GoodsReceipt.create({ ...parsed, receivedBy: req.user?._id });

    // Write inventory transactions and update stock atomically (simple loop)
    for (const item of parsed.items) {
      await InventoryTransaction.create({
        productId: item.productId,
        type: "import",
        quantity: item.quantity,
        unitCost: item.unitCost,
        referenceType: "purchase",
        referenceId: gr._id.toString(),
        note: `GR ${parsed.code}`,
        createdBy: req.user?._id
      });
      await Product.updateOne({ _id: item.productId }, { $inc: { stockOnHand: item.quantity } });
    }

    res.status(201).json(gr);
  } catch (err) {
    next(err);
  }
}



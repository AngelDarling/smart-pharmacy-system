import { z } from "zod";
import InventoryTransaction from "../models/InventoryTransaction.js";
import Product from "../models/Product.js";

const txSchema = z.object({
  productId: z.string(),
  type: z.enum(["import", "export", "adjust"]),
  quantity: z.number(),
  unitCost: z.number().optional(),
  referenceType: z.enum(["purchase", "order", "manual", "return"]).optional(),
  referenceId: z.string().optional(),
  supplierId: z.string().optional(),
  note: z.string().optional()
});

export async function createTx(req, res, next) {
  try {
    const parsed = txSchema.parse(req.body);
    if (parsed.type === "export" && parsed.quantity > 0) parsed.quantity = -parsed.quantity;
    const product = await Product.findById(parsed.productId);
    if (!product) return res.status(404).json({ message: "Sản phẩm không tồn tại" });

    const tx = await InventoryTransaction.create({
      ...parsed,
      createdBy: req.user?._id || null
    });

    // Update stockOnHand denormalized
    const delta = tx.quantity;
    product.stockOnHand = (product.stockOnHand || 0) + delta;
    await product.save();

    res.status(201).json({ tx, stockOnHand: product.stockOnHand });
  } catch (err) {
    next(err);
  }
}

export async function listByProduct(req, res) {
  const items = await InventoryTransaction.find({ productId: req.params.productId }).sort({ createdAt: -1 });
  res.json(items);
}


